/**
 * Nutrition Save Debug
 * 
 * This script adds debugging for the Save Nutrition button functionality.
 */

(function() {

    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Nutrition Save Debug] Initializing...');

        document.addEventListener('click', function(event) {
            if (event.target && event.target.classList.contains('save-nutrition')) {
                console.log('[Nutrition Save Debug] Save Nutrition button clicked');

                const panel = event.target.closest('.detailed-nutrition-panel');
                if (!panel) {
                    console.error('[Nutrition Save Debug] Could not find detailed nutrition panel');
                    return;
                }

                const ingredientItem = panel.closest('.ingredient-item');
                if (!ingredientItem) {
                    console.error('[Nutrition Save Debug] Could not find ingredient item container');
                    return;
                }

                console.log('[Nutrition Save Debug] Input fields in panel:');
                panel.querySelectorAll('input').forEach(input => {
                    console.log(`[Nutrition Save Debug] Input field: ${input.className} = ${input.value}`);
                });

                if (!window.NutritionFieldMapper) {
                    console.error('[Nutrition Save Debug] NutritionFieldMapper not available');
                } else {
                    console.log('[Nutrition Save Debug] NutritionFieldMapper is available');
                }

                setTimeout(() => {
                    if (ingredientItem.dataset.dbFormatNutritionData) {
                        console.log('[Nutrition Save Debug] dbFormatNutritionData dataset property is set:', ingredientItem.dataset.dbFormatNutritionData);
                    } else {
                        console.error('[Nutrition Save Debug] dbFormatNutritionData dataset property is not set');
                    }

                    const hiddenFields = ingredientItem.querySelectorAll('input[type="hidden"]');
                    console.log(`[Nutrition Save Debug] Found ${hiddenFields.length} hidden fields:`);
                    hiddenFields.forEach(field => {
                        console.log(`[Nutrition Save Debug] Hidden field: ${field.className} = ${field.value}`);
                    });
                }, 500);
            }
        });

        document.addEventListener('submit', function(event) {
            if (event.target && event.target.id === 'create-recipe-form') {
                console.log('[Nutrition Save Debug] Recipe form submitted');

                const ingredientItems = event.target.querySelectorAll('.ingredient-item');
                console.log(`[Nutrition Save Debug] Found ${ingredientItems.length} ingredient items`);

                ingredientItems.forEach((item, index) => {
                    console.log(`[Nutrition Save Debug] Checking ingredient item ${index + 1}`);

                    if (item.dataset.dbFormatNutritionData) {
                        console.log(`[Nutrition Save Debug] Ingredient item ${index + 1} has dbFormatNutritionData:`, item.dataset.dbFormatNutritionData);
                    } else {
                        console.warn(`[Nutrition Save Debug] Ingredient item ${index + 1} does not have dbFormatNutritionData`);
                    }

                    const hiddenFields = item.querySelectorAll('input[type="hidden"]');
                    console.log(`[Nutrition Save Debug] Ingredient item ${index + 1} has ${hiddenFields.length} hidden fields`);
                });
            }
        });
        
        console.log('[Nutrition Save Debug] Initialized');
    });
})();
