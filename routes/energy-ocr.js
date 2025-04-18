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
        message: 'Energy OCR endpoint is working!',
        tesseractInstalled: true,
        uploadDirExists: fs.existsSync(path.join(__dirname, '../uploads'))
    });
});

// Simple version for testing
router.post('/simple', upload.single('image'), (req, res) => {
    console.log('Simple energy endpoint called');
    
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
        calories: 272.8,
        protein: 0,
        fat: 0,
        carbs: 0,
        amount: 100,
        rawText: "Energy 272.8 kcal"
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
            const nutritionInfo = extractEnergyInfo(data.text);
            
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
 * Extract energy information from OCR text
 * @param {string} text - The OCR extracted text
 * @returns {Object} - Extracted nutrition values
 */
function extractEnergyInfo(text) {
    console.log('Extracting energy info from text...');
    
    // Initialize result object with default values
    const result = {
        calories: null,
        amount: 100, // Default amount
        protein: 0,
        fat: 0,
        carbs: 0,
        success: false,
        rawText: text
    };

    try {
        // Convert text to lowercase for some matches
        const normalizedText = text.toLowerCase();
        
        // Extract calories - specifically looking for Energy values
        // First try exact format from the example
        const energyKcalMatch = text.match(/Energy\s+(\d+\.?\d*)\s*kcal/i);
        
        // Alternative formats
        const energyMatch = text.match(/Energy\s+(\d+\.?\d*)/i) ||
                           normalizedText.match(/energy[:\s]+(\d+\.?\d*)/i);
                           
        // Traditional calorie formats as fallback
        const caloriesMatch = normalizedText.match(/calories?[:\s]+(\d+\.?\d*)/i) ||
                             normalizedText.match(/(\d+\.?\d*)\s*calories/i);
        
        if (energyKcalMatch) {
            result.calories = parseFloat(energyKcalMatch[1]);
            console.log('Found calories from Energy kcal field:', result.calories);
        } else if (energyMatch) {
            result.calories = parseFloat(energyMatch[1]);
            console.log('Found calories from Energy field:', result.calories);
        } else if (caloriesMatch) {
            result.calories = parseFloat(caloriesMatch[1]);
            console.log('Found calories from Calories field:', result.calories);
        }
        
        // Check if we found energy information
        if (result.calories) {
            result.success = true;
            console.log('Successfully extracted energy info');
        } else {
            console.log('Failed to extract any energy info');
            throw new Error('Could not find Energy information in the image');
        }
    } catch (error) {
        console.error('Error extracting energy info:', error);
        throw error; // Re-throw to be caught by the caller
    }
    
    return result;
}

module.exports = router;
