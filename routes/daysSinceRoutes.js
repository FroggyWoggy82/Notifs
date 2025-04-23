/**
 * Days Since Routes
 * Defines API endpoints for days since events
 */

const express = require('express');
const router = express.Router();
const DaysSinceController = require('../controllers/daysSinceController');

/**
 * @swagger
 * /api/days-since:
 *   get:
 *     summary: Get all days since events
 *     tags: [Days Since]
 *     responses:
 *       200:
 *         description: List of days since events
 *       500:
 *         description: Server error
 */
router.get('/', DaysSinceController.getAllEvents);

/**
 * @swagger
 * /api/days-since:
 *   post:
 *     summary: Create a new days since event
 *     tags: [Days Since]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventName
 *               - startDate
 *             properties:
 *               eventName:
 *                 type: string
 *                 description: The name of the event
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: The start date of the event
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', DaysSinceController.createEvent);

/**
 * @swagger
 * /api/days-since/{id}:
 *   put:
 *     summary: Update a days since event
 *     tags: [Days Since]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventName
 *               - startDate
 *             properties:
 *               eventName:
 *                 type: string
 *                 description: The updated name of the event
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: The updated start date of the event
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 */
router.put('/:id', DaysSinceController.updateEvent);

/**
 * @swagger
 * /api/days-since/{id}:
 *   delete:
 *     summary: Delete a days since event
 *     tags: [Days Since]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The event ID
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', DaysSinceController.deleteEvent);

module.exports = router;
