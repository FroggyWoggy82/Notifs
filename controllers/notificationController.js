/**
 * Notification Controller
 * Handles HTTP requests and responses for notifications
 */

const NotificationModel = require('../models/notificationModel');

/**
 * Save a subscription
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function saveSubscription(req, res) {
    try {
        const subscription = req.body;
        const result = NotificationModel.saveSubscription(subscription);
        res.status(201).json(result);
    } catch (error) {
        console.error('Error saving subscription:', error);
        res.status(400).json({ success: false, message: error.message || 'Invalid subscription data' });
    }
}

/**
 * Schedule a notification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function scheduleNotification(req, res) {
    try {
        const notificationData = {
            title: req.body.title,
            body: req.body.body,
            scheduledTime: req.body.scheduledTime,
            repeat: req.body.repeat
        };
        
        const notification = NotificationModel.scheduleNotification(notificationData);
        res.status(201).json({ 
            success: true, 
            id: notification.id, 
            message: 'Notification scheduled' 
        });
    } catch (error) {
        console.error('Error scheduling notification:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error scheduling notification' 
        });
    }
}

/**
 * Get all scheduled notifications
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getScheduledNotifications(req, res) {
    try {
        const notifications = NotificationModel.getScheduledNotifications();
        res.json(notifications);
    } catch (error) {
        console.error('Error getting notifications:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error getting notifications' 
        });
    }
}

/**
 * Delete a notification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function deleteNotification(req, res) {
    try {
        const id = req.params.id;
        const result = NotificationModel.deleteNotification(id);
        res.json(result);
    } catch (error) {
        console.error('Error deleting notification:', error);
        if (error.message === 'Notification not found') {
            res.status(404).json({ 
                success: false, 
                message: 'Notification not found' 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                message: 'Server error deleting notification' 
            });
        }
    }
}

/**
 * Send a test notification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function sendTestNotification(req, res) {
    try {
        const result = await NotificationModel.sendTestNotification();
        res.json(result);
    } catch (error) {
        console.error('Error sending test notification:', error);
        res.status(500).json({
            success: false,
            message: 'Server error sending test notification'
        });
    }
}

/**
 * Get notification system debug info
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getDebugInfo(req, res) {
    try {
        const scheduledNotifications = NotificationModel.getScheduledNotifications();
        const subscriptions = NotificationModel.getSubscriptions();

        // Get task reminders from database
        const db = require('../utils/db');
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const taskResult = await db.query(
            `SELECT id, title, reminder_time, reminder_type, due_date, is_complete
             FROM tasks
             WHERE reminder_time IS NOT NULL
             AND reminder_time > $1
             ORDER BY reminder_time ASC`,
            [oneDayAgo.toISOString()]
        );

        const debugInfo = {
            timestamp: now.toISOString(),
            subscriptions: {
                count: subscriptions.length,
                endpoints: subscriptions.map(s => ({
                    endpoint: s.endpoint.substring(0, 50) + '...',
                    timestamp: s.timestamp,
                    lastValidated: s.lastValidated
                }))
            },
            scheduledNotifications: {
                count: scheduledNotifications.length,
                notifications: scheduledNotifications.map(n => ({
                    id: n.id,
                    title: n.title,
                    scheduledTime: n.scheduledTime,
                    createdAt: n.createdAt,
                    isPast: new Date(n.scheduledTime) <= now
                }))
            },
            taskReminders: {
                count: taskResult.rows.length,
                tasks: taskResult.rows.map(t => ({
                    id: t.id,
                    title: t.title,
                    reminderTime: t.reminder_time,
                    reminderType: t.reminder_type,
                    dueDate: t.due_date,
                    isComplete: t.is_complete,
                    isPastDue: new Date(t.reminder_time) <= now
                }))
            }
        };

        res.json(debugInfo);
    } catch (error) {
        console.error('Error getting debug info:', error);
        res.status(500).json({
            success: false,
            message: 'Server error getting debug info'
        });
    }
}

module.exports = {
    saveSubscription,
    scheduleNotification,
    getScheduledNotifications,
    deleteNotification,
    sendTestNotification,
    getDebugInfo
};
