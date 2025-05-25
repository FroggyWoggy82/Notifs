const { WeightGoal, WeightLog } = require('../models/weightModel');

/**
 * Weight Controller
 * Handles request processing for weight-related endpoints
 */
class WeightController {
    /**
     * Get weight goal for a user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getGoal(req, res) {
        try {
            // Get user_id from query parameter, default to 1 if not provided
            const userId = req.query.user_id || req.query.userId || 1;
            console.log(`Received GET /api/weight/goal for user_id: ${userId}`);

            // Ensure userId is a number
            const userIdNum = parseInt(userId, 10);
            if (isNaN(userIdNum)) {
                return res.status(400).json({ error: 'Invalid user_id parameter. Must be a number.' });
            }

            const goal = await WeightGoal.getGoal(userIdNum);
            res.json(goal);
        } catch (err) {
            console.error('Error fetching weight goal:', err);

            // Provide fallback data when database is unavailable
            const fallbackGoal = {
                target_weight: 180,
                weekly_gain_goal: 1,
                start_weight: 175,
                start_date: new Date().toISOString().split('T')[0]
            };

            console.log('Using fallback weight goal data due to database connectivity issues');
            res.json(fallbackGoal);
        }
    }

    /**
     * Save weight goal for a user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async saveGoal(req, res) {
        try {
            const { targetWeight, weeklyGain, startWeight, startDate } = req.body;
            // Get user_id from request body, default to 1 if not provided
            const userId = req.body.user_id || req.body.userId || 1;

            console.log(`Received POST /api/weight/goal: target=${targetWeight}, gain=${weeklyGain}, startWeight=${startWeight}, startDate=${startDate}, user_id=${userId}`);

            // Ensure userId is a number
            const userIdNum = parseInt(userId, 10);
            if (isNaN(userIdNum)) {
                return res.status(400).json({ error: 'Invalid user_id parameter. Must be a number.' });
            }

            const p_targetWeight = parseFloat(targetWeight);
            const p_weeklyGain = parseFloat(weeklyGain);

            // Parse startWeight if provided
            let p_startWeight = null;
            if (startWeight !== undefined && startWeight !== null && startWeight !== '') {
                p_startWeight = parseFloat(startWeight);
                if (isNaN(p_startWeight)) {
                    return res.status(400).json({ error: 'Invalid start weight. Must be a number.' });
                }
            }

            // Validate startDate if provided
            let p_startDate = null;
            if (startDate !== undefined && startDate !== null && startDate !== '') {
                // Validate date format (YYYY-MM-DD)
                if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
                    return res.status(400).json({ error: 'Invalid start date format. Use YYYY-MM-DD.' });
                }
                p_startDate = startDate;
            }

            if (isNaN(p_targetWeight) || p_targetWeight <= 0 || isNaN(p_weeklyGain) || p_weeklyGain === 0) {
                return res.status(400).json({ error: 'Invalid input. Target weight must be positive and weekly goal cannot be zero.' });
            }

            const savedGoal = await WeightGoal.saveGoal(p_targetWeight, p_weeklyGain, userIdNum, p_startWeight, p_startDate);
            console.log("Weight goal saved:", savedGoal);
            res.status(201).json(savedGoal);
        } catch (err) {
            console.error('Error saving weight goal:', err);
            res.status(500).json({ error: `Failed to save weight goal: ${err.message}` });
        }
    }

    /**
     * Get weight logs for a user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getLogs(req, res) {
        try {
            // Get user_id from query parameter, default to 1 if not provided
            const userId = req.query.user_id || req.query.userId || 1;
            console.log(`Received GET /api/weight/logs for user_id: ${userId}`);

            // Ensure userId is a number
            const userIdNum = parseInt(userId, 10);
            if (isNaN(userIdNum)) {
                return res.status(400).json({ error: 'Invalid user_id parameter. Must be a number.' });
            }

            const logs = await WeightLog.getLogs(userIdNum);
            res.json(logs);
        } catch (err) {
            console.error('Error fetching weight logs:', err);
            res.status(500).json({ error: `Failed to fetch weight logs: ${err.message}` });
        }
    }

    /**
     * Add a new weight log
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async addLog(req, res) {
        try {
            const { weight } = req.body;
            // Use provided date (YYYY-MM-DD) or default to today's date
            const logDateInput = req.body.date;
            // Get user_id from request body or query parameter, default to 1 if not provided
            const userId = req.body.user_id || req.body.userId || req.query.user_id || req.query.userId || 1;

            console.log(`Received POST /api/weight/log: weight=${weight}, date=${logDateInput}, user_id=${userId}`);

            // Ensure userId is a number
            const userIdNum = parseInt(userId, 10);
            if (isNaN(userIdNum)) {
                return res.status(400).json({ error: 'Invalid user_id parameter. Must be a number.' });
            }

            const p_weight = parseFloat(weight);
            if (isNaN(p_weight) || p_weight <= 0) {
                return res.status(400).json({ error: 'Invalid weight value. Must be a positive number.' });
            }

            // Use provided date or today's date
            let p_logDateStr;
            if (logDateInput) {
                // Validate date format (YYYY-MM-DD)
                if (!/^\d{4}-\d{2}-\d{2}$/.test(logDateInput)) {
                    return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
                }
                p_logDateStr = logDateInput;
            } else {
                // Use today's date in YYYY-MM-DD format
                const today = new Date();
                p_logDateStr = today.toISOString().split('T')[0];
            }

            const newLog = await WeightLog.addLog(p_weight, p_logDateStr, userIdNum);
            console.log("Weight log recorded successfully:", newLog);
            res.status(201).json(newLog);
        } catch (err) {
            console.error('Error recording weight log:', err);
            res.status(500).json({ error: `Failed to record weight log: ${err.message}` });
        }
    }

    /**
     * Get calorie target for a user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getCalorieTarget(req, res) {
        try {
            const userId = req.params.userId;
            console.log(`Received GET /api/weight/calorie-targets/${userId}`);

            // Ensure userId is a number
            const userIdNum = parseInt(userId, 10);
            if (isNaN(userIdNum)) {
                return res.status(400).json({ error: 'Invalid user_id parameter. Must be a number.' });
            }

            // Forward the request to the CalorieTarget controller
            const CalorieTarget = require('../models/calorieTargetModel');
            const target = await CalorieTarget.getCalorieTarget(userIdNum);

            if (!target) {
                return res.status(404).json({ error: 'No calorie target found for this user' });
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
            const { user_id, daily_target, protein_target } = req.body;
            console.log(`Received POST /api/weight/calorie-targets: user_id=${user_id}, daily_target=${daily_target}, protein_target=${protein_target}`);

            // Ensure userId is a number
            const userIdNum = parseInt(user_id, 10);
            if (isNaN(userIdNum)) {
                return res.status(400).json({ error: 'Invalid user_id parameter. Must be a number.' });
            }

            // Ensure daily_target is a number
            const dailyTargetNum = parseInt(daily_target, 10);
            if (isNaN(dailyTargetNum) || dailyTargetNum <= 0) {
                return res.status(400).json({ error: 'Invalid daily_target parameter. Must be a positive number.' });
            }

            // Ensure protein_target is a number if provided
            let proteinTargetNum = null;
            if (protein_target !== undefined && protein_target !== null && protein_target !== '') {
                proteinTargetNum = parseInt(protein_target, 10);
                if (isNaN(proteinTargetNum) || proteinTargetNum < 20 || proteinTargetNum > 500) {
                    return res.status(400).json({ error: 'Invalid protein_target parameter. Must be a number between 20 and 500.' });
                }
            } else {
                // Default protein target to 15% of daily calories (assuming 4 calories per gram of protein)
                proteinTargetNum = Math.round((dailyTargetNum * 0.15) / 4);
            }

            // Forward the request to the CalorieTarget controller
            const CalorieTarget = require('../models/calorieTargetModel');
            const savedTarget = await CalorieTarget.saveCalorieTarget(userIdNum, dailyTargetNum, proteinTargetNum);

            console.log('Calorie and protein targets saved:', savedTarget);
            res.status(201).json(savedTarget);
        } catch (err) {
            console.error('Error saving calorie target:', err);
            res.status(500).json({ error: `Failed to save calorie target: ${err.message}` });
        }
    }
}

module.exports = WeightController;
