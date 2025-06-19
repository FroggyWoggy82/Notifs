// test-notifications.js
const db = require('../utils/db');
const TaskReminderService = require('../models/taskReminderService');
const NotificationModel = require('../models/notificationModel');

async function testNotificationSystem() {
    try {
        console.log('🔔 Testing Notification System\n');
        
        // 1. Check if there are any tasks with reminders
        console.log('1. Checking tasks with reminders...');
        const tasksWithReminders = await db.query(
            `SELECT id, title, due_date, reminder_time, reminder_type, is_complete 
             FROM tasks 
             WHERE reminder_time IS NOT NULL 
             ORDER BY reminder_time ASC 
             LIMIT 10`
        );
        
        console.log(`Found ${tasksWithReminders.rows.length} tasks with reminders:`);
        tasksWithReminders.rows.forEach(task => {
            const reminderDate = new Date(task.reminder_time);
            const dueDate = task.due_date ? new Date(task.due_date) : null;
            console.log(`  - Task ${task.id}: "${task.title}"`);
            console.log(`    Due: ${dueDate ? dueDate.toLocaleDateString() : 'No due date'}`);
            console.log(`    Reminder: ${reminderDate.toLocaleString()} (${task.reminder_type})`);
            console.log(`    Complete: ${task.is_complete}`);
            console.log('');
        });
        
        // 2. Check scheduled notifications
        console.log('2. Checking scheduled notifications...');
        const scheduledNotifications = NotificationModel.getScheduledNotifications();
        console.log(`Found ${scheduledNotifications.length} scheduled notifications:`);
        scheduledNotifications.forEach(notification => {
            const scheduledTime = new Date(notification.scheduledTime);
            console.log(`  - ID: ${notification.id}`);
            console.log(`    Title: ${notification.title}`);
            console.log(`    Scheduled: ${scheduledTime.toLocaleString()}`);
            console.log(`    Repeat: ${notification.repeat}`);
            console.log('');
        });
        
        // 3. Test creating a notification for 1 minute from now
        console.log('3. Testing immediate notification (1 minute from now)...');
        const testTime = new Date();
        testTime.setMinutes(testTime.getMinutes() + 1);
        
        const testNotification = NotificationModel.scheduleNotification({
            title: 'Test Notification',
            body: 'This is a test notification scheduled for 1 minute from now',
            scheduledTime: testTime.toISOString(),
            repeat: 'none'
        });
        
        console.log(`Test notification scheduled for: ${testTime.toLocaleString()}`);
        console.log(`Notification ID: ${testNotification.id}`);
        
        // 4. Check if push subscriptions exist
        console.log('4. Checking push subscriptions...');
        const subscriptions = NotificationModel.getSubscriptions();
        console.log(`Found ${subscriptions.length} push subscriptions`);
        
        if (subscriptions.length === 0) {
            console.log('⚠️  No push subscriptions found. You need to enable notifications in the browser.');
            console.log('   Go to the app and click "Enable" on the notification banner.');
        }
        
        // 5. Test scheduling reminders for existing tasks
        console.log('5. Testing task reminder scheduling...');
        if (tasksWithReminders.rows.length > 0) {
            const testTask = tasksWithReminders.rows[0];
            console.log(`Testing reminder scheduling for task: "${testTask.title}"`);
            await TaskReminderService.scheduleReminderForTask(testTask.id);
            console.log('✅ Reminder scheduling completed');
        }
        
        console.log('\n📋 Summary:');
        console.log(`- Tasks with reminders: ${tasksWithReminders.rows.length}`);
        console.log(`- Scheduled notifications: ${scheduledNotifications.length}`);
        console.log(`- Push subscriptions: ${subscriptions.length}`);
        console.log(`- Test notification ID: ${testNotification.id}`);
        
        if (subscriptions.length === 0) {
            console.log('\n🚨 Action needed: Enable push notifications in the browser');
        } else {
            console.log('\n✅ Notification system appears to be working');
            console.log('   Check your browser in 1 minute for the test notification');
        }
        
    } catch (error) {
        console.error('❌ Error testing notification system:', error);
    } finally {
        process.exit();
    }
}

testNotificationSystem();
