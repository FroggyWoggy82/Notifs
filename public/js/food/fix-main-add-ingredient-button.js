/**
 * Fix Main Add Ingredient Button
 * Specifically targets and fixes the main Add Ingredient button at the bottom of the form
 */

(function() {
    // DISABLED - This script is now handled by unified-add-ingredient-handler.js
    console.log('[Fix Main Add Ingredient Button] Script disabled to prevent duplicate modals');
    return;

    console.log('[Fix Main Add Ingredient Button] Initializing');

    // Flag to track if we've already initialized
    let initialized = false;
    
    // Function to create a new ingredient row
    function createNewIngredientRow() {
        // Create the HTML for a new ingredient row
        const html = `
            <div class="ingredient-item">
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
                        <button type="button" class="cronometer-parse-button">Parse Nutrition Data</button>
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
            </div>
        `;
        
        return html;
    }

    // Function to add a new ingredient row
    function addNewIngredientRow() {
        if (!initialized) {
            console.log('[Fix Main Add Ingredient Button] Adding new ingredient row');
        }
        
        // Get the ingredients list container
        const ingredientsList = document.getElementById('ingredients-list');
        if (!ingredientsList) {
            console.error('[Fix Main Add Ingredient Button] Could not find ingredients list');
            return;
        }
        
        // Create a new ingredient item element
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = createNewIngredientRow();
        const newIngredientItem = tempDiv.firstElementChild;
        
        // Add the new ingredient item to the list
        ingredientsList.appendChild(newIngredientItem);
        
        // Add event listeners to the buttons in the new ingredient item
        addEventListenersToIngredientItem(newIngredientItem);
        
        // Initialize the Cronometer text parser for the new ingredient
        if (typeof window.initializeCronometerTextParser === 'function') {
            window.initializeCronometerTextParser(newIngredientItem);
        }
        
        // Scroll to the new ingredient item
        newIngredientItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Function to add event listeners to an ingredient item
    function addEventListenersToIngredientItem(ingredientItem) {
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
                    return;
                }
                
                // Check if this is the only ingredient item
                if (ingredientsList.querySelectorAll('.ingredient-item').length <= 1) {
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
        
        // Add event listener to the Parse Nutrition Data button
        const parseButton = ingredientItem.querySelector('.cronometer-parse-button');
        if (parseButton) {
            parseButton.addEventListener('click', function(event) {
                event.preventDefault();
                
                const textArea = this.parentNode.querySelector('.cronometer-text-paste-area');
                const statusDiv = this.parentNode.querySelector('.cronometer-parse-status');
                
                if (textArea && typeof window.processCronometerText === 'function') {
                    window.processCronometerText(textArea.value.trim(), ingredientItem, statusDiv);
                }
            });
        }
    }

    // Function to fix the main Add Ingredient button
    function fixMainAddIngredientButton() {
        if (!initialized) {
            console.log('[Fix Main Add Ingredient Button] Fixing main Add Ingredient button');
            initialized = true;
        }
        
        // Find the main Add Ingredient button
        const mainAddButton = document.querySelector('button.add-ingredient');
        
        // If we can't find it by class, try to find it by text content
        if (!mainAddButton) {
            const allButtons = document.querySelectorAll('button');
            for (let i = 0; i < allButtons.length; i++) {
                if (allButtons[i].textContent.trim() === 'Add Ingredient') {
                    const addButton = allButtons[i];
                    
                    // Remove any existing event listeners
                    const newButton = addButton.cloneNode(true);
                    addButton.parentNode.replaceChild(newButton, addButton);
                    
                    // Add our event listener
                    newButton.addEventListener('click', function(event) {
                        event.preventDefault();
                        addNewIngredientRow();
                    });
                    
                    console.log('[Fix Main Add Ingredient Button] Fixed main Add Ingredient button by text content');
                    return;
                }
            }
        } else {
            // Remove any existing event listeners
            const newButton = mainAddButton.cloneNode(true);
            mainAddButton.parentNode.replaceChild(newButton, mainAddButton);
            
            // Add our event listener
            newButton.addEventListener('click', function(event) {
                event.preventDefault();
                addNewIngredientRow();
            });
            
            console.log('[Fix Main Add Ingredient Button] Fixed main Add Ingredient button by class');
            return;
        }
        
        // If we still can't find it, try to find it by its position in the DOM
        const bottomButtons = document.querySelectorAll('#recipe-creation-section > button');
        for (let i = 0; i < bottomButtons.length; i++) {
            if (bottomButtons[i].textContent.trim() === 'Add Ingredient') {
                const addButton = bottomButtons[i];
                
                // Remove any existing event listeners
                const newButton = addButton.cloneNode(true);
                addButton.parentNode.replaceChild(newButton, addButton);
                
                // Add our event listener
                newButton.addEventListener('click', function(event) {
                    event.preventDefault();
                    addNewIngredientRow();
                });
                
                console.log('[Fix Main Add Ingredient Button] Fixed main Add Ingredient button by position');
                return;
            }
        }
        
        // If we still can't find it, try to find it by its ID
        const addIngredientButton = document.getElementById('add-ingredient-btn');
        if (addIngredientButton) {
            // Remove any existing event listeners
            const newButton = addIngredientButton.cloneNode(true);
            addIngredientButton.parentNode.replaceChild(newButton, addIngredientButton);
            
            // Add our event listener
            newButton.addEventListener('click', function(event) {
                event.preventDefault();
                addNewIngredientRow();
            });
            
            console.log('[Fix Main Add Ingredient Button] Fixed main Add Ingredient button by ID');
            return;
        }
        
        // If we still can't find it, try to find it by its parent container
        const addIngredientContainer = document.querySelector('.add-ingredient-container');
        if (addIngredientContainer) {
            const addButton = addIngredientContainer.querySelector('button');
            if (addButton) {
                // Remove any existing event listeners
                const newButton = addButton.cloneNode(true);
                addButton.parentNode.replaceChild(newButton, addButton);
                
                // Add our event listener
                newButton.addEventListener('click', function(event) {
                    event.preventDefault();
                    addNewIngredientRow();
                });
                
                console.log('[Fix Main Add Ingredient Button] Fixed main Add Ingredient button by container');
                return;
            }
        }
        
        // If we still can't find it, create a direct event listener for the specific button shown in the screenshot
        const allButtons = document.querySelectorAll('button');
        for (let i = 0; i < allButtons.length; i++) {
            if (allButtons[i].textContent.trim() === 'Add Ingredient' && 
                allButtons[i].closest('#recipe-creation-section')) {
                const addButton = allButtons[i];
                
                // Remove any existing event listeners
                const newButton = addButton.cloneNode(true);
                addButton.parentNode.replaceChild(newButton, addButton);
                
                // Add our event listener
                newButton.addEventListener('click', function(event) {
                    event.preventDefault();
                    addNewIngredientRow();
                });
                
                console.log('[Fix Main Add Ingredient Button] Fixed main Add Ingredient button by section and text');
                return;
            }
        }
    }

    // Initialize when the DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(fixMainAddIngredientButton, 500);
        });
    } else {
        setTimeout(fixMainAddIngredientButton, 500);
    }

    // Also try again after a longer delay to catch any dynamically added buttons
    setTimeout(fixMainAddIngredientButton, 1000);
    setTimeout(fixMainAddIngredientButton, 2000);

    console.log('[Fix Main Add Ingredient Button] Initialized');
})();
