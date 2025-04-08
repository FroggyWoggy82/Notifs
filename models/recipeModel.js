/**
 * Recipe Model
 * Handles data operations for recipes and ingredients
 */

const db = require('../db');

/**
 * Get all recipes (basic info)
 * @returns {Promise<Array>} - Promise resolving to an array of recipes
 */
async function getAllRecipes() {
    const result = await db.query('SELECT id, name, total_calories FROM recipes ORDER BY name ASC');
    return result.rows;
}

/**
 * Get a recipe by ID with its ingredients
 * @param {number} id - The recipe ID
 * @returns {Promise<Object>} - Promise resolving to the recipe with ingredients
 */
async function getRecipeById(id) {
    // Fetch recipe details
    const recipeResult = await db.query('SELECT * FROM recipes WHERE id = $1', [id]);
    if (recipeResult.rowCount === 0) {
        throw new Error('Recipe not found');
    }
    const recipe = recipeResult.rows[0];

    // Fetch ingredients for the recipe
    const ingredientsResult = await db.query(
        'SELECT * FROM ingredients WHERE recipe_id = $1 ORDER BY id ASC', 
        [id]
    );
    recipe.ingredients = ingredientsResult.rows;

    return recipe;
}

/**
 * Create a new recipe with ingredients
 * @param {string} name - The recipe name
 * @param {Array} ingredients - Array of ingredient objects
 * @returns {Promise<Object>} - Promise resolving to the created recipe with ingredients
 */
async function createRecipe(name, ingredients) {
    if (!name || !ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        throw new Error('Recipe name and at least one ingredient are required');
    }

    // Calculate total calories from ingredients
    let calculatedTotalCalories = 0;
    for (const ing of ingredients) {
        if (typeof ing.calories !== 'number' || ing.calories < 0) {
            throw new Error('Invalid calorie data for ingredient: ' + ing.name);
        }
        calculatedTotalCalories += ing.calories;
    }

    const client = await db.getClient(); // Use client for transaction

    try {
        await client.query('BEGIN'); // Start transaction

        // Insert the recipe
        const recipeInsertResult = await client.query(
            'INSERT INTO recipes (name, total_calories) VALUES ($1, $2) RETURNING id',
            [name.trim(), calculatedTotalCalories]
        );
        const newRecipeId = recipeInsertResult.rows[0].id;

        // Insert ingredients
        const ingredientInsertPromises = ingredients.map(ing => {
            // Validate required ingredient fields
            if (!ing.name || typeof ing.calories !== 'number' || typeof ing.amount !== 'number' || 
                typeof ing.protein !== 'number' || typeof ing.fats !== 'number' || 
                typeof ing.carbohydrates !== 'number' || typeof ing.price !== 'number' || ing.amount <= 0) {
                 throw new Error('Invalid data for ingredient: ' + (ing.name || '[Missing Name]'));
            }
            return client.query(
                'INSERT INTO ingredients (recipe_id, name, calories, amount, protein, fats, carbohydrates, price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                [newRecipeId, ing.name.trim(), ing.calories, ing.amount, ing.protein, ing.fats, ing.carbohydrates, ing.price]
            );
        });
        await Promise.all(ingredientInsertPromises);

        await client.query('COMMIT'); // Commit transaction

        // Fetch the newly created recipe with ingredients to return it
        const finalResult = await db.query('SELECT * FROM recipes WHERE id = $1', [newRecipeId]);
        const finalIngredients = await db.query('SELECT * FROM ingredients WHERE recipe_id = $1 ORDER BY id ASC', [newRecipeId]);
        const newRecipe = finalResult.rows[0];
        newRecipe.ingredients = finalIngredients.rows;
        
        return newRecipe;
    } catch (error) {
        await client.query('ROLLBACK'); // Rollback transaction on error
        throw error;
    } finally {
        client.release(); // Release client back to the pool
    }
}

/**
 * Update a recipe's calories and scale ingredients
 * @param {number} id - The recipe ID
 * @param {string} name - The updated recipe name (optional)
 * @param {number} targetCalories - The target total calories
 * @returns {Promise<Object>} - Promise resolving to the updated recipe with ingredients
 */
async function updateRecipeCalories(id, name, targetCalories) {
    if (typeof targetCalories !== 'number' || targetCalories <= 0) {
        throw new Error('Invalid targetCalories value');
    }

    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        // 1. Get current recipe and ingredients
        const recipeResult = await client.query('SELECT * FROM recipes WHERE id = $1', [id]);
        if (recipeResult.rowCount === 0) {
            throw new Error('Recipe not found');
        }
        const currentRecipe = recipeResult.rows[0];
        const currentTotalCalories = currentRecipe.total_calories;

        if (currentTotalCalories <= 0) {
            throw new Error('Cannot scale recipe with zero or negative current calories');
        }

        const ingredientsResult = await client.query('SELECT * FROM ingredients WHERE recipe_id = $1', [id]);
        const currentIngredients = ingredientsResult.rows;

        // 2. Calculate scaling factor
        const scalingFactor = targetCalories / currentTotalCalories;

        // 3. Update recipe total calories and name if provided
        if (name) {
            await client.query('UPDATE recipes SET name = $1, total_calories = $2 WHERE id = $3', [name.trim(), targetCalories, id]);
        } else {
            await client.query('UPDATE recipes SET total_calories = $1 WHERE id = $2', [targetCalories, id]);
        }

        // 4. Update each ingredient proportionally
        const updatePromises = currentIngredients.map(ing => {
            const newAmount = ing.amount * scalingFactor;
            const newCalories = ing.calories * scalingFactor;
            const newProtein = ing.protein * scalingFactor;
            const newFats = ing.fats * scalingFactor;
            const newCarbohydrates = ing.carbohydrates * scalingFactor;
            const newPrice = ing.price * scalingFactor;

            return client.query(
                'UPDATE ingredients SET amount = $1, calories = $2, protein = $3, fats = $4, carbohydrates = $5, price = $6 WHERE id = $7',
                [newAmount, newCalories, newProtein, newFats, newCarbohydrates, newPrice, ing.id]
            );
        });
        await Promise.all(updatePromises);

        await client.query('COMMIT');

        // Fetch updated recipe and ingredients to return
        const updatedRecipeResult = await db.query('SELECT * FROM recipes WHERE id = $1', [id]);
        const updatedIngredientsResult = await db.query('SELECT * FROM ingredients WHERE recipe_id = $1 ORDER BY id ASC', [id]);
        const updatedRecipe = updatedRecipeResult.rows[0];
        updatedRecipe.ingredients = updatedIngredientsResult.rows;

        return updatedRecipe;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Delete a recipe and its ingredients
 * @param {number} id - The recipe ID
 * @returns {Promise<Object>} - Promise resolving to the deleted recipe ID and name
 */
async function deleteRecipe(id) {
    // Note: ON DELETE CASCADE in the ingredients table should handle deleting ingredients automatically.
    const result = await db.query('DELETE FROM recipes WHERE id = $1 RETURNING id, name', [id]);

    if (result.rowCount === 0) {
        throw new Error('Recipe not found');
    }

    return { 
        id: parseInt(id),
        name: result.rows[0].name
    };
}

module.exports = {
    getAllRecipes,
    getRecipeById,
    createRecipe,
    updateRecipeCalories,
    deleteRecipe
};
