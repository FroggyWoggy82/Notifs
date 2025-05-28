/**
 * Micronutrient Display
 * 
 * This script adds a button to the recipe view to display micronutrient data.
 * It also handles the display of micronutrient data in the recipe view.
 */

(function() {

    document.addEventListener('DOMContentLoaded', function() {

        initMicronutrientDisplay();
    });

    /**
     * Initialize the micronutrient display
     */
    function initMicronutrientDisplay() {

        const originalRenderIngredientDetails = window.renderIngredientDetails;
        if (!originalRenderIngredientDetails) {
            console.warn('renderIngredientDetails function not found. Micronutrient display will not be available.');
            return;
        }

        window.renderIngredientDetails = function(ingredients, container) {

            originalRenderIngredientDetails(ingredients, container);

            addMicronutrientButton(ingredients, container);
        };

        document.querySelectorAll('.ingredient-details').forEach(container => {

            const recipeId = container.closest('.recipe-card')?.dataset.recipeId;
            if (!recipeId) return;

            fetch(`/api/recipes/${recipeId}`)
                .then(response => response.json())
                .then(responseData => {
                    // Handle both wrapped and direct response formats
                    let recipe;
                    if (responseData.success && responseData.recipe) {
                        // New MVC format: {success: true, recipe: {...}, message: "..."}
                        recipe = responseData.recipe;
                    } else if (responseData.ingredients) {
                        // Old direct format: {id: 1, name: "...", ingredients: [...]}
                        recipe = responseData;
                    } else {
                        console.error('Invalid response format:', responseData);
                        return;
                    }

                    addMicronutrientButton(recipe.ingredients, container);
                })
                .catch(error => {
                    console.error('Error fetching recipe data:', error);
                });
        });
    }

    /**
     * Add the micronutrient button to the recipe view
     * @param {Array} ingredients - Array of ingredient objects
     * @param {HTMLElement} container - Container element
     */
    function addMicronutrientButton(ingredients, container) {

        if (container.querySelector('.micronutrient-button')) return;

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'micronutrient-button-container';
        buttonContainer.style.textAlign = 'right';
        buttonContainer.style.marginBottom = '10px';

        const button = document.createElement('button');
        button.className = 'micronutrient-button';
        button.textContent = 'Show Micronutrients';
        button.style.backgroundColor = '#000';
        button.style.color = '#fff';
        button.style.border = '1px solid #fff';
        button.style.padding = '5px 10px';
        button.style.cursor = 'pointer';
        button.style.transition = 'background-color 0.3s, color 0.3s';

        button.addEventListener('mouseover', function() {
            button.style.backgroundColor = '#fff';
            button.style.color = '#000';
        });

        button.addEventListener('mouseout', function() {
            if (!button.classList.contains('active')) {
                button.style.backgroundColor = '#000';
                button.style.color = '#fff';
            }
        });

        button.addEventListener('click', function() {
            toggleMicronutrientDisplay(ingredients, container, button);
        });

        buttonContainer.appendChild(button);

        const table = container.querySelector('.ingredient-table');
        if (table) {
            table.parentNode.insertBefore(buttonContainer, table);
        } else {
            container.insertBefore(buttonContainer, container.firstChild);
        }
    }

    /**
     * Toggle the display of micronutrient data
     * @param {Array} ingredients - Array of ingredient objects
     * @param {HTMLElement} container - Container element
     * @param {HTMLElement} button - Button element
     */
    function toggleMicronutrientDisplay(ingredients, container, button) {

        let micronutrientDisplay = container.querySelector('.micronutrient-display');
        
        if (micronutrientDisplay) {

            const isVisible = micronutrientDisplay.style.display !== 'none';
            micronutrientDisplay.style.display = isVisible ? 'none' : 'block';

            button.textContent = isVisible ? 'Show Micronutrients' : 'Hide Micronutrients';
            
            if (isVisible) {
                button.classList.remove('active');
                button.style.backgroundColor = '#000';
                button.style.color = '#fff';
            } else {
                button.classList.add('active');
                button.style.backgroundColor = '#fff';
                button.style.color = '#000';
            }
        } else {

            micronutrientDisplay = document.createElement('div');
            micronutrientDisplay.className = 'micronutrient-display';
            micronutrientDisplay.style.marginTop = '20px';
            micronutrientDisplay.style.marginBottom = '20px';
            micronutrientDisplay.style.backgroundColor = '#111';
            micronutrientDisplay.style.padding = '15px';
            micronutrientDisplay.style.borderBottom = '2px solid #00ff00';

            micronutrientDisplay.innerHTML = createMicronutrientHTML(ingredients);

            const table = container.querySelector('.ingredient-table');
            if (table) {
                table.parentNode.insertBefore(micronutrientDisplay, table.nextSibling);
            } else {
                container.appendChild(micronutrientDisplay);
            }

            button.textContent = 'Hide Micronutrients';
            button.classList.add('active');
            button.style.backgroundColor = '#fff';
            button.style.color = '#000';
        }
    }

    /**
     * Create the HTML for the micronutrient display
     * @param {Array} ingredients - Array of ingredient objects
     * @returns {string} - HTML string
     */
    function createMicronutrientHTML(ingredients) {

        if (!ingredients || ingredients.length === 0) {
            return '<p>No ingredients found.</p>';
        }

        let html = '<h3 style="color: #fff; margin-top: 0; margin-bottom: 15px; text-align: center;">Micronutrient Data</h3>';

        html += '<div style="display: flex; flex-wrap: wrap; gap: 20px;">';

        html += createMicronutrientTable('Carbohydrates', ingredients, [
            { key: 'fiber', label: 'Fiber', unit: 'g' },
            { key: 'starch', label: 'Starch', unit: 'g' },
            { key: 'sugars', label: 'Sugars', unit: 'g' },
            { key: 'added_sugars', label: 'Added Sugars', unit: 'g' },
            { key: 'net_carbs', label: 'Net Carbs', unit: 'g' }
        ]);
        
        html += createMicronutrientTable('Lipids', ingredients, [
            { key: 'saturated', label: 'Saturated', unit: 'g' },
            { key: 'monounsaturated', label: 'Monounsaturated', unit: 'g' },
            { key: 'polyunsaturated', label: 'Polyunsaturated', unit: 'g' },
            { key: 'omega3', label: 'Omega-3', unit: 'g' },
            { key: 'omega6', label: 'Omega-6', unit: 'g' },
            { key: 'trans', label: 'Trans', unit: 'g' },
            { key: 'cholesterol', label: 'Cholesterol', unit: 'mg' }
        ]);
        
        html += createMicronutrientTable('Vitamins', ingredients, [
            { key: 'vitamin_a', label: 'Vitamin A', unit: 'μg' },
            { key: 'thiamine', label: 'Thiamine (B1)', unit: 'mg' },
            { key: 'riboflavin', label: 'Riboflavin (B2)', unit: 'mg' },
            { key: 'niacin', label: 'Niacin (B3)', unit: 'mg' },
            { key: 'pantothenic_acid', label: 'Pantothenic Acid (B5)', unit: 'mg' },
            { key: 'vitamin_b6', label: 'Vitamin B6', unit: 'mg' },
            { key: 'vitamin_b12', label: 'Vitamin B12', unit: 'μg' },
            { key: 'folate', label: 'Folate', unit: 'μg' },
            { key: 'vitamin_c', label: 'Vitamin C', unit: 'mg' },
            { key: 'vitamin_d', label: 'Vitamin D', unit: 'IU' },
            { key: 'vitamin_e', label: 'Vitamin E', unit: 'mg' },
            { key: 'vitamin_k', label: 'Vitamin K', unit: 'μg' }
        ]);
        
        html += createMicronutrientTable('Minerals', ingredients, [
            { key: 'calcium', label: 'Calcium', unit: 'mg' },
            { key: 'copper', label: 'Copper', unit: 'mg' },
            { key: 'iron', label: 'Iron', unit: 'mg' },
            { key: 'magnesium', label: 'Magnesium', unit: 'mg' },
            { key: 'manganese', label: 'Manganese', unit: 'mg' },
            { key: 'phosphorus', label: 'Phosphorus', unit: 'mg' },
            { key: 'potassium', label: 'Potassium', unit: 'mg' },
            { key: 'selenium', label: 'Selenium', unit: 'μg' },
            { key: 'sodium', label: 'Sodium', unit: 'mg' },
            { key: 'zinc', label: 'Zinc', unit: 'mg' }
        ]);

        html += '</div>';
        
        return html;
    }

    /**
     * Create a micronutrient table
     * @param {string} title - Table title
     * @param {Array} ingredients - Array of ingredient objects
     * @param {Array} fields - Array of field objects with key, label, and unit
     * @returns {string} - HTML string
     */
    function createMicronutrientTable(title, ingredients, fields) {

        if (!ingredients || ingredients.length === 0) {
            return '';
        }

        if (!fields || fields.length === 0) {
            return '';
        }

        let html = `
            <div style="flex: 1; min-width: 300px;">
                <h4 style="color: #fff; margin-top: 0; margin-bottom: 10px;">${title}</h4>
                <table style="width: 100%; border-collapse: collapse; color: #fff;">
                    <thead>
                        <tr>
                            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #333; background-color: #222;">Nutrient</th>
                            <th style="padding: 8px; text-align: right; border-bottom: 1px solid #333; background-color: #222;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        fields.forEach(field => {

            let totalAmount = 0;
            let hasData = false;

            ingredients.forEach(ingredient => {
                const amount = parseFloat(ingredient[field.key]);
                if (!isNaN(amount) && amount > 0) {
                    totalAmount += amount;
                    hasData = true;
                }
            });

            if (hasData) {
                html += `
                    <tr>
                        <td style="padding: 8px; text-align: left; border-bottom: 1px solid #333;">${field.label}</td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #333;">${totalAmount.toFixed(2)} ${field.unit}</td>
                    </tr>
                `;
            }
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        return html;
    }
})();
