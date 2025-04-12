/**
 * Habit Routes
 * Defines API endpoints for habits
 */

const express = require('express');
const router = express.Router();
const HabitController = require('../controllers/habitController');

/**
 * @swagger
 * /api/habits:
 *   get:
 *     summary: Get all habits with today's completion count and total completions
 *     tags: [Habits]
 *     responses:
 *       200:
 *         description: List of habits
 *       500:
 *         description: Server error
 */
// Get all habits with cache control headers
router.get('/', (req, res) => {
    // Set cache control headers to prevent caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    // Call the controller method
    HabitController.getAllHabits(req, res);
});

/**
 * @swagger
 * /api/habits:
 *   post:
 *     summary: Create a new habit
 *     tags: [Habits]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - frequency
 *             properties:
 *               title:
 *                 type: string
 *                 description: The habit title
 *               frequency:
 *                 type: string
 *                 enum: [daily, weekly, monthly]
 *                 description: The habit frequency
 *               completions_per_day:
 *                 type: integer
 *                 description: The number of completions per day (for daily habits)
 *     responses:
 *       201:
 *         description: Habit created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', HabitController.createHabit);

/**
 * @swagger
 * /api/habits/{id}:
 *   put:
 *     summary: Update a habit
 *     tags: [Habits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The habit ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - frequency
 *             properties:
 *               title:
 *                 type: string
 *                 description: The habit title
 *               frequency:
 *                 type: string
 *                 enum: [daily, weekly, monthly]
 *                 description: The habit frequency
 *               completions_per_day:
 *                 type: integer
 *                 description: The number of completions per day (for daily habits)
 *     responses:
 *       200:
 *         description: Habit updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Habit not found
 *       500:
 *         description: Server error
 */
router.put('/:id', HabitController.updateHabit);

/**
 * @swagger
 * /api/habits/{id}:
 *   delete:
 *     summary: Delete a habit
 *     tags: [Habits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The habit ID
 *     responses:
 *       200:
 *         description: Habit deleted successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Habit not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', HabitController.deleteHabit);

/**
 * @swagger
 * /api/habits/{id}/complete:
 *   post:
 *     summary: Record a habit completion
 *     tags: [Habits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The habit ID
 *     responses:
 *       201:
 *         description: Completion recorded successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Habit not found
 *       409:
 *         description: Maximum completions reached or already recorded
 *       500:
 *         description: Server error
 */
// Record a habit completion with cache control headers
router.post('/:id/complete', (req, res) => {
    // Set cache control headers to prevent caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    // Call the controller method
    HabitController.recordCompletion(req, res);
});

/**
 * @swagger
 * /api/habits/{id}/update-total:
 *   post:
 *     summary: Directly update total completions for a habit
 *     tags: [Habits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The habit ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               increment:
 *                 type: integer
 *                 description: "The amount to increment (default: 1)"
 *                 default: 1
 *     responses:
 *       200:
 *         description: Total completions updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Habit not found
 *       500:
 *         description: Server error
 */
// Update total completions directly with cache control headers
router.post('/:id/update-total', (req, res) => {
    // Set cache control headers to prevent caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    // Call the controller method
    HabitController.updateTotalCompletions(req, res);
});

module.exports = router;
