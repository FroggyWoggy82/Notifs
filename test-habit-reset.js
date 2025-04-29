/**
 * Test Habit Reset
 * Command-line script to test the habit reset functionality
 */

const resetHabitCompletions = require('./utils/reset-habit-completions');
const db = require('./utils/db');

async function testHabitReset() {
    console.log('=== TESTING HABIT RESET FUNCTIONALITY ===');
    
    try {
        // 1. Get current habit data
        console.log('\n1. Getting current habit data...');
        const client = await db.pool.connect();
        
        try {
            // Get all habits
            const habitsResult = await client.query('SELECT id, title, completions_per_day FROM habits');
            console.log(`Found ${habitsResult.rowCount} habits:`);
            
            for (const habit of habitsResult.rows) {
                console.log(`- Habit ${habit.id}: ${habit.title} (completions_per_day: ${habit.completions_per_day})`);
                
                // Get completions for this habit
                const completionsResult = await client.query(
                    'SELECT * FROM habit_completions WHERE habit_id = $1 ORDER BY completion_date DESC LIMIT 5',
                    [habit.id]
                );
                
                if (completionsResult.rowCount > 0) {
                    console.log(`  Recent completions (${completionsResult.rowCount} total):`);
                    for (const completion of completionsResult.rows) {
                        console.log(`  - ${completion.completion_date}: ${completion.deleted_at ? 'DELETED' : 'ACTIVE'}`);
                    }
                } else {
                    console.log('  No recent completions found');
                }
            }
            
            // 2. Run the reset function
            console.log('\n2. Running habit reset function...');
            const resetResult = await resetHabitCompletions();
            console.log('Reset result:', resetResult);
            
            // 3. Get updated habit data
            console.log('\n3. Getting updated habit data...');
            
            // Get all habits again
            const updatedHabitsResult = await client.query('SELECT id, title, completions_per_day FROM habits');
            console.log(`Found ${updatedHabitsResult.rowCount} habits after reset:`);
            
            for (const habit of updatedHabitsResult.rows) {
                console.log(`- Habit ${habit.id}: ${habit.title} (completions_per_day: ${habit.completions_per_day})`);
                
                // Get completions for this habit
                const completionsResult = await client.query(
                    'SELECT * FROM habit_completions WHERE habit_id = $1 ORDER BY completion_date DESC LIMIT 5',
                    [habit.id]
                );
                
                if (completionsResult.rowCount > 0) {
                    console.log(`  Recent completions (${completionsResult.rowCount} total):`);
                    for (const completion of completionsResult.rows) {
                        console.log(`  - ${completion.completion_date}: ${completion.deleted_at ? 'DELETED' : 'ACTIVE'}`);
                    }
                } else {
                    console.log('  No recent completions found');
                }
            }
            
            console.log('\n=== HABIT RESET TEST COMPLETED SUCCESSFULLY ===');
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error testing habit reset:', error);
    } finally {
        // Close the database connection pool
        await db.pool.end();
    }
}

// Run the test
testHabitReset();
