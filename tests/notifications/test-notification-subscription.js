/**
 * Test Notification Subscription
 * 
 * This script tests the notification subscription endpoint by sending a test subscription.
 */

const fetch = require('node-fetch');

// Mock subscription data
const mockSubscription = {
    endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint-' + Date.now(),
    expirationTime: null,
    keys: {
        p256dh: 'test-p256dh-key',
        auth: 'test-auth-key'
    }
};

// Test the /api/save-subscription endpoint
async function testSaveSubscription() {
    try {
        console.log('Testing /api/save-subscription endpoint...');
        const response = await fetch('http://localhost:3000/api/save-subscription', {
            method: 'POST',
            body: JSON.stringify(mockSubscription),
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        console.log('Response status:', response.status);
        console.log('Response data:', data);

        if (response.ok) {
            console.log('✅ Test passed: /api/save-subscription endpoint is working!');
        } else {
            console.log('❌ Test failed: /api/save-subscription endpoint returned an error');
        }
    } catch (error) {
        console.error('❌ Test failed: Error testing /api/save-subscription endpoint:', error);
    }
}

// Test the /api/notifications/subscription endpoint
async function testNotificationsSubscription() {
    try {
        console.log('\nTesting /api/notifications/subscription endpoint...');
        const response = await fetch('http://localhost:3000/api/notifications/subscription', {
            method: 'POST',
            body: JSON.stringify(mockSubscription),
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        console.log('Response status:', response.status);
        console.log('Response data:', data);

        if (response.ok) {
            console.log('✅ Test passed: /api/notifications/subscription endpoint is working!');
        } else {
            console.log('❌ Test failed: /api/notifications/subscription endpoint returned an error');
        }
    } catch (error) {
        console.error('❌ Test failed: Error testing /api/notifications/subscription endpoint:', error);
    }
}

// Test the /api/notifications/save-subscription endpoint
async function testNotificationsSaveSubscription() {
    try {
        console.log('\nTesting /api/notifications/save-subscription endpoint...');
        const response = await fetch('http://localhost:3000/api/notifications/save-subscription', {
            method: 'POST',
            body: JSON.stringify(mockSubscription),
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        console.log('Response status:', response.status);
        console.log('Response data:', data);

        if (response.ok) {
            console.log('✅ Test passed: /api/notifications/save-subscription endpoint is working!');
        } else {
            console.log('❌ Test failed: /api/notifications/save-subscription endpoint returned an error');
        }
    } catch (error) {
        console.error('❌ Test failed: Error testing /api/notifications/save-subscription endpoint:', error);
    }
}

// Run all tests
async function runTests() {
    await testSaveSubscription();
    await testNotificationsSubscription();
    await testNotificationsSaveSubscription();
    console.log('\nAll tests completed!');
}

runTests();
