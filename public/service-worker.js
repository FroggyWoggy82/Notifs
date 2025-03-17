// Service Worker with Background Sync for PWA Notifications
const CACHE_NAME = 'notification-pwa-v6';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Install service worker and cache assets
self.addEventListener('install', event => {
  console.log('Service Worker installing');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url).catch(error => {
              console.error('Failed to cache:', url, error);
            });
          })
        );
      })
  );
});

// Activate and clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch from cache first, then network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type === 'opaque') {
            return response;
          }

          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      }).catch(error => {
        console.error('Fetch error:', error);
      })
  );
});

// Handle push notifications from server
self.addEventListener('push', event => {
  console.log('Push received:', event);
  
  let notificationData = {
    title: 'New Notification',
    body: 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: {
      dateOfArrival: Date.now()
    }
  };
  
  // Parse data if available
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        data: {
          dateOfArrival: Date.now(),
          ...data.data
        }
      };
    } catch (e) {
      console.error('Error parsing push data:', e);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Handle background sync
self.addEventListener('sync', event => {
  console.log('Background sync event received:', event.tag);
  if (event.tag === 'check-scheduled-notifications') {
    event.waitUntil(checkScheduledNotifications());
  }
});

// Handle periodic sync
self.addEventListener('periodicsync', event => {
  console.log('Periodic sync event received:', event.tag);
  if (event.tag === 'periodic-notification-check') {
    event.waitUntil(checkScheduledNotifications());
  }
});

// Function to check for scheduled notifications
async function checkScheduledNotifications() {
  try {
    console.log('Checking for scheduled notifications');
    const response = await fetch('/api/get-scheduled-notifications');
    if (!response.ok) {
      throw new Error('Failed to fetch scheduled notifications');
    }
    
    const notifications = await response.json();
    console.log('Retrieved scheduled notifications:', notifications);
    
    // Process any notifications that should be triggered now
    const now = Date.now();
    for (const notification of notifications) {
      // Check if notification is due to be shown
      if (notification.scheduledTime <= now) {
        console.log('Showing notification:', notification.title);
        
        await self.registration.showNotification(notification.title, {
          body: notification.body,
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          data: {
            notificationId: notification.id
          }
        });
        
        // For one-time notifications, delete from server
        if (notification.repeat === 'none') {
          console.log('Deleting one-time notification:', notification.id);
          await fetch(`/api/delete-notification/${notification.id}`, {
            method: 'DELETE'
          });
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error checking scheduled notifications:', error);
    return false;
  }
}

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event.notification);
  event.notification.close();
  
  // Check if we have a notificationId in the data
  const notificationId = event.notification.data?.notificationId;
  
  event.waitUntil(
    clients.matchAll({type: 'window'}).then(windowClients => {
      // Check if there is already a window open
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if ('focus' in client) {
          client.focus();
          // If we have a notificationId, we could communicate it to the client
          if (notificationId) {
            client.postMessage({
              type: 'NOTIFICATION_CLICKED',
              notificationId: notificationId
            });
          }
          return;
        }
      }
      
      // No window open, open a new one
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Add support for iOS background notifications
self.scheduledNotifications = [];

// Handle messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SETUP_IOS_NOTIFICATIONS') {
    console.log('Service worker received iOS notifications setup', event.data.notifications);
    
    // Store the notifications in the service worker
    self.scheduledNotifications = event.data.notifications;
    
    // Set up periodic checks
    setUpPeriodicChecks();
  }
});

// Set up periodic checks for notifications
function setUpPeriodicChecks() {
  // Clear any existing interval
  if (self.notificationCheckInterval) {
    clearInterval(self.notificationCheckInterval);
  }
  
  // Use setInterval in the service worker to check for notifications
  const checkInterval = setInterval(() => {
    const now = Date.now();
    console.log('Service worker checking notifications at:', new Date(now).toLocaleString());
    
    if (self.scheduledNotifications && self.scheduledNotifications.length > 0) {
      console.log('Current notifications in SW:', self.scheduledNotifications.length);
      
      self.scheduledNotifications.forEach(notification => {
        // If it's time to show the notification (within 2 minutes to account for wake-up delays)
        if (notification.time <= now && notification.time > now - 120000) {
          console.log('Service worker triggering notification:', notification.title);
          
          // Show the notification
          self.registration.showNotification(notification.title, {
            body: notification.body,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            tag: notification.id, // Use tag to prevent duplicate notifications
            data: {
              notificationId: notification.id,
              timestamp: now
            }
          });
          
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
            
            // Update the notification time
            notification.time = nextTime;
          } else {
            // Remove one-time notifications after they're sent
            self.scheduledNotifications = self.scheduledNotifications.filter(n => 
              n.id !== notification.id
            );
          }
        }
      });
    }
  }, 15000); // Check every 15 seconds for more reliability
  
  // Store the interval ID to be able to clear it later if needed
  self.notificationCheckInterval = checkInterval;
}

// When the service worker activates, set up the periodic checks
self.addEventListener('activate', (event) => {
  console.log('Service worker activated');
  
  // Ensure the service worker takes control immediately
  event.waitUntil(self.clients.claim());
  
  // Set up periodic checks if there are any notifications
  if (self.scheduledNotifications && self.scheduledNotifications.length > 0) {
    setUpPeriodicChecks();
  }
});