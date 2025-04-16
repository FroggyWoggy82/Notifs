const express = require('express');
const router = express.Router();
const db = require('../utils/db');

// POST /api/tasks/:id/next-occurrence - Create the next occurrence of a recurring task
router.post('/:id/next-occurrence', async (req, res) => {
    const { id } = req.params;
    console.log(`Received POST /api/tasks/${id}/next-occurrence`);

    // Validate ID format
    if (!/^[1-9]\\d*$/.test(id)) {
        return res.status(400).json({ error: 'Invalid task ID format' });
    }

    try {
        // 1. Get the task details
        const taskResult = await db.query(
            `SELECT id, title, description, due_date,
                    recurrence_type, recurrence_interval
             FROM tasks WHERE id = $1`,
            [id]
        );

        if (taskResult.rowCount === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const task = taskResult.rows[0];

        // 2. Check if this is a recurring task
        if (!task.recurrence_type || task.recurrence_type === 'none') {
            return res.status(400).json({ error: 'Task is not recurring' });
        }

        // 3. Calculate the next occurrence date
        if (!task.due_date) {
            return res.status(400).json({ error: 'Task has no due date' });
        }

        const dueDate = new Date(task.due_date);
        const interval = task.recurrence_interval || 1;

        let nextDueDate = new Date(dueDate);

        // Calculate the next occurrence based on recurrence type
        switch (task.recurrence_type) {
            case 'daily':
                nextDueDate.setDate(nextDueDate.getDate() + interval);
                break;
            case 'weekly':
                nextDueDate.setDate(nextDueDate.getDate() + (interval * 7));
                break;
            case 'monthly':
                nextDueDate.setMonth(nextDueDate.getMonth() + interval);
                break;
            case 'yearly':
                nextDueDate.setFullYear(nextDueDate.getFullYear() + interval);
                break;
            default:
                return res.status(400).json({ error: 'Invalid recurrence type' });
        }

        // 4. Create a new task for the next occurrence
        // IMPORTANT: Set both assigned_date and due_date to ensure it appears on the calendar
        const formattedDate = nextDueDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        const result = await db.query(
            `INSERT INTO tasks (title, description, assigned_date, due_date,
                             recurrence_type, recurrence_interval, is_complete)
             VALUES ($1, $2, $3, $4, $5, $6, false) RETURNING *`,
            [
                task.title,
                task.description,
                formattedDate, // Set assigned_date to ensure it appears on calendar
                formattedDate, // Set due_date
                task.recurrence_type,
                task.recurrence_interval
            ]
        );

        console.log(`Created next occurrence of task ${id} with due date ${nextDueDate.toISOString().split('T')[0]}`);
        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error(`Error creating next occurrence of task ${id}:`, err);
        res.status(500).json({ error: 'Failed to create next occurrence' });
    }
});

module.exports = router;
