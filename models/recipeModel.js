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
    console.log('=== getRecipeById called ===');
    console.log('id:', id);

    // Fetch recipe details
    const recipeResult = await db.query('SELECT * FROM recipes WHERE id = $1', [id]);
    if (recipeResult.rowCount === 0) {
        throw new Error('Recipe not found');
    }
    const recipe = recipeResult.rows[0];
    console.log('Recipe from database:', recipe);

    // CRITICAL FIX: Use a simpler query to fetch ingredients
    const ingredientsResult = await db.query(
        'SELECT * FROM ingredients WHERE recipe_id = $1 ORDER BY id ASC',
        [id]
    );

    // Log the ingredients data
    console.log(`Found ${ingredientsResult.rowCount} ingredients for recipe ${id}`);

    // Process each ingredient to ensure package_amount is properly formatted
    const ingredients = ingredientsResult.rows.map(ing => {
        console.log(`Ingredient ${ing.id} (${ing.name}) package_amount:`, ing.package_amount, typeof ing.package_amount);

        // CRITICAL FIX: Ensure package_amount is properly formatted
        // No need to convert - PostgreSQL driver handles this correctly

        console.log(`Processed ingredient ${ing.id} (${ing.name}) package_amount:`, ing.package_amount, typeof ing.package_amount);
        return ing;
    });

    recipe.ingredients = ingredients;
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

            // Log the ingredient data being inserted
            console.log('Inserting ingredient with package_amount:', ing.package_amount);

            return client.query(
                'INSERT INTO ingredients (recipe_id, name, calories, amount, package_amount, protein, fats, carbohydrates, price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
                [newRecipeId, ing.name.trim(), ing.calories, ing.amount, ing.package_amount || null, ing.protein, ing.fats, ing.carbohydrates, ing.price]
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

            // Note: We don't scale package_amount as it's a fixed property of the ingredient package
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
    console.log('=== DIRECT updateIngredient called ===');
    console.log('recipeId:', recipeId);
    console.log('ingredientId:', ingredientId);
    console.log('ingredientData:', JSON.stringify(ingredientData, null, 2));

    // Validate inputs
    if (!recipeId || !ingredientId) {
        throw new Error('Recipe ID and ingredient ID are required');
    }

    if (!ingredientData || typeof ingredientData !== 'object') {
        throw new Error('Ingredient data is required');
    }

    // Process package_amount
    let packageAmount = null;
    if (ingredientData.package_amount !== undefined &&
        ingredientData.package_amount !== null &&
        ingredientData.package_amount !== '') {

        // Convert to number
        packageAmount = Number(ingredientData.package_amount);

        // If conversion failed, set to null
        if (isNaN(packageAmount)) {
            packageAmount = null;
        }
    }

    console.log('Final package_amount:', packageAmount, typeof packageAmount);

    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        // Check if ingredient exists and belongs to the recipe
        const ingredientResult = await client.query(
            'SELECT * FROM ingredients WHERE id = $1 AND recipe_id = $2',
            [ingredientId, recipeId]
        );
        if (ingredientResult.rowCount === 0) {
            throw new Error('Ingredient not found or does not belong to this recipe');
        }

        const oldIngredient = ingredientResult.rows[0];

        // Update basic fields
        await client.query(`
            UPDATE ingredients SET
                name = $1,
                calories = $2,
                amount = $3,
                protein = $4,
                fats = $5,
                carbohydrates = $6,
                price = $7
            WHERE id = $8
        `, [
            ingredientData.name || oldIngredient.name,
            ingredientData.calories || oldIngredient.calories,
            ingredientData.amount || oldIngredient.amount,
            ingredientData.protein || oldIngredient.protein,
            ingredientData.fats || oldIngredient.fats,
            ingredientData.carbohydrates || oldIngredient.carbohydrates,
            ingredientData.price || oldIngredient.price,
            ingredientId
        ]);

        // Update package_amount separately
        console.log('Updating package_amount to:', packageAmount, typeof packageAmount);

        // CRITICAL FIX: Ensure package_amount is properly formatted
        // If it's a string, convert it to a number
        let finalPackageAmount = packageAmount;
        if (typeof finalPackageAmount === 'string' && finalPackageAmount.trim() !== '') {
            finalPackageAmount = Number(finalPackageAmount);
            if (isNaN(finalPackageAmount)) {
                finalPackageAmount = null;
            }
        }

        console.log('Final package_amount to save:', finalPackageAmount, typeof finalPackageAmount);

        await client.query(`
            UPDATE ingredients SET package_amount = $1 WHERE id = $2
        `, [finalPackageAmount, ingredientId]);

        // Verify the update
        const verifyResult = await client.query(
            'SELECT * FROM ingredients WHERE id = $1',
            [ingredientId]
        );

        console.log('Verified updated ingredient:', verifyResult.rows[0]);
        console.log('Verified package_amount:', verifyResult.rows[0].package_amount);

        // Calculate the difference in calories
        const caloriesDifference = ingredientData.calories - oldIngredient.calories;

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

        const ingredient = ingredientResult.rows[0];
        console.log('Ingredient data from database:', ingredient);
        return ingredient;
    } catch (error) {
        throw error;
    }
}

/**
 * Update only the package_amount of an ingredient
 * @param {number} recipeId - The recipe ID
 * @param {number} ingredientId - The ingredient ID
 * @param {number|null} packageAmount - The package amount value
 * @returns {Promise<Object>} - Promise resolving to the updated ingredient
 */
async function updateIngredientPackageAmount(recipeId, ingredientId, packageAmount) {
    console.log('=== updateIngredientPackageAmount called ===');
    console.log('recipeId:', recipeId);
    console.log('ingredientId:', ingredientId);
    console.log('packageAmount:', packageAmount, typeof packageAmount);

    // Validate inputs
    if (!recipeId || !ingredientId) {
        throw new Error('Recipe ID and ingredient ID are required');
    }

    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        // Check if ingredient exists and belongs to the recipe
        const ingredientResult = await client.query(
            'SELECT * FROM ingredients WHERE id = $1 AND recipe_id = $2',
            [ingredientId, recipeId]
        );

        if (ingredientResult.rowCount === 0) {
            throw new Error('Ingredient not found or does not belong to this recipe');
        }

        // Log the current package_amount
        console.log('Current package_amount:', ingredientResult.rows[0].package_amount, typeof ingredientResult.rows[0].package_amount);

        // CRITICAL FIX: Ensure package_amount is properly formatted
        // Convert to number if it's not null
        let finalPackageAmount = null;
        if (packageAmount !== null && packageAmount !== undefined && packageAmount !== '') {
            // Force to number
            finalPackageAmount = Number(packageAmount);

            // If conversion failed, set to null
            if (isNaN(finalPackageAmount)) {
                finalPackageAmount = null;
            }
        }

        console.log('Final package_amount to save:', finalPackageAmount, typeof finalPackageAmount);

        // Update only the package_amount using a direct SQL query
        console.log('Executing direct package_amount update...');
        const updateResult = await client.query(
            'UPDATE ingredients SET package_amount = $1 WHERE id = $2 RETURNING *',
            [finalPackageAmount, ingredientId]
        );

        if (updateResult.rowCount === 0) {
            throw new Error('Failed to update package_amount');
        }

        console.log('Update result:', updateResult.rows[0]);
        console.log('Updated package_amount:', updateResult.rows[0].package_amount, typeof updateResult.rows[0].package_amount);

        // Verify the update with a separate query
        const verifyResult = await client.query(
            'SELECT id, name, package_amount FROM ingredients WHERE id = $1',
            [ingredientId]
        );

        console.log('Verified result:', verifyResult.rows[0]);
        console.log('Verified package_amount:', verifyResult.rows[0].package_amount, typeof verifyResult.rows[0].package_amount);

        await client.query('COMMIT');

        // Get the full recipe to return
        const recipe = await getRecipeById(recipeId);
        return recipe;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    getAllRecipes,
    getRecipeById,
    createRecipe,
    updateRecipeCalories,
    deleteRecipe,
    updateIngredient,
    getIngredientById,
    updateIngredientPackageAmount
};
