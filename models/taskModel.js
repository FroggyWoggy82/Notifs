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
        const result = await db.query(`
            SELECT * FROM tasks
            WHERE is_subtask = FALSE OR is_subtask IS NULL
            ORDER BY
                is_complete ASC,
                CASE WHEN priority_order IS NULL THEN 1 ELSE 0 END,
                priority_order ASC,
                assigned_date ASC,
                created_at DESC
        `);
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
        try {
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
                grocery_data, // Support for grocery list data
                has_subtasks // Flag to indicate task has subtasks
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

            // Check for specific database errors
            if (error.code === '23505') {
                // Unique violation
                throw new Error('A task with this information already exists');
            } else if (error.code === '23503') {
                // Foreign key violation
                throw new Error('Referenced parent task does not exist');
            } else if (error.code === '42P01') {
                // Undefined table
                throw new Error('Database table does not exist. Please run migrations');
            } else if (error.code === '42703') {
                // Undefined column
                throw new Error('Database schema mismatch. Please run migrations');
            }

            // Re-throw the original error with more context
            throw new Error(`Database error creating task: ${error.message}`);
        }
    } catch (outerError) {
        console.error('Outer error in createTask:', outerError);
        throw outerError;
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

                // Special handling for has_subtasks to ensure it's properly set
                if (key === 'has_subtasks') {
                    console.log(`Setting has_subtasks to ${value} for task ${id}`);
                }

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
        // Update the task's completion status
        const result = await db.query(
            'UPDATE tasks SET is_complete = $1 WHERE id = $2 RETURNING *',
            [isComplete, id]
        );

        const updatedTask = result.rows[0];

        // If this is a subtask, check if we need to update the parent task
        if (updatedTask && updatedTask.parent_task_id && isComplete) {
            await this.checkAndUpdateParentTaskStatus(updatedTask.parent_task_id);
        }

        return updatedTask;
    }

    /**
     * Check if all subtasks of a parent task are complete and update parent status if needed
     * @param {number} parentTaskId - The parent task ID
     * @returns {Promise<boolean>} True if parent task was updated to complete
     */
    static async checkAndUpdateParentTaskStatus(parentTaskId) {
        // Get all subtasks for the parent task
        const subtasksResult = await db.query(
            'SELECT id, is_complete FROM tasks WHERE parent_task_id = $1',
            [parentTaskId]
        );

        // If no subtasks, no need to update parent
        if (subtasksResult.rowCount === 0) {
            return false;
        }

        // Check if all subtasks are complete
        const allSubtasksComplete = subtasksResult.rows.every(subtask => subtask.is_complete);

        if (allSubtasksComplete) {
            // Update parent task to complete
            await db.query(
                'UPDATE tasks SET is_complete = TRUE WHERE id = $1',
                [parentTaskId]
            );
            return true;
        }

        // If any subtask is incomplete, ensure parent task is marked as incomplete
        await db.query(
            'UPDATE tasks SET is_complete = FALSE WHERE id = $1 AND is_complete = TRUE',
            [parentTaskId]
        );

        return false;
    }

    /**
     * Create the next occurrence of a recurring task
     * @param {number} id - The task ID
     * @param {string} providedBaseDate - Optional base date to calculate from (YYYY-MM-DD)
     * @returns {Promise<Object>} The newly created task
     */
    static async createNextOccurrence(id, providedBaseDate = null) {
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
        if (!task.due_date && !providedBaseDate) {
            throw new Error('Task has no due date');
        }

        // Use the provided base date if available, otherwise use the task's due date
        let startDate;
        if (providedBaseDate) {
            console.log(`Using provided base date: ${providedBaseDate} instead of task due date: ${task.due_date}`);
            startDate = new Date(providedBaseDate);
        } else {
            startDate = new Date(task.due_date);
        }

        const interval = task.recurrence_interval || 1;

        // Parse the start date as a local date to avoid timezone issues
        let parsedBaseDate;
        if (startDate.toString().includes('T')) {
            // If it's a full datetime string, parse it normally
            parsedBaseDate = new Date(startDate);
        } else {
            // If it's just a date string (YYYY-MM-DD), parse it as local date
            const [year, month, day] = startDate.toString().split('-').map(Number);
            parsedBaseDate = new Date(year, month - 1, day); // month is 0-indexed
        }

        // Create next date using Date methods to avoid timezone issues and off-by-one errors
        let nextDueDate = new Date(parsedBaseDate);

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

    /**
     * Get a complete weekly list of all tasks organized by day and notification
     * @param {Date} weekStart - Start of the week (Sunday)
     * @param {Date} weekEnd - End of the week (Saturday)
     * @param {string} mode - Optional mode: 'recap' for completed tasks only, default shows all tasks
     * @returns {Promise<Object>} Complete weekly breakdown
     */
    static async getWeeklyCompleteList(weekStart, weekEnd, mode = null) {
        try {
            // For recap mode, we need to get ALL tasks from the week for accurate statistics
            // but filter the display to show only completed tasks
            let allTasksQuery, completedTasksQuery;
            let allTasks, completedTasks;

            if (mode === 'recap' || mode === 'summary') {
                // Query 1: Get ALL tasks that were available during the week (for accurate statistics)
                allTasksQuery = `
                    SELECT
                        t.*,
                        CASE
                            WHEN t.parent_task_id IS NOT NULL THEN 'subtask'
                            WHEN t.has_subtasks = true THEN 'parent'
                            ELSE 'standalone'
                        END as task_type
                    FROM tasks t
                    WHERE
                        -- Tasks with assigned dates in the week
                        (t.assigned_date >= $1::date AND t.assigned_date <= $2::date)
                        OR
                        -- Tasks with due dates in the week
                        (t.due_date >= $1::date AND t.due_date <= $2::date)
                        OR
                        -- Tasks with reminder times in the week
                        (t.reminder_time >= $1::timestamp AND t.reminder_time <= $2::timestamp)
                        OR
                        -- Recurring tasks that might have occurrences in the week
                        (t.recurrence_type IS NOT NULL AND t.recurrence_type != 'none' AND t.due_date IS NOT NULL)
                    ORDER BY
                        COALESCE(t.assigned_date, t.due_date, t.created_at::date) ASC,
                        t.reminder_time ASC NULLS LAST,
                        t.is_complete ASC,
                        t.created_at DESC
                `;

                // Query 2: Get only completed tasks that were completed during the week (for display)
                completedTasksQuery = `
                    SELECT
                        t.*,
                        CASE
                            WHEN t.parent_task_id IS NOT NULL THEN 'subtask'
                            WHEN t.has_subtasks = true THEN 'parent'
                            ELSE 'standalone'
                        END as task_type
                    FROM tasks t
                    WHERE
                        t.is_complete = true
                        AND t.updated_at >= $1::timestamp
                        AND t.updated_at <= $2::timestamp
                    ORDER BY
                        COALESCE(t.assigned_date, t.due_date, t.created_at::date) ASC,
                        t.reminder_time ASC NULLS LAST,
                        t.created_at DESC
                `;

                // Execute both queries
                const [allTasksResult, completedTasksResult] = await Promise.all([
                    db.query(allTasksQuery, [weekStart, weekEnd]),
                    db.query(completedTasksQuery, [weekStart, weekEnd])
                ]);

                allTasks = allTasksResult.rows;
                completedTasks = completedTasksResult.rows;
            } else {
                // Regular mode: get all tasks for the week
                const query = `
                    SELECT
                        t.*,
                        CASE
                            WHEN t.parent_task_id IS NOT NULL THEN 'subtask'
                            WHEN t.has_subtasks = true THEN 'parent'
                            ELSE 'standalone'
                        END as task_type
                    FROM tasks t
                    WHERE
                        -- Tasks with assigned dates in the week
                        (t.assigned_date >= $1::date AND t.assigned_date <= $2::date)
                        OR
                        -- Tasks with due dates in the week
                        (t.due_date >= $1::date AND t.due_date <= $2::date)
                        OR
                        -- Tasks with reminder times in the week
                        (t.reminder_time >= $1::timestamp AND t.reminder_time <= $2::timestamp)
                        OR
                        -- Recurring tasks that might have occurrences in the week
                        (t.recurrence_type IS NOT NULL AND t.recurrence_type != 'none' AND t.due_date IS NOT NULL)
                    ORDER BY
                        COALESCE(t.assigned_date, t.due_date, t.created_at::date) ASC,
                        t.reminder_time ASC NULLS LAST,
                        t.is_complete ASC,
                        t.created_at DESC
                `;

                const result = await db.query(query, [weekStart, weekEnd]);
                allTasks = result.rows;
                completedTasks = allTasks; // For regular mode, use all tasks for display
            }

            // Initialize daily breakdown
            const dailyBreakdown = {
                sunday: [],
                monday: [],
                tuesday: [],
                wednesday: [],
                thursday: [],
                friday: [],
                saturday: []
            };

            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

            // Initialize notification breakdown
            const notificationBreakdown = [];
            const notificationMap = new Map();

            // Initialize summary counters
            let totalTasks = 0;
            let completedTasksCount = 0;
            let pendingTasks = 0;
            let tasksWithNotifications = 0;

            // Calculate statistics from ALL tasks (for accurate success rate)
            for (const task of allTasks) {
                totalTasks++;

                if (task.is_complete) {
                    completedTasksCount++;
                } else {
                    pendingTasks++;
                }

                if (task.reminder_time) {
                    tasksWithNotifications++;
                }
            }

            // Use the appropriate task set for display (completed tasks in recap mode, all tasks otherwise)
            const tasksForDisplay = (mode === 'recap' || mode === 'summary') ? completedTasks : allTasks;

            // Process tasks for display (daily breakdown and notifications)
            for (const task of tasksForDisplay) {
                // Add task to daily breakdown based on assigned_date or due_date
                const taskDate = task.assigned_date || task.due_date;
                if (taskDate) {
                    const date = new Date(taskDate);
                    if (date >= weekStart && date <= weekEnd) {
                        const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
                        const dayName = dayNames[dayIndex];

                        // Enhance task with additional info
                        const enhancedTask = {
                            ...task,
                            dateFormatted: date.toISOString().split('T')[0],
                            dayOfWeek: dayName,
                            hasSubtasks: task.has_subtasks || false,
                            isSubtask: task.parent_task_id !== null,
                            reminderFormatted: task.reminder_time ?
                                new Date(task.reminder_time).toLocaleString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                }) : null
                        };

                        dailyBreakdown[dayName].push(enhancedTask);
                    }
                }

                // Add task to notification breakdown if it has a reminder
                if (task.reminder_time) {
                    const reminderDate = new Date(task.reminder_time);
                    if (reminderDate >= weekStart && reminderDate <= weekEnd) {
                        const dateKey = reminderDate.toISOString().split('T')[0];
                        const timeKey = reminderDate.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                        });

                        const notificationKey = `${dateKey}_${timeKey}`;

                        if (!notificationMap.has(notificationKey)) {
                            notificationMap.set(notificationKey, {
                                date: dateKey,
                                time: timeKey,
                                dateFormatted: reminderDate.toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric'
                                }),
                                tasks: []
                            });
                        }

                        const enhancedTask = {
                            ...task,
                            reminderDateTime: reminderDate.toISOString(),
                            taskDate: task.assigned_date || task.due_date,
                            taskDateFormatted: (task.assigned_date || task.due_date) ?
                                new Date(task.assigned_date || task.due_date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                }) : null
                        };

                        notificationMap.get(notificationKey).tasks.push(enhancedTask);
                    }
                }
            }

            // Convert notification map to sorted array
            const sortedNotifications = Array.from(notificationMap.values()).sort((a, b) => {
                const dateA = new Date(`${a.date} ${a.time}`);
                const dateB = new Date(`${b.date} ${b.time}`);
                return dateA - dateB;
            });

            // Get subtasks for parent tasks
            for (const dayName of dayNames) {
                for (const task of dailyBreakdown[dayName]) {
                    if (task.has_subtasks) {
                        const subtasks = await this.getSubtasks(task.id);
                        task.subtasks = subtasks.map(subtask => ({
                            ...subtask,
                            isSubtask: true,
                            parentTaskId: task.id
                        }));
                    }
                }
            }

            return {
                dailyBreakdown,
                notificationBreakdown: sortedNotifications,
                summary: {
                    totalTasks,
                    completedTasks: completedTasksCount,
                    pendingTasks,
                    tasksWithNotifications,
                    completionRate: totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0
                }
            };

        } catch (error) {
            console.error('Error in getWeeklyCompleteList:', error);
            throw error;
        }
    }

    /**
     * Update task priority order
     * @param {number} id - The task ID
     * @param {number} priorityOrder - The new priority order (lower numbers = higher priority)
     * @returns {Promise<Object>} The updated task
     */
    static async updateTaskPriority(id, priorityOrder) {
        const result = await db.query(
            'UPDATE tasks SET priority_order = $1 WHERE id = $2 RETURNING *',
            [priorityOrder, id]
        );
        return result.rows[0];
    }

    /**
     * Batch update task priorities
     * @param {Array} priorityUpdates - Array of {id, priorityOrder} objects
     * @returns {Promise<Array>} Array of updated tasks
     */
    static async batchUpdateTaskPriorities(priorityUpdates) {
        if (!priorityUpdates || priorityUpdates.length === 0) {
            return [];
        }

        // Use individual UPDATE queries for simplicity and reliability
        const updatedTasks = [];

        for (const update of priorityUpdates) {
            const taskId = parseInt(update.id);
            const priorityOrder = parseInt(update.priorityOrder);

            console.log(`Updating task ${taskId} with priority_order ${priorityOrder}`);

            const result = await db.query(
                'UPDATE tasks SET priority_order = $1 WHERE id = $2 RETURNING *',
                [priorityOrder, taskId]
            );

            if (result.rows.length > 0) {
                updatedTasks.push(result.rows[0]);
                console.log(`Successfully updated task ${taskId} priority_order to ${result.rows[0].priority_order}`);
            }
        }

        return updatedTasks;
    }

    /**
     * Get tasks sorted by priority order
     * @param {boolean} includeCompleted - Whether to include completed tasks
     * @returns {Promise<Array>} Array of tasks sorted by priority
     */
    static async getTasksByPriority(includeCompleted = false) {
        let whereClause = 'WHERE (is_subtask = FALSE OR is_subtask IS NULL)';
        if (!includeCompleted) {
            whereClause += ' AND is_complete = FALSE';
        }

        const result = await db.query(`
            SELECT * FROM tasks
            ${whereClause}
            ORDER BY
                CASE WHEN priority_order IS NULL THEN 1 ELSE 0 END,
                priority_order ASC,
                is_complete ASC,
                assigned_date ASC,
                created_at DESC
        `);
        return result.rows;
    }

    /**
     * Get tasks for priority comparison (limited set for ranking)
     * @param {number} selectedTaskId - The task being ranked
     * @param {number} limit - Maximum number of tasks to return (default 5)
     * @param {string} filter - Filter type to apply (unassigned_today, today, week, month, all)
     * @returns {Promise<Array>} Array of tasks for comparison
     */
    static async getTasksForPriorityComparison(selectedTaskId, limit = 5, filter = 'all') {
        // Get the selected task first
        const selectedTaskResult = await db.query(
            'SELECT * FROM tasks WHERE id = $1',
            [selectedTaskId]
        );

        if (selectedTaskResult.rowCount === 0) {
            throw new Error('Selected task not found');
        }

        const selectedTask = selectedTaskResult.rows[0];

        // Calculate date ranges for filtering
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + 6); // End of week (6 days from today)
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1); // Start of month
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0); // End of month

        // Determine if the selected task is overdue
        const selectedTaskDueDate = selectedTask.due_date ? new Date(selectedTask.due_date) : null;
        const isSelectedTaskOverdue = selectedTaskDueDate && selectedTaskDueDate < today;

        // OVERDUE TASKS SHOULD NEVER BE RANKED - they automatically have highest priority
        if (isSelectedTaskOverdue) {
            console.log(`Task ${selectedTaskId} is overdue and should not be ranked. Overdue tasks automatically have highest priority.`);
            return []; // Return empty array - no comparison needed
        }

        // Build filter conditions based on the filter type
        let filterConditions = '';
        let queryParams = [selectedTaskId];
        let paramIndex = 2;

        switch (filter) {
            case 'unassigned_today':
                // Tasks that are unassigned or due today (EXCLUDING overdue tasks)
                // This matches the frontend logic: (isUnassigned || isDueToday) && !isDueTomorrow && !isOverdue
                filterConditions = `
                    AND (
                        due_date IS NULL -- Unassigned tasks
                        OR (due_date::date = $${paramIndex}::date) -- Due today
                    )
                    AND (due_date IS NULL OR due_date::date != $${paramIndex + 1}::date) -- Exclude due tomorrow (NULL-safe)
                    AND (due_date IS NULL OR due_date::date >= $${paramIndex}::date) -- Exclude overdue tasks
                `;
                queryParams.push(today.toISOString().split('T')[0], tomorrow.toISOString().split('T')[0]);
                paramIndex += 2;
                break;

            case 'today':
                // Tasks due today only (EXCLUDING overdue tasks) - matches frontend: isTaskDueToday(task)
                filterConditions = `
                    AND due_date IS NOT NULL
                    AND due_date::date = $${paramIndex}::date
                `;
                queryParams.push(today.toISOString().split('T')[0]);
                paramIndex += 1;
                break;

            case 'week':
                // Tasks due this week (EXCLUDING overdue tasks) - matches frontend logic
                filterConditions = `
                    AND due_date IS NOT NULL
                    AND due_date::date >= $${paramIndex}::date
                    AND due_date::date <= $${paramIndex + 1}::date
                `;
                queryParams.push(today.toISOString().split('T')[0], weekEnd.toISOString().split('T')[0]);
                paramIndex += 2;
                break;

            case 'month':
                // Tasks due this month (EXCLUDING overdue tasks) - matches frontend logic using year and month comparison
                filterConditions = `
                    AND due_date IS NOT NULL
                    AND EXTRACT(YEAR FROM due_date::date) = $${paramIndex}
                    AND EXTRACT(MONTH FROM due_date::date) = $${paramIndex + 1}
                    AND due_date::date >= $${paramIndex + 2}::date -- Exclude overdue tasks
                `;
                queryParams.push(monthStart.getFullYear(), monthStart.getMonth() + 1, today.toISOString().split('T')[0]);
                paramIndex += 3;
                break;

            case 'all':
            default:
                // For 'all' filter, exclude overdue tasks (they have automatic highest priority)
                filterConditions = `
                    AND (due_date IS NULL OR due_date::date >= $${paramIndex}::date)
                `;
                queryParams.push(today.toISOString().split('T')[0]);
                paramIndex += 1;
                break;
        }

        // Add limit parameter
        queryParams.push(limit - 1);

        // Get other incomplete tasks for comparison, excluding the selected task
        const otherTasksResult = await db.query(`
            SELECT * FROM tasks
            WHERE id != $1
            AND (is_subtask = FALSE OR is_subtask IS NULL)
            AND is_complete = FALSE
            ${filterConditions}
            ORDER BY
                CASE WHEN priority_order IS NULL THEN 1 ELSE 0 END,
                priority_order ASC,
                assigned_date ASC,
                created_at DESC
            LIMIT $${paramIndex}
        `, queryParams);

        console.log(`Priority comparison filter: ${filter}, excluding overdue tasks, found ${otherTasksResult.rows.length} comparison tasks`);

        // Return selected task first, then other tasks
        return [selectedTask, ...otherTasksResult.rows];
    }

}

module.exports = Task;
