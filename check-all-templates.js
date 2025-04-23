// Script to check all possible template tables
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create a new pool using the connection string from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkAllTemplateTables() {
  try {
    console.log('Checking all possible template tables...');
    
    // Check if workout_templates table exists
    const workoutTemplatesCheck = await pool.query("SELECT to_regclass('public.workout_templates') as exists");
    if (workoutTemplatesCheck.rows[0].exists) {
      console.log('workout_templates table exists');
      
      // Get count of templates
      const workoutTemplatesCount = await pool.query('SELECT COUNT(*) FROM workout_templates');
      console.log(`workout_templates table has ${workoutTemplatesCount.rows[0].count} templates`);
      
      // Get sample data
      const workoutTemplatesSample = await pool.query('SELECT * FROM workout_templates LIMIT 3');
      console.log('Sample data from workout_templates:');
      console.log(JSON.stringify(workoutTemplatesSample.rows, null, 2));
    } else {
      console.log('workout_templates table does not exist');
    }
    
    // Check if workouts table exists
    const workoutsCheck = await pool.query("SELECT to_regclass('public.workouts') as exists");
    if (workoutsCheck.rows[0].exists) {
      console.log('\nworkouts table exists');
      
      // Get count of templates
      const workoutsCount = await pool.query("SELECT COUNT(*) FROM workouts WHERE is_template = true");
      console.log(`workouts table has ${workoutsCount.rows[0].count} templates`);
      
      // Get sample data
      const workoutsSample = await pool.query("SELECT * FROM workouts WHERE is_template = true LIMIT 3");
      console.log('Sample data from workouts:');
      console.log(JSON.stringify(workoutsSample.rows, null, 2));
      
      // If there are templates, check for exercises
      if (workoutsSample.rows.length > 0) {
        const workoutId = workoutsSample.rows[0].workout_id;
        
        // Check if workout_exercises table exists
        const workoutExercisesCheck = await pool.query("SELECT to_regclass('public.workout_exercises') as exists");
        if (workoutExercisesCheck.rows[0].exists) {
          console.log('\nworkout_exercises table exists');
          
          // Get exercises for the first template
          const exercisesCount = await pool.query('SELECT COUNT(*) FROM workout_exercises WHERE workout_id = $1', [workoutId]);
          console.log(`Template ${workoutId} has ${exercisesCount.rows[0].count} exercises`);
          
          // Get sample exercises
          const exercisesSample = await pool.query('SELECT * FROM workout_exercises WHERE workout_id = $1 LIMIT 3', [workoutId]);
          console.log('Sample exercises:');
          console.log(JSON.stringify(exercisesSample.rows, null, 2));
        } else {
          console.log('\nworkout_exercises table does not exist');
        }
      }
    } else {
      console.log('\nworkouts table does not exist');
    }
    
    // List all tables in the database
    console.log('\nListing all tables in the database:');
    const allTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('Tables:');
    allTables.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('Error checking template tables:', error);
  } finally {
    await pool.end();
  }
}

checkAllTemplateTables().catch(console.error);
