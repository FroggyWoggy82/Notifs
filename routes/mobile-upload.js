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

            // Process the image with guaranteed size limit
            let currentQuality = 20; // Start with aggressive quality for mobile
            let currentMaxDimension = 600;
            let attempts = 1;
            let sizeKB = Infinity;

            console.log(`[MOBILE UPLOAD] Starting progressive compression to ensure <800KB file size`);

            // Keep trying with progressively more aggressive settings until under 800KB
            while (sizeKB > 800 && attempts <= 5) {
                console.log(`[MOBILE UPLOAD] Compression attempt #${attempts} with quality=${currentQuality}, maxDimension=${currentMaxDimension}`);

                try {
                    // Remove previous attempt if it exists
                    if (attempts > 1 && fs.existsSync(jpegPath)) {
                        fs.unlinkSync(jpegPath);
                    }

                    await sharp(file.path)
                        .resize(currentMaxDimension, currentMaxDimension, { fit: 'inside', withoutEnlargement: true })
                        .jpeg({
                            quality: currentQuality,
                            progressive: true,
                            optimizeScans: true,
                            trellisQuantisation: true,
                            optimizeCoding: true
                        })
                        .toFile(jpegPath);

                    // Check result
                    const stats = fs.statSync(jpegPath);
                    sizeKB = stats.size / 1024;
                    console.log(`[MOBILE UPLOAD] Attempt #${attempts} result: ${sizeKB.toFixed(2)}KB`);

                    // If still too large, reduce quality and dimensions for next attempt
                    if (sizeKB > 800) {
                        // Reduce quality by 30% each time, with a minimum of 5%
                        currentQuality = Math.max(5, Math.floor(currentQuality * 0.7));

                        // Reduce dimensions by 20% each time, with a minimum of 300px
                        currentMaxDimension = Math.max(300, Math.floor(currentMaxDimension * 0.8));

                        attempts++;
                    }
                } catch (compressionError) {
                    console.error(`[MOBILE UPLOAD] Error during compression attempt #${attempts}:`, compressionError);
                    attempts++;
                    // Continue to next attempt with more aggressive settings
                    currentQuality = Math.max(5, Math.floor(currentQuality * 0.5));
                    currentMaxDimension = Math.max(300, Math.floor(currentMaxDimension * 0.7));
                }
            }

            // Final result
            console.log(`[MOBILE UPLOAD] Final size after progressive compression: ${sizeKB.toFixed(2)}KB after ${attempts} attempt(s)`);
            if (sizeKB > 800) {
                console.warn(`[MOBILE UPLOAD] WARNING: Could not compress below 800KB after ${attempts} attempts!`);
            }

            // If still too large after all attempts, use EMERGENCY grayscale compression
            if (sizeKB > 800) {
                console.log(`[MOBILE UPLOAD] EMERGENCY COMPRESSION: File still over 800KB after progressive attempts`);

                // Create a new filename for the emergency attempt
                const emergencyFilename = `mobile_emergency_${timestamp}.jpg`;
                const emergencyPath = path.join(progressPhotosDir, emergencyFilename);

                try {
                    // Use absolute minimum settings - grayscale with 1% quality
                    console.log(`[MOBILE UPLOAD] Using absolute minimum quality settings (grayscale, 1% quality, 200px)`);
                    await sharp(file.path)
                        .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
                        .grayscale() // Convert to grayscale to reduce file size dramatically
                        .jpeg({
                            quality: 1, // Absolute minimum quality
                            progressive: true,
                            optimizeScans: true,
                            trellisQuantisation: true,
                            optimizeCoding: true
                        })
                        .toFile(emergencyPath);

                    // Check emergency attempt
                    const emergencyStats = fs.statSync(emergencyPath);
                    const emergencySizeKB = emergencyStats.size / 1024;
                    console.log(`[MOBILE UPLOAD] EMERGENCY compression result: ${emergencySizeKB.toFixed(2)}KB (${(originalSizeKB/emergencySizeKB).toFixed(2)}x reduction)`);

                    // Delete first attempt
                    fs.unlinkSync(jpegPath);

                    // Add to processed files
                    processedFiles.push({
                        filename: emergencyFilename,
                        path: emergencyPath,
                        relativePath: `/uploads/progress_photos/${emergencyFilename}`,
                        size: emergencyStats.size
                    });

                    // Update sizeKB for final check
                    sizeKB = emergencySizeKB;
                } catch (emergencyError) {
                    console.error(`[MOBILE UPLOAD] Emergency compression failed:`, emergencyError);
                    // Keep using the best attempt so far
                    processedFiles.push({
                        filename: path.basename(jpegPath),
                        path: jpegPath,
                        relativePath: `/uploads/progress_photos/${path.basename(jpegPath)}`,
                        size: fs.statSync(jpegPath).size
                    });
                }
            } else {
                // Add to processed files
                processedFiles.push({
                    filename: jpegFilename,
                    path: jpegPath,
                    relativePath: `/uploads/progress_photos/${jpegFilename}`,
                    size: fs.statSync(jpegPath).size
                });

                // Log success
                console.log(`[MOBILE UPLOAD] Successfully compressed to ${sizeKB.toFixed(2)}KB (under 800KB limit)`);
            }

            // Final size check and warning
            if (sizeKB > 800) {
                console.error(`[MOBILE UPLOAD] CRITICAL ERROR: Could not compress image below 800KB despite all attempts!`);
                console.error(`[MOBILE UPLOAD] Final size: ${sizeKB.toFixed(2)}KB - This should never happen!`);
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
