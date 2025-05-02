// add-package-amount-column.js
require('dotenv').config();
const { Pool } = require('pg');

async function addPackageAmountColumn() {
    // Get the database connection string from the environment
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
        console.error('DATABASE_URL environment variable is not set');
        process.exit(1);
    }
    
    // Create a new pool
    const pool = new Pool({
        connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });
    
    try {
        console.log('Connecting to database...');
        
        // Add the package_amount column
        console.log('Adding package_amount column to ingredients table...');
        await pool.query(`
            ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS package_amount NUMERIC(10, 2);
            COMMENT ON COLUMN ingredients.package_amount IS 'The amount in grams per package from the store (e.g., HEB)';
        `);
        
        console.log('Column added successfully!');
    } catch (err) {
        console.error('Error adding column:', err);
    } finally {
        // Close the pool
        await pool.end();
        process.exit();
    }
}

addPackageAmountColumn();
