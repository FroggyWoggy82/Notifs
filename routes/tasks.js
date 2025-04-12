const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/tasks/:id/next-occurrence - Create the next occurrence of a recurring task
router.post('/:id/next-occurrence', async (req, res) => {
    const { id } = req.params;
    console.log(`Received POST /api/tasks/${id}/next-occurrence`);

    // Validate ID format
    if (!/^[1-9]\d*$/.test(id)) {
        return res.status(400).json({ error: 'Invalid task ID format' });
    }

    try {
        // 1. Get the task details
        const taskResult = await db.query(
            `SELECT id, title, description, assigned_date, due_date,
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
        // Parse dates carefully to avoid timezone issues
        const assignedDateStr = task.assigned_date.split('T')[0];
        const dueDateStr = task.due_date ? task.due_date.split('T')[0] : null;

        // Create date objects with the correct date parts only
        const [assignedYear, assignedMonth, assignedDay] = assignedDateStr.split('-').map(Number);
        const assignedDate = new Date(assignedYear, assignedMonth - 1, assignedDay);

        let dueDate = null;
        if (dueDateStr) {
            const [dueYear, dueMonth, dueDay] = dueDateStr.split('-').map(Number);
            dueDate = new Date(dueYear, dueMonth - 1, dueDay);
        }

        const interval = task.recurrence_interval || 1;

        // Create new date objects to avoid modifying the originals
        let nextAssignedDate = new Date(assignedDate);
        let nextDueDate = dueDate ? new Date(dueDate) : null;

        console.log(`[API] Original assigned date: ${assignedDateStr}, parsed as: ${assignedDate.toISOString()}`);
        if (dueDate) console.log(`[API] Original due date: ${dueDateStr}, parsed as: ${dueDate.toISOString()}`);

        // Calculate the next occurrence based on recurrence type
        switch (task.recurrence_type) {
            case 'daily':
                nextAssignedDate.setDate(nextAssignedDate.getDate() + interval);
                if (nextDueDate) nextDueDate.setDate(nextDueDate.getDate() + interval);
                break;
            case 'weekly':
                nextAssignedDate.setDate(nextAssignedDate.getDate() + (interval * 7));
                if (nextDueDate) nextDueDate.setDate(nextDueDate.getDate() + (interval * 7));
                break;
            case 'monthly':
                nextAssignedDate.setMonth(nextAssignedDate.getMonth() + interval);
                if (nextDueDate) nextDueDate.setMonth(nextDueDate.getMonth() + interval);
                break;
            case 'yearly':
                nextAssignedDate.setFullYear(nextAssignedDate.getFullYear() + interval);
                if (nextDueDate) nextDueDate.setFullYear(nextDueDate.getFullYear() + interval);
                break;
            default:
                return res.status(400).json({ error: 'Invalid recurrence type' });
        }

        // Log the calculated next occurrence date for debugging
        console.log(`[API] Calculated next assigned date: ${nextAssignedDate.toISOString()}`);
        if (nextDueDate) console.log(`[API] Calculated next due date: ${nextDueDate.toISOString()}`);

        // Validate that the next occurrence is actually in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time part for proper date comparison

        if (nextAssignedDate < today) {
            console.error(`[API] Calculated next date ${nextAssignedDate.toISOString()} is in the past!`);
            // Recalculate to ensure it's in the future
            while (nextAssignedDate < today) {
                switch (task.recurrence_type) {
                    case 'daily':
                        nextAssignedDate.setDate(nextAssignedDate.getDate() + interval);
                        if (nextDueDate) nextDueDate.setDate(nextDueDate.getDate() + interval);
                        break;
                    case 'weekly':
                        nextAssignedDate.setDate(nextAssignedDate.getDate() + (interval * 7));
                        if (nextDueDate) nextDueDate.setDate(nextDueDate.getDate() + (interval * 7));
                        break;
                    case 'monthly':
                        nextAssignedDate.setMonth(nextAssignedDate.getMonth() + interval);
                        if (nextDueDate) nextDueDate.setMonth(nextDueDate.getMonth() + interval);
                        break;
                    case 'yearly':
                        nextAssignedDate.setFullYear(nextAssignedDate.getFullYear() + interval);
                        if (nextDueDate) nextDueDate.setFullYear(nextDueDate.getFullYear() + interval);
                        break;
                }
            }
            console.log(`[API] Corrected next assigned date to: ${nextAssignedDate.toISOString()}`);
        }

        // 4. Create a new task for the next occurrence
        const result = await db.query(
            `INSERT INTO tasks (title, description, assigned_date, due_date,
                             recurrence_type, recurrence_interval, is_complete)
             VALUES ($1, $2, $3, $4, $5, $6, false) RETURNING *`,
            [
                task.title,
                task.description,
                nextAssignedDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
                nextDueDate ? nextDueDate.toISOString().split('T')[0] : null,
                task.recurrence_type,
                task.recurrence_interval
            ]
        );

        console.log(`Created next occurrence of task ${id} on ${nextAssignedDate.toISOString().split('T')[0]}`);
        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error(`Error creating next occurrence of task ${id}:`, err);
        res.status(500).json({ error: 'Failed to create next occurrence' });
    }
});

module.exports = router;
