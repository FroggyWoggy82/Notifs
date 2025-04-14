// routes/photo-upload.js - Simplified photo upload route
const express = require('express');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const multer = require('multer');
const db = require('../db');
const router = express.Router();

// --- Configuration ---
const progressPhotosDir = path.join(__dirname, '..', 'public', 'uploads', 'progress_photos');
const MAX_FILE_SIZE_MB = 25;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Ensure the upload directory exists
if (!fs.existsSync(progressPhotosDir)) {
    fs.mkdirSync(progressPhotosDir, { recursive: true });
    console.log(`Created directory: ${progressPhotosDir}`);
}

// --- Multer Configuration ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, progressPhotosDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname) || '.jpg';
        cb(null, 'photos-' + uniqueSuffix + fileExtension);
    }
});

const fileFilter = (req, file, cb) => {
    // Accept all image types
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: MAX_FILE_SIZE_BYTES
    },
    fileFilter: fileFilter
});

// --- Middleware ---
const uploadMiddleware = upload.array('photos', 10);

// --- Routes ---
router.post('/upload', uploadMiddleware, async (req, res) => {
    // Set a longer timeout for this specific route
    req.setTimeout(300000); // 5 minutes

    // Check if this is a mobile upload based on user agent
    const userAgent = req.headers['user-agent'] || '';
    const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent);
    console.log(`[SIMPLE UPLOAD] User agent: ${userAgent}`);
    console.log(`[SIMPLE UPLOAD] Detected ${isMobile ? 'MOBILE' : 'DESKTOP'} upload`);
    console.log(`[SIMPLE UPLOAD] Starting upload process`);
    console.log(`[SIMPLE UPLOAD] Files received: ${req.files ? req.files.length : 0}`);

    // Basic validation
    if (!req.files || req.files.length === 0) {
        console.error('[SIMPLE UPLOAD] No files were uploaded');
        return res.status(400).json({ success: false, message: 'No files were uploaded' });
    }

    // Get date from request
    const date = req.body.date || new Date().toISOString().split('T')[0];
    console.log(`[SIMPLE UPLOAD] Using date: ${date}`);

    try {
        const processedFiles = [];

        // Process each file
        for (const file of req.files) {
            console.log(`[SIMPLE UPLOAD] Processing file: ${file.originalname}`);

            // Create a new filename for the processed image
            const timestamp = Date.now();
            const jpegFilename = `processed_${timestamp}.jpg`;
            const jpegPath = path.join(progressPhotosDir, jpegFilename);

            try {
                // Get original file size
                const originalStats = fs.statSync(file.path);
                const originalSizeKB = originalStats.size / 1024;
                console.log(`[SIMPLE UPLOAD] Original size: ${originalSizeKB.toFixed(2)}KB`);

                // Determine quality based on file size and device type
                let quality = 70;
                let maxDimension = 1200;

                // More aggressive settings for mobile uploads
                if (isMobile) {
                    console.log(`[SIMPLE UPLOAD] Using mobile-optimized settings`);
                    if (originalSizeKB > 3000) {
                        quality = 20; // Very aggressive for large mobile files
                        maxDimension = 800;
                    } else if (originalSizeKB > 1000) {
                        quality = 30;
                        maxDimension = 1000;
                    } else {
                        quality = 40;
                        maxDimension = 1200;
                    }
                } else {
                    // Desktop settings
                    if (originalSizeKB > 5000) {
                        quality = 30;
                        maxDimension = 800;
                    } else if (originalSizeKB > 2000) {
                        quality = 40;
                        maxDimension = 1000;
                    } else if (originalSizeKB > 800) {
                        quality = 50;
                    }
                }

                console.log(`[SIMPLE UPLOAD] Using quality=${quality}, maxDimension=${maxDimension}`);

                // Process the image
                await sharp(file.path)
                    .resize(maxDimension, maxDimension, { fit: 'inside', withoutEnlargement: true })
                    .jpeg({ quality: quality })
                    .toFile(jpegPath);

                // Check result
                const stats = fs.statSync(jpegPath);
                const sizeKB = stats.size / 1024;
                console.log(`[SIMPLE UPLOAD] Processed size: ${sizeKB.toFixed(2)}KB`);

                // If still too large, try again with more aggressive settings
                if (sizeKB > 800) {
                    console.log(`[SIMPLE UPLOAD] Still too large, trying more aggressive settings`);

                    // Create a new filename for the second attempt
                    const secondFilename = `small_${timestamp}.jpg`;
                    const secondPath = path.join(progressPhotosDir, secondFilename);

                    // Use even more aggressive settings for mobile
                    if (isMobile) {
                        console.log(`[SIMPLE UPLOAD] Using ultra-aggressive mobile settings for second attempt`);
                        await sharp(file.path)
                            .resize(500, 500, { fit: 'inside', withoutEnlargement: true })
                            .jpeg({
                                quality: 15,
                                progressive: true,
                                optimizeScans: true,
                                trellisQuantisation: true,
                                optimizeCoding: true
                            })
                            .toFile(secondPath);
                    } else {
                        // Standard second attempt for desktop
                        await sharp(file.path)
                            .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
                            .jpeg({ quality: 30 })
                            .toFile(secondPath);
                    }

                    // Check second attempt
                    const secondStats = fs.statSync(secondPath);
                    const secondSizeKB = secondStats.size / 1024;
                    console.log(`[SIMPLE UPLOAD] Second attempt size: ${secondSizeKB.toFixed(2)}KB`);

                    // For mobile devices, if still too large, try a third extreme attempt
                    if (isMobile && secondSizeKB > 800) {
                        console.log(`[SIMPLE UPLOAD] Mobile image still too large, trying extreme settings`);

                        // Create a new filename for the third attempt
                        const thirdFilename = `tiny_${timestamp}.jpg`;
                        const thirdPath = path.join(progressPhotosDir, thirdFilename);

                        // Use extreme settings - grayscale, tiny dimensions, minimum quality
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
                            .toFile(thirdPath);

                        // Check third attempt
                        const thirdStats = fs.statSync(thirdPath);
                        const thirdSizeKB = thirdStats.size / 1024;
                        console.log(`[SIMPLE UPLOAD] Third attempt size: ${thirdSizeKB.toFixed(2)}KB`);

                        // Delete previous attempts
                        fs.unlinkSync(jpegPath);
                        fs.unlinkSync(secondPath);

                        // Add to processed files
                        processedFiles.push({
                            filename: thirdFilename,
                            path: thirdPath,
                            relativePath: `/uploads/progress_photos/${thirdFilename}`,
                            size: thirdStats.size
                        });
                    } else {
                        // Delete first attempt
                        fs.unlinkSync(jpegPath);

                        // Add to processed files
                        processedFiles.push({
                            filename: secondFilename,
                            path: secondPath,
                            relativePath: `/uploads/progress_photos/${secondFilename}`,
                            size: secondStats.size
                        });
                    }
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
                console.log(`[SIMPLE UPLOAD] Deleted original file`);

            } catch (error) {
                console.error(`[SIMPLE UPLOAD] Error processing file:`, error);

                // Special handling for mobile devices
                if (isMobile) {
                    console.log(`[SIMPLE UPLOAD] Mobile error recovery - creating minimal image`);
                    try {
                        // Create an absolute minimal image as emergency fallback
                        const emergencyFilename = `emergency_${timestamp}.jpg`;
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

                        console.log(`[SIMPLE UPLOAD] Created emergency image: ${emergencyPath}`);

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
                            console.error(`[SIMPLE UPLOAD] Error deleting original file:`, unlinkError);
                        }

                        return; // Skip the code below
                    } catch (emergencyError) {
                        console.error(`[SIMPLE UPLOAD] Emergency image creation failed:`, emergencyError);
                        // Fall through to standard fallback
                    }
                }

                // Standard fallback - use original file
                console.log(`[SIMPLE UPLOAD] Using original file as fallback`);
                processedFiles.push({
                    filename: file.filename,
                    path: file.path,
                    relativePath: `/uploads/progress_photos/${file.filename}`,
                    size: file.size
                });
            }
        }

        // Insert into database
        const insertedPhotos = [];
        const photoDate = new Date(date);

        for (const file of processedFiles) {
            try {
                console.log(`[SIMPLE UPLOAD] Inserting into database: ${file.relativePath}`);

                const result = await db.query(
                    'INSERT INTO progress_photos (date_taken, file_path) VALUES ($1, $2) RETURNING photo_id',
                    [photoDate, file.relativePath]
                );

                insertedPhotos.push({
                    photo_id: result.rows[0].photo_id,
                    date_taken: photoDate,
                    file_path: file.relativePath
                });

                console.log(`[SIMPLE UPLOAD] Inserted photo ID: ${result.rows[0].photo_id}`);
            } catch (dbError) {
                console.error(`[SIMPLE UPLOAD] Database error:`, dbError);
                console.error(`[SIMPLE UPLOAD] Error details:`, dbError.message);
                console.error(`[SIMPLE UPLOAD] Query parameters:`, [photoDate, file.relativePath]);
            }
        }

        console.log(`[SIMPLE UPLOAD] Successfully uploaded ${insertedPhotos.length} photos`);
        res.status(200).json({
            success: true,
            message: `Successfully uploaded ${insertedPhotos.length} photos`,
            photos: insertedPhotos
        });

    } catch (error) {
        console.error('[SIMPLE UPLOAD] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing uploaded files',
            error: error.message
        });
    }
});

module.exports = router;
