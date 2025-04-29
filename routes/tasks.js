const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/taskController');
const db = require('../utils/db');

// Get all tasks
router.get('/', TaskController.getAllTasks);

// Create a new task
router.post('/', TaskController.createTask);

// Get a specific task
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching task:', err);
        res.status(500).json({ error: 'Failed to fetch task' });
    }
});

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
