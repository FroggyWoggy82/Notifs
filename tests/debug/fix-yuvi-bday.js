// Script to fix Yuvi's Bday task
const { Pool } = require('pg');
require('dotenv').config();

// Create a new pool using the DATABASE_URL from .env
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function fixYuviBday() {
    const client = await pool.connect();
    
    try {
        console.log('Database connected successfully');
        console.log('Fixing Yuvi\'s Bday task...');

        // Get Yuvi's Bday task
        const result = await client.query(`
            SELECT * FROM tasks
            WHERE title = 'Yuvi''s Bday'
        `);

        if (result.rows.length === 0) {
            console.log('No Yuvi\'s Bday task found');
            return;
        }

        console.log(`Found ${result.rows.length} Yuvi's Bday tasks`);

        // Process each task
        for (const task of result.rows) {
            console.log('\n=============================');
            console.log(`Task: ${task.title} (ID: ${task.id})`);
            console.log('=============================');
            console.log('Is complete?', task.is_complete);
            console.log('Due date:', task.due_date);
            console.log('Recurrence interval:', task.recurrence_interval);
            console.log('Current next occurrence date:', task.next_occurrence_date);

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

                // To account for timezone issues, we need to add a day to the date
                // This ensures that when the date is displayed in the local timezone,
                // it will show the correct date
                nextDueDate.setDate(nextDueDate.getDate() + 1);
                
                // Format the date as YYYY-MM-DD
                const year = nextDueDate.getFullYear();
                const month = String(nextDueDate.getMonth() + 1).padStart(2, '0'); // JavaScript months are 0-indexed
                const day = String(nextDueDate.getDate()).padStart(2, '0');
                
                // Format as YYYY-MM-DD
                const formattedDate = `${year}-${month}-${day}`;
                
                console.log('Formatted date with timezone adjustment:', formattedDate);

                // Update the task's next_occurrence_date in the database
                try {
                    const updateResult = await client.query(
                        'UPDATE tasks SET next_occurrence_date = $1 WHERE id = $2 RETURNING *',
                        [formattedDate, task.id]
                    );
                    
                    console.log('Updated next occurrence date for task:', updateResult.rows[0].title);
                    console.log('New next occurrence date:', updateResult.rows[0].next_occurrence_date);
                } catch (updateErr) {
                    console.error('Error updating next occurrence date:', updateErr);
                }
            }
        }

        console.log('\nYuvi\'s Bday task has been updated successfully!');

    } catch (err) {
        console.error('Error fixing Yuvi\'s Bday task:', err);
    } finally {
        client.release();
        pool.end();
    }
}

fixYuviBday();
