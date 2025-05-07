-- Apply all migrations in one file

-- Add user_id column to weight_logs table if it doesn't exist
ALTER TABLE weight_logs ADD COLUMN IF NOT EXISTS user_id INTEGER NOT NULL DEFAULT 1;

-- Add user_id column to weight_goals table if it doesn't exist
ALTER TABLE weight_goals ADD COLUMN IF NOT EXISTS user_id INTEGER NOT NULL DEFAULT 1;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_id ON weight_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_goals_user_id ON weight_goals(user_id);

-- Add start_weight and start_date columns to weight_goals table
ALTER TABLE weight_goals ADD COLUMN IF NOT EXISTS start_weight NUMERIC(5,2);
ALTER TABLE weight_goals ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT CURRENT_DATE;

-- Update existing records to use current date as start_date if null
UPDATE weight_goals SET start_date = updated_at::date WHERE start_date IS NULL;

-- Comment explaining the purpose of these columns
COMMENT ON COLUMN weight_goals.start_weight IS 'The starting weight when the goal was set';
COMMENT ON COLUMN weight_goals.start_date IS 'The date when the goal was set (used as starting point for goal path)';

-- Create a table to store custom weekly goal weights
CREATE TABLE IF NOT EXISTS custom_goal_weights (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    week_number INTEGER NOT NULL,
    target_date DATE NOT NULL,
    weight NUMERIC(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, week_number)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_custom_goal_weights_user_id ON custom_goal_weights(user_id);

-- Add comment explaining the purpose of this table
COMMENT ON TABLE custom_goal_weights IS 'Stores custom weekly goal weights that override the calculated linear progression';

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

    RAISE NOTICE 'Verifying weight_goals.start_weight column...';
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'weight_goals' AND column_name = 'start_weight'
    ) THEN
        RAISE NOTICE 'weight_goals.start_weight column exists.';
    ELSE
        RAISE EXCEPTION 'weight_goals.start_weight column does not exist!';
    END IF;

    RAISE NOTICE 'Verifying weight_goals.start_date column...';
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'weight_goals' AND column_name = 'start_date'
    ) THEN
        RAISE NOTICE 'weight_goals.start_date column exists.';
    ELSE
        RAISE EXCEPTION 'weight_goals.start_date column does not exist!';
    END IF;

    RAISE NOTICE 'Verifying custom_goal_weights table...';
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'custom_goal_weights'
    ) THEN
        RAISE NOTICE 'custom_goal_weights table exists.';
    ELSE
        RAISE EXCEPTION 'custom_goal_weights table does not exist!';
    END IF;
END $$;
