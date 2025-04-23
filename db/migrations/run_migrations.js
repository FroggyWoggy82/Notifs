// db/migrations/run_migrations.js
const { createExercisePreferencesTable } = require('./create_exercise_preferences_table');

async function runMigrations() {
    try {
        console.log('Running migrations...');
        
        // Run migrations in sequence
        await createExercisePreferencesTable();
        
        console.log('All migrations completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

// Run migrations
runMigrations()
    .then(() => {
        console.log('Migration process completed');
        process.exit(0);
    })
    .catch(err => {
        console.error('Migration process failed:', err);
        process.exit(1);
    });
