/**
 * Recipe Model
 * Handles data operations for recipes and ingredients
 */

const db = require('../utils/db');

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

/**
 * Update a single ingredient in a recipe
 * @param {number} recipeId - The recipe ID
 * @param {number} ingredientId - The ingredient ID
 * @param {Object} ingredientData - The updated ingredient data
 * @returns {Promise<Object>} - Promise resolving to the updated recipe with ingredients
 */
async function updateIngredient(recipeId, ingredientId, ingredientData) {
    // Validate inputs
    if (!recipeId || !ingredientId) {
        throw new Error('Recipe ID and ingredient ID are required');
    }

    if (!ingredientData || typeof ingredientData !== 'object') {
        throw new Error('Ingredient data is required');
    }

    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        // Check if recipe exists
        const recipeResult = await client.query('SELECT * FROM recipes WHERE id = $1', [recipeId]);
        if (recipeResult.rowCount === 0) {
            throw new Error('Recipe not found');
        }

        // Check if ingredient exists and belongs to the recipe
        const ingredientResult = await client.query(
            'SELECT * FROM ingredients WHERE id = $1 AND recipe_id = $2',
            [ingredientId, recipeId]
        );
        if (ingredientResult.rowCount === 0) {
            throw new Error('Ingredient not found or does not belong to this recipe');
        }

        const oldIngredient = ingredientResult.rows[0];

        // Prepare update data
        const updates = {};
        const validFields = [
            // Basic fields
            'name', 'amount', 'calories', 'protein', 'fats', 'carbohydrates', 'price',
            // General section
            'alcohol', 'caffeine', 'water',
            // Carbohydrates section
            'fiber', 'starch', 'sugars', 'added_sugars', 'net_carbs',
            // Lipids section
            'monounsaturated', 'polyunsaturated', 'omega3', 'omega6', 'saturated', 'trans_fat', 'cholesterol',
            // Protein section
            'cystine', 'histidine', 'isoleucine', 'leucine', 'lysine', 'methionine', 'phenylalanine', 'threonine', 'tryptophan', 'tyrosine', 'valine',
            // Vitamins section
            'vitamin_b1', 'vitamin_b2', 'vitamin_b3', 'vitamin_b5', 'vitamin_b6', 'vitamin_b12', 'folate', 'vitamin_a', 'vitamin_c', 'vitamin_d', 'vitamin_e', 'vitamin_k',
            // Minerals section
            'calcium', 'copper', 'iron', 'magnesium', 'manganese', 'phosphorus', 'potassium', 'selenium', 'sodium', 'zinc'
        ];

        validFields.forEach(field => {
            if (ingredientData[field] !== undefined) {
                // Validate numeric fields
                if (field !== 'name' && (isNaN(ingredientData[field]) || ingredientData[field] < 0)) {
                    throw new Error(`Invalid value for ${field}`);
                }
                // For name field, ensure it's a string and trim it
                if (field === 'name' && typeof ingredientData[field] === 'string') {
                    updates[field] = ingredientData[field].trim();
                } else if (field !== 'name') {
                    updates[field] = ingredientData[field];
                }
            }
        });

        if (Object.keys(updates).length === 0) {
            throw new Error('No valid fields to update');
        }

        // Build the update query
        const setClauses = [];
        const values = [];
        let paramIndex = 1;

        Object.entries(updates).forEach(([field, value]) => {
            setClauses.push(`${field} = $${paramIndex}`);
            values.push(value);
            paramIndex++;
        });

        values.push(ingredientId); // Add ingredient ID as the last parameter

        // Update the ingredient
        await client.query(
            `UPDATE ingredients SET ${setClauses.join(', ')} WHERE id = $${paramIndex}`,
            values
        );

        // Calculate the difference in calories
        let caloriesDifference = 0;
        if (updates.calories !== undefined) {
            caloriesDifference = updates.calories - oldIngredient.calories;
        }

        // Update recipe total calories if ingredient calories changed
        if (caloriesDifference !== 0) {
            await client.query(
                'UPDATE recipes SET total_calories = total_calories + $1 WHERE id = $2',
                [caloriesDifference, recipeId]
            );
        }

        await client.query('COMMIT');

        // Fetch updated recipe and ingredients to return
        const updatedRecipe = await getRecipeById(recipeId);
        return updatedRecipe;

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Get a single ingredient by ID
 * @param {number} recipeId - The recipe ID
 * @param {number} ingredientId - The ingredient ID
 * @returns {Promise<Object>} - Promise resolving to the ingredient
 */
async function getIngredientById(recipeId, ingredientId) {
    // Validate inputs
    if (!recipeId || !ingredientId) {
        throw new Error('Recipe ID and ingredient ID are required');
    }

    try {
        // Check if ingredient exists and belongs to the recipe
        const ingredientResult = await db.query(
            'SELECT * FROM ingredients WHERE id = $1 AND recipe_id = $2',
            [ingredientId, recipeId]
        );

        if (ingredientResult.rowCount === 0) {
            throw new Error('Ingredient not found or does not belong to this recipe');
        }

        return ingredientResult.rows[0];
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getAllRecipes,
    getRecipeById,
    createRecipe,
    updateRecipeCalories,
    deleteRecipe,
    updateIngredient,
    getIngredientById
};
