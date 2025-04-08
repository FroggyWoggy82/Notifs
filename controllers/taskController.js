const Task = require('../models/taskModel');

/**
 * Task Controller
 * Handles request processing for task-related endpoints
 */
class TaskController {
    /**
     * Get all tasks
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getAllTasks(req, res) {
        try {
            console.log("Received GET /api/tasks request");
            const tasks = await Task.getAllTasks();
            res.json(tasks);
        } catch (err) {
            console.error('Error fetching tasks:', err);
            res.status(500).json({ error: 'Failed to fetch tasks' });
        }
    }

    /**
     * Create a new task
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async createTask(req, res) {
        try {
            const { title, description, reminderTime, assignedDate, dueDate, recurrenceType, recurrenceInterval } = req.body;
            
            console.log(`Received POST /api/tasks: title='${title}', assigned='${assignedDate}', due='${dueDate}', recurrence='${recurrenceType}', interval='${recurrenceInterval}', reminder='${reminderTime}'`);
            
            if (!title || title.trim() === '') {
                return res.status(400).json({ error: 'Task title cannot be empty' });
            }
            
            const taskData = {
                title,
                description,
                reminderTime,
                assignedDate,
                dueDate,
                recurrenceType,
                recurrenceInterval
            };
            
            const newTask = await Task.createTask(taskData);
            console.log(`Task created successfully with ID: ${newTask.id}`);
            res.status(201).json(newTask);
        } catch (err) {
            console.error('Error creating task:', err);
            res.status(500).json({ error: 'Failed to create task' });
        }
    }

    /**
     * Update a task
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async updateTask(req, res) {
        try {
            const { id } = req.params;
            const { title, description, reminderTime, is_complete, assignedDate, dueDate, recurrenceType, recurrenceInterval } = req.body;
            
            console.log(`Received PUT /api/tasks/${id}:`, req.body);
            
            // Validate ID format (simple integer check)
            if (!/^[1-9]\d*$/.test(id)) {
                return res.status(400).json({ error: 'Invalid task ID format' });
            }
            
            const taskData = {
                title,
                description,
                reminderTime,
                is_complete,
                assignedDate,
                dueDate,
                recurrenceType,
                recurrenceInterval
            };
            
            // Remove undefined properties
            Object.keys(taskData).forEach(key => {
                if (taskData[key] === undefined) {
                    delete taskData[key];
                }
            });
            
            if (Object.keys(taskData).length === 0) {
                return res.status(400).json({ error: 'No fields to update' });
            }
            
            const updatedTask = await Task.updateTask(id, taskData);
            
            if (!updatedTask) {
                console.log(`Update Task: Task ${id} not found.`);
                return res.status(404).json({ error: 'Task not found' });
            }
            
            console.log(`Task ${id} updated successfully.`);
            res.status(200).json(updatedTask);
        } catch (err) {
            console.error(`Error updating task:`, err);
            res.status(500).json({ error: 'Failed to update task' });
        }
    }

    /**
     * Delete a task
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async deleteTask(req, res) {
        try {
            const { id } = req.params;
            console.log(`Received DELETE /api/tasks/${id}`);
            
            // Validate ID format
            if (!/^[1-9]\d*$/.test(id)) {
                return res.status(400).json({ error: 'Invalid task ID format' });
            }
            
            const deletedTask = await Task.deleteTask(id);
            
            if (!deletedTask) {
                console.log(`Delete Task: Task ${id} not found.`);
                return res.status(404).json({ error: 'Task not found' });
            }
            
            console.log(`Task ${id} deleted successfully.`);
            res.status(200).json({ message: `Task ${id} deleted successfully`, id: parseInt(id) });
        } catch (err) {
            console.error('Error deleting task:', err);
            res.status(500).json({ error: 'Failed to delete task' });
        }
    }

    /**
     * Toggle task completion status
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async toggleCompletion(req, res) {
        try {
            const { id } = req.params;
            const { is_complete } = req.body;
            
            console.log(`Received PATCH /api/tasks/${id}/toggle-completion:`, req.body);
            
            // Validate ID format
            if (!/^[1-9]\d*$/.test(id)) {
                return res.status(400).json({ error: 'Invalid task ID format' });
            }
            
            // Validate is_complete is a boolean
            if (typeof is_complete !== 'boolean') {
                return res.status(400).json({ error: 'is_complete must be a boolean' });
            }
            
            const updatedTask = await Task.toggleCompletion(id, is_complete);
            
            if (!updatedTask) {
                console.log(`Toggle Completion: Task ${id} not found.`);
                return res.status(404).json({ error: 'Task not found' });
            }
            
            console.log(`Task ${id} completion toggled to ${is_complete}.`);
            res.status(200).json(updatedTask);
        } catch (err) {
            console.error('Error toggling task completion:', err);
            res.status(500).json({ error: 'Failed to toggle task completion' });
        }
    }
}

module.exports = TaskController;
