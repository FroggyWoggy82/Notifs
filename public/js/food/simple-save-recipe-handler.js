/**
 * Simple Save Recipe Button Handler
 * A single, reliable solution for handling recipe form submission
 */

(function() {
    'use strict';

    console.log('[Simple Save Recipe Handler] Loading...');

    // Set global flags to disable other form handlers
    window.unifiedFormSubmissionInitialized = true;
    window.recipeFormSubmissionHandled = true;
    window.simpleFormHandlerInitialized = false;
    window.formSubmissionOverrideInitialized = false;

    // Flag to prevent duplicate submissions
    let isSubmitting = false;

    function initializeHandler() {
        console.log('[Simple Save Recipe Handler] Initializing...');

        const form = document.getElementById('create-recipe-form');
        const saveButton = form?.querySelector('button[type="submit"]');

        if (!form) {
            console.log('[Simple Save Recipe Handler] Form not found');
            return false;
        }

        if (!saveButton) {
            console.log('[Simple Save Recipe Handler] Save button not found');
            return false;
        }

        console.log('[Simple Save Recipe Handler] Found form and button');

        // Remove any existing event listeners by cloning the form
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);

        // Add our single event listener
        newForm.addEventListener('submit', handleFormSubmission);

        console.log('[Simple Save Recipe Handler] Event listener attached');
        return true;
    }

    async function handleFormSubmission(event) {
        event.preventDefault();
        
        console.log('[Simple Save Recipe Handler] Form submitted');

        // Prevent duplicate submissions
        if (isSubmitting) {
            console.log('[Simple Save Recipe Handler] Already submitting, ignoring');
            return;
        }

        isSubmitting = true;

        const form = event.target;
        const saveButton = form.querySelector('button[type="submit"]');
        const statusElement = document.getElementById('create-recipe-status');

        try {
            // Update button state
            if (saveButton) {
                saveButton.disabled = true;
                saveButton.textContent = 'Saving...';
            }

            // Show status
            if (statusElement) {
                statusElement.textContent = 'Saving recipe...';
                statusElement.className = 'status info';
            }

            // Get recipe name
            const recipeNameInput = document.getElementById('recipeName');
            if (!recipeNameInput) {
                throw new Error('Recipe name input not found');
            }

            const recipeName = recipeNameInput.value.trim();
            if (!recipeName) {
                throw new Error('Recipe name is required');
            }

            // Get ingredients
            const ingredientItems = document.querySelectorAll('.ingredient-item');
            console.log('[Simple Save Recipe Handler] Found ingredient items:', ingredientItems.length);
            console.log('[Simple Save Recipe Handler] Ingredient items:', ingredientItems);
            if (ingredientItems.length === 0) {
                console.error('[Simple Save Recipe Handler] No ingredient items found! Form structure may be missing.');
                console.log('[Simple Save Recipe Handler] Available elements with class containing "ingredient":',
                    document.querySelectorAll('[class*="ingredient"]'));
                throw new Error('Recipe must have at least one ingredient');
            }

            const ingredients = [];
            let hasValidationErrors = false;

            ingredientItems.forEach((item, index) => {
                console.log(`[Simple Save Recipe Handler] Processing ingredient ${index + 1}:`, item);

                const nameInput = item.querySelector('.ingredient-name');
                const amountInput = item.querySelector('.ingredient-amount');
                const packageAmountInput = item.querySelector('.ingredient-package-amount');
                const groceryStoreInput = item.querySelector('.grocery-store-input');
                const priceInput = item.querySelector('.ingredient-price');

                // These are hidden fields that get populated by the Cronometer parser
                // Make sure we're getting the hidden fields within this specific ingredient item
                const caloriesInput = item.querySelector('input[type="hidden"].ingredient-calories');
                const proteinInput = item.querySelector('input[type="hidden"].ingredient-protein');
                const fatInput = item.querySelector('input[type="hidden"].ingredient-fat');
                const carbsInput = item.querySelector('input[type="hidden"].ingredient-carbs');

                console.log(`[Simple Save Recipe Handler] Found inputs for ingredient ${index + 1}:`, {
                    name: !!nameInput,
                    amount: !!amountInput,
                    price: !!priceInput,
                    calories: !!caloriesInput,
                    protein: !!proteinInput,
                    fat: !!fatInput,
                    carbs: !!carbsInput
                });

                console.log(`[Simple Save Recipe Handler] Values for ingredient ${index + 1}:`, {
                    name: nameInput?.value,
                    amount: amountInput?.value,
                    price: priceInput?.value,
                    calories: caloriesInput?.value,
                    protein: proteinInput?.value,
                    fat: fatInput?.value,
                    carbs: carbsInput?.value
                });

                // Check required fields (only name, amount, and price are required)
                if (!nameInput?.value || !amountInput?.value || !priceInput?.value) {
                    console.warn(`[Simple Save Recipe Handler] Ingredient ${index + 1} missing required fields (name, amount, price)`);
                    hasValidationErrors = true;
                    return;
                }

                const name = nameInput.value.trim();
                const amount = parseFloat(amountInput.value);
                const packageAmount = packageAmountInput ? parseFloat(packageAmountInput.value) || 0 : 0;
                const groceryStore = groceryStoreInput ? groceryStoreInput.value.trim() || null : null;
                const price = parseFloat(priceInput.value);

                // Parse nutrition values with defaults for empty fields
                const calories = parseFloat(caloriesInput?.value) || 0;
                const protein = parseFloat(proteinInput?.value) || 0;
                const fats = parseFloat(fatInput?.value) || 0;
                const carbs = parseFloat(carbsInput?.value) || 0;

                // Validate numeric values (only amount and price are strictly required)
                if (isNaN(amount) || amount <= 0 || isNaN(price) || price < 0) {
                    console.warn(`[Simple Save Recipe Handler] Ingredient ${index + 1} has invalid amount or price`);
                    hasValidationErrors = true;
                    return;
                }

                // Ensure nutrition values are non-negative
                if (calories < 0 || protein < 0 || fats < 0 || carbs < 0) {
                    console.warn(`[Simple Save Recipe Handler] Ingredient ${index + 1} has negative nutrition values`);
                    hasValidationErrors = true;
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
                        console.error(`[Simple Save Recipe Handler] Error parsing micronutrient data:`, error);
                    }
                }

                console.log(`[Simple Save Recipe Handler] Final ingredient data for ${index + 1}:`, ingredientData);
                ingredients.push(ingredientData);
            });

            if (hasValidationErrors) {
                throw new Error('Please fill all ingredient fields correctly (all values >= 0, amount > 0)');
            }

            // Extract grocery store from the first ingredient (if available)
            let groceryStore = null;
            if (ingredients.length > 0 && ingredients[0].grocery_store) {
                groceryStore = ingredients[0].grocery_store;
            }

            console.log('[Simple Save Recipe Handler] Sending data:', { name: recipeName, ingredients, groceryStore });
            console.log('[Simple Save Recipe Handler] Ingredients array length:', ingredients.length);
            console.log('[Simple Save Recipe Handler] First ingredient:', ingredients[0]);

            // Submit to backend
            const response = await fetch('/api/recipes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                body: JSON.stringify({ name: recipeName, ingredients, groceryStore })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const newRecipe = await response.json();
            console.log('[Simple Save Recipe Handler] Recipe saved successfully:', newRecipe);

            // Show success message
            if (statusElement) {
                statusElement.textContent = `Recipe '${newRecipe.name}' saved successfully!`;
                statusElement.className = 'status success';
            }

            console.log('[Simple Save Recipe Handler] Recipe saved successfully, clearing form...');

            // Reset form only on success
            try {
                form.reset();
                console.log('[Simple Save Recipe Handler] Form reset successfully');
            } catch (resetError) {
                console.error('[Simple Save Recipe Handler] Error resetting form:', resetError);
            }

            // Clear ingredients list and add a new row
            const ingredientsList = document.getElementById('ingredients-list');
            if (ingredientsList) {
                console.log('[Simple Save Recipe Handler] Clearing ingredients list...');
                ingredientsList.innerHTML = '';

                // Try to add a new ingredient row
                if (typeof addIngredientRow === 'function') {
                    console.log('[Simple Save Recipe Handler] Adding new ingredient row...');
                    addIngredientRow();
                } else {
                    console.warn('[Simple Save Recipe Handler] addIngredientRow function not found');
                }
            } else {
                console.error('[Simple Save Recipe Handler] Ingredients list not found for clearing');
            }

            // Refresh recipes list
            if (typeof loadRecipes === 'function') {
                setTimeout(() => loadRecipes(0, 3), 500);
            }

        } catch (error) {
            console.error('[Simple Save Recipe Handler] Error saving recipe:', error);
            
            // Show error message
            if (statusElement) {
                statusElement.textContent = `Error saving recipe: ${error.message}`;
                statusElement.className = 'status error';
            }
        } finally {
            // Reset submission flag and button state
            console.log('[Simple Save Recipe Handler] Resetting submission state...');
            isSubmitting = false;

            if (saveButton) {
                saveButton.disabled = false;
                saveButton.textContent = 'Save Recipe';
                saveButton.style.backgroundColor = '';
                saveButton.style.color = '';
                console.log('[Simple Save Recipe Handler] Button state reset');
            } else {
                console.warn('[Simple Save Recipe Handler] Save button not found for reset');
            }
        }
    }

    // Initialize when DOM is ready
    function tryInitialize() {
        if (initializeHandler()) {
            console.log('[Simple Save Recipe Handler] Successfully initialized');
        } else {
            console.log('[Simple Save Recipe Handler] Initialization failed, will retry');
        }
    }

    // Ultra aggressive approach - completely override the button
    function forceAttachHandler() {
        // console.log('[Simple Save Recipe Handler] Force attaching handler...');

        const button = document.querySelector('#create-recipe-form button[type="submit"], .submit-btn');

        if (button) {
            // Force enable the button
            button.removeAttribute('disabled');
            button.disabled = false;
            button.style.opacity = '1';
            button.style.pointerEvents = 'auto';

            // Remove ALL existing event listeners by cloning
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);

            // Add our handler with maximum priority
            newButton.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                console.log('[Simple Save Recipe Handler] 🚀 BUTTON CLICKED! Processing...');
                console.log('[Simple Save Recipe Handler] Form exists:', !!document.getElementById('create-recipe-form'));
                console.log('[Simple Save Recipe Handler] Ingredients list exists:', !!document.getElementById('ingredients-list'));
                console.log('[Simple Save Recipe Handler] Recipe name input exists:', !!document.getElementById('recipeName'));

                // Visual feedback
                newButton.style.backgroundColor = '#4CAF50 !important';
                newButton.style.color = 'white !important';
                newButton.textContent = 'Processing...';
                newButton.disabled = false;

                // Call our form submission handler directly
                try {
                    const form = document.getElementById('create-recipe-form');
                    if (form) {
                        const fakeEvent = {
                            target: form,
                            preventDefault: () => {},
                            stopPropagation: () => {}
                        };
                        await handleFormSubmission(fakeEvent);
                    } else {
                        console.error('[Simple Save Recipe Handler] Form not found!');
                    }
                } catch (error) {
                    console.error('[Simple Save Recipe Handler] Error:', error);
                }

                return false;
            }, { capture: true, passive: false });

            // Also override onclick
            newButton.onclick = async function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('[Simple Save Recipe Handler] 🚀 ONCLICK TRIGGERED!');

                const form = document.getElementById('create-recipe-form');
                if (form) {
                    const fakeEvent = {
                        target: form,
                        preventDefault: () => {},
                        stopPropagation: () => {}
                    };
                    await handleFormSubmission(fakeEvent);
                }
                return false;
            };

            // console.log('[Simple Save Recipe Handler] ✅ Ultra aggressive handler attached!');
            return true;
        } else {
            console.log('[Simple Save Recipe Handler] ❌ Button not found');
        }
        return false;
    }

    // Try to initialize immediately
    tryInitialize();

    // Also try when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryInitialize);
    }

    // Retry with delays to handle dynamic content
    setTimeout(tryInitialize, 100);
    setTimeout(tryInitialize, 500);
    setTimeout(tryInitialize, 1000);

    // Function to force enable the button
    function forceEnableButton() {
        const button = document.querySelector('#create-recipe-form button[type="submit"]');
        if (button) {
            button.removeAttribute('disabled');
            button.disabled = false;
            button.style.opacity = '1';
            button.style.pointerEvents = 'auto';
            // console.log('[Simple Save Recipe Handler] Button force enabled');
        }
    }

    // Force attach as backup - run multiple times to ensure it works
    setTimeout(forceAttachHandler, 1000);
    setTimeout(forceAttachHandler, 2000);
    setTimeout(forceAttachHandler, 3000);
    setTimeout(forceAttachHandler, 5000);
    setTimeout(forceAttachHandler, 10000);

    // Also force enable the button periodically
    setTimeout(forceEnableButton, 2000);
    setTimeout(forceEnableButton, 5000);
    setTimeout(forceEnableButton, 10000);
    setInterval(forceEnableButton, 5000); // Keep enabling every 5 seconds

    // Global click interceptor as ultimate backup
    document.addEventListener('click', async function(e) {
        const target = e.target;
        if (target && (
            target.matches('#create-recipe-form button[type="submit"]') ||
            target.matches('.submit-btn') ||
            target.textContent?.includes('Save Recipe')
        )) {
            console.log('[Simple Save Recipe Handler] 🎯 GLOBAL CLICK INTERCEPTED!');
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            // Visual feedback
            target.style.backgroundColor = '#4CAF50';
            target.style.color = 'white';
            target.textContent = 'Processing...';

            // Call our handler
            const form = document.getElementById('create-recipe-form');
            if (form) {
                const fakeEvent = {
                    target: form,
                    preventDefault: () => {},
                    stopPropagation: () => {}
                };
                await handleFormSubmission(fakeEvent);
            }

            return false;
        }
    }, { capture: true, passive: false });

    console.log('[Simple Save Recipe Handler] Loaded');
})();
