/**
 * Compact Recipe Cards
 * 
 * This script adds additional styling to make recipe cards more compact
 * by removing multi-layered backgrounds and reducing vertical space.
 */

(function() {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Compact Recipe Cards] Initializing...');
        
        // Add custom CSS to make recipe cards more compact
        const style = document.createElement('style');
        style.textContent = `
            /* More compact recipe cards */
            .recipe-card {
                margin-bottom: 3px !important;
                box-shadow: none !important;
            }
            
            /* Remove multi-layered background */
            .recipe-card-header {
                background: none !important;
                padding: 5px 8px !important;
            }
            
            /* Adjust spacing in recipe card body */
            .recipe-card-body {
                padding: 6px 8px !important;
            }
            
            /* Make calories display more compact */
            .recipe-card-calories {
                background: none !important;
                border: none !important;
                padding: 0 !important;
            }
            
            /* Reduce spacing between recipe cards */
            #recipe-list {
                gap: 3px !important;
            }
            
            /* Make ingredient details more compact */
            .ingredient-details {
                margin-top: 3px !important;
            }
            
            /* Reduce spacing in the responsive table container */
            .responsive-table-container {
                margin-bottom: 3px !important;
            }
            
            /* Adjust calorie adjustment section spacing */
            .calorie-adjustment-compact {
                margin-top: 4px !important;
                gap: 4px !important;
            }
        `;
        
        document.head.appendChild(style);
        
        // Function to observe and adjust recipe cards when they're added to the DOM
        function observeRecipeCards() {
            const recipeListContainer = document.getElementById('recipe-list');
            if (!recipeListContainer) return;
            
            // Create a mutation observer to watch for new recipe cards
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        // Process any newly added recipe cards
                        mutation.addedNodes.forEach(function(node) {
                            if (node.classList && node.classList.contains('recipe-card')) {
                                // Apply additional compact styling to new recipe cards
                                node.style.marginBottom = '3px';
                            }
                        });
                    }
                });
            });
            
            // Start observing the recipe list container
            observer.observe(recipeListContainer, { childList: true, subtree: true });
        }
        
        // Call the function to start observing recipe cards
        observeRecipeCards();
        
        console.log('[Compact Recipe Cards] Initialized');
    });
})();
