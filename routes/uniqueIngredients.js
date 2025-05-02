/**
 * Unique Ingredients Routes
 * Provides API endpoints for retrieving unique ingredient names
 */

const express = require('express');
const db = require('../utils/db');
const router = express.Router();

// GET /api/unique-ingredients - Fetch all unique ingredient names
router.get('/', async (req, res) => {
    console.log("Received GET /api/unique-ingredients request");
    try {
        // Fetch unique ingredient names across all recipes
        const result = await db.query(`
            SELECT DISTINCT name 
            FROM ingredients 
            ORDER BY name ASC
        `);
        
        console.log(`Found ${result.rows.length} unique ingredients`);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching unique ingredients:', err);
        res.status(500).json({ error: 'Failed to fetch unique ingredients' });
    }
});

module.exports = router;
