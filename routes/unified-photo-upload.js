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
const MAX_FILE_SIZE_MB = 100;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Ensure directory exists
if (!fs.existsSync(progressPhotosDir)) {
    console.log(`[UNIFIED UPLOAD] Creating directory: ${progressPhotosDir}`);
    fs.mkdirSync(progressPhotosDir, { recursive: true });
}

// --- Multer Configuration ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, progressPhotosDir);
    },
    filename: function (req, file, cb) {
        const timestamp = Date.now();
        const randomSuffix = Math.round(Math.random() * 1E9);
        cb(null, `unified_${timestamp}_${randomSuffix}.jpg`);
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

// --- Photo Processing Function ---
async function processPhoto(inputPath, outputPath) {
    try {
        console.log(`[UNIFIED UPLOAD] Processing: ${inputPath} -> ${outputPath}`);
        
        // Process with Sharp - resize and compress
        await sharp(inputPath)
            .resize(1200, 1200, { 
                fit: 'inside', 
                withoutEnlargement: true 
            })
            .jpeg({ 
                quality: 85,
                progressive: true 
            })
            .toFile(outputPath);
        
        // Check final size
        const finalStats = fs.statSync(outputPath);
        const finalSizeKB = finalStats.size / 1024;
        console.log(`[UNIFIED UPLOAD] Processed size: ${finalSizeKB.toFixed(2)}KB`);
        
        return true;
    } catch (error) {
        console.error(`[UNIFIED UPLOAD] Processing failed:`, error);
        return false;
    }
}

// --- Unified Upload Route ---
router.post('/upload', upload.array('photos', 10), async (req, res) => {
    console.log(`[UNIFIED UPLOAD] === UPLOAD REQUEST STARTED ===`);
    console.log(`[UNIFIED UPLOAD] Files received: ${req.files ? req.files.length : 0}`);
    console.log(`[UNIFIED UPLOAD] Request body:`, req.body);
    
    try {
        // Validate files
        if (!req.files || req.files.length === 0) {
            console.log(`[UNIFIED UPLOAD] No files uploaded`);
            return res.status(400).json({ 
                success: false, 
                message: 'No files uploaded' 
            });
        }
        
        // Get date from request or use today
        const date = req.body.date || new Date().toISOString().split('T')[0];
        const photoDate = new Date(date);
        console.log(`[UNIFIED UPLOAD] Processing ${req.files.length} files for date: ${date}`);
        
        const processedPhotos = [];
        
        // Process each file
        for (const file of req.files) {
            console.log(`[UNIFIED UPLOAD] Processing file: ${file.originalname}, size: ${(file.size / 1024).toFixed(2)}KB`);
            
            const timestamp = Date.now();
            const processedFilename = `processed_${timestamp}.jpg`;
            const processedPath = path.join(progressPhotosDir, processedFilename);
            
            // Process the image
            const success = await processPhoto(file.path, processedPath);
            
            if (success) {
                // Verify the processed file exists
                if (fs.existsSync(processedPath)) {
                    const relativePath = `/uploads/progress_photos/${processedFilename}`;
                    
                    // Insert into database with transaction
                    const client = await db.getClient();
                    try {
                        await client.query('BEGIN');
                        
                        const result = await client.query(
                            'INSERT INTO progress_photos (date_taken, file_path) VALUES ($1, $2) RETURNING photo_id',
                            [photoDate, relativePath]
                        );
                        
                        await client.query('COMMIT');
                        
                        processedPhotos.push({
                            photo_id: result.rows[0].photo_id,
                            date_taken: photoDate,
                            file_path: relativePath
                        });
                        
                        console.log(`[UNIFIED UPLOAD] ✅ Successfully saved photo ID: ${result.rows[0].photo_id}`);
                        
                    } catch (dbError) {
                        await client.query('ROLLBACK');
                        console.error(`[UNIFIED UPLOAD] Database error:`, dbError);
                        
                        // Clean up the processed file if database insert failed
                        try {
                            fs.unlinkSync(processedPath);
                        } catch (cleanupError) {
                            console.warn(`[UNIFIED UPLOAD] Could not clean up processed file: ${processedPath}`);
                        }
                    } finally {
                        client.release();
                    }
                } else {
                    console.error(`[UNIFIED UPLOAD] Processed file does not exist: ${processedPath}`);
                }
            } else {
                console.error(`[UNIFIED UPLOAD] Failed to process file: ${file.originalname}`);
            }
            
            // Clean up original uploaded file
            try {
                fs.unlinkSync(file.path);
                console.log(`[UNIFIED UPLOAD] Cleaned up temp file: ${file.path}`);
            } catch (cleanupError) {
                console.warn(`[UNIFIED UPLOAD] Could not clean up temp file: ${file.path}`);
            }
        }
        
        console.log(`[UNIFIED UPLOAD] === UPLOAD COMPLETED ===`);
        console.log(`[UNIFIED UPLOAD] Successfully processed: ${processedPhotos.length}/${req.files.length} files`);
        
        // Return success response
        res.status(200).json({
            success: true,
            message: `Successfully uploaded ${processedPhotos.length} photo(s)`,
            photos: processedPhotos,
            total_uploaded: processedPhotos.length,
            total_attempted: req.files.length
        });
        
    } catch (error) {
        console.error(`[UNIFIED UPLOAD] Unexpected error:`, error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during upload',
            error: error.message
        });
    }
});

module.exports = router;
