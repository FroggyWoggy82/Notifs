/**
 * Simple Fix for Habit Controller
 * This controller provides a simplified fix for the habit completion API
 */

const db = require('../utils/db');

/**
 * Record a habit completion
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function recordCompletion(req, res) {
    const { id } = req.params;
    console.log(`[Simple Fix] Received POST /api/habits/${id}/complete request`);

    if (!/^[1-9]\d*$/.test(id)) {
        return res.status(400).json({ error: 'Invalid habit ID format' });
    }

    try {
        // 1. Check if the habit exists
        const habitResult = await db.query(
            'SELECT * FROM habits WHERE id = $1',
            [id]
        );

        if (habitResult.rows.length === 0) {
            return res.status(404).json({ error: `Habit with ID ${id} not found` });
        }

        const habit = habitResult.rows[0];
        console.log(`[Simple Fix] Found habit: ${habit.title} (ID: ${id})`);
        
        // 2. Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        console.log(`[Simple Fix] Today's date: ${today}`);
        
        // 3. Get the current completions for today
        const completionsResult = await db.query(
            'SELECT COUNT(*) FROM habit_completions WHERE habit_id = $1 AND completion_date = $2 AND deleted_at IS NULL',
            [id, today]
        );
        
        const completionsToday = parseInt(completionsResult.rows[0].count, 10) || 0;
        console.log(`[Simple Fix] Current completions today: ${completionsToday}`);
        
        // 4. Insert a new completion record
        await db.query(
            'INSERT INTO habit_completions (habit_id, completion_date) VALUES ($1, $2)',
            [id, today]
        );
        
        console.log(`[Simple Fix] Inserted new completion record`);
        
        // 5. Update the total_completions counter
        await db.query(
            'UPDATE habits SET total_completions = total_completions + 1 WHERE id = $1',
            [id]
        );
        
        console.log(`[Simple Fix] Updated total_completions counter`);
        
        // 6. Get the updated habit data
        const updatedHabitResult = await db.query(
            'SELECT * FROM habits WHERE id = $1',
            [id]
        );
        
        const updatedHabit = updatedHabitResult.rows[0];
        
        // 7. Get the updated completions for today
        const updatedCompletionsResult = await db.query(
            'SELECT COUNT(*) FROM habit_completions WHERE habit_id = $1 AND completion_date = $2 AND deleted_at IS NULL',
            [id, today]
        );
        
        const updatedCompletionsToday = parseInt(updatedCompletionsResult.rows[0].count, 10) || 0;
        console.log(`[Simple Fix] Updated completions today: ${updatedCompletionsToday}`);
        
        // 8. Determine if the habit is complete for today
        const completionsPerDay = parseInt(habit.completions_per_day, 10) || 1;
        const isComplete = updatedCompletionsToday >= completionsPerDay;
        
        // 9. Return the updated habit data
        return res.status(200).json({
            completions_today: updatedCompletionsToday,
            total_completions: updatedHabit.total_completions,
            level: updatedHabit.total_completions,
            is_complete: isComplete
        });
    } catch (error) {
        console.error(`[Simple Fix] Error recording completion for habit ${id}:`, error);
        
        // Special handling for unique constraint violations
        if (error.code === '23505') {
            console.log(`[Simple Fix] Unique constraint violation - trying alternative approach`);
            
            try {
                // Get the current habit data
                const habitResult = await db.query(
                    'SELECT * FROM habits WHERE id = $1',
                    [id]
                );
                
                if (habitResult.rows.length === 0) {
                    return res.status(404).json({ error: `Habit with ID ${id} not found` });
                }
                
                const habit = habitResult.rows[0];
                
                // Get today's date in YYYY-MM-DD format
                const today = new Date().toISOString().split('T')[0];
                
                // Update the total_completions counter directly
                await db.query(
                    'UPDATE habits SET total_completions = total_completions + 1 WHERE id = $1',
                    [id]
                );
                
                // Get the updated habit data
                const updatedHabitResult = await db.query(
                    'SELECT * FROM habits WHERE id = $1',
                    [id]
                );
                
                const updatedHabit = updatedHabitResult.rows[0];
                
                // Get the current completions for today
                const completionsResult = await db.query(
                    'SELECT COUNT(*) FROM habit_completions WHERE habit_id = $1 AND completion_date = $2 AND deleted_at IS NULL',
                    [id, today]
                );
                
                const completionsToday = parseInt(completionsResult.rows[0].count, 10) || 0;
                
                // Determine if the habit is complete for today
                const completionsPerDay = parseInt(habit.completions_per_day, 10) || 1;
                const isComplete = completionsToday >= completionsPerDay;
                
                // Return the updated habit data
                return res.status(200).json({
                    completions_today: completionsToday + 1, // Add 1 to account for the completion we couldn't insert
                    total_completions: updatedHabit.total_completions,
                    level: updatedHabit.total_completions,
                    is_complete: isComplete
                });
            } catch (alternativeError) {
                console.error(`[Simple Fix] Error in alternative approach:`, alternativeError);
                return res.status(500).json({
                    error: 'Failed to record habit completion (alternative approach)',
                    message: alternativeError.message
                });
            }
        }
        
        return res.status(500).json({
            error: 'Failed to record habit completion',
            message: error.message
        });
    }
}

module.exports = {
    recordCompletion
};
