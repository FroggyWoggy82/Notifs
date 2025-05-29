/**
 * Simple Form Handler
 * 
 * This script provides a simpler form submission handler for the recipe form.
 */

(function() {

    document.addEventListener('DOMContentLoaded', function() {

        initSimpleFormHandler();
    });

    /**
     * Initialize the simple form handler
     */
    function initSimpleFormHandler() {
        console.log('[Simple Form Handler] Initializing...');

        const createRecipeForm = document.getElementById('create-recipe-form');
        if (!createRecipeForm) {
            console.error('[Simple Form Handler] Create recipe form not found');
            return;
        }

        createRecipeForm.addEventListener('submit', function(event) {

            event.preventDefault();

            console.log('[Simple Form Handler] Form submitted');

            const recipeNameInput = document.getElementById('recipeName');
            if (!recipeNameInput) {
                console.error('[Simple Form Handler] Recipe name input not found');
                return;
            }
            const recipeName = recipeNameInput.value;
            console.log('[Simple Form Handler] Recipe name:', recipeName);

            // Get grocery store field
            const groceryStoreInput = document.getElementById('groceryStore');
            const groceryStore = groceryStoreInput ? groceryStoreInput.value.trim() || null : null;
            console.log('[Simple Form Handler] Grocery store:', groceryStore);

            const ingredientItems = document.querySelectorAll('.ingredient-item');
            console.log(`[Simple Form Handler] Found ${ingredientItems.length} ingredient items`);

            const ingredients = [];

            let formIsValid = true;

            ingredientItems.forEach((item, index) => {
                console.log(`[Simple Form Handler] Processing ingredient item ${index + 1}`);

                const nameInput = item.querySelector('.ingredient-name');
                const amountInput = item.querySelector('.ingredient-amount');
                const packageAmountInput = item.querySelector('.ingredient-package-amount');
                const priceInput = item.querySelector('.ingredient-price');
                const caloriesInput = item.querySelector('.ingredient-calories');
                const proteinInput = item.querySelector('.ingredient-protein');
                const fatInput = item.querySelector('.ingredient-fat');
                const carbsInput = item.querySelector('.ingredient-carbs');

                if (!nameInput || !nameInput.value || !amountInput || !amountInput.value || 
                    !priceInput || !priceInput.value || !caloriesInput || !caloriesInput.value || 
                    !proteinInput || !proteinInput.value || !fatInput || !fatInput.value || 
                    !carbsInput || !carbsInput.value) {
                    console.warn(`[Simple Form Handler] Ingredient item ${index + 1} has missing required fields`);
                    formIsValid = false;
                    return;
                }

                const name = nameInput.value;
                const amount = parseFloat(amountInput.value);
                const packageAmount = packageAmountInput ? parseFloat(packageAmountInput.value) : 0;
                const price = parseFloat(priceInput.value);
                const calories = parseFloat(caloriesInput.value);
                const protein = parseFloat(proteinInput.value);
                const fats = parseFloat(fatInput.value);
                const carbs = parseFloat(carbsInput.value);

                const ingredientData = {
                    name,
                    calories,
                    amount,
                    package_amount: packageAmount || null,
                    protein,
                    fats,
                    carbohydrates: carbs,
                    price
                };

                if (item.dataset.dbFormatNutritionData) {
                    try {
                        console.log(`[Simple Form Handler] Ingredient item ${index + 1} has DB format nutrition data`);
                        const dbFormatData = JSON.parse(item.dataset.dbFormatNutritionData);

                        for (const [key, value] of Object.entries(dbFormatData)) {

                            if (value === null || value === undefined) continue;

                            if (['name', 'calories', 'amount', 'protein', 'fats', 'carbohydrates', 'price', 'package_amount'].includes(key)) {
                                continue;
                            }

                            ingredientData[key] = value;
                            console.log(`[Simple Form Handler] Added micronutrient data: ${key} = ${value}`);
                        }
                    } catch (error) {
                        console.error(`[Simple Form Handler] Error adding micronutrient data:`, error);
                    }
                }

                ingredients.push(ingredientData);
                console.log(`[Simple Form Handler] Added ingredient data:`, ingredientData);
            });

            if (!formIsValid) {
                console.error('[Simple Form Handler] Form is invalid');

                const createRecipeStatus = document.getElementById('create-recipe-status');
                if (createRecipeStatus) {
                    createRecipeStatus.textContent = 'Please fill all ingredient fields correctly.';
                    createRecipeStatus.className = 'status error';
                }

                return;
            }

            console.log('[Simple Form Handler] Sending data to backend:', { name: recipeName, groceryStore, ingredients });

            fetch('/api/recipes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: recipeName, groceryStore, ingredients })
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errorData => {
                        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                    });
                }
                return response.json();
            })
            .then(newRecipe => {
                console.log('[Simple Form Handler] Recipe saved successfully:', newRecipe);

                const createRecipeStatus = document.getElementById('create-recipe-status');
                if (createRecipeStatus) {
                    createRecipeStatus.textContent = `Recipe '${newRecipe.name}' saved successfully!`;
                    createRecipeStatus.className = 'status success';
                }

                createRecipeForm.reset();

                const ingredientsList = document.getElementById('ingredients-list');
                if (ingredientsList) {
                    ingredientsList.innerHTML = '';

                    const addIngredientRowButton = document.getElementById('add-ingredient-row');
                    if (addIngredientRowButton) {
                        addIngredientRowButton.click();
                    }
                }

                const loadRecipesButton = document.getElementById('refresh-recipes');
                if (loadRecipesButton) {
                    loadRecipesButton.click();
                }
            })
            .catch(error => {
                console.error('[Simple Form Handler] Error saving recipe:', error);

                const createRecipeStatus = document.getElementById('create-recipe-status');
                if (createRecipeStatus) {
                    createRecipeStatus.textContent = `Error saving recipe: ${error.message}`;
                    createRecipeStatus.className = 'status error';
                }
            });
        });

        console.log('[Simple Form Handler] Initialized');
    }
})();
