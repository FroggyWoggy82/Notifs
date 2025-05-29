/**
 * Form Submission Override
 *
 * This script completely overrides the form submission process to ensure micronutrient data
 * is properly included in the data sent to the backend.
 */

(function() {

    document.addEventListener('DOMContentLoaded', function() {

        initFormSubmissionOverride();
    });

    /**
     * Initialize the form submission override
     */
    function initFormSubmissionOverride() {
        console.log('[Form Submission Override] Initializing...');

        const createRecipeForm = document.getElementById('create-recipe-form');
        if (!createRecipeForm) {
            console.error('[Form Submission Override] Create recipe form not found');
            return;
        }



        console.log('[Form Submission Override] Form:', createRecipeForm);
        console.log('[Form Submission Override] Recipe name input:', createRecipeForm.querySelector('#recipeName'));

        const newForm = createRecipeForm.cloneNode(false);

        while (createRecipeForm.firstChild) {
            newForm.appendChild(createRecipeForm.firstChild);
        }

        createRecipeForm.parentNode.replaceChild(newForm, createRecipeForm);

        newForm.addEventListener('submit', function(event) {

            event.preventDefault();

            console.log('[Form Submission Override] Form submitted');

            console.log('[Form Submission Override] Form elements:', newForm.elements);
            console.log('[Form Submission Override] All inputs:', newForm.querySelectorAll('input'));

            const recipeNameById = newForm.querySelector('#recipeName');
            const recipeNameByName = newForm.querySelector('input[name="recipe-name"]');
            const firstInput = newForm.querySelector('input');

            console.log('[Form Submission Override] Recipe name by ID:', recipeNameById);
            console.log('[Form Submission Override] Recipe name by name:', recipeNameByName);
            console.log('[Form Submission Override] First input:', firstInput);

            let recipeNameInput = recipeNameById || recipeNameByName || firstInput;

            if (!recipeNameInput) {
                console.error('[Form Submission Override] Recipe name input not found');
                return;
            }

            console.log('[Form Submission Override] Using recipe name input:', recipeNameInput);
            const recipeName = recipeNameInput.value;
            console.log('[Form Submission Override] Recipe name:', recipeName);

            const ingredientItems = newForm.querySelectorAll('.ingredient-item');
            console.log(`[Form Submission Override] Found ${ingredientItems.length} ingredient items`);

            const ingredients = [];

            let formIsValid = true;

            ingredientItems.forEach((item, index) => {
                console.log(`[Form Submission Override] Processing ingredient item ${index + 1}`);

                const nameInput = item.querySelector('.ingredient-name');
                const amountInput = item.querySelector('.ingredient-amount');
                const packageAmountInput = item.querySelector('.ingredient-package-amount');
                const priceInput = item.querySelector('.ingredient-price');
                const caloriesInput = item.querySelector('.ingredient-calories');
                const proteinInput = item.querySelector('.ingredient-protein');
                const fatInput = item.querySelector('.ingredient-fat');
                const carbsInput = item.querySelector('.ingredient-carbs');

                if (!nameInput.value || !amountInput.value || !priceInput.value ||
                    !caloriesInput.value || !proteinInput.value || !fatInput.value || !carbsInput.value) {
                    console.warn(`[Form Submission Override] Ingredient item ${index + 1} has missing required fields`);
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

                if (isNaN(amount) || amount <= 0 || isNaN(price) || price < 0 ||
                    isNaN(calories) || calories < 0 || isNaN(protein) || protein < 0 ||
                    isNaN(fats) || fats < 0 || isNaN(carbs) || carbs < 0) {
                    console.warn(`[Form Submission Override] Ingredient item ${index + 1} has invalid numeric values`);
                    formIsValid = false;
                    return;
                }

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
                        console.log(`[Form Submission Override] Ingredient item ${index + 1} has DB format nutrition data`);
                        const dbFormatData = JSON.parse(item.dataset.dbFormatNutritionData);

                        for (const [key, value] of Object.entries(dbFormatData)) {

                            if (value === null || value === undefined) continue;

                            if (['name', 'calories', 'amount', 'protein', 'fats', 'carbohydrates', 'price', 'package_amount'].includes(key)) {
                                continue;
                            }

                            ingredientData[key] = value;
                            console.log(`[Form Submission Override] Added micronutrient data: ${key} = ${value}`);
                        }
                    } catch (error) {
                        console.error(`[Form Submission Override] Error adding micronutrient data:`, error);
                    }
                } else {
                    console.warn(`[Form Submission Override] Ingredient item ${index + 1} has no DB format nutrition data`);

                    const hiddenFields = item.querySelectorAll('input[type="hidden"]');
                    console.log(`[Form Submission Override] Found ${hiddenFields.length} hidden fields`);

                    hiddenFields.forEach(field => {

                        if (['ingredient-calories', 'ingredient-protein', 'ingredient-fat', 'ingredient-carbs'].includes(field.className)) {
                            return;
                        }

                        const fieldName = field.className.replace('ingredient-', '');

                        if (!field.value) return;

                        const value = parseFloat(field.value);
                        if (!isNaN(value)) {
                            ingredientData[fieldName] = value;
                            console.log(`[Form Submission Override] Added micronutrient data from hidden field: ${fieldName} = ${value}`);
                        }
                    });
                }

                ingredients.push(ingredientData);
                console.log(`[Form Submission Override] Added ingredient data:`, ingredientData);
            });

            if (!formIsValid) {
                console.error('[Form Submission Override] Form is invalid');

                const createRecipeStatus = document.getElementById('create-recipe-status');
                if (createRecipeStatus) {
                    createRecipeStatus.textContent = 'Please fill all ingredient fields correctly (all values >= 0, amount > 0).';
                    createRecipeStatus.className = 'status error';
                }

                return;
            }

            // Get grocery store field
            const groceryStoreInput = document.getElementById('groceryStore');
            const groceryStore = groceryStoreInput ? groceryStoreInput.value.trim() || null : null;
            console.log('[Form Submission Override] Grocery store:', groceryStore);

            console.log('[Form Submission Override] Sending data to backend:', { name: recipeName, groceryStore, ingredients });

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
                console.log('[Form Submission Override] Recipe saved successfully:', newRecipe);

                const createRecipeStatus = document.getElementById('create-recipe-status');
                if (createRecipeStatus) {
                    createRecipeStatus.textContent = `Recipe '${newRecipe.name}' saved successfully!`;
                    createRecipeStatus.className = 'status success';
                }

                newForm.reset();

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
                console.error('[Form Submission Override] Error saving recipe:', error);

                const createRecipeStatus = document.getElementById('create-recipe-status');
                if (createRecipeStatus) {
                    createRecipeStatus.textContent = `Error saving recipe: ${error.message}`;
                    createRecipeStatus.className = 'status error';
                }
            });
        });

        console.log('[Form Submission Override] Initialized');
    }
})();
