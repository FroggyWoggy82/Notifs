// db/migrations/create_exercise_preferences_table.js
const db = require('../index');

async function createExercisePreferencesTable() {
    try {
        // Check if table already exists
        const tableExists = await db.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'exercise_preferences'
            );
        `);

        if (tableExists.rows[0].exists) {
            console.log('exercise_preferences table already exists, skipping creation');
            return;
        }

        // Create the table
        await db.query(`
            CREATE TABLE exercise_preferences (
                preference_id SERIAL PRIMARY KEY,
                exercise_id INTEGER NOT NULL,
                weight_unit VARCHAR(20) NOT NULL DEFAULT 'lbs',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT unique_exercise_preference UNIQUE (exercise_id)
            );
        `);

        console.log('Successfully created exercise_preferences table');
    } catch (error) {
        console.error('Error creating exercise_preferences table:', error);
    }
}

// Run the migration if this file is executed directly
if (require.main === module) {
    createExercisePreferencesTable()
        .then(() => {
            console.log('Migration completed');
            process.exit(0);
        })
        .catch(err => {
            console.error('Migration failed:', err);
            process.exit(1);
        });
}

module.exports = { createExercisePreferencesTable };
