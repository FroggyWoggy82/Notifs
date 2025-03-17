// Push notification setup function - IMPROVED VERSION
function setupPushSubscription() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      document.getElementById('status').className = 'status error';
      document.getElementById('status').textContent = 'Push notifications not supported in this browser';
      return Promise.reject(new Error('Push notifications not supported'));
    }
    
    let swRegistration;
    return navigator.serviceWorker.ready
      .then(registration => {
        swRegistration = registration;
        console.log('Service Worker is ready:', registration);
        
        // Check existing subscription
        return registration.pushManager.getSubscription();
      })
      .then(subscription => {
        if (subscription) {
          // We already have a subscription
          console.log('Existing push subscription found');
          return subscription;
        }
        
        // We need to create a new subscription
        console.log('Creating new push subscription...');
        
        // Your VAPID public key
        const vapidPublicKey = 'BM29P5O99J9F-DUOyqNwGyurNl5a3ZSkBa0ZlOLR9AylchmgPwHbCeZaFGlEcKoAUOaZvNk5aXa0dHSDS_RT2v0';
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
        
        // Create new subscription with increased reliability options
        return swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        });
      })
      .then(subscription => {
        // Log the subscription for debugging
        console.log('Push subscription details:', JSON.stringify(subscription));
        
        // Send to server
        return fetch('/api/save-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(subscription)
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to save subscription on server');
          }
          return response.json();
        })
        .then(data => {
          console.log('Subscription saved successfully:', data);
          
          // Update UI
          document.getElementById('status').className = 'status success';
          document.getElementById('status').textContent = 'Push notifications enabled! You will receive notifications even when the app is closed.';
          
          // Make sure to send all scheduled notifications to service worker
          syncScheduledNotificationsWithSW(swRegistration);
          
          return { success: true, subscription };
        });
      })
      .catch(error => {
        console.error('Push subscription setup failed:', error);
        
        document.getElementById('status').className = 'status error';
        document.getElementById('status').textContent = 'Push notification setup failed: ' + error.message;
        
        return { success: false, error };
      });
  }
  
  // Helper function to convert base64 to Uint8Array (VAPID key format)
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
  
  // Sync scheduled notifications with service worker
  function syncScheduledNotificationsWithSW(registration) {
    if (!registration || !registration.active) {
      console.error('No active service worker registration available');
      return;
    }
    
    // Load notifications from localStorage
    const scheduledNotifications = JSON.parse(localStorage.getItem('scheduledNotifications')) || [];
    
    if (scheduledNotifications.length > 0) {
      console.log('Syncing notifications with service worker:', scheduledNotifications.length);
      
      // Send to service worker
      registration.active.postMessage({
        type: 'SETUP_NOTIFICATIONS',
        notifications: scheduledNotifications
      });
    }
  }
  
  // Request notification permission and setup push
  function requestNotificationPermission() {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.error('This browser does not support notifications');
      alert('This browser does not support notifications');
      return Promise.reject(new Error('Notifications not supported'));
    }
    
    console.log('Requesting notification permission...');
    
    // Request permission
    return Notification.requestPermission()
      .then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted');
          
          // Set up push subscription
          return setupPushSubscription();
        } else {
          console.log('Notification permission denied');
          
          document.getElementById('status').className = 'status error';
          document.getElementById('status').textContent = 'Notification permission denied. Please enable notifications in browser settings.';
          
          return { success: false, error: 'Permission denied' };
        }
      });
  }
  
  // Function to test push notifications
  function testPushNotification() {
    fetch('/api/send-test-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(data => {
      console.log('Test notification result:', data);
      
      if (data.success) {
        document.getElementById('status').className = 'status success';
        document.getElementById('status').textContent = 'Test notification sent! You should receive it shortly, even with the app closed.';
      } else {
        document.getElementById('status').className = 'status error';
        document.getElementById('status').textContent = 'Failed to send test notification: ' + (data.message || 'Unknown error');
      }
    })
    .catch(error => {
      console.error('Error sending test notification:', error);
      document.getElementById('status').className = 'status error';
      document.getElementById('status').textContent = 'Error sending test notification: ' + error.message;
    });
  }
  
  // Send notification function (improved for better delivery)
  function sendNotification(title = 'PWA Notification', body = 'This is a notification from your PWA') {
    const statusElement = document.getElementById('status');
    const options = {
      body: body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [100, 50, 100],
      tag: 'notification-' + Date.now(),
      renotify: true,
      requireInteraction: true,
      data: {
        dateOfArrival: Date.now(),
        primaryKey: Date.now()
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
  
  // Add test push notification button
  function addTestPushButton() {
    const container = document.querySelector('.notification-controls');
    if (!container) return;
    
    // Create test button if it doesn't exist
    if (!document.getElementById('testPushBtn')) {
      const testButton = document.createElement('button');
      testButton.id = 'testPushBtn';
      testButton.innerText = 'Test Background Push';
      testButton.style.marginTop = '15px';
      testButton.style.backgroundColor = '#9C27B0';
      
      testButton.addEventListener('click', testPushNotification);
      container.appendChild(testButton);
    }
  }
  
  // Scheduled notifications functionality
  let scheduledNotifications = JSON.parse(localStorage.getItem('scheduledNotifications')) || [];

  // Schedule a notification
  function scheduleNotification(notification) {
    const now = Date.now();
    const delay = notification.time - now;
    
    if (delay <= 0) return;
    
    console.log(`Scheduling notification "${notification.title}" for ${new Date(notification.time).toLocaleString()}`);
    
    // Store in local storage first
    const index = scheduledNotifications.findIndex(n => n.id === notification.id);
    if (index === -1) {
      scheduledNotifications.push(notification);
    } else {
      scheduledNotifications[index] = notification;
    }
    saveScheduledNotifications();
    
    // Set a timeout to trigger the notification
    const timeoutId = setTimeout(() => {
      console.log(`Triggering notification: ${notification.title}`);
      
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
    const storageIndex = scheduledNotifications.findIndex(n => n.id === notification.id);
    if (storageIndex !== -1) {
      scheduledNotifications[storageIndex].timeoutId = timeoutId;
    }
    
    // Also send to service worker for background handling
    navigator.serviceWorker.ready.then(registration => {
      if (registration.active) {
        console.log('Sending notification to service worker for background handling');
        registration.active.postMessage({
          type: 'SETUP_NOTIFICATIONS',
          notifications: scheduledNotifications
        });
      }
    }).catch(err => {
      console.error('Error sending notification to service worker:', err);
    });
    
    // Try server scheduling as well if available
    try {
      fetch('/api/schedule-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          title: notification.title,
          body: notification.body,
          scheduledTime: notification.time,
          repeat: notification.repeat
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log('Notification scheduled on server:', data.id);
          
          // Store server ID
          const index = scheduledNotifications.findIndex(n => n.id === notification.id);
          if (index !== -1) {
            scheduledNotifications[index].serverId = data.id;
            saveScheduledNotifications();
          }
        }
      })
      .catch(error => {
        console.error('Error scheduling on server:', error);
      });
    } catch (e) {
      console.log('Server scheduling not available:', e);
    }
  }

  // Save scheduled notifications to localStorage
  function saveScheduledNotifications() {
    // Make a clean copy without timeout IDs (can't serialize functions)
    const cleanNotifications = scheduledNotifications.map(notification => {
      const { timeoutId, ...cleanNotification } = notification;
      return cleanNotification;
    });
    
    localStorage.setItem('scheduledNotifications', JSON.stringify(cleanNotifications));
    updateScheduledNotificationsUI();
  }

  // Update the UI with scheduled notifications
  function updateScheduledNotificationsUI() {
    const container = document.getElementById('scheduledNotifications');
    if (!container) {
      console.error('Scheduled notifications container not found');
      return;
    }
    
    container.innerHTML = '';
    
    if (scheduledNotifications.length === 0) {
      container.innerHTML = '<p>No scheduled notifications</p>';
      return;
    }
    
    // Sort by time
    const sortedNotifications = [...scheduledNotifications].sort((a, b) => a.time - b.time);
    
    sortedNotifications.forEach((notification, index) => {
      const notificationTime = new Date(notification.time);
      const item = document.createElement('div');
      item.className = 'scheduled-item';
      
      let repeatText = '';
      switch(notification.repeat) {
        case 'daily': repeatText = ' (Repeats Daily)'; break;
        case 'weekly': repeatText = ' (Repeats Weekly)'; break;
        default: repeatText = ' (One-time)';
      }
      
      item.innerHTML = `
        <div>
          <strong>${notification.title}</strong>
          <p>${notification.body}</p>
          <p>${notificationTime.toLocaleString()}${repeatText}</p>
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

  // Remove a scheduled notification
  function removeScheduledNotification(index) {
    if (index < 0 || index >= scheduledNotifications.length) return;
    
    const notification = scheduledNotifications[index];
    
    // Clear the timeout if it exists
    if (notification.timeoutId) {
      clearTimeout(notification.timeoutId);
    }
    
    // Remove from server if it has a server ID
    if (notification.serverId) {
      fetch(`/api/delete-notification/${notification.serverId}`, {
        method: 'DELETE'
      }).catch(err => {
        console.error('Error deleting notification from server:', err);
      });
    }
    
    // Remove from array and save
    scheduledNotifications.splice(index, 1);
    saveScheduledNotifications();
    
    // Update service worker
    navigator.serviceWorker.ready.then(registration => {
      if (registration.active) {
        registration.active.postMessage({
          type: 'SETUP_NOTIFICATIONS',
          notifications: scheduledNotifications
        });
      }
    });
  }

  // Initialize scheduled notifications
  function initScheduledNotifications(registration) {
    // Clear any existing timeouts
    scheduledNotifications.forEach(notification => {
      if (notification.timeoutId) {
        clearTimeout(notification.timeoutId);
      }
    });
    
    // Schedule all notifications
    scheduledNotifications.forEach(notification => {
      scheduleNotification(notification);
    });
    
    // Sync with service worker
    if (registration && registration.active) {
      syncScheduledNotificationsWithSW(registration);
    }
  }
  
  // Initialize everything when the page loads
  window.addEventListener('load', function() {
    // Register service worker first
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(function(registration) {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
          
          // Request notification permission after SW is registered
          if (Notification.permission === 'granted') {
            // Permission already granted, setup subscription
            setupPushSubscription()
              .then(() => {
                // Add test button after successful setup
                addTestPushButton();
              });
          } else if (Notification.permission !== 'denied') {
            // We need to request permission
            const askPermissionBtn = document.getElementById('notifyBtn');
            if (askPermissionBtn) {
              askPermissionBtn.textContent = 'Enable Background Notifications';
              
              // Replace click handler
              askPermissionBtn.addEventListener('click', function() {
                requestNotificationPermission()
                  .then(result => {
                    if (result.success) {
                      addTestPushButton();
                    }
                  });
              });
            }
          }
          
          // Initialize scheduled notifications
          initScheduledNotifications(registration);
        })
        .catch(function(error) {
          console.error('ServiceWorker registration failed: ', error);
          document.getElementById('status').className = 'status error';
          document.getElementById('status').textContent = 'Failed to register service worker: ' + error.message;
        });
    }
  });