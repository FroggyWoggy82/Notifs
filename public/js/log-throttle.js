/**
 * Log Throttle
 * Reduces log spam by throttling repeated log messages
 */

(function() {
    // Store for throttled logs
    const logStore = {};
    
    // Original console methods
    const originalLog = console.log;
    const originalInfo = console.info;
    const originalWarn = console.warn;
    const originalError = console.error;
    
    // Throttle time in milliseconds
    const throttleTime = 2000; // Only log once per 2 seconds for the same message
    
    // Throttle function
    function throttleLog(originalFn, level) {
        return function(...args) {
            // Skip throttling for empty messages or non-string first arguments
            if (!args.length || typeof args[0] !== 'string') {
                return originalFn.apply(console, args);
            }
            
            // Get the message
            const message = args[0];
            
            // Skip throttling for messages that don't contain certain keywords
            const throttleKeywords = [
                'Fix Add Ingredient Button',
                'Remove OCR Toggle',
                'Fix Add Ingredient Click',
                'Remove Recipe Header Line',
                'Force Remove Recipe Header Line',
                'Adding event listeners',
                'Removing OCR toggle buttons',
                'Fixing Add Ingredient',
                'Removing header line'
            ];
            
            // Check if the message contains any of the throttle keywords
            const shouldThrottle = throttleKeywords.some(keyword => message.includes(keyword));
            
            // If the message doesn't need throttling, log it normally
            if (!shouldThrottle) {
                return originalFn.apply(console, args);
            }
            
            // Create a key for the log store
            const key = `${level}:${message}`;
            
            // Get the current time
            const now = Date.now();
            
            // Check if the message has been logged recently
            if (logStore[key] && now - logStore[key] < throttleTime) {
                // Skip logging
                return;
            }
            
            // Update the log store
            logStore[key] = now;
            
            // Log the message
            return originalFn.apply(console, args);
        };
    }
    
    // Override console methods with throttled versions
    console.log = throttleLog(originalLog, 'log');
    console.info = throttleLog(originalInfo, 'info');
    console.warn = throttleLog(originalWarn, 'warn');
    console.error = throttleLog(originalError, 'error');
    
    // Clean up old entries from the log store periodically
    setInterval(() => {
        const now = Date.now();
        for (const key in logStore) {
            if (now - logStore[key] > throttleTime * 2) {
                delete logStore[key];
            }
        }
    }, throttleTime * 10);
    
    // Log that the throttle is active
    originalLog('[Log Throttle] Initialized - reducing log spam');
})();
