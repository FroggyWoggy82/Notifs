/**
 * Immediate Notification Fix
 * This script runs before anything else to fix any stuck notifications,
 * handle service worker errors, and manage debug buttons
 */

// Immediately remove any error notifications that might be stuck
(function() {
    // Function to safely remove elements by selector
    function safeRemoveElements(selector) {
        try {
            const elements = document.querySelectorAll(selector);
            if (elements && elements.length > 0) {
                elements.forEach(el => {
                    if (el && el.parentNode) {
                        el.parentNode.removeChild(el);
                    }
                });
                console.log(`Removed ${elements.length} elements matching: ${selector}`);
                return true;
            }
        } catch (e) {
            console.error(`Error removing elements with selector ${selector}:`, e);
        }
        return false;
    }

    // Function to handle "Unexpected token '<'" errors
    function handleUnexpectedTokenError() {
        // Check if we have this specific error in the console
        const consoleErrors = [];
        const originalConsoleError = console.error;
        console.error = function() {
            consoleErrors.push(Array.from(arguments).join(' '));
            originalConsoleError.apply(console, arguments);
        };

        // Restore original console.error after a short delay
        setTimeout(() => {
            console.error = originalConsoleError;

            // Check if we have the specific error
            const hasUnexpectedTokenError = consoleErrors.some(error =>
                error.includes("Unexpected token '<'")
            );

            if (hasUnexpectedTokenError) {
                console.warn("Detected 'Unexpected token <' error - likely a service worker issue");

                // Create a small notification at the top of the page
                const errorNotification = document.createElement('div');
                errorNotification.style.position = 'fixed';
                errorNotification.style.top = '0';
                errorNotification.style.left = '0';
                errorNotification.style.right = '0';
                errorNotification.style.padding = '10px';
                errorNotification.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
                errorNotification.style.color = 'white';
                errorNotification.style.zIndex = '9999';
                errorNotification.style.textAlign = 'center';
                errorNotification.style.fontSize = '14px';
                errorNotification.textContent = "Error: Unexpected token '<'";
                document.body.appendChild(errorNotification);

                // Add service worker debug buttons
                createServiceWorkerButtons(errorNotification);

                // Auto-remove after 10 seconds if not interacted with
                setTimeout(() => {
                    if (document.body.contains(errorNotification)) {
                        errorNotification.style.opacity = '0';
                        errorNotification.style.transition = 'opacity 0.5s ease';
                        setTimeout(() => {
                            if (document.body.contains(errorNotification)) {
                                document.body.removeChild(errorNotification);
                            }
                        }, 500);
                    }
                }, 10000);
            }
        }, 100);
    }

    // Function to create service worker debug buttons
    function createServiceWorkerButtons(parentElement) {
        // Create container for buttons
        const buttonsDiv = document.createElement('div');
        buttonsDiv.style.marginTop = '10px';
        buttonsDiv.style.display = 'flex';
        buttonsDiv.style.justifyContent = 'center';
        buttonsDiv.style.gap = '10px';

        // Button to unregister service worker
        const unregisterButton = document.createElement('button');
        unregisterButton.textContent = 'Unregister Service Worker';
        unregisterButton.style.padding = '5px 10px';
        unregisterButton.style.backgroundColor = '#ff5722';
        unregisterButton.style.border = 'none';
        unregisterButton.style.borderRadius = '4px';
        unregisterButton.style.color = 'white';
        unregisterButton.style.cursor = 'pointer';
        unregisterButton.onclick = function() {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for(let registration of registrations) {
                        registration.unregister();
                    }
                    parentElement.textContent = 'Service Worker unregistered. Reloading...';
                    setTimeout(() => window.location.reload(true), 1000);
                });
            } else {
                parentElement.textContent = 'Service Worker API not available in this browser.';
                setTimeout(() => window.location.reload(true), 1000);
            }
        };

        // Button to clear cache
        const clearCacheButton = document.createElement('button');
        clearCacheButton.textContent = 'Clear Cache';
        clearCacheButton.style.padding = '5px 10px';
        clearCacheButton.style.backgroundColor = '#2196f3';
        clearCacheButton.style.border = 'none';
        clearCacheButton.style.borderRadius = '4px';
        clearCacheButton.style.color = 'white';
        clearCacheButton.style.cursor = 'pointer';
        clearCacheButton.onclick = function() {
            if ('caches' in window) {
                caches.keys().then(function(cacheNames) {
                    return Promise.all(
                        cacheNames.map(function(cacheName) {
                            return caches.delete(cacheName);
                        })
                    );
                }).then(function() {
                    parentElement.textContent = 'Cache cleared. Reloading...';
                    setTimeout(() => window.location.reload(true), 1000);
                });
            } else {
                parentElement.textContent = 'Cache API not available in this browser.';
                setTimeout(() => window.location.reload(true), 1000);
            }
        };

        // Button to bypass service worker
        const bypassButton = document.createElement('button');
        bypassButton.textContent = 'Bypass Service Worker';
        bypassButton.style.padding = '5px 10px';
        bypassButton.style.backgroundColor = '#4caf50';
        bypassButton.style.border = 'none';
        bypassButton.style.borderRadius = '4px';
        bypassButton.style.color = 'white';
        bypassButton.style.cursor = 'pointer';
        bypassButton.onclick = function() {
            window.location.href = '/?bypass=' + Date.now();
        };

        // Add buttons to container
        buttonsDiv.appendChild(unregisterButton);
        buttonsDiv.appendChild(clearCacheButton);
        buttonsDiv.appendChild(bypassButton);

        // Add container to parent element
        parentElement.appendChild(buttonsDiv);
    }

    // Function to create debug buttons (only when debug=true is in URL)
    function createDebugButtons() {
        // Check if debug buttons already exist
        if (document.getElementById('debug-buttons-container')) {
            return;
        }

        // Create container for debug buttons
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.bottom = '10px';
        container.style.right = '10px';
        container.style.zIndex = '9999';
        container.style.display = 'flex';
        container.style.gap = '10px';
        container.style.padding = '10px';
        container.style.background = 'rgba(0,0,0,0.7)';
        container.style.borderRadius = '5px';
        container.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
        container.id = 'debug-buttons-container';

        // Create buttons
        const buttons = [
            {
                text: 'Unregister Service Worker',
                color: '#ff5722',
                onClick: function() {
                    if ('serviceWorker' in navigator) {
                        navigator.serviceWorker.getRegistrations().then(function(registrations) {
                            for(let registration of registrations) {
                                registration.unregister();
                            }
                            alert('Service Worker unregistered. Reloading...');
                            setTimeout(() => window.location.reload(true), 1000);
                        });
                    } else {
                        alert('Service Worker API not available in this browser.');
                    }
                }
            },
            {
                text: 'Clear Cache',
                color: '#2196f3',
                onClick: function() {
                    if ('caches' in window) {
                        caches.keys().then(function(cacheNames) {
                            return Promise.all(
                                cacheNames.map(function(cacheName) {
                                    return caches.delete(cacheName);
                                })
                            );
                        }).then(function() {
                            alert('Cache cleared. Reloading...');
                            setTimeout(() => window.location.reload(true), 1000);
                        });
                    } else {
                        alert('Cache API not available in this browser.');
                    }
                }
            },
            {
                text: 'Bypass Service Worker',
                color: '#4caf50',
                onClick: function() {
                    window.location.href = '/?bypass=' + Date.now();
                }
            }
        ];

        // Add buttons to container
        buttons.forEach(buttonConfig => {
            const button = document.createElement('button');
            button.textContent = buttonConfig.text;
            button.style.padding = '5px 10px';
            button.style.backgroundColor = buttonConfig.color;
            button.style.border = 'none';
            button.style.borderRadius = '4px';
            button.style.color = 'white';
            button.style.cursor = 'pointer';
            button.style.fontSize = '12px';
            button.style.fontWeight = 'bold';
            button.addEventListener('click', buttonConfig.onClick);
            container.appendChild(button);
        });

        // Add container to body
        document.body.appendChild(container);
    }

    // Function to handle the DOMContentLoaded event
    function onDOMContentLoaded() {
        // Remove any error notifications
        safeRemoveElements('div[style*="position: fixed"][style*="background-color: rgba(255, 0, 0, 0.8)"]');

        // Remove any timeout notifications
        safeRemoveElements('div[style*="position: fixed"][style*="background-color: rgba(255, 165, 0, 0.8)"]');

        // Create debug buttons if URL has debug parameter
        if (window.location.search.includes('debug=true')) {
            createDebugButtons();
        }
    }

    // Run immediately for any elements already in the DOM
    safeRemoveElements('div[style*="position: fixed"][style*="background-color: rgba(255, 0, 0, 0.8)"]');
    safeRemoveElements('div[style*="position: fixed"][style*="background-color: rgba(255, 165, 0, 0.8)"]');

    // Check for unexpected token errors
    handleUnexpectedTokenError();

    // Also run when DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
    } else {
        onDOMContentLoaded();
    }
})();
