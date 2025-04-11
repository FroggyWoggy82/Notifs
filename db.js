// db.js
require('dotenv').config(); // Load .env file if present
const { Pool } = require('pg');

// Railway provides DATABASE_URL automatically
// For local dev, create a .env file with DATABASE_URL=postgresql://user:password@host:port/database
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("WARNING: DATABASE_URL environment variable is not set. Using fallback configuration.");
}

// Configure the database connection
const poolConfig = connectionString ?
    {
        connectionString,
        // Always enable SSL for Railway PostgreSQL connections
        ssl: {
            rejectUnauthorized: false
        }
    } :
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'notifs',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres'
    };

console.log('Database connection config:', {
    usingConnectionString: !!connectionString,
    host: poolConfig.host || 'from connection string',
    database: poolConfig.database || 'from connection string',
    ssl: poolConfig.ssl ? 'enabled' : 'disabled'
});

const pool = new Pool(poolConfig);

pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    // Don't exit the process, just log the error
    // process.exit(-1);
});

// Test the database connection
pool.query('SELECT NOW()')
    .then(res => {
        console.log('Database connection test successful:', res.rows[0]);
    })
    .catch(err => {
        console.error('Database connection test failed:', err);
    });

module.exports = {
    query: (text, params) => {
        console.log(`Executing query: ${text}`, params);
        return pool.query(text, params)
            .then(res => {
                console.log(`Query completed successfully with ${res.rowCount} rows`);
                return res;
            })
            .catch(err => {
                console.error('Query error:', err);
                throw err;
            });
    },
    pool // Export pool if needed elsewhere
};