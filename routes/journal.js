const express = require('express');
const JournalController = require('../controllers/journalController');

const router = express.Router();

/**
 * @swagger
 * /api/journal:
 *   get:
 *     summary: Get all journal entries
 *     responses:
 *       200:
 *         description: List of journal entries
 *       500:
 *         description: Server error
 */
router.get('/', JournalController.getAllEntries);

/**
 * @swagger
 * /api/journal/memory:
 *   get:
 *     summary: Get journal memory entries
 *     responses:
 *       200:
 *         description: List of memory entries
 *       500:
 *         description: Server error
 */
router.get('/memory', JournalController.getMemoryEntries);

/**
 * @swagger
 * /api/journal/memory/stats:
 *   get:
 *     summary: Get memory usage statistics
 *     responses:
 *       200:
 *         description: Memory usage statistics
 *       500:
 *         description: Server error
 */
router.get('/memory/stats', JournalController.getMemoryStats);

/**
 * @swagger
 * /api/journal/memory:
 *   post:
 *     summary: Save a memory entry
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               text:
 *                 type: string
 *               summary:
 *                 type: string
 *     responses:
 *       201:
 *         description: Memory entry saved
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/memory', JournalController.saveMemoryEntry);

/**
 * @swagger
 * /api/journal/date/{date}:
 *   get:
 *     summary: Get a journal entry by date
 *     parameters:
 *       - in: path
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Journal entry date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Journal entry
 *       404:
 *         description: Entry not found
 *       500:
 *         description: Server error
 */
router.get('/date/:date', JournalController.getEntryByDate);

/**
 * @swagger
 * /api/journal/people:
 *   get:
 *     summary: Get all people mentioned in journal entries
 *     responses:
 *       200:
 *         description: List of people with mention counts
 *       500:
 *         description: Server error
 */
router.get('/people', async (req, res) => {
    try {
        const PersonAnalysisService = require('../services/personAnalysisService');
        const people = await PersonAnalysisService.getPeopleOverview();
        res.json(people);
    } catch (error) {
        console.error('Error getting people overview:', error);
        res.status(500).json({ error: 'Failed to retrieve people' });
    }
});

/**
 * @swagger
 * /api/journal/people/search:
 *   get:
 *     summary: Search for a person by name and get their analysis
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Name to search for
 *     responses:
 *       200:
 *         description: Person analysis
 *       404:
 *         description: Person not found
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.get('/people/search', async (req, res) => {
    try {
        const { name } = req.query;

        if (!name) {
            return res.status(400).json({ error: 'Name parameter is required' });
        }

        const PersonModel = require('../models/personModel');
        const PersonAnalysisService = require('../services/personAnalysisService');

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
});

/**
 * @swagger
 * /api/journal/people/{id}:
 *   get:
 *     summary: Get detailed analysis for a specific person
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Person ID
 *     responses:
 *       200:
 *         description: Comprehensive person analysis
 *       404:
 *         description: Person not found
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.get('/people/:id', async (req, res) => {
    try {
        const personId = parseInt(req.params.id);

        if (isNaN(personId)) {
            return res.status(400).json({ error: 'Invalid person ID' });
        }

        const PersonAnalysisService = require('../services/personAnalysisService');
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
});

/**
 * @swagger
 * /api/journal/{id}:
 *   get:
 *     summary: Get a journal entry by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Journal entry ID
 *     responses:
 *       200:
 *         description: Journal entry
 *       404:
 *         description: Entry not found
 *       500:
 *         description: Server error
 */
router.get('/:id', JournalController.getEntryById);

/**
 * @swagger
 * /api/journal:
 *   post:
 *     summary: Save a journal entry
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               content:
 *                 type: string
 *               analysis:
 *                 type: string
 *     responses:
 *       201:
 *         description: Journal entry saved
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', JournalController.saveEntry);

/**
 * @swagger
 * /api/journal/analyze:
 *   post:
 *     summary: Analyze a journal entry
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Analysis result
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/analyze', JournalController.analyzeEntry);

/**
 * @swagger
 * /api/journal/{id}:
 *   delete:
 *     summary: Delete a journal entry
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Journal entry ID
 *     responses:
 *       200:
 *         description: Journal entry deleted
 *       404:
 *         description: Entry not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', JournalController.deleteEntry);

/**
 * @swagger
 * /api/journal/insights:
 *   post:
 *     summary: Save insights for a journal entry
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               journalEntryId:
 *                 type: integer
 *               insights:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *                     type:
 *                       type: string
 *     responses:
 *       201:
 *         description: Insights saved
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/insights', JournalController.saveInsights);

/**
 * @swagger
 * /api/journal/{id}/insights:
 *   get:
 *     summary: Get insights for a journal entry
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Journal entry ID
 *     responses:
 *       200:
 *         description: List of insights
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.get('/:id/insights', JournalController.getInsightsByEntryId);

/**
 * @swagger
 * /api/journal/insights/type/{type}:
 *   get:
 *     summary: Get all insights of a specific type
 *     parameters:
 *       - in: path
 *         name: type
 *         schema:
 *           type: string
 *         required: true
 *         description: Insight type (e.g., 'question', 'pattern', 'general')
 *     responses:
 *       200:
 *         description: List of insights
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.get('/insights/type/:type', JournalController.getInsightsByType);

// Log all routes for debugging
console.log('Journal Routes:');
router.stack.forEach((r) => {
    if (r.route && r.route.path) {
        Object.keys(r.route.methods).forEach((method) => {
            console.log(`${method.toUpperCase()} /api/journal${r.route.path}`);
        });
    }
});

module.exports = router;
