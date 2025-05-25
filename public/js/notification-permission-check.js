/**
 * Notification Permission Check
 * This script checks the notification permission status and updates the UI accordingly
 */

document.addEventListener('DOMContentLoaded', () => {
    // Safely get elements - prevent errors if they don't exist
    const permissionStatusDiv = document.getElementById('permissionStatus');
    const statusDiv = document.getElementById('status');

    // Handle case where permissionStatusDiv doesn't exist
    if (!permissionStatusDiv) {
        console.warn('Permission status div not found');
        return;
    }

    // Check if Notifications are supported
    if (!('Notification' in window)) {
        permissionStatusDiv.style.display = 'block';
        permissionStatusDiv.textContent = 'Notifications not supported in this browser.';
        permissionStatusDiv.className = 'notifications-status permission-denied';
        return;
    }

    function updateStatus(message, isError = false, duration = 5000) {
        if (statusDiv) {
            statusDiv.textContent = message;
            statusDiv.className = `status ${isError ? 'error' : 'success'}`;
            statusDiv.style.display = 'block';
            statusDiv.style.opacity = '1';

            // Clear any existing timeout
            if (statusDiv._hideTimeout) {
                clearTimeout(statusDiv._hideTimeout);
            }

            // Set up fade out after the specified duration
            statusDiv._hideTimeout = setTimeout(() => {
                // Add transition if not already present
                if (!statusDiv.style.transition) {
                    statusDiv.style.transition = 'opacity 300ms ease-out';
                }

                // Start fade out
                statusDiv.style.opacity = '0';

                // Hide completely after fade out completes
                setTimeout(() => {
                    statusDiv.style.display = 'none';
                    // Clean up
                    if (statusDiv._hideTimeout) {
                        clearTimeout(statusDiv._hideTimeout);
                        delete statusDiv._hideTimeout;
                    }
                }, 300);
            }, duration);
        }
    }

    async function requestNotificationPermission() {
        try {
            const permissionResult = await Notification.requestPermission();
            checkNotificationPermission(); // Update UI based on new permission

            if (permissionResult === 'granted') {
                updateStatus('Notification permission granted! You will now receive task reminders.', false);

                if ('serviceWorker' in navigator && 'PushManager' in window) {
                    navigator.serviceWorker.ready.then(swReg => {
                        setupPushSubscription(swReg);
                    });
                }
            } else {
                updateStatus('Notification permission denied. You will not receive task reminders.', true);
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            updateStatus('Error requesting notification permission.', true);
        }
    }

    async function setupPushSubscription(swRegistration) {
        try {
            if (!swRegistration) {
                console.error('Service worker registration is null or undefined');
                updateStatus('Service worker not ready. Please reload the page.', true);
                return;
            }

            // Check for existing subscription
            let subscription = await swRegistration.pushManager.getSubscription();

            // If there's an existing subscription, unsubscribe first
            // This is necessary when VAPID keys have changed
            if (subscription) {
                updateStatus('Updating subscription with new security keys...', false);
                await subscription.unsubscribe();
                console.log('Unsubscribed from existing push subscription');
            }

            // Create a new subscription with the current VAPID key
            // Using properly generated VAPID key on the P-256 curve
            const applicationServerKey = urlBase64ToUint8Array('BIErgrKRpDGw2XoFq1vhgowolKyleAgJxC_DcZlyIUASuTUHi0SlWZQ-e2p2ctskva52qii0a36uS5CqTprMxRE');

            try {
                subscription = await swRegistration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: applicationServerKey
                });

                console.log('Successfully created new push subscription');
                sendSubscriptionToServer(subscription);
            } catch (subscribeError) {
                console.warn('Silent handling of push subscription error:', subscribeError);

                // Only show error in debug mode
                if (window.location.search.includes('debug=true')) {
                    updateStatus('Failed to subscribe to push notifications. Please check your browser settings.', true);
                } else {
                    // Silently try to recover
                    setTimeout(() => {
                        console.log('Attempting silent recovery from push subscription error');
                        if ('serviceWorker' in navigator) {
                            navigator.serviceWorker.ready.then(swReg => {
                                console.log('Service worker ready for retry');
                                // Don't show any UI updates during retry
                            }).catch(err => {
                                console.warn('Silent recovery failed:', err);
                            });
                        }
                    }, 3000);
                }
            }
        } catch (error) {
            console.warn('Silent handling of push setup error:', error);

            // Only show error in debug mode
            if (window.location.search.includes('debug=true')) {
                updateStatus('Failed to setup push notifications.', true);
            } else {
                // Silently log the error without showing UI notification
                console.log('Push notification setup encountered an error, but continuing silently');
            }
        }
    }

    async function sendSubscriptionToServer(subscription) {
        if (!subscription) {
            console.error('Cannot send null subscription to server');
            updateStatus('Invalid subscription object', true);
            return false;
        }

        try {
            console.log('Sending subscription to server:', subscription.endpoint);

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
            console.log('Subscription saved successfully:', data);
            updateStatus('Notification subscription saved successfully!', false, 15000);
            return true;
        } catch (error) {
            console.error('Error saving subscription to server:', error);
            updateStatus('Failed to save notification subscription. Please try again.', true);
            return false;
        }
    }

    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    function checkNotificationPermission() {
        const permission = Notification.permission;
        permissionStatusDiv.classList.remove('permission-granted', 'permission-denied', 'permission-default');

        if (permission === 'granted') {

            permissionStatusDiv.style.display = 'none';
        } else if (permission === 'denied') {
            permissionStatusDiv.style.display = 'block';
            permissionStatusDiv.innerHTML = '<i class="fas fa-bell-slash"></i> Notification Permission: DENIED';
            permissionStatusDiv.classList.add('permission-denied');
        } else {
            permissionStatusDiv.style.display = 'block';
            permissionStatusDiv.innerHTML = `
                <i class="fas fa-bell"></i> Enable notifications for task reminders
                <button id="enableNotificationsBtn" class="btn btn--sm btn--primary">Enable</button>
            `;
            permissionStatusDiv.classList.add('permission-default');

            const enableBtn = document.getElementById('enableNotificationsBtn');
            if (enableBtn) {
                enableBtn.addEventListener('click', requestNotificationPermission);
            }
        }
    }

    // Initial permission check
    checkNotificationPermission();

    // Initialize service worker and push subscription
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        // First check if service worker is already registered
        navigator.serviceWorker.getRegistration().then(registration => {
            if (registration) {
                console.log('Service worker already registered:', registration);

                // Wait for service worker to be ready
                navigator.serviceWorker.ready.then(swReg => {
                    console.log('Service worker is ready');
                    checkNotificationPermission();

                    if (Notification.permission === 'granted') {
                        setupPushSubscription(swReg);
                    }
                }).catch(error => {
                    console.error('Error waiting for service worker to be ready:', error);
                });
            } else {
                console.log('No service worker registration found');

                // Register service worker if not already registered
                navigator.serviceWorker.register('/service-worker.js')
                    .then(swReg => {
                        console.log('Service worker registered successfully');

                        // Wait for service worker to be ready
                        return navigator.serviceWorker.ready;
                    })
                    .then(swReg => {
                        console.log('Service worker is ready');
                        checkNotificationPermission();

                        if (Notification.permission === 'granted') {
                            setupPushSubscription(swReg);
                        }
                    })
                    .catch(error => {
                        // Log but don't display to user
                        console.warn('Silent handling of service worker registration error:', error);

                        // Try to recover by clearing cache
                        if ('caches' in window) {
                            caches.keys().then(cacheNames => {
                                return Promise.all(
                                    cacheNames.map(cacheName => caches.delete(cacheName))
                                );
                            }).then(() => {
                                console.log('Cache cleared after service worker registration error');
                            }).catch(cacheError => {
                                console.warn('Error clearing cache:', cacheError);
                            });
                        }
                    });
            }
        }).catch(error => {
            console.error('Error checking service worker registration:', error);
        });
    }
});
