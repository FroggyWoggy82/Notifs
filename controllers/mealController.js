/**
 * Meal Controller
 * Handles HTTP requests for meal operations
 */

const MealModel = require('../models/mealModel');
const CalorieTarget = require('../models/calorieTargetModel');
const NotificationModel = require('../models/notificationModel');

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

        // Schedule bloating notification for 30 minutes after meal submission
        try {
            const notificationTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
            const ingredientNames = mealData.ingredients ?
                mealData.ingredients.map(ing => ing.name).join(', ') :
                mealData.name;

            const notification = NotificationModel.scheduleNotification({
                title: 'Bloating Check-in',
                body: `How are you feeling after eating ${ingredientNames}? Rate your bloating level.`,
                scheduledTime: notificationTime.toISOString(),
                data: {
                    type: 'bloating_rating',
                    mealId: meal.id,
                    mealName: mealData.name,
                    ingredients: ingredientNames
                }
            });

            // Update meal with notification ID
            await MealModel.updateBloatingNotificationStatus(meal.id, notification.id, false);

            console.log(`Scheduled bloating notification for meal ${meal.id} at ${notificationTime}`);
        } catch (notificationError) {
            console.error('Error scheduling bloating notification:', notificationError);
            // Don't fail the meal creation if notification scheduling fails
        }

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

/**
 * Get calendar data for meals and calorie targets
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getCalendarData(req, res) {
    try {
        const userId = req.query.user_id || 1;
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const month = parseInt(req.query.month) || new Date().getMonth() + 1;

        // Get start and end dates for the month
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        // Get meals for the month
        const meals = await MealModel.getMealsByDateRange(userId, startDate, endDate);

        // Get calorie target for the user
        const calorieTarget = await CalorieTarget.getCalorieTarget(userId);

        // Group meals by date and calculate daily totals
        const dailyData = {};

        meals.forEach(meal => {
            const dateKey = meal.date.toISOString().split('T')[0]; // YYYY-MM-DD format

            if (!dailyData[dateKey]) {
                dailyData[dateKey] = {
                    meals: [],
                    totalCalories: 0,
                    calorieTarget: calorieTarget ? calorieTarget.daily_target : null
                };
            }

            dailyData[dateKey].meals.push({
                id: meal.id,
                name: meal.name,
                time: meal.time,
                calories: meal.total_calories || 0
            });

            dailyData[dateKey].totalCalories += meal.total_calories || 0;
        });

        res.json({
            success: true,
            data: {
                year,
                month,
                dailyData,
                calorieTarget: calorieTarget ? calorieTarget.daily_target : null
            }
        });
    } catch (error) {
        console.error('Error in getCalendarData controller:', error);
        res.status(500).json({
            success: false,
            message: 'Server error getting calendar data',
            error: error.message
        });
    }
}

/**
 * Update bloating rating for a meal
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateBloatingRating(req, res) {
    try {
        const { id } = req.params;
        const { bloating_rating } = req.body;
        const userId = req.body.user_id || 1;

        // Validate bloating rating
        if (!bloating_rating || bloating_rating < 1 || bloating_rating > 10) {
            return res.status(400).json({
                success: false,
                message: 'Bloating rating must be between 1 and 10'
            });
        }

        const meal = await MealModel.updateBloatingRating(id, bloating_rating, userId);

        res.json({
            success: true,
            message: 'Bloating rating updated successfully',
            meal
        });
    } catch (error) {
        console.error('Error in updateBloatingRating controller:', error);

        if (error.message.includes('not found') || error.message.includes('access denied')) {
            return res.status(404).json({
                success: false,
                message: 'Meal not found or access denied',
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error updating bloating rating',
            error: error.message
        });
    }
}

module.exports = {
    getAllMeals,
    getMealById,
    createMeal,
    updateMeal,
    deleteMeal,
    getCalendarData,
    updateBloatingRating
};
