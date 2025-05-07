-- Add start_weight and start_date columns to weight_goals table
ALTER TABLE weight_goals ADD COLUMN IF NOT EXISTS start_weight NUMERIC(5,2);
ALTER TABLE weight_goals ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT CURRENT_DATE;

-- Update existing records to use current date as start_date if null
UPDATE weight_goals SET start_date = updated_at::date WHERE start_date IS NULL;

-- Comment explaining the purpose of these columns
COMMENT ON COLUMN weight_goals.start_weight IS 'The starting weight when the goal was set';
COMMENT ON COLUMN weight_goals.start_date IS 'The date when the goal was set (used as starting point for goal path)';
