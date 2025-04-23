-- Add total_completions column to habits table
ALTER TABLE habits ADD COLUMN IF NOT EXISTS total_completions INTEGER DEFAULT 0;

-- Create or replace function to update total_completions when a habit is completed
CREATE OR REPLACE FUNCTION update_habit_total_completions()
RETURNS TRIGGER AS $$
BEGIN
    -- Increment the total_completions counter for the habit
    UPDATE habits 
    SET total_completions = total_completions + 1
    WHERE id = NEW.habit_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update total_completions when a completion is recorded
DROP TRIGGER IF EXISTS update_habit_total_completions_trigger ON habit_completions;
CREATE TRIGGER update_habit_total_completions_trigger
AFTER INSERT ON habit_completions
FOR EACH ROW
EXECUTE FUNCTION update_habit_total_completions();
