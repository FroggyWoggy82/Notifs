-- Add completion_count column to workouts table
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS completion_count INTEGER DEFAULT 0;

-- Verify the column exists
DO $$
BEGIN
    RAISE NOTICE 'Verifying completion_count column...';
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'workouts'
        AND column_name = 'completion_count'
    ) THEN
        RAISE NOTICE 'completion_count column exists.';
    ELSE
        RAISE EXCEPTION 'completion_count column does not exist!';
    END IF;
END $$;
