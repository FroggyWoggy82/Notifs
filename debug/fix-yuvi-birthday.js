// Script to fix Yuvi's Birthday task
const db = require('../utils/db');

async function fixYuviBirthday() {
    try {
        console.log('Fixing Yuvi\'s Birthday task...');

        // Get the Yuvi's Birthday task
        const result = await db.query(`
            SELECT * FROM tasks
            WHERE title LIKE '%Yuvi%' AND recurrence_type = 'yearly'
        `);

        if (result.rows.length === 0) {
            console.log('Yuvi\'s Birthday task not found');
            return;
        }

        console.log(`Found ${result.rows.length} Yuvi's Birthday tasks`);

        // Process each task
        for (const task of result.rows) {
            console.log('\n=============================');
            console.log(`Task: ${task.title} (ID: ${task.id})`);
            console.log('=============================');
            console.log('Is complete?', task.is_complete);
            console.log('Due date:', task.due_date);
            console.log('Recurrence interval:', task.recurrence_interval);
            console.log('Next occurrence date:', task.next_occurrence_date);

            // Calculate the correct next occurrence date
            if (task.due_date) {
                const dueDate = new Date(task.due_date);
                const interval = task.recurrence_interval || 1;

                // Create a new date object to avoid modifying the original
                let nextDueDate = new Date(dueDate);

                // For yearly recurrences, we need to be careful with the date
                // Get the original month and day
                const originalMonth = dueDate.getMonth();
                const originalDay = dueDate.getDate();
                
                // Set the new year
                nextDueDate.setFullYear(dueDate.getFullYear() + interval);
                
                // Ensure the month and day remain the same
                nextDueDate.setMonth(originalMonth);
                nextDueDate.setDate(originalDay);

                console.log('Calculated next occurrence date:', nextDueDate.toISOString());

                // Update the task's next_occurrence_date in the database
                const formattedDate = nextDueDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
                
                try {
                    const updateResult = await db.query(
                        'UPDATE tasks SET next_occurrence_date = $1 WHERE id = $2 RETURNING *',
                        [formattedDate, task.id]
                    );
                    
                    console.log('Updated next occurrence date for task:', updateResult.rows[0]);
                } catch (updateErr) {
                    console.error('Error updating next occurrence date:', updateErr);
                }
            }
        }

        // Also fix the test birthday tasks
        const testResult = await db.query(`
            SELECT * FROM tasks
            WHERE title LIKE '%Test Birthday%' AND recurrence_type = 'yearly'
        `);

        if (testResult.rows.length === 0) {
            console.log('Test Birthday tasks not found');
            return;
        }

        console.log(`Found ${testResult.rows.length} Test Birthday tasks`);

        // Process each task
        for (const task of testResult.rows) {
            console.log('\n=============================');
            console.log(`Task: ${task.title} (ID: ${task.id})`);
            console.log('=============================');
            console.log('Is complete?', task.is_complete);
            console.log('Due date:', task.due_date);
            console.log('Recurrence interval:', task.recurrence_interval);
            console.log('Next occurrence date:', task.next_occurrence_date);

            // Calculate the correct next occurrence date
            if (task.due_date) {
                const dueDate = new Date(task.due_date);
                const interval = task.recurrence_interval || 1;

                // Create a new date object to avoid modifying the original
                let nextDueDate = new Date(dueDate);

                // For yearly recurrences, we need to be careful with the date
                // Get the original month and day
                const originalMonth = dueDate.getMonth();
                const originalDay = dueDate.getDate();
                
                // Set the new year
                nextDueDate.setFullYear(dueDate.getFullYear() + interval);
                
                // Ensure the month and day remain the same
                nextDueDate.setMonth(originalMonth);
                nextDueDate.setDate(originalDay);

                console.log('Calculated next occurrence date:', nextDueDate.toISOString());

                // Update the task's next_occurrence_date in the database
                const formattedDate = nextDueDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
                
                try {
                    const updateResult = await db.query(
                        'UPDATE tasks SET next_occurrence_date = $1 WHERE id = $2 RETURNING *',
                        [formattedDate, task.id]
                    );
                    
                    console.log('Updated next occurrence date for task:', updateResult.rows[0]);
                } catch (updateErr) {
                    console.error('Error updating next occurrence date:', updateErr);
                }
            }
        }

    } catch (err) {
        console.error('Error fixing Yuvi\'s Birthday task:', err);
    } finally {
        process.exit();
    }
}

fixYuviBirthday();
