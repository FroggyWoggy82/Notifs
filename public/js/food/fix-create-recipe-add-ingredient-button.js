/**
 * Fix Create Recipe Add Ingredient Button
 * Ensures the Add Ingredient button in the Create New Recipe section works properly
 */

(function() {
    console.log('[Fix Create Recipe Add Ingredient] Initializing');

    // Function to fix the Add Ingredient button in the Create New Recipe section
    function fixCreateRecipeAddIngredientButton() {
        // Find the Add Ingredient button in the Create New Recipe section
        const addButton = document.querySelector('#recipe-creation-section .add-ingredient-btn-inline');
        
        if (addButton && !addButton.dataset.createRecipeFixed) {
            console.log('[Fix Create Recipe Add Ingredient] Found Add Ingredient button, fixing...');
            
            // Mark as fixed to avoid duplicate event listeners
            addButton.dataset.createRecipeFixed = 'true';
            
            // Remove existing event listeners by cloning the button
            const newButton = addButton.cloneNode(true);
            addButton.parentNode.replaceChild(newButton, addButton);
            
            // Add the correct event listener
            newButton.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();

                console.log('[Fix Create Recipe Add Ingredient] Button clicked - adding new ingredient row');

                // Call the addNewIngredientRow function if available
                if (typeof window.addNewIngredientRow === 'function') {
                    try {
                        window.addNewIngredientRow();
                        console.log('[Fix Create Recipe Add Ingredient] Successfully added new ingredient row');
                    } catch (error) {
                        console.error('[Fix Create Recipe Add Ingredient] Error calling addNewIngredientRow:', error);
                    }
                } else {
                    console.error('[Fix Create Recipe Add Ingredient] addNewIngredientRow function not available');

                    // Fallback: try to manually create a new ingredient row
                    const ingredientsList = document.getElementById('ingredients-list');
                    if (ingredientsList && typeof window.createRedesignedIngredientRowHtml === 'function') {
                        try {
                            const ingredientItem = document.createElement('div');
                            ingredientItem.innerHTML = window.createRedesignedIngredientRowHtml();
                            ingredientsList.appendChild(ingredientItem.firstElementChild);
                            console.log('[Fix Create Recipe Add Ingredient] Used fallback method to add ingredient row');
                        } catch (error) {
                            console.error('[Fix Create Recipe Add Ingredient] Error in fallback method:', error);
                        }
                    } else {
                        console.error('[Fix Create Recipe Add Ingredient] No fallback method available');
                    }
                }
            });
            
            console.log('[Fix Create Recipe Add Ingredient] Successfully attached event handler');
            return true;
        } else if (addButton && addButton.dataset.createRecipeFixed) {
            console.log('[Fix Create Recipe Add Ingredient] Button already fixed');
            return true;
        } else {
            console.log('[Fix Create Recipe Add Ingredient] Add Ingredient button not found');
            return false;
        }
    }

    // Initialize when DOM is ready
    function initialize() {
        // Wait for the redesigned ingredient form script to load
        function waitForFunctions() {
            if (typeof window.addNewIngredientRow === 'function') {
                console.log('[Fix Create Recipe Add Ingredient] Functions available, fixing button');
                fixCreateRecipeAddIngredientButton();
            } else {
                console.log('[Fix Create Recipe Add Ingredient] Waiting for functions to load...');
                setTimeout(waitForFunctions, 100);
            }
        }

        // Start waiting for functions
        waitForFunctions();

        // Also try after longer delays as backup
        setTimeout(() => {
            fixCreateRecipeAddIngredientButton();
        }, 1000);

        setTimeout(() => {
            fixCreateRecipeAddIngredientButton();
        }, 3000);

        setTimeout(() => {
            fixCreateRecipeAddIngredientButton();
        }, 5000);
    }

    // Additional aggressive fix function that runs multiple times
    function aggressiveFix() {
        const intervals = [500, 1000, 2000, 3000, 5000, 7000, 10000];

        intervals.forEach(delay => {
            setTimeout(() => {
                const addButton = document.querySelector('.add-ingredient-btn-inline');
                if (addButton && typeof window.addNewIngredientRow === 'function') {
                    // Force fix the button regardless of previous fixes
                    const newButton = addButton.cloneNode(true);
                    addButton.parentNode.replaceChild(newButton, addButton);

                    newButton.addEventListener('click', function(event) {
                        event.preventDefault();
                        event.stopPropagation();

                        console.log('[Fix Create Recipe Add Ingredient] Aggressive fix - Button clicked');

                        if (typeof window.addNewIngredientRow === 'function') {
                            try {
                                window.addNewIngredientRow();
                                console.log('[Fix Create Recipe Add Ingredient] Aggressive fix - Successfully added ingredient');
                            } catch (error) {
                                console.error('[Fix Create Recipe Add Ingredient] Aggressive fix - Error:', error);
                            }
                        }
                    });

                    console.log(`[Fix Create Recipe Add Ingredient] Aggressive fix applied at ${delay}ms`);
                }
            }, delay);
        });
    }

    // Run when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initialize();
            aggressiveFix();
        });
    } else {
        initialize();
        aggressiveFix();
    }

    // Also run when window loads (as a backup)
    window.addEventListener('load', function() {
        initialize();
        aggressiveFix();
    });

    // Watch for DOM changes in case the button is added dynamically
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                // Check if any new nodes contain the Add Ingredient button
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const addButton = node.querySelector && node.querySelector('.add-ingredient-btn-inline');
                        if (addButton || node.classList.contains('add-ingredient-btn-inline')) {
                            setTimeout(fixCreateRecipeAddIngredientButton, 100);
                        }
                    }
                });
            }
        });
    });

    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    console.log('[Fix Create Recipe Add Ingredient] Initialization complete');
})();
