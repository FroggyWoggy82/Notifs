const db = require('../utils/db');

/**
 * Journal Model
 * Handles database operations for journal entries
 */
class JournalModel {
    /**
     * Initialize the journal model
     * Creates the journal_entries table if it doesn't exist
     */
    static async initialize() {
        try {
            // Check if the journal_entries table exists
            const tableCheck = await db.query(
                "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'journal_entries')"
            );

            if (!tableCheck.rows[0].exists) {
                console.log('Creating journal_entries table...');
                // Create the table if it doesn't exist
                await db.query(`
                    CREATE TABLE journal_entries (
                        id SERIAL PRIMARY KEY,
                        date DATE NOT NULL,
                        content TEXT NOT NULL,
                        analysis TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                `);
                console.log('journal_entries table created successfully');
            }
        } catch (error) {
            console.error('Error initializing journal model:', error);
            throw error;
        }
    }

    /**
     * Get all journal entries
     * @returns {Promise<Array>} Array of journal entry objects
     */
    static async getAllEntries() {
        try {
            const result = await db.query(
                'SELECT id, date, content, analysis, created_at, updated_at FROM journal_entries ORDER BY date DESC'
            );
            return result.rows;
        } catch (error) {
            console.error('Error getting all journal entries:', error);
            throw error;
        }
    }

    /**
     * Get a journal entry by ID
     * @param {number} id - The entry ID
     * @returns {Promise<Object|null>} The journal entry object or null if not found
     */
    static async getEntryById(id) {
        try {
            const result = await db.query(
                'SELECT id, date, content, analysis, created_at, updated_at FROM journal_entries WHERE id = $1',
                [id]
            );
            return result.rows.length > 0 ? result.rows[0] : null;
        } catch (error) {
            console.error('Error getting journal entry by ID:', error);
            throw error;
        }
    }

    /**
     * Get a journal entry by date
     * @param {string} date - The entry date (YYYY-MM-DD)
     * @returns {Promise<Object|null>} The journal entry object or null if not found
     */
    static async getEntryByDate(date) {
        try {
            const result = await db.query(
                'SELECT id, date, content, analysis, created_at, updated_at FROM journal_entries WHERE date = $1',
                [date]
            );
            return result.rows.length > 0 ? result.rows[0] : null;
        } catch (error) {
            console.error('Error getting journal entry by date:', error);
            throw error;
        }
    }

    /**
     * Create or update a journal entry
     * @param {string} date - The entry date (YYYY-MM-DD)
     * @param {string} content - The entry content
     * @param {string} analysis - The entry analysis (optional)
     * @returns {Promise<Object>} The created or updated journal entry
     */
    static async saveEntry(date, content, analysis = null) {
        try {
            // Check if an entry already exists for this date
            const existingEntry = await this.getEntryByDate(date);

            if (existingEntry) {
                // Update existing entry
                const result = await db.query(
                    'UPDATE journal_entries SET content = $1, analysis = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, date, content, analysis, created_at, updated_at',
                    [content, analysis, existingEntry.id]
                );
                return result.rows[0];
            } else {
                // Create new entry
                const result = await db.query(
                    'INSERT INTO journal_entries (date, content, analysis) VALUES ($1, $2, $3) RETURNING id, date, content, analysis, created_at, updated_at',
                    [date, content, analysis]
                );
                return result.rows[0];
            }
        } catch (error) {
            console.error('Error saving journal entry:', error);
            throw error;
        }
    }

    /**
     * Update the analysis for a journal entry
     * @param {number} id - The entry ID
     * @param {string} analysis - The entry analysis
     * @returns {Promise<Object>} The updated journal entry
     */
    static async updateAnalysis(id, analysis) {
        try {
            const result = await db.query(
                'UPDATE journal_entries SET analysis = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, date, content, analysis, created_at, updated_at',
                [analysis, id]
            );

            if (result.rows.length === 0) {
                throw new Error(`Journal entry with ID ${id} not found`);
            }

            return result.rows[0];
        } catch (error) {
            console.error('Error updating journal entry analysis:', error);
            throw error;
        }
    }

    /**
     * Delete a journal entry
     * @param {number} id - The entry ID
     * @returns {Promise<boolean>} True if the entry was deleted, false otherwise
     */
    static async deleteEntry(id) {
        try {
            const result = await db.query(
                'DELETE FROM journal_entries WHERE id = $1 RETURNING id',
                [id]
            );
            return result.rows.length > 0;
        } catch (error) {
            console.error('Error deleting journal entry:', error);
            throw error;
        }
    }

    /**
     * Save insights for a journal entry
     * @param {number} journalEntryId - The journal entry ID
     * @param {Array} insights - Array of insight objects with text and type
     * @returns {Promise<Array>} The saved insights
     */
    static async saveInsights(journalEntryId, insights) {
        try {
            const savedInsights = [];

            for (const insight of insights) {
                const result = await db.query(
                    'INSERT INTO journal_insights (journal_entry_id, insight_text, insight_type) VALUES ($1, $2, $3) RETURNING *',
                    [journalEntryId, insight.text, insight.type]
                );
                savedInsights.push(result.rows[0]);
            }

            return savedInsights;
        } catch (error) {
            console.error('Error saving journal insights:', error);
            throw error;
        }
    }

    /**
     * Get insights for a journal entry
     * @param {number} journalEntryId - The journal entry ID
     * @returns {Promise<Array>} Array of insight objects
     */
    static async getInsightsByEntryId(journalEntryId) {
        try {
            const result = await db.query(
                'SELECT * FROM journal_insights WHERE journal_entry_id = $1 ORDER BY created_at',
                [journalEntryId]
            );
            return result.rows;
        } catch (error) {
            console.error('Error getting journal insights:', error);
            throw error;
        }
    }

    /**
     * Get all insights of a specific type
     * @param {string} insightType - The type of insights to retrieve
     * @returns {Promise<Array>} Array of insight objects
     */
    static async getInsightsByType(insightType) {
        try {
            const result = await db.query(
                'SELECT i.*, j.date FROM journal_insights i JOIN journal_entries j ON i.journal_entry_id = j.id WHERE i.insight_type = $1 ORDER BY j.date DESC',
                [insightType]
            );
            return result.rows;
        } catch (error) {
            console.error('Error getting insights by type:', error);
            throw error;
        }
    }
}

module.exports = JournalModel;
