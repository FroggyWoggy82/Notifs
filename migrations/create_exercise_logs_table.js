// migrations/create_exercise_logs_table.js
const db = require('../utils/db');

async function createExerciseLogsTable() {
    try {
        // Check if table already exists
        const tableExists = await db.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'exercise_logs'
            );
        `);

        if (tableExists.rows[0].exists) {
            console.log('exercise_logs table already exists, skipping creation');
            return;
        }

        // Create the table
        await db.query(`
            CREATE TABLE exercise_logs (
                log_id SERIAL PRIMARY KEY,
                workout_log_id INTEGER NOT NULL,
                exercise_id INTEGER NOT NULL,
                exercise_name VARCHAR(255) NOT NULL,
                sets_completed INTEGER,
                reps_completed TEXT,
                weight_used TEXT,
                weight_unit VARCHAR(20) DEFAULT 'lbs',
                notes TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_workout_log FOREIGN KEY (workout_log_id) REFERENCES workout_logs(log_id) ON DELETE CASCADE
            );
        `);

        console.log('Successfully created exercise_logs table');
    } catch (error) {
        console.error('Error creating exercise_logs table:', error);
    }
}

// Run the migration if this file is executed directly
if (require.main === module) {
    createExerciseLogsTable()
        .then(() => {
            console.log('Migration completed');
            process.exit(0);
        })
        .catch(err => {
            console.error('Migration failed:', err);
            process.exit(1);
        });
}

module.exports = { createExerciseLogsTable };
