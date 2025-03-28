const express = require('express');
const cors = require('cors'); // <-- Added CORS
const webpush = require('web-push');
// const bodyParser = require('body-parser'); // <-- Replaced by express.json/urlencoded
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');

// --- Database and Goal Route Imports ---
const db = require('./db'); // <-- Added DB module import
const goalRoutes = require('./routes/goals'); // <-- Added Goal routes import
// --- ---

const app = express();
const PORT = process.env.PORT || 3000;

// --- Optional: Test DB connection via db.js on startup ---
db.query('SELECT NOW()')
  .then(res => {
    console.log('Database connected successfully via db.js:', res.rows[0]);
  })
  .catch(err => {
    console.error('Database connection error via db.js:', err.stack);
    // Consider exiting if DB connection fails: process.exit(1);
  });
// --- ---

// Set VAPID keys (keep your existing keys)
const vapidKeys = {
  publicKey: 'BM29P5O99J9F-DUOyqNwGyurNl5a3ZSkBa0ZlOLR9AylchmgPwHbCeZaFGlEcKoAUOaZvNk5aXa0dHSDS_RT2v0',
  privateKey: 'HAn8aWLZWt80-NQ1KAQ5POvNc91vW5cuD3sIw0d0C14'
};

webpush.setVapidDetails(
  'mailto:kevinguyen022@gmail.com', // Your email
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Middleware
app.use(cors()); // <-- Enable CORS
app.use(express.json()); // <-- Use built-in parser instead of bodyParser
app.use(express.urlencoded({ extended: true })); // <-- Add urlencoded parser

// Serve Static files BEFORE API routes
app.use(express.static(path.join(__dirname, 'public')));
// Removed redundant static path for 'pages', assume goals.html is in public/pages

// --- API Routes ---
// Mount the goal routes - ALL requests starting with /api/goals go here
app.use('/api/goals', goalRoutes);

// Keep existing Notification Routes
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
    setTimeout(() => {
      webpush.sendNotification(subscription, JSON.stringify({
        title: 'Subscription Confirmed', body: 'You will now receive background notifications!', data: { dateOfNotification: Date.now() }
      }))
      .then(() => console.log('Test notification sent successfully'))
      .catch(err => console.error('Error sending test notification:', err));
    }, 2000);
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
      title: req.body.title, body: req.body.body, scheduledTime: req.body.scheduledTime,
      repeat: req.body.repeat, createdAt: Date.now()
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

app.delete('/api/delete-notification/:id', (req, res) => {
  const id = req.params.id;
  const index = scheduledNotifications.findIndex(n => n.id === id);
  if (index !== -1) {
    scheduledNotifications.splice(index, 1);
    saveNotificationsToFile();
    res.json({ success: true, message: 'Notification deleted' });
  } else {
    res.status(404).json({ success: false, message: 'Notification not found' });
  }
});

app.post('/api/send-test-notification', (req, res) => {
    // ... (keep existing implementation) ...
     try {
        const testNotification = {
          id: require('crypto').randomBytes(12).toString('hex'),
          title: 'Test Notification', body: 'This is a test background notification',
          data: { dateOfNotification: Date.now(), notificationId: 'test-' + Date.now() }
        };
        if (subscriptions.length === 0) {
          return res.status(400).json({ success: false, message: 'No subscriptions available' });
        }
        const pushPromises = subscriptions.map(subscription => {
          return webpush.sendNotification(subscription, JSON.stringify(testNotification))
            .catch(err => console.error('Error sending test notification:', err));
        });
        Promise.all(pushPromises).then(() => {
          res.json({ success: true, message: `Test notification sent to ${subscriptions.length} subscriptions` });
        });
      } catch (error) {
        console.error('Error sending test notification:', error);
        res.status(500).json({ success: false, message: 'Server error sending test notification' });
      }
});
// --- End of Notification Routes ---


// In-memory storage (replace with database for production persistence if needed for notifications too)
let subscriptions = [];
let scheduledNotifications = [];


// --- Keep ALL Helper Functions (save/load/schedule/send notifications) ---
function saveSubscriptionsToFile() { /* ...keep implementation... */
  try {
    fs.writeFileSync(path.join(__dirname, 'subscriptions.json'), JSON.stringify(subscriptions), 'utf8');
    console.log(`Saved ${subscriptions.length} subscriptions to file`);
  } catch (error) { console.error('Error saving subscriptions:', error); }
}
function saveNotificationsToFile() { /* ...keep implementation... */
  try {
    fs.writeFileSync(path.join(__dirname, 'notifications.json'), JSON.stringify(scheduledNotifications), 'utf8');
    console.log(`Saved ${scheduledNotifications.length} notifications to file`);
  } catch (error) { console.error('Error saving notifications:', error); }
}
function loadFromFiles() { /* ...keep implementation... */
   try {
    if (fs.existsSync(path.join(__dirname, 'subscriptions.json'))) {
      subscriptions = JSON.parse(fs.readFileSync(path.join(__dirname, 'subscriptions.json'), 'utf8'));
      console.log(`Loaded ${subscriptions.length} subscriptions from file`);
    }
    if (fs.existsSync(path.join(__dirname, 'notifications.json'))) {
      scheduledNotifications = JSON.parse(fs.readFileSync(path.join(__dirname, 'notifications.json'), 'utf8'));
      console.log(`Loaded ${scheduledNotifications.length} notifications from file`);
    }
  } catch (e) { console.error('Error loading saved data:', e); }
}
function scheduleNotificationJob(notification) { /* ...keep implementation... */
  try {
    const scheduledTime = new Date(notification.scheduledTime);
    const minute = scheduledTime.getMinutes(); const hour = scheduledTime.getHours();
    const dayOfMonth = scheduledTime.getDate(); const month = scheduledTime.getMonth() + 1;
    const dayOfWeek = scheduledTime.getDay();
    let cronExpression;
    if (notification.repeat === 'daily') { cronExpression = `${minute} ${hour} * * *`; }
    else if (notification.repeat === 'weekly') { cronExpression = `${minute} ${hour} * * ${dayOfWeek}`; }
    else { cronExpression = `${minute} ${hour} ${dayOfMonth} ${month} *`; }
    console.log(`Scheduling notification "${notification.title}" with cron: ${cronExpression}`);
    const job = cron.schedule(cronExpression, () => {
      console.log(`Sending notification: ${notification.title}`);
      if (notification.repeat === 'none') {
        job.stop();
        const index = scheduledNotifications.findIndex(n => n.id === notification.id);
        if (index !== -1) { scheduledNotifications.splice(index, 1); saveNotificationsToFile(); }
      }
      sendNotificationToAll(notification);
    });
    return job;
  } catch (error) { console.error('Error scheduling notification job:', error); return null; }
}
function sendNotificationToAll(notification) { /* ...keep implementation... */
    if (subscriptions.length === 0) { console.warn('No subscriptions to send notifications to'); return; }
    console.log(`Sending notification to ${subscriptions.length} subscriptions`);
    const notificationPayload = {
      title: notification.title, body: notification.body, data: { dateOfNotification: Date.now(), notificationId: notification.id }
    };
    const batchSize = 10; const batches = Math.ceil(subscriptions.length / batchSize);
    for (let i = 0; i < batches; i++) {
      const start = i * batchSize; const end = Math.min(start + batchSize, subscriptions.length);
      const batch = subscriptions.slice(start, end);
      setTimeout(() => { processBatch(batch, notificationPayload); }, i * 1000);
    }
}
function processBatch(subscriptionBatch, payload) { /* ...keep implementation... */
    const pushPromises = subscriptionBatch.map(subscription => {
    return webpush.sendNotification(subscription, JSON.stringify(payload))
      .then(() => { return { success: true, subscription }; })
      .catch(err => {
        console.error('Error sending notification:', err); let shouldRemove = false;
        if (err.statusCode === 410) { shouldRemove = true; }
        return { success: false, subscription, shouldRemove, error: err.message };
      });
  });
  Promise.all(pushPromises).then(results => {
    const invalidSubscriptions = results.filter(result => result.shouldRemove).map(result => result.subscription.endpoint);
    if (invalidSubscriptions.length > 0) {
      console.log(`Removing ${invalidSubscriptions.length} invalid subscriptions`);
      subscriptions = subscriptions.filter(sub => !invalidSubscriptions.includes(sub.endpoint));
      saveSubscriptionsToFile();
    }
    const successCount = results.filter(result => result.success).length;
    console.log(`Successfully sent ${successCount} out of ${results.length} notifications`);
  });
}
// --- End of Helper Functions ---


// --- Fallback Routes (Optional - place AFTER all API routes) ---
// Serve goals.html if requested directly
app.get('/pages/goals.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'goals.html'));
});
// Fallback for other routes (e.g., for SPAs)
app.get('*', (req, res) => {
   // Avoid sending index.html for API-like paths just in case
   if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
   } else {
      // Handle unknown API routes with 404
      res.status(404).json({ error: 'Not Found' });
   }
});
// --- ---


// Initialize server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Load saved notification/subscription data
  loadFromFiles();

  // Reschedule all notifications from file
  scheduledNotifications.forEach(notification => {
    // Only schedule future notifications or repeating ones
    if (new Date(notification.scheduledTime) > Date.now() || notification.repeat !== 'none') {
      scheduleNotificationJob(notification);
    }
  });

  // --- Removed Heartbeat - Reinstate if needed for your deployment platform ---
  // setInterval(() => {
  //   console.log('Server heartbeat check:', new Date().toISOString());
  //   // ... (heartbeat logic) ...
  // }, 60000);
});