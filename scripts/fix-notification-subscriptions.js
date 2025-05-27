// fix-notification-subscriptions.js
const NotificationModel = require('../models/notificationModel');

async function fixNotificationSubscriptions() {
    try {
        console.log('🔧 Fixing Notification Subscriptions\n');
        
        // 1. Check current subscriptions
        console.log('1. Checking current subscriptions...');
        const currentSubscriptions = NotificationModel.getSubscriptions();
        console.log(`Found ${currentSubscriptions.length} current subscriptions`);
        
        // Show details of current subscriptions
        currentSubscriptions.forEach((sub, index) => {
            console.log(`  Subscription ${index + 1}:`);
            console.log(`    Endpoint: ${sub.endpoint}`);
            console.log(`    Valid format: ${sub.endpoint.includes('https://fcm.googleapis.com/wp/') ? '✅' : '❌'}`);
            console.log(`    Timestamp: ${new Date(sub.timestamp).toLocaleString()}`);
            console.log('');
        });
        
        // 2. Count invalid subscriptions
        const invalidSubscriptions = currentSubscriptions.filter(sub => 
            !sub.endpoint.includes('https://fcm.googleapis.com/wp/')
        );
        
        console.log(`Found ${invalidSubscriptions.length} subscriptions with invalid endpoint format`);
        
        if (invalidSubscriptions.length > 0) {
            console.log('❌ Invalid subscriptions found (using old /fcm/send/ format)');
            console.log('   These subscriptions will not work with the current Firebase configuration.');
            console.log('   The new format should use /wp/ instead of /fcm/send/');
            
            // 3. Clear all subscriptions to force fresh registration
            console.log('\n3. Clearing all invalid subscriptions...');
            const clearResult = NotificationModel.clearAllSubscriptions();
            console.log(`✅ Cleared ${clearResult.removedCount} subscriptions`);
            
            console.log('\n📋 Next Steps:');
            console.log('1. Go to your browser and refresh the page');
            console.log('2. Click the "Enable" button for notifications again');
            console.log('3. This should create a new subscription with the correct /wp/ endpoint format');
            console.log('4. Run this test script again to verify the fix');
            
        } else {
            console.log('✅ All subscriptions are using the correct endpoint format!');
        }
        
        // 4. Validate subscriptions if any exist
        if (currentSubscriptions.length > 0) {
            console.log('\n4. Validating existing subscriptions...');
            try {
                const validationResult = await NotificationModel.validateSubscriptions();
                console.log('Validation result:', validationResult);
            } catch (error) {
                console.error('Validation failed:', error.message);
            }
        }
        
        console.log('\n📊 Summary:');
        console.log(`- Total subscriptions: ${currentSubscriptions.length}`);
        console.log(`- Invalid subscriptions: ${invalidSubscriptions.length}`);
        console.log(`- Valid subscriptions: ${currentSubscriptions.length - invalidSubscriptions.length}`);
        
        if (invalidSubscriptions.length === 0 && currentSubscriptions.length > 0) {
            console.log('\n🎉 All subscriptions are valid! Notifications should work correctly.');
        } else if (currentSubscriptions.length === 0) {
            console.log('\n⚠️  No subscriptions found. Please enable notifications in the browser.');
        } else {
            console.log('\n🔧 Invalid subscriptions cleared. Please re-enable notifications in the browser.');
        }
        
    } catch (error) {
        console.error('❌ Error fixing notification subscriptions:', error);
    } finally {
        process.exit();
    }
}

fixNotificationSubscriptions();
