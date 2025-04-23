const express = require('express');
const db = require('../utils/db');

const router = express.Router();

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
router.get('/goal', async (req, res) => {
    try {
        // Get user_id from query parameter, default to 1 if not provided
        const userId = req.query.user_id || req.query.userId || 1;
        console.log(`Received GET /api/weight/goal for user_id: ${userId}`);

        // Ensure userId is a number
        const userIdNum = parseInt(userId, 10);
        if (isNaN(userIdNum) || userIdNum < 1) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Query the database for the user's weight goal
        const result = await db.query(
            'SELECT target_weight, weekly_gain_goal FROM weight_goals WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
            [userIdNum]
        );

        if (result.rows.length > 0) {
            return res.json({
                targetWeight: parseFloat(result.rows[0].target_weight),
                weeklyGain: parseFloat(result.rows[0].weekly_gain_goal)
            });
        } else {
            // No goal found, return default values
            return res.json({
                targetWeight: 0,
                weeklyGain: 0
            });
        }
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
router.post('/goal', async (req, res) => {
    try {
        const { targetWeight, weeklyGain, user_id } = req.body;
        const userId = user_id || 1; // Default to user 1 if not specified

        console.log(`Received POST /api/weight/goal: targetWeight=${targetWeight}, weeklyGain=${weeklyGain}, user_id=${userId}`);

        // Validate inputs
        if (targetWeight === undefined || weeklyGain === undefined) {
            return res.status(400).json({ error: 'Target weight and weekly gain are required' });
        }

        const targetWeightNum = parseFloat(targetWeight);
        const weeklyGainNum = parseFloat(weeklyGain);
        const userIdNum = parseInt(userId, 10);

        if (isNaN(targetWeightNum) || isNaN(weeklyGainNum) || isNaN(userIdNum) || userIdNum < 1) {
            return res.status(400).json({ error: 'Invalid input values' });
        }

        // Insert the new weight goal
        const result = await db.query(
            'INSERT INTO weight_goals (user_id, target_weight, weekly_gain_goal, updated_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
            [userIdNum, targetWeightNum, weeklyGainNum]
        );

        res.status(201).json({
            id: result.rows[0].id,
            targetWeight: parseFloat(result.rows[0].target_weight),
            weeklyGain: parseFloat(result.rows[0].weekly_gain_goal),
            updatedAt: result.rows[0].updated_at
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
router.get('/logs', async (req, res) => {
    try {
        const userId = req.query.user_id || req.query.userId || 1;
        const limit = req.query.limit || 30;

        console.log(`Received GET /api/weight/logs for user_id: ${userId}, limit: ${limit}`);

        // Ensure userId is a number
        const userIdNum = parseInt(userId, 10);
        const limitNum = parseInt(limit, 10);

        if (isNaN(userIdNum) || userIdNum < 1) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Query the database for the user's weight logs
        const result = await db.query(
            'SELECT id, weight, log_date FROM weight_logs WHERE user_id = $1 ORDER BY log_date DESC LIMIT $2',
            [userIdNum, limitNum]
        );

        // Format the response
        const logs = result.rows.map(row => ({
            id: row.id,
            weight: parseFloat(row.weight),
            date: row.log_date
        }));

        res.json(logs);
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
router.post('/log', async (req, res) => {
    try {
        const { weight, date, user_id } = req.body;
        const userId = user_id || 1; // Default to user 1 if not specified
        const logDate = date || new Date().toISOString().split('T')[0]; // Default to today if not specified

        console.log(`Received POST /api/weight/log: weight=${weight}, date=${logDate}, user_id=${userId}`);

        // Validate inputs
        if (weight === undefined) {
            return res.status(400).json({ error: 'Weight is required' });
        }

        const weightNum = parseFloat(weight);
        const userIdNum = parseInt(userId, 10);

        if (isNaN(weightNum) || isNaN(userIdNum) || userIdNum < 1) {
            return res.status(400).json({ error: 'Invalid input values' });
        }

        // Insert the new weight log
        const result = await db.query(
            'INSERT INTO weight_logs (user_id, weight, log_date) VALUES ($1, $2, $3) RETURNING *',
            [userIdNum, weightNum, logDate]
        );

        res.status(201).json({
            id: result.rows[0].id,
            weight: parseFloat(result.rows[0].weight),
            date: result.rows[0].log_date
        });
    } catch (error) {
        console.error('Error saving weight log:', error);
        res.status(500).json({ error: 'Server error saving weight log' });
    }
});

module.exports = router;