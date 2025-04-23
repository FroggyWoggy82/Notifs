// Simple server for Railway deployment
const express = require('express');
const app = express();

// Get the port from the environment variable (Railway sets this automatically)
const PORT = process.env.PORT || 3000;

// Log startup information
console.log('Starting Railway server...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('PORT:', PORT);

// Simple healthcheck endpoint
app.get('/healthcheck', (req, res) => {
  console.log('Healthcheck endpoint hit');
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  console.log('Root endpoint hit');
  res.status(200).send('Railway server is running');
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Server is ready to accept connections');
});
