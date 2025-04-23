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

// Direct database connection using pg
const { Pool } = require('pg');

// Function to initialize database
const initializeDatabase = async () => {
  try {
    // Initialize database connection
    console.log('Initializing database connection...');

    // Create a database pool
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:NOQsdhTojgbpjdjEaMDjezkGMVHLBIsP@nozomi.proxy.rlwy.net:18056/railway',
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Log connection attempt
    console.log('Database pool created, testing connection...');

    // Test the connection with a timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database connection test timed out after 10 seconds')), 10000);
    });

    // Create the query promise
    const queryPromise = pool.query('SELECT NOW()');

    // Race the query against the timeout
    const result = await Promise.race([queryPromise, timeoutPromise]);
    console.log('Database connection successful:', result.rows[0]);
    dbConnected = true;

    // Create a simple query function that matches the interface expected by routes
    db = {
      query: (text, params) => {
        console.log(`Executing query: ${text}`, params ? 'with params' : 'without params');
        return pool.query(text, params);
      },
      pool: pool
    };

    // Make db globally available
    global.db = db;

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

  // If database connection was successful, initialize tables
  if (success) {
    try {
      const dbInit = require('./utils/db-init');
      dbInit.initializeDatabase().then(() => {
        console.log('Database tables initialized successfully');
      }).catch(error => {
        console.error('Error initializing database tables:', error);
      });
    } catch (error) {
      console.error('Error loading database initialization script:', error);
    }
  }
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

// Make sure the uploads directories exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

if (!fs.existsSync(progressPhotosDir)) {
  fs.mkdirSync(progressPhotosDir, { recursive: true });
  console.log('Created progress_photos directory');
}

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

// API error handling middleware
app.use((req, res, next) => {
  // Add a listener for when the response is finished
  res.on('finish', () => {
    console.log(`Request ${req.method} ${req.path} completed with status: ${res.statusCode}`);
  });
  next();
});

// Import routes
try {
  // Core routes
  console.log('Loading routes...');

  // Database connection check middleware
  const dbMiddleware = (req, res, next) => {
    if (!dbConnected) {
      console.log(`Database not connected for request to ${req.path}`);
      return res.status(503).json({ error: 'Database not connected' });
    }
    console.log(`Database check passed for request to ${req.path}`);
    next();
  };

  // API routes
  app.get('/api/tasks', dbMiddleware, async (req, res) => {
    try {
      console.log('Handling GET /api/tasks request');
      const result = await db.query('SELECT * FROM tasks ORDER BY due_date ASC');
      console.log(`Returning ${result.rows.length} tasks`);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  });

  app.get('/api/habits', dbMiddleware, async (req, res) => {
    try {
      console.log('Handling GET /api/habits request');
      const result = await db.query('SELECT * FROM habits ORDER BY id ASC');
      console.log(`Returning ${result.rows.length} habits`);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching habits:', error);
      res.status(500).json({ error: 'Failed to fetch habits' });
    }
  });

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

  // Goals endpoint
  app.get('/api/goals', dbMiddleware, async (req, res) => {
    try {
      console.log('Handling GET /api/goals request');
      const result = await db.query('SELECT * FROM goals ORDER BY id ASC');
      console.log(`Returning ${result.rows.length} goals`);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching goals:', error);
      res.status(500).json({ error: 'Failed to fetch goals' });
    }
  });

  // Delete goal endpoint
  app.delete('/api/goals/:id', dbMiddleware, async (req, res) => {
    try {
      const goalId = req.params.id;
      console.log(`Handling DELETE /api/goals/${goalId} request`);

      // Check if the goal exists
      const checkResult = await db.query('SELECT * FROM goals WHERE id = $1', [goalId]);
      if (checkResult.rows.length === 0) {
        console.log(`Goal with ID ${goalId} not found`);
        return res.status(404).json({ error: `Goal with ID ${goalId} not found` });
      }

      // Begin a transaction
      await db.query('BEGIN');

      // Get all child goals recursively
      const findChildrenQuery = `
        WITH RECURSIVE goal_tree AS (
          SELECT id FROM goals WHERE id = $1
          UNION ALL
          SELECT g.id FROM goals g
          JOIN goal_tree gt ON g.parent_id = gt.id
        )
        SELECT id FROM goal_tree
      `;

      const childrenResult = await db.query(findChildrenQuery, [goalId]);
      const goalIds = childrenResult.rows.map(row => row.id);

      console.log(`Deleting goal ${goalId} and ${goalIds.length - 1} child goals:`, goalIds);

      // Delete all goals in the tree
      const deleteResult = await db.query('DELETE FROM goals WHERE id = ANY($1::int[])', [goalIds]);

      // Commit the transaction
      await db.query('COMMIT');

      console.log(`Successfully deleted goal ${goalId} and its children`);
      res.json({ success: true, message: `Goal ${goalId} and its children deleted successfully`, deletedCount: deleteResult.rowCount });
    } catch (error) {
      // Rollback the transaction in case of error
      await db.query('ROLLBACK');
      console.error(`Error deleting goal ${req.params.id}:`, error);
      res.status(500).json({ error: `Failed to delete goal: ${error.message}` });
    }
  });

  // Goal tree endpoint
  app.get('/api/goal-tree', dbMiddleware, async (req, res) => {
    try {
      console.log('Handling GET /api/goal-tree request');

      // First, get all goals
      const result = await db.query('SELECT * FROM goals ORDER BY id ASC');
      const goals = result.rows;

      // Create a map of goals by ID for easy lookup
      const goalMap = {};
      goals.forEach(goal => {
        goalMap[goal.id] = {
          ...goal,
          children: []
        };
      });

      // Build the tree structure
      const rootGoals = [];
      goals.forEach(goal => {
        if (goal.parent_id) {
          // This is a child goal
          if (goalMap[goal.parent_id]) {
            goalMap[goal.parent_id].children.push(goalMap[goal.id]);
          } else {
            // Parent doesn't exist, treat as root
            rootGoals.push(goalMap[goal.id]);
          }
        } else {
          // This is a root goal
          rootGoals.push(goalMap[goal.id]);
        }
      });

      console.log(`Returning goal tree with ${rootGoals.length} root goals`);
      res.json(rootGoals);
    } catch (error) {
      console.error('Error fetching goal tree:', error);
      res.status(500).json({ error: 'Failed to fetch goal tree' });
    }
  });

  // Create goal endpoint
  app.post('/api/goals', dbMiddleware, async (req, res) => {
    try {
      const { title, parent_id } = req.body;
      console.log(`Handling POST /api/goals request: ${title}, parent_id: ${parent_id || 'none'}`);

      if (!title) {
        return res.status(400).json({ error: 'Goal title is required' });
      }

      // If parent_id is provided, check if it exists
      if (parent_id) {
        const parentCheck = await db.query('SELECT id FROM goals WHERE id = $1', [parent_id]);
        if (parentCheck.rows.length === 0) {
          return res.status(404).json({ error: `Parent goal with ID ${parent_id} not found` });
        }
      }

      // Insert the new goal
      const insertQuery = parent_id
        ? 'INSERT INTO goals (title, parent_id) VALUES ($1, $2) RETURNING *'
        : 'INSERT INTO goals (title) VALUES ($1) RETURNING *';

      const queryParams = parent_id ? [title, parent_id] : [title];
      const result = await db.query(insertQuery, queryParams);

      console.log(`Created new goal with ID ${result.rows[0].id}`);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating goal:', error);
      res.status(500).json({ error: `Failed to create goal: ${error.message}` });
    }
  });

  // Update goal endpoint
  app.put('/api/goals/:id', dbMiddleware, async (req, res) => {
    try {
      const goalId = req.params.id;
      const { title, parent_id, completed } = req.body;
      console.log(`Handling PUT /api/goals/${goalId} request`);

      // Check if the goal exists
      const checkResult = await db.query('SELECT * FROM goals WHERE id = $1', [goalId]);
      if (checkResult.rows.length === 0) {
        console.log(`Goal with ID ${goalId} not found`);
        return res.status(404).json({ error: `Goal with ID ${goalId} not found` });
      }

      // Build the update query dynamically based on provided fields
      const updates = [];
      const values = [];
      let paramIndex = 1;

      if (title !== undefined) {
        updates.push(`title = $${paramIndex}`);
        values.push(title);
        paramIndex++;
      }

      if (parent_id !== undefined) {
        // Check for circular references
        if (parent_id) {
          // Check if parent exists
          const parentCheck = await db.query('SELECT id FROM goals WHERE id = $1', [parent_id]);
          if (parentCheck.rows.length === 0) {
            return res.status(404).json({ error: `Parent goal with ID ${parent_id} not found` });
          }

          // Check if this would create a circular reference
          const circularCheck = `
            WITH RECURSIVE goal_tree AS (
              SELECT id FROM goals WHERE id = $1
              UNION ALL
              SELECT g.id FROM goals g
              JOIN goal_tree gt ON g.parent_id = gt.id
            )
            SELECT id FROM goal_tree WHERE id = $2
          `;

          const circularResult = await db.query(circularCheck, [goalId, parent_id]);
          if (circularResult.rows.length > 0) {
            return res.status(400).json({ error: 'Cannot set parent_id as it would create a circular reference' });
          }
        }

        updates.push(`parent_id = $${paramIndex}`);
        values.push(parent_id);
        paramIndex++;
      }

      if (completed !== undefined) {
        updates.push(`completed = $${paramIndex}`);
        values.push(completed);
        paramIndex++;
      }

      // If no fields to update, return the existing goal
      if (updates.length === 0) {
        return res.json(checkResult.rows[0]);
      }

      // Add the goal ID as the last parameter
      values.push(goalId);

      // Execute the update query
      const updateQuery = `UPDATE goals SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
      const result = await db.query(updateQuery, values);

      console.log(`Updated goal with ID ${goalId}`);
      res.json(result.rows[0]);
    } catch (error) {
      console.error(`Error updating goal ${req.params.id}:`, error);
      res.status(500).json({ error: `Failed to update goal: ${error.message}` });
    }
  });

  // Workouts endpoints
  app.get('/api/workouts', dbMiddleware, async (req, res) => {
    try {
      console.log('Handling GET /api/workouts request');
      const result = await db.query('SELECT * FROM workouts ORDER BY created_at DESC');
      console.log(`Returning ${result.rows.length} workouts`);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      res.status(500).json({ error: 'Failed to fetch workouts' });
    }
  });

  // Workout exercises endpoint
  app.get('/api/workouts/exercises', dbMiddleware, async (req, res) => {
    try {
      console.log('Handling GET /api/workouts/exercises request');
      // Check if the table exists first
      const tableCheck = await db.query("SELECT to_regclass('public.exercises') as exists");
      if (!tableCheck.rows[0].exists) {
        console.log('exercises table does not exist, returning empty array');
        return res.json([]);
      }

      // Get all exercises from the database
      const result = await db.query('SELECT * FROM exercises ORDER BY name ASC');
      console.log(`Returning ${result.rows.length} exercises`);

      // Log the first exercise to see its structure
      if (result.rows.length > 0) {
        console.log('First exercise structure:', JSON.stringify(result.rows[0]));
      }

      // Map the database fields to what the frontend expects
      const mappedExercises = result.rows.map(exercise => ({
        id: exercise.exercise_id,
        name: exercise.name,
        muscle_group: exercise.category,
        description: exercise.description || ''
      }));

      res.json(mappedExercises);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      console.error('Error details:', error.message);
      // Return empty array instead of error
      res.json([]);
    }
  });

  // Workout templates endpoint
  app.get('/api/workouts/templates', dbMiddleware, async (req, res) => {
    try {
      console.log('Handling GET /api/workouts/templates request');
      // Check if the table exists first
      const tableCheck = await db.query("SELECT to_regclass('public.workout_templates') as exists");
      if (!tableCheck.rows[0].exists) {
        console.log('workout_templates table does not exist, returning empty array');
        return res.json([]);
      }

      // Get all templates from the database
      const result = await db.query('SELECT * FROM workout_templates ORDER BY name ASC');
      console.log(`Returning ${result.rows.length} workout templates`);

      // Log the first template to see its structure
      if (result.rows.length > 0) {
        console.log('First template structure:', JSON.stringify(result.rows[0]));
      }

      // Map the database fields to what the frontend expects
      const mappedTemplates = result.rows.map(template => {
        // Ensure exercises have the required fields for the frontend
        const processedExercises = Array.isArray(template.exercises) ? template.exercises.map((exercise, index) => {
          // Add exercise_id and workout_exercise_id if missing
          return {
            workout_exercise_id: exercise.workout_exercise_id || index + 1,
            exercise_id: exercise.exercise_id || index + 1,
            name: exercise.name,
            category: exercise.category || 'other',
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight,
            weight_unit: exercise.weight_unit || 'lbs',
            order_position: exercise.order_position || index + 1,
            notes: exercise.notes || ''
          };
        }) : [];

        return {
          workout_id: template.id, // Map id to workout_id
          name: template.name,
          description: template.description,
          exercises: processedExercises,
          created_at: template.created_at,
          updated_at: template.updated_at
        };
      });

      console.log('First mapped template:', JSON.stringify(mappedTemplates[0]));

      res.json(mappedTemplates);
    } catch (error) {
      console.error('Error fetching workout templates:', error);
      console.error('Error details:', error.message);
      // Return empty array instead of error
      res.json([]);
    }
  });

  // Progress photos endpoint
  app.get('/api/workouts/progress-photos', dbMiddleware, async (req, res) => {
    try {
      console.log('Handling GET /api/workouts/progress-photos request');
      // Check if the table exists first
      const tableCheck = await db.query("SELECT to_regclass('public.progress_photos') as exists");
      if (!tableCheck.rows[0].exists) {
        console.log('progress_photos table does not exist, returning empty array');
        return res.json([]);
      }

      // Get all progress photos from the database
      const result = await db.query('SELECT * FROM progress_photos ORDER BY uploaded_at DESC');
      console.log(`Returning ${result.rows.length} progress photos`);

      // Log the first photo to see its structure
      if (result.rows.length > 0) {
        console.log('First progress photo structure:', JSON.stringify(result.rows[0]));
      }

      // Map the database fields to what the frontend expects
      const mappedPhotos = result.rows.map(photo => {
        // Get the filename from the file_path
        const filename = photo.file_path.split('/').pop();

        // Construct the full URL for the photo
        const baseUrl = process.env.BASE_URL || 'https://notifs-production.up.railway.app';
        const fullUrl = `${baseUrl}${photo.file_path}`;

        return {
          id: photo.photo_id,
          filename: filename,
          filepath: photo.file_path,
          url: fullUrl, // Add the full URL for the photo
          description: '',
          created_at: photo.uploaded_at
        };
      });

      console.log('First mapped photo:', JSON.stringify(mappedPhotos[0]));

      res.json(mappedPhotos);
    } catch (error) {
      console.error('Error fetching progress photos:', error);
      console.error('Error details:', error.message);
      // Return empty array instead of error
      res.json([]);
    }
  });

  // Serve progress photos with proper headers
  app.use('/uploads/progress_photos', (req, res, next) => {
    // Set cache control headers to prevent caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
  });

  // Weight endpoint
  app.get('/api/weight', dbMiddleware, async (req, res) => {
    try {
      console.log('Handling GET /api/weight request');
      // Check if the table exists first
      const tableCheck = await db.query("SELECT to_regclass('public.weight_entries') as exists");
      if (!tableCheck.rows[0].exists) {
        console.log('weight_entries table does not exist, returning empty array');
        return res.json([]);
      }

      const result = await db.query('SELECT * FROM weight_entries ORDER BY date DESC');
      console.log(`Returning ${result.rows.length} weight entries`);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching weight entries:', error);
      console.error('Error details:', error.message);
      // Return empty array instead of error
      res.json([]);
    }
  });

  // Weight logs endpoint
  app.get('/api/weight/logs', dbMiddleware, async (req, res) => {
    try {
      console.log('Handling GET /api/weight/logs request');
      const userId = req.query.user_id || 1; // Default to user 1 if not specified

      // Check if the table exists first
      const tableCheck = await db.query("SELECT to_regclass('public.weight_logs') as exists");
      if (!tableCheck.rows[0].exists) {
        console.log('weight_logs table does not exist, returning empty array');
        return res.json([]);
      }

      const result = await db.query('SELECT * FROM weight_logs WHERE user_id = $1 ORDER BY date DESC', [userId]);
      console.log(`Returning ${result.rows.length} weight logs for user ${userId}`);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching weight logs:', error);
      console.error('Error details:', error.message);
      // Return empty array instead of error
      res.json([]);
    }
  });

  // Weight goal endpoint
  app.get('/api/weight/goal', dbMiddleware, async (req, res) => {
    try {
      console.log('Handling GET /api/weight/goal request');
      const userId = req.query.user_id || 1; // Default to user 1 if not specified

      // Check if the table exists first
      const tableCheck = await db.query("SELECT to_regclass('public.weight_goals') as exists");
      if (!tableCheck.rows[0].exists) {
        console.log('weight_goals table does not exist, returning empty object');
        return res.json({});
      }

      const result = await db.query('SELECT * FROM weight_goals WHERE user_id = $1', [userId]);
      if (result.rows.length > 0) {
        console.log(`Returning weight goal for user ${userId}`);
        res.json(result.rows[0]);
      } else {
        console.log(`No weight goal found for user ${userId}`);
        res.json({});
      }
    } catch (error) {
      console.error('Error fetching weight goal:', error);
      console.error('Error details:', error.message);
      // Return empty object instead of error
      res.json({});
    }
  });

  // Calorie targets endpoint
  app.get('/api/calorie-targets/:userId', dbMiddleware, async (req, res) => {
    try {
      console.log('Handling GET /api/calorie-targets/:userId request');
      const userId = req.params.userId;

      // Check if the table exists first
      const tableCheck = await db.query("SELECT to_regclass('public.calorie_targets') as exists");
      if (!tableCheck.rows[0].exists) {
        console.log('calorie_targets table does not exist, returning empty object');
        return res.json({});
      }

      const result = await db.query('SELECT * FROM calorie_targets WHERE user_id = $1', [userId]);
      if (result.rows.length > 0) {
        console.log(`Returning calorie target for user ${userId}`);
        res.json(result.rows[0]);
      } else {
        console.log(`No calorie target found for user ${userId}`);
        res.json({});
      }
    } catch (error) {
      console.error('Error fetching calorie target:', error);
      console.error('Error details:', error.message);
      // Return empty object instead of error
      res.json({});
    }
  });

  // Weight calorie targets endpoint (fallback)
  app.get('/api/weight/calorie-targets/:userId', dbMiddleware, async (req, res) => {
    try {
      console.log('Handling GET /api/weight/calorie-targets/:userId request');
      const userId = req.params.userId;

      // Check if the table exists first
      const tableCheck = await db.query("SELECT to_regclass('public.calorie_targets') as exists");
      if (!tableCheck.rows[0].exists) {
        console.log('calorie_targets table does not exist, returning empty object');
        return res.json({});
      }

      const result = await db.query('SELECT * FROM calorie_targets WHERE user_id = $1', [userId]);
      if (result.rows.length > 0) {
        console.log(`Returning calorie target for user ${userId}`);
        res.json(result.rows[0]);
      } else {
        console.log(`No calorie target found for user ${userId}`);
        res.json({});
      }
    } catch (error) {
      console.error('Error fetching calorie target:', error);
      console.error('Error details:', error.message);
      // Return empty object instead of error
      res.json({});
    }
  });

  // Food endpoints
  app.get('/api/food', dbMiddleware, async (req, res) => {
    try {
      console.log('Handling GET /api/food request');
      // Check if the table exists first
      const tableCheck = await db.query("SELECT to_regclass('public.food_entries') as exists");
      if (!tableCheck.rows[0].exists) {
        console.log('food_entries table does not exist, returning empty array');
        return res.json([]);
      }

      const result = await db.query('SELECT * FROM food_entries ORDER BY date DESC');
      console.log(`Returning ${result.rows.length} food entries`);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching food entries:', error);
      console.error('Error details:', error.message);
      // Return empty array instead of error
      res.json([]);
    }
  });

  // Nutrition endpoints
  app.get('/api/nutrition', dbMiddleware, async (req, res) => {
    try {
      console.log('Handling GET /api/nutrition request');
      // Check if the table exists first
      const tableCheck = await db.query("SELECT to_regclass('public.nutrition_entries') as exists");
      if (!tableCheck.rows[0].exists) {
        console.log('nutrition_entries table does not exist, returning empty array');
        return res.json([]);
      }

      const result = await db.query('SELECT * FROM nutrition_entries ORDER BY date DESC');
      console.log(`Returning ${result.rows.length} nutrition entries`);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching nutrition entries:', error);
      console.error('Error details:', error.message);
      // Return empty array instead of error
      res.json([]);
    }
  });

  // Recipes endpoint
  app.get('/api/recipes', dbMiddleware, async (req, res) => {
    try {
      console.log('Handling GET /api/recipes request');
      // Check if the table exists first
      const tableCheck = await db.query("SELECT to_regclass('public.recipes') as exists");
      if (!tableCheck.rows[0].exists) {
        console.log('recipes table does not exist, returning empty array');
        return res.json([]);
      }

      const result = await db.query('SELECT * FROM recipes ORDER BY name ASC');
      console.log(`Returning ${result.rows.length} recipes`);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      console.error('Error details:', error.message);
      // Return empty array instead of error
      res.json([]);
    }
  });

  // Add more direct API routes as needed

  // Try to load the full routes
  try {
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
  } catch (routeError) {
    console.error('Failed to initialize some routes:', routeError);
    console.error('Error details:', routeError.message);
    console.log('Server will continue with limited functionality');
  }

  // Catch-all for API routes to prevent returning HTML for non-existent API endpoints
  app.use('/api/*', (req, res) => {
    console.log(`API endpoint not found: ${req.originalUrl}`);
    res.status(404).json({ error: `API endpoint not found: ${req.originalUrl}` });
  });

} catch (error) {
  console.error('Failed to initialize routes:', error);
  console.error('Error details:', error.message);
  console.log('Server will continue with limited functionality');
}

// This endpoint is intentionally left empty as it's defined earlier in the routes section

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
