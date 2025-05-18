// Script to fix yearly recurrences
const db = require('../utils/db');

async function fixYearlyRecurrences() {
    try {
        console.log('Fixing yearly recurrences...');

        // Get all yearly recurring tasks
        const result = await db.query(`
            SELECT * FROM tasks
            WHERE recurrence_type = 'yearly'
        `);

        if (result.rows.length === 0) {
            console.log('No yearly recurring tasks found');
            return;
        }

        console.log(`Found ${result.rows.length} yearly recurring tasks`);

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
                // Update both completed and active tasks
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
        console.error('Error fixing yearly recurrences:', err);
    } finally {
        process.exit();
    }
}

fixYearlyRecurrences();
