-- Add weight_increment column to exercise_preferences table
ALTER TABLE exercise_preferences ADD COLUMN IF NOT EXISTS weight_increment NUMERIC DEFAULT 5;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_exercise_preferences_exercise_id ON exercise_preferences(exercise_id);

-- Verify the column exists
DO $$
BEGIN
    RAISE NOTICE 'Verifying weight_increment column...';
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'exercise_preferences'
        AND column_name = 'weight_increment'
    ) THEN
        RAISE NOTICE 'weight_increment column exists.';
    ELSE
        RAISE EXCEPTION 'weight_increment column does not exist!';
    END IF;
END $$;
