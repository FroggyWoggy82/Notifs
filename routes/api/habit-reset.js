/**
 * Habit Reset API
 * Endpoint to reset habit completions
 */

const express = require('express');
const router = express.Router();
const resetHabitCompletions = require('../../utils/reset-habit-completions');

/**
 * @route   POST /api/habit-reset
 * @desc    Reset all habit completions for today
 * @access  Public
 */
router.post('/', async (req, res) => {
    try {
        console.log('API: Resetting habit completions...');
        
        // Call the reset function
        const result = await resetHabitCompletions();
        
        console.log('API: Habit completions reset successfully:', result);
        
        // Return success response
        return res.status(200).json({
            success: true,
            message: 'Habit completions reset successfully',
            result
        });
    } catch (error) {
        console.error('API Error: Failed to reset habit completions:', error);
        
        // Return error response
        return res.status(500).json({
            success: false,
            message: 'Failed to reset habit completions',
            error: error.message
        });
    }
});

module.exports = router;
