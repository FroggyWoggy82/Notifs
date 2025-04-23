const db = require('../utils/db');

/**
 * CalorieTarget Model
 * Handles database operations for calorie targets
 */
class CalorieTarget {
    /**
     * Initialize the calorie_targets table if it doesn't exist
     */
    static async initializeTable() {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS calorie_targets (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                daily_target INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id)
            )
        `;

        try {
            await db.query(createTableQuery);
            console.log('Calorie targets table initialized successfully');
        } catch (error) {
            console.error('Error initializing calorie targets table:', error);
            throw error;
        }
    }

    /**
     * Get calorie target for a user
     * @param {number} userId - User ID
     * @returns {Object|null} - Calorie target object or null if not found
     */
    static async getCalorieTarget(userId) {
        try {
            const query = 'SELECT * FROM calorie_targets WHERE user_id = $1';
            const result = await db.query(query, [userId]);

            if (result.rows.length === 0) {
                return null;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error fetching calorie target for user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Save calorie target for a user
     * @param {number} userId - User ID
     * @param {number} dailyTarget - Daily calorie target
     * @returns {Object} - Saved calorie target object
     */
    static async saveCalorieTarget(userId, dailyTarget) {
        try {
            // Check if a record already exists for this user
            const existingTarget = await this.getCalorieTarget(userId);

            let query;
            let params;

            if (existingTarget) {
                // Update existing record
                query = `
                    UPDATE calorie_targets
                    SET daily_target = $1, updated_at = CURRENT_TIMESTAMP
                    WHERE user_id = $2
                    RETURNING *
                `;
                params = [dailyTarget, userId];
            } else {
                // Insert new record
                query = `
                    INSERT INTO calorie_targets (user_id, daily_target)
                    VALUES ($1, $2)
                    RETURNING *
                `;
                params = [userId, dailyTarget];
            }

            const result = await db.query(query, params);
            return result.rows[0];
        } catch (error) {
            console.error(`Error saving calorie target for user ${userId}:`, error);
            throw error;
        }
    }
}

module.exports = CalorieTarget;
