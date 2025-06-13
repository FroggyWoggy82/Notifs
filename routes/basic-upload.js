const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const db = require('../utils/db');

// --- Configuration ---
// Use Railway persistent volume for storage (matches server.js pattern)
const isProduction = process.env.NODE_ENV === 'production';
const progressPhotosDir = isProduction
    ? '/data/uploads/progress_photos'
    : path.join(__dirname, '..', 'public', 'uploads', 'progress_photos');

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
    console.log(`[BASIC UPLOAD] === UPLOAD REQUEST STARTED ===`);
    console.log(`[BASIC UPLOAD] File received: ${req.file ? req.file.originalname : 'none'}`);
    console.log(`[BASIC UPLOAD] Request body:`, req.body);

    // Basic validation
    if (!req.file) {
        console.error('[BASIC UPLOAD] No file uploaded');
        return res.status(400).json({
            success: false,
            error: 'No file uploaded'
        });
    }

    // Check for date in various possible field names
    const date = req.body.date || req.body['photo-date'] || req.body.photoDate;

    console.log('[BASIC UPLOAD] Date value found:', date);

    if (!date) {
        console.error('[BASIC UPLOAD] No date provided');
        return res.status(400).json({
            success: false,
            error: 'Date is required'
        });
    }

    console.log(`[BASIC UPLOAD] File: ${req.file.originalname}, size: ${req.file.size} bytes`);

    // Use database transaction for reliability
    const client = await db.getClient();
    let processedPath = null;

    try {
        // Process the image to fix rotation and create a single, properly oriented image
        const timestamp = Date.now();
        const randomSuffix = Math.round(Math.random() * 1E9);
        const processedFilename = `processed_${timestamp}_${randomSuffix}.jpg`;
        processedPath = path.join(progressPhotosDir, processedFilename);

        console.log(`[BASIC UPLOAD] Processing: ${req.file.path} -> ${processedPath}`);

        // Process image with Sharp to fix rotation and ensure single output
        await sharp(req.file.path)
            .rotate() // Apply EXIF rotation and remove EXIF data to prevent rotation issues
            .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 85, progressive: true })
            .toFile(processedPath);

        // Verify the processed file exists
        if (!fs.existsSync(processedPath)) {
            throw new Error('Processed file was not created');
        }

        console.log(`[BASIC UPLOAD] Image processed successfully`);

        // Insert into database with transaction
        await client.query('BEGIN');

        const photoDate = new Date(date);
        const filePath = `/uploads/progress_photos/${processedFilename}`;

        console.log(`[BASIC UPLOAD] Inserting into database: ${filePath}`);

        const result = await client.query(
            'INSERT INTO progress_photos (date_taken, file_path) VALUES ($1, $2) RETURNING photo_id',
            [photoDate, filePath]
        );

        await client.query('COMMIT');

        const photoId = result.rows[0].photo_id;
        console.log(`[BASIC UPLOAD] ✅ Successfully uploaded photo ID: ${photoId}`);

        // Clean up the original uploaded file
        try {
            fs.unlinkSync(req.file.path);
            console.log(`[BASIC UPLOAD] Cleaned up temp file`);
        } catch (cleanupError) {
            console.warn(`[BASIC UPLOAD] Could not clean up temp file: ${req.file.path}`);
        }

        console.log(`[BASIC UPLOAD] === UPLOAD COMPLETED SUCCESSFULLY ===`);

        res.status(200).json({
            success: true,
            message: 'Photo uploaded successfully',
            photo: {
                photo_id: photoId,
                date_taken: photoDate,
                file_path: filePath
            }
        });

    } catch (error) {
        console.error(`[BASIC UPLOAD] Error:`, error);

        // Rollback database transaction
        try {
            await client.query('ROLLBACK');
        } catch (rollbackError) {
            console.error(`[BASIC UPLOAD] Rollback error:`, rollbackError);
        }

        // Clean up files on error
        try {
            if (req.file && req.file.path) {
                fs.unlinkSync(req.file.path);
                console.log(`[BASIC UPLOAD] Cleaned up temp file after error`);
            }
        } catch (cleanupError) {
            console.warn(`[BASIC UPLOAD] Could not clean up temp file on error`);
        }

        // Clean up processed file if it was created
        try {
            if (processedPath && fs.existsSync(processedPath)) {
                fs.unlinkSync(processedPath);
                console.log(`[BASIC UPLOAD] Cleaned up processed file after error`);
            }
        } catch (cleanupError) {
            console.warn(`[BASIC UPLOAD] Could not clean up processed file on error`);
        }

        res.status(500).json({
            success: false,
            error: 'Failed to upload photo',
            message: error.message
        });
    } finally {
        client.release();
    }
});

// Add an alias route for mobile compatibility - same logic as /basic
router.post('/upload', uploadMiddleware, async (req, res) => {
    console.log(`[BASIC UPLOAD] Mobile /upload route - redirecting to basic logic`);

    // Use the exact same logic as the /basic route
    console.log(`[BASIC UPLOAD] === MOBILE UPLOAD REQUEST STARTED ===`);
    console.log(`[BASIC UPLOAD] File received: ${req.file ? req.file.originalname : 'none'}`);
    console.log(`[BASIC UPLOAD] Request body:`, req.body);

    // Basic validation
    if (!req.file) {
        console.error('[BASIC UPLOAD] No file uploaded');
        return res.status(400).json({
            success: false,
            error: 'No file uploaded'
        });
    }

    // Check for date in various possible field names
    const date = req.body.date || req.body['photo-date'] || req.body.photoDate;

    console.log('[BASIC UPLOAD] Date value found:', date);

    if (!date) {
        console.error('[BASIC UPLOAD] No date provided');
        return res.status(400).json({
            success: false,
            error: 'Date is required'
        });
    }

    console.log(`[BASIC UPLOAD] File: ${req.file.originalname}, size: ${req.file.size} bytes`);

    // Use database transaction for reliability
    const client = await db.getClient();
    let processedPath = null;

    try {
        // Process the image to fix rotation and create a single, properly oriented image
        const timestamp = Date.now();
        const randomSuffix = Math.round(Math.random() * 1E9);
        const processedFilename = `mobile_processed_${timestamp}_${randomSuffix}.jpg`;
        processedPath = path.join(progressPhotosDir, processedFilename);

        console.log(`[BASIC UPLOAD] Processing: ${req.file.path} -> ${processedPath}`);

        // Process image with Sharp to fix rotation and ensure single output
        await sharp(req.file.path)
            .rotate() // Apply EXIF rotation and remove EXIF data to prevent rotation issues
            .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 85, progressive: true })
            .toFile(processedPath);

        // Verify the processed file exists
        if (!fs.existsSync(processedPath)) {
            throw new Error('Processed file was not created');
        }

        console.log(`[BASIC UPLOAD] Image processed successfully`);

        // Insert into database with transaction
        await client.query('BEGIN');

        const photoDate = new Date(date);
        const filePath = `/uploads/progress_photos/${processedFilename}`;

        console.log(`[BASIC UPLOAD] Inserting into database: ${filePath}`);

        const result = await client.query(
            'INSERT INTO progress_photos (date_taken, file_path) VALUES ($1, $2) RETURNING photo_id',
            [photoDate, filePath]
        );

        await client.query('COMMIT');

        const photoId = result.rows[0].photo_id;
        console.log(`[BASIC UPLOAD] ✅ Successfully uploaded photo ID: ${photoId}`);

        // Clean up the original uploaded file
        try {
            fs.unlinkSync(req.file.path);
            console.log(`[BASIC UPLOAD] Cleaned up temp file`);
        } catch (cleanupError) {
            console.warn(`[BASIC UPLOAD] Could not clean up temp file: ${req.file.path}`);
        }

        console.log(`[BASIC UPLOAD] === MOBILE UPLOAD COMPLETED SUCCESSFULLY ===`);

        res.status(200).json({
            success: true,
            message: 'Photo uploaded successfully',
            photo: {
                photo_id: photoId,
                date_taken: photoDate,
                file_path: filePath
            }
        });

    } catch (error) {
        console.error(`[BASIC UPLOAD] Error:`, error);

        // Rollback database transaction
        try {
            await client.query('ROLLBACK');
        } catch (rollbackError) {
            console.error(`[BASIC UPLOAD] Rollback error:`, rollbackError);
        }

        // Clean up files on error
        try {
            if (req.file && req.file.path) {
                fs.unlinkSync(req.file.path);
                console.log(`[BASIC UPLOAD] Cleaned up temp file after error`);
            }
        } catch (cleanupError) {
            console.warn(`[BASIC UPLOAD] Could not clean up temp file on error`);
        }

        // Clean up processed file if it was created
        try {
            if (processedPath && fs.existsSync(processedPath)) {
                fs.unlinkSync(processedPath);
                console.log(`[BASIC UPLOAD] Cleaned up processed file after error`);
            }
        } catch (cleanupError) {
            console.warn(`[BASIC UPLOAD] Could not clean up processed file on error`);
        }

        res.status(500).json({
            success: false,
            error: 'Failed to upload photo',
            message: error.message
        });
    } finally {
        client.release();
    }
});

module.exports = router;
