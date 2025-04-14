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
                
                // Determine quality based on file size
                let quality = 70;
                let maxDimension = 1200;
                
                if (originalSizeKB > 5000) {
                    quality = 30;
                    maxDimension = 800;
                } else if (originalSizeKB > 2000) {
                    quality = 40;
                    maxDimension = 1000;
                } else if (originalSizeKB > 800) {
                    quality = 50;
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
                    
                    await sharp(file.path)
                        .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
                        .jpeg({ quality: 30 })
                        .toFile(secondPath);
                    
                    // Check second attempt
                    const secondStats = fs.statSync(secondPath);
                    const secondSizeKB = secondStats.size / 1024;
                    console.log(`[SIMPLE UPLOAD] Second attempt size: ${secondSizeKB.toFixed(2)}KB`);
                    
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
                console.log(`[SIMPLE UPLOAD] Deleted original file`);
                
            } catch (error) {
                console.error(`[SIMPLE UPLOAD] Error processing file:`, error);
                
                // Use original file as fallback
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
