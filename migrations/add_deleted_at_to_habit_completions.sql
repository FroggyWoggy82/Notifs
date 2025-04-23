-- Add deleted_at column to habit_completions table
ALTER TABLE habit_completions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Update existing completions to have NULL deleted_at
UPDATE habit_completions SET deleted_at = NULL WHERE deleted_at IS NULL;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_habit_completions_deleted_at ON habit_completions(deleted_at);
