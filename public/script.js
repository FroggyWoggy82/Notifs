// Push notification setup function
function setupPushSubscription() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      document.getElementById('status').className = 'status error';
      document.getElementById('status').textContent = 'Push notifications not supported';
      return;
    }
  
    let reg;
    navigator.serviceWorker.ready
      .then(swreg => {
        reg = swreg;
        return swreg.pushManager.getSubscription();
      })
      .then(subscription => {
        if (subscription === null) {
          // Create a new subscription
          const vapidPublicKey = 'BM29P5O99J9F-DUOyqNwGyurNl5a3ZSkBa0ZlOLR9AylchmgPwHbCeZaFGlEcKoAUOaZvNk5aXa0dHSDS_RT2v0';
          const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
          
          return reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey
          });
        } else {
          // We already have a subscription
          return subscription;
        }
      })
      .then(newSubscription => {
        // Send the subscription to your server
        // Use relative URL instead of absolute for local development
        return fetch('/api/save-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(newSubscription)
        });
      })
      .then(response => {
        if (response.ok) {
          document.getElementById('status').className = 'status success';
          document.getElementById('status').textContent = 'Push notification setup complete!';
          enableSchedulingUI();
        } else {
          throw new Error('Server response not OK');
        }
      })
      .catch(err => {
        console.error('Failed to subscribe for push', err);
        document.getElementById('status').className = 'status error';
        document.getElementById('status').textContent = 'Push notification setup failed: ' + err.message;
      });
  }
  
  // Helper function to convert base64 to Uint8Array
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
  
  // Enable scheduling UI after successful push subscription
  function enableSchedulingUI() {
    const controls = document.querySelector('.notification-controls');
    if (controls) {
      controls.style.opacity = '1';
      controls.style.pointerEvents = 'auto';
    }
  }
  
  // Background sync registration
  async function registerBackgroundSync() {
    if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
      console.warn('Background sync not supported');
      return false;
    }
    
    try {
      const registration = await navigator.serviceWorker.ready;
      // Register one-time background sync
      await registration.sync.register('check-scheduled-notifications');
      console.log('Background sync registered');
      
      // Register periodic background sync if supported
      if ('periodicSync' in registration) {
        try {
          // Check permission
          const status = await navigator.permissions.query({
            name: 'periodic-background-sync',
          });
          
          if (status.state === 'granted') {
            // Register periodic sync - check every 15 minutes minimum
            await registration.periodicSync.register('periodic-notification-check', {
              minInterval: 15 * 60 * 1000, // 15 minutes in milliseconds
            });
            console.log('Periodic background sync registered');
            return true;
          }
        } catch (err) {
          console.error('Periodic background sync error:', err);
        }
      }
      return true;
    } catch (err) {
      console.error('Background sync registration failed:', err);
      return false;
    }
  }
  
  // Scheduled notifications functionality
  let scheduledNotifications = JSON.parse(localStorage.getItem('scheduledNotifications')) || [];
  
  // Update the UI with scheduled notifications
  function updateScheduledNotificationsUI() {
    const container = document.getElementById('scheduledNotifications');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (scheduledNotifications.length === 0) {
      container.innerHTML = '<p>No scheduled notifications</p>';
      return;
    }
    
    scheduledNotifications.forEach((notification, index) => {
      const notificationTime = new Date(notification.time);
      const item = document.createElement('div');
      item.className = 'scheduled-item';
      
      let repeatText = '';
      switch(notification.repeat) {
        case 'daily': repeatText = ' (Repeats Daily)'; break;
        case 'weekly': repeatText = ' (Repeats Weekly)'; break;
        default: repeatText = ' (One-time)';
      }
      
      const timeString = notificationTime > new Date() ? 
        notificationTime.toLocaleString() : 
        'Invalid Date (One-time)';
      
      item.innerHTML = `
        <div>
          <strong>${notification.title}</strong>
          <p>${notification.body}</p>
          <p>${timeString}${repeatText}</p>
        </div>
        <button class="delete-btn" data-index="${index}">Delete</button>
      `;
      container.appendChild(item);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        removeScheduledNotification(index);
      });
    });
  }
  
  // Send notification function
  function sendNotification(title = 'PWA Notification', body = 'This is a notification from your PWA') {
    const statusElement = document.getElementById('status');
    const options = {
      body: body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    };
  
    // Check if service worker is active
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(function(registration) {
        registration.showNotification(title, options)
          .then(() => {
            statusElement.className = 'status success';
            statusElement.textContent = 'Notification sent successfully!';
          })
          .catch(error => {
            console.error('Error showing notification:', error);
            statusElement.className = 'status error';
            statusElement.textContent = 'Error sending notification: ' + error.message;
          });
      });
    } else {
      // Fallback to regular notification
      try {
        new Notification(title, options);
        statusElement.className = 'status success';
        statusElement.textContent = 'Notification sent successfully!';
      } catch (error) {
        console.error('Error sending notification:', error);
        statusElement.className = 'status error';
        statusElement.textContent = 'Error sending notification: ' + error.message;
      }
    }
  }
  
  // Schedule a notification using setTimeout
  function scheduleNotification(notification) {
    const now = Date.now();
    const delay = notification.time - now;
    
    if (delay <= 0) return;
    
    // Set a timeout to trigger the notification
    const timeoutId = setTimeout(() => {
      // Send the notification
      sendNotification(notification.title, notification.body);
      
      // Handle repeating notifications
      if (notification.repeat !== 'none') {
        let nextTime;
        
        if (notification.repeat === 'daily') {
          // 24 hours in milliseconds
          nextTime = notification.time + (24 * 60 * 60 * 1000);
        } else if (notification.repeat === 'weekly') {
          // 7 days in milliseconds
          nextTime = notification.time + (7 * 24 * 60 * 60 * 1000);
        }
        
        // Update the notification time and reschedule
        const index = scheduledNotifications.findIndex(n => n.id === notification.id);
        if (index !== -1) {
          scheduledNotifications[index].time = nextTime;
          saveScheduledNotifications();
          scheduleNotification(scheduledNotifications[index]);
        }
      } else {
        // Remove one-time notifications after they're sent
        const index = scheduledNotifications.findIndex(n => n.id === notification.id);
        if (index !== -1) {
          scheduledNotifications.splice(index, 1);
          saveScheduledNotifications();
        }
      }
    }, delay);
    
    // Store the timeout ID to allow for cancellation
    const index = scheduledNotifications.findIndex(n => n.id === notification.id);
    if (index !== -1) {
      scheduledNotifications[index].timeoutId = timeoutId;
    }
  }
  
  // Save scheduled notifications to localStorage
  function saveScheduledNotifications() {
    localStorage.setItem('scheduledNotifications', JSON.stringify(scheduledNotifications));
    updateScheduledNotificationsUI();
  }
  
  // Initialize the scheduled notifications
  function initScheduledNotifications() {
    // Check all scheduled notifications and set timeouts
    scheduledNotifications.forEach(notification => {
      scheduleNotification(notification);
    });
    
    // Update the UI
    updateScheduledNotificationsUI();
  }
  
  // Remove a scheduled notification
  function removeScheduledNotification(index) {
    const notification = scheduledNotifications[index];
    // Cancel any pending timeouts for this notification
    if (notification.timeoutId) {
      clearTimeout(notification.timeoutId);
    }
    
    // If we have a server ID, also try to delete from the server
    if (notification.serverId) {
      fetch(`/api/delete-notification/${notification.serverId}`, {
        method: 'DELETE'
      })
      .then(response => response.json())
      .then(data => {
        console.log('Server notification deleted:', data);
      })
      .catch(error => {
        console.error('Error removing notification from server:', error);
      });
    }
    
    scheduledNotifications.splice(index, 1);
    saveScheduledNotifications();
    
    document.getElementById('status').className = 'status success';
    document.getElementById('status').textContent = 'Scheduled notification removed';
  }
  
  // Initialize service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/service-worker.js')
        .then(function(registration) {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
          // Only proceed with notification permission after SW registration
          if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                setupPushSubscription();
              }
            });
          }
          // Register background sync
          registerBackgroundSync();
        })
        .catch(function(error) {
          console.error('ServiceWorker registration failed: ', error);
          document.getElementById('status').className = 'status error';
          document.getElementById('status').textContent = 'ServiceWorker registration failed: ' + error.message;
        });
        
      // Initialize notification buttons
      const notifyBtn = document.getElementById('notifyBtn');
      if (notifyBtn) {
        notifyBtn.addEventListener('click', function() {
          if (Notification.permission === 'granted') {
            sendNotification();
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(function(permission) {
              if (permission === 'granted') {
                sendNotification();
              }
            });
          }
        });
      }
      
      // Initialize schedule button
      const scheduleBtn = document.getElementById('scheduleBtn');
      if (scheduleBtn) {
        scheduleBtn.addEventListener('click', function() {
          const title = document.getElementById('notificationTitle').value || 'Scheduled PWA Notification';
          const body = document.getElementById('notificationMessage').value || 'This is your scheduled notification';
          const timeString = document.getElementById('notificationTime').value;
          const repeat = document.getElementById('notificationRepeat').value;
          
          if (!timeString) {
            document.getElementById('status').className = 'status error';
            document.getElementById('status').textContent = 'Please select a valid time';
            return;
          }
          
          const time = new Date(timeString).getTime();
          
          if (time <= Date.now()) {
            document.getElementById('status').className = 'status error';
            document.getElementById('status').textContent = 'Please select a future time';
            return;
          }
          
          // Add notification to schedule
          const notification = {
            id: Date.now().toString(),  // Unique ID
            title: title,
            body: body,
            time: time,
            repeat: repeat
          };
          
          scheduledNotifications.push(notification);
          saveScheduledNotifications();
          
          // Schedule the notification
          scheduleNotification(notification);
          
          document.getElementById('status').className = 'status success';
          document.getElementById('status').textContent = 'Notification scheduled!';
          
          // Reset form
          document.getElementById('notificationTitle').value = 'Scheduled PWA Notification';
          document.getElementById('notificationMessage').value = 'This is your scheduled notification';
          const newDefault = new Date(Date.now() + 60000);
          document.getElementById('notificationTime').value = newDefault.toISOString().slice(0, 16);
        });
      }
      
      // Initialize scheduled notifications
      initScheduledNotifications();
    });
  }