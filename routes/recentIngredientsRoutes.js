/**
 * Recent Ingredients Routes
 * Provides API endpoints for retrieving the most recently added ingredients
 */

const express = require('express');
const db = require('../utils/db');
const router = express.Router();

// GET /api/recent-ingredients - Fetch the most recently added ingredients
router.get('/', async (req, res) => {
    console.log("Received GET /api/recent-ingredients request");
    try {
        // Get limit from query params, default to 5
        const limit = parseInt(req.query.limit) || 5;

        // Fetch the most recently added ingredients
        const result = await db.query(`
            SELECT DISTINCT ON (i.name)
                i.id,
                i.name,
                i.calories,
                i.amount,
                i.protein,
                i.fats,
                i.carbohydrates,
                i.package_amount,
                i.price,
                r.name as recipe_name,
                r.id as recipe_id
            FROM
                ingredients i
            JOIN
                recipes r ON i.recipe_id = r.id
            ORDER BY
                i.name, i.id DESC
            LIMIT $1
        `, [limit]);

        console.log(`Found ${result.rows.length} recent ingredients`);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching recent ingredients:', err);
        res.status(500).json({ error: 'Failed to fetch recent ingredients' });
    }
});

// GET /api/recent-ingredients/search - Search for ingredients by name
router.get('/search', async (req, res) => {
    const searchTerm = req.query.q || '';
    console.log(`Received GET /api/recent-ingredients/search?q=${searchTerm} request`);

    try {
        // Search for ingredients by name
        const result = await db.query(`
            SELECT DISTINCT ON (i.name)
                i.id,
                i.name,
                i.calories,
                i.amount,
                i.protein,
                i.fats,
                i.carbohydrates,
                i.package_amount,
                i.price,
                r.name as recipe_name,
                r.id as recipe_id
            FROM
                ingredients i
            JOIN
                recipes r ON i.recipe_id = r.id
            WHERE
                i.name ILIKE $1
            ORDER BY
                i.name, i.id DESC
            LIMIT 10
        `, [`%${searchTerm}%`]);

        console.log(`Found ${result.rows.length} ingredients matching '${searchTerm}'`);
        res.json(result.rows);
    } catch (err) {
        console.error(`Error searching for ingredients with term '${searchTerm}':`, err);
        res.status(500).json({ error: 'Failed to search for ingredients' });
    }
});

module.exports = router;
