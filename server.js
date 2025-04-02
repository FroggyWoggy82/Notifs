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
const daysSinceRouter = require('./routes/daysSince');
const workoutRoutes = require('./routes/workouts'); // <-- Added Workout routes import
const habitRoutes = require('./routes/habits'); // <-- Add Habit routes import
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

// Add routes
app.use('/api/days-since', daysSinceRouter);

// Mount the workout routes - ALL requests starting with /api/workouts go here
app.use('/api/workouts', workoutRoutes);

// Mount the habit routes - ALL requests starting with /api/habits go here
app.use('/api/habits', habitRoutes);

// --- NEW Task API Routes ---

// GET /api/tasks - Fetch all tasks
app.get('/api/tasks', async (req, res) => {
    console.log("Received GET /api/tasks request");
    try {
        // Order by completion status, then assigned date, then creation date
        const result = await db.query('SELECT * FROM tasks ORDER BY is_complete ASC, assigned_date ASC, created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// POST /api/tasks - Create a new task
app.post('/api/tasks', async (req, res) => {
    // Destructure new fields from req.body
    const { title, description, reminderTime, assignedDate, dueDate, recurrenceType, recurrenceInterval } = req.body;
    
    // Log received data including new fields
    console.log(`Received POST /api/tasks: title='${title}', assigned='${assignedDate}', due='${dueDate}', recurrence='${recurrenceType}', interval='${recurrenceInterval}', reminder='${reminderTime}'`);

    if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'Task title cannot be empty' });
    }

    // --- Validate Dates (Assigned, Due, Reminder) ---
    let p_assignedDate = new Date(); // Default to today
    if (assignedDate) {
        try {
            p_assignedDate = new Date(assignedDate);
            if (isNaN(p_assignedDate.getTime())) throw new Error('Invalid Assigned Date');
            // Set to start of day in UTC for consistency? Or keep local?
            // Let's keep local for now, assuming user input is local.
        } catch { return res.status(400).json({ error: 'Invalid Assigned Date format. Use YYYY-MM-DD.' }); }
    } else {
         // Use default (today), log it
         console.log("No assignedDate provided, defaulting to today.");
         p_assignedDate.setHours(0,0,0,0); // Ensure it's just the date part
    }

    let p_dueDate = null;
    if (dueDate) {
        try {
            p_dueDate = new Date(dueDate);
            if (isNaN(p_dueDate.getTime())) throw new Error('Invalid Due Date');
        } catch { return res.status(400).json({ error: 'Invalid Due Date format. Use YYYY-MM-DD.' }); }
    }

    let p_reminderTimestamp = null;
    let p_isReminderActive = false;
    if (reminderTime) {
        try {
            p_reminderTimestamp = new Date(reminderTime);
            if (isNaN(p_reminderTimestamp.getTime())) throw new Error('Invalid Reminder Time');
            if (p_reminderTimestamp > new Date()) {
                p_isReminderActive = true;
            } else { console.warn("Reminder time is in the past, not setting as active."); }
        } catch { return res.status(400).json({ error: 'Invalid Reminder Time format. Use datetime-local format.' }); }
    }
    // --- End Date Validation ---
    
    // --- Validate Recurrence ---
    const validRecurrenceTypes = ['none', 'daily', 'weekly', 'monthly', 'yearly'];
    const p_recurrenceType = recurrenceType && validRecurrenceTypes.includes(recurrenceType) ? recurrenceType : 'none';
    let p_recurrenceInterval = 1;
    if (p_recurrenceType !== 'none' && recurrenceInterval) {
         try {
             p_recurrenceInterval = parseInt(recurrenceInterval, 10);
             if (isNaN(p_recurrenceInterval) || p_recurrenceInterval < 1) {
                 console.warn(`Invalid recurrenceInterval '${recurrenceInterval}', defaulting to 1.`);
                 p_recurrenceInterval = 1;
             }
         } catch { p_recurrenceInterval = 1; } 
    } 
    if (p_recurrenceType === 'none') { // Ensure interval is 1 if recurrence is none
        p_recurrenceInterval = 1;
    }
    // --- End Recurrence Validation ---

    try {
        const result = await db.query(
            `INSERT INTO tasks (title, description, reminder_time, is_reminder_active, 
                             assigned_date, due_date, recurrence_type, recurrence_interval)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [
                title.trim(), 
                description ? description.trim() : null, 
                p_reminderTimestamp, 
                p_isReminderActive,
                p_assignedDate.toISOString().split('T')[0], // Send date part only as YYYY-MM-DD
                p_dueDate ? p_dueDate.toISOString().split('T')[0] : null, // Send date part only or null
                p_recurrenceType, 
                p_recurrenceInterval
            ]
        );
        console.log(`Task created successfully with ID: ${result.rows[0].id}`);
        res.status(201).json(result.rows[0]); // Return the newly created task
    } catch (err) {
        // --- Enhanced Logging --- 
        console.error('--- ERROR CREATING TASK ---');
        console.error('Timestamp:', new Date().toISOString());
        console.error('Request Body:', req.body);
        console.error('Parsed Values:', { title: title.trim(), description: description ? description.trim() : null, reminderTimestamp: p_reminderTimestamp, isReminderActive: p_isReminderActive, assignedDate: p_assignedDate.toISOString().split('T')[0], dueDate: p_dueDate ? p_dueDate.toISOString().split('T')[0] : null, recurrenceType: p_recurrenceType, recurrenceInterval: p_recurrenceInterval });
        console.error('Database Error Code:', err.code); // Log Postgres error code if available
        console.error('Database Error Detail:', err.detail); // Log Postgres error detail if available
        console.error('Full Error Stack:', err.stack); 
        console.error('--- END ERROR ---');
        // --- End Enhanced Logging ---
        
        // Send a more informative generic error, but the details are in the log
        res.status(500).json({ error: 'Failed to create task due to server error.' }); 
    }
});

// PUT /api/tasks/:id - Update a task (e.g., toggle completion)
app.put('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { is_complete } = req.body; // Only handling completion toggle for now
    console.log(`Received PUT /api/tasks/${id}: is_complete=${is_complete}`);

    if (typeof is_complete !== 'boolean') {
        return res.status(400).json({ error: 'Invalid value for is_complete, must be boolean.' });
    }

    // Validate ID format (simple integer check)
    if (!/^[1-9]\d*$/.test(id)) {
        return res.status(400).json({ error: 'Invalid task ID format' });
    }

    try {
        const result = await db.query(
            'UPDATE tasks SET is_complete = $1 WHERE id = $2 RETURNING *',
            [is_complete, id]
        );

        if (result.rowCount === 0) {
            console.log(`Update Task: Task ${id} not found.`);
            return res.status(404).json({ error: 'Task not found' });
        }

        console.log(`Task ${id} updated successfully.`);
        res.status(200).json(result.rows[0]); // Return the updated task

    } catch (err) {
        console.error(`Error updating task ${id}:`, err);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// DELETE /api/tasks/:id - Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`Received DELETE /api/tasks/${id}`);

    // Validate ID format
    if (!/^[1-9]\d*$/.test(id)) {
        return res.status(400).json({ error: 'Invalid task ID format' });
    }

    try {
        const result = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [id]);

        if (result.rowCount === 0) {
            console.log(`Delete Task: Task ${id} not found.`);
            return res.status(404).json({ error: 'Task not found' });
        }

        console.log(`Task ${id} deleted successfully.`);
        res.status(200).json({ message: `Task ${id} deleted successfully`, id: parseInt(id) });

    } catch (err) {
        console.error(`Error deleting task ${id}:`, err);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// --- End of Task API Routes ---


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


// --- NEW Cron Job for Task Reminders ---
// Runs every minute to check for due task reminders
cron.schedule('* * * * *', async () => {
    console.log('Cron Job: Checking for due task reminders...');
    try {
        const now = new Date();
        // Find active, non-complete tasks whose reminder time is in the past
        const result = await db.query(
            'SELECT id, title FROM tasks WHERE is_complete = false AND is_reminder_active = true AND reminder_time <= $1',
            [now]
        );

        if (result.rows.length > 0) {
            console.log(`Found ${result.rows.length} tasks due for reminders.`);
            for (const task of result.rows) {
                console.log(` - Sending reminder for Task ID: ${task.id}, Title: ${task.title}`);

                // Prepare notification payload
                const notificationPayload = {
                    title: 'Task Reminder', // Or use task.title?
                    body: task.title, // Use task title as body
                    data: { taskId: task.id, url: '/index.html' } // Add URL to open app
                    // Add icon, badge, vibrate etc. if desired
                };

                // Send push notification to all subscribed clients
                sendNotificationToAll(notificationPayload);

                // Mark the reminder as inactive so it doesn't send again
                await db.query(
                    'UPDATE tasks SET is_reminder_active = false WHERE id = $1',
                    [task.id]
                );
                console.log(`   - Marked reminder as inactive for Task ID: ${task.id}`);

                // Add a small delay between processing tasks if sending many notifications
                // await new Promise(resolve => setTimeout(resolve, 100));
            }
        } else {
             // console.log('Cron Job: No task reminders due.'); // Can comment out for less noise
        }

    } catch (err) {
        console.error('Cron Job Error checking task reminders:', err);
    }
});


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