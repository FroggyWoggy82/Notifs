// Combined server for Railway deployment
const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

// Web Push Configuration
const webpush = require('web-push');
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BLBz5FpXXWgDjQJMDYZ-VENKh-qX1FhL-YhJ3keyGlBSGEQQYfwwucepKWzT2JbIQcUHduvWj5klFuT1UlqxvHQ';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'Qs0OSR2VsBf3t0x0fpTpiBgMGAOegt60NX0F3cYvYpU';

// Configure web push
webpush.setVapidDetails(
  'mailto:kevinguyen022@gmail.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Database connection
let db;
let dbConnected = false;

// Log database configuration
console.log('Database configuration:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set (not showing for security)' : 'Not set');
console.log('DB_HOST:', process.env.DB_HOST || 'Not set');
console.log('DB_PORT:', process.env.DB_PORT || 'Not set');
console.log('DB_NAME:', process.env.DB_NAME || 'Not set');
console.log('DB_USER:', process.env.DB_USER || 'Not set');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'Set (not showing for security)' : 'Not set');

// Function to initialize database
const initializeDatabase = async () => {
  try {
    // Initialize database connection
    console.log('Initializing database connection...');

    // Check if we're using DATABASE_URL or individual credentials
    if (process.env.DATABASE_URL) {
      console.log('Using DATABASE_URL for connection');
    } else if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD) {
      console.log('Using individual database credentials');
    } else {
      console.log('No database credentials provided');
    }

    // Load database module
    db = require('./utils/db');

    // Test the connection with a timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database connection test timed out after 10 seconds')), 10000);
    });

    // Create the query promise
    const queryPromise = db.query('SELECT NOW()');

    // Race the query against the timeout
    const result = await Promise.race([queryPromise, timeoutPromise]);
    console.log('Database connection successful:', result.rows[0]);
    dbConnected = true;

    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    console.error('Error details:', error.message);
    console.log('Server will continue without database functionality');
    dbConnected = false;

    return false;
  }
};

// Initialize database
initializeDatabase().then(success => {
  console.log(`Database initialization ${success ? 'succeeded' : 'failed'}`);
});

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

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
const progressPhotosDir = path.join(uploadsDir, 'progress_photos');

try {
  if (!fs.existsSync(uploadsDir)) {
    console.log(`Creating uploads directory: ${uploadsDir}`);
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  if (!fs.existsSync(progressPhotosDir)) {
    console.log(`Creating progress photos directory: ${progressPhotosDir}`);
    fs.mkdirSync(progressPhotosDir, { recursive: true });
  }

  console.log('Uploads directories created successfully');
} catch (error) {
  console.error('Failed to create uploads directories:', error);
}

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

// Serve uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
  const weightRouter = require('./routes/weight');
  const foodRouter = require('./routes/food');
  const goalRouter = require('./routes/goalRoutes');
  const photoUploadRouter = require('./routes/photo-upload');
  const notificationsRouter = require('./routes/notificationRoutes');
  const subscriptionsRouter = require('./routes/subscriptions');
  const recipeRouter = require('./routes/recipeRoutes');
  const calorieTargetRouter = require('./routes/calorieTarget');
  const exercisePreferencesRouter = require('./routes/exercisePreferences');
  const cronometerNutritionRouter = require('./routes/cronometer-nutrition');
  const memoryRouter = require('./routes/memory');

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
  app.use('/api/weight', dbMiddleware, weightRouter);
  app.use('/api/food', dbMiddleware, foodRouter);
  app.use('/api/goals', dbMiddleware, goalRouter);
  app.use('/api/photos', dbMiddleware, photoUploadRouter);
  app.use('/api/notifications', dbMiddleware, notificationsRouter);
  app.use('/api/subscriptions', dbMiddleware, subscriptionsRouter);
  app.use('/api/recipes', dbMiddleware, recipeRouter);
  app.use('/api/calorie-targets', dbMiddleware, calorieTargetRouter);
  app.use('/api/exercise-preferences', dbMiddleware, exercisePreferencesRouter);
  app.use('/api/cronometer', dbMiddleware, cronometerNutritionRouter);
  app.use('/api/memory', dbMiddleware, memoryRouter);

  console.log('All routes initialized successfully');
} catch (error) {
  console.error('Failed to initialize routes:', error);
  console.error('Error details:', error.message);
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

// Initialize notification model
try {
  const NotificationModel = require('./models/notificationModel');
  const cron = require('node-cron');

  // Initialize notification model
  NotificationModel.initialize();

  // Setup daily notification check
  NotificationModel.setupDailyCheck(cron.schedule);

  // Initialize task reminder service
  const TaskReminderService = require('./models/taskReminderService');

  // Schedule task reminders daily at 1:00 AM (silently)
  cron.schedule('0 1 * * *', async () => {
    if (dbConnected) {
      try {
        console.log('Scheduling task reminders...');
        await TaskReminderService.scheduleAllTaskReminders();
        console.log('Task reminders scheduled successfully');
      } catch (err) {
        console.error('Failed to schedule task reminders:', err);
      }
    } else {
      console.log('Database not connected, skipping task reminder scheduling');
    }
  }, {
    timezone: 'America/Chicago' // Central Time
  });

  // Setup habit reset at 11:59 PM Central Time (silently)
  cron.schedule('59 23 * * *', () => {
    // This cron job runs in the America/Chicago timezone by default
    // The actual reset happens client-side when users load the page after this time
    console.log('Habit reset cron job triggered');
  }, {
    timezone: 'America/Chicago' // Explicitly set timezone to Central Time
  });

  console.log('Notification and cron jobs initialized successfully');
} catch (error) {
  console.error('Failed to initialize notification model or cron jobs:', error);
  console.log('Server will continue without notification functionality');
}

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Combined server running on port ${PORT}`);
  console.log('Server is ready to accept connections');
  console.log(`Healthcheck endpoint available at: http://localhost:${PORT}/healthcheck`);

  // Schedule all task reminders on server start (silently) if database is connected
  if (dbConnected) {
    try {
      const TaskReminderService = require('./models/taskReminderService');
      console.log('Scheduling task reminders on server start...');
      TaskReminderService.scheduleAllTaskReminders().then(() => {
        console.log('Task reminders scheduled successfully on server start');
      }).catch(err => {
        console.error('Failed to schedule task reminders on server start:', err);
      });
    } catch (err) {
      console.error('Failed to load task reminder service:', err);
    }
  }
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
