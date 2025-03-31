// routes/workouts.js
const express = require('express');
const db = require('../db'); // Assuming db setup is in ../db/index.js or similar
const router = express.Router();

// --- API Routes ---

// GET /api/workouts/exercises - Fetch all available exercises
router.get('/exercises', async (req, res) => {
    console.log("Received GET /api/workouts/exercises request");
    try {
        // Fetch necessary fields, order alphabetically for selection lists
        const result = await db.query('SELECT exercise_id, name, category FROM exercises ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching exercises:', err);
        res.status(500).json({ error: 'Failed to fetch exercises' });
    }
});

// GET /api/workouts/templates - Fetch all workout templates with their exercises
router.get('/templates', async (req, res) => {
    console.log("Received GET /api/workouts/templates request");
    try {
        // Use JSON aggregation to get exercises nested within each template
        const templatesQuery = `
            SELECT
                w.workout_id, w.name, w.description, w.created_at,
                COALESCE(json_agg(json_build_object(
                    'workout_exercise_id', we.workout_exercise_id,
                    'exercise_id', e.exercise_id,
                    'name', e.name,
                    'category', e.category,
                    'sets', we.sets,
                    'reps', we.reps,
                    'weight', we.weight,
                    'weight_unit', we.weight_unit,
                    'order_position', we.order_position,
                    'notes', we.notes
                ) ORDER BY we.order_position) FILTER (WHERE e.exercise_id IS NOT NULL), '[]') AS exercises
            FROM workouts w
            LEFT JOIN workout_exercises we ON w.workout_id = we.workout_id
            LEFT JOIN exercises e ON we.exercise_id = e.exercise_id
            WHERE w.is_template = true -- Ensure we only get templates
            GROUP BY w.workout_id, w.name, w.description, w.created_at
            ORDER BY w.name ASC;
        `;
        const result = await db.query(templatesQuery);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching workout templates:', err);
        res.status(500).json({ error: 'Failed to fetch workout templates' });
    }
});

// POST /api/workouts/log - Save a completed workout session
router.post('/log', async (req, res) => {
    // Expecting: workoutName, duration (ISO 8601 interval string like 'PT1H30M'), notes,
    // and exercises array: [{ exercise_id, exercise_name, sets_completed, reps_completed, weight_used, weight_unit, notes }]
    const { workoutName, duration, notes, exercises } = req.body;
    console.log(`Received POST /api/workouts/log request for workout: ${workoutName}`);

    // --- Basic Validation ---
    if (!workoutName || workoutName.trim() === '') {
        return res.status(400).json({ error: 'Workout name cannot be empty' });
    }
    if (!Array.isArray(exercises) || exercises.length === 0) {
        return res.status(400).json({ error: 'Workout must contain at least one logged exercise' });
    }
    // TODO: Add more robust validation for duration format, exercise content formats (reps_completed, weight_used)

    const client = await db.pool.connect();
    console.log('Log Workout: DB client acquired');
    try {
        await client.query('BEGIN');
        console.log('Log Workout: BEGIN transaction');

        // 1. Insert into workout_logs
        console.log('Log Workout: Inserting into workout_logs...');
        const logInsertResult = await client.query(
            'INSERT INTO workout_logs (workout_name, duration, notes) VALUES ($1, $2::interval, $3) RETURNING log_id',
            [workoutName.trim(), duration || null, notes || null] // Cast duration string to interval
        );
        const newLogId = logInsertResult.rows[0].log_id;
        console.log(`Log Workout: Inserted workout_log with ID: ${newLogId}`);

        // 2. Insert each exercise log linked to the new workout_log
        console.log(`Log Workout: Inserting ${exercises.length} exercise logs...`);
        for (const exLog of exercises) {
            if (!exLog.exercise_id || !exLog.exercise_name || exLog.sets_completed == null || !exLog.reps_completed) {
                 console.error('Invalid exercise log data:', exLog); // Log invalid data
                 throw new Error('Invalid exercise log data received.');
            }
            // Ensure numeric fields are numbers or null
            const setsCompleted = parseInt(exLog.sets_completed);
            const weightUsed = exLog.weight_used ? exLog.weight_used.toString() : null; // Ensure weight_used is string or null if provided

            if (isNaN(setsCompleted)) {
                throw new Error('Invalid sets_completed value.');
            }

            await client.query(
                `INSERT INTO exercise_logs
                    (workout_log_id, exercise_id, exercise_name, sets_completed, reps_completed, weight_used, weight_unit, notes)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    newLogId,
                    exLog.exercise_id,
                    exLog.exercise_name, // Store name used at time of logging
                    setsCompleted,
                    exLog.reps_completed, // Store as string '10,9,8'
                    weightUsed,         // Store as string '50,50,55' or null
                    exLog.weight_unit,
                    exLog.notes || null
                ]
            );
        }
        console.log('Log Workout: Finished inserting exercise logs.');

        // 3. Commit Transaction
        await client.query('COMMIT');
        console.log('Log Workout: COMMIT transaction');
        res.status(201).json({ message: 'Workout logged successfully', log_id: newLogId });

    } catch (err) {
        // 4. Rollback on any error
        console.error('Error during workout logging transaction, rolling back:', err);
        await client.query('ROLLBACK');
        console.log('Log Workout: ROLLBACK transaction');
        // Provide more specific error if possible
        res.status(500).json({ error: `Failed to log workout: ${err.message || 'Server error'}` });
    } finally {
        // 5. ALWAYS release the client
        if (client) {
            client.release();
            console.log('Log Workout: DB client released');
        }
    }
});

// POST /api/workouts/exercises - Create a new exercise definition
router.post('/exercises', async (req, res) => {
    const { name, category, description } = req.body;
    console.log(`Received POST /api/workouts/exercises: Name='${name}', Category='${category}'`);

    // Basic Validation
    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Exercise name cannot be empty' });
    }
    const validCategories = ['core', 'arms', 'shoulders', 'chest', 'legs', 'back', 'other'];
    if (!category || !validCategories.includes(category)) {
        return res.status(400).json({ error: 'Invalid category' });
    }

    try {
        const result = await db.query(
            'INSERT INTO exercises (name, category, description) VALUES ($1, $2, $3) RETURNING *',
            [name.trim(), category, description || null]
        );
        console.log('New exercise created:', result.rows[0]);
        res.status(201).json(result.rows[0]); // Return the newly created exercise
    } catch (err) {
        console.error('Error creating exercise:', err);
        // Handle potential unique constraint violation (duplicate name)
        if (err.code === '23505') { // PostgreSQL unique violation code
            return res.status(409).json({ error: `Exercise with name '${name.trim()}' already exists.` });
        }
        res.status(500).json({ error: 'Failed to create exercise' });
    }
});

// GET /api/workouts/exercises/:id/lastlog - Fetch the last logged performance for a specific exercise
router.get('/exercises/:id/lastlog', async (req, res) => {
    const { id: exerciseId } = req.params;
    console.log(`Received GET /api/workouts/exercises/${exerciseId}/lastlog request`);

    // Validate ID
    if (!/^[1-9]\d*$/.test(exerciseId)) {
        return res.status(400).json({ error: 'Invalid exercise ID format' });
    }

    try {
        // Query exercise_logs joined with workout_logs to order by date_performed
        const query = `
            SELECT
                el.reps_completed,
                el.weight_used,
                el.weight_unit,
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

// GET /api/workouts/exercises/:id/history - Fetch all log history for a specific exercise
router.get('/exercises/:id/history', async (req, res) => {
    const { id: exerciseId } = req.params;
    console.log(`Received GET /api/workouts/exercises/${exerciseId}/history request`);

    if (!/^[1-9]\d*$/.test(exerciseId)) {
        return res.status(400).json({ error: 'Invalid exercise ID format' });
    }

    try {
        // Fetch relevant log data, ordered by date
        const query = `
            SELECT
                wl.log_id AS workout_log_id,
                el.sets_completed,
                el.reps_completed, -- Comma-separated string e.g., "10,9,8"
                el.weight_used,   -- Comma-separated string e.g., "50,50,55"
                el.weight_unit,
                wl.date_performed
            FROM exercise_logs el
            JOIN workout_logs wl ON el.workout_log_id = wl.log_id
            WHERE el.exercise_id = $1
            ORDER BY wl.date_performed ASC; -- Order oldest to newest for charting
        `;
        const result = await db.query(query, [exerciseId]);

        // Send back all rows found
        console.log(`Found ${result.rows.length} history logs for exercise ${exerciseId}.`);
        res.json(result.rows);

    } catch (err) {
        console.error(`Error fetching history for exercise ${exerciseId}:`, err);
        res.status(500).json({ error: 'Failed to fetch exercise history' });
    }
});

// POST /api/workouts/log/manual - Manually add a historical exercise log entry
router.post('/log/manual', async (req, res) => {
    const { exercise_id, date_performed, reps_completed, weight_used, weight_unit, notes } = req.body;
    console.log(`Received POST /api/workouts/log/manual for exercise_id: ${exercise_id}`);

    // --- Basic Validation --- 
    if (!exercise_id || !date_performed || !reps_completed || !weight_used || !weight_unit) {
        return res.status(400).json({ error: 'Missing required fields (exercise_id, date_performed, reps_completed, weight_used, weight_unit)' });
    }
     // Potential further validation: check exercise_id exists, date format, reps/weight format?

    const client = await db.pool.connect();
    console.log('Manual Log: DB client acquired');
    try {
        await client.query('BEGIN');
        console.log('Manual Log: BEGIN transaction');

        // 1. Get exercise name for the workout log name
        const exerciseResult = await client.query('SELECT name FROM exercises WHERE exercise_id = $1', [exercise_id]);
        if (exerciseResult.rows.length === 0) {
            throw new Error(`Exercise with ID ${exercise_id} not found.`);
        }
        const exerciseName = exerciseResult.rows[0].name;
        const workoutName = `Manual Log - ${exerciseName}`; // Generic workout name

        // 2. Insert minimal workout_log entry
        console.log('Manual Log: Inserting into workout_logs...');
        const logInsertResult = await client.query(
            'INSERT INTO workout_logs (workout_name, date_performed, notes, duration) VALUES ($1, $2, $3, $4) RETURNING log_id',
            [workoutName, date_performed, `Manually added on ${new Date().toLocaleDateString()}`, null] // No duration
        );
        const newLogId = logInsertResult.rows[0].log_id;
        console.log(`Manual Log: Inserted workout_log with ID: ${newLogId}`);

        // 3. Calculate sets_completed (count comma-separated reps)
        const setsCompleted = reps_completed.split(',').length;

        // 4. Insert the exercise_log entry
        console.log('Manual Log: Inserting into exercise_logs...');
        await client.query(
            `INSERT INTO exercise_logs
                (workout_log_id, exercise_id, exercise_name, sets_completed, reps_completed, weight_used, weight_unit, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                newLogId,
                exercise_id,
                exerciseName, // Use fetched name
                setsCompleted,
                reps_completed, // Store as passed string
                weight_used,    // Store as passed string
                weight_unit,
                notes || null   // Optional notes
            ]
        );
        console.log('Manual Log: Finished inserting exercise_log.');

        // 5. Commit Transaction
        await client.query('COMMIT');
        console.log('Manual Log: COMMIT transaction');
        res.status(201).json({ message: 'Manual log added successfully', log_id: newLogId });

    } catch (err) {
        // 6. Rollback on any error
        console.error('Error during manual log insertion, rolling back:', err);
        // Ensure rollback happens before sending response
        if (client) {
            await client.query('ROLLBACK').catch(rbErr => console.error('Manual Log Rollback error:', rbErr));
        }
        console.log('Manual Log: ROLLBACK transaction');
        res.status(500).json({ error: `Failed to add manual log: ${err.message || 'Server error'}` });
    } finally {
        // 7. ALWAYS release the client
        if (client) {
            client.release();
            console.log('Manual Log: DB client released');
        }
    }
});

// --- Template Management Routes ---

// POST /api/workouts/templates - Create new template
router.post('/templates', async (req, res) => {
    // Expecting: name, description (optional), exercises: [{ exercise_id, sets, reps, weight, weight_unit, order_position, notes }]
    const { name, description, exercises } = req.body;
    console.log(`Received POST /api/workouts/templates request: Name='${name}'`);

    // --- Validation ---
    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Template name cannot be empty' });
    }
    if (!Array.isArray(exercises)) { // Allow empty templates for now
        return res.status(400).json({ error: 'Exercises must be an array' });
    }

    const client = await db.pool.connect();
    console.log('Create Template: DB client acquired');
    try {
        await client.query('BEGIN');
        console.log('Create Template: BEGIN transaction');

        // 1. Insert into workouts table
        console.log('Create Template: Inserting into workouts...');
        const workoutInsertResult = await client.query(
            'INSERT INTO workouts (name, description, is_template) VALUES ($1, $2, true) RETURNING workout_id',
            [name.trim(), description || null]
        );
        const newWorkoutId = workoutInsertResult.rows[0].workout_id;
        console.log(`Create Template: Inserted workout with ID: ${newWorkoutId}`);

        // 2. Insert each exercise into workout_exercises linked to the new workout
        console.log(`Create Template: Inserting ${exercises.length} workout_exercises...`);
        for (const exercise of exercises) {
            // Validate required fields for each exercise
            // RELAXED VALIDATION: Only require exercise_id and order_position for template structure
            if (exercise.exercise_id == null /*|| exercise.sets == null || !exercise.reps*/ || exercise.order_position == null) {
                // throw new Error('Invalid exercise data within template. Required: exercise_id, sets, reps, order_position.');
                throw new Error('Invalid exercise data within template. Required: exercise_id, order_position.');
            }
             // Ensure numbers are valid IF PROVIDED, otherwise use defaults
             const sets = parseInt(exercise.sets) || 1; // Default to 1 set if not provided/invalid
             const order_position = parseInt(exercise.order_position);
             const weight = exercise.weight != null ? parseFloat(exercise.weight) : null;
             // REMOVED strict check for sets > 0 for template definition
             if (isNaN(order_position)) {
                  throw new Error('Invalid numeric value for order_position.');
             }
             if (exercise.weight != null && isNaN(weight)) {
                 throw new Error('Invalid numeric value for weight.');
             }

            await client.query(
                `INSERT INTO workout_exercises
                    (workout_id, exercise_id, sets, reps, weight, weight_unit, order_position, notes)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    newWorkoutId,
                    exercise.exercise_id,
                    sets, // Use parsed sets or default 1
                    exercise.reps || '', // Default to empty string if not provided
                    weight, // Use parsed weight or null
                    exercise.weight_unit || 'kg', // Default unit
                    order_position,
                    exercise.notes || null // Default notes to null
                ]
            );
        }
        console.log('Create Template: Finished inserting workout_exercises.');

        // 3. Commit Transaction
        await client.query('COMMIT');
        console.log('Create Template: COMMIT transaction');
        // Return the newly created template ID and potentially the full object
        res.status(201).json({ message: 'Workout template created successfully', workout_id: newWorkoutId });

    } catch (err) {
        // 4. Rollback on any error
        console.error('Error during template creation transaction, rolling back:', err);
        await client.query('ROLLBACK');
        console.log('Create Template: ROLLBACK transaction');
        res.status(500).json({ error: `Failed to create template: ${err.message || 'Server error'}` });
    } finally {
        // 5. ALWAYS release the client
        if (client) {
            client.release();
            console.log('Create Template: DB client released');
        }
    }
});

// PUT /api/workouts/templates/:id - Update template
router.put('/templates/:id', async (req, res) => {
    const { id: templateId } = req.params;
    const { name, description, exercises } = req.body;
    console.log(`Received PUT /api/workouts/templates/${templateId} request: Name='${name}'`);

    // --- Validation ---
     if (!/^[1-9]\d*$/.test(templateId)) {
         return res.status(400).json({ error: 'Invalid template ID format' });
     }
    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Template name cannot be empty' });
    }
    if (!Array.isArray(exercises)) { // Allow empty templates
        return res.status(400).json({ error: 'Exercises must be an array' });
    }

    const client = await db.pool.connect();
    console.log(`Update Template ${templateId}: DB client acquired`);
    try {
        await client.query('BEGIN');
        console.log(`Update Template ${templateId}: BEGIN transaction`);

        // 1. Update the workouts table
        console.log(`Update Template ${templateId}: Updating workout details...`);
        const updateWorkoutResult = await client.query(
            'UPDATE workouts SET name = $1, description = $2 WHERE workout_id = $3 AND is_template = true RETURNING workout_id',
            [name.trim(), description || null, templateId]
        );

        // Check if the template existed and was updated
        if (updateWorkoutResult.rowCount === 0) {
             console.log(`Update Template ${templateId}: Template not found or not a template.`);
             // Rollback before throwing error
             await client.query('ROLLBACK');
             return res.status(404).json({ error: 'Template not found or cannot be updated.' });
        }

        // 2. Delete existing exercises for this template
        console.log(`Update Template ${templateId}: Deleting existing workout_exercises...`);
        await client.query('DELETE FROM workout_exercises WHERE workout_id = $1', [templateId]);

        // 3. Insert the new set of exercises
        console.log(`Update Template ${templateId}: Inserting ${exercises.length} new workout_exercises...`);
        for (const exercise of exercises) {
            if (exercise.exercise_id == null || exercise.order_position == null) {
                throw new Error('Invalid exercise data within template. Required: exercise_id, order_position.');
            }
            // Ensure numbers are valid IF PROVIDED, otherwise use defaults
            const sets = parseInt(exercise.sets) || 1;
            const order_position = parseInt(exercise.order_position);
            const weight = exercise.weight != null ? parseFloat(exercise.weight) : null;
            if (isNaN(order_position)) {
                 throw new Error('Invalid numeric value for order_position.');
            }
             if (exercise.weight != null && isNaN(weight)) {
                 throw new Error('Invalid numeric value for weight.');
             }

            await client.query(
                `INSERT INTO workout_exercises
                    (workout_id, exercise_id, sets, reps, weight, weight_unit, order_position, notes)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    templateId, // Use the ID from the route param
                    exercise.exercise_id,
                    sets,
                    exercise.reps || '',
                    weight,
                    exercise.weight_unit || 'kg',
                    order_position,
                    exercise.notes || null
                ]
            );
        }
        console.log(`Update Template ${templateId}: Finished inserting workout_exercises.`);

        // 4. Commit Transaction
        await client.query('COMMIT');
        console.log(`Update Template ${templateId}: COMMIT transaction`);
        res.status(200).json({ message: 'Workout template updated successfully', workout_id: parseInt(templateId) });

    } catch (err) {
        // 5. Rollback on any error
        console.error(`Error during template update ${templateId}, rolling back:`, err);
        // Ensure rollback happens before sending response
         if (client) {
             await client.query('ROLLBACK').catch(rbErr => console.error('Rollback error:', rbErr));
         }
        console.log(`Update Template ${templateId}: ROLLBACK transaction`);
        res.status(500).json({ error: `Failed to update template: ${err.message || 'Server error'}` });
    } finally {
        // 6. ALWAYS release the client
        if (client) {
            client.release();
            console.log(`Update Template ${templateId}: DB client released`);
        }
    }
});

// DELETE /api/workouts/templates/:id - Delete template
router.delete('/templates/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`Received DELETE /api/workouts/templates/${id}`);

    // Validate ID format
    if (!/^[1-9]\d*$/.test(id)) {
        return res.status(400).json({ error: 'Invalid template ID format' });
    }

    try {
        // is_template = true check ensures we only delete templates, not potentially logged workouts if schema changes
        const result = await db.query('DELETE FROM workouts WHERE workout_id = $1 AND is_template = true RETURNING workout_id', [id]);

        if (result.rowCount === 0) {
            console.log(`Delete Template: Template ${id} not found or not a template.`);
            return res.status(404).json({ error: 'Template not found' });
        }

        console.log(`Template ${id} deleted successfully.`);
        res.status(200).json({ message: `Template ${id} deleted successfully`, id: parseInt(id) });

    } catch (err) {
        console.error(`Error deleting template ${id}:`, err);
        res.status(500).json({ error: 'Failed to delete template' });
    }
});

// DELETE /api/workouts/logs/:id - Delete a specific workout log entry
router.delete('/logs/:id', async (req, res) => {
    const { id: workoutLogId } = req.params;
    console.log(`Received DELETE /api/workouts/logs/${workoutLogId}`);

    if (!/^[1-9]\d*$/.test(workoutLogId)) {
        return res.status(400).json({ error: 'Invalid log ID format' });
    }

    try {
        // Deleting from workout_logs should cascade to exercise_logs if FK constraint is set up with ON DELETE CASCADE
        // Otherwise, you would need to delete from exercise_logs first in a transaction.
        const result = await db.query('DELETE FROM workout_logs WHERE log_id = $1 RETURNING log_id', [workoutLogId]);

        if (result.rowCount === 0) {
            console.log(`Delete Log: Log ID ${workoutLogId} not found.`);
            return res.status(404).json({ error: 'Log entry not found' });
        }

        console.log(`Workout Log ${workoutLogId} deleted successfully.`);
        res.status(200).json({ message: `Log entry ${workoutLogId} deleted successfully`, id: parseInt(workoutLogId) });

    } catch (err) {
        console.error(`Error deleting workout log ${workoutLogId}:`, err);
         // Handle potential foreign key constraints if cascade delete is not set
        if (err.code === '23503') { // Foreign key violation
            return res.status(409).json({ error: 'Cannot delete log entry due to related data. Ensure cascade delete is configured or delete related exercise logs first.' });
        }
        res.status(500).json({ error: 'Failed to delete log entry' });
    }
});

// --- TODO: History Route ---

// GET /api/workouts/logs - Fetch workout history (maybe paginated)
// router.get('/logs', async (req, res) => { ... });


module.exports = router;