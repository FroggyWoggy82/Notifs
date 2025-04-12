// Script to run the migration to modify the habit_completions constraint
const db = require('./db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        console.log('Connecting to database...');
        
        // Read the SQL file
        const sqlPath = path.join(__dirname, 'migrations', '007_modify_habit_completions_constraint.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('Running migration...');
        await db.query(sql);
        
        console.log('Migration completed successfully.');
        
        // Verify the constraint is gone
        const constraintCheck = await db.query(`
            SELECT 1
            FROM pg_constraint
            WHERE conname = 'habit_completions_habit_id_completion_date_key'
        `);
        
        if (constraintCheck.rows.length === 0) {
            console.log('Verification successful: Unique constraint has been removed.');
        } else {
            console.log('Warning: Unique constraint still exists!');
        }
        
        // Verify the index exists
        const indexCheck = await db.query(`
            SELECT 1
            FROM pg_indexes
            WHERE indexname = 'idx_habit_completions_habit_date_created'
        `);
        
        if (indexCheck.rows.length > 0) {
            console.log('Verification successful: New index has been created.');
        } else {
            console.log('Warning: New index was not created!');
        }
        
    } catch (err) {
        console.error('Error running migration:', err);
    } finally {
        process.exit();
    }
}

runMigration();
