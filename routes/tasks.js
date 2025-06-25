const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/taskController');
const db = require('../utils/db');

console.log('DEBUG: Loading tasks.js routes file');

// Test route to debug routing issue (MUST BE FIRST)
router.get('/test-route', (req, res) => {
    console.log('DEBUG: Hit test route');
    res.json({ message: 'Test route works!' });
});

console.log('DEBUG: Test route registered');

// Get all tasks
router.get('/', TaskController.getAllTasks);

// Get weekly complete list
router.get('/weekly-complete-list', TaskController.getWeeklyCompleteList);

// Batch update task priorities (must be before /:id routes)
router.post('/batch-priority', TaskController.batchUpdateTaskPriorities);

// Create a new task
router.post('/', TaskController.createTask);

// Get tasks for priority comparison (must be before /:id route)
router.get('/:id/priority-comparison', (req, res) => {
    console.log(`DEBUG: Hit priority-comparison route with ID: ${req.params.id}`);
    TaskController.getTasksForPriorityComparison(req, res);
});

// Get a specific task
router.get('/:id', TaskController.getTaskById);

// Get subtasks for a parent task
router.get('/:id/subtasks', TaskController.getSubtasks);

// Create a subtask for a parent task
router.post('/:id/subtasks', TaskController.createSubtask);

// Update a task
router.put('/:id', TaskController.updateTask);

// Update a task (PATCH)
router.patch('/:id', TaskController.updateTask);

// Delete a task
router.delete('/:id', TaskController.deleteTask);

// Toggle task completion
router.patch('/:id/toggle-completion', TaskController.toggleCompletion);

// Create next occurrence of a recurring task
router.post('/:id/next-occurrence', TaskController.createNextOccurrence);

// Adjust future recurrences based on today's date
router.post('/:id/adjust-recurrences', TaskController.adjustRecurrences);

// Priority management routes
// Update task priority order
router.put('/:id/priority', TaskController.updateTaskPriority);

module.exports = router;
