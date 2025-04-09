// Run setup script to ensure all required files exist
require('./setup');

const express = require('express');
const cors = require('cors');
const webpush = require('web-push');
const path = require('path');
const cron = require('node-cron');

// Database connection
const db = require('./db'); // Required for database connection initialization

// Import routes
// Using a mix of old and new route files until all are converted to MVC pattern
const goalRoutes = require('./routes/goalRoutes'); // New MVC pattern
const daysSinceRouter = require('./routes/daysSinceRoutes'); // New MVC pattern
const workoutRoutes = require('./routes/workoutRoutes'); // New MVC pattern
const habitRoutes = require('./routes/habitRoutes'); // New MVC pattern
const recipeRoutes = require('./routes/recipeRoutes'); // New MVC pattern
const weightRoutes = require('./routes/weight'); // Using old pattern file name for compatibility
const taskRoutes = require('./routes/taskRoutes'); // Using MVC pattern
const notificationRoutes = require('./routes/notificationRoutes'); // New MVC pattern

// Note: We're no longer using the old workouts.js routes file

// Import Swagger documentation
const { swaggerDocs } = require('./docs/swagger');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  console.error('Global error handler caught:', err);
  res.status(500).json({
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
