/**
 * Test script for push notifications
 *
 * This script tests the push notification functionality and subscription validation.
 * It can be used to verify that the error handling is working correctly.
 *
 * Usage:
 * 1. Start the server in a separate terminal: node server.js
 * 2. Run this script: node test-push-notifications.js
 *
 * Or use the --start-server flag to start the server automatically:
 * node test-push-notifications.js --start-server
 */

const fetch = require('node-fetch');
const { spawn } = require('child_process');
const path = require('path');

// Base URL for API requests
const BASE_URL = 'http://localhost:3000';

// Parse command line arguments
const args = process.argv.slice(2);
const shouldStartServer = args.includes('--start-server');
let serverProcess = null;

// Test functions
async function testValidateSubscriptions() {
    console.log('\n=== Testing Subscription Validation ===');
    try {
        const response = await fetch(`${BASE_URL}/api/validate-subscriptions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        console.log('Validation result:', JSON.stringify(result, null, 2));
        return result;
    } catch (error) {
        console.error('Error validating subscriptions:', error);
        return { success: false, error: error.message };
    }
}

async function testCleanSubscriptions() {
    console.log('\n=== Testing Subscription Cleanup ===');
    try {
        const response = await fetch(`${BASE_URL}/api/clean-subscriptions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        console.log('Cleanup result:', JSON.stringify(result, null, 2));
        return result;
    } catch (error) {
        console.error('Error cleaning subscriptions:', error);
        return { success: false, error: error.message };
    }
}

async function testSendTestNotification() {
    console.log('\n=== Testing Send Test Notification ===');
    try {
        const response = await fetch(`${BASE_URL}/api/notifications/test`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        console.log('Test notification result:', JSON.stringify(result, null, 2));
        return result;
    } catch (error) {
        console.error('Error sending test notification:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Start the server as a child process
 * @returns {Promise<ChildProcess>} The server process
 */
async function startServer() {
    return new Promise((resolve, reject) => {
        console.log('Starting server...');

        // Set environment variables for the server
        const env = {
            ...process.env,
            SKIP_DB_TEST: 'true', // Skip database connection test
            PORT: '3000'
        };

        // Start the server process
        const serverPath = path.join(__dirname, 'server.js');
        const server = spawn('node', [serverPath], {
            env,
            stdio: 'pipe' // Capture stdout and stderr
        });

        // Handle server output
        server.stdout.on('data', (data) => {
            const output = data.toString();
            console.log(`[Server] ${output.trim()}`);

            // Check if server is ready
            if (output.includes('Server running on port')) {
                console.log('Server is ready!');
                resolve(server);
            }
        });

        server.stderr.on('data', (data) => {
            console.error(`[Server Error] ${data.toString().trim()}`);
        });

        server.on('error', (error) => {
            console.error('Failed to start server:', error);
            reject(error);
        });

        // Set a timeout in case the server doesn't start
        setTimeout(() => {
            reject(new Error('Server startup timed out after 30 seconds'));
        }, 30000);
    });
}

/**
 * Wait for the server to be available
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} retryDelay - Delay between retries in milliseconds
 * @returns {Promise<boolean>} True if server is available, false otherwise
 */
async function waitForServer(maxRetries = 10, retryDelay = 1000) {
    console.log('Waiting for server to be available...');

    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(`${BASE_URL}/api/notifications`);
            if (response.ok) {
                console.log('Server is available!');
                return true;
            }
        } catch (error) {
            console.log(`Server not available yet (attempt ${i + 1}/${maxRetries}), retrying in ${retryDelay}ms...`);
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay));
    }

    console.error(`Server not available after ${maxRetries} attempts`);
    return false;
}

/**
 * Stop the server process
 * @param {ChildProcess} server - The server process
 */
function stopServer(server) {
    if (server && !server.killed) {
        console.log('Stopping server...');
        server.kill('SIGTERM');
    }
}

// Main test function
async function runTests() {
    console.log('Starting push notification tests...');

    // Start the server if requested
    if (shouldStartServer) {
        try {
            serverProcess = await startServer();

            // Wait for the server to be available
            const serverAvailable = await waitForServer();
            if (!serverAvailable) {
                throw new Error('Server not available');
            }
        } catch (error) {
            console.error('Error starting server:', error);
            process.exit(1);
        }
    } else {
        // If not starting the server, still wait for it to be available
        const serverAvailable = await waitForServer();
        if (!serverAvailable) {
            console.error('Server not available. Make sure the server is running before running this script.');
            console.error('You can start the server automatically with: node test-push-notifications.js --start-server');
            process.exit(1);
        }
    }

    try {
        // First, clean up any invalid subscriptions
        await testCleanSubscriptions();

        // Then validate subscriptions
        await testValidateSubscriptions();

        // Finally, send a test notification
        await testSendTestNotification();

        console.log('\nTests completed successfully!');
    } catch (error) {
        console.error('Error running tests:', error);
    } finally {
        // Stop the server if we started it
        if (shouldStartServer && serverProcess) {
            stopServer(serverProcess);
        }
    }
}

// Run the tests
runTests().catch(error => {
    console.error('Error running tests:', error);

    // Stop the server if we started it
    if (shouldStartServer && serverProcess) {
        stopServer(serverProcess);
    }

    process.exit(1);
});
