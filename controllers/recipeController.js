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

/**
 * Update a single ingredient in a recipe
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateIngredient(req, res) {
    const { recipeId, ingredientId } = req.params;
    const ingredientData = req.body;

    console.log(`Received PATCH /api/recipes/${recipeId}/ingredients/${ingredientId}:`, ingredientData);
    console.log('package_amount in request:', ingredientData.package_amount, typeof ingredientData.package_amount);

    // Process package_amount specifically
    if (ingredientData.package_amount !== undefined) {
        if (ingredientData.package_amount === null ||
            ingredientData.package_amount === '' ||
            ingredientData.package_amount === '0') {
            ingredientData.package_amount = null;
        } else {
            // Force to number
            ingredientData.package_amount = Number(ingredientData.package_amount);
            // If conversion failed, set to null
            if (isNaN(ingredientData.package_amount)) {
                ingredientData.package_amount = null;
            }
        }
    }

    console.log('Processed package_amount:', ingredientData.package_amount, typeof ingredientData.package_amount);

    try {
        // First, directly update the package_amount in the database
        if (ingredientData.package_amount !== undefined) {
            console.log('Directly updating package_amount in database...');
            try {
                await RecipeModel.updateIngredientPackageAmount(recipeId, ingredientId, ingredientData.package_amount);
                console.log('Package amount updated successfully');
            } catch (err) {
                console.error('Error directly updating package_amount:', err);
            }
        }

        const recipe = await RecipeModel.updateIngredient(recipeId, ingredientId, ingredientData);
        console.log(`Ingredient ${ingredientId} in recipe ${recipeId} updated successfully`);
        res.json(recipe);
    } catch (error) {
        console.error(`Error updating ingredient ${ingredientId} in recipe ${recipeId}:`, error);

        if (error.message.includes('required') ||
            error.message.includes('Invalid value')) {
            return res.status(400).json({ error: error.message });
        }

        if (error.message.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }

        res.status(500).json({ error: 'Failed to update ingredient' });
    }
}

/**
 * Get a single ingredient by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getIngredientById(req, res) {
    const { recipeId, ingredientId } = req.params;

    console.log(`Received GET /api/recipes/${recipeId}/ingredients/${ingredientId}`);

    try {
        const ingredient = await RecipeModel.getIngredientById(recipeId, ingredientId);
        console.log(`Ingredient ${ingredientId} in recipe ${recipeId} retrieved successfully`);
        res.json(ingredient);
    } catch (error) {
        console.error(`Error retrieving ingredient ${ingredientId} in recipe ${recipeId}:`, error);

        if (error.message.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }

        res.status(500).json({ error: 'Failed to retrieve ingredient' });
    }
}

/**
 * Update only the package amount of an ingredient
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateIngredientPackageAmount(req, res) {
    const { recipeId, ingredientId } = req.params;
    const { package_amount } = req.body;

    console.log(`Received PATCH /api/recipes/${recipeId}/ingredients/${ingredientId}/package-amount:`, package_amount);

    // Process package_amount
    let packageAmount = null;
    if (package_amount !== undefined && package_amount !== null && package_amount !== '') {
        // Convert to number
        packageAmount = Number(package_amount);

        // If conversion failed, return error
        if (isNaN(packageAmount)) {
            return res.status(400).json({ error: 'Invalid package_amount value' });
        }
    }

    console.log('Processed package_amount:', packageAmount, typeof packageAmount);

    try {
        const updatedIngredient = await RecipeModel.updateIngredientPackageAmount(recipeId, ingredientId, packageAmount);
        console.log(`Package amount for ingredient ${ingredientId} in recipe ${recipeId} updated successfully to ${packageAmount}`);

        // Get the full recipe to return
        const recipe = await RecipeModel.getRecipeById(recipeId);
        res.json(recipe);
    } catch (error) {
        console.error(`Error updating package amount for ingredient ${ingredientId} in recipe ${recipeId}:`, error);

        if (error.message.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }

        res.status(500).json({ error: 'Failed to update package amount' });
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
