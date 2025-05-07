# Vitamin B Column Reversion

This document explains how to revert the vitamin B column consolidation and use the vitamin_b* columns instead.

## Background

The database has both sets of vitamin B columns:
- Standard columns: `thiamine`, `riboflavin`, `niacin`, `pantothenic_acid`
- Alternative columns: `vitamin_b1`, `vitamin_b2`, `vitamin_b3`, `vitamin_b5`

We want to use the vitamin_b* columns and remove the standard columns.

## SQL Script to Run

Run the following SQL script in your database:

```sql
-- Migrate data from standard columns to vitamin_b* columns
UPDATE ingredients SET vitamin_b1 = thiamine WHERE (vitamin_b1 IS NULL OR vitamin_b1 = 0) AND thiamine IS NOT NULL AND thiamine > 0;
UPDATE ingredients SET vitamin_b2 = riboflavin WHERE (vitamin_b2 IS NULL OR vitamin_b2 = 0) AND riboflavin IS NOT NULL AND riboflavin > 0;
UPDATE ingredients SET vitamin_b3 = niacin WHERE (vitamin_b3 IS NULL OR vitamin_b3 = 0) AND niacin IS NOT NULL AND niacin > 0;
UPDATE ingredients SET vitamin_b5 = pantothenic_acid WHERE (vitamin_b5 IS NULL OR vitamin_b5 = 0) AND pantothenic_acid IS NOT NULL AND pantothenic_acid > 0;

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
```

## JavaScript Changes

The following JavaScript files have been updated to use the vitamin_b* columns:

1. **nutrition-field-mapper.js**:
   - Updated to map all vitamin B field names to their vitamin_b* column names

2. **food.js**:
   - Updated to use vitamin_b* columns when populating edit forms

## Verification

After running the SQL script, you can verify that the standard columns have been removed by running:

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'ingredients' AND column_name IN (
  'thiamine', 'riboflavin', 'niacin', 'pantothenic_acid', 'vitamin_b6',
  'vitamin_b1', 'vitamin_b2', 'vitamin_b3', 'vitamin_b5'
);
```

This should only show the vitamin_b* columns and not the standard columns.
