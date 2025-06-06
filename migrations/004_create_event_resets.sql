-- Create event_resets table to track how many times events have been reset
CREATE TABLE IF NOT EXISTS event_resets (
    id SERIAL PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    reset_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create unique index on event_name to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_resets_event_name ON event_resets(event_name);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_event_resets_updated_at
    BEFORE UPDATE ON event_resets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial record for "The Last Goon" event
INSERT INTO event_resets (event_name, reset_count) 
VALUES ('The Last Goon', 0)
ON CONFLICT (event_name) DO NOTHING;
