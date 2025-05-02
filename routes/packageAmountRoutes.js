/**
 * Package Amount Routes
 * These routes are specifically for updating the package amount
 */

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
require('dotenv').config();

// Create a new PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

/**
 * Update package amount
 * This endpoint directly updates the package_amount field in the database
 */
router.post('/update', async (req, res) => {
    const { ingredientId, packageAmount } = req.body;
    
    console.log('=== DIRECT PACKAGE AMOUNT UPDATE ===');
    console.log('ingredientId:', ingredientId);
    console.log('packageAmount:', packageAmount, typeof packageAmount);
    
    if (!ingredientId) {
        return res.status(400).json({ error: 'Ingredient ID is required' });
    }
    
    const client = await pool.connect();
    
    try {
        // Convert packageAmount to a number if it's not null
        let finalPackageAmount = null;
        if (packageAmount !== null && packageAmount !== undefined && packageAmount !== '') {
            finalPackageAmount = Number(packageAmount);
            if (isNaN(finalPackageAmount)) {
                return res.status(400).json({ error: 'Package amount must be a number' });
            }
        }
        
        console.log('Final package amount:', finalPackageAmount, typeof finalPackageAmount);
        
        // Check if the ingredient exists
        const checkResult = await client.query(
            'SELECT id, name, package_amount FROM ingredients WHERE id = $1',
            [ingredientId]
        );
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Ingredient not found' });
        }
        
        console.log('Current ingredient:', checkResult.rows[0]);
        
        // Update the package_amount
        const updateResult = await client.query(
            'UPDATE ingredients SET package_amount = $1 WHERE id = $2 RETURNING id, name, package_amount',
            [finalPackageAmount, ingredientId]
        );
        
        console.log('Update result:', updateResult.rows[0]);
        
        // Verify the update
        const verifyResult = await client.query(
            'SELECT id, name, package_amount FROM ingredients WHERE id = $1',
            [ingredientId]
        );
        
        console.log('Verified result:', verifyResult.rows[0]);
        
        // Get the recipe ID for this ingredient
        const recipeResult = await client.query(
            'SELECT recipe_id FROM ingredients WHERE id = $1',
            [ingredientId]
        );
        
        const recipeId = recipeResult.rows[0].recipe_id;
        
        // Get the full recipe with all ingredients
        const fullRecipeResult = await client.query(
            'SELECT * FROM recipes WHERE id = $1',
            [recipeId]
        );
        
        const ingredientsResult = await client.query(
            'SELECT * FROM ingredients WHERE recipe_id = $1 ORDER BY id ASC',
            [recipeId]
        );
        
        const recipe = fullRecipeResult.rows[0];
        recipe.ingredients = ingredientsResult.rows;
        
        res.json(recipe);
    } catch (error) {
        console.error('Error updating package amount:', error);
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});

/**
 * Get all ingredients with package amount
 */
router.get('/ingredients', async (req, res) => {
    const client = await pool.connect();
    
    try {
        const result = await client.query(
            'SELECT id, name, package_amount FROM ingredients WHERE package_amount IS NOT NULL ORDER BY id ASC'
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error getting ingredients with package amount:', error);
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});

module.exports = router;
