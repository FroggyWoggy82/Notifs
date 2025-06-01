/**
 * Debug Form Submission
 * 
 * This script helps debug form submission issues by logging all relevant events and states.
 */

(function() {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Debug Form Submission] Starting debug...');
        
        // Get the form
        const createRecipeForm = document.getElementById('create-recipe-form');
        if (!createRecipeForm) {
            console.error('[Debug Form Submission] Create recipe form not found');
            return;
        }
        
        console.log('[Debug Form Submission] Form found:', createRecipeForm);
        
        // Check for existing event listeners
        const events = getEventListeners ? getEventListeners(createRecipeForm) : 'getEventListeners not available';
        console.log('[Debug Form Submission] Existing event listeners:', events);
        
        // Check for submit button
        const submitButton = createRecipeForm.querySelector('button[type="submit"]');
        console.log('[Debug Form Submission] Submit button found:', submitButton);
        if (submitButton) {
            console.log('[Debug Form Submission] Submit button text:', submitButton.textContent);
            console.log('[Debug Form Submission] Submit button disabled:', submitButton.disabled);
        }
        
        // Add a test click handler to the submit button
        if (submitButton) {
            submitButton.addEventListener('click', function(event) {
                console.log('[Debug Form Submission] Submit button clicked');
                console.log('[Debug Form Submission] Event:', event);
                console.log('[Debug Form Submission] Default prevented:', event.defaultPrevented);
            });
        }
        
        // Add a test submit handler to the form
        createRecipeForm.addEventListener('submit', function(event) {
            console.log('[Debug Form Submission] Form submit event triggered');
            console.log('[Debug Form Submission] Event:', event);
            console.log('[Debug Form Submission] Default prevented:', event.defaultPrevented);
            
            // Check form validity
            const recipeName = document.getElementById('recipeName');
            const ingredientItems = document.querySelectorAll('.ingredient-item');
            
            console.log('[Debug Form Submission] Recipe name:', recipeName ? recipeName.value : 'not found');
            console.log('[Debug Form Submission] Ingredient items count:', ingredientItems.length);
            
            // Don't prevent default - let other handlers run
        });
        
        // Monitor fetch requests
        const originalFetch = window.fetch;
        window.fetch = function(url, options) {
            if (url === '/api/recipes' && options && options.method === 'POST') {
                console.log('[Debug Form Submission] Fetch request to /api/recipes');
                console.log('[Debug Form Submission] Request options:', options);
                try {
                    const body = JSON.parse(options.body);
                    console.log('[Debug Form Submission] Request body parsed:', body);
                } catch (e) {
                    console.log('[Debug Form Submission] Request body (raw):', options.body);
                }
            }
            return originalFetch.apply(this, arguments);
        };
        
        console.log('[Debug Form Submission] Debug initialized');
    });
})();
