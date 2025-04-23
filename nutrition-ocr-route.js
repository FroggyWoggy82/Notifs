// Import required libraries
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { detectNutritionLabel } = require('./nutrition-ocr');

// Create router
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads', 'nutrition-labels');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'nutrition-' + uniqueSuffix + ext);
  }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Initialize multer upload
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
});

// Route to handle nutrition label OCR from file upload
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log(`Processing uploaded file: ${req.file.path}`);
    
    // Process the image with Google Cloud Vision
    const results = await detectNutritionLabel(req.file.path);
    
    if (!results) {
      return res.status(422).json({ error: 'Could not detect text in the image' });
    }
    
    // Return the OCR results
    res.json({
      success: true,
      file: {
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size
      },
      results: results
    });
  } catch (error) {
    console.error('Error processing nutrition label:', error);
    res.status(500).json({ 
      error: 'Error processing nutrition label', 
      message: error.message 
    });
  }
});

// Route to handle nutrition label OCR from base64 image data
router.post('/process-base64', async (req, res) => {
  try {
    const { imageData } = req.body;
    
    if (!imageData) {
      return res.status(400).json({ error: 'No image data provided' });
    }
    
    // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    
    // Create a temporary file to store the image
    const uploadDir = path.join(__dirname, 'uploads', 'nutrition-labels');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filename = 'nutrition-' + Date.now() + '.jpg';
    const filepath = path.join(uploadDir, filename);
    
    // Write the base64 data to a file
    fs.writeFileSync(filepath, base64Data, { encoding: 'base64' });
    
    console.log(`Processing base64 image data, saved to: ${filepath}`);
    
    // Process the image with Google Cloud Vision
    const results = await detectNutritionLabel(filepath);
    
    if (!results) {
      return res.status(422).json({ error: 'Could not detect text in the image' });
    }
    
    // Return the OCR results
    res.json({
      success: true,
      file: {
        filename: filename,
        path: filepath
      },
      results: results
    });
  } catch (error) {
    console.error('Error processing nutrition label:', error);
    res.status(500).json({ 
      error: 'Error processing nutrition label', 
      message: error.message 
    });
  }
});

// Export the router
module.exports = router;
