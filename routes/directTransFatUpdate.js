// directTransFatUpdate.js
const express = require('express');
const router = express.Router();
const db = require('../utils/db');

// Direct endpoint for updating trans_fat values
router.post('/update-trans-fat', async (req, res) => {
    try {
        const { ingredientId, transFatValue } = req.body;

        console.log('Received direct trans_fat update request:', req.body);

        if (!ingredientId) {
            return res.status(400).json({ error: 'Ingredient ID is required' });
        }

        // Convert the trans_fat value to a number
        let finalTransFatValue = 0;
        if (transFatValue !== undefined && transFatValue !== null) {
            finalTransFatValue = Number(transFatValue);
            if (isNaN(finalTransFatValue)) {
                finalTransFatValue = 0;
            }
        }

        console.log(`Updating trans_fat for ingredient ${ingredientId} to ${finalTransFatValue}`);

        // Get the current value for comparison
        const currentResult = await db.query(
            'SELECT id, name, trans_fat FROM ingredients WHERE id = $1',
            [ingredientId]
        );

        if (currentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Ingredient not found' });
        }

        const currentIngredient = currentResult.rows[0];
        console.log('Current ingredient:', currentIngredient);

        // Update the trans_fat value directly
        const updateResult = await db.query(
            'UPDATE ingredients SET trans_fat = $1 WHERE id = $2 RETURNING id, name, trans_fat',
            [finalTransFatValue, ingredientId]
        );

        // Log the SQL query for debugging
        console.log('Executed SQL query:', 'UPDATE ingredients SET trans_fat = $1 WHERE id = $2 RETURNING id, name, trans_fat');
        console.log('Query parameters:', [finalTransFatValue, ingredientId]);

        if (updateResult.rows.length === 0) {
            return res.status(500).json({ error: 'Failed to update trans_fat value' });
        }

        const updatedIngredient = updateResult.rows[0];
        console.log('Updated ingredient:', updatedIngredient);

        // Verify the update
        const verifyResult = await db.query(
            'SELECT id, name, trans_fat FROM ingredients WHERE id = $1',
            [ingredientId]
        );

        const verifiedIngredient = verifyResult.rows[0];
        console.log('Verified ingredient:', verifiedIngredient);

        // Return the result
        res.json({
            success: true,
            message: 'Trans fat value updated successfully',
            before: currentIngredient,
            after: verifiedIngredient
        });
    } catch (error) {
        console.error('Error updating trans_fat value:', error);
        res.status(500).json({ error: 'Failed to update trans_fat value' });
    }
});

module.exports = router;
