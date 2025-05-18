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
                protein_target INTEGER,
                fat_target INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id)
            )
        `;

        try {
            await db.query(createTableQuery);
            console.log('Calorie targets table initialized successfully');

            // Check if protein_target column exists, add it if it doesn't
            const checkProteinColumnQuery = `
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'calorie_targets' AND column_name = 'protein_target'
            `;

            const proteinResult = await db.query(checkProteinColumnQuery);

            if (proteinResult.rows.length === 0) {
                console.log('Adding protein_target column to calorie_targets table');
                const addProteinColumnQuery = `
                    ALTER TABLE calorie_targets
                    ADD COLUMN protein_target INTEGER
                `;
                await db.query(addProteinColumnQuery);
                console.log('Added protein_target column to calorie_targets table');
            } else {
                console.log('protein_target column already exists in calorie_targets table');
            }

            // Check if fat_target column exists, add it if it doesn't
            const checkFatColumnQuery = `
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'calorie_targets' AND column_name = 'fat_target'
            `;

            const fatResult = await db.query(checkFatColumnQuery);

            if (fatResult.rows.length === 0) {
                console.log('Adding fat_target column to calorie_targets table');
                const addFatColumnQuery = `
                    ALTER TABLE calorie_targets
                    ADD COLUMN fat_target INTEGER
                `;
                await db.query(addFatColumnQuery);
                console.log('Added fat_target column to calorie_targets table');
            } else {
                console.log('fat_target column already exists in calorie_targets table');
            }

            // Force update of existing rows to ensure protein_target and fat_target are properly initialized
            const updateExistingRowsQuery = `
                UPDATE calorie_targets
                SET protein_target = COALESCE(protein_target, NULL),
                    fat_target = COALESCE(fat_target, NULL)
            `;
            await db.query(updateExistingRowsQuery);
            console.log('Updated existing rows to ensure protein_target and fat_target are properly initialized');
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
     * @param {number} proteinTarget - Daily protein target in grams
     * @param {number} fatTarget - Daily fat target in grams
     * @returns {Object} - Saved calorie target object
     */
    static async saveCalorieTarget(userId, dailyTarget, proteinTarget, fatTarget = null) {
        try {
            // Check if a record already exists for this user
            const existingTarget = await this.getCalorieTarget(userId);

            let query;
            let params;

            if (existingTarget) {
                // Update existing record
                query = `
                    UPDATE calorie_targets
                    SET daily_target = $1, protein_target = $2, fat_target = $3, updated_at = CURRENT_TIMESTAMP
                    WHERE user_id = $4
                    RETURNING *
                `;
                params = [dailyTarget, proteinTarget, fatTarget, userId];
            } else {
                // Insert new record
                query = `
                    INSERT INTO calorie_targets (user_id, daily_target, protein_target, fat_target)
                    VALUES ($1, $2, $3, $4)
                    RETURNING *
                `;
                params = [userId, dailyTarget, proteinTarget, fatTarget];
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
