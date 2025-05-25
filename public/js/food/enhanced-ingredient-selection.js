/**
 * Enhanced Ingredient Selection
 * Provides improved functionality for selecting existing ingredients in recipes
 */

console.log('ENHANCED INGREDIENT SELECTION SCRIPT LOADED');

// Store all ingredients data for searching
let allIngredients = [];

/**
 * Initialize the enhanced ingredient selection functionality
 */
function initializeEnhancedIngredientSelection() {
    console.log('Initializing enhanced ingredient selection');

    // Add the selection type radio buttons and dropdown to each ingredient row
    addSelectionUIToIngredientRows();

    // Load existing ingredients for the dropdown
    loadAllExistingIngredients();

    // Set up event listeners for the radio buttons
    setupRadioButtonListeners();
}

/**
 * Add selection UI (radio buttons and dropdown) to all ingredient rows
 */
function addSelectionUIToIngredientRows() {
    console.log('[Enhanced Ingredient Selection] Adding selection UI to ingredient rows');

    // Look for ingredient rows in the create recipe section
    const ingredientRows = document.querySelectorAll('#ingredients-list .ingredient-row');
    console.log(`[Enhanced Ingredient Selection] Found ${ingredientRows.length} ingredient rows`);

    if (ingredientRows.length === 0) {
        console.log('[Enhanced Ingredient Selection] No ingredient rows found with selector "#ingredients-list .ingredient-row"');

        // Try a more general selector
        const allIngredientRows = document.querySelectorAll('.ingredient-row');
        console.log(`[Enhanced Ingredient Selection] Found ${allIngredientRows.length} ingredient rows with general selector`);

        // Try to identify the ingredient container
        const ingredientsList = document.getElementById('ingredients-list');
        if (ingredientsList) {
            console.log('[Enhanced Ingredient Selection] Found ingredients-list container');
            console.log('[Enhanced Ingredient Selection] Container HTML:', ingredientsList.innerHTML);
        } else {
            console.warn('[Enhanced Ingredient Selection] Could not find ingredients-list container');
        }
    }

    ingredientRows.forEach((row, index) => {
        console.log(`[Enhanced Ingredient Selection] Processing row #${index + 1}`);

        // Check if the row already has selection UI
        if (row.querySelector('.selection-row')) {
            console.log(`[Enhanced Ingredient Selection] Row #${index + 1} already has selection UI, skipping`);
            return;
        }

        // Create a unique ID for this row's elements
        const rowId = `ingredient-row-${index}`;
        console.log(`[Enhanced Ingredient Selection] Creating selection UI with ID: ${rowId}`);

        // Create the selection UI
        const selectionUI = document.createElement('div');
        selectionUI.className = 'selection-row';
        selectionUI.innerHTML = `
            <div class="selection-type">
                <label>
                    <input type="radio" name="ingredient-selection-type-${rowId}" value="existing" class="ingredient-selection-radio">
                    Use existing
                </label>
                <label>
                    <input type="radio" name="ingredient-selection-type-${rowId}" value="new" class="ingredient-selection-radio" checked>
                    Create new
                </label>
            </div>
            <div class="existing-ingredient-selection" style="display: none;">
                <select class="existing-ingredient-select" data-row-id="${rowId}">
                    <option value="">Select an ingredient</option>
                </select>
            </div>
        `;

        // Insert the selection UI at the beginning of the row
        const inputsContainer = row.querySelector('.ingredient-inputs-container');
        if (inputsContainer) {
            console.log(`[Enhanced Ingredient Selection] Found inputs container for row #${index + 1}, inserting UI`);
            inputsContainer.insertBefore(selectionUI, inputsContainer.firstChild);
        } else {
            console.warn(`[Enhanced Ingredient Selection] Could not find inputs container for row #${index + 1}`);
            console.log(`[Enhanced Ingredient Selection] Row HTML:`, row.innerHTML);

            // Try to insert at the beginning of the row as a fallback
            row.insertBefore(selectionUI, row.firstChild);
        }
    });

    // Set up event listeners for the newly added radio buttons
    setupRadioButtonListeners();
}

/**
 * Load all existing ingredients from all recipes
 */
async function loadAllExistingIngredients() {
    try {
        console.log('[Enhanced Ingredient Selection] Loading all existing ingredients');

        // Use the existing recipes API endpoint
        const response = await fetch('/api/recipes');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();

        // Handle both old format (direct array) and new format (object with recipes property)
        let recipes;
        if (Array.isArray(responseData)) {
            // Old format: direct array
            recipes = responseData;
        } else if (responseData && responseData.success && Array.isArray(responseData.recipes)) {
            // New format: object with success and recipes properties
            recipes = responseData.recipes;
        } else {
            console.error('[Enhanced Ingredient Selection] Invalid response format:', responseData);
            throw new Error('Invalid recipe data format');
        }

        console.log('[Enhanced Ingredient Selection] Recipes loaded:', recipes.length);

        allIngredients = [];

        // Extract all ingredients from all recipes
        recipes.forEach(recipe => {
            console.log(`[Enhanced Ingredient Selection] Processing recipe: ${recipe.name}, ID: ${recipe.id}`);

            // Check if we need to fetch ingredients separately
            if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) {
                console.log(`[Enhanced Ingredient Selection] No ingredients array found for recipe ${recipe.name}`);
                return; // Skip this recipe
            }

            console.log(`[Enhanced Ingredient Selection] Recipe ${recipe.name} has ${recipe.ingredients.length} ingredients`);

            recipe.ingredients.forEach(ingredient => {
                console.log(`[Enhanced Ingredient Selection] Adding ingredient: ${ingredient.name}, ID: ${ingredient.id}`);

                allIngredients.push({
                    id: ingredient.id,
                    name: ingredient.name,
                    recipe_id: recipe.id,
                    recipe_name: recipe.name,
                    amount: ingredient.amount,
                    calories: ingredient.calories,
                    protein: ingredient.protein,
                    fats: ingredient.fats,
                    carbohydrates: ingredient.carbohydrates,
                    package_amount: ingredient.package_amount,
                    price: ingredient.price,
                    display: `${ingredient.name} (from ${recipe.name})`,
                    value: `${recipe.id}:${ingredient.id}`
                });
            });
        });

        // Sort ingredients alphabetically by name
        allIngredients.sort((a, b) => a.name.localeCompare(b.name));

        console.log(`[Enhanced Ingredient Selection] Loaded ${allIngredients.length} ingredients`);

        // Populate all dropdowns with the ingredients
        populateAllDropdowns();
    } catch (error) {
        console.error('[Enhanced Ingredient Selection] Error loading existing ingredients:', error);
    }
}

/**
 * Populate all ingredient dropdowns with the loaded ingredients
 */
function populateAllDropdowns() {
    console.log('[Enhanced Ingredient Selection] Populating dropdowns with ingredients');

    const dropdowns = document.querySelectorAll('.existing-ingredient-select');
    console.log(`[Enhanced Ingredient Selection] Found ${dropdowns.length} dropdowns to populate`);

    dropdowns.forEach((dropdown, index) => {
        console.log(`[Enhanced Ingredient Selection] Populating dropdown #${index + 1}`);

        // Clear existing options except the first one
        while (dropdown.options.length > 1) {
            dropdown.remove(1);
        }

        // Add options for each ingredient
        allIngredients.forEach(ingredient => {
            const option = document.createElement('option');
            option.value = ingredient.value;
            option.text = ingredient.display;
            option.dataset.name = ingredient.name;
            dropdown.appendChild(option);
        });

        console.log(`[Enhanced Ingredient Selection] Added ${allIngredients.length} options to dropdown #${index + 1}`);

        // Initialize the searchable dropdown
        initializeSearchableDropdown(dropdown);
    });

    if (dropdowns.length === 0) {
        console.warn('[Enhanced Ingredient Selection] No dropdowns found to populate!');
        console.log('[Enhanced Ingredient Selection] Looking for ingredient rows to add selection UI to');

        // Try to add the selection UI to any ingredient rows that might be missing it
        addSelectionUIToIngredientRows();

        // Try again to find dropdowns
        const newDropdowns = document.querySelectorAll('.existing-ingredient-select');
        console.log(`[Enhanced Ingredient Selection] After adding UI, found ${newDropdowns.length} dropdowns`);

        if (newDropdowns.length > 0) {
            // Call this function again to populate the newly added dropdowns
            populateAllDropdowns();
        }
    }
}

/**
 * Set up event listeners for the radio buttons
 */
function setupRadioButtonListeners() {
    const radioButtons = document.querySelectorAll('.ingredient-selection-radio');

    radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
            const row = this.closest('.ingredient-row');
            const selectionDiv = row.querySelector('.existing-ingredient-selection');
            const nameInput = row.querySelector('.ingredient-name');

            if (this.value === 'existing') {
                // Show existing ingredient dropdown, disable name field
                selectionDiv.style.display = 'block';
                nameInput.disabled = true;
            } else {
                // Hide existing ingredient dropdown, enable name field
                selectionDiv.style.display = 'none';
                nameInput.disabled = false;
                nameInput.value = '';

                // Clear all nutrition fields
                clearNutritionFields(row);
            }
        });
    });

    // Set up event listeners for the dropdowns
    const dropdowns = document.querySelectorAll('.existing-ingredient-select');
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('change', function() {
            if (this.value) {
                fetchAndFillIngredientDetails(this.value, this);
            }
        });
    });
}

/**
 * Initialize a searchable dropdown
 */
function initializeSearchableDropdown(selectElement) {
    // Create a search input
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'ingredient-search-input';
    searchInput.placeholder = 'Search ingredients...';

    // Insert the search input before the select element
    selectElement.parentNode.insertBefore(searchInput, selectElement);

    // Add event listener for the search input
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        filterDropdownOptions(selectElement, searchTerm);
    });
}

/**
 * Filter dropdown options based on search term
 */
function filterDropdownOptions(selectElement, searchTerm) {
    const options = selectElement.querySelectorAll('option');

    options.forEach(option => {
        if (option.value === '') return; // Skip the placeholder option

        const optionText = option.text.toLowerCase();
        const optionName = option.dataset.name ? option.dataset.name.toLowerCase() : '';

        if (optionText.includes(searchTerm) || optionName.includes(searchTerm)) {
            option.style.display = '';
        } else {
            option.style.display = 'none';
        }
    });
}

/**
 * Fetch ingredient details and fill the form fields
 */
async function fetchAndFillIngredientDetails(combinedId, selectElement) {
    // First, try to find the ingredient in our local cache
    const selectedIngredient = allIngredients.find(ingredient =>
        `${ingredient.recipe_id}:${ingredient.id}` === combinedId
    );

    if (selectedIngredient) {
        console.log('Using cached ingredient details:', selectedIngredient);
        fillIngredientFields(selectedIngredient, selectElement);
        return;
    }

    // If not found in cache, fetch from API
    const [recipeId, ingredientId] = combinedId.split(':');
    if (!recipeId || !ingredientId) {
        console.error('Invalid ingredient ID format');
        return;
    }

    try {
        // Use the existing recipe-specific ingredient endpoint
        const response = await fetch(`/api/recipes/${recipeId}/ingredients/${ingredientId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const ingredient = await response.json();
        console.log('Fetched ingredient details:', ingredient);

        // Fill the form fields with the ingredient data
        fillIngredientFields(ingredient, selectElement);
    } catch (error) {
        console.error('Error fetching ingredient details:', error);
    }
}

/**
 * Fill ingredient form fields with the fetched data
 */
function fillIngredientFields(ingredient, element) {
    const row = element.closest('.ingredient-row');

    // Set the name field
    const nameInput = row.querySelector('.ingredient-name');
    if (nameInput) {
        nameInput.value = ingredient.name;
    }

    // Set the amount field
    const amountInput = row.querySelector('.ingredient-amount');
    if (amountInput) {
        amountInput.value = ingredient.amount || '';
    }

    // Set the package amount field
    const packageAmountInput = row.querySelector('.ingredient-package-amount');
    if (packageAmountInput) {
        packageAmountInput.value = ingredient.package_amount || '';
    }

    // Set the price field
    const priceInput = row.querySelector('.ingredient-price');
    if (priceInput) {
        priceInput.value = ingredient.price || '';
    }

    // Fill nutrition fields
    fillNutritionFields(row, ingredient);

    // Trigger a custom event to notify that ingredient fields have been filled
    const event = new CustomEvent('ingredientFieldsFilled', {
        detail: { ingredient, row }
    });
    document.dispatchEvent(event);
}

/**
 * Fill nutrition fields in the form
 */
function fillNutritionFields(row, ingredient) {
    // Map of field classes to ingredient properties
    const fieldMap = {
        'ingredient-calories': 'calories',
        'ingredient-protein': 'protein',
        'ingredient-fats': 'fats',
        'ingredient-carbs': 'carbohydrates',
        // Add more nutrition fields as needed
        'ingredient-fiber': 'fiber',
        'ingredient-sugar': 'sugar',
        'ingredient-sodium': 'sodium',
        'ingredient-cholesterol': 'cholesterol',
        'ingredient-saturated-fat': 'saturated_fat',
        'ingredient-trans-fat': 'trans_fat',
        'ingredient-monounsaturated-fat': 'monounsaturated_fat',
        'ingredient-polyunsaturated-fat': 'polyunsaturated_fat',
        'ingredient-omega3': 'omega3',
        'ingredient-omega6': 'omega6'
    };

    // Fill each field
    for (const [fieldClass, propName] of Object.entries(fieldMap)) {
        const field = row.querySelector(`.${fieldClass}`);
        if (field && ingredient[propName] !== undefined) {
            field.value = ingredient[propName];
        }
    }

    // Also fill any hidden nutrition fields
    const hiddenFields = row.querySelectorAll('input[type="hidden"][name^="ingredient-"]');
    hiddenFields.forEach(field => {
        const fieldName = field.name.replace('ingredient-', '').replace(/-/g, '_');
        if (ingredient[fieldName] !== undefined) {
            field.value = ingredient[fieldName];
        }
    });
}

/**
 * Clear all nutrition fields in a row
 */
function clearNutritionFields(row) {
    const fields = row.querySelectorAll('input[type="hidden"]');
    fields.forEach(field => {
        field.value = '';
    });
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeEnhancedIngredientSelection();

    // Also initialize when a new ingredient row is added
    document.addEventListener('ingredientAdded', function(e) {
        // Wait a bit for the DOM to update
        setTimeout(() => {
            addSelectionUIToIngredientRows();
            setupRadioButtonListeners();
            populateAllDropdowns();
        }, 100);
    });
});
