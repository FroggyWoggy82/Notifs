/**
 * Prevent Duplicate Form Submission
 *
 * This script ensures that only one form submission handler is active for the recipe form.
 * It prevents duplicate submissions by removing any additional event handlers.
 */

(function() {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Prevent Duplicate Form Submission] Initializing...');

        // Check if form-submission-debug.js is loaded and disable it
        if (window.formSubmissionOverrideInitialized) {
            console.log('[Prevent Duplicate Form Submission] Detected form-submission-debug.js, disabling it');
            window.formSubmissionOverrideInitialized = false;
        }

        // Check if simple-form-handler.js is loaded and disable it
        if (window.simpleFormHandlerInitialized) {
            console.log('[Prevent Duplicate Form Submission] Detected simple-form-handler.js, disabling it');
            window.simpleFormHandlerInitialized = false;
        }

        // Ensure only one submit handler exists
        const createRecipeForm = document.getElementById('create-recipe-form');
        if (!createRecipeForm) {
            console.error('[Prevent Duplicate Form Submission] Create recipe form not found');
            return;
        }

        // Set a global flag to indicate that we're handling form submission
        window.recipeFormSubmissionHandled = true;

        // Add a more robust duplicate submission prevention
        if (!window.recipeSubmissionInProgress) {
            window.recipeSubmissionInProgress = false;
        }

        // Add a safety check to prevent any other scripts from adding form handlers
        // This is a last resort if other prevention methods fail
        const originalAddEventListener = createRecipeForm.addEventListener;
        createRecipeForm.addEventListener = function(type, listener, options) {
            if (type === 'submit' && window.recipeFormSubmissionHandled) {
                console.log('[Prevent Duplicate Form Submission] Blocked attempt to add another submit handler');
                return;
            }
            originalAddEventListener.call(this, type, listener, options);
        };

        console.log('[Prevent Duplicate Form Submission] Initialized');
    });
})();
