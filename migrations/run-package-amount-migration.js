// run-package-amount-migration.js
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
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
        
        // Read the migration SQL file
        const migrationPath = path.join(__dirname, '016_add_package_amount_to_ingredients.sql');
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('Running migration to add package_amount column...');
        await pool.query(migrationSql);
        
        console.log('Migration completed successfully!');
        
        // Now let's verify the column exists
        const checkResult = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'ingredients' AND column_name = 'package_amount'
        `);
        
        if (checkResult.rows.length > 0) {
            console.log('Verification successful: package_amount column exists');
            console.log('Column details:', checkResult.rows[0]);
        } else {
            console.error('Verification failed: package_amount column does not exist');
        }
    } catch (err) {
        console.error('Error running migration:', err);
    } finally {
        // Close the pool
        await pool.end();
        process.exit();
    }
}

runMigration();
