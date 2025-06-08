-- Migration to add comprehensive micronutrient columns to micronutrient_goals table
-- This adds all the nutrients from the comprehensive tracking interface

-- Add general nutrients
ALTER TABLE micronutrient_goals ADD COLUMN IF NOT EXISTS energy NUMERIC(10, 2);
ALTER TABLE micronutrient_goals ADD COLUMN IF NOT EXISTS alcohol NUMERIC(10, 2);

-- Add carbohydrate nutrients
ALTER TABLE micronutrient_goals ADD COLUMN IF NOT EXISTS carbs NUMERIC(10, 2);
ALTER TABLE micronutrient_goals ADD COLUMN IF NOT EXISTS starch NUMERIC(10, 2);
ALTER TABLE micronutrient_goals ADD COLUMN IF NOT EXISTS sugars NUMERIC(10, 2);
ALTER TABLE micronutrient_goals ADD COLUMN IF NOT EXISTS added_sugars NUMERIC(10, 2);
ALTER TABLE micronutrient_goals ADD COLUMN IF NOT EXISTS net_carbs NUMERIC(10, 2);

-- Add protein and amino acids
ALTER TABLE micronutrient_goals ADD COLUMN IF NOT EXISTS protein NUMERIC(10, 2);
ALTER TABLE micronutrient_goals ADD COLUMN IF NOT EXISTS histidine NUMERIC(10, 2);
ALTER TABLE micronutrient_goals ADD COLUMN IF NOT EXISTS isoleucine NUMERIC(10, 2);
ALTER TABLE micronutrient_goals ADD COLUMN IF NOT EXISTS leucine NUMERIC(10, 2);
ALTER TABLE micronutrient_goals ADD COLUMN IF NOT EXISTS lysine NUMERIC(10, 2);
ALTER TABLE micronutrient_goals ADD COLUMN IF NOT EXISTS methionine NUMERIC(10, 2);
ALTER TABLE micronutrient_goals ADD COLUMN IF NOT EXISTS phenylalanine NUMERIC(10, 2);
ALTER TABLE micronutrient_goals ADD COLUMN IF NOT EXISTS threonine NUMERIC(10, 2);
ALTER TABLE micronutrient_goals ADD COLUMN IF NOT EXISTS tryptophan NUMERIC(10, 2);
ALTER TABLE micronutrient_goals ADD COLUMN IF NOT EXISTS valine NUMERIC(10, 2);
ALTER TABLE micronutrient_goals ADD COLUMN IF NOT EXISTS cystine NUMERIC(10, 2);

-- Add lipid nutrients
ALTER TABLE micronutrient_goals ADD COLUMN IF NOT EXISTS fat NUMERIC(10, 2);
ALTER TABLE micronutrient_goals ADD COLUMN IF NOT EXISTS saturated NUMERIC(10, 2);
ALTER TABLE micronutrient_goals ADD COLUMN IF NOT EXISTS monounsaturated NUMERIC(10, 2);
ALTER TABLE micronutrient_goals ADD COLUMN IF NOT EXISTS polyunsaturated NUMERIC(10, 2);
ALTER TABLE micronutrient_goals ADD COLUMN IF NOT EXISTS trans_fat NUMERIC(10, 2);
ALTER TABLE micronutrient_goals ADD COLUMN IF NOT EXISTS cholesterol NUMERIC(10, 2);

-- Update vitamin_d to use IU instead of mcg to match the interface
-- Note: We'll keep the existing column and just update the default values

-- Remove old columns that are not in the comprehensive interface
-- ALTER TABLE micronutrient_goals DROP COLUMN IF EXISTS biotin;
-- ALTER TABLE micronutrient_goals DROP COLUMN IF EXISTS choline;
-- ALTER TABLE micronutrient_goals DROP COLUMN IF EXISTS chromium;
-- ALTER TABLE micronutrient_goals DROP COLUMN IF EXISTS molybdenum;
-- ALTER TABLE micronutrient_goals DROP COLUMN IF EXISTS iodine;

-- Note: We're keeping the old columns for backward compatibility
-- The frontend will only show the nutrients that are in the comprehensive interface
