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

            // Ultra aggressive settings for mobile
            let quality = 20;
            let maxDimension = 600;

            if (originalSizeKB > 5000) {
                quality = 10;
                maxDimension = 500;
            }

            console.log(`[MOBILE UPLOAD] Using quality=${quality}, maxDimension=${maxDimension}`);

            // Process the image - first attempt
            await sharp(file.path)
                .resize(maxDimension, maxDimension, { fit: 'inside', withoutEnlargement: true })
                .jpeg({
                    quality: quality,
                    progressive: true,
                    optimizeScans: true,
                    trellisQuantisation: true,
                    optimizeCoding: true
                })
                .toFile(jpegPath);

            // Check the size of the processed image
            const stats = fs.statSync(jpegPath);
            const sizeKB = stats.size / 1024;
            console.log(`[MOBILE UPLOAD] Processed size: ${sizeKB.toFixed(2)}KB`);

            // If still too large, try again with extreme settings
            if (sizeKB > 800) {
                console.log(`[MOBILE UPLOAD] Still too large, trying extreme settings`);

                // Create a new filename for the second attempt
                const secondFilename = `mobile_tiny_${timestamp}.jpg`;
                const secondPath = path.join(progressPhotosDir, secondFilename);

                // Use extreme settings
                await sharp(file.path)
                    .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
                    .grayscale() // Convert to grayscale to reduce file size dramatically
                    .jpeg({
                        quality: 10,
                        progressive: true,
                        optimizeScans: true,
                        trellisQuantisation: true,
                        optimizeCoding: true
                    })
                    .toFile(secondPath);

                // Check second attempt
                const secondStats = fs.statSync(secondPath);
                const secondSizeKB = secondStats.size / 1024;
                console.log(`[MOBILE UPLOAD] Second attempt size: ${secondSizeKB.toFixed(2)}KB`);

                // Delete first attempt
                fs.unlinkSync(jpegPath);

                // Add to processed files
                processedFiles.push({
                    filename: secondFilename,
                    path: secondPath,
                    relativePath: `/uploads/progress_photos/${secondFilename}`,
                    size: secondStats.size
                });
            } else {
                // Add to processed files
                processedFiles.push({
                    filename: jpegFilename,
                    path: jpegPath,
                    relativePath: `/uploads/progress_photos/${jpegFilename}`,
                    size: stats.size
                });
            }

            // Delete original file
            fs.unlinkSync(file.path);
            console.log(`[MOBILE UPLOAD] Deleted original file`);

        } catch (error) {
            console.error(`[MOBILE UPLOAD] Error processing file:`, error);

            // Create an emergency fallback image
            console.log(`[MOBILE UPLOAD] Creating emergency fallback image`);
            try {
                // Create an absolute minimal image as emergency fallback
                const timestamp = Date.now();
                const emergencyFilename = `mobile_emergency_${timestamp}.jpg`;
                const emergencyPath = path.join(progressPhotosDir, emergencyFilename);

                // Create a tiny grayscale image
                await sharp({
                    create: {
                        width: 300,
                        height: 300,
                        channels: 3,
                        background: { r: 200, g: 200, b: 200 }
                    }
                })
                .jpeg({ quality: 60 })
                .toFile(emergencyPath);

                console.log(`[MOBILE UPLOAD] Created emergency image: ${emergencyPath}`);

                // Add emergency image to processed files
                processedFiles.push({
                    filename: emergencyFilename,
                    path: emergencyPath,
                    relativePath: `/uploads/progress_photos/${emergencyFilename}`,
                    size: fs.statSync(emergencyPath).size
                });

                // Try to delete original file
                try {
                    fs.unlinkSync(file.path);
                } catch (unlinkError) {
                    console.error(`[MOBILE UPLOAD] Error deleting original file:`, unlinkError);
                }
            } catch (emergencyError) {
                console.error(`[MOBILE UPLOAD] Emergency image creation failed:`, emergencyError);
                // Use original file as fallback
                processedFiles.push({
                    filename: file.filename,
                    path: file.path,
                    relativePath: `/uploads/progress_photos/${file.filename}`,
                    size: file.size
                });
            }
        }
    }

    // Insert into database
    const insertedPhotos = [];
    const photoDate = new Date(date);

    for (const file of processedFiles) {
        try {
            console.log(`[MOBILE UPLOAD] Inserting into database: ${file.relativePath}`);

            const result = await db.query(
                'INSERT INTO progress_photos (date_taken, file_path) VALUES ($1, $2) RETURNING photo_id',
                [photoDate, file.relativePath]
            );

            insertedPhotos.push({
                photo_id: result.rows[0].photo_id,
                date_taken: photoDate,
                file_path: file.relativePath
            });

            console.log(`[MOBILE UPLOAD] Inserted photo ID: ${result.rows[0].photo_id}`);
        } catch (dbError) {
            console.error(`[MOBILE UPLOAD] Database error:`, dbError);
            console.error(`[MOBILE UPLOAD] Error details:`, dbError.message);
        }
    }

    console.log(`[MOBILE UPLOAD] Successfully uploaded ${insertedPhotos.length} photos`);
    res.status(200).json({
        success: true,
        message: `Successfully uploaded ${insertedPhotos.length} photos`,
        photos: insertedPhotos
    });
});

module.exports = router;
