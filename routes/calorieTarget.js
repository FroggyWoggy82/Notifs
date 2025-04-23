const express = require('express');
const CalorieTargetController = require('../controllers/calorieTargetController');

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
router.get('/:userId', CalorieTargetController.getCalorieTarget);

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
router.post('/', CalorieTargetController.saveCalorieTarget);

// Log all routes for debugging
console.log('Calorie Target Routes:');
router.stack.forEach((r) => {
    if (r.route && r.route.path) {
        Object.keys(r.route.methods).forEach((method) => {
            console.log(`${method.toUpperCase()} /api/calorie-targets${r.route.path}`);
        });
    }
});

module.exports = router;
