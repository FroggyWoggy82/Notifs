/**
 * Fixed Habit Model
 * This model works with the updated habit_completions table schema
 * that supports multiple completions per day without unique constraints
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
 * Get all habits with their completion status for today
 * @returns {Promise<Array>} Promise resolving to an array of habits
 */
async function getAllHabits() {
    try {
        const todayKey = getTodayDateKey();
        console.log(`Getting all habits with completion status for ${todayKey}`);

        // Query to get all habits with their completion status for today
        const result = await db.query(`
            SELECT 
                h.*,
                COUNT(DISTINCT CASE WHEN hc.completion_date = $1 AND hc.deleted_at IS NULL THEN hc.id ELSE NULL END) AS completions_today
            FROM habits h
            LEFT JOIN habit_completions hc ON h.id = hc.habit_id
            GROUP BY h.id
            ORDER BY h.id
        `, [todayKey]);

        return result.rows;
    } catch (error) {
        console.error('Error getting all habits:', error);
        throw error;
    }
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

        // 5. Get the next completion number
        const nextCompletionNumber = completionsToday + 1;

        // 6. Create a new completion record
        await db.query(
            'INSERT INTO habit_completions (habit_id, completion_date, completion_number) VALUES ($1, $2, $3)',
            [habitId, todayKey, nextCompletionNumber]
        );

        console.log(`Added new completion for habit ${habitId} (completion_number: ${nextCompletionNumber})`);

        // 7. Increment the total_completions counter
        const updateResult = await db.query(
            'UPDATE habits SET total_completions = total_completions + 1 WHERE id = $1 RETURNING total_completions',
            [habitId]
        );

        const newTotalCompletions = updateResult.rows[0].total_completions;
        console.log(`Incremented total_completions for habit ${habitId} from ${currentTotalCompletions} to ${newTotalCompletions}`);

        // 8. Get the updated completion count
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
    } catch (error) {
        console.error(`Error recording completion for habit ${habitId}:`, error);
        throw error;
    }
}

/**
 * Remove a habit completion for today
 * @param {number} habitId - The habit ID
 * @returns {Promise<Object>} - Promise resolving to the updated completion data
 */
async function removeCompletion(habitId) {
    if (!/^[1-9]\d*$/.test(habitId)) {
        throw new Error('Invalid habit ID format');
    }

    const todayKey = getTodayDateKey();
    console.log(`Removing completion for habit ${habitId} on ${todayKey}`);

    try {
        // 1. Check if the habit exists
        const habitResult = await db.query(
            'SELECT * FROM habits WHERE id = $1',
            [habitId]
        );

        if (habitResult.rows.length === 0) {
            throw new Error(`Habit with ID ${habitId} not found`);
        }

        // 2. Check if there are any completions today
        const completionsResult = await db.query(
            'SELECT id FROM habit_completions WHERE habit_id = $1 AND completion_date = $2 AND deleted_at IS NULL ORDER BY id DESC LIMIT 1',
            [habitId, todayKey]
        );

        if (completionsResult.rows.length === 0) {
            throw new Error(`No completions found for habit ${habitId} on ${todayKey}`);
        }

        const completionId = completionsResult.rows[0].id;
        console.log(`Found completion ${completionId} for habit ${habitId} on ${todayKey}`);

        // 3. Get the current total_completions
        const totalResult = await db.query(
            'SELECT total_completions FROM habits WHERE id = $1',
            [habitId]
        );

        const currentTotalCompletions = parseInt(totalResult.rows[0].total_completions, 10) || 0;
        console.log(`Habit ${habitId} current total completions: ${currentTotalCompletions}`);

        // 4. Soft delete the completion record
        console.log(`IMPORTANT: Soft deleting completion ${completionId} for habit ${habitId}`);

        await db.query(
            'UPDATE habit_completions SET deleted_at = NOW() WHERE id = $1',
            [completionId]
        );

        // 5. Decrement the total_completions counter
        const expectedNewTotal = Math.max(0, currentTotalCompletions - 1);
        console.log(`IMPORTANT: Decrementing total_completions for habit ${habitId} from ${currentTotalCompletions} to ${expectedNewTotal}`);

        const updateResult = await db.query(
            'UPDATE habits SET total_completions = GREATEST(0, total_completions - 1) WHERE id = $1 RETURNING total_completions',
            [habitId]
        );

        const newTotalCompletions = updateResult.rows[0].total_completions;
        console.log(`Habit ${habitId} total completions after decrement: ${newTotalCompletions}`);

        // 6. Get the updated completion count
        const updatedCompletionResult = await db.query(
            'SELECT COUNT(*) FROM habit_completions WHERE habit_id = $1 AND completion_date = $2 AND deleted_at IS NULL',
            [habitId, todayKey]
        );

        const updatedCompletionsToday = parseInt(updatedCompletionResult.rows[0].count, 10) || 0;
        console.log(`Habit ${habitId} now has ${updatedCompletionsToday} completions for today`);

        return {
            completions_today: updatedCompletionsToday,
            total_completions: newTotalCompletions,
            level: newTotalCompletions
        };
    } catch (error) {
        console.error(`Error removing completion for habit ${habitId}:`, error);
        throw error;
    }
}

module.exports = {
    getAllHabits,
    recordCompletion,
    removeCompletion
};
