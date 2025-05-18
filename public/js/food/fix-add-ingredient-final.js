/**
 * Final Fix for Add Ingredient Button
 * This script ensures the Add Ingredient button in the Create New Recipe section works correctly
 * It overrides any previous event handlers to ensure consistent behavior
 */

(function() {
    console.log('[Fix Add Ingredient Final] Initializing');

    // Function to create a new ingredient row HTML
    function createIngredientRowHtml() {
        return `
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
                <!-- General Section -->
                <div class="nutrition-section">
                    <h4>General</h4>
                    <div class="nutrition-grid">
                        <div class="nutrition-item">
                            <label for="energy">Energy (kcal):</label>
                            <input type="number" class="nutrition-energy" step="0.1" required>
                        </div>
                        <div class="nutrition-item">
                            <label for="alcohol">Alcohol (g):</label>
                            <input type="number" class="nutrition-alcohol" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="caffeine">Caffeine (mg):</label>
                            <input type="number" class="nutrition-caffeine" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="water">Water (g):</label>
                            <input type="number" class="nutrition-water" step="0.1">
                        </div>
                    </div>
                </div>

                <!-- Carbohydrates Section -->
                <div class="nutrition-section">
                    <h4>Carbohydrates</h4>
                    <div class="nutrition-grid">
                        <div class="nutrition-item">
                            <label for="carbs-total">Carbs (g):</label>
                            <input type="number" class="nutrition-carbs-total" step="0.1" required>
                        </div>
                        <div class="nutrition-item">
                            <label for="fiber">Fiber (g):</label>
                            <input type="number" class="nutrition-fiber" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="starch">Starch (g):</label>
                            <input type="number" class="nutrition-starch" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="sugars">Sugars (g):</label>
                            <input type="number" class="nutrition-sugars" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="added-sugars">Added Sugars (g):</label>
                            <input type="number" class="nutrition-added-sugars" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="net-carbs">Net Carbs (g):</label>
                            <input type="number" class="nutrition-net-carbs" step="0.1">
                        </div>
                    </div>
                </div>

                <!-- Lipids Section -->
                <div class="nutrition-section">
                    <h4>Lipids</h4>
                    <div class="nutrition-grid">
                        <div class="nutrition-item">
                            <label for="fat-total">Fat (g):</label>
                            <input type="number" class="nutrition-fat-total" step="0.1" required>
                        </div>
                        <div class="nutrition-item">
                            <label for="monounsaturated">Monounsaturated (g):</label>
                            <input type="number" class="nutrition-monounsaturated" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="polyunsaturated">Polyunsaturated (g):</label>
                            <input type="number" class="nutrition-polyunsaturated" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="omega3">Omega 3 (g):</label>
                            <input type="number" class="nutrition-omega3" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="omega6">Omega 6 (g):</label>
                            <input type="number" class="nutrition-omega6" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="saturated">Saturated (g):</label>
                            <input type="number" class="nutrition-saturated" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="trans-fat">Trans Fat (g):</label>
                            <input type="number" class="nutrition-trans-fat" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="cholesterol">Cholesterol (mg):</label>
                            <input type="number" class="nutrition-cholesterol" step="0.1">
                        </div>
                    </div>
                </div>

                <!-- Protein Section -->
                <div class="nutrition-section">
                    <h4>Protein</h4>
                    <div class="nutrition-grid">
                        <div class="nutrition-item">
                            <label for="protein-total">Protein (g):</label>
                            <input type="number" class="nutrition-protein-total" step="0.1" required>
                        </div>
                        <div class="nutrition-item">
                            <label for="cystine">Cystine (g):</label>
                            <input type="number" class="nutrition-cystine" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="histidine">Histidine (g):</label>
                            <input type="number" class="nutrition-histidine" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="isoleucine">Isoleucine (g):</label>
                            <input type="number" class="nutrition-isoleucine" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="leucine">Leucine (g):</label>
                            <input type="number" class="nutrition-leucine" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="lysine">Lysine (g):</label>
                            <input type="number" class="nutrition-lysine" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="methionine">Methionine (g):</label>
                            <input type="number" class="nutrition-methionine" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="phenylalanine">Phenylalanine (g):</label>
                            <input type="number" class="nutrition-phenylalanine" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="threonine">Threonine (g):</label>
                            <input type="number" class="nutrition-threonine" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="tryptophan">Tryptophan (g):</label>
                            <input type="number" class="nutrition-tryptophan" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="tyrosine">Tyrosine (g):</label>
                            <input type="number" class="nutrition-tyrosine" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="valine">Valine (g):</label>
                            <input type="number" class="nutrition-valine" step="0.1">
                        </div>
                    </div>
                </div>

                <!-- Vitamins Section -->
                <div class="nutrition-section">
                    <h4>Vitamins</h4>
                    <div class="nutrition-grid">
                        <div class="nutrition-item">
                            <label for="vitamin-b1">B1 (Thiamine) (mg):</label>
                            <input type="number" class="nutrition-vitamin-b1" step="0.01">
                        </div>
                        <div class="nutrition-item">
                            <label for="vitamin-b2">B2 (Riboflavin) (mg):</label>
                            <input type="number" class="nutrition-vitamin-b2" step="0.01">
                        </div>
                        <div class="nutrition-item">
                            <label for="vitamin-b3">B3 (Niacin) (mg):</label>
                            <input type="number" class="nutrition-vitamin-b3" step="0.01">
                        </div>
                        <div class="nutrition-item">
                            <label for="vitamin-b5">B5 (Pantothenic Acid) (mg):</label>
                            <input type="number" class="nutrition-vitamin-b5" step="0.01">
                        </div>
                        <div class="nutrition-item">
                            <label for="vitamin-b6">B6 (Pyridoxine) (mg):</label>
                            <input type="number" class="nutrition-vitamin-b6" step="0.01">
                        </div>
                        <div class="nutrition-item">
                            <label for="vitamin-b12">B12 (Cobalamin) (μg):</label>
                            <input type="number" class="nutrition-vitamin-b12" step="0.01">
                        </div>
                        <div class="nutrition-item">
                            <label for="folate">Folate (μg):</label>
                            <input type="number" class="nutrition-folate" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="vitamin-a">Vitamin A (μg):</label>
                            <input type="number" class="nutrition-vitamin-a" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="vitamin-c">Vitamin C (mg):</label>
                            <input type="number" class="nutrition-vitamin-c" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="vitamin-d">Vitamin D (IU):</label>
                            <input type="number" class="nutrition-vitamin-d" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="vitamin-e">Vitamin E (mg):</label>
                            <input type="number" class="nutrition-vitamin-e" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="vitamin-k">Vitamin K (μg):</label>
                            <input type="number" class="nutrition-vitamin-k" step="0.1">
                        </div>
                    </div>
                </div>

                <!-- Minerals Section -->
                <div class="nutrition-section">
                    <h4>Minerals</h4>
                    <div class="nutrition-grid">
                        <div class="nutrition-item">
                            <label for="calcium">Calcium (mg):</label>
                            <input type="number" class="nutrition-calcium" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="copper">Copper (mg):</label>
                            <input type="number" class="nutrition-copper" step="0.01">
                        </div>
                        <div class="nutrition-item">
                            <label for="iron">Iron (mg):</label>
                            <input type="number" class="nutrition-iron" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="magnesium">Magnesium (mg):</label>
                            <input type="number" class="nutrition-magnesium" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="manganese">Manganese (mg):</label>
                            <input type="number" class="nutrition-manganese" step="0.01">
                        </div>
                        <div class="nutrition-item">
                            <label for="phosphorus">Phosphorus (mg):</label>
                            <input type="number" class="nutrition-phosphorus" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="potassium">Potassium (mg):</label>
                            <input type="number" class="nutrition-potassium" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="selenium">Selenium (μg):</label>
                            <input type="number" class="nutrition-selenium" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="sodium">Sodium (mg):</label>
                            <input type="number" class="nutrition-sodium" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="zinc">Zinc (mg):</label>
                            <input type="number" class="nutrition-zinc" step="0.1">
                        </div>
                    </div>
                </div>
            </div>

            <div class="simplified-scan-status"></div>

            <!-- Raw OCR Text Container (initially hidden) -->
            <div class="raw-ocr-container" style="display: none;">
                <h4>Raw OCR Text</h4>
                <div class="raw-ocr-text"></div>
            </div>
        `;
    }

    // Function to add a new ingredient row
    function addNewIngredientRow() {
        console.log('[Fix Add Ingredient Final] Adding new ingredient row');

        // Get the ingredients list container
        const ingredientsList = document.getElementById('ingredients-list');
        if (!ingredientsList) {
            console.error('[Fix Add Ingredient Final] Could not find ingredients list');
            return;
        }

        // Create a new ingredient item
        const newIngredientItem = document.createElement('div');
        newIngredientItem.className = 'ingredient-item';

        // Set the HTML for the new ingredient row
        newIngredientItem.innerHTML = createIngredientRowHtml();

        // Add the new ingredient item to the list
        ingredientsList.appendChild(newIngredientItem);

        // Initialize the Cronometer text parser for the new ingredient
        if (typeof window.initializeCronometerTextParser === 'function') {
            window.initializeCronometerTextParser(newIngredientItem);
        } else {
            console.warn('[Fix Add Ingredient Final] Cronometer text parser not available');

            // Try to add event listener to the parse button manually
            const parseButton = newIngredientItem.querySelector('.cronometer-parse-button');
            const textPasteArea = newIngredientItem.querySelector('.cronometer-text-paste-area');
            const statusElement = newIngredientItem.querySelector('.cronometer-parse-status');

            if (parseButton && textPasteArea && statusElement) {
                parseButton.addEventListener('click', function() {
                    console.log('[Fix Add Ingredient Final] Parse button clicked');
                    const text = textPasteArea.value.trim();
                    if (text) {
                        if (typeof window.processCronometerText === 'function') {
                            console.log('[Fix Add Ingredient Final] Calling processCronometerText function');
                            window.processCronometerText(text, newIngredientItem, statusElement);
                        } else {
                            console.error('[Fix Add Ingredient Final] processCronometerText function not found');
                            statusElement.textContent = 'Error: Nutrition parser not loaded';
                            statusElement.className = 'cronometer-parse-status error';
                        }
                    } else {
                        statusElement.textContent = 'Please paste Cronometer nutrition data first';
                        statusElement.className = 'cronometer-parse-status error';
                    }
                });
                console.log('[Fix Add Ingredient Final] Manual event listener added to parse button');
            }
        }

        // Add event listeners to the new buttons
        addButtonEventListeners(newIngredientItem);

        // Dispatch the ingredientAdded event for other scripts
        const event = new CustomEvent('ingredientAdded', {
            detail: { ingredientItem: newIngredientItem }
        });
        document.dispatchEvent(event);

        // Scroll to the new ingredient item
        newIngredientItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Function to add event listeners to buttons in an ingredient item
    function addButtonEventListeners(ingredientItem) {
        // Add event listener to the Add Ingredient button
        const addButton = ingredientItem.querySelector('.add-ingredient-btn-inline');
        if (addButton) {
            // Remove existing event listeners
            const newAddButton = addButton.cloneNode(true);
            addButton.parentNode.replaceChild(newAddButton, addButton);

            // Add new event listener
            newAddButton.addEventListener('click', function(event) {
                event.preventDefault();
                addNewIngredientRow();
            });
        }

        // Add event listener to the Remove button
        const removeButton = ingredientItem.querySelector('.remove-ingredient-btn');
        if (removeButton) {
            // Remove existing event listeners
            const newRemoveButton = removeButton.cloneNode(true);
            removeButton.parentNode.replaceChild(newRemoveButton, removeButton);

            // Add new event listener
            newRemoveButton.addEventListener('click', function(event) {
                event.preventDefault();

                // Get the ingredients list
                const ingredientsList = document.getElementById('ingredients-list');
                if (!ingredientsList) {
                    console.error('[Fix Add Ingredient Final] Could not find ingredients list');
                    return;
                }

                // Check if this is the only ingredient item
                if (ingredientsList.querySelectorAll('.ingredient-item').length <= 1) {
                    console.log('[Fix Add Ingredient Final] Cannot remove the only ingredient item');
                    alert("A recipe must have at least one ingredient.");
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
            // Remove existing event listeners
            const newToggleButton = toggleButton.cloneNode(true);
            toggleButton.parentNode.replaceChild(newToggleButton, toggleButton);

            // Add new event listener
            newToggleButton.addEventListener('click', function(event) {
                event.preventDefault();

                // Toggle the detailed nutrition panel
                if (detailedPanel.style.display === 'none') {
                    detailedPanel.style.display = 'block';
                    newToggleButton.textContent = 'Hide Detailed Nutrition';
                } else {
                    detailedPanel.style.display = 'none';
                    newToggleButton.textContent = 'Show Detailed Nutrition';
                }
            });
        }
    }

    // Function to initialize all Add Ingredient buttons
    function initializeAddIngredientButtons() {
        console.log('[Fix Add Ingredient Final] Initializing Add Ingredient buttons');

        // Get all ingredient items
        const ingredientItems = document.querySelectorAll('.ingredient-item');
        ingredientItems.forEach(item => {
            addButtonEventListeners(item);
        });
    }

    // Initialize when the DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initializeAddIngredientButtons, 1000);
        });
    } else {
        setTimeout(initializeAddIngredientButtons, 1000);
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

    console.log('[Fix Add Ingredient Final] Initialized');
})();
