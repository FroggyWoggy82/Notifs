// Service Worker with Background Sync for PWA Notifications
const CACHE_NAME = 'notification-pwa-v10'; // <-- Bumped version number

// Only cache static assets that rarely change
const urlsToCache = [
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  // CSS and JS files will use Network First strategy
  // HTML pages will use Network First strategy
];

// Install service worker and cache assets
self.addEventListener('install', event => {
  console.log(`Service Worker (${CACHE_NAME}) installing`);
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log(`(${CACHE_NAME}) Opened cache`);
        // Add essential assets needed for offline functionality
        return Promise.all(
          urlsToCache.map(url => {
            // Use { cache: 'reload' } to bypass HTTP cache when precaching
            return cache.add(new Request(url, {cache: 'reload'})).catch(error => {
              console.error(`(${CACHE_NAME}) Failed to cache:`, url, error);
            });
          })
        );
      })
      .catch(error => {
         console.error(`(${CACHE_NAME}) Failed to open cache during install:`, error);
      })
  );
});

// Activate and clean up old caches
self.addEventListener('activate', event => {
  console.log(`Service Worker (${CACHE_NAME}) activating`);
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete any cache that isn't the current one
          if (cacheName !== CACHE_NAME) {
            console.log(`(${CACHE_NAME}) Deleting old cache:`, cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Tell the active service worker to take control of the page immediately.
      console.log(`(${CACHE_NAME}) Claiming clients.`);
      return self.clients.claim();
    })
    .catch(error => {
        console.error(`(${CACHE_NAME}) Error during activation/cleanup:`, error);
    })
  );
});

// --- MODIFIED Fetch Handler ---
self.addEventListener('fetch', event => {
  // Ensure the request is potentially cacheable
  if (event.request.method !== 'GET') {
    // Don't intercept non-GET requests for caching purposes
     console.log(`(${CACHE_NAME}) Ignoring non-GET request: ${event.request.method} ${event.request.url}`);
    return; // Let the browser handle it normally
  }

  const requestUrl = new URL(event.request.url);

  // Network Only strategy for /api/days-since endpoints
  if (requestUrl.pathname.startsWith('/api/days-since')) {
    console.log(`(${CACHE_NAME}) Fetching ${requestUrl.pathname} from network (Network Only Strategy).`);
    event.respondWith(
      fetch(event.request)
        .catch(error => {
          console.error(`(${CACHE_NAME}) Network fetch failed for ${requestUrl.pathname}:`, error);
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
    console.log(`(${CACHE_NAME}) Fetching /api/goals from network (Network Only Strategy).`);
    event.respondWith(
      fetch(event.request)
        .catch(error => {
            console.error(`(${CACHE_NAME}) Network fetch failed for /api/goals:`, error);
            // Optional: Return a structured error response if network fails
            return new Response(JSON.stringify({ error: "Failed to fetch goals data. Network error." }), {
                status: 503, // Service Unavailable or appropriate error
                headers: { 'Content-Type': 'application/json' }
            });
        })
    );
  }
  // --- Strategy for other API calls (Notifications): Network First? ---
  // Consider if notification API calls should also be Network First or Network Only
  else if (requestUrl.pathname.startsWith('/api/')) {
       // Example: Network first for other API calls
       console.log(`(${CACHE_NAME}) Fetching ${requestUrl.pathname} (Network First Strategy for API).`);
       event.respondWith(
            fetch(event.request)
                .then(networkResponse => {
                    // Check if we received a valid response from the network
                    if (networkResponse && networkResponse.ok) {
                        console.log(`(${CACHE_NAME}) Network fetch OK for ${requestUrl.pathname}. Caching response.`);
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => { cache.put(event.request, responseToCache); });
                    } else if (networkResponse) {
                         console.log(`(${CACHE_NAME}) Network fetch for ${requestUrl.pathname} got non-OK status: ${networkResponse.status}`);
                    } else {
                        console.log(`(${CACHE_NAME}) Network fetch failed for ${requestUrl.pathname}. No network response.`);
                    }
                    // Return the network response regardless (even if it's an error status)
                    // or fallback to cache below if network totally failed
                    return networkResponse;
                })
                .catch(error => {
                    // Network request itself failed (e.g., offline)
                    console.warn(`(${CACHE_NAME}) Network failed HARD for ${requestUrl.pathname}, trying cache.`, error);
                    return caches.match(event.request).then(cachedResponse => {
                        if (cachedResponse) {
                            console.log(`(${CACHE_NAME}) Serving ${requestUrl.pathname} from cache as network fallback.`);
                            return cachedResponse;
                        }
                        // If not in cache either, the fetch will ultimately fail
                        console.log(`(${CACHE_NAME}) ${requestUrl.pathname} not in cache either.`);
                        // Re-throw the error or return a specific offline response?
                        // For API calls, maybe return an error JSON:
                        return new Response(JSON.stringify({ error: "Offline and not in cache" }), {
                            status: 503, headers: { 'Content-Type': 'application/json' }
                        });
                    });
                })
       );
  }
  // --- Strategy for HTML pages: Network First ---
  else if (requestUrl.pathname.endsWith('.html') || requestUrl.pathname === '/' || requestUrl.pathname.endsWith('/')) {
    console.log(`(${CACHE_NAME}) Handling fetch for HTML: ${requestUrl.pathname} (Network First Strategy).`);
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          // Check if we received a valid response from the network
          if (networkResponse && networkResponse.ok) {
            console.log(`(${CACHE_NAME}) Network fetch OK for HTML: ${requestUrl.pathname}. Caching response.`);
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => { cache.put(event.request, responseToCache); });
            return networkResponse;
          } else {
            console.log(`(${CACHE_NAME}) Network fetch for HTML failed, trying cache: ${requestUrl.pathname}`);
            return caches.match(event.request);
          }
        })
        .catch(error => {
          console.warn(`(${CACHE_NAME}) Network failed for HTML: ${requestUrl.pathname}, trying cache.`, error);
          return caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
              console.log(`(${CACHE_NAME}) Serving HTML from cache as network fallback: ${requestUrl.pathname}`);
              return cachedResponse;
            }
            // If not in cache either, return a simple offline page
            console.log(`(${CACHE_NAME}) HTML not in cache either: ${requestUrl.pathname}`);
            return new Response('You are offline and this page is not available in cache.', {
              status: 503,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
        })
    );
  }
  // --- Strategy for JS and CSS: Network First ---
  else if (requestUrl.pathname.endsWith('.js') || requestUrl.pathname.endsWith('.css')) {
    console.log(`(${CACHE_NAME}) Handling fetch for JS/CSS: ${requestUrl.pathname} (Network First Strategy).`);
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          // Check if we received a valid response from the network
          if (networkResponse && networkResponse.ok) {
            console.log(`(${CACHE_NAME}) Network fetch OK for JS/CSS: ${requestUrl.pathname}. Caching response.`);
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => { cache.put(event.request, responseToCache); });
            return networkResponse;
          } else {
            console.log(`(${CACHE_NAME}) Network fetch for JS/CSS failed, trying cache: ${requestUrl.pathname}`);
            return caches.match(event.request);
          }
        })
        .catch(error => {
          console.warn(`(${CACHE_NAME}) Network failed for JS/CSS: ${requestUrl.pathname}, trying cache.`, error);
          return caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
              console.log(`(${CACHE_NAME}) Serving JS/CSS from cache as network fallback: ${requestUrl.pathname}`);
              return cachedResponse;
            }
            // If not in cache either, return an error
            console.log(`(${CACHE_NAME}) JS/CSS not in cache either: ${requestUrl.pathname}`);
            return new Response('Resource not available offline', {
              status: 503,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
        })
    );
  }
  // --- Strategy for Static Assets: Cache falling back to Network (with cache update) ---
  else {
    // This strategy is good for images and other static assets
    console.log(`(${CACHE_NAME}) Handling fetch for static asset: ${requestUrl.pathname} (Cache/Network Strategy).`);
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            console.log(`(${CACHE_NAME}) Serving ${requestUrl.pathname} from cache.`);
            return response; // Serve from cache if found
          }

          // Not in cache, fetch from network
          console.log(`(${CACHE_NAME}) Fetching ${requestUrl.pathname} from network.`);
          return fetch(event.request).then(networkResponse => {
            // Check if the network response is valid before caching
            // Only cache basic requests (same origin, etc.) and successful responses
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
               if(networkResponse) console.log(`(${CACHE_NAME}) Not caching invalid network response for ${requestUrl.pathname}. Status: ${networkResponse.status}, Type: ${networkResponse.type}`);
               else console.log(`(${CACHE_NAME}) Not caching - Network fetch failed for ${requestUrl.pathname}`);
              return networkResponse;
            }

            // Clone the response to cache it
            const responseToCache = networkResponse.clone();
            console.log(`(${CACHE_NAME}) Caching network response for ${requestUrl.pathname}.`);
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              }).catch(cacheError => {
                 console.error(`(${CACHE_NAME}) Failed to cache response for ${requestUrl.pathname}:`, cacheError);
              });

            return networkResponse; // Return the network response
          });
        }).catch(error => {
          console.error(`(${CACHE_NAME}) Fetch error for ${requestUrl.pathname}:`, error);
          // Optional: Provide a generic offline fallback page here
          // Example: return caches.match('/offline.html');
          // For now, let the error propagate
           return new Response('Network error occurred and resource not found in cache.', {
                status: 404, statusText: 'Resource not available'
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
    console.log(`(${CACHE_NAME}) Checking for scheduled notifications via API`);
    // Ensure this fetch always bypasses caches when run from SW background context
    const response = await fetch('/api/get-scheduled-notifications', {
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error(`(${CACHE_NAME}) Failed to fetch scheduled notifications. Status: ${response.status}`);
      throw new Error('Failed to fetch scheduled notifications');
    }

    const notifications = await response.json();
    console.log(`(${CACHE_NAME}) Retrieved ${notifications.length} scheduled notifications.`);

    // Process any notifications that should be triggered now
    const now = Date.now();
    let notificationsShown = 0;
    for (const notification of notifications) {
      const scheduledTime = new Date(notification.scheduledTime).getTime();
      // Check if notification is due (within a reasonable window, e.g., past minute?)
      if (scheduledTime <= now && scheduledTime > now - (60 * 1000)) { // Example: within the last minute
        console.log(`(${CACHE_NAME}) Showing notification:`, notification.title);
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
          console.log(`(${CACHE_NAME}) Deleting one-time notification from server:`, notification.id);
          // No need to await this, let it run in background
          fetch(`/api/delete-notification/${notification.id}`, {
            method: 'DELETE',
            cache: 'no-store' // Ensure delete is not cached
          }).catch(delErr => console.error(`(${CACHE_NAME}) Failed to delete notification ${notification.id}:`, delErr));
        }
      } else if (scheduledTime < now - (60 * 1000)) {
         // Notification is old, maybe delete if it's one-time?
         if (notification.repeat === 'none' || !notification.repeat) {
             console.log(`(${CACHE_NAME}) Deleting old one-time notification ${notification.id}`);
             fetch(`/api/delete-notification/${notification.id}`, { method: 'DELETE', cache: 'no-store' })
                .catch(delErr => console.error(`(${CACHE_NAME}) Failed to delete old notification ${notification.id}:`, delErr));
         }
      }
    }
     if(notificationsShown === 0) {
         console.log(`(${CACHE_NAME}) No notifications due at this time.`);
     }

    return true;
  } catch (error) {
    console.error(`(${CACHE_NAME}) Error checking scheduled notifications:`, error);
    return false;
  }
}


// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event.notification);
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
          console.log('Found existing window, focusing and navigating.');
          // If found, focus it and navigate it to the target URL
          return matchingClient.focus().then(client => client.navigate(urlToOpen));
      } else {
          console.log('No existing window found, opening new one.');
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
      console.log(`(${CACHE_NAME}) Received SKIP_WAITING message.`);
      self.skipWaiting(); // Force activation
  }
  // Handle cache clearing request
  else if (event.data && event.data.type === 'CLEAR_CACHE') {
      console.log(`(${CACHE_NAME}) Received CLEAR_CACHE message. Clearing all caches.`);
      event.waitUntil(
          caches.keys().then(cacheNames => {
              return Promise.all(
                  cacheNames.map(cacheName => {
                      console.log(`(${CACHE_NAME}) Deleting cache: ${cacheName}`);
                      return caches.delete(cacheName);
                  })
              );
          })
      );
  }
  // Handle specific URL cache clearing
  else if (event.data && event.data.type === 'CLEAR_URL_CACHE' && event.data.url) {
      console.log(`(${CACHE_NAME}) Received CLEAR_URL_CACHE message for: ${event.data.url}`);
      event.waitUntil(
          caches.open(CACHE_NAME).then(cache => {
              return cache.delete(event.data.url).then(success => {
                  console.log(`(${CACHE_NAME}) Cache cleared for ${event.data.url}: ${success ? 'success' : 'not found'}`);
              });
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
  console.log(`(${CACHE_NAME}) Push received:`, event);

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
      console.log(`(${CACHE_NAME}) Push data parsed:`, data);
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
      console.error(`(${CACHE_NAME}) Error parsing push data:`, e);
      // Use default body if parsing fails but data exists
      notificationData.body = event.data.text() || 'Received unparseable push data.';
    }
  } else {
      console.log(`(${CACHE_NAME}) Push received with no data.`);
  }

  console.log(`(${CACHE_NAME}) Showing push notification:`, notificationData);

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