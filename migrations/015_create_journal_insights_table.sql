-- Create journal_insights table
CREATE TABLE IF NOT EXISTS journal_insights (
    id SERIAL PRIMARY KEY,
    journal_entry_id INTEGER REFERENCES journal_entries(id) ON DELETE CASCADE,
    insight_text TEXT NOT NULL,
    insight_type VARCHAR(50) NOT NULL DEFAULT 'general', -- 'general', 'pattern', 'question', etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster lookups by journal_entry_id
CREATE INDEX IF NOT EXISTS idx_journal_insights_entry_id ON journal_insights(journal_entry_id);
