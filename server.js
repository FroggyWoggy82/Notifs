// Run setup script to ensure all required files exist
require('./config/setup');

const express = require('express');
const cors = require('cors');
const webpush = require('web-push');
const path = require('path');
const cron = require('node-cron');
const sharp = require('sharp');

// Database connection
const db = require('./utils/db'); // Required for database connection initialization

// Import routes
// Using a mix of old and new route files until all are converted to MVC pattern
const goalRoutes = require('./routes/goalRoutes'); // New MVC pattern
const daysSinceRouter = require('./routes/daysSinceRoutes'); // New MVC pattern
const workoutRoutes = require('./routes/workouts'); // New MVC pattern
const photoUploadRoutes = require('./routes/photo-upload'); // NEW: Simplified photo upload route
const mobileUploadRoutes = require('./routes/mobile-upload'); // NEW: Mobile-specific photo upload route
const basicUploadRoutes = require('./routes/basic-upload'); // NEW: Ultra-basic photo upload route
const habitRoutes = require('./routes/habitRoutesSimple'); // Using extremely simplified route handler
const recipeRoutes = require('./routes/recipeRoutes'); // New MVC pattern
const weightRoutes = require('./routes/weight'); // Using old pattern file name for compatibility
const taskRoutes = require('./routes/taskRoutes'); // Using MVC pattern
const notificationRoutes = require('./routes/notificationRoutes'); // New MVC pattern
const exercisePreferencesRoutes = require('./routes/exercisePreferences'); // New route for exercise preferences

// Import Swagger documentation
const { swaggerDocs } = require('./docs/swagger');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());

// Configure body parsers with explicit limits
const MAX_JSON_SIZE = '25mb';
const MAX_URLENCODED_SIZE = '25mb';
console.log(`[Server Config] Body parser configured with limits: JSON=${MAX_JSON_SIZE}, URL-encoded=${MAX_URLENCODED_SIZE}`);
app.use(express.json({ limit: MAX_JSON_SIZE }));
app.use(express.urlencoded({ extended: true, limit: MAX_URLENCODED_SIZE }));

// Middleware to track request IDs and prevent duplicate database connections
app.use((req, res, next) => {
    // Generate a unique request ID
    req.requestId = Date.now() + Math.random().toString(36).substring(2, 15);
    console.log(`Request ${req.method} ${req.path} started with ID: ${req.requestId}`);

    // Clear any existing database connections at the start of each request
    if (global._pgClient) {
        console.log(`Cleaning up existing database client at request start`);
        try {
            global._pgClient.release();
        } catch (e) {
            console.error('Error releasing client:', e);
        }
        global._pgClient = null;
    }

    // Add a listener for when the response is finished
    res.on('finish', () => {
        console.log(`Request ${req.method} ${req.path} (${req.requestId}) completed with status: ${res.statusCode}`);
        // Ensure any database connections are released
        if (global._pgClient) {
            console.log(`Cleaning up database client for request ${req.requestId}`);
            try {
                global._pgClient.release();
            } catch (e) {
                console.error('Error releasing client:', e);
            }
            global._pgClient = null;
        }
    });

    next();
});

// Serve static files with special handling for progress photos
// Disable caching for progress photos to prevent stale images
app.use('/uploads/progress_photos', (req, res, next) => {
    // Disable caching for progress photos
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/goals', goalRoutes);
app.use('/api/days-since', daysSinceRouter);
app.use('/api/workouts', workoutRoutes);
app.use('/api/photos', photoUploadRoutes); // NEW: Photo upload route
app.use('/api/mobile', mobileUploadRoutes); // NEW: Mobile-specific upload route
app.use('/api/basic', basicUploadRoutes); // NEW: Ultra-basic upload route
app.use('/api/habits', habitRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/weight', weightRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/exercise-preferences', exercisePreferencesRoutes);

// Catch-all for API routes to prevent returning HTML for non-existent API endpoints
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: `API endpoint not found: ${req.originalUrl}` });
});

// Setup Swagger documentation
swaggerDocs(app);

// Web Push Configuration
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BLBz5FpXXWgDjQJMDYZ-VENKh-qX1FhL-YhJ3keyGlBSGEQQYfwwucepKWzT2JbIQcUHduvWj5klFuT1UlqxvHQ';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'Qs0OSR2VsBf3t0x0fpTpiBgMGAOegt60NX0F3cYvYpU';

// Configure web push
webpush.setVapidDetails(
  'mailto:kevinguyen022@gmail.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Initialize notification model
const NotificationModel = require('./models/notificationModel');
NotificationModel.initialize();

// Setup daily notification check
NotificationModel.setupDailyCheck(cron.schedule);

// Initialize task reminder service
const TaskReminderService = require('./models/taskReminderService');

// Schedule task reminders daily at 1:00 AM
cron.schedule('0 1 * * *', async () => {
  console.log('Scheduling task reminders');
  await TaskReminderService.scheduleAllTaskReminders();
}, {
  timezone: 'America/Chicago' // Central Time
});

// Setup habit reset at 11:59 PM Central Time
cron.schedule('59 23 * * *', () => {
  console.log('Running habit reset at 11:59 PM Central Time');
  // This cron job runs in the America/Chicago timezone by default
  // The actual reset happens client-side when users load the page after this time
}, {
  timezone: 'America/Chicago' // Explicitly set timezone to Central Time
});

// Error handling middleware
app.use((err, req, res, next) => {
  // ADD More logging here
  console.error('--- Global Error Handler Caught ---');
  console.error('Error Status:', err.status || 500);
  console.error('Error Message:', err.message);
  console.error('Request Path:', req.path);
  console.error('Error Stack:', err.stack); // Log the full stack trace
  console.error('--- End Global Error ---');
  // Existing response logic
  res.status(err.status || 500).json({ // Use err.status if available
    error: 'An unexpected error occurred',
    message: process.env.NODE_ENV === 'production' ? 'Server error' : err.message
  });
});

// Page Routes
app.get('/exercise-history', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'exercise-history.html'));
});

app.get('/workouts', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'workouts.html'));
});

// Fallback Routes
app.get('/pages/goals.html', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'goals.html'));
});

// Fallback for other routes (e.g., for SPAs)
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize database and start the server
const initializeAndStart = async () => {
  try {
    // Test database connection before starting the server
    console.log('Testing database connection...');
    const result = await db.query('SELECT NOW()');
    console.log('Database connection successful:', result.rows[0]);

    // Check sharp features before starting the server
    console.log('--- Sharp Feature Check ---');
    console.log('Sharp Version:', sharp.versions.sharp);
    console.log('Libvips Version:', sharp.versions.vips);
    console.log('Formats:', sharp.format);
    console.log('HEIF Support (via libvips):', sharp.format.heif ? 'Available' : 'NOT Available');
    console.log('--- End Sharp Feature Check ---');

    // Start the server with increased timeout
    const server = app.listen(PORT, async () => {
      console.log(`Server running on port ${PORT}`);

      // Schedule all task reminders on server start
      console.log('Scheduling all task reminders on server start');
      await TaskReminderService.scheduleAllTaskReminders();
    });

    // Set timeout to 5 minutes (300000 ms) for large uploads
    server.timeout = 300000; // 5 minutes
    console.log(`Server timeout set to ${server.timeout}ms (${server.timeout/60000} minutes)`);
  } catch (error) {
    console.error('Failed to connect to database:', error);
    console.log('Server will start anyway, but database features may not work');

    // Start the server even if database connection fails
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (database connection failed)`);
    });

    // Set timeout to 5 minutes (300000 ms) for large uploads
    server.timeout = 300000; // 5 minutes
    console.log(`Server timeout set to ${server.timeout}ms (${server.timeout/60000} minutes)`);
  }
};

initializeAndStart();
