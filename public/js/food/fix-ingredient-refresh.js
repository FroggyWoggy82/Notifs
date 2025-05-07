/**
 * Fix for ingredient refresh issues
 * 
 * This script fixes issues with ingredients not showing up in the UI after being added
 */

(function() {
    console.log('[Ingredient Refresh Fix] Initializing...');

    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Ingredient Refresh Fix] DOM loaded, applying fixes');

        const originalFetchAndDisplayIngredients = window.fetchAndDisplayIngredients;
        
        if (typeof originalFetchAndDisplayIngredients !== 'function') {
            console.error('[Ingredient Refresh Fix] Original fetchAndDisplayIngredients function not found');
            return;
        }

        window.fetchAndDisplayIngredients = function(recipeId, detailsDiv, viewButton, forceRefresh = false) {
            console.log(`[Ingredient Refresh Fix] Called fetchAndDisplayIngredients with forceRefresh=${forceRefresh}`);

            if (forceRefresh) {
                console.log('[Ingredient Refresh Fix] Force refresh detected, ensuring proper refresh');

                if (detailsDiv) {
                    detailsDiv.dataset.forceRefresh = 'true';

                    detailsDiv.innerHTML = '<p>Loading ingredients...</p>';
                    detailsDiv.style.display = 'block';
                }
            }

            return originalFetchAndDisplayIngredients(recipeId, detailsDiv, viewButton, forceRefresh);
        };

        const originalHandleAddIngredientSubmit = window.handleAddIngredientSubmit;
        
        if (typeof originalHandleAddIngredientSubmit !== 'function') {
            console.error('[Ingredient Refresh Fix] Original handleAddIngredientSubmit function not found');
            return;
        }

        window.handleAddIngredientSubmit = async function(event) {
            console.log('[Ingredient Refresh Fix] Called handleAddIngredientSubmit');

            const result = await originalHandleAddIngredientSubmit(event);

            console.log('[Ingredient Refresh Fix] handleAddIngredientSubmit completed, forcing refresh');

            const form = event.target;
            const recipeIdInput = form.querySelector('#add-ingredient-recipe-id');
            
            if (recipeIdInput && recipeIdInput.value) {
                const recipeId = recipeIdInput.value;
                console.log(`[Ingredient Refresh Fix] Found recipe ID: ${recipeId}, forcing refresh`);

                const recipeCard = document.querySelector(`.recipe-card[data-id="${recipeId}"]`);
                
                if (recipeCard) {
                    const detailsDiv = recipeCard.querySelector('.ingredient-details');
                    
                    if (detailsDiv) {

                        console.log('[Ingredient Refresh Fix] Found details div, forcing refresh');

                        setTimeout(() => {

                            detailsDiv.style.display = 'none';

                            setTimeout(() => {
                                console.log('[Ingredient Refresh Fix] Performing forced refresh of ingredient details');
                                window.fetchAndDisplayIngredients(recipeId, detailsDiv, null, true);
                            }, 300);
                        }, 1000);
                    }
                }
            }
            
            return result;
        };
        
        console.log('[Ingredient Refresh Fix] Fixes applied successfully');
    });
})();
