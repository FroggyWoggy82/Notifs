/**
 * Simple tasks routes that don't depend on the database
 * This is a fallback in case the database connection fails
 */

const express = require('express');
const router = express.Router();

// In-memory storage for tasks (only used if database fails)
const mockTasks = [
    {
        id: 1,
        title: "Example Task 1",
        description: "This is a fallback task that appears when the database connection fails",
        assigned_date: new Date().toISOString().split('T')[0],
        is_complete: false,
        created_at: new Date().toISOString()
    },
    {
        id: 2,
        title: "Example Task 2",
        description: "Please check your database connection if you're seeing these example tasks",
        assigned_date: new Date().toISOString().split('T')[0],
        is_complete: false,
        created_at: new Date().toISOString()
    }
];

// GET /api/tasks - Fetch all tasks
router.get('/', (req, res) => {
    console.log("Received GET /api/tasks request (using simplified route)");
    try {
        // Return mock tasks
        res.json(mockTasks);
    } catch (err) {
        console.error('Error in simplified tasks route:', err);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// GET /api/tasks/:id - Fetch a specific task
router.get('/:id', (req, res) => {
    const { id } = req.params;
    console.log(`Received GET /api/tasks/${id} request (using simplified route)`);
    
    const task = mockTasks.find(t => t.id === parseInt(id));
    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(task);
});

// POST /api/tasks - Create a new task
router.post('/', (req, res) => {
    const { title, description, assignedDate, dueDate, recurrenceType, recurrenceInterval } = req.body;
    console.log(`Received POST /api/tasks request (using simplified route): title='${title}'`);
    
    if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'Task title cannot be empty' });
    }
    
    const newTask = {
        id: mockTasks.length > 0 ? Math.max(...mockTasks.map(t => t.id)) + 1 : 1,
        title: title.trim(),
        description: description ? description.trim() : null,
        assigned_date: assignedDate || new Date().toISOString().split('T')[0],
        due_date: dueDate || null,
        recurrence_type: recurrenceType || 'none',
        recurrence_interval: recurrenceInterval || null,
        is_complete: false,
        created_at: new Date().toISOString()
    };
    
    mockTasks.push(newTask);
    res.status(201).json(newTask);
});

// PUT /api/tasks/:id - Update a task
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, reminderTime, is_complete, assignedDate, dueDate, recurrenceType, recurrenceInterval } = req.body;
    console.log(`Received PUT /api/tasks/${id} request (using simplified route)`);
    
    const taskIndex = mockTasks.findIndex(t => t.id === parseInt(id));
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
    }
    
    const updatedTask = {
        ...mockTasks[taskIndex],
        title: title !== undefined ? title.trim() : mockTasks[taskIndex].title,
        description: description !== undefined ? (description ? description.trim() : null) : mockTasks[taskIndex].description,
        reminder_time: reminderTime !== undefined ? reminderTime : mockTasks[taskIndex].reminder_time,
        is_complete: is_complete !== undefined ? is_complete : mockTasks[taskIndex].is_complete,
        assigned_date: assignedDate !== undefined ? assignedDate : mockTasks[taskIndex].assigned_date,
        due_date: dueDate !== undefined ? dueDate : mockTasks[taskIndex].due_date,
        recurrence_type: recurrenceType !== undefined ? recurrenceType : mockTasks[taskIndex].recurrence_type,
        recurrence_interval: recurrenceInterval !== undefined ? recurrenceInterval : mockTasks[taskIndex].recurrence_interval
    };
    
    mockTasks[taskIndex] = updatedTask;
    res.json(updatedTask);
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    console.log(`Received DELETE /api/tasks/${id} request (using simplified route)`);
    
    const taskIndex = mockTasks.findIndex(t => t.id === parseInt(id));
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
    }
    
    const deletedTask = mockTasks.splice(taskIndex, 1)[0];
    res.json({ id: deletedTask.id });
});

// PATCH /api/tasks/:id/toggle-completion - Toggle task completion status
router.patch('/:id/toggle-completion', (req, res) => {
    const { id } = req.params;
    const { is_complete } = req.body;
    console.log(`Received PATCH /api/tasks/${id}/toggle-completion request (using simplified route)`);
    
    const taskIndex = mockTasks.findIndex(t => t.id === parseInt(id));
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
    }
    
    mockTasks[taskIndex].is_complete = is_complete !== undefined ? is_complete : !mockTasks[taskIndex].is_complete;
    res.json(mockTasks[taskIndex]);
});

module.exports = router;
