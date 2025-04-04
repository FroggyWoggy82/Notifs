const express = require('express');
const router = express.Router();
const db = require('../db');

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
        const assignedDate = new Date(task.assigned_date);
        const dueDate = task.due_date ? new Date(task.due_date) : null;
        const interval = task.recurrence_interval || 1;
        
        let nextAssignedDate = new Date(assignedDate);
        let nextDueDate = dueDate ? new Date(dueDate) : null;
        
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
