/**
 * Script Loader - Optimized JavaScript Loading for Performance
 * Loads scripts asynchronously and in the correct order for faster startup
 */

(function() {
    'use strict';

    // Critical scripts that must load first (css-loader and resource-preloader already loaded synchronously)
    const criticalScripts = [
        // immediate-notification-fix.js is loaded synchronously in HTML
        // css-loader.js and resource-preloader.js are loaded synchronously in HTML
    ];

    // Core functionality scripts (load after critical)
    const coreScripts = [
        '/js/pwa-optimizer.js',
        '/js/notification-system.js',
        '/js/modal-system.js',
        '/js/form-improvements.js'
    ];

    // Feature scripts (load after core)
    const featureScripts = [
        '/js/common/sidebar.js',
        '/js/common/status-bar.js',
        '/js/common/bottom-nav-fix.js',
        '/js/common/bottom-nav-center-fix.js',
        '/js/notification-permission-check.js',
        '/js/dashboard-stats.js'
    ];

    // Task functionality scripts (load after features)
    const taskScripts = [
        '/js/tasks/script.js',
        '/js/tasks/recurring-task-helper.js',
        '/js/tasks/edit-modal-fix.js',
        '/js/tasks/add-task-modal-fix.js',
        '/js/tasks/subtasks-support.js',
        '/js/tasks/checkbox-redesign.js',
        '/js/tasks/checkbox-click-fix.js'
    ];

    // Habit functionality scripts (load after tasks)
    const habitScripts = [
        '/js/habits/habit-redesign.js',
        '/js/habits/habit-completion-fix.js',
        '/js/habits/habit-modal-fix.js'
    ];

    // Enhancement scripts (load last, non-critical)
    const enhancementScripts = [
        '/js/tasks/task-action-hover-fix.js',
        '/js/tasks/task-icons-fix.js',
        '/js/tasks/date-badge-redesign.js',
        '/js/tasks/overdue-task-highlighter.js',
        '/js/tasks/task-banners-right-alignment.js',
        '/js/standardized-date-indicators.js',
        '/js/dropdown-arrow-toggle.js'
    ];

    // Track loaded scripts
    const loadedScripts = new Set();
    const loadingScripts = new Set();

    /**
     * Load a script asynchronously
     * @param {string} src - Script source
     * @param {Function} onLoad - Callback when loaded
     * @param {Function} onError - Callback on error
     */
    function loadScript(src, onLoad, onError) {
        if (loadedScripts.has(src)) {
            if (onLoad) onLoad();
            return;
        }

        if (loadingScripts.has(src)) {
            // Script is already loading, wait for it
            const checkLoaded = () => {
                if (loadedScripts.has(src)) {
                    if (onLoad) onLoad();
                } else {
                    setTimeout(checkLoaded, 10);
                }
            };
            checkLoaded();
            return;
        }

        loadingScripts.add(src);

        const script = document.createElement('script');
        script.src = src;
        script.async = true;

        script.onload = function() {
            loadedScripts.add(src);
            loadingScripts.delete(src);
            console.log(`Loaded: ${src}`);
            if (onLoad) onLoad();
        };

        script.onerror = function() {
            loadingScripts.delete(src);
            console.error(`Failed to load: ${src}`);
            if (onError) onError();
        };

        document.head.appendChild(script);
    }

    /**
     * Load an array of scripts in parallel
     * @param {Array} scripts - Array of script URLs
     * @param {Function} onComplete - Callback when all scripts are loaded
     */
    function loadScriptsParallel(scripts, onComplete) {
        if (scripts.length === 0) {
            if (onComplete) onComplete();
            return;
        }

        let loadedCount = 0;
        const totalScripts = scripts.length;

        scripts.forEach(function(script) {
            loadScript(script, function() {
                loadedCount++;
                if (loadedCount === totalScripts) {
                    if (onComplete) onComplete();
                }
            }, function() {
                // Continue even if a script fails
                loadedCount++;
                if (loadedCount === totalScripts) {
                    if (onComplete) onComplete();
                }
            });
        });
    }

    /**
     * Load scripts in sequence (one group after another)
     */
    function loadScriptsSequentially() {
        console.log('Starting optimized script loading...');

        // Load core scripts first (critical scripts already loaded synchronously)
        loadScriptsParallel(coreScripts, function() {
            console.log('Core scripts loaded');

            // Load feature scripts
            loadScriptsParallel(featureScripts, function() {
                console.log('Feature scripts loaded');

                // Load task scripts
                loadScriptsParallel(taskScripts, function() {
                    console.log('Task scripts loaded');

                    // Load habit scripts
                    loadScriptsParallel(habitScripts, function() {
                        console.log('Habit scripts loaded');

                        // Load enhancement scripts (non-blocking)
                        if ('requestIdleCallback' in window) {
                            requestIdleCallback(function() {
                                loadScriptsParallel(enhancementScripts, function() {
                                    console.log('All scripts loaded');
                                    document.dispatchEvent(new CustomEvent('scriptsLoaded'));
                                });
                            });
                        } else {
                            setTimeout(function() {
                                loadScriptsParallel(enhancementScripts, function() {
                                    console.log('All scripts loaded');
                                    document.dispatchEvent(new CustomEvent('scriptsLoaded'));
                                });
                            }, 100);
                        }
                    });
                });
            });
        });
    }

    /**
     * Initialize script loading
     */
    function init() {
        // Start loading scripts after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', loadScriptsSequentially);
        } else {
            // DOM is already ready
            loadScriptsSequentially();
        }
    }

    // Start the loading process
    init();

    // Expose script loader globally
    window.ScriptLoader = {
        loadScript: loadScript,
        loadScriptsParallel: loadScriptsParallel,
        loadedScripts: loadedScripts
    };
})();
