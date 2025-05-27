const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const db = require('../utils/db');

// --- Configuration ---
// Use Railway persistent volume for storage
const progressPhotosDir = path.join(__dirname, '..', 'public', 'uploads', 'progress_photos');

// Reference to the public directory path (for file paths in the database)
const publicPhotosPath = '/uploads/progress_photos';

// Since we're using the public directory directly, just ensure it exists
const publicPhotosDir = progressPhotosDir; // Same as progressPhotosDir now

// Ensure the upload directory exists
if (!fs.existsSync(progressPhotosDir)) {
    fs.mkdirSync(progressPhotosDir, { recursive: true });
    console.log(`[BASIC UPLOAD] Created directory: ${progressPhotosDir}`);
}

// Ensure the parent uploads directory exists
const publicUploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(publicUploadsDir)) {
    fs.mkdirSync(publicUploadsDir, { recursive: true });
}

// Configure multer storage - extremely simple approach
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, progressPhotosDir);
    },
    filename: function (req, file, cb) {
        // Use a timestamp to ensure unique filenames
        const timestamp = Date.now();
        cb(null, `basic_${timestamp}.jpg`);
    }
});

// Configure multer upload with very high limits
const MAX_FILE_SIZE_MB = 100; // Increased to 100MB to handle any mobile camera
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

console.log(`[BASIC UPLOAD] Configured with file size limit: ${MAX_FILE_SIZE_MB} MB`);

const upload = multer({
    storage: storage,
    limits: {
        fileSize: MAX_FILE_SIZE_BYTES
    }
});

// --- Middleware ---
const uploadMiddleware = upload.single('photos');

// --- Routes ---
router.post('/basic', uploadMiddleware, async (req, res) => {
    console.log(`[BASIC UPLOAD] Starting basic upload process`);

    // Basic validation
    if (!req.file) {
        console.error('[BASIC UPLOAD] No file uploaded');
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check for date in various possible field names
    const date = req.body.date || req.body['photo-date'] || req.body.photoDate;

    console.log('[BASIC UPLOAD] Request body:', req.body);
    console.log('[BASIC UPLOAD] Date value found:', date);

    if (!date) {
        console.error('[BASIC UPLOAD] No date provided');
        return res.status(400).json({ error: 'Date is required' });
    }

    console.log(`[BASIC UPLOAD] File received: ${req.file.originalname}, size: ${req.file.size} bytes`);
    console.log(`[BASIC UPLOAD] Saved as: ${req.file.filename}`);

    try {
        // Process the image to fix rotation and create a single, properly oriented image
        const timestamp = Date.now();
        const processedFilename = `processed_${timestamp}.jpg`;
        const processedPath = path.join(progressPhotosDir, processedFilename);

        console.log(`[BASIC UPLOAD] Processing image to fix rotation: ${req.file.path} -> ${processedPath}`);

        // Process image with Sharp to fix rotation and ensure single output
        await sharp(req.file.path)
            .rotate() // Apply EXIF rotation and remove EXIF data to prevent rotation issues
            .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 80, progressive: true })
            .toFile(processedPath);

        // Clean up the original uploaded file
        try {
            fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
            console.warn(`[BASIC UPLOAD] Could not clean up temp file: ${req.file.path}`);
        }

        // Insert into database with processed file
        const photoDate = new Date(date);
        const filePath = `/uploads/progress_photos/${processedFilename}`;

        console.log(`[BASIC UPLOAD] Inserting into database: ${filePath}`);

        const result = await db.query(
            'INSERT INTO progress_photos (date_taken, file_path) VALUES ($1, $2) RETURNING photo_id',
            [photoDate, filePath]
        );

        console.log(`[BASIC UPLOAD] Inserted photo ID: ${result.rows[0].photo_id}`);

        res.status(200).json({
            success: true,
            message: 'Photo uploaded successfully',
            photo: {
                photo_id: result.rows[0].photo_id,
                date_taken: photoDate,
                file_path: filePath
            }
        });
    } catch (error) {
        console.error(`[BASIC UPLOAD] Error:`, error);
        res.status(500).json({
            error: 'Failed to upload photo',
            details: error.message
        });
    }
});

module.exports = router;
