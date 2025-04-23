// Combined server for Railway deployment
const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

// Database connection
let db;
let dbConnected = false;

try {
  // Initialize database connection
  console.log('Initializing database connection...');
  db = require('./utils/db');

  // Test the connection
  db.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Database connection error:', err);
      console.log('Server will continue without database functionality');
    } else {
      console.log('Database connected successfully:', res.rows[0]);
      dbConnected = true;
    }
  });
} catch (error) {
  console.error('Failed to initialize database:', error);
  console.log('Server will continue without database functionality');
}

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Log startup information
console.log('Starting combined Railway server...');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('Process ID:', process.pid);
console.log('Working Directory:', process.cwd());
console.log('Environment:', process.env.NODE_ENV || 'development');

// Try to load Sharp, but continue if it fails
let sharp;
try {
  console.log('Attempting to load Sharp...');
  sharp = require('sharp');
  console.log('Sharp loaded successfully!');
  console.log('Sharp version:', sharp.versions ? sharp.versions.sharp : 'unknown');
  console.log('Libvips version:', sharp.versions ? sharp.versions.vips : 'unknown');
} catch (error) {
  console.error('Failed to load Sharp. Error details:');
  console.error('Error message:', error.message);
  console.error('Error stack:', error.stack);
  console.log('System info:', process.platform, process.arch, process.version);
  console.log('Continuing without Sharp functionality - photo uploads may not work correctly');

  // Create a mock Sharp object with basic functionality
  sharp = {
    versions: { sharp: 'not available', vips: 'not available' },
    format: { heif: false },
    resize: () => ({
      jpeg: () => ({
        toFile: async (outputPath) => {
          console.log('Mock Sharp: Would process image to', outputPath);
          return { width: 100, height: 100, size: 1024 };
        }
      }),
      toBuffer: async () => {
        console.log('Mock Sharp: Would return buffer');
        return Buffer.from([]);
      }
    }),
    // Add other methods that might be used
    metadata: async () => ({ width: 100, height: 100, format: 'jpeg' })
  };
}

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Add a dedicated healthcheck endpoint
app.get('/healthcheck', (req, res) => {
  console.log('Healthcheck endpoint hit at', new Date().toISOString());
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Import routes
try {
  // Core routes
  const tasksRouter = require('./routes/tasks');
  const habitsRouter = require('./routes/habitRoutesSimple');
  const workoutsRouter = require('./routes/workouts');
  const journalRouter = require('./routes/journal');
  const daysSinceRouter = require('./routes/daysSinceRoutes');

  // Database connection check middleware
  const dbMiddleware = (req, res, next) => {
    if (!dbConnected) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    next();
  };

  // Set up routes with database check
  app.use('/api/tasks', dbMiddleware, tasksRouter);
  app.use('/api/habits', dbMiddleware, habitsRouter);
  app.use('/api/workouts', dbMiddleware, workoutsRouter);
  app.use('/api/journal', dbMiddleware, journalRouter);
  app.use('/api/days-since', dbMiddleware, daysSinceRouter);

  console.log('Core routes initialized successfully');
} catch (error) {
  console.error('Failed to initialize routes:', error);
  console.log('Server will continue with limited functionality');
}

// API status endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
    sharp: sharp.versions ? 'available' : 'not available',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Combined server running on port ${PORT}`);
  console.log('Server is ready to accept connections');
  console.log(`Healthcheck endpoint available at: http://localhost:${PORT}/healthcheck`);
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
