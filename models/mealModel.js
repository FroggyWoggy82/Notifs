/**
 * Meal Model
 * Handles data operations for meals and meal ingredients
 */

const db = require('../utils/db');

/**
 * Get all meals with their ingredients
 * @param {number} userId - The user ID (optional)
 * @returns {Promise<Array>} - Promise resolving to an array of meals with ingredients
 */
async function getAllMeals(userId = 1) {
    try {
        // Check if the meals table exists
        const tableCheckResult = await db.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'meals'
            );
        `);

        const tableExists = tableCheckResult.rows[0].exists;

        if (!tableExists) {
            console.error('Meals table does not exist!');
            await createMealsTables();
            return [];
        }

        // Fetch all meals for the user
        const mealsResult = await db.query(
            'SELECT * FROM meals WHERE user_id = $1 ORDER BY date DESC, time DESC',
            [userId]
        );

        const meals = mealsResult.rows;

        // Fetch ingredients for each meal
        for (const meal of meals) {
            const ingredientsResult = await db.query(
                'SELECT * FROM meal_ingredients WHERE meal_id = $1',
                [meal.id]
            );
            meal.ingredients = ingredientsResult.rows;
        }

        return meals;
    } catch (error) {
        console.error('Error in getAllMeals:', error);
        return [];
    }
}

/**
 * Get a meal by ID with its ingredients
 * @param {number} id - The meal ID
 * @param {number} userId - The user ID (optional)
 * @returns {Promise<Object>} - Promise resolving to the meal with ingredients
 */
async function getMealById(id, userId = 1) {
    // Fetch meal details
    const mealResult = await db.query(
        'SELECT * FROM meals WHERE id = $1 AND user_id = $2',
        [id, userId]
    );

    if (mealResult.rowCount === 0) {
        throw new Error('Meal not found');
    }

    const meal = mealResult.rows[0];

    // Fetch ingredients for the meal
    const ingredientsResult = await db.query(
        'SELECT * FROM meal_ingredients WHERE meal_id = $1',
        [id]
    );

    meal.ingredients = ingredientsResult.rows;
    return meal;
}

/**
 * Create a new meal with ingredients
 * @param {Object} mealData - The meal data
 * @param {number} userId - The user ID (optional)
 * @returns {Promise<Object>} - Promise resolving to the created meal with ingredients
 */
async function createMeal(mealData, userId = 1) {
    const { name, date, time, photo_url, ingredients } = mealData;

    if (!name || !date || !time || !ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        throw new Error('Meal name, date, time, and at least one ingredient are required');
    }

    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        // Insert the meal
        const mealInsertResult = await client.query(
            'INSERT INTO meals (name, date, time, photo_url, user_id, bloating_rating) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [name.trim(), date, time, photo_url || null, userId, mealData.bloating_rating || null]
        );

        const newMealId = mealInsertResult.rows[0].id;

        // Insert ingredients
        for (const ingredient of ingredients) {
            // Check if this is a new ingredient that needs to be created
            let ingredientId = ingredient.id;

            if (ingredient.isNew) {
                // Create a new ingredient in the ingredients table
                const newIngredientResult = await client.query(
                    `INSERT INTO ingredients (name, calories, protein, fats, carbohydrates, amount, price)
                     VALUES ($1, $2, $3, $4, $5, 100, $6)
                     RETURNING id`,
                    [ingredient.name.trim(), ingredient.calories, ingredient.protein, ingredient.fat, ingredient.carbs, ingredient.price || 0]
                );

                ingredientId = newIngredientResult.rows[0].id;
            }

            // Insert the meal ingredient
            await client.query(
                `INSERT INTO meal_ingredients (meal_id, ingredient_id, name, amount, calories, protein, fat, carbs)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [newMealId, ingredientId, ingredient.name.trim(), ingredient.amount,
                 ingredient.calories, ingredient.protein, ingredient.fat, ingredient.carbs]
            );
        }

        await client.query('COMMIT');

        // Fetch the newly created meal with ingredients
        return await getMealById(newMealId, userId);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Update a meal
 * @param {number} id - The meal ID
 * @param {Object} mealData - The updated meal data
 * @param {number} userId - The user ID (optional)
 * @returns {Promise<Object>} - Promise resolving to the updated meal with ingredients
 */
async function updateMeal(id, mealData, userId = 1) {
    const { name, date, time, photo_url, ingredients } = mealData;

    if (!name || !date || !time || !ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        throw new Error('Meal name, date, time, and at least one ingredient are required');
    }

    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        // Check if meal exists and belongs to the user
        const mealResult = await client.query(
            'SELECT * FROM meals WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (mealResult.rowCount === 0) {
            throw new Error('Meal not found or does not belong to this user');
        }

        // Update the meal
        await client.query(
            'UPDATE meals SET name = $1, date = $2, time = $3, photo_url = $4 WHERE id = $5',
            [name.trim(), date, time, photo_url || null, id]
        );

        // Delete existing ingredients
        await client.query('DELETE FROM meal_ingredients WHERE meal_id = $1', [id]);

        // Insert new ingredients
        for (const ingredient of ingredients) {
            // Check if this is a new ingredient that needs to be created
            let ingredientId = ingredient.id;

            if (ingredient.isNew) {
                // Create a new ingredient in the ingredients table
                const newIngredientResult = await client.query(
                    `INSERT INTO ingredients (name, calories, protein, fats, carbohydrates, amount, price)
                     VALUES ($1, $2, $3, $4, $5, 100, $6)
                     RETURNING id`,
                    [ingredient.name.trim(), ingredient.calories, ingredient.protein, ingredient.fat, ingredient.carbs, ingredient.price || 0]
                );

                ingredientId = newIngredientResult.rows[0].id;
            }

            // Insert the meal ingredient
            await client.query(
                `INSERT INTO meal_ingredients (meal_id, ingredient_id, name, amount, calories, protein, fat, carbs)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [id, ingredientId, ingredient.name.trim(), ingredient.amount,
                 ingredient.calories, ingredient.protein, ingredient.fat, ingredient.carbs]
            );
        }

        await client.query('COMMIT');

        // Fetch the updated meal with ingredients
        return await getMealById(id, userId);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Delete a meal
 * @param {number} id - The meal ID
 * @param {number} userId - The user ID (optional)
 * @returns {Promise<Object>} - Promise resolving to the deleted meal ID and name
 */
async function deleteMeal(id, userId = 1) {
    // Check if meal exists and belongs to the user
    const mealResult = await db.query(
        'SELECT * FROM meals WHERE id = $1 AND user_id = $2',
        [id, userId]
    );

    if (mealResult.rowCount === 0) {
        throw new Error('Meal not found or does not belong to this user');
    }

    const meal = mealResult.rows[0];

    // Delete the meal (meal_ingredients will be deleted by ON DELETE CASCADE)
    await db.query('DELETE FROM meals WHERE id = $1', [id]);

    return {
        id: parseInt(id),
        name: meal.name
    };
}

/**
 * Get meals by date range
 * @param {number} userId - The user ID
 * @param {Date} startDate - The start date
 * @param {Date} endDate - The end date
 * @returns {Promise<Array>} - Promise resolving to array of meals with total calories
 */
async function getMealsByDateRange(userId, startDate, endDate) {
    const query = `
        SELECT
            m.id,
            m.name,
            m.date,
            m.time,
            m.photo_url,
            m.user_id,
            m.created_at,
            COALESCE(SUM(mi.calories), 0) as total_calories
        FROM meals m
        LEFT JOIN meal_ingredients mi ON m.id = mi.meal_id
        WHERE m.user_id = $1
        AND m.date >= $2
        AND m.date <= $3
        GROUP BY m.id, m.name, m.date, m.time, m.photo_url, m.user_id, m.created_at
        ORDER BY m.date ASC, m.time ASC
    `;

    const result = await db.query(query, [userId, startDate, endDate]);
    return result.rows;
}

/**
 * Create the meals tables if they don't exist
 * @returns {Promise<void>}
 */
async function createMealsTables() {
    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        // Create meals table
        await client.query(`
            CREATE TABLE IF NOT EXISTS meals (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                date DATE NOT NULL,
                time TIME NOT NULL,
                photo_url VARCHAR(500),
                user_id INTEGER NOT NULL,
                bloating_rating INTEGER CHECK (bloating_rating >= 1 AND bloating_rating <= 10),
                bloating_rating_timestamp TIMESTAMP,
                bloating_notification_sent BOOLEAN DEFAULT FALSE,
                bloating_notification_id VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Add photo_url column if it doesn't exist (for existing tables)
        try {
            await client.query(`
                ALTER TABLE meals ADD COLUMN IF NOT EXISTS photo_url VARCHAR(500)
            `);
        } catch (error) {
            // Column might already exist, ignore error
            console.log('Photo URL column already exists or could not be added:', error.message);
        }

        // Add bloating rating columns if they don't exist (for existing tables)
        try {
            await client.query(`
                ALTER TABLE meals ADD COLUMN IF NOT EXISTS bloating_rating INTEGER CHECK (bloating_rating >= 1 AND bloating_rating <= 10)
            `);
            await client.query(`
                ALTER TABLE meals ADD COLUMN IF NOT EXISTS bloating_rating_timestamp TIMESTAMP
            `);
            await client.query(`
                ALTER TABLE meals ADD COLUMN IF NOT EXISTS bloating_notification_sent BOOLEAN DEFAULT FALSE
            `);
            await client.query(`
                ALTER TABLE meals ADD COLUMN IF NOT EXISTS bloating_notification_id VARCHAR(50)
            `);
        } catch (error) {
            // Columns might already exist, ignore error
            console.log('Bloating rating columns already exist or could not be added:', error.message);
        }

        // Create meal_ingredients table
        await client.query(`
            CREATE TABLE IF NOT EXISTS meal_ingredients (
                id SERIAL PRIMARY KEY,
                meal_id INTEGER NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
                ingredient_id INTEGER,
                name VARCHAR(255) NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                calories DECIMAL(10, 2) NOT NULL,
                protein DECIMAL(10, 2) NOT NULL,
                fat DECIMAL(10, 2) NOT NULL,
                carbs DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await client.query('COMMIT');
        console.log('Meals tables created successfully');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating meals tables:', error);
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Update bloating rating for a meal
 * @param {number} mealId - The meal ID
 * @param {number} bloatingRating - The bloating rating (1-10)
 * @param {number} userId - The user ID
 * @returns {Promise<Object>} - Promise resolving to the updated meal
 */
async function updateBloatingRating(mealId, bloatingRating, userId = 1) {
    const client = await db.getClient();

    try {
        // Validate bloating rating
        if (bloatingRating < 1 || bloatingRating > 10) {
            throw new Error('Bloating rating must be between 1 and 10');
        }

        // Update the meal with bloating rating and timestamp
        const result = await client.query(
            `UPDATE meals
             SET bloating_rating = $1, bloating_rating_timestamp = CURRENT_TIMESTAMP
             WHERE id = $2 AND user_id = $3
             RETURNING *`,
            [bloatingRating, mealId, userId]
        );

        if (result.rows.length === 0) {
            throw new Error('Meal not found or access denied');
        }

        console.log(`Updated bloating rating for meal ${mealId}: ${bloatingRating}/10`);
        return result.rows[0];
    } catch (error) {
        console.error('Error updating bloating rating:', error);
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Update bloating notification status for a meal
 * @param {number} mealId - The meal ID
 * @param {string} notificationId - The notification ID
 * @param {boolean} sent - Whether the notification was sent
 * @returns {Promise<Object>} - Promise resolving to the updated meal
 */
async function updateBloatingNotificationStatus(mealId, notificationId, sent = true) {
    const client = await db.getClient();

    try {
        const result = await client.query(
            `UPDATE meals
             SET bloating_notification_sent = $1, bloating_notification_id = $2
             WHERE id = $3
             RETURNING *`,
            [sent, notificationId, mealId]
        );

        if (result.rows.length === 0) {
            throw new Error('Meal not found');
        }

        console.log(`Updated bloating notification status for meal ${mealId}: sent=${sent}`);
        return result.rows[0];
    } catch (error) {
        console.error('Error updating bloating notification status:', error);
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    getAllMeals,
    getMealById,
    createMeal,
    updateMeal,
    deleteMeal,
    getMealsByDateRange,
    createMealsTables,
    updateBloatingRating,
    updateBloatingNotificationStatus
};
