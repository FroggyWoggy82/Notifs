// run-migrations.js
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

// Function to run a migration file
async function runMigration(filePath) {
    console.log(`Running migration: ${filePath}`);
    try {
        const sql = fs.readFileSync(filePath, 'utf8');
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(sql);
            await client.query('COMMIT');
            console.log(`Migration ${filePath} completed successfully`);
        } catch (err) {
            await client.query('ROLLBACK');
            console.error(`Error running migration ${filePath}:`, err);
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error(`Error reading or executing migration ${filePath}:`, err);
        throw err;
    }
}

// Main function to run all migrations
async function runAllMigrations() {
    try {
        // Create a migrations table if it doesn't exist
        const client = await pool.connect();
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS migrations (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
            `);
        } finally {
            client.release();
        }

        // Get list of already applied migrations
        const result = await pool.query('SELECT name FROM migrations');
        const appliedMigrations = result.rows.map(row => row.name);
        console.log('Already applied migrations:', appliedMigrations);

        // Get all migration files
        const migrationsDir = path.join(__dirname, 'migrations');
        const migrationFiles = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort(); // Sort to ensure migrations run in order

        console.log('Found migration files:', migrationFiles);

        // Run migrations that haven't been applied yet
        for (const file of migrationFiles) {
            if (!appliedMigrations.includes(file)) {
                await runMigration(path.join(migrationsDir, file));
                
                // Record the migration
                await pool.query(
                    'INSERT INTO migrations (name) VALUES ($1)',
                    [file]
                );
                console.log(`Recorded migration ${file} in migrations table`);
            } else {
                console.log(`Skipping already applied migration: ${file}`);
            }
        }

        console.log('All migrations completed successfully');
    } catch (err) {
        console.error('Migration process failed:', err);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run the migrations
runAllMigrations();
