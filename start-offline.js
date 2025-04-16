/**
 * Start the server in offline mode
 * This script sets the OFFLINE_MODE environment variable to true
 * and then starts the server
 */

// Set the offline mode environment variable
process.env.OFFLINE_MODE = 'true';

// Start the server
require('./server.js');
