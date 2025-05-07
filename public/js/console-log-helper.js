/**
 * Console Log Helper
 * 
 * This script helps developers use the console log suppressor effectively by providing
 * standardized logging functions and prefixes.
 */

(function() {
    // Check if console log suppressor is loaded
    if (!window.consoleLogReducer) {
        console.warn('[Console Log Helper] Console Log Suppressor not detected. Helper functions will still work but logs won\'t be suppressed.');
    }

    // Create a namespace for our helper
    window.logHelper = {
        // Prefixes for different modules
        prefixes: {
            // Recipe related
            recipe: '[Recipe]',
            recipeIngredient: '[Recipe Ingredient]',
            recipeAdjust: '[Recipe Adjust]',
            recipeView: '[Recipe View]',
            recipeEdit: '[Recipe Edit]',
            recipeTable: '[Recipe Table]',
            
            // Nutrition related
            nutrition: '[Nutrition]',
            nutritionField: '[Nutrition Field]',
            nutritionSave: '[Nutrition Save]',
            nutritionParse: '[Nutrition Parse]',
            packageAmount: '[Package Amount]',
            
            // Cronometer related
            cronometer: '[Cronometer]',
            cronometerParser: '[Cronometer Parser]',
            cronometerData: '[Cronometer Data]',
            
            // Form related
            form: '[Form]',
            formSubmission: '[Form Submission]',
            formValidation: '[Form Validation]',
            
            // UI related
            ui: '[UI]',
            uiComponent: '[UI Component]',
            darkTheme: '[Dark Theme]',
            layout: '[Layout]',
            modal: '[Modal]',
            button: '[Button]',
            input: '[Input]',
            table: '[Table]',
            navigation: '[Navigation]',
            
            // Generic
            debug: '[Debug]',
            performance: '[Performance]',
            api: '[API]',
            database: '[Database]',
            auth: '[Auth]',
            security: '[Security]',
            error: '[ERROR]',
            critical: '[CRITICAL]',
            important: '[IMPORTANT]'
        },
        
        // Logging functions with prefixes
        log: function(prefix, message, ...args) {
            console.log(`${prefix} ${message}`, ...args);
        },
        
        info: function(prefix, message, ...args) {
            console.info(`${prefix} ${message}`, ...args);
        },
        
        warn: function(prefix, message, ...args) {
            console.warn(`${prefix} ${message}`, ...args);
        },
        
        error: function(prefix, message, ...args) {
            console.error(`${prefix} ${message}`, ...args);
        },
        
        debug: function(prefix, message, ...args) {
            console.debug(`${prefix} ${message}`, ...args);
        },
        
        // Special logging functions that will never be suppressed
        critical: function(message, ...args) {
            console.error(`${this.prefixes.critical} ${message}`, ...args);
        },
        
        important: function(message, ...args) {
            console.log(`${this.prefixes.important} ${message}`, ...args);
        },
        
        // Performance measurement
        startTimer: function(label) {
            console.time(label);
        },
        
        endTimer: function(label) {
            console.timeEnd(label);
        },
        
        // Create a logger for a specific module
        createLogger: function(moduleName) {
            const prefix = this.prefixes[moduleName] || `[${moduleName}]`;
            
            return {
                log: (message, ...args) => this.log(prefix, message, ...args),
                info: (message, ...args) => this.info(prefix, message, ...args),
                warn: (message, ...args) => this.warn(prefix, message, ...args),
                error: (message, ...args) => this.error(prefix, message, ...args),
                debug: (message, ...args) => this.debug(prefix, message, ...args),
                critical: (message, ...args) => this.critical(message, ...args),
                important: (message, ...args) => this.important(message, ...args)
            };
        }
    };
    
    // Initialize
    console.log('[Console Log Helper] Initialized - standardized logging functions available via window.logHelper');
})();
