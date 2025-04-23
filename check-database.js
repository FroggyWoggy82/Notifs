// Script to check database tables and data
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

// Function to check if a table exists
async function tableExists(tableName) {
  try {
    const result = await pool.query(`SELECT to_regclass('public.${tableName}') as exists`);
    return !!result.rows[0].exists;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

// Function to get table data
async function getTableData(tableName, limit = 5) {
  try {
    const result = await pool.query(`SELECT * FROM ${tableName} LIMIT ${limit}`);
    return result.rows;
  } catch (error) {
    console.error(`Error getting data from table ${tableName}:`, error);
    return [];
  }
}

// Function to get table count
async function getTableCount(tableName) {
  try {
    const result = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error(`Error getting count from table ${tableName}:`, error);
    return 0;
  }
}

// Function to get all tables in the database
async function getAllTables() {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    return result.rows.map(row => row.table_name);
  } catch (error) {
    console.error('Error getting all tables:', error);
    return [];
  }
}

// Main function to check database
async function checkDatabase() {
  try {
    console.log('Checking database...');
    
    // Get all tables
    const tables = await getAllTables();
    console.log(`Found ${tables.length} tables in the database:`);
    console.log(tables);
    
    // Check specific tables we're interested in
    const tablesToCheck = [
      'workout_templates', 'progress_photos', 'exercises', 
      'weight_logs', 'weight_goals', 'food_entries',
      'recipes', 'calorie_targets'
    ];
    
    for (const tableName of tablesToCheck) {
      const exists = await tableExists(tableName);
      if (exists) {
        const count = await getTableCount(tableName);
        console.log(`Table ${tableName} exists and has ${count} rows`);
        
        if (count > 0) {
          const data = await getTableData(tableName);
          console.log(`Sample data from ${tableName}:`);
          console.log(JSON.stringify(data, null, 2));
        }
      } else {
        console.log(`Table ${tableName} does not exist`);
      }
      console.log('-----------------------------------');
    }
    
    console.log('Database check completed');
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the check
checkDatabase().catch(console.error);
