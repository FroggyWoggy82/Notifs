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
            'SELECT target_weight, weekly_gain_goal FROM weight_goals WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
            [userId]
        );

        if (result.rows.length > 0) {
            return {
                target_weight: parseFloat(result.rows[0].target_weight),
                weekly_gain_goal: parseFloat(result.rows[0].weekly_gain_goal),
                user_id: userId
            };
        } else {
            return { target_weight: null, weekly_gain_goal: null, user_id: userId };
        }
    }

    /**
     * Save a weight goal for a user
     * @param {number} targetWeight - The target weight
     * @param {number} weeklyGain - The weekly gain/loss goal
     * @param {number} userId - The user ID
     * @returns {Promise<Object>} The saved weight goal
     */
    static async saveGoal(targetWeight, weeklyGain, userId) {
        await db.query('BEGIN');
        try {
            // Delete existing goals for this user
            await db.query('DELETE FROM weight_goals WHERE user_id = $1', [userId]);

            // Insert new goal
            const result = await db.query(
                'INSERT INTO weight_goals (target_weight, weekly_gain_goal, user_id) VALUES ($1, $2, $3) RETURNING target_weight, weekly_gain_goal, user_id',
                [targetWeight, weeklyGain, userId]
            );

            await db.query('COMMIT');

            return {
                target_weight: parseFloat(result.rows[0].target_weight),
                weekly_gain_goal: parseFloat(result.rows[0].weekly_gain_goal),
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

module.exports = {
    WeightGoal,
    WeightLog
};
