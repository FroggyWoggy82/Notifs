/**
 * Recipe Controller
 * Handles HTTP requests and responses for recipes
 */

const RecipeModel = require('../models/recipeModel');

/**
 * Get all recipes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getAllRecipes(req, res) {
    console.log("Received GET /api/recipes request");
    try {
        const recipes = await RecipeModel.getAllRecipes();
        console.log("GET /api/recipes response:", recipes);
        res.json(recipes);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({ error: 'Failed to fetch recipes' });
    }
}

/**
 * Get a recipe by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getRecipeById(req, res) {
    const { id } = req.params;
    console.log(`Received GET /api/recipes/${id} request`);
    try {
        const recipe = await RecipeModel.getRecipeById(id);
        console.log(`GET /api/recipes/${id} response:`, recipe);
        res.json(recipe);
    } catch (error) {
        console.error(`Error fetching recipe ${id}:`, error);
        
        if (error.message === 'Recipe not found') {
            return res.status(404).json({ error: error.message });
        }
        
        res.status(500).json({ error: 'Failed to fetch recipe details' });
    }
}

/**
 * Create a new recipe
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function createRecipe(req, res) {
    const { name, ingredients } = req.body;
    console.log(`Received POST /api/recipes: name='${name}'`, ingredients);
    
    try {
        const recipe = await RecipeModel.createRecipe(name, ingredients);
        console.log(`Recipe '${name}' created successfully with ID: ${recipe.id}`);
        res.status(201).json(recipe);
    } catch (error) {
        console.error('Error creating recipe:', error);
        
        if (error.message.includes('required') || 
            error.message.includes('Invalid calorie data') ||
            error.message.includes('Invalid data for ingredient')) {
            return res.status(400).json({ error: error.message });
        }
        
        res.status(500).json({ error: 'Failed to create recipe' });
    }
}

/**
 * Update a recipe's calories
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateRecipeCalories(req, res) {
    const { id } = req.params;
    const { name, targetCalories } = req.body;
    console.log(`Received PUT /api/recipes/${id}: name='${name}', targetCalories=${targetCalories}`);
    
    try {
        const recipe = await RecipeModel.updateRecipeCalories(id, name, targetCalories);
        console.log(`Recipe ${id} calories adjusted successfully to ${targetCalories}`);
        res.json(recipe);
    } catch (error) {
        console.error(`Error updating recipe ${id}:`, error);
        
        if (error.message === 'Invalid targetCalories value' ||
            error.message === 'Cannot scale recipe with zero or negative current calories') {
            return res.status(400).json({ error: error.message });
        }
        
        if (error.message === 'Recipe not found') {
            return res.status(404).json({ error: error.message });
        }
        
        res.status(500).json({ error: 'Failed to update recipe calories' });
    }
}

/**
 * Delete a recipe
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function deleteRecipe(req, res) {
    const { id } = req.params;
    console.log(`Received DELETE /api/recipes/${id}`);
    
    try {
        const result = await RecipeModel.deleteRecipe(id);
        console.log(`Recipe ${id} (${result.name}) deleted successfully`);
        res.json({ 
            message: `Recipe ${result.name} deleted successfully`, 
            id: result.id 
        });
    } catch (error) {
        console.error(`Error deleting recipe ${id}:`, error);
        
        if (error.message === 'Recipe not found') {
            return res.status(404).json({ error: error.message });
        }
        
        res.status(500).json({ error: 'Failed to delete recipe' });
    }
}

module.exports = {
    getAllRecipes,
    getRecipeById,
    createRecipe,
    updateRecipeCalories,
    deleteRecipe
};
