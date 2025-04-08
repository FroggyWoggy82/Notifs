const express = require('express');
const cors = require('cors');
const webpush = require('web-push');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');

// Database connection
const db = require('./db');

// Import routes
const goalRoutes = require('./routes/goals');
const daysSinceRouter = require('./routes/daysSince');
const workoutRoutes = require('./routes/workouts');
const habitRoutes = require('./routes/habits');
const recipeRoutes = require('./routes/recipes');
const weightRoutes = require('./routes/weightRoutes');
const taskRoutes = require('./routes/tasks');

// Import Swagger documentation
const { swaggerDocs } = require('./docs/swagger');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/goals', goalRoutes);
app.use('/api/days-since', daysSinceRouter);
app.use('/api/workouts', workoutRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/weight', weightRoutes);
app.use('/api/tasks', taskRoutes);

// Setup Swagger documentation
swaggerDocs(app);

// Web Push Configuration
// Keep existing notification code
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BLBz5FpXXWgDjQJMDYZ-VENKh-qX1FhL-YhJ3keyGlBSGEQQYfwwucepKWzT2JbIQcUHduvWj5klFuT1UlqxvHQ';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'Qs0OSR2VsBf3t0x0fpTpiBgMGAOegt60NX0F3cYvYpU';

webpush.setVapidDetails(
  'mailto:kevinguyen022@gmail.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// In-memory storage for subscriptions and notifications
// In a production app, these would be stored in a database
let subscriptions = [];
let scheduledNotifications = [];

// Load existing subscriptions and notifications from file if available
const SUBSCRIPTIONS_FILE = path.join(__dirname, 'data', 'subscriptions.json');
const NOTIFICATIONS_FILE = path.join(__dirname, 'data', 'notifications.json');

// Create data directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
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

// Save subscriptions to file
function saveSubscriptionsToFile() {
  fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subscriptions, null, 2));
}

// Save notifications to file
function saveNotificationsToFile() {
  fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(scheduledNotifications, null, 2));
}

// Notification Routes
app.post('/api/save-subscription', (req, res) => {
  try {
    const subscription = req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ success: false, message: 'Invalid subscription data' });
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
    res.status(201).json({ success: true, message: 'Subscription saved' });
  } catch (error) {
    console.error('Error saving subscription:', error);
    res.status(500).json({ success: false, message: 'Server error saving subscription' });
  }
});

app.post('/api/schedule-notification', (req, res) => {
  try {
    const notification = {
      id: require('crypto').randomBytes(12).toString('hex'),
      title: req.body.title,
      body: req.body.body,
      scheduledTime: req.body.scheduledTime,
      repeat: req.body.repeat,
      createdAt: Date.now()
    };
    scheduledNotifications.push(notification);
    saveNotificationsToFile();
    scheduleNotificationJob(notification);
    res.status(201).json({ success: true, id: notification.id, message: 'Notification scheduled' });
  } catch (error) {
    console.error('Error scheduling notification:', error);
    res.status(500).json({ success: false, message: 'Server error scheduling notification' });
  }
});

app.get('/api/get-scheduled-notifications', (req, res) => {
  res.json(scheduledNotifications);
});

app.delete('/api/notification/:id', (req, res) => {
  try {
    const id = req.params.id;
    const initialLength = scheduledNotifications.length;
    scheduledNotifications = scheduledNotifications.filter(n => n.id !== id);

    if (scheduledNotifications.length === initialLength) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    saveNotificationsToFile();
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message: 'Server error deleting notification' });
  }
});

app.post('/api/send-test-notification', (req, res) => {
  try {
    const testNotification = {
      title: 'Test Notification',
      body: 'This is a test notification from the server.',
      icon: '/icon-192x192.png',
      timestamp: Date.now()
    };

    // Send to all subscriptions
    const sendPromises = subscriptions.map(subscription => {
      return webpush.sendNotification(subscription, JSON.stringify(testNotification))
        .catch(error => {
          console.error('Error sending to subscription:', error);
          if (error.statusCode === 410) {
            // Subscription has expired or is no longer valid
            return { expired: true, endpoint: subscription.endpoint };
          }
          return { error: true, endpoint: subscription.endpoint };
        });
    });

    Promise.all(sendPromises).then(results => {
      // Filter out expired subscriptions
      const expiredEndpoints = results
        .filter(result => result && result.expired)
        .map(result => result.endpoint);

      if (expiredEndpoints.length > 0) {
        subscriptions = subscriptions.filter(sub => !expiredEndpoints.includes(sub.endpoint));
        saveSubscriptionsToFile();
        console.log(`Removed ${expiredEndpoints.length} expired subscriptions`);
      }

      res.json({
        success: true,
        message: `Test notification sent to ${subscriptions.length} subscriptions`,
        expiredRemoved: expiredEndpoints.length
      });
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ success: false, message: 'Server error sending test notification' });
  }
});

// Function to send notification
function sendNotification(notification) {
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

  Promise.all(sendPromises).then(results => {
    // Filter out expired subscriptions
    const expiredEndpoints = results
      .filter(result => result && result.expired)
      .map(result => result.endpoint);

    if (expiredEndpoints.length > 0) {
      subscriptions = subscriptions.filter(sub => !expiredEndpoints.includes(sub.endpoint));
      saveSubscriptionsToFile();
      console.log(`Removed ${expiredEndpoints.length} expired subscriptions`);
    }
  });
}

// Schedule notification job
function scheduleNotificationJob(notification) {
  const scheduledTime = new Date(notification.scheduledTime);
  console.log(`Scheduling notification "${notification.title}" for ${scheduledTime.toLocaleString()}`);

  // Check if the scheduled time is in the past
  if (scheduledTime <= new Date()) {
    console.log(`Notification time ${scheduledTime.toLocaleString()} is in the past, sending immediately`);
    sendNotification(notification);
    return;
  }

  // Schedule the notification
  const job = setTimeout(() => {
    console.log(`Executing scheduled notification: ${notification.title}`);
    sendNotification(notification);

    // Handle repeating notifications
    if (notification.repeat) {
      // Implement repeat logic here
      console.log(`This notification should repeat: ${notification.repeat}`);
    }
  }, scheduledTime - new Date());

  // Store the job reference if needed for cancellation
  notification.job = job;
}

// Schedule all notifications on startup
scheduledNotifications.forEach(notification => {
  scheduleNotificationJob(notification);
});

// Setup a daily check for notifications
cron.schedule('0 0 * * *', () => {
  console.log('Running daily notification check');
  // Implement any daily notification logic here
});

// Fallback Routes
app.get('/pages/goals.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'goals.html'));
});

// Fallback for other routes (e.g., for SPAs)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
