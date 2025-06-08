const JournalModel = require('../models/journalModel');
const aiService = require('../services/aiService');
const PersonAnalysisService = require('../services/personAnalysisService');
const aiPersonality = require('../config/aiPersonality');

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

            // Extract and analyze people mentioned in the journal entry
            try {
                if (content && content.trim().length > 0) {
                    const extractedPeople = await PersonAnalysisService.extractAndAnalyzePeople(content, entry.id);
                    console.log(`Extracted ${extractedPeople.length} people from journal entry ${entry.id}`);
                }
            } catch (personError) {
                console.error('Error extracting people from journal entry:', personError);
                // Don't fail the entire request if person extraction fails
            }

            res.status(201).json(entry);
        } catch (err) {
            console.error('Error saving journal entry:', err);
            res.status(500).json({ error: `Failed to save journal entry: ${err.message}` });
        }
    }

    /**
     * Analyze a journal entry or handle conversation
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async analyzeEntry(req, res) {
        try {
            const { content, date, conversation, personalityType } = req.body;

            if (!content) {
                return res.status(400).json({ error: 'Content is required for analysis.' });
            }

            // Check if this is a conversation-based request
            if (conversation && Array.isArray(conversation)) {
                // Handle as conversation with specified personality
                const response = await aiService.generateConversationalResponse(
                    content,
                    conversation,
                    personalityType || 'CHATGPT_4O'
                );
                return res.json({
                    analysis: response,
                    summary: null,
                    questions: [],
                    insights: []
                });
            }

            // Handle as traditional journal entry analysis
            const result = await aiService.analyzeJournalEntry(content);

            // If a date was provided, save the analysis to the journal entry
            if (date) {
                try {
                    const entry = await JournalModel.getEntryByDate(date);
                    if (entry) {
                        await JournalModel.updateAnalysis(entry.id, result.analysis);

                        // Save questions as insights
                        if (result.questions && result.questions.length > 0) {
                            const questionInsights = result.questions.map(q => ({
                                text: q.text,
                                type: 'question'
                            }));
                            await JournalModel.saveInsights(entry.id, questionInsights);
                        }

                        // Save insights
                        if (result.insights && result.insights.length > 0) {
                            const generalInsights = result.insights.map(i => ({
                                text: i.text,
                                type: 'general'
                            }));
                            await JournalModel.saveInsights(entry.id, generalInsights);
                        }
                    }
                } catch (saveError) {
                    console.error('Error saving analysis or insights to journal entry:', saveError);
                    // Continue even if saving fails
                }
            }

            res.json({
                analysis: result.analysis,
                summary: result.summary,
                questions: result.questions,
                insights: result.insights
            });
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
     * Get memory usage statistics
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getMemoryStats(req, res) {
        try {
            const stats = aiService.getMemoryStats();
            res.json(stats);
        } catch (err) {
            console.error('Error fetching memory statistics:', err);
            res.status(500).json({ error: `Failed to fetch memory statistics: ${err.message}` });
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

    /**
     * Save insights for a journal entry
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async saveInsights(req, res) {
        try {
            const { journalEntryId, insights } = req.body;

            if (!journalEntryId || !insights || !Array.isArray(insights)) {
                return res.status(400).json({ error: 'Journal entry ID and insights array are required.' });
            }

            const savedInsights = await JournalModel.saveInsights(journalEntryId, insights);
            res.status(201).json(savedInsights);
        } catch (err) {
            console.error('Error saving journal insights:', err);
            res.status(500).json({ error: `Failed to save journal insights: ${err.message}` });
        }
    }

    /**
     * Get insights for a journal entry
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getInsightsByEntryId(req, res) {
        try {
            const id = parseInt(req.params.id, 10);

            if (isNaN(id)) {
                return res.status(400).json({ error: 'Invalid entry ID. Must be a number.' });
            }

            const insights = await JournalModel.getInsightsByEntryId(id);
            res.json(insights);
        } catch (err) {
            console.error('Error fetching journal insights:', err);
            res.status(500).json({ error: `Failed to fetch journal insights: ${err.message}` });
        }
    }

    /**
     * Get all insights of a specific type
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getInsightsByType(req, res) {
        try {
            const { type } = req.params;

            if (!type) {
                return res.status(400).json({ error: 'Insight type is required.' });
            }

            const insights = await JournalModel.getInsightsByType(type);
            res.json(insights);
        } catch (err) {
            console.error('Error fetching insights by type:', err);
            res.status(500).json({ error: `Failed to fetch insights by type: ${err.message}` });
        }
    }

    /**
     * Get available AI personalities
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getAIPersonalities(req, res) {
        try {
            const personalities = aiPersonality.getAvailablePersonalities();
            res.json({
                personalities,
                default: aiPersonality.DEFAULT_PERSONALITY
            });
        } catch (err) {
            console.error('Error fetching AI personalities:', err);
            res.status(500).json({ error: `Failed to fetch AI personalities: ${err.message}` });
        }
    }
}

module.exports = JournalController;
