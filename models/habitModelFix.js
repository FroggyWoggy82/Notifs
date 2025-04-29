/**
 * Fix for the habit completion API
 * This file contains a patched version of the recordCompletion function
 * that properly handles habits with very high completions_per_day values
 */

const db = require('../utils/db');

/**
 * Get today's date in YYYY-MM-DD format for database queries
 * @returns {string} Today's date in YYYY-MM-DD format
 */
function getTodayDateKey() {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD
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
    console.log(`Recording completion for habit ${habitId} on ${todayKey}`);

    try {
        // 1. Check if the habit exists
        const habitResult = await db.query(
            'SELECT * FROM habits WHERE id = $1',
            [habitId]
        );

        if (habitResult.rows.length === 0) {
            throw new Error(`Habit with ID ${habitId} not found`);
        }

        const habit = habitResult.rows[0];
        const completionsPerDay = parseInt(habit.completions_per_day, 10) || 1;
        
        // 2. Get the current total_completions
        const totalResult = await db.query(
            'SELECT total_completions FROM habits WHERE id = $1',
            [habitId]
        );

        const currentTotalCompletions = parseInt(totalResult.rows[0].total_completions, 10) || 0;
        console.log(`Habit ${habitId} current total completions: ${currentTotalCompletions}`);

        // 3. Check how many completions exist for today
        const completionResult = await db.query(
            'SELECT COUNT(*) FROM habit_completions WHERE habit_id = $1 AND completion_date = $2 AND deleted_at IS NULL',
            [habitId, todayKey]
        );

        const completionsToday = parseInt(completionResult.rows[0].count, 10) || 0;
        console.log(`Habit ${habitId} has ${completionsToday} completions for today`);

        // 4. Check if the habit has reached its maximum completions for today
        // For habits with very high completions_per_day (like 999), we'll always allow more completions
        const isHighCompletionHabit = completionsPerDay > 100;
        
        if (!isHighCompletionHabit && completionsToday >= completionsPerDay) {
            console.log(`IMPORTANT: Habit ${habitId} has reached maximum completions for today (${completionsToday}/${completionsPerDay})`);

            return {
                completions_today: completionsToday,
                total_completions: currentTotalCompletions,
                level: currentTotalCompletions,
                is_complete: true,
                is_max_completions: true
            };
        }

        // 5. Create a new completion record
        try {
            await db.query(
                'INSERT INTO habit_completions (habit_id, completion_date) VALUES ($1, $2)',
                [habitId, todayKey]
            );

            // Increment the total_completions counter
            const updateResult = await db.query(
                'UPDATE habits SET total_completions = total_completions + 1 WHERE id = $1 RETURNING total_completions',
                [habitId]
            );

            const newTotalCompletions = updateResult.rows[0].total_completions;
            console.log(`Incremented total_completions for habit ${habitId} from ${currentTotalCompletions} to ${newTotalCompletions}`);

            // Get the updated completion count
            const updatedCompletionResult = await db.query(
                'SELECT COUNT(*) FROM habit_completions WHERE habit_id = $1 AND completion_date = $2 AND deleted_at IS NULL',
                [habitId, todayKey]
            );

            const updatedCompletionsToday = parseInt(updatedCompletionResult.rows[0].count, 10) || 0;
            console.log(`Habit ${habitId} now has ${updatedCompletionsToday} completions for today`);

            // For high completion habits, we'll never mark them as complete
            const isComplete = isHighCompletionHabit ? false : (updatedCompletionsToday >= completionsPerDay);

            return {
                completions_today: updatedCompletionsToday,
                total_completions: newTotalCompletions,
                level: newTotalCompletions,
                is_complete: isComplete
            };
        } catch (insertError) {
            // If the insert fails due to a unique constraint violation, it means another request
            // completed the habit at the same time. In this case, just return the current state.
            if (insertError.code === '23505') { // Unique violation
                console.log(`Unique constraint violation - another request completed the habit at the same time`);

                // Get the current completion count
                const currentCompletionResult = await db.query(
                    'SELECT COUNT(*) FROM habit_completions WHERE habit_id = $1 AND completion_date = $2 AND deleted_at IS NULL',
                    [habitId, todayKey]
                );

                const currentCompletionsToday = parseInt(currentCompletionResult.rows[0].count, 10) || 0;
                console.log(`Habit ${habitId} has ${currentCompletionsToday} completions for today (unique constraint violation)`);

                return {
                    completions_today: currentCompletionsToday,
                    total_completions: currentTotalCompletions,
                    level: currentTotalCompletions,
                    is_repeat_completion: true
                };
            }

            // For other errors, rethrow
            throw insertError;
        }
    } catch (error) {
        console.error(`Error recording completion for habit ${habitId}:`, error);
        throw error;
    }
}

module.exports = {
    recordCompletion
};
