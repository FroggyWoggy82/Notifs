/**
 * Unified Add Ingredient Handler
 * Consolidates all "Add Ingredient" button functionality to prevent duplicate modals
 * and ensure proper button alignment
 */

(function() {
    'use strict';

    console.log('[Unified Add Ingredient Handler] Loading...');

    // Flag to prevent multiple initializations
    let isInitialized = false;
    
    // Store active modals to prevent duplicates
    let activeModals = new Set();

    function log(message, type = 'info') {
        const prefix = '[Unified Add Ingredient Handler]';
        switch (type) {
            case 'error':
                console.error(`${prefix} ${message}`);
                break;
            case 'warn':
                console.warn(`${prefix} ${message}`);
                break;
            default:
                console.log(`${prefix} ${message}`);
        }
    }

    function removeExistingEventListeners() {
        // Remove all existing event listeners by cloning and replacing buttons
        const addIngredientButtons = document.querySelectorAll('.add-ingredient-btn-inline, .add-ingredient-btn, [class*="add-ingredient"]');
        
        addIngredientButtons.forEach(button => {
            if (button.textContent.includes('Add Ingredient') || button.textContent.includes('➕')) {
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                log(`Removed existing event listeners from button: ${newButton.textContent.trim()}`);
            }
        });
    }

    function addNewIngredientRow() {
        log('Adding new ingredient row...');

        const ingredientsList = document.getElementById('ingredients-list');
        if (!ingredientsList) {
            log('Ingredients list not found - this is normal for recipe card buttons', 'warn');
            return;
        }

        // Create new ingredient item HTML
        const newIngredientHTML = `
            <div class="ingredient-item">
                <!-- Header Section -->
                <div class="ingredient-header">
                    <div class="ingredient-type-selector">
                        <div class="ingredient-type-option active" data-type="new">
                            <input type="radio" name="ingredient-selection-type-${Date.now()}" value="new" class="ingredient-selection-radio" checked>
                            <span>✨ Create New</span>
                        </div>
                        <div class="ingredient-type-option" data-type="existing">
                            <input type="radio" name="ingredient-selection-type-${Date.now()}" value="existing" class="ingredient-selection-radio">
                            <span>📋 Use Existing</span>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons Row (underneath radio buttons) -->
                <div class="ingredient-header-buttons">
                    <div class="header-buttons-grid">
                        <button type="button" class="action-btn action-btn-secondary toggle-detailed-nutrition">
                            <span>📋</span> Show Detailed Nutrition
                        </button>
                        <button type="button" class="action-btn action-btn-danger remove-ingredient-btn" title="Remove Ingredient">
                            <span>🗑️</span> Remove
                        </button>
                    </div>
                </div>

                <!-- Main Content Area -->
                <div class="ingredient-content">
                    <!-- Left Column: Primary Inputs -->
                    <div class="ingredient-primary-inputs">
                        <!-- Search Section (hidden by default) -->
                        <div class="ingredient-search-section">
                            <div class="search-input-wrapper">
                                <input type="text" class="ingredient-search-input" placeholder="Search existing ingredients...">
                            </div>
                        </div>

                        <!-- Input Grid -->
                        <div class="ingredient-inputs-grid">
                            <div class="input-group">
                                <label class="input-label">Ingredient Name</label>
                                <input type="text" class="form-input ingredient-name" placeholder="Enter ingredient name" required>
                            </div>
                            <div class="input-group">
                                <label class="input-label">Amount (g)</label>
                                <input type="number" class="form-input ingredient-amount" placeholder="0" step="0.01" required>
                            </div>
                            <div class="input-group">
                                <label class="input-label">Package Price</label>
                                <input type="number" class="form-input ingredient-price" placeholder="0.00" step="0.01" required>
                            </div>
                        </div>

                        <!-- Additional Fields Row -->
                        <div class="ingredient-inputs-grid">
                            <div class="input-group">
                                <label class="input-label">Package Amount (g)</label>
                                <input type="number" class="form-input ingredient-package-amount" placeholder="Optional" step="0.01">
                            </div>
                            <div class="input-group">
                                <label class="input-label">Grocery Store</label>
                                <input type="text" class="form-input grocery-store-input" placeholder="Optional">
                            </div>
                            <div class="input-group">
                                <!-- Spacer for alignment -->
                            </div>
                        </div>

                        <!-- Cronometer Section -->
                        <div class="cronometer-section">
                            <div class="cronometer-header">
                                <span class="cronometer-icon">📊</span>
                                <span class="cronometer-title">Nutrition Data Parser</span>
                            </div>
                            <textarea class="cronometer-textarea cronometer-text-paste-area"
                                     placeholder="Paste Cronometer nutrition data here for automatic parsing..."></textarea>
                            <button type="button" class="cronometer-parse-btn cronometer-parse-button">
                                Parse Nutrition Data
                            </button>
                            <div class="cronometer-parse-status"></div>
                        </div>

                        <!-- Hidden fields for form submission -->
                        <input type="hidden" class="ingredient-calories" required>
                        <input type="hidden" class="ingredient-protein" required>
                        <input type="hidden" class="ingredient-fat" required>
                        <input type="hidden" class="ingredient-carbs" required>
                    </div>

                    <!-- Right Column: Actions & Nutrition -->
                    <div class="ingredient-sidebar">
                        <!-- Action Buttons -->
                        <div class="action-buttons-section">
                            <div class="action-buttons-grid">
                                <button type="button" class="action-btn action-btn-primary add-ingredient-btn-inline">
                                    <span>➕</span> Add Ingredient
                                </button>
                            </div>
                        </div>

                        <!-- Nutrition Panel -->
                        <div class="nutrition-panel detailed-nutrition-panel" style="display: none;">
                            <div class="nutrition-panel-header">
                                <span class="nutrition-panel-title">Detailed Nutrition</span>
                                <button type="button" class="action-btn action-btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="this.closest('.nutrition-panel').style.display='none'">
                                    ✕
                                </button>
                            </div>
                            <div class="nutrition-panel-content">
                                <!-- Nutrition content will be populated here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Create a temporary container and add the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newIngredientHTML;
        const newIngredientItem = tempDiv.firstElementChild;

        // Add the new ingredient item to the list
        ingredientsList.appendChild(newIngredientItem);

        // Initialize event listeners for the new ingredient item
        initializeIngredientItemEventListeners(newIngredientItem);

        // Initialize Cronometer text parser if available
        if (typeof window.initializeCronometerTextParser === 'function') {
            window.initializeCronometerTextParser(newIngredientItem);
        }

        // Scroll to the new ingredient item
        newIngredientItem.scrollIntoView({ behavior: 'smooth', block: 'start' });

        log('New ingredient row added successfully');
    }

    function initializeIngredientItemEventListeners(ingredientItem) {
        log('Initializing event listeners for ingredient item');

        // Add event listeners for remove button
        const removeBtn = ingredientItem.querySelector('.remove-ingredient-btn');
        if (removeBtn) {
            // Remove any existing event listeners
            const newRemoveBtn = removeBtn.cloneNode(true);
            removeBtn.parentNode.replaceChild(newRemoveBtn, removeBtn);

            newRemoveBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                ingredientItem.remove();
            });
            log('Remove button event listener attached');
        } else {
            log('Remove button not found in ingredient item', 'warn');
        }

        // Add event listeners for toggle nutrition panel
        const toggleBtn = ingredientItem.querySelector('.toggle-detailed-nutrition');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                const panel = ingredientItem.querySelector('.nutrition-panel');
                if (panel) {
                    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
                    log('Nutrition panel toggled');
                }
            });
        }

        // Add event listeners for ingredient type selection
        const typeOptions = ingredientItem.querySelectorAll('.ingredient-type-option');
        typeOptions.forEach(option => {
            option.addEventListener('click', function(e) {
                e.preventDefault();

                // Remove active class from all options
                typeOptions.forEach(opt => opt.classList.remove('active'));
                // Add active class to clicked option
                this.classList.add('active');

                // Check the radio button
                const radio = this.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                }

                // Show/hide search section based on selection
                const searchSection = ingredientItem.querySelector('.ingredient-search-section');
                if (searchSection) {
                    searchSection.style.display = this.dataset.type === 'existing' ? 'block' : 'none';
                }

                log('Ingredient type selection changed to: ' + this.dataset.type);
            });
        });
    }

    function handleAddIngredientClick(event) {
        // Prevent default behavior and stop propagation
        event.preventDefault();
        event.stopPropagation();

        const button = event.target.closest('.add-ingredient-btn-inline, .add-ingredient-btn, [class*="add-ingredient"]');
        if (!button) return;

        // IMPORTANT: Skip buttons that are part of recipe cards (handled by direct-recipe-button-fix.js)
        if (button.closest('.recipe-card') || button.dataset.recipeId) {
            log('Skipping recipe card add ingredient button - handled by direct-recipe-button-fix.js');
            return;
        }

        // Check if this is actually an "Add Ingredient" button
        const buttonText = button.textContent.trim();
        if (!buttonText.includes('Add Ingredient') && !buttonText.includes('➕')) {
            return;
        }

        // Check if we already have the maximum number of ingredient rows to prevent spam
        const ingredientsList = document.getElementById('ingredients-list');

        if (!ingredientsList) {
            log('Ingredients list not found - this might be a recipe card button');
            return;
        }

        const existingRows = ingredientsList.querySelectorAll('.ingredient-item').length;

        if (existingRows >= 10) {
            log('Maximum number of ingredient rows reached', 'warn');
            return;
        }

        log('Add Ingredient button clicked');

        // Add new ingredient row
        addNewIngredientRow();
    }

    function initializeUnifiedHandler() {
        if (isInitialized) {
            log('Already initialized, skipping');
            return;
        }

        log('Initializing unified Add Ingredient handler...');

        // Remove existing event listeners
        removeExistingEventListeners();

        // Add single unified event listener for Add Ingredient buttons
        document.addEventListener('click', handleAddIngredientClick, true);

        // Add event listener for remove buttons (using event delegation)
        document.addEventListener('click', function(event) {
            if (event.target.closest('.remove-ingredient-btn')) {
                event.preventDefault();
                event.stopPropagation();

                const removeBtn = event.target.closest('.remove-ingredient-btn');
                const ingredientItem = removeBtn.closest('.ingredient-item');

                if (ingredientItem) {
                    ingredientItem.remove();
                }
            }
        }, true);

        // Initialize existing ingredient items
        const existingItems = document.querySelectorAll('.ingredient-item');
        log(`Found ${existingItems.length} existing ingredient items to initialize`);
        existingItems.forEach((item, index) => {
            log(`Initializing existing ingredient item ${index + 1}`);
            initializeIngredientItemEventListeners(item);
        });

        isInitialized = true;
        log('Unified Add Ingredient handler initialized successfully');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeUnifiedHandler);
    } else {
        initializeUnifiedHandler();
    }

    // Also initialize after a short delay to ensure all other scripts have loaded
    setTimeout(initializeUnifiedHandler, 500);

    // Expose functions globally if needed
    window.unifiedAddIngredientHandler = {
        addNewIngredientRow: addNewIngredientRow,
        reinitialize: initializeUnifiedHandler
    };

})();
