const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Get database connection string from environment variable
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("ERROR: DATABASE_URL environment variable is not set. Cannot proceed.");
    process.exit(1);
}

// Configure the database connection
const poolConfig = {
    connectionString,
    // Always enable SSL for Railway PostgreSQL connections
    ssl: {
        rejectUnauthorized: false
    },
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

async function applyMigration() {
  try {
    const migrationPath = path.join(__dirname, 'migrations', 'apply_all_migrations.sql');
    console.log(`Reading migration file from: ${migrationPath}`);

    if (!fs.existsSync(migrationPath)) {
      console.error(`Migration file not found at: ${migrationPath}`);
      return;
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Connecting to database...');
    const client = await pool.connect();

    try {
      console.log('Applying migration...');
      await client.query(sql);
      console.log('Migration applied successfully!');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error applying migration:', error);
  } finally {
    await pool.end();
    console.log('Database connection closed');
  }
}

applyMigration();
