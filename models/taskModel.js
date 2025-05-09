const db = require('../utils/db');

/**
 * Task Model
 * Handles database operations for tasks
 */
class Task {
    /**
     * Get all tasks
     * @returns {Promise<Array>} Array of task objects
     */
    static async getAllTasks() {
        const result = await db.query(
            'SELECT * FROM tasks WHERE is_subtask = FALSE OR is_subtask IS NULL ORDER BY is_complete ASC, assigned_date ASC, created_at DESC'
        );
        return result.rows;
    }

    /**
     * Get all subtasks for a parent task
     * @param {number} parentTaskId - The parent task ID
     * @returns {Promise<Array>} Array of subtask objects
     */
    static async getSubtasks(parentTaskId) {
        const result = await db.query(
            'SELECT * FROM tasks WHERE parent_task_id = $1 ORDER BY is_complete ASC, created_at ASC',
            [parentTaskId]
        );
        return result.rows;
    }

    /**
     * Create a new task
     * @param {Object} taskData - The task data
     * @returns {Promise<Object>} The created task
     */
    static async createTask(taskData) {
        const {
            title,
            description,
            reminderTime,
            reminderType,
            reminderTimes, // Add support for new fields
            assignedDate,
            dueDate,
            duration, // Add support for duration
            recurrenceType,
            recurrenceInterval,
            parent_task_id, // Support for subtasks
            is_subtask, // Flag to identify subtasks
            grocery_data // Support for grocery list data
        } = taskData;

        console.log('Task data received:', taskData);

        // Ensure both assignedDate and dueDate are set if one is provided
        let finalAssignedDate = assignedDate;
        let finalDueDate = dueDate;

        if (finalAssignedDate && !finalDueDate) {
            finalDueDate = finalAssignedDate;
            console.log('Setting dueDate equal to assignedDate:', finalDueDate);
        } else if (!finalAssignedDate && finalDueDate) {
            finalAssignedDate = finalDueDate;
            console.log('Setting assignedDate equal to dueDate:', finalAssignedDate);
        }

        // Build the SQL query dynamically based on provided fields
        const fields = ['title'];
        const values = [title];
        const valuePlaceholders = ['$1']; // Initialize with first placeholder
        let placeholderIndex = 2;

        // Add optional fields if they exist
        if (description !== undefined) {
            fields.push('description');
            values.push(description);
            valuePlaceholders.push(`$${placeholderIndex++}`);
        }

        if (reminderTime !== undefined) {
            fields.push('reminder_time');
            values.push(reminderTime);
            valuePlaceholders.push(`$${placeholderIndex++}`);
        }

        if (reminderType !== undefined) {
            fields.push('reminder_type');
            values.push(reminderType);
            valuePlaceholders.push(`$${placeholderIndex++}`);
        }

        // Handle reminderTimes field (JSON string)
        if (reminderTimes !== undefined) {
            fields.push('reminder_times');
            // Ensure reminderTimes is stored as a string
            const reminderTimesStr = typeof reminderTimes === 'string'
                ? reminderTimes
                : JSON.stringify(reminderTimes);
            values.push(reminderTimesStr);
            valuePlaceholders.push(`$${placeholderIndex++}`);
        }

        if (finalAssignedDate !== undefined) {
            // Handle empty string for assigned date
            if (finalAssignedDate === '') {
                finalAssignedDate = null;
            }

            if (finalAssignedDate !== null) {
                fields.push('assigned_date');
                values.push(finalAssignedDate);
                valuePlaceholders.push(`$${placeholderIndex++}`);
            }
        }

        if (finalDueDate !== undefined) {
            // Handle empty string for due date
            if (finalDueDate === '') {
                finalDueDate = null;
            }

            if (finalDueDate !== null) {
                fields.push('due_date');
                values.push(finalDueDate);
                valuePlaceholders.push(`$${placeholderIndex++}`);
            }
        }

        if (recurrenceType !== undefined) {
            fields.push('recurrence_type');
            values.push(recurrenceType);
            valuePlaceholders.push(`$${placeholderIndex++}`);
        }

        if (recurrenceInterval !== undefined) {
            fields.push('recurrence_interval');
            values.push(recurrenceInterval);
            valuePlaceholders.push(`$${placeholderIndex++}`);
        }

        // Add support for duration field
        if (duration !== undefined) {
            fields.push('duration');
            values.push(duration);
            valuePlaceholders.push(`$${placeholderIndex++}`);
        }

        // Add support for parent_task_id field
        if (parent_task_id !== undefined) {
            fields.push('parent_task_id');
            values.push(parent_task_id);
            valuePlaceholders.push(`$${placeholderIndex++}`);
        }

        // Add support for is_subtask field
        if (is_subtask !== undefined) {
            fields.push('is_subtask');
            values.push(is_subtask);
            valuePlaceholders.push(`$${placeholderIndex++}`);
        }

        // Add support for grocery_data field
        if (grocery_data !== undefined) {
            fields.push('grocery_data');
            // Ensure grocery_data is stored as JSONB
            const groceryDataJson = typeof grocery_data === 'string'
                ? grocery_data
                : JSON.stringify(grocery_data);
            values.push(groceryDataJson);
            valuePlaceholders.push(`$${placeholderIndex++}`);
        }

        // Debug the query construction
        console.log('Fields:', fields);
        console.log('Values:', values);
        console.log('Value Placeholders:', valuePlaceholders);

        try {
            const query = `
                INSERT INTO tasks (${fields.join(', ')})
                VALUES (${valuePlaceholders.join(', ')})
                RETURNING *
            `;

            console.log('Final SQL query:', query);
            console.log('Final SQL parameters:', values);

            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error in createTask:', error);
            throw error;
        }
    }

    /**
     * Get a task by ID
     * @param {number} id - The task ID
     * @returns {Promise<Object>} The task object
     */
    static async getTaskById(id) {
        const result = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
        return result.rows[0];
    }

    /**
     * Update a task
     * @param {number} id - The task ID
     * @param {Object} taskData - The task data to update
     * @returns {Promise<Object>} The updated task
     */
    static async updateTask(id, taskData) {
        const setClauses = [];
        const values = [];
        let queryIndex = 1;

        // Build the SET clause dynamically based on provided fields
        for (const [key, value] of Object.entries(taskData)) {
            if (value !== undefined) {
                // Convert camelCase to snake_case for database column names
                const columnName = key.replace(/([A-Z])/g, '_$1').toLowerCase();
                setClauses.push(`${columnName} = $${queryIndex}`);
                values.push(value);
                queryIndex++;
            }
        }

        if (setClauses.length === 0) {
            throw new Error('No fields to update');
        }

        values.push(id); // Add the ID for the WHERE clause
        const sqlQuery = `UPDATE tasks SET ${setClauses.join(', ')} WHERE id = $${queryIndex} RETURNING *`;

        const result = await db.query(sqlQuery, values);
        return result.rows[0];
    }

    /**
     * Delete a task and all its future recurrences if it's a recurring task
     * @param {number} id - The task ID
     * @returns {Promise<Object>} The deleted task ID and count of deleted recurrences
     */
    static async deleteTask(id) {
        // First, check if this is a recurring task
        const taskResult = await db.query(
            `SELECT id, title, recurrence_type FROM tasks WHERE id = $1`,
            [id]
        );

        if (taskResult.rowCount === 0) {
            // Task not found
            return null;
        }

        const task = taskResult.rows[0];
        const isRecurring = task.recurrence_type && task.recurrence_type !== 'none';

        if (isRecurring) {
            // For recurring tasks, delete this task and all future recurrences
            // We identify recurrences by matching title and recurrence type
            console.log(`Deleting recurring task ${id} (${task.title}) and all its recurrences`);

            // Get the current task's due date to use as a reference point
            const dateResult = await db.query(
                `SELECT due_date FROM tasks WHERE id = $1`,
                [id]
            );

            if (dateResult.rowCount === 0 || !dateResult.rows[0].due_date) {
                // If we can't get the due date, just delete this specific task
                console.log(`Could not get due date for task ${id}, deleting only this task`);
                const result = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [id]);
                return {
                    id: parseInt(id),
                    deletedCount: 1
                };
            }

            const dueDate = dateResult.rows[0].due_date;
            console.log(`Task ${id} due date: ${dueDate}`);

            // Delete this task and all recurrences with the same title and recurrence type
            // that have a due date on or after this task's due date
            const result = await db.query(
                `DELETE FROM tasks
                 WHERE title = $1
                 AND recurrence_type = $2
                 AND (due_date >= $3 OR id = $4)
                 RETURNING id`,
                [task.title, task.recurrence_type, dueDate, id]
            );

            console.log(`Deleted ${result.rowCount} tasks (including recurrences)`);

            return {
                id: parseInt(id),
                deletedCount: result.rowCount
            };
        } else {
            // For non-recurring tasks, just delete the single task
            const result = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [id]);
            return {
                id: parseInt(id),
                deletedCount: 1
            };
        }
    }

    /**
     * Toggle task completion status
     * @param {number} id - The task ID
     * @param {boolean} isComplete - The completion status
     * @returns {Promise<Object>} The updated task
     */
    static async toggleCompletion(id, isComplete) {
        const result = await db.query(
            'UPDATE tasks SET is_complete = $1 WHERE id = $2 RETURNING *',
            [isComplete, id]
        );
        return result.rows[0];
    }

    /**
     * Create the next occurrence of a recurring task
     * @param {number} id - The task ID
     * @param {string} baseDate - Optional base date to calculate from (YYYY-MM-DD)
     * @returns {Promise<Object>} The newly created task
     */
    static async createNextOccurrence(id, baseDate = null) {
        // 1. Get the task details
        const taskResult = await db.query(
            `SELECT id, title, description, due_date, reminder_time, reminder_type,
                    recurrence_type, recurrence_interval
             FROM tasks WHERE id = $1`,
            [id]
        );

        if (taskResult.rowCount === 0) {
            throw new Error('Task not found');
        }

        const task = taskResult.rows[0];

        // 2. Check if this is a recurring task
        if (!task.recurrence_type || task.recurrence_type === 'none') {
            throw new Error('Task is not recurring');
        }

        // 3. Calculate the next occurrence date
        if (!task.due_date && !baseDate) {
            throw new Error('Task has no due date');
        }

        // Use the provided base date if available, otherwise use the task's due date
        let startDate;
        if (baseDate) {
            console.log(`Using provided base date: ${baseDate} instead of task due date: ${task.due_date}`);
            startDate = new Date(baseDate);
        } else {
            startDate = new Date(task.due_date);
        }

        const interval = task.recurrence_interval || 1;
        let nextDueDate = new Date(startDate);

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
                throw new Error('Invalid recurrence type');
        }

        // 4. Create a new task for the next occurrence
        // IMPORTANT: Set both assigned_date and due_date to ensure it appears on the calendar
        const formattedDate = nextDueDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD

        // Calculate new reminder time if needed
        let newReminderTime = null;
        if (task.reminder_type && task.reminder_type !== 'none') {
            if (task.reminder_type === 'custom' && task.reminder_time) {
                // For custom reminders, calculate the same relative time before the due date
                const oldDueDate = new Date(task.due_date);
                const oldReminderTime = new Date(task.reminder_time);
                const timeDiff = oldDueDate.getTime() - oldReminderTime.getTime();

                const newReminderDate = new Date(nextDueDate.getTime() - timeDiff);
                newReminderTime = newReminderDate.toISOString().slice(0, 16);
            } else if (task.reminder_type === 'same-day') {
                // Set to 9:00 AM on the due date
                const reminderDate = new Date(nextDueDate);
                reminderDate.setHours(9, 0, 0, 0);
                newReminderTime = reminderDate.toISOString().slice(0, 16);
            } else if (task.reminder_type === 'day-before') {
                // Set to 9:00 AM on the day before
                const reminderDate = new Date(nextDueDate);
                reminderDate.setDate(reminderDate.getDate() - 1);
                reminderDate.setHours(9, 0, 0, 0);
                newReminderTime = reminderDate.toISOString().slice(0, 16);
            } else if (task.reminder_type === 'week-before') {
                // Set to 9:00 AM one week before
                const reminderDate = new Date(nextDueDate);
                reminderDate.setDate(reminderDate.getDate() - 7);
                reminderDate.setHours(9, 0, 0, 0);
                newReminderTime = reminderDate.toISOString().slice(0, 16);
            }
        }

        const result = await db.query(
            `INSERT INTO tasks (title, description, assigned_date, due_date,
                             reminder_time, reminder_type, recurrence_type,
                             recurrence_interval, is_complete)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false) RETURNING *`,
            [
                task.title,
                task.description,
                formattedDate, // Set assigned_date to ensure it appears on calendar
                formattedDate, // Set due_date
                newReminderTime,
                task.reminder_type,
                task.recurrence_type,
                task.recurrence_interval
            ]
        );

        console.log(`Created next occurrence of task ${id} with due date ${nextDueDate.toISOString().split('T')[0]}`);
        return result.rows[0];
    }

}

module.exports = Task;
