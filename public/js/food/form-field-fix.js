/**
 * Form Field Fix
 * This script adds proper ID and name attributes to all form fields
 * to fix accessibility issues and reduce console warnings
 */

(function() {
    // Set to true to enable detailed logging, false for minimal logging
    const DEBUG = false;

    // Only log if debug mode is enabled
    function debugLog(...args) {
        if (DEBUG) {
            console.log(...args);
        }
    }

    // Always log important messages
    function log(...args) {
        console.log(...args);
    }

    // log('Form Field Fix script loaded');

    // Keep track of fields we've already fixed to avoid redundant work
    const fixedFields = new WeakSet();

    // Function to add ID and name attributes to form fields
    function fixFormFields() {
        debugLog('Checking form fields...');

        // Counter for generating unique IDs
        let fieldCounter = 0;
        let fixedCounter = 0;

        // Find all form fields without ID or name attributes
        const formFields = document.querySelectorAll('input, select, textarea');

        debugLog(`Found ${formFields.length} form fields to check`);

        formFields.forEach(field => {
            // Skip fields we've already processed
            if (fixedFields.has(field)) {
                return;
            }

            // Skip fields that already have both ID and name
            if (field.id && field.name) {
                fixedFields.add(field); // Mark as processed
                return;
            }

            // Generate a base name from the field's class or type
            let baseName = '';

            if (field.className) {
                // Try to extract a meaningful name from the class
                const classes = field.className.split(' ');
                for (const cls of classes) {
                    if (cls.includes('ingredient-') ||
                        cls.includes('nutrition-') ||
                        cls.includes('recipe-') ||
                        cls.includes('form-') ||
                        cls.includes('-input')) {
                        baseName = cls;
                        break;
                    }
                }
            }

            // If no suitable class found, use the field type
            if (!baseName) {
                baseName = `${field.type || 'field'}-input`;
            }

            // Generate a unique ID if needed
            if (!field.id) {
                fieldCounter++;
                field.id = `${baseName}-${fieldCounter}`;
                fixedCounter++;
                debugLog(`Added ID "${field.id}" to field`);
            }

            // Generate a name if needed
            if (!field.name) {
                // Use the ID as the name, but remove any counter suffix
                field.name = field.id.replace(/-\d+$/, '');
                fixedCounter++;
                debugLog(`Added name "${field.name}" to field with ID "${field.id}"`);
            }

            // Mark this field as processed
            fixedFields.add(field);
        });

        // Only log if we actually fixed something
        if (fixedCounter > 0) {
            log(`Fixed ${fixedCounter} attributes on form fields`);
        }

        return fixedCounter;
    }

    // Track when the last fix was performed to avoid too frequent checks
    let lastFixTime = 0;
    const MIN_FIX_INTERVAL = 1000; // Minimum 1 second between fixes

    // Throttled version of fixFormFields
    function throttledFixFormFields() {
        const now = Date.now();
        if (now - lastFixTime < MIN_FIX_INTERVAL) {
            return;
        }

        lastFixTime = now;
        fixFormFields();
    }

    // Fix form fields when the DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Initial fix
        setTimeout(fixFormFields, 500);

        // Fix again after a delay to catch dynamically added fields
        setTimeout(fixFormFields, 1500);

        // Create a MutationObserver to watch for changes to the DOM
        const observer = new MutationObserver(function(mutations) {
            let shouldFix = false;

            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length > 0) {
                    // Check if any of the added nodes are form fields or contain form fields
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // Element node
                            if ((node.tagName === 'INPUT' || node.tagName === 'SELECT' || node.tagName === 'TEXTAREA') ||
                                (node.querySelector && node.querySelector('input, select, textarea'))) {
                                shouldFix = true;
                            }
                        }
                    });
                }
            });

            if (shouldFix) {
                debugLog('DOM changed, checking form fields');
                setTimeout(throttledFixFormFields, 100);
            }
        });

        // Start observing the document with the configured parameters
        observer.observe(document.body, { childList: true, subtree: true });

        // Fix form fields periodically to ensure all are fixed, but less frequently
        setInterval(throttledFixFormFields, 10000);
    });
})();
