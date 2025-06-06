/**
 * Days Since Model
 * Handles data operations for days since events
 */

const db = require('../utils/db');
const EventResetModel = require('./eventResetModel');

/**
 * Get all days since events
 * @returns {Promise<Array>} - Promise resolving to an array of events
 */
async function getAllEvents() {
    const result = await db.query('SELECT * FROM days_since_events ORDER BY start_date DESC');
    return result.rows;
}

/**
 * Create a new days since event
 * @param {string} eventName - The name of the event
 * @param {string} startDate - The start date of the event (ISO string)
 * @returns {Promise<Object>} - Promise resolving to the created event
 */
async function createEvent(eventName, startDate) {
    if (!eventName || !startDate) {
        throw new Error('Event name and start date are required');
    }

    // Parse the incoming datetime string and handle timezone properly
    let parsedDate;

    // Check if this is a datetime-local string (no timezone info)
    if (startDate.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
        // This is a datetime-local string, treat it as if it's already in the desired display timezone
        // We want the database to store a UTC time that, when converted to Central Time, shows the original local time
        // So we need to store it as UTC time that's 5 hours behind the local time
        const localDate = new Date(startDate + ':00');
        // Subtract 5 hours to get the UTC time that will display correctly in Central Time
        parsedDate = new Date(localDate.getTime() - (5 * 60 * 60 * 1000));
    } else {
        // This already has timezone info or is in a different format
        parsedDate = new Date(startDate);
    }

    // Validate the parsed date
    if (isNaN(parsedDate.getTime())) {
        // Attempt to re-parse if format might have seconds T H H : M M : S S
        const alternativeDate = new Date(startDate.replace('T', ' '));
        if (isNaN(alternativeDate.getTime())) {
            console.error(`Invalid date format received: ${startDate}`);
            throw new Error('Invalid date format');
        }
        // Use the alternatively parsed date if valid
        parsedDate = alternativeDate;
    }


    // Store the date object in the database
    const result = await db.query(
        'INSERT INTO days_since_events (event_name, start_date) VALUES ($1, $2) RETURNING *',
        [eventName.trim(), parsedDate] // Pass the Date object directly
    );

    return result.rows[0];
}

/**
 * Update a days since event
 * @param {number} id - The event ID
 * @param {string} eventName - The updated name of the event
 * @param {string} startDate - The updated start date of the event (ISO string)
 * @returns {Promise<Object>} - Promise resolving to the updated event
 */
async function updateEvent(id, eventName, startDate) {
    if (!eventName || !startDate) {
        throw new Error('Event name and start date are required');
    }

    // Get the current event to check if it's being reset
    const currentEventResult = await db.query(
        'SELECT * FROM days_since_events WHERE id = $1',
        [id]
    );

    if (currentEventResult.rowCount === 0) {
        throw new Error('Event not found');
    }

    const currentEvent = currentEventResult.rows[0];

    // Parse the incoming datetime string and handle timezone properly
    let parsedDate;

    // Check if this is a datetime-local string (no timezone info)
    if (startDate.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
        // This is a datetime-local string, treat it as if it's already in the desired display timezone
        // We want the database to store a UTC time that, when converted to Central Time, shows the original local time
        // So we need to store it as UTC time that's 5 hours behind the local time
        const localDate = new Date(startDate + ':00');
        // Subtract 5 hours to get the UTC time that will display correctly in Central Time
        parsedDate = new Date(localDate.getTime() - (5 * 60 * 60 * 1000));
    } else {
        // This already has timezone info or is in a different format
        parsedDate = new Date(startDate);
    }

    // Validate the parsed date
    if (isNaN(parsedDate.getTime())) {
        // Attempt to re-parse if format might have seconds T H H : M M : S S
        const alternativeDate = new Date(startDate.replace('T', ' '));
        if (isNaN(alternativeDate.getTime())) {
            console.error(`Invalid date format received for update: ${startDate}`);
            throw new Error('Invalid date format');
        }
        // Use the alternatively parsed date if valid
        parsedDate = alternativeDate;
    }

    // Check if this is a reset (new start date is more recent than current start date)
    const currentStartDate = new Date(currentEvent.start_date);
    const isReset = parsedDate > currentStartDate;

    // If it's a reset and the event name contains "Goon", increment the reset count
    if (isReset && (eventName.toLowerCase().includes('goon') || currentEvent.event_name.toLowerCase().includes('goon'))) {
        console.log(`Detected reset for event: ${eventName}`);
        await EventResetModel.incrementResetCount(eventName.trim());
    }

    const result = await db.query(
        'UPDATE days_since_events SET event_name = $1, start_date = $2 WHERE id = $3 RETURNING *',
        [eventName.trim(), parsedDate, id] // Pass the Date object directly
    );

    return result.rows[0];
}

/**
 * Delete a days since event
 * @param {number} id - The event ID
 * @returns {Promise<Object>} - Promise resolving to the deleted event ID
 */
async function deleteEvent(id) {
    const result = await db.query('DELETE FROM days_since_events WHERE id = $1 RETURNING id', [id]);

    if (result.rowCount === 0) {
        throw new Error('Event not found');
    }

    return { id: parseInt(id) };
}

module.exports = {
    getAllEvents,
    createEvent,
    updateEvent,
    deleteEvent
};
