-- Add next_occurrence_date column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS next_occurrence_date DATE;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_next_occurrence_date ON tasks(next_occurrence_date);

-- Update existing recurring tasks to have NULL next_occurrence_date
UPDATE tasks SET next_occurrence_date = NULL WHERE next_occurrence_date IS NULL;
