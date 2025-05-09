// check-column-exists.js
require('dotenv').config();
const { Pool } = require('pg');

async function checkColumnExists() {
    try {
        // Get the database connection string from the environment
        const connectionString = process.env.DATABASE_URL;
        
        if (!connectionString) {
            console.error('DATABASE_URL environment variable is not set');
            return false;
        }
        
        // Create a new pool
        const pool = new Pool({
            connectionString,
            ssl: {
                rejectUnauthorized: false
            }
        });
        
        console.log('Connecting to database...');
        
        // Test the connection
        const testResult = await pool.query('SELECT NOW()');
        console.log('Database connection successful:', testResult.rows[0]);
        
        // Check if the column exists
        const checkResult = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'ingredients' AND column_name = 'package_amount'
        `);
        
        if (checkResult.rows.length > 0) {
            console.log('package_amount column exists');
            console.log('Column details:', checkResult.rows[0]);
            return true;
        } else {
            console.log('package_amount column does not exist');
            return false;
        }
    } catch (err) {
        console.error('Error checking column:', err);
        return false;
    }
}

checkColumnExists()
    .then(exists => {
        console.log('Column exists:', exists);
        process.exit(exists ? 0 : 1);
    })
    .catch(err => {
        console.error('Unhandled error:', err);
        process.exit(1);
    });
