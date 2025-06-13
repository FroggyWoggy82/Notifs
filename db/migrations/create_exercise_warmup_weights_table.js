const db = require('../../utils/db');

async function createExerciseWarmupWeightsTable() {
    try {
        // Check if table already exists
        const tableExists = await db.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'exercise_warmup_weights'
            );
        `);

        if (tableExists.rows[0].exists) {
            console.log('exercise_warmup_weights table already exists, skipping creation');
            return;
        }

        // Create the table
        await db.query(`
            CREATE TABLE exercise_warmup_weights (
                warmup_id SERIAL PRIMARY KEY,
                exercise_id INTEGER NOT NULL REFERENCES exercises(exercise_id) ON DELETE CASCADE,
                warmup_weight NUMERIC(8,2) NOT NULL,
                weight_unit VARCHAR(20) NOT NULL DEFAULT 'lbs',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT unique_exercise_warmup UNIQUE (exercise_id)
            );
        `);

        // Add index for faster lookups
        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_exercise_warmup_weights_exercise_id 
            ON exercise_warmup_weights(exercise_id);
        `);

        // Create or replace the update trigger function
        await db.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);

        // Create the trigger
        await db.query(`
            CREATE TRIGGER update_exercise_warmup_weights_updated_at
                BEFORE UPDATE ON exercise_warmup_weights
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);

        console.log('exercise_warmup_weights table created successfully');
    } catch (error) {
        console.error('Error creating exercise_warmup_weights table:', error);
        throw error;
    }
}

module.exports = createExerciseWarmupWeightsTable;

// Run migration if called directly
if (require.main === module) {
    createExerciseWarmupWeightsTable()
        .then(() => {
            console.log('Migration completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Migration failed:', error);
            process.exit(1);
        });
}
