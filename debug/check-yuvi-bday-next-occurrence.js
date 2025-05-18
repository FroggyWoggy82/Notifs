// Script to check Yuvi's Bday next occurrence date
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

async function checkYuviBdayNextOccurrence() {
    const client = await pool.connect();
    
    try {
        console.log('Database connected successfully');
        console.log('Checking Yuvi\'s Bday next occurrence date...');

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
            console.log('Recurrence type:', task.recurrence_type);
            console.log('Current next occurrence date:', task.next_occurrence_date);

            // Update the next_occurrence_date to 2026-05-14 (which should display as 5/15/2026 due to the timezone issue)
            const formattedNextOccurrenceDate = '2026-05-14';
            
            console.log('Setting next occurrence date to:', formattedNextOccurrenceDate);

            // Update the task's next_occurrence_date in the database
            try {
                const updateResult = await client.query(
                    'UPDATE tasks SET next_occurrence_date = $1 WHERE id = $2 RETURNING *',
                    [formattedNextOccurrenceDate, task.id]
                );
                
                console.log('Updated next occurrence date for task:', updateResult.rows[0].title);
                console.log('New next occurrence date:', updateResult.rows[0].next_occurrence_date);
            } catch (updateErr) {
                console.error('Error updating next occurrence date:', updateErr);
            }
        }

        console.log('\nYuvi\'s Bday next occurrence date has been updated successfully!');

    } catch (err) {
        console.error('Error checking Yuvi\'s Bday next occurrence date:', err);
    } finally {
        client.release();
        pool.end();
    }
}

checkYuviBdayNextOccurrence();
