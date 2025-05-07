-- Create a table to store custom weekly goal weights
CREATE TABLE IF NOT EXISTS custom_goal_weights (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    week_number INTEGER NOT NULL,
    target_date DATE NOT NULL,
    weight NUMERIC(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, week_number)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_custom_goal_weights_user_id ON custom_goal_weights(user_id);

-- Add comment explaining the purpose of this table
COMMENT ON TABLE custom_goal_weights IS 'Stores custom weekly goal weights that override the calculated linear progression';
