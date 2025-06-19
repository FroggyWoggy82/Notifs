// Script to check the shave and Laundry tasks
const db = require('../utils/db');

async function checkRecurringTasks() {
    try {
        console.log('Checking recurring tasks...');
        
        // Get the shave and Laundry tasks
        const result = await db.query(`
            SELECT * FROM tasks
            WHERE title IN ('shave', 'Laundry')
        `);
        
        if (result.rows.length === 0) {
            console.log('Tasks not found');
            return;
        }
        
        // Process each task
        for (const task of result.rows) {
            console.log('\n=============================');
            console.log(`Task: ${task.title} (ID: ${task.id})`);
            console.log('=============================');
            console.log('Is complete?', task.is_complete);
            console.log('Due date:', task.due_date);
            console.log('Recurrence type:', task.recurrence_type);
            console.log('Recurrence interval:', task.recurrence_interval);
            
            // Calculate next occurrence
            if (task.recurrence_type && task.recurrence_type !== 'none' && task.due_date) {
                // Parse the due date as a local date to avoid timezone issues
                const dueDateStr = task.due_date;
                let dueDate;

                if (dueDateStr.includes('T')) {
                    // If it's a full datetime string, parse it normally
                    dueDate = new Date(dueDateStr);
                } else {
                    // If it's just a date string (YYYY-MM-DD), parse it as local date
                    const [year, month, day] = dueDateStr.split('-').map(Number);
                    dueDate = new Date(year, month - 1, day); // month is 0-indexed
                }

                const interval = task.recurrence_interval || 1;

                // Create next date using the same approach to avoid timezone issues
                let nextDueDate;
                const year = dueDate.getFullYear();
                const month = dueDate.getMonth();
                const day = dueDate.getDate();

                // Calculate the next occurrence based on recurrence type
                switch (task.recurrence_type) {
                    case 'daily':
                        nextDueDate = new Date(year, month, day + interval);
                        break;
                    case 'weekly':
                        nextDueDate = new Date(year, month, day + (interval * 7));
                        break;
                    case 'monthly':
                        nextDueDate = new Date(year, month + interval, day);
                        break;
                    case 'yearly':
                        nextDueDate = new Date(year + interval, month, day);
                        break;
                }
                
                console.log('Next occurrence date:', nextDueDate.toISOString());
                
                // Check if the next occurrence is overdue
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Reset time to start of day
                
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);
                
                console.log('Today:', today.toISOString());
                console.log('Tomorrow:', tomorrow.toISOString());
                
                const isNextOverdue = nextDueDate < today;
                const isNextDueToday = nextDueDate.getFullYear() === today.getFullYear() &&
                                      nextDueDate.getMonth() === today.getMonth() &&
                                      nextDueDate.getDate() === today.getDate();
                const isNextDueTomorrow = nextDueDate.getFullYear() === tomorrow.getFullYear() &&
                                         nextDueDate.getMonth() === tomorrow.getMonth() &&
                                         nextDueDate.getDate() === tomorrow.getDate();
                
                console.log('Is next occurrence overdue?', isNextOverdue);
                console.log('Is next occurrence due today?', isNextDueToday);
                console.log('Is next occurrence due tomorrow?', isNextDueTomorrow);
                
                // Should this task be shown in the unassigned_today filter?
                const shouldBeInFilter = task.is_complete ? isNextOverdue : true;
                console.log('Should be in unassigned_today filter?', shouldBeInFilter);
                
                // Should this task show "Due Tomorrow" label?
                const shouldShowDueTomorrow = isNextDueTomorrow;
                console.log('Should show "Due Tomorrow" label?', shouldShowDueTomorrow);
            }
        }
        
    } catch (err) {
        console.error('Error checking recurring tasks:', err);
    } finally {
        process.exit();
    }
}

checkRecurringTasks();
