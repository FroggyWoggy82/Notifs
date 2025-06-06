/**
 * Add Ingredient Button Fix
 * This script ensures the "Add Ingredient" button in the recipe section works correctly
 * It directly targets the button and adds a proper event listener
 */

(function() {
    // ENABLED - Enhanced Add Ingredient functionality with search
    console.log('[Add Ingredient Button Fix] Script enabled with search functionality');

    // Logging control to prevent console spam
    const logConfig = {
        enabled: true,
        debugMode: true, // Enable debug mode to see search functionality logs
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

    // Enhanced function to show the add ingredient form with search functionality
    function enhancedShowAddIngredientForm(recipeId, container) {
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

        // Add event listeners for radio buttons to toggle between existing and new ingredient
        const radioButtons = form.querySelectorAll('.ingredient-selection-radio');
        const existingSelection = form.querySelector('.existing-ingredient-selection');
        const ingredientNameInput = form.querySelector('.ingredient-name');

        radioButtons.forEach(radio => {
            radio.addEventListener('change', function() {
                log(`Radio button changed to: ${this.value}`, 'debug');

                if (this.value === 'existing') {
                    // Show search input, hide name input
                    if (existingSelection) existingSelection.style.display = 'block';
                    if (ingredientNameInput) ingredientNameInput.style.display = 'none';
                } else {
                    // Hide search input, show name input
                    if (existingSelection) existingSelection.style.display = 'none';
                    if (ingredientNameInput) ingredientNameInput.style.display = 'block';
                }
            });
        });

        // Add search functionality for existing ingredients
        const searchInput = form.querySelector('.ingredient-search-input');
        log(`Search input found in form: ${!!searchInput}`, 'debug');
        if (searchInput) {
            log('Calling setupIngredientSearch', 'debug');
            setupIngredientSearch(searchInput, form);
        } else {
            log('Search input not found, skipping search setup', 'debug');
        }

        // Scroll to the form
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Override the default Add Ingredient button behavior for existing recipes
    function overrideAddIngredientButtons() {
        // Find all Add Ingredient buttons in recipe cards (not in Create Recipe form)
        const recipeCards = document.querySelectorAll('.recipe-card');

        recipeCards.forEach(recipeCard => {
            const addButton = recipeCard.querySelector('.add-ingredient-btn-inline, .add-ingredient-btn');
            if (addButton && !addButton.dataset.overridden) {
                // Mark as overridden to avoid duplicate event listeners
                addButton.dataset.overridden = 'true';

                // Remove existing event listeners by cloning the button
                const newButton = addButton.cloneNode(true);
                addButton.parentNode.replaceChild(newButton, addButton);

                // Add our custom event listener
                newButton.addEventListener('click', function(event) {
                    event.preventDefault();
                    event.stopPropagation();

                    log('[Add Ingredient Button Fix] Custom handler for existing recipe', 'debug');

                    // Get recipe ID
                    const recipeId = recipeCard.dataset.id;
                    if (!recipeId) {
                        log('Recipe ID not found', 'error');
                        return;
                    }

                    // Find container for the form
                    const container = recipeCard.querySelector('.ingredient-details');
                    if (!container) {
                        log('Ingredient details container not found', 'error');
                        return;
                    }

                    // Show the add ingredient form
                    showAddIngredientForm(recipeId, container);
                });

                log(`Overridden Add Ingredient button for recipe ${recipeCard.dataset.id}`, 'debug');
            }
        });
    }

    // Override the existing showAddIngredientForm function
    function overrideShowAddIngredientForm() {
        // Store the original function if it exists
        const originalShowAddIngredientForm = window.showAddIngredientForm;

        // Override with our enhanced version
        window.showAddIngredientForm = function(recipeId, container) {
            log(`[Enhanced showAddIngredientForm] Called with recipeId: ${recipeId}`, 'debug');

            if (!container) {
                log('Container not provided to showAddIngredientForm', 'error');
                return;
            }

            log('[Enhanced showAddIngredientForm] Container found, calling enhanced implementation', 'debug');

            // Call our enhanced implementation directly
            enhancedShowAddIngredientForm(recipeId, container);
        };

        log('Overrode showAddIngredientForm function with enhanced version', 'debug');
    }

    // Initialize when the DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // Run immediately and then again after a delay to catch any late-loading elements
            fixAddIngredientButton();
            overrideAddIngredientButtons();
            overrideShowAddIngredientForm();
            setTimeout(() => {
                fixAddIngredientButton();
                overrideAddIngredientButtons();
                overrideShowAddIngredientForm();
            }, 1000);
            setTimeout(() => {
                fixAddIngredientButton();
                overrideAddIngredientButtons();
                overrideShowAddIngredientForm();
            }, 2000);
        });
    } else {
        // Run immediately and then again after a delay
        fixAddIngredientButton();
        overrideAddIngredientButtons();
        overrideShowAddIngredientForm();
        addSearchToExistingForms(); // Check for existing forms immediately
        setTimeout(() => {
            fixAddIngredientButton();
            overrideAddIngredientButtons();
            overrideShowAddIngredientForm();
            addSearchToExistingForms();
        }, 1000);
        setTimeout(() => {
            fixAddIngredientButton();
            overrideAddIngredientButtons();
            overrideShowAddIngredientForm();
            addSearchToExistingForms();
        }, 2000);
    }

    // Set up a mutation observer to watch for new recipe cards AND add ingredient forms
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

            // Set a new timer to run all override functions after a delay
            debounceTimer = setTimeout(() => {
                fixAddIngredientButton();
                overrideAddIngredientButtons();
                overrideShowAddIngredientForm();

                // Also check for any new add ingredient forms and add search functionality
                addSearchToExistingForms();
            }, 500);
        }
    });

    // Function to add search functionality to existing forms
    function addSearchToExistingForms() {
        const forms = document.querySelectorAll('.add-ingredient-form');
        log(`Found ${forms.length} add ingredient forms to enhance`, 'debug');

        forms.forEach(form => {
            if (!form.dataset.searchEnhanced) {
                log('Enhancing form with search functionality', 'debug');
                form.dataset.searchEnhanced = 'true';

                // Add search functionality to this form
                enhanceFormWithSearch(form);
            }
        });
    }

    // Function to enhance a form with search functionality
    function enhanceFormWithSearch(form) {
        log('Enhancing form with search functionality', 'debug');

        // Check if the form already has search functionality
        const existingSearchInput = form.querySelector('.ingredient-search-input');
        if (existingSearchInput) {
            log('Form already has search input, setting up functionality', 'debug');
            setupIngredientSearch(existingSearchInput, form);
            return;
        }

        // Add search functionality to the form
        const selectionRow = form.querySelector('.selection-row');
        if (!selectionRow) {
            log('No selection row found, adding search to form', 'debug');

            // Create the selection row with radio buttons and search
            const selectionHTML = `
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
            `;

            // Insert after the hidden recipe ID input
            const recipeIdInput = form.querySelector('#add-ingredient-recipe-id, input[name="recipe-id"]');
            if (recipeIdInput) {
                recipeIdInput.insertAdjacentHTML('afterend', selectionHTML);

                // Set up radio button functionality
                const radioButtons = form.querySelectorAll('.ingredient-selection-radio');
                const existingSelection = form.querySelector('.existing-ingredient-selection');
                const ingredientNameInput = form.querySelector('.ingredient-name');

                radioButtons.forEach(radio => {
                    radio.addEventListener('change', function() {
                        log(`Radio button changed to: ${this.value}`, 'debug');

                        if (this.value === 'existing') {
                            if (existingSelection) existingSelection.style.display = 'block';
                            if (ingredientNameInput) ingredientNameInput.style.display = 'none';
                        } else {
                            if (existingSelection) existingSelection.style.display = 'none';
                            if (ingredientNameInput) ingredientNameInput.style.display = 'block';
                        }
                    });
                });

                // Set up search functionality
                const searchInput = form.querySelector('.ingredient-search-input');
                if (searchInput) {
                    log('Setting up search functionality for enhanced form', 'debug');
                    setupIngredientSearch(searchInput, form);
                }
            }
        }
    }

    // Make functions available globally for debugging
    window.addSearchToExistingForms = addSearchToExistingForms;
    window.enhanceFormWithSearch = enhanceFormWithSearch;
    window.setupIngredientSearch = setupIngredientSearch;

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    // Also set up a periodic check to ensure buttons are fixed
    // This helps catch any buttons that might have been missed
    setInterval(() => {
        fixAddIngredientButton();
        overrideAddIngredientButtons();
        overrideShowAddIngredientForm();
    }, 5000);

    // Add a specific event listener for the Create New Recipe form
    document.addEventListener('click', function(event) {
        // Check if the clicked element is an "Add Ingredient" button
        if (event.target.textContent.trim() === 'Add Ingredient' &&
            !event.target.dataset.addIngredientFixed) {
            // Run the fix immediately
            fixAddIngredientButton();
            overrideAddIngredientButtons();
            overrideShowAddIngredientForm();
        }
    });

    // Function to setup ingredient search functionality
    function setupIngredientSearch(searchInput, form) {
        log('Setting up ingredient search functionality', 'debug');
        log(`Search input element: ${!!searchInput}`, 'debug');
        log(`Form element: ${!!form}`, 'debug');

        if (!searchInput) {
            log('ERROR: Search input element is null', 'error');
            return;
        }

        if (!form) {
            log('ERROR: Form element is null', 'error');
            return;
        }

        let searchTimeout;
        let searchDropdown;

        // Create dropdown for search results
        function createSearchDropdown() {
            if (searchDropdown) return searchDropdown;

            searchDropdown = document.createElement('div');
            searchDropdown.className = 'ingredient-search-dropdown';
            searchDropdown.style.cssText = `
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background-color: #1e1e1e;
                border: 1px solid #333;
                border-top: none;
                border-radius: 0 0 4px 4px;
                max-height: 200px;
                overflow-y: auto;
                z-index: 1000;
                display: none;
            `;

            // Position relative to search input
            const searchContainer = searchInput.parentElement;
            searchContainer.style.position = 'relative';
            searchContainer.appendChild(searchDropdown);

            return searchDropdown;
        }

        // Function to search for ingredients
        async function searchIngredients(query) {
            log(`searchIngredients called with query: "${query}"`, 'debug');

            if (!query || query.length < 2) {
                log(`Query too short (${query ? query.length : 0} chars), hiding dropdown`, 'debug');
                hideDropdown();
                return;
            }

            try {
                log(`Searching for ingredients: ${query}`, 'debug');

                // Fetch ingredients from the API
                const response = await fetch(`/api/recent-ingredients/search?q=${encodeURIComponent(query)}`);
                log(`API response status: ${response.status}`, 'debug');

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const ingredients = await response.json();
                log(`Found ${ingredients.length} ingredients`, 'debug');

                showSearchResults(ingredients);

            } catch (error) {
                log(`Error searching ingredients: ${error.message}`, 'error');
                hideDropdown();
            }
        }

        // Function to show search results
        function showSearchResults(ingredients) {
            log(`showSearchResults called with ${ingredients.length} ingredients`, 'debug');
            const dropdown = createSearchDropdown();
            log(`Dropdown created/retrieved: ${!!dropdown}`, 'debug');

            if (ingredients.length === 0) {
                dropdown.innerHTML = '<div style="padding: 10px; color: #999;">No ingredients found</div>';
            } else {
                dropdown.innerHTML = ingredients.map(ingredient => `
                    <div class="search-result-item" data-ingredient-id="${ingredient.id}" style="
                        padding: 10px;
                        cursor: pointer;
                        border-bottom: 1px solid #333;
                        color: #fff;
                    " onmouseover="this.style.backgroundColor='#333'"
                       onmouseout="this.style.backgroundColor='transparent'">
                        <div style="font-weight: bold;">${ingredient.name}</div>
                        <div style="font-size: 0.8em; color: #999;">
                            ${ingredient.calories} cal, ${ingredient.protein}g protein, ${ingredient.fats}g fat, ${ingredient.carbohydrates}g carbs
                        </div>
                    </div>
                `).join('');

                // Add click listeners to search results
                dropdown.querySelectorAll('.search-result-item').forEach(item => {
                    item.addEventListener('click', function() {
                        const ingredientId = this.dataset.ingredientId;
                        const ingredient = ingredients.find(ing => ing.id == ingredientId);
                        if (ingredient) {
                            selectIngredient(ingredient);
                        }
                    });
                });
            }

            dropdown.style.display = 'block';
        }

        // Function to select an ingredient and populate the form
        function selectIngredient(ingredient) {
            log(`Selected ingredient: ${ingredient.name}`, 'debug');

            // Set the search input value
            searchInput.value = ingredient.name;

            // Populate the form with ingredient data
            const nameInput = form.querySelector('.ingredient-name');
            if (nameInput) nameInput.value = ingredient.name;

            // Set nutrition data in hidden fields
            const caloriesInput = form.querySelector('.ingredient-calories');
            const proteinInput = form.querySelector('.ingredient-protein');
            const fatInput = form.querySelector('.ingredient-fat');
            const carbsInput = form.querySelector('.ingredient-carbs');

            if (caloriesInput) caloriesInput.value = ingredient.calories || 0;
            if (proteinInput) proteinInput.value = ingredient.protein || 0;
            if (fatInput) fatInput.value = ingredient.fats || 0;
            if (carbsInput) carbsInput.value = ingredient.carbohydrates || 0;

            // Store the ingredient ID for submission
            let ingredientIdInput = form.querySelector('.selected-ingredient-id');
            if (!ingredientIdInput) {
                ingredientIdInput = document.createElement('input');
                ingredientIdInput.type = 'hidden';
                ingredientIdInput.className = 'selected-ingredient-id';
                ingredientIdInput.name = 'ingredient-id';
                form.appendChild(ingredientIdInput);
            }
            ingredientIdInput.value = ingredient.id;

            hideDropdown();
        }

        // Function to hide dropdown
        function hideDropdown() {
            if (searchDropdown) {
                searchDropdown.style.display = 'none';
            }
        }

        // Add event listeners with multiple approaches to ensure they work
        log('Attaching search input event listener', 'debug');

        // Store reference to the search input for debugging
        window.debugSearchInput = searchInput;

        // Method 1: Direct event listeners with immediate test
        const handleSearchInput = function(e) {
            log(`Search input event triggered: ${e.target.value}`, 'debug');
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchIngredients(e.target.value);
            }, 300);
        };

        // Remove any existing listeners first
        searchInput.removeEventListener('input', handleSearchInput);
        searchInput.removeEventListener('keyup', handleSearchInput);

        // Add fresh listeners
        searchInput.addEventListener('input', handleSearchInput, { passive: false });
        searchInput.addEventListener('keyup', handleSearchInput, { passive: false });
        searchInput.addEventListener('change', handleSearchInput, { passive: false });

        // Method 2: Set oninput property as backup
        searchInput.oninput = handleSearchInput;
        searchInput.onkeyup = handleSearchInput;

        // Method 3: Focus event to trigger search if there's already text
        searchInput.addEventListener('focus', function(e) {
            log(`Search focus event triggered: ${e.target.value}`, 'debug');
            if (e.target.value.length >= 2) {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    searchIngredients(e.target.value);
                }, 100);
            }
        });

        // Method 4: Immediate test to see if there's already text
        if (searchInput.value && searchInput.value.length >= 2) {
            log(`Search input already has value: ${searchInput.value}`, 'debug');
            setTimeout(() => {
                searchIngredients(searchInput.value);
            }, 100);
        }

        // Method 5: Polling approach as ultimate fallback
        let lastValue = searchInput.value || '';
        const pollForChanges = setInterval(() => {
            if (searchInput.value !== lastValue) {
                lastValue = searchInput.value;
                if (lastValue.length >= 2) {
                    log(`Search polling detected change: ${lastValue}`, 'debug');
                    clearTimeout(searchTimeout);
                    searchTimeout = setTimeout(() => {
                        searchIngredients(lastValue);
                    }, 300);
                } else if (lastValue.length === 0) {
                    // Hide dropdown when search is cleared
                    hideDropdown();
                }
            }
        }, 500);

        // Store interval ID for cleanup
        searchInput.dataset.pollInterval = pollForChanges;

        log('Search event listeners attached successfully with multiple methods', 'debug');

        // Hide dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && (!searchDropdown || !searchDropdown.contains(e.target))) {
                hideDropdown();
            }
        });

        log('Ingredient search functionality setup complete', 'debug');
    }

    log('Initialized', 'log', true);
})();
