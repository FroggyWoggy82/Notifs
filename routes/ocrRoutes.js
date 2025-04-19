const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createWorker, PSM } = require('tesseract.js');

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

/**
 * Simple test endpoint to verify the OCR route is working
 */
router.get('/test', (req, res) => {
    res.json({ message: 'OCR test endpoint is working!' });
});

/**
 * @swagger
 * /api/ocr/nutrition:
 *   post:
 *     summary: Upload an image and extract nutrition information using OCR
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: image
 *         type: file
 *         description: The image file containing nutrition information
 *     responses:
 *       200:
 *         description: Nutrition information extracted successfully
 *       400:
 *         description: Invalid input or no image provided
 *       500:
 *         description: Server error
 */
// Simple version for testing
router.post('/nutrition-simple', upload.single('image'), (req, res) => {
    console.log('Simple nutrition endpoint called');

    // Check if file was uploaded
    if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
    }

    console.log(`File received: ${req.file.originalname}, size: ${req.file.size} bytes`);

    // Delete the uploaded file after processing
    fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
        else console.log(`File deleted: ${req.file.path}`);
    });

    res.json({
        success: true,
        calories: 250,
        protein: 20,
        fat: 10,
        carbs: 30,
        amount: 100,
        rawText: "Sample nutrition data from simple endpoint"
    });
});

// Original implementation with OCR
router.post('/nutrition', upload.single('image'), async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        console.log(`Processing image: ${req.file.path}`);

        // Create a worker for OCR
        const worker = await createWorker('eng');

        // Set page segmentation mode to treat the image as a single block of text
        await worker.setParameters({
            tessedit_pageseg_mode: PSM.SINGLE_BLOCK, // Assume a single uniform block of text
        });

        // Recognize text from the image
        const { data } = await worker.recognize(req.file.path);

        // Extract nutrition information from the OCR text
        const nutritionInfo = extractNutritionInfo(data.text);

        // Terminate the worker
        await worker.terminate();

        // Delete the uploaded file after processing
        fs.unlink(req.file.path, (err) => {
            if (err) console.error('Error deleting file:', err);
        });

        // Return the extracted information
        res.json(nutritionInfo);
    } catch (error) {
        console.error('Error processing OCR:', error);
        res.status(500).json({ error: 'Failed to process image: ' + error.message });
    }
});

/**
 * Extract nutrition information from OCR text
 * @param {string} text - The OCR extracted text
 * @returns {Object} - Extracted nutrition values
 */
function extractNutritionInfo(text) {
    console.log('Extracted text:', text);

    // Initialize result object with default values
    const result = {
        calories: null,
        amount: null,
        protein: null,
        fat: null,
        carbs: null,
        success: false,
        rawText: text
    };

    try {
        // Convert text to lowercase and remove extra spaces
        const normalizedText = text.toLowerCase().replace(/\\s+/g, ' ');

        // Extract calories
        const caloriesMatch = normalizedText.match(/calories?[:\s]+(\d+\.?\d*)/i) ||
                             normalizedText.match(/energy[:\s]+(\d+\.?\d*)\s*kcal/i) ||
                             normalizedText.match(/(\d+\.?\d*)\s*calories/i);
        if (caloriesMatch) {
            result.calories = parseFloat(caloriesMatch[1]);
        }

        // Extract serving size / amount
        const servingSizeMatch = normalizedText.match(/serving size[:\s]+(\d+\.?\d*)\s*g/i) ||
                                normalizedText.match(/amount[:\s]+(\d+\.?\d*)\s*g/i) ||
                                normalizedText.match(/(\d+\.?\d*)\s*g\s*per serving/i);
        if (servingSizeMatch) {
            result.amount = parseFloat(servingSizeMatch[1]);
        }

        // Extract protein
        const proteinMatch = normalizedText.match(/protein[:\s]+(\d+\.?\d*)\s*g/i) ||
                            normalizedText.match(/protein\s*(\d+\.?\d*)\s*g/i);
        if (proteinMatch) {
            result.protein = parseFloat(proteinMatch[1]);
        }

        // Extract fat
        const fatMatch = normalizedText.match(/fat[:\s]+(\d+\.?\d*)\s*g/i) ||
                        normalizedText.match(/total fat[:\s]+(\d+\.?\d*)\s*g/i);
        if (fatMatch) {
            result.fat = parseFloat(fatMatch[1]);
        }

        // Extract carbs
        const carbsMatch = normalizedText.match(/carbohydrates?[:\s]+(\d+\.?\d*)\s*g/i) ||
                          normalizedText.match(/total carbohydrates?[:\s]+(\d+\.?\d*)\s*g/i) ||
                          normalizedText.match(/carbs[:\s]+(\d+\.?\d*)\s*g/i);
        if (carbsMatch) {
            result.carbs = parseFloat(carbsMatch[1]);
        }

        // Check if we found at least some information
        if (result.calories || result.protein || result.fat || result.carbs) {
            result.success = true;
            console.log('Successfully extracted some nutrition info');
        } else {
            console.log('Failed to extract any nutrition info');
            throw new Error('Could not find any nutrition information in the image');
        }
    } catch (error) {
        console.error('Error extracting nutrition info:', error);
        throw error; // Re-throw to be caught by the caller
    }

    return result;
}

module.exports = router;
