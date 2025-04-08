/**
 * Simple weight routes that don't depend on any other modules
 */

const express = require('express');
const router = express.Router();

// Mock data for testing
const mockWeightGoal = {
    targetWeight: 70,
    weeklyGain: 0.5
};

const mockWeightLogs = [
    { id: 1, weight: 68.5, date: '2025-04-01' },
    { id: 2, weight: 69.0, date: '2025-04-05' },
    { id: 3, weight: 69.2, date: '2025-04-08' }
];

/**
 * @swagger
 * /api/weight/goal:
 *   get:
 *     summary: Get weight goal for a user
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: User ID (defaults to 1)
 *     responses:
 *       200:
 *         description: Weight goal data
 *       400:
 *         description: Invalid user ID
 *       500:
 *         description: Server error
 */
router.get('/goal', (req, res) => {
    try {
        // Get user_id from query parameter, default to 1 if not provided
        const userId = req.query.user_id || req.query.userId || 1;
        console.log(`Received GET /api/weight/goal for user_id: ${userId}`);
        
        // Return mock data
        res.json(mockWeightGoal);
    } catch (error) {
        console.error('Error getting weight goal:', error);
        res.status(500).json({ error: 'Server error getting weight goal' });
    }
});

/**
 * @swagger
 * /api/weight/goal:
 *   post:
 *     summary: Save weight goal for a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetWeight:
 *                 type: number
 *               weeklyGain:
 *                 type: number
 *               user_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Weight goal saved
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/goal', (req, res) => {
    try {
        const { targetWeight, weeklyGain, user_id } = req.body;
        const userId = user_id || 1; // Default to user 1 if not specified
        
        console.log(`Received POST /api/weight/goal: targetWeight=${targetWeight}, weeklyGain=${weeklyGain}, user_id=${userId}`);
        
        // Update mock data
        mockWeightGoal.targetWeight = parseFloat(targetWeight);
        mockWeightGoal.weeklyGain = parseFloat(weeklyGain);
        
        res.status(201).json({
            id: 1,
            targetWeight: mockWeightGoal.targetWeight,
            weeklyGain: mockWeightGoal.weeklyGain,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error saving weight goal:', error);
        res.status(500).json({ error: 'Server error saving weight goal' });
    }
});

/**
 * @swagger
 * /api/weight/logs:
 *   get:
 *     summary: Get weight logs for a user
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: User ID (defaults to 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of logs to return (defaults to 30)
 *     responses:
 *       200:
 *         description: Weight logs data
 *       400:
 *         description: Invalid user ID
 *       500:
 *         description: Server error
 */
router.get('/logs', (req, res) => {
    try {
        const userId = req.query.user_id || req.query.userId || 1;
        const limit = req.query.limit || 30;
        
        console.log(`Received GET /api/weight/logs for user_id: ${userId}, limit: ${limit}`);
        
        // Return mock data
        res.json(mockWeightLogs);
    } catch (error) {
        console.error('Error getting weight logs:', error);
        res.status(500).json({ error: 'Server error getting weight logs' });
    }
});

/**
 * @swagger
 * /api/weight/log:
 *   post:
 *     summary: Save a weight log entry
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               weight:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date
 *               user_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Weight log saved
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/log', (req, res) => {
    try {
        const { weight, date, user_id } = req.body;
        const userId = user_id || 1; // Default to user 1 if not specified
        const logDate = date || new Date().toISOString().split('T')[0]; // Default to today if not specified
        
        console.log(`Received POST /api/weight/log: weight=${weight}, date=${logDate}, user_id=${userId}`);
        
        // Create a new log entry
        const newLog = {
            id: mockWeightLogs.length + 1,
            weight: parseFloat(weight),
            date: logDate
        };
        
        // Add to mock data
        mockWeightLogs.push(newLog);
        
        res.status(201).json(newLog);
    } catch (error) {
        console.error('Error saving weight log:', error);
        res.status(500).json({ error: 'Server error saving weight log' });
    }
});

module.exports = router;
