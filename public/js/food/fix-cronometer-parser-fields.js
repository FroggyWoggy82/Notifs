/**
 * Fix for Cronometer Parser Fields
 *
 * This script enhances the Cronometer text parser to better handle form fields
 * when adding ingredients to recipes.
 */

(function() {
    console.log('[Fix Cronometer Parser Fields] Initializing...');

    // Wait for the document to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        initFix();
    });

    // Also initialize immediately in case the DOM is already loaded
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initFix();
    }

    function initFix() {
        console.log('[Fix Cronometer Parser Fields] Setting up fix...');

        // Add additional selectors for specific fields that might be problematic
        document.addEventListener('click', function(event) {
            if (event.target && event.target.classList.contains('cronometer-parse-button')) {
                console.log('[Fix Cronometer Parser Fields] Parse button clicked, adding event listener');

                // Get the ingredient item
                const ingredientItem = event.target.closest('.ingredient-item') ||
                                      event.target.closest('form') ||
                                      document.getElementById('add-ingredient-form');

                if (ingredientItem) {
                    // Don't automatically open the detailed nutrition panel
                    // Let the user manually open it using the toggle button if they want to see details

                    // Add a class to the ingredient item to mark it as being processed
                    ingredientItem.classList.add('cronometer-parsing');

                    // Add a one-time event listener to check if fields were updated
                    setTimeout(() => {
                        console.log('[Fix Cronometer Parser Fields] Checking if fields were updated');

                        // Check if basic fields were updated
                        const basicFields = [
                            '.ingredient-calories', '.nutrition-energy', '#add-ingredient-calories', '#edit-ingredient-calories',
                            '.ingredient-protein', '.nutrition-protein', '#add-ingredient-protein', '#edit-ingredient-protein',
                            '.ingredient-fat', '.nutrition-fat', '#add-ingredient-fats', '#edit-ingredient-fats',
                            '.ingredient-carbs', '.nutrition-carbs', '#add-ingredient-carbs', '#edit-ingredient-carbs'
                        ];

                        let anyFieldUpdated = false;

                        for (const selector of basicFields) {
                            const field = ingredientItem.querySelector(selector);
                            if (field && field.classList.contains('cronometer-parsed')) {
                                anyFieldUpdated = true;
                                break;
                            }
                        }

                        if (!anyFieldUpdated) {
                            console.log('[Fix Cronometer Parser Fields] No fields were updated, trying to force update');

                            // Try to get the text from the paste area
                            const textPasteArea = ingredientItem.querySelector('.cronometer-text-paste-area');
                            const statusElement = ingredientItem.querySelector('.cronometer-parse-status');

                            if (textPasteArea && statusElement) {
                                const text = textPasteArea.value.trim();
                                if (text) {
                                    console.log('[Fix Cronometer Parser Fields] Forcing reparse of text');

                                    // Force a reparse
                                    if (window.processCronometerText) {
                                        window.processCronometerText(text, ingredientItem, statusElement);
                                    }
                                }
                            }
                        }

                        // Remove the processing class
                        ingredientItem.classList.remove('cronometer-parsing');
                    }, 500);
                }
            }
        }, true);

        console.log('[Fix Cronometer Parser Fields] Fix applied successfully');
    }
})();
