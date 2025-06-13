const express = require('express');
const router = express.Router();
const db = require('../utils/db');

// GET /api/warmup-weights/:exercise_id - Get warmup weight for an exercise
router.get('/:exercise_id', async (req, res) => {
    try {
        const { exercise_id } = req.params;
        
        console.log(`[WARMUP] Getting warmup weight for exercise ${exercise_id}`);
        
        const result = await db.query(
            'SELECT * FROM exercise_warmup_weights WHERE exercise_id = $1',
            [exercise_id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'No warmup weight found for this exercise' 
            });
        }
        
        console.log(`[WARMUP] Found warmup weight:`, result.rows[0]);
        res.json({
            success: true,
            warmup_weight: result.rows[0]
        });
        
    } catch (error) {
        console.error('[WARMUP] Error getting warmup weight:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get warmup weight',
            error: error.message 
        });
    }
});

// POST /api/warmup-weights - Save or update warmup weight for an exercise
router.post('/', async (req, res) => {
    try {
        const { exercise_id, warmup_weight, weight_unit } = req.body;
        
        console.log(`[WARMUP] Saving warmup weight for exercise ${exercise_id}:`, {
            warmup_weight,
            weight_unit
        });
        
        // Validate required fields
        if (!exercise_id || warmup_weight === undefined || warmup_weight === null) {
            return res.status(400).json({
                success: false,
                message: 'exercise_id and warmup_weight are required'
            });
        }
        
        // Use UPSERT (INSERT ... ON CONFLICT) to handle both create and update
        const result = await db.query(`
            INSERT INTO exercise_warmup_weights (exercise_id, warmup_weight, weight_unit)
            VALUES ($1, $2, $3)
            ON CONFLICT (exercise_id) 
            DO UPDATE SET 
                warmup_weight = EXCLUDED.warmup_weight,
                weight_unit = EXCLUDED.weight_unit,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `, [exercise_id, warmup_weight, weight_unit || 'lbs']);
        
        console.log(`[WARMUP] Saved warmup weight:`, result.rows[0]);
        res.json({
            success: true,
            message: 'Warmup weight saved successfully',
            warmup_weight: result.rows[0]
        });
        
    } catch (error) {
        console.error('[WARMUP] Error saving warmup weight:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to save warmup weight',
            error: error.message 
        });
    }
});

// DELETE /api/warmup-weights/:exercise_id - Delete warmup weight for an exercise
router.delete('/:exercise_id', async (req, res) => {
    try {
        const { exercise_id } = req.params;
        
        console.log(`[WARMUP] Deleting warmup weight for exercise ${exercise_id}`);
        
        const result = await db.query(
            'DELETE FROM exercise_warmup_weights WHERE exercise_id = $1 RETURNING *',
            [exercise_id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'No warmup weight found for this exercise' 
            });
        }
        
        console.log(`[WARMUP] Deleted warmup weight:`, result.rows[0]);
        res.json({
            success: true,
            message: 'Warmup weight deleted successfully'
        });
        
    } catch (error) {
        console.error('[WARMUP] Error deleting warmup weight:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete warmup weight',
            error: error.message 
        });
    }
});

// GET /api/warmup-weights - Get all warmup weights (for debugging/admin)
router.get('/', async (req, res) => {
    try {
        console.log(`[WARMUP] Getting all warmup weights`);
        
        const result = await db.query(`
            SELECT ew.*, e.name as exercise_name, e.category
            FROM exercise_warmup_weights ew
            JOIN exercises e ON ew.exercise_id = e.exercise_id
            ORDER BY e.name
        `);
        
        console.log(`[WARMUP] Found ${result.rows.length} warmup weights`);
        res.json({
            success: true,
            warmup_weights: result.rows
        });
        
    } catch (error) {
        console.error('[WARMUP] Error getting all warmup weights:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get warmup weights',
            error: error.message 
        });
    }
});

module.exports = router;
