-- Add fat_target column to calorie_targets table
ALTER TABLE calorie_targets ADD COLUMN IF NOT EXISTS fat_target INTEGER;

-- Update existing rows to ensure fat_target is properly initialized
UPDATE calorie_targets
SET fat_target = COALESCE(fat_target, NULL);
