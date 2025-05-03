// transFatUpdateRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../utils/db');

// Direct update endpoint for trans_fat
router.post('/update', async (req, res) => {
    try {
        const { ingredientId, transFatValue } = req.body;
        
        if (!ingredientId) {
            return res.status(400).json({ error: 'Ingredient ID is required' });
        }
        
        console.log('Received request to update trans_fat:', { ingredientId, transFatValue });
        
        // Check if the ingredient exists
        const checkResult = await db.query(
            'SELECT id, name, trans_fat FROM ingredients WHERE id = $1',
            [ingredientId]
        );
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Ingredient not found' });
        }
        
        console.log('Current ingredient:', checkResult.rows[0]);
        
        // Process the trans_fat value
        let finalTransFatValue = null;
        if (transFatValue !== undefined && transFatValue !== null) {
            // Convert to number
            finalTransFatValue = Number(transFatValue);
            
            // If conversion failed, set to null
            if (isNaN(finalTransFatValue)) {
                finalTransFatValue = null;
            }
        }
        
        console.log('Final trans_fat value to save:', finalTransFatValue);
        
        // Update the trans_fat
        const updateResult = await db.query(
            'UPDATE ingredients SET trans_fat = $1 WHERE id = $2 RETURNING id, name, trans_fat',
            [finalTransFatValue, ingredientId]
        );
        
        console.log('Update result:', updateResult.rows[0]);
        
        // Verify the update
        const verifyResult = await db.query(
            'SELECT id, name, trans_fat FROM ingredients WHERE id = $1',
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
