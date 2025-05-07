/**
 * Detailed Nutrition Integration
 * 
 * This script integrates the detailed nutrition view into the recipe ingredient table.
 * It modifies the renderIngredientDetails function to include the detailed nutrition view.
 */

(function() {

    const originalRenderIngredientDetails = window.renderIngredientDetails;

    window.renderIngredientDetails = function(ingredients, container) {

        originalRenderIngredientDetails(ingredients, container);

        const toggleButton = container.querySelector('.toggle-detailed-nutrition');
        if (!toggleButton) {

            const tableContainer = container.querySelector('.responsive-table-container');
            if (tableContainer) {
                const toggleButtonContainer = document.createElement('div');
                toggleButtonContainer.className = 'nutrition-controls';
                toggleButtonContainer.innerHTML = `
                    <button type="button" class="toggle-detailed-nutrition">Show Detailed Nutrition</button>
                `;
                tableContainer.parentNode.insertBefore(toggleButtonContainer, tableContainer);

                const newToggleButton = toggleButtonContainer.querySelector('.toggle-detailed-nutrition');
                if (newToggleButton) {
                    addToggleListener(newToggleButton, ingredients, container);
                }
            }
        } else {

            addToggleListener(toggleButton, ingredients, container);
        }
    };

    function addToggleListener(toggleButton, ingredients, container) {
        toggleButton.addEventListener('click', function() {

            let detailedNutritionContainer = container.querySelector('.detailed-nutrition-container');

            if (!detailedNutritionContainer) {

                detailedNutritionContainer = document.createElement('div');
                detailedNutritionContainer.className = 'detailed-nutrition-container';
                detailedNutritionContainer.style.display = 'none';

                if (typeof window.createDetailedNutritionHTML === 'function') {
                    detailedNutritionContainer.innerHTML = window.createDetailedNutritionHTML(ingredients)
                        .replace('<div class="detailed-nutrition-container" style="display: none; margin-top: 20px;">', '')
                        .replace('</div>', '');
                } else {
                    detailedNutritionContainer.innerHTML = '<p>Detailed nutrition view not available.</p>';
                }

                const table = container.querySelector('.ingredient-table');
                if (table) {
                    table.parentNode.insertBefore(detailedNutritionContainer, table.nextSibling);
                }
            }

            const isVisible = detailedNutritionContainer.style.display !== 'none';
            detailedNutritionContainer.style.display = isVisible ? 'none' : 'block';

            toggleButton.textContent = isVisible ? 'Show Detailed Nutrition' : 'Hide Detailed Nutrition';
        });
    }
})();
