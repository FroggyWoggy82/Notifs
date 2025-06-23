
document.addEventListener('DOMContentLoaded', () => {
    const notifyBtn = document.getElementById('notifyBtn');
    const statusDiv = document.getElementById('status');
    const permissionStatusDiv = document.getElementById('permissionStatus');

    let swRegistration = null;

    // Enhanced iOS Safari support check
    function isNotificationSupported() {
        // Check for basic Notification API
        if (!('Notification' in window)) {
            console.log('Notification API not supported');
            return false;
        }

        // Check for Service Worker support
        if (!('serviceWorker' in navigator)) {
            console.log('Service Worker not supported');
            return false;
        }

        // Check for Push Manager support
        if (!('PushManager' in window)) {
            console.log('Push Manager not supported');
            return false;
        }

        // iOS Safari specific checks
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

        if (isIOS && isSafari) {
            console.log('iOS Safari detected - checking PWA mode');
            // Check if running as PWA (standalone mode)
            const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
            if (!isStandalone) {
                console.log('iOS Safari requires PWA mode for push notifications');
                return 'ios-pwa-required';
            }
        }

        return true;
    }

    // Enhanced initialization with iOS notification fix
    if (window.iOSNotificationFix) {
        const support = window.iOSNotificationFix.getNotificationSupport();
        console.log('Enhanced notification support:', support);

        if (support.supported === true) {
            // Full support available
            initializeNotifications();
        } else if (support.reason === 'ios-pwa-required') {
            // iOS Safari needs PWA mode
            notifyBtn.textContent = 'Add to Home Screen Required';
            notifyBtn.disabled = false; // Allow clicking to show instructions
            permissionStatusDiv.innerHTML = `
                <i class="fas fa-mobile-alt"></i>
                On iOS Safari, please "Add to Home Screen" first, then open the app from your home screen to enable notifications.
            `;
            permissionStatusDiv.className = 'notifications-status permission-denied';
        } else if (support.supported === 'basic') {
            // Basic notifications available
            notifyBtn.textContent = 'Enable Basic Notifications';
            notifyBtn.disabled = false;
            permissionStatusDiv.innerHTML = `
                <i class="fas fa-bell"></i>
                Basic notifications available. Background notifications may not work.
            `;
            permissionStatusDiv.className = 'notifications-status permission-default';
        } else {
            // Not supported
            notifyBtn.textContent = 'Try Basic Notifications';
            notifyBtn.disabled = false; // Still allow trying
            permissionStatusDiv.innerHTML = `
                <i class="fas fa-bell-slash"></i>
                Push messaging not fully supported. You can try basic notifications.
            `;
            permissionStatusDiv.className = 'notifications-status permission-denied';
        }
    } else {
        // Fallback to original logic
        const notificationSupport = isNotificationSupported();

        if (notificationSupport === true) {
            initializeNotifications();
        } else if (notificationSupport === 'ios-pwa-required') {
            notifyBtn.textContent = 'Add to Home Screen Required';
            notifyBtn.disabled = false;
            permissionStatusDiv.innerHTML = `
                <i class="fas fa-mobile-alt"></i>
                On iOS Safari, please "Add to Home Screen" first.
            `;
            permissionStatusDiv.className = 'notifications-status permission-denied';
        } else {
            notifyBtn.textContent = 'Try Notifications';
            notifyBtn.disabled = false;
            permissionStatusDiv.textContent = 'Push messaging may not be fully supported.';
            permissionStatusDiv.className = 'notifications-status permission-denied';
        }
    }

    function initializeNotifications() {
        navigator.serviceWorker.register('/service-worker.js', {
            updateViaCache: 'none',
            scope: '/'
        })
            .then(swReg => {
                console.log('Service Worker registered successfully');
                swRegistration = swReg;

                // Force update to ensure latest version
                swReg.update().catch(err => {
                    console.warn('Service worker update failed:', err);
                });

                checkNotificationPermission(true); // Check permission silently first
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
                updateStatus('Service Worker registration failed: ' + error.message, true);

                // Fallback: try to use basic notifications without service worker
                if ('Notification' in window) {
                    notifyBtn.textContent = 'Enable Basic Notifications';
                    notifyBtn.disabled = false;
                    permissionStatusDiv.textContent = 'Service Worker failed, but basic notifications may work.';
                    permissionStatusDiv.className = 'notifications-status permission-default';
                }
            });

        navigator.serviceWorker.addEventListener('message', event => {
            console.log('Message from service worker:', event.data);
        });

        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('Service worker controller changed');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        });
    }

    notifyBtn.addEventListener('click', async () => {
        console.log('Notification button clicked');

        // Use iOS notification fix if available
        if (window.iOSNotificationFix) {
            const support = window.iOSNotificationFix.getNotificationSupport();
            console.log('Notification support:', support);

            if (support.reason === 'ios-pwa-required') {
                updateStatus('Please add this app to your home screen first, then try again.', true);
                return;
            }

            if (!support.supported && support.supported !== 'basic') {
                updateStatus(support.message, true);
                return;
            }
        }

        if (Notification.permission === 'granted') {
            console.log('Permission already granted, setting up subscription');
            const success = await setupPushSubscription();
            if (success) {
                // Send a test notification after successful subscription
                sendTestNotification();
            }
        } else if (Notification.permission === 'denied') {
            updateStatus('Notification permission was previously denied. Please enable it in browser settings.', true);
        } else {
            console.log('Requesting notification permission');
            const granted = await requestNotificationPermission();
            if (granted) {
                const success = await setupPushSubscription();
                if (success) {
                    sendTestNotification();
                }
            }
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

        console.log('Current notification permission:', permission);

        if (permission === 'granted') {
            permissionStatusDiv.style.display = 'none';
            notifyBtn.textContent = 'Background Reminders Enabled';
            notifyBtn.disabled = true;

            if (!silent) {
                console.log('Permission granted, setting up push subscription');
                setupPushSubscription();
            }
        } else if (permission === 'denied') {
            permissionStatusDiv.style.display = 'block';
            permissionStatusDiv.innerHTML = `
                <i class="fas fa-bell-slash"></i>
                Notification Permission: DENIED
                <br><small>Please enable notifications in your browser settings</small>
            `;
            permissionStatusDiv.classList.add('permission-denied');
            notifyBtn.textContent = 'Enable Background Reminders';
            notifyBtn.disabled = false;
            if (!silent) updateStatus('Enable notifications in browser settings to use reminders.', true);
        } else {
            permissionStatusDiv.style.display = 'block';
            permissionStatusDiv.innerHTML = `
                <i class="fas fa-bell"></i>
                Notification Permission: NOT SET
                <br><small>Click the button below to enable notifications</small>
            `;
            permissionStatusDiv.classList.add('permission-default');
            notifyBtn.textContent = 'Enable Background Reminders';
            notifyBtn.disabled = false;
        }
    }

    async function requestNotificationPermission() {
        try {
            console.log('Requesting notification permission...');

            // Use iOS notification fix if available
            if (window.iOSNotificationFix) {
                const granted = await window.iOSNotificationFix.requestNotificationPermission();
                if (!granted) {
                    checkNotificationPermission(); // Update UI
                    return false;
                }
            } else {
                // Fallback to standard permission request
                const permissionResult = await Notification.requestPermission();
                if (permissionResult !== 'granted') {
                    updateStatus('Permission denied. Reminders will not work in the background.', true);
                    checkNotificationPermission();
                    return false;
                }
            }

            checkNotificationPermission(); // Update UI based on new permission

            if (Notification.permission === 'granted') {
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
            console.error('Error requesting permission:', error);
            updateStatus('Error requesting permission: ' + error.message, true);
            return false;
        }
    }

    async function setupPushSubscription() {
        if (!swRegistration) {
            console.error('Service Worker not ready for push subscription');
            updateStatus('Service Worker not ready. Please reload the page.', true);
            return false;
        }

        try {
            updateStatus('Setting up push notifications...', false);
            console.log('Setting up push subscription...');

            // Check for existing subscription
            let subscription = await swRegistration.pushManager.getSubscription();

            // If there's an existing subscription, unsubscribe first
            // This is necessary when VAPID keys have changed
            if (subscription) {
                console.log('Found existing subscription, updating...');
                updateStatus('Updating subscription with new security keys...', false);
                await subscription.unsubscribe();
                console.log('Unsubscribed from existing push notification subscription');

                // Wait a moment for the unsubscription to process
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Create a new subscription with the current VAPID key
            // Fetch the VAPID public key from the server
            updateStatus('Getting security keys from server...', false);
            console.log('Fetching VAPID public key...');

            const vapidResponse = await fetch('/api/vapid-public-key', {
                cache: 'no-cache',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });

            if (!vapidResponse.ok) {
                throw new Error(`Failed to fetch VAPID key: ${vapidResponse.status}`);
            }

            const vapidData = await vapidResponse.json();
            console.log('VAPID response:', vapidData);

            if (!vapidData.success || !vapidData.publicKey) {
                throw new Error('Invalid VAPID public key response from server');
            }

            const applicationServerKey = urlBase64ToUint8Array(vapidData.publicKey);
            console.log('Creating new push subscription...');

            subscription = await swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey
            });

            console.log('Push subscription created successfully');
            console.log('Subscription endpoint:', subscription.endpoint);

            // Send the new subscription to the server
            const success = await sendSubscriptionToServer(subscription);
            if (success) {
                updateStatus('Successfully subscribed for background reminders!', false);
                notifyBtn.disabled = true;
                notifyBtn.textContent = 'Reminders Enabled';
                console.log('Push subscription setup completed successfully');
            }
            return success;
        } catch (err) {
            console.error('Subscription error:', err);

            if (err.name === 'NotSupportedError') {
                updateStatus('Push notifications not supported on this device/browser.', true);
            } else if (err.name === 'NotAllowedError' || Notification.permission === 'denied') {
                updateStatus('Subscription failed: Permission denied.', true);
            } else if (err.message.includes('VAPID')) {
                updateStatus('Server configuration error. Please try again later.', true);
            } else {
                updateStatus('Failed to subscribe for background reminders: ' + err.message, true);
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

            // Try iOS notification fix first for basic notifications
            if (window.iOSNotificationFix) {
                const success = window.iOSNotificationFix.sendTestNotification();
                if (success) {
                    updateStatus('Test notification sent successfully! (Basic notification)', false);
                    return;
                }
            }

            // Fallback to server-side push notification
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
            updateStatus('Test notification sent successfully! (Push notification)', false);
        } catch (error) {
            console.error('Test notification error:', error);
            updateStatus('Failed to send test notification: ' + error.message, true);

            // Try basic notification as final fallback
            if (window.iOSNotificationFix && Notification.permission === 'granted') {
                try {
                    window.iOSNotificationFix.sendBasicNotification('Fallback Test', {
                        body: 'This is a basic test notification.'
                    });
                    updateStatus('Basic test notification sent as fallback.', false);
                } catch (fallbackError) {
                    console.error('Fallback notification failed:', fallbackError);
                }
            }
        }
    }
});
