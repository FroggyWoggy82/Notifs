-- Create exercise_preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS exercise_preferences (
    preference_id SERIAL PRIMARY KEY,
    exercise_id INTEGER NOT NULL REFERENCES exercises(exercise_id) ON DELETE CASCADE,
    weight_unit VARCHAR(20) NOT NULL DEFAULT 'lbs',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create unique index on exercise_id to ensure one preference per exercise
CREATE UNIQUE INDEX IF NOT EXISTS idx_exercise_preferences_exercise_id ON exercise_preferences(exercise_id);

-- Verify the table exists
DO $$
BEGIN
    RAISE NOTICE 'Verifying exercise_preferences table...';
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'exercise_preferences'
    ) THEN
        RAISE NOTICE 'exercise_preferences table exists.';
    ELSE
        RAISE EXCEPTION 'exercise_preferences table does not exist!';
    END IF;
END $$;
