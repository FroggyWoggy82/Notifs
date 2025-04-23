// Comprehensive debugging script for workout templates
const fetch = require('node-fetch');
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

async function debugWorkoutAPI() {
  try {
    console.log('=== DEBUGGING WORKOUT TEMPLATES API ===');
    
    // 1. Check API endpoint directly
    console.log('\n1. Checking API endpoint directly...');
    try {
      const response = await fetch('https://notifs-production.up.railway.app/api/workouts/templates');
      const status = response.status;
      console.log(`API Status: ${status}`);
      
      const contentType = response.headers.get('content-type');
      console.log(`Content-Type: ${contentType}`);
      
      const data = await response.text();
      console.log(`Response Length: ${data.length} characters`);
      
      try {
        // Try to parse as JSON
        const jsonData = JSON.parse(data);
        console.log(`Parsed as JSON: ${jsonData.length} items`);
        if (jsonData.length > 0) {
          console.log('First item:');
          console.log(JSON.stringify(jsonData[0], null, 2));
        } else {
          console.log('No items returned');
        }
      } catch (parseError) {
        console.log('Response is not valid JSON:');
        console.log(data.substring(0, 500) + '...');
      }
    } catch (fetchError) {
      console.error('Error fetching API:', fetchError);
    }
    
    // 2. Check database tables
    console.log('\n2. Checking database tables...');
    
    // Check workouts table
    console.log('\nChecking workouts table...');
    const workoutsCheck = await pool.query("SELECT to_regclass('public.workouts') as exists");
    if (workoutsCheck.rows[0].exists) {
      console.log('workouts table exists');
      
      // Get count of templates
      const workoutsCount = await pool.query("SELECT COUNT(*) FROM workouts WHERE is_template = true");
      console.log(`workouts table has ${workoutsCount.rows[0].count} templates`);
      
      if (workoutsCount.rows[0].count > 0) {
        // Get sample data
        const workoutsSample = await pool.query("SELECT * FROM workouts WHERE is_template = true LIMIT 3");
        console.log('Sample templates:');
        console.log(JSON.stringify(workoutsSample.rows, null, 2));
        
        // Check workout_exercises table
        console.log('\nChecking workout_exercises table...');
        const workoutExercisesCheck = await pool.query("SELECT to_regclass('public.workout_exercises') as exists");
        if (workoutExercisesCheck.rows[0].exists) {
          console.log('workout_exercises table exists');
          
          // Get exercises for the first template
          const workoutId = workoutsSample.rows[0].workout_id;
          const exercisesCount = await pool.query('SELECT COUNT(*) FROM workout_exercises WHERE workout_id = $1', [workoutId]);
          console.log(`Template ${workoutId} has ${exercisesCount.rows[0].count} exercises`);
          
          if (exercisesCount.rows[0].count > 0) {
            // Get sample exercises
            const exercisesSample = await pool.query('SELECT * FROM workout_exercises WHERE workout_id = $1 LIMIT 3', [workoutId]);
            console.log('Sample exercises:');
            console.log(JSON.stringify(exercisesSample.rows, null, 2));
            
            // Check exercises table
            console.log('\nChecking exercises table...');
            const exercisesCheck = await pool.query("SELECT to_regclass('public.exercises') as exists");
            if (exercisesCheck.rows[0].exists) {
              console.log('exercises table exists');
              
              // Get exercise details
              const exerciseIds = exercisesSample.rows.map(ex => ex.exercise_id);
              const exerciseDetails = await pool.query('SELECT * FROM exercises WHERE exercise_id = ANY($1)', [exerciseIds]);
              console.log('Exercise details:');
              console.log(JSON.stringify(exerciseDetails.rows, null, 2));
            } else {
              console.log('exercises table does not exist');
            }
          }
        } else {
          console.log('workout_exercises table does not exist');
        }
      }
    } else {
      console.log('workouts table does not exist');
    }
    
    // 3. Test the complex query directly
    console.log('\n3. Testing the complex query directly...');
    try {
      const templatesQuery = `
        SELECT 
          w.workout_id, w.name, w.description, w.created_at, w.updated_at,
          COALESCE(json_agg(
            json_build_object(
              'workout_exercise_id', we.workout_exercise_id,
              'exercise_id', e.exercise_id,
              'name', e.name,
              'category', e.category,
              'sets', we.sets,
              'reps', we.reps,
              'weight', we.weight,
              'weight_unit', we.weight_unit,
              'order_position', we.order_position,
              'notes', we.notes
            )
            ORDER BY we.order_position
          ) FILTER (WHERE e.exercise_id IS NOT NULL), '[]') AS exercises
        FROM workouts w
        LEFT JOIN workout_exercises we ON w.workout_id = we.workout_id
        LEFT JOIN exercises e ON we.exercise_id = e.exercise_id
        WHERE w.is_template = true
        GROUP BY w.workout_id, w.name, w.description, w.created_at, w.updated_at
        ORDER BY w.created_at DESC
      `;
      
      const result = await pool.query(templatesQuery);
      console.log(`Query returned ${result.rows.length} templates`);
      
      if (result.rows.length > 0) {
        console.log('First template from query:');
        console.log(JSON.stringify(result.rows[0], null, 2));
      }
    } catch (queryError) {
      console.error('Error executing complex query:', queryError);
    }
    
    // 4. List all tables in the database
    console.log('\n4. Listing all tables in the database:');
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
    console.error('Error in debugging script:', error);
  } finally {
    await pool.end();
  }
}

debugWorkoutAPI().catch(console.error);
