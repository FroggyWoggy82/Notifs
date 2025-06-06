/**
 * Event Reset Model
 * Handles data operations for tracking event resets
 */

const db = require('../utils/db');

/**
 * Get reset count for a specific event
 * @param {string} eventName - The name of the event
 * @returns {Promise<number>} - Promise resolving to the reset count
 */
async function getResetCount(eventName) {
    const result = await db.query(
        'SELECT reset_count FROM event_resets WHERE event_name = $1',
        [eventName]
    );
    
    if (result.rows.length === 0) {
        // If no record exists, create one with count 0
        await db.query(
            'INSERT INTO event_resets (event_name, reset_count) VALUES ($1, 0)',
            [eventName]
        );
        return 0;
    }
    
    return result.rows[0].reset_count || 0;
}

/**
 * Increment reset count for a specific event
 * @param {string} eventName - The name of the event
 * @returns {Promise<number>} - Promise resolving to the new reset count
 */
async function incrementResetCount(eventName) {
    const result = await db.query(
        `INSERT INTO event_resets (event_name, reset_count) 
         VALUES ($1, 1)
         ON CONFLICT (event_name) 
         DO UPDATE SET reset_count = event_resets.reset_count + 1, updated_at = CURRENT_TIMESTAMP
         RETURNING reset_count`,
        [eventName]
    );
    
    return result.rows[0].reset_count;
}

/**
 * Get all event reset counts
 * @returns {Promise<Array>} - Promise resolving to an array of event reset records
 */
async function getAllResetCounts() {
    const result = await db.query('SELECT * FROM event_resets ORDER BY event_name');
    return result.rows;
}

module.exports = {
    getResetCount,
    incrementResetCount,
    getAllResetCounts
};
