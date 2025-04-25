// routes/exercisePreferences.js
const express = require('express');
const db = require('../utils/db');
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
                weight_unit: 'lbs', // Default unit changed to lbs
                weight_increment: 5, // Default weight increment
                default_reps: null // Default reps is null initially
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
    const { exerciseId, weightUnit, weightIncrement, defaultReps } = req.body;
    console.log(`Received POST /api/exercise-preferences: exerciseId=${exerciseId}, weightUnit=${weightUnit}, weightIncrement=${weightIncrement}, defaultReps=${defaultReps}`);

    // Validation
    if (!exerciseId || !/^\d+$/.test(exerciseId)) {
        return res.status(400).json({ error: 'Invalid exercise ID' });
    }

    const validUnits = ['kg', 'lbs', 'bodyweight', 'assisted'];
    if (!weightUnit || !validUnits.includes(weightUnit)) {
        return res.status(400).json({ error: 'Invalid weight unit' });
    }

    // Parse and validate weight increment
    let parsedWeightIncrement = 5; // Default value
    if (weightIncrement !== undefined) {
        parsedWeightIncrement = parseFloat(weightIncrement);
        if (isNaN(parsedWeightIncrement) || parsedWeightIncrement <= 0) {
            return res.status(400).json({ error: 'Invalid weight increment. Must be a positive number.' });
        }
    }

    // Validate defaultReps (can be null or a string)
    const repsValue = defaultReps === undefined ? null : defaultReps;

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
                'UPDATE exercise_preferences SET weight_unit = $1, weight_increment = $2, default_reps = $3, updated_at = NOW() WHERE exercise_id = $4 RETURNING *',
                [weightUnit, parsedWeightIncrement, repsValue, exerciseId]
            );
        } else {
            // Insert new preference
            result = await db.query(
                'INSERT INTO exercise_preferences (exercise_id, weight_unit, weight_increment, default_reps) VALUES ($1, $2, $3, $4) RETURNING *',
                [exerciseId, weightUnit, parsedWeightIncrement, repsValue]
            );
        }

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error saving exercise preferences:', err);
        res.status(500).json({ error: 'Failed to save exercise preferences' });
    }
});

module.exports = router;
