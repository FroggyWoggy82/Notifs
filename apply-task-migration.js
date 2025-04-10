const fs = require('fs');
const path = require('path');
const db = require('./db');

async function applyTaskMigration() {
    try {
        console.log('Connecting to database...');
        
        // Read the migration file
        const migrationPath = path.join(__dirname, 'migrations', '007_add_updated_at_to_tasks.sql');
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('Applying task migration...');
        await db.query(migrationSql);
        
        console.log('Task migration applied successfully!');
    } catch (err) {
        console.error('Error applying task migration:', err);
    } finally {
        process.exit();
    }
}

applyTaskMigration();
