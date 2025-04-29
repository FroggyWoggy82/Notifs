/**
 * Reset Habits
 * Command-line script to reset habit completions
 * 
 * Usage: node reset-habits.js
 */

// Load environment variables
require('dotenv').config();

// Import the reset function
const resetHabitCompletions = require('./utils/reset-habit-completions');
const db = require('./utils/db');

async function main() {
    console.log('=== HABIT RESET SCRIPT ===');
    console.log('Starting habit reset process...');
    
    try {
        // Run the reset function
        const result = await resetHabitCompletions();
        
        console.log('=== HABIT RESET COMPLETED SUCCESSFULLY ===');
        console.log('Result:', JSON.stringify(result, null, 2));
        
        // Close the database connection
        await db.pool.end();
        console.log('Database connection closed');
        
        // Exit with success code
        process.exit(0);
    } catch (error) {
        console.error('=== HABIT RESET FAILED ===');
        console.error('Error:', error);
        
        // Try to close the database connection
        try {
            await db.pool.end();
            console.log('Database connection closed');
        } catch (dbError) {
            console.error('Error closing database connection:', dbError);
        }
        
        // Exit with error code
        process.exit(1);
    }
}

// Run the script
main();
