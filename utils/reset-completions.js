// reset-completions.js
const db = require('./db');

async function resetCompletions() {
    try {
        console.log('Starting reset of habit_completions table...');
        
        // Begin transaction
        const client = await db.getClient();
        try {
            await client.query('BEGIN');
            
            // 1. Drop the existing habit_completions table
            console.log('Dropping habit_completions table...');
            await client.query('DROP TABLE IF EXISTS habit_completions');
            
            // 2. Create a new habit_completions table with a unique constraint
            console.log('Creating new habit_completions table...');
            await client.query(`
                CREATE TABLE habit_completions (
                    id SERIAL PRIMARY KEY,
                    habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
                    completion_date DATE NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    UNIQUE(habit_id, completion_date)
                )
            `);
            
            // 3. Reset the total_completions for all habits to 0
            console.log('Resetting total_completions for all habits...');
            await client.query('UPDATE habits SET total_completions = 0');
            
            await client.query('COMMIT');
            console.log('Reset completed successfully!');
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Error during reset:', err);
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error resetting completions:', err);
    } finally {
        process.exit();
    }
}

resetCompletions();
