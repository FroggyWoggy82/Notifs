// run-custom-goal-weights-migration.js
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
    
    console.log('Connecting to database...');
    
    try {
        // Test the connection
        const testResult = await pool.query('SELECT NOW()');
        console.log('Database connection successful:', testResult.rows[0]);
        
        console.log('Creating custom_goal_weights table...');
        
        // Create the table
        await pool.query(`
            -- Create a table to store custom weekly goal weights
            CREATE TABLE IF NOT EXISTS custom_goal_weights (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                week_number INTEGER NOT NULL,
                target_date DATE NOT NULL,
                weight NUMERIC(5,2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, week_number)
            );
            
            -- Add index for faster lookups
            CREATE INDEX IF NOT EXISTS idx_custom_goal_weights_user_id ON custom_goal_weights(user_id);
            
            -- Add comment explaining the purpose of this table
            COMMENT ON TABLE custom_goal_weights IS 'Stores custom weekly goal weights that override the calculated linear progression';
        `);
        
        console.log('Table created successfully!');
        
        // Verify the table exists
        const verifyResult = await pool.query(`
            SELECT EXISTS (
                SELECT 1 
                FROM information_schema.tables 
                WHERE table_name = 'custom_goal_weights'
            );
        `);
        
        if (verifyResult.rows[0].exists) {
            console.log('Verified: custom_goal_weights table exists.');
        } else {
            console.error('Error: custom_goal_weights table was not created!');
        }
        
    } catch (error) {
        console.error('Error running migration:', error);
    } finally {
        await pool.end();
        console.log('Database connection closed');
    }
}

runMigration();
