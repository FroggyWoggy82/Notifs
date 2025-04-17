const CalorieTarget = require('../models/calorieTargetModel');

/**
 * Calorie Target Controller
 * Handles request processing for calorie target endpoints
 */
class CalorieTargetController {
    /**
     * Get calorie target for a user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getCalorieTarget(req, res) {
        try {
            const userId = req.params.userId;
            console.log(`Received GET /api/calorie-targets/${userId}`);

            // Ensure userId is a number
            const userIdNum = parseInt(userId, 10);
            if (isNaN(userIdNum)) {
                return res.status(400).json({ error: 'Invalid user ID. Must be a number.' });
            }

            const target = await CalorieTarget.getCalorieTarget(userIdNum);
            if (!target) {
                return res.status(404).json({ error: 'No calorie target found for this user.' });
            }

            res.json(target);
        } catch (err) {
            console.error('Error fetching calorie target:', err);
            res.status(500).json({ error: `Failed to fetch calorie target: ${err.message}` });
        }
    }

    /**
     * Save calorie target for a user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async saveCalorieTarget(req, res) {
        try {
            const { user_id, daily_target } = req.body;
            console.log(`Received POST /api/calorie-targets: user_id=${user_id}, daily_target=${daily_target}`);

            // Ensure user_id is a number
            const userIdNum = parseInt(user_id, 10);
            if (isNaN(userIdNum)) {
                return res.status(400).json({ error: 'Invalid user ID. Must be a number.' });
            }

            // Ensure daily_target is a number
            const dailyTargetNum = parseInt(daily_target, 10);
            if (isNaN(dailyTargetNum) || dailyTargetNum < 500 || dailyTargetNum > 10000) {
                return res.status(400).json({ error: 'Invalid daily target. Must be a number between 500 and 10000.' });
            }

            const savedTarget = await CalorieTarget.saveCalorieTarget(userIdNum, dailyTargetNum);
            res.status(201).json(savedTarget);
        } catch (err) {
            console.error('Error saving calorie target:', err);
            res.status(500).json({ error: `Failed to save calorie target: ${err.message}` });
        }
    }
}

module.exports = CalorieTargetController;
