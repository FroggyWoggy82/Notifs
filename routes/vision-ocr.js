const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        // Create the directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Create a unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'vision-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filter to only allow image files
const fileFilter = (req, file, cb) => {
    // Accept only image files
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
 * Test endpoint to verify the Vision OCR route is working
 */
router.get('/test', (req, res) => {
    console.log('[Vision OCR] Test endpoint hit');
    res.json({
        message: 'Google Cloud Vision OCR endpoint is working!',
        version: '1.0.0'
    });
});

/**
 * Preprocess image to enhance text recognition
 * @param {string} inputPath - Path to the input image
 * @param {string} outputPath - Path to save the preprocessed image
 * @returns {Promise<string>} - Path to the preprocessed image
 */
async function preprocessImage(inputPath, outputPath) {
    try {
        const sharp = require('sharp');
        console.log(`[Vision OCR] Preprocessing image: ${inputPath}`);

        // Apply preprocessing to enhance text visibility
        await sharp(inputPath)
            .resize({ width: 1500, height: 1500, fit: 'inside' }) // Resize while maintaining aspect ratio
            .sharpen() // Sharpen the image
            .normalize() // Normalize the image (improve contrast)
            .toFile(outputPath);

        console.log(`[Vision OCR] Image preprocessed and saved to: ${outputPath}`);
        return outputPath;
    } catch (error) {
        console.error(`[Vision OCR] Error preprocessing image: ${error.message}`);
        // If preprocessing fails, return the original image path
        return inputPath;
    }
}

/**
 * Run Google Cloud Vision OCR on an image
 * @param {string} imagePath - Path to the image to process
 * @returns {Promise<Object>} - Extracted text and features from the image
 */
async function runVisionOCR(imagePath) {
    try {
        console.log(`[Vision OCR] Running Google Cloud Vision on image: ${imagePath}`);

        // Creates a client
        const client = new ImageAnnotatorClient();

        // Read the image file
        const imageFile = fs.readFileSync(imagePath);
        const image = {
            content: imageFile.toString('base64')
        };

        // Perform text detection
        const [textDetectionResult] = await client.textDetection(image);
        const [documentTextResult] = await client.documentTextDetection(image);
        
        // Get annotations
        const textAnnotations = textDetectionResult.textAnnotations || [];
        const fullTextAnnotation = documentTextResult.fullTextAnnotation || {};
        
        // Extract the full text
        const fullText = fullTextAnnotation.text || '';
        
        // Extract individual text elements with bounding boxes
        const textElements = textAnnotations.map((annotation, index) => {
            return {
                id: index,
                text: annotation.description,
                confidence: annotation.confidence || 0.0,
                boundingPoly: annotation.boundingPoly?.vertices || []
            };
        });

        return {
            fullText,
            textElements: textElements.slice(1), // Skip the first element which is the entire text
            rawTextAnnotations: textAnnotations,
            rawFullTextAnnotation: fullTextAnnotation
        };
    } catch (error) {
        console.error(`[Vision OCR] Error running Google Cloud Vision: ${error.message}`);
        throw error;
    }
}

/**
 * Extract nutrition information from OCR results
 * @param {Object} ocrResults - Results from Google Cloud Vision OCR
 * @returns {Object} - Structured nutrition information
 */
function extractNutritionInfo(ocrResults) {
    console.log('[Vision OCR] Extracting nutrition information from OCR results');
    
    // Get the full text from OCR results
    const text = ocrResults.fullText;
    
    // Initialize result object
    const result = {
        success: true,
        calories: null,
        totalFat: null,
        saturatedFat: null,
        transFat: null,
        cholesterol: null,
        sodium: null,
        totalCarbohydrates: null,
        dietaryFiber: null,
        sugars: null,
        addedSugars: null,
        protein: null,
        vitaminD: null,
        calcium: null,
        iron: null,
        potassium: null,
        percentages: {},
        rawText: text
    };

    // Extract calories
    const caloriesMatch = text.match(/calories[:\s]*(\d+)/i) || 
                         text.match(/energy[:\s]*(\d+)/i) ||
                         text.match(/(\d+)\s*kcal/i);
    if (caloriesMatch) {
        result.calories = parseFloat(caloriesMatch[1]);
    }

    // Extract total fat
    const totalFatMatch = text.match(/total\s*fat[:\s]*(\d+\.?\d*)\s*g/i);
    if (totalFatMatch) {
        result.totalFat = parseFloat(totalFatMatch[1]);
    }

    // Extract saturated fat
    const saturatedFatMatch = text.match(/saturated\s*fat[:\s]*(\d+\.?\d*)\s*g/i);
    if (saturatedFatMatch) {
        result.saturatedFat = parseFloat(saturatedFatMatch[1]);
    }

    // Extract trans fat
    const transFatMatch = text.match(/trans\s*fat[:\s]*(\d+\.?\d*)\s*g/i);
    if (transFatMatch) {
        result.transFat = parseFloat(transFatMatch[1]);
    }

    // Extract cholesterol
    const cholesterolMatch = text.match(/cholesterol[:\s]*(\d+\.?\d*)\s*mg/i);
    if (cholesterolMatch) {
        result.cholesterol = parseFloat(cholesterolMatch[1]);
    }

    // Extract sodium
    const sodiumMatch = text.match(/sodium[:\s]*(\d+\.?\d*)\s*mg/i);
    if (sodiumMatch) {
        result.sodium = parseFloat(sodiumMatch[1]);
    }

    // Extract total carbohydrates
    const totalCarbsMatch = text.match(/total\s*carbohydrates?[:\s]*(\d+\.?\d*)\s*g/i) ||
                           text.match(/carbohydrates?[:\s]*(\d+\.?\d*)\s*g/i);
    if (totalCarbsMatch) {
        result.totalCarbohydrates = parseFloat(totalCarbsMatch[1]);
    }

    // Extract dietary fiber
    const fiberMatch = text.match(/dietary\s*fiber[:\s]*(\d+\.?\d*)\s*g/i) ||
                      text.match(/fiber[:\s]*(\d+\.?\d*)\s*g/i);
    if (fiberMatch) {
        result.dietaryFiber = parseFloat(fiberMatch[1]);
    }

    // Extract sugars
    const sugarsMatch = text.match(/sugars[:\s]*(\d+\.?\d*)\s*g/i);
    if (sugarsMatch) {
        result.sugars = parseFloat(sugarsMatch[1]);
    }

    // Extract added sugars
    const addedSugarsMatch = text.match(/added\s*sugars[:\s]*(\d+\.?\d*)\s*g/i);
    if (addedSugarsMatch) {
        result.addedSugars = parseFloat(addedSugarsMatch[1]);
    }

    // Extract protein
    const proteinMatch = text.match(/protein[:\s]*(\d+\.?\d*)\s*g/i);
    if (proteinMatch) {
        result.protein = parseFloat(proteinMatch[1]);
    }

    // Extract vitamin D
    const vitaminDMatch = text.match(/vitamin\s*d[:\s]*(\d+\.?\d*)\s*mcg/i);
    if (vitaminDMatch) {
        result.vitaminD = parseFloat(vitaminDMatch[1]);
    }

    // Extract calcium
    const calciumMatch = text.match(/calcium[:\s]*(\d+\.?\d*)\s*mg/i);
    if (calciumMatch) {
        result.calcium = parseFloat(calciumMatch[1]);
    }

    // Extract iron
    const ironMatch = text.match(/iron[:\s]*(\d+\.?\d*)\s*mg/i);
    if (ironMatch) {
        result.iron = parseFloat(ironMatch[1]);
    }

    // Extract potassium
    const potassiumMatch = text.match(/potassium[:\s]*(\d+\.?\d*)\s*mg/i);
    if (potassiumMatch) {
        result.potassium = parseFloat(potassiumMatch[1]);
    }

    // Extract percentages
    const percentageMatches = text.matchAll(/([a-z\s]+)[\s:]*\d+\.?\d*\s*g?m?c?g?[\s:]*(\d+)%/gi);
    for (const match of percentageMatches) {
        const nutrient = match[1].trim().toLowerCase();
        const percentage = parseInt(match[2]);
        result.percentages[nutrient] = percentage;
    }

    return result;
}

/**
 * Clean up temporary files
 * @param {string} originalPath - Path to the original uploaded file
 * @param {string} preprocessedPath - Path to the preprocessed image
 */
function cleanupFiles(originalPath, preprocessedPath) {
    try {
        // Delete the original file
        if (fs.existsSync(originalPath)) {
            fs.unlinkSync(originalPath);
            console.log(`[Vision OCR] Deleted original file: ${originalPath}`);
        }

        // Delete the preprocessed file if it's different from the original
        if (preprocessedPath !== originalPath && fs.existsSync(preprocessedPath)) {
            fs.unlinkSync(preprocessedPath);
            console.log(`[Vision OCR] Deleted preprocessed file: ${preprocessedPath}`);
        }
    } catch (error) {
        console.error(`[Vision OCR] Error cleaning up files: ${error.message}`);
    }
}

/**
 * Full OCR processing endpoint
 */
router.post('/nutrition', upload.single('image'), async (req, res) => {
    console.log('[Vision OCR] Received nutrition request');
    
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No image file provided'
            });
        }

        console.log(`[Vision OCR] Processing image: ${req.file.path}`);

        // Create a path for the preprocessed image
        const preprocessedImagePath = req.file.path + '-preprocessed.png';

        // Preprocess the image to enhance text
        const imagePathToProcess = await preprocessImage(req.file.path, preprocessedImagePath);

        try {
            // Run Google Cloud Vision OCR on the preprocessed image
            console.log('[Vision OCR] Running Google Cloud Vision OCR...');
            const ocrResults = await runVisionOCR(imagePathToProcess);
            console.log('[Vision OCR] Google Cloud Vision OCR completed successfully');

            // Extract nutrition information from OCR results
            const nutritionInfo = extractNutritionInfo(ocrResults);

            // Clean up files
            cleanupFiles(req.file.path, imagePathToProcess);

            // Return the extracted information
            console.log('[Vision OCR] Returning nutrition info');
            res.json(nutritionInfo);
        } catch (ocrError) {
            console.error('[Vision OCR] OCR processing error:', ocrError);
            res.status(500).json({
                success: false,
                error: `OCR processing error: ${ocrError.message}`
            });
        }
    } catch (error) {
        console.error('[Vision OCR] Error processing request:', error);
        res.status(500).json({
            success: false,
            error: `Error processing request: ${error.message}`
        });
    }
});

module.exports = router;
