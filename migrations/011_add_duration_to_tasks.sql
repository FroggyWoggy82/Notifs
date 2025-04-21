-- Add duration column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 1;

-- Update existing tasks to have default duration of 1
UPDATE tasks SET duration = 1 WHERE duration IS NULL;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_duration ON tasks(duration);
