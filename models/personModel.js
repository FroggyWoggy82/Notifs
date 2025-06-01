const db = require('../utils/db');

class PersonModel {
    /**
     * Initialize the person tracking tables
     */
    static async init() {
        try {
            // Check if people table exists
            const tableCheck = await db.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'people'
                )
            `);

            if (!tableCheck.rows[0].exists) {
                console.log('Creating people tracking tables...');
                // Run the migration file
                const fs = require('fs');
                const path = require('path');
                const migrationSQL = fs.readFileSync(
                    path.join(__dirname, '../migrations/create_people_tracking_tables.sql'), 
                    'utf8'
                );
                await db.query(migrationSQL);
                console.log('People tracking tables created successfully');
            }
        } catch (error) {
            console.error('Error initializing person model:', error);
            throw error;
        }
    }

    /**
     * Find or create a person by name
     * @param {string} name - Person's name
     * @param {string} relationshipType - Type of relationship
     * @returns {Promise<Object>} Person object
     */
    static async findOrCreatePerson(name, relationshipType = null) {
        try {
            // First try to find existing person (case-insensitive)
            const existingPerson = await db.query(
                'SELECT * FROM people WHERE LOWER(name) = LOWER($1)',
                [name]
            );

            if (existingPerson.rows.length > 0) {
                return existingPerson.rows[0];
            }

            // Create new person
            const result = await db.query(
                `INSERT INTO people (name, relationship_type, first_mentioned_date, last_mentioned_date, mention_count)
                 VALUES ($1, $2, CURRENT_DATE, CURRENT_DATE, 1)
                 RETURNING *`,
                [name, relationshipType]
            );

            return result.rows[0];
        } catch (error) {
            console.error('Error finding or creating person:', error);
            throw error;
        }
    }

    /**
     * Add a mention of a person in a journal entry
     * @param {number} personId - Person ID
     * @param {number} journalEntryId - Journal entry ID
     * @param {string} context - Context where person was mentioned
     * @param {string} sentiment - Sentiment of the mention
     * @param {Array} emotionTags - Array of emotion tags
     * @param {string} conversationTopic - What was discussed
     * @returns {Promise<Object>} Mention object
     */
    static async addMention(personId, journalEntryId, context, sentiment = 'neutral', emotionTags = [], conversationTopic = null) {
        try {
            // Add the mention
            const mentionResult = await db.query(
                `INSERT INTO person_mentions (person_id, journal_entry_id, mention_context, sentiment, emotion_tags, conversation_topic)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING *`,
                [personId, journalEntryId, context, sentiment, emotionTags, conversationTopic]
            );

            // Update person's mention count and last mentioned date
            await db.query(
                `UPDATE people 
                 SET mention_count = mention_count + 1, 
                     last_mentioned_date = CURRENT_DATE,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $1`,
                [personId]
            );

            return mentionResult.rows[0];
        } catch (error) {
            console.error('Error adding person mention:', error);
            throw error;
        }
    }

    /**
     * Get all people with their mention counts
     * @returns {Promise<Array>} Array of people
     */
    static async getAllPeople() {
        try {
            const result = await db.query(
                `SELECT p.*, 
                        COUNT(pm.id) as total_mentions,
                        MAX(pm.created_at) as last_mention_date
                 FROM people p
                 LEFT JOIN person_mentions pm ON p.id = pm.person_id
                 GROUP BY p.id
                 ORDER BY total_mentions DESC, p.name ASC`
            );
            return result.rows;
        } catch (error) {
            console.error('Error getting all people:', error);
            throw error;
        }
    }

    /**
     * Get detailed information about a specific person
     * @param {number} personId - Person ID
     * @returns {Promise<Object>} Person details with mentions and insights
     */
    static async getPersonDetails(personId) {
        try {
            // Get person basic info
            const personResult = await db.query('SELECT * FROM people WHERE id = $1', [personId]);
            if (personResult.rows.length === 0) {
                throw new Error('Person not found');
            }

            const person = personResult.rows[0];

            // Get all mentions
            const mentionsResult = await db.query(
                `SELECT pm.*, je.date as entry_date, je.content as entry_content
                 FROM person_mentions pm
                 JOIN journal_entries je ON pm.journal_entry_id = je.id
                 WHERE pm.person_id = $1
                 ORDER BY je.date DESC`,
                [personId]
            );

            // Get relationship insights
            const insightsResult = await db.query(
                'SELECT * FROM relationship_insights WHERE person_id = $1 ORDER BY created_at DESC',
                [personId]
            );

            // Get conversation summaries
            const conversationsResult = await db.query(
                'SELECT * FROM person_conversations WHERE person_id = $1 ORDER BY conversation_date DESC',
                [personId]
            );

            return {
                person,
                mentions: mentionsResult.rows,
                insights: insightsResult.rows,
                conversations: conversationsResult.rows
            };
        } catch (error) {
            console.error('Error getting person details:', error);
            throw error;
        }
    }

    /**
     * Save relationship insights for a person
     * @param {number} personId - Person ID
     * @param {Array} insights - Array of insight objects
     * @returns {Promise<Array>} Saved insights
     */
    static async saveInsights(personId, insights) {
        try {
            const savedInsights = [];

            for (const insight of insights) {
                const result = await db.query(
                    `INSERT INTO relationship_insights (person_id, insight_text, insight_category, confidence_score, supporting_mentions)
                     VALUES ($1, $2, $3, $4, $5)
                     RETURNING *`,
                    [personId, insight.text, insight.category, insight.confidence, insight.supportingMentions || []]
                );
                savedInsights.push(result.rows[0]);
            }

            return savedInsights;
        } catch (error) {
            console.error('Error saving relationship insights:', error);
            throw error;
        }
    }

    /**
     * Update person's overall sentiment based on recent mentions
     * @param {number} personId - Person ID
     * @returns {Promise<void>}
     */
    static async updateOverallSentiment(personId) {
        try {
            // Get recent mentions (last 10)
            const recentMentions = await db.query(
                `SELECT sentiment FROM person_mentions 
                 WHERE person_id = $1 
                 ORDER BY created_at DESC 
                 LIMIT 10`,
                [personId]
            );

            if (recentMentions.rows.length === 0) return;

            // Calculate overall sentiment
            const sentiments = recentMentions.rows.map(m => m.sentiment);
            const positiveCount = sentiments.filter(s => s === 'positive').length;
            const negativeCount = sentiments.filter(s => s === 'negative').length;
            const neutralCount = sentiments.filter(s => s === 'neutral').length;

            let overallSentiment = 'neutral';
            if (positiveCount > negativeCount && positiveCount > neutralCount) {
                overallSentiment = 'positive';
            } else if (negativeCount > positiveCount && negativeCount > neutralCount) {
                overallSentiment = 'negative';
            } else if (positiveCount > 0 && negativeCount > 0) {
                overallSentiment = 'complex';
            }

            // Update person's overall sentiment
            await db.query(
                'UPDATE people SET overall_sentiment = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [overallSentiment, personId]
            );
        } catch (error) {
            console.error('Error updating overall sentiment:', error);
            throw error;
        }
    }
}

module.exports = PersonModel;
