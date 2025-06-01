const PersonAnalysisService = require('../services/personAnalysisService');
const PersonModel = require('../models/personModel');
const db = require('../utils/db');

class PersonController {
    /**
     * Get all people mentioned in journal entries
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getAllPeople(req, res) {
        try {
            const people = await PersonAnalysisService.getPeopleOverview();
            res.json(people);
        } catch (error) {
            console.error('Error getting all people:', error);
            res.status(500).json({ error: 'Failed to retrieve people' });
        }
    }

    /**
     * Get detailed analysis for a specific person
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getPersonAnalysis(req, res) {
        try {
            const personId = parseInt(req.params.id);
            
            if (isNaN(personId)) {
                return res.status(400).json({ error: 'Invalid person ID' });
            }

            const analysis = await PersonAnalysisService.generatePersonAnalysis(personId);
            res.json(analysis);
        } catch (error) {
            console.error('Error getting person analysis:', error);
            if (error.message === 'Person not found') {
                res.status(404).json({ error: 'Person not found' });
            } else {
                res.status(500).json({ error: 'Failed to generate person analysis' });
            }
        }
    }

    /**
     * Get all mentions of a specific person
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getPersonMentions(req, res) {
        try {
            const personId = parseInt(req.params.id);
            
            if (isNaN(personId)) {
                return res.status(400).json({ error: 'Invalid person ID' });
            }

            const personDetails = await PersonModel.getPersonDetails(personId);
            
            if (!personDetails.person) {
                return res.status(404).json({ error: 'Person not found' });
            }

            res.json({
                person: personDetails.person,
                mentions: personDetails.mentions
            });
        } catch (error) {
            console.error('Error getting person mentions:', error);
            res.status(500).json({ error: 'Failed to retrieve person mentions' });
        }
    }

    /**
     * Get relationship insights for a specific person
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getPersonInsights(req, res) {
        try {
            const personId = parseInt(req.params.id);
            
            if (isNaN(personId)) {
                return res.status(400).json({ error: 'Invalid person ID' });
            }

            const personDetails = await PersonModel.getPersonDetails(personId);
            
            if (!personDetails.person) {
                return res.status(404).json({ error: 'Person not found' });
            }

            res.json({
                person: personDetails.person,
                insights: personDetails.insights
            });
        } catch (error) {
            console.error('Error getting person insights:', error);
            res.status(500).json({ error: 'Failed to retrieve person insights' });
        }
    }

    /**
     * Search for a person by name and get their analysis
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async searchPerson(req, res) {
        try {
            const { name } = req.query;
            
            if (!name) {
                return res.status(400).json({ error: 'Name parameter is required' });
            }

            // Find person by name (case-insensitive)
            const people = await PersonModel.getAllPeople();
            const person = people.find(p => 
                p.name.toLowerCase().includes(name.toLowerCase()) ||
                name.toLowerCase().includes(p.name.toLowerCase())
            );

            if (!person) {
                return res.status(404).json({ error: `No person found matching "${name}"` });
            }

            // Get full analysis for the found person
            const analysis = await PersonAnalysisService.generatePersonAnalysis(person.id);
            res.json(analysis);
        } catch (error) {
            console.error('Error searching for person:', error);
            res.status(500).json({ error: 'Failed to search for person' });
        }
    }

    /**
     * Manually trigger person extraction for a specific journal entry
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async extractPeopleFromEntry(req, res) {
        try {
            const { journalEntryId, content } = req.body;
            
            if (!journalEntryId || !content) {
                return res.status(400).json({ error: 'Journal entry ID and content are required' });
            }

            const extractedPeople = await PersonAnalysisService.extractAndAnalyzePeople(content, journalEntryId);
            
            res.json({
                message: `Extracted ${extractedPeople.length} people from journal entry`,
                people: extractedPeople
            });
        } catch (error) {
            console.error('Error extracting people from entry:', error);
            res.status(500).json({ error: 'Failed to extract people from journal entry' });
        }
    }

    /**
     * Get conversation history with a specific person
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getPersonConversations(req, res) {
        try {
            const personId = parseInt(req.params.id);
            
            if (isNaN(personId)) {
                return res.status(400).json({ error: 'Invalid person ID' });
            }

            const personDetails = await PersonModel.getPersonDetails(personId);
            
            if (!personDetails.person) {
                return res.status(404).json({ error: 'Person not found' });
            }

            res.json({
                person: personDetails.person,
                conversations: personDetails.conversations
            });
        } catch (error) {
            console.error('Error getting person conversations:', error);
            res.status(500).json({ error: 'Failed to retrieve person conversations' });
        }
    }

    /**
     * Update a person's information
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async updatePerson(req, res) {
        try {
            const personId = parseInt(req.params.id);
            const { relationshipType, overallSentiment } = req.body;
            
            if (isNaN(personId)) {
                return res.status(400).json({ error: 'Invalid person ID' });
            }

            // Update person in database
            const result = await db.query(
                `UPDATE people 
                 SET relationship_type = COALESCE($1, relationship_type),
                     overall_sentiment = COALESCE($2, overall_sentiment),
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $3
                 RETURNING *`,
                [relationshipType, overallSentiment, personId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Person not found' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error updating person:', error);
            res.status(500).json({ error: 'Failed to update person' });
        }
    }
}

module.exports = PersonController;
