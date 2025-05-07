const db = require('../utils/db');

class CustomGoalWeight {
    static async getAll(userId) {
        const result = await db.query(
            'SELECT * FROM custom_goal_weights WHERE user_id = $1 ORDER BY week_number',
            [userId]
        );
        return result.rows;
    }

    static async get(userId, weekNumber) {
        const result = await db.query(
            'SELECT * FROM custom_goal_weights WHERE user_id = $1 AND week_number = $2',
            [userId, weekNumber]
        );
        return result.rows[0];
    }

    static async save(userId, weekNumber, targetDate, weight) {
        await db.query('BEGIN');
        try {
            // Check if entry already exists
            const existingResult = await db.query(
                'SELECT id FROM custom_goal_weights WHERE user_id = $1 AND week_number = $2',
                [userId, weekNumber]
            );

            let result;
            if (existingResult.rows.length > 0) {
                // Update existing entry
                result = await db.query(
                    'UPDATE custom_goal_weights SET weight = $1, target_date = $2, updated_at = CURRENT_TIMESTAMP WHERE user_id = $3 AND week_number = $4 RETURNING *',
                    [weight, targetDate, userId, weekNumber]
                );
            } else {
                // Insert new entry
                result = await db.query(
                    'INSERT INTO custom_goal_weights (user_id, week_number, target_date, weight) VALUES ($1, $2, $3, $4) RETURNING *',
                    [userId, weekNumber, targetDate, weight]
                );
            }

            await db.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    }

    static async saveMultiple(userId, customWeights) {
        await db.query('BEGIN');
        try {
            const results = [];

            for (const item of customWeights) {
                const { weekNumber, targetDate, weight } = item;

                // Check if entry already exists
                const existingResult = await db.query(
                    'SELECT id FROM custom_goal_weights WHERE user_id = $1 AND week_number = $2',
                    [userId, weekNumber]
                );

                let result;
                if (existingResult.rows.length > 0) {
                    // Update existing entry
                    result = await db.query(
                        'UPDATE custom_goal_weights SET weight = $1, target_date = $2, updated_at = CURRENT_TIMESTAMP WHERE user_id = $3 AND week_number = $4 RETURNING *',
                        [weight, targetDate, userId, weekNumber]
                    );
                } else {
                    // Insert new entry
                    result = await db.query(
                        'INSERT INTO custom_goal_weights (user_id, week_number, target_date, weight) VALUES ($1, $2, $3, $4) RETURNING *',
                        [userId, weekNumber, targetDate, weight]
                    );
                }

                results.push(result.rows[0]);
            }

            await db.query('COMMIT');
            return results;
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    }

    static async delete(userId, weekNumber) {
        const result = await db.query(
            'DELETE FROM custom_goal_weights WHERE user_id = $1 AND week_number = $2 RETURNING *',
            [userId, weekNumber]
        );
        return result.rows[0];
    }

    static async deleteAll(userId) {
        const result = await db.query(
            'DELETE FROM custom_goal_weights WHERE user_id = $1 RETURNING *',
            [userId]
        );
        return result.rows;
    }
}

module.exports = CustomGoalWeight;
