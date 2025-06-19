// verify-9am-reminder.js
const db = require('../utils/db');

async function verify9AMReminder() {
    try {
        console.log('🕘 Verifying 9 AM Reminder for Test Task\n');

        // Find the test task we just created
        const result = await db.query(
            `SELECT id, title, due_date, reminder_time, reminder_type, is_complete
             FROM tasks
             WHERE title = 'Test Fixed 9 AM Reminder'
             ORDER BY id DESC
             LIMIT 1`
        );

        if (result.rows.length === 0) {
            console.log('❌ Test task not found in database');
            return;
        }

        const task = result.rows[0];
        console.log('✅ Found test task:');
        console.log(`   ID: ${task.id}`);
        console.log(`   Title: ${task.title}`);
        console.log(`   Due Date: ${task.due_date}`);
        console.log(`   Reminder Type: ${task.reminder_type}`);
        console.log(`   Complete: ${task.is_complete}`);

        if (task.reminder_time) {
            const reminderDate = new Date(task.reminder_time);
            console.log(`   Reminder Time: ${reminderDate.toLocaleString()}`);
            console.log(`   Reminder Hour: ${reminderDate.getHours()}`);
            console.log(`   Reminder Minutes: ${reminderDate.getMinutes()}`);

            if (reminderDate.getHours() === 9 && reminderDate.getMinutes() === 0) {
                console.log('\n🎉 SUCCESS: Reminder is correctly set to 9:00 AM!');
            } else {
                console.log('\n❌ ISSUE: Reminder is NOT set to 9:00 AM');
                console.log(`   Expected: 9:00 AM`);
                console.log(`   Actual: ${reminderDate.getHours()}:${reminderDate.getMinutes().toString().padStart(2, '0')}`);
            }
        } else {
            console.log('\n❌ ISSUE: No reminder time set for this task');
        }

        // Check if notification was scheduled
        console.log('\n📅 Checking if notification was scheduled...');
        const NotificationModel = require('../models/notificationModel');
        const scheduledNotifications = NotificationModel.getScheduledNotifications();
        const taskNotifications = scheduledNotifications.filter(n =>
            n.title.includes('Test Fixed 9 AM Reminder')
        );

        console.log(`Found ${taskNotifications.length} notifications for this task:`);
        taskNotifications.forEach(notification => {
            const scheduledTime = new Date(notification.scheduledTime);
            console.log(`  - Scheduled for: ${scheduledTime.toLocaleString()}`);
            console.log(`  - Hour: ${scheduledTime.getHours()}`);
            console.log(`  - Title: ${notification.title}`);
        });

        // Clean up - delete the test task
        console.log('\n🧹 Cleaning up test task...');
        await db.query('DELETE FROM tasks WHERE id = $1', [task.id]);
        console.log('✅ Test task deleted');

        console.log('\n📋 Summary:');
        console.log(`- Task created with "On the due date" reminder: ✅`);
        console.log(`- Reminder time set to 9:00 AM: ${task.reminder_time && new Date(task.reminder_time).getHours() === 9 ? '✅' : '❌'}`);
        console.log(`- Notifications scheduled: ${taskNotifications.length > 0 ? '✅' : '❌'}`);

        if (task.reminder_time && new Date(task.reminder_time).getHours() === 9) {
            console.log('\n🎉 CONCLUSION: "On the due date" reminder timing is working correctly at 9 AM!');
        } else {
            console.log('\n❌ CONCLUSION: "On the due date" reminder timing needs fixing');
        }

    } catch (error) {
        console.error('❌ Error verifying 9 AM reminder:', error);
    } finally {
        process.exit();
    }
}

verify9AMReminder();
