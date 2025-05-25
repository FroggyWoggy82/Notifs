/**
 * PWA Optimizer - Advanced PWA Performance Optimizations
 * Implements cutting-edge techniques for maximum mobile performance
 */

(function() {
    'use strict';

    /**
     * Optimize for iOS Safari and mobile browsers
     */
    function optimizeForMobileBrowsers() {
        // Detect iOS Safari
        const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        
        if (isIOSSafari) {
            // Optimize for iOS Safari
            document.documentElement.classList.add('ios-safari');
            
            // Prevent zoom on input focus
            const viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) {
                viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
            }
            
            // Optimize touch scrolling
            document.body.style.webkitOverflowScrolling = 'touch';
            
            // Prevent pull-to-refresh
            document.body.style.overscrollBehavior = 'none';
            
            // Optimize for notch devices
            if (window.screen.height >= 812) {
                document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
                document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
            }
        }

        // Optimize for Android Chrome
        const isAndroidChrome = /Android.*Chrome/.test(navigator.userAgent);
        if (isAndroidChrome) {
            document.documentElement.classList.add('android-chrome');
            
            // Optimize for Android
            document.body.style.overscrollBehavior = 'none';
        }
    }

    /**
     * Implement advanced caching strategies
     */
    function implementAdvancedCaching() {
        // Cache critical API responses in localStorage
        const cacheAPI = {
            set: (key, data, ttl = 300000) => { // 5 minutes default
                const item = {
                    data: data,
                    timestamp: Date.now(),
                    ttl: ttl
                };
                try {
                    localStorage.setItem(`api_cache_${key}`, JSON.stringify(item));
                } catch (e) {
                    console.warn('localStorage cache failed:', e);
                }
            },
            
            get: (key) => {
                try {
                    const item = JSON.parse(localStorage.getItem(`api_cache_${key}`));
                    if (!item) return null;
                    
                    if (Date.now() - item.timestamp > item.ttl) {
                        localStorage.removeItem(`api_cache_${key}`);
                        return null;
                    }
                    
                    return item.data;
                } catch (e) {
                    return null;
                }
            },
            
            clear: () => {
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('api_cache_')) {
                        localStorage.removeItem(key);
                    }
                });
            }
        };

        // Expose cache API globally
        window.APICache = cacheAPI;
    }

    /**
     * Optimize network requests
     */
    function optimizeNetworkRequests() {
        // Implement request deduplication
        const pendingRequests = new Map();
        
        const originalFetch = window.fetch;
        window.fetch = function(url, options = {}) {
            const key = `${options.method || 'GET'}_${url}`;
            
            // Return existing promise if same request is pending
            if (pendingRequests.has(key)) {
                return pendingRequests.get(key);
            }
            
            // Add request timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            const fetchOptions = {
                ...options,
                signal: controller.signal
            };
            
            const promise = originalFetch(url, fetchOptions)
                .then(response => {
                    clearTimeout(timeoutId);
                    pendingRequests.delete(key);
                    return response;
                })
                .catch(error => {
                    clearTimeout(timeoutId);
                    pendingRequests.delete(key);
                    throw error;
                });
            
            pendingRequests.set(key, promise);
            return promise;
        };
    }

    /**
     * Implement intelligent prefetching
     */
    function implementIntelligentPrefetching() {
        // Track user interactions for predictive prefetching
        const interactionHistory = [];
        
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a[href]');
            if (link) {
                interactionHistory.push({
                    href: link.href,
                    timestamp: Date.now()
                });
                
                // Keep only recent interactions
                const cutoff = Date.now() - 300000; // 5 minutes
                while (interactionHistory.length > 0 && interactionHistory[0].timestamp < cutoff) {
                    interactionHistory.shift();
                }
            }
        });

        // Prefetch likely next pages on hover
        document.addEventListener('mouseover', (event) => {
            const link = event.target.closest('a[href]');
            if (link && link.href.includes(window.location.origin)) {
                // Only prefetch internal links
                const prefetchLink = document.createElement('link');
                prefetchLink.rel = 'prefetch';
                prefetchLink.href = link.href;
                document.head.appendChild(prefetchLink);
                
                // Remove after a short time to avoid cluttering
                setTimeout(() => {
                    if (prefetchLink.parentNode) {
                        prefetchLink.parentNode.removeChild(prefetchLink);
                    }
                }, 5000);
            }
        });
    }

    /**
     * Optimize animations and transitions
     */
    function optimizeAnimations() {
        // Reduce animations on low-end devices
        if (navigator.hardwareConcurrency <= 2 || navigator.deviceMemory <= 2) {
            document.documentElement.classList.add('reduced-motion');
            document.documentElement.style.setProperty('--animation-duration', '0.1s');
        }

        // Pause animations when page is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                document.documentElement.classList.add('paused-animations');
            } else {
                document.documentElement.classList.remove('paused-animations');
            }
        });

        // Use will-change property for better performance
        const animatedElements = document.querySelectorAll('[class*="animate"], [class*="transition"]');
        animatedElements.forEach(element => {
            element.style.willChange = 'transform, opacity';
        });
    }

    /**
     * Implement battery-aware optimizations
     */
    function implementBatteryOptimizations() {
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                const updateBatteryStatus = () => {
                    if (battery.level < 0.2 || !battery.charging) {
                        // Low battery mode
                        document.documentElement.classList.add('low-battery');
                        document.documentElement.style.setProperty('--animation-duration', '0s');
                        
                        // Reduce background sync
                        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                            navigator.serviceWorker.controller.postMessage({
                                type: 'LOW_BATTERY_MODE',
                                enabled: true
                            });
                        }
                    } else {
                        document.documentElement.classList.remove('low-battery');
                        document.documentElement.style.removeProperty('--animation-duration');
                        
                        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                            navigator.serviceWorker.controller.postMessage({
                                type: 'LOW_BATTERY_MODE',
                                enabled: false
                            });
                        }
                    }
                };

                battery.addEventListener('chargingchange', updateBatteryStatus);
                battery.addEventListener('levelchange', updateBatteryStatus);
                updateBatteryStatus();
            });
        }
    }

    /**
     * Optimize for different connection speeds
     */
    function optimizeForConnection() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            
            const updateConnectionStatus = () => {
                const effectiveType = connection.effectiveType;
                
                if (effectiveType === 'slow-2g' || effectiveType === '2g') {
                    document.documentElement.classList.add('slow-connection');
                    // Disable non-essential features
                    document.documentElement.style.setProperty('--image-quality', '0.7');
                } else if (effectiveType === '3g') {
                    document.documentElement.classList.add('medium-connection');
                    document.documentElement.style.setProperty('--image-quality', '0.8');
                } else {
                    document.documentElement.classList.remove('slow-connection', 'medium-connection');
                    document.documentElement.style.setProperty('--image-quality', '1');
                }
            };

            connection.addEventListener('change', updateConnectionStatus);
            updateConnectionStatus();
        }
    }

    /**
     * Initialize PWA optimizations
     */
    function init() {
        console.log('PWA Optimizer initialized');
        
        optimizeForMobileBrowsers();
        implementAdvancedCaching();
        optimizeNetworkRequests();
        implementIntelligentPrefetching();
        optimizeAnimations();
        implementBatteryOptimizations();
        optimizeForConnection();
        
        // Mark PWA as fully optimized
        document.documentElement.classList.add('pwa-optimized');
        
        console.log('PWA optimizations complete');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose PWA optimizer globally
    window.PWAOptimizer = {
        cache: window.APICache,
        initialized: true
    };
})();
