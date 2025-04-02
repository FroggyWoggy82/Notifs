const express = require('express');
const db = require('../db'); // Assuming db setup is in ../db/index.js or similar
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Required for checking directory existence

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
        cb(null, progressPhotosDir); // Use the absolute path
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        console.warn(`[Multer File Filter] Rejected file: ${file.originalname} (MIME type: ${file.mimetype})`);
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};

console.log(`[Server Config] Multer configured with file size limit: ${MAX_FILE_SIZE_MB} MB`);
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE_BYTES
    }
});

const uploadPhotosMiddleware = upload.array('photos', 10); // Match the input name attribute
// --- End Multer Configuration ---


// --- API Routes ---

// GET /api/workouts/exercises
router.get('/exercises', async (req, res) => {
    console.log("Received GET /api/workouts/exercises request");
    try {
        const result = await db.query('SELECT exercise_id, name, category FROM exercises ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching exercises:', err);
        res.status(500).json({ error: 'Failed to fetch exercises' });
    }
});

// GET /api/workouts/templates
router.get('/templates', async (req, res) => {
    // ... (existing template code) ...
});

// POST /api/workouts/log
router.post('/log', async (req, res) => {
    // ... (existing log code) ...
});

// POST /api/workouts/exercises
router.post('/exercises', async (req, res) => {
    // ... (existing exercise code) ...
});

// GET /api/workouts/exercises/:id/lastlog
router.get('/exercises/:id/lastlog', async (req, res) => {
    // ... (existing lastlog code) ...
});

// GET /api/workouts/exercises/:id/history
router.get('/exercises/:id/history', async (req, res) => {
    // ... (existing history code) ...
});

// POST /api/workouts/log/manual
router.post('/log/manual', async (req, res) => {
    // ... (existing manual log code) ...
});

// --- Template Management Routes ---
// ... (existing template routes) ...

// DELETE /api/workouts/logs/:id
router.delete('/logs/:id', async (req, res) => {
    // ... (existing delete log code) ...
});

// --- Progress Photo Routes ---

// POST /api/workouts/progress-photos (Now uses correctly defined uploadPhotosMiddleware)
router.post('/progress-photos', uploadPhotosMiddleware, async (req, res) => {
    // <<< DEBUG LOGS AT THE START >>>
    console.log('[DEBUG] req.body immediately after multer:', JSON.stringify(req.body));
    console.log('[DEBUG] req.files immediately after multer:', req.files ? req.files.length : 'undefined');
    // <<< END DEBUG LOGS >>>

    // --- Check for Multer errors ---
    if (req.fileValidationError) {
        console.error('[Photo Upload Route] File validation error detected:', req.fileValidationError);
        return res.status(400).json({ error: req.fileValidationError });
    }
    if (req.multerError) {
        console.error('[Photo Upload Route] Multer error detected on req:', req.multerError.code || req.multerError.message);
        if (req.multerError.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.` });
        }
        return res.status(500).json({ error: `File upload error: ${req.multerError.message}` });
    }
    // --- End error checking ---

    // --- Main logic: Get date and files ---
    const { 'photo-date': date } = req.body;
    const files = req.files;

    console.log(`[Photo Upload Route Handler] Processing request. Date: ${date}`);

    // --- Validation ---
    if (!date) {
        console.error('[Photo Upload Route Handler] Error: Date is required.');
        return res.status(400).json({ error: 'Date is required.' });
    }
    if (!files || files.length === 0) {
        console.error('[Photo Upload Route Handler] Error: No photos found in request files.');
        if (!res.headersSent) { return res.status(400).json({ error: 'No photo files were processed.' }); }
        return;
    }

    // Log file details (optional)
    if (files && files.length > 0) {
        files.forEach((file, index) => {
            console.log(`[Photo Upload Route Handler] File ${index}: Name=${file.filename}, Size=${file.size}, MimeType=${file.mimetype}, Path=${file.path}`);
        });
    }

    console.log(`[Photo Upload Route Handler] Proceeding with DB operations for ${files.length} photos.`);

    const client = await db.pool.connect();
    console.log('[Photo Upload Route Handler] DB Client acquired.');
    try {
        await client.query('BEGIN');
        console.log('[Photo Upload Route Handler] DB Transaction BEGIN.');

        const insertedPhotos = [];
        for (const file of files) {
            const relativePath = `/uploads/progress_photos/${file.filename}`;
            console.log(`[Photo Upload Route Handler] Inserting DB record for: ${relativePath}, Date: ${date}`);

            const result = await client.query(
                'INSERT INTO progress_photos (date_taken, file_path) VALUES ($1, $2) RETURNING photo_id, date_taken, file_path',
                [date, relativePath]
            );
            insertedPhotos.push(result.rows[0]);
        }

        await client.query('COMMIT');
        console.log('[Photo Upload Route Handler] DB Transaction COMMIT successful.');
        if (!res.headersSent) {
            res.status(201).json({ message: 'Photos uploaded successfully!', photos: insertedPhotos });
        }

    } catch (dbErr) {
        console.error('[Photo Upload Route Handler] Database Error during photo upload transaction:', dbErr.message, dbErr.stack);
        try {
            await client.query('ROLLBACK');
            console.log('[Photo Upload Route Handler] DB Transaction ROLLBACK successful.');
        } catch (rbErr) {
             console.error('[Photo Upload Route Handler] Error during ROLLBACK after initial error:', rbErr);
        }
        if (files && files.length > 0) {
            console.log('[Photo Upload Route Handler] Attempting to delete uploaded files due to DB error...');
            files.forEach(file => {
                if (file && file.path) {
                    fs.unlink(file.path, unlinkErr => {
                        if (unlinkErr) console.error(`[Photo Upload Route Handler] Error deleting file ${file.path} after DB error:`, unlinkErr);
                        else console.log(`[Photo Upload Route Handler] Deleted orphaned file: ${file.path}`);
                    });
                } else {
                     console.warn('[Photo Upload Route Handler] Skipping file deletion attempt: file or file.path missing.');
                }
            });
        } else {
            console.warn('[Photo Upload Route Handler] Skipping file deletion: No files object available after DB error.');
        }
        if (!res.headersSent) {
            res.status(500).json({ error: 'Database error saving photo information.' });
        }
    } finally {
        client.release();
        console.log('[Photo Upload Route Handler] DB Client released.');
    }
});

// GET /api/progress-photos
router.get('/progress-photos', async (req, res) => {
    // ... (existing code) ...
});

// DELETE /api/progress-photos/:photo_id
router.delete('/progress-photos/:photo_id', async (req, res) => {
    // ... (existing code) ...
});

module.exports = router; 