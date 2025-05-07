/**
 * Ingredient Autocomplete
 * Provides autocomplete functionality for ingredient names based on previously used ingredients
 */

let uniqueIngredients = [];

async function fetchUniqueIngredients() {
    try {

        const fetchFunction = window.safeFetch || fetch;

        const response = await fetchFunction('/api/unique-ingredients');

        if (!response.ok) {
            console.debug('Using fallback for unique ingredients');

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

        const data = await response.json();

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

            uniqueIngredients = data.map(item => item.name);
            console.debug(`Loaded ${uniqueIngredients.length} unique ingredients`);
        }

        return uniqueIngredients;
    } catch (error) {
        console.debug('Error fetching unique ingredients - using fallback');

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

function initializeIngredientAutocomplete(inputElement) {
    if (!inputElement) return;

    const datalistId = `ingredient-list-${Math.random().toString(36).substring(2, 9)}`;
    const datalist = document.createElement('datalist');
    datalist.id = datalistId;

    document.body.appendChild(datalist);

    inputElement.setAttribute('list', datalistId);

    populateDatalist(datalist);
}

function populateDatalist(datalist) {

    datalist.innerHTML = '';

    uniqueIngredients.forEach(ingredient => {
        const option = document.createElement('option');
        option.value = ingredient;
        datalist.appendChild(option);
    });
}

function initializeAllIngredientAutocomplete() {
    const ingredientInputs = document.querySelectorAll('.ingredient-name');
    ingredientInputs.forEach(input => {
        initializeIngredientAutocomplete(input);
    });
}

document.addEventListener('ingredientAdded', function(e) {

    const newIngredientItem = e.detail.ingredientItem;
    if (newIngredientItem) {
        const newInput = newIngredientItem.querySelector('.ingredient-name');
        if (newInput) {
            initializeIngredientAutocomplete(newInput);
        }
    }
});

document.addEventListener('DOMContentLoaded', async function() {

    await fetchUniqueIngredients();

    initializeAllIngredientAutocomplete();
});
