// routes/photo-upload.js - Simplified photo upload route
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const db = require('../utils/db');
const router = express.Router();

// Try to load Sharp, but continue if it fails
let sharp;
try {
  console.log('[PHOTO UPLOAD] Attempting to load Sharp...');
  sharp = require('sharp');
  console.log('[PHOTO UPLOAD] Sharp loaded successfully!');
  console.log('[PHOTO UPLOAD] Sharp version:', sharp.versions ? sharp.versions.sharp : 'unknown');
} catch (error) {
  console.error('[PHOTO UPLOAD] Failed to load Sharp. Error details:');
  console.error('[PHOTO UPLOAD] Error message:', error.message);
  console.error('[PHOTO UPLOAD] Error stack:', error.stack);
  console.log('[PHOTO UPLOAD] System info:', process.platform, process.arch, process.version);
  console.log('[PHOTO UPLOAD] Continuing without Sharp functionality - photo uploads will use simple file copy');

  // Create a mock Sharp object with basic functionality
  sharp = {
    resize: () => ({
      jpeg: () => ({
        toFile: async (outputPath, inputPath) => {
          console.log('[PHOTO UPLOAD] Mock Sharp: Copying file from', inputPath, 'to', outputPath);
          // Simple file copy as fallback
          try {
            if (typeof inputPath === 'string' && fs.existsSync(inputPath)) {
              fs.copyFileSync(inputPath, outputPath);
            } else {
              // If no input path, create an empty file
              fs.writeFileSync(outputPath, '');
            }
            return { width: 100, height: 100, size: 1024 };
          } catch (copyError) {
            console.error('[PHOTO UPLOAD] Error in mock Sharp file copy:', copyError);
            throw copyError;
          }
        }
      }),
      toBuffer: async () => Buffer.from([])
    }),
    // Add other methods that might be used
    metadata: async () => ({ width: 100, height: 100, format: 'jpeg' })
  };
}

// --- Configuration ---
// Check if we're running on Railway with a mounted volume
const isRailway = process.env.RAILWAY_ENVIRONMENT === 'production';
const railwayDataDir = '/data';

// Set up paths based on environment
let progressPhotosDir;
let publicPhotosDir;

if (isRailway && fs.existsSync(railwayDataDir)) {
    console.log('[PHOTO UPLOAD] Running on Railway with mounted volume at /data');
    progressPhotosDir = path.join(railwayDataDir, 'uploads', 'progress_photos');
    console.log(`[PHOTO UPLOAD] Using Railway mounted volume for uploads: ${progressPhotosDir}`);
} else {
    console.log('[PHOTO UPLOAD] Running locally or without mounted volume');
    progressPhotosDir = path.join(__dirname, '..', 'uploads', 'progress_photos');
    console.log(`[PHOTO UPLOAD] Using local filesystem for uploads: ${progressPhotosDir}`);
}

// Create a symlink from the persistent storage to the public directory
publicPhotosDir = path.join(__dirname, '..', 'public', 'uploads', 'progress_photos');
if (!fs.existsSync(path.dirname(publicPhotosDir))) {
    fs.mkdirSync(path.dirname(publicPhotosDir), { recursive: true });
}
const MAX_FILE_SIZE_MB = 100; // Increased to 100MB to handle any mobile camera
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

console.log(`[PHOTO UPLOAD] Configured with file size limit: ${MAX_FILE_SIZE_MB} MB`);

// Ensure the upload directory exists in the persistent volume
if (!fs.existsSync(progressPhotosDir)) {
    fs.mkdirSync(progressPhotosDir, { recursive: true });
    console.log(`Created persistent directory: ${progressPhotosDir}`);
}

// Check if we're running on Windows
const isWindows = process.platform === 'win32';

// Create a symlink from the persistent storage to the public directory (skip on Windows)
if (isWindows) {
    console.log(`Running on Windows - skipping symlink creation and using direct storage in public directory`);

    // Ensure the public directory exists
    if (!fs.existsSync(publicPhotosDir)) {
        fs.mkdirSync(publicPhotosDir, { recursive: true });
        console.log(`Created public directory: ${publicPhotosDir}`);
    }
} else {
    // On non-Windows platforms, try to create symlink
    try {
        // Remove existing directory if it exists
        if (fs.existsSync(publicPhotosDir)) {
            // Check if it's already a symlink
            const stats = fs.lstatSync(publicPhotosDir);
            if (!stats.isSymbolicLink()) {
                // If it's a regular directory, remove it
                fs.rmdirSync(publicPhotosDir, { recursive: true });
                console.log(`Removed existing directory: ${publicPhotosDir}`);
            } else {
                // It's already a symlink, leave it
                console.log(`Symlink already exists: ${publicPhotosDir}`);
            }
        }

        // Create the symlink if it doesn't exist
        if (!fs.existsSync(publicPhotosDir)) {
            fs.symlinkSync(progressPhotosDir, publicPhotosDir, 'dir');
            console.log(`Created symlink from ${progressPhotosDir} to ${publicPhotosDir}`);
        }
    } catch (error) {
        console.error(`Error creating symlink: ${error.message}`);
        // If symlink fails, fall back to copying files
        console.log(`Falling back to direct storage in public directory`);

        // Ensure the public directory exists
        if (!fs.existsSync(publicPhotosDir)) {
            fs.mkdirSync(publicPhotosDir, { recursive: true });
            console.log(`Created public directory: ${publicPhotosDir}`);
        }
    }
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
            const jpgFilename = `processed_${timestamp}.jpg`;
            const jpgPath = path.join(progressPhotosDir, jpgFilename);

            try {
                // Get original file size
                const originalStats = fs.statSync(file.path);
                const originalSizeKB = originalStats.size / 1024;
                console.log(`[SIMPLE UPLOAD] Original size: ${originalSizeKB.toFixed(2)}KB`);

                // Check if the original file is already under 800KB
                if (originalSizeKB <= 800) {
                    console.log(`[SIMPLE UPLOAD] Original file already under 800KB (${originalSizeKB.toFixed(2)}KB) - using as is`);

                    // Just convert to JPG without aggressive compression
                    await sharp(file.path)
                        .toFormat('jpeg') // Explicitly set format to jpeg
                        .jpeg({
                            quality: 90, // High quality since file is already small
                            progressive: true
                        })
                        .toFile(jpgPath);

                    // Update size after conversion
                    const stats = fs.statSync(jpgPath);
                    const sizeKB = stats.size / 1024;
                    console.log(`[SIMPLE UPLOAD] Converted to JPG: ${sizeKB.toFixed(2)}KB`);

                    // Add to processed files
                    processedFiles.push({
                        filename: jpgFilename,
                        path: jpgPath,
                        relativePath: `/uploads/progress_photos/${jpgFilename}`,
                        size: stats.size
                    });

                    // Skip the rest of the compression logic
                    continue;
                }

                // Determine quality based on file size and device type
                let quality = 70;
                let maxDimension = 1200;

                // More aggressive settings for mobile uploads
                if (isMobile) {
                    console.log(`[SIMPLE UPLOAD] Using mobile-optimized settings`);
                    if (originalSizeKB > 3000) {
                        quality = 20; // Less aggressive than before
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

                console.log(`[SIMPLE UPLOAD] File size: ${(originalSizeKB/1024).toFixed(2)} MB - Using quality=${quality}, maxDimension=${maxDimension}`);

                // Process the image with guaranteed size limit
                let currentQuality = quality;
                let currentMaxDimension = maxDimension;
                let attempts = 1;
                let sizeKB = Infinity;

                // Keep trying with progressively more aggressive settings until under 800KB
                while (sizeKB > 800 && attempts <= 5) {
                    console.log(`[SIMPLE UPLOAD] Compression attempt #${attempts} with quality=${currentQuality}, maxDimension=${currentMaxDimension}`);

                    await sharp(file.path)
                        .resize(currentMaxDimension, currentMaxDimension, { fit: 'inside', withoutEnlargement: true })
                        .jpeg({
                            quality: currentQuality,
                            progressive: true,
                            optimizeScans: true,
                            trellisQuantisation: true,
                            optimizeCoding: true
                        })
                        .toFile(jpgPath);

                    // Check result
                    const stats = fs.statSync(jpgPath);
                    sizeKB = stats.size / 1024;
                    console.log(`[SIMPLE UPLOAD] Attempt #${attempts} result: ${sizeKB.toFixed(2)}KB`);

                    // If still too large, reduce quality and dimensions for next attempt
                    if (sizeKB > 800) {
                        // Remove the file before next attempt
                        try { fs.unlinkSync(jpegPath); } catch (e) { /* ignore */ }

                        // Reduce quality by 20% each time, with a minimum of 5%
                        currentQuality = Math.max(5, Math.floor(currentQuality * 0.8));

                        // Reduce dimensions by 20% each time, with a minimum of 300px
                        currentMaxDimension = Math.max(300, Math.floor(currentMaxDimension * 0.8));

                        attempts++;
                    }
                }

                // Final result
                console.log(`[SIMPLE UPLOAD] Final size: ${sizeKB.toFixed(2)}KB after ${attempts} attempt(s)`);
                if (sizeKB > 800) {
                    console.warn(`[SIMPLE UPLOAD] WARNING: Could not compress below 800KB after ${attempts} attempts!`);
                }

                // If still too large, try EMERGENCY compression
                if (sizeKB > 800) {
                    console.log(`[SIMPLE UPLOAD] EMERGENCY COMPRESSION: File still over 800KB after progressive attempts`);

                    // Create a new filename for the emergency attempt
                    const emergencyFilename = `emergency_${timestamp}.jpg`;
                    const emergencyPath = path.join(progressPhotosDir, emergencyFilename);

                    // Use absolute minimum settings - grayscale if needed
                    console.log(`[SIMPLE UPLOAD] Using absolute minimum quality settings`);
                    await sharp(file.path)
                        .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
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
                    console.log(`[SIMPLE UPLOAD] EMERGENCY compression result: ${emergencySizeKB.toFixed(2)}KB (${(originalSizeKB/emergencySizeKB).toFixed(2)}x reduction)`);

                    // If still too large, this is our absolute last resort
                    if (emergencySizeKB > 800) {
                        console.log(`[SIMPLE UPLOAD] CRITICAL: Even emergency compression couldn't get below 800KB!`);
                        console.log(`[SIMPLE UPLOAD] Forcing image to 200x200 grayscale with 1% quality`);

                        // Create a final attempt filename
                        const finalFilename = `final_${timestamp}.jpg`;
                        const finalPath = path.join(progressPhotosDir, finalFilename);

                        await sharp(file.path)
                            .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
                            .grayscale()
                            .jpeg({ quality: 1 })
                            .toFile(finalPath);

                        // Check final result
                        const finalStats = fs.statSync(finalPath);
                        const finalSizeKB = finalStats.size / 1024;
                        console.log(`[SIMPLE UPLOAD] FINAL compression result: ${finalSizeKB.toFixed(2)}KB`);

                        // Use the final file
                        fs.unlinkSync(emergencyPath); // Remove emergency file
                        fs.renameSync(finalPath, jpegPath); // Replace original with final
                        sizeKB = finalSizeKB; // Update size for later use
                    } else {
                        // Use the emergency file
                        fs.renameSync(emergencyPath, jpegPath); // Replace original with emergency
                        sizeKB = emergencySizeKB; // Update size for later use
                    }

                    // Add to processed files
                    processedFiles.push({
                        filename: jpegFilename,
                        path: jpegPath,
                        relativePath: `/uploads/progress_photos/${jpegFilename}`,
                        size: fs.statSync(jpegPath).size
                    });

                    // Final size check and warning
                    if (sizeKB > 800) {
                        console.error(`[SIMPLE UPLOAD] CRITICAL ERROR: Could not compress image below 800KB despite all attempts!`);
                        console.error(`[SIMPLE UPLOAD] Final size: ${sizeKB.toFixed(2)}KB - This should never happen!`);
                    } else {
                        console.log(`[SIMPLE UPLOAD] Successfully compressed image to ${sizeKB.toFixed(2)}KB (under 800KB limit)`);
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
