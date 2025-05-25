/**
 * CSS Loader - Deferred CSS Loading for Performance
 * Loads non-critical CSS after the initial render
 */

(function() {
    'use strict';

    // List of non-critical CSS files to load after initial render
    const deferredCSS = [
        '/css/main.css'
    ];

    // Function to load CSS asynchronously
    function loadCSS(href, onload) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.media = 'print'; // Load as print media first to avoid blocking
        link.onload = function() {
            this.media = 'all'; // Switch to all media once loaded
            if (onload) onload();
        };
        
        // Fallback for browsers that don't support onload
        link.onerror = function() {
            this.media = 'all';
            if (onload) onload();
        };

        document.head.appendChild(link);
        return link;
    }

    // Function to preload CSS for faster subsequent loads
    function preloadCSS(href) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = href;
        document.head.appendChild(link);
    }

    // Load deferred CSS after initial render
    function loadDeferredCSS() {
        let loadedCount = 0;
        const totalFiles = deferredCSS.length;

        deferredCSS.forEach(function(cssFile) {
            // Preload first for faster loading
            preloadCSS(cssFile);
            
            // Then load the actual stylesheet
            loadCSS(cssFile, function() {
                loadedCount++;
                if (loadedCount === totalFiles) {
                    console.log('All deferred CSS loaded');
                    // Dispatch event when all CSS is loaded
                    document.dispatchEvent(new CustomEvent('deferredCSSLoaded'));
                }
            });
        });
    }

    // Load deferred CSS after DOM is ready and initial render is complete
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // Use requestAnimationFrame to ensure this runs after initial render
            requestAnimationFrame(function() {
                setTimeout(loadDeferredCSS, 0);
            });
        });
    } else {
        // DOM is already ready
        requestAnimationFrame(function() {
            setTimeout(loadDeferredCSS, 0);
        });
    }

    // Expose loadCSS function globally for dynamic loading
    window.loadCSS = loadCSS;
})();
