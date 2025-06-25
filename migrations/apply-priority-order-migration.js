const fs = require('fs');
const path = require('path');
const db = require('../utils/db');

/**
 * Apply the priority order migration to add priority_order field to tasks table
 */
async function applyPriorityOrderMigration() {
    try {
        console.log('Starting priority order migration...');
        
        // Read the SQL migration file
        const migrationPath = path.join(__dirname, '017_add_priority_order_to_tasks.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        // Execute the migration
        await db.query(migrationSQL);
        
        console.log('✅ Priority order migration completed successfully');
        console.log('   - Added priority_order column to tasks table');
        console.log('   - Created indexes for efficient priority sorting');
        console.log('   - Initialized existing tasks with default priority order');
        
        // Verify the migration worked
        const result = await db.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'tasks' AND column_name = 'priority_order'
        `);
        
        if (result.rows.length > 0) {
            console.log('✅ Verification: priority_order column exists');
            console.log('   Column details:', result.rows[0]);
        } else {
            throw new Error('Migration verification failed: priority_order column not found');
        }
        
        // Check that existing tasks have priority_order values
        const taskCount = await db.query('SELECT COUNT(*) as count FROM tasks WHERE priority_order IS NOT NULL');
        console.log(`✅ Verification: ${taskCount.rows[0].count} tasks have priority_order values`);
        
    } catch (error) {
        console.error('❌ Priority order migration failed:', error);
        throw error;
    }
}

// Run the migration if this file is executed directly
if (require.main === module) {
    applyPriorityOrderMigration()
        .then(() => {
            console.log('Migration completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Migration failed:', error);
            process.exit(1);
        });
}

module.exports = applyPriorityOrderMigration;
