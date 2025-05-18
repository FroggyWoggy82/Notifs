/**
 * Add Ingredient Button Fix
 * This script ensures the "Add Ingredient" button in the recipe section works correctly
 * It directly targets the button and adds a proper event listener
 */

(function() {
    // Logging control to prevent console spam
    const logConfig = {
        enabled: true,
        debugMode: false,
        lastLogTime: {},
        logThrottleMs: 5000 // Only log the same message once every 5 seconds
    };

    // Controlled logging function to prevent spam
    function log(message, type = 'log', force = false) {
        if (!logConfig.enabled && !force) return;
        if (!logConfig.debugMode && type === 'debug') return;

        const now = Date.now();
        const lastTime = logConfig.lastLogTime[message] || 0;

        // Only log if forced or if enough time has passed since the last identical message
        if (force || (now - lastTime > logConfig.logThrottleMs)) {
            logConfig.lastLogTime[message] = now;

            switch (type) {
                case 'error':
                    console.error(`[Add Ingredient Button Fix] ${message}`);
                    break;
                case 'warn':
                    console.warn(`[Add Ingredient Button Fix] ${message}`);
                    break;
                case 'debug':
                    console.debug(`[Add Ingredient Button Fix] ${message}`);
                    break;
                default:
                    console.log(`[Add Ingredient Button Fix] ${message}`);
            }
        }
    }

    log('Initializing', 'log', true);

    // Function to fix the Add Ingredient button in recipe cards
    function fixAddIngredientButton() {
        log('Looking for Add Ingredient buttons in recipe cards', 'debug');

        // Find all Add Ingredient buttons in recipe cards and in the Create New Recipe section
        // First, try to find buttons with the class .add-ingredient-to-recipe-btn
        let addButtons = Array.from(document.querySelectorAll('.add-ingredient-to-recipe-btn'));

        // If no buttons found with the class, find all buttons with text "Add Ingredient"
        if (addButtons.length === 0) {
            addButtons = Array.from(document.querySelectorAll('button')).filter(button =>
                button.textContent.trim() === 'Add Ingredient'
            );
        }

        if (addButtons.length > 0) {
            log(`Found ${addButtons.length} Add Ingredient buttons`, 'log', true);

            addButtons.forEach((button, index) => {
                log(`Processing button ${index + 1}`, 'debug');

                // Skip if the button already has our event handler
                if (button.dataset.addIngredientFixed === 'true') {
                    log(`Button ${index + 1} already fixed, skipping`, 'debug');
                    return;
                }

                // Remove existing event listeners by cloning the button
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);

                // Mark the button as fixed
                newButton.dataset.addIngredientFixed = 'true';

                // Add new event listener
                newButton.addEventListener('click', function(event) {
                    event.preventDefault();
                    log('Add Ingredient button clicked');

                    // Find the recipe card containing this button
                    // Try multiple approaches to find the parent container
                    const recipeCard = this.closest('.recipe-card') ||
                                      this.closest('[class*="recipe"]') ||
                                      this.closest('.create-recipe') ||
                                      this.closest('#recipe-form') ||
                                      this.closest('form') ||
                                      this.closest('div').parentElement;

                    if (!recipeCard) {
                        log('Could not find parent recipe card', 'error');
                        return;
                    }

                    // Get the recipe ID - try different approaches
                    let recipeId = recipeCard.dataset.id;

                    // If no data-id attribute, try to find it in a hidden input or other element
                    if (!recipeId) {
                        const hiddenInput = recipeCard.querySelector('input[name="recipe-id"], input[name*="recipe"]');
                        if (hiddenInput) {
                            recipeId = hiddenInput.value;
                        }
                    }

                    // If still no recipe ID, try to get it from the heading
                    if (!recipeId) {
                        const heading = recipeCard.querySelector('h3, h4, h2');
                        if (heading) {
                            // Use the heading text as a fallback ID
                            recipeId = heading.textContent.trim().replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
                        }
                    }

                    // For the Create New Recipe section, use a special ID
                    if (recipeCard.closest('#recipe-form') || recipeCard.closest('.create-recipe')) {
                        recipeId = 'new-recipe-' + Date.now();
                    }

                    if (!recipeId) {
                        log('Could not find recipe ID, using fallback', 'warn');
                        recipeId = 'recipe-' + Date.now(); // Fallback ID
                    }

                    log(`Found recipe ID: ${recipeId}`, 'debug');

                    // Find the container for the ingredient details
                    // Try multiple possible selectors
                    let container = recipeCard.querySelector('.ingredient-details');

                    if (!container) {
                        // Try to find a table container
                        container = recipeCard.querySelector('table')?.parentElement;
                    }

                    if (!container) {
                        // Try to find the ingredients section in the Create New Recipe form
                        container = recipeCard.querySelector('.ingredients-section, [class*="ingredient"]');
                    }

                    if (!container) {
                        // Last resort: use the parent of the button or the button's container
                        container = this.closest('.button-container') || this.parentElement;
                    }

                    if (!container) {
                        log('Could not find ingredient details container', 'error');
                        return;
                    }

                    // Create and show the add ingredient form
                    showAddIngredientForm(recipeId, container);
                });

                log(`Successfully attached event listener to button ${index + 1}`, 'debug');
            });
        } else {
            // Only log this warning once per page load to avoid spam
            log('No Add Ingredient buttons found. Will retry when DOM changes.', 'warn', true);
        }
    }

    // Function to show the add ingredient form
    function showAddIngredientForm(recipeId, container) {
        log(`Showing add ingredient form for recipe ${recipeId}`, 'debug');

        // Check if the form already exists
        let form = container.querySelector('.add-ingredient-form');

        if (form) {
            log('Form already exists, showing it', 'debug');
            form.style.display = 'block';

            // Set the recipe ID
            const recipeIdInput = form.querySelector('#add-ingredient-recipe-id');
            if (recipeIdInput) {
                recipeIdInput.value = recipeId;
            }

            // Scroll to the form
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }

        // Create the form if it doesn't exist
        log('Creating new add ingredient form', 'debug');

        // Create a div to hold the form
        form = document.createElement('div');
        form.className = 'add-ingredient-form';
        form.style.display = 'block';

        // Set the form HTML
        form.innerHTML = `
            <h4>Add Ingredient to Recipe</h4>
            <form id="add-ingredient-form" class="ingredient-item">
                <input type="hidden" id="add-ingredient-recipe-id" name="recipe-id" value="${recipeId}">

                <!-- Ingredient Selection Type -->
                <div class="selection-row">
                    <div class="selection-type">
                        <label>
                            <input type="radio" name="ingredient-selection-type" value="existing" class="ingredient-selection-radio">
                            Use existing
                        </label>
                        <label>
                            <input type="radio" name="ingredient-selection-type" value="new" class="ingredient-selection-radio" checked>
                            Create new
                        </label>
                    </div>
                    <div class="existing-ingredient-selection" style="display: none;">
                        <input type="text" class="ingredient-search-input" placeholder="Search ingredients...">
                    </div>
                </div>

                <!-- Ingredient Name, Amount, and Price -->
                <div class="ingredient-inputs-container">
                    <input type="text" placeholder="Ingredient Name" name="name" class="ingredient-name" required>
                    <input type="number" placeholder="Amount (g)" name="amount" class="ingredient-amount" step="0.01" required>
                    <input type="number" placeholder="Package Amount (g)" name="package-amount" class="ingredient-package-amount" step="0.01">
                    <input type="number" placeholder="Package Price" name="price" class="ingredient-price" step="0.01" required>

                    <!-- Hidden fields for form submission -->
                    <input type="hidden" name="calories" class="ingredient-calories" required>
                    <input type="hidden" name="protein" class="ingredient-protein" required>
                    <input type="hidden" name="fat" class="ingredient-fat" required>
                    <input type="hidden" name="carbs" class="ingredient-carbs" required>
                </div>

                <!-- Cronometer Text Parser -->
                <div class="cronometer-text-paste-container">
                    <div class="cronometer-header">Cronometer Text Parser</div>
                    <textarea class="cronometer-text-paste-area" placeholder="Paste Cronometer nutrition data here..." rows="5"></textarea>
                    <button type="button" class="cronometer-parse-button">Parse Nutrition Data</button>
                    <div class="cronometer-parse-status"></div>
                </div>

                <!-- Detailed Nutrition Panel (initially hidden) -->
                <div class="detailed-nutrition-panel" style="display:none;">
                    <!-- Nutrition panels will be added here -->
                </div>

                <!-- Form Actions -->
                <div class="form-actions">
                    <button type="submit" class="save-ingredient-btn">Add Ingredient</button>
                    <button type="button" class="cancel-add-btn">Cancel</button>
                </div>
            </form>
            <div class="add-ingredient-status status"></div>
        `;

        // Add the form to the container
        container.appendChild(form);

        // Initialize the Cronometer text parser for the form
        if (typeof window.initializeCronometerTextParser === 'function') {
            try {
                window.initializeCronometerTextParser(form);
                log('Initialized Cronometer text parser', 'debug');
            } catch (error) {
                log(`Error initializing Cronometer text parser: ${error.message}`, 'error');
            }
        } else {
            log('initializeCronometerTextParser function not available', 'warn');
        }

        // Add event listeners
        const addForm = form.querySelector('#add-ingredient-form');
        if (addForm) {
            addForm.addEventListener('submit', function(event) {
                event.preventDefault();
                log('Form submitted', 'debug');

                // Check if the form has valid nutrition data
                const calories = addForm.querySelector('.ingredient-calories').value;
                const protein = addForm.querySelector('.ingredient-protein').value;
                const fat = addForm.querySelector('.ingredient-fat').value;
                const carbs = addForm.querySelector('.ingredient-carbs').value;

                if (!calories || !protein || !fat || !carbs) {
                    // If nutrition data is missing, try to parse it from the form fields
                    const statusDiv = form.querySelector('.cronometer-parse-status');
                    if (statusDiv) {
                        statusDiv.textContent = 'Please add nutrition data by using the Parse Nutrition Data button';
                        statusDiv.className = 'cronometer-parse-status error';
                    }
                    return;
                }

                if (typeof window.handleAddIngredientSubmit === 'function') {
                    try {
                        window.handleAddIngredientSubmit(event);
                    } catch (error) {
                        log(`Error handling form submission: ${error.message}`, 'error');
                        const statusDiv = form.querySelector('.add-ingredient-status');
                        if (statusDiv) {
                            statusDiv.textContent = 'Error adding ingredient: ' + error.message;
                            statusDiv.className = 'add-ingredient-status error';
                        }
                    }
                } else {
                    log('handleAddIngredientSubmit function not available', 'error');
                    const statusDiv = form.querySelector('.add-ingredient-status');
                    if (statusDiv) {
                        statusDiv.textContent = 'Error: Ingredient submission handler not loaded';
                        statusDiv.className = 'add-ingredient-status error';
                    }
                }
            });
        }

        // Add event listener for the cancel button
        const cancelButton = form.querySelector('.cancel-add-btn');
        if (cancelButton) {
            cancelButton.addEventListener('click', function() {
                log('Cancel button clicked', 'debug');
                form.style.display = 'none';
            });
        }

        // Add event listener for the parse button
        const parseButton = form.querySelector('.cronometer-parse-button');
        const textArea = form.querySelector('.cronometer-text-paste-area');
        const statusDiv = form.querySelector('.cronometer-parse-status');

        if (parseButton && textArea && statusDiv) {
            parseButton.addEventListener('click', function() {
                log('Parse button clicked', 'debug');

                const text = textArea.value.trim();
                if (text) {
                    if (typeof window.processCronometerText === 'function') {
                        try {
                            window.processCronometerText(text, addForm, statusDiv);
                        } catch (error) {
                            log(`Error processing Cronometer text: ${error.message}`, 'error');
                            statusDiv.textContent = 'Error processing nutrition data: ' + error.message;
                            statusDiv.className = 'cronometer-parse-status error';
                        }
                    } else {
                        log('processCronometerText function not available', 'error');
                        statusDiv.textContent = 'Error: Nutrition parser not loaded';
                        statusDiv.className = 'cronometer-parse-status error';
                    }
                } else {
                    statusDiv.textContent = 'Please paste Cronometer nutrition data first';
                    statusDiv.className = 'cronometer-parse-status error';
                }
            });
        }

        // Add event listener for the toggle detailed nutrition button
        const toggleButton = form.querySelector('.toggle-detailed-nutrition');
        const detailedPanel = form.querySelector('.detailed-nutrition-panel');

        if (toggleButton && detailedPanel) {
            toggleButton.addEventListener('click', function() {
                log('Toggle button clicked', 'debug');

                if (detailedPanel.style.display === 'none') {
                    detailedPanel.style.display = 'block';
                    toggleButton.textContent = 'Hide Detailed Nutrition';
                } else {
                    detailedPanel.style.display = 'none';
                    toggleButton.textContent = 'Show Detailed Nutrition';
                }
            });
        }

        // Scroll to the form
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Initialize when the DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // Run immediately and then again after a delay to catch any late-loading elements
            fixAddIngredientButton();
            setTimeout(fixAddIngredientButton, 1000);
            setTimeout(fixAddIngredientButton, 2000);
        });
    } else {
        // Run immediately and then again after a delay
        fixAddIngredientButton();
        setTimeout(fixAddIngredientButton, 1000);
        setTimeout(fixAddIngredientButton, 2000);
    }

    // Set up a mutation observer to watch for new recipe cards
    // Use a more efficient approach with debouncing
    let debounceTimer = null;
    const observer = new MutationObserver(function(mutations) {
        // Check if any of the mutations involve adding nodes
        const hasAddedNodes = mutations.some(mutation => mutation.addedNodes.length > 0);

        if (hasAddedNodes) {
            // Clear any existing timer
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }

            // Set a new timer to run fixAddIngredientButton after a delay
            debounceTimer = setTimeout(fixAddIngredientButton, 500);
        }
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    // Also set up a periodic check to ensure buttons are fixed
    // This helps catch any buttons that might have been missed
    setInterval(fixAddIngredientButton, 5000);

    // Add a specific event listener for the Create New Recipe form
    document.addEventListener('click', function(event) {
        // Check if the clicked element is an "Add Ingredient" button
        if (event.target.textContent.trim() === 'Add Ingredient' &&
            !event.target.dataset.addIngredientFixed) {
            // Run the fix immediately
            fixAddIngredientButton();
        }
    });

    log('Initialized', 'log', true);
})();
