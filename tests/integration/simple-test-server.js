const express = require('express');
const path = require('path');
const RecipeModel = require('./models/recipeModel');

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Test API endpoints for recipes

// GET all recipes
app.get('/api/recipes', async (req, res) => {
    console.log('Received GET /api/recipes request');

    try {
        const recipes = await RecipeModel.getAllRecipes();
        console.log(`Found ${recipes.length} recipes`);
        res.json(recipes);
    } catch (error) {
        console.error('Error getting recipes:', error);
        res.status(500).json({ error: `Failed to get recipes: ${error.message}` });
    }
});

// GET specific recipe with ingredients
app.get('/api/recipes/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`Received GET /api/recipes/${id} request`);

    try {
        const recipe = await RecipeModel.getRecipeById(id);
        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        console.log(`Found recipe: ${recipe.name} with ${recipe.ingredients ? recipe.ingredients.length : 0} ingredients`);
        res.json(recipe);
    } catch (error) {
        console.error('Error getting recipe:', error);
        res.status(500).json({ error: `Failed to get recipe: ${error.message}` });
    }
});

// DELETE recipe
app.delete('/api/recipes/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`Received DELETE /api/recipes/${id} request`);

    try {
        const result = await RecipeModel.deleteRecipe(id);
        console.log(`Recipe ${id} deleted successfully`);
        res.json({ message: `Recipe ${result.name} deleted successfully`, id: result.id });
    } catch (error) {
        console.error('Error deleting recipe:', error);
        if (error.message === 'Recipe not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: `Failed to delete recipe: ${error.message}` });
    }
});

// POST create recipe
app.post('/api/recipes', async (req, res) => {
    console.log('Received recipe creation request:', req.body);

    try {
        const { name, ingredients, groceryStore } = req.body;

        if (!name || !ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
            return res.status(400).json({ error: 'Recipe name and at least one ingredient are required' });
        }

        console.log('Creating recipe with RecipeModel...');
        const recipe = await RecipeModel.createRecipe(name, ingredients, groceryStore);

        console.log('Recipe created successfully:', recipe.id);
        res.status(201).json(recipe);

    } catch (error) {
        console.error('Error creating recipe:', error);
        res.status(500).json({ error: `Failed to create recipe: ${error.message}` });
    }
});

// Serve the food.html page
app.get('/pages/food.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'food.html'));
});

app.listen(PORT, () => {
    console.log(`Test server running on http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT}/pages/food.html to test`);
});
