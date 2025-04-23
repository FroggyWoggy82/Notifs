// Import required modules
const express = require('express');
const path = require('path');
const visionApiRoutes = require('./vision-api-route');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3002; // Using port 3002 to avoid conflicts

// Middleware for parsing JSON and URL-encoded data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Mount the Vision API routes
app.use('/api/vision', visionApiRoutes);

// Add a simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Serve the test page
app.get('/vision-test', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'vision-test-page.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Vision API test page available at http://localhost:${PORT}/vision-test`);
});

// Export the app for testing
module.exports = app;
