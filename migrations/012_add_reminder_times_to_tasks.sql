-- Add reminder_times column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reminder_times TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_reminder_times ON tasks(reminder_times);
