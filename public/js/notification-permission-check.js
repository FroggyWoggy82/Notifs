/**
 * Notification Permission Check
 * This script checks the notification permission status and updates the UI accordingly
 */

document.addEventListener('DOMContentLoaded', () => {
    const permissionStatusDiv = document.getElementById('permissionStatus');
    const statusDiv = document.getElementById('status');

    if (!permissionStatusDiv) {
        console.warn('Permission status div not found');
        return;
    }

    if (!('Notification' in window)) {
        permissionStatusDiv.style.display = 'block';
        permissionStatusDiv.textContent = 'Notifications not supported in this browser.';
        permissionStatusDiv.className = 'notifications-status permission-denied';
        return;
    }

    function updateStatus(message, isError = false) {
        if (statusDiv) {
            statusDiv.textContent = message;
            statusDiv.className = `status ${isError ? 'error' : 'success'}`;
            statusDiv.style.display = 'block';
            setTimeout(() => { statusDiv.style.display = 'none'; }, 5000);
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
            // Check for existing subscription
            let subscription = await swRegistration.pushManager.getSubscription();

            // If there's an existing subscription, unsubscribe first
            // This is necessary when VAPID keys have changed
            if (subscription) {
                updateStatus('Updating subscription with new security keys...', false);
                await subscription.unsubscribe();
            }

            // Create a new subscription with the current VAPID key
            // Using properly generated VAPID key on the P-256 curve
            const applicationServerKey = urlBase64ToUint8Array('BIErgrKRpDGw2XoFq1vhgowolKyleAgJxC_DcZlyIUASuTUHi0SlWZQ-e2p2ctskva52qii0a36uS5CqTprMxRE');

            subscription = await swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey
            });

            sendSubscriptionToServer(subscription);
        } catch (error) {
            console.error('Failed to setup push subscription:', error);
            updateStatus('Failed to setup push notifications.', true);
        }
    }

    async function sendSubscriptionToServer(subscription) {
        try {
            const response = await fetch('/api/save-subscription', {
                method: 'POST',
                body: JSON.stringify(subscription),
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            updateStatus('Notification subscription saved successfully!', false);
            return true;
        } catch (error) {
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

    checkNotificationPermission();

    if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.ready.then(swReg => {
            checkNotificationPermission();

            if (Notification.permission === 'granted') {
                setupPushSubscription(swReg);
            }
        });
    }
});
