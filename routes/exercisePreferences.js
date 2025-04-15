// routes/exercisePreferences.js
const express = require('express');
const db = require('../db');
const router = express.Router();

// GET /api/exercise-preferences/:exerciseId - Get preferences for a specific exercise
router.get('/:exerciseId', async (req, res) => {
    const { exerciseId } = req.params;
    console.log(`Received GET /api/exercise-preferences/${exerciseId} request`);
    
    if (!/^\d+$/.test(exerciseId)) {
        return res.status(400).json({ error: 'Invalid exercise ID format' });
    }
    
    try {
        const result = await db.query(
            'SELECT * FROM exercise_preferences WHERE exercise_id = $1',
            [exerciseId]
        );
        
        if (result.rows.length === 0) {
            // Return default preferences if none exist
            return res.json({ 
                exercise_id: parseInt(exerciseId),
                weight_unit: 'kg' // Default unit
            });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching exercise preferences:', err);
        res.status(500).json({ error: 'Failed to fetch exercise preferences' });
    }
});

// POST /api/exercise-preferences - Save preferences for an exercise
router.post('/', async (req, res) => {
    const { exerciseId, weightUnit } = req.body;
    console.log(`Received POST /api/exercise-preferences: exerciseId=${exerciseId}, weightUnit=${weightUnit}`);
    
    // Validation
    if (!exerciseId || !/^\d+$/.test(exerciseId)) {
        return res.status(400).json({ error: 'Invalid exercise ID' });
    }
    
    const validUnits = ['kg', 'lbs', 'bodyweight', 'assisted'];
    if (!weightUnit || !validUnits.includes(weightUnit)) {
        return res.status(400).json({ error: 'Invalid weight unit' });
    }
    
    try {
        // Check if preference already exists
        const checkResult = await db.query(
            'SELECT preference_id FROM exercise_preferences WHERE exercise_id = $1',
            [exerciseId]
        );
        
        let result;
        if (checkResult.rows.length > 0) {
            // Update existing preference
            result = await db.query(
                'UPDATE exercise_preferences SET weight_unit = $1, updated_at = NOW() WHERE exercise_id = $2 RETURNING *',
                [weightUnit, exerciseId]
            );
        } else {
            // Insert new preference
            result = await db.query(
                'INSERT INTO exercise_preferences (exercise_id, weight_unit) VALUES ($1, $2) RETURNING *',
                [exerciseId, weightUnit]
            );
        }
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error saving exercise preferences:', err);
        res.status(500).json({ error: 'Failed to save exercise preferences' });
    }
});

module.exports = router;
