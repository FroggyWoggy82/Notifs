-- Add protein_target column to calorie_targets table
ALTER TABLE calorie_targets ADD COLUMN IF NOT EXISTS protein_target INTEGER;

-- Update existing records to have a default protein target based on 15% of daily calories
-- (assuming 4 calories per gram of protein)
UPDATE calorie_targets 
SET protein_target = ROUND((daily_target * 0.15) / 4) 
WHERE protein_target IS NULL;

-- Add comment to the column
COMMENT ON COLUMN calorie_targets.protein_target IS 'Daily protein target in grams';
