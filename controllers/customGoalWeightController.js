const CustomGoalWeight = require('../models/customGoalWeightModel');

class CustomGoalWeightController {
    static async getAll(req, res) {
        try {
            const userId = req.query.user_id || req.query.userId || 1;
            
            // Ensure userId is a number
            const userIdNum = parseInt(userId, 10);
            if (isNaN(userIdNum)) {
                return res.status(400).json({ error: 'Invalid user_id parameter. Must be a number.' });
            }
            
            const customWeights = await CustomGoalWeight.getAll(userIdNum);
            res.json(customWeights);
        } catch (error) {
            console.error('Error getting custom goal weights:', error);
            res.status(500).json({ error: 'Failed to get custom goal weights' });
        }
    }

    static async save(req, res) {
        try {
            const { weekNumber, targetDate, weight } = req.body;
            const userId = req.body.user_id || req.body.userId || 1;
            
            // Validate inputs
            const userIdNum = parseInt(userId, 10);
            const weekNum = parseInt(weekNumber, 10);
            const weightNum = parseFloat(weight);
            
            if (isNaN(userIdNum) || isNaN(weekNum) || isNaN(weightNum)) {
                return res.status(400).json({ 
                    error: 'Invalid parameters. user_id, weekNumber must be integers and weight must be a number.' 
                });
            }
            
            if (weekNum < 0) {
                return res.status(400).json({ error: 'Week number must be non-negative.' });
            }
            
            if (weightNum <= 0) {
                return res.status(400).json({ error: 'Weight must be positive.' });
            }
            
            // Validate date format
            if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
                return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
            }
            
            const savedWeight = await CustomGoalWeight.save(userIdNum, weekNum, targetDate, weightNum);
            res.status(201).json(savedWeight);
        } catch (error) {
            console.error('Error saving custom goal weight:', error);
            res.status(500).json({ error: 'Failed to save custom goal weight' });
        }
    }

    static async saveMultiple(req, res) {
        try {
            const { customWeights } = req.body;
            const userId = req.body.user_id || req.body.userId || 1;
            
            // Validate inputs
            const userIdNum = parseInt(userId, 10);
            if (isNaN(userIdNum)) {
                return res.status(400).json({ error: 'Invalid user_id parameter. Must be a number.' });
            }
            
            if (!Array.isArray(customWeights) || customWeights.length === 0) {
                return res.status(400).json({ error: 'customWeights must be a non-empty array.' });
            }
            
            // Validate each item in the array
            const validatedWeights = [];
            for (const item of customWeights) {
                const { weekNumber, targetDate, weight } = item;
                
                const weekNum = parseInt(weekNumber, 10);
                const weightNum = parseFloat(weight);
                
                if (isNaN(weekNum) || isNaN(weightNum)) {
                    return res.status(400).json({ 
                        error: 'Invalid parameters. weekNumber must be an integer and weight must be a number.' 
                    });
                }
                
                if (weekNum < 0) {
                    return res.status(400).json({ error: 'Week number must be non-negative.' });
                }
                
                if (weightNum <= 0) {
                    return res.status(400).json({ error: 'Weight must be positive.' });
                }
                
                // Validate date format
                if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
                    return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
                }
                
                validatedWeights.push({
                    weekNumber: weekNum,
                    targetDate,
                    weight: weightNum
                });
            }
            
            const savedWeights = await CustomGoalWeight.saveMultiple(userIdNum, validatedWeights);
            res.status(201).json(savedWeights);
        } catch (error) {
            console.error('Error saving multiple custom goal weights:', error);
            res.status(500).json({ error: 'Failed to save custom goal weights' });
        }
    }

    static async delete(req, res) {
        try {
            const { weekNumber } = req.params;
            const userId = req.query.user_id || req.query.userId || 1;
            
            // Validate inputs
            const userIdNum = parseInt(userId, 10);
            const weekNum = parseInt(weekNumber, 10);
            
            if (isNaN(userIdNum) || isNaN(weekNum)) {
                return res.status(400).json({ 
                    error: 'Invalid parameters. user_id and weekNumber must be integers.' 
                });
            }
            
            const deletedWeight = await CustomGoalWeight.delete(userIdNum, weekNum);
            
            if (!deletedWeight) {
                return res.status(404).json({ error: 'Custom goal weight not found' });
            }
            
            res.json(deletedWeight);
        } catch (error) {
            console.error('Error deleting custom goal weight:', error);
            res.status(500).json({ error: 'Failed to delete custom goal weight' });
        }
    }

    static async deleteAll(req, res) {
        try {
            const userId = req.query.user_id || req.query.userId || 1;
            
            // Validate inputs
            const userIdNum = parseInt(userId, 10);
            if (isNaN(userIdNum)) {
                return res.status(400).json({ error: 'Invalid user_id parameter. Must be a number.' });
            }
            
            const deletedWeights = await CustomGoalWeight.deleteAll(userIdNum);
            res.json(deletedWeights);
        } catch (error) {
            console.error('Error deleting all custom goal weights:', error);
            res.status(500).json({ error: 'Failed to delete custom goal weights' });
        }
    }
}

module.exports = CustomGoalWeightController;
