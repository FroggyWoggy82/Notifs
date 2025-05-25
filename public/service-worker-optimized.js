// Optimized Service Worker for Fast PWA Startup
const CACHE_NAME = 'notification-pwa-v23-optimized';
const CACHE_VERSION = 23;

// Minimal critical resources for fastest startup
const CRITICAL_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/css/main.css',
  '/js/immediate-notification-fix.js',
  '/js/css-loader.js',
  '/js/resource-preloader.js'
];

// Secondary resources to cache after initial load
const SECONDARY_CACHE = [
  '/js/notification-system.js',
  '/js/modal-system.js',
  '/js/tasks/script.js',
  '/js/common/sidebar.js',
  '/js/dashboard-stats.js'
];

// Cache durations (in milliseconds)
const CACHE_DURATION = {
  CRITICAL: 7 * 24 * 60 * 60 * 1000, // 7 days
  SECONDARY: 24 * 60 * 60 * 1000,    // 1 day
  API: 5 * 60 * 1000                 // 5 minutes for API responses
};

// Install event - cache only critical resources for fast startup
self.addEventListener('install', event => {
  self.skipWaiting(); // Activate immediately
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Cache critical resources only during install for speed
        return cache.addAll(CRITICAL_CACHE);
      })
      .then(() => {
        console.log('Critical resources cached successfully');
        // Cache secondary resources in background
        cacheSecondaryResources();
      })
      .catch(error => {
        console.error('Failed to cache critical resources:', error);
      })
  );
});

// Cache secondary resources in background
function cacheSecondaryResources() {
  caches.open(CACHE_NAME)
    .then(cache => {
      return Promise.allSettled(
        SECONDARY_CACHE.map(url => 
          fetch(url)
            .then(response => response.ok ? cache.put(url, response) : null)
            .catch(error => console.warn(`Failed to cache ${url}:`, error))
        )
      );
    })
    .then(() => console.log('Secondary resources cached'))
    .catch(error => console.error('Error caching secondary resources:', error));
}

// Activate event - clean up old caches quickly
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
      .catch(error => console.error('Activation error:', error))
  );
});

// Optimized fetch handler
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-HTTP(S) requests
  if (!url.protocol.startsWith('http')) return;
  
  // Skip non-GET requests except for critical API calls
  if (request.method !== 'GET' && !url.pathname.startsWith('/api/')) return;
  
  event.respondWith(handleRequest(request, url));
});

// Streamlined request handler
async function handleRequest(request, url) {
  // API requests - network first with short cache
  if (url.pathname.startsWith('/api/')) {
    return handleApiRequest(request);
  }
  
  // Critical resources - cache first
  if (isCriticalResource(url.pathname)) {
    return handleCriticalResource(request);
  }
  
  // Other resources - network first
  return handleNetworkFirst(request);
}

// Handle API requests
async function handleApiRequest(request) {
  try {
    const response = await fetch(request, { cache: 'no-store' });
    return response;
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Network unavailable' }), 
      { 
        status: 503, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Handle critical resources with cache-first strategy
async function handleCriticalResource(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Update cache in background
      updateCacheInBackground(request);
      return cachedResponse;
    }
    
    // Not in cache, fetch from network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return cached version if available, even if stale
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    
    // Return offline fallback for HTML
    if (request.url.includes('index.html') || request.url.endsWith('/')) {
      return createOfflineFallback();
    }
    
    throw error;
  }
}

// Handle other resources with network-first strategy
async function handleNetworkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok && shouldCache(request.url)) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    throw error;
  }
}

// Update cache in background without blocking response
function updateCacheInBackground(request) {
  fetch(request)
    .then(response => {
      if (response.ok) {
        caches.open(CACHE_NAME)
          .then(cache => cache.put(request, response));
      }
    })
    .catch(() => {}); // Silently fail background updates
}

// Check if resource is critical
function isCriticalResource(pathname) {
  return CRITICAL_CACHE.some(url => pathname === url || pathname.endsWith(url));
}

// Check if resource should be cached
function shouldCache(url) {
  return url.includes(self.location.origin) && 
         (url.endsWith('.js') || url.endsWith('.css') || url.endsWith('.html'));
}

// Create offline fallback page
function createOfflineFallback() {
  return new Response(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline - Task Dashboard</title>
      <style>
        body { 
          background: #0a0a0a; 
          color: #E0E0E0; 
          font-family: system-ui; 
          text-align: center; 
          padding: 20px; 
        }
        .container { 
          max-width: 400px; 
          margin: 50px auto; 
          padding: 20px; 
          background: #121212; 
          border-radius: 8px; 
        }
        h1 { color: #00E676; }
        button { 
          background: #00E676; 
          color: #121212; 
          border: none; 
          padding: 10px 20px; 
          border-radius: 4px; 
          cursor: pointer; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>You're Offline</h1>
        <p>Please check your connection and try again.</p>
        <button onclick="location.reload()">Retry</button>
      </div>
    </body>
    </html>
  `, {
    status: 200,
    headers: { 'Content-Type': 'text/html' }
  });
}

// Background sync for notifications (simplified)
self.addEventListener('sync', event => {
  if (event.tag === 'check-notifications') {
    event.waitUntil(checkNotifications());
  }
});

// Simplified notification check
async function checkNotifications() {
  try {
    const response = await fetch('/api/get-scheduled-notifications', { cache: 'no-store' });
    if (!response.ok) return;
    
    const notifications = await response.json();
    const now = Date.now();
    
    for (const notification of notifications) {
      const scheduledTime = new Date(notification.scheduledTime).getTime();
      if (scheduledTime <= now && scheduledTime > now - 60000) {
        await self.registration.showNotification(notification.title, {
          body: notification.body,
          icon: '/icon-192x192.png',
          tag: `scheduled-${notification.id}`,
          data: { notificationId: notification.id }
        });
      }
    }
  } catch (error) {
    console.warn('Notification check failed:', error);
  }
}

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

console.log('Optimized Service Worker loaded');
