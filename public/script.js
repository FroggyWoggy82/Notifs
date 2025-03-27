
// Initialize variables at the top
let scheduledNotifications = [];
let deferredPrompt;

// Wrap all DOM operations in DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize notifications
    initScheduledNotifications();

    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    console.log("Is iOS device:", isIOS);

    // Get DOM elements - add null checks
    const scheduleBtn = document.getElementById('scheduleBtn');
    const installPrompt = document.getElementById('installPrompt');

    if (scheduleBtn) {
        scheduleBtn.addEventListener('click', function() {
            const title = document.getElementById('notificationTitle')?.value || 'Scheduled PWA Notification';
            const body = document.getElementById('notificationMessage')?.value || 'This is your scheduled notification';
            const timeString = document.getElementById('notificationTime')?.value;
            const repeat = document.getElementById('notificationRepeat')?.value;
            const statusElement = document.getElementById('status');

            if (!timeString) {
                if (statusElement) {
                    statusElement.className = 'status error';
                    statusElement.textContent = 'Please select a valid time';
                }
                return;
            }

            const time = new Date(timeString).getTime();
  
            if (time <= Date.now()) {
                if (statusElement) {
                    statusElement.className = 'status error';
                    statusElement.textContent = 'Please select a future time';
                }
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
  
            // Add to the scheduledNotifications array
            scheduledNotifications.push(notification);
  
            // Save and schedule
            saveScheduledNotifications();
            scheduleNotification(notification);
  
            if (statusElement) {
                statusElement.className = 'status success';
                statusElement.textContent = 'Notification scheduled! Check the list below.';
            }
  
            // Reset form
            document.getElementById('notificationTitle').value = 'Scheduled PWA Notification';
            document.getElementById('notificationMessage').value = 'This is your scheduled notification';
            const newDefault = new Date(Date.now() + 60000);
            document.getElementById('notificationTime').value = newDefault.toISOString().slice(0, 16);
        });
    }

    // Set default date time
    const notificationTimeInput = document.getElementById('notificationTime');
    if (notificationTimeInput) {
        const defaultDateTime = new Date(Date.now() + 60000);
        notificationTimeInput.value = defaultDateTime.toISOString().slice(0, 16);
    }

    // Install prompt handlers
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (installPrompt) {
            installPrompt.style.display = 'block';
        }
    });

    document.getElementById('installBtn').addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User ${outcome} the installation`);
            deferredPrompt = null;
            if (installPrompt) {
                installPrompt.style.display = 'none';
            }
        }
    });

    // Update permission status on load
    window.addEventListener('load', function() {
        updatePermissionStatus();
    });
}); // End of DOMContentLoaded

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
  // Initialize scheduled notifications
  function initScheduledNotifications() {
    console.log('Initializing scheduled notifications');
    // Load from localStorage first
    const savedNotifications = localStorage.getItem('scheduledNotifications');
    if (savedNotifications) {
      try {
        scheduledNotifications = JSON.parse(savedNotifications);
        console.log(`Loaded ${scheduledNotifications.length} notifications from localStorage`);
      } catch (error) {
        console.error('Error parsing stored notifications:', error);
        scheduledNotifications = [];
      }
    }

    // Check for expired one-time notifications
    const now = Date.now();
    scheduledNotifications = scheduledNotifications.filter(notification => {
      // Keep all repeating notifications
      if (notification.repeat && notification.repeat !== 'none') {
        return true;
      }
      // For one-time notifications, only keep future ones
      return notification.time > now;
    });

    // Update UI immediately
    updateScheduledNotificationsUI();

    // Schedule all notifications
    for (const notification of scheduledNotifications) {
      scheduleNotification(notification, false); // Don't re-save to avoid loop
    }

    // Send to service worker
    syncWithServiceWorker();
  }

  // Schedule a notification
  function scheduleNotification(notification, shouldSave = true) {
    // Log scheduling
    console.log(`Scheduling notification "${notification.title}" for ${new Date(notification.time).toLocaleString()}`);
    
    // For immediate UI feedback
    if (shouldSave) {
      // Add to array if new
      if (!scheduledNotifications.find(n => n.id === notification.id)) {
        scheduledNotifications.push(notification);
      }
      // Save to localStorage
      saveScheduledNotifications();
    }
    
    // Calculate delay
    const now = Date.now();
    const delay = notification.time - now;
    
    // Skip past notifications
    if (delay <= 0) return;
    
    // Set timeout for browser context
    const timeoutId = setTimeout(() => {
      console.log(`Time to show notification: ${notification.title}`);
      
      // Show the notification
      sendNotification(notification.title, notification.body);
      
      // Handle repeating
      if (notification.repeat === 'daily') {
        // Schedule next day
        const nextTime = notification.time + (24 * 60 * 60 * 1000);
        const updatedNotification = { ...notification, time: nextTime };
        
        // Update in array
        const index = scheduledNotifications.findIndex(n => n.id === notification.id);
        if (index !== -1) {
          scheduledNotifications[index] = updatedNotification;
          saveScheduledNotifications();
          scheduleNotification(updatedNotification, false);
        }
      } else if (notification.repeat === 'weekly') {
        // Schedule next week
        const nextTime = notification.time + (7 * 24 * 60 * 60 * 1000);
        const updatedNotification = { ...notification, time: nextTime };
        
        // Update in array
        const index = scheduledNotifications.findIndex(n => n.id === notification.id);
        if (index !== -1) {
          scheduledNotifications[index] = updatedNotification;
          saveScheduledNotifications();
          scheduleNotification(updatedNotification, false);
        }
      } else {
        // One-time notification - remove it
        const index = scheduledNotifications.findIndex(n => n.id === notification.id);
        if (index !== -1) {
          scheduledNotifications.splice(index, 1);
          saveScheduledNotifications();
        }
      }
    }, delay);
    
    // Store timeout ID for cleanup
    const index = scheduledNotifications.findIndex(n => n.id === notification.id);
    if (index !== -1) {
      // Store as a property
      scheduledNotifications[index]._timeoutId = timeoutId;
    }
    
    // Try to schedule on server
    try {
      fetch('/api/schedule-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
          console.log('Server scheduling successful:', data.id);
          // Store server ID reference
          const index = scheduledNotifications.findIndex(n => n.id === notification.id);
          if (index !== -1) {
            scheduledNotifications[index].serverId = data.id;
            saveScheduledNotifications();
          }
        }
      })
      .catch(error => {
        console.error('Error scheduling with server:', error);
      });
    } catch (e) {
      console.warn('Server scheduling failed:', e);
    }
    
    // Sync with service worker
    syncWithServiceWorker();
  }

  // Save scheduled notifications to localStorage
  function saveScheduledNotifications() {
    try {
      // Create a clean copy without timeout IDs (which can't be serialized)
      const cleanNotifications = scheduledNotifications.map(notification => {
        // Create a new object without the timeout ID
        const { _timeoutId, ...cleanNotification } = notification;
        return cleanNotification;
      });
      
      localStorage.setItem('scheduledNotifications', JSON.stringify(cleanNotifications));
      console.log(`Saved ${cleanNotifications.length} notifications to localStorage`);
      
      // Update UI
      updateScheduledNotificationsUI();
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  // Update UI with scheduled notifications
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
    if (notification._timeoutId) {
      clearTimeout(notification._timeoutId);
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
    syncWithServiceWorker();
  }

  // Sync with service worker
  function syncWithServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    
    navigator.serviceWorker.ready.then(registration => {
      if (registration.active) {
        console.log('Syncing notifications with service worker');
        
        // Create a clean copy for the service worker
        const cleanNotifications = scheduledNotifications.map(notification => {
          const { _timeoutId, ...cleanNotification } = notification;
          return cleanNotification;
        });
        
        registration.active.postMessage({
          type: 'SETUP_NOTIFICATIONS',
          notifications: cleanNotifications
        });
      }
    }).catch(err => {
      console.error('Error syncing with service worker:', err);
    });
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
