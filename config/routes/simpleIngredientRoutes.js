/**
 * Simple Ingredient Routes
 * A simplified version of the ingredient routes
 */

const express = require('express');
const router = express.Router();
const db = require('../../utils/db');

// GET /api/ingredients/unique - Get all unique ingredients
router.get('/unique', async (req, res) => {
    try {
        console.log('Fetching all unique ingredients');
        
        // Query to get all unique ingredients from all recipes
        const query = `
            WITH recipe_ingredients AS (
                SELECT 
                    r.id AS recipe_id,
                    r.name AS recipe_name,
                    i.id AS ingredient_id,
                    i.name AS ingredient_name,
                    i.amount,
                    i.calories,
                    i.protein,
                    i.fats,
                    i.carbohydrates,
                    i.package_amount,
                    i.price
                FROM 
                    recipes r
                JOIN 
                    ingredients i ON i.recipe_id = r.id
                ORDER BY 
                    i.name
            )
            SELECT * FROM recipe_ingredients
        `;
        
        const result = await db.query(query);
        
        // Format the response
        const ingredients = result.rows.map(row => ({
            id: row.ingredient_id,
            name: row.ingredient_name,
            recipe_id: row.recipe_id,
            recipe_name: row.recipe_name,
            amount: row.amount,
            calories: row.calories,
            protein: row.protein,
            fats: row.fats,
            carbohydrates: row.carbohydrates,
            package_amount: row.package_amount,
            price: row.price
        }));
        
        console.log(`Found ${ingredients.length} unique ingredients`);
        res.json(ingredients);
    } catch (error) {
        console.error('Error fetching unique ingredients:', error);
        res.status(500).json({ error: 'Failed to fetch unique ingredients' });
    }
});

// GET /api/ingredients/:id - Get ingredient details by ID
router.get('/:id', async (req, res) => {
    try {
        const ingredientId = req.params.id;
        console.log(`Fetching ingredient details for ID: ${ingredientId}`);
        
        const query = `
            SELECT 
                i.*
            FROM 
                ingredients i
            WHERE 
                i.id = $1
        `;
        
        const result = await db.query(query, [ingredientId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Ingredient not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error(`Error fetching ingredient details for ID ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to fetch ingredient details' });
    }
});

module.exports = router;
