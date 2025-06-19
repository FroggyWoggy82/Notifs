// Script to debug why the Progress Photo task isn't showing up in the calendar
const db = require('../utils/db');

async function debugCalendarTask() {
    try {
        console.log('Checking Progress Photo task...');
        
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
        
        // Check assigned date and due date
        console.log('Assigned date:', task.assigned_date);
        console.log('Due date:', task.due_date);
        
        // Check if the task is recurring
        console.log('Recurrence type:', task.recurrence_type);
        console.log('Recurrence interval:', task.recurrence_interval);
        
        // Calculate next occurrence
        if (task.recurrence_type && task.recurrence_type !== 'none') {
            // Parse the assigned date
            const assignedDate = new Date(task.assigned_date);
            if (isNaN(assignedDate.getTime())) {
                console.warn(`Invalid assigned_date for task ${task.id}: ${task.assigned_date}`);
                return;
            }
            
            // Get the recurrence interval (default to 1 if not specified)
            const interval = task.recurrence_interval || 1;
            
            // Calculate the next occurrence based on recurrence type
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
            
            // Format the next occurrence date as YYYY-MM-DD
            const year = nextDate.getFullYear();
            const month = String(nextDate.getMonth() + 1).padStart(2, '0');
            const day = String(nextDate.getDate()).padStart(2, '0');
            const nextDateKey = `${year}-${month}-${day}`;
            console.log('Next occurrence date key:', nextDateKey);
            
            // Check if the next occurrence is in April 2025
            console.log('Is next occurrence in April 2025?', 
                nextDate.getFullYear() === 2025 && 
                nextDate.getMonth() === 3); // April is month 3 (0-indexed)
        }
        
    } catch (err) {
        console.error('Error debugging calendar task:', err);
    } finally {
        process.exit();
    }
}

debugCalendarTask();
