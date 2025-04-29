/**
 * Fix for the habit controller
 * This file contains a patched version of the recordCompletion function
 * that properly handles habits with very high completions_per_day values
 */

const HabitModelFix = require('../models/habitModelFix');

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
        const result = await HabitModelFix.recordCompletion(id);
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

        // Check for unique constraint violation if user clicks very fast
        if (error.code === '23505') { // PostgreSQL unique constraint violation
            return res.status(409).json({
                message: 'Completion already recorded for today',
                error: error.message
            });
        }

        res.status(500).json({
            error: 'Failed to record habit completion',
            message: error.message,
            details: error.detail || 'No additional details available'
        });
    }
}

module.exports = {
    recordCompletion
};
