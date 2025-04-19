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
 * Test endpoint to verify the OCR route is working
 */
router.get('/test', (req, res) => {
    res.json({
        message: 'Improved OCR endpoint is working!',
        tesseractVersion: require('tesseract.js/package.json').version
    });
});

/**
 * Simple version for testing that doesn't require OCR processing
 */
router.post('/simple', upload.single('image'), (req, res) => {
    console.log('[Improved OCR] Simple endpoint called');

    // Check if file was uploaded
    if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
    }

    console.log(`[Improved OCR] File received: ${req.file.originalname}, size: ${req.file.size} bytes`);

    // Delete the uploaded file after processing
    fs.unlink(req.file.path, (err) => {
        if (err) console.error('[Improved OCR] Error deleting file:', err);
        else console.log(`[Improved OCR] File deleted: ${req.file.path}`);
    });

    // Return an error instead of sample data
    res.status(422).json({
        success: false,
        error: 'This endpoint requires OCR processing. Please use the /nutrition endpoint instead.'
    });
});

/**
 * Full OCR processing endpoint
 */
router.post('/nutrition', upload.single('image'), async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        console.log(`[Improved OCR] Processing image: ${req.file.path}`);

        try {
            // Create a worker for OCR
            console.log('[Improved OCR] Creating Tesseract worker...');
            const worker = await createWorker('eng');

            // Set page segmentation mode to treat the image as a single block of text
            console.log('[Improved OCR] Setting parameters...');
            await worker.setParameters({
                tessedit_pageseg_mode: PSM.SINGLE_BLOCK, // Assume a single uniform block of text
            });

            // Recognize text from the image
            console.log('[Improved OCR] Recognizing text...');
            const { data } = await worker.recognize(req.file.path);
            console.log('[Improved OCR] Text recognition complete');

            // Extract nutrition information from the OCR text
            console.log('[Improved OCR] Extracted text:', data.text);
            const nutritionInfo = extractNutritionInfo(data.text);

            // Terminate the worker
            console.log('[Improved OCR] Terminating worker...');
            await worker.terminate();
            console.log('[Improved OCR] Worker terminated');

            // Delete the uploaded file after processing
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('[Improved OCR] Error deleting file:', err);
                else console.log(`[Improved OCR] File deleted: ${req.file.path}`);
            });

            // Return the extracted information
            console.log('[Improved OCR] Returning nutrition info:', nutritionInfo);
            res.json(nutritionInfo);
        } catch (ocrError) {
            console.error('[Improved OCR] OCR processing error:', ocrError);

            // If OCR fails, return an error
            res.status(422).json({
                success: false,
                error: 'Failed to process image with OCR: ' + ocrError.message
            });
        }
    } catch (error) {
        console.error('[Improved OCR] Error processing OCR:', error);
        res.status(500).json({ error: 'Failed to process image: ' + error.message });
    }
});

/**
 * Extract nutrition information from OCR text
 * @param {string} text - The OCR extracted text
 * @returns {Object} - Extracted nutrition values
 */
function extractNutritionInfo(text) {
    console.log('[Improved OCR] Extracting nutrition info from text...');

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
        // Convert text to lowercase and remove extra spaces and newlines
        const normalizedText = text.toLowerCase().replace(/\s+/g, ' ').replace(/\n/g, ' ');
        console.log('[Improved OCR] Normalized text:', normalizedText);

        // Extract calories - try multiple formats
        const caloriesMatch = normalizedText.match(/calories?[:\s]+(\d+\.?\d*)/i) ||
                             normalizedText.match(/energy[:\s]+(\d+\.?\d*)\s*kcal/i) ||
                             normalizedText.match(/(\d+\.?\d*)\s*calories/i) ||
                             normalizedText.match(/energy\s*(\d+\.?\d*)/i);

        if (caloriesMatch) {
            result.calories = parseFloat(caloriesMatch[1]);
            console.log('[Improved OCR] Found calories:', result.calories);
        }

        // Extract serving size / amount - try multiple formats
        const servingSizeMatch = normalizedText.match(/serving size[:\s]+(\d+\.?\d*)\s*g/i) ||
                                normalizedText.match(/amount[:\s]+(\d+\.?\d*)\s*g/i) ||
                                normalizedText.match(/(\d+\.?\d*)\s*g\s*per serving/i) ||
                                normalizedText.match(/serving\s*(\d+\.?\d*)\s*g/i);

        if (servingSizeMatch) {
            result.amount = parseFloat(servingSizeMatch[1]);
            console.log('[Improved OCR] Found amount:', result.amount);
        }

        // Extract protein - try multiple formats
        const proteinMatch = normalizedText.match(/protein[:\s]+(\d+\.?\d*)\s*g/i) ||
                            normalizedText.match(/protein\s*(\d+\.?\d*)\s*g/i);

        if (proteinMatch) {
            result.protein = parseFloat(proteinMatch[1]);
            console.log('[Improved OCR] Found protein:', result.protein);
        }

        // Extract fat - try multiple formats
        const fatMatch = normalizedText.match(/fat[:\s]+(\d+\.?\d*)\s*g/i) ||
                        normalizedText.match(/total fat[:\s]+(\d+\.?\d*)\s*g/i) ||
                        normalizedText.match(/fat\s*(\d+\.?\d*)\s*g/i);

        if (fatMatch) {
            result.fat = parseFloat(fatMatch[1]);
            console.log('[Improved OCR] Found fat:', result.fat);
        }

        // Extract carbs - try multiple formats
        const carbsMatch = normalizedText.match(/carbohydrates?[:\s]+(\d+\.?\d*)\s*g/i) ||
                          normalizedText.match(/total carbohydrates?[:\s]+(\d+\.?\d*)\s*g/i) ||
                          normalizedText.match(/carbs[:\s]+(\d+\.?\d*)\s*g/i) ||
                          normalizedText.match(/carbohydrates?\s*(\d+\.?\d*)\s*g/i);

        if (carbsMatch) {
            result.carbs = parseFloat(carbsMatch[1]);
            console.log('[Improved OCR] Found carbs:', result.carbs);
        }

        // Check if we found at least some information
        if (result.calories || result.protein || result.fat || result.carbs) {
            result.success = true;
            console.log('[Improved OCR] Successfully extracted some nutrition info');
        } else {
            console.log('[Improved OCR] Failed to extract any nutrition info');

            // Return with no data found
            result.success = false;
            console.log('[Improved OCR] No nutrition data found in image');
        }
    } catch (error) {
        console.error('[Improved OCR] Error extracting nutrition info:', error);

        // Return with error
        result.success = false;
        result.error = error.message;
        console.log('[Improved OCR] Error processing nutrition data');
    }

    return result;
}

module.exports = router;
