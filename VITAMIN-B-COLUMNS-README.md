# Vitamin B Columns Standardization

This document explains the changes made to standardize vitamin B columns in the database and code.

## Database Changes

The database should use the following vitamin B columns:
- `vitamin_b1` (instead of `thiamine`)
- `vitamin_b2` (instead of `riboflavin`)
- `vitamin_b3` (instead of `niacin`)
- `vitamin_b5` (instead of `pantothenic_acid`)
- `vitamin_b6` (no change)

To apply these changes, run the following SQL script:

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

## Code Changes

The following JavaScript files have been updated to use the vitamin_b* columns:

1. **nutrition-field-mapper.js**:
   - Updated to map all vitamin B field names to their vitamin_b* column names
   ```javascript
   vitaminB1: 'vitamin_b1',
   thiamine: 'vitamin_b1', // Map thiamine to vitamin_b1
   vitaminB2: 'vitamin_b2',
   riboflavin: 'vitamin_b2', // Map riboflavin to vitamin_b2
   vitaminB3: 'vitamin_b3',
   niacin: 'vitamin_b3', // Map niacin to vitamin_b3
   vitaminB5: 'vitamin_b5',
   pantothenic_acid: 'vitamin_b5', // Map pantothenic_acid to vitamin_b5
   ```

2. **food.js**:
   - Updated to use vitamin_b* columns when populating edit forms
   ```javascript
   document.getElementById('edit-ingredient-vitamin-b1').value = ingredient.vitamin_b1 || '';
   document.getElementById('edit-ingredient-vitamin-b2').value = ingredient.vitamin_b2 || '';
   document.getElementById('edit-ingredient-vitamin-b3').value = ingredient.vitamin_b3 || '';
   document.getElementById('edit-ingredient-vitamin-b5').value = ingredient.vitamin_b5 || '';
   document.getElementById('edit-ingredient-vitamin-b6').value = ingredient.vitamin_b6 || '';
   document.getElementById('edit-ingredient-vitamin-b12').value = ingredient.vitamin_b12 || '';
   ```

3. **simplified-nutrition-scan.js**:
   - Already using the vitamin_b* columns
   ```javascript
   'nutrition-vitamin-b1': 'vitaminB1',
   'nutrition-vitamin-b2': 'vitaminB2',
   'nutrition-vitamin-b3': 'vitaminB3',
   'nutrition-vitamin-b5': 'vitaminB5',
   ```

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
