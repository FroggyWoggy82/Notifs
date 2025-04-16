// Script to check task filtering logic
const db = require('./db');

async function checkTaskFiltering() {
    try {
        console.log('Checking task filtering logic...');
        
        // Get the Progress Photo task
        const result = await db.query(`
            SELECT * FROM tasks 
            WHERE title = 'Progress Photo'
        `);
        
        if (result.rows.length === 0) {
            console.log('Progress Photo task not found');
            return;
        }
        
        const task = result.rows[0];
        console.log('Progress Photo task:', task);
        
        // Check if the task is completed
        console.log('Is task completed?', task.is_complete);
        
        // Check if the task has a due date
        console.log('Due date:', task.due_date);
        
        // Check if the task is overdue
        const dueDate = new Date(task.due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day
        console.log('Is task overdue?', dueDate < today);
        
        // Check if the task is recurring
        console.log('Recurrence type:', task.recurrence_type);
        console.log('Recurrence interval:', task.recurrence_interval);
        
        // Calculate next occurrence
        if (task.recurrence_type && task.recurrence_type !== 'none') {
            const assignedDate = new Date(task.assigned_date);
            const interval = task.recurrence_interval || 1;
            
            const nextDate = new Date(assignedDate);
            
            switch (task.recurrence_type) {
                case 'daily':
                    nextDate.setDate(nextDate.getDate() + interval);
                    break;
                case 'weekly':
                    nextDate.setDate(nextDate.getDate() + (interval * 7));
                    break;
                case 'monthly':
                    nextDate.setMonth(nextDate.getMonth() + interval);
                    break;
                case 'yearly':
                    nextDate.setFullYear(nextDate.getFullYear() + interval);
                    break;
            }
            
            console.log('Next occurrence date:', nextDate);
            
            // Check if the next occurrence is overdue
            console.log('Is next occurrence overdue?', nextDate < today);
        }
        
    } catch (err) {
        console.error('Error checking task filtering:', err);
    } finally {
        process.exit();
    }
}

checkTaskFiltering();
