const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all habits
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM habits ORDER BY id');

        // Get today's completions for each habit
        const habitsWithCompletions = await Promise.all(result.rows.map(async (habit) => {
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

            const completionsResult = await db.query(
                'SELECT COUNT(*) FROM habit_completions WHERE habit_id = $1 AND DATE(completed_at) = $2',
                [habit.id, today]
            );

            const completionsToday = parseInt(completionsResult.rows[0].count, 10);

            return {
                ...habit,
                completions_today: completionsToday
            };
        }));

        res.json(habitsWithCompletions);
    } catch (err) {
        console.error('Error fetching habits:', err);
        res.status(500).json({ error: 'Failed to fetch habits' });
    }
});

// GET a single habit by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM habits WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Habit not found' });
        }

        const habit = result.rows[0];

        // Get today's completions
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const completionsResult = await db.query(
            'SELECT COUNT(*) FROM habit_completions WHERE habit_id = $1 AND DATE(completed_at) = $2',
            [habit.id, today]
        );

        const completionsToday = parseInt(completionsResult.rows[0].count, 10);

        res.json({
            ...habit,
            completions_today: completionsToday
        });
    } catch (err) {
        console.error('Error fetching habit:', err);
        res.status(500).json({ error: 'Failed to fetch habit' });
    }
});

// CREATE a new habit
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
        console.log("Creating new habit with:", JSON.stringify(req.body));

        // Create a simple object with just the required fields
        const habitData = {
            title: req.body.title.trim(),
            frequency: req.body.frequency || 'daily',
            completions_per_day: parseInt(req.body.completions_per_day || 1, 10)
        };

        console.log("Using simplified habitData:", JSON.stringify(habitData));

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

// UPDATE a habit
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, frequency, completions_per_day } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const result = await db.query(
            'UPDATE habits SET title = $1, frequency = $2, completions_per_day = $3 WHERE id = $4 RETURNING *',
            [title, frequency || 'daily', completions_per_day || 1, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Habit not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating habit:', err);
        res.status(500).json({ error: 'Failed to update habit' });
    }
});

// DELETE a habit
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // First delete any completions
        await db.query('DELETE FROM habit_completions WHERE habit_id = $1', [id]);

        // Then delete the habit
        const result = await db.query('DELETE FROM habits WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Habit not found' });
        }

        res.json({ message: 'Habit deleted successfully', habit: result.rows[0] });
    } catch (err) {
        console.error('Error deleting habit:', err);
        res.status(500).json({ error: 'Failed to delete habit' });
    }
});

// Record a habit completion
router.post('/:id/complete', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the habit exists
        const habitResult = await db.query('SELECT * FROM habits WHERE id = $1', [id]);

        if (habitResult.rows.length === 0) {
            return res.status(404).json({ error: 'Habit not found' });
        }

        const habit = habitResult.rows[0];

        // Check if the habit has already been completed the maximum number of times today
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const completionsResult = await db.query(
            'SELECT COUNT(*) FROM habit_completions WHERE habit_id = $1 AND DATE(completed_at) = $2',
            [id, today]
        );

        const completionsToday = parseInt(completionsResult.rows[0].count, 10);

        if (completionsToday >= habit.completions_per_day) {
            return res.status(409).json({
                error: 'Daily completion target already met',
                message: `Maximum completions (${habit.completions_per_day}) already reached for today`
            });
        }

        // Record the completion
        await db.query(
            'INSERT INTO habit_completions (habit_id, completed_at) VALUES ($1, NOW())',
            [id]
        );

        // Increment the total completions counter
        const updateResult = await db.query(
            'UPDATE habits SET total_completions = total_completions + 1 WHERE id = $1 RETURNING total_completions',
            [id]
        );

        const totalCompletions = updateResult.rows[0].total_completions;

        res.json({
            message: 'Completion recorded',
            completions_today: completionsToday + 1,
            total_completions: totalCompletions,
            level: totalCompletions
        });
    } catch (err) {
        console.error('Error recording habit completion:', err);
        res.status(500).json({ error: 'Failed to record habit completion' });
    }
});

// Remove a habit completion
router.post('/:id/uncomplete', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the habit exists
        const habitResult = await db.query('SELECT * FROM habits WHERE id = $1', [id]);

        if (habitResult.rows.length === 0) {
            return res.status(404).json({ error: 'Habit not found' });
        }

        // Check if there are any completions today
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const completionsResult = await db.query(
            'SELECT id FROM habit_completions WHERE habit_id = $1 AND DATE(completed_at) = $2 ORDER BY completed_at DESC LIMIT 1',
            [id, today]
        );

        if (completionsResult.rows.length === 0) {
            return res.status(409).json({
                error: 'No completions to remove',
                message: `No completions found for habit ${id} today`
            });
        }

        const completionId = completionsResult.rows[0].id;

        // Remove the completion
        await db.query('DELETE FROM habit_completions WHERE id = $1', [completionId]);

        // Decrement the total completions counter
        const updateResult = await db.query(
            'UPDATE habits SET total_completions = GREATEST(0, total_completions - 1) WHERE id = $1 RETURNING total_completions',
            [id]
        );

        const totalCompletions = updateResult.rows[0].total_completions;

        // Get the updated completions count for today
        const updatedCompletionsResult = await db.query(
            'SELECT COUNT(*) FROM habit_completions WHERE habit_id = $1 AND DATE(completed_at) = $2',
            [id, today]
        );

        const updatedCompletionsToday = parseInt(updatedCompletionsResult.rows[0].count, 10);

        res.json({
            message: 'Completion removed',
            completions_today: updatedCompletionsToday,
            total_completions: totalCompletions,
            level: totalCompletions
        });
    } catch (err) {
        console.error('Error removing habit completion:', err);
        res.status(500).json({ error: 'Failed to remove habit completion' });
    }
});

module.exports = router;
