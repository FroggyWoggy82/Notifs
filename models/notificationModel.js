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

// Constants for subscription validation
const INVALID_STATUS_CODES = [404, 410]; // Status codes that indicate invalid subscriptions

// Error categories for better error handling
const ERROR_CATEGORIES = {
    INVALID_SUBSCRIPTION: 'invalid_subscription', // Subscription is invalid or expired
    NETWORK_ERROR: 'network_error',               // Network-related errors
    SERVER_ERROR: 'server_error',                 // Server-side errors (5xx)
    CLIENT_ERROR: 'client_error',                 // Client-side errors (4xx, not 404/410)
    UNKNOWN_ERROR: 'unknown_error'                // Unclassified errors
};

/**
 * Initialize the notification model
 */
async function initialize() {
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

            // Clean invalid subscriptions immediately on startup
            // This prevents errors from occurring when the server tries to use invalid endpoints
            const initialCount = subscriptions.length;

            // Filter out subscriptions with invalid endpoints
            // Only the /wp/ format is valid, /fcm/send/ is no longer valid
            subscriptions = subscriptions.filter(sub => {
                // Check if the endpoint format is valid - ONLY /wp/ format is valid now
                const isValidEndpoint = sub.endpoint &&
                    sub.endpoint.includes('https://fcm.googleapis.com/wp/');

                // Check if the subscription has the required keys
                const hasRequiredKeys = sub.keys &&
                    sub.keys.p256dh &&
                    sub.keys.auth;

                return isValidEndpoint && hasRequiredKeys;
            });

            const removedCount = initialCount - subscriptions.length;
            if (removedCount > 0) {
                console.log(`Removed ${removedCount} invalid subscriptions during startup`);
                saveSubscriptionsToFile();
            }
        }
    } catch (error) {
        console.error('Error loading subscriptions from file:', error);
        // Initialize with empty array if there was an error
        subscriptions = [];
    }

    // Load notifications from file
    try {
        if (fs.existsSync(NOTIFICATIONS_FILE)) {
            scheduledNotifications = JSON.parse(fs.readFileSync(NOTIFICATIONS_FILE, 'utf8'));
            console.log(`Loaded ${scheduledNotifications.length} notifications from file.`);
        }
    } catch (error) {
        console.error('Error loading notifications from file:', error);
        // Initialize with empty array if there was an error
        scheduledNotifications = [];
    }

    // Schedule all notifications on startup
    scheduledNotifications.forEach(notification => {
        scheduleNotificationJob(notification);
    });

    // Validate subscriptions on startup (async)
    setTimeout(async () => {
        try {
            console.log('Performing initial subscription validation...');
            const validationResult = await validateSubscriptions();
            console.log('Initial subscription validation complete:', validationResult);
        } catch (error) {
            console.error('Error during initial subscription validation:', error);
        }
    }, 5000); // Wait 5 seconds after startup to validate
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

    // Add timestamp to track when the subscription was added/updated
    const subscriptionWithTimestamp = {
        ...subscription,
        timestamp: Date.now()
    };

    const existingIndex = subscriptions.findIndex(s => s.endpoint === subscription.endpoint);
    if (existingIndex !== -1) {
        subscriptions[existingIndex] = subscriptionWithTimestamp;
        console.log('Updated existing subscription');
    } else {
        subscriptions.push(subscriptionWithTimestamp);
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
        createdAt: Date.now(),
        data: notificationData.data || {} // Store additional data for the notification
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
    // Skip if no subscriptions
    if (subscriptions.length === 0) {
        return {
            success: true,
            message: 'No subscriptions available to send test notification',
            subscriptionCount: 0,
            invalidCount: 0,
            errorCount: 0
        };
    }

    const testNotification = {
        title: 'Test Notification',
        body: 'This is a test notification from the server.',
        icon: '/icon-192x192.png',
        timestamp: Date.now()
    };

    const results = await sendToAllSubscriptions(testNotification);

    // Count errors by category
    const errorsByCategory = {};
    if (results.errors) {
        results.errors.forEach(error => {
            const category = error.category || ERROR_CATEGORIES.UNKNOWN_ERROR;
            errorsByCategory[category] = (errorsByCategory[category] || 0) + 1;
        });
    }

    return {
        success: true,
        message: `Test notification sent to ${subscriptions.length} subscriptions`,
        subscriptionCount: subscriptions.length,
        invalidCount: results.invalidCount || 0,
        errorCount: results.errors ? results.errors.length : 0,
        errorsByCategory: errorsByCategory
    };
}

/**
 * Validate all subscriptions by sending a test notification
 * @returns {Object} - Result of the validation
 */
async function validateSubscriptions() {
    console.log('Validating all subscriptions...');

    if (subscriptions.length === 0) {
        console.log('No subscriptions to validate');
        return { success: true, validCount: 0, invalidCount: 0 };
    }

    // Pre-filter subscriptions to only validate those with the correct format
    // This prevents unnecessary validation attempts on subscriptions we know are invalid
    const initialCount = subscriptions.length;
    const validFormatSubscriptions = subscriptions.filter(sub => {
        // Check if the endpoint format is valid - ONLY /wp/ format is valid now
        const isValidEndpoint = sub.endpoint &&
            sub.endpoint.includes('https://fcm.googleapis.com/wp/');

        // Check if the subscription has the required keys
        const hasRequiredKeys = sub.keys &&
            sub.keys.p256dh &&
            sub.keys.auth;

        return isValidEndpoint && hasRequiredKeys;
    });

    // If we filtered out any subscriptions, update the main list
    const preFilteredCount = initialCount - validFormatSubscriptions.length;
    if (preFilteredCount > 0) {
        console.log(`Pre-filtered ${preFilteredCount} subscriptions with invalid format`);
        subscriptions = validFormatSubscriptions;
        saveSubscriptionsToFile();

        // If no valid subscriptions remain, return early
        if (validFormatSubscriptions.length === 0) {
            console.log('No valid format subscriptions to validate');
            return {
                success: true,
                validCount: 0,
                invalidCount: preFilteredCount,
                errorCount: 0
            };
        }
    }

    // Create a minimal payload for validation
    const validationPayload = JSON.stringify({
        title: 'Subscription Validation',
        body: 'This is a silent validation notification.',
        icon: '/icon-192x192.png',
        timestamp: Date.now(),
        data: {
            silent: true,
            validation: true
        }
    });

    // Send validation notification to each subscription
    const validationPromises = subscriptions.map(subscription => {
        return webpush.sendNotification(subscription, validationPayload)
            .then(() => {
                // Update the last validated timestamp
                return {
                    valid: true,
                    endpoint: subscription.endpoint
                };
            })
            .catch(error => {
                // Use our enhanced error logging
                const errorInfo = logPushError(error, 'Subscription Validation', subscription);

                // Check if this is an invalid subscription error
                if (errorInfo.isInvalidSubscription) {
                    return {
                        invalid: true,
                        endpoint: subscription.endpoint,
                        statusCode: errorInfo.statusCode,
                        category: errorInfo.category
                    };
                }

                // Other errors might be temporary, so we don't mark as invalid
                return {
                    error: true,
                    endpoint: subscription.endpoint,
                    statusCode: errorInfo.statusCode,
                    category: errorInfo.category
                };
            });
    });

    const results = await Promise.all(validationPromises);

    // Filter out invalid subscriptions
    const invalidEndpoints = results
        .filter(result => result && result.invalid)
        .map(result => result.endpoint);

    // Update valid subscriptions with lastValidated timestamp
    const validEndpoints = results
        .filter(result => result && result.valid)
        .map(result => result.endpoint);

    // Update timestamps for valid subscriptions
    subscriptions.forEach(sub => {
        if (validEndpoints.includes(sub.endpoint)) {
            sub.lastValidated = Date.now();
        }
    });

    let invalidCount = 0;
    if (invalidEndpoints.length > 0) {
        const initialValidationCount = subscriptions.length;
        subscriptions = subscriptions.filter(sub => !invalidEndpoints.includes(sub.endpoint));
        invalidCount = initialValidationCount - subscriptions.length;
        saveSubscriptionsToFile();
        console.log(`Removed ${invalidCount} invalid subscriptions during validation`);
    }

    return {
        success: true,
        validCount: validEndpoints.length,
        invalidCount: invalidCount + preFilteredCount,
        errorCount: results.filter(r => r && r.error).length
    };
}

/**
 * Send a notification to all subscriptions
 * @param {Object} notification - The notification to send
 * @returns {Object} - Result of the operation
 */
async function sendToAllSubscriptions(notification) {
    // Skip if no subscriptions
    if (subscriptions.length === 0) {
        console.log('No subscriptions available to send notifications');
        return { success: true, expiredCount: 0, invalidCount: 0 };
    }

    // Pre-filter subscriptions to only use valid ones
    // This is a safety check in case any invalid ones slipped through
    const validSubscriptions = subscriptions.filter(sub => {
        const isValidEndpoint = sub.endpoint &&
            sub.endpoint.includes('https://fcm.googleapis.com/wp/');

        const hasRequiredKeys = sub.keys &&
            sub.keys.p256dh &&
            sub.keys.auth;

        return isValidEndpoint && hasRequiredKeys;
    });

    // If we filtered out any subscriptions, update the main list
    if (validSubscriptions.length < subscriptions.length) {
        const removedCount = subscriptions.length - validSubscriptions.length;
        console.log(`Filtered out ${removedCount} invalid subscriptions before sending`);
        subscriptions = validSubscriptions;
        saveSubscriptionsToFile();

        // If no valid subscriptions remain, return early
        if (validSubscriptions.length === 0) {
            console.log('No valid subscriptions available to send notifications');
            return {
                success: true,
                invalidCount: removedCount,
                successCount: 0,
                errors: [],
                totalAttempted: removedCount
            };
        }
    }

    const payload = JSON.stringify({
        title: notification.title,
        body: notification.body,
        icon: '/icon-192x192.png',
        timestamp: Date.now(),
        data: {
            notificationId: notification.id,
            ...(notification.data || {}) // Include any additional data from the notification
        }
    });

    const sendPromises = subscriptions.map(subscription => {
        return webpush.sendNotification(subscription, payload)
            .then(() => {
                // Successfully sent notification
                return {
                    success: true,
                    endpoint: subscription.endpoint
                };
            })
            .catch(error => {
                // Use our enhanced error logging
                const errorInfo = logPushError(error, 'Send Notification', subscription);

                // Check if this is an invalid subscription error (404 or 410)
                if (errorInfo.isInvalidSubscription) {
                    return {
                        invalid: true,
                        endpoint: subscription.endpoint,
                        statusCode: errorInfo.statusCode,
                        category: errorInfo.category
                    };
                }

                // Other errors might be temporary
                return {
                    error: true,
                    endpoint: subscription.endpoint,
                    statusCode: errorInfo.statusCode,
                    category: errorInfo.category,
                    message: errorInfo.message
                };
            });
    });

    const results = await Promise.all(sendPromises);

    // Filter out invalid subscriptions
    const invalidEndpoints = results
        .filter(result => result && result.invalid)
        .map(result => result.endpoint);

    // Collect error information
    const errors = results
        .filter(result => result && result.error)
        .map(result => ({
            endpoint: result.endpoint,
            statusCode: result.statusCode,
            category: result.category,
            message: result.message
        }));

    // Count successful sends
    const successCount = results
        .filter(result => result && result.success)
        .length;

    let invalidCount = 0;
    if (invalidEndpoints.length > 0) {
        const initialCount = subscriptions.length;
        subscriptions = subscriptions.filter(sub => !invalidEndpoints.includes(sub.endpoint));
        invalidCount = initialCount - subscriptions.length;
        saveSubscriptionsToFile();
        console.log(`Removed ${invalidCount} invalid subscriptions`);
    }

    return {
        success: true,
        invalidCount,
        successCount,
        errors,
        totalAttempted: subscriptions.length + invalidCount
    };
}

/**
 * Schedule a notification job
 * @param {Object} notification - The notification to schedule
 */
function scheduleNotificationJob(notification) {
    const scheduledTime = new Date(notification.scheduledTime);
    // Removed scheduling log message

    // Check if the scheduled time is in the past
    if (scheduledTime <= new Date()) {
        // Removed past time log message
        sendToAllSubscriptions(notification);
        return;
    }

    // Calculate the delay in milliseconds (capped at max safe integer)
    const now = new Date();
    const delay = Math.min(
        scheduledTime - now,
        // Use a maximum delay of 24 hours (in milliseconds)
        // This prevents timeout overflow warnings
        24 * 60 * 60 * 1000
    );

    // Schedule the notification with a safe delay
    const job = setTimeout(async () => {
        const currentTime = new Date();

        if (currentTime >= scheduledTime) {
            // Time has arrived, send the notification
            await sendToAllSubscriptions(notification);

            // Handle repeating notifications
            if (notification.repeat) {
                // Implement repeat logic here
                // Removed repeat log message
            }

            // Remove the job reference
            notificationJobs.delete(notification.id);
        } else {
            // Not yet time, reschedule with remaining time
            notificationJobs.delete(notification.id);
            scheduleNotificationJob(notification);
        }
    }, delay);

    // Store the job reference for potential cancellation
    notificationJobs.set(notification.id, job);
}

/**
 * Setup daily notification check
 * @param {Function} cronSchedule - The cron schedule function
 */
function setupDailyCheck(cronSchedule) {
    // Daily notification check at midnight
    cronSchedule('0 0 * * *', () => {
        console.log('Running daily notification check');
        // Implement any daily notification logic here
    });

    // Weekly subscription validation (every Sunday at 2 AM)
    cronSchedule('0 2 * * 0', async () => {
        console.log('Running weekly subscription validation');
        try {
            const result = await validateSubscriptions();
            console.log('Weekly subscription validation complete:', result);
        } catch (error) {
            console.error('Error during weekly subscription validation:', error);
        }
    });
}

/**
 * Categorize an error from the web-push library
 * @param {Error} error - The error to categorize
 * @returns {Object} - Categorized error information
 */
function categorizeError(error) {
    // Default error info
    const errorInfo = {
        category: ERROR_CATEGORIES.UNKNOWN_ERROR,
        statusCode: error.statusCode || null,
        message: error.message || 'Unknown error',
        body: error.body || null,
        endpoint: error.endpoint || null,
        isInvalidSubscription: false
    };

    // Check if this is a WebPushError
    if (error.name === 'WebPushError') {
        // Check status code to categorize
        if (INVALID_STATUS_CODES.includes(error.statusCode)) {
            errorInfo.category = ERROR_CATEGORIES.INVALID_SUBSCRIPTION;
            errorInfo.isInvalidSubscription = true;
        } else if (error.statusCode >= 500) {
            errorInfo.category = ERROR_CATEGORIES.SERVER_ERROR;
        } else if (error.statusCode >= 400) {
            errorInfo.category = ERROR_CATEGORIES.CLIENT_ERROR;
        }
    } else if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
        // Network-related errors
        errorInfo.category = ERROR_CATEGORIES.NETWORK_ERROR;
    }

    return errorInfo;
}

/**
 * Log a push notification error with detailed information
 * @param {Error} error - The error to log
 * @param {string} context - The context where the error occurred
 * @param {Object} subscription - The subscription that caused the error
 */
function logPushError(error, context, subscription) {
    const errorInfo = categorizeError(error);

    console.error(`[${context}] Push notification error: ${errorInfo.category}`);
    console.error(`  Status: ${errorInfo.statusCode || 'N/A'}`);
    console.error(`  Message: ${errorInfo.message}`);

    if (errorInfo.body) {
        console.error(`  Response: ${errorInfo.body}`);
    }

    if (subscription && subscription.endpoint) {
        console.error(`  Endpoint: ${subscription.endpoint}`);
    }

    // Only log the full error for unknown errors
    if (errorInfo.category === ERROR_CATEGORIES.UNKNOWN_ERROR) {
        console.error('  Full error:', error);
    }

    return errorInfo;
}

/**
 * Clean invalid subscriptions
 * Removes all subscriptions with invalid endpoints
 * @returns {Object} - Result of the cleanup
 */
function cleanInvalidSubscriptions() {
    console.log('Cleaning invalid subscriptions...');

    // Remove subscriptions with invalid endpoints
    const initialCount = subscriptions.length;

    // Filter out subscriptions with invalid endpoints
    // NOTE: Only the /wp/ format is now considered valid, /fcm/send/ is no longer valid
    const validSubscriptions = subscriptions.filter(sub => {
        // Check if the endpoint format is valid - ONLY /wp/ format is valid now
        const isValidEndpoint = sub.endpoint &&
            sub.endpoint.includes('https://fcm.googleapis.com/wp/');

        // Check if the subscription has the required keys
        const hasRequiredKeys = sub.keys &&
            sub.keys.p256dh &&
            sub.keys.auth;

        return isValidEndpoint && hasRequiredKeys;
    });

    const removedCount = initialCount - validSubscriptions.length;

    if (removedCount > 0) {
        subscriptions = validSubscriptions;
        saveSubscriptionsToFile();
        console.log(`Removed ${removedCount} invalid subscriptions during cleanup`);
    } else {
        console.log('No invalid subscriptions found during cleanup');
    }

    return {
        success: true,
        removedCount: removedCount,
        remainingCount: subscriptions.length
    };
}

/**
 * Clear all subscriptions
 * Removes all subscriptions from memory and file
 * @returns {Object} - Result of the operation
 */
function clearAllSubscriptions() {
    console.log('Clearing all subscriptions...');

    const initialCount = subscriptions.length;
    subscriptions = [];
    saveSubscriptionsToFile();

    console.log(`Cleared all ${initialCount} subscriptions`);

    return {
        success: true,
        removedCount: initialCount,
        remainingCount: 0
    };
}

/**
 * Get all subscriptions
 * @returns {Array} - List of subscriptions
 */
function getSubscriptions() {
    return subscriptions;
}

/**
 * Get subscription count
 * @returns {Object} - Count of subscriptions
 */
function getSubscriptionCount() {
    return {
        count: subscriptions.length,
        timestamp: Date.now()
    };
}

module.exports = {
    initialize,
    saveSubscription,
    scheduleNotification,
    getScheduledNotifications,
    deleteNotification,
    sendTestNotification,
    setupDailyCheck,
    validateSubscriptions,
    cleanInvalidSubscriptions,
    clearAllSubscriptions,
    getSubscriptions,
    getSubscriptionCount
};
