// apply-calorie-targets-migration.js
const fs = require('fs');
const path = require('path');
const db = require('../utils/db');

async function applyMigration() {
    try {
        console.log('Connecting to database...');
        
        // Read the migration file
        const migrationPath = path.join(__dirname, '..', 'config', 'db', 'migrations', '20240501_create_calorie_targets_table.sql');
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('Applying migration to create calorie_targets table...');
        await db.query(migrationSql);
        
        console.log('Migration applied successfully!');
    } catch (err) {
        console.error('Error applying migration:', err);
    } finally {
        process.exit();
    }
}

applyMigration();
