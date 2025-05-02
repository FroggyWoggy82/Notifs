/**
 * Debug Routes
 * These routes are for debugging purposes only and should not be used in production
 */

const express = require('express');
const router = express.Router();
const db = require('../utils/db');

/**
 * Direct SQL update for package_amount
 */
router.post('/direct-sql', async (req, res) => {
    const { recipeId, ingredientId, packageAmount } = req.body;
    
    console.log('=== DEBUG: Direct SQL Update ===');
    console.log('recipeId:', recipeId);
    console.log('ingredientId:', ingredientId);
    console.log('packageAmount:', packageAmount, typeof packageAmount);
    
    try {
        // Convert packageAmount to a number
        const numericPackageAmount = Number(packageAmount);
        console.log('Numeric packageAmount:', numericPackageAmount, typeof numericPackageAmount);
        
        // Check if the ingredient exists
        const checkResult = await db.query(
            'SELECT id, name, package_amount FROM ingredients WHERE id = $1',
            [ingredientId]
        );
        
        if (checkResult.rowCount === 0) {
            return res.status(404).json({ error: 'Ingredient not found' });
        }
        
        console.log('Current ingredient:', checkResult.rows[0]);
        
        // Update the package_amount
        const updateResult = await db.query(
            'UPDATE ingredients SET package_amount = $1 WHERE id = $2 RETURNING id, name, package_amount',
            [numericPackageAmount, ingredientId]
        );
        
        console.log('Update result:', updateResult.rows[0]);
        
        // Verify the update
        const verifyResult = await db.query(
            'SELECT id, name, package_amount FROM ingredients WHERE id = $1',
            [ingredientId]
        );
        
        console.log('Verified result:', verifyResult.rows[0]);
        
        res.json({
            message: 'Direct SQL update successful',
            before: checkResult.rows[0],
            after: verifyResult.rows[0]
        });
    } catch (error) {
        console.error('Error in direct SQL update:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
