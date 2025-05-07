const db = require('../utils/db');

/**
 * Weight Goal Model
 * Handles database operations for weight goals
 */
class WeightGoal {
    /**
     * Get the latest weight goal for a user
     * @param {number} userId - The user ID
     * @returns {Promise<Object>} The weight goal object
     */
    static async getGoal(userId) {
        const result = await db.query(
            'SELECT target_weight, weekly_gain_goal, start_weight, start_date FROM weight_goals WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
            [userId]
        );

        if (result.rows.length > 0) {
            return {
                target_weight: parseFloat(result.rows[0].target_weight),
                weekly_gain_goal: parseFloat(result.rows[0].weekly_gain_goal),
                start_weight: result.rows[0].start_weight ? parseFloat(result.rows[0].start_weight) : null,
                start_date: result.rows[0].start_date ? result.rows[0].start_date.toISOString().split('T')[0] : null,
                user_id: userId
            };
        } else {
            return {
                target_weight: null,
                weekly_gain_goal: null,
                start_weight: null,
                start_date: null,
                user_id: userId
            };
        }
    }

    /**
     * Save a weight goal for a user
     * @param {number} targetWeight - The target weight
     * @param {number} weeklyGain - The weekly gain/loss goal
     * @param {number} userId - The user ID
     * @returns {Promise<Object>} The saved weight goal
     */
    static async saveGoal(targetWeight, weeklyGain, userId, startWeight = null, startDate = null) {
        await db.query('BEGIN');
        try {
            // If startWeight is not provided, get the most recent weight log
            let finalStartWeight = startWeight;
            let finalStartDate = startDate || new Date().toISOString().split('T')[0]; // Default to today

            if (finalStartWeight === null) {
                // Get the most recent weight log for this user
                const weightLogResult = await db.query(
                    'SELECT weight FROM weight_logs WHERE user_id = $1 ORDER BY log_date DESC LIMIT 1',
                    [userId]
                );

                if (weightLogResult.rows.length > 0) {
                    finalStartWeight = parseFloat(weightLogResult.rows[0].weight);
                }
            }

            // Delete existing goals for this user
            await db.query('DELETE FROM weight_goals WHERE user_id = $1', [userId]);

            // Insert new goal with start weight and date
            const result = await db.query(
                'INSERT INTO weight_goals (target_weight, weekly_gain_goal, user_id, start_weight, start_date) VALUES ($1, $2, $3, $4, $5) RETURNING target_weight, weekly_gain_goal, user_id, start_weight, start_date',
                [targetWeight, weeklyGain, userId, finalStartWeight, finalStartDate]
            );

            await db.query('COMMIT');

            return {
                target_weight: parseFloat(result.rows[0].target_weight),
                weekly_gain_goal: parseFloat(result.rows[0].weekly_gain_goal),
                start_weight: result.rows[0].start_weight ? parseFloat(result.rows[0].start_weight) : null,
                start_date: result.rows[0].start_date ? result.rows[0].start_date.toISOString().split('T')[0] : null,
                user_id: parseInt(result.rows[0].user_id)
            };
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    }
}

/**
 * Weight Log Model
 * Handles database operations for weight logs
 */
class WeightLog {
    /**
     * Get all weight logs for a user
     * @param {number} userId - The user ID
     * @returns {Promise<Array>} Array of weight log objects
     */
    static async getLogs(userId) {
        const result = await db.query(
            'SELECT log_id, log_date, weight FROM weight_logs WHERE user_id = $1 ORDER BY log_date ASC',
            [userId]
        );

        return result.rows.map(row => ({
            log_id: row.log_id,
            log_date: row.log_date.toISOString().split('T')[0], // YYYY-MM-DD format
            weight: parseFloat(row.weight),
            user_id: userId
        }));
    }

    /**
     * Add a new weight log
     * @param {number} weight - The weight value
     * @param {string} logDate - The log date (YYYY-MM-DD)
     * @param {number} userId - The user ID
     * @returns {Promise<Object>} The created weight log
     */
    static async addLog(weight, logDate, userId) {
        const result = await db.query(
            'INSERT INTO weight_logs (log_date, weight, user_id) VALUES ($1, $2, $3) RETURNING log_id, log_date, weight, user_id',
            [logDate, weight, userId]
        );

        return {
            log_id: result.rows[0].log_id,
            log_date: result.rows[0].log_date.toISOString().split('T')[0],
            weight: parseFloat(result.rows[0].weight),
            user_id: parseInt(result.rows[0].user_id)
        };
    }
}

/**
 * Calorie Target Model
 * Handles database operations for calorie targets
 */
class CalorieTarget {
    /**
     * Initialize the calorie_targets table
     * @returns {Promise<void>}
     */
    static async initializeTable() {
        try {
            // Check if the calorie_targets table exists
            const tableCheck = await db.query(
                "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'calorie_targets')"
            );

            if (!tableCheck.rows[0].exists) {
                console.log('Creating calorie_targets table...');
                // Create the table if it doesn't exist
                await db.query(`
                    CREATE TABLE calorie_targets (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER NOT NULL,
                        daily_target INTEGER NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                `);
                console.log('calorie_targets table created successfully');
            }
        } catch (error) {
            console.error('Error initializing calorie_targets table:', error);
            throw error;
        }
    }

    /**
     * Get the calorie target for a user
     * @param {number} userId - The user ID
     * @returns {Promise<Object|null>} The calorie target object or null if not found
     */
    static async getTarget(userId) {
        try {
            // Ensure the table exists
            await this.initializeTable();

            const result = await db.query(
                'SELECT user_id, daily_target FROM calorie_targets WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
                [userId]
            );

            if (result.rows.length > 0) {
                return {
                    user_id: parseInt(result.rows[0].user_id),
                    daily_target: parseInt(result.rows[0].daily_target)
                };
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error in getTarget:', error);
            throw error;
        }
    }

    /**
     * Save a calorie target for a user
     * @param {number} userId - The user ID
     * @param {number} dailyTarget - The daily calorie target
     * @returns {Promise<Object>} The saved calorie target
     */
    static async saveTarget(userId, dailyTarget) {
        try {
            // Ensure the table exists
            await this.initializeTable();

            await db.query('BEGIN');

            // Delete existing targets for this user
            await db.query('DELETE FROM calorie_targets WHERE user_id = $1', [userId]);

            // Insert new target
            const result = await db.query(
                'INSERT INTO calorie_targets (user_id, daily_target, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING user_id, daily_target',
                [userId, dailyTarget]
            );

            await db.query('COMMIT');

            return {
                user_id: parseInt(result.rows[0].user_id),
                daily_target: parseInt(result.rows[0].daily_target)
            };
        } catch (error) {
            try {
                await db.query('ROLLBACK');
            } catch (rollbackError) {
                console.error('Error during rollback:', rollbackError);
            }
            console.error('Error in saveTarget:', error);
            throw error;
        }
    }
}

module.exports = {
    WeightGoal,
    WeightLog,
    CalorieTarget
};
