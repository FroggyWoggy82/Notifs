/**
 * Days Since Model
 * Handles data operations for days since events
 */

const db = require('../utils/db');

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

    // Parse the incoming local datetime string (YYYY-MM-DDTHH:MM)
    let parsedDate = new Date(startDate);

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

    // Add 5 hours to compensate for timezone difference
    parsedDate.setHours(parsedDate.getHours() + 5);


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

    // Parse the incoming local datetime string (YYYY-MM-DDTHH:MM)
    let parsedDate = new Date(startDate);

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

    // Add 5 hours to compensate for timezone difference
    parsedDate.setHours(parsedDate.getHours() + 5);


    const result = await db.query(
        'UPDATE days_since_events SET event_name = $1, start_date = $2 WHERE id = $3 RETURNING *',
        [eventName.trim(), parsedDate, id] // Pass the Date object directly
    );

    if (result.rowCount === 0) {
        throw new Error('Event not found');
    }

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
