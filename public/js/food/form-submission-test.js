/**
 * Form Submission Test
 * 
 * This script tests the form submission process to ensure that only one submission is made.
 */

(function() {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Form Submission Test] Initializing...');
        
        // Get the form
        const createRecipeForm = document.getElementById('create-recipe-form');
        if (!createRecipeForm) {
            console.error('[Form Submission Test] Create recipe form not found');
            return;
        }
        
        // Add a test event listener to log form submissions
        const originalSubmit = createRecipeForm.submit;
        createRecipeForm.submit = function() {
            console.log('[Form Submission Test] Form.submit() called');
            originalSubmit.apply(this, arguments);
        };
        
        // Add a test event listener to log fetch requests
        const originalFetch = window.fetch;
        window.fetch = function(url, options) {
            if (url === '/api/recipes' && options && options.method === 'POST') {
                console.log('[Form Submission Test] POST request to /api/recipes detected');
                console.log('[Form Submission Test] Request body:', options.body);
            }
            return originalFetch.apply(this, arguments);
        };
        
        console.log('[Form Submission Test] Initialized');
    });
})();
