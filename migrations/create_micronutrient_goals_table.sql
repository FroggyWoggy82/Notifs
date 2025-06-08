-- Create micronutrient_goals table
CREATE TABLE IF NOT EXISTS micronutrient_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    
    -- Vitamins (in various units as per RDA standards)
    vitamin_a NUMERIC(10, 2), -- mcg RAE
    vitamin_c NUMERIC(10, 2), -- mg
    vitamin_d NUMERIC(10, 2), -- mcg
    vitamin_e NUMERIC(10, 2), -- mg
    vitamin_k NUMERIC(10, 2), -- mcg
    thiamine NUMERIC(10, 2), -- mg (B1)
    riboflavin NUMERIC(10, 2), -- mg (B2)
    niacin NUMERIC(10, 2), -- mg (B3)
    vitamin_b6 NUMERIC(10, 2), -- mg
    folate NUMERIC(10, 2), -- mcg DFE
    vitamin_b12 NUMERIC(10, 2), -- mcg
    pantothenic_acid NUMERIC(10, 2), -- mg (B5)
    biotin NUMERIC(10, 2), -- mcg (B7)
    choline NUMERIC(10, 2), -- mg
    
    -- Minerals (in mg unless specified)
    calcium NUMERIC(10, 2), -- mg
    iron NUMERIC(10, 2), -- mg
    magnesium NUMERIC(10, 2), -- mg
    phosphorus NUMERIC(10, 2), -- mg
    potassium NUMERIC(10, 2), -- mg
    sodium NUMERIC(10, 2), -- mg
    zinc NUMERIC(10, 2), -- mg
    copper NUMERIC(10, 2), -- mg
    manganese NUMERIC(10, 2), -- mg
    selenium NUMERIC(10, 2), -- mcg
    chromium NUMERIC(10, 2), -- mcg
    molybdenum NUMERIC(10, 2), -- mcg
    iodine NUMERIC(10, 2), -- mcg
    
    -- Other nutrients
    fiber NUMERIC(10, 2), -- g
    omega3 NUMERIC(10, 2), -- g
    omega6 NUMERIC(10, 2), -- g
    water NUMERIC(10, 2), -- g
    caffeine NUMERIC(10, 2), -- mg
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one record per user
    UNIQUE(user_id)
);

-- Add index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_micronutrient_goals_user_id ON micronutrient_goals(user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_micronutrient_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_micronutrient_goals_updated_at
    BEFORE UPDATE ON micronutrient_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_micronutrient_goals_updated_at();
