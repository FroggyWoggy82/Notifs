const MicronutrientGoals = require('../models/micronutrientGoalsModel');

/**
 * Micronutrient Goals Controller
 * Handles request processing for micronutrient goals endpoints
 */
class MicronutrientGoalsController {
    /**
     * Get micronutrient goals for a user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getMicronutrientGoals(req, res) {
        try {
            const userId = req.params.userId;
            console.log(`Received GET /api/micronutrient-goals/${userId}`);

            // Ensure userId is a number
            const userIdNum = parseInt(userId, 10);
            if (isNaN(userIdNum)) {
                return res.status(400).json({ error: 'Invalid user ID. Must be a number.' });
            }

            const goals = await MicronutrientGoals.getMicronutrientGoals(userIdNum);
            
            if (!goals) {
                // Return default goals if none exist
                const defaultGoals = MicronutrientGoals.getDefaultGoals();
                return res.json({
                    user_id: userIdNum,
                    ...defaultGoals,
                    isDefault: true
                });
            }

            res.json(goals);
        } catch (error) {
            console.error('Error fetching micronutrient goals:', error);
            res.status(500).json({ 
                error: 'Failed to fetch micronutrient goals',
                message: error.message 
            });
        }
    }

    /**
     * Save micronutrient goals for a user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async saveMicronutrientGoals(req, res) {
        try {
            const { user_id, ...goals } = req.body;
            console.log(`Received POST /api/micronutrient-goals: user_id=${user_id}`);

            // Ensure user_id is a number
            const userIdNum = parseInt(user_id, 10);
            if (isNaN(userIdNum)) {
                return res.status(400).json({ error: 'Invalid user ID. Must be a number.' });
            }

            // Validate that at least one goal is provided
            const goalKeys = Object.keys(goals);
            if (goalKeys.length === 0) {
                return res.status(400).json({ error: 'At least one micronutrient goal must be provided.' });
            }

            // Validate numeric values
            for (const [key, value] of Object.entries(goals)) {
                if (value !== null && value !== undefined && value !== '') {
                    const numValue = parseFloat(value);
                    if (isNaN(numValue) || numValue < 0) {
                        return res.status(400).json({ 
                            error: `Invalid value for ${key}. Must be a positive number.` 
                        });
                    }
                    // Convert to number for storage
                    goals[key] = numValue;
                } else {
                    // Convert empty strings to null
                    goals[key] = null;
                }
            }

            const savedGoals = await MicronutrientGoals.saveMicronutrientGoals(userIdNum, goals);
            
            res.status(200).json({
                message: 'Micronutrient goals saved successfully',
                goals: savedGoals
            });
        } catch (error) {
            console.error('Error saving micronutrient goals:', error);
            res.status(500).json({ 
                error: 'Failed to save micronutrient goals',
                message: error.message 
            });
        }
    }

    /**
     * Get default micronutrient goals
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getDefaultGoals(req, res) {
        try {
            console.log('Received GET /api/micronutrient-goals/defaults');
            
            const defaultGoals = MicronutrientGoals.getDefaultGoals();
            
            res.json({
                message: 'Default micronutrient goals (RDA values for adults)',
                goals: defaultGoals
            });
        } catch (error) {
            console.error('Error fetching default micronutrient goals:', error);
            res.status(500).json({ 
                error: 'Failed to fetch default micronutrient goals',
                message: error.message 
            });
        }
    }
}

module.exports = MicronutrientGoalsController;
