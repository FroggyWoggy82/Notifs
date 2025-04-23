// migrations/create_exercise_tables.js
const { Pool } = require('pg');

async function createExerciseTables() {
  console.log('Starting exercise tables migration...');

  // Create a database pool
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:NOQsdhTojgbpjdjEaMDjezkGMVHLBIsP@nozomi.proxy.rlwy.net:18056/railway';
  console.log(`Using database connection string: ${connectionString.split(':')[0]}:****`);

  const pool = new Pool({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Creating exercise-related tables if they do not exist...');

    // Check if workout_logs table exists
    const workoutLogsExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'workout_logs'
      );
    `);

    if (!workoutLogsExists.rows[0].exists) {
      console.log('Creating workout_logs table...');
      await pool.query(`
        CREATE TABLE workout_logs (
          log_id SERIAL PRIMARY KEY,
          workout_name VARCHAR(255) NOT NULL,
          date_performed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          duration INTERVAL,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('workout_logs table created successfully');
    } else {
      console.log('workout_logs table already exists');
    }

    // Check if exercise_logs table exists
    const exerciseLogsExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'exercise_logs'
      );
    `);

    if (!exerciseLogsExists.rows[0].exists) {
      console.log('Creating exercise_logs table...');
      await pool.query(`
        CREATE TABLE exercise_logs (
          log_id SERIAL PRIMARY KEY,
          workout_log_id INTEGER NOT NULL,
          exercise_id INTEGER NOT NULL,
          exercise_name VARCHAR(255) NOT NULL,
          sets_completed INTEGER,
          reps_completed TEXT,
          weight_used TEXT,
          weight_unit VARCHAR(20) DEFAULT 'lbs',
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_workout_log FOREIGN KEY (workout_log_id) REFERENCES workout_logs(log_id) ON DELETE CASCADE
        );
      `);
      console.log('exercise_logs table created successfully');
    } else {
      console.log('exercise_logs table already exists');
    }

    // Check if exercise_preferences table exists
    const exercisePreferencesExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'exercise_preferences'
      );
    `);

    if (!exercisePreferencesExists.rows[0].exists) {
      console.log('Creating exercise_preferences table...');
      await pool.query(`
        CREATE TABLE exercise_preferences (
          preference_id SERIAL PRIMARY KEY,
          exercise_id INTEGER NOT NULL,
          weight_unit VARCHAR(20) NOT NULL DEFAULT 'lbs',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT unique_exercise_preference UNIQUE (exercise_id)
        );
      `);
      console.log('exercise_preferences table created successfully');
    } else {
      console.log('exercise_preferences table already exists');
    }

    console.log('All exercise-related tables created or verified successfully');
  } catch (error) {
    console.error('Error creating exercise tables:', error);
  } finally {
    await pool.end();
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  createExerciseTables()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch(err => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}

module.exports = { createExerciseTables };
