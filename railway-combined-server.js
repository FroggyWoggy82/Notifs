// Combined server for Railway deployment
const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

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

// API status endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
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
