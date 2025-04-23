// This file shows how to integrate the Google Cloud Vision API routes
// with your existing Express application

// Import required modules
const express = require('express');
const path = require('path');
const nutritionOcrRoutes = require('./nutrition-ocr-route');

// Create Express app (or use your existing app)
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON and URL-encoded data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Mount the nutrition OCR routes
app.use('/api/nutrition-ocr', nutritionOcrRoutes);

// Add a simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Nutrition OCR API available at http://localhost:${PORT}/api/nutrition-ocr/upload`);
});

// Export the app for testing
module.exports = app;
