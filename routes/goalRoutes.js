/**
 * Goal Routes
 * Defines API endpoints for goals
 */

const express = require('express');
const router = express.Router();
const GoalController = require('../controllers/goalController');

/**
 * @swagger
 * /api/goals:
 *   get:
 *     summary: Get all goals as a hierarchical tree
 *     tags: [Goals]
 *     responses:
 *       200:
 *         description: A hierarchical tree of goals
 *       500:
 *         description: Server error
 */
router.get('/', GoalController.getAllGoals);

/**
 * @swagger
 * /api/goals:
 *   post:
 *     summary: Create a new goal
 *     tags: [Goals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: The goal text
 *               parentId:
 *                 type: integer
 *                 description: The parent goal ID (null for root goals)
 *     responses:
 *       201:
 *         description: Goal created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', GoalController.createGoal);

/**
 * @swagger
 * /api/goals/insert-between:
 *   post:
 *     summary: Insert a new goal between a goal and its parent
 *     tags: [Goals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newGoalText
 *               - currentGoalId
 *             properties:
 *               newGoalText:
 *                 type: string
 *                 description: The text for the new goal
 *               currentGoalId:
 *                 type: integer
 *                 description: The ID of the goal below the insertion point
 *     responses:
 *       201:
 *         description: Goal inserted successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/insert-between', GoalController.insertGoalBetween);

/**
 * @swagger
 * /api/goals/promote/{id}:
 *   delete:
 *     summary: Delete a goal and promote its children to its parent
 *     tags: [Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The goal ID
 *     responses:
 *       200:
 *         description: Goal deleted and children promoted successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.delete('/promote/:id', GoalController.deleteGoalAndPromoteChildren);

/**
 * @swagger
 * /api/goals/{id}:
 *   delete:
 *     summary: Delete a goal and all its descendants
 *     tags: [Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The goal ID
 *     responses:
 *       200:
 *         description: Goal and descendants deleted successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Goal not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', GoalController.deleteGoalCascade);

/**
 * @swagger
 * /api/goals/{id}:
 *   put:
 *     summary: Update a goal's text
 *     tags: [Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The goal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: The new text for the goal
 *     responses:
 *       200:
 *         description: Goal updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Goal not found
 *       500:
 *         description: Server error
 */
router.put('/:id', GoalController.updateGoal);

/**
 * @swagger
 * /api/goals/complete/{id}:
 *   post:
 *     summary: Complete a goal and promote its children to its parent
 *     tags: [Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The goal ID
 *     responses:
 *       200:
 *         description: Goal completed successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Goal not found
 *       500:
 *         description: Server error
 */
router.post('/complete/:id', GoalController.completeGoal);

/**
 * @swagger
 * /api/goals/complete-chain/{id}:
 *   post:
 *     summary: Complete a goal and all its descendants
 *     tags: [Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The goal ID
 *     responses:
 *       200:
 *         description: Goal and descendants completed successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Goal not found
 *       500:
 *         description: Server error
 */
router.post('/complete-chain/:id', GoalController.completeGoalChain);

/**
 * @swagger
 * /api/goals/completed:
 *   get:
 *     summary: Get completed goals history
 *     tags: [Goals]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of completed goals to return
 *     responses:
 *       200:
 *         description: List of completed goals
 *       500:
 *         description: Server error
 */
router.get('/completed', GoalController.getCompletedGoals);

module.exports = router;
