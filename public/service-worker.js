// Service Worker with Background Sync for PWA Notifications
const CACHE_NAME = 'notification-pwa-v15'; // <-- Bumped version number to force refresh

// Cache essential static assets
const urlsToCache = [
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/manifest.json'
];

// Cache duration in seconds
const CACHE_DURATION = {
  ICONS: 7 * 24 * 60 * 60, // 7 days for icons
  STATIC: 24 * 60 * 60,    // 1 day for other static assets
  DEFAULT: 60 * 60         // 1 hour default
};

// Install service worker and cache assets
self.addEventListener('install', event => {
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Add essential assets needed for offline functionality
        return Promise.all(
          urlsToCache.map(url => {
            // Use { cache: 'reload' } to bypass HTTP cache when precaching
            return fetch(new Request(url, {cache: 'reload'}))
              .then(response => {
                // Create a new response with cache timestamp header
                const headers = new Headers(response.headers);
                headers.append('sw-cache-timestamp', Date.now().toString());

                // Create a modified response with the timestamp header
                const cachedResponse = new Response(response.body, {
                  status: response.status,
                  statusText: response.statusText,
                  headers: headers
                });

                // Store in cache
                return cache.put(url, cachedResponse);
              })
              .catch(error => {
                console.error(`Failed to cache: ${url}`, error);
              });
          })
        );
      })
      .catch(error => {
         console.error('Failed to open cache during install:', error);
      })
  );
});

// Activate and clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete any cache that isn't the current one
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Force clients to reload to get fresh content
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          // Navigate to the current URL to force a refresh
          client.navigate(client.url);
        });
      });
    }).then(() => {
      // Tell the active service worker to take control of the page immediately.
      return self.clients.claim();
    })
    .catch(error => {
        console.error('Error during activation/cleanup:', error);
    })
  );
});

// --- MODIFIED Fetch Handler ---
self.addEventListener('fetch', event => {
  // Get the request URL
  const requestUrl = new URL(event.request.url);

  // Special handling for API requests (both GET and POST)
  if (requestUrl.pathname.startsWith('/api/')) {
    // Use Network Only strategy for all API requests
    event.respondWith(
      fetch(event.request, {
        // Add cache-busting headers to the request if possible
        // Note: We can't modify headers for cross-origin requests
        cache: 'no-store'
      })
      .then(networkResponse => {
        // Return the network response directly without caching
        return networkResponse;
      })
      .catch(error => {
        // Return a specific offline response for API calls
        return new Response(JSON.stringify({ error: "Offline. Please try again when connected." }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // For non-API requests, only handle GET requests
  if (event.request.method !== 'GET') {
    // Don't intercept non-GET requests for caching purposes
    return; // Let the browser handle it normally
  }

  // Network Only strategy for /api/days-since endpoints
  if (requestUrl.pathname.startsWith('/api/days-since')) {
    event.respondWith(
      fetch(event.request)
        .catch(error => {
          return new Response(JSON.stringify({ error: "Failed to fetch data. Network error." }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
  }
  // Network Only strategy for /api/goals
  else if (requestUrl.pathname === '/api/goals') {
    // Always fetch from the network, do not serve from cache, do not cache the response.
    event.respondWith(
      fetch(event.request)
        .catch(error => {
            // Optional: Return a structured error response if network fails
            return new Response(JSON.stringify({ error: "Failed to fetch goals data. Network error." }), {
                status: 503, // Service Unavailable or appropriate error
                headers: { 'Content-Type': 'application/json' }
            });
        })
    );
  }
  // --- Strategy for other API calls: Network Only ---
  // Never cache API responses to ensure fresh data
  else if (requestUrl.pathname.startsWith('/api/')) {
       event.respondWith(
            fetch(event.request, {
                // Add cache-busting headers to the request
                headers: {
                    ...event.request.headers,
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            })
            .then(networkResponse => {
                // Return the network response directly without caching
                return networkResponse;
            })
            .catch(error => {
                // Network request failed (e.g., offline)
                console.warn(`Network failed for ${requestUrl.pathname}`, error);
                // Return a specific offline response for API calls
                return new Response(JSON.stringify({ error: "Offline. Please try again when connected." }), {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' }
                });
            })
       );
  }
    // --- Strategy for Icons: Cache First with long expiration, then Network ---
  else if (requestUrl.pathname.includes('icon-') && (requestUrl.pathname.endsWith('.png') || requestUrl.pathname.endsWith('.jpg') || requestUrl.pathname.endsWith('.svg'))) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Check if we have a valid cached response
          if (response) {
            // Get the cache timestamp from the response headers
            const cachedTime = response.headers.get('sw-cache-timestamp');
            if (cachedTime) {
              const cacheAge = (Date.now() - parseInt(cachedTime)) / 1000; // Age in seconds

              // If the cache is still valid (less than CACHE_DURATION.ICONS seconds old)
              if (cacheAge < CACHE_DURATION.ICONS) {
                return response; // Serve from cache if valid
              }
            } else {
              // If no timestamp, assume it's still valid (backward compatibility)
              return response;
            }
          }

          // Not in cache or cache expired, fetch from network
          return fetch(event.request).then(networkResponse => {
            // Clone the response to cache it
            const responseToCache = networkResponse.clone();

            // Create a new response with cache timestamp header
            const headers = new Headers(responseToCache.headers);
            headers.append('sw-cache-timestamp', Date.now().toString());

            // Create a modified response with the timestamp header
            const cachedResponse = new Response(responseToCache.body, {
              status: responseToCache.status,
              statusText: responseToCache.statusText,
              headers: headers
            });

            // Store in cache
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, cachedResponse);
              })
              .catch(error => {
                console.error('Failed to cache icon:', error);
              });

            return networkResponse; // Return the original network response
          })
          .catch(error => {
            console.error('Failed to fetch icon:', error);
            // If we have any cached response, return it even if expired
            if (response) {
              return response;
            }
            // Otherwise, let the error propagate
            throw error;
          });
        })
    );
  }
  // --- Strategy for ALL other resources: Network Only ---
  else {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          return networkResponse;
        })
        .catch(error => {
          // Return a simple error message for offline resources
          return new Response('This resource requires an internet connection.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        })
    );
  }
});


// --- Kept all other event listeners (sync, periodicsync, notificationclick, message, push) ---
// --- and Helper Functions (checkScheduledNotifications) ---
// --- AS THEY WERE in your original code. ---

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

// Check for scheduled notifications
async function checkScheduledNotifications() {
  try {
    // Ensure this fetch always bypasses caches when run from SW background context
    const response = await fetch('/api/get-scheduled-notifications', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch scheduled notifications');
    }

    const notifications = await response.json();

    // Process any notifications that should be triggered now
    const now = Date.now();
    let notificationsShown = 0;
    for (const notification of notifications) {
      const scheduledTime = new Date(notification.scheduledTime).getTime();
      // Check if notification is due (within a reasonable window, e.g., past minute?)
      if (scheduledTime <= now && scheduledTime > now - (60 * 1000)) { // Example: within the last minute
        notificationsShown++;

        // Important: Use self.registration.showNotification
        await self.registration.showNotification(notification.title, {
          body: notification.body,
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          vibrate: [100, 50, 100],
          tag: 'scheduled-' + notification.id, // Tag helps replace/update if needed
          renotify: true, // Re-notify if tag is reused
          requireInteraction: false, // Set true if user MUST interact
          data: {
            notificationId: notification.id
            // Add URL to open on click?
            // url: '/pages/goals.html?goalId=' + notification.relatedGoalId // Example
          }
        });

        // For one-time notifications, trigger deletion from server
        if (notification.repeat === 'none' || !notification.repeat) {
          // No need to await this, let it run in background
          fetch(`/api/delete-notification/${notification.id}`, {
            method: 'DELETE',
            cache: 'no-store' // Ensure delete is not cached
          }).catch(() => {});
        }
      } else if (scheduledTime < now - (60 * 1000)) {
         // Notification is old, maybe delete if it's one-time?
         if (notification.repeat === 'none' || !notification.repeat) {
             fetch(`/api/delete-notification/${notification.id}`, { method: 'DELETE', cache: 'no-store' })
                .catch(() => {});
         }
      }
    }
     // No notifications to show at this time

    return true;
  } catch (error) {
    return false;
  }
}


// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close(); // Close the notification

  // Example: Focus or open the relevant page
  // const urlToOpen = event.notification.data?.url || '/'; // Get URL from data if present
  const urlToOpen = '/'; // Always open root for now, or specific page

  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true}).then(windowClients => {
      // Check if there is already a window open for this origin
      let matchingClient = null;
      for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          // Check if URL matches roughly (ignoring hash/search for simplicity here)
          if (new URL(client.url).origin === self.location.origin) {
              matchingClient = client;
              break;
          }
      }

      if (matchingClient) {
          // If found, focus it and navigate it to the target URL
          return matchingClient.focus().then(client => client.navigate(urlToOpen));
      } else {
          // No window open, open a new one
          if (clients.openWindow) {
              return clients.openWindow(urlToOpen);
          }
      }
    })
  );
});


// Store scheduled notifications (Likely REDUNDANT - fetched from API in checkScheduledNotifications)
// self.scheduledNotifications = [];

// Handle messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting(); // Force activation
  }
  // Handle cache clearing request - Always clear all caches
  else if (event.data && (event.data.type === 'CLEAR_CACHE' || event.data.type === 'CLEAR_URL_CACHE')) {
      event.waitUntil(
          caches.keys().then(cacheNames => {
              return Promise.all(
                  cacheNames.map(cacheName => {
                      return caches.delete(cacheName);
                  })
              );
          }).then(() => {
              // After clearing cache, notify the client
              if (event.source) {
                  event.source.postMessage({
                      type: 'CACHE_CLEARED',
                      timestamp: Date.now()
                  });
              }
          })
      );
  }
});


// Set up periodic checks for notifications (Likely REDUNDANT if using periodicSync)
// function setUpPeriodicChecks() {
//   if (self.notificationCheckInterval) { clearInterval(self.notificationCheckInterval); }
//   self.notificationCheckInterval = setInterval(() => { /* ... removed potentially redundant check logic ... */ }, 60000); // Check every minute
// }


// Push event listener
self.addEventListener('push', event => {
  let notificationData = { // Default notification
    title: 'Push Notification',
    body: 'Something happened!',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png'
    // Add other options as needed
  };

  if (event.data) {
    try {
      const data = event.data.json();
      // Merge data from push payload into defaults
      notificationData.title = data.title || notificationData.title;
      notificationData.body = data.body || notificationData.body;
      notificationData.icon = data.icon || notificationData.icon;
      notificationData.badge = data.badge || notificationData.badge;
      // Add tag, renotify, requireInteraction, vibrate, data, actions etc. from payload if desired
      notificationData.tag = data.tag || 'push-' + Date.now();
      notificationData.renotify = data.renotify !== undefined ? data.renotify : true;
      notificationData.requireInteraction = data.requireInteraction || false;
      notificationData.vibrate = data.vibrate || [100, 50, 100];
      notificationData.data = data.data || { dateOfArrival: Date.now() };
      notificationData.actions = data.actions || []; // Example for notification actions

    } catch (e) {
      // Use default body if parsing fails but data exists
      notificationData.body = event.data.text() || 'Received unparseable push data.';
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    vibrate: notificationData.vibrate,
    tag: notificationData.tag,
    renotify: notificationData.renotify,
    requireInteraction: notificationData.requireInteraction,
    data: notificationData.data,
    actions: notificationData.actions
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});