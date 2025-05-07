/**
 * Ingredient Autofill
 * Automatically fills in all ingredient fields when selecting a previously used ingredient
 */

async function fetchIngredientDetails(ingredientName) {
    try {
        console.log(`Fetching details for ingredient: ${ingredientName}`);

        const fetchFunction = window.safeFetch || fetch;

        const encodedName = encodeURIComponent(ingredientName);

        try {

            const recipesResponse = await fetchFunction('/api/recipes');
            if (recipesResponse.ok) {
                const recipes = await recipesResponse.json();

                for (const recipe of recipes) {

                    const recipeDetailResponse = await fetchFunction(`/api/recipes/${recipe.id}`);
                    if (recipeDetailResponse.ok) {
                        const recipeDetail = await recipeDetailResponse.json();

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

        try {

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

function fillIngredientFields(ingredientData, event) {
    if (!ingredientData) return;

    console.log('Filling ingredient fields with:', ingredientData);

    let ingredientItem;

    if (event && event.target) {
        ingredientItem = event.target.closest('.ingredient-item');
        console.log('Found ingredient item from event:', ingredientItem);
    }

    if (!ingredientItem) {

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

    if (!ingredientItem) {
        ingredientItem = document.querySelector('.ingredient-item');
        console.log('Using first ingredient item as fallback:', ingredientItem);
    }

    if (!ingredientItem) {
        console.error('Ingredient item not found');
        return;
    }

    const fieldMap = {

        'amount': '.ingredient-amount',
        'package_amount': '.ingredient-package-amount',
        'price': '.ingredient-price',

        'calories': '.ingredient-calories, .nutrition-energy',
        'alcohol': '.nutrition-alcohol',
        'caffeine': '.nutrition-caffeine',
        'water': '.nutrition-water',

        'carbs': '.ingredient-carbs, .nutrition-carbs-total',
        'fiber': '.nutrition-fiber',
        'starch': '.nutrition-starch',
        'sugars': '.nutrition-sugars',
        'added_sugars': '.nutrition-added-sugars',
        'net_carbs': '.nutrition-net-carbs',

        'fat': '.ingredient-fat, .nutrition-fat-total',
        'monounsaturated': '.nutrition-monounsaturated',
        'polyunsaturated': '.nutrition-polyunsaturated',
        'omega3': '.nutrition-omega3',
        'omega6': '.nutrition-omega6',
        'saturated': '.nutrition-saturated',
        'trans': '.nutrition-trans-fat',
        'cholesterol': '.nutrition-cholesterol',

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

    for (const [dbField, selector] of Object.entries(fieldMap)) {

        const selectors = selector.split(',').map(s => s.trim());

        for (const singleSelector of selectors) {

            const inputField = ingredientItem.querySelector(singleSelector);

            if (inputField && ingredientData[dbField] !== undefined && ingredientData[dbField] !== null) {
                inputField.value = ingredientData[dbField];

                const event = new Event('change', { bubbles: true });
                inputField.dispatchEvent(event);

                console.log(`Set ${dbField} (${singleSelector}) to ${ingredientData[dbField]}`);

                if (inputField.type === 'hidden') {

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

async function handleIngredientNameChange(event) {
    const ingredientName = event.target.value.trim();
    if (!ingredientName) return;

    console.log(`Ingredient name changed to: ${ingredientName}`);

    const ingredientData = await fetchIngredientDetails(ingredientName);

    if (ingredientData) {
        fillIngredientFields(ingredientData, event);
    }
}

function initializeIngredientAutofill() {

    const ingredientNameInputs = document.querySelectorAll('.ingredient-name');

    ingredientNameInputs.forEach(input => {

        input.removeEventListener('change', handleIngredientNameChange);

        input.addEventListener('change', handleIngredientNameChange);

        console.log('Added autofill to ingredient input:', input);
    });
}

document.addEventListener('ingredientAdded', function(e) {

    const newIngredientItem = e.detail.ingredientItem;
    if (newIngredientItem) {
        const newInput = newIngredientItem.querySelector('.ingredient-name');
        if (newInput) {

            newInput.addEventListener('change', handleIngredientNameChange);
            console.log('Added autofill to new ingredient input');
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {

    initializeIngredientAutofill();

    console.log('Ingredient autofill initialized');
});

document.addEventListener('editFormOpened', function() {

    setTimeout(initializeIngredientAutofill, 500); // Wait for the form to be fully rendered
    console.log('Ingredient autofill initialized for edit form');
});
