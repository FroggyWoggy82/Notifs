/**
 * Fixed Habit Controller
 * This controller uses the fixed habit model
 */

const HabitModelFixed = require('../models/habitModelFixed');

/**
 * Get all habits
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getAllHabits(req, res) {
    try {
        const habits = await HabitModelFixed.getAllHabits();
        res.status(200).json(habits);
    } catch (error) {
        console.error('Error getting all habits:', error);
        res.status(500).json({ error: 'Failed to get habits' });
    }
}

/**
 * Record a habit completion
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function recordCompletion(req, res) {
    const { id } = req.params;
    console.log(`Received POST /api/habits/${id}/complete request`);

    if (!/^[1-9]\d*$/.test(id)) {
        return res.status(400).json({ error: 'Invalid habit ID format' });
    }

    try {
        const result = await HabitModelFixed.recordCompletion(id);
        console.log(`Completion recorded for habit ${id}`);
        res.status(201).json(result);
    } catch (error) {
        console.error(`Error recording completion for habit ${id}:`, error);

        if (error.message.includes('Invalid habit ID format')) {
            return res.status(400).json({ error: error.message });
        }

        if (error.message.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }

        if (error.message.includes('Maximum completions')) {
            return res.status(409).json({
                message: error.message,
                error: 'Maximum completions reached'
            });
        }

        res.status(500).json({
            error: 'Failed to record habit completion',
            message: error.message,
            details: error.detail || 'No additional details available'
        });
    }
}

/**
 * Remove a habit completion
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function removeCompletion(req, res) {
    const { id } = req.params;
    console.log(`Received POST /api/habits/${id}/uncomplete request`);

    if (!/^[1-9]\d*$/.test(id)) {
        return res.status(400).json({ error: 'Invalid habit ID format' });
    }

    try {
        const result = await HabitModelFixed.removeCompletion(id);
        console.log(`Completion removed for habit ${id}`);
        res.status(200).json(result);
    } catch (error) {
        console.error(`Error removing completion for habit ${id}:`, error);

        if (error.message.includes('Invalid habit ID format')) {
            return res.status(400).json({ error: error.message });
        }

        if (error.message.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }

        if (error.message.includes('No completions found')) {
            return res.status(409).json({
                message: error.message,
                error: 'No completions to remove'
            });
        }

        res.status(500).json({
            error: 'Failed to remove habit completion',
            message: error.message,
            details: error.detail || 'No additional details available'
        });
    }
}

module.exports = {
    getAllHabits,
    recordCompletion,
    removeCompletion
};
