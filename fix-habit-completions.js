/**
 * Script to fix the habit_completions table
 * This script will:
 * 1. Check the current schema of the habit_completions table
 * 2. Remove any unique constraints that might be causing issues
 * 3. Add a new column to track multiple completions per day
 */

const db = require('./utils/db');

async function fixHabitCompletions() {
    try {
        console.log('Connecting to database...');
        
        // 1. Check if the habit_completions table exists
        const tableCheck = await db.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public'
                AND table_name = 'habit_completions'
            )
        `);
        
        const tableExists = tableCheck.rows[0].exists;
        console.log('habit_completions table exists:', tableExists);
        
        if (!tableExists) {
            console.log('Creating habit_completions table...');
            await db.query(`
                CREATE TABLE habit_completions (
                    id SERIAL PRIMARY KEY,
                    habit_id INTEGER NOT NULL,
                    completion_date DATE NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW(),
                    deleted_at TIMESTAMP
                )
            `);
            console.log('habit_completions table created successfully');
        }
        
        // 2. Get the table schema
        const schemaResult = await db.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'habit_completions'
            ORDER BY ordinal_position
        `);
        
        console.log('habit_completions table schema:');
        schemaResult.rows.forEach(row => {
            console.log(`  ${row.column_name} (${row.data_type}, ${row.is_nullable === 'YES' ? 'nullable' : 'not nullable'})`);
        });
        
        // 3. Check for unique constraints
        const constraintResult = await db.query(`
            SELECT conname, pg_get_constraintdef(oid) 
            FROM pg_constraint 
            WHERE conrelid = 'habit_completions'::regclass 
            AND contype = 'u'
        `);
        
        console.log('Unique constraints on habit_completions:', constraintResult.rows);
        
        // 4. Drop any unique constraints
        if (constraintResult.rows.length > 0) {
            for (const constraint of constraintResult.rows) {
                console.log(`Dropping constraint: ${constraint.conname}`);
                await db.query(`ALTER TABLE habit_completions DROP CONSTRAINT IF EXISTS ${constraint.conname}`);
            }
            console.log('Constraints dropped successfully');
        }
        
        // 5. Check if the completion_number column exists
        const completionNumberExists = schemaResult.rows.some(row => row.column_name === 'completion_number');
        
        if (!completionNumberExists) {
            console.log('Adding completion_number column...');
            await db.query(`
                ALTER TABLE habit_completions 
                ADD COLUMN completion_number INTEGER DEFAULT 1
            `);
            console.log('completion_number column added successfully');
        }
        
        // 6. Create an index for faster queries
        console.log('Creating index on habit_id and completion_date...');
        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id_date 
            ON habit_completions(habit_id, completion_date)
        `);
        console.log('Index created successfully');
        
        // 7. Fix the habit with ID 2
        console.log('Fixing habit with ID 2...');
        
        // 7.1. Get the current state of the habit
        const habitResult = await db.query('SELECT * FROM habits WHERE id = 2');
        
        if (habitResult.rows.length === 0) {
            console.log('Habit with ID 2 not found');
            return;
        }
        
        const habit = habitResult.rows[0];
        console.log('Current habit state:', habit);
        
        // 7.2. Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        console.log('Today\'s date:', today);
        
        // 7.3. Check for completions today
        const completionsResult = await db.query(
            'SELECT * FROM habit_completions WHERE habit_id = 2 AND completion_date = $1',
            [today]
        );
        
        console.log('Completions today:', completionsResult.rows);
        
        // 7.4. Add a new completion for today
        try {
            const nextCompletionNumber = completionsResult.rows.length + 1;
            await db.query(
                'INSERT INTO habit_completions (habit_id, completion_date, completion_number) VALUES (2, $1, $2)',
                [today, nextCompletionNumber]
            );
            console.log(`Added new completion for today (completion_number: ${nextCompletionNumber})`);
        } catch (error) {
            console.error('Error adding completion:', error);
        }
        
        // 7.5. Update the total_completions count
        const totalCompletionsResult = await db.query(
            'SELECT COUNT(*) FROM habit_completions WHERE habit_id = 2 AND deleted_at IS NULL'
        );
        
        const totalCompletions = parseInt(totalCompletionsResult.rows[0].count, 10);
        console.log('Total completions count:', totalCompletions);
        
        await db.query(
            'UPDATE habits SET total_completions = $1 WHERE id = 2',
            [totalCompletions]
        );
        
        console.log('Updated total_completions count to', totalCompletions);
        
        // 7.6. Check the final state of the habit
        const finalHabitResult = await db.query('SELECT * FROM habits WHERE id = 2');
        console.log('Final habit state:', finalHabitResult.rows[0]);
        
        console.log('Habit completions table fixed successfully!');
    } catch (error) {
        console.error('Error fixing habit_completions table:', error);
    } finally {
        process.exit();
    }
}

fixHabitCompletions();
