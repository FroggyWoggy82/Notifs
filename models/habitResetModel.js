/**
 * Habit Reset Model
 * Handles daily reset of habit completion counts
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
 * Reset daily habit progress
 * This doesn't delete any data, it just ensures the UI will show 0 completions for today
 * by checking against the current date
 * @returns {Promise<Object>} - Promise resolving to reset status
 */
async function resetDailyHabitProgress() {
    const todayKey = getTodayDateKey();
    console.log(`Resetting daily habit progress for date: ${todayKey}`);
    
    try {
        // We don't actually need to delete anything - the system already tracks completions by date
        // This function is mainly for logging purposes and potential future enhancements
        
        // Get current habit counts for logging
        const result = await db.query(
            `SELECT
                h.id,
                h.title,
                COUNT(DISTINCT CASE WHEN hc.completion_date = $1 THEN hc.id ELSE NULL END) AS completions_today
             FROM habits h
             LEFT JOIN habit_completions hc ON h.id = hc.habit_id
             GROUP BY h.id`,
            [todayKey]
        );
        
        console.log(`Found ${result.rows.length} habits with completion data for today`);
        
        return {
            status: 'success',
            message: `Daily habit progress tracking reset for ${todayKey}`,
            date: todayKey,
            habitsChecked: result.rows.length
        };
    } catch (error) {
        console.error('Error resetting daily habit progress:', error);
        throw error;
    }
}

module.exports = {
    resetDailyHabitProgress
};
