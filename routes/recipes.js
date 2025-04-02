// routes/recipes.js
const express = require('express');
const db = require('../db'); // Assuming db.js is in the parent directory
const router = express.Router();

// === CRUD Operations for Recipes ===

// GET /api/recipes - Fetch all recipes (basic info for now)
router.get('/', async (req, res) => {
    console.log("Received GET /api/recipes request");
    try {
        // Fetch basic recipe info (id, name, total_calories)
        const result = await db.query('SELECT id, name, total_calories FROM recipes ORDER BY name ASC');
        console.log("GET /api/recipes response:", result.rows);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching recipes:', err);
        res.status(500).json({ error: 'Failed to fetch recipes' });
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
    const { name, ingredients } = req.body; // Expecting name and an array of ingredients
    console.log(`Received POST /api/recipes: name='${name}'`, ingredients);

    if (!name || !ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({ error: 'Recipe name and at least one ingredient are required' });
    }

    // Calculate total calories from ingredients provided by the client
    let calculatedTotalCalories = 0;
    for (const ing of ingredients) {
        if (typeof ing.calories !== 'number' || ing.calories < 0) {
            return res.status(400).json({ error: 'Invalid calorie data for ingredient: ' + ing.name });
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
                 throw new Error('Invalid data for ingredient: ' + (ing.name || '[Missing Name]')); // Throw error to trigger rollback
            }
            return client.query(
                'INSERT INTO ingredients (recipe_id, name, calories, amount, protein, fats, carbohydrates, price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                [newRecipeId, ing.name.trim(), ing.calories, ing.amount, ing.protein, ing.fats, ing.carbohydrates, ing.price]
            );
        });
        await Promise.all(ingredientInsertPromises);

        await client.query('COMMIT'); // Commit transaction

        console.log(`Recipe '${name}' created successfully with ID: ${newRecipeId}`);
        // Fetch the newly created recipe with ingredients to return it
        const finalResult = await db.query('SELECT * FROM recipes WHERE id = $1', [newRecipeId]);
        const finalIngredients = await db.query('SELECT * FROM ingredients WHERE recipe_id = $1 ORDER BY id ASC', [newRecipeId]);
        const newRecipe = finalResult.rows[0];
        newRecipe.ingredients = finalIngredients.rows;
        
        res.status(201).json(newRecipe);

    } catch (err) {
        await client.query('ROLLBACK'); // Rollback transaction on error
        console.error('Error creating recipe:', err);
        // Check if it was our specific validation error
        if (err.message.startsWith('Invalid data for ingredient')) {
             res.status(400).json({ error: err.message });
        } else {
            res.status(500).json({ error: 'Failed to create recipe' });
        }
    } finally {
        client.release(); // Release client back to the pool
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