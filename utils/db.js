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
        },
        // Add connection timeout to prevent hanging
        connectionTimeoutMillis: 10000, // 10 seconds
        idleTimeoutMillis: 30000, // 30 seconds
        max: 10 // Maximum number of clients in the pool
    } :
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'notifs',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        // Add connection timeout to prevent hanging
        connectionTimeoutMillis: 10000, // 10 seconds
        idleTimeoutMillis: 30000, // 30 seconds
        max: 10 // Maximum number of clients in the pool
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

// Test the database connection with a timeout
const testDbConnection = async () => {
    try {
        // Set a timeout for the query
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Database connection test timed out after 10 seconds')), 10000);
        });

        // Run the query
        const queryPromise = pool.query('SELECT NOW()');

        // Race the query against the timeout
        const res = await Promise.race([queryPromise, timeoutPromise]);
        console.log('Database connection test successful:', res.rows[0]);
        return true;
    } catch (err) {
        console.error('Database connection test failed:', err);
        return false;
    }
};

// Run the test
testDbConnection();

module.exports = {
    query: (text, params) => {
        console.log(`Executing query: ${text}`, params);

        // Create a promise that will reject after 30 seconds
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Query timed out after 30 seconds')), 30000);
        });

        // Create the query promise
        const queryPromise = pool.query(text, params)
            .then(res => {
                console.log(`Query completed successfully with ${res.rowCount} rows`);
                if (text.includes('INSERT') && res.rows && res.rows.length > 0) {
                    console.log('Inserted row:', JSON.stringify(res.rows[0]));
                }
                return res;
            })
            .catch(err => {
                console.error('Query error:', err);
                console.error('Query that failed:', text);
                console.error('Parameters:', params);
                throw err;
            });

        // Race the query against the timeout
        return Promise.race([queryPromise, timeoutPromise]);
    },

    // Get a client from the pool for transactions
    getClient: async () => {
        // Check if we already have a client for this request
        if (global._pgClient && global._pgClient._connected) {
            console.log('Reusing existing database client');
            return global._pgClient;
        }

        // If we had a client but it's no longer connected, clean it up
        if (global._pgClient) {
            console.log('Previous client exists but may be disconnected, cleaning up');
            try {
                global._pgClient = null;
            } catch (e) {
                console.error('Error cleaning up old client:', e);
            }
        }

        // Create a new client
        console.log('Creating new database client');
        const client = await pool.connect();
        global._pgClient = client;

        const originalQuery = client.query;
        const originalRelease = client.release;

        // Monkey patch the query method to log queries
        client.query = (...args) => {
            console.log('CLIENT QUERY:', args[0]);
            return originalQuery.apply(client, args);
        };

        // Monkey patch the release method to ensure it's only called once
        let released = false;
        client.release = () => {
            if (!released) {
                console.log('Releasing database client');
                released = true;
                global._pgClient = null;
                return originalRelease.apply(client);
            } else {
                console.log('Client already released, ignoring duplicate release call');
                return Promise.resolve();
            }
        };

        return client;
    },

    pool // Export pool if needed elsewhere
};