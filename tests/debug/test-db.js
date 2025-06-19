// Simple script to test database connection
console.log('Starting script...');

const { Pool } = require('pg');
console.log('pg module loaded');

require('dotenv').config();
console.log('dotenv module loaded');

console.log('Environment variables:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Found' : 'Not found');

try {
    // Create a new pool using the DATABASE_URL from .env
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
    console.log('Database pool created');

    // Test the connection
    pool.query('SELECT NOW()', (err, res) => {
        if (err) {
            console.error('Error executing query', err);
        } else {
            console.log('Database query executed successfully');
            console.log('Current time from database:', res.rows[0].now);
        }
        
        // End the pool
        pool.end();
        console.log('Database pool ended');
    });
} catch (err) {
    console.error('Error creating database pool', err);
}
