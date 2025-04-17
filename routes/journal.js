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
