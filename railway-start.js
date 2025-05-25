#!/usr/bin/env node

/**
 * Railway-optimized startup script
 * This script provides better logging and error handling for Railway deployments
 */

console.log('=== RAILWAY STARTUP SCRIPT ===');
console.log('Starting Notifs application...');
console.log('Timestamp:', new Date().toISOString());

// Log environment information
console.log('\n=== ENVIRONMENT INFO ===');
console.log('Node version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('PORT:', process.env.PORT || 'not set');
console.log('RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT || 'not set');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'set' : 'not set');

// Log memory usage
console.log('\n=== MEMORY INFO ===');
const memUsage = process.memoryUsage();
console.log('RSS:', Math.round(memUsage.rss / 1024 / 1024) + 'MB');
console.log('Heap Used:', Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB');
console.log('Heap Total:', Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB');

// Set Railway-specific environment variables if not set
if (process.env.RAILWAY_ENVIRONMENT && !process.env.NODE_ENV) {
    console.log('Setting NODE_ENV to production for Railway environment');
    process.env.NODE_ENV = 'production';
}

// Add error handlers
process.on('uncaughtException', (error) => {
    console.error('=== UNCAUGHT EXCEPTION ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('Exiting process...');
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('=== UNHANDLED REJECTION ===');
    console.error('Reason:', reason);
    console.error('Promise:', promise);
    console.error('This may cause the process to exit...');
});

// Start the main server
console.log('\n=== STARTING SERVER ===');
try {
    require('./server.js');
    console.log('Server startup initiated successfully');
} catch (error) {
    console.error('=== SERVER STARTUP ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
}
