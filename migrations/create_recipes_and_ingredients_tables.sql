-- Create recipes table if it doesn't exist
CREATE TABLE IF NOT EXISTS recipes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    total_calories NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create ingredients table if it doesn't exist
CREATE TABLE IF NOT EXISTS ingredients (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    calories NUMERIC(10, 2) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    protein NUMERIC(10, 2) NOT NULL,
    fats NUMERIC(10, 2) NOT NULL,
    carbohydrates NUMERIC(10, 2) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    -- Additional nutritional fields (all optional)
    calories_per_gram NUMERIC(10, 2),
    protein_per_gram NUMERIC(10, 2),
    fats_per_gram NUMERIC(10, 2),
    carbohydrates_per_gram NUMERIC(10, 2),
    price_per_gram NUMERIC(10, 2),
    -- Vitamins
    vitamin_a NUMERIC(10, 2),
    vitamin_c NUMERIC(10, 2),
    vitamin_d NUMERIC(10, 2),
    vitamin_e NUMERIC(10, 2),
    vitamin_k NUMERIC(10, 2),
    thiamine NUMERIC(10, 2),
    riboflavin NUMERIC(10, 2),
    niacin NUMERIC(10, 2),
    vitamin_b6 NUMERIC(10, 2),
    folate NUMERIC(10, 2),
    vitamin_b12 NUMERIC(10, 2),
    biotin NUMERIC(10, 2),
    pantothenic_acid NUMERIC(10, 2),
    -- Minerals
    calcium NUMERIC(10, 2),
    iron NUMERIC(10, 2),
    magnesium NUMERIC(10, 2),
    phosphorus NUMERIC(10, 2),
    potassium NUMERIC(10, 2),
    sodium NUMERIC(10, 2),
    zinc NUMERIC(10, 2),
    copper NUMERIC(10, 2),
    manganese NUMERIC(10, 2),
    selenium NUMERIC(10, 2),
    -- Lipids
    saturated NUMERIC(10, 2),
    monounsaturated NUMERIC(10, 2),
    polyunsaturated NUMERIC(10, 2),
    omega_3 NUMERIC(10, 2),
    omega_6 NUMERIC(10, 2),
    trans NUMERIC(10, 2),
    cholesterol NUMERIC(10, 2),
    -- Carbohydrates breakdown
    fiber NUMERIC(10, 2),
    starch NUMERIC(10, 2),
    sugars NUMERIC(10, 2),
    added_sugars NUMERIC(10, 2),
    net_carbs NUMERIC(10, 2),
    -- Protein breakdown
    complete_protein NUMERIC(10, 2),
    incomplete_protein NUMERIC(10, 2),
    -- Amino acids
    histidine NUMERIC(10, 2),
    isoleucine NUMERIC(10, 2),
    leucine NUMERIC(10, 2),
    lysine NUMERIC(10, 2),
    methionine NUMERIC(10, 2),
    phenylalanine NUMERIC(10, 2),
    threonine NUMERIC(10, 2),
    tryptophan NUMERIC(10, 2),
    valine NUMERIC(10, 2),
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ingredients_recipe_id ON ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipes_name ON recipes(name);
