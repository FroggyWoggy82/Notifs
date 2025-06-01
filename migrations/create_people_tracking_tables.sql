-- Create people tracking tables for journal relationship analysis

-- Table to store identified people from journal entries
CREATE TABLE IF NOT EXISTS people (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    relationship_type VARCHAR(100), -- 'friend', 'family', 'colleague', 'romantic', 'acquaintance', etc.
    first_mentioned_date DATE,
    last_mentioned_date DATE,
    mention_count INTEGER DEFAULT 0,
    overall_sentiment VARCHAR(50), -- 'positive', 'negative', 'neutral', 'complex'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to track specific mentions of people in journal entries
CREATE TABLE IF NOT EXISTS person_mentions (
    id SERIAL PRIMARY KEY,
    person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
    journal_entry_id INTEGER REFERENCES journal_entries(id) ON DELETE CASCADE,
    mention_context TEXT, -- The sentence/paragraph where they were mentioned
    sentiment VARCHAR(50), -- 'positive', 'negative', 'neutral' for this specific mention
    emotion_tags TEXT[], -- Array of emotions: ['frustrated', 'grateful', 'confused', etc.]
    conversation_topic VARCHAR(255), -- What you talked about with them
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to store AI-generated relationship insights
CREATE TABLE IF NOT EXISTS relationship_insights (
    id SERIAL PRIMARY KEY,
    person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
    insight_text TEXT NOT NULL,
    insight_category VARCHAR(100), -- 'pattern', 'growth', 'concern', 'strength', 'dynamic'
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00 - how confident the AI is about this insight
    supporting_mentions INTEGER[], -- Array of mention IDs that support this insight
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to store conversation summaries with each person
CREATE TABLE IF NOT EXISTS person_conversations (
    id SERIAL PRIMARY KEY,
    person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
    conversation_date DATE,
    conversation_summary TEXT,
    your_feelings TEXT, -- How you felt during/after the conversation
    conversation_outcome VARCHAR(255), -- 'resolved', 'unresolved', 'positive', 'negative', etc.
    topics_discussed TEXT[], -- Array of topics
    journal_entry_id INTEGER REFERENCES journal_entries(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_people_name ON people(name);
CREATE INDEX IF NOT EXISTS idx_person_mentions_person_id ON person_mentions(person_id);
CREATE INDEX IF NOT EXISTS idx_person_mentions_journal_entry_id ON person_mentions(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_relationship_insights_person_id ON relationship_insights(person_id);
CREATE INDEX IF NOT EXISTS idx_person_conversations_person_id ON person_conversations(person_id);
CREATE INDEX IF NOT EXISTS idx_person_conversations_date ON person_conversations(conversation_date);
