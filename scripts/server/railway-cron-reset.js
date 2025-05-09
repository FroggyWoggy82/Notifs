/**
 * Railway Cron Job for Habit Reset
 * 
 * This script is designed to be run as a standalone cron job on Railway.
 * It will reset all habit completions for the current day.
 * 
 * To use this script:
 * 1. Deploy it to Railway
 * 2. Set up a cron job to run this script at 11:59 PM Central Time
 * 
 * Railway cron syntax: 59 23 * * * America/Chicago
 */

// Load environment variables
require('dotenv').config();

// Import the reset function
const resetHabitCompletions = require('./utils/reset-habit-completions');

async function main() {
    console.log('=== RAILWAY CRON JOB: HABIT RESET ===');
    console.log('Starting habit reset process...');
    console.log('Current time:', new Date().toISOString());
    console.log('Current Central Time:', new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));
    
    try {
        // Run the reset function
        const result = await resetHabitCompletions();
        
        console.log('=== HABIT RESET COMPLETED SUCCESSFULLY ===');
        console.log('Result:', JSON.stringify(result, null, 2));
        
        // Exit with success code
        process.exit(0);
    } catch (error) {
        console.error('=== HABIT RESET FAILED ===');
        console.error('Error:', error);
        
        // Exit with error code
        process.exit(1);
    }
}

// Run the script
main();
