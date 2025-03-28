// db.js
require('dotenv').config(); // Load .env file if present
const { Pool } = require('pg');

// Railway provides DATABASE_URL automatically
// For local dev, create a .env file with DATABASE_URL=postgresql://user:password@host:port/database
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("FATAL ERROR: DATABASE_URL environment variable is not set.");
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    // Add SSL config if needed for local dev connection, Railway usually handles it
    // ssl: {
    //   rejectUnauthorized: false // Use only if necessary for local dev
    // }
});

pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool // Optional: export pool if needed elsewhere
};