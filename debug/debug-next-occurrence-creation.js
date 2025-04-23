// Script to debug next occurrence creation
const db = require('../utils/db');

async function debugNextOccurrenceCreation() {
    try {
        console.log('Debugging next occurrence creation...');
        
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
        
        // Manually create the next occurrence
        console.log('Manually creating next occurrence...');
        
        // Calculate the next occurrence date
        if (!task.due_date) {
            console.log('Task has no due date');
            return;
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
                    task.title,
                    task.description,
                    nextDueDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
                    task.recurrence_type,
                    task.recurrence_interval
                ]
            );
            
            console.log('Created next occurrence:', result.rows[0]);
        } catch (err) {
            console.error('Error creating next occurrence:', err);
        }
        
    } catch (err) {
        console.error('Error debugging next occurrence creation:', err);
    } finally {
        process.exit();
    }
}

debugNextOccurrenceCreation();
