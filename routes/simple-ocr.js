const express = require('express');
const router = express.Router();

/**
 * Simple test endpoint
 */
router.get('/test', (req, res) => {
    res.json({ message: 'Simple OCR test endpoint is working!' });
});

/**
 * Simple nutrition data endpoint that doesn't require image processing
 */
router.post('/nutrition', (req, res) => {
    console.log('Simple nutrition endpoint called');
    
    // Return sample nutrition data
    res.json({
        success: true,
        calories: 250,
        protein: 20,
        fat: 10,
        carbs: 30,
        amount: 100,
        rawText: "Sample nutrition data from simple-ocr.js"
    });
});

module.exports = router;
