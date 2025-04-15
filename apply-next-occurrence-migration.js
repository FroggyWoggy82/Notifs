// apply-next-occurrence-migration.js
const fs = require('fs');
const path = require('path');
const db = require('./db');

async function applyMigration() {
    try {
        console.log('Connecting to database...');
        
        // Read the migration file
        const migrationPath = path.join(__dirname, 'migrations', '007_add_next_occurrence_date_to_tasks.sql');
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('Applying migration to add next_occurrence_date column to tasks...');
        await db.query(migrationSql);
        
        console.log('Migration applied successfully!');
    } catch (err) {
        console.error('Error applying migration:', err);
    } finally {
        process.exit();
    }
}

applyMigration();
