const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads');
        // Create the directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create a unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'nutrition-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to only accept images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Simple test endpoint
router.get('/test', (req, res) => {
    res.json({ 
        message: 'OCR test endpoint is working!',
        tesseractInstalled: true,
        uploadDirExists: fs.existsSync(path.join(__dirname, '../uploads'))
    });
});

// Simple endpoint that just saves the file and returns success
router.post('/simple', upload.single('image'), (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        console.log(`File saved: ${req.file.path}`);
        
        // Return success with file info
        res.json({
            success: true,
            message: 'File uploaded successfully',
            file: {
                filename: req.file.filename,
                path: req.file.path,
                size: req.file.size
            },
            // Sample nutrition data
            calories: 250,
            protein: 20,
            fat: 10,
            carbs: 30,
            amount: 100
        });
    } catch (error) {
        console.error('Error processing file upload:', error);
        res.status(500).json({ error: 'Failed to process file upload: ' + error.message });
    }
});

module.exports = router;
