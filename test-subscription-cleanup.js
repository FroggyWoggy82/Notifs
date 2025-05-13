/**
 * Test Subscription Cleanup
 * 
 * This script tests the subscription cleanup functionality by:
 * 1. Loading the current subscriptions
 * 2. Cleaning invalid subscriptions
 * 3. Showing the results
 */

const fs = require('fs');
const path = require('path');

// File path for subscriptions
const SUBSCRIPTIONS_FILE = path.join(__dirname, 'data', 'subscriptions.json');

// Load subscriptions
let subscriptions = [];
try {
    if (fs.existsSync(SUBSCRIPTIONS_FILE)) {
        subscriptions = JSON.parse(fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf8'));
        console.log(`Loaded ${subscriptions.length} subscriptions from file.`);
    } else {
        console.log('No subscriptions file found.');
    }
} catch (error) {
    console.error('Error loading subscriptions from file:', error);
}

// Display current subscriptions
console.log('\nCurrent subscriptions:');
subscriptions.forEach((sub, index) => {
    console.log(`[${index + 1}] ${sub.endpoint}`);
});

// Clean invalid subscriptions
console.log('\nCleaning invalid subscriptions...');
const initialCount = subscriptions.length;

// Filter out subscriptions with invalid endpoints
// NOTE: Only the /wp/ format is now considered valid, /fcm/send/ is no longer valid
const validSubscriptions = subscriptions.filter(sub => {
    // Check if the endpoint format is valid - ONLY /wp/ format is valid now
    const isValidEndpoint = sub.endpoint &&
        sub.endpoint.includes('https://fcm.googleapis.com/wp/');

    // Check if the subscription has the required keys
    const hasRequiredKeys = sub.keys &&
        sub.keys.p256dh &&
        sub.keys.auth;

    return isValidEndpoint && hasRequiredKeys;
});

const removedCount = initialCount - validSubscriptions.length;

// Display results
console.log(`\nRemoved ${removedCount} invalid subscriptions.`);
console.log(`Remaining valid subscriptions: ${validSubscriptions.length}`);

// Display valid subscriptions
if (validSubscriptions.length > 0) {
    console.log('\nValid subscriptions:');
    validSubscriptions.forEach((sub, index) => {
        console.log(`[${index + 1}] ${sub.endpoint}`);
    });
} else {
    console.log('\nNo valid subscriptions remaining.');
}

// Ask if user wants to save changes
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question('\nDo you want to save these changes? (yes/no): ', answer => {
    if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        // Save changes
        subscriptions = validSubscriptions;
        fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subscriptions, null, 2));
        console.log('Changes saved. Subscriptions file updated.');
    } else {
        console.log('Changes not saved. Subscriptions file remains unchanged.');
    }
    
    readline.close();
});
