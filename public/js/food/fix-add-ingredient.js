/**
 * Fix for add ingredient functionality
 *
 * This script fixes issues with adding ingredients to recipes
 */

(function() {
    console.log('[Add Ingredient Fix] Initializing...');

    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Add Ingredient Fix] DOM loaded, applying fixes');

        const originalHandleAddIngredientSubmit = window.handleAddIngredientSubmit;

        if (typeof originalHandleAddIngredientSubmit !== 'function') {
            console.error('[Add Ingredient Fix] Original handleAddIngredientSubmit function not found');
            return;
        }

        window.handleAddIngredientSubmit = async function(event) {
            event.preventDefault();
            console.log('[Add Ingredient Fix] Called handleAddIngredientSubmit');

            const form = event.target;
            const recipeId = document.getElementById('add-ingredient-recipe-id').value;
            const statusElement = document.querySelector('.add-ingredient-status');

            console.log('[Add Ingredient Fix] Form submitted for recipe ID:', recipeId);

            if (!recipeId) {
                console.error('[Add Ingredient Fix] Recipe ID is missing');
                if (statusElement) {
                    statusElement.textContent = 'Recipe ID is missing';
                    statusElement.className = 'add-ingredient-status error';
                }
                return;
            }

            if (statusElement) {
                statusElement.textContent = 'Adding ingredient...';
                statusElement.className = 'add-ingredient-status info';
            }

            try {

                const nameInput = document.getElementById('add-ingredient-name');
                const amountInput = document.getElementById('add-ingredient-amount');
                const packageAmountInput = document.getElementById('add-ingredient-package-amount');
                const priceInput = document.getElementById('add-ingredient-price');
                const caloriesInput = document.getElementById('add-ingredient-calories');
                const proteinInput = document.getElementById('add-ingredient-protein');
                const fatsInput = document.getElementById('add-ingredient-fats');
                const carbsInput = document.getElementById('add-ingredient-carbs');

                if (!nameInput || !amountInput || !priceInput) {
                    console.error('[Add Ingredient Fix] Required form fields are missing');
                    if (statusElement) {
                        statusElement.textContent = 'Required form fields are missing';
                        statusElement.className = 'add-ingredient-status error';
                    }
                    return;
                }

                const name = nameInput.value.trim();
                const amount = amountInput.value ? parseFloat(amountInput.value) : null;
                const packageAmount = packageAmountInput && packageAmountInput.value ? parseFloat(packageAmountInput.value) : null;
                const price = priceInput.value ? parseFloat(priceInput.value) : null;
                const calories = caloriesInput && caloriesInput.value ? parseFloat(caloriesInput.value) : 0;
                const protein = proteinInput && proteinInput.value ? parseFloat(proteinInput.value) : 0;
                const fats = fatsInput && fatsInput.value ? parseFloat(fatsInput.value) : 0;
                const carbs = carbsInput && carbsInput.value ? parseFloat(carbsInput.value) : 0;

                if (!name) {
                    console.error('[Add Ingredient Fix] Ingredient name is required');
                    if (statusElement) {
                        statusElement.textContent = 'Ingredient name is required';
                        statusElement.className = 'add-ingredient-status error';
                    }
                    return;
                }

                if (amount === null || isNaN(amount) || amount <= 0) {
                    console.error('[Add Ingredient Fix] Invalid amount value:', amount);
                    if (statusElement) {
                        statusElement.textContent = 'Amount must be a positive number';
                        statusElement.className = 'add-ingredient-status error';
                    }
                    return;
                }

                if (price === null || isNaN(price) || price < 0) {
                    console.error('[Add Ingredient Fix] Invalid price value:', price);
                    if (statusElement) {
                        statusElement.textContent = 'Price must be a non-negative number';
                        statusElement.className = 'add-ingredient-status error';
                    }
                    return;
                }

                const ingredientData = {
                    name: name,
                    amount: amount,
                    package_amount: packageAmount,
                    price: price,
                    calories: calories,
                    protein: protein,
                    fats: fats,
                    carbohydrates: carbs
                };

                const micronutrientFields = form.querySelectorAll('input[name^="ingredient-"]');
                micronutrientFields.forEach(field => {
                    if (field.name && field.name.startsWith('ingredient-') && field.name !== 'ingredient-calories' &&
                        field.name !== 'ingredient-protein' && field.name !== 'ingredient-fat' && field.name !== 'ingredient-carbs') {

                        const fieldName = field.name.replace('ingredient-', '');

                        if (field.value) {
                            ingredientData[fieldName] = parseFloat(field.value) || field.value;
                        }
                    }
                });

                const completeNutritionData = form.dataset.completeNutritionData;
                if (completeNutritionData) {
                    try {
                        const nutritionData = JSON.parse(completeNutritionData);
                        console.log('[Add Ingredient Fix] Found complete nutrition data:', nutritionData);

                        const fieldMapping = {
                            alcohol: 'alcohol',
                            caffeine: 'caffeine',
                            water: 'water',
                            fiber: 'fiber',
                            starch: 'starch',
                            sugars: 'sugars',
                            addedSugars: 'added_sugars',
                            netCarbs: 'net_carbs',
                            monounsaturated: 'monounsaturated',
                            polyunsaturated: 'polyunsaturated',
                            omega3: 'omega3',
                            omega6: 'omega6',
                            saturated: 'saturated',
                            transFat: 'trans_fat',
                            cholesterol: 'cholesterol',
                            cystine: 'cystine',
                            histidine: 'histidine',
                            isoleucine: 'isoleucine',
                            leucine: 'leucine',
                            lysine: 'lysine',
                            methionine: 'methionine',
                            phenylalanine: 'phenylalanine',
                            threonine: 'threonine',
                            tryptophan: 'tryptophan',
                            tyrosine: 'tyrosine',
                            valine: 'valine',
                            vitaminB1: 'vitamin_b1',
                            vitaminB2: 'vitamin_b2',
                            vitaminB3: 'vitamin_b3',
                            vitaminB5: 'vitamin_b5',
                            vitaminB6: 'vitamin_b6',
                            vitaminB12: 'vitamin_b12',
                            folate: 'folate',
                            vitaminA: 'vitamin_a',
                            vitaminC: 'vitamin_c',
                            vitaminD: 'vitamin_d',
                            vitaminE: 'vitamin_e',
                            vitaminK: 'vitamin_k',
                            calcium: 'calcium',
                            copper: 'copper',
                            iron: 'iron',
                            magnesium: 'magnesium',
                            manganese: 'manganese',
                            phosphorus: 'phosphorus',
                            potassium: 'potassium',
                            selenium: 'selenium',
                            sodium: 'sodium',
                            zinc: 'zinc'
                        };

                        Object.entries(fieldMapping).forEach(([cronometerField, dbField]) => {
                            if (nutritionData[cronometerField] !== undefined) {
                                ingredientData[dbField] = nutritionData[cronometerField];
                            }
                        });
                    } catch (error) {
                        console.error('[Add Ingredient Fix] Error parsing complete nutrition data:', error);
                    }
                }


                console.log('[Add Ingredient Fix] Sending ingredient data to server:', JSON.stringify(ingredientData, null, 2));

                let response;
                if (typeof window.addIngredientToRecipe === 'function') {
                    console.log('[Add Ingredient Fix] Using recipe ingredient API function');
                    response = await window.addIngredientToRecipe(recipeId, ingredientData);
                } else if (typeof window.directAddIngredientToRecipe === 'function') {
                    console.log('[Add Ingredient Fix] Using direct API call function');
                    response = await window.directAddIngredientToRecipe(recipeId, ingredientData);
                } else {

                    console.log('[Add Ingredient Fix] Using regular fetch');
                    response = await fetch(`/api/recipes/${recipeId}/ingredients`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Cache-Control': 'no-cache, no-store, must-revalidate'
                        },
                        body: JSON.stringify(ingredientData)
                    });
                }

                console.log('[Add Ingredient Fix] Response status:', response.status);

                if (!response.ok) {
                    let errorMessage = `Server returned ${response.status} ${response.statusText}`;
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.error || errorMessage;
                        console.error('[Add Ingredient Fix] Server error response:', errorData);
                    } catch (jsonError) {
                        console.error('[Add Ingredient Fix] Could not parse error response as JSON:', jsonError);
                    }
                    throw new Error(errorMessage);
                }

                const result = await response.json();
                console.log('[Add Ingredient Fix] Ingredient added successfully. Server response:', result);

                if (statusElement) {
                    statusElement.textContent = 'Ingredient added successfully!';
                    statusElement.className = 'add-ingredient-status success';
                }

                setTimeout(() => {
                    const addIngredientForm = document.querySelector('.add-ingredient-form');
                    if (addIngredientForm) {
                        addIngredientForm.style.display = 'none';
                    }

                    const recipeCard = document.querySelector(`.recipe-card[data-id="${recipeId}"]`);
                    if (recipeCard) {
                        const detailsDiv = recipeCard.querySelector('.ingredient-details');
                        if (detailsDiv) {

                            detailsDiv.style.display = 'none';
                            setTimeout(() => {
                                if (typeof window.fetchAndDisplayIngredients === 'function') {
                                    window.fetchAndDisplayIngredients(recipeId, detailsDiv, null, true);
                                }
                            }, 300);
                        }
                    }
                }, 1000);

                return result;
            } catch (error) {
                console.error('[Add Ingredient Fix] Error adding ingredient:', error);
                if (statusElement) {
                    statusElement.textContent = `Error adding ingredient: ${error.message}`;
                    statusElement.className = 'add-ingredient-status error';
                }
            }
        };

        console.log('[Add Ingredient Fix] Fixes applied successfully');
    });
})();
