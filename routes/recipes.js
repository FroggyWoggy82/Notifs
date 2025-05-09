// routes/recipes.js
const express = require('express');
const db = require('../utils/db');
const RecipeModel = require('../models/recipeModel');
const router = express.Router();

// === CRUD Operations for Recipes ===

// GET /api/recipes - Fetch all recipes (basic info for now)
router.get('/', async (req, res) => {
    console.log("=== Received GET /api/recipes request ===");
    console.log("Query parameters:", req.query);
    console.log("Request headers:", req.headers);

    try {
        // First check if the recipes table exists
        console.log("Checking if recipes table exists...");
        const tableCheckResult = await db.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'recipes'
            );
        `);

        const tableExists = tableCheckResult.rows[0].exists;
        console.log(`Recipes table exists: ${tableExists}`);

        if (!tableExists) {
            console.error('Recipes table does not exist!');
            return res.status(500).json({ error: 'Recipes table does not exist' });
        }

        // Check if the table has any data
        console.log('Checking if recipes table has data...');
        const countResult = await db.query('SELECT COUNT(*) FROM recipes');
        const recipeCount = parseInt(countResult.rows[0].count);
        console.log(`Recipe count: ${recipeCount}`);

        // Fetch basic recipe info (id, name, total_calories)
        console.log("Executing query to fetch recipes...");
        const result = await db.query('SELECT id, name, total_calories FROM recipes ORDER BY name ASC');

        console.log(`Query returned ${result.rowCount} recipes`);

        if (result.rows && result.rows.length > 0) {
            console.log(`First recipe: ${JSON.stringify(result.rows[0])}`);
        } else {
            console.log('No recipes found');
        }

        // Set cache control headers to prevent caching
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        // Return an empty array if no recipes found
        if (!result.rows || result.rows.length === 0) {
            console.log('Returning empty array');
            return res.json([]);
        }

        console.log(`Returning ${result.rows.length} recipes`);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching recipes:', err);
        console.error('Error stack:', err.stack);

        // Try to return a more helpful error message
        let errorMessage = `Failed to fetch recipes: ${err.message}`;

        if (err.code) {
            errorMessage += ` (Code: ${err.code})`;
        }

        if (err.code === '42P01') {
            errorMessage = 'Recipes table does not exist';
        } else if (err.code === '28P01') {
            errorMessage = 'Database authentication failed';
        } else if (err.code === '3D000') {
            errorMessage = 'Database does not exist';
        } else if (err.code === 'ECONNREFUSED') {
            errorMessage = 'Could not connect to database server';
        }

        res.status(500).json({ error: errorMessage });
    }
});

// GET /api/recipes/:id - Fetch a specific recipe with ingredients
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`Received GET /api/recipes/${id} request`);
    try {
        // Fetch recipe details
        const recipeResult = await db.query('SELECT * FROM recipes WHERE id = $1', [id]);
        if (recipeResult.rowCount === 0) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        const recipe = recipeResult.rows[0];

        // Fetch ingredients for the recipe
        const ingredientsResult = await db.query(
            'SELECT * FROM ingredients WHERE recipe_id = $1 ORDER BY id ASC',
            [id]
        );
        recipe.ingredients = ingredientsResult.rows;

        console.log(`GET /api/recipes/${id} response:`, recipe);
        res.json(recipe);
    } catch (err) {
        console.error(`Error fetching recipe ${id}:`, err);
        res.status(500).json({ error: 'Failed to fetch recipe details' });
    }
});

// POST /api/recipes - Create a new recipe and its ingredients
router.post('/', async (req, res) => {
    console.log('Received POST /api/recipes request');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const { name, ingredients } = req.body; // Expecting name and an array of ingredients
    console.log(`Recipe name: '${name}'`);
    console.log(`Number of ingredients: ${ingredients ? ingredients.length : 0}`);

    // Log each ingredient's micronutrient data
    if (ingredients && Array.isArray(ingredients)) {
        ingredients.forEach((ing, index) => {
            console.log(`Ingredient ${index + 1} (${ing.name}) data:`, JSON.stringify(ing, null, 2));

            // Check for micronutrient data
            const micronutrientFields = Object.keys(ing).filter(key =>
                !['name', 'calories', 'amount', 'protein', 'fats', 'carbohydrates', 'price', 'package_amount'].includes(key)
            );

            console.log(`Ingredient ${index + 1} has ${micronutrientFields.length} micronutrient fields:`, micronutrientFields);
        });
    } else {
        console.error('Invalid ingredients data:', ingredients);
    }

    if (!name || !ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        console.error('Validation error: Recipe name and at least one ingredient are required');
        return res.status(400).json({ error: 'Recipe name and at least one ingredient are required' });
    }

    try {
        console.log('Calling RecipeModel.createRecipe...');
        // Use the RecipeModel to create the recipe
        const recipe = await RecipeModel.createRecipe(name, ingredients);
        console.log(`Recipe '${name}' created successfully with ID: ${recipe.id}`);

        // Check if the ingredients have micronutrient data
        if (recipe.ingredients && recipe.ingredients.length > 0) {
            recipe.ingredients.forEach((ing, index) => {
                // Check for micronutrient data
                const micronutrientFields = Object.keys(ing).filter(key =>
                    !['id', 'recipe_id', 'name', 'calories', 'amount', 'protein', 'fats', 'carbohydrates', 'price', 'package_amount',
                     'calories_per_gram', 'protein_per_gram', 'fats_per_gram', 'carbohydrates_per_gram', 'price_per_gram'].includes(key)
                );

                console.log(`Saved ingredient ${index + 1} (${ing.name}) has ${micronutrientFields.length} micronutrient fields:`, micronutrientFields);

                // Check specific micronutrient fields
                const fields = [
                    'fiber', 'sugars', 'saturated', 'monounsaturated', 'polyunsaturated',
                    'omega3', 'omega6', 'cholesterol', 'vitamin_a', 'vitamin_c', 'vitamin_d',
                    'vitamin_e', 'vitamin_k', 'calcium', 'iron', 'magnesium', 'phosphorus',
                    'potassium', 'sodium', 'zinc', 'water'
                ];

                console.log(`Checking micronutrient fields for saved ingredient ${index + 1}:`);
                fields.forEach(field => {
                    console.log(`${field}: ${ing[field]}`);
                });
            });
        }

        console.log('Sending response with created recipe');
        res.status(201).json(recipe);
    } catch (err) {
        console.error('Error creating recipe:', err);
        console.error('Error stack:', err.stack);

        // Check if it was our specific validation error
        if (err.message.startsWith('Invalid data for ingredient') ||
            err.message.includes('required') ||
            err.message.includes('Invalid calorie data')) {
            console.error('Validation error:', err.message);
            res.status(400).json({ error: err.message });
        } else {
            console.error('Server error:', err.message);
            res.status(500).json({ error: `Failed to create recipe: ${err.message}` });
        }
    }
});


// PUT /api/recipes/:id - Update recipe (including calorie adjustment)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, targetCalories } = req.body;
    console.log(`Received PUT /api/recipes/${id}: name='${name}', targetCalories=${targetCalories}`);

    // We only handle calorie adjustments for now. Name changes could be added.
    if (typeof targetCalories !== 'number' || targetCalories <= 0) {
        return res.status(400).json({ error: 'Invalid targetCalories value' });
    }

    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        // 1. Get current recipe and ingredients
        const recipeResult = await client.query('SELECT * FROM recipes WHERE id = $1', [id]);
        if (recipeResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Recipe not found' });
        }
        const currentRecipe = recipeResult.rows[0];
        const currentTotalCalories = currentRecipe.total_calories;

        if (currentTotalCalories <= 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Cannot scale recipe with zero or negative current calories'});
        }

        const ingredientsResult = await client.query('SELECT * FROM ingredients WHERE recipe_id = $1', [id]);
        const currentIngredients = ingredientsResult.rows;

        // 2. Calculate scaling factor
        const scalingFactor = targetCalories / currentTotalCalories;

        // 3. Update recipe total calories
        await client.query('UPDATE recipes SET total_calories = $1 WHERE id = $2', [targetCalories, id]);

        // 4. Update each ingredient proportionally
        const updatePromises = currentIngredients.map(ing => {
            const newAmount = ing.amount * scalingFactor;
            const newCalories = ing.calories * scalingFactor;
            const newProtein = ing.protein * scalingFactor;
            const newFats = ing.fats * scalingFactor;
            const newCarbohydrates = ing.carbohydrates * scalingFactor;
            // Price scaling might be debatable, but let's scale it too for simplicity
            const newPrice = ing.price * scalingFactor;

            // We need to scale all micronutrient values as well
            console.log(`Scaling ingredient ${ing.id} (${ing.name}) with factor ${scalingFactor}`);

            // First, get all columns from the ingredients table
            const columnsQuery = `
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'ingredients'
                AND column_name NOT IN ('id', 'recipe_id', 'created_at', 'updated_at')
            `;

            return client.query(columnsQuery)
                .then(columnsResult => {
                    const columns = columnsResult.rows.map(row => row.column_name);

                    // Build a dynamic query to update all numeric columns
                    let updateQuery = 'UPDATE ingredients SET ';
                    const updateValues = [];
                    let paramIndex = 1;

                    columns.forEach(column => {
                        // Skip non-numeric columns or columns that should not be scaled
                        if (['name', 'package_amount'].includes(column)) {
                            return;
                        }

                        // For all other columns, scale them
                        if (paramIndex > 1) {
                            updateQuery += ', ';
                        }

                        updateQuery += `${column} = $${paramIndex}`;

                        // Scale the value if it exists and is a number
                        const originalValue = ing[column];
                        const newValue = (originalValue !== null && typeof originalValue === 'number')
                            ? originalValue * scalingFactor
                            : originalValue;

                        updateValues.push(newValue);
                        paramIndex++;
                    });

                    updateQuery += ` WHERE id = $${paramIndex}`;
                    updateValues.push(ing.id);

                    console.log(`Executing dynamic update query for ingredient ${ing.id}`);
                    return client.query(updateQuery, updateValues);
                });
        });

        try {
            await Promise.all(updatePromises);
            console.log('All ingredient updates completed successfully');
        } catch (error) {
            console.error('Error updating ingredients:', error);
            throw error; // Re-throw to be caught by the outer try/catch
        }

        await client.query('COMMIT');

        // Fetch updated recipe and ingredients to return
        const updatedRecipeResult = await db.query('SELECT * FROM recipes WHERE id = $1', [id]);
        const updatedIngredientsResult = await db.query('SELECT * FROM ingredients WHERE recipe_id = $1 ORDER BY id ASC', [id]);
        const updatedRecipe = updatedRecipeResult.rows[0];
        updatedRecipe.ingredients = updatedIngredientsResult.rows;

        console.log(`Recipe ${id} calories adjusted successfully to ${targetCalories}`);
        res.json(updatedRecipe);

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(`Error updating recipe ${id}:`, err);
        res.status(500).json({ error: 'Failed to update recipe calories' });
    } finally {
        client.release();
    }
});

// DELETE /api/recipes/:id - Delete a recipe and its ingredients
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`Received DELETE /api/recipes/${id}`);

    // Note: ON DELETE CASCADE in the ingredients table should handle deleting ingredients automatically.
    try {
        const result = await db.query('DELETE FROM recipes WHERE id = $1 RETURNING id, name', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        console.log(`Recipe ${id} (${result.rows[0].name}) deleted successfully`);
        res.json({ message: `Recipe ${result.rows[0].name} deleted successfully`, id: parseInt(id) });
    } catch (err) {
        console.error(`Error deleting recipe ${id}:`, err);
        res.status(500).json({ error: 'Failed to delete recipe' });
    }
});

module.exports = router;