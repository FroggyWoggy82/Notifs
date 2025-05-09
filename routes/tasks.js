const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/taskController');
const db = require('../utils/db');

// Get all tasks
router.get('/', TaskController.getAllTasks);

// Create a new task
router.post('/', TaskController.createTask);

// Get a specific task
router.get('/:id', TaskController.getTaskById);

// Get subtasks for a parent task
router.get('/:id/subtasks', TaskController.getSubtasks);

// Update a task
router.put('/:id', TaskController.updateTask);

// Delete a task
router.delete('/:id', TaskController.deleteTask);

// Toggle task completion
router.patch('/:id/toggle-completion', TaskController.toggleCompletion);

// Create next occurrence of a recurring task
router.post('/:id/next-occurrence', TaskController.createNextOccurrence);

// Adjust future recurrences based on today's date
router.post('/:id/adjust-recurrences', TaskController.adjustRecurrences);

module.exports = router;
