// Script to check Yuvi's Bday task
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

async function checkYuviBday() {
    const client = await pool.connect();
    
    try {
        console.log('Database connected successfully');
        console.log('Checking Yuvi\'s Bday task...');

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

            // Format the date for display
            if (task.next_occurrence_date) {
                const nextOccurrenceDate = new Date(task.next_occurrence_date);
                
                // Original format
                const month = nextOccurrenceDate.getMonth() + 1;
                const day = nextOccurrenceDate.getDate();
                const year = nextOccurrenceDate.getFullYear();
                console.log('Original format:', `${month}/${day}/${year}`);
                
                // Fixed format (add one day)
                const fixedDate = new Date(nextOccurrenceDate);
                fixedDate.setDate(fixedDate.getDate() + 1);
                const fixedMonth = fixedDate.getMonth() + 1;
                const fixedDay = fixedDate.getDate();
                const fixedYear = fixedDate.getFullYear();
                console.log('Fixed format:', `${fixedMonth}/${fixedDay}/${fixedYear}`);
            }
        }

    } catch (err) {
        console.error('Error checking Yuvi\'s Bday task:', err);
    } finally {
        client.release();
        pool.end();
    }
}

checkYuviBday();
