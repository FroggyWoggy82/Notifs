-- Create exercise_warmup_weights table for storing warmup weights per exercise
CREATE TABLE IF NOT EXISTS exercise_warmup_weights (
    warmup_id SERIAL PRIMARY KEY,
    exercise_id INTEGER NOT NULL REFERENCES exercises(exercise_id) ON DELETE CASCADE,
    warmup_weight NUMERIC(8,2) NOT NULL,
    weight_unit VARCHAR(20) NOT NULL DEFAULT 'lbs',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_exercise_warmup UNIQUE (exercise_id)
);

-- Add index for faster lookups by exercise_id
CREATE INDEX IF NOT EXISTS idx_exercise_warmup_weights_exercise_id ON exercise_warmup_weights(exercise_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_exercise_warmup_weights_updated_at
    BEFORE UPDATE ON exercise_warmup_weights
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
