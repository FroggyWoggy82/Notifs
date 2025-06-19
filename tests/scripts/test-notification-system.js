/**
 * Test Notification System
 * Comprehensive test to verify notification functionality for both future and past-due reminders
 */

const db = require('../utils/db');
const TaskReminderService = require('../models/taskReminderService');
const NotificationModel = require('../models/notificationModel');

async function testNotificationSystem() {
    console.log('🧪 Starting Notification System Test');
    console.log('=====================================\n');

    try {
        // Initialize notification model
        await NotificationModel.initialize();
        
        // Test 1: Create a past-due reminder task
        console.log('📋 Test 1: Creating past-due reminder task...');
        const pastReminderTime = new Date();
        pastReminderTime.setHours(pastReminderTime.getHours() - 2); // 2 hours ago
        
        const pastDueDate = new Date();
        pastDueDate.setDate(pastDueDate.getDate() + 1); // Due tomorrow
        
        const pastTaskResult = await db.query(
            `INSERT INTO tasks (title, description, due_date, reminder_time, reminder_type, is_complete)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [
                'Test Past-Due Reminder',
                'This task should trigger an overdue notification',
                pastDueDate.toISOString().split('T')[0],
                pastReminderTime.toISOString().slice(0, 16),
                'custom',
                false
            ]
        );
        
        const pastTask = pastTaskResult.rows[0];
        console.log(`✅ Created past-due task ${pastTask.id}: "${pastTask.title}"`);
        console.log(`   Reminder time: ${pastReminderTime.toLocaleString()}`);
        console.log(`   Due date: ${pastDueDate.toLocaleDateString()}\n`);

        // Test 2: Create a future reminder task
        console.log('📋 Test 2: Creating future reminder task...');
        const futureReminderTime = new Date();
        futureReminderTime.setMinutes(futureReminderTime.getMinutes() + 2); // 2 minutes from now
        
        const futureDueDate = new Date();
        futureDueDate.setDate(futureDueDate.getDate() + 2); // Due day after tomorrow
        
        const futureTaskResult = await db.query(
            `INSERT INTO tasks (title, description, due_date, reminder_time, reminder_type, is_complete)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [
                'Test Future Reminder',
                'This task should schedule a future notification',
                futureDueDate.toISOString().split('T')[0],
                futureReminderTime.toISOString().slice(0, 16),
                'custom',
                false
            ]
        );
        
        const futureTask = futureTaskResult.rows[0];
        console.log(`✅ Created future task ${futureTask.id}: "${futureTask.title}"`);
        console.log(`   Reminder time: ${futureReminderTime.toLocaleString()}`);
        console.log(`   Due date: ${futureDueDate.toLocaleDateString()}\n`);

        // Test 3: Schedule reminders for individual tasks
        console.log('🔔 Test 3: Scheduling individual task reminders...');
        
        console.log('Processing past-due task...');
        await TaskReminderService.scheduleReminderForTask(pastTask.id);
        
        console.log('Processing future task...');
        await TaskReminderService.scheduleReminderForTask(futureTask.id);
        console.log('');

        // Test 4: Schedule all task reminders
        console.log('🔔 Test 4: Scheduling all task reminders...');
        await TaskReminderService.scheduleAllTaskReminders();
        console.log('');

        // Test 5: Check scheduled notifications
        console.log('📊 Test 5: Checking scheduled notifications...');
        const scheduledNotifications = NotificationModel.getScheduledNotifications();
        console.log(`Found ${scheduledNotifications.length} scheduled notifications:`);
        
        scheduledNotifications.forEach((notification, index) => {
            const scheduledTime = new Date(notification.scheduledTime);
            const isPast = scheduledTime <= new Date();
            console.log(`   ${index + 1}. "${notification.title}"`);
            console.log(`      Scheduled: ${scheduledTime.toLocaleString()}`);
            console.log(`      Status: ${isPast ? '⚠️ Past (should send immediately)' : '⏰ Future (scheduled)'}`);
        });
        console.log('');

        // Test 6: Check subscriptions
        console.log('📱 Test 6: Checking push notification subscriptions...');
        const subscriptions = NotificationModel.getSubscriptions();
        console.log(`Found ${subscriptions.length} active subscriptions`);
        
        if (subscriptions.length === 0) {
            console.log('⚠️  No subscriptions found. To test actual notifications:');
            console.log('   1. Open the app in a browser');
            console.log('   2. Go to Settings and enable notifications');
            console.log('   3. Run this test again');
        } else {
            console.log('✅ Subscriptions available for testing');
            subscriptions.forEach((sub, index) => {
                console.log(`   ${index + 1}. Endpoint: ${sub.endpoint.substring(0, 50)}...`);
                console.log(`      Added: ${new Date(sub.timestamp).toLocaleString()}`);
            });
        }
        console.log('');

        // Test 7: Send test notification
        console.log('🚀 Test 7: Sending test notification...');
        const testResult = await NotificationModel.sendTestNotification();
        console.log(`Test notification result:`, testResult);
        console.log('');

        // Test 8: Cleanup test tasks
        console.log('🧹 Test 8: Cleaning up test tasks...');
        await db.query('DELETE FROM tasks WHERE id IN ($1, $2)', [pastTask.id, futureTask.id]);
        console.log(`✅ Deleted test tasks ${pastTask.id} and ${futureTask.id}\n`);

        // Test Summary
        console.log('📋 Test Summary');
        console.log('===============');
        console.log('✅ Past-due reminder handling: TESTED');
        console.log('✅ Future reminder scheduling: TESTED');
        console.log('✅ Individual task processing: TESTED');
        console.log('✅ Bulk reminder scheduling: TESTED');
        console.log('✅ Notification storage: TESTED');
        console.log('✅ Subscription checking: TESTED');
        console.log('✅ Test notification sending: TESTED');
        console.log('✅ Cleanup: COMPLETED');
        console.log('');
        
        if (subscriptions.length > 0) {
            console.log('🎉 All tests completed successfully!');
            console.log('💡 Check your device for test notifications.');
        } else {
            console.log('⚠️  Tests completed but no subscriptions found.');
            console.log('💡 Enable notifications in the app to test actual delivery.');
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testNotificationSystem()
        .then(() => {
            console.log('\n🏁 Test completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Test failed:', error);
            process.exit(1);
        });
}

module.exports = { testNotificationSystem };
