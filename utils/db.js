// db.js
require('dotenv').config(); // Load .env file if present
const { Pool } = require('pg');

// Use the provided connection string or get it from environment variables
// For local dev, create a .env file with DATABASE_URL=postgresql://user:password@host:port/database
let connectionString = process.env.DATABASE_URL;

// Hardcoded connection string as fallback (from user input)
const hardcodedConnectionString = 'postgresql://postgres:NOQsdhTojgbpjdjEaMDjezkGMVHLBIsP@nozomi.proxy.rlwy.net:18056/railway';

if (!connectionString) {
    console.log("DATABASE_URL environment variable is not set. Using hardcoded connection string.");
    connectionString = hardcodedConnectionString;
}

console.log("Using database connection string:", connectionString.replace(/:[^:]*@/, ':****@')); // Log with password hidden

// Check if we're in Railway environment
const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV === 'production';

// Configure the database connection with Railway-optimized settings
const poolConfig = {
    connectionString,
    // Always enable SSL for Railway PostgreSQL connections
    ssl: {
        rejectUnauthorized: false
    },
    // Optimized timeouts for Railway connectivity issues
    connectionTimeoutMillis: 30000, // 30s connection timeout
    idleTimeoutMillis: 60000, // 60s idle timeout
    max: 3, // Smaller pool size to reduce connection overhead
    min: 1, // Keep at least 1 connection alive
    acquireTimeoutMillis: 30000, // 30s to acquire connection from pool
    createTimeoutMillis: 30000, // 30s to create new connection
    destroyTimeoutMillis: 5000, // 5s to destroy connection
    reapIntervalMillis: 1000, // Check for idle connections every 1s
    createRetryIntervalMillis: 200, // Wait 200ms between connection creation retries
    // PostgreSQL specific settings
    query_timeout: 60000, // 60s query timeout
    statement_timeout: 60000, // 60s statement timeout
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000
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

// Test the database connection with a timeout and retry logic
const testDbConnection = async (maxRetries = 3, timeout = 20000) => {
    let retries = 0;

    while (retries <= maxRetries) {
        try {
            console.log(`Database connection test attempt ${retries + 1}/${maxRetries + 1}...`);

            // Set a timeout for the query
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error(`Database connection test timed out after ${timeout/1000} seconds`)), timeout);
            });

            // Run the query
            const queryPromise = pool.query('SELECT NOW()');

            // Race the query against the timeout
            const res = await Promise.race([queryPromise, timeoutPromise]);
            console.log('Database connection test successful:', res.rows[0]);
            return true;
        } catch (err) {
            retries++;
            console.error(`Database connection test attempt ${retries}/${maxRetries + 1} failed:`, err.message);

            if (retries <= maxRetries) {
                // Wait before retrying
                const retryDelay = 2000 * retries; // Exponential backoff
                console.log(`Retrying in ${retryDelay/1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            } else {
                console.error('All database connection attempts failed.');
                return false;
            }
        }
    }

    return false;
};

// Check if we should run the test immediately
// We'll let server.js handle the actual test to avoid duplication
// testDbConnection();

module.exports = {
    testDbConnection, // Export the test function
    query: async (text, params) => {
        // Ensure params is always an array
        const safeParams = Array.isArray(params) ? params : (params ? [params] : []);

        console.log(`Executing query: ${text}`, safeParams);

        const maxRetries = 3;
        let lastError;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`Query attempt ${attempt}/${maxRetries}`);

                // Create a promise that will reject after 60 seconds
                const timeoutMs = 60000;
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error(`Query timed out after ${timeoutMs/1000} seconds`)), timeoutMs);
                });

                // Create the query promise
                const queryPromise = pool.query(text, safeParams)
                    .then(res => {
                        console.log(`Query completed successfully with ${res.rowCount} rows`);
                        if (text.includes('INSERT') && res.rows && res.rows.length > 0) {
                            console.log('Inserted row:', JSON.stringify(res.rows[0]));
                        }
                        return res;
                    });

                // Race the query against the timeout
                const result = await Promise.race([queryPromise, timeoutPromise]);
                return result;

            } catch (err) {
                lastError = err;
                console.error(`Query attempt ${attempt} failed:`, err.message);

                // Check if this is a connection-related error
                const isConnectionError = err.message.includes('Connection terminated') ||
                                        err.message.includes('connection timeout') ||
                                        err.message.includes('ECONNRESET') ||
                                        err.message.includes('ENOTFOUND');

                if (isConnectionError && attempt < maxRetries) {
                    console.log(`Connection error detected, retrying in ${attempt * 1000}ms...`);
                    await new Promise(resolve => setTimeout(resolve, attempt * 1000));
                    continue;
                } else if (attempt === maxRetries) {
                    console.error('Query error:', err);
                    console.error('Query that failed:', text);
                    console.error('Parameters:', safeParams);
                    throw err;
                } else {
                    // Non-connection error, don't retry
                    console.error('Query error:', err);
                    console.error('Query that failed:', text);
                    console.error('Parameters:', safeParams);
                    throw err;
                }
            }
        }

        throw lastError;
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