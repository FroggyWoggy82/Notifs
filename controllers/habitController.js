/**
 * Habit Controller
 * Handles HTTP requests and responses for habits
 */

const HabitModel = require('../models/habitModel');

/**
 * Get all habits
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getAllHabits(req, res) {
    console.log("Received GET /api/habits request");
    try {
        const habits = await HabitModel.getAllHabits();
        res.json(habits);
    } catch (error) {
        console.error('Error fetching habits:', error);
        res.status(500).json({ error: 'Failed to fetch habits' });
    }
}

/**
 * Create a new habit
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function createHabit(req, res) {
    const { title, frequency, completions_per_day } = req.body;
    console.log(`Received POST /api/habits: title='${title}', frequency='${frequency}', completions='${completions_per_day}'`);

    try {
        const habit = await HabitModel.createHabit(title, frequency, completions_per_day);
        console.log(`Habit created successfully with ID: ${habit.id}`);
        res.status(201).json(habit);
    } catch (error) {
        console.error('Error creating habit:', error);

        if (error.message.includes('cannot be empty') ||
            error.message.includes('Invalid frequency')) {
            return res.status(400).json({ error: error.message });
        }

        res.status(500).json({ error: 'Failed to create habit' });
    }
}

/**
 * Update a habit
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateHabit(req, res) {
    const { id } = req.params;
    const { title, frequency, completions_per_day } = req.body;
    console.log(`Received PUT /api/habits/${id}: title='${title}', frequency='${frequency}', completions='${completions_per_day}'`);

    try {
        const habit = await HabitModel.updateHabit(id, title, frequency, completions_per_day);
        console.log(`Habit ${id} updated successfully.`);
        res.status(200).json(habit);
    } catch (error) {
        console.error(`Error updating habit ${id}:`, error);

        if (error.message.includes('Invalid habit ID format') ||
            error.message.includes('cannot be empty') ||
            error.message.includes('Invalid frequency')) {
            return res.status(400).json({ error: error.message });
        }

        if (error.message.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }

        res.status(500).json({ error: 'Failed to update habit' });
    }
}

/**
 * Delete a habit
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function deleteHabit(req, res) {
    const { id } = req.params;
    console.log(`Received DELETE /api/habits/${id}`);

    try {
        const result = await HabitModel.deleteHabit(id);
        console.log(`Habit ${id} deleted successfully.`);
        res.status(200).json({
            message: `Habit ${id} deleted successfully`,
            id: result.id
        });
    } catch (error) {
        console.error(`Error deleting habit ${id}:`, error);

        if (error.message.includes('Invalid habit ID format')) {
            return res.status(400).json({ error: error.message });
        }

        if (error.message.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }

        res.status(500).json({ error: 'Failed to delete habit' });
    }
}

/**
 * Record a habit completion
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function recordCompletion(req, res) {
    const { id } = req.params;
    console.log(`Received POST /api/habits/${id}/complete`);

    try {
        const result = await HabitModel.recordCompletion(id);
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
            error: 'Failed to record completion',
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

    if (!/^[1-9]\d*$/.test(id)) {
        return res.status(400).json({ error: 'Invalid habit ID format' });
    }

    try {
        const result = await HabitModel.removeCompletion(id);
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
            error: 'Failed to remove completion',
            message: error.message,
            details: error.detail || 'No additional details available'
        });
    }
}

module.exports = {
    getAllHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    recordCompletion,
    removeCompletion
};
