// Script to safely drop the workout_templates table
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

async function dropWorkoutTemplatesTable() {
  try {
    console.log('Checking if workout_templates table exists...');
    
    // Check if the table exists
    const tableCheck = await pool.query("SELECT to_regclass('public.workout_templates') as exists");
    
    if (tableCheck.rows[0].exists) {
      console.log('workout_templates table exists, checking for data...');
      
      // Check if the table has any data
      const countResult = await pool.query('SELECT COUNT(*) FROM workout_templates');
      const count = parseInt(countResult.rows[0].count);
      
      console.log(`workout_templates table has ${count} rows`);
      
      // Backup the data just in case
      if (count > 0) {
        console.log('Backing up data before dropping table...');
        
        // Get all data from the table
        const dataResult = await pool.query('SELECT * FROM workout_templates');
        
        // Save the data to a JSON file
        const fs = require('fs');
        const backupFile = 'workout_templates_backup.json';
        fs.writeFileSync(backupFile, JSON.stringify(dataResult.rows, null, 2));
        
        console.log(`Data backed up to ${backupFile}`);
      }
      
      // Drop the table
      console.log('Dropping workout_templates table...');
      await pool.query('DROP TABLE workout_templates');
      console.log('workout_templates table dropped successfully');
    } else {
      console.log('workout_templates table does not exist, nothing to do');
    }
  } catch (error) {
    console.error('Error dropping workout_templates table:', error);
  } finally {
    await pool.end();
  }
}

dropWorkoutTemplatesTable().catch(console.error);
