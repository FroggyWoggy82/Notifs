// apply-migrations.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Get database connection string from environment variable
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("FATAL ERROR: DATABASE_URL environment variable is not set.");
    process.exit(1);
}

// Create a new pool
const pool = new Pool({
    connectionString,
    // Uncomment if needed for Railway
    // ssl: {
    //     rejectUnauthorized: false
    // }
});

async function applyMigrations() {
    console.log('Applying migrations...');
    
    try {
        const sqlPath = path.join(__dirname, 'migrations', 'apply_all_migrations.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        const client = await pool.connect();
        try {
            console.log('Connected to database. Running migrations...');
            await client.query(sql);
            console.log('Migrations applied successfully!');
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error applying migrations:', err);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

applyMigrations();
