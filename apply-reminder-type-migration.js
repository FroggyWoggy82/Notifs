// apply-reminder-type-migration.js
const fs = require('fs');
const path = require('path');
const db = require('./db');

async function applyMigration() {
    try {
        console.log('Connecting to database...');
        
        // Read the migration file
        const migrationPath = path.join(__dirname, 'migrations', '010_add_reminder_type_to_tasks.sql');
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('Applying migration to add reminder_type column to tasks...');
        await db.query(migrationSql);
        
        console.log('Migration applied successfully!');
    } catch (err) {
        console.error('Error applying migration:', err);
    } finally {
        process.exit();
    }
}

applyMigration();
