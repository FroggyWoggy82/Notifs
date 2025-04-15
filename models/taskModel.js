const db = require('../db');

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
            'SELECT * FROM tasks ORDER BY is_complete ASC, assigned_date ASC, created_at DESC'
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
            assignedDate,
            dueDate,
            recurrenceType,
            recurrenceInterval
        } = taskData;

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
        let placeholderIndex = 2;
        const valuePlaceholders = ['$1'];

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

        if (finalAssignedDate !== undefined) {
            fields.push('assigned_date');
            values.push(finalAssignedDate);
            valuePlaceholders.push(`$${placeholderIndex++}`);
        }

        if (finalDueDate !== undefined) {
            fields.push('due_date');
            values.push(finalDueDate);
            valuePlaceholders.push(`$${placeholderIndex++}`);
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

        const query = `
            INSERT INTO tasks (${fields.join(', ')})
            VALUES (${valuePlaceholders.join(', ')})
            RETURNING *
        `;

        const result = await db.query(query, values);
        return result.rows[0];
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
     * Delete a task
     * @param {number} id - The task ID
     * @returns {Promise<Object>} The deleted task ID
     */
    static async deleteTask(id) {
        const result = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [id]);
        return result.rows[0];
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
     * @returns {Promise<Object>} The newly created task
     */
    static async createNextOccurrence(id) {
        // 1. Get the task details
        const taskResult = await db.query(
            `SELECT id, title, description, due_date,
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
        if (!task.due_date) {
            throw new Error('Task has no due date');
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
                throw new Error('Invalid recurrence type');
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
        return result.rows[0];
    }
}

module.exports = Task;
