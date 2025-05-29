/**
 * Fix Existing Reminder
 * Specifically test and fix the "Reminder test notifs" task that didn't send a notification
 */

const db = require('../utils/db');
const TaskReminderService = require('../models/taskReminderService');
const NotificationModel = require('../models/notificationModel');

async function fixExistingReminder() {
    console.log('🔧 Fixing Existing Reminder Task');
    console.log('=================================\n');

    try {
        // Initialize notification model
        await NotificationModel.initialize();
        
        // Find the "Reminder test notifs" task
        console.log('🔍 Looking for "Reminder test notifs" task...');
        const result = await db.query(
            'SELECT * FROM tasks WHERE title LIKE $1 AND is_complete = false',
            ['%Reminder test%']
        );
        
        if (result.rows.length === 0) {
            console.log('❌ No "Reminder test" tasks found');
            return;
        }
        
        console.log(`✅ Found ${result.rows.length} reminder test task(s):`);
        
        for (const task of result.rows) {
            console.log(`\n📋 Task ${task.id}: "${task.title}"`);
            console.log(`   Created: ${new Date(task.created_at).toLocaleString()}`);
            console.log(`   Due date: ${task.due_date ? new Date(task.due_date).toLocaleDateString() : 'None'}`);
            console.log(`   Reminder time: ${task.reminder_time ? new Date(task.reminder_time).toLocaleString() : 'None'}`);
            console.log(`   Reminder type: ${task.reminder_type || 'None'}`);
            console.log(`   Complete: ${task.is_complete}`);
            
            if (task.reminder_time) {
                const reminderTime = new Date(task.reminder_time);
                const now = new Date();
                const hoursOverdue = Math.floor((now - reminderTime) / (1000 * 60 * 60));
                const daysOverdue = Math.floor(hoursOverdue / 24);
                
                console.log(`   Status: ${reminderTime <= now ? '⚠️ OVERDUE' : '⏰ Future'}`);
                if (reminderTime <= now) {
                    if (daysOverdue > 0) {
                        console.log(`   Overdue by: ${daysOverdue} day(s) and ${hoursOverdue % 24} hour(s)`);
                    } else {
                        console.log(`   Overdue by: ${hoursOverdue} hour(s)`);
                    }
                }
                
                // Process this task with the new system
                console.log('\n🔔 Processing task with updated reminder system...');
                await TaskReminderService.scheduleReminderForTask(task.id);
                
                console.log('✅ Task processed successfully!');
                
                // Check if notification was created
                const scheduledNotifications = NotificationModel.getScheduledNotifications();
                const taskNotifications = scheduledNotifications.filter(n => 
                    n.title.includes(task.title) || n.title.includes('Overdue')
                );
                
                if (taskNotifications.length > 0) {
                    console.log(`📬 Created ${taskNotifications.length} notification(s):`);
                    taskNotifications.forEach(notification => {
                        console.log(`   - "${notification.title}"`);
                        console.log(`     Body: "${notification.body}"`);
                        console.log(`     Scheduled: ${new Date(notification.scheduledTime).toLocaleString()}`);
                    });
                } else {
                    console.log('⚠️  No notifications were created for this task');
                }
            } else {
                console.log('   Status: ❌ No reminder time set');
            }
        }
        
        // Check subscription status
        console.log('\n📱 Checking notification subscriptions...');
        const subscriptions = NotificationModel.getSubscriptions();
        console.log(`Found ${subscriptions.length} active subscription(s)`);
        
        if (subscriptions.length === 0) {
            console.log('⚠️  No push notification subscriptions found!');
            console.log('💡 To receive notifications:');
            console.log('   1. Open the app in your browser');
            console.log('   2. Go to Settings');
            console.log('   3. Click "Enable Notifications"');
            console.log('   4. Allow notifications when prompted');
        } else {
            console.log('✅ Push notifications are set up');
            
            // Send a test notification
            console.log('\n🚀 Sending test notification...');
            const testResult = await NotificationModel.sendTestNotification();
            console.log('Test result:', testResult);
            
            if (testResult.success && testResult.subscriptionCount > 0) {
                console.log('✅ Test notification sent successfully!');
                console.log('💡 Check your device for the notification');
            } else {
                console.log('⚠️  Test notification may have failed');
            }
        }
        
        // Show debug info
        console.log('\n📊 Current system status:');
        const allScheduledNotifications = NotificationModel.getScheduledNotifications();
        console.log(`- Scheduled notifications: ${allScheduledNotifications.length}`);
        console.log(`- Active subscriptions: ${subscriptions.length}`);
        
        // Show recent notifications
        if (allScheduledNotifications.length > 0) {
            console.log('\n📋 Recent notifications:');
            allScheduledNotifications
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
                .forEach((notification, index) => {
                    const scheduledTime = new Date(notification.scheduledTime);
                    const isPast = scheduledTime <= new Date();
                    console.log(`   ${index + 1}. "${notification.title}"`);
                    console.log(`      ${isPast ? '⚠️ Past' : '⏰ Future'}: ${scheduledTime.toLocaleString()}`);
                });
        }
        
        console.log('\n🎉 Reminder fix completed!');
        
    } catch (error) {
        console.error('❌ Error fixing reminder:', error);
        process.exit(1);
    }
}

// Run the fix if this file is executed directly
if (require.main === module) {
    fixExistingReminder()
        .then(() => {
            console.log('\n🏁 Fix completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Fix failed:', error);
            process.exit(1);
        });
}

module.exports = { fixExistingReminder };
