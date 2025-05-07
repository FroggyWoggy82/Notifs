/**
 * Ingredient Autocomplete
 * Provides autocomplete functionality for ingredient names based on previously used ingredients
 */

// Store the list of unique ingredients
let uniqueIngredients = [];

// Function to fetch unique ingredients from the API
async function fetchUniqueIngredients() {
    try {
        // Use safeFetch if available, otherwise fall back to regular fetch
        const fetchFunction = window.safeFetch || fetch;

        // Try to fetch unique ingredients
        const response = await fetchFunction('/api/unique-ingredients');

        // If the response is not OK, use a fallback
        if (!response.ok) {
            console.debug('Using fallback for unique ingredients');
            // Return some common ingredients as a fallback
            uniqueIngredients = [
                'Chicken Breast',
                'Eggs',
                'Milk',
                'Butter',
                'Olive Oil',
                'Rice',
                'Pasta',
                'Bread',
                'Cheese',
                'Tomato',
                'Onion',
                'Garlic',
                'Potato',
                'Carrot',
                'Broccoli',
                'Spinach',
                'Apple',
                'Banana',
                'Orange',
                'Beef',
                'Pork',
                'Fish',
                'Shrimp',
                'Avocado',
                'Yogurt'
            ];
            return uniqueIngredients;
        }

        // Process the response
        const data = await response.json();

        // If we got a simulated response, use the fallback
        if (data.simulated) {
            console.debug('Using fallback for unique ingredients (simulated response)');
            uniqueIngredients = [
                'Chicken Breast',
                'Eggs',
                'Milk',
                'Butter',
                'Olive Oil',
                'Rice',
                'Pasta',
                'Bread',
                'Cheese',
                'Tomato',
                'Onion',
                'Garlic',
                'Potato',
                'Carrot',
                'Broccoli',
                'Spinach',
                'Apple',
                'Banana',
                'Orange',
                'Beef',
                'Pork',
                'Fish',
                'Shrimp',
                'Avocado',
                'Yogurt'
            ];
        } else {
            // Use the real data
            uniqueIngredients = data.map(item => item.name);
            console.debug(`Loaded ${uniqueIngredients.length} unique ingredients`);
        }

        return uniqueIngredients;
    } catch (error) {
        console.debug('Error fetching unique ingredients - using fallback');

        // Return some common ingredients as a fallback
        uniqueIngredients = [
            'Chicken Breast',
            'Eggs',
            'Milk',
            'Butter',
            'Olive Oil',
            'Rice',
            'Pasta',
            'Bread',
            'Cheese',
            'Tomato',
            'Onion',
            'Garlic',
            'Potato',
            'Carrot',
            'Broccoli',
            'Spinach',
            'Apple',
            'Banana',
            'Orange',
            'Beef',
            'Pork',
            'Fish',
            'Shrimp',
            'Avocado',
            'Yogurt'
        ];
        return uniqueIngredients;
    }
}

// Function to initialize autocomplete for an ingredient input field
function initializeIngredientAutocomplete(inputElement) {
    if (!inputElement) return;

    // Create a datalist element for autocomplete
    const datalistId = `ingredient-list-${Math.random().toString(36).substring(2, 9)}`;
    const datalist = document.createElement('datalist');
    datalist.id = datalistId;

    // Add the datalist to the document
    document.body.appendChild(datalist);

    // Set the input's list attribute to reference the datalist
    inputElement.setAttribute('list', datalistId);

    // Populate the datalist with options
    populateDatalist(datalist);
}

// Function to populate a datalist with ingredient options
function populateDatalist(datalist) {
    // Clear existing options
    datalist.innerHTML = '';

    // Add options for each unique ingredient
    uniqueIngredients.forEach(ingredient => {
        const option = document.createElement('option');
        option.value = ingredient;
        datalist.appendChild(option);
    });
}

// Function to initialize autocomplete for all ingredient name inputs
function initializeAllIngredientAutocomplete() {
    const ingredientInputs = document.querySelectorAll('.ingredient-name');
    ingredientInputs.forEach(input => {
        initializeIngredientAutocomplete(input);
    });
}

// Event listener for when a new ingredient is added
document.addEventListener('ingredientAdded', function(e) {
    // Find the newly added ingredient input
    const newIngredientItem = e.detail.ingredientItem;
    if (newIngredientItem) {
        const newInput = newIngredientItem.querySelector('.ingredient-name');
        if (newInput) {
            initializeIngredientAutocomplete(newInput);
        }
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    // Fetch unique ingredients first
    await fetchUniqueIngredients();

    // Initialize autocomplete for existing ingredient inputs
    initializeAllIngredientAutocomplete();
});
