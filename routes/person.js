const express = require('express');
const PersonController = require('../controllers/personController');

const router = express.Router();

/**
 * @swagger
 * /api/people:
 *   get:
 *     summary: Get all people mentioned in journal entries
 *     responses:
 *       200:
 *         description: List of people with mention counts and basic info
 *       500:
 *         description: Server error
 */
router.get('/', PersonController.getAllPeople);

/**
 * @swagger
 * /api/people/search:
 *   get:
 *     summary: Search for a person by name
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
router.get('/search', PersonController.searchPerson);

/**
 * @swagger
 * /api/people/{id}:
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
router.get('/:id', PersonController.getPersonAnalysis);

/**
 * @swagger
 * /api/people/{id}/mentions:
 *   get:
 *     summary: Get all mentions of a specific person
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Person ID
 *     responses:
 *       200:
 *         description: List of person mentions
 *       404:
 *         description: Person not found
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.get('/:id/mentions', PersonController.getPersonMentions);

/**
 * @swagger
 * /api/people/{id}/insights:
 *   get:
 *     summary: Get relationship insights for a specific person
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Person ID
 *     responses:
 *       200:
 *         description: List of relationship insights
 *       404:
 *         description: Person not found
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.get('/:id/insights', PersonController.getPersonInsights);

/**
 * @swagger
 * /api/people/{id}/conversations:
 *   get:
 *     summary: Get conversation history with a specific person
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Person ID
 *     responses:
 *       200:
 *         description: List of conversations
 *       404:
 *         description: Person not found
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.get('/:id/conversations', PersonController.getPersonConversations);

/**
 * @swagger
 * /api/people/{id}:
 *   put:
 *     summary: Update a person's information
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Person ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               relationshipType:
 *                 type: string
 *               overallSentiment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated person
 *       404:
 *         description: Person not found
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.put('/:id', PersonController.updatePerson);

/**
 * @swagger
 * /api/people/extract:
 *   post:
 *     summary: Manually extract people from a journal entry
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               journalEntryId:
 *                 type: integer
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Extracted people
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/extract', PersonController.extractPeopleFromEntry);

// Log all routes for debugging
console.log('Person Routes:');
router.stack.forEach((r) => {
    if (r.route && r.route.path) {
        Object.keys(r.route.methods).forEach((method) => {
            console.log(`${method.toUpperCase()} /api/people${r.route.path}`);
        });
    }
});

module.exports = router;
