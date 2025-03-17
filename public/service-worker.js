// Service Worker with Background Sync for PWA Notifications
const CACHE_NAME = 'notification-pwa-v7';
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
  // Skip waiting to ensure the new service worker activates immediately
  self.skipWaiting();
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
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch from cache first, then network
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
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

// Handle background sync for scheduled notifications
self.addEventListener('sync', event => {
  console.log('Background sync event:', event);
  
  if (event.tag === 'check-scheduled-notifications') {
    event.waitUntil(checkScheduledNotifications());
  }
});

// Handle periodic background sync for recurring checks
self.addEventListener('periodicsync', event => {
  console.log('Periodic background sync event:', event);
  
  if (event.tag === 'periodic-notification-check') {
    event.waitUntil(checkScheduledNotifications());
  }
});

// Function to check if any notifications should be shown
async function checkScheduledNotifications() {
  console.log('Checking for scheduled notifications...');
  
  try {
    // First try to get from the server
    const response = await fetch('/api/get-scheduled-notifications', {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const notifications = await response.json();
      console.log('Fetched notifications from server:', notifications);
      processScheduledNotifications(notifications);
    } else {
      console.warn('Failed to fetch from server, using IndexedDB');
      // Fall back to local IndexedDB
      const db = await openNotificationsDB();
      const notifications = await getNotificationsFromDB(db);
      processScheduledNotifications(notifications);
    }
  } catch (error) {
    console.error('Error checking scheduled notifications:', error);
    // Fall back to local IndexedDB
    try {
      const db = await openNotificationsDB();
      const notifications = await getNotificationsFromDB(db);
      processScheduledNotifications(notifications);
    } catch (dbError) {
      console.error('Error accessing local notification storage:', dbError);
    }
  }
}

// Process scheduled notifications
function processScheduledNotifications(notifications) {
  const now = Date.now();
  
  notifications.forEach(notification => {
    // Check if notification should be triggered now
    if (notification.scheduledTime <= now && !notification.triggered) {
      // Display the notification
      self.registration.showNotification(notification.title, {
        body: notification.body,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        data: {
          notificationId: notification.id,
          dateOfArrival: now
        }
      });
      
      // Mark as triggered for one-time notifications
      if (notification.repeat === 'none') {
        markNotificationAsTriggered(notification.id);
      } else {
        // Update the next trigger time for recurring notifications
        const nextTriggerTime = calculateNextTriggerTime(
          notification.scheduledTime,
          notification.repeat
        );
        updateNotificationSchedule(notification.id, nextTriggerTime);
      }
    }
  });
}

// Calculate next trigger time based on repeat pattern
function calculateNextTriggerTime(lastTriggerTime, repeatPattern) {
  const lastDate = new Date(lastTriggerTime);
  let nextDate;
  
  switch (repeatPattern) {
    case 'daily':
      nextDate = new Date(lastDate);
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate = new Date(lastDate);
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    default:
      return null;
  }
  
  return nextDate.getTime();
}

// IndexedDB functions for local storage
function openNotificationsDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('NotificationsDB', 1);
    
    request.onerror = event => {
      reject('Error opening IndexedDB');
    };
    
    request.onsuccess = event => {
      resolve(event.target.result);
    };
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      const objectStore = db.createObjectStore('notifications', { keyPath: 'id' });
      objectStore.createIndex('scheduledTime', 'scheduledTime', { unique: false });
      objectStore.createIndex('triggered', 'triggered', { unique: false });
    };
  });
}

function getNotificationsFromDB(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['notifications'], 'readonly');
    const objectStore = transaction.objectStore('notifications');
    const request = objectStore.getAll();
    
    request.onerror = event => {
      reject('Error fetching notifications from IndexedDB');
    };
    
    request.onsuccess = event => {
      resolve(event.target.result);
    };
  });
}

function markNotificationAsTriggered(notificationId) {
  fetch(`/api/mark-triggered/${notificationId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }).catch(error => {
    console.error('Error marking notification as triggered on server:', error);
    // Also update local IndexedDB
    updateNotificationInDB(notificationId, { triggered: true });
  });
}

function updateNotificationSchedule(notificationId, nextTriggerTime) {
  fetch(`/api/update-schedule/${notificationId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ scheduledTime: nextTriggerTime })
  }).catch(error => {
    console.error('Error updating notification schedule on server:', error);
    // Also update local IndexedDB
    updateNotificationInDB(notificationId, { scheduledTime: nextTriggerTime });
  });
}

function updateNotificationInDB(notificationId, updateData) {
  openNotificationsDB().then(db => {
    const transaction = db.transaction(['notifications'], 'readwrite');
    const objectStore = transaction.objectStore('notifications');
    const request = objectStore.get(notificationId);
    
    request.onsuccess = event => {
      const notification = event.target.result;
      if (notification) {
        const updatedNotification = { ...notification, ...updateData };
        objectStore.put(updatedNotification);
      }
    };
  }).catch(error => {
    console.error('Error updating notification in IndexedDB:', error);
  });
}

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