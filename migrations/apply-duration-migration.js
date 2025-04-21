// apply-duration-migration.js
const fs = require('fs');
const path = require('path');
const db = require('../utils/db');

async function applyMigration() {
    try {
        console.log('Connecting to database...');
        
        // Read the migration file
        const migrationPath = path.join(__dirname, '011_add_duration_to_tasks.sql');
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('Applying migration to add duration column to tasks...');
        await db.query(migrationSql);
        
        console.log('Migration applied successfully!');
    } catch (err) {
        console.error('Error applying migration:', err);
    } finally {
        process.exit();
    }
}

applyMigration();
