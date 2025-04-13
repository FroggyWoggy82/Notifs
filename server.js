// Run setup script to ensure all required files exist
require('./setup');

const express = require('express');
const cors = require('cors');
const webpush = require('web-push');
const path = require('path');
const cron = require('node-cron');
const sharp = require('sharp');

// Database connection
const db = require('./db'); // Required for database connection initialization

// Import routes
// Using a mix of old and new route files until all are converted to MVC pattern
const goalRoutes = require('./routes/goalRoutes'); // New MVC pattern
const daysSinceRouter = require('./routes/daysSinceRoutes'); // New MVC pattern
const workoutRoutes = require('./routes/workouts'); // New MVC pattern
const habitRoutes = require('./routes/habitRoutesNew'); // Using direct DB access to fix habit creation issue
const recipeRoutes = require('./routes/recipeRoutes'); // New MVC pattern
const weightRoutes = require('./routes/weight'); // Using old pattern file name for compatibility
const taskRoutes = require('./routes/taskRoutes'); // Using MVC pattern
const notificationRoutes = require('./routes/notificationRoutes'); // New MVC pattern

// Import Swagger documentation
const { swaggerDocs } = require('./docs/swagger');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/goals', goalRoutes);
app.use('/api/days-since', daysSinceRouter);
app.use('/api/workouts', workoutRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/weight', weightRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);

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

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to database:', error);
    console.log('Server will start anyway, but database features may not work');

    // Start the server even if database connection fails
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (database connection failed)`);
    });
  }
};

initializeAndStart();
