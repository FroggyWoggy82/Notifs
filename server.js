// 2. BACKEND CODE (Node.js with Express)
// Create a file named server.js

const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 3000;

// Set VAPID keys (generate these with web-push generate-vapid-keys)
const vapidKeys = {
  publicKey: 'BM29P5O99J9F-DUOyqNwGyurNl5a3ZSkBa0ZlOLR9AylchmgPwHbCeZaFGlEcKoAUOaZvNk5aXa0dHSDS_RT2v0',
  privateKey: 'HAn8aWLZWt80-NQ1KAQ5POvNc91vW5cuD3sIw0d0C14'
};

webpush.setVapidDetails(
  'mailto:youremail@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage (replace with database in production)
let subscriptions = [];
let scheduledNotifications = [];

// Save subscription route
app.post('/api/save-subscription', (req, res) => {
  const subscription = req.body;
  
  // Check for existing subscription
  const existingIndex = subscriptions.findIndex(s => 
    s.endpoint === subscription.endpoint
  );
  
  if (existingIndex !== -1) {
    subscriptions[existingIndex] = subscription;
  } else {
    subscriptions.push(subscription);
  }
  
  // In production, save to database
  saveSubscriptionsToFile();
  
  res.status(201).json({ message: 'Subscription saved' });
});

// Schedule notification route
app.post('/api/schedule-notification', (req, res) => {
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
  
  // Schedule the notification using cron
  scheduleNotificationJob(notification);
  
  res.status(201).json({ 
    success: true, 
    id: notification.id, 
    message: 'Notification scheduled' 
  });
});

// Get scheduled notifications
app.get('/api/get-scheduled-notifications', (req, res) => {
  res.json(scheduledNotifications);
});

// Delete notification
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

// File persistence helpers
function saveSubscriptionsToFile() {
  fs.writeFileSync(
    path.join(__dirname, 'subscriptions.json'),
    JSON.stringify(subscriptions),
    'utf8'
  );
}

function saveNotificationsToFile() {
  fs.writeFileSync(
    path.join(__dirname, 'notifications.json'),
    JSON.stringify(scheduledNotifications),
    'utf8'
  );
}

function loadFromFiles() {
  try {
    if (fs.existsSync(path.join(__dirname, 'subscriptions.json'))) {
      subscriptions = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'subscriptions.json'), 'utf8')
      );
    }
    
    if (fs.existsSync(path.join(__dirname, 'notifications.json'))) {
      scheduledNotifications = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'notifications.json'), 'utf8')
      );
    }
  } catch (e) {
    console.error('Error loading saved data:', e);
  }
}

// Schedule notification using cron
function scheduleNotificationJob(notification) {
  const scheduledTime = new Date(notification.scheduledTime);
  
  // Extract cron components
  const minute = scheduledTime.getMinutes();
  const hour = scheduledTime.getHours();
  const dayOfMonth = scheduledTime.getDate();
  const month = scheduledTime.getMonth() + 1;
  const dayOfWeek = scheduledTime.getDay();
  
  let cronExpression;
  
  if (notification.repeat === 'daily') {
    // Run at the same time every day
    cronExpression = `${minute} ${hour} * * *`;
  } else if (notification.repeat === 'weekly') {
    // Run at the same time on the same day of the week
    cronExpression = `${minute} ${hour} * * ${dayOfWeek}`;
  } else {
    // One-time schedule (run once at the exact time)
    cronExpression = `${minute} ${hour} ${dayOfMonth} ${month} *`;
  }
  
  // Schedule the job
  const job = cron.schedule(cronExpression, () => {
    console.log(`Sending notification: ${notification.title}`);
    
    // For one-time notifications, stop after firing
    if (notification.repeat === 'none') {
      job.stop();
      
      // Remove from scheduled notifications
      const index = scheduledNotifications.findIndex(n => n.id === notification.id);
      if (index !== -1) {
        scheduledNotifications.splice(index, 1);
        saveNotificationsToFile();
      }
    }
    
    // Send the notification to all subscriptions
    sendNotificationToAll(notification);
  });
}

// Send notification to all subscribers
function sendNotificationToAll(notification) {
  const notificationPayload = {
    title: notification.title,
    body: notification.body,
    data: {
      dateOfNotification: Date.now(),
      notificationId: notification.id
    }
  };
  
  const pushPromises = subscriptions.map(subscription => {
    return webpush.sendNotification(subscription, JSON.stringify(notificationPayload))
      .catch(err => {
        console.error('Error sending notification:', err);
        
        // If subscription is no longer valid, remove it
        if (err.statusCode === 410) {
          const index = subscriptions.findIndex(s => s.endpoint === subscription.endpoint);
          if (index !== -1) {
            subscriptions.splice(index, 1);
            saveSubscriptionsToFile();
          }
        }
      });
  });
  
  Promise.all(pushPromises).then(() => {
    console.log('Notifications sent successfully');
  });
}

// Initialize server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Load saved data
  loadFromFiles();
  
  // Reschedule all notifications from file
  scheduledNotifications.forEach(notification => {
    // Only schedule future notifications
    if (notification.scheduledTime > Date.now() || notification.repeat !== 'none') {
      scheduleNotificationJob(notification);
    }
  });
});