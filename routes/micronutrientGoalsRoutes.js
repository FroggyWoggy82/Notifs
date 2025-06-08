const express = require('express');
const MicronutrientGoalsController = require('../controllers/micronutrientGoalsController');

const router = express.Router();

/**
 * @swagger
 * /api/micronutrient-goals/defaults:
 *   get:
 *     summary: Get default micronutrient goals (RDA values)
 *     responses:
 *       200:
 *         description: Default micronutrient goals
 *       500:
 *         description: Server error
 */
router.get('/defaults', MicronutrientGoalsController.getDefaultGoals);

/**
 * @swagger
 * /api/micronutrient-goals/{userId}:
 *   get:
 *     summary: Get micronutrient goals for a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: Micronutrient goals data
 *       400:
 *         description: Invalid user ID
 *       500:
 *         description: Server error
 */
router.get('/:userId', MicronutrientGoalsController.getMicronutrientGoals);

/**
 * @swagger
 * /api/micronutrient-goals:
 *   post:
 *     summary: Save micronutrient goals for a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               vitamin_a:
 *                 type: number
 *               vitamin_c:
 *                 type: number
 *               vitamin_d:
 *                 type: number
 *               # ... other micronutrients
 *     responses:
 *       200:
 *         description: Micronutrient goals saved successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', MicronutrientGoalsController.saveMicronutrientGoals);

module.exports = router;
