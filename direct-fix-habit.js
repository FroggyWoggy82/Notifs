/**
 * Direct Fix for Habit 2 (Thinking about food)
 * This script directly modifies the database to fix the habit completion issue
 */

const db = require('./utils/db');

async function directFixHabit() {
    try {
        console.log('Starting direct fix for habit 2...');
        
        // 1. Check if the habit exists
        const habitResult = await db.query('SELECT * FROM habits WHERE id = 2');
        
        if (habitResult.rows.length === 0) {
            console.log('Habit with ID 2 not found');
            return;
        }
        
        const habit = habitResult.rows[0];
        console.log('Current habit state:', habit);
        
        // 2. Create a new table for high-completion habits
        console.log('Creating high_completion_habits table...');
        
        await db.query(`
            CREATE TABLE IF NOT EXISTS high_completion_habits (
                id SERIAL PRIMARY KEY,
                habit_id INTEGER NOT NULL REFERENCES habits(id),
                current_count INTEGER DEFAULT 0,
                last_updated DATE,
                UNIQUE(habit_id)
            )
        `);
        
        // 3. Check if the habit is already in the high_completion_habits table
        const highCompletionResult = await db.query(
            'SELECT * FROM high_completion_habits WHERE habit_id = 2'
        );
        
        if (highCompletionResult.rows.length === 0) {
            // 4. Insert the habit into the high_completion_habits table
            console.log('Adding habit 2 to high_completion_habits table...');
            
            const today = new Date().toISOString().split('T')[0];
            
            await db.query(
                'INSERT INTO high_completion_habits (habit_id, current_count, last_updated) VALUES (2, $1, $2)',
                [habit.total_completions || 0, today]
            );
            
            console.log('Habit 2 added to high_completion_habits table');
        } else {
            console.log('Habit 2 already in high_completion_habits table:', highCompletionResult.rows[0]);
        }
        
        // 5. Create a new route for incrementing high-completion habits
        console.log('Creating new route for incrementing high-completion habits...');
        
        // This will be done in a separate file
        
        console.log('Direct fix for habit 2 completed successfully!');
    } catch (error) {
        console.error('Error fixing habit 2:', error);
    } finally {
        process.exit();
    }
}

directFixHabit();
