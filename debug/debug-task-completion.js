// Script to debug task completion and next occurrence creation
const db = require('./db');

async function debugTaskCompletion() {
    try {
        console.log('Debugging task completion and next occurrence creation...');
        
        // Get the Laundry task
        const taskResult = await db.query(`
            SELECT * FROM tasks
            WHERE title = 'Laundry'
        `);
        
        if (taskResult.rows.length === 0) {
            console.log('Laundry task not found');
            return;
        }
        
        const task = taskResult.rows[0];
        console.log('Task:', task);
        
        // Simulate marking the task as complete
        console.log('Simulating task completion...');
        
        // 1. Update the task to mark it as complete
        const updateResult = await db.query(`
            UPDATE tasks
            SET is_complete = true, updated_at = NOW()
            WHERE id = $1
            RETURNING *
        `, [task.id]);
        
        if (updateResult.rows.length === 0) {
            console.log('Failed to update task');
            return;
        }
        
        const updatedTask = updateResult.rows[0];
        console.log('Updated task:', updatedTask);
        
        // 2. Create the next occurrence
        if (updatedTask.recurrence_type && updatedTask.recurrence_type !== 'none') {
            console.log('Creating next occurrence...');
            
            // Calculate the next occurrence date
            if (!updatedTask.due_date) {
                console.log('Task has no due date');
                return;
            }
            
            const dueDate = new Date(updatedTask.due_date);
            const interval = updatedTask.recurrence_interval || 1;
            
            let nextDueDate = new Date(dueDate);
            
            // Calculate the next occurrence based on recurrence type
            switch (updatedTask.recurrence_type) {
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
                    console.log('Invalid recurrence type');
                    return;
            }
            
            console.log('Next due date:', nextDueDate.toISOString());
            
            // Create a new task for the next occurrence
            try {
                const result = await db.query(
                    `INSERT INTO tasks (title, description, due_date,
                                     recurrence_type, recurrence_interval, is_complete)
                     VALUES ($1, $2, $3, $4, $5, false) RETURNING *`,
                    [
                        updatedTask.title,
                        updatedTask.description,
                        nextDueDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
                        updatedTask.recurrence_type,
                        updatedTask.recurrence_interval
                    ]
                );
                
                console.log('Created next occurrence:', result.rows[0]);
            } catch (err) {
                console.error('Error creating next occurrence:', err);
            }
        }
        
    } catch (err) {
        console.error('Error debugging task completion:', err);
    } finally {
        process.exit();
    }
}

debugTaskCompletion();
