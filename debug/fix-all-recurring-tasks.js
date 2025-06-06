const db = require('../utils/db');

async function fixAllRecurringTasks() {
    try {
        console.log('Starting to fix all recurring tasks...');
        
        // Get all recurring tasks
        const result = await db.query(`
            SELECT id, title, due_date, recurrence_type, recurrence_interval, next_occurrence_date
            FROM tasks 
            WHERE recurrence_type IS NOT NULL 
            AND recurrence_type != 'none' 
            AND due_date IS NOT NULL
            ORDER BY id
        `);

        console.log(`Found ${result.rowCount} recurring tasks to check`);

        // Process each task
        for (const task of result.rows) {
            console.log('\n=============================');
            console.log(`Task: ${task.title} (ID: ${task.id})`);
            console.log('=============================');
            console.log('Current due date:', task.due_date);
            console.log('Current next occurrence date:', task.next_occurrence_date);
            console.log('Recurrence type:', task.recurrence_type);
            console.log('Recurrence interval:', task.recurrence_interval);

            // Calculate the correct next occurrence date using the new logic
            if (task.due_date) {
                // Handle the due date - it might be a Date object or string from the database
                let dueDate;

                if (task.due_date instanceof Date) {
                    dueDate = task.due_date;
                } else {
                    // Parse the due date as a local date to avoid timezone issues
                    const dueDateStr = task.due_date;

                    if (dueDateStr.includes('T')) {
                        // If it's a full datetime string, parse it normally
                        dueDate = new Date(dueDateStr);
                    } else {
                        // If it's just a date string (YYYY-MM-DD), parse it as local date
                        const [year, month, day] = dueDateStr.split('-').map(Number);
                        dueDate = new Date(year, month - 1, day); // month is 0-indexed
                    }
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
                    default:
                        console.log('Unknown recurrence type:', task.recurrence_type);
                        continue;
                }

                // Format the date as YYYY-MM-DD for database storage
                const year_next = nextDueDate.getFullYear();
                const month_next = String(nextDueDate.getMonth() + 1).padStart(2, '0');
                const day_next = String(nextDueDate.getDate()).padStart(2, '0');
                const formattedNextOccurrenceDate = `${year_next}-${month_next}-${day_next}`;
                
                console.log('Calculated next occurrence date:', formattedNextOccurrenceDate);
                
                // Check if the current next occurrence date is different
                if (task.next_occurrence_date !== formattedNextOccurrenceDate) {
                    console.log(`❌ INCORRECT: Current next occurrence (${task.next_occurrence_date}) != Calculated (${formattedNextOccurrenceDate})`);
                    
                    // Update the next occurrence date
                    try {
                        await db.query(
                            'UPDATE tasks SET next_occurrence_date = $1 WHERE id = $2',
                            [formattedNextOccurrenceDate, task.id]
                        );
                        console.log(`✅ FIXED: Updated next occurrence date to ${formattedNextOccurrenceDate}`);
                    } catch (updateError) {
                        console.error('❌ ERROR updating task:', updateError);
                    }
                } else {
                    console.log(`✅ CORRECT: Next occurrence date is already correct`);
                }
            }
        }

        console.log('\n=============================');
        console.log('Finished fixing all recurring tasks!');
        console.log('=============================');

    } catch (err) {
        console.error('Error fixing recurring tasks:', err);
    } finally {
        process.exit();
    }
}

fixAllRecurringTasks();
