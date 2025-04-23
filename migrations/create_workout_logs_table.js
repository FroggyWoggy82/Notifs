// migrations/create_workout_logs_table.js
const db = require('../utils/db');

async function createWorkoutLogsTable() {
    try {
        // Check if table already exists
        const tableExists = await db.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'workout_logs'
            );
        `);

        if (tableExists.rows[0].exists) {
            console.log('workout_logs table already exists, skipping creation');
            return;
        }

        // Create the table
        await db.query(`
            CREATE TABLE workout_logs (
                log_id SERIAL PRIMARY KEY,
                workout_name VARCHAR(255) NOT NULL,
                date_performed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                duration INTERVAL,
                notes TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Successfully created workout_logs table');
    } catch (error) {
        console.error('Error creating workout_logs table:', error);
    }
}

// Run the migration if this file is executed directly
if (require.main === module) {
    createWorkoutLogsTable()
        .then(() => {
            console.log('Migration completed');
            process.exit(0);
        })
        .catch(err => {
            console.error('Migration failed:', err);
            process.exit(1);
        });
}

module.exports = { createWorkoutLogsTable };
