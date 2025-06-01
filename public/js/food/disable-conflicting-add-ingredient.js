/**
 * Disable Conflicting Add Ingredient Scripts
 * This script disables any remaining conflicting Add Ingredient functionality
 * to ensure only the unified handler works
 */

(function() {
    'use strict';

    console.log('[Disable Conflicting Add Ingredient] Loading...');

    // Override any existing showAddIngredientForm functions
    window.showAddIngredientForm = function() {
        console.log('[Disable Conflicting Add Ingredient] showAddIngredientForm called but disabled');
        return;
    };

    // Override any existing addIngredientRow functions
    if (window.addIngredientRow) {
        window.addIngredientRow = function() {
            console.log('[Disable Conflicting Add Ingredient] addIngredientRow called but disabled');
            return;
        };
    }

    // Remove any existing event listeners on Add Ingredient buttons
    function removeConflictingEventListeners() {
        const addButtons = document.querySelectorAll('.add-ingredient-btn-inline, .add-ingredient-btn, [class*="add-ingredient"]');
        
        addButtons.forEach(button => {
            if (button.textContent.includes('Add Ingredient') || button.textContent.includes('➕')) {
                // Clone and replace to remove all event listeners
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                // console.log('[Disable Conflicting Add Ingredient] Removed event listeners from button:', newButton.textContent.trim());
            }
        });
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', removeConflictingEventListeners);
    } else {
        removeConflictingEventListeners();
    }

    // Also run after a delay to catch any late-loading buttons
    setTimeout(removeConflictingEventListeners, 1000);
    setTimeout(removeConflictingEventListeners, 2000);

    console.log('[Disable Conflicting Add Ingredient] Initialized');
})();
