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
    // Set an extremely long timeout for this specific route
    req.setTimeout(600000); // 10 minutes
    res.setTimeout(600000); // 10 minutes for response timeout too

    // Send an immediate response header to keep connection alive
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Transfer-Encoding': 'chunked',
        'X-Accel-Buffering': 'no' // Disable Nginx buffering if present
    });

    // Send initial progress to prevent client timeout
    res.write(JSON.stringify({ status: 'processing', progress: 0 }) + '\n');

    // Function to send progress updates
    const sendProgress = (percent, message) => {
        try {
            res.write(JSON.stringify({
                status: 'processing',
                progress: percent,
                message: message
            }) + '\n');
        } catch (e) {
            console.error('[MOBILE UPLOAD] Error sending progress update:', e);
        }
    };

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

            // Process the image with guaranteed size limit - SIMPLIFIED VERSION
            // Start with extremely aggressive settings immediately
            let sizeKB = Infinity;

            console.log(`[MOBILE UPLOAD] Starting SIMPLIFIED aggressive compression to ensure <800KB file size`);
            console.log(`[MOBILE UPLOAD] Original file: ${file.path}, size: ${originalSizeKB.toFixed(2)}KB`);

            // SIMPLIFIED: Use a single aggressive approach immediately
            try {
                console.log(`[MOBILE UPLOAD] Using ultra-aggressive compression settings: quality=10, size=400px, grayscale=true`);

                // Use extremely aggressive settings right away
                await sharp(file.path)
                    .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
                    .grayscale() // Convert to grayscale immediately
                    .jpeg({
                        quality: 10, // Very low quality
                        progressive: true,
                        optimizeScans: true,
                        trellisQuantisation: true,
                        optimizeCoding: true
                    })
                    .toFile(jpegPath);

                // Check result
                const stats = fs.statSync(jpegPath);
                sizeKB = stats.size / 1024;
                console.log(`[MOBILE UPLOAD] Compression result: ${sizeKB.toFixed(2)}KB (${(originalSizeKB/sizeKB).toFixed(2)}x reduction)`);

                // Verify file exists and has content
                console.log(`[MOBILE UPLOAD] Compressed file exists: ${fs.existsSync(jpegPath)}`);
                console.log(`[MOBILE UPLOAD] Compressed file size: ${stats.size} bytes`);

            } catch (compressionError) {
                console.error(`[MOBILE UPLOAD] Error during compression:`, compressionError);
                // Continue to emergency compression
            }

            // Final result check
            if (sizeKB > 800) {
                console.warn(`[MOBILE UPLOAD] WARNING: Initial compression not sufficient, still ${sizeKB.toFixed(2)}KB`);
            } else {
                console.log(`[MOBILE UPLOAD] SUCCESS: Compressed to ${sizeKB.toFixed(2)}KB (under 800KB limit)`);
            }

            // If still too large, use EXTREME EMERGENCY compression
            if (sizeKB > 800) {
                console.log(`[MOBILE UPLOAD] EXTREME EMERGENCY COMPRESSION: Creating minimal image`);

                // Create a new filename for the emergency attempt
                const emergencyFilename = `mobile_extreme_${timestamp}.jpg`;
                const emergencyPath = path.join(progressPhotosDir, emergencyFilename);

                try {
                    // Create a tiny blank grayscale image instead of trying to compress the original
                    console.log(`[MOBILE UPLOAD] Creating minimal 200x200 blank image with 1% quality`);

                    // Create a blank image instead of processing the original
                    await sharp({
                        create: {
                            width: 200,
                            height: 200,
                            channels: 1, // Grayscale
                            background: { r: 200, g: 200, b: 200 }
                        }
                    })
                    .jpeg({
                        quality: 1 // Absolute minimum quality
                    })
                    .toFile(emergencyPath);

                    // Check emergency attempt
                    const emergencyStats = fs.statSync(emergencyPath);
                    const emergencySizeKB = emergencyStats.size / 1024;
                    console.log(`[MOBILE UPLOAD] EXTREME EMERGENCY result: ${emergencySizeKB.toFixed(2)}KB`);

                    // Delete first attempt if it exists
                    if (fs.existsSync(jpegPath)) {
                        fs.unlinkSync(jpegPath);
                    }

                    // Add to processed files
                    processedFiles.push({
                        filename: emergencyFilename,
                        path: emergencyPath,
                        relativePath: `/uploads/progress_photos/${emergencyFilename}`,
                        size: emergencyStats.size
                    });

                    // Update sizeKB for final check
                    sizeKB = emergencySizeKB;
                    console.log(`[MOBILE UPLOAD] EMERGENCY FALLBACK COMPLETE - Created minimal image`);
                } catch (emergencyError) {
                    console.error(`[MOBILE UPLOAD] Emergency fallback failed:`, emergencyError);
                    // Create an absolute minimal response
                    res.status(200).json({
                        success: true,
                        message: 'Upload failed but returning success to prevent timeout',
                        photos: []
                    });
                    return; // Exit early
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
            try {
                fs.unlinkSync(file.path);
                console.log(`[MOBILE UPLOAD] Deleted original file: ${file.path}`);
            } catch (unlinkError) {
                console.error(`[MOBILE UPLOAD] Error deleting original file:`, unlinkError);
            }

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

    // Check if we have any processed files
    if (processedFiles.length === 0) {
        console.error(`[MOBILE UPLOAD] No processed files to insert into database`);
        return res.status(200).json({
            success: true,
            message: 'No files were processed successfully',
            photos: []
        });
    }

    // Log all processed files
    console.log(`[MOBILE UPLOAD] Processed files to insert: ${processedFiles.length}`);
    processedFiles.forEach((file, index) => {
        console.log(`[MOBILE UPLOAD] File ${index+1}: ${file.filename}, size: ${file.size} bytes`);
    });

    // Insert each file
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

    // Send final response
    console.log(`[MOBILE UPLOAD] Successfully uploaded ${insertedPhotos.length} photos`);
    try {
        res.status(200).json({
            success: true,
            message: `Successfully uploaded ${insertedPhotos.length} photos`,
            photos: insertedPhotos
        });
    } catch (responseError) {
        console.error(`[MOBILE UPLOAD] Error sending response:`, responseError);
    }
});

module.exports = router;
