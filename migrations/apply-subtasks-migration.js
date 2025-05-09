// apply-subtasks-migration.js
const fs = require('fs');
const path = require('path');
const db = require('../utils/db');

async function applyMigration() {
    try {
        console.log('Connecting to database...');
        
        // Read the migration file
        const migrationPath = path.join(__dirname, '014_add_subtasks_to_tasks.sql');
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('Applying migration to add subtasks support to tasks table...');
        await db.query(migrationSql);
        
        console.log('Migration applied successfully!');
    } catch (err) {
        console.error('Error applying migration:', err);
    } finally {
        process.exit();
    }
}

applyMigration();
