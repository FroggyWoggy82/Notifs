// routes/daysSince.js
const express = require('express');
const db = require('../utils/db');
const router = express.Router();

// GET /api/days-since - Fetch all events
router.get('/', async (req, res) => {
    console.log("Received GET /api/days-since request");
    try {
        const result = await db.query('SELECT * FROM days_since_events ORDER BY start_date DESC');
        console.log("GET /api/days-since response:", result.rows);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching days since events:', err);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// POST /api/days-since - Create a new event
router.post('/', async (req, res) => {
    const { eventName, startDate } = req.body;
    console.log(`Received POST /api/days-since: name='${eventName}', startDate='${startDate}'`);

    if (!eventName || !startDate) {
        console.log('Missing required fields:', { eventName, startDate });
        return res.status(400).json({ error: 'Event name and start date are required' });
    }

    try {
        // Parse the ISO string into a Date object
        const parsedDate = new Date(startDate);
        if (isNaN(parsedDate.getTime())) {
            console.log('Invalid date format:', startDate);
            return res.status(400).json({ error: 'Invalid date format' });
        }

        // Store the date as is (PostgreSQL will handle timezone conversion)
        const result = await db.query(
            'INSERT INTO days_since_events (event_name, start_date) VALUES ($1, $2) RETURNING *',
            [eventName.trim(), parsedDate]
        );
        console.log(`Event created successfully with ID: ${result.rows[0].id}`, result.rows[0]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating event:', err);
        res.status(500).json({ error: 'Failed to create event' });
    }
});

// PUT /api/days-since/:id - Update an event
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { eventName, startDate } = req.body;
    console.log(`Received PUT /api/days-since/${id}: name='${eventName}', startDate='${startDate}'`);

    if (!eventName || !startDate) {
        return res.status(400).json({ error: 'Event name and start date are required' });
    }

    try {
        // Parse the ISO string into a Date object
        const parsedDate = new Date(startDate);
        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        const result = await db.query(
            'UPDATE days_since_events SET event_name = $1, start_date = $2 WHERE id = $3 RETURNING *',
            [eventName.trim(), parsedDate, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        console.log(`Event ${id} updated successfully`);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating event:', err);
        res.status(500).json({ error: 'Failed to update event' });
    }
});

// DELETE /api/days-since/:id - Delete an event
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`Received DELETE /api/days-since/${id}`);

    try {
        const result = await db.query('DELETE FROM days_since_events WHERE id = $1 RETURNING id', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        console.log(`Event ${id} deleted successfully`);
        res.json({ message: `Event ${id} deleted successfully`, id: parseInt(id) });
    } catch (err) {
        console.error('Error deleting event:', err);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

module.exports = router;