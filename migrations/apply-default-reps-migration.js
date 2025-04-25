// apply-default-reps-migration.js
const fs = require('fs');
const path = require('path');
const db = require('../utils/db');

async function applyMigration() {
    try {
        console.log('Connecting to database...');
        
        // Read the migration file
        const migrationPath = path.join(__dirname, '014_add_default_reps_to_exercise_preferences.sql');
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('Applying migration to add default_reps column to exercise_preferences...');
        await db.query(migrationSql);
        
        console.log('Migration applied successfully!');
    } catch (err) {
        console.error('Error applying migration:', err);
    } finally {
        process.exit();
    }
}

applyMigration();
