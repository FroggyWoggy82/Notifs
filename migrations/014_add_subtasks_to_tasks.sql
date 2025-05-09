-- Add parent_task_id column to tasks table to support subtasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS parent_task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE;

-- Add index for faster queries on parent_task_id
CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON tasks(parent_task_id);

-- Add is_subtask column to tasks table to easily identify subtasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_subtask BOOLEAN DEFAULT FALSE;

-- Add index for faster queries on is_subtask
CREATE INDEX IF NOT EXISTS idx_tasks_is_subtask ON tasks(is_subtask);

-- Add grocery_data column to tasks table to store grocery list item data
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS grocery_data JSONB;

-- Add index for faster queries on grocery_data
CREATE INDEX IF NOT EXISTS idx_tasks_grocery_data ON tasks(grocery_data);
