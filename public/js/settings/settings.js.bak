// Settings functionality
document.addEventListener('DOMContentLoaded', () => {
    const notifyBtn = document.getElementById('notifyBtn');
    const statusDiv = document.getElementById('status');
    const permissionStatusDiv = document.getElementById('permissionStatus');
    
    let swRegistration = null;
    
    // --- PWA & Notification Permission Handling ---
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        console.log('Service Worker and Push is supported');

        // Register service worker with updateViaCache: 'none' to always check for updates
        navigator.serviceWorker.register('/service-worker.js', { updateViaCache: 'none' })
            .then(swReg => {
                console.log('Service Worker is registered', swReg);
                swRegistration = swReg;

                // Force update check on every page load
                swReg.update().then(() => {
                    console.log('Service worker update check completed');
                }).catch(err => {
                    console.error('Service worker update check failed:', err);
                });

                // Setup push subscription if permission is already granted
                checkNotificationPermission(true); // Check permission silently first
            })
            .catch(error => {
                console.error('Service Worker Error', error);
                updateStatus('Service Worker registration failed', true);
            });

        // Listen for messages from the service worker
        navigator.serviceWorker.addEventListener('message', event => {
            console.log('Received message from service worker:', event.data);
            if (event.data && event.data.type === 'CACHE_CLEARED') {
                const timestamp = new Date(event.data.timestamp);
                console.log(`Cache cleared at: ${timestamp.toLocaleTimeString()}`);
            }
        });

        // Listen for controller change (new SW taking over)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('New service worker activated and controlling the page');
            // Reload page for new SW after a short delay
            setTimeout(() => {
                console.log('Reloading page to use new service worker');
                window.location.reload();
            }, 1000);
        });
    } else {
        console.warn('Push messaging is not supported');
        notifyBtn.textContent = 'Push Not Supported';
        notifyBtn.disabled = true;
        permissionStatusDiv.textContent = 'Push messaging is not supported by this browser.';
        permissionStatusDiv.className = 'notifications-status permission-denied';
    }

    notifyBtn.addEventListener('click', () => {
        if (Notification.permission === 'granted') {
            console.log('Permission already granted, checking subscription...');
            setupPushSubscription(); // Re-check/setup subscription
        } else if (Notification.permission === 'denied') {
            updateStatus('Notification permission was previously denied. Please enable it in browser settings.', true);
        } else {
            requestNotificationPermission();
        }
    });

    function checkNotificationPermission(silent = false) {
        if (!('Notification' in window)) {
            permissionStatusDiv.style.display = 'block';
            permissionStatusDiv.textContent = 'Notifications not supported.';
            permissionStatusDiv.className = 'notifications-status permission-denied';
            notifyBtn.disabled = true;
            return;
        }

        const permission = Notification.permission;
        permissionStatusDiv.classList.remove('permission-granted', 'permission-denied', 'permission-default');

        if (permission === 'granted') {
            // Hide the permission status text when granted
            permissionStatusDiv.style.display = 'none';
            notifyBtn.textContent = 'Background Reminders Enabled';
            notifyBtn.disabled = true;
            // If granted, ensure subscription is set up
            if (!silent) setupPushSubscription();
        } else if (permission === 'denied') {
            permissionStatusDiv.style.display = 'block';
            permissionStatusDiv.textContent = 'Notification Permission: DENIED';
            permissionStatusDiv.classList.add('permission-denied');
            notifyBtn.textContent = 'Enable Background Reminders';
            notifyBtn.disabled = false;
            if (!silent) updateStatus('Enable notifications in browser settings to use reminders.', true);
        } else {
            permissionStatusDiv.style.display = 'block';
            permissionStatusDiv.textContent = 'Notification Permission: NOT SET';
            permissionStatusDiv.classList.add('permission-default');
            notifyBtn.textContent = 'Enable Background Reminders';
            notifyBtn.disabled = false;
        }
    }

    async function requestNotificationPermission() {
        try {
            const permissionResult = await Notification.requestPermission();
            checkNotificationPermission(); // Update UI based on new permission
            if (permissionResult === 'granted') {
                console.log('Notification permission granted.');
                // Hide permission status when granted
                permissionStatusDiv.style.display = 'none';
                updateStatus('Permission granted! Setting up background sync...', false);
                await setupPushSubscription();
                updateStatus('Background reminders enabled!', false);
            } else {
                console.log('Notification permission denied.');
                updateStatus('Permission denied. Reminders will not work in the background.', true);
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            updateStatus('Error requesting permission.', true);
        }
    }

    async function setupPushSubscription() {
        if (!swRegistration) {
            console.error('Service worker registration not found.');
            updateStatus('Service Worker not ready.', true);
            return;
        }

        try {
            let subscription = await swRegistration.pushManager.getSubscription();
            if (subscription) {
                console.log('User IS already subscribed.');
                // Optional: Update server with latest subscription info? Might be redundant.
                // sendSubscriptionToServer(subscription);
                updateStatus('Already subscribed for background reminders.', false);
                notifyBtn.disabled = true;
                notifyBtn.textContent = 'Reminders Enabled';
            } else {
                console.log('User is NOT subscribed. Subscribing...');
                const applicationServerKey = urlBase64ToUint8Array('BM29P5O99J9F-DUOyqNwGyurNl5a3ZSkBa0ZlOLR9AylchmgPwHbCeZaFGlEcKoAUOaZvNk5aXa0dHSDS_RT2v0'); // Your public VAPID key
                subscription = await swRegistration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: applicationServerKey
                });
                console.log('User subscribed:', subscription);
                await sendSubscriptionToServer(subscription);
                updateStatus('Successfully subscribed for background reminders!', false);
                notifyBtn.disabled = true;
                notifyBtn.textContent = 'Reminders Enabled';
            }
        } catch (err) {
            console.error('Failed to subscribe the user: ', err);
            if (Notification.permission === 'denied') {
                updateStatus('Subscription failed: Permission denied.', true);
            } else {
                updateStatus('Failed to subscribe for background reminders.', true);
            }
            notifyBtn.disabled = false; // Allow retry
            notifyBtn.textContent = 'Enable Background Reminders';
        }
    }

    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) { outputArray[i] = rawData.charCodeAt(i); }
        return outputArray;
    }

    async function sendSubscriptionToServer(subscription) {
        try {
            const response = await fetch('/api/save-subscription', {
                method: 'POST',
                body: JSON.stringify(subscription),
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) { throw new Error(`Server error: ${response.status}`); }
            const data = await response.json();
            console.log('Subscription save response:', data);
        } catch (error) {
            console.error('Error sending subscription to server:', error);
            updateStatus('Failed to save subscription state.', true);
        }
    }

    // --- General Status Update Function ---
    function updateStatus(message, isError = false) {
        console.log(`Status Update: ${message} (Error: ${isError})`);
        statusDiv.textContent = message;
        statusDiv.className = `status ${isError ? 'error' : 'success'}`;
        statusDiv.style.display = 'block';
        setTimeout(() => { statusDiv.style.display = 'none'; }, 5000);
    }
});
