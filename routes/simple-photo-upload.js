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
const MAX_FILE_SIZE_MB = 25;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Ensure directory exists
if (!fs.existsSync(progressPhotosDir)) {
    console.log(`Creating directory: ${progressPhotosDir}`);
    fs.mkdirSync(progressPhotosDir, { recursive: true });
}

// --- Multer Configuration ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, progressPhotosDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'progress-' + uniqueSuffix + '.jpg');
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE_BYTES },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// --- Simple Photo Processing Function ---
async function processPhoto(inputPath, outputPath) {
    console.log(`[SIMPLE PHOTO] Processing: ${inputPath} -> ${outputPath}`);
    
    try {
        // Get original file size
        const originalStats = fs.statSync(inputPath);
        const originalSizeKB = originalStats.size / 1024;
        console.log(`[SIMPLE PHOTO] Original size: ${originalSizeKB.toFixed(2)}KB`);
        
        // Process image with consistent settings
        await sharp(inputPath)
            .rotate() // Apply EXIF rotation and remove EXIF data
            .resize(1200, 1200, { 
                fit: 'inside', 
                withoutEnlargement: true 
            })
            .jpeg({ 
                quality: originalSizeKB > 2000 ? 60 : 80,
                progressive: true 
            })
            .toFile(outputPath);
        
        // Check final size
        const finalStats = fs.statSync(outputPath);
        const finalSizeKB = finalStats.size / 1024;
        console.log(`[SIMPLE PHOTO] Final size: ${finalSizeKB.toFixed(2)}KB`);
        
        return true;
    } catch (error) {
        console.error(`[SIMPLE PHOTO] Processing failed:`, error);
        return false;
    }
}

// --- Upload Route ---
router.post('/upload', upload.array('photos', 10), async (req, res) => {
    console.log(`[SIMPLE PHOTO] Upload request received`);
    
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No files uploaded' 
            });
        }
        
        const date = req.body.date || new Date().toISOString().split('T')[0];
        console.log(`[SIMPLE PHOTO] Processing ${req.files.length} files for date: ${date}`);
        
        const processedPhotos = [];
        
        for (const file of req.files) {
            console.log(`[SIMPLE PHOTO] Processing file: ${file.originalname}`);
            
            // Create final filename
            const timestamp = Date.now();
            const finalFilename = `processed_${timestamp}.jpg`;
            const finalPath = path.join(progressPhotosDir, finalFilename);
            
            // Process the photo
            const success = await processPhoto(file.path, finalPath);
            
            if (success) {
                // Save to database
                const photoDate = new Date(date);
                const relativePath = `/uploads/progress_photos/${finalFilename}`;
                
                const result = await db.query(
                    'INSERT INTO progress_photos (date_taken, file_path) VALUES ($1, $2) RETURNING photo_id',
                    [photoDate, relativePath]
                );
                
                processedPhotos.push({
                    photo_id: result.rows[0].photo_id,
                    date_taken: photoDate,
                    file_path: relativePath
                });
                
                console.log(`[SIMPLE PHOTO] Saved photo ID: ${result.rows[0].photo_id}`);
            }
            
            // Clean up original uploaded file
            try {
                fs.unlinkSync(file.path);
            } catch (cleanupError) {
                console.warn(`[SIMPLE PHOTO] Could not clean up temp file: ${file.path}`);
            }
        }
        
        if (processedPhotos.length === 0) {
            return res.status(500).json({
                success: false,
                message: 'Failed to process any photos'
            });
        }
        
        res.json({
            success: true,
            message: `Successfully uploaded ${processedPhotos.length} photo(s)`,
            photos: processedPhotos
        });
        
    } catch (error) {
        console.error('[SIMPLE PHOTO] Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Upload failed: ' + error.message
        });
    }
});

module.exports = router;
