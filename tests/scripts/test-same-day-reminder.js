// test-same-day-reminder.js
const db = require('../utils/db');

async function testSameDayReminder() {
    try {
        console.log('🕘 Testing "On the due date" reminder timing\n');
        
        // Create a test task with "same-day" reminder
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dueDate = tomorrow.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        
        console.log(`Creating test task with due date: ${dueDate}`);
        
        // Simulate the frontend logic for "same-day" reminder
        const dueDateTime = new Date(dueDate);
        const reminderDate = new Date(dueDateTime);
        reminderDate.setHours(9, 0, 0, 0); // Set to 9 AM
        const reminderTime = reminderDate.toISOString().slice(0, 16);
        
        console.log(`Due date: ${dueDateTime.toLocaleString()}`);
        console.log(`Reminder time: ${reminderDate.toLocaleString()}`);
        console.log(`Reminder time (ISO): ${reminderTime}`);
        
        // Create the task in the database
        const result = await db.query(
            `INSERT INTO tasks (title, description, due_date, reminder_time, reminder_type, is_complete)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [
                'Test Same-Day Reminder Task',
                'This is a test task to verify 9 AM reminder timing',
                dueDate,
                reminderTime,
                'same-day',
                false
            ]
        );
        
        const createdTask = result.rows[0];
        console.log(`\n✅ Created task with ID: ${createdTask.id}`);
        
        // Verify the reminder time in the database
        const dbReminderTime = new Date(createdTask.reminder_time);
        console.log(`Database reminder time: ${dbReminderTime.toLocaleString()}`);
        console.log(`Hour: ${dbReminderTime.getHours()}`);
        console.log(`Minutes: ${dbReminderTime.getMinutes()}`);
        
        if (dbReminderTime.getHours() === 9 && dbReminderTime.getMinutes() === 0) {
            console.log('✅ Reminder time is correctly set to 9:00 AM');
        } else {
            console.log('❌ Reminder time is NOT set to 9:00 AM');
        }
        
        // Test the TaskReminderService
        console.log('\n📅 Testing TaskReminderService...');
        const TaskReminderService = require('../models/taskReminderService');
        await TaskReminderService.scheduleReminderForTask(createdTask.id);
        console.log('✅ TaskReminderService completed');
        
        // Check if notification was scheduled
        const NotificationModel = require('../models/notificationModel');
        const scheduledNotifications = NotificationModel.getScheduledNotifications();
        const taskNotifications = scheduledNotifications.filter(n => 
            n.title.includes('Test Same-Day Reminder Task')
        );
        
        console.log(`\n🔔 Found ${taskNotifications.length} notifications for this task:`);
        taskNotifications.forEach(notification => {
            const scheduledTime = new Date(notification.scheduledTime);
            console.log(`  - Scheduled for: ${scheduledTime.toLocaleString()}`);
            console.log(`  - Hour: ${scheduledTime.getHours()}`);
            console.log(`  - Title: ${notification.title}`);
        });
        
        // Clean up - delete the test task
        console.log('\n🧹 Cleaning up test task...');
        await db.query('DELETE FROM tasks WHERE id = $1', [createdTask.id]);
        console.log('✅ Test task deleted');
        
        console.log('\n📋 Test Summary:');
        console.log(`- Task created with due date: ${dueDate}`);
        console.log(`- Reminder scheduled for: ${dbReminderTime.toLocaleString()}`);
        console.log(`- Reminder hour: ${dbReminderTime.getHours()} (should be 9)`);
        console.log(`- Notifications scheduled: ${taskNotifications.length}`);
        
        if (dbReminderTime.getHours() === 9) {
            console.log('\n✅ "On the due date" reminder timing is working correctly!');
        } else {
            console.log('\n❌ "On the due date" reminder timing needs fixing');
        }
        
    } catch (error) {
        console.error('❌ Error testing same-day reminder:', error);
    } finally {
        process.exit();
    }
}

testSameDayReminder();
