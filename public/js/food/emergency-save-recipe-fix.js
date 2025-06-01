/**
 * Emergency Save Recipe Button Fix
 * This script will forcefully override any existing handlers and make the Save Recipe button work
 */

(function() {
    'use strict';

    console.log('[Emergency Save Recipe Fix] Loading...');

    function emergencyFix() {
        console.log('[Emergency Save Recipe Fix] Applying emergency fix...');

        // Find the Save Recipe button
        const saveButton = document.querySelector('button[type="submit"]');
        if (!saveButton) {
            console.error('[Emergency Save Recipe Fix] Save Recipe button not found!');
            return;
        }

        console.log('[Emergency Save Recipe Fix] Found Save Recipe button');

        // Remove ALL existing event listeners by cloning the button
        const newButton = saveButton.cloneNode(true);
        saveButton.parentNode.replaceChild(newButton, saveButton);

        // Add our emergency click handler
        newButton.addEventListener('click', async function(event) {
            event.preventDefault();
            event.stopPropagation();
            
            console.log('[Emergency Save Recipe Fix] Save Recipe button clicked!');

            try {
                // Disable button
                newButton.disabled = true;
                newButton.textContent = 'Saving...';

                // Get recipe name
                const recipeNameInput = document.getElementById('recipeName');
                if (!recipeNameInput || !recipeNameInput.value.trim()) {
                    throw new Error('Recipe name is required');
                }
                const recipeName = recipeNameInput.value.trim();

                // Get all ingredient items
                const ingredientItems = document.querySelectorAll('.ingredient-item');
                if (ingredientItems.length === 0) {
                    throw new Error('At least one ingredient is required');
                }

                const ingredients = [];

                ingredientItems.forEach((item, index) => {
                    console.log(`[Emergency Save Recipe Fix] Processing ingredient ${index + 1}`);

                    // Get basic ingredient data
                    const nameInput = item.querySelector('.ingredient-name');
                    const amountInput = item.querySelector('.ingredient-amount');
                    const priceInput = item.querySelector('.ingredient-price');

                    if (!nameInput?.value || !amountInput?.value || !priceInput?.value) {
                        console.warn(`[Emergency Save Recipe Fix] Ingredient ${index + 1} missing basic data`);
                        return;
                    }

                    // Get nutrition data from hidden fields
                    const caloriesInput = item.querySelector('.ingredient-calories');
                    const proteinInput = item.querySelector('.ingredient-protein');
                    const fatInput = item.querySelector('.ingredient-fat');
                    const carbsInput = item.querySelector('.ingredient-carbs');

                    const ingredientData = {
                        name: nameInput.value.trim(),
                        amount: parseFloat(amountInput.value) || 0,
                        price: parseFloat(priceInput.value) || 0,
                        calories: parseFloat(caloriesInput?.value) || 0,
                        protein: parseFloat(proteinInput?.value) || 0,
                        fats: parseFloat(fatInput?.value) || 0,
                        carbohydrates: parseFloat(carbsInput?.value) || 0
                    };

                    // Add package amount if available
                    const packageAmountInput = item.querySelector('.ingredient-package-amount');
                    if (packageAmountInput?.value) {
                        ingredientData.package_amount = parseFloat(packageAmountInput.value);
                    }

                    // Add grocery store if available
                    const groceryStoreInput = item.querySelector('.grocery-store-input');
                    if (groceryStoreInput?.value) {
                        ingredientData.grocery_store = groceryStoreInput.value.trim();
                    }

                    console.log(`[Emergency Save Recipe Fix] Ingredient ${index + 1} data:`, ingredientData);
                    ingredients.push(ingredientData);
                });

                if (ingredients.length === 0) {
                    throw new Error('No valid ingredients found');
                }

                const recipeData = {
                    name: recipeName,
                    ingredients: ingredients
                };

                console.log('[Emergency Save Recipe Fix] Submitting recipe:', recipeData);

                // Submit to backend
                const response = await fetch('/api/recipes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache'
                    },
                    body: JSON.stringify(recipeData)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Server error: ${response.status} - ${errorText}`);
                }

                const result = await response.json();
                console.log('[Emergency Save Recipe Fix] Recipe saved successfully:', result);

                // Show success message
                const statusElement = document.getElementById('create-recipe-status');
                if (statusElement) {
                    statusElement.textContent = `Recipe '${result.name}' saved successfully!`;
                    statusElement.className = 'status success';
                    statusElement.style.display = 'block';
                }

                // Reset form
                const form = document.getElementById('create-recipe-form');
                if (form) {
                    form.reset();
                }

                // Clear ingredients list
                const ingredientsList = document.getElementById('ingredients-list');
                if (ingredientsList) {
                    ingredientsList.innerHTML = '';
                }

                // Try to add a new ingredient row
                if (typeof addIngredientRow === 'function') {
                    setTimeout(() => addIngredientRow(), 100);
                }

                // Refresh recipes list
                if (typeof loadRecipes === 'function') {
                    setTimeout(() => loadRecipes(0, 3), 500);
                }

            } catch (error) {
                console.error('[Emergency Save Recipe Fix] Error:', error);
                
                // Show error message
                const statusElement = document.getElementById('create-recipe-status');
                if (statusElement) {
                    statusElement.textContent = `Error: ${error.message}`;
                    statusElement.className = 'status error';
                    statusElement.style.display = 'block';
                }

                alert(`Error saving recipe: ${error.message}`);
            } finally {
                // Re-enable button
                newButton.disabled = false;
                newButton.textContent = 'Save Recipe';
            }
        });

        console.log('[Emergency Save Recipe Fix] Emergency handler attached successfully!');
    }

    // Apply fix immediately and with delays
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', emergencyFix);
    } else {
        emergencyFix();
    }

    setTimeout(emergencyFix, 100);
    setTimeout(emergencyFix, 500);
    setTimeout(emergencyFix, 1000);
    setTimeout(emergencyFix, 2000);

    console.log('[Emergency Save Recipe Fix] Loaded and scheduled');
})();
