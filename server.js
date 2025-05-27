// Run setup script to ensure all required files exist
require('./config/setup');

const express = require('express');
const cors = require('cors');
const webpush = require('web-push');
const path = require('path');
const cron = require('node-cron');
const sharp = require('sharp');
const fs = require('fs');
const v8 = require('v8');

// Ensure upload directories exist
const isProduction = process.env.NODE_ENV === 'production';
const persistentDir = isProduction
    ? '/data/uploads/progress_photos'
    : path.join(__dirname, 'public/uploads/progress_photos');

try {
    if (!fs.existsSync(persistentDir)) {
        console.log(`Creating persistent directory: ${persistentDir}`);
        fs.mkdirSync(persistentDir, { recursive: true });
    }
} catch (error) {
    console.error(`Error creating persistent directory: ${error.message}`);
    console.log('Will attempt to use public/uploads directory instead');

    // Fallback to public/uploads directory
    const fallbackDir = path.join(__dirname, 'public/uploads/progress_photos');
    if (!fs.existsSync(fallbackDir)) {
        console.log(`Creating fallback directory: ${fallbackDir}`);
        fs.mkdirSync(fallbackDir, { recursive: true });
    }
}

// Database connection
const db = require('./utils/db'); // Required for database connection initialization

// Import models
const NotificationModel = require('./models/notificationModel');

// Import routes
// Using a mix of old and new route files until all are converted to MVC pattern
const goalRoutes = require('./routes/goalRoutes'); // New MVC pattern
const daysSinceRouter = require('./routes/daysSinceRoutes'); // New MVC pattern
const workoutRoutes = require('./routes/workouts'); // New MVC pattern
const photoUploadRoutes = require('./routes/photo-upload'); // NEW: Simplified photo upload route
const mobileUploadRoutes = require('./routes/mobile-upload'); // NEW: Mobile-specific photo upload route
const basicUploadRoutes = require('./routes/basic-upload'); // NEW: Ultra-basic photo upload route
const simplePhotoUploadRoutes = require('./routes/simple-photo-upload'); // NEW: Single photo upload route
const habitRoutes = require('./routes/habitRoutesSimple'); // Using extremely simplified route handler
const recipeRoutes = require('./routes/recipeRoutes'); // New MVC pattern
const recipeIngredientRoutes = require('./routes/recipeIngredientRoutes'); // NEW: Recipe ingredient routes
const uniqueIngredientsRoutes = require('./routes/uniqueIngredients'); // NEW: Unique ingredients route
const ingredientDetailsRoutes = require('./routes/ingredientDetailsRoutes'); // NEW: Ingredient details route
const ingredientRoutes = require('./config/routes/simpleIngredientRoutes'); // NEW: Simplified ingredient routes
const recentIngredientsRoutes = require('./routes/recentIngredientsRoutes'); // NEW: Recent ingredients route
const debugRoutes = require('./routes/debugRoutes'); // DEBUG: Routes for debugging
const directUpdateRoutes = require('./routes/directUpdateRoutes'); // DIRECT: Routes for direct updates
const packageAmountRoutes = require('./routes/packageAmountRoutes'); // PACKAGE: Routes for package amount
const directTransFatUpdate = require('./routes/directTransFatUpdate'); // DIRECT: Routes for trans fat updates
const weightRoutes = require('./routes/weight'); // Main weight routes file
const weightFieldRoutes = require('./routes/weightFieldRoutes'); // Weight field routes for independent saving
const customGoalWeightRoutes = require('./routes/customGoalWeightRoutes'); // Custom goal weight routes
const taskRoutes = require('./routes/taskRoutes'); // Using MVC pattern
const notificationRoutes = require('./routes/notificationRoutes'); // New MVC pattern
const exercisePreferencesRoutes = require('./routes/exercisePreferences'); // New route for exercise preferences
const calorieTargetRoutes = require('./routes/calorieTarget'); // New route for calorie targets
const calorieFieldRoutes = require('./routes/calorieFieldRoutes'); // Calorie field routes for independent saving
const journalRoutes = require('./routes/journal'); // New route for journal entries
const visionOcrRoutes = require('./routes/vision-ocr'); // Google Cloud Vision OCR implementation
const cronometerNutritionRoutes = require('./routes/cronometer-nutrition'); // Cronometer nutrition data scraper
const mealRoutes = require('./routes/mealRoutes'); // NEW: Meal routes
const habitResetRoutes = require('./routes/habitResetRoutes'); // New route for habit reset
const socialMediaRejectionRoutes = require('./routes/socialMediaRejectionRoutes'); // NEW: Social Media Rejection habit routes

// Import Swagger documentation
const { swaggerDocs } = require('./docs/swagger');

// Initialize Express app
const app = express();

// Parse command line arguments for port
const args = process.argv.slice(2);
let portArg;
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--port=')) {
    portArg = args[i].split('=')[1];
    break;
  } else if (args[i] === '--port' && i + 1 < args.length) {
    portArg = args[i + 1];
    break;
  }
}

const PORT = process.env.PORT || portArg || 3000; // Default to 3000 if no port specified

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

    // Skip logging for static files and icons
    const isStaticFile = req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i);
    const isIconRequest = req.path.includes('icon-');
    const shouldLog = !isStaticFile && !isIconRequest;

    // Store logging preference on the request object
    req.shouldLog = shouldLog;

    if (shouldLog) {
        console.log(`Request ${req.method} ${req.path} started with ID: ${req.requestId}`);
    }

    // Clear any existing database connections at the start of each request
    if (global._pgClient) {
        if (shouldLog) {
            console.log(`Cleaning up existing database client at request start`);
        }
        try {
            global._pgClient.release();
        } catch (e) {
            console.error('Error releasing client:', e);
        }
        global._pgClient = null;
    }

    // Add a listener for when the response is finished
    res.on('finish', () => {
        if (shouldLog) {
            console.log(`Request ${req.method} ${req.path} (${req.requestId}) completed with status: ${res.statusCode}`);
        }

        // Ensure any database connections are released
        if (global._pgClient) {
            if (shouldLog) {
                console.log(`Cleaning up database client for request ${req.requestId}`);
            }
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

// Health check endpoint
app.get('/health', (req, res) => {
  try {
    const healthData = {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
      database: global._pgClient ? 'CONNECTED' : 'NOT_CONNECTED',
      railway: {
        environment: process.env.RAILWAY_ENVIRONMENT || 'NOT_RAILWAY',
        service: process.env.RAILWAY_SERVICE_NAME || 'unknown',
        deployment: process.env.RAILWAY_DEPLOYMENT_ID || 'unknown'
      },
      port: PORT,
      version: require('./package.json').version
    };

    // Set appropriate status code
    res.status(200).json(healthData);
  } catch (error) {
    console.error('Health check error:', error);
    // Return a minimal health response even if there's an error
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      error: 'Health check partial failure',
      uptime: process.uptime()
    });
  }
});

// Simple health check endpoint for Railway (fallback)
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// API Routes
app.use('/api/goals', goalRoutes);
app.use('/api/days-since', daysSinceRouter);
app.use('/api/workouts', workoutRoutes);
app.use('/api/photos', photoUploadRoutes); // NEW: Photo upload route
app.use('/api/mobile', mobileUploadRoutes); // NEW: Mobile-specific upload route
app.use('/api/basic', basicUploadRoutes); // NEW: Ultra-basic upload route
app.use('/api/simple-photos', simplePhotoUploadRoutes); // NEW: Single photo upload route
app.use('/api/habits', habitRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/recipe-ingredients', recipeIngredientRoutes); // NEW: Recipe ingredient routes
app.use('/api/unique-ingredients', uniqueIngredientsRoutes); // NEW: Unique ingredients route
app.use('/api/ingredient-details', ingredientDetailsRoutes); // NEW: Ingredient details route
app.use('/api/ingredients', ingredientRoutes); // NEW: Enhanced ingredient routes
app.use('/api/recent-ingredients', recentIngredientsRoutes); // NEW: Recent ingredients route
app.use('/api/debug', debugRoutes); // DEBUG: Routes for debugging
app.use('/api/direct-update', directUpdateRoutes); // DIRECT: Routes for direct updates
app.use('/api/package-amount', packageAmountRoutes); // PACKAGE: Routes for package amount
app.use('/api/direct', directTransFatUpdate); // DIRECT: Routes for trans fat updates
app.use('/api/weight', weightRoutes);
app.use('/api/weight', weightFieldRoutes); // NEW: Weight field routes for independent saving
app.use('/api/custom-goal-weights', customGoalWeightRoutes); // NEW: Custom goal weights route
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/exercise-preferences', exercisePreferencesRoutes);
app.use('/api/calorie-targets', calorieTargetRoutes);
app.use('/api/calorie-targets', calorieFieldRoutes); // NEW: Calorie field routes for independent saving
app.use('/api/journal', journalRoutes); // NEW: Journal entries route
app.use('/api/habit-reset', habitResetRoutes); // NEW: Habit reset route
app.use('/api/meals', mealRoutes); // NEW: Meal routes
app.use('/api', socialMediaRejectionRoutes); // NEW: Social Media Rejection habit routes
console.log('Registering Google Cloud Vision OCR routes...');
app.use('/api/vision-ocr', visionOcrRoutes); // Google Cloud Vision OCR implementation
console.log('Google Cloud Vision OCR routes registered successfully!');

console.log('Registering Cronometer Nutrition routes...');
app.use('/api/cronometer', cronometerNutritionRoutes); // Cronometer nutrition data scraper
console.log('Cronometer Nutrition routes registered successfully!');

// Simple endpoint to handle push notification subscriptions
app.post('/api/save-subscription', (req, res) => {
    try {
        // Use the notification model to save the subscription
        const subscription = req.body;
        if (!subscription || !subscription.endpoint) {
            throw new Error('Invalid subscription data: missing endpoint');
        }

        const result = NotificationModel.saveSubscription(subscription);
        console.log('Saved push notification subscription:', subscription.endpoint);
        res.status(200).json({ success: true, message: 'Subscription received and saved' });
    } catch (error) {
        console.error('Error saving subscription:', error);
        res.status(400).json({ success: false, message: error.message || 'Invalid subscription data' });
    }
});

// Add endpoint for service worker to get scheduled notifications
app.get('/api/get-scheduled-notifications', (req, res) => {
    try {
        const notifications = NotificationModel.getScheduledNotifications();
        console.log(`Returning ${notifications.length} scheduled notifications`);
        res.json(notifications);
    } catch (error) {
        console.error('Error getting scheduled notifications:', error);
        res.status(500).json({ success: false, message: 'Server error getting notifications' });
    }
});

// Add endpoint for service worker to delete a notification
app.delete('/api/delete-notification/:id', (req, res) => {
    try {
        const id = req.params.id;
        console.log(`Deleting notification with ID: ${id}`);
        const result = NotificationModel.deleteNotification(id);
        res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        console.error(`Error deleting notification ${req.params.id}:`, error);
        if (error.message === 'Notification not found') {
            res.status(404).json({ success: false, message: 'Notification not found' });
        } else {
            res.status(500).json({ success: false, message: 'Server error deleting notification' });
        }
    }
});

// Add endpoint to validate subscriptions
app.post('/api/validate-subscriptions', async (req, res) => {
    try {
        console.log('Manual subscription validation requested');
        const result = await NotificationModel.validateSubscriptions();
        res.json({
            success: true,
            message: 'Subscription validation complete',
            result: result
        });
    } catch (error) {
        console.error('Error validating subscriptions:', error);
        res.status(500).json({
            success: false,
            message: 'Server error validating subscriptions',
            error: error.message
        });
    }
});

// Add endpoint to clean invalid subscriptions
app.post('/api/clean-subscriptions', (req, res) => {
    try {
        console.log('Manual subscription cleanup requested');
        const result = NotificationModel.cleanInvalidSubscriptions();
        res.json({
            success: true,
            message: 'Subscription cleanup complete',
            result: result
        });
    } catch (error) {
        console.error('Error cleaning subscriptions:', error);
        res.status(500).json({
            success: false,
            message: 'Server error cleaning subscriptions',
            error: error.message
        });
    }
});

// Add endpoint to clear all subscriptions
app.post('/api/clear-all-subscriptions', (req, res) => {
    try {
        console.log('Manual clear all subscriptions requested');
        const result = NotificationModel.clearAllSubscriptions();
        res.json({
            success: true,
            message: 'All subscriptions cleared',
            result: result
        });
    } catch (error) {
        console.error('Error clearing all subscriptions:', error);
        res.status(500).json({
            success: false,
            message: 'Server error clearing all subscriptions',
            error: error.message
        });
    }
});

// Add endpoint to get subscription count
app.get('/api/subscription-count', (req, res) => {
    try {
        const count = NotificationModel.getSubscriptionCount ?
            NotificationModel.getSubscriptionCount() :
            { count: NotificationModel.getSubscriptions ? NotificationModel.getSubscriptions().length : 0 };

        res.json({
            success: true,
            count: count
        });
    } catch (error) {
        console.error('Error getting subscription count:', error);
        res.status(500).json({
            success: false,
            message: 'Server error getting subscription count',
            error: error.message
        });
    }
});

// Catch-all for API routes to prevent returning HTML for non-existent API endpoints
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: `API endpoint not found: ${req.originalUrl}` });
});

// Setup Swagger documentation
swaggerDocs(app);

// Web Push Configuration
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BIErgrKRpDGw2XoFq1vhgowolKyleAgJxC_DcZlyIUASuTUHi0SlWZQ-e2p2ctskva52qii0a36uS5CqTprMxRE';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '04yytQWVRtCPhiQ9WGg7f5IctiLqYwxCfzCVQFQ0kyw';

// Configure web push
webpush.setVapidDetails(
  'mailto:kevinguyen022@gmail.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Initialize notification model
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

// Setup habit reset at 11:59 PM Central Time
const resetHabitCompletions = require('./utils/reset-habit-completions');

// Define the cron job for habit reset
const habitResetJob = cron.schedule('59 23 * * *', async () => {
  console.log('=== SCHEDULED HABIT RESET ===');
  console.log('Running scheduled habit reset at 11:59 PM Central Time');
  console.log('Current server time:', new Date().toISOString());
  console.log('Current Central Time:', new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));

  try {
    // Run the reset function
    const result = await resetHabitCompletions();
    console.log('Scheduled habit reset completed successfully');
    console.log('Reset result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error in scheduled habit reset:', error);
  }
}, {
  timezone: 'America/Chicago', // Explicitly set timezone to Central Time
  scheduled: true, // Ensure the job is scheduled
  runOnInit: false // Don't run immediately when the server starts
});

// Log that the job is scheduled
console.log('Habit reset cron job scheduled for 11:59 PM Central Time');

// Also schedule a job for midnight as a backup
const midnightHabitResetJob = cron.schedule('0 0 * * *', async () => {
  console.log('=== BACKUP HABIT RESET ===');
  console.log('Running backup habit reset at midnight Central Time');
  console.log('Current server time:', new Date().toISOString());
  console.log('Current Central Time:', new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));

  try {
    // Run the reset function
    const result = await resetHabitCompletions();
    console.log('Backup habit reset completed successfully');
    console.log('Reset result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error in backup habit reset:', error);
  }
}, {
  timezone: 'America/Chicago', // Explicitly set timezone to Central Time
  scheduled: true, // Ensure the job is scheduled
  runOnInit: false // Don't run immediately when the server starts
});

// Log that the backup job is scheduled
console.log('Backup habit reset cron job scheduled for midnight Central Time');

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

app.get('/cronometer-nutrition', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'cronometer-nutrition.html'));
});

app.get('/subscription-manager', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'subscription-manager.html'));
});

// Fallback Routes
app.get('/pages/goals.html', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'goals.html'));
});

// Fallback route for service worker bypass
app.get('/bypass', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'fallback.html'));
});

// Minimal version of the app for troubleshooting
app.get('/minimal', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'minimal.html'));
});

// Fallback for other routes (e.g., for SPAs)
app.get('*', (req, res) => {
  // Check if the request has a bypass parameter
  if (req.query.bypass) {
    console.log('Bypass parameter detected, serving fallback page');
    res.sendFile(path.join(__dirname, 'public', 'fallback.html'));
  } else {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

// Import models that need initialization
const JournalModel = require('./models/journalModel');

// Initialize database and start the server
const initializeAndStart = async () => {
  // Check if offline mode is enabled
  const offlineMode = process.env.OFFLINE_MODE === 'true';
  // Check if we should skip the database connection test
  const skipDbTest = process.env.SKIP_DB_TEST === 'true';
  // Check if we're in Railway environment (Railway sets RAILWAY_ENVIRONMENT)
  const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV === 'production';

  // Set a shorter timeout for Railway to ensure faster startup
  const timeoutDuration = isRailway ? 15000 : 30000; // 15 seconds for Railway, 30 for local
  const serverStartTimeout = setTimeout(() => {
    console.log(`WARNING: Server start timeout reached after ${timeoutDuration/1000}s. Starting server without waiting for database.`);
    startServer(false);
  }, timeoutDuration);

  if (offlineMode) {
    console.log('OFFLINE MODE ENABLED: Skipping database connection test');
    clearTimeout(serverStartTimeout);
    startServer(false);
    return;
  }

  if (skipDbTest) {
    console.log('SKIP_DB_TEST ENABLED: Starting server without database connection test');
    clearTimeout(serverStartTimeout);
    startServer(true);
    return;
  }

  try {
    // Test database connection before starting the server
    console.log('Testing database connection...');

    // Use shorter timeouts for Railway environment
    const retries = isRailway ? 1 : 2; // Fewer retries for Railway
    const timeout = isRailway ? 5000 : 10000; // Shorter timeout for Railway
    console.log(`Database connection config: retries=${retries}, timeout=${timeout}ms, environment=${isRailway ? 'Railway' : 'Local'}`);

    const dbConnected = await db.testDbConnection(retries, timeout);

    if (!dbConnected) {
      throw new Error('Database connection failed after multiple attempts');
    }

    // Initialize models
    try {
      await JournalModel.initialize();
      console.log('Journal model initialized successfully');

      try {
        // Initialize the calorie target model
        const CalorieTarget = require('./models/calorieTargetModel');
        await CalorieTarget.initializeTable();
        console.log('Calorie target model initialized successfully');

        // Initialize the meal model
        const MealModel = require('./models/mealModel');
        await MealModel.createMealsTables();
        console.log('Meal model initialized successfully');
      } catch (calorieError) {
        console.error('Error initializing models:', calorieError);
      }
    } catch (modelError) {
      console.error('Error initializing models:', modelError);
    }

    // Clear the timeout since we're starting the server now
    clearTimeout(serverStartTimeout);

    // Start the server with database connection
    startServer(true);
  } catch (error) {
    console.error('Failed to connect to database:', error);
    console.log('Server will start anyway, but database features may not work');

    // Clear the timeout since we're starting the server now
    clearTimeout(serverStartTimeout);

    // Start the server without database connection
    startServer(false);
  }
};

// Function to start the server
const startServer = async (dbConnected) => {
  console.log('=== STARTING SERVER ===');
  console.log('Database connected:', dbConnected);
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Railway environment:', process.env.RAILWAY_ENVIRONMENT || 'not Railway');
  console.log('Port:', PORT);

  // Check sharp features before starting the server
  console.log('--- Sharp Feature Check ---');
  try {
    console.log('Sharp Version:', sharp.versions.sharp);
    console.log('Libvips Version:', sharp.versions.vips);
    console.log('Formats:', sharp.format);
    console.log('HEIF Support (via libvips):', sharp.format.heif ? 'Available' : 'NOT Available');
  } catch (sharpError) {
    console.error('Sharp feature check failed:', sharpError.message);
  }
  console.log('--- End Sharp Feature Check ---');

  // Start the server with increased timeout and handle port conflicts
  try {
    const server = app.listen(PORT, async () => {
      console.log(`Server running on port ${PORT}${!dbConnected ? ' (database connection failed)' : ''}`);

      // Schedule all task reminders on server start (silently) if database is connected
      if (dbConnected) {
        try {
          // Silently schedule task reminders without logging each one
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
