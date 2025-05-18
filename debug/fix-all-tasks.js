// Script to fix all tasks in the database
console.log('Starting script...');

const { Pool } = require('pg');
console.log('pg module loaded');

require('dotenv').config();
console.log('dotenv module loaded');

console.log('Environment variables:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Found' : 'Not found');

// Create a new pool using the DATABASE_URL from .env
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});
console.log('Database pool created');

// Function to fix all tasks
async function fixAllTasks() {
    console.log('Starting fixAllTasks function...');
    let client;

    try {
        client = await pool.connect();
        console.log('Database connected successfully');
        console.log('Fixing all tasks...');

        // Get all tasks
        console.log('Querying tasks...');
        const result = await client.query(`
            SELECT * FROM tasks
        `);

        if (result.rows.length === 0) {
            console.log('No tasks found');
            return;
        }

        console.log(`Found ${result.rows.length} tasks`);

        // Process each task
        let updatedCount = 0;
        for (const task of result.rows) {
            // Only process yearly recurring tasks with next_occurrence_date
            if (task.recurrence_type === 'yearly' && task.next_occurrence_date) {
                console.log(`Processing task: ${task.title} (ID: ${task.id})`);

                // Parse the next occurrence date
                const nextOccurrenceDate = new Date(task.next_occurrence_date);

                // Format the date as YYYY-MM-DD
                const year = nextOccurrenceDate.getFullYear();
                const month = String(nextOccurrenceDate.getMonth() + 1).padStart(2, '0'); // JavaScript months are 0-indexed
                const day = String(nextOccurrenceDate.getDate() + 1).padStart(2, '0'); // Add 1 day to fix timezone issue

                // Format as YYYY-MM-DD
                const formattedDate = `${year}-${month}-${day}`;

                console.log(`Setting next occurrence date for task ${task.id} to: ${formattedDate}`);

                // Update the task's next_occurrence_date in the database
                try {
                    const updateResult = await client.query(
                        'UPDATE tasks SET next_occurrence_date = $1 WHERE id = $2 RETURNING *',
                        [formattedDate, task.id]
                    );

                    console.log(`Updated next occurrence date for task ${task.id}`);
                    updatedCount++;
                } catch (updateErr) {
                    console.error(`Error updating next occurrence date for task ${task.id}:`, updateErr);
                }
            }
        }

        console.log(`\nUpdated ${updatedCount} tasks successfully!`);

    } catch (err) {
        console.error('Error fixing tasks:', err);
    } finally {
        if (client) {
            console.log('Releasing client...');
            client.release();
        }
        console.log('Ending pool...');
        await pool.end();
        console.log('Pool ended');
    }
}

// Call the function
console.log('Calling fixAllTasks function...');
fixAllTasks().then(() => {
    console.log('Script completed');
}).catch(err => {
    console.error('Error in main function:', err);
});
