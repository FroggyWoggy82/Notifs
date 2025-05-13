const express = require('express');
const router = express.Router();
const db = require('../utils/db');

/**
 * @swagger
 * /api/weight/goal/target-weight:
 *   post:
 *     summary: Save target weight only
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
 *               startWeight:
 *                 type: number
 *               startDate:
 *                 type: string
 *               user_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Target weight saved
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/goal/target-weight', async (req, res) => {
    try {
        const { targetWeight, weeklyGain, startWeight, startDate, user_id } = req.body;
        console.log(`Received POST /api/weight/goal/target-weight: target=${targetWeight}, gain=${weeklyGain}, startWeight=${startWeight}, startDate=${startDate}, user_id=${user_id}`);

        // Validate inputs
        if (targetWeight === undefined) {
            return res.status(400).json({ error: 'Target weight is required' });
        }

        const userIdNum = parseInt(user_id, 10) || 1;
        const targetWeightNum = parseFloat(targetWeight);
        const weeklyGainNum = parseFloat(weeklyGain) || 0;
        const startWeightNum = parseFloat(startWeight) || targetWeightNum;
        const startDateStr = startDate || new Date().toISOString().split('T')[0];

        if (isNaN(targetWeightNum) || targetWeightNum <= 0) {
            return res.status(400).json({ error: 'Invalid target weight' });
        }

        // Get the current weight goal to preserve the weekly gain value
        const currentGoalResult = await db.query(
            'SELECT weekly_gain_goal FROM weight_goals WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
            [userIdNum]
        );

        // Use the provided weekly gain or the current one from the database, or default to 0
        const finalWeeklyGain = weeklyGainNum || 
            (currentGoalResult.rows.length > 0 ? parseFloat(currentGoalResult.rows[0].weekly_gain_goal) : 0);

        // Insert the new weight goal with updated target weight
        const result = await db.query(
            'INSERT INTO weight_goals (user_id, target_weight, weekly_gain_goal, start_weight, start_date, updated_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
            [userIdNum, targetWeightNum, finalWeeklyGain, startWeightNum, startDateStr]
        );

        res.status(201).json({
            id: result.rows[0].id,
            target_weight: parseFloat(result.rows[0].target_weight),
            weekly_gain_goal: parseFloat(result.rows[0].weekly_gain_goal),
            start_weight: parseFloat(result.rows[0].start_weight),
            start_date: result.rows[0].start_date,
            updated_at: result.rows[0].updated_at
        });
    } catch (error) {
        console.error('Error saving target weight:', error);
        res.status(500).json({ error: 'Server error saving target weight' });
    }
});

/**
 * @swagger
 * /api/weight/goal/weekly-gain:
 *   post:
 *     summary: Save weekly gain goal only
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
 *               startWeight:
 *                 type: number
 *               startDate:
 *                 type: string
 *               user_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Weekly gain goal saved
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/goal/weekly-gain', async (req, res) => {
    try {
        const { targetWeight, weeklyGain, startWeight, startDate, user_id } = req.body;
        console.log(`Received POST /api/weight/goal/weekly-gain: target=${targetWeight}, gain=${weeklyGain}, startWeight=${startWeight}, startDate=${startDate}, user_id=${user_id}`);

        // Validate inputs
        if (weeklyGain === undefined) {
            return res.status(400).json({ error: 'Weekly gain goal is required' });
        }

        const userIdNum = parseInt(user_id, 10) || 1;
        const weeklyGainNum = parseFloat(weeklyGain);
        const targetWeightNum = parseFloat(targetWeight) || 0;
        const startWeightNum = parseFloat(startWeight) || targetWeightNum;
        const startDateStr = startDate || new Date().toISOString().split('T')[0];

        if (isNaN(weeklyGainNum) || weeklyGainNum === 0) {
            return res.status(400).json({ error: 'Invalid weekly gain goal' });
        }

        // Get the current weight goal to preserve the target weight value
        const currentGoalResult = await db.query(
            'SELECT target_weight FROM weight_goals WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
            [userIdNum]
        );

        // Use the provided target weight or the current one from the database, or default to 0
        const finalTargetWeight = targetWeightNum || 
            (currentGoalResult.rows.length > 0 ? parseFloat(currentGoalResult.rows[0].target_weight) : 0);

        // Insert the new weight goal with updated weekly gain
        const result = await db.query(
            'INSERT INTO weight_goals (user_id, target_weight, weekly_gain_goal, start_weight, start_date, updated_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
            [userIdNum, finalTargetWeight, weeklyGainNum, startWeightNum, startDateStr]
        );

        res.status(201).json({
            id: result.rows[0].id,
            target_weight: parseFloat(result.rows[0].target_weight),
            weekly_gain_goal: parseFloat(result.rows[0].weekly_gain_goal),
            start_weight: parseFloat(result.rows[0].start_weight),
            start_date: result.rows[0].start_date,
            updated_at: result.rows[0].updated_at
        });
    } catch (error) {
        console.error('Error saving weekly gain goal:', error);
        res.status(500).json({ error: 'Server error saving weekly gain goal' });
    }
});

module.exports = router;
