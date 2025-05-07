/**
 * Clear Service Worker Cache
 * This script helps clear the service worker cache to ensure fresh data
 */

async function clearServiceWorkerCache() {
    if ('serviceWorker' in navigator) {
        try {

            const registrations = await navigator.serviceWorker.getRegistrations();

            for (const registration of registrations) {
                if (registration.active) {
                    console.log('Sending CLEAR_CACHE message to service worker');
                    registration.active.postMessage({ type: 'CLEAR_CACHE' });
                }
            }

            console.log('Cache clearing message sent to all service workers');

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

            if (window.applicationCache) {
                try {
                    window.applicationCache.swapCache();
                    console.log('Application cache swapped');
                } catch (error) {
                    console.error('Error swapping application cache:', error);
                }
            }

            try {

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

function reloadPageAfterDelay(delay = 1000) {
    console.log(`Will reload page in ${delay}ms`);
    setTimeout(() => {
        console.log('Reloading page now...');
        window.location.reload();
    }, delay);
}

function forceDayChange() {

    const now = new Date();
    const centralTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
    centralTime.setDate(centralTime.getDate() - 1);

    const year = centralTime.getFullYear();
    const month = String(centralTime.getMonth() + 1).padStart(2, '0');
    const day = String(centralTime.getDate()).padStart(2, '0');
    const yesterdayString = `${year}-${month}-${day}`;

    localStorage.setItem('lastCounterResetDate', yesterdayString);
    console.log(`Forced day change by setting lastCounterResetDate to ${yesterdayString} (Central Time)`);

    reloadPageAfterDelay(500);

    return `Day change forced. Reset date set to ${yesterdayString} (Central Time). Page will reload.`;
}

function checkDayChangeStatus() {
    const lastCounterResetDate = localStorage.getItem('lastCounterResetDate');

    const now = new Date();
    const centralTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));

    const year = centralTime.getFullYear();
    const month = String(centralTime.getMonth() + 1).padStart(2, '0');
    const day = String(centralTime.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;

    if (!lastCounterResetDate) {
        return 'No last reset date found. Habits will reset on next load.';
    }

    const dayChanged = lastCounterResetDate !== todayString;

    if (dayChanged) {
        return `Day has changed. Last reset: ${lastCounterResetDate}, Today: ${todayString} (Central Time). Habits will reset on next load.`;
    } else {
        return `Same day as last reset. Last reset: ${lastCounterResetDate}, Today: ${todayString} (Central Time). Habits will NOT reset.`;
    }
}

function resetHabitCounters() {
    if (typeof window.resetCounterHabits === 'function') {
        window.resetCounterHabits();
        return 'Resetting habit counters...';
    } else {
        console.error('resetCounterHabits function not found');
        return 'Error: resetCounterHabits function not found. Make sure you are on a page with habits.';
    }
}

window.forceDayChange = forceDayChange;
window.checkDayChangeStatus = checkDayChangeStatus;
window.resetHabitCounters = resetHabitCounters;

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

console.log('Clearing service worker cache immediately');
clearServiceWorkerCache().then(success => {
    if (success) {
        console.log('Cache cleared successfully');
    } else {
        console.warn('Failed to clear cache');
    }
});
