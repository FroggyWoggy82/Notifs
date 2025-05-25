/**
 * Meal Controller
 * Handles HTTP requests for meal operations
 */

const MealModel = require('../models/mealModel');

/**
 * Get all meals
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getAllMeals(req, res) {
    try {
        const userId = req.query.user_id || 1; // Default to user 1 if not specified
        const meals = await MealModel.getAllMeals(userId);
        res.json({
            success: true,
            meals
        });
    } catch (error) {
        console.error('Error in getAllMeals controller:', error);
        res.status(500).json({
            success: false,
            message: 'Server error getting meals',
            error: error.message
        });
    }
}

/**
 * Get a meal by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getMealById(req, res) {
    try {
        const { id } = req.params;
        const userId = req.query.user_id || 1;

        const meal = await MealModel.getMealById(id, userId);
        res.json({
            success: true,
            meal
        });
    } catch (error) {
        console.error('Error in getMealById controller:', error);

        if (error.message === 'Meal not found') {
            return res.status(404).json({
                success: false,
                message: 'Meal not found',
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error getting meal',
            error: error.message
        });
    }
}

/**
 * Create a new meal
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function createMeal(req, res) {
    try {
        const mealData = req.body;
        const userId = req.body.user_id || 1;

        // Parse ingredients if they come as a JSON string (from FormData)
        if (typeof mealData.ingredients === 'string') {
            try {
                mealData.ingredients = JSON.parse(mealData.ingredients);
            } catch (parseError) {
                console.error('Error parsing ingredients JSON:', parseError);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid ingredients format',
                    error: parseError.message
                });
            }
        }

        // Handle uploaded photo
        if (req.file) {
            mealData.photo_url = `/uploads/meal_photos/${req.file.filename}`;
        }

        const meal = await MealModel.createMeal(mealData, userId);
        res.status(201).json({
            success: true,
            message: 'Meal created successfully',
            meal
        });
    } catch (error) {
        console.error('Error in createMeal controller:', error);

        if (error.message.includes('required')) {
            return res.status(400).json({
                success: false,
                message: 'Invalid meal data',
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error creating meal',
            error: error.message
        });
    }
}

/**
 * Update a meal
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateMeal(req, res) {
    try {
        const { id } = req.params;
        const mealData = req.body;
        const userId = req.body.user_id || 1;

        const meal = await MealModel.updateMeal(id, mealData, userId);
        res.json({
            success: true,
            message: 'Meal updated successfully',
            meal
        });
    } catch (error) {
        console.error('Error in updateMeal controller:', error);

        if (error.message.includes('required')) {
            return res.status(400).json({
                success: false,
                message: 'Invalid meal data',
                error: error.message
            });
        }

        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                message: 'Meal not found',
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error updating meal',
            error: error.message
        });
    }
}

/**
 * Delete a meal
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function deleteMeal(req, res) {
    try {
        const { id } = req.params;
        const userId = req.query.user_id || 1;

        const result = await MealModel.deleteMeal(id, userId);
        res.json({
            success: true,
            message: 'Meal deleted successfully',
            meal: result
        });
    } catch (error) {
        console.error('Error in deleteMeal controller:', error);

        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                message: 'Meal not found',
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error deleting meal',
            error: error.message
        });
    }
}

module.exports = {
    getAllMeals,
    getMealById,
    createMeal,
    updateMeal,
    deleteMeal
};
