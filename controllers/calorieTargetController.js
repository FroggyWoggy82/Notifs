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

            // Explicitly include the protein_target field in the response
            const response = {
                id: target.id,
                user_id: target.user_id,
                daily_target: target.daily_target,
                protein_target: target.protein_target,
                created_at: target.created_at,
                updated_at: target.updated_at
            };

            res.json(response);
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
            const { user_id, daily_target, protein_target } = req.body;
            console.log(`Received POST /api/calorie-targets: user_id=${user_id}, daily_target=${daily_target}, protein_target=${protein_target}`);

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

            // Ensure protein_target is a number if provided
            let proteinTargetNum = null;
            if (protein_target !== undefined && protein_target !== null && protein_target !== '') {
                proteinTargetNum = parseInt(protein_target, 10);
                if (isNaN(proteinTargetNum) || proteinTargetNum < 20 || proteinTargetNum > 500) {
                    return res.status(400).json({ error: 'Invalid protein_target parameter. Must be a number between 20 and 500.' });
                }
                console.log(`Using provided protein target: ${proteinTargetNum}`);
            } else {
                // Default protein target to 15% of daily calories (assuming 4 calories per gram of protein)
                proteinTargetNum = Math.round((dailyTargetNum * 0.15) / 4);
                console.log(`Using calculated default protein target: ${proteinTargetNum}`);
            }

            const savedTarget = await CalorieTarget.saveCalorieTarget(userIdNum, dailyTargetNum, proteinTargetNum);
            res.status(201).json(savedTarget);
        } catch (err) {
            console.error('Error saving calorie target:', err);
            res.status(500).json({ error: `Failed to save calorie target: ${err.message}` });
        }
    }
}

module.exports = CalorieTargetController;
