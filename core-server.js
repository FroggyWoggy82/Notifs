// Core server for Railway deployment
const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./utils/db');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Log startup information
console.log('Starting core server...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('PORT:', PORT);

// Database connection status
let dbConnected = false;

// Test the database connection
try {
  // We'll use the existing db.js utility which already handles connection
  console.log('Testing database connection...');

  // Perform a test query
  db.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Database connection error:', err);
      console.log('Server will continue without database functionality');
      dbConnected = false;
    } else {
      console.log('Database connected successfully:', res.rows[0]);
      dbConnected = true;
    }
  });
} catch (error) {
  console.error('Failed to test database connection:', error);
  console.log('Server will continue without database functionality');
  dbConnected = false;
}

// Healthcheck endpoint
app.get('/healthcheck', (req, res) => {
  console.log('Healthcheck endpoint hit at', new Date().toISOString());
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Basic API routes
app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Import routes
const tasksRouter = require('./routes/tasks');

// Use routes with database connection check middleware
app.use('/api/tasks', (req, res, next) => {
  if (!dbConnected) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  next();
}, tasksRouter);

// Habits API route (basic version)
app.get('/api/habits', async (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ error: 'Database not connected' });
  }

  try {
    const result = await db.query('SELECT * FROM habits ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
});

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Core server running on port ${PORT}`);
  console.log('Server is ready to accept connections');
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
