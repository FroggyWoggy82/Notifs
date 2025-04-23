// routes/compatibility-routes.js
const express = require('express');
const router = express.Router();

// This file provides compatibility routes for the original API endpoints
// that are used by the client-side code

// Route to get exercise preferences by ID (original path)
router.get('/exercise-preferences/:exerciseId', async (req, res) => {
  const { exerciseId } = req.params;
  console.log(`Received GET /api/exercise-preferences/${exerciseId} request - redirecting to new endpoint`);

  // Get the database connection from the global object
  const db = global.db;
  if (!db) {
    return res.status(500).json({ error: 'Database connection not available' });
  }

  try {
    // Check if the table exists first
    const tableCheck = await db.query("SELECT to_regclass('public.exercise_preferences') as exists");
    if (!tableCheck.rows[0].exists) {
      console.log('exercise_preferences table does not exist, returning default preferences');
      return res.json({
        exercise_id: parseInt(exerciseId),
        weight_unit: 'lbs' // Default unit
      });
    }

    const result = await db.query(
      'SELECT * FROM exercise_preferences WHERE exercise_id = $1',
      [exerciseId]
    );

    if (result.rows.length === 0) {
      // Return default preferences if none exist
      return res.json({
        exercise_id: parseInt(exerciseId),
        weight_unit: 'lbs' // Default unit
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching exercise preferences:', err);
    // Return default preferences on error
    res.json({
      exercise_id: parseInt(exerciseId),
      weight_unit: 'lbs' // Default unit
    });
  }
});

// Route to get last log for an exercise (original path)
router.get('/workouts/exercises/:id/lastlog', async (req, res) => {
  const { id: exerciseId } = req.params;
  console.log(`Received GET /api/workouts/exercises/${exerciseId}/lastlog request - redirecting to new endpoint`);

  // Get the database connection from the global object
  const db = global.db;
  if (!db) {
    return res.status(500).json({ error: 'Database connection not available' });
  }

  try {
    // Check if the tables exist first
    const exerciseLogsCheck = await db.query("SELECT to_regclass('public.exercise_logs') as exists");
    const workoutLogsCheck = await db.query("SELECT to_regclass('public.workout_logs') as exists");
    
    if (!exerciseLogsCheck.rows[0].exists || !workoutLogsCheck.rows[0].exists) {
      console.log('exercise_logs or workout_logs table does not exist, returning empty log');
      return res.status(404).json({ message: 'No previous log found for this exercise.' });
    }

    // Query exercise_logs joined with workout_logs to order by date_performed
    const query = `
        SELECT
            el.log_id,
            el.exercise_id,
            el.exercise_name,
            el.sets_completed,
            el.reps_completed,
            el.weight_used,
            el.weight_unit,
            el.notes,
            wl.log_id as workout_log_id,
            wl.workout_name,
            wl.date_performed
        FROM exercise_logs el
        JOIN workout_logs wl ON el.workout_log_id = wl.log_id
        WHERE el.exercise_id = $1
        ORDER BY wl.date_performed DESC
        LIMIT 1;
    `;
    const result = await db.query(query, [exerciseId]);

    if (result.rows.length > 0) {
      console.log(`Last log found for exercise ${exerciseId}:`, result.rows[0]);
      res.json(result.rows[0]); // Send the latest log data
    } else {
      console.log(`No previous logs found for exercise ${exerciseId}.`);
      res.status(404).json({ message: 'No previous log found for this exercise.' }); // Send 404 if no log exists
    }
  } catch (err) {
    console.error(`Error fetching last log for exercise ${exerciseId}:`, err);
    res.status(500).json({ error: 'Failed to fetch last exercise log' });
  }
});

module.exports = router;
