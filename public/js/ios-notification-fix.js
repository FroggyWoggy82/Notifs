/**
 * iOS Notification Fix
 * Comprehensive fix for iOS Safari notification issues
 */

(function() {
    'use strict';

    // iOS Detection
    function isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent);
    }

    function isSafari() {
        return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    }

    function isStandalone() {
        return window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
    }

    function isIOSSafari() {
        return isIOS() && isSafari();
    }

    // Enhanced notification support detection
    function getNotificationSupport() {
        const support = {
            notifications: 'Notification' in window,
            serviceWorker: 'serviceWorker' in navigator,
            pushManager: 'PushManager' in window,
            isIOS: isIOS(),
            isSafari: isSafari(),
            isStandalone: isStandalone(),
            isIOSSafari: isIOSSafari()
        };

        console.log('Notification support detection:', support);

        // Check for full support
        if (support.notifications && support.serviceWorker && support.pushManager) {
            // Special handling for iOS Safari
            if (support.isIOSSafari && !support.isStandalone) {
                return {
                    supported: false,
                    reason: 'ios-pwa-required',
                    message: 'iOS Safari requires the app to be added to your home screen for notifications to work.',
                    action: 'add-to-homescreen'
                };
            }
            
            return {
                supported: true,
                reason: 'full-support',
                message: 'Full notification support available'
            };
        }

        // Check for basic notification support
        if (support.notifications) {
            return {
                supported: 'basic',
                reason: 'basic-only',
                message: 'Basic notifications available, but background notifications may not work.',
                action: 'enable-basic'
            };
        }

        return {
            supported: false,
            reason: 'not-supported',
            message: 'Notifications are not supported in this browser.',
            action: 'none'
        };
    }

    // Create iOS installation prompt
    function createIOSInstallPrompt() {
        const promptDiv = document.createElement('div');
        promptDiv.id = 'ios-install-prompt';
        promptDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            right: 20px;
            background: linear-gradient(135deg, #1e1e1e, #2a2a2a);
            color: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.5);
            z-index: 10000;
            border: 1px solid #00E676;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        promptDiv.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <i class="fas fa-mobile-alt" style="color: #00E676; margin-right: 10px; font-size: 24px;"></i>
                <h3 style="margin: 0; color: #00E676;">Enable Notifications</h3>
            </div>
            <p style="margin: 0 0 15px 0; line-height: 1.4;">
                To receive task reminders on iOS Safari, please:
            </p>
            <ol style="margin: 0 0 15px 0; padding-left: 20px; line-height: 1.6;">
                <li>Tap the <strong>Share</strong> button <i class="fas fa-share" style="color: #007AFF;"></i> in Safari</li>
                <li>Select <strong>"Add to Home Screen"</strong> <i class="fas fa-plus-square" style="color: #00E676;"></i></li>
                <li>Tap <strong>"Add"</strong> to install the app</li>
                <li>Open the app from your home screen</li>
                <li>Return to Settings to enable notifications</li>
            </ol>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button id="ios-prompt-dismiss" style="
                    background: transparent;
                    border: 1px solid #666;
                    color: #ccc;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                ">Maybe Later</button>
                <button id="ios-prompt-understand" style="
                    background: #00E676;
                    border: none;
                    color: #000;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                ">I Understand</button>
            </div>
        `;

        document.body.appendChild(promptDiv);

        // Add event listeners
        document.getElementById('ios-prompt-dismiss').addEventListener('click', () => {
            promptDiv.remove();
            localStorage.setItem('ios-install-prompt-dismissed', Date.now());
        });

        document.getElementById('ios-prompt-understand').addEventListener('click', () => {
            promptDiv.remove();
            localStorage.setItem('ios-install-prompt-understood', Date.now());
        });

        return promptDiv;
    }

    // Enhanced notification permission request
    async function requestNotificationPermission() {
        try {
            console.log('Requesting notification permission...');
            
            // For iOS Safari, show installation prompt first
            if (isIOSSafari() && !isStandalone()) {
                const lastDismissed = localStorage.getItem('ios-install-prompt-dismissed');
                const lastUnderstood = localStorage.getItem('ios-install-prompt-understood');
                const now = Date.now();
                const dayInMs = 24 * 60 * 60 * 1000;

                // Show prompt if not dismissed recently
                if (!lastDismissed || (now - parseInt(lastDismissed)) > dayInMs) {
                    if (!lastUnderstood || (now - parseInt(lastUnderstood)) > dayInMs) {
                        createIOSInstallPrompt();
                        return false;
                    }
                }
            }

            const permission = await Notification.requestPermission();
            console.log('Notification permission result:', permission);
            
            return permission === 'granted';
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    }

    // Basic notification fallback
    function sendBasicNotification(title, options = {}) {
        if (Notification.permission === 'granted') {
            try {
                const notification = new Notification(title, {
                    icon: '/icon-192x192.png',
                    badge: '/icon-192x192.png',
                    ...options
                });

                // Auto-close after 5 seconds
                setTimeout(() => {
                    notification.close();
                }, 5000);

                return notification;
            } catch (error) {
                console.error('Error creating basic notification:', error);
                return null;
            }
        }
        return null;
    }

    // Test notification function
    function sendTestNotification() {
        const support = getNotificationSupport();
        
        if (support.supported === true || support.supported === 'basic') {
            if (Notification.permission === 'granted') {
                sendBasicNotification('Test Notification', {
                    body: 'This is a test notification from your Task PWA!',
                    tag: 'test-notification'
                });
                return true;
            } else {
                console.log('Notification permission not granted');
                return false;
            }
        } else {
            console.log('Notifications not supported:', support.reason);
            return false;
        }
    }

    // Export functions globally
    window.iOSNotificationFix = {
        getNotificationSupport,
        requestNotificationPermission,
        sendBasicNotification,
        sendTestNotification,
        isIOS,
        isSafari,
        isStandalone,
        isIOSSafari
    };

    console.log('iOS Notification Fix loaded');
})();
