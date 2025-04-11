-- Create days_since_events table
CREATE TABLE IF NOT EXISTS days_since_events (
    id SERIAL PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on start_date for faster queries
CREATE INDEX IF NOT EXISTS idx_days_since_start_date ON days_since_events(start_date);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_days_since_events_updated_at
    BEFORE UPDATE ON days_since_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 