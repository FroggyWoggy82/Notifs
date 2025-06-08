/**
 * Task Reminder Service
 * Handles scheduling notifications for task reminders
 */

const db = require('../utils/db');
const NotificationModel = require('./notificationModel');

/**
 * Schedule a reminder notification for a task
 * @param {Object} task - The task object
 */
async function scheduleTaskReminder(task) {
    if (!task.reminder_time) {
        console.log(`[TaskReminder] Task ${task.id} (${task.title}) has no reminder time, skipping notification`);
        return;
    }

    // Check if a notification for this task already exists
    const existingNotifications = NotificationModel.getScheduledNotifications();
    const existingNotification = existingNotifications.find(notification =>
        notification.data &&
        notification.data.taskId === task.id &&
        notification.data.type === 'task_reminder'
    );

    if (existingNotification) {
        console.log(`[TaskReminder] Notification already exists for task ${task.id}, skipping`);
        return;
    }

    const reminderTime = new Date(task.reminder_time);
    const dueDate = task.due_date ? new Date(task.due_date) : null;

    console.log(`[TaskReminder] Scheduling reminder for task ${task.id} (${task.title})`);
    console.log(`[TaskReminder] - Reminder time: ${reminderTime.toLocaleString()}`);
    console.log(`[TaskReminder] - Due date: ${dueDate ? dueDate.toLocaleDateString() : 'None'}`);
    console.log(`[TaskReminder] - Reminder type: ${task.reminder_type || 'unknown'}`);
    console.log(`[TaskReminder] - Task complete: ${task.is_complete}`);

    if (!dueDate) {
        console.log(`Task ${task.id} (${task.title}) has no due date, using generic reminder`);
        // Schedule a generic reminder
        const notificationData = {
            title: `Reminder: ${task.title}`,
            body: `Task reminder`,
            scheduledTime: reminderTime.toISOString(),
            repeat: 'none',
            data: {
                taskId: task.id,
                type: 'task_reminder'
            }
        };

        NotificationModel.scheduleNotification(notificationData);
        return;
    }

    // Format the due date for display
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueDay = new Date(dueDate);
    dueDay.setHours(0, 0, 0, 0);

    let dueText = '';

    // Calculate days difference
    const diffTime = dueDay.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        dueText = 'today';
    } else if (diffDays === 1) {
        dueText = 'tomorrow';
    } else if (diffDays > 1) {
        dueText = `in ${diffDays} days`;
    } else {
        dueText = `${Math.abs(diffDays)} days ago`;
    }

    // Create notification with enhanced message
    const notificationData = {
        title: `Reminder: ${task.title}`,
        body: `Due ${dueText} (${dueDate.toLocaleDateString()})`,
        scheduledTime: reminderTime.toISOString(),
        repeat: 'none',
        data: {
            taskId: task.id,
            type: 'task_reminder'
        }
    };

    // Removed scheduling log
    NotificationModel.scheduleNotification(notificationData);
}

/**
 * Send an immediate overdue reminder notification
 * @param {Object} task - The task object
 */
async function sendOverdueReminder(task) {
    const now = new Date();
    const reminderTime = new Date(task.reminder_time);
    const dueDate = task.due_date ? new Date(task.due_date) : null;

    console.log(`[OverdueReminder] Processing overdue reminder for task ${task.id} (${task.title})`);
    console.log(`[OverdueReminder] - Current time: ${now.toLocaleString()}`);
    console.log(`[OverdueReminder] - Reminder time: ${reminderTime.toLocaleString()}`);
    console.log(`[OverdueReminder] - Due date: ${dueDate ? dueDate.toLocaleDateString() : 'None'}`);

    // Calculate how overdue the reminder is
    const hoursOverdue = Math.floor((now - reminderTime) / (1000 * 60 * 60));
    const daysOverdue = Math.floor(hoursOverdue / 24);

    console.log(`[OverdueReminder] - Hours overdue: ${hoursOverdue}`);
    console.log(`[OverdueReminder] - Days overdue: ${daysOverdue}`);

    let overdueText = '';
    if (daysOverdue > 0) {
        overdueText = `${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue`;
    } else if (hoursOverdue > 0) {
        overdueText = `${hoursOverdue} hour${hoursOverdue > 1 ? 's' : ''} overdue`;
    } else {
        overdueText = 'just missed';
    }

    // Create overdue notification
    const notificationData = {
        title: `⚠️ Overdue Reminder: ${task.title}`,
        body: dueDate
            ? `Reminder was ${overdueText} - Due ${dueDate.toLocaleDateString()}`
            : `Reminder was ${overdueText}`,
        scheduledTime: now.toISOString(), // Send immediately
        repeat: 'none',
        data: {
            taskId: task.id,
            type: 'overdue_reminder'
        }
    };

    console.log(`Sending overdue reminder for task ${task.id} (${task.title}) - ${overdueText}`);
    NotificationModel.scheduleNotification(notificationData);
}

/**
 * Schedule reminders for all tasks with upcoming reminders and handle past-due reminders
 */
async function scheduleAllTaskReminders() {
    try {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

        // Get all tasks with reminder times (both future and recent past)
        const result = await db.query(
            `SELECT * FROM tasks
             WHERE reminder_time IS NOT NULL
             AND is_complete = false
             AND reminder_time > $1`,
            [oneDayAgo.toISOString()]
        );

        console.log(`Processing ${result.rows.length} tasks with reminders`);

        // Process each task
        for (const task of result.rows) {
            const reminderTime = new Date(task.reminder_time);

            if (reminderTime <= now) {
                // Past reminder - send immediately as overdue notification
                await sendOverdueReminder(task);
            } else {
                // Future reminder - schedule normally
                await scheduleTaskReminder(task);
            }
        }
    } catch (error) {
        console.error('Error scheduling task reminders:', error);
    }
}

/**
 * Schedule a reminder for a newly created or updated task
 * @param {number} taskId - The task ID
 */
async function scheduleReminderForTask(taskId) {
    try {
        const result = await db.query('SELECT * FROM tasks WHERE id = $1', [taskId]);

        if (result.rowCount === 0) {
            console.error(`Task ${taskId} not found`);
            return;
        }

        const task = result.rows[0];

        // Only process if the task has a reminder time and is not complete
        if (task.reminder_time && !task.is_complete) {
            const now = new Date();
            const reminderTime = new Date(task.reminder_time);

            if (reminderTime <= now) {
                // Past reminder - send immediately as overdue notification
                await sendOverdueReminder(task);
            } else {
                // Future reminder - schedule normally
                await scheduleTaskReminder(task);
            }
        }
    } catch (error) {
        console.error(`Error scheduling reminder for task ${taskId}:`, error);
    }
}

/**
 * Create a test task reminder notification (for debugging)
 * @param {string} title - The notification title
 * @param {number} delayMinutes - Minutes from now to schedule the notification
 */
async function createTestReminder(title = 'Test Task Reminder', delayMinutes = 1) {
    const scheduledTime = new Date();
    scheduledTime.setMinutes(scheduledTime.getMinutes() + delayMinutes);

    const notificationData = {
        title: `🔔 ${title}`,
        body: `This is a test reminder scheduled for ${scheduledTime.toLocaleTimeString()}`,
        scheduledTime: scheduledTime.toISOString(),
        repeat: 'none',
        data: {
            type: 'test_reminder',
            testId: Date.now()
        }
    };

    console.log(`Creating test reminder: "${title}" for ${scheduledTime.toLocaleString()}`);
    const notification = NotificationModel.scheduleNotification(notificationData);
    console.log(`Test reminder created with ID: ${notification.id}`);
    return notification;
}

module.exports = {
    scheduleTaskReminder,
    scheduleAllTaskReminders,
    scheduleReminderForTask,
    sendOverdueReminder,
    createTestReminder
};
