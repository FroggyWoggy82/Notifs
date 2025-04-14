const express = require('express');
const habitController = require('../controllers/habitController');

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
router.get('/', habitController.getAllHabits);

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
    console.log("Request body type:", typeof req.body);
    console.log("Request body keys:", Object.keys(req.body));

    // Validate the request body
    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Invalid request body' });
    }

    if (!req.body.title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    try {
        console.log("Calling createHabit with:", JSON.stringify(req.body));

        // Create a simple object with just the required fields
        const habitData = {
            title: req.body.title.trim(),
            frequency: req.body.frequency || 'daily',
            completions_per_day: parseInt(req.body.completions_per_day || 1, 10)
        };

        console.log("Using simplified habitData:", JSON.stringify(habitData));

        // Insert directly into the database to bypass any potential issues with the model
        const db = require('../db');

        // Check if the habits table exists
        const tableCheck = await db.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'habits'
            )
        `);

        const tableExists = tableCheck.rows[0].exists;
        console.log('Habits table exists:', tableExists);

        if (!tableExists) {
            console.log('Creating habits table...');
            await db.query(`
                CREATE TABLE habits (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    frequency VARCHAR(50) NOT NULL DEFAULT 'daily',
                    completions_per_day INTEGER NOT NULL DEFAULT 1,
                    total_completions INTEGER NOT NULL DEFAULT 0,
                    created_at TIMESTAMP NOT NULL DEFAULT NOW()
                )
            `);
            console.log('Habits table created successfully');
        }

        // Insert the habit directly
        console.log('Inserting habit with parameters:', [habitData.title, habitData.frequency, habitData.completions_per_day]);
        const result = await db.query(
            'INSERT INTO habits (title, frequency, completions_per_day) VALUES ($1, $2, $3) RETURNING *',
            [habitData.title, habitData.frequency, habitData.completions_per_day]
        );

        const newHabit = { ...result.rows[0], completions_today: 0 };
        console.log("Habit created successfully:", newHabit);
        res.status(201).json(newHabit);
    } catch (err) {
        console.error('Error creating habit:', err);
        console.error('Error stack:', err.stack);

        if (err.message && err.message.includes('Title is required')) {
            return res.status(400).json({ error: err.message });
        }

        // Return a more detailed error message
        res.status(500).json({
            error: 'Failed to create habit',
            message: err.message,
            stack: process.env.NODE_ENV === 'production' ? null : err.stack
        });
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
router.post('/:id/complete', habitController.recordCompletion);

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
router.post('/:id/uncomplete', habitController.removeCompletion);

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

/**
 * @swagger
 * /api/habits/completions:
 *   get:
 *     summary: Get habit completions for a date range
 *     tags: [Habits]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for the range (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for the range (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Habit completions for the date range
 *       400:
 *         description: Invalid date format
 *       500:
 *         description: Server error
 */
router.get('/completions', async (req, res) => {
    const { startDate, endDate } = req.query;
    console.log(`Received GET /api/habits/completions request with startDate=${startDate}, endDate=${endDate}`);

    try {
        // Validate date formats
        if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
            return res.status(400).json({ error: 'Invalid startDate format. Use YYYY-MM-DD' });
        }
        if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
            return res.status(400).json({ error: 'Invalid endDate format. Use YYYY-MM-DD' });
        }

        // Get habit completions for the date range
        const completions = await HabitModel.getCompletionsByDateRange(startDate, endDate);
        res.status(200).json(completions);
    } catch (err) {
        console.error('Error fetching habit completions:', err);
        res.status(500).json({ error: 'Failed to fetch habit completions' });
    }
});

module.exports = router;
