
document.addEventListener('DOMContentLoaded', () => {
    const notifyBtn = document.getElementById('notifyBtn');
    const statusDiv = document.getElementById('status');
    const permissionStatusDiv = document.getElementById('permissionStatus');

    let swRegistration = null;

    if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.register('/service-worker.js', { updateViaCache: 'none' })
            .then(swReg => {
                swRegistration = swReg;

                swReg.update().catch(err => {
                    // Service worker update failed
                });

                checkNotificationPermission(true); // Check permission silently first
            })
            .catch(error => {
                updateStatus('Service Worker registration failed', true);
            });

        navigator.serviceWorker.addEventListener('message', event => {
            // Handle messages from service worker
        });

        navigator.serviceWorker.addEventListener('controllerchange', () => {
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        });
    } else {
        notifyBtn.textContent = 'Push Not Supported';
        notifyBtn.disabled = true;
        permissionStatusDiv.textContent = 'Push messaging is not supported by this browser.';
        permissionStatusDiv.className = 'notifications-status permission-denied';
    }

    notifyBtn.addEventListener('click', () => {
        if (Notification.permission === 'granted') {
            setupPushSubscription() // Re-check/setup subscription
                .then(success => {
                    if (success) {
                        // Send a test notification after successful subscription
                        sendTestNotification();
                    }
                });
        } else if (Notification.permission === 'denied') {
            updateStatus('Notification permission was previously denied. Please enable it in browser settings.', true);
        } else {
            requestNotificationPermission();
        }
    });

    // Add a test notification button
    const testNotifyBtn = document.createElement('button');
    testNotifyBtn.textContent = 'Send Test Notification';
    testNotifyBtn.className = 'btn btn--secondary';
    testNotifyBtn.style.marginLeft = '10px';
    testNotifyBtn.addEventListener('click', sendTestNotification);

    // Insert the test button after the main notification button
    if (notifyBtn && notifyBtn.parentNode) {
        notifyBtn.parentNode.insertBefore(testNotifyBtn, notifyBtn.nextSibling);
    }

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

            permissionStatusDiv.style.display = 'none';
            notifyBtn.textContent = 'Background Reminders Enabled';
            notifyBtn.disabled = true;

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
                permissionStatusDiv.style.display = 'none';
                updateStatus('Permission granted! Setting up background sync...', false);
                const success = await setupPushSubscription();

                if (success) {
                    updateStatus('Background reminders enabled!', false);
                    // Send a test notification to confirm everything works
                    setTimeout(() => sendTestNotification(), 1000);
                    return true;
                } else {
                    updateStatus('Permission granted but subscription setup failed.', true);
                    return false;
                }
            } else {
                updateStatus('Permission denied. Reminders will not work in the background.', true);
                return false;
            }
        } catch (error) {
            updateStatus('Error requesting permission.', true);
            return false;
        }
    }

    async function setupPushSubscription() {
        if (!swRegistration) {
            updateStatus('Service Worker not ready.', true);
            return false;
        }

        try {
            // Check for existing subscription
            let subscription = await swRegistration.pushManager.getSubscription();

            // If there's an existing subscription, unsubscribe first
            // This is necessary when VAPID keys have changed
            if (subscription) {
                updateStatus('Updating subscription with new security keys...', false);
                await subscription.unsubscribe();
                console.log('Unsubscribed from existing push notification subscription');
            }

            // Create a new subscription with the current VAPID key
            // Using properly generated VAPID key on the P-256 curve
            const applicationServerKey = urlBase64ToUint8Array('BIErgrKRpDGw2XoFq1vhgowolKyleAgJxC_DcZlyIUASuTUHi0SlWZQ-e2p2ctskva52qii0a36uS5CqTprMxRE'); // Your public VAPID key
            subscription = await swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey
            });

            // Send the new subscription to the server
            const success = await sendSubscriptionToServer(subscription);
            if (success) {
                updateStatus('Successfully subscribed for background reminders!', false);
                notifyBtn.disabled = true;
                notifyBtn.textContent = 'Reminders Enabled';
            }
            return success;
        } catch (err) {
            console.error('Subscription error:', err);
            if (Notification.permission === 'denied') {
                updateStatus('Subscription failed: Permission denied.', true);
            } else {
                updateStatus('Failed to subscribe for background reminders.', true);
            }
            notifyBtn.disabled = false; // Allow retry
            notifyBtn.textContent = 'Enable Background Reminders';
            return false;
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
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            return true;
        } catch (error) {
            updateStatus('Failed to save subscription state.', true);
            return false;
        }
    }

    function updateStatus(message, isError = false) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${isError ? 'error' : 'success'}`;
        statusDiv.style.display = 'block';
        setTimeout(() => { statusDiv.style.display = 'none'; }, 5000);
    }

    async function sendTestNotification() {
        if (Notification.permission !== 'granted') {
            updateStatus('Notification permission not granted. Cannot send test notification.', true);
            return;
        }

        try {
            updateStatus('Sending test notification...', false);

            const response = await fetch('/api/notifications/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const result = await response.json();
            updateStatus('Test notification sent successfully!', false);
        } catch (error) {
            updateStatus('Failed to send test notification: ' + error.message, true);
        }
    }
});
