/**
 * Habit Reset Routes
 * Handles routes for resetting habit completions
 */

const express = require('express');
const router = express.Router();
const resetHabitCompletions = require('../utils/reset-habit-completions');

/**
 * @swagger
 * /api/habit-reset:
 *   post:
 *     summary: Reset all habit completions for today
 *     responses:
 *       200:
 *         description: Habits reset successfully
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
    try {
        console.log('Manual habit reset requested via API');
        await resetHabitCompletions();
        res.json({ 
            success: true, 
            message: 'Habit completions reset successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error resetting habit completions:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to reset habit completions',
            message: error.message
        });
    }
});

/**
 * @swagger
 * /api/habit-reset/status:
 *   get:
 *     summary: Get the last reset timestamp
 *     responses:
 *       200:
 *         description: Last reset timestamp
 *       500:
 *         description: Server error
 */
router.get('/status', (req, res) => {
    // This is a simple endpoint to check if the reset route is working
    res.json({ 
        status: 'active',
        serverTime: new Date().toISOString(),
        serverTimezoneName: 'America/Chicago'
    });
});

module.exports = router;
