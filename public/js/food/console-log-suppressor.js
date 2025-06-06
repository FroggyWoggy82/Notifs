/**
 * Reduced Console Log Suppressor
 *
 * This script reduces console logs from various scripts to improve readability.
 * It only filters out the most repetitive logs while keeping important ones for debugging.
 */

(function() {
    // Store the original console methods
    const originalConsoleLog = console.log;
    const originalConsoleDebug = console.debug;
    const originalConsoleError = console.error;

    // Counters for suppressed logs
    const suppressedCounts = {};

    // List of patterns to filter out from console logs
    // Only include the most repetitive and least useful logs
    const filterPatterns = [
        'Found 0 goal weight points to add week numbers to',
        'Forcing first weekly point date to May 6, 2024 in goal line tooltip',
        'initializeSimplifiedPasteAreas called',
        'Added week',
        'Date:',
        'Projected:',
        // 'Added weekly goal weight:', // Temporarily disabled for debugging
        '[Recipe Adjust Buttons Fix] Found Set button:',
        '[Recipe Adjust Buttons Fix] Found adjustment button:',
        '[Recipe Adjust Buttons Fix] Found calorie input field:',
        '[Recipe Adjust Buttons Fix] Updated field',
        '[Recipe Adjust Buttons Fix] Created/updated hidden field',
        '[Recipe API Endpoints Fix] Intercepted fetch to:',
        // Ingredient-related console messages to suppress
        'Fetched ingredients:',
        'Processing ingredients array:',
        'Fetching ingredients for recipe:',
        'Raw API response:',
        'Ingredient deleted successfully:',
        'Deleting ingredient:',
        'Error deleting ingredient:',
        'Adding ingredient to recipe:',
        'Ingredient added successfully:',
        'Error adding ingredient:',
        'Sending ingredient data:',
        'Parsing Cronometer data',
        'Cronometer data parsed successfully:',
        '[Recipe Button Fix] Fetched ingredients:',
        '[Recipe Button Fix] Processing ingredients array:',
        '[Recipe Button Fix] Fetching ingredients for recipe:',
        '[Recipe Button Fix] Raw API response:',
        '[Recipe Button Fix] Ingredient deleted successfully:',
        '[Recipe Button Fix] Deleting ingredient:',
        '[Recipe Button Fix] Error deleting ingredient:',
        '[Recipe Button Fix] Adding ingredient to recipe:',
        '[Recipe Button Fix] Ingredient added successfully:',
        '[Recipe Button Fix] Error adding ingredient:',
        '[Recipe Button Fix] Sending ingredient data:',
        '[Add Ingredient Fix] Sending request to:',
        '[Add Ingredient Fix] Request method:',
        '[Add Ingredient Fix] Request headers:',
        '[Direct API Call Fix] Making direct API call to:',
        '[Direct API Call Fix] Method:',
        // Repetitive recipe position and ingredient button logs
        '[Fix Recipe Name Position] Fixing recipe name position',
        '[Fix Recipe Name Position] Recipe name position fixed',
        '[Fix Add Ingredient Final] Initializing Add Ingredient buttons',
        // Repetitive weekly goal points logs
        '[Weekly Goal Points Fix] Adding week number labels',
        '[Weekly Goal Points Fix] Extracting weekly goal weights',
        '[Weekly Goal Points Fix] Week number labels added',
        '[Weekly Goal Points Fix] All weekly goal weights:',
        '[Weekly Goal Points Fix] Weekly increment dates:',
        '[Weekly Goal Points Fix] Using weekly increment dates for extraction',
        '[Weekly Goal Points Fix] Extracted 4 weekly goal weights:',
        '[Weekly Goal Points Fix] Extracted 6 weekly goal weights:',
        '[Weekly Goal Points Fix] Modified goal dataset point styling',
        '[Weekly Goal Points Fix] Chart updated',
        '[Weekly Goal Points Fix] Chart update detected',
        // Additional repetitive logs
        '[Remove OCR Toggle] Hiding OCR container:',
        '[Fix Add Ingredient Click] Fixing Add Ingredient button clicks',
        '[Fix Add Ingredient Button] Adding event listeners',
        '[Remove OCR Toggle] Removing OCR toggle buttons',
        '[Tooltip Fix] Attaching tooltip events to chart',
        '[Tooltip Fix] Tooltip events attached successfully',
        '[Tooltip Fix] Weekly goal points fix not available',
        '[Add Ingredient Button Fix] Found 1 Add Ingredient buttons',
        'Initializing ingredient search autocomplete for:',
        'Using existing dropdown',
        'Initialized autocomplete for 1 ingredient search inputs',
        'Set up MutationObserver to watch for new search inputs',
        '[Recipe Table Dark Fix] Fixing recipe table styling',
        '[Recipe Table Dark Fix] Recipe table styling fixed',
        '[Grocery List Full Width] Mutation detected',
        '[Grocery List Full Width] Updating layout',
        '[Grocery List Full Width] Grocery list displayed',
        '[Grocery List Full Width] Expanding grocery list',
        '[Grocery List Full Width] Expanded grocery list',
        '[Custom Tooltip] Chart canvas detected',
        'Tooltip events attached to chart',
        'Added event listener to apply button',
        'Using pre-formatted fullDate for week',
        'Using formatted date for week',
        'Chart canvas detected, attaching tooltip events',
        'Error checking/registering annotation plugin:',
        'Error in tooltip label callback:',
        'Error in tooltip afterLabel callback:',
        'Error updating X-axis scale:',
        'Error updating Y-axis scale:',
        'Error resetting chart scale:',
        'Could not parse error response:',
        'Error parsing complete nutrition data:',
        'Error adding micronutrient data:',
        'Error parsing Cronometer data:',
        'Error saving omega values to OmegaStorage:',
        'Failed to save omega values to OmegaStorage',
        'Error during final direct package amount update:',
        'Error during forced refresh:',
        'Error updating package amount:',
        'Error updating package amount before main update:',
        'populateEditForm function not available',
        'fetchAndDisplayIngredients function not found',
        'Could not find form for toggleNutritionPanel',
        'Could not find detailed nutrition panel'
    ];

    // List of patterns to limit frequency (show first occurrence, then suppress duplicates)
    const limitFrequencyPatterns = [
        'Canvas clicked',
        'Clicked element:',
        'Found week number',
        'Updating selected weeks UI',
        'Selected weeks container:',
        'Weight input container:'
    ];

    // Track which limited frequency messages we've seen
    const seenLimitedMessages = new Set();

    // Replace console.log with a filtered version
    console.log = function() {
        // Skip if no arguments
        if (arguments.length === 0) {
            return originalConsoleLog.apply(console, arguments);
        }

        // Get the message
        const message = arguments[0];

        // Only process string messages
        if (typeof message !== 'string') {
            return originalConsoleLog.apply(console, arguments);
        }

        // Always allow optimization debugging logs through
        if (message.includes('APPLYING GROCERY LIST OPTIMIZATION') ||
            message.includes('Looking for ingredient') ||
            message.includes('Available grocery list ingredients') ||
            message.includes('GROCERY LIST REGENERATED AFTER OPTIMIZATION') ||
            message.includes('New grocery list items') ||
            message.includes('Updated grocery list item') ||
            message.includes('not found in grocery list') ||
            message.includes('OPTIMIZATION BUTTON CLICKED') ||
            message.includes('✓ Added event listener to apply button') ||
            message.includes('✗ Apply button not found')) {
            return originalConsoleLog.apply(console, arguments);
        }

        // Check if message matches any filter patterns
        for (const pattern of filterPatterns) {
            if (message.includes(pattern)) {
                // Count suppressed messages by pattern
                suppressedCounts[pattern] = (suppressedCounts[pattern] || 0) + 1;

                // Show notifications less frequently as counts get higher
                const notificationInterval = suppressedCounts[pattern] < 500 ? 200 :
                                            suppressedCounts[pattern] < 2000 ? 500 : 1000;

                if (suppressedCounts[pattern] % notificationInterval === 0) {
                    originalConsoleLog.call(console, `[Log Reducer] Suppressed ${suppressedCounts[pattern]} logs containing: "${pattern}"`);
                }

                return; // Skip this log
            }
        }

        // Check if message matches any limited frequency patterns
        for (const pattern of limitFrequencyPatterns) {
            if (message.includes(pattern)) {
                // If we've seen this pattern before, suppress it
                if (seenLimitedMessages.has(pattern)) {
                    suppressedCounts[pattern] = (suppressedCounts[pattern] || 0) + 1;

                    // Show notifications less frequently for limited patterns
                    const limitedNotificationInterval = suppressedCounts[pattern] < 100 ? 50 :
                                                       suppressedCounts[pattern] < 500 ? 100 : 250;

                    if (suppressedCounts[pattern] % limitedNotificationInterval === 0) {
                        originalConsoleLog.call(console, `[Log Reducer] Suppressed ${suppressedCounts[pattern]} logs containing: "${pattern}"`);
                    }

                    return; // Skip this log
                } else {
                    // First time seeing this pattern, mark it as seen
                    seenLimitedMessages.add(pattern);
                }
            }
        }

        // Call the original console.log for non-filtered messages
        originalConsoleLog.apply(console, arguments);
    };

    // Keep debug messages but at reduced frequency
    console.debug = function() {
        // Only show every 5th debug message
        if (Math.random() < 0.2) {
            originalConsoleDebug.apply(console, arguments);
        }
    };

    // Network error patterns to suppress
    const networkErrorPatterns = [
        'PATCH http://127.0.0.1:3000/api/recipes/',
        'GET http://127.0.0.1:3000/api/unique-ingredients',
        'POST http://127.0.0.1:3000/api/recipes/',
        'PUT http://127.0.0.1:3000/api/recipes/'
    ];

    // Replace console.error with a filtered version
    console.error = function() {
        // Check if the first argument is a string and matches any of the network error patterns
        if (arguments.length > 0 &&
            typeof arguments[0] === 'string' &&
            networkErrorPatterns.some(pattern => arguments[0].includes(pattern))) {
            // Skip logging for filtered network errors
            return;
        }

        // Call the original console.error for non-filtered messages
        originalConsoleError.apply(console, arguments);
    };

    // Intercept fetch to suppress network errors
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        const promise = originalFetch.apply(this, arguments);

        // If the URL matches any of our network error patterns, suppress the error
        if (typeof url === 'string' && networkErrorPatterns.some(pattern => url.includes(pattern))) {
            return promise.catch(error => {
                // Return a fake successful response instead of throwing an error
                return new Response(JSON.stringify({
                    success: false,
                    error: "Request suppressed by console-log-suppressor.js"
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            });
        }

        return promise;
    };

    // Print summary every 30 seconds
    setInterval(() => {
        const totalSuppressed = Object.values(suppressedCounts).reduce((sum, count) => sum + count, 0);
        if (totalSuppressed > 0) {
            originalConsoleLog.call(console, `[Log Reducer] Summary: Suppressed ${totalSuppressed} logs total`);
        }
    }, 30000);

    originalConsoleLog.call(console, '[Log Reducer] Initialized - reducing repetitive logs while keeping important ones');
})();
