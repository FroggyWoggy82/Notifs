const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createWorker } = require('tesseract.js');

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

// Test endpoint
router.get('/test', (req, res) => {
    res.json({
        message: 'Full OCR endpoint is working!',
        tesseractInstalled: true,
        uploadDirExists: fs.existsSync(path.join(__dirname, '../uploads'))
    });
});

// Full OCR processing endpoint
router.post('/nutrition', upload.single('image'), async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        console.log(`Processing image: ${req.file.path}`);

        try {
            // Create a worker for OCR
            console.log('Creating Tesseract worker...');
            const worker = await createWorker();

            // Initialize the worker with English language
            console.log('Loading language...');
            await worker.loadLanguage('eng');
            console.log('Initializing worker...');
            await worker.initialize('eng');

            // Set page segmentation mode to treat the image as a single block of text
            console.log('Setting parameters...');
            await worker.setParameters({
                tessedit_pageseg_mode: '6', // Assume a single uniform block of text
            });

            // Recognize text from the image
            console.log('Recognizing text...');
            const { data } = await worker.recognize(req.file.path);
            console.log('Text recognition complete');

            // Extract nutrition information from the OCR text
            console.log('Extracted text:', data.text);
            const nutritionInfo = extractNutritionInfo(data.text);

            // Terminate the worker
            console.log('Terminating worker...');
            await worker.terminate();
            console.log('Worker terminated');

            // Delete the uploaded file after processing
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
                else console.log(`File deleted: ${req.file.path}`);
            });

            // Return the extracted information
            console.log('Returning nutrition info:', nutritionInfo);
            res.json(nutritionInfo);
        } catch (ocrError) {
            console.error('OCR processing error:', ocrError);

            // If OCR fails, return error without sample data
            res.status(500).json({
                success: false,
                error: ocrError.message,
                rawText: "OCR failed"
            });
        }
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
    console.log('Extracting nutrition info from text...');

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
        const caloriesMatch = normalizedText.match(/calories?[:\s]+(\d+)/i) ||
                             normalizedText.match(/energy[:\s]+(\d+)\s*kcal/i) ||
                             normalizedText.match(/(\d+)\s*calories/i);
        if (caloriesMatch) {
            result.calories = parseFloat(caloriesMatch[1]);
            console.log('Found calories:', result.calories);
        }

        // Extract serving size / amount
        const servingSizeMatch = normalizedText.match(/serving size[:\s]+(\d+\.?\d*)\s*g/i) ||
                                normalizedText.match(/amount[:\s]+(\d+\.?\d*)\s*g/i) ||
                                normalizedText.match(/(\d+\.?\d*)\s*g\s*per serving/i);
        if (servingSizeMatch) {
            result.amount = parseFloat(servingSizeMatch[1]);
            console.log('Found amount:', result.amount);
        }

        // Extract protein
        const proteinMatch = normalizedText.match(/protein[:\s]+(\d+\.?\d*)\s*g/i) ||
                            normalizedText.match(/protein\s*(\d+\.?\d*)\s*g/i);
        if (proteinMatch) {
            result.protein = parseFloat(proteinMatch[1]);
            console.log('Found protein:', result.protein);
        }

        // Extract fat
        const fatMatch = normalizedText.match(/fat[:\s]+(\d+\.?\d*)\s*g/i) ||
                        normalizedText.match(/total fat[:\s]+(\d+\.?\d*)\s*g/i);
        if (fatMatch) {
            result.fat = parseFloat(fatMatch[1]);
            console.log('Found fat:', result.fat);
        }

        // Extract carbs
        const carbsMatch = normalizedText.match(/carbohydrates?[:\s]+(\d+\.?\d*)\s*g/i) ||
                          normalizedText.match(/total carbohydrates?[:\s]+(\d+\.?\d*)\s*g/i) ||
                          normalizedText.match(/carbs[:\s]+(\d+\.?\d*)\s*g/i);
        if (carbsMatch) {
            result.carbs = parseFloat(carbsMatch[1]);
            console.log('Found carbs:', result.carbs);
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
    }

    return result;
}

module.exports = router;
