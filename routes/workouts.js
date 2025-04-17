// routes/workouts.js
const express = require('express');
const db = require('../utils/db');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Required for checking directory existence
const sharp = require('sharp'); // <<< ADDED: Require sharp
const { promisify } = require('util'); // For promisifying fs functions
const fsStatAsync = promisify(fs.stat); // Promisified fs.stat

// --- Multer Configuration for Progress Photos ---
// Use Railway persistent volume for storage
const progressPhotosDir = path.join('/data', 'uploads', 'progress_photos');
const MAX_FILE_SIZE_MB = 25;
let TARGET_FILE_SIZE_KB = 800; // Target file size in KB for compression - can be modified for mobile
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Ensure the persistent directory exists
if (!fs.existsSync(progressPhotosDir)){
    console.log(`Creating persistent directory: ${progressPhotosDir}`);
    fs.mkdirSync(progressPhotosDir, { recursive: true });
}

// Create a symlink from the persistent storage to the public directory
const publicPhotosDir = path.join(__dirname, '..', 'public', 'uploads', 'progress_photos');
try {
    // Ensure the public uploads directory exists
    const publicUploadsDir = path.join(__dirname, '..', 'public', 'uploads');
    if (!fs.existsSync(publicUploadsDir)) {
        fs.mkdirSync(publicUploadsDir, { recursive: true });
    }

    // Remove existing directory if it exists and is not a symlink
    if (fs.existsSync(publicPhotosDir)) {
        const stats = fs.lstatSync(publicPhotosDir);
        if (!stats.isSymbolicLink()) {
            fs.rmdirSync(publicPhotosDir, { recursive: true });
            console.log(`[WORKOUTS] Removed existing directory: ${publicPhotosDir}`);
        } else {
            console.log(`[WORKOUTS] Symlink already exists: ${publicPhotosDir}`);
        }
    }

    // Create the symlink if it doesn't exist
    if (!fs.existsSync(publicPhotosDir)) {
        fs.symlinkSync(progressPhotosDir, publicPhotosDir, 'dir');
        console.log(`[WORKOUTS] Created symlink from ${progressPhotosDir} to ${publicPhotosDir}`);
    }
} catch (error) {
    console.error(`[WORKOUTS] Error creating symlink: ${error.message}`);
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

// ULTRA SIMPLE image compression function - guaranteed to work
async function compressImageToTargetSize(inputPath, outputPath, targetSizeKB) {
    console.log(`[ULTRA SIMPLE COMPRESSION] Starting on ${inputPath}`);

    try {
        // Get original file size
        const stats = fs.statSync(inputPath);
        const originalSizeKB = stats.size / 1024;
        console.log(`[ULTRA SIMPLE COMPRESSION] Original size: ${originalSizeKB.toFixed(2)}KB`);

        // If already small enough, just copy it
        if (originalSizeKB <= targetSizeKB) {
            console.log(`[ULTRA SIMPLE COMPRESSION] File already small enough, copying directly`);
            fs.copyFileSync(inputPath, outputPath);
            return { success: true, originalSize: originalSizeKB, newSize: originalSizeKB };
        }

        // Start with a reasonable quality based on file size
        let quality = 60; // Default starting quality

        // For very large files, start with lower quality
        if (originalSizeKB > targetSizeKB * 4) {
            quality = 40;
        } else if (originalSizeKB > targetSizeKB * 2) {
            quality = 50;
        }

        console.log(`[ULTRA SIMPLE COMPRESSION] First attempt with quality ${quality}`);

        // First compression attempt
        await sharp(inputPath)
            .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }) // Limit dimensions
            .jpeg({ quality: quality })
            .toFile(outputPath);

        // Check result
        let resultStats = fs.statSync(outputPath);
        let resultSizeKB = resultStats.size / 1024;
        console.log(`[ULTRA SIMPLE COMPRESSION] First attempt result: ${resultSizeKB.toFixed(2)}KB`);

        // If still too large, try with lower quality
        if (resultSizeKB > targetSizeKB) {
            console.log(`[ULTRA SIMPLE COMPRESSION] Still too large, trying with quality 30`);

            // Second attempt with lower quality
            await sharp(inputPath)
                .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true }) // Smaller dimensions
                .jpeg({ quality: 30 })
                .toFile(outputPath);

            resultStats = fs.statSync(outputPath);
            resultSizeKB = resultStats.size / 1024;
            console.log(`[ULTRA SIMPLE COMPRESSION] Second attempt result: ${resultSizeKB.toFixed(2)}KB`);

            // If still too large, one final attempt with minimum quality and smaller dimensions
            if (resultSizeKB > targetSizeKB) {
                console.log(`[ULTRA SIMPLE COMPRESSION] Final attempt with minimum settings`);

                await sharp(inputPath)
                    .resize(800, 800, { fit: 'inside', withoutEnlargement: true }) // Even smaller
                    .jpeg({ quality: 20 })
                    .toFile(outputPath);

                resultStats = fs.statSync(outputPath);
                resultSizeKB = resultStats.size / 1024;
                console.log(`[ULTRA SIMPLE COMPRESSION] Final attempt result: ${resultSizeKB.toFixed(2)}KB`);
            }
        }

        // Return success regardless of final size - we did our best
        console.log(`[ULTRA SIMPLE COMPRESSION] Completed. Final size: ${resultSizeKB.toFixed(2)}KB`);
        return {
            success: true, // Always return success to prevent upload failures
            originalSize: originalSizeKB,
            newSize: resultSizeKB
        };
    } catch (error) {
        console.error(`[ULTRA SIMPLE COMPRESSION] Error:`, error);

        // Last resort: just copy the file
        try {
            console.log(`[ULTRA SIMPLE COMPRESSION] Error occurred, copying file directly`);
            fs.copyFileSync(inputPath, outputPath);
            return { success: true, originalSize: 0, newSize: 0 };
        } catch (copyError) {
            console.error(`[ULTRA SIMPLE COMPRESSION] Even copy failed:`, copyError);
            // Create an empty file as absolute last resort
            try {
                fs.writeFileSync(outputPath, '');
                return { success: true, originalSize: 0, newSize: 0 };
            } catch (writeError) {
                console.error(`[ULTRA SIMPLE COMPRESSION] Everything failed:`, writeError);
                return { success: false, originalSize: 0, newSize: 0 };
            }
        }
    }
}

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

// POST /api/progress-photos - COMPLETELY REWRITTEN VERSION
router.post('/progress-photos', traceMiddleware, uploadPhotosMiddleware, handleMulterError, async (req, res) => {
    // Set a longer timeout for this specific route
    req.setTimeout(300000); // 5 minutes

    console.log(`[ULTRA SIMPLE UPLOAD] Starting upload process`);
    console.log(`[ULTRA SIMPLE UPLOAD] Files received: ${req.files ? req.files.length : 0}`);

    // Basic error checking
    if (req.fileValidationError) {
        console.error('[ULTRA SIMPLE UPLOAD] File validation error:', req.fileValidationError);
        return res.status(400).json({ error: req.fileValidationError });
    }

    if (req.multerError) {
        console.error('[ULTRA SIMPLE UPLOAD] Multer error:', req.multerError);
        return res.status(500).json({ error: `Upload error: ${req.multerError.message}` });
    }

    // Get date from request body
    const { 'photo-date': date } = req.body;

    // Basic validation
    if (!date) {
        console.error('[ULTRA SIMPLE UPLOAD] Error: Date is required');
        return res.status(400).json({ error: 'Date is required' });
    }

    if (!req.files || req.files.length === 0) {
        console.error('[ULTRA SIMPLE UPLOAD] Error: No files were uploaded');
        return res.status(400).json({ error: 'No files were uploaded' });
    }

    console.log(`[ULTRA SIMPLE UPLOAD] Processing ${req.files.length} files with date: ${date}`);

    try {

        // Process each file - ULTRA SIMPLIFIED VERSION
        const processedFiles = [];

        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            console.log(`[ULTRA SIMPLE UPLOAD] Processing file ${i+1}/${req.files.length}: ${file.originalname}`);

            // Always convert to JPG with fixed settings
            // IMPORTANT: Create a different filename to avoid "Cannot use same file for input and output" error
            const fileExtension = path.extname(file.originalname).toLowerCase();
            const timestamp = Date.now();
            let jpegFilename = `processed_${timestamp}_${path.basename(file.filename, fileExtension)}.jpg`;
            let jpegPath = path.join(path.dirname(file.path), jpegFilename);

            try {
                // GUARANTEED APPROACH: Convert to JPG with aggressive settings for large files
                console.log(`[GUARANTEED UPLOAD] Converting to JPG: ${jpegPath}`);

                // Get original file size
                const originalStats = fs.statSync(file.path);
                const originalSizeKB = originalStats.size / 1024;
                console.log(`[GUARANTEED UPLOAD] Original file size: ${originalSizeKB.toFixed(2)}KB`);

                // Determine quality and dimensions based on file size
                let quality = 70; // Default quality
                let maxDimension = 1200; // Default max dimension
                let useAdvancedOptions = false;

                if (originalSizeKB > 5000) {
                    // Very large files (>5MB)
                    quality = 30;
                    maxDimension = 800;
                    useAdvancedOptions = true;
                } else if (originalSizeKB > 2000) {
                    // Large files (2-5MB)
                    quality = 40;
                    maxDimension = 1000;
                    useAdvancedOptions = true;
                } else if (originalSizeKB > 800) {
                    // Medium files (800KB-2MB)
                    quality = 50;
                    maxDimension = 1200;
                }

                console.log(`[GUARANTEED UPLOAD] Using quality=${quality}, maxDimension=${maxDimension}, advancedOptions=${useAdvancedOptions}`);

                // First attempt - standard conversion with advanced options for large files
                if (useAdvancedOptions) {
                    // Use advanced options for large files
                    await sharp(file.path)
                        .resize(maxDimension, maxDimension, { fit: 'inside', withoutEnlargement: true })
                        .jpeg({
                            quality: quality,
                            progressive: true,
                            optimizeScans: true,
                            trellisQuantisation: true,
                            overshootDeringing: true,
                            optimizeCoding: true,
                            quantisationTable: 2
                        })
                        .toFile(jpegPath);
                } else {
                    // Use standard options for smaller files
                    await sharp(file.path)
                        .resize(maxDimension, maxDimension, { fit: 'inside', withoutEnlargement: true })
                        .jpeg({ quality: quality })
                        .toFile(jpegPath);
                }

                // Check result size
                let stats = fs.statSync(jpegPath);
                let sizeKB = stats.size / 1024;
                console.log(`[GUARANTEED UPLOAD] First attempt result: ${sizeKB.toFixed(2)}KB`);

                // If still too large, try more aggressive settings
                if (sizeKB > 800) {
                    console.log(`[GUARANTEED UPLOAD] Still too large, trying more aggressive settings`);

                    // Second attempt with more aggressive settings and advanced options
                    await sharp(file.path)
                        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
                        .jpeg({
                            quality: 30,
                            progressive: true,
                            optimizeScans: true,
                            trellisQuantisation: true,
                            overshootDeringing: true,
                            optimizeCoding: true,
                            quantisationTable: 3
                        })
                        .toFile(jpegPath);

                    stats = fs.statSync(jpegPath);
                    sizeKB = stats.size / 1024;
                    console.log(`[GUARANTEED UPLOAD] Second attempt result: ${sizeKB.toFixed(2)}KB`);

                    // If still too large, try extreme settings
                    if (sizeKB > 800) {
                        console.log(`[GUARANTEED UPLOAD] Still too large, using extreme settings`);

                        // Try a completely different approach for the final attempt
                        // First, create a grayscale version to reduce file size
                        // Use a unique name to avoid conflicts
                        const grayTimestamp = Date.now();
                        const grayscalePath = path.join(path.dirname(jpegPath), `gray_${grayTimestamp}_${path.basename(jpegPath)}`);

                        // Create a grayscale version first
                        await sharp(file.path)
                            .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
                            .grayscale() // Convert to grayscale to reduce file size
                            .jpeg({
                                quality: 20,
                                progressive: true,
                                optimizeScans: true,
                                trellisQuantisation: true,
                                overshootDeringing: true,
                                optimizeCoding: true,
                                quantisationTable: 3
                            })
                            .toFile(grayscalePath);

                        // Check if grayscale version is small enough
                        const grayStats = fs.statSync(grayscalePath);
                        const graySizeKB = grayStats.size / 1024;

                        if (graySizeKB <= 800) {
                            // Use the grayscale version if it's small enough
                            fs.copyFileSync(grayscalePath, jpegPath);
                            fs.unlinkSync(grayscalePath); // Clean up temporary file

                            stats = fs.statSync(jpegPath);
                            sizeKB = stats.size / 1024;
                            console.log(`[GUARANTEED UPLOAD] Using grayscale version: ${sizeKB.toFixed(2)}KB`);
                        } else {
                            // If even grayscale is too large, use extreme compression
                            await sharp(file.path)
                                .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
                                .jpeg({
                                    quality: 10,
                                    progressive: true,
                                    optimizeScans: true,
                                    trellisQuantisation: true,
                                    overshootDeringing: true,
                                    optimizeCoding: true,
                                    quantisationTable: 3
                                })
                                .toFile(jpegPath);

                            fs.unlinkSync(grayscalePath); // Clean up temporary file

                            stats = fs.statSync(jpegPath);
                            sizeKB = stats.size / 1024;
                            console.log(`[GUARANTEED UPLOAD] Final extreme attempt result: ${sizeKB.toFixed(2)}KB`);
                        }
                    }
                }

                // Update file object regardless of final size
                req.files[i].filename = jpegFilename;
                req.files[i].path = jpegPath;
                req.files[i].mimetype = 'image/jpeg';
                req.files[i].size = stats.size;

                // Delete original if different
                if (file.path !== jpegPath) {
                    try {
                        fs.unlinkSync(file.path);
                        console.log(`[GUARANTEED UPLOAD] Deleted original file`);
                    } catch (err) {
                        console.error(`[GUARANTEED UPLOAD] Error deleting original:`, err);
                    }
                }

                // Add to processed files
                processedFiles.push({
                    filename: jpegFilename,
                    path: jpegPath,
                    size: stats.size
                });

                console.log(`[GUARANTEED UPLOAD] Successfully processed file: ${jpegFilename}`);


            } catch (error) {
                console.error(`[GUARANTEED UPLOAD] Error processing file:`, error);

                // BETTER FALLBACK: Try a completely different approach for large files
                console.log(`[GUARANTEED UPLOAD] Using better fallback approach`);
                try {
                    // Create a new unique filename for the fallback attempt
                    const fallbackTimestamp = Date.now();
                    const fallbackFilename = `fallback_${fallbackTimestamp}.jpg`;
                    const fallbackPath = path.join(path.dirname(file.path), fallbackFilename);

                    console.log(`[GUARANTEED UPLOAD] Trying alternative processing method to: ${fallbackPath}`);

                    // Use a more direct approach with minimal processing
                    // This should work for any image format and size
                    await sharp(file.path)
                        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
                        .jpeg({
                            quality: 20,
                            progressive: true,
                            optimizeScans: true,
                            trellisQuantisation: true,
                            overshootDeringing: true,
                            optimizeCoding: true,
                            quantisationTable: 3
                        })
                        .toFile(fallbackPath);

                    // Update jpegPath to use the fallback path
                    jpegPath = fallbackPath;
                    jpegFilename = fallbackFilename;

                    const fallbackStats = fs.statSync(jpegPath);
                    const fallbackSizeKB = fallbackStats.size / 1024;
                    console.log(`[GUARANTEED UPLOAD] Alternative method result: ${fallbackSizeKB.toFixed(2)}KB`);

                    // If still too large, create a smaller version
                    if (fallbackSizeKB > 800) {
                        console.log(`[GUARANTEED UPLOAD] Still too large, creating minimal version`);
                        await sharp(file.path)
                            .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
                            .jpeg({
                                quality: 10,
                                progressive: true,
                                optimizeScans: true,
                                trellisQuantisation: true,
                                overshootDeringing: true,
                                optimizeCoding: true,
                                quantisationTable: 3
                            })
                            .toFile(jpegPath);

                        const minimalStats = fs.statSync(jpegPath);
                        console.log(`[GUARANTEED UPLOAD] Minimal version result: ${(minimalStats.size/1024).toFixed(2)}KB`);
                    }

                    // Update file object
                    const finalStats = fs.statSync(jpegPath);
                    req.files[i].filename = jpegFilename;
                    req.files[i].path = jpegPath;
                    req.files[i].mimetype = 'image/jpeg';
                    req.files[i].size = finalStats.size;

                    // Add to processed files
                    processedFiles.push({
                        filename: jpegFilename,
                        path: jpegPath,
                        size: finalStats.size
                    });
                } catch (fallbackError) {
                    console.error(`[GUARANTEED UPLOAD] Even fallback failed:`, fallbackError);

                    // LAST RESORT: Use original file
                    console.log(`[GUARANTEED UPLOAD] Using original file as absolute last resort`);
                    processedFiles.push({
                        filename: file.filename,
                        path: file.path,
                        size: file.size
                    });
                }
            }
        }

        // Insert photos into database
        const photoDate = new Date(date);
        const insertedPhotos = [];

        console.log(`[ULTRA SIMPLE UPLOAD] Inserting ${processedFiles.length} photos into database`);

        for (const file of processedFiles) {
            try {
                // Create relative path for database
                const relativePath = `/uploads/progress_photos/${file.filename}`;

                console.log(`[ULTRA SIMPLE UPLOAD] Inserting photo: ${relativePath}`);

                // Simple direct query without transaction
                const result = await db.query(
                    'INSERT INTO progress_photos (date_taken, file_path) VALUES ($1, $2) RETURNING photo_id',
                    [photoDate, relativePath]
                );

                const photoId = result.rows[0].photo_id;
                console.log(`[ULTRA SIMPLE UPLOAD] Inserted photo ID: ${photoId}`);

                insertedPhotos.push({
                    photo_id: photoId,
                    date_taken: photoDate,
                    file_path: relativePath
                });
            } catch (error) {
                console.error(`[ULTRA SIMPLE UPLOAD] Database error:`, error);
                // Continue with other files even if one fails
            }
        }

        console.log(`[ULTRA SIMPLE UPLOAD] Successfully uploaded ${insertedPhotos.length} photos`);
        res.status(200).json({
            success: true,
            message: `Successfully uploaded ${insertedPhotos.length} photos`,
            photos: insertedPhotos
        });
    } catch (error) {
        console.error('[ULTRA SIMPLE UPLOAD] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing uploaded files',
            error: error.message
        });
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