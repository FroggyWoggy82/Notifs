// Script to fix all yearly recurring tasks in the database
const { Pool } = require('pg');
require('dotenv').config();

console.log('Starting script...');
console.log('Environment variables loaded');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Found' : 'Not found');

// Create a new pool using the DATABASE_URL from .env
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

console.log('Database pool created');

async function fixAllYearlyTasks() {
    const client = await pool.connect();
    
    try {
        console.log('Database connected successfully');
        console.log('Fixing all yearly recurring tasks...');

        // Get all yearly recurring tasks
        const result = await client.query(`
            SELECT * FROM tasks
            WHERE recurrence_type = 'yearly'
        `);

        if (result.rows.length === 0) {
            console.log('No yearly recurring tasks found');
            return;
        }

        console.log(`Found ${result.rows.length} yearly recurring tasks`);

        // Process each task
        let updatedCount = 0;
        for (const task of result.rows) {
            console.log('\n=============================');
            console.log(`Task: ${task.title} (ID: ${task.id})`);
            console.log('=============================');
            console.log('Is complete?', task.is_complete);
            console.log('Due date:', task.due_date);
            console.log('Recurrence interval:', task.recurrence_interval);
            console.log('Current next occurrence date:', task.next_occurrence_date);

            // Only process tasks with next_occurrence_date
            if (task.next_occurrence_date) {
                // Parse the next occurrence date
                const nextOccurrenceDate = new Date(task.next_occurrence_date);
                
                // Extract the date parts
                const year = nextOccurrenceDate.getFullYear();
                const month = nextOccurrenceDate.getMonth(); // JavaScript months are 0-indexed
                const day = nextOccurrenceDate.getDate();
                
                // Create a new date with the same date parts but without the timezone offset
                const newDate = new Date(year, month, day);
                
                // Format the date as YYYY-MM-DD
                const formattedDate = newDate.toISOString().split('T')[0];
                
                console.log('Setting next occurrence date to:', formattedDate);

                // Update the task's next_occurrence_date in the database
                try {
                    const updateResult = await client.query(
                        'UPDATE tasks SET next_occurrence_date = $1 WHERE id = $2 RETURNING *',
                        [formattedDate, task.id]
                    );
                    
                    console.log('Updated next occurrence date for task:', updateResult.rows[0].title);
                    console.log('New next occurrence date:', updateResult.rows[0].next_occurrence_date);
                    updatedCount++;
                } catch (updateErr) {
                    console.error('Error updating next occurrence date:', updateErr);
                }
            }
        }

        console.log(`\nUpdated ${updatedCount} yearly recurring tasks successfully!`);

    } catch (err) {
        console.error('Error fixing yearly recurring tasks:', err);
    } finally {
        client.release();
        pool.end();
    }
}

fixAllYearlyTasks();
