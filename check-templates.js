// Script to check workout_templates table structure
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

async function checkTemplatesTable() {
  try {
    console.log('Checking workout_templates table...');
    
    // Check if the table exists
    const tableCheck = await pool.query("SELECT to_regclass('public.workout_templates') as exists");
    if (!tableCheck.rows[0].exists) {
      console.log('workout_templates table does not exist');
      return;
    }
    
    // Get table structure
    const tableStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'workout_templates'
      ORDER BY ordinal_position
    `);
    
    console.log('Table structure:');
    console.table(tableStructure.rows);
    
    // Get sample data
    const sampleData = await pool.query('SELECT * FROM workout_templates LIMIT 3');
    console.log('Sample data:');
    console.log(JSON.stringify(sampleData.rows, null, 2));
    
    // Get count
    const countResult = await pool.query('SELECT COUNT(*) FROM workout_templates');
    console.log(`Total templates: ${countResult.rows[0].count}`);
    
  } catch (error) {
    console.error('Error checking workout_templates table:', error);
  } finally {
    await pool.end();
  }
}

checkTemplatesTable().catch(console.error);
