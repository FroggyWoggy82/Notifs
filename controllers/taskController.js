const Task = require('../models/taskModel');
const db = require('../utils/db');

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
            // Extract all possible fields from the request body
            const {
                title,
                description,
                reminderTime,
                reminderType,
                reminderTimes,
                assignedDate,
                dueDate,
                duration,
                recurrenceType,
                recurrenceInterval,
                parent_task_id,
                is_subtask,
                grocery_data,
                has_subtasks
            } = req.body;

            console.log('Received POST /api/tasks with data:', JSON.stringify(req.body, null, 2));
            console.log('Data types:', {
                title: typeof title,
                description: typeof description,
                reminderTime: typeof reminderTime,
                reminderType: typeof reminderType,
                reminderTimes: typeof reminderTimes,
                assignedDate: typeof assignedDate,
                dueDate: typeof dueDate,
                duration: typeof duration,
                recurrenceType: typeof recurrenceType,
                recurrenceInterval: typeof recurrenceInterval
            });

            // Validate required fields
            if (!title || title.trim() === '') {
                return res.status(400).json({ error: 'Task title cannot be empty' });
            }

            // Ensure reminderTimes is a string if it exists
            let processedReminderTimes = reminderTimes;
            if (reminderTimes && typeof reminderTimes !== 'string') {
                processedReminderTimes = JSON.stringify(reminderTimes);
            }

            // Process grocery_data if it exists
            let processedGroceryData = grocery_data;
            if (grocery_data && typeof grocery_data !== 'string') {
                try {
                    processedGroceryData = JSON.stringify(grocery_data);
                } catch (jsonError) {
                    console.error('Error stringifying grocery_data:', jsonError);
                    // Continue without grocery data rather than failing
                    processedGroceryData = null;
                }
            }

            // Pass all fields to the model
            const taskData = {
                title: title.trim(),
                description: description ? description.trim() : null,
                reminderTime,
                reminderType,
                reminderTimes: processedReminderTimes,
                assignedDate,
                dueDate,
                duration: duration || 1, // Default to 1 if not provided
                recurrenceType: recurrenceType || 'none', // Default to 'none' if not provided
                recurrenceInterval: recurrenceInterval || null,
                parent_task_id: parent_task_id || null,
                is_subtask: is_subtask === true, // Ensure boolean
                grocery_data: processedGroceryData,
                has_subtasks: has_subtasks === true // Ensure boolean
            };

            // Attempt to create the task
            try {
                const newTask = await Task.createTask(taskData);
                console.log(`Task created successfully with ID: ${newTask.id}`);
                return res.status(201).json(newTask);
            } catch (dbError) {
                console.error('Database error creating task:', dbError);

                // Check for specific error messages and return appropriate status codes
                if (dbError.message.includes('does not exist') ||
                    dbError.message.includes('schema mismatch')) {
                    return res.status(500).json({
                        error: 'Database configuration error',
                        details: dbError.message
                    });
                }

                if (dbError.message.includes('already exists')) {
                    return res.status(409).json({
                        error: 'Duplicate task',
                        details: dbError.message
                    });
                }

                if (dbError.message.includes('parent task does not exist')) {
                    return res.status(400).json({
                        error: 'Invalid parent task',
                        details: 'The specified parent task does not exist'
                    });
                }

                // Generic database error
                throw dbError; // Re-throw to be caught by outer catch
            }
        } catch (err) {
            console.error('Error creating task:', err);
            // Log the full error details for debugging
            console.error('Error details:', err.stack);
            console.error('Request body:', req.body);

            // Send a more detailed error response
            res.status(500).json({
                error: 'Failed to create task',
                details: err.message,
                timestamp: new Date().toISOString()
            });
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
            const { title, description, reminderTime, is_complete, assignedDate, dueDate, recurrenceType, recurrenceInterval, create_next_occurrence, nextOccurrenceDate, has_subtasks } = req.body;

            console.log(`Received PUT /api/tasks/${id}:`, req.body);
            console.log('nextOccurrenceDate:', nextOccurrenceDate);

            // Validate ID format (simple integer check)
            if (!/^[1-9]\d*$/.test(id)) {
                return res.status(400).json({ error: 'Invalid task ID format' });
            }

            // Special handling for next_occurrence_date
            if (nextOccurrenceDate !== undefined) {
                try {
                    // Direct SQL query to update next_occurrence_date
                    const result = await db.query(
                        'UPDATE tasks SET next_occurrence_date = $1 WHERE id = $2 RETURNING *',
                        [nextOccurrenceDate, id]
                    );

                    if (result.rows.length === 0) {
                        return res.status(404).json({ error: 'Task not found' });
                    }

                    console.log(`Updated task ${id} with next_occurrence_date ${nextOccurrenceDate}`);
                    return res.json(result.rows[0]);
                } catch (error) {
                    console.error('Error updating next_occurrence_date:', error);
                    return res.status(500).json({ error: 'Failed to update next_occurrence_date' });
                }
            }

            // Check if we're adding a due date to a recurring task that didn't have one
            if (dueDate !== undefined) {
                try {
                    // Get the current task to check if it's a recurring task without a due date
                    const currentTask = await Task.getTaskById(id);

                    if (currentTask &&
                        currentTask.recurrence_type &&
                        currentTask.recurrence_type !== 'none' &&
                        !currentTask.due_date) {
                        console.log(`Adding due date ${dueDate} to recurring task ${id} that previously had no due date`);

                        // Check for duplicate tasks with the same title and recurrence type
                        const duplicatesQuery = `
                            SELECT id FROM tasks
                            WHERE title = $1
                            AND recurrence_type = $2
                            AND id != $3
                        `;

                        const duplicatesResult = await db.query(duplicatesQuery, [
                            currentTask.title,
                            currentTask.recurrence_type,
                            id
                        ]);

                        if (duplicatesResult.rows.length > 0) {
                            console.log(`Found ${duplicatesResult.rows.length} duplicate tasks with the same title and recurrence type`);

                            // Delete the duplicates
                            const duplicateIds = duplicatesResult.rows.map(row => row.id);
                            console.log(`Deleting duplicate task IDs: ${duplicateIds.join(', ')}`);

                            const deleteQuery = `
                                DELETE FROM tasks
                                WHERE id = ANY($1::int[])
                                RETURNING id
                            `;

                            const deleteResult = await db.query(deleteQuery, [duplicateIds]);
                            console.log(`Deleted ${deleteResult.rowCount} duplicate tasks`);
                        }
                    }
                } catch (error) {
                    console.error('Error checking for duplicate tasks:', error);
                    // Continue with the update even if this check fails
                }
            }

            // Only include fields that are actually provided
            const taskData = {};
            if (title !== undefined) taskData.title = title;
            if (description !== undefined) taskData.description = description;
            if (reminderTime !== undefined) taskData.reminderTime = reminderTime;
            if (is_complete !== undefined) taskData.is_complete = is_complete;
            if (assignedDate !== undefined) taskData.assignedDate = assignedDate;
            if (dueDate !== undefined) taskData.dueDate = dueDate;
            if (recurrenceType !== undefined) taskData.recurrenceType = recurrenceType;
            if (recurrenceInterval !== undefined) taskData.recurrenceInterval = recurrenceInterval;
            if (has_subtasks !== undefined) taskData.has_subtasks = has_subtasks;

            console.log('Task data to update:', taskData);

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

            // If this is a recurring task being marked complete and create_next_occurrence is true,
            // create the next occurrence
            let nextOccurrenceResult = null;
            if (is_complete === true && create_next_occurrence === true &&
                updatedTask.recurrence_type && updatedTask.recurrence_type !== 'none') {

                console.log(`Creating next occurrence for recurring task ${id} (${updatedTask.title})`);
                console.log(`Task details: recurrence_type=${updatedTask.recurrence_type}, recurrence_interval=${updatedTask.recurrence_interval}, due_date=${updatedTask.due_date}`);

                try {
                    // Call the next-occurrence endpoint directly
                    nextOccurrenceResult = await Task.createNextOccurrence(id);
                    console.log(`Created next occurrence: Task ${nextOccurrenceResult.id} with due date ${nextOccurrenceResult.due_date}`);
                } catch (nextOccErr) {
                    console.error('Error creating next occurrence:', nextOccErr);
                    // Don't fail the main request if next occurrence creation fails
                }
            } else {
                console.log(`Not creating next occurrence for task ${id}: is_complete=${is_complete}, create_next_occurrence=${create_next_occurrence}, recurrence_type=${updatedTask.recurrence_type}`);
            }

            // Add the next occurrence info to the response
            if (nextOccurrenceResult) {
                updatedTask.nextOccurrence = {
                    id: nextOccurrenceResult.id,
                    due_date: nextOccurrenceResult.due_date
                };
            }

            console.log(`Task ${id} updated successfully.`);
            res.status(200).json(updatedTask);
        } catch (err) {
            console.error(`Error updating task:`, err);
            res.status(500).json({ error: 'Failed to update task' });
        }
    }

    /**
     * Get a task by ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getTaskById(req, res) {
        try {
            const { id } = req.params;
            const task = await Task.getTaskById(id);

            if (!task) {
                return res.status(404).json({ error: 'Task not found' });
            }

            res.json(task);
        } catch (err) {
            console.error('Error getting task by ID:', err);
            res.status(500).json({ error: 'Failed to get task', details: err.message });
        }
    }

    /**
     * Get subtasks for a parent task
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getSubtasks(req, res) {
        try {
            const { id } = req.params;
            const subtasks = await Task.getSubtasks(id);

            res.json(subtasks);
        } catch (err) {
            console.error('Error getting subtasks:', err);
            res.status(500).json({ error: 'Failed to get subtasks', details: err.message });
        }
    }

    /**
     * Create a subtask for a parent task
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async createSubtask(req, res) {
        try {
            const { id } = req.params; // Parent task ID
            const { title, description, is_complete, grocery_data } = req.body;

            console.log(`Creating subtask for parent task ${id}:`, req.body);

            // Validate required fields
            if (!title || title.trim() === '') {
                return res.status(400).json({ error: 'Subtask title is required' });
            }

            // Create the subtask data
            const subtaskData = {
                title,
                description: description || '',
                parent_task_id: id,
                is_subtask: true,
                is_complete: is_complete || false
            };

            // Add grocery_data if provided
            if (grocery_data) {
                console.log(`Adding grocery_data to subtask:`, grocery_data);
                subtaskData.grocery_data = grocery_data;
            }

            // Create the subtask
            const newSubtask = await Task.createTask(subtaskData);

            console.log(`Created subtask with ID ${newSubtask.id} for parent task ${id}`);

            // Update the parent task to indicate it has subtasks
            await db.query(
                'UPDATE tasks SET has_subtasks = TRUE WHERE id = $1',
                [id]
            );

            res.status(201).json(newSubtask);
        } catch (err) {
            console.error('Error creating subtask:', err);
            res.status(500).json({ error: 'Failed to create subtask', details: err.message });
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

            const result = await Task.deleteTask(id);

            if (!result) {
                console.log(`Delete Task: Task ${id} not found.`);
                return res.status(404).json({ error: 'Task not found' });
            }

            // Check if multiple tasks were deleted (recurring task with recurrences)
            if (result.deletedCount > 1) {
                console.log(`Task ${id} and ${result.deletedCount - 1} recurrences deleted successfully.`);
                res.status(200).json({
                    message: `Task ${id} and ${result.deletedCount - 1} recurrences deleted successfully`,
                    id: parseInt(id),
                    deletedCount: result.deletedCount
                });
            } else {
                console.log(`Task ${id} deleted successfully.`);
                res.status(200).json({
                    message: `Task ${id} deleted successfully`,
                    id: parseInt(id),
                    deletedCount: 1
                });
            }
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
            const { is_complete, has_subtasks } = req.body;

            console.log(`Received PATCH /api/tasks/${id}/toggle-completion:`, req.body);

            // Validate ID format
            if (!/^[1-9]\d*$/.test(id)) {
                return res.status(400).json({ error: 'Invalid task ID format' });
            }

            // Validate is_complete is a boolean
            if (typeof is_complete !== 'boolean') {
                return res.status(400).json({ error: 'is_complete must be a boolean' });
            }

            // Create a task data object with the completion status
            const taskData = { is_complete };

            // Add has_subtasks if provided
            if (has_subtasks !== undefined) {
                console.log(`Including has_subtasks=${has_subtasks} in toggle completion update`);
                taskData.has_subtasks = has_subtasks;
            }

            // Use updateTask instead of toggleCompletion to handle both fields
            const updatedTask = await Task.updateTask(id, taskData);

            if (!updatedTask) {
                console.log(`Toggle Completion: Task ${id} not found.`);
                return res.status(404).json({ error: 'Task not found' });
            }

            // If this is a subtask, check if we need to update the parent task
            if (updatedTask.parent_task_id && is_complete) {
                await Task.checkAndUpdateParentTaskStatus(updatedTask.parent_task_id);
            }

            console.log(`Task ${id} completion toggled to ${is_complete}.`);
            res.status(200).json(updatedTask);
        } catch (err) {
            console.error('Error toggling task completion:', err);
            res.status(500).json({ error: 'Failed to toggle task completion' });
        }
    }

    /**
     * Create the next occurrence of a recurring task
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async createNextOccurrence(req, res) {
        try {
            const { id } = req.params;
            const { base_date } = req.body || {};

            console.log(`Received POST /api/tasks/${id}/next-occurrence`);
            if (base_date) {
                console.log(`Using base_date: ${base_date} for calculating next occurrence`);
            }

            // Validate ID format
            if (!/^[1-9]\d*$/.test(id)) {
                return res.status(400).json({ error: 'Invalid task ID format' });
            }

            // Call the model method to create the next occurrence
            // Pass the base_date if provided (for adjusted recurrences)
            const nextOccurrence = await Task.createNextOccurrence(id, base_date);

            console.log(`Created next occurrence: Task ${nextOccurrence.id} with due date ${nextOccurrence.due_date}`);

            // Update the original task with the next occurrence date
            try {
                // Direct SQL query to update next_occurrence_date
                const result = await db.query(
                    'UPDATE tasks SET next_occurrence_date = $1 WHERE id = $2 RETURNING *',
                    [nextOccurrence.due_date, id]
                );

                console.log(`Updated original task ${id} with next occurrence date ${nextOccurrence.due_date}`);
            } catch (updateError) {
                console.error(`Error updating original task with next occurrence date:`, updateError);
                // Don't fail the main request if the update fails
            }

            return res.status(201).json(nextOccurrence);
        } catch (error) {
            console.error('Error creating next occurrence:', error);

            if (error.message === 'Task not found') {
                return res.status(404).json({ error: 'Task not found' });
            }

            if (error.message === 'Task is not recurring' || error.message === 'Task has no due date') {
                return res.status(400).json({ error: error.message });
            }

            return res.status(500).json({ error: 'Server error' });
        }
    }

    /**
     * Adjust future recurrences based on today's date
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async adjustRecurrences(req, res) {
        const { id } = req.params;

        try {
            console.log(`Received POST /api/tasks/${id}/adjust-recurrences`);

            // Validate ID format
            if (!/^[1-9]\d*$/.test(id)) {
                return res.status(400).json({ error: 'Invalid task ID format' });
            }

            // Get the task details
            const taskResult = await db.query(
                `SELECT id, title, description, due_date, reminder_time, reminder_type,
                        recurrence_type, recurrence_interval
                 FROM tasks WHERE id = $1`,
                [id]
            );

            if (taskResult.rowCount === 0) {
                return res.status(404).json({ error: 'Task not found' });
            }

            const task = taskResult.rows[0];

            // Check if this is a recurring task
            if (!task.recurrence_type || task.recurrence_type === 'none') {
                return res.status(400).json({ error: 'Task is not recurring' });
            }

            // Use today's date as the base for the next occurrence
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time to start of day

            // Format today as YYYY-MM-DD
            const formattedToday = today.toISOString().split('T')[0];

            // Create the next occurrence using today as the base date
            const nextOccurrence = await Task.createNextOccurrence(id, formattedToday);

            console.log(`Created adjusted next occurrence: Task ${nextOccurrence.id} with due date ${nextOccurrence.due_date}`);

            // Update the original task with the next occurrence date
            try {
                const result = await db.query(
                    'UPDATE tasks SET next_occurrence_date = $1 WHERE id = $2 RETURNING *',
                    [nextOccurrence.due_date, id]
                );

                console.log(`Updated original task ${id} with adjusted next occurrence date ${nextOccurrence.due_date}`);
            } catch (updateError) {
                console.error(`Error updating original task with adjusted next occurrence date:`, updateError);
                // Don't fail the main request if the update fails
            }

            return res.status(201).json({
                message: 'Future recurrences adjusted successfully',
                nextOccurrence
            });

        } catch (error) {
            console.error('Error adjusting recurrences:', error);

            if (error.message === 'Task not found') {
                return res.status(404).json({ error: 'Task not found' });
            }

            return res.status(500).json({ error: 'Server error' });
        }
    }


}

module.exports = TaskController;
