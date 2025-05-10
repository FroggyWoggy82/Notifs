/**
 * Social Media Rejection Habit Controller
 * 
 * This controller provides special handling for the Social Media Rejection habit
 * to ensure its level is properly saved and retrieved.
 */

const db = require('../utils/db');

/**
 * Get the Social Media Rejection habit data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getSocialMediaRejectionHabit(req, res) {
    try {
        // Find the Social Media Rejection habit
        const habitResult = await db.query(
            "SELECT * FROM habits WHERE title LIKE 'Social Media Rejection%'"
        );
        
        if (habitResult.rows.length === 0) {
            return res.status(404).json({ error: 'Social Media Rejection habit not found' });
        }
        
        const habit = habitResult.rows[0];
        
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Get completions for today
        const completionsResult = await db.query(
            'SELECT COUNT(*) FROM habit_completions WHERE habit_id = $1 AND completion_date = $2 AND deleted_at IS NULL',
            [habit.id, today]
        );
        
        const completionsToday = parseInt(completionsResult.rows[0].count, 10);
        
        // Return the habit data with completions_today and level
        return res.status(200).json({
            id: habit.id,
            title: habit.title,
            frequency: habit.frequency,
            completions_per_day: habit.completions_per_day,
            completions_today: completionsToday,
            total_completions: habit.total_completions,
            level: habit.total_completions,
            is_complete: completionsToday >= habit.completions_per_day
        });
    } catch (error) {
        console.error('Error getting Social Media Rejection habit:', error);
        return res.status(500).json({ error: 'Failed to get Social Media Rejection habit' });
    }
}

/**
 * Record a completion for the Social Media Rejection habit
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function recordSocialMediaRejectionCompletion(req, res) {
    try {
        // Find the Social Media Rejection habit
        const habitResult = await db.query(
            "SELECT * FROM habits WHERE title LIKE 'Social Media Rejection%'"
        );
        
        if (habitResult.rows.length === 0) {
            return res.status(404).json({ error: 'Social Media Rejection habit not found' });
        }
        
        const habit = habitResult.rows[0];
        
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Get completions for today
        const completionsResult = await db.query(
            'SELECT COUNT(*) FROM habit_completions WHERE habit_id = $1 AND completion_date = $2 AND deleted_at IS NULL',
            [habit.id, today]
        );
        
        const completionsToday = parseInt(completionsResult.rows[0].count, 10);
        
        // Check if we've already reached the maximum completions for today
        if (completionsToday >= habit.completions_per_day) {
            return res.status(409).json({
                error: 'Daily completion target already met',
                message: `Maximum completions (${habit.completions_per_day}) already reached for today`
            });
        }
        
        // Record the completion
        await db.query(
            'INSERT INTO habit_completions (habit_id, completion_date) VALUES ($1, $2)',
            [habit.id, today]
        );
        
        // Increment the total_completions counter
        const updateResult = await db.query(
            'UPDATE habits SET total_completions = total_completions + 1 WHERE id = $1 RETURNING total_completions',
            [habit.id]
        );
        
        const newTotalCompletions = updateResult.rows[0].total_completions;
        
        // Get the updated completions count
        const updatedCompletionsResult = await db.query(
            'SELECT COUNT(*) FROM habit_completions WHERE habit_id = $1 AND completion_date = $2 AND deleted_at IS NULL',
            [habit.id, today]
        );
        
        const updatedCompletionsToday = parseInt(updatedCompletionsResult.rows[0].count, 10);
        
        // Return the updated habit data
        return res.status(200).json({
            completions_today: updatedCompletionsToday,
            total_completions: newTotalCompletions,
            level: newTotalCompletions,
            is_complete: updatedCompletionsToday >= habit.completions_per_day
        });
    } catch (error) {
        console.error('Error recording Social Media Rejection completion:', error);
        return res.status(500).json({ error: 'Failed to record Social Media Rejection completion' });
    }
}

module.exports = {
    getSocialMediaRejectionHabit,
    recordSocialMediaRejectionCompletion
};
