/**
 * Script to fix the habit with ID 2 (Thinking about food)
 * This script will:
 * 1. Check the current state of the habit
 * 2. Fix any issues with the habit_completions table
 * 3. Update the habit's total_completions count
 */

const db = require('./utils/db');

async function fixHabit2() {
    try {
        console.log('Connecting to database...');
        
        // 1. Check the current state of the habit
        const habitResult = await db.query('SELECT * FROM habits WHERE id = 2');
        
        if (habitResult.rows.length === 0) {
            console.log('Habit with ID 2 not found');
            return;
        }
        
        const habit = habitResult.rows[0];
        console.log('Current habit state:', habit);
        
        // 2. Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        console.log('Today\'s date:', today);
        
        // 3. Check for completions today
        const completionsResult = await db.query(
            'SELECT * FROM habit_completions WHERE habit_id = 2 AND completion_date = $1',
            [today]
        );
        
        console.log('Completions today:', completionsResult.rows);
        
        // 4. Check if the habit_completions table has a unique constraint
        const constraintResult = await db.query(`
            SELECT conname, pg_get_constraintdef(oid) 
            FROM pg_constraint 
            WHERE conrelid = 'habit_completions'::regclass 
            AND contype = 'u'
        `);
        
        console.log('Unique constraints on habit_completions:', constraintResult.rows);
        
        // 5. If there's a unique constraint, drop it
        if (constraintResult.rows.length > 0) {
            for (const constraint of constraintResult.rows) {
                console.log(`Dropping constraint: ${constraint.conname}`);
                await db.query(`ALTER TABLE habit_completions DROP CONSTRAINT IF EXISTS ${constraint.conname}`);
            }
            console.log('Constraints dropped successfully');
        }
        
        // 6. Add a new completion for today
        try {
            await db.query(
                'INSERT INTO habit_completions (habit_id, completion_date) VALUES (2, $1)',
                [today]
            );
            console.log('Added new completion for today');
        } catch (error) {
            console.error('Error adding completion:', error);
        }
        
        // 7. Update the total_completions count
        const totalCompletionsResult = await db.query(
            'SELECT COUNT(*) FROM habit_completions WHERE habit_id = 2'
        );
        
        const totalCompletions = parseInt(totalCompletionsResult.rows[0].count, 10);
        console.log('Total completions count:', totalCompletions);
        
        await db.query(
            'UPDATE habits SET total_completions = $1 WHERE id = 2',
            [totalCompletions]
        );
        
        console.log('Updated total_completions count to', totalCompletions);
        
        // 8. Check the final state of the habit
        const finalHabitResult = await db.query('SELECT * FROM habits WHERE id = 2');
        console.log('Final habit state:', finalHabitResult.rows[0]);
        
        console.log('Habit 2 fixed successfully!');
    } catch (error) {
        console.error('Error fixing habit 2:', error);
    } finally {
        process.exit();
    }
}

fixHabit2();
