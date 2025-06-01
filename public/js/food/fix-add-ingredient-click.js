/**
 * Fix Add Ingredient Click
 * Ensures the Add Ingredient button works correctly by directly attaching click handlers
 */

(function() {
    // DISABLED - This script is now handled by unified-add-ingredient-handler.js
    console.log('[Fix Add Ingredient Click] Script disabled to prevent duplicate modals');
    return;

    console.log('[Fix Add Ingredient Click] Initializing');

    function fixAddIngredientClick() {
        console.log('[Fix Add Ingredient Click] Fixing Add Ingredient button clicks');

        // Find all Add Ingredient buttons
        const addButtons = document.querySelectorAll('.add-ingredient-to-recipe-btn');
        addButtons.forEach(button => {
            console.log('[Fix Add Ingredient Click] Found Add Ingredient button:', button);
            
            // Remove existing event listeners
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add new event listener
            newButton.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                
                // Find the recipe ID
                const recipeCard = this.closest('.recipe-card');
                if (!recipeCard) {
                    console.error('[Fix Add Ingredient Click] Could not find recipe card');
                    return;
                }
                
                const recipeId = recipeCard.dataset.id;
                if (!recipeId) {
                    console.error('[Fix Add Ingredient Click] Recipe ID not found');
                    return;
                }
                
                // Find the container
                const container = recipeCard.querySelector('.ingredient-details');
                if (!container) {
                    console.error('[Fix Add Ingredient Click] Could not find ingredient details container');
                    return;
                }
                
                // Show the add ingredient form
                if (typeof window.showAddIngredientForm === 'function') {
                    window.showAddIngredientForm(recipeId, container);
                } else {
                    console.error('[Fix Add Ingredient Click] showAddIngredientForm function not available');
                }
            });
        });

        // Find all Edit buttons
        const editButtons = document.querySelectorAll('.edit-ingredient-btn');
        editButtons.forEach(button => {
            console.log('[Fix Add Ingredient Click] Found Edit button:', button);
            
            // Remove existing event listeners
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add new event listener
            newButton.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                
                // Find the ingredient ID and recipe ID
                const row = this.closest('tr');
                if (!row) {
                    console.error('[Fix Add Ingredient Click] Could not find row');
                    return;
                }
                
                const ingredientId = row.dataset.ingredientId;
                const recipeId = row.dataset.recipeId;
                
                if (!ingredientId || !recipeId) {
                    console.error('[Fix Add Ingredient Click] Ingredient ID or Recipe ID not found');
                    return;
                }
                
                // Find the container
                const container = row.closest('.ingredient-details');
                if (!container) {
                    console.error('[Fix Add Ingredient Click] Could not find ingredient details container');
                    return;
                }
                
                // Show the edit ingredient form
                if (typeof window.showEditIngredientForm === 'function') {
                    window.showEditIngredientForm(recipeId, ingredientId, container);
                } else {
                    console.error('[Fix Add Ingredient Click] showEditIngredientForm function not available');
                }
            });
        });
    }

    // Initialize when the DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(fixAddIngredientClick, 500);
        });
    } else {
        setTimeout(fixAddIngredientClick, 500);
    }

    // Set up a mutation observer to watch for new buttons
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(fixAddIngredientClick, 500);
            }
        });
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    console.log('[Fix Add Ingredient Click] Initialized');
})();
