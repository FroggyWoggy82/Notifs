// migrations/run_workout_migrations.js
const { createWorkoutLogsTable } = require('./create_workout_logs_table');
const { createExerciseLogsTable } = require('./create_exercise_logs_table');

async function runWorkoutMigrations() {
    try {
        console.log('Running workout migrations...');
        
        // Run migrations in sequence
        await createWorkoutLogsTable();
        await createExerciseLogsTable();
        
        console.log('All workout migrations completed successfully');
    } catch (error) {
        console.error('Workout migration failed:', error);
    }
}

// Run migrations
runWorkoutMigrations()
    .then(() => {
        console.log('Workout migration process completed');
        process.exit(0);
    })
    .catch(err => {
        console.error('Workout migration process failed:', err);
        process.exit(1);
    });
