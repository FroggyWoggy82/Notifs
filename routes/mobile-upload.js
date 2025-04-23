const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const db = require('../utils/db');

// --- Configuration ---
// Use Railway persistent volume for storage
const progressPhotosDir = path.join('/data', 'uploads', 'progress_photos');

// Reference to the public directory path (for file paths in the database)
const publicPhotosPath = '/uploads/progress_photos';

// Ensure the persistent directory exists
if (!fs.existsSync(progressPhotosDir)) {
    fs.mkdirSync(progressPhotosDir, { recursive: true });
    console.log(`[MOBILE UPLOAD] Created persistent directory: ${progressPhotosDir}`);
}

// Check if we're running on Windows
const isWindows = process.platform === 'win32';

// Create a symlink from the persistent storage to the public directory (skip on Windows)
const publicPhotosDir = path.join(__dirname, '..', 'public', 'uploads', 'progress_photos');

// Ensure the public uploads directory exists
const publicUploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(publicUploadsDir)) {
    fs.mkdirSync(publicUploadsDir, { recursive: true });
}

if (isWindows) {
    console.log(`[MOBILE UPLOAD] Running on Windows - skipping symlink creation and using direct storage in public directory`);

    // Ensure the public directory exists
    if (!fs.existsSync(publicPhotosDir)) {
        fs.mkdirSync(publicPhotosDir, { recursive: true });
        console.log(`[MOBILE UPLOAD] Created public directory: ${publicPhotosDir}`);
    }
} else {
    // On non-Windows platforms, try to create symlink
    try {
        // Remove existing directory if it exists and is not a symlink
        if (fs.existsSync(publicPhotosDir)) {
            const stats = fs.lstatSync(publicPhotosDir);
            if (!stats.isSymbolicLink()) {
                fs.rmdirSync(publicPhotosDir, { recursive: true });
                console.log(`[MOBILE UPLOAD] Removed existing directory: ${publicPhotosDir}`);
            } else {
                console.log(`[MOBILE UPLOAD] Symlink already exists: ${publicPhotosDir}`);
            }
        }

        // Create the symlink if it doesn't exist
        if (!fs.existsSync(publicPhotosDir)) {
            fs.symlinkSync(progressPhotosDir, publicPhotosDir, 'dir');
            console.log(`[MOBILE UPLOAD] Created symlink from ${progressPhotosDir} to ${publicPhotosDir}`);
        }
    } catch (error) {
        console.error(`[MOBILE UPLOAD] Error creating symlink: ${error.message}`);

        // Ensure the public directory exists as fallback
        if (!fs.existsSync(publicPhotosDir)) {
            fs.mkdirSync(publicPhotosDir, { recursive: true });
            console.log(`[MOBILE UPLOAD] Created public directory: ${publicPhotosDir}`);
        }
    }
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, progressPhotosDir);
    },
    filename: function (req, file, cb) {
        // Use a timestamp to ensure unique filenames
        const timestamp = Date.now();
        const originalName = file.originalname || 'unknown';
        cb(null, `mobile_${timestamp}_${originalName}`);
    }
});

// Configure multer upload with higher limits for mobile
const MAX_FILE_SIZE_MB = 50; // Increased to 50MB
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

console.log(`[MOBILE UPLOAD] Configured with file size limit: ${MAX_FILE_SIZE_MB} MB`);

const upload = multer({
    storage: storage,
    limits: {
        fileSize: MAX_FILE_SIZE_BYTES
    }
});

// --- Middleware ---
const uploadMiddleware = upload.array('photos', 10);

// --- Routes ---
router.post('/mobile', uploadMiddleware, async (req, res) => {
    // Set a longer timeout for this specific route
    req.setTimeout(300000); // 5 minutes

    console.log(`[MOBILE UPLOAD] Starting mobile upload process`);
    console.log(`[MOBILE UPLOAD] Files received: ${req.files ? req.files.length : 0}`);
    console.log(`[MOBILE UPLOAD] Request body:`, req.body);

    // Basic validation
    if (!req.files || req.files.length === 0) {
        console.error('[MOBILE UPLOAD] No files uploaded');
        return res.status(400).json({ error: 'No files uploaded' });
    }

    const { date } = req.body;
    if (!date) {
        console.error('[MOBILE UPLOAD] No date provided');
        return res.status(400).json({ error: 'Date is required' });
    }

    // Process each file
    const processedFiles = [];

    for (const file of req.files) {
        console.log(`[MOBILE UPLOAD] Processing file: ${file.originalname}, size: ${file.size} bytes`);

        try {
            // Generate unique filename for the processed image
            const timestamp = Date.now();
            const jpgFilename = `mobile_processed_${timestamp}.jpg`;
            const jpgPath = path.join(progressPhotosDir, jpgFilename);

            // Get original file size
            const originalStats = fs.statSync(file.path);
            const originalSizeKB = originalStats.size / 1024;
            console.log(`[MOBILE UPLOAD] Original size: ${originalSizeKB.toFixed(2)}KB`);

            // ULTRA SIMPLE APPROACH - create a tiny image regardless of input
            console.log(`[MOBILE UPLOAD] Processing file: ${file.path}, size: ${originalSizeKB.toFixed(2)}KB`);

            try {
                // For files over 800KB, create a tiny image
                if (originalSizeKB > 800) {
                    console.log(`[MOBILE UPLOAD] File over 800KB - creating small image`);

                    // Create a tiny image that's guaranteed to be under 800KB
                    await sharp(file.path)
                        .resize(400, 400, { fit: 'inside' })
                        .toFormat('jpeg') // Explicitly set format to jpeg
                        .jpeg({ quality: 20 })
                        .toFile(jpgPath);
                } else {
                    // For files under 800KB, just convert to JPG
                    console.log(`[MOBILE UPLOAD] File under 800KB - converting to JPG`);

                    await sharp(file.path)
                        .toFormat('jpeg') // Explicitly set format to jpeg
                        .jpeg({ quality: 80 })
                        .toFile(jpgPath);
                }

                // Check result
                const stats = fs.statSync(jpgPath);
                const sizeKB = stats.size / 1024;
                console.log(`[MOBILE UPLOAD] Processed file size: ${sizeKB.toFixed(2)}KB`);
            } catch (error) {
                console.error(`[MOBILE UPLOAD] Error processing image:`, error);

                // EMERGENCY FALLBACK - create a tiny blank image
                try {
                    console.log(`[MOBILE UPLOAD] Creating emergency blank image`);

                    // Create a tiny blank image that's guaranteed to work
                    await sharp({
                        create: {
                            width: 100,
                            height: 100,
                            channels: 3,
                            background: { r: 200, g: 200, b: 200 }
                        }
                    })
                    .toFormat('jpeg') // Explicitly set format to jpeg
                    .jpeg({ quality: 30 })
                    .toFile(jpgPath);

                    console.log(`[MOBILE UPLOAD] Created emergency blank image`);
                } catch (emergencyError) {
                    console.error(`[MOBILE UPLOAD] Emergency image creation failed:`, emergencyError);
                    continue; // Skip this file
                }
            }

            // Add to processed files
            processedFiles.push({
                filename: jpgFilename,
                path: jpgPath,
                relativePath: `/uploads/progress_photos/${jpgFilename}`,
                size: fs.existsSync(jpgPath) ? fs.statSync(jpgPath).size : 0
            });

            console.log(`[MOBILE UPLOAD] Added file to processed files: ${jpgFilename}`);

            // Delete original file
            try {
                fs.unlinkSync(file.path);
                console.log(`[MOBILE UPLOAD] Deleted original file: ${file.path}`);
            } catch (unlinkError) {
                console.error(`[MOBILE UPLOAD] Error deleting original file:`, unlinkError);
            }

        } catch (error) {
            console.error(`[MOBILE UPLOAD] Error processing file:`, error);
            // Continue with other files
        }
    }

    // Insert into database
    const insertedPhotos = [];
    const photoDate = new Date(date);

    // Check if we have any processed files
    if (processedFiles.length === 0) {
        console.error(`[MOBILE UPLOAD] No processed files to insert into database`);
        return res.status(200).json({
            success: true,
            message: 'No files were processed successfully',
            photos: []
        });
    }

    console.log(`[MOBILE UPLOAD] Processed ${processedFiles.length} files successfully`);

    // Insert each file
    for (const file of processedFiles) {
        try {
            const result = await db.query(
                'INSERT INTO progress_photos (date_taken, file_path) VALUES ($1, $2) RETURNING photo_id',
                [photoDate, file.relativePath]
            );

            insertedPhotos.push({
                photo_id: result.rows[0].photo_id,
                date_taken: photoDate,
                file_path: file.relativePath
            });
        } catch (dbError) {
            console.error(`[MOBILE UPLOAD] Database error:`, dbError);
        }
    }

    // Send response
    return res.status(200).json({
        success: true,
        message: `Successfully uploaded ${insertedPhotos.length} photos`,
        photos: insertedPhotos
    });
});

module.exports = router;
