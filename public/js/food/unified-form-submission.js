/**
 * Unified Form Submission Handler
 *
 * This script provides a single, unified form submission handler for the recipe form.
 * It replaces all other form submission handlers to prevent conflicts.
 */

(function() {
    console.log('[Unified Form Submission] Script loaded');

    // Set the flag immediately to prevent other handlers from initializing
    window.unifiedFormSubmissionInitialized = true;
    console.log('[Unified Form Submission] Flag set to prevent other handlers');

    // Function to initialize the form handler
    function initializeFormHandler() {
        console.log('[Unified Form Submission] Initializing...');

        // Get the form
        const createRecipeForm = document.getElementById('create-recipe-form');
        if (!createRecipeForm) {
            console.error('[Unified Form Submission] Create recipe form not found');
            return;
        }

        // Check if already initialized to prevent multiple initializations
        if (createRecipeForm.dataset.unifiedFormInitialized === 'true') {
            console.log('[Unified Form Submission] Form already initialized, skipping');
            return;
        }

        console.log('[Unified Form Submission] Form found, setting up handler');

        // Mark as initialized to prevent re-initialization
        createRecipeForm.dataset.unifiedFormInitialized = 'true';

        // Don't clone the form - just add the event listener directly
        const newForm = createRecipeForm;
        
        // Flag to track if a recipe submission is in progress
        let recipeSubmissionInProgress = false;
        
        // Add the unified submit handler
        newForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Prevent default form submission
            
            console.log('[Unified Form Submission] Form submitted');
            
            // Prevent duplicate submissions
            if (recipeSubmissionInProgress) {
                console.log('[Unified Form Submission] Submission already in progress, ignoring');
                return;
            }
            
            // Set the flag to indicate submission is in progress
            recipeSubmissionInProgress = true;
            
            // Disable the submit button to prevent multiple clicks
            const saveButton = newForm.querySelector('button[type="submit"]');
            if (saveButton) {
                saveButton.disabled = true;
                saveButton.textContent = 'Saving...';
            }
            
            try {
                // Get recipe name
                const recipeNameInput = document.getElementById('recipeName');
                if (!recipeNameInput) {
                    throw new Error('Recipe name input not found');
                }
                const recipeName = recipeNameInput.value.trim();
                
                if (!recipeName) {
                    throw new Error('Recipe name is required');
                }
                
                // Note: Grocery store is handled per ingredient, not at recipe level
                
                // Get ingredients
                const ingredientItems = document.querySelectorAll('.ingredient-item');
                if (ingredientItems.length === 0) {
                    throw new Error('Recipe must have at least one ingredient');
                }
                
                const ingredients = [];
                let formIsValid = true;
                
                ingredientItems.forEach((item, index) => {
                    const nameInput = item.querySelector('.ingredient-name');
                    const amountInput = item.querySelector('.ingredient-amount');
                    const packageAmountInput = item.querySelector('.ingredient-package-amount');
                    const groceryStoreInput = item.querySelector('.grocery-store-input');
                    const priceInput = item.querySelector('.ingredient-price');
                    const caloriesInput = item.querySelector('.ingredient-calories');
                    const proteinInput = item.querySelector('.ingredient-protein');
                    const fatInput = item.querySelector('.ingredient-fat');
                    const carbsInput = item.querySelector('.ingredient-carbs');
                    
                    if (!nameInput || !nameInput.value || !amountInput || !amountInput.value || 
                        !priceInput || !priceInput.value || !caloriesInput || !caloriesInput.value || 
                        !proteinInput || !proteinInput.value || !fatInput || !fatInput.value || 
                        !carbsInput || !carbsInput.value) {
                        console.warn(`[Unified Form Submission] Ingredient ${index + 1} has missing required fields`);
                        formIsValid = false;
                        return;
                    }
                    
                    const name = nameInput.value;
                    const amount = parseFloat(amountInput.value);
                    const packageAmount = packageAmountInput ? parseFloat(packageAmountInput.value) : 0;
                    const groceryStore = groceryStoreInput ? groceryStoreInput.value.trim() || null : null;
                    const price = parseFloat(priceInput.value);
                    const calories = parseFloat(caloriesInput.value);
                    const protein = parseFloat(proteinInput.value);
                    const fats = parseFloat(fatInput.value);
                    const carbs = parseFloat(carbsInput.value);
                    
                    if (isNaN(amount) || amount <= 0 || isNaN(price) || price < 0 ||
                        isNaN(calories) || calories < 0 || isNaN(protein) || protein < 0 ||
                        isNaN(fats) || fats < 0 || isNaN(carbs) || carbs < 0) {
                        console.warn(`[Unified Form Submission] Ingredient ${index + 1} has invalid numeric values`);
                        formIsValid = false;
                        return;
                    }
                    
                    const ingredientData = {
                        name,
                        calories,
                        amount,
                        package_amount: packageAmount || null,
                        grocery_store: groceryStore,
                        protein,
                        fats,
                        carbohydrates: carbs,
                        price
                    };
                    
                    // Add micronutrient data if available
                    if (item.dataset.dbFormatNutritionData) {
                        try {
                            const dbFormatData = JSON.parse(item.dataset.dbFormatNutritionData);
                            for (const [key, value] of Object.entries(dbFormatData)) {
                                if (value === null || value === undefined) continue;
                                if (['name', 'calories', 'amount', 'protein', 'fats', 'carbohydrates', 'price', 'package_amount'].includes(key)) {
                                    continue;
                                }
                                ingredientData[key] = value;
                            }
                        } catch (error) {
                            console.error(`[Unified Form Submission] Error parsing micronutrient data:`, error);
                        }
                    }
                    
                    ingredients.push(ingredientData);
                });
                
                if (!formIsValid) {
                    throw new Error('Please fill all ingredient fields correctly (all values >= 0, amount > 0)');
                }
                
                console.log('[Unified Form Submission] Sending data to backend:', { name: recipeName, ingredients });

                // Submit to backend
                const response = await fetch('/api/recipes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache'
                    },
                    body: JSON.stringify({ name: recipeName, ingredients })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }
                
                const newRecipe = await response.json();
                console.log('[Unified Form Submission] Recipe saved successfully:', newRecipe);
                
                // Show success message
                const createRecipeStatus = document.getElementById('create-recipe-status');
                if (createRecipeStatus) {
                    createRecipeStatus.textContent = `Recipe '${newRecipe.name}' saved successfully!`;
                    createRecipeStatus.className = 'status success';
                }
                
                // Reset form
                newForm.reset();
                
                // Clear ingredients list and add a new row
                const ingredientsList = document.getElementById('ingredients-list');
                if (ingredientsList) {
                    ingredientsList.innerHTML = '';
                    
                    // Try to add a new ingredient row
                    const addIngredientRowButton = document.getElementById('add-ingredient-row');
                    if (addIngredientRowButton) {
                        addIngredientRowButton.click();
                    } else if (typeof addIngredientRow === 'function') {
                        addIngredientRow();
                    }
                }
                
                // Refresh recipes list
                const loadRecipesButton = document.getElementById('refresh-recipes');
                if (loadRecipesButton) {
                    loadRecipesButton.click();
                } else if (typeof loadRecipes === 'function') {
                    setTimeout(() => loadRecipes(0, 3), 500);
                }
                
            } catch (error) {
                console.error('[Unified Form Submission] Error saving recipe:', error);
                
                // Show error message
                const createRecipeStatus = document.getElementById('create-recipe-status');
                if (createRecipeStatus) {
                    createRecipeStatus.textContent = `Error saving recipe: ${error.message}`;
                    createRecipeStatus.className = 'status error';
                }
            } finally {
                // Reset the submission flag regardless of success or failure
                recipeSubmissionInProgress = false;
                
                // Re-enable the submit button
                const saveButton = newForm.querySelector('button[type="submit"]');
                if (saveButton) {
                    saveButton.disabled = false;
                    saveButton.textContent = 'Save Recipe';
                }
            }
        });

        console.log('[Unified Form Submission] Initialized successfully');
    }

    // Try to initialize immediately if DOM is already loaded
    console.log('[Unified Form Submission] Document ready state:', document.readyState);

    // Force immediate initialization regardless of DOM state
    console.log('[Unified Form Submission] Attempting immediate initialization');
    try {
        initializeFormHandler();
    } catch (error) {
        console.error('[Unified Form Submission] Immediate initialization failed:', error);
    }

    // Also add DOMContentLoaded listener as backup
    if (document.readyState === 'loading') {
        console.log('[Unified Form Submission] DOM still loading, adding event listener');
        document.addEventListener('DOMContentLoaded', () => {
            console.log('[Unified Form Submission] DOMContentLoaded fired');
            try {
                initializeFormHandler();
            } catch (error) {
                console.error('[Unified Form Submission] DOMContentLoaded initialization failed:', error);
            }
        });
    }

    // Also try to initialize after delays to ensure all scripts have loaded
    console.log('[Unified Form Submission] Setting timeouts for delayed initialization');
    setTimeout(() => {
        console.log('[Unified Form Submission] Timeout 100ms fired, attempting delayed initialization');
        try {
            initializeFormHandler();
        } catch (error) {
            console.error('[Unified Form Submission] Timeout 100ms initialization failed:', error);
        }
    }, 100);

    setTimeout(() => {
        console.log('[Unified Form Submission] Timeout 500ms fired, attempting delayed initialization');
        try {
            initializeFormHandler();
        } catch (error) {
            console.error('[Unified Form Submission] Timeout 500ms initialization failed:', error);
        }
    }, 500);

    setTimeout(() => {
        console.log('[Unified Form Submission] Timeout 1000ms fired, attempting delayed initialization');
        try {
            initializeFormHandler();
        } catch (error) {
            console.error('[Unified Form Submission] Timeout 1000ms initialization failed:', error);
        }
    }, 1000);
})();
