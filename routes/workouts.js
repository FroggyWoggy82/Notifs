// routes/workouts.js
const express = require('express');
const db = require('../db'); // Assuming db setup is in ../db/index.js or similar
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Required for checking directory existence
const sharp = require('sharp'); // <<< ADDED: Require sharp

// --- Multer Configuration for Progress Photos ---
const progressPhotosDir = path.join(__dirname, '..', 'public', 'uploads', 'progress_photos');
const MAX_FILE_SIZE_MB = 25;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Ensure the upload directory exists
if (!fs.existsSync(progressPhotosDir)){
    console.log(`Creating directory: ${progressPhotosDir}`);
    fs.mkdirSync(progressPhotosDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(`[Multer Storage] Destination function called for file: ${file.originalname}`);
        cb(null, progressPhotosDir); // Use the absolute path
        console.log(`[Multer Storage] Destination set to: ${progressPhotosDir}`);
    },
    filename: function (req, file, cb) {
        console.log(`[Multer Storage] Filename function called for file: ${file.originalname}`);
        // Create a unique filename: fieldname-timestamp.extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const finalFilename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
        cb(null, finalFilename);
        console.log(`[Multer Storage] Filename generated: ${finalFilename}`);
    }
});

const fileFilter = (req, file, cb) => {
    console.log(`[Multer File Filter] Checking file: ${file.originalname}, MIME: ${file.mimetype}`);
    // Define allowed extensions (case-insensitive)
    const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif|\.heic)$/i;

    // Check 1: MIME type starts with 'image/'
    const isMimeTypeImage = file.mimetype.startsWith('image/');
    // Check 2: File extension is in the allowed list
    const hasAllowedExtension = allowedExtensions.test(path.extname(file.originalname));

    if (isMimeTypeImage || hasAllowedExtension) {
        // Accept if either condition is true
        console.log(`[Multer File Filter] Accepting file: ${file.originalname} (MIME: ${file.mimetype}, Extension OK: ${hasAllowedExtension})`);
        cb(null, true);
    } else {
        // Reject if neither condition is true
        console.warn(`[Multer File Filter] Rejected file: ${file.originalname} (MIME type: ${file.mimetype}, Extension check failed)`);
        cb(new Error('Invalid file type. Only JPG, PNG, GIF, HEIC images are allowed.'), false);
    }
};

// Configure Multer with limits
console.log(`[Server Config] Multer configured with file size limit: ${MAX_FILE_SIZE_MB} MB`);
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE_BYTES // Set file size limit
    }
});

// <<< NEW: Multer Error Handling Middleware >>>
function handleMulterError(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        console.error('--- Multer Error Handler Caught ---');
        console.error('Multer Error Code:', err.code);
        console.error('Multer Error Message:', err.message);
        console.error('Field:', err.field); // Which field caused the error?
        console.error('--- End Multer Error ---');
        // Provide specific feedback based on the error code
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.` });
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ error: 'Unexpected file field.' });
        }
        // Generic Multer error
        return res.status(500).json({ error: `File upload error: ${err.message}` });
    } else if (err) {
        // An unknown error occurred when uploading.
        console.error('--- Non-Multer Error During Upload Caught by Multer Handler ---');
        console.error('Error Status:', err.status);
        console.error('Error Message:', err.message);
        console.error('Error Stack:', err.stack);
        console.error('--- End Non-Multer Error ---');
        return res.status(500).json({ error: 'An unexpected error occurred during file upload.' });
    }
    // Everything went fine, pass control to the next handler
    next();
}

// Use upload.array('photos', 10) to accept up to 10 files with the field name 'photos'
const uploadPhotosMiddleware = upload.array('photos', 10); // Match the input name attribute

// <<< NEW: Middleware to log request arrival before Multer >>>
const traceMiddleware = (req, res, next) => {
    console.log(`[Trace Middleware] Request received for ${req.method} ${req.path} from ${req.ip}`);
    next(); // Pass control to the next middleware (Multer)
};

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

// --- Progress Photo Routes ---

// POST /api/progress-photos - Upload new progress photos
// Add traceMiddleware BEFORE uploadPhotosMiddleware
// ADD handleMulterError AFTER uploadPhotosMiddleware
router.post('/progress-photos', traceMiddleware, uploadPhotosMiddleware, handleMulterError, async (req, res) => {
    console.log('[Upload Trace] === Route Handler START ===');
    // <<< DEBUG LOGS AT THE START >>>
    console.log('[DEBUG] req.body immediately after multer:', JSON.stringify(req.body));
    console.log('[DEBUG] req.files immediately after multer:', req.files ? req.files.length : 'undefined');
    // <<< END DEBUG LOGS >>>

    // --- Check for Multer errors attached to req (might not happen if Multer crashes earlier) ---
    console.log('[Upload Trace] Checking for Multer errors...');
    // Note: Multer typically calls the callback with an error, but if used as middleware,
    // it might attach error details to `req` or require an error-handling middleware.
    // This is an attempt to catch errors if the structure allows.
    if (req.fileValidationError) { // Custom error from fileFilter?
        console.error('[Photo Upload Route] File validation error detected:', req.fileValidationError);
        return res.status(400).json({ error: req.fileValidationError });
    }
    // Multer might add other error properties, check common patterns
    if (req.multerError) {
        console.error('[Photo Upload Route] Multer error detected on req:', req.multerError.code || req.multerError.message);
        if (req.multerError.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.` });
        }
        return res.status(500).json({ error: `File upload error: ${req.multerError.message}` });
    }
    // --- End error checking ---
    console.log('[Upload Trace] Finished checking Multer errors.');

    // --- Main logic, previously inside the callback ---
    const { 'photo-date': date } = req.body;
    const files = req.files;

    console.log(`[Photo Upload Route Handler] Processing request. Date: ${date}`);
    console.log(`[Photo Upload Route Handler] Entered main handler AFTER Multer middleware.`);

    console.log('[Upload Trace] Validating date and files...');
    if (!date) {
        console.error('[Photo Upload Route Handler] Error: Date is required.');
        return res.status(400).json({ error: 'Date is required.' });
    }
    // If Multer finished but found no files, req.files will be empty.
    if (!files || files.length === 0) {
        console.error('[Photo Upload Route Handler] Error: No photos found in request files.');
        // Don't return 400 immediately, as Multer might have already handled an error.
        // If we reached here without files and without a prior Multer error logged,
        // it's potentially an issue, but let's rely on the earlier checks or client validation.
        // We might have already sent a response if a Multer error occurred.
        // Let's assume if we got here, it's unexpected.
        if (!res.headersSent) { // Only send if no response sent yet
             console.log('[Upload Trace] Sending 400: No photo files were processed.');
             return res.status(400).json({ error: 'No photo files were processed.' });
        }
        return; // Avoid further processing if headers already sent
    }
    console.log('[Upload Trace] Date and files validation passed.');

    // <<< UPDATED: Convert All Images to JPG Format >>>
    if (req.files && req.files.length > 0) {
        console.log('[Upload Conversion] Starting image conversion to JPG...');
        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const originalPath = file.path; // Full path to the initially saved file
            const fileExtension = path.extname(file.originalname).toLowerCase();
            const originalMimeType = file.mimetype;

            // Process all files, including JPEG files
            // We want to standardize all images to .jpg extension

            // Add special handling for .jpeg files
            if (fileExtension === '.jpeg') {
                console.log(`[Upload Conversion] Found .jpeg file, ensuring consistent handling: ${file.originalname}`);
                // Check if client sent special flag for JPEG files
                if (req.body.fileType === 'jpeg') {
                    console.log(`[Upload Conversion] Client indicated special JPEG handling needed`);
                }
            } else if (fileExtension === '.jpg') {
                console.log(`[Upload Conversion] Found .jpg file: ${file.originalname}`);
            }

            // Log file size for debugging
            const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
            console.log(`[Upload Conversion] File size: ${fileSizeInMB} MB`);

            // For very large files, log a warning
            if (file.size > 5 * 1024 * 1024) { // 5MB
                console.log(`[Upload Conversion] Warning: Large file (${fileSizeInMB} MB) may take longer to process`);
            }

            console.log(`[Upload Conversion] Converting file: ${file.originalname} (${originalMimeType}) to JPG format`);
            const jpgFilename = path.basename(file.filename, fileExtension) + '.jpg'; // Create new filename with .jpg extension
            const jpgPath = path.join(path.dirname(originalPath), jpgFilename); // Full path for JPG output
            // Prepare for conversion

            try {
                console.log(`[Upload Conversion] Converting ${originalPath} to ${jpgPath}...`);

                // Special handling for JPEG files
                if (fileExtension === '.jpeg' || req.body.fileType === 'jpeg') {
                    console.log(`[Upload Conversion] Using special JPEG handling`);

                    // Use a more conservative approach for JPEG files
                    await sharp(originalPath)
                        .jpeg({ quality: 80, progressive: true }) // Lower quality, progressive encoding
                        .withMetadata() // Preserve metadata
                        .toFile(jpgPath);
                } else {
                    // Standard conversion for other files
                    await sharp(originalPath)
                        .jpeg({ quality: 85 }) // Standard quality
                        .toFile(jpgPath);
                }

                console.log(`[Upload Conversion] Conversion successful: ${jpgPath}`);
                // Conversion successful

                // Update the file object to reflect the new JPG file
                req.files[i].filename = jpgFilename; // Update filename
                req.files[i].path = jpgPath;         // Update path (though we use relative path later)
                req.files[i].mimetype = 'image/jpeg'; // Update mimetype
                req.files[i].size = fs.statSync(jpgPath).size; // Update size

                // Only delete original if conversion succeeded
                try {
                    fs.unlinkSync(originalPath);
                    console.log(`[Upload Conversion] Deleted original file: ${originalPath}`);
                } catch (unlinkErr) {
                    console.error(`[Upload Conversion] Error deleting original file ${originalPath} after successful conversion:`, unlinkErr);
                }

            } catch (conversionError) {
                console.error(`[Upload Conversion] Error converting file ${file.originalname} to JPG:`, conversionError);
                // Log error but KEEP the original file in req.files
                console.warn(`[Upload Conversion] Failed to convert ${file.originalname}. Keeping original file entry.`);
            }
        }
        console.log('[Upload Conversion] Finished image conversion to JPG.');
        // Log final state of req.files after conversions
        console.log('[DEBUG] req.files AFTER conversion loop:', req.files ? req.files.map(f => ({ name: f.filename, path: f.path, mime: f.mimetype })) : 'undefined');
    }
    // <<< END UPDATED: Convert All Images to JPG Format >>>

    // Filter out any files that might have been removed during conversion failure
    const filesToProcess = req.files ? req.files.filter(file => file) : [];

    // Check if there are any valid files left to process after conversion attempts
    if (filesToProcess.length === 0) {
        console.error('[Photo Upload Route Handler] Error: No valid photos left after conversion attempts.');
        if (!res.headersSent) {
            return res.status(400).json({ error: 'No valid photos could be processed.' });
        }
        return;
    }

    console.log(`[Photo Upload Route Handler] Proceeding with DB operations for ${filesToProcess.length} valid photos.`);

    let client; // Define client outside try block
    console.log('[Upload Trace] Attempting to connect to DB...');
    try {
        client = await db.pool.connect(); // Assign client here
        console.log('[Photo Upload Route Handler] DB Client acquired.');
        console.log('[Upload Trace] Attempting DB transaction BEGIN...');
        await client.query('BEGIN');
        console.log('[Photo Upload Route Handler] DB Transaction BEGIN.');

        const insertedPhotos = [];
        console.log(`[Upload Trace] Starting loop for ${filesToProcess.length} valid files...`); // Updated log
        for (const file of filesToProcess) { // <<< Use filesToProcess array
            // Construct relative path using the potentially updated filename
            const relativePath = `/uploads/progress_photos/${file.filename}`; // <<< Use file.filename
            console.log(`[Upload Trace] Processing file: ${file.filename}`);
            console.log(`[Photo Upload Route Handler] Inserting DB record for: ${relativePath}, Date: ${date}`);

            // Add logging for file details
            console.log(`[Upload Trace] File details: name=${file.originalname}, mimetype=${file.mimetype}, size=${file.size}`);

            console.log('[Upload Trace] Executing INSERT query...');
            const result = await client.query(
                'INSERT INTO progress_photos (date_taken, file_path) VALUES ($1, $2) RETURNING photo_id, date_taken, file_path',
                [date, relativePath]
            );
            insertedPhotos.push(result.rows[0]);
            console.log(`[Upload Trace] Inserted photo ID: ${result.rows[0].photo_id}`);
        }
        console.log('[Upload Trace] Finished file loop.');

        console.log('[Upload Trace] Attempting DB transaction COMMIT...');
        await client.query('COMMIT');
        console.log('[Photo Upload Route Handler] DB Transaction COMMIT successful.');
        // Ensure response isn't sent twice
        if (!res.headersSent) {
            console.log('[Upload Trace] Sending 201 success response...');
             // <<< Updated: Return the data for the *processed* files >>>
             const responsePhotos = insertedPhotos.map((dbRecord, index) => ({
                ...dbRecord, // Include photo_id, date_taken, file_path from DB
                originalName: filesToProcess[index].originalname, // <<< Use filesToProcess
                mimeType: filesToProcess[index].mimetype // <<< Use filesToProcess
            }));
            res.status(201).json({ message: `Successfully uploaded and processed ${responsePhotos.length} files!`, photos: responsePhotos });
            console.log('[Upload Trace] Success response sent.');
        }

    } catch (dbErr) {
        console.error('[Upload Trace] === ERROR Block Entered ===');
        console.error('[Photo Upload Route Handler] Database Error during photo upload transaction:', dbErr.message, dbErr.stack);
        try {
            console.log('[Upload Trace] Attempting DB transaction ROLLBACK...');
            await client.query('ROLLBACK');
            console.log('[Photo Upload Route Handler] DB Transaction ROLLBACK successful.');
        } catch (rbErr) {
             console.error('[Upload Trace] Error during ROLLBACK:', rbErr);
             console.error('[Photo Upload Route Handler] Error during ROLLBACK after initial error:', rbErr);
        }

        // Check if files exist before attempting deletion
        if (filesToProcess && filesToProcess.length > 0) { // <<< Use filesToProcess
            console.log('[Upload Trace] Attempting file cleanup due to DB error...');
            console.log('[Photo Upload Route Handler] Attempting to delete uploaded files due to DB error...');
            filesToProcess.forEach(file => { // <<< Use filesToProcess
                if (file && file.path) { // Add check for file.path (should be updated path for converted files)
                    fs.unlink(file.path, unlinkErr => {
                        if (unlinkErr) console.error(`[Photo Upload Route Handler] Error deleting file ${file.path} after DB error:`, unlinkErr);
                        else console.log(`[Photo Upload Route Handler] Deleted orphaned file: ${file.path}`);
                    });
                } else {
                     console.warn('[Upload Trace] Skipping file cleanup - file or file.path missing.');
                }
            });
        } else {
            console.warn('[Upload Trace] Skipping file cleanup - no files object available.');
            console.warn('[Photo Upload Route Handler] Skipping file deletion: No files object available after DB error.');
        }

        // Ensure response isn't sent twice
        if (!res.headersSent) {
             console.log('[Upload Trace] Sending 500 error response...');
            res.status(500).json({ error: 'Database error saving photo information.' });
             console.log('[Upload Trace] Error response sent.');
        }
    } finally {
        console.log('[Upload Trace] === FINALLY Block Entered ===');
        if (client) { // Check if client was successfully assigned
            client.release();
            console.log('[Photo Upload Route Handler] DB Client released.');
        } else {
             console.log('[Upload Trace] DB Client was not acquired, skipping release.');
        }
        console.log('[Upload Trace] === Route Handler END ===');
    }
});

// GET /api/progress-photos - Fetch all progress photo records
router.get('/progress-photos', async (req, res) => {
    console.log("Received GET /api/progress-photos request");
    try {
        // Fetch records, ordered by date taken (most recent first)
        const result = await db.query(
            'SELECT photo_id, date_taken, file_path, uploaded_at FROM progress_photos ORDER BY date_taken DESC, uploaded_at DESC'
        );
        // Map date_taken to YYYY-MM-DD format for consistency if needed
        const photos = result.rows.map(photo => ({
            ...photo,
            date_taken: new Date(photo.date_taken).toISOString().split('T')[0] // Format as YYYY-MM-DD
        }));

        res.json(photos);
    } catch (err) {
        console.error('Error fetching progress photos:', err);
        res.status(500).json({ error: 'Failed to fetch progress photos' });
    }
});

// DELETE /api/progress-photos/:photo_id - Delete a specific photo
router.delete('/progress-photos/:photo_id', async (req, res) => {
    const { photo_id } = req.params;
    console.log(`Received DELETE /api/workouts/progress-photos/${photo_id}`);

    if (!/^[1-9]\d*$/.test(photo_id)) {
        return res.status(400).json({ error: 'Invalid photo ID format' });
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Find the photo record to get the file path
        const selectResult = await client.query('SELECT file_path FROM progress_photos WHERE photo_id = $1', [photo_id]);
        if (selectResult.rowCount === 0) {
            await client.query('ROLLBACK'); // No record found, rollback
            return res.status(404).json({ error: 'Photo not found' });
        }
        const relativeFilePath = selectResult.rows[0].file_path;
        const absoluteFilePath = path.join(__dirname, '..', 'public', relativeFilePath);

        // 2. Delete the photo record from the database
        const deleteResult = await client.query('DELETE FROM progress_photos WHERE photo_id = $1 RETURNING photo_id', [photo_id]);
        if (deleteResult.rowCount === 0) {
             // Should not happen if select worked, but good practice
             await client.query('ROLLBACK');
             return res.status(404).json({ error: 'Photo not found during delete attempt' });
        }

        // 3. Delete the actual file from the filesystem
        try {
            if (fs.existsSync(absoluteFilePath)) {
                fs.unlinkSync(absoluteFilePath);
                console.log(`Deleted file: ${absoluteFilePath}`);
            } else {
                console.warn(`File not found for deletion, but DB record removed: ${absoluteFilePath}`);
            }
        } catch (fileErr) {
            // Log the file deletion error, but COMMIT the DB change anyway
            // as the primary goal is removing the DB record.
            // Alternatively, you could ROLLBACK here if file deletion MUST succeed.
            console.error(`Error deleting file ${absoluteFilePath}, but DB record was deleted:`, fileErr);
        }

        // 4. Commit the transaction
        await client.query('COMMIT');
        console.log(`Progress Photo ${photo_id} deleted successfully.`);
        res.status(200).json({ message: `Photo ${photo_id} deleted successfully`, id: parseInt(photo_id) });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(`Error deleting progress photo ${photo_id}:`, err);
        res.status(500).json({ error: 'Failed to delete photo' });
    } finally {
        client.release();
    }
});

// --- TODO: History Route ---

// GET /api/workouts/logs - Fetch workout history (maybe paginated)
// router.get('/logs', async (req, res) => { ... });


module.exports = router;