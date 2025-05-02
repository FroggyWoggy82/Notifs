/**
 * Ingredient Autocomplete
 * Provides autocomplete functionality for ingredient names based on previously used ingredients
 */

// Store the list of unique ingredients
let uniqueIngredients = [];

// Function to fetch unique ingredients from the API
async function fetchUniqueIngredients() {
    try {
        const response = await fetch('/api/unique-ingredients');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        uniqueIngredients = data.map(item => item.name);
        console.log(`Loaded ${uniqueIngredients.length} unique ingredients`);
        return uniqueIngredients;
    } catch (error) {
        console.error('Error fetching unique ingredients:', error);
        return [];
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
