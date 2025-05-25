/**
 * Performance Monitor - Real-time Performance Tracking and Optimization
 * Monitors PWA performance and provides optimization suggestions
 */

(function() {
    'use strict';

    // Performance thresholds (in milliseconds)
    const THRESHOLDS = {
        EXCELLENT: {
            fcp: 1000,
            lcp: 2000,
            fid: 100,
            cls: 0.1,
            ttfb: 200
        },
        GOOD: {
            fcp: 2000,
            lcp: 3000,
            fid: 300,
            cls: 0.25,
            ttfb: 500
        }
    };

    // Performance data storage
    const performanceData = {
        navigation: {},
        vitals: {},
        resources: [],
        errors: []
    };

    /**
     * Measure Core Web Vitals
     */
    function measureCoreWebVitals() {
        if (!('PerformanceObserver' in window)) return;

        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            performanceData.vitals.lcp = lastEntry.startTime;
            
            const rating = getRating(lastEntry.startTime, 'lcp');
            console.log(`LCP: ${lastEntry.startTime.toFixed(2)}ms (${rating})`);
            
            if (rating === 'poor') {
                console.warn('LCP is poor. Consider optimizing images and critical resources.');
            }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                performanceData.vitals.fid = entry.processingStart - entry.startTime;
                
                const rating = getRating(performanceData.vitals.fid, 'fid');
                console.log(`FID: ${performanceData.vitals.fid.toFixed(2)}ms (${rating})`);
                
                if (rating === 'poor') {
                    console.warn('FID is poor. Consider reducing JavaScript execution time.');
                }
            });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            });
            
            performanceData.vitals.cls = clsValue;
            const rating = getRating(clsValue, 'cls');
            console.log(`CLS: ${clsValue.toFixed(3)} (${rating})`);
            
            if (rating === 'poor') {
                console.warn('CLS is poor. Consider setting dimensions for images and avoiding layout shifts.');
            }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // First Contentful Paint (FCP)
        const fcpObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.name === 'first-contentful-paint') {
                    performanceData.vitals.fcp = entry.startTime;
                    
                    const rating = getRating(entry.startTime, 'fcp');
                    console.log(`FCP: ${entry.startTime.toFixed(2)}ms (${rating})`);
                    
                    if (rating === 'poor') {
                        console.warn('FCP is poor. Consider optimizing critical CSS and reducing render-blocking resources.');
                    }
                }
            });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
    }

    /**
     * Get performance rating
     */
    function getRating(value, metric) {
        if (value <= THRESHOLDS.EXCELLENT[metric]) return 'excellent';
        if (value <= THRESHOLDS.GOOD[metric]) return 'good';
        return 'poor';
    }

    /**
     * Monitor resource loading
     */
    function monitorResources() {
        if (!('PerformanceObserver' in window)) return;

        const resourceObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                const resource = {
                    name: entry.name,
                    type: entry.initiatorType,
                    size: entry.transferSize || 0,
                    duration: entry.duration,
                    startTime: entry.startTime
                };
                
                performanceData.resources.push(resource);
                
                // Warn about slow resources
                if (entry.duration > 1000) {
                    console.warn(`Slow resource: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
                }
                
                // Warn about large resources
                if (entry.transferSize > 500000) { // 500KB
                    console.warn(`Large resource: ${entry.name} is ${(entry.transferSize / 1024).toFixed(2)}KB`);
                }
            });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
    }

    /**
     * Monitor navigation timing
     */
    function monitorNavigation() {
        if (!('PerformanceNavigationTiming' in window)) return;

        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            performanceData.navigation = {
                ttfb: navigation.responseStart - navigation.requestStart,
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
                loadComplete: navigation.loadEventEnd - navigation.navigationStart,
                dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
                tcpConnect: navigation.connectEnd - navigation.connectStart,
                serverResponse: navigation.responseEnd - navigation.responseStart
            };

            console.log('Navigation Timing:', performanceData.navigation);
            
            // Check TTFB
            const ttfbRating = getRating(performanceData.navigation.ttfb, 'ttfb');
            if (ttfbRating === 'poor') {
                console.warn('TTFB is poor. Consider server optimization or CDN usage.');
            }
        }
    }

    /**
     * Monitor JavaScript errors
     */
    function monitorErrors() {
        window.addEventListener('error', (event) => {
            const error = {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                timestamp: Date.now()
            };
            
            performanceData.errors.push(error);
            console.error('JavaScript Error:', error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            const error = {
                message: event.reason?.message || 'Unhandled Promise Rejection',
                timestamp: Date.now(),
                type: 'promise'
            };
            
            performanceData.errors.push(error);
            console.error('Promise Rejection:', error);
        });
    }

    /**
     * Generate performance report
     */
    function generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            vitals: performanceData.vitals,
            navigation: performanceData.navigation,
            resourceCount: performanceData.resources.length,
            errorCount: performanceData.errors.length,
            recommendations: []
        };

        // Add recommendations based on metrics
        if (performanceData.vitals.lcp > THRESHOLDS.GOOD.lcp) {
            report.recommendations.push('Optimize images and critical resources to improve LCP');
        }
        
        if (performanceData.vitals.fid > THRESHOLDS.GOOD.fid) {
            report.recommendations.push('Reduce JavaScript execution time to improve FID');
        }
        
        if (performanceData.vitals.cls > THRESHOLDS.GOOD.cls) {
            report.recommendations.push('Set image dimensions and avoid layout shifts to improve CLS');
        }
        
        if (performanceData.navigation.ttfb > THRESHOLDS.GOOD.ttfb) {
            report.recommendations.push('Optimize server response time or consider CDN');
        }

        return report;
    }

    /**
     * Display performance summary
     */
    function displaySummary() {
        const report = generateReport();
        
        console.group('📊 Performance Summary');
        console.log('Core Web Vitals:', report.vitals);
        console.log('Navigation Timing:', report.navigation);
        console.log(`Resources Loaded: ${report.resourceCount}`);
        console.log(`Errors: ${report.errorCount}`);
        
        if (report.recommendations.length > 0) {
            console.group('💡 Recommendations');
            report.recommendations.forEach(rec => console.log(`• ${rec}`));
            console.groupEnd();
        }
        
        console.groupEnd();
        
        return report;
    }

    /**
     * Monitor memory usage
     */
    function monitorMemory() {
        if ('memory' in performance) {
            const memory = performance.memory;
            console.log('Memory Usage:', {
                used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
                total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
                limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
            });
            
            // Warn if memory usage is high
            const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
            if (usagePercent > 80) {
                console.warn(`High memory usage: ${usagePercent.toFixed(1)}%`);
            }
        }
    }

    /**
     * Initialize performance monitoring
     */
    function init() {
        console.log('Performance Monitor initialized');
        
        measureCoreWebVitals();
        monitorResources();
        monitorNavigation();
        monitorErrors();
        
        // Display summary after app is fully loaded
        document.addEventListener('appFullyLoaded', () => {
            setTimeout(() => {
                displaySummary();
                monitorMemory();
            }, 1000);
        });
        
        // Periodic memory monitoring
        setInterval(monitorMemory, 30000); // Every 30 seconds
    }

    // Start monitoring
    init();

    // Expose performance data globally
    window.PerformanceMonitor = {
        data: performanceData,
        generateReport: generateReport,
        displaySummary: displaySummary
    };
})();
