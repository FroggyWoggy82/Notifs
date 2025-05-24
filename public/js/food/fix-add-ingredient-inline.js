/**
 * Fix Add Ingredient Inline Button
 * Ensures the Add Ingredient button in the Create New Recipe section works correctly
 */

(function() {
    // Initialize add ingredient inline functionality

    // Function to add a new ingredient row
    function addNewIngredientRow() {
        // Adding new ingredient row

        // Get the ingredients list container
        const ingredientsList = document.getElementById('ingredients-list');
        if (!ingredientsList) {
            console.error('[Fix Add Ingredient Inline] Could not find ingredients list');
            return;
        }

        // Create a new ingredient item
        const newIngredientItem = document.createElement('div');
        newIngredientItem.className = 'ingredient-item';

        // Get the HTML for a new ingredient row
        if (typeof window.createIngredientRowHtml === 'function') {
            newIngredientItem.innerHTML = window.createIngredientRowHtml();
        } else {
            // Fallback HTML if the function is not available
            newIngredientItem.innerHTML = `
                <div class="ingredient-row">
                    <!-- Ingredient Selection Type -->
                    <div class="selection-row">
                        <div class="selection-type">
                            <label>
                                <input type="radio" name="ingredient-selection-type-${Date.now()}" value="existing" class="ingredient-selection-radio">
                                Use existing
                            </label>
                            <label>
                                <input type="radio" name="ingredient-selection-type-${Date.now()}" value="new" class="ingredient-selection-radio" checked>
                                Create new
                            </label>
                        </div>
                        <div class="existing-ingredient-selection" style="display: none;">
                            <input type="text" class="ingredient-search-input" placeholder="Search ingredients...">
                        </div>
                    </div>

                    <!-- Ingredient Name, Amount, and Price stacked vertically -->
                    <div class="ingredient-inputs-container">
                        <input type="text" placeholder="Ingredient Name" class="ingredient-name" required>
                        <input type="number" placeholder="Amount (g)" class="ingredient-amount" step="0.01" required>
                        <input type="number" placeholder="Package Amount (g)" class="ingredient-package-amount" step="0.01">
                        <input type="number" placeholder="Package Price" class="ingredient-price" step="0.01" required>
                        <!-- Hidden fields for form submission -->
                        <input type="hidden" class="ingredient-calories" required>
                        <input type="hidden" class="ingredient-protein" required>
                        <input type="hidden" class="ingredient-fat" required>
                        <input type="hidden" class="ingredient-carbs" required>
                    </div>

                    <!-- Cronometer Text Parser -->
                    <div class="cronometer-text-paste-container">
                        <div class="cronometer-header">Cronometer Text Parser</div>
                        <textarea class="cronometer-text-paste-area" placeholder="Paste Cronometer nutrition data here..." rows="5"></textarea>
                        <button type="button" class="cronometer-parse-button" onclick="if(window.processCronometerText){window.processCronometerText(this.parentNode.querySelector('.cronometer-text-paste-area').value.trim(), this.closest('.ingredient-item'), this.parentNode.querySelector('.cronometer-parse-status'))}">Parse Nutrition Data</button>
                        <div class="cronometer-parse-status"></div>
                    </div>
                </div>

                <!-- Action buttons in one row -->
                <div class="buttons-row">
                    <button type="button" class="toggle-detailed-nutrition">Show Detailed Nutrition</button>
                    <button type="button" class="add-ingredient-btn-inline">Add Ingredient</button>
                    <button type="button" class="remove-ingredient-btn">Remove</button>
                </div>

                <div class="detailed-nutrition-panel" style="display:none;">
                    <!-- Nutrition panels will be added here -->
                </div>

                <div class="simplified-scan-status"></div>

                <!-- Raw OCR Text Container (initially hidden) -->
                <div class="raw-ocr-container" style="display: none;">
                    <h4>Raw OCR Text</h4>
                    <div class="raw-ocr-text"></div>
                </div>
            `;
        }

        // Add the new ingredient item to the list
        ingredientsList.appendChild(newIngredientItem);

        // Initialize the Cronometer text parser for the new ingredient
        if (typeof window.initializeCronometerTextParser === 'function') {
            window.initializeCronometerTextParser(newIngredientItem);
        }

        // Add event listeners to the new buttons
        addButtonEventListeners(newIngredientItem);

        // Scroll to the new ingredient item
        newIngredientItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Function to add event listeners to buttons in an ingredient item
    function addButtonEventListeners(ingredientItem) {
        // Add event listener to the Add Ingredient button
        const addButton = ingredientItem.querySelector('.add-ingredient-btn-inline');
        if (addButton) {
            addButton.addEventListener('click', function(event) {
                event.preventDefault();
                addNewIngredientRow();
            });
        }

        // Add event listener to the Remove button
        const removeButton = ingredientItem.querySelector('.remove-ingredient-btn');
        if (removeButton) {
            removeButton.addEventListener('click', function(event) {
                event.preventDefault();

                // Get the ingredients list
                const ingredientsList = document.getElementById('ingredients-list');
                if (!ingredientsList) {
                    console.error('[Fix Add Ingredient Inline] Could not find ingredients list');
                    return;
                }

                // Check if this is the only ingredient item
                if (ingredientsList.querySelectorAll('.ingredient-item').length <= 1) {
                    // Cannot remove the only ingredient item
                    return;
                }

                // Remove the ingredient item
                ingredientItem.remove();
            });
        }

        // Add event listener to the Toggle Detailed Nutrition button
        const toggleButton = ingredientItem.querySelector('.toggle-detailed-nutrition');
        const detailedPanel = ingredientItem.querySelector('.detailed-nutrition-panel');
        if (toggleButton && detailedPanel) {
            toggleButton.addEventListener('click', function(event) {
                event.preventDefault();

                // Toggle the detailed nutrition panel
                if (detailedPanel.style.display === 'none') {
                    detailedPanel.style.display = 'block';
                    toggleButton.textContent = 'Hide Detailed Nutrition';
                } else {
                    detailedPanel.style.display = 'none';
                    toggleButton.textContent = 'Show Detailed Nutrition';
                }
            });
        }
    }

    // Function to initialize all Add Ingredient buttons
    function initializeAddIngredientButtons() {
        // Initialize Add Ingredient buttons

        // Get all ingredient items
        const ingredientItems = document.querySelectorAll('.ingredient-item');
        ingredientItems.forEach(item => {
            addButtonEventListeners(item);
        });
    }

    // Initialize when the DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initializeAddIngredientButtons, 500);
        });
    } else {
        setTimeout(initializeAddIngredientButtons, 500);
    }

    // Set up a mutation observer to watch for new ingredient items
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(initializeAddIngredientButtons, 500);
            }
        });
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    console.log('[Fix Add Ingredient Inline] Initialized');
})();
