/**
 * Ingredient Autofill
 * Automatically fills in all ingredient fields when selecting a previously used ingredient
 */

// Function to fetch ingredient details by name
async function fetchIngredientDetails(ingredientName) {
    try {
        console.log(`Fetching details for ingredient: ${ingredientName}`);

        // Use safeFetch if available, otherwise fall back to regular fetch
        const fetchFunction = window.safeFetch || fetch;

        // Encode the ingredient name for the URL
        const encodedName = encodeURIComponent(ingredientName);

        // First, try to find the ingredient in existing recipes
        try {
            // Get all recipes
            const recipesResponse = await fetchFunction('/api/recipes');
            if (recipesResponse.ok) {
                const recipes = await recipesResponse.json();

                // Search through all recipes for the ingredient
                for (const recipe of recipes) {
                    // Get recipe details with ingredients
                    const recipeDetailResponse = await fetchFunction(`/api/recipes/${recipe.id}`);
                    if (recipeDetailResponse.ok) {
                        const recipeDetail = await recipeDetailResponse.json();

                        // Find the ingredient in this recipe
                        const matchingIngredient = recipeDetail.ingredients.find(
                            ing => ing.name.toLowerCase() === ingredientName.toLowerCase()
                        );

                        if (matchingIngredient) {
                            console.log('Found matching ingredient in recipe:', recipe.name);
                            return matchingIngredient;
                        }
                    }
                }
            }
        } catch (searchError) {
            console.warn('Error searching recipes for ingredient:', searchError);
        }

        // If we couldn't find it in recipes, try the dedicated endpoint
        try {
            // Fetch ingredient details from the API
            const response = await fetchFunction(`/api/ingredient-details/${encodedName}`);

            if (!response.ok) {
                console.warn(`API endpoint not available: ${response.status}`);
                return null;
            }

            const data = await response.json();
            console.log('Ingredient details fetched from API:', data);
            return data;
        } catch (apiError) {
            console.warn('API endpoint error:', apiError);
            return null;
        }
    } catch (error) {
        console.error('Error fetching ingredient details:', error);
        return null;
    }
}

// Function to fill in all ingredient fields with the fetched data
function fillIngredientFields(ingredientData, event) {
    if (!ingredientData) return;

    console.log('Filling ingredient fields with:', ingredientData);

    // Get the parent ingredient item
    let ingredientItem;

    if (event && event.target) {
        ingredientItem = event.target.closest('.ingredient-item');
        console.log('Found ingredient item from event:', ingredientItem);
    }

    if (!ingredientItem) {
        // Fallback: try to find the ingredient item that contains the input with this name
        const allIngredientItems = document.querySelectorAll('.ingredient-item');
        const ingredientName = ingredientData.name;

        for (const item of allIngredientItems) {
            const nameInput = item.querySelector('.ingredient-name');
            if (nameInput && nameInput.value === ingredientName) {
                ingredientItem = item;
                console.log('Found ingredient item by name match:', ingredientItem);
                break;
            }
        }
    }

    // Last resort: just use the first ingredient item
    if (!ingredientItem) {
        ingredientItem = document.querySelector('.ingredient-item');
        console.log('Using first ingredient item as fallback:', ingredientItem);
    }

    if (!ingredientItem) {
        console.error('Ingredient item not found');
        return;
    }

    // Map of database field names to input field classes
    const fieldMap = {
        // General fields
        'amount': '.ingredient-amount',
        'package_amount': '.ingredient-package-amount',
        'price': '.ingredient-price',

        // General nutrition
        'calories': '.ingredient-calories, .nutrition-energy',
        'alcohol': '.nutrition-alcohol',
        'caffeine': '.nutrition-caffeine',
        'water': '.nutrition-water',

        // Carbohydrates
        'carbs': '.ingredient-carbs, .nutrition-carbs-total',
        'fiber': '.nutrition-fiber',
        'starch': '.nutrition-starch',
        'sugars': '.nutrition-sugars',
        'added_sugars': '.nutrition-added-sugars',
        'net_carbs': '.nutrition-net-carbs',

        // Lipids
        'fat': '.ingredient-fat, .nutrition-fat-total',
        'monounsaturated': '.nutrition-monounsaturated',
        'polyunsaturated': '.nutrition-polyunsaturated',
        'omega3': '.nutrition-omega3',
        'omega6': '.nutrition-omega6',
        'saturated': '.nutrition-saturated',
        'trans': '.nutrition-trans-fat',
        'cholesterol': '.nutrition-cholesterol',

        // Protein
        'protein': '.ingredient-protein, .nutrition-protein-total',
        'cystine': '.nutrition-cystine',
        'histidine': '.nutrition-histidine',
        'isoleucine': '.nutrition-isoleucine',
        'leucine': '.nutrition-leucine',
        'lysine': '.nutrition-lysine',
        'methionine': '.nutrition-methionine',
        'phenylalanine': '.nutrition-phenylalanine',
        'threonine': '.nutrition-threonine',
        'tryptophan': '.nutrition-tryptophan',
        'tyrosine': '.nutrition-tyrosine',
        'valine': '.nutrition-valine',

        // Vitamins
        'vitamin_a': '.nutrition-vitamin-a',
        'vitamin_c': '.nutrition-vitamin-c',
        'vitamin_d': '.nutrition-vitamin-d',
        'vitamin_e': '.nutrition-vitamin-e',
        'vitamin_k': '.nutrition-vitamin-k',
        'thiamin': '.nutrition-vitamin-b1',
        'riboflavin': '.nutrition-vitamin-b2',
        'niacin': '.nutrition-vitamin-b3',
        'vitamin_b6': '.nutrition-vitamin-b6',
        'folate': '.nutrition-folate',
        'vitamin_b12': '.nutrition-vitamin-b12',
        'pantothenic': '.nutrition-vitamin-b5',
        'biotin': '.nutrition-biotin',
        'choline': '.nutrition-choline',

        // Minerals
        'calcium': '.nutrition-calcium',
        'copper': '.nutrition-copper',
        'iron': '.nutrition-iron',
        'magnesium': '.nutrition-magnesium',
        'manganese': '.nutrition-manganese',
        'phosphorus': '.nutrition-phosphorus',
        'potassium': '.nutrition-potassium',
        'selenium': '.nutrition-selenium',
        'sodium': '.nutrition-sodium',
        'zinc': '.nutrition-zinc'
    };

    // Fill in each field if the data exists
    for (const [dbField, selector] of Object.entries(fieldMap)) {
        // Handle multiple selectors separated by commas
        const selectors = selector.split(',').map(s => s.trim());

        for (const singleSelector of selectors) {
            // Find the field within the ingredient item
            const inputField = ingredientItem.querySelector(singleSelector);

            if (inputField && ingredientData[dbField] !== undefined && ingredientData[dbField] !== null) {
                inputField.value = ingredientData[dbField];

                // Trigger change event to update any dependent calculations
                const event = new Event('change', { bubbles: true });
                inputField.dispatchEvent(event);

                console.log(`Set ${dbField} (${singleSelector}) to ${ingredientData[dbField]}`);

                // If this is a hidden field, also update any visible field with the same data
                if (inputField.type === 'hidden') {
                    // Look for a visible field with a similar class name
                    const visibleFieldClass = singleSelector.replace('ingredient-', 'nutrition-');
                    const visibleField = ingredientItem.querySelector(visibleFieldClass);
                    if (visibleField) {
                        visibleField.value = ingredientData[dbField];
                        visibleField.dispatchEvent(new Event('change', { bubbles: true }));
                        console.log(`Also set ${visibleFieldClass} to ${ingredientData[dbField]}`);
                    }
                }
            }
        }
    }
}

// Function to handle ingredient name input change
async function handleIngredientNameChange(event) {
    const ingredientName = event.target.value.trim();
    if (!ingredientName) return;

    console.log(`Ingredient name changed to: ${ingredientName}`);

    // Fetch ingredient details
    const ingredientData = await fetchIngredientDetails(ingredientName);

    // Fill in the fields if data was found
    if (ingredientData) {
        fillIngredientFields(ingredientData, event);
    }
}

// Function to initialize autofill for ingredient name inputs
function initializeIngredientAutofill() {
    // Find all ingredient name inputs
    const ingredientNameInputs = document.querySelectorAll('.ingredient-name');

    ingredientNameInputs.forEach(input => {
        // Remove any existing event listeners (to prevent duplicates)
        input.removeEventListener('change', handleIngredientNameChange);

        // Add the change event listener
        input.addEventListener('change', handleIngredientNameChange);

        console.log('Added autofill to ingredient input:', input);
    });
}

// Event listener for when a new ingredient is added
document.addEventListener('ingredientAdded', function(e) {
    // Find the newly added ingredient input
    const newIngredientItem = e.detail.ingredientItem;
    if (newIngredientItem) {
        const newInput = newIngredientItem.querySelector('.ingredient-name');
        if (newInput) {
            // Add the change event listener
            newInput.addEventListener('change', handleIngredientNameChange);
            console.log('Added autofill to new ingredient input');
        }
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize autofill for existing ingredient inputs
    initializeIngredientAutofill();

    console.log('Ingredient autofill initialized');
});

// Also initialize when the edit form is opened
document.addEventListener('editFormOpened', function() {
    // Initialize autofill for the edit form
    setTimeout(initializeIngredientAutofill, 500); // Wait for the form to be fully rendered
    console.log('Ingredient autofill initialized for edit form');
});
