/**
 * Clear Service Worker Cache
 * This script helps clear the service worker cache to ensure fresh data
 */

// Function to clear the service worker cache
async function clearServiceWorkerCache() {
    if ('serviceWorker' in navigator) {
        try {
            // Get all service worker registrations
            const registrations = await navigator.serviceWorker.getRegistrations();

            // Send a message to each service worker to clear its cache
            for (const registration of registrations) {
                if (registration.active) {
                    console.log('Sending CLEAR_CACHE message to service worker');
                    registration.active.postMessage({ type: 'CLEAR_CACHE' });
                }
            }

            console.log('Cache clearing message sent to all service workers');

            // Also clear the browser cache for API requests
            if ('caches' in window) {
                try {
                    const cacheNames = await caches.keys();
                    await Promise.all(
                        cacheNames.map(cacheName => {
                            console.log(`Deleting cache: ${cacheName}`);
                            return caches.delete(cacheName);
                        })
                    );
                    console.log('All caches deleted');
                } catch (error) {
                    console.error('Error deleting caches:', error);
                }
            }

            // Clear application cache
            if (window.applicationCache) {
                try {
                    window.applicationCache.swapCache();
                    console.log('Application cache swapped');
                } catch (error) {
                    console.error('Error swapping application cache:', error);
                }
            }

            // Clear local storage for API-related items
            try {
                // Only clear items related to API responses
                const keysToKeep = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && (key.includes('api') || key.includes('habit') || key.includes('task'))) {
                        localStorage.removeItem(key);
                        console.log(`Removed localStorage item: ${key}`);
                    } else {
                        keysToKeep.push(key);
                    }
                }
                console.log(`Kept localStorage items: ${keysToKeep.join(', ')}`);
            } catch (error) {
                console.error('Error clearing localStorage:', error);
            }

            return true;
        } catch (error) {
            console.error('Error clearing service worker cache:', error);
            return false;
        }
    } else {
        console.log('Service workers not supported');
        return false;
    }
}

// Function to reload the page after a delay
function reloadPageAfterDelay(delay = 1000) {
    console.log(`Will reload page in ${delay}ms`);
    setTimeout(() => {
        console.log('Reloading page now...');
        window.location.reload();
    }, delay);
}

// Clear the cache when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Clearing service worker cache on page load');
    clearServiceWorkerCache().then(success => {
        if (success) {
            console.log('Cache cleared successfully');
        } else {
            console.warn('Failed to clear cache');
        }
    });
});

// Also run outside the DOMContentLoaded event in case it already fired
console.log('Clearing service worker cache immediately');
clearServiceWorkerCache().then(success => {
    if (success) {
        console.log('Cache cleared successfully');
    } else {
        console.warn('Failed to clear cache');
    }
});
