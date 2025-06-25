-- Add priority_order column to tasks table for task prioritization feature
-- This field will store the relative priority order of tasks (lower numbers = higher priority)

-- Add priority_order column with default value
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority_order INTEGER;

-- Create index for efficient sorting by priority
CREATE INDEX IF NOT EXISTS idx_tasks_priority_order ON tasks(priority_order);

-- Create composite index for priority + completion status for optimal filtering
CREATE INDEX IF NOT EXISTS idx_tasks_priority_complete ON tasks(priority_order, is_complete);

-- Initialize existing tasks with default priority order based on creation date
-- This ensures existing tasks have a reasonable default ordering
UPDATE tasks 
SET priority_order = id 
WHERE priority_order IS NULL;

-- Add comment to document the column purpose
COMMENT ON COLUMN tasks.priority_order IS 'Relative priority order of tasks (lower numbers = higher priority). Used for manual task ranking.';
