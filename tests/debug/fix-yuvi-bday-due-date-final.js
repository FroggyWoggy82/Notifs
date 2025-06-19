// Script to fix Yuvi's Bday due date
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

async function fixYuviBdayDueDate() {
    const client = await pool.connect();
    
    try {
        console.log('Database connected successfully');
        console.log('Fixing Yuvi\'s Bday due date...');

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

            // Set the due date to 2025-05-14 (which should display as 5/15/2025 due to the timezone issue)
            const formattedDueDate = '2025-05-14';
            
            console.log('Setting due date to:', formattedDueDate);

            // Update the task's due_date in the database
            try {
                const updateResult = await client.query(
                    'UPDATE tasks SET due_date = $1 WHERE id = $2 RETURNING *',
                    [formattedDueDate, task.id]
                );
                
                console.log('Updated due date for task:', updateResult.rows[0].title);
                console.log('New due date:', updateResult.rows[0].due_date);
            } catch (updateErr) {
                console.error('Error updating due date:', updateErr);
            }
        }

        console.log('\nYuvi\'s Bday due date has been updated successfully!');

    } catch (err) {
        console.error('Error fixing Yuvi\'s Bday due date:', err);
    } finally {
        client.release();
        pool.end();
    }
}

fixYuviBdayDueDate();
