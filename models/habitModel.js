/**
 * Habit Model
 * Handles data operations for habits
 */

const db = require('../db');

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} - Today's date in YYYY-MM-DD format
 */
function getTodayDateKey() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

/**
 * Get all habits with today's completion count and total completions
 * @returns {Promise<Array>} - Promise resolving to an array of habits
 */
async function getAllHabits() {
    const todayKey = getTodayDateKey();

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

    return result.rows;
}

/**
 * Create a new habit
 * @param {string} title - The habit title
 * @param {string} frequency - The habit frequency (daily, weekly, monthly)
 * @param {number} completionsPerDay - The number of completions per day
 * @returns {Promise<Object>} - Promise resolving to the created habit
 */
async function createHabit(title, frequency, completionsPerDay) {
    if (!title || title.trim() === '') {
        throw new Error('Habit title cannot be empty');
    }

    const validFrequencies = ['daily', 'weekly', 'monthly'];
    if (!frequency || !validFrequencies.includes(frequency)) {
        throw new Error('Invalid frequency specified');
    }

    let p_completions = 1;
    if (frequency === 'daily' && completionsPerDay) {
        try {
            p_completions = parseInt(completionsPerDay, 10);
            if (isNaN(p_completions) || p_completions < 1) p_completions = 1;
        } catch {
            p_completions = 1;
        }
    }

    const result = await db.query(
        'INSERT INTO habits (title, frequency, completions_per_day) VALUES ($1, $2, $3) RETURNING *',
        [title.trim(), frequency, p_completions]
    );

    // Return habit with completions_today = 0 initially
    return { ...result.rows[0], completions_today: 0 };
}

/**
 * Update a habit
 * @param {number} habitId - The habit ID
 * @param {string} title - The habit title
 * @param {string} frequency - The habit frequency (daily, weekly, monthly)
 * @param {number} completionsPerDay - The number of completions per day
 * @returns {Promise<Object>} - Promise resolving to the updated habit
 */
async function updateHabit(habitId, title, frequency, completionsPerDay) {
    if (!/^[1-9]\d*$/.test(habitId)) {
        throw new Error('Invalid habit ID format');
    }

    if (!title || title.trim() === '') {
        throw new Error('Habit title cannot be empty');
    }

    const validFrequencies = ['daily', 'weekly', 'monthly'];
    if (!frequency || !validFrequencies.includes(frequency)) {
        throw new Error('Invalid frequency specified');
    }

    let p_completions = 1;
    if (frequency === 'daily' && completionsPerDay) {
        try {
            p_completions = parseInt(completionsPerDay, 10);
            if (isNaN(p_completions) || p_completions < 1) p_completions = 1;
        } catch {
            p_completions = 1;
        }
    }

    // Get current habit data to preserve completions_today
    const todayKey = getTodayDateKey();
    const currentHabitResult = await db.query(
        `SELECT
            h.*,
            COUNT(DISTINCT CASE WHEN hc.completion_date = $1 THEN hc.id ELSE NULL END) AS completions_today
         FROM habits h
         LEFT JOIN habit_completions hc ON h.id = hc.habit_id
         WHERE h.id = $2
         GROUP BY h.id`,
        [todayKey, habitId]
    );

    if (currentHabitResult.rows.length === 0) {
        throw new Error(`Habit with ID ${habitId} not found`);
    }

    // Update the habit
    const result = await db.query(
        'UPDATE habits SET title = $1, frequency = $2, completions_per_day = $3 WHERE id = $4 RETURNING *',
        [title.trim(), frequency, p_completions, habitId]
    );

    if (result.rowCount === 0) {
        throw new Error(`Habit with ID ${habitId} not found`);
    }

    // Return updated habit with completions_today preserved
    return {
        ...result.rows[0],
        completions_today: currentHabitResult.rows[0].completions_today
    };
}

/**
 * Delete a habit
 * @param {number} habitId - The habit ID
 * @returns {Promise<Object>} - Promise resolving to the deleted habit ID
 */
async function deleteHabit(habitId) {
    if (!/^[1-9]\d*$/.test(habitId)) {
        throw new Error('Invalid habit ID format');
    }

    const result = await db.query(
        'DELETE FROM habits WHERE id = $1 RETURNING id',
        [habitId]
    );

    if (result.rowCount === 0) {
        throw new Error(`Habit with ID ${habitId} not found`);
    }

    return { id: parseInt(habitId) };
}

/**
 * Record a habit completion
 * @param {number} habitId - The habit ID
 * @returns {Promise<Object>} - Promise resolving to the completion data
 */
async function recordCompletion(habitId) {
    if (!/^[1-9]\d*$/.test(habitId)) {
        throw new Error('Invalid habit ID format');
    }

    const todayKey = getTodayDateKey();

    try {
        // 1. Check if the habit exists
        const habitResult = await db.query(
            'SELECT * FROM habits WHERE id = $1',
            [habitId]
        );

        if (habitResult.rows.length === 0) {
            throw new Error(`Habit with ID ${habitId} not found`);
        }

        // 2. Get current completions for today
        const completionsResult = await db.query(
            'SELECT COUNT(*) as count FROM habit_completions WHERE habit_id = $1 AND completion_date = $2',
            [habitId, todayKey]
        );

        const completionsToday = parseInt(completionsResult.rows[0].count, 10);
        const maxCompletions = habitResult.rows[0].completions_per_day;

        // 3. Check if we've already reached the max completions for today
        // Skip this check for unlimited habits (completions_per_day >= 999)
        const isUnlimitedHabit = maxCompletions >= 999;

        if (!isUnlimitedHabit && completionsToday >= maxCompletions) {
            throw new Error(`Maximum completions (${maxCompletions}) already reached for today`);
        }

        // 4. Record the completion
        try {
            if (isUnlimitedHabit) {
                // For unlimited habits, use timestamp to make each record unique
                const timestamp = new Date().toISOString();
                await db.query(
                    'INSERT INTO habit_completions (habit_id, completion_date, created_at) VALUES ($1, $2, $3)',
                    [habitId, todayKey, timestamp]
                );
            } else {
                // For regular habits
                await db.query(
                    'INSERT INTO habit_completions (habit_id, completion_date) VALUES ($1, $2)',
                    [habitId, todayKey]
                );
            }
        } catch (insertError) {
            // If there's a unique constraint violation and this is an unlimited habit
            if (insertError.code === '23505' && isUnlimitedHabit) {
                console.log(`Handling unique constraint for unlimited habit ${habitId} by incrementing total_completions directly`);
                // Just continue to the next step (incrementing total_completions)
            } else {
                // For other errors or non-unlimited habits, rethrow
                throw insertError;
            }
        }

        // 5. Increment the total_completions counter
        await db.query(
            'UPDATE habits SET total_completions = total_completions + 1 WHERE id = $1',
            [habitId]
        );

        // 6. Get the updated total_completions
        const totalResult = await db.query(
            'SELECT total_completions FROM habits WHERE id = $1',
            [habitId]
        );

        const totalCompletions = parseInt(totalResult.rows[0].total_completions, 10) || 0;
        const calculatedLevel = Math.max(1, Math.floor(totalCompletions / 5) + 1);

        return {
            completions_today: completionsToday + 1,
            total_completions: totalCompletions,
            level: calculatedLevel
        };
    } catch (error) {
        console.error('Error recording habit completion:', error);
        throw error;
    }
}

/**
 * Update total completions directly
 * @param {number} habitId - The habit ID
 * @param {number} increment - The amount to increment (default: 1)
 * @returns {Promise<Object>} - Promise resolving to the updated completion data
 */
async function updateTotalCompletions(habitId, increment = 1) {
    if (!/^[1-9]\d*$/.test(habitId)) {
        throw new Error('Invalid habit ID format');
    }

    // Validate increment value
    const incrementValue = parseInt(increment, 10) || 1;
    if (incrementValue <= 0) {
        throw new Error('Increment value must be positive');
    }

    // Update the total_completions directly
    const result = await db.query(
        'UPDATE habits SET total_completions = total_completions + $1 WHERE id = $2 RETURNING total_completions',
        [incrementValue, habitId]
    );

    if (result.rowCount === 0) {
        throw new Error(`Habit with ID ${habitId} not found`);
    }

    const totalCompletions = parseInt(result.rows[0].total_completions, 10) || 0;
    const calculatedLevel = Math.max(1, Math.floor(totalCompletions / 5) + 1);

    return {
        message: 'Total completions updated successfully',
        total_completions: totalCompletions,
        level: calculatedLevel
    };
}

module.exports = {
    getAllHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    recordCompletion,
    updateTotalCompletions
};
