-- Add default_reps column to exercise_preferences table
ALTER TABLE exercise_preferences ADD COLUMN IF NOT EXISTS default_reps VARCHAR(20) DEFAULT NULL;

-- Verify the column exists
DO $$
BEGIN
    RAISE NOTICE 'Verifying default_reps column...';
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'exercise_preferences'
        AND column_name = 'default_reps'
    ) THEN
        RAISE NOTICE 'default_reps column exists.';
    ELSE
        RAISE EXCEPTION 'default_reps column does not exist!';
    END IF;
END $$;
