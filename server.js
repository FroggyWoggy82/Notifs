const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 3000;

// Set VAPID keys (these should be your existing keys)
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
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage (replace with database in production)
let subscriptions = [];
let scheduledNotifications = [];

// Save subscription route with better error handling
app.post('/api/save-subscription', (req, res) => {
  try {
    const subscription = req.body;
    
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid subscription data' 
      });
    }
    
    // Check for existing subscription
    const existingIndex = subscriptions.findIndex(s => 
      s.endpoint === subscription.endpoint
    );
    
    if (existingIndex !== -1) {
      subscriptions[existingIndex] = subscription;
      console.log('Updated existing subscription');
    } else {
      subscriptions.push(subscription);
      console.log('Added new subscription');
    }
    
    // Save to file
    saveSubscriptionsToFile();
    
    // Send a test notification to confirm subscription works
    setTimeout(() => {
      webpush.sendNotification(subscription, JSON.stringify({
        title: 'Subscription Confirmed',
        body: 'You will now receive background notifications!',
        data: {
          dateOfNotification: Date.now()
        }
      }))
      .then(() => console.log('Test notification sent successfully'))
      .catch(err => console.error('Error sending test notification:', err));
    }, 2000);
    
    res.status(201).json({ 
      success: true,
      message: 'Subscription saved' 
    });
  } catch (error) {
    console.error('Error saving subscription:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error saving subscription' 
    });
  }
});

// Schedule notification route
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
    
    // Schedule the notification using cron
    scheduleNotificationJob(notification);
    
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
  try {
    fs.writeFileSync(
      path.join(__dirname, 'subscriptions.json'),
      JSON.stringify(subscriptions),
      'utf8'
    );
    console.log(`Saved ${subscriptions.length} subscriptions to file`);
  } catch (error) {
    console.error('Error saving subscriptions:', error);
  }
}

function saveNotificationsToFile() {
  try {
    fs.writeFileSync(
      path.join(__dirname, 'notifications.json'),
      JSON.stringify(scheduledNotifications),
      'utf8'
    );
    console.log(`Saved ${scheduledNotifications.length} notifications to file`);
  } catch (error) {
    console.error('Error saving notifications:', error);
  }
}

function loadFromFiles() {
  try {
    if (fs.existsSync(path.join(__dirname, 'subscriptions.json'))) {
      subscriptions = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'subscriptions.json'), 'utf8')
      );
      console.log(`Loaded ${subscriptions.length} subscriptions from file`);
    }
    
    if (fs.existsSync(path.join(__dirname, 'notifications.json'))) {
      scheduledNotifications = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'notifications.json'), 'utf8')
      );
      console.log(`Loaded ${scheduledNotifications.length} notifications from file`);
    }
  } catch (e) {
    console.error('Error loading saved data:', e);
  }
}

// Improved scheduling with robust error handling
function scheduleNotificationJob(notification) {
  try {
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
    
    console.log(`Scheduling notification "${notification.title}" with cron: ${cronExpression}`);
    
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
    
    return job;
  } catch (error) {
    console.error('Error scheduling notification job:', error);
    return null;
  }
}

// Improved notification delivery
function sendNotificationToAll(notification) {
  if (subscriptions.length === 0) {
    console.warn('No subscriptions to send notifications to');
    return;
  }
  
  console.log(`Sending notification to ${subscriptions.length} subscriptions`);
  
  const notificationPayload = {
    title: notification.title,
    body: notification.body,
    data: {
      dateOfNotification: Date.now(),
      notificationId: notification.id
    }
  };
  
  // Process subscriptions in batches to avoid overwhelming the server
  const batchSize = 10;
  const batches = Math.ceil(subscriptions.length / batchSize);
  
  for (let i = 0; i < batches; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, subscriptions.length);
    const batch = subscriptions.slice(start, end);
    
    setTimeout(() => {
      processBatch(batch, notificationPayload);
    }, i * 1000); // Stagger batches by 1 second
  }
}

function processBatch(subscriptionBatch, payload) {
  const pushPromises = subscriptionBatch.map(subscription => {
    return webpush.sendNotification(subscription, JSON.stringify(payload))
      .then(() => {
        console.log('Push notification sent successfully');
        return { success: true, subscription };
      })
      .catch(err => {
        console.error('Error sending notification:', err);
        
        // Track if we should remove this subscription
        let shouldRemove = false;
        
        // If subscription is no longer valid, mark for removal
        if (err.statusCode === 410) {
          shouldRemove = true;
        }
        
        return { 
          success: false, 
          subscription,
          shouldRemove,
          error: err.message 
        };
      });
  });
  
  Promise.all(pushPromises).then(results => {
    // Process results and remove invalid subscriptions
    const invalidSubscriptions = results
      .filter(result => result.shouldRemove)
      .map(result => result.subscription.endpoint);
    
    if (invalidSubscriptions.length > 0) {
      console.log(`Removing ${invalidSubscriptions.length} invalid subscriptions`);
      
      // Filter out invalid subscriptions
      subscriptions = subscriptions.filter(sub => 
        !invalidSubscriptions.includes(sub.endpoint)
      );
      
      // Save updated subscriptions
      saveSubscriptionsToFile();
    }
    
    const successCount = results.filter(result => result.success).length;
    console.log(`Successfully sent ${successCount} out of ${results.length} notifications`);
  });
}

// Add test endpoint for debugging
app.post('/api/send-test-notification', (req, res) => {
  try {
    const testNotification = {
      id: require('crypto').randomBytes(12).toString('hex'),
      title: 'Test Notification',
      body: 'This is a test background notification',
      data: {
        dateOfNotification: Date.now(),
        notificationId: 'test-' + Date.now()
      }
    };
    
    if (subscriptions.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No subscriptions available' 
      });
    }
    
    // Send to all subscriptions
    const pushPromises = subscriptions.map(subscription => {
      return webpush.sendNotification(subscription, JSON.stringify(testNotification))
        .catch(err => {
          console.error('Error sending test notification:', err);
        });
    });
    
    Promise.all(pushPromises).then(() => {
      res.json({ 
        success: true, 
        message: `Test notification sent to ${subscriptions.length} subscriptions` 
      });
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error sending test notification' 
    });
  }
});

// Initialize server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Load saved data
  loadFromFiles();
  
  // Reschedule all notifications from file
  scheduledNotifications.forEach(notification => {
    // Only schedule future notifications or repeating ones
    if (notification.scheduledTime > Date.now() || notification.repeat !== 'none') {
      scheduleNotificationJob(notification);
    }
  });
  
  // Add a heartbeat check to keep server active
  setInterval(() => {
    console.log('Server heartbeat check:', new Date().toISOString());
    // Check for any notifications that need to be sent
    const now = Date.now();
    scheduledNotifications.forEach(notification => {
      if (notification.scheduledTime <= now && notification.scheduledTime > now - 60000) {
        console.log('Heartbeat found notification to send:', notification.title);
        sendNotificationToAll(notification);
      }
    });
  }, 60000); // Every minute
});