// add-constraint.js
const db = require('./db');

async function addUniqueConstraint() {
    try {
        // Check if the constraint already exists
        const checkResult = await db.query(`
            SELECT constraint_name
            FROM information_schema.table_constraints
            WHERE table_name = 'habit_completions'
            AND constraint_name = 'unique_habit_completion'
        `);

        if (checkResult.rows.length > 0) {
            console.log('Unique constraint already exists');
            return;
        }

        // Add a regular unique index instead
        await db.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS unique_habit_completion_idx
            ON habit_completions (habit_id, completion_date)
            WHERE deleted_at IS NULL
        `);

        console.log('Added unique constraint to habit_completions table');
    } catch (err) {
        console.error('Error adding unique constraint:', err);
    } finally {
        process.exit();
    }
}

addUniqueConstraint();
