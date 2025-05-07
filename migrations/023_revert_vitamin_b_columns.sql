-- Migration to revert vitamin B column consolidation
-- This migration moves data back to the vitamin_b* columns and drops the standard columns

-- First, ensure all the vitamin_b* columns exist
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS vitamin_b1 NUMERIC(10, 2);
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS vitamin_b2 NUMERIC(10, 2);
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS vitamin_b3 NUMERIC(10, 2);
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS vitamin_b5 NUMERIC(10, 2);

-- Migrate data from standard columns to vitamin_b* columns
DO $$
DECLARE
    column_exists BOOLEAN;
    data_count INTEGER;
BEGIN
    -- Check for thiamine column and migrate data to vitamin_b1
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'ingredients' AND column_name = 'thiamine'
    ) INTO column_exists;
    
    IF column_exists THEN
        -- Count how many rows have data in thiamine
        EXECUTE 'SELECT COUNT(*) FROM ingredients WHERE thiamine > 0' INTO data_count;
        
        IF data_count > 0 THEN
            -- Update vitamin_b1 with thiamine values where vitamin_b1 is null or zero
            EXECUTE 'UPDATE ingredients SET vitamin_b1 = thiamine WHERE (vitamin_b1 IS NULL OR vitamin_b1 = 0) AND thiamine IS NOT NULL AND thiamine > 0';
            
            -- Log the migration
            RAISE NOTICE 'Migrated % rows from thiamine to vitamin_b1', data_count;
        ELSE
            RAISE NOTICE 'No data found in thiamine column';
        END IF;
    END IF;
    
    -- Check for riboflavin column and migrate data to vitamin_b2
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'ingredients' AND column_name = 'riboflavin'
    ) INTO column_exists;
    
    IF column_exists THEN
        -- Count how many rows have data in riboflavin
        EXECUTE 'SELECT COUNT(*) FROM ingredients WHERE riboflavin > 0' INTO data_count;
        
        IF data_count > 0 THEN
            -- Update vitamin_b2 with riboflavin values where vitamin_b2 is null or zero
            EXECUTE 'UPDATE ingredients SET vitamin_b2 = riboflavin WHERE (vitamin_b2 IS NULL OR vitamin_b2 = 0) AND riboflavin IS NOT NULL AND riboflavin > 0';
            
            -- Log the migration
            RAISE NOTICE 'Migrated % rows from riboflavin to vitamin_b2', data_count;
        ELSE
            RAISE NOTICE 'No data found in riboflavin column';
        END IF;
    END IF;
    
    -- Check for niacin column and migrate data to vitamin_b3
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'ingredients' AND column_name = 'niacin'
    ) INTO column_exists;
    
    IF column_exists THEN
        -- Count how many rows have data in niacin
        EXECUTE 'SELECT COUNT(*) FROM ingredients WHERE niacin > 0' INTO data_count;
        
        IF data_count > 0 THEN
            -- Update vitamin_b3 with niacin values where vitamin_b3 is null or zero
            EXECUTE 'UPDATE ingredients SET vitamin_b3 = niacin WHERE (vitamin_b3 IS NULL OR vitamin_b3 = 0) AND niacin IS NOT NULL AND niacin > 0';
            
            -- Log the migration
            RAISE NOTICE 'Migrated % rows from niacin to vitamin_b3', data_count;
        ELSE
            RAISE NOTICE 'No data found in niacin column';
        END IF;
    END IF;
    
    -- Check for pantothenic_acid column and migrate data to vitamin_b5
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'ingredients' AND column_name = 'pantothenic_acid'
    ) INTO column_exists;
    
    IF column_exists THEN
        -- Count how many rows have data in pantothenic_acid
        EXECUTE 'SELECT COUNT(*) FROM ingredients WHERE pantothenic_acid > 0' INTO data_count;
        
        IF data_count > 0 THEN
            -- Update vitamin_b5 with pantothenic_acid values where vitamin_b5 is null or zero
            EXECUTE 'UPDATE ingredients SET vitamin_b5 = pantothenic_acid WHERE (vitamin_b5 IS NULL OR vitamin_b5 = 0) AND pantothenic_acid IS NOT NULL AND pantothenic_acid > 0';
            
            -- Log the migration
            RAISE NOTICE 'Migrated % rows from pantothenic_acid to vitamin_b5', data_count;
        ELSE
            RAISE NOTICE 'No data found in pantothenic_acid column';
        END IF;
    END IF;
END $$;

-- Drop the standard columns
ALTER TABLE ingredients DROP COLUMN IF EXISTS thiamine;
ALTER TABLE ingredients DROP COLUMN IF EXISTS riboflavin;
ALTER TABLE ingredients DROP COLUMN IF EXISTS niacin;
ALTER TABLE ingredients DROP COLUMN IF EXISTS pantothenic_acid;

-- Add comments to the vitamin_b* columns
COMMENT ON COLUMN ingredients.vitamin_b1 IS 'Vitamin B1 (thiamine) in mg';
COMMENT ON COLUMN ingredients.vitamin_b2 IS 'Vitamin B2 (riboflavin) in mg';
COMMENT ON COLUMN ingredients.vitamin_b3 IS 'Vitamin B3 (niacin) in mg';
COMMENT ON COLUMN ingredients.vitamin_b5 IS 'Vitamin B5 (pantothenic acid) in mg';
