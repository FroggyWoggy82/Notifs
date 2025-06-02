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
    console.log("Query parameters:", req.query);

    try {
        console.log("Calling RecipeModel.getAllRecipes...");
        const recipes = await RecipeModel.getAllRecipes();
        console.log(`GET /api/recipes response: ${recipes.length} recipes found`);

        // Set cache control headers to prevent caching
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        // Return an empty array if recipes is null or undefined
        if (!recipes) {
            console.log("No recipes found, returning empty array");
            return res.json({
                success: true,
                recipes: [],
                message: 'No recipes found'
            });
        }

        // Return recipes in the expected format for meal submission
        res.json({
            success: true,
            recipes: recipes,
            message: `Found ${recipes.length} recipes`
        });
    } catch (error) {
        console.error('Error fetching recipes:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            error: `Failed to fetch recipes: ${error.message}`,
            message: 'Error loading recipes. Please refresh the page.'
        });
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

        // Set cache control headers to prevent caching
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        // Return recipe in the expected format for meal submission
        res.json({
            success: true,
            recipe: recipe,
            message: `Recipe ${recipe.name} loaded successfully`
        });
    } catch (error) {
        console.error(`Error fetching recipe ${id}:`, error);

        if (error.message === 'Recipe not found') {
            return res.status(404).json({
                success: false,
                error: error.message,
                message: 'Recipe not found'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to fetch recipe details',
            message: 'Error loading recipe details. Please try again.'
        });
    }
}

/**
 * Create a new recipe
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function createRecipe(req, res) {
    const { name, ingredients, groceryStore } = req.body;
    console.log(`Received POST /api/recipes: name='${name}', groceryStore='${groceryStore || 'none'}'`, ingredients);

    try {
        const recipe = await RecipeModel.createRecipe(name, ingredients, groceryStore);
        console.log(`Recipe '${name}' created successfully with ID: ${recipe.id}`);

        // Set cache control headers to prevent caching
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        // Return a more detailed response
        res.status(201).json({
            ...recipe,
            message: `Recipe '${name}' created successfully`,
            success: true,
            timestamp: new Date().toISOString()
        });
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
 * Update a recipe's calories and/or name
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateRecipeCalories(req, res) {
    const { id } = req.params;
    const { name, targetCalories } = req.body;
    console.log(`Received PUT /api/recipes/${id}: name='${name}', targetCalories=${targetCalories}`);

    try {
        // If only updating the name (no targetCalories), get the current recipe first
        if (name && (targetCalories === undefined || targetCalories === null)) {
            console.log(`Only name provided, fetching current recipe to maintain calories`);
            try {
                const currentRecipe = await RecipeModel.getRecipeById(id);
                const currentCalories = currentRecipe.total_calories;
                console.log(`Using current calories: ${currentCalories}`);

                const recipe = await RecipeModel.updateRecipeCalories(id, name, currentCalories);
                console.log(`Recipe ${id} name updated to '${name}' while maintaining calories`);
                res.json(recipe);
            } catch (error) {
                throw error;
            }
        } else {
            // Normal update with targetCalories
            const recipe = await RecipeModel.updateRecipeCalories(id, name, targetCalories);
            console.log(`Recipe ${id} updated: name='${name}', calories=${targetCalories}`);
            res.json(recipe);
        }
    } catch (error) {
        console.error(`Error updating recipe ${id}:`, error);

        if (error.message === 'Invalid targetCalories value' ||
            error.message === 'Cannot scale recipe with zero or negative current calories') {
            return res.status(400).json({ error: error.message });
        }

        if (error.message === 'Recipe not found') {
            return res.status(404).json({ error: error.message });
        }

        res.status(500).json({ error: 'Failed to update recipe' });
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
    console.log('trans fat in request:', ingredientData.trans_fat, typeof ingredientData.trans_fat);
    // CRITICAL FIX: Log both naming conventions
    console.log('omega3 in request:', ingredientData.omega3, typeof ingredientData.omega3);
    console.log('omega_3 in request:', ingredientData.omega_3, typeof ingredientData.omega_3);
    console.log('omega6 in request:', ingredientData.omega6, typeof ingredientData.omega6);
    console.log('omega_6 in request:', ingredientData.omega_6, typeof ingredientData.omega_6);

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

        // Process the trans_fat value
        if (ingredientData.trans_fat !== undefined) {
            console.log('Processing trans_fat value:', ingredientData.trans_fat, typeof ingredientData.trans_fat);

            // Ensure it's a number
            if (typeof ingredientData.trans_fat === 'string') {
                ingredientData.trans_fat = parseFloat(ingredientData.trans_fat);
                if (isNaN(ingredientData.trans_fat)) {
                    ingredientData.trans_fat = 0;
                }
            }

            console.log('Processed trans_fat value:', ingredientData.trans_fat, typeof ingredientData.trans_fat);
        }

        // Process the omega_3 value
        if (ingredientData.omega_3 !== undefined) {
            console.log('Processing omega_3 value:', ingredientData.omega_3, typeof ingredientData.omega_3);

            // Ensure it's a number
            if (typeof ingredientData.omega_3 === 'string') {
                ingredientData.omega_3 = parseFloat(ingredientData.omega_3);
                if (isNaN(ingredientData.omega_3)) {
                    ingredientData.omega_3 = 0;
                }
            }

            console.log('Processed omega_3 value:', ingredientData.omega_3, typeof ingredientData.omega_3);
        }

        // Process the omega_6 value
        if (ingredientData.omega_6 !== undefined) {
            console.log('Processing omega_6 value:', ingredientData.omega_6, typeof ingredientData.omega_6);

            // Ensure it's a number
            if (typeof ingredientData.omega_6 === 'string') {
                ingredientData.omega_6 = parseFloat(ingredientData.omega_6);
                if (isNaN(ingredientData.omega_6)) {
                    ingredientData.omega_6 = 0;
                }
            }

            console.log('Processed omega_6 value:', ingredientData.omega_6, typeof ingredientData.omega_6);
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

/**
 * Update only the omega3 and omega6 values of an ingredient
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateIngredientOmegaValues(req, res) {
    const { recipeId, ingredientId } = req.params;
    // CRITICAL FIX: Check for both naming conventions
    const { omega3, omega_3, omega6, omega_6 } = req.body;

    console.log(`Received PATCH /api/recipes/${recipeId}/ingredients/${ingredientId}/omega-values:`, req.body);
    console.log('omega3 in request:', omega3, typeof omega3);
    console.log('omega_3 in request:', omega_3, typeof omega_3);
    console.log('omega6 in request:', omega6, typeof omega6);
    console.log('omega_6 in request:', omega_6, typeof omega_6);

    // Process omega3 (prioritize omega3 over omega_3)
    let omega3Value = null;
    if (omega3 !== undefined || omega_3 !== undefined) {
        const omegaValue = omega3 !== undefined ? omega3 : omega_3;
        if (omegaValue === null || omegaValue === '') {
            omega3Value = 0;
        } else {
            // Convert to number
            omega3Value = Number(omegaValue);
            // If conversion failed, set to 0
            if (isNaN(omega3Value)) {
                omega3Value = 0;
            }
        }
    }

    // Process omega6 (prioritize omega6 over omega_6)
    let omega6Value = null;
    if (omega6 !== undefined || omega_6 !== undefined) {
        const omegaValue = omega6 !== undefined ? omega6 : omega_6;
        if (omegaValue === null || omegaValue === '') {
            omega6Value = 0;
        } else {
            // Convert to number
            omega6Value = Number(omegaValue);
            // If conversion failed, set to 0
            if (isNaN(omega6Value)) {
                omega6Value = 0;
            }
        }
    }

    // CRITICAL FIX: Use omega3 and omega6 (without underscores) to match database column names
    console.log('Processed omega3:', omega3Value, typeof omega3Value);
    console.log('Processed omega6:', omega6Value, typeof omega6Value);

    try {
        // Create an update object with the omega values
        const updateData = {};

        // Only include defined values
        if (omega3Value !== null) {
            // CRITICAL FIX: Use omega3 (without underscore) to match database column name
            updateData.omega3 = omega3Value;
        }

        if (omega6Value !== null) {
            // CRITICAL FIX: Use omega6 (without underscore) to match database column name
            updateData.omega6 = omega6Value;
        }

        // Skip if no values to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No omega values provided' });
        }

        console.log('Update data for omega values:', updateData);

        // Use the RecipeModel to update the ingredient
        const recipe = await RecipeModel.updateIngredientOmegaValues(recipeId, ingredientId, updateData);
        console.log(`Omega values for ingredient ${ingredientId} in recipe ${recipeId} updated successfully`);
        res.json(recipe);
    } catch (error) {
        console.error(`Error updating omega values for ingredient ${ingredientId} in recipe ${recipeId}:`, error);

        if (error.message.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }

        res.status(500).json({ error: 'Failed to update omega values' });
    }
}

/**
 * Add a new ingredient to an existing recipe
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function addIngredientToRecipe(req, res) {
    const { recipeId } = req.params;
    const ingredientData = req.body;

    console.log(`Received POST /api/recipes/${recipeId}/ingredients:`, ingredientData);

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

    // Process numeric fields to ensure they're numbers
    const numericFields = ['calories', 'amount', 'protein', 'fats', 'carbohydrates', 'price'];
    numericFields.forEach(field => {
        if (ingredientData[field] !== undefined) {
            if (typeof ingredientData[field] === 'string') {
                ingredientData[field] = parseFloat(ingredientData[field]);
                if (isNaN(ingredientData[field])) {
                    ingredientData[field] = 0;
                }
            }
        }
    });

    try {
        console.log('DEBUG: About to add ingredient to recipe with data:', JSON.stringify(ingredientData, null, 2));
        const updatedRecipe = await RecipeModel.addIngredientToRecipe(recipeId, ingredientData);
        console.log(`Ingredient added to recipe ${recipeId} successfully`);
        console.log('DEBUG: Updated recipe after adding ingredient:', JSON.stringify(updatedRecipe, null, 2));

        // Set cache control headers to prevent caching
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        res.status(201).json({
            ...updatedRecipe,
            message: `Ingredient '${ingredientData.name}' added successfully to recipe`,
            success: true,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(`Error adding ingredient to recipe ${recipeId}:`, error);

        if (error.message.includes('required') ||
            error.message.includes('Invalid data for ingredient')) {
            return res.status(400).json({ error: error.message });
        }

        if (error.message === 'Recipe not found') {
            return res.status(404).json({ error: error.message });
        }

        res.status(500).json({ error: 'Failed to add ingredient to recipe' });
    }
}

/**
 * Delete an ingredient from a recipe
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function deleteIngredientFromRecipe(req, res) {
    const { recipeId, ingredientId } = req.params;
    console.log(`Received DELETE /api/recipes/${recipeId}/ingredients/${ingredientId}`);

    try {
        const recipe = await RecipeModel.deleteIngredientFromRecipe(recipeId, ingredientId);
        console.log(`Ingredient ${ingredientId} deleted from recipe ${recipeId} successfully`);

        // Set cache control headers to prevent caching
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        res.json({
            ...recipe,
            message: `Ingredient deleted successfully from recipe`,
            success: true,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(`Error deleting ingredient ${ingredientId} from recipe ${recipeId}:`, error);

        if (error.message.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }

        res.status(500).json({ error: 'Failed to delete ingredient from recipe' });
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
    updateIngredientPackageAmount,
    updateIngredientOmegaValues,
    addIngredientToRecipe,
    deleteIngredientFromRecipe
};
