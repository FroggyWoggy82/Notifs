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

// Mock OCR implementation for nutrition labels
router.post('/nutrition', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Return mock nutrition data
        res.json({
            success: true,
            rawText: "Mock nutrition label text. This would normally be the raw text extracted from the image.",
            calories: 190.9,
            protein: 8.5,
            fat: 12.1,
            carbs: 12.6,
            fiber: 0.5,
            sugars: 12.0,
            sodium: 132.2,
            calcium: 308.4,
            iron: 0.0,
            potassium: 405.3,
            vitaminA: 0.0,
            vitaminC: 0.0,
            vitaminD: 0.0,
            confidence: 0.95,
            imageUrl: `/uploads/ocr/${path.basename(req.file.path)}`
        });
    } catch (error) {
        console.error('Error in OCR processing:', error);
        res.status(500).json({ error: 'Failed to process image' });
    }
});

// Mock OCR endpoint for general text analysis
router.post('/analyze', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

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
