const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const db = require('../db');

// --- Configuration ---
// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const progressPhotosDir = path.join(uploadsDir, 'progress_photos');
if (!fs.existsSync(progressPhotosDir)) {
    fs.mkdirSync(progressPhotosDir, { recursive: true });
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
            const jpegFilename = `mobile_processed_${timestamp}.jpg`;
            const jpegPath = path.join(progressPhotosDir, jpegFilename);

            // Get original file size
            const originalStats = fs.statSync(file.path);
            const originalSizeKB = originalStats.size / 1024;
            console.log(`[MOBILE UPLOAD] Original size: ${originalSizeKB.toFixed(2)}KB`);

            // Simple approach - just convert to JPEG with moderate compression
            let sizeKB = originalSizeKB;

            console.log(`[MOBILE UPLOAD] Processing file: ${file.path}, size: ${originalSizeKB.toFixed(2)}KB`);

            try {
                // Use moderate compression for all files
                const quality = 70;
                const maxDimension = 1200;

                console.log(`[MOBILE UPLOAD] Converting to JPEG with quality=${quality}, maxDimension=${maxDimension}`);

                await sharp(file.path)
                    .resize(maxDimension, maxDimension, { fit: 'inside', withoutEnlargement: true })
                    .jpeg({ quality: quality })
                    .toFile(jpegPath);

                // Check result
                const stats = fs.statSync(jpegPath);
                sizeKB = stats.size / 1024;
                console.log(`[MOBILE UPLOAD] Processed file size: ${sizeKB.toFixed(2)}KB`);
            } catch (error) {
                console.error(`[MOBILE UPLOAD] Error processing image:`, error);
                // If processing fails, try to copy the original file
                try {
                    fs.copyFileSync(file.path, jpegPath);
                    console.log(`[MOBILE UPLOAD] Copied original file as fallback`);
                } catch (copyError) {
                    console.error(`[MOBILE UPLOAD] Error copying original file:`, copyError);
                    continue; // Skip this file and move to the next one
                }
            }

            // Add to processed files
            processedFiles.push({
                filename: jpegFilename,
                path: jpegPath,
                relativePath: `/uploads/progress_photos/${jpegFilename}`,
                size: fs.existsSync(jpegPath) ? fs.statSync(jpegPath).size : 0
            });

            console.log(`[MOBILE UPLOAD] Added file to processed files: ${jpegFilename}`);

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
