const express = require('express');
const HabitModel = require('../models/habitModel'); // Import the habit model

const router = express.Router();

/**
 * @swagger
 * /api/habits:
 *   get:
 *     summary: Get all habits
 *     tags: [Habits]
 *     responses:
 *       200:
 *         description: A list of habits
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
    console.log("Received GET /api/habits request");

    try {
        const habits = await HabitModel.getAllHabits();
        res.status(200).json(habits);
    } catch (err) {
        console.error('Error fetching habits:', err);
        res.status(500).json({ error: 'Failed to fetch habits' });
    }
});

/**
 * @swagger
 * /api/habits:
 *   post:
 *     summary: Create a new habit
 *     tags: [Habits]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               frequency:
 *                 type: string
 *                 enum: [daily, weekly, monthly]
 *                 default: daily
 *               completions_per_day:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *     responses:
 *       201:
 *         description: Habit created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
    console.log("Received POST /api/habits request", req.body);

    try {
        const habit = await HabitModel.createHabit(req.body);
        res.status(201).json(habit);
    } catch (err) {
        console.error('Error creating habit:', err);

        if (err.message.includes('Title is required')) {
            return res.status(400).json({ error: err.message });
        }

        res.status(500).json({ error: 'Failed to create habit' });
    }
});

/**
 * @swagger
 * /api/habits/{id}:
 *   put:
 *     summary: Update a habit
 *     tags: [Habits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The habit ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               frequency:
 *                 type: string
 *                 enum: [daily, weekly, monthly]
 *               completions_per_day:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Habit updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Habit not found
 *       500:
 *         description: Server error
 */
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`Received PUT /api/habits/${id} request`, req.body);

    try {
        const habit = await HabitModel.updateHabit(id, req.body);
        res.status(200).json(habit);
    } catch (err) {
        console.error(`Error updating habit ${id}:`, err);

        if (err.message.includes('Invalid habit ID format')) {
            return res.status(400).json({ error: err.message });
        }

        if (err.message.includes('not found')) {
            return res.status(404).json({ error: err.message });
        }

        res.status(500).json({ error: 'Failed to update habit' });
    }
});

/**
 * @swagger
 * /api/habits/{id}:
 *   delete:
 *     summary: Delete a habit
 *     tags: [Habits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The habit ID
 *     responses:
 *       200:
 *         description: Habit deleted successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Habit not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`Received DELETE /api/habits/${id} request`);

    try {
        const result = await HabitModel.deleteHabit(id);
        res.status(200).json({ message: `Habit ${id} deleted successfully`, id: parseInt(id) });
    } catch (err) {
        console.error(`Error deleting habit ${id}:`, err);

        if (err.message.includes('Invalid habit ID format')) {
            return res.status(400).json({ error: err.message });
        }

        if (err.message.includes('not found')) {
            return res.status(404).json({ error: err.message });
        }

        res.status(500).json({ error: 'Failed to delete habit' });
    }
});

/**
 * @swagger
 * /api/habits/{id}/complete:
 *   post:
 *     summary: Record a habit completion
 *     tags: [Habits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The habit ID
 *     responses:
 *       200:
 *         description: Completion recorded successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Habit not found
 *       409:
 *         description: Daily completion target already met
 *       500:
 *         description: Server error
 */
router.post('/:id/complete', async (req, res) => {
    const { id } = req.params;
    console.log(`Received POST /api/habits/${id}/complete request`);

    try {
        // Use the habit model to record a completion
        const result = await HabitModel.recordCompletion(id);

        console.log(`Completion recorded for habit ${id}. New count: ${result.completions_today}, Total: ${result.total_completions}, Level: ${result.level}`);

        res.status(200).json({
            message: 'Completion recorded',
            completions_today: result.completions_today,
            total_completions: result.total_completions,
            level: result.level
        });

    } catch (err) {
        console.error(`Error recording completion for habit ${id}:`, err);

        if (err.message.includes('Invalid habit ID format')) {
            return res.status(400).json({ error: err.message });
        }

        if (err.message.includes('not found')) {
            return res.status(404).json({ error: err.message });
        }

        if (err.message.includes('already reached the max completions') ||
            err.message.includes('Maximum completions') ||
            err.message.includes('already reached for today')) {
            return res.status(409).json({
                message: err.message,
                error: 'Daily completion target already met'
            });
        }

        res.status(500).json({
            error: 'Failed to record completion',
            message: err.message,
            details: err.detail || 'No additional details available'
        });
    }
});

/**
 * @swagger
 * /api/habits/{id}/uncomplete:
 *   post:
 *     summary: Remove a habit completion
 *     tags: [Habits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The habit ID
 *     responses:
 *       200:
 *         description: Completion removed successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Habit not found
 *       409:
 *         description: No completions to remove
 *       500:
 *         description: Server error
 */
router.post('/:id/uncomplete', async (req, res) => {
    const { id } = req.params;
    console.log(`Received POST /api/habits/${id}/uncomplete request`);

    try {
        // Use the habit model to remove a completion
        const result = await HabitModel.removeCompletion(id);

        console.log(`Completion removed for habit ${id}. New count: ${result.completions_today}, Total: ${result.total_completions}, Level: ${result.level}`);

        res.status(200).json({
            message: 'Completion removed',
            completions_today: result.completions_today,
            total_completions: result.total_completions,
            level: result.level
        });

    } catch (err) {
        console.error(`Error removing completion for habit ${id}:`, err);

        if (err.message.includes('Invalid habit ID format')) {
            return res.status(400).json({ error: err.message });
        }

        if (err.message.includes('not found')) {
            return res.status(404).json({ error: err.message });
        }

        if (err.message.includes('No completions found')) {
            return res.status(409).json({
                message: err.message,
                error: 'No completions to remove'
            });
        }

        res.status(500).json({
            error: 'Failed to remove completion',
            message: err.message,
            details: err.detail || 'No additional details available'
        });
    }
});

/**
 * @swagger
 * /api/habits/{id}/update-total:
 *   post:
 *     summary: Update a habit's total completions directly
 *     tags: [Habits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The habit ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               increment:
 *                 type: integer
 *                 description: The amount to increment the total completions by
 *     responses:
 *       200:
 *         description: Total completions updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Habit not found
 *       500:
 *         description: Server error
 */
router.post('/:id/update-total', async (req, res) => {
    const { id } = req.params;
    const { increment } = req.body;
    console.log(`Received POST /api/habits/${id}/update-total request with increment: ${increment}`);

    if (!increment || typeof increment !== 'number') {
        return res.status(400).json({ error: 'Invalid increment value' });
    }

    try {
        // Use direct query to update total completions
        const result = await HabitModel.updateTotalCompletions(id, increment);

        console.log(`Total completions updated for habit ${id}. New total: ${result.total_completions}, Level: ${result.level}`);

        res.status(200).json({
            message: 'Total completions updated',
            total_completions: result.total_completions,
            level: result.level
        });

    } catch (err) {
        console.error(`Error updating total completions for habit ${id}:`, err);

        if (err.message.includes('Invalid habit ID format')) {
            return res.status(400).json({ error: err.message });
        }

        if (err.message.includes('not found')) {
            return res.status(404).json({ error: err.message });
        }

        res.status(500).json({
            error: 'Failed to update total completions',
            message: err.message,
            details: err.detail || 'No additional details available'
        });
    }
});

module.exports = router;
