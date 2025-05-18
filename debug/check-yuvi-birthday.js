// Script to check Yuvi's Birthday task
const db = require('../utils/db');

function calculateNextOccurrence(task) {
    if (!task.recurrence_type || task.recurrence_type === 'none' || !task.due_date) {
        return null;
    }

    const dueDate = new Date(task.due_date);
    if (isNaN(dueDate.getTime())) {
        console.warn(`Invalid due_date for task ${task.id}: ${task.due_date}`);
        return null;
    }

    const interval = task.recurrence_interval || 1;

    // Create a new date object to avoid modifying the original
    const nextDate = new Date(dueDate);

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
            // For yearly recurrences, we need to be careful with the date
            // Get the original month and day
            const originalMonth = dueDate.getMonth();
            const originalDay = dueDate.getDate();
            
            // Set the new year
            nextDate.setFullYear(dueDate.getFullYear() + interval);
            
            // Ensure the month and day remain the same
            nextDate.setMonth(originalMonth);
            nextDate.setDate(originalDay);
            break;
        default:
            return null;
    }

    return nextDate;
}

async function checkYuviBirthday() {
    try {
        console.log('Checking Yuvi\'s Birthday task...');

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
            console.log('Assigned date:', task.assigned_date);
            console.log('Recurrence interval:', task.recurrence_interval);
            console.log('Next occurrence date:', task.next_occurrence_date);

            // Calculate the next occurrence date using the client-side function
            const nextOccurrence = calculateNextOccurrence(task);
            console.log('Calculated next occurrence date (client-side):', nextOccurrence.toISOString());
            console.log('Formatted for display:', nextOccurrence.toLocaleDateString());

            // Check if the next occurrence date is correct
            if (task.next_occurrence_date) {
                const storedNextOccurrence = new Date(task.next_occurrence_date);
                console.log('Stored next occurrence date (database):', storedNextOccurrence.toISOString());
                console.log('Formatted for display:', storedNextOccurrence.toLocaleDateString());

                // Check if the dates match
                const clientSideDate = nextOccurrence.toISOString().split('T')[0];
                const databaseDate = storedNextOccurrence.toISOString().split('T')[0];
                console.log('Client-side date:', clientSideDate);
                console.log('Database date:', databaseDate);
                console.log('Dates match?', clientSideDate === databaseDate);
            }
        }

    } catch (err) {
        console.error('Error checking Yuvi\'s Birthday task:', err);
    } finally {
        process.exit();
    }
}

checkYuviBirthday();
