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

        if (assignedDate !== undefined) {
            fields.push('assigned_date');
            values.push(assignedDate);
            valuePlaceholders.push(`$${placeholderIndex++}`);
        }

        if (dueDate !== undefined) {
            fields.push('due_date');
            values.push(dueDate);
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
        // Update both is_complete and updated_at fields
        const result = await db.query(
            'UPDATE tasks SET is_complete = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [isComplete, id]
        );
        return result.rows[0];
    }
}

module.exports = Task;
