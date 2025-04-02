const express = require('express');
const db = require('../db'); // Assuming db.js is in the parent directory

const router = express.Router();

// --- Helper: Get Today's Date Key (YYYY-MM-DD in local timezone, but used for UTC comparison in DB) ---
// Note: Be mindful of timezone handling consistency between app server and DB server.
// Using UTC for dates in the database is generally recommended.
function getTodayDateKey() {
    const today = new Date();
    // This gets the date according to the server's local timezone.
    // If your DB stores dates in UTC, you might need to adjust.
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
    // For UTC date: return today.toISOString().split('T')[0];
}


// --- GET /api/habits - Fetch all habits with today's completion count ---
router.get('/', async (req, res) => {
    console.log("Received GET /api/habits request");
    const todayKey = getTodayDateKey();
    try {
        // Query habits and join with completions for today to get the count
        const result = await db.query(
            `SELECT
                h.id,
                h.title,
                h.frequency,
                h.completions_per_day,
                h.created_at,
                COUNT(hc.id) AS completions_today
             FROM habits h
             LEFT JOIN habit_completions hc ON h.id = hc.habit_id AND hc.completion_date = $1
             GROUP BY h.id
             ORDER BY h.created_at DESC`,
            [todayKey]
        );
        // Note: COUNT returns a string, convert it to a number
        const habits = result.rows.map(habit => ({
            ...habit,
            completions_today: parseInt(habit.completions_today, 10) || 0
        }));
        res.json(habits);
    } catch (err) {
        console.error('Error fetching habits:', err);
        res.status(500).json({ error: 'Failed to fetch habits' });
    }
});

// --- POST /api/habits - Create a new habit ---
router.post('/', async (req, res) => {
    const { title, frequency, completions_per_day } = req.body;
    console.log(`Received POST /api/habits: title='${title}', frequency='${frequency}', completions='${completions_per_day}'`);

    if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'Habit title cannot be empty' });
    }
    const validFrequencies = ['daily', 'weekly', 'monthly'];
    if (!frequency || !validFrequencies.includes(frequency)) {
        return res.status(400).json({ error: 'Invalid frequency specified' });
    }
    let p_completions = 1;
    if (frequency === 'daily' && completions_per_day) {
        try {
            p_completions = parseInt(completions_per_day, 10);
            if (isNaN(p_completions) || p_completions < 1) p_completions = 1;
        } catch { p_completions = 1; }
    }

    try {
        const result = await db.query(
            'INSERT INTO habits (title, frequency, completions_per_day) VALUES ($1, $2, $3) RETURNING *',
            [title.trim(), frequency, p_completions]
        );
        console.log(`Habit created successfully with ID: ${result.rows[0].id}`);
        // Return habit with completions_today = 0 initially
        res.status(201).json({ ...result.rows[0], completions_today: 0 });
    } catch (err) {
        console.error('Error creating habit:', err);
        res.status(500).json({ error: 'Failed to create habit' });
    }
});

// --- PUT /api/habits/:id - Update a habit ---
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, frequency, completions_per_day } = req.body; // Allow updating these fields
    console.log(`Received PUT /api/habits/${id}: title='${title}', frequency='${frequency}', completions='${completions_per_day}'`);

    if (!/^[1-9]\d*$/.test(id)) {
        return res.status(400).json({ error: 'Invalid habit ID format' });
    }
    if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'Habit title cannot be empty' });
    }
    const validFrequencies = ['daily', 'weekly', 'monthly'];
    if (!frequency || !validFrequencies.includes(frequency)) {
        return res.status(400).json({ error: 'Invalid frequency specified' });
    }
     let p_completions = 1;
    if (frequency === 'daily' && completions_per_day) {
        try {
            p_completions = parseInt(completions_per_day, 10);
            if (isNaN(p_completions) || p_completions < 1) p_completions = 1;
        } catch { p_completions = 1; }
    }

    try {
        const result = await db.query(
            'UPDATE habits SET title = $1, frequency = $2, completions_per_day = $3 WHERE id = $4 RETURNING *',
            [title.trim(), frequency, p_completions, id]
        );

        if (result.rowCount === 0) {
            console.log(`Update Habit: Habit ${id} not found.`);
            return res.status(404).json({ error: 'Habit not found' });
        }

        console.log(`Habit ${id} updated successfully.`);
        // Fetch updated completions_today to return consistent object
        const todayKey = getTodayDateKey();
        const completionResult = await db.query(
             `SELECT COUNT(*) AS completions_today FROM habit_completions WHERE habit_id = $1 AND completion_date = $2`,
             [id, todayKey]
         );
         const completionsToday = parseInt(completionResult.rows[0].completions_today, 10) || 0;

        res.status(200).json({ ...result.rows[0], completions_today: completionsToday }); // Return the updated habit

    } catch (err) {
        console.error(`Error updating habit ${id}:`, err);
        res.status(500).json({ error: 'Failed to update habit' });
    }
});

// --- DELETE /api/habits/:id - Delete a habit ---
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`Received DELETE /api/habits/${id}`);

    if (!/^[1-9]\d*$/.test(id)) {
        return res.status(400).json({ error: 'Invalid habit ID format' });
    }

    try {
        // Deleting from habits will cascade to habit_completions due to FK constraint
        const result = await db.query('DELETE FROM habits WHERE id = $1 RETURNING id', [id]);

        if (result.rowCount === 0) {
            console.log(`Delete Habit: Habit ${id} not found.`);
            return res.status(404).json({ error: 'Habit not found' });
        }

        console.log(`Habit ${id} deleted successfully.`);
        res.status(200).json({ message: `Habit ${id} deleted successfully`, id: parseInt(id) });

    } catch (err) {
        console.error(`Error deleting habit ${id}:`, err);
        res.status(500).json({ error: 'Failed to delete habit' });
    }
});

// --- POST /api/habits/:id/complete - Record a completion for today ---
router.post('/:id/complete', async (req, res) => {
    const { id } = req.params;
    const todayKey = getTodayDateKey(); // Use same helper
    console.log(`Received POST /api/habits/${id}/complete for date ${todayKey}`);

    if (!/^[1-9]\d*$/.test(id)) {
        return res.status(400).json({ error: 'Invalid habit ID format' });
    }

    try {
        // 1. Get habit details (completions_per_day)
        const habitResult = await db.query('SELECT completions_per_day FROM habits WHERE id = $1', [id]);
        if (habitResult.rowCount === 0) {
            return res.status(404).json({ error: 'Habit not found' });
        }
        const completionsTarget = habitResult.rows[0].completions_per_day;

        // 2. Count today's completions
        const countResult = await db.query(
            'SELECT COUNT(*) FROM habit_completions WHERE habit_id = $1 AND completion_date = $2',
            [id, todayKey]
        );
        const completionsToday = parseInt(countResult.rows[0].count, 10);

        // 3. Check if target already met
        if (completionsToday >= completionsTarget) {
            console.log(`Habit ${id} target (${completionsTarget}) already met for ${todayKey}. No new completion added.`);
            return res.status(409).json({ message: 'Daily completion target already met for this habit.' }); // 409 Conflict
        }

        // 4. Insert new completion
        await db.query(
            'INSERT INTO habit_completions (habit_id, completion_date) VALUES ($1, $2)',
            [id, todayKey]
        );

        console.log(`Completion recorded for habit ${id} on ${todayKey}. New count: ${completionsToday + 1}`);
        res.status(201).json({ message: 'Completion recorded', completions_today: completionsToday + 1 });

    } catch (err) {
        console.error(`Error recording completion for habit ${id}:`, err);
        // Check for unique constraint violation if user clicks very fast? (Less likely with check above)
        res.status(500).json({ error: 'Failed to record completion' });
    }
});


module.exports = router; 