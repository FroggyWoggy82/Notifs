// Service Worker for PWA Notifications
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