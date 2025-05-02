/**
 * Direct Update Routes
 * These routes are for direct updates to the database
 */

const express = require('express');
const router = express.Router();
const db = require('../utils/db');

/**
 * Direct update for package_amount
 */
router.post('/package-amount', async (req, res) => {
    const { ingredientId, packageAmount } = req.body;
    
    console.log('=== DIRECT UPDATE: Package Amount ===');
    console.log('ingredientId:', ingredientId);
    console.log('packageAmount:', packageAmount, typeof packageAmount);
    
    if (!ingredientId) {
        return res.status(400).json({ error: 'Ingredient ID is required' });
    }
    
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
            [finalPackageAmount, ingredientId]
        );
        
        console.log('Update result:', updateResult.rows[0]);
        
        // Verify the update
        const verifyResult = await db.query(
            'SELECT id, name, package_amount FROM ingredients WHERE id = $1',
            [ingredientId]
        );
        
        console.log('Verified result:', verifyResult.rows[0]);
        
        res.json({
            message: 'Direct update successful',
            before: checkResult.rows[0],
            after: verifyResult.rows[0]
        });
    } catch (error) {
        console.error('Error in direct update:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
