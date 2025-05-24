-- Create completed_goals table
CREATE TABLE IF NOT EXISTS completed_goals (
    id SERIAL PRIMARY KEY,
    goal_id INTEGER NOT NULL,
    goal_text TEXT NOT NULL,
    parent_id INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completion_type VARCHAR(20) NOT NULL -- 'single' or 'chain'
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_completed_goals_completed_at ON completed_goals(completed_at);
