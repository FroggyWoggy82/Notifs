const express = require('express');
const WeightController = require('../controllers/weightController');

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
router.get('/goal', WeightController.getGoal);

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
router.post('/goal', WeightController.saveGoal);

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
 *     responses:
 *       200:
 *         description: Weight logs data
 *       400:
 *         description: Invalid user ID
 *       500:
 *         description: Server error
 */
router.get('/logs', WeightController.getLogs);

/**
 * @swagger
 * /api/weight/log:
 *   post:
 *     summary: Add a new weight log
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
 *         description: Weight log added
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/log', WeightController.addLog);

module.exports = router;
