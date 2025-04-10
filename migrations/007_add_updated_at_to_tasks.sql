-- Add updated_at column to tasks table if it doesn't exist
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Create or replace function to update updated_at column
CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_tasks_updated_at_trigger') THEN
        CREATE TRIGGER update_tasks_updated_at_trigger
        BEFORE UPDATE ON tasks
        FOR EACH ROW
        EXECUTE FUNCTION update_tasks_updated_at();
    END IF;
END
$$;

-- Update existing tasks to set updated_at to current timestamp if it's NULL
UPDATE tasks SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL;

-- Verify the column exists
DO $$
BEGIN
    RAISE NOTICE 'Verifying updated_at column in tasks table...';
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'updated_at'
    ) THEN
        RAISE NOTICE 'updated_at column exists in tasks table.';
    ELSE
        RAISE EXCEPTION 'updated_at column does not exist in tasks table!';
    END IF;
END $$;
