// Ultra-minimal server for Railway deployment
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3003;

// Log startup and environment
console.log('Starting ultra-minimal server...');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Environment variables:');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set (not showing value)' : 'Not set');

// Add a dedicated healthcheck endpoint
app.get('/healthcheck', (req, res) => {
  console.log('Healthcheck endpoint hit at', new Date().toISOString());
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  console.log('Root endpoint hit at', new Date().toISOString());
  res.status(200).send('Ultra-minimal server is running');
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Ultra-minimal server running on port ${PORT}`);
  console.log('Server is ready to accept connections');
  console.log(`Healthcheck endpoint available at: http://localhost:${PORT}/healthcheck`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  // Keep the server running despite the error
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Keep the server running despite the rejection
});
