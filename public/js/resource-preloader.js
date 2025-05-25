/**
 * Resource Preloader - Dynamic Resource Preloading for Performance
 * Intelligently preloads resources based on user behavior and page context
 */

(function() {
    'use strict';

    // Configuration for resource preloading
    const config = {
        // Resources to preload on idle
        idleResources: [
            '/js/common/sidebar.js',
            '/js/common/status-bar.js',
            '/js/common/bottom-nav-fix.js',
            '/js/dashboard-stats.js',
            '/js/habits/habit-redesign.js',
            '/js/calendar/calendar-refresh-fix.js'
        ],
        
        // Page-specific resources to preload on hover
        pageResources: {
            '/pages/goals.html': [
                '/js/goals/goals.js',
                '/css/pages/goals.css'
            ],
            '/pages/calendar.html': [
                '/js/calendar/calendar.js',
                '/css/pages/calendar.css'
            ],
            '/pages/food.html': [
                '/js/food/food.js',
                '/css/pages/food.css'
            ],
            '/pages/workouts.html': [
                '/js/workouts/workouts.js',
                '/css/pages/workouts.css'
            ]
        },
        
        // Critical images to preload
        criticalImages: [
            '/icon-192x192.png',
            '/icon-512x512.png'
        ]
    };

    // Track preloaded resources to avoid duplicates
    const preloadedResources = new Set();

    /**
     * Preload a resource
     * @param {string} href - Resource URL
     * @param {string} as - Resource type (script, style, image, etc.)
     * @param {boolean} crossorigin - Whether to use crossorigin
     */
    function preloadResource(href, as, crossorigin = false) {
        if (preloadedResources.has(href)) {
            return; // Already preloaded
        }

        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = as;
        
        if (crossorigin) {
            link.crossOrigin = 'anonymous';
        }

        // Add error handling
        link.onerror = function() {
            console.warn(`Failed to preload resource: ${href}`);
        };

        document.head.appendChild(link);
        preloadedResources.add(href);
        console.log(`Preloaded: ${href}`);
    }

    /**
     * Preload JavaScript file
     * @param {string} src - Script source
     */
    function preloadScript(src) {
        preloadResource(src, 'script');
    }

    /**
     * Preload CSS file
     * @param {string} href - CSS href
     */
    function preloadStyle(href) {
        preloadResource(href, 'style');
    }

    /**
     * Preload image
     * @param {string} src - Image source
     */
    function preloadImage(src) {
        preloadResource(src, 'image');
    }

    /**
     * Preload resources when browser is idle
     */
    function preloadIdleResources() {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(function() {
                config.idleResources.forEach(function(resource) {
                    if (resource.endsWith('.js')) {
                        preloadScript(resource);
                    } else if (resource.endsWith('.css')) {
                        preloadStyle(resource);
                    }
                });
            });
        } else {
            // Fallback for browsers without requestIdleCallback
            setTimeout(function() {
                config.idleResources.forEach(function(resource) {
                    if (resource.endsWith('.js')) {
                        preloadScript(resource);
                    } else if (resource.endsWith('.css')) {
                        preloadStyle(resource);
                    }
                });
            }, 2000);
        }
    }

    /**
     * Preload page-specific resources on link hover
     */
    function setupHoverPreloading() {
        document.addEventListener('mouseover', function(event) {
            const link = event.target.closest('a[href]');
            if (!link) return;

            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
                return;
            }

            // Preload page-specific resources
            if (config.pageResources[href]) {
                config.pageResources[href].forEach(function(resource) {
                    if (resource.endsWith('.js')) {
                        preloadScript(resource);
                    } else if (resource.endsWith('.css')) {
                        preloadStyle(resource);
                    }
                });
            }
        });
    }

    /**
     * Preload critical images
     */
    function preloadCriticalImages() {
        config.criticalImages.forEach(function(imageSrc) {
            preloadImage(imageSrc);
        });
    }

    /**
     * Preload resources based on viewport intersection
     */
    function setupIntersectionPreloading() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        
                        // Preload images that are about to come into view
                        if (element.tagName === 'IMG' && element.dataset.src) {
                            preloadImage(element.dataset.src);
                        }
                        
                        // Preload resources for sections that are about to be visible
                        if (element.classList.contains('habit-list-section')) {
                            preloadScript('/js/habits/habit-redesign.js');
                        }
                    }
                });
            }, {
                rootMargin: '50px' // Start preloading 50px before element enters viewport
            });

            // Observe relevant elements
            document.querySelectorAll('img[data-src], .habit-list-section, .task-list-section').forEach(function(element) {
                observer.observe(element);
            });
        }
    }

    /**
     * Initialize resource preloader
     */
    function init() {
        // Preload critical images immediately
        preloadCriticalImages();
        
        // Setup hover preloading
        setupHoverPreloading();
        
        // Preload idle resources when browser is idle
        preloadIdleResources();
        
        // Setup intersection-based preloading
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupIntersectionPreloading);
        } else {
            setupIntersectionPreloading();
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose preload functions globally for manual use
    window.ResourcePreloader = {
        preloadScript: preloadScript,
        preloadStyle: preloadStyle,
        preloadImage: preloadImage,
        preloadResource: preloadResource
    };
})();
