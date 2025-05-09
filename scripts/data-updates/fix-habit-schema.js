/**
 * Fix Habit Schema
 * This script fixes the habit_completions table schema to support multiple completions per day
 */

const db = require('./utils/db');

async function fixHabitSchema() {
    try {
        console.log('Starting habit schema fix...');

        // 1. Check if the habit_completions table exists
        const tableCheckResult = await db.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'habit_completions'
            )
        `);

        const tableExists = tableCheckResult.rows[0].exists;

        if (!tableExists) {
            console.log('habit_completions table does not exist, creating it...');

            await db.query(`
                CREATE TABLE habit_completions (
                    id SERIAL PRIMARY KEY,
                    habit_id INTEGER NOT NULL REFERENCES habits(id),
                    completion_date DATE NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    deleted_at TIMESTAMP WITH TIME ZONE
                )
            `);

            console.log('habit_completions table created successfully');
        } else {
            console.log('habit_completions table already exists');

            // Check if deleted_at column exists
            const columnCheckResult = await db.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.columns
                    WHERE table_schema = 'public'
                    AND table_name = 'habit_completions'
                    AND column_name = 'deleted_at'
                )
            `);

            const deletedAtColumnExists = columnCheckResult.rows[0].exists;

            if (!deletedAtColumnExists) {
                console.log('deleted_at column does not exist, adding it...');

                await db.query(`
                    ALTER TABLE habit_completions
                    ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE
                `);

                console.log('deleted_at column added successfully');
            } else {
                console.log('deleted_at column already exists');
            }
        }

        // 2. Check if there's a unique constraint on habit_id and completion_date
        const constraintCheckResult = await db.query(`
            SELECT conname
            FROM pg_constraint
            WHERE conrelid = 'habit_completions'::regclass
            AND contype = 'u'
        `);

        const constraints = constraintCheckResult.rows.map(row => row.conname);
        console.log('Found constraints:', constraints);

        // 3. Drop any unique constraints on habit_id and completion_date
        for (const constraint of constraints) {
            if (constraint.includes('habit_id') || constraint.includes('completion_date')) {
                console.log(`Dropping constraint ${constraint}...`);

                await db.query(`
                    ALTER TABLE habit_completions
                    DROP CONSTRAINT IF EXISTS ${constraint}
                `);

                console.log(`Constraint ${constraint} dropped successfully`);
            }
        }

        // 4. Create an index on habit_id and completion_date for performance
        console.log('Creating index on habit_id and completion_date...');

        try {
            await db.query(`
                CREATE INDEX IF NOT EXISTS habit_completions_habit_id_completion_date_idx
                ON habit_completions (habit_id, completion_date)
            `);

            console.log('Index created successfully');
        } catch (error) {
            console.log('Error creating index:', error.message);
            console.log('Continuing with the fix...');
        }

        console.log('Habit schema fix completed successfully!');
    } catch (error) {
        console.error('Error fixing habit schema:', error);
    } finally {
        process.exit();
    }
}

fixHabitSchema();
