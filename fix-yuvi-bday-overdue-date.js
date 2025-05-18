/**
 * Fix Yuvi's Bday Overdue Date - Server-side Script
 * This script modifies the task data directly in the database to change the due date for Yuvi's Bday task.
 */

const { Pool } = require('pg');

// Create a new pool using the connection string from the environment variable
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function fixYuviBdayOverdueDate() {
    try {
        // Connect to the database
        const client = await pool.connect();
        
        try {
            // Find Yuvi's Bday task
            const findResult = await client.query(
                "SELECT id, title, due_date FROM tasks WHERE title LIKE '%Yuvi%'"
            );
            
            if (findResult.rows.length === 0) {
                console.log('No task found with "Yuvi" in the title');
                return;
            }
            
            const task = findResult.rows[0];
            console.log('Found task:', task);
            
            // Update the due date to 2025-05-15
            const updateResult = await client.query(
                "UPDATE tasks SET due_date = '2025-05-15T00:00:00.000Z' WHERE id = $1",
                [task.id]
            );
            
            console.log(`Updated ${updateResult.rowCount} row(s)`);
            console.log('Due date for Yuvi\'s Bday task has been changed to 2025-05-15');
        } finally {
            // Release the client back to the pool
            client.release();
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // End the pool
        await pool.end();
    }
}

// Run the function
fixYuviBdayOverdueDate();
