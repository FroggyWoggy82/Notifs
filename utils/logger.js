/**
 * Simple logger module
 * Provides logging functionality with different log levels
 */

const logger = {
    info: function(message, ...args) {
        console.log(`[INFO] ${message}`, ...args);
    },
    
    warn: function(message, ...args) {
        console.warn(`[WARN] ${message}`, ...args);
    },
    
    error: function(message, ...args) {
        console.error(`[ERROR] ${message}`, ...args);
    },
    
    debug: function(message, ...args) {
        console.debug(`[DEBUG] ${message}`, ...args);
    }
};

module.exports = logger;
