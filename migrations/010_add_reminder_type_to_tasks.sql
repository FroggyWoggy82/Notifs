-- Add reminder_type column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reminder_type VARCHAR(20) DEFAULT 'none';

-- Update existing tasks with reminder_time to have 'custom' reminder_type
UPDATE tasks SET reminder_type = 'custom' WHERE reminder_time IS NOT NULL AND reminder_type = 'none';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_reminder_type ON tasks(reminder_type);
