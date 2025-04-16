const express = require('express');
const WeightController = require('../controllers/weightController');

const router = express.Router();

/**
 * @swagger
 * /api/calorie-targets/{userId}:
 *   get:
 *     summary: Get calorie target for a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: Calorie target data
 *       404:
 *         description: No calorie target found
 *       500:
 *         description: Server error
 */
router.get('/:userId', WeightController.getCalorieTarget);

/**
 * @swagger
 * /api/calorie-targets:
 *   post:
 *     summary: Save calorie target for a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               daily_target:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Calorie target saved
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', WeightController.saveCalorieTarget);

module.exports = router;
