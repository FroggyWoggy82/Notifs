// routes/vision-ocr.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../public/uploads/ocr');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Mock OCR endpoint for development
router.post('/analyze', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        // In a real implementation, this would call the Google Cloud Vision API
        // For now, we'll return a mock response
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Return mock OCR results
        res.json({
            success: true,
            text: "This is a mock OCR response. In production, this would contain the actual text extracted from the image.",
            confidence: 0.95,
            imageUrl: `/uploads/ocr/${path.basename(req.file.path)}`
        });
    } catch (error) {
        console.error('Error in OCR processing:', error);
        res.status(500).json({ error: 'Failed to process image' });
    }
});

// Get OCR status
router.get('/status', (req, res) => {
    res.json({
        status: 'available',
        message: 'OCR service is running in mock mode'
    });
});

module.exports = router;
