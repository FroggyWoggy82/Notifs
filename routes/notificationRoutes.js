/**
 * Notification Routes
 * Defines API endpoints for notifications
 */

const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');

/**
 * @swagger
 * /api/notifications/subscription:
 *   post:
 *     summary: Save a push notification subscription
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - endpoint
 *             properties:
 *               endpoint:
 *                 type: string
 *                 description: The subscription endpoint
 *               keys:
 *                 type: object
 *                 properties:
 *                   p256dh:
 *                     type: string
 *                   auth:
 *                     type: string
 *     responses:
 *       201:
 *         description: Subscription saved successfully
 *       400:
 *         description: Invalid subscription data
 */
router.post('/subscription', NotificationController.saveSubscription);

/**
 * @swagger
 * /api/notifications/schedule:
 *   post:
 *     summary: Schedule a notification
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - body
 *               - scheduledTime
 *             properties:
 *               title:
 *                 type: string
 *                 description: The notification title
 *               body:
 *                 type: string
 *                 description: The notification body
 *               scheduledTime:
 *                 type: string
 *                 format: date-time
 *                 description: When to send the notification
 *               repeat:
 *                 type: string
 *                 description: Repeat pattern (daily, weekly, etc.)
 *     responses:
 *       201:
 *         description: Notification scheduled successfully
 *       500:
 *         description: Server error
 */
router.post('/schedule', NotificationController.scheduleNotification);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get all scheduled notifications
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: List of scheduled notifications
 *       500:
 *         description: Server error
 */
router.get('/', NotificationController.getScheduledNotifications);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The notification ID
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', NotificationController.deleteNotification);

/**
 * @swagger
 * /api/notifications/test:
 *   post:
 *     summary: Send a test notification to all subscriptions
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: Test notification sent successfully
 *       500:
 *         description: Server error
 */
router.post('/test', NotificationController.sendTestNotification);

/**
 * @swagger
 * /api/notifications/save-subscription:
 *   post:
 *     summary: Save a push notification subscription (alternative endpoint)
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - endpoint
 *             properties:
 *               endpoint:
 *                 type: string
 *                 description: The subscription endpoint
 *               keys:
 *                 type: object
 *                 properties:
 *                   p256dh:
 *                     type: string
 *                   auth:
 *                     type: string
 *     responses:
 *       201:
 *         description: Subscription saved successfully
 *       400:
 *         description: Invalid subscription data
 */
router.post('/save-subscription', NotificationController.saveSubscription);

module.exports = router;
