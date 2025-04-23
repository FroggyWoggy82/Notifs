// Script to debug the templates
const fetch = require('node-fetch');

async function debugTemplates() {
  try {
    console.log('Debugging templates...');
    
    // Get templates from the API
    console.log('Fetching templates from API...');
    const response = await fetch('https://notifs-production.up.railway.app/api/workouts/templates');
    const templates = await response.json();
    
    console.log(`API returned ${templates.length} templates`);
    
    if (templates.length > 0) {
      console.log('First template:');
      console.log(JSON.stringify(templates[0], null, 2));
      
      // Check if the template has the required fields
      const requiredFields = ['workout_id', 'name', 'description', 'exercises'];
      const missingFields = requiredFields.filter(field => !templates[0].hasOwnProperty(field));
      
      if (missingFields.length > 0) {
        console.log(`Missing required fields: ${missingFields.join(', ')}`);
      } else {
        console.log('All required fields are present');
      }
      
      // Check if exercises is an array
      if (Array.isArray(templates[0].exercises)) {
        console.log(`Template has ${templates[0].exercises.length} exercises`);
        
        if (templates[0].exercises.length > 0) {
          console.log('First exercise:');
          console.log(JSON.stringify(templates[0].exercises[0], null, 2));
        }
      } else {
        console.log(`Exercises is not an array: ${typeof templates[0].exercises}`);
      }
    }
    
    // Get templates from the database directly
    console.log('\nFetching templates from database...');
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    // Get workout_templates table
    const templatesResult = await pool.query('SELECT * FROM workout_templates');
    console.log(`Database has ${templatesResult.rows.length} templates`);
    
    if (templatesResult.rows.length > 0) {
      console.log('First template from database:');
      console.log(JSON.stringify(templatesResult.rows[0], null, 2));
    }
    
    // Check if workouts table exists
    const workoutsCheck = await pool.query("SELECT to_regclass('public.workouts') as exists");
    if (workoutsCheck.rows[0].exists) {
      console.log('\nWorkouts table exists');
      
      // Get templates from workouts table
      const workoutsResult = await pool.query('SELECT * FROM workouts WHERE is_template = true');
      console.log(`Workouts table has ${workoutsResult.rows.length} templates`);
      
      if (workoutsResult.rows.length > 0) {
        console.log('First template from workouts table:');
        console.log(JSON.stringify(workoutsResult.rows[0], null, 2));
        
        // Get exercises for this template
        const workoutId = workoutsResult.rows[0].workout_id;
        const exercisesResult = await pool.query(`
          SELECT we.*, e.name, e.category 
          FROM workout_exercises we 
          JOIN exercises e ON we.exercise_id = e.exercise_id 
          WHERE we.workout_id = $1
        `, [workoutId]);
        
        console.log(`Template has ${exercisesResult.rows.length} exercises`);
        
        if (exercisesResult.rows.length > 0) {
          console.log('First exercise:');
          console.log(JSON.stringify(exercisesResult.rows[0], null, 2));
        }
      }
    } else {
      console.log('\nWorkouts table does not exist');
    }
    
    await pool.end();
    
  } catch (error) {
    console.error('Error debugging templates:', error);
  }
}

debugTemplates().catch(console.error);
