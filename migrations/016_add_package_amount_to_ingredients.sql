-- Add package_amount column to ingredients table
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS package_amount NUMERIC(10, 2);

-- Add comment to explain the purpose of the column
COMMENT ON COLUMN ingredients.package_amount IS 'The amount in grams per package from the store (e.g., HEB)';
