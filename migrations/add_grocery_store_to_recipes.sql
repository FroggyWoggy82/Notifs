-- Add grocery_store column to recipes table
-- This migration adds a grocery store field to track where recipe ingredients can be purchased

-- Add the grocery_store column to the recipes table
ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS grocery_store VARCHAR(255);

-- Add an index for better performance when searching by grocery store
CREATE INDEX IF NOT EXISTS idx_recipes_grocery_store ON recipes(grocery_store);

-- Add a comment to document the column
COMMENT ON COLUMN recipes.grocery_store IS 'Name of the grocery store where ingredients for this recipe can be purchased';
