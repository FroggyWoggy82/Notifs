/**
 * High Completion Habit Controller
 * This controller handles habits with very high completion targets
 */

const db = require('../utils/db');

/**
 * Increment a high-completion habit
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function incrementHighCompletionHabit(req, res) {
    const { id } = req.params;
    console.log(`Received POST /api/habits/${id}/high-completion-increment request`);

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
        
        // 2. Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // 3. Check if the habit is in the high_completion_habits table
        const highCompletionResult = await db.query(
            'SELECT * FROM high_completion_habits WHERE habit_id = $1',
            [id]
        );
        
        if (highCompletionResult.rows.length === 0) {
            // 4. If not, add it to the high_completion_habits table
            await db.query(
                'INSERT INTO high_completion_habits (habit_id, current_count, last_updated) VALUES ($1, 1, $2)',
                [id, today]
            );
            
            // 5. Update the habit's total_completions
            await db.query(
                'UPDATE habits SET total_completions = total_completions + 1 WHERE id = $1',
                [id]
            );
            
            // 6. Get the updated habit
            const updatedHabitResult = await db.query(
                'SELECT * FROM habits WHERE id = $1',
                [id]
            );
            
            const updatedHabit = updatedHabitResult.rows[0];
            
            return res.status(200).json({
                completions_today: 1,
                total_completions: updatedHabit.total_completions,
                level: updatedHabit.total_completions,
                is_complete: false
            });
        }
        
        // 7. If it is, increment the current_count
        const highCompletionHabit = highCompletionResult.rows[0];
        
        // 8. Check if the last_updated date is today
        if (highCompletionHabit.last_updated === today) {
            // 9. If it is, increment the current_count
            await db.query(
                'UPDATE high_completion_habits SET current_count = current_count + 1 WHERE habit_id = $1',
                [id]
            );
        } else {
            // 10. If not, reset the current_count to 1 and update the last_updated date
            await db.query(
                'UPDATE high_completion_habits SET current_count = 1, last_updated = $1 WHERE habit_id = $2',
                [today, id]
            );
        }
        
        // 11. Update the habit's total_completions
        await db.query(
            'UPDATE habits SET total_completions = total_completions + 1 WHERE id = $1',
            [id]
        );
        
        // 12. Get the updated habit and high_completion_habit
        const updatedHabitResult = await db.query(
            'SELECT * FROM habits WHERE id = $1',
            [id]
        );
        
        const updatedHighCompletionResult = await db.query(
            'SELECT * FROM high_completion_habits WHERE habit_id = $1',
            [id]
        );
        
        const updatedHabit = updatedHabitResult.rows[0];
        const updatedHighCompletionHabit = updatedHighCompletionResult.rows[0];
        
        return res.status(200).json({
            completions_today: updatedHighCompletionHabit.current_count,
            total_completions: updatedHabit.total_completions,
            level: updatedHabit.total_completions,
            is_complete: false
        });
    } catch (error) {
        console.error(`Error incrementing high-completion habit ${id}:`, error);
        
        res.status(500).json({
            error: 'Failed to increment high-completion habit',
            message: error.message,
            details: error.detail || 'No additional details available'
        });
    }
}

/**
 * Get the current count for a high-completion habit
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getHighCompletionHabitCount(req, res) {
    const { id } = req.params;
    console.log(`Received GET /api/habits/${id}/high-completion-count request`);

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
        
        // 2. Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // 3. Check if the habit is in the high_completion_habits table
        const highCompletionResult = await db.query(
            'SELECT * FROM high_completion_habits WHERE habit_id = $1',
            [id]
        );
        
        if (highCompletionResult.rows.length === 0) {
            // 4. If not, return 0 for completions_today
            return res.status(200).json({
                completions_today: 0,
                total_completions: habit.total_completions,
                level: habit.total_completions,
                is_complete: false
            });
        }
        
        // 5. If it is, check if the last_updated date is today
        const highCompletionHabit = highCompletionResult.rows[0];
        
        if (highCompletionHabit.last_updated === today) {
            // 6. If it is, return the current_count
            return res.status(200).json({
                completions_today: highCompletionHabit.current_count,
                total_completions: habit.total_completions,
                level: habit.total_completions,
                is_complete: false
            });
        } else {
            // 7. If not, return 0 for completions_today
            return res.status(200).json({
                completions_today: 0,
                total_completions: habit.total_completions,
                level: habit.total_completions,
                is_complete: false
            });
        }
    } catch (error) {
        console.error(`Error getting high-completion habit count for ${id}:`, error);
        
        res.status(500).json({
            error: 'Failed to get high-completion habit count',
            message: error.message,
            details: error.detail || 'No additional details available'
        });
    }
}

module.exports = {
    incrementHighCompletionHabit,
    getHighCompletionHabitCount
};
