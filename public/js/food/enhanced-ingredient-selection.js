/**
 * Enhanced Ingredient Selection
 * Provides improved functionality for selecting existing ingredients in recipes
 */

// Store all ingredients data for searching
let allIngredients = [];

/**
 * Initialize the enhanced ingredient selection functionality
 */
function initializeEnhancedIngredientSelection() {
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
    // Look for ingredient rows in the create recipe section
    const ingredientRows = document.querySelectorAll('#ingredients-list .ingredient-row');

    if (ingredientRows.length === 0) {
        // Try a more general selector
        const allIngredientRows = document.querySelectorAll('.ingredient-row');

        // Try to identify the ingredient container
        const ingredientsList = document.getElementById('ingredients-list');
        if (!ingredientsList) {
            return;
        }
    }

    ingredientRows.forEach((row, index) => {
        // Check if the row already has selection UI
        if (row.querySelector('.selection-row')) {
            return;
        }

        // Create a unique ID for this row's elements
        const rowId = `ingredient-row-${index}`;

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
            inputsContainer.insertBefore(selectionUI, inputsContainer.firstChild);
        } else {
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
            throw new Error('Invalid recipe data format');
        }

        allIngredients = [];

        // Extract all ingredients from all recipes
        recipes.forEach(recipe => {
            // Check if we need to fetch ingredients separately
            if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) {
                return; // Skip this recipe
            }

            recipe.ingredients.forEach(ingredient => {

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

        // Populate all dropdowns with the ingredients
        populateAllDropdowns();
    } catch (error) {
        // Silent error handling
    }
}

/**
 * Populate all ingredient dropdowns with the loaded ingredients
 */
function populateAllDropdowns() {
    const dropdowns = document.querySelectorAll('.existing-ingredient-select');

    dropdowns.forEach((dropdown, index) => {
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

        // Initialize the searchable dropdown
        initializeSearchableDropdown(dropdown);
    });

    if (dropdowns.length === 0) {
        // Try to add the selection UI to any ingredient rows that might be missing it
        addSelectionUIToIngredientRows();

        // Try again to find dropdowns
        const newDropdowns = document.querySelectorAll('.existing-ingredient-select');

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
        fillIngredientFields(selectedIngredient, selectElement);
        return;
    }

    // If not found in cache, fetch from API
    const [recipeId, ingredientId] = combinedId.split(':');
    if (!recipeId || !ingredientId) {
        return;
    }

    try {
        // Use the existing recipe-specific ingredient endpoint
        const response = await fetch(`/api/recipes/${recipeId}/ingredients/${ingredientId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const ingredient = await response.json();

        // Fill the form fields with the ingredient data
        fillIngredientFields(ingredient, selectElement);
    } catch (error) {
        // Silent error handling
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
