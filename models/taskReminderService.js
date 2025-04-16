/**
 * Task Reminder Service
 * Handles scheduling notifications for task reminders
 */

const db = require('../db');
const NotificationModel = require('./notificationModel');

/**
 * Schedule a reminder notification for a task
 * @param {Object} task - The task object
 */
async function scheduleTaskReminder(task) {
    if (!task.reminder_time) {
        console.log(`Task ${task.id} (${task.title}) has no reminder time, skipping notification`);
        return;
    }

    const reminderTime = new Date(task.reminder_time);
    const dueDate = task.due_date ? new Date(task.due_date) : null;
    
    if (!dueDate) {
        console.log(`Task ${task.id} (${task.title}) has no due date, using generic reminder`);
        // Schedule a generic reminder
        const notificationData = {
            title: `Reminder: ${task.title}`,
            body: `Task reminder`,
            scheduledTime: reminderTime.toISOString(),
            repeat: 'none'
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
        repeat: 'none'
    };
    
    console.log(`Scheduling reminder for task ${task.id} (${task.title}) due ${dueText}`);
    NotificationModel.scheduleNotification(notificationData);
}

/**
 * Schedule reminders for all tasks with upcoming reminders
 */
async function scheduleAllTaskReminders() {
    try {
        // Get all tasks with reminder times in the future
        const now = new Date();
        const result = await db.query(
            `SELECT * FROM tasks 
             WHERE reminder_time > $1 
             AND is_complete = false`,
            [now.toISOString()]
        );
        
        console.log(`Found ${result.rowCount} tasks with upcoming reminders`);
        
        // Schedule a reminder for each task
        for (const task of result.rows) {
            await scheduleTaskReminder(task);
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
        
        // Only schedule if the task has a reminder time and is not complete
        if (task.reminder_time && !task.is_complete) {
            await scheduleTaskReminder(task);
        }
    } catch (error) {
        console.error(`Error scheduling reminder for task ${taskId}:`, error);
    }
}

module.exports = {
    scheduleTaskReminder,
    scheduleAllTaskReminders,
    scheduleReminderForTask
};
