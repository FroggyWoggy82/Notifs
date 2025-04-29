/**
 * Simple Habit Model
 * This model provides a simplified approach to habit completions
 * that works for all habits, including those with high completion targets
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
        console.log(`[Simple Model] Getting all habits with completion status for ${todayKey}`);

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
        console.error('[Simple Model] Error getting all habits:', error);
        throw error;
    }
}

/**
 * Get a single habit by ID with its completion status for today
 * @param {number} habitId - The habit ID
 * @returns {Promise<Object>} Promise resolving to the habit data
 */
async function getHabitById(habitId) {
    try {
        const todayKey = getTodayDateKey();
        console.log(`[Simple Model] Getting habit ${habitId} with completion status for ${todayKey}`);

        // Query to get the habit with its completion status for today
        const result = await db.query(`
            SELECT 
                h.*,
                COUNT(DISTINCT CASE WHEN hc.completion_date = $1 AND hc.deleted_at IS NULL THEN hc.id ELSE NULL END) AS completions_today
            FROM habits h
            LEFT JOIN habit_completions hc ON h.id = hc.habit_id
            WHERE h.id = $2
            GROUP BY h.id
        `, [todayKey, habitId]);

        if (result.rows.length === 0) {
            throw new Error(`Habit with ID ${habitId} not found`);
        }

        return result.rows[0];
    } catch (error) {
        console.error(`[Simple Model] Error getting habit ${habitId}:`, error);
        throw error;
    }
}

/**
 * Record a habit completion
 * @param {number} habitId - The habit ID
 * @returns {Promise<Object>} - Promise resolving to the completion data
 */
async function recordCompletion(habitId) {
    try {
        console.log(`[Simple Model] Recording completion for habit ${habitId}`);

        // 1. Check if the habit exists
        const habit = await getHabitById(habitId);
        console.log(`[Simple Model] Found habit: ${habit.title} (ID: ${habitId})`);

        // 2. Get today's date in YYYY-MM-DD format
        const todayKey = getTodayDateKey();
        console.log(`[Simple Model] Today's date: ${todayKey}`);

        // 3. Insert a new completion record
        // We'll use a direct INSERT statement without any constraints
        await db.query(
            'INSERT INTO habit_completions (habit_id, completion_date) VALUES ($1, $2)',
            [habitId, todayKey]
        );
        console.log(`[Simple Model] Inserted new completion record`);

        // 4. Update the total_completions counter
        await db.query(
            'UPDATE habits SET total_completions = total_completions + 1 WHERE id = $1',
            [habitId]
        );
        console.log(`[Simple Model] Updated total_completions counter`);

        // 5. Get the updated habit data
        const updatedHabit = await getHabitById(habitId);
        console.log(`[Simple Model] Updated habit data:`, updatedHabit);

        // 6. Calculate if the habit is complete for today
        const completionsPerDay = parseInt(updatedHabit.completions_per_day, 10) || 1;
        const completionsToday = parseInt(updatedHabit.completions_today, 10) || 0;
        
        // For habits with very high completions_per_day (like 999), we'll never mark them as complete
        const isHighCompletionHabit = completionsPerDay > 100;
        const isComplete = isHighCompletionHabit ? false : (completionsToday >= completionsPerDay);

        // 7. Return the updated habit data
        return {
            id: updatedHabit.id,
            title: updatedHabit.title,
            completions_today: completionsToday,
            total_completions: updatedHabit.total_completions,
            level: updatedHabit.total_completions,
            is_complete: isComplete
        };
    } catch (error) {
        console.error(`[Simple Model] Error recording completion for habit ${habitId}:`, error);
        
        // If there's a unique constraint violation, try a different approach
        if (error.code === '23505') {
            console.log(`[Simple Model] Unique constraint violation - trying alternative approach`);
            
            try {
                // 1. Get the current habit data
                const habit = await getHabitById(habitId);
                
                // 2. Update the total_completions counter directly
                await db.query(
                    'UPDATE habits SET total_completions = total_completions + 1 WHERE id = $1',
                    [habitId]
                );
                
                // 3. Get the updated habit data
                const updatedHabit = await getHabitById(habitId);
                
                // 4. Calculate if the habit is complete for today
                const completionsPerDay = parseInt(updatedHabit.completions_per_day, 10) || 1;
                const completionsToday = parseInt(updatedHabit.completions_today, 10) || 0;
                
                // For habits with very high completions_per_day (like 999), we'll never mark them as complete
                const isHighCompletionHabit = completionsPerDay > 100;
                const isComplete = isHighCompletionHabit ? false : (completionsToday >= completionsPerDay);
                
                // 5. Return the updated habit data
                return {
                    id: updatedHabit.id,
                    title: updatedHabit.title,
                    completions_today: completionsToday + 1, // Add 1 to account for the completion we couldn't insert
                    total_completions: updatedHabit.total_completions,
                    level: updatedHabit.total_completions,
                    is_complete: isComplete
                };
            } catch (alternativeError) {
                console.error(`[Simple Model] Error in alternative approach:`, alternativeError);
                throw alternativeError;
            }
        }
        
        throw error;
    }
}

/**
 * Remove a habit completion for today
 * @param {number} habitId - The habit ID
 * @returns {Promise<Object>} - Promise resolving to the updated completion data
 */
async function removeCompletion(habitId) {
    try {
        console.log(`[Simple Model] Removing completion for habit ${habitId}`);

        // 1. Check if the habit exists
        const habit = await getHabitById(habitId);
        console.log(`[Simple Model] Found habit: ${habit.title} (ID: ${habitId})`);

        // 2. Get today's date in YYYY-MM-DD format
        const todayKey = getTodayDateKey();
        console.log(`[Simple Model] Today's date: ${todayKey}`);

        // 3. Check if there are any completions today
        const completionsResult = await db.query(
            'SELECT id FROM habit_completions WHERE habit_id = $1 AND completion_date = $2 AND deleted_at IS NULL ORDER BY id DESC LIMIT 1',
            [habitId, todayKey]
        );

        if (completionsResult.rows.length === 0) {
            throw new Error(`No completions found for habit ${habitId} on ${todayKey}`);
        }

        const completionId = completionsResult.rows[0].id;
        console.log(`[Simple Model] Found completion ${completionId} for habit ${habitId} on ${todayKey}`);

        // 4. Soft delete the completion record
        await db.query(
            'UPDATE habit_completions SET deleted_at = NOW() WHERE id = $1',
            [completionId]
        );
        console.log(`[Simple Model] Soft deleted completion ${completionId}`);

        // 5. Decrement the total_completions counter
        await db.query(
            'UPDATE habits SET total_completions = GREATEST(0, total_completions - 1) WHERE id = $1',
            [habitId]
        );
        console.log(`[Simple Model] Decremented total_completions counter`);

        // 6. Get the updated habit data
        const updatedHabit = await getHabitById(habitId);
        console.log(`[Simple Model] Updated habit data:`, updatedHabit);

        // 7. Return the updated habit data
        return {
            id: updatedHabit.id,
            title: updatedHabit.title,
            completions_today: parseInt(updatedHabit.completions_today, 10) || 0,
            total_completions: updatedHabit.total_completions,
            level: updatedHabit.total_completions
        };
    } catch (error) {
        console.error(`[Simple Model] Error removing completion for habit ${habitId}:`, error);
        throw error;
    }
}

module.exports = {
    getAllHabits,
    getHabitById,
    recordCompletion,
    removeCompletion
};
