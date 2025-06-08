const db = require('../utils/db');

/**
 * MicronutrientGoals Model
 * Handles database operations for micronutrient goals/targets
 */
class MicronutrientGoals {
    /**
     * Initialize the micronutrient_goals table if it doesn't exist
     */
    static async initializeTable() {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS micronutrient_goals (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,

                -- General nutrients
                energy NUMERIC(10, 2), -- kcal
                water NUMERIC(10, 2), -- g
                alcohol NUMERIC(10, 2), -- g
                caffeine NUMERIC(10, 2), -- mg

                -- Carbohydrates
                carbs NUMERIC(10, 2), -- g
                fiber NUMERIC(10, 2), -- g
                starch NUMERIC(10, 2), -- g
                sugars NUMERIC(10, 2), -- g
                added_sugars NUMERIC(10, 2), -- g
                net_carbs NUMERIC(10, 2), -- g

                -- Protein and amino acids
                protein NUMERIC(10, 2), -- g
                histidine NUMERIC(10, 2), -- g
                isoleucine NUMERIC(10, 2), -- g
                leucine NUMERIC(10, 2), -- g
                lysine NUMERIC(10, 2), -- g
                methionine NUMERIC(10, 2), -- g
                phenylalanine NUMERIC(10, 2), -- g
                threonine NUMERIC(10, 2), -- g
                tryptophan NUMERIC(10, 2), -- g
                valine NUMERIC(10, 2), -- g
                cystine NUMERIC(10, 2), -- g

                -- Lipids
                fat NUMERIC(10, 2), -- g
                saturated NUMERIC(10, 2), -- g
                monounsaturated NUMERIC(10, 2), -- g
                polyunsaturated NUMERIC(10, 2), -- g
                omega3 NUMERIC(10, 2), -- g
                omega6 NUMERIC(10, 2), -- g
                trans_fat NUMERIC(10, 2), -- g
                cholesterol NUMERIC(10, 2), -- mg

                -- Vitamins (in various units as per RDA standards)
                vitamin_a NUMERIC(10, 2), -- mcg RAE
                thiamine NUMERIC(10, 2), -- mg (B1)
                riboflavin NUMERIC(10, 2), -- mg (B2)
                niacin NUMERIC(10, 2), -- mg (B3)
                pantothenic_acid NUMERIC(10, 2), -- mg (B5)
                vitamin_b6 NUMERIC(10, 2), -- mg
                vitamin_b12 NUMERIC(10, 2), -- mcg
                folate NUMERIC(10, 2), -- mcg DFE
                vitamin_c NUMERIC(10, 2), -- mg
                vitamin_d NUMERIC(10, 2), -- IU
                vitamin_e NUMERIC(10, 2), -- mg
                vitamin_k NUMERIC(10, 2), -- mcg

                -- Minerals (in mg unless specified)
                calcium NUMERIC(10, 2), -- mg
                copper NUMERIC(10, 2), -- mg
                iron NUMERIC(10, 2), -- mg
                magnesium NUMERIC(10, 2), -- mg
                manganese NUMERIC(10, 2), -- mg
                phosphorus NUMERIC(10, 2), -- mg
                potassium NUMERIC(10, 2), -- mg
                selenium NUMERIC(10, 2), -- mcg
                sodium NUMERIC(10, 2), -- mg
                zinc NUMERIC(10, 2), -- mg

                -- Timestamps
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

                -- Ensure one record per user
                UNIQUE(user_id)
            )
        `;

        try {
            await db.query(createTableQuery);
            console.log('Micronutrient goals table initialized successfully');
        } catch (error) {
            console.error('Error initializing micronutrient goals table:', error);
            throw error;
        }
    }

    /**
     * Get micronutrient goals for a user
     * @param {number} userId - User ID
     * @returns {Object|null} - Micronutrient goals object or null if not found
     */
    static async getMicronutrientGoals(userId) {
        try {
            await this.initializeTable();
            
            const result = await db.query(
                'SELECT * FROM micronutrient_goals WHERE user_id = $1',
                [userId]
            );

            return result.rows.length > 0 ? result.rows[0] : null;
        } catch (error) {
            console.error(`Error fetching micronutrient goals for user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Save micronutrient goals for a user
     * @param {number} userId - User ID
     * @param {Object} goals - Micronutrient goals object
     * @returns {Object} - Saved micronutrient goals object
     */
    static async saveMicronutrientGoals(userId, goals) {
        try {
            await this.initializeTable();
            
            // Check if a record already exists for this user
            const existingGoals = await this.getMicronutrientGoals(userId);

            // Prepare the fields and values for the query
            const fields = Object.keys(goals).filter(key => key !== 'user_id');
            const values = fields.map(field => goals[field]);

            let query;
            let params;

            if (existingGoals) {
                // Update existing record
                const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
                query = `
                    UPDATE micronutrient_goals
                    SET ${setClause}, updated_at = CURRENT_TIMESTAMP
                    WHERE user_id = $1
                    RETURNING *
                `;
                params = [userId, ...values];
            } else {
                // Insert new record
                const fieldsList = ['user_id', ...fields].join(', ');
                const placeholders = ['$1', ...fields.map((_, index) => `$${index + 2}`)].join(', ');
                query = `
                    INSERT INTO micronutrient_goals (${fieldsList})
                    VALUES (${placeholders})
                    RETURNING *
                `;
                params = [userId, ...values];
            }

            const result = await db.query(query, params);
            return result.rows[0];
        } catch (error) {
            console.error(`Error saving micronutrient goals for user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Get default micronutrient goals (RDA values for adults)
     * @returns {Object} - Default micronutrient goals
     */
    static getDefaultGoals() {
        return {
            // General
            energy: 2200, // kcal
            water: 3000, // g
            alcohol: 0, // g
            caffeine: 400, // mg (upper limit)

            // Carbohydrates
            carbs: 300, // g
            fiber: 38, // g
            starch: 130, // g
            sugars: 50, // g
            added_sugars: 25, // g (upper limit)
            net_carbs: 130, // g

            // Protein and amino acids
            protein: 200, // g
            histidine: 0.7, // g
            isoleucine: 1.4, // g
            leucine: 2.7, // g
            lysine: 2.1, // g
            methionine: 0.7, // g
            phenylalanine: 1.75, // g
            threonine: 1.05, // g
            tryptophan: 0.28, // g
            valine: 1.82, // g
            cystine: 0.7, // g

            // Lipids
            fat: 75, // g
            saturated: 20, // g (upper limit)
            monounsaturated: 25, // g
            polyunsaturated: 20, // g
            omega3: 1.6, // g
            omega6: 14, // g
            trans_fat: 0, // g (avoid)
            cholesterol: 300, // mg (upper limit)

            // Vitamins
            vitamin_a: 900, // mcg RAE
            thiamine: 1.2, // mg (B1)
            riboflavin: 1.3, // mg (B2)
            niacin: 16, // mg (B3)
            pantothenic_acid: 5, // mg (B5)
            vitamin_b6: 1.3, // mg
            vitamin_b12: 2.4, // mcg
            folate: 400, // mcg DFE
            vitamin_c: 90, // mg
            vitamin_d: 600, // IU
            vitamin_e: 15, // mg
            vitamin_k: 120, // mcg

            // Minerals
            calcium: 1000, // mg
            copper: 0.9, // mg
            iron: 8, // mg
            magnesium: 400, // mg
            manganese: 2.3, // mg
            phosphorus: 700, // mg
            potassium: 4700, // mg
            selenium: 55, // mcg
            sodium: 2300, // mg (upper limit)
            zinc: 11 // mg
        };
    }
}

module.exports = MicronutrientGoals;
