-- Apply all migrations in one file

-- Add user_id column to weight_logs table if it doesn't exist
ALTER TABLE weight_logs ADD COLUMN IF NOT EXISTS user_id INTEGER NOT NULL DEFAULT 1;

-- Add user_id column to weight_goals table if it doesn't exist
ALTER TABLE weight_goals ADD COLUMN IF NOT EXISTS user_id INTEGER NOT NULL DEFAULT 1;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_id ON weight_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_goals_user_id ON weight_goals(user_id);

-- Verify the columns exist
DO $$
BEGIN
    RAISE NOTICE 'Verifying weight_logs.user_id column...';
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'weight_logs' AND column_name = 'user_id'
    ) THEN
        RAISE NOTICE 'weight_logs.user_id column exists.';
    ELSE
        RAISE EXCEPTION 'weight_logs.user_id column does not exist!';
    END IF;

    RAISE NOTICE 'Verifying weight_goals.user_id column...';
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'weight_goals' AND column_name = 'user_id'
    ) THEN
        RAISE NOTICE 'weight_goals.user_id column exists.';
    ELSE
        RAISE EXCEPTION 'weight_goals.user_id column does not exist!';
    END IF;
END $$;
