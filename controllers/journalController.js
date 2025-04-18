const JournalModel = require('../models/journalModel');
const aiService = require('../services/aiService');

/**
 * Journal Controller
 * Handles request processing for journal endpoints
 */
class JournalController {
    /**
     * Get all journal entries
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getAllEntries(req, res) {
        try {
            const entries = await JournalModel.getAllEntries();
            res.json(entries);
        } catch (err) {
            console.error('Error fetching journal entries:', err);
            res.status(500).json({ error: `Failed to fetch journal entries: ${err.message}` });
        }
    }

    /**
     * Get a journal entry by ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getEntryById(req, res) {
        try {
            const id = parseInt(req.params.id, 10);

            if (isNaN(id)) {
                return res.status(400).json({ error: 'Invalid entry ID. Must be a number.' });
            }

            const entry = await JournalModel.getEntryById(id);

            if (!entry) {
                return res.status(404).json({ error: 'Journal entry not found.' });
            }

            res.json(entry);
        } catch (err) {
            console.error('Error fetching journal entry:', err);
            res.status(500).json({ error: `Failed to fetch journal entry: ${err.message}` });
        }
    }

    /**
     * Get a journal entry by date
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getEntryByDate(req, res) {
        try {
            const date = req.params.date;

            // Validate date format (YYYY-MM-DD)
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
            }

            const entry = await JournalModel.getEntryByDate(date);

            if (!entry) {
                return res.status(404).json({ error: 'No journal entry found for this date.' });
            }

            res.json(entry);
        } catch (err) {
            console.error('Error fetching journal entry by date:', err);
            res.status(500).json({ error: `Failed to fetch journal entry: ${err.message}` });
        }
    }

    /**
     * Save a journal entry
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async saveEntry(req, res) {
        try {
            const { date, content, analysis } = req.body;

            // Validate required fields
            if (!date) {
                return res.status(400).json({ error: 'Date is required.' });
            }

            if (!content) {
                return res.status(400).json({ error: 'Content is required.' });
            }

            // Validate date format (YYYY-MM-DD)
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
            }

            const entry = await JournalModel.saveEntry(date, content, analysis);
            res.status(201).json(entry);
        } catch (err) {
            console.error('Error saving journal entry:', err);
            res.status(500).json({ error: `Failed to save journal entry: ${err.message}` });
        }
    }

    /**
     * Analyze a journal entry
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async analyzeEntry(req, res) {
        try {
            const { content, date } = req.body;

            if (!content) {
                return res.status(400).json({ error: 'Content is required for analysis.' });
            }

            // Call the AI service to analyze the journal entry
            const result = await aiService.analyzeJournalEntry(content);

            // If a date was provided, save the analysis to the journal entry
            if (date) {
                try {
                    const entry = await JournalModel.getEntryByDate(date);
                    if (entry) {
                        await JournalModel.updateAnalysis(entry.id, result.analysis);
                    }
                } catch (saveError) {
                    console.error('Error saving analysis to journal entry:', saveError);
                    // Continue even if saving fails
                }
            }

            res.json({ analysis: result.analysis, summary: result.summary });
        } catch (err) {
            console.error('Error analyzing journal entry:', err);
            res.status(500).json({ error: `Failed to analyze journal entry: ${err.message}` });
        }
    }

    /**
     * Get memory entries for the journal
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getMemoryEntries(req, res) {
        try {
            const memory = aiService.loadMemory();
            res.json(memory.entries);
        } catch (err) {
            console.error('Error fetching memory entries:', err);
            res.status(500).json({ error: `Failed to fetch memory entries: ${err.message}` });
        }
    }

    /**
     * Save a memory entry
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async saveMemoryEntry(req, res) {
        try {
            const { date, text, summary } = req.body;

            if (!summary) {
                return res.status(400).json({ error: 'Summary is required.' });
            }

            const memory = aiService.loadMemory();

            memory.entries.push({
                date: date || new Date().toISOString(),
                text: text || '',
                summary: summary
            });

            aiService.saveMemory(memory);
            res.status(201).json({ message: 'Memory entry saved successfully.' });
        } catch (err) {
            console.error('Error saving memory entry:', err);
            res.status(500).json({ error: `Failed to save memory entry: ${err.message}` });
        }
    }

    /**
     * Delete a journal entry
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async deleteEntry(req, res) {
        try {
            const id = parseInt(req.params.id, 10);

            if (isNaN(id)) {
                return res.status(400).json({ error: 'Invalid entry ID. Must be a number.' });
            }

            const deleted = await JournalModel.deleteEntry(id);

            if (!deleted) {
                return res.status(404).json({ error: 'Journal entry not found.' });
            }

            res.json({ message: 'Journal entry deleted successfully.' });
        } catch (err) {
            console.error('Error deleting journal entry:', err);
            res.status(500).json({ error: `Failed to delete journal entry: ${err.message}` });
        }
    }
}

module.exports = JournalController;
