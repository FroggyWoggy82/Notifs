-- Create calorie_targets table
CREATE TABLE IF NOT EXISTS calorie_targets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    daily_target INTEGER NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_calorie_targets_user_id ON calorie_targets(user_id);
