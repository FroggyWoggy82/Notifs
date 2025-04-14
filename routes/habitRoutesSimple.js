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
                'SELECT COUNT(*) FROM habit_completions WHERE habit_id = $1 AND completion_date = $2',
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

// CREATE a new habit - Extremely simplified version
router.post('/', (req, res) => {
    console.log("Received POST /api/habits request", req.body);

    // Validate the request body
    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Invalid request body' });
    }

    if (!req.body.title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    // Create a simple object with just the required fields
    const title = req.body.title.trim();
    const frequency = req.body.frequency || 'daily';
    const completions_per_day = parseInt(req.body.completions_per_day || 1, 10);

    console.log("Using simplified habitData:", { title, frequency, completions_per_day });

    // Insert the habit directly using simple query
    db.query(
        'INSERT INTO habits (title, frequency, completions_per_day) VALUES ($1, $2, $3) RETURNING *',
        [title, frequency, completions_per_day]
    )
    .then(result => {
        const newHabit = { ...result.rows[0], completions_today: 0 };
        console.log("Habit created successfully:", newHabit);
        res.status(201).json(newHabit);
    })
    .catch(err => {
        console.error('Error creating habit:', err);
        res.status(500).json({ error: 'Failed to create habit' });
    });
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
            'SELECT COUNT(*) FROM habit_completions WHERE habit_id = $1 AND completion_date = $2',
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

// UPDATE a habit
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, frequency, completions_per_day } = req.body;
        console.log(`Received PUT /api/habits/${id} request:`, req.body);

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

        console.log(`Habit ${id} updated successfully:`, result.rows[0]);
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
            'SELECT COUNT(*) FROM habit_completions WHERE habit_id = $1 AND completion_date = $2',
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
        const insertResult = await db.query(
            'INSERT INTO habit_completions (habit_id, completion_date, created_at) VALUES ($1, $2, NOW()) RETURNING *',
            [id, today]
        );

        console.log('Inserted habit completion:', insertResult.rows[0]);

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
            'SELECT id FROM habit_completions WHERE habit_id = $1 AND completion_date = $2 ORDER BY id DESC LIMIT 1',
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
            'SELECT COUNT(*) FROM habit_completions WHERE habit_id = $1 AND completion_date = $2',
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

// Get habit completions for a date range (for calendar view)
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

        // Get all habits
        const habitsResult = await db.query('SELECT id, title, frequency, completions_per_day, total_completions FROM habits');
        const habits = habitsResult.rows;
        console.log(`Found ${habits.length} habits:`, habits);

        // Create a map of habit IDs to habit objects for quick lookup
        const habitsById = {};
        habits.forEach(habit => {
            habitsById[habit.id] = habit;
        });

        // Get completions for the date range
        console.log(`Querying completions between ${startDate} and ${endDate}`);
        const completionsResult = await db.query(
            `SELECT
                habit_id,
                completion_date,
                COUNT(*) as count
             FROM habit_completions
             WHERE completion_date BETWEEN $1 AND $2
             GROUP BY habit_id, completion_date
             ORDER BY completion_date`,
            [startDate, endDate]
        );

        console.log(`Found ${completionsResult.rows.length} completion records`);

        // Group completions by date
        const completionsByDate = {};
        completionsResult.rows.forEach(row => {
            // Format the date as YYYY-MM-DD to ensure consistent keys
            const date = new Date(row.completion_date);
            const dateKey = date.toISOString().split('T')[0];
            const habitId = row.habit_id;
            const count = parseInt(row.count, 10);
            const habit = habitsById[habitId];

            if (!completionsByDate[dateKey]) {
                completionsByDate[dateKey] = [];
            }

            completionsByDate[dateKey].push({
                habitId,
                title: habit ? habit.title : `Unknown Habit (${habitId})`,
                count,
                target: habit ? habit.completions_per_day : 1
            });
        });

        // Add all habits to the response with their details
        const response = {
            startDate,
            endDate,
            habits: habits.map(h => ({
                id: h.id,
                title: h.title,
                frequency: h.frequency,
                completionsPerDay: h.completions_per_day,
                totalCompletions: h.total_completions
            })),
            completionsByDate
        };

        console.log('Sending response with completions by date');
        res.status(200).json(response);
    } catch (err) {
        console.error('Error fetching habit completions:', err);
        console.error('Error stack:', err.stack);
        res.status(500).json({
            error: 'Failed to fetch habit completions',
            message: err.message,
            stack: process.env.NODE_ENV === 'production' ? null : err.stack
        });
    }
});

// Check if a habit has completions for a specific date
router.get('/:id/check-completion', async (req, res) => {
    const { id } = req.params;
    const { date } = req.query;
    console.log(`Received GET /api/habits/${id}/check-completion request with date=${date}`);

    try {
        // Validate habit ID
        if (!/^[1-9]\d*$/.test(id)) {
            return res.status(400).json({ error: 'Invalid habit ID format' });
        }

        // Validate date format
        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
        }

        // Check if the habit exists
        const habitResult = await db.query('SELECT * FROM habits WHERE id = $1', [id]);
        if (habitResult.rows.length === 0) {
            return res.status(404).json({ error: `Habit with ID ${id} not found` });
        }

        // Get completions for this habit on the specified date
        const completionsResult = await db.query(
            'SELECT COUNT(*) FROM habit_completions WHERE habit_id = $1 AND completion_date = $2',
            [id, date]
        );

        const completions = parseInt(completionsResult.rows[0].count, 10) || 0;
        const habit = habitResult.rows[0];

        res.status(200).json({
            habitId: habit.id,
            title: habit.title,
            date: date,
            completions: completions,
            target: habit.completions_per_day || 1,
            isComplete: completions >= (habit.completions_per_day || 1)
        });
    } catch (err) {
        console.error(`Error checking completions for habit ${id} on ${date}:`, err);
        res.status(500).json({ error: 'Failed to check habit completions' });
    }
});

module.exports = router;
