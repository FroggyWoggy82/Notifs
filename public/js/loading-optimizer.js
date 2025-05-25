/**
 * Loading Optimizer - Critical Resource Prioritization and Loading Optimization
 * Implements advanced loading techniques for maximum PWA performance
 */

(function() {
    'use strict';

    // Performance metrics tracking
    const performanceMetrics = {
        startTime: performance.now(),
        domContentLoaded: null,
        firstPaint: null,
        firstContentfulPaint: null,
        largestContentfulPaint: null,
        scriptsLoaded: null,
        cssLoaded: null
    };

    // Loading states
    const loadingStates = {
        critical: false,
        core: false,
        features: false,
        enhancements: false
    };

    /**
     * Optimize viewport for faster rendering
     */
    function optimizeViewport() {
        // Add viewport meta if not present
        if (!document.querySelector('meta[name="viewport"]')) {
            const viewport = document.createElement('meta');
            viewport.name = 'viewport';
            viewport.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
            document.head.appendChild(viewport);
        }

        // Optimize for mobile rendering
        if (window.innerWidth <= 768) {
            document.documentElement.style.setProperty('--mobile-optimized', '1');
        }
    }

    /**
     * Implement critical resource hints
     */
    function addCriticalResourceHints() {
        const hints = [
            { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
            { rel: 'dns-prefetch', href: '//fonts.gstatic.com' },
            { rel: 'dns-prefetch', href: '//cdnjs.cloudflare.com' },
            { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
            { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true }
        ];

        hints.forEach(hint => {
            if (!document.querySelector(`link[href="${hint.href}"]`)) {
                const link = document.createElement('link');
                link.rel = hint.rel;
                link.href = hint.href;
                if (hint.crossorigin) link.crossOrigin = 'anonymous';
                document.head.appendChild(link);
            }
        });
    }

    /**
     * Optimize images for faster loading
     */
    function optimizeImages() {
        // Add loading="lazy" to images below the fold
        const images = document.querySelectorAll('img:not([loading])');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: '50px' });

        images.forEach((img, index) => {
            // First 3 images load immediately, rest are lazy
            if (index > 2) {
                img.loading = 'lazy';
                if (img.src && !img.dataset.src) {
                    img.dataset.src = img.src;
                    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9InRyYW5zcGFyZW50Ii8+PC9zdmc+';
                    observer.observe(img);
                }
            }
        });
    }

    /**
     * Optimize fonts for faster loading
     */
    function optimizeFonts() {
        // Add font-display: swap to existing font links
        const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
        fontLinks.forEach(link => {
            if (!link.href.includes('display=swap')) {
                link.href += link.href.includes('?') ? '&display=swap' : '?display=swap';
            }
        });

        // Preload critical font files
        const criticalFonts = [
            'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2'
        ];

        criticalFonts.forEach(fontUrl => {
            if (!document.querySelector(`link[href="${fontUrl}"]`)) {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'font';
                link.type = 'font/woff2';
                link.href = fontUrl;
                link.crossOrigin = 'anonymous';
                document.head.appendChild(link);
            }
        });
    }

    /**
     * Implement progressive enhancement
     */
    function implementProgressiveEnhancement() {
        // Add basic functionality immediately
        document.documentElement.classList.add('js-enabled');
        
        // Add loading class for CSS transitions
        document.body.classList.add('loading');
        
        // Remove loading class after initial render
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                document.body.classList.remove('loading');
                document.body.classList.add('loaded');
            });
        });
    }

    /**
     * Monitor loading performance
     */
    function monitorPerformance() {
        // Track DOM Content Loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                performanceMetrics.domContentLoaded = performance.now();
                console.log(`DOM Content Loaded: ${(performanceMetrics.domContentLoaded - performanceMetrics.startTime).toFixed(2)}ms`);
            });
        } else {
            performanceMetrics.domContentLoaded = performance.now();
        }

        // Track paint metrics
        if ('PerformanceObserver' in window) {
            const paintObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.name === 'first-paint') {
                        performanceMetrics.firstPaint = entry.startTime;
                        console.log(`First Paint: ${entry.startTime.toFixed(2)}ms`);
                    } else if (entry.name === 'first-contentful-paint') {
                        performanceMetrics.firstContentfulPaint = entry.startTime;
                        console.log(`First Contentful Paint: ${entry.startTime.toFixed(2)}ms`);
                    }
                });
            });
            paintObserver.observe({ entryTypes: ['paint'] });

            // Track LCP
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                performanceMetrics.largestContentfulPaint = lastEntry.startTime;
                console.log(`Largest Contentful Paint: ${lastEntry.startTime.toFixed(2)}ms`);
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        }

        // Track custom events
        document.addEventListener('deferredCSSLoaded', () => {
            performanceMetrics.cssLoaded = performance.now();
            console.log(`CSS Loaded: ${(performanceMetrics.cssLoaded - performanceMetrics.startTime).toFixed(2)}ms`);
        });

        document.addEventListener('scriptsLoaded', () => {
            performanceMetrics.scriptsLoaded = performance.now();
            console.log(`Scripts Loaded: ${(performanceMetrics.scriptsLoaded - performanceMetrics.startTime).toFixed(2)}ms`);
            
            // Calculate total load time
            const totalTime = performanceMetrics.scriptsLoaded - performanceMetrics.startTime;
            console.log(`Total Load Time: ${totalTime.toFixed(2)}ms`);
            
            // Dispatch completion event
            document.dispatchEvent(new CustomEvent('appFullyLoaded', {
                detail: { metrics: performanceMetrics, totalTime }
            }));
        });
    }

    /**
     * Optimize for mobile devices
     */
    function optimizeForMobile() {
        if (window.innerWidth <= 768) {
            // Reduce animations on mobile for better performance
            document.documentElement.style.setProperty('--animation-duration', '0.1s');
            
            // Optimize touch interactions
            document.addEventListener('touchstart', function() {}, { passive: true });
            
            // Prevent zoom on input focus
            const inputs = document.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('focus', () => {
                    if (input.type !== 'range') {
                        const viewport = document.querySelector('meta[name="viewport"]');
                        if (viewport) {
                            viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
                        }
                    }
                });
                
                input.addEventListener('blur', () => {
                    const viewport = document.querySelector('meta[name="viewport"]');
                    if (viewport) {
                        viewport.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
                    }
                });
            });
        }
    }

    /**
     * Initialize loading optimizations
     */
    function init() {
        console.log('Loading Optimizer initialized');
        
        // Run optimizations immediately
        optimizeViewport();
        addCriticalResourceHints();
        implementProgressiveEnhancement();
        monitorPerformance();
        
        // Run after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                optimizeImages();
                optimizeFonts();
                optimizeForMobile();
            });
        } else {
            optimizeImages();
            optimizeFonts();
            optimizeForMobile();
        }
    }

    // Start optimization immediately
    init();

    // Expose performance metrics globally
    window.LoadingOptimizer = {
        metrics: performanceMetrics,
        states: loadingStates
    };
})();
