const express = require('express');
const TaskController = require('../controllers/taskController');

const router = express.Router();

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     responses:
 *       200:
 *         description: List of tasks
 *       500:
 *         description: Server error
 */
router.get('/', TaskController.getAllTasks);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               reminderTime:
 *                 type: string
 *               assignedDate:
 *                 type: string
 *                 format: date
 *               dueDate:
 *                 type: string
 *                 format: date
 *               recurrenceType:
 *                 type: string
 *               recurrenceInterval:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Task created
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', TaskController.createTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               reminderTime:
 *                 type: string
 *               is_complete:
 *                 type: boolean
 *               assignedDate:
 *                 type: string
 *                 format: date
 *               dueDate:
 *                 type: string
 *                 format: date
 *               recurrenceType:
 *                 type: string
 *               recurrenceInterval:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Task updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.put('/:id', TaskController.updateTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted
 *       400:
 *         description: Invalid task ID
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', TaskController.deleteTask);

/**
 * @swagger
 * /api/tasks/{id}/toggle-completion:
 *   patch:
 *     summary: Toggle task completion status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_complete:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Task completion toggled
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/toggle-completion', TaskController.toggleCompletion);

module.exports = router;
