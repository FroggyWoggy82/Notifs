const JournalModel = require('../models/journalModel');

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
            const { content } = req.body;
            
            if (!content) {
                return res.status(400).json({ error: 'Content is required for analysis.' });
            }
            
            // This is a placeholder for actual AI analysis
            // In a real implementation, you would call an AI service here
            const analysis = await JournalController.performAnalysis(content);
            
            res.json({ analysis });
        } catch (err) {
            console.error('Error analyzing journal entry:', err);
            res.status(500).json({ error: `Failed to analyze journal entry: ${err.message}` });
        }
    }

    /**
     * Perform AI analysis on journal content
     * @param {string} content - The journal content to analyze
     * @returns {Promise<string>} The analysis result
     */
    static async performAnalysis(content) {
        // This is a placeholder for actual AI analysis
        // In a real implementation, you would call an AI service here
        
        // For now, we'll return a simple analysis based on the content length and some keywords
        const wordCount = content.split(/\s+/).length;
        let sentiment = 'neutral';
        
        // Very basic sentiment analysis
        const positiveWords = ['happy', 'good', 'great', 'excellent', 'joy', 'love', 'excited', 'positive'];
        const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'angry', 'upset', 'negative', 'worried', 'stress'];
        
        let positiveCount = 0;
        let negativeCount = 0;
        
        const contentLower = content.toLowerCase();
        
        positiveWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = contentLower.match(regex);
            if (matches) {
                positiveCount += matches.length;
            }
        });
        
        negativeWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = contentLower.match(regex);
            if (matches) {
                negativeCount += matches.length;
            }
        });
        
        if (positiveCount > negativeCount) {
            sentiment = 'positive';
        } else if (negativeCount > positiveCount) {
            sentiment = 'negative';
        }
        
        // Generate analysis HTML
        return `
            <div class="analysis-section">
                <h4>Basic Analysis</h4>
                <p>Your journal entry contains <strong>${wordCount} words</strong>.</p>
                <p>The overall tone appears to be <strong>${sentiment}</strong>.</p>
                <p>Positive words detected: <strong>${positiveCount}</strong></p>
                <p>Negative words detected: <strong>${negativeCount}</strong></p>
            </div>
            
            <div class="analysis-section">
                <h4>Insights</h4>
                <p>This is a placeholder for more detailed AI analysis. In a real implementation, this would include:</p>
                <ul>
                    <li>Deeper sentiment analysis</li>
                    <li>Key themes and topics</li>
                    <li>Emotional patterns</li>
                    <li>Personalized insights</li>
                    <li>Suggestions for reflection</li>
                </ul>
            </div>
        `;
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
