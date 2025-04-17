// Run setup script to ensure all required files exist
require('./config/setup');

const express = require('express');
const cors = require('cors');
const webpush = require('web-push');
const path = require('path');
const cron = require('node-cron');
const sharp = require('sharp');
const fs = require('fs');

// Ensure persistent volume directory exists
const persistentDir = '/data/uploads/progress_photos';
if (!fs.existsSync(persistentDir)) {
    console.log(`Creating persistent directory: ${persistentDir}`);
    fs.mkdirSync(persistentDir, { recursive: true });
}

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
const weightRoutes = require('./routes/weight'); // Main weight routes file
const taskRoutes = require('./routes/taskRoutes'); // Using MVC pattern
const notificationRoutes = require('./routes/notificationRoutes'); // New MVC pattern
const exercisePreferencesRoutes = require('./routes/exercisePreferences'); // New route for exercise preferences
const calorieTargetRoutes = require('./routes/calorieTarget'); // New route for calorie targets
const journalRoutes = require('./routes/journal'); // New route for journal entries

// Import Swagger documentation
const { swaggerDocs } = require('./docs/swagger');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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
app.use('/api/calorie-targets', calorieTargetRoutes);
app.use('/api/journal', journalRoutes); // NEW: Journal entries route

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

// Schedule task reminders daily at 1:00 AM (silently)
cron.schedule('0 1 * * *', async () => {
  await TaskReminderService.scheduleAllTaskReminders();
}, {
  timezone: 'America/Chicago' // Central Time
});

// Setup habit reset at 11:59 PM Central Time (silently)
cron.schedule('59 23 * * *', () => {
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

// Import models that need initialization
const JournalModel = require('./models/journalModel');

// Initialize database and start the server
const initializeAndStart = async () => {
  // Check if offline mode is enabled
  const offlineMode = process.env.OFFLINE_MODE === 'true';

  if (offlineMode) {
    console.log('OFFLINE MODE ENABLED: Skipping database connection test');
    startServer(false);
    return;
  }

  try {
    // Test database connection before starting the server
    console.log('Testing database connection...');

    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database connection test timed out after 10 seconds')), 10000);
    });

    // Create the query promise
    const queryPromise = db.query('SELECT NOW()');

    // Race the query against the timeout
    const result = await Promise.race([queryPromise, timeoutPromise]);
    console.log('Database connection successful:', result.rows[0]);

    // Initialize models
    try {
      await JournalModel.initialize();
      console.log('Journal model initialized successfully');

      try {
        // Initialize the calorie target model
        const CalorieTarget = require('./models/calorieTargetModel');
        await CalorieTarget.initializeTable();
        console.log('Calorie target model initialized successfully');
      } catch (calorieError) {
        console.error('Error initializing calorie target model:', calorieError);
      }
    } catch (modelError) {
      console.error('Error initializing models:', modelError);
    }

    // Start the server with database connection
    startServer(true);
  } catch (error) {
    console.error('Failed to connect to database:', error);
    console.log('Server will start anyway, but database features may not work');

    // Start the server without database connection
    startServer(false);
  }
};

// Function to start the server
const startServer = async (dbConnected) => {
  // Check sharp features before starting the server
  console.log('--- Sharp Feature Check ---');
  console.log('Sharp Version:', sharp.versions.sharp);
  console.log('Libvips Version:', sharp.versions.vips);
  console.log('Formats:', sharp.format);
  console.log('HEIF Support (via libvips):', sharp.format.heif ? 'Available' : 'NOT Available');
  console.log('--- End Sharp Feature Check ---');

  // Start the server with increased timeout and handle port conflicts
  try {
    const server = app.listen(PORT, async () => {
      console.log(`Server running on port ${PORT}${!dbConnected ? ' (database connection failed)' : ''}`);

      // Schedule all task reminders on server start (silently) if database is connected
      if (dbConnected) {
        try {
          await TaskReminderService.scheduleAllTaskReminders();
        } catch (err) {
          console.error('Failed to schedule task reminders:', err);
        }
      }
    });

    // Set timeout to 5 minutes (300000 ms) for large uploads
    server.timeout = 300000; // 5 minutes
    console.log(`Server timeout set to ${server.timeout}ms (${server.timeout/60000} minutes)`);

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please close the application using this port or use a different port.`);
        console.error(`You can run 'node kill-server.js' to attempt to kill the process using port ${PORT}.`);
        process.exit(1);
      } else {
        console.error(`Server error: ${error.message}`);
      }
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Please close the application using this port or use a different port.`);
      console.error(`You can run 'node kill-server.js' to attempt to kill the process using port ${PORT}.`);
    }
    process.exit(1);
  }
};

initializeAndStart();
