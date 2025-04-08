/**
 * Days Since Controller
 * Handles HTTP requests and responses for days since events
 */

const DaysSinceModel = require('../models/daysSinceModel');

/**
 * Get all days since events
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getAllEvents(req, res) {
    console.log("Received GET /api/days-since request");
    try {
        const events = await DaysSinceModel.getAllEvents();
        console.log("GET /api/days-since response:", events);
        res.json(events);
    } catch (error) {
        console.error('Error fetching days since events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
}

/**
 * Create a new days since event
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function createEvent(req, res) {
    const { eventName, startDate } = req.body;
    console.log(`Received POST /api/days-since: name='${eventName}', startDate='${startDate}'`);

    try {
        const event = await DaysSinceModel.createEvent(eventName, startDate);
        console.log(`Event created successfully with ID: ${event.id}`, event);
        res.status(201).json(event);
    } catch (error) {
        console.error('Error creating event:', error);
        
        if (error.message === 'Event name and start date are required') {
            return res.status(400).json({ error: error.message });
        }
        
        if (error.message === 'Invalid date format') {
            return res.status(400).json({ error: error.message });
        }
        
        res.status(500).json({ error: 'Failed to create event' });
    }
}

/**
 * Update a days since event
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateEvent(req, res) {
    const { id } = req.params;
    const { eventName, startDate } = req.body;
    console.log(`Received PUT /api/days-since/${id}: name='${eventName}', startDate='${startDate}'`);

    try {
        const event = await DaysSinceModel.updateEvent(id, eventName, startDate);
        console.log(`Event ${id} updated successfully`);
        res.json(event);
    } catch (error) {
        console.error('Error updating event:', error);
        
        if (error.message === 'Event name and start date are required') {
            return res.status(400).json({ error: error.message });
        }
        
        if (error.message === 'Invalid date format') {
            return res.status(400).json({ error: error.message });
        }
        
        if (error.message === 'Event not found') {
            return res.status(404).json({ error: error.message });
        }
        
        res.status(500).json({ error: 'Failed to update event' });
    }
}

/**
 * Delete a days since event
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function deleteEvent(req, res) {
    const { id } = req.params;
    console.log(`Received DELETE /api/days-since/${id}`);

    try {
        const result = await DaysSinceModel.deleteEvent(id);
        console.log(`Event ${id} deleted successfully`);
        res.json({ 
            message: `Event ${id} deleted successfully`, 
            id: result.id 
        });
    } catch (error) {
        console.error('Error deleting event:', error);
        
        if (error.message === 'Event not found') {
            return res.status(404).json({ error: error.message });
        }
        
        res.status(500).json({ error: 'Failed to delete event' });
    }
}

module.exports = {
    getAllEvents,
    createEvent,
    updateEvent,
    deleteEvent
};
