/**
 * Workout Controller
 * Handles HTTP requests and responses for workouts
 */

const WorkoutModel = require('../models/workoutModel');
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- Multer Configuration for Progress Photos ---
const MAX_FILE_SIZE_MB = 25;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, WorkoutModel.progressPhotosDir);
    },
    filename: function (req, file, cb) {
        // Create a unique filename: fieldname-timestamp.extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        console.warn(`[Multer File Filter] Rejected file: ${file.originalname} (MIME type: ${file.mimetype})`);
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};

// Configure Multer with limits
console.log(`[Server Config] Multer configured with file size limit: ${MAX_FILE_SIZE_MB} MB`);
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE_BYTES
    }
});

// Use upload.array('photos', 10) to accept up to 10 files with the field name 'photos'
const uploadPhotosMiddleware = upload.array('photos', 10);

/**
 * Get all available exercises
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getAllExercises(req, res) {
    console.log("Received GET /api/workouts/exercises request");
    try {
        const exercises = await WorkoutModel.getAllExercises();
        res.json(exercises);
    } catch (error) {
        console.error('Error fetching exercises:', error);
        res.status(500).json({ error: 'Failed to fetch exercises' });
    }
}

/**
 * Get all workout templates
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getWorkoutTemplates(req, res) {
    console.log("Received GET /api/workouts/templates request");
    try {
        const templates = await WorkoutModel.getWorkoutTemplates();
        res.json(templates);
    } catch (error) {
        console.error('Error fetching workout templates:', error);
        res.status(500).json({ error: 'Failed to fetch workout templates' });
    }
}

/**
 * Get a workout template by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getWorkoutTemplateById(req, res) {
    const { id } = req.params;
    console.log(`Received GET /api/workouts/templates/${id} request`);
    try {
        const template = await WorkoutModel.getWorkoutTemplateById(id);
        res.json(template);
    } catch (error) {
        console.error(`Error fetching workout template ${id}:`, error);

        if (error.message === 'Workout template not found') {
            return res.status(404).json({ error: error.message });
        }

        res.status(500).json({ error: 'Failed to fetch workout template' });
    }
}

/**
 * Create a new workout template
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function createWorkoutTemplate(req, res) {
    const { name, description, exercises } = req.body;
    console.log(`Received POST /api/workouts/templates: name='${name}'`);

    try {
        const template = await WorkoutModel.createWorkoutTemplate(name, description, exercises);
        console.log(`Workout template created successfully with ID: ${template.workout_id}`);
        res.status(201).json(template);
    } catch (error) {
        console.error('Error creating workout template:', error);

        if (error.message.includes('cannot be empty') ||
            error.message.includes('must contain at least one exercise') ||
            error.message.includes('must have an exercise_id')) {
            return res.status(400).json({ error: error.message });
        }

        res.status(500).json({ error: 'Failed to create workout template' });
    }
}

/**
 * Update a workout template
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateWorkoutTemplate(req, res) {
    const { id } = req.params;
    const { name, description, exercises } = req.body;
    console.log(`Received PUT /api/workouts/templates/${id}: name='${name}'`);

    try {
        const template = await WorkoutModel.updateWorkoutTemplate(id, name, description, exercises);
        console.log(`Workout template ${id} updated successfully`);
        res.json(template);
    } catch (error) {
        console.error(`Error updating workout template ${id}:`, error);

        if (error.message.includes('cannot be empty') ||
            error.message.includes('must contain at least one exercise') ||
            error.message.includes('must have an exercise_id')) {
            return res.status(400).json({ error: error.message });
        }

        if (error.message === 'Workout template not found') {
            return res.status(404).json({ error: error.message });
        }

        res.status(500).json({ error: 'Failed to update workout template' });
    }
}

/**
 * Delete a workout template
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function deleteWorkoutTemplate(req, res) {
    const { id } = req.params;
    console.log(`Received DELETE /api/workouts/templates/${id}`);

    try {
        const result = await WorkoutModel.deleteWorkoutTemplate(id);
        console.log(`Workout template ${id} (${result.name}) deleted successfully`);
        res.json({
            message: `Workout template ${result.name} deleted successfully`,
            id: result.id
        });
    } catch (error) {
        console.error(`Error deleting workout template ${id}:`, error);

        if (error.message === 'Workout template not found') {
            return res.status(404).json({ error: error.message });
        }

        res.status(500).json({ error: 'Failed to delete workout template' });
    }
}

/**
 * Log a completed workout
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function logWorkout(req, res) {
    const { workoutName, duration, notes, exercises } = req.body;
    console.log(`Received POST /api/workouts/log request for workout: ${workoutName}`);

    try {
        const workoutLog = await WorkoutModel.logWorkout(workoutName, duration, notes, exercises);
        console.log(`Workout logged successfully with ID: ${workoutLog.log_id}`);
        res.status(201).json(workoutLog);
    } catch (error) {
        console.error('Error logging workout:', error);

        if (error.message.includes('cannot be empty') ||
            error.message.includes('must contain at least one logged exercise') ||
            error.message.includes('Invalid exercise log data') ||
            error.message.includes('Invalid sets_completed value')) {
            return res.status(400).json({ error: error.message });
        }

        res.status(500).json({ error: 'Failed to log workout' });
    }
}

/**
 * Get workout logs with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getWorkoutLogs(req, res) {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    console.log(`Received GET /api/workouts/logs request (limit=${limit}, offset=${offset})`);

    try {
        const result = await WorkoutModel.getWorkoutLogs(limit, offset);
        res.json(result);
    } catch (error) {
        console.error('Error fetching workout logs:', error);
        res.status(500).json({ error: 'Failed to fetch workout logs' });
    }
}

/**
 * Get a workout log by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getWorkoutLogById(req, res) {
    const { id } = req.params;
    console.log(`Received GET /api/workouts/logs/${id} request`);

    try {
        const log = await WorkoutModel.getWorkoutLogById(id);
        res.json(log);
    } catch (error) {
        console.error(`Error fetching workout log ${id}:`, error);

        if (error.message === 'Workout log not found') {
            return res.status(404).json({ error: error.message });
        }

        res.status(500).json({ error: 'Failed to fetch workout log' });
    }
}

/**
 * Delete a workout log
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function deleteWorkoutLog(req, res) {
    const { id } = req.params;
    console.log(`Received DELETE /api/workouts/logs/${id}`);

    try {
        const result = await WorkoutModel.deleteWorkoutLog(id);
        console.log(`Workout log ${id} deleted successfully`);
        res.json({
            message: `Workout log deleted successfully`,
            id: result.id
        });
    } catch (error) {
        console.error(`Error deleting workout log ${id}:`, error);

        if (error.message === 'Workout log not found') {
            return res.status(404).json({ error: error.message });
        }

        res.status(500).json({ error: 'Failed to delete workout log' });
    }
}

/**
 * Search exercises by name or category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function searchExercises(req, res) {
    const { q } = req.query;
    console.log(`Received GET /api/workouts/exercises/search?q=${q} request`);

    try {
        const exercises = await WorkoutModel.searchExercises(q);
        res.json(exercises);
    } catch (error) {
        console.error('Error searching exercises:', error);
        res.status(500).json({ error: 'Failed to search exercises' });
    }
}

/**
 * Create a new exercise
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function createExercise(req, res) {
    const { name, category } = req.body;
    console.log(`Received POST /api/workouts/exercises: name='${name}', category='${category}'`);

    try {
        const exercise = await WorkoutModel.createExercise(name, category);
        console.log(`Exercise created successfully with ID: ${exercise.exercise_id}`);
        res.status(201).json(exercise);
    } catch (error) {
        console.error('Error creating exercise:', error);

        if (error.message.includes('cannot be empty') ||
            error.message.includes('already exists')) {
            return res.status(400).json({ error: error.message });
        }

        res.status(500).json({ error: 'Failed to create exercise' });
    }
}

/**
 * Upload progress photos
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function uploadProgressPhotos(req, res) {
    uploadPhotosMiddleware(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading
            console.error('Multer error during upload:', err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    error: `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`
                });
            }
            return res.status(400).json({ error: err.message });
        } else if (err) {
            // An unknown error occurred
            console.error('Unknown error during upload:', err);
            return res.status(500).json({ error: err.message });
        }

        // Everything went fine, files are available in req.files
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files were uploaded.' });
        }

        // Process the uploaded files
        const uploadedFiles = req.files.map(file => ({
            filename: file.filename,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: `/uploads/progress_photos/${file.filename}` // Path relative to public directory
        }));

        console.log(`Successfully uploaded ${uploadedFiles.length} progress photos`);
        res.status(201).json({
            message: `Successfully uploaded ${uploadedFiles.length} files`,
            files: uploadedFiles
        });
    });
}

/**
 * Clean up missing progress photos
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function cleanupProgressPhotos(req, res) {
    try {
        const { cleanupMissingPhotos } = require('../routes/cleanupPhotos');
        const result = await cleanupMissingPhotos();
        res.json({
            success: true,
            message: `Cleanup completed. Found ${result.missingPhotos} missing photos out of ${result.totalPhotos} total.`,
            ...result
        });
    } catch (error) {
        console.error('Error in cleanup route:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'An error occurred during cleanup'
        });
    }
}

/**
 * Get all progress photos
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getProgressPhotos(req, res) {
    try {
        const result = await db.query('SELECT photo_id, date_taken, file_path, uploaded_at FROM progress_photos ORDER BY date_taken DESC, uploaded_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching progress photos:', error);
        res.status(500).json({ error: 'Failed to fetch progress photos' });
    }
}

module.exports = {
    getAllExercises,
    getWorkoutTemplates,
    getWorkoutTemplateById,
    createWorkoutTemplate,
    updateWorkoutTemplate,
    deleteWorkoutTemplate,
    logWorkout,
    getWorkoutLogs,
    getWorkoutLogById,
    deleteWorkoutLog,
    searchExercises,
    createExercise,
    uploadProgressPhotos,
    cleanupProgressPhotos,
    getProgressPhotos
};
