/**
 * Ingredient Details Routes
 * Provides API endpoints for retrieving detailed ingredient information by name
 */

const express = require('express');
const db = require('../utils/db');
const router = express.Router();

// GET /api/ingredient-details/:name - Fetch ingredient details by name
router.get('/:name', async (req, res) => {
    const { name } = req.params;
    console.log(`Received GET /api/ingredient-details/${name} request`);
    
    try {
        // Fetch the most recent ingredient with this name
        // This query gets the most recently added ingredient with the given name
        const result = await db.query(`
            SELECT * FROM ingredients 
            WHERE name = $1 
            ORDER BY id DESC 
            LIMIT 1
        `, [name]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Ingredient not found' });
        }
        
        console.log(`Found ingredient details for '${name}'`);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(`Error fetching ingredient details for '${name}':`, err);
        res.status(500).json({ error: 'Failed to fetch ingredient details' });
    }
});

module.exports = router;
