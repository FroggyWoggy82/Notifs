/**
 * Notification Model
 * Handles data operations for notifications and subscriptions
 */

const fs = require('fs');
const path = require('path');
const webpush = require('web-push');

// File paths for persistent storage
const SUBSCRIPTIONS_FILE = path.join(__dirname, '..', 'data', 'subscriptions.json');
const NOTIFICATIONS_FILE = path.join(__dirname, '..', 'data', 'notifications.json');

// In-memory storage
let subscriptions = [];
let scheduledNotifications = [];
let notificationJobs = new Map(); // Map to store timeout references

/**
 * Initialize the notification model
 */
function initialize() {
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }

    // Load subscriptions from file
    try {
        if (fs.existsSync(SUBSCRIPTIONS_FILE)) {
            subscriptions = JSON.parse(fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf8'));
            console.log(`Loaded ${subscriptions.length} subscriptions from file.`);
        }
    } catch (error) {
        console.error('Error loading subscriptions from file:', error);
    }

    // Load notifications from file
    try {
        if (fs.existsSync(NOTIFICATIONS_FILE)) {
            scheduledNotifications = JSON.parse(fs.readFileSync(NOTIFICATIONS_FILE, 'utf8'));
            console.log(`Loaded ${scheduledNotifications.length} notifications from file.`);
        }
    } catch (error) {
        console.error('Error loading notifications from file:', error);
    }

    // Schedule all notifications on startup
    scheduledNotifications.forEach(notification => {
        scheduleNotificationJob(notification);
    });
}

/**
 * Save subscriptions to file
 */
function saveSubscriptionsToFile() {
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subscriptions, null, 2));
}

/**
 * Save notifications to file
 */
function saveNotificationsToFile() {
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(scheduledNotifications, null, 2));
}

/**
 * Add or update a subscription
 * @param {Object} subscription - The subscription object
 * @returns {Object} - Result of the operation
 */
function saveSubscription(subscription) {
    if (!subscription || !subscription.endpoint) {
        throw new Error('Invalid subscription data');
    }

    const existingIndex = subscriptions.findIndex(s => s.endpoint === subscription.endpoint);
    if (existingIndex !== -1) {
        subscriptions[existingIndex] = subscription;
        console.log('Updated existing subscription');
    } else {
        subscriptions.push(subscription);
        console.log('Added new subscription');
    }
    
    saveSubscriptionsToFile();
    return { success: true, message: 'Subscription saved' };
}

/**
 * Schedule a notification
 * @param {Object} notificationData - The notification data
 * @returns {Object} - The created notification
 */
function scheduleNotification(notificationData) {
    const notification = {
        id: require('crypto').randomBytes(12).toString('hex'),
        title: notificationData.title,
        body: notificationData.body,
        scheduledTime: notificationData.scheduledTime,
        repeat: notificationData.repeat,
        createdAt: Date.now()
    };
    
    scheduledNotifications.push(notification);
    saveNotificationsToFile();
    scheduleNotificationJob(notification);
    
    return notification;
}

/**
 * Get all scheduled notifications
 * @returns {Array} - List of scheduled notifications
 */
function getScheduledNotifications() {
    return scheduledNotifications;
}

/**
 * Delete a notification by ID
 * @param {string} id - The notification ID
 * @returns {Object} - Result of the operation
 */
function deleteNotification(id) {
    const initialLength = scheduledNotifications.length;
    scheduledNotifications = scheduledNotifications.filter(n => n.id !== id);
    
    if (scheduledNotifications.length === initialLength) {
        throw new Error('Notification not found');
    }
    
    // Cancel the scheduled job if it exists
    if (notificationJobs.has(id)) {
        clearTimeout(notificationJobs.get(id));
        notificationJobs.delete(id);
    }
    
    saveNotificationsToFile();
    return { success: true, message: 'Notification deleted' };
}

/**
 * Send a test notification to all subscriptions
 * @returns {Object} - Result of the operation
 */
async function sendTestNotification() {
    const testNotification = {
        title: 'Test Notification',
        body: 'This is a test notification from the server.',
        icon: '/icon-192x192.png',
        timestamp: Date.now()
    };
    
    const results = await sendToAllSubscriptions(testNotification);
    
    return {
        success: true,
        message: `Test notification sent to ${subscriptions.length} subscriptions`,
        expiredRemoved: results.expiredCount
    };
}

/**
 * Send a notification to all subscriptions
 * @param {Object} notification - The notification to send
 * @returns {Object} - Result of the operation
 */
async function sendToAllSubscriptions(notification) {
    console.log(`Sending notification: ${notification.title}`);
    
    const payload = JSON.stringify({
        title: notification.title,
        body: notification.body,
        icon: '/icon-192x192.png',
        timestamp: Date.now(),
        data: {
            notificationId: notification.id
        }
    });
    
    const sendPromises = subscriptions.map(subscription => {
        return webpush.sendNotification(subscription, payload)
            .catch(error => {
                console.error('Error sending to subscription:', error);
                if (error.statusCode === 410) {
                    // Subscription has expired or is no longer valid
                    return { expired: true, endpoint: subscription.endpoint };
                }
                return { error: true, endpoint: subscription.endpoint };
            });
    });
    
    const results = await Promise.all(sendPromises);
    
    // Filter out expired subscriptions
    const expiredEndpoints = results
        .filter(result => result && result.expired)
        .map(result => result.endpoint);
    
    let expiredCount = 0;
    if (expiredEndpoints.length > 0) {
        subscriptions = subscriptions.filter(sub => !expiredEndpoints.includes(sub.endpoint));
        saveSubscriptionsToFile();
        console.log(`Removed ${expiredEndpoints.length} expired subscriptions`);
        expiredCount = expiredEndpoints.length;
    }
    
    return { success: true, expiredCount };
}

/**
 * Schedule a notification job
 * @param {Object} notification - The notification to schedule
 */
function scheduleNotificationJob(notification) {
    const scheduledTime = new Date(notification.scheduledTime);
    console.log(`Scheduling notification "${notification.title}" for ${scheduledTime.toLocaleString()}`);
    
    // Check if the scheduled time is in the past
    if (scheduledTime <= new Date()) {
        console.log(`Notification time ${scheduledTime.toLocaleString()} is in the past, sending immediately`);
        sendToAllSubscriptions(notification);
        return;
    }
    
    // Schedule the notification
    const job = setTimeout(async () => {
        console.log(`Executing scheduled notification: ${notification.title}`);
        await sendToAllSubscriptions(notification);
        
        // Handle repeating notifications
        if (notification.repeat) {
            // Implement repeat logic here
            console.log(`This notification should repeat: ${notification.repeat}`);
        }
        
        // Remove the job reference
        notificationJobs.delete(notification.id);
    }, scheduledTime - new Date());
    
    // Store the job reference for potential cancellation
    notificationJobs.set(notification.id, job);
}

/**
 * Setup daily notification check
 * @param {Function} cronSchedule - The cron schedule function
 */
function setupDailyCheck(cronSchedule) {
    cronSchedule('0 0 * * *', () => {
        console.log('Running daily notification check');
        // Implement any daily notification logic here
    });
}

module.exports = {
    initialize,
    saveSubscription,
    scheduleNotification,
    getScheduledNotifications,
    deleteNotification,
    sendTestNotification,
    setupDailyCheck
};
