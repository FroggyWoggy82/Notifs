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


// --- GET /api/habits - Fetch all habits with today's completion count and total completions ---
router.get('/', async (req, res) => {
    console.log("Received GET /api/habits request");
    const todayKey = getTodayDateKey();
    try {
        // Query habits with both today's completions and stored total_completions
        const result = await db.query(
            `SELECT
                h.id,
                h.title,
                h.frequency,
                h.completions_per_day,
                h.created_at,
                h.total_completions,
                COUNT(DISTINCT CASE WHEN hc.completion_date = $1 THEN hc.id ELSE NULL END) AS completions_today
             FROM habits h
             LEFT JOIN habit_completions hc ON h.id = hc.habit_id
             GROUP BY h.id
             ORDER BY h.created_at DESC`,
            [todayKey]
        );
        // Note: COUNT returns a string, convert it to a number
        const habits = result.rows.map(habit => ({
            ...habit,
            completions_today: parseInt(habit.completions_today, 10) || 0,
            total_completions: parseInt(habit.total_completions, 10) || 0,
            // Calculate level based on total completions (1 level per 5 completions, minimum level 1)
            level: Math.max(1, Math.floor((parseInt(habit.total_completions, 10) || 0) / 5) + 1)
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

    try {
        // Safely access the request body
        let isCounterHabit = false;
        console.log('Request body:', req.body);

        // Check if this is a counter habit
        if (req.body && typeof req.body === 'object') {
            isCounterHabit = !!req.body.isCounterHabit;
        }

        const todayKey = getTodayDateKey(); // Use same helper
        console.log(`Received POST /api/habits/${id}/complete for date ${todayKey}`, isCounterHabit ? '(counter habit)' : '');

        if (!/^[1-9]\d*$/.test(id)) {
            return res.status(400).json({ error: 'Invalid habit ID format' });
        }

        // 1. Get habit details (completions_per_day and title)
        const habitResult = await db.query('SELECT completions_per_day, title FROM habits WHERE id = $1', [id]);
        if (habitResult.rowCount === 0) {
            return res.status(404).json({ error: 'Habit not found' });
        }
        const completionsTarget = habitResult.rows[0].completions_per_day;
        const habitTitle = habitResult.rows[0].title || '';

        // Check if this is a counter habit based on title pattern
        const hasCounterInTitle = habitTitle.match(/\((\d+)\/(\d+)\)/) !== null;
        const isCounter = isCounterHabit || hasCounterInTitle;

        console.log(`Habit ${id} "${habitTitle}" is ${isCounter ? 'a counter habit' : 'a regular habit'}`);

        // 2. Count today's completions
        const countResult = await db.query(
            'SELECT COUNT(*) FROM habit_completions WHERE habit_id = $1 AND completion_date = $2',
            [id, todayKey]
        );
        const completionsToday = parseInt(countResult.rows[0].count, 10);

        // 3. Check if target already met - skip this check for counter habits and unlimited habits
        const isUnlimitedHabit = completionsTarget >= 999;

        // For unlimited habits, we'll use a different approach to avoid unique constraint issues
        if (isUnlimitedHabit) {
            console.log(`Unlimited habit ${id}: Using direct update approach`);
            // Just increment the total_completions directly
            await db.query(
                'UPDATE habits SET total_completions = total_completions + 1 WHERE id = $1',
                [id]
            );

            // Get the updated total_completions
            const totalResult = await db.query(
                'SELECT total_completions FROM habits WHERE id = $1',
                [id]
            );
            const totalCompletions = parseInt(totalResult.rows[0].total_completions, 10) || 0;
            const calculatedLevel = Math.max(1, Math.floor(totalCompletions / 5) + 1);

            // Return success response
            return res.status(200).json({
                message: 'Completion recorded (direct update for unlimited habit)',
                completions_today: completionsToday + 1,
                total_completions: totalCompletions,
                level: calculatedLevel
            });
        }

        // For regular habits, check if target already met
        if (!isCounter && completionsToday >= completionsTarget) {
            console.log(`Habit ${id} target (${completionsTarget}) already met for ${todayKey}. No new completion added.`);
            return res.status(409).json({ message: 'Daily completion target already met for this habit.' }); // 409 Conflict
        }

        // We've already handled unlimited habits above, so this code is only for regular and counter habits
        try {
            // For regular habits, insert a completion record
            console.log(`Habit ${id}: inserting completion record`);
            await db.query(
                'INSERT INTO habit_completions (habit_id, completion_date) VALUES ($1, $2)',
                [id, todayKey]
            );
        } catch (insertError) {
            // If there's a unique constraint violation (already completed today)
            if (insertError.code === '23505' && isCounter) {
                // For counter habits, just increment the total_completions directly
                console.log(`Counter habit ${id}: already has completion for today, incrementing total_completions directly`);
                await db.query(
                    'UPDATE habits SET total_completions = total_completions + 1 WHERE id = $1',
                    [id]
                );
            } else {
                // For other errors or non-counter habits, rethrow
                throw insertError;
            }
        }

        // 6. Get the updated total_completions
        const totalResult = await db.query(
            'SELECT total_completions FROM habits WHERE id = $1',
            [id]
        );
        const totalCompletions = parseInt(totalResult.rows[0].total_completions, 10) || 0;
        const calculatedLevel = Math.max(1, Math.floor(totalCompletions / 5) + 1);

        console.log(`Completion recorded for habit ${id} on ${todayKey}. New count: ${completionsToday + 1}, Total: ${totalCompletions}, Level: ${calculatedLevel}`);

        // Make sure we're sending a valid JSON response
        const responseData = {
            message: 'Completion recorded',
            completions_today: completionsToday + 1,
            total_completions: totalCompletions,
            level: calculatedLevel
        };

        console.log('Sending response:', JSON.stringify(responseData));
        res.status(201).json(responseData);

    } catch (err) {
        console.error(`Error recording completion for habit ${id}:`, err);
        console.error('Error stack:', err.stack);
        console.error('Error details:', {
            message: err.message,
            code: err.code,
            detail: err.detail,
            constraint: err.constraint
        });

        // Check for unique constraint violation if user clicks very fast
        if (err.code === '23505') { // PostgreSQL unique constraint violation
            // For unlimited habits, we want to allow multiple completions
            // So instead of returning an error, we'll increment the total_completions directly
            if (isUnlimitedHabit) {
                try {
                    console.log(`Handling unique constraint for unlimited habit ${id} by incrementing total_completions directly`);
                    await db.query(
                        'UPDATE habits SET total_completions = total_completions + 1 WHERE id = $1 RETURNING total_completions',
                        [id]
                    );

                    // Get the updated total_completions
                    const totalResult = await db.query(
                        'SELECT total_completions FROM habits WHERE id = $1',
                        [id]
                    );
                    const totalCompletions = parseInt(totalResult.rows[0].total_completions, 10) || 0;
                    const calculatedLevel = Math.max(1, Math.floor(totalCompletions / 5) + 1);

                    // Return success response
                    return res.status(200).json({
                        message: 'Completion recorded (direct update)',
                        completions_today: completionsToday + 1,
                        total_completions: totalCompletions,
                        level: calculatedLevel
                    });
                } catch (updateError) {
                    console.error(`Error handling unique constraint for unlimited habit ${id}:`, updateError);
                    return res.status(500).json({
                        error: 'Failed to update total completions',
                        message: updateError.message
                    });
                }
            } else {
                // For regular habits, return the conflict error
                return res.status(409).json({
                    message: 'Completion already recorded for today',
                    error: err.message
                });
            }
        }

        // Return a more detailed error message
        res.status(500).json({
            error: 'Failed to record completion',
            message: err.message,
            details: err.detail || 'No additional details available'
        });
    }
});


// --- POST /api/habits/:id/update-total - Directly update total_completions ---
router.post('/:id/update-total', async (req, res) => {
    const { id } = req.params;
    const { increment } = req.body || {};

    try {
        console.log(`Received POST /api/habits/${id}/update-total with increment=${increment}`);

        if (!/^[1-9]\d*$/.test(id)) {
            return res.status(400).json({ error: 'Invalid habit ID format' });
        }

        // Validate increment value
        const incrementValue = parseInt(increment, 10) || 1;
        if (incrementValue <= 0) {
            return res.status(400).json({ error: 'Increment value must be positive' });
        }

        // Update the total_completions directly
        const result = await db.query(
            'UPDATE habits SET total_completions = total_completions + $1 WHERE id = $2 RETURNING total_completions',
            [incrementValue, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Habit not found' });
        }

        const totalCompletions = parseInt(result.rows[0].total_completions, 10) || 0;
        const calculatedLevel = Math.max(1, Math.floor(totalCompletions / 5) + 1);

        console.log(`Direct update to habit ${id} total_completions: ${totalCompletions}, Level: ${calculatedLevel}`);

        res.status(200).json({
            message: 'Total completions updated successfully',
            total_completions: totalCompletions,
            level: calculatedLevel
        });

    } catch (err) {
        console.error(`Error updating total_completions for habit ${id}:`, err);
        res.status(500).json({ error: 'Failed to update total completions' });
    }
});

// --- POST /api/habits/:id/update-total - Directly update total_completions ---
router.post('/:id/update-total', async (req, res) => {
    const { id } = req.params;
    const { increment } = req.body || {};

    try {
        console.log(`Received POST /api/habits/${id}/update-total with increment=${increment}`);

        if (!/^[1-9]\d*$/.test(id)) {
            return res.status(400).json({ error: 'Invalid habit ID format' });
        }

        // Validate increment value
        const incrementValue = parseInt(increment, 10) || 1;
        if (incrementValue <= 0) {
            return res.status(400).json({ error: 'Increment value must be positive' });
        }

        // Update the total_completions directly
        const result = await db.query(
            'UPDATE habits SET total_completions = total_completions + $1 WHERE id = $2 RETURNING total_completions',
            [incrementValue, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Habit not found' });
        }

        const totalCompletions = parseInt(result.rows[0].total_completions, 10) || 0;
        const calculatedLevel = Math.max(1, Math.floor(totalCompletions / 5) + 1);

        console.log(`Direct update to habit ${id} total_completions: ${totalCompletions}, Level: ${calculatedLevel}`);

        res.status(200).json({
            message: 'Total completions updated successfully',
            total_completions: totalCompletions,
            level: calculatedLevel
        });

    } catch (err) {
        console.error(`Error updating total_completions for habit ${id}:`, err);
        res.status(500).json({ error: 'Failed to update total completions' });
    }
});

module.exports = router;