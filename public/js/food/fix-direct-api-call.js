/**
 * Fix Direct API Call
 *
 * This script provides a direct API call function that bypasses any interceptors
 * to ensure ingredients are properly added to recipes.
 */

(function() {
    console.log('[Direct API Call Fix] Initializing...');

    window.directApiCall = async function(url, options) {

        console.log(`[Direct API Call Fix] Making direct API call to: ${url} (${options.method})`);





        try {

            window.directApiCallInProgress = true;

            const response = await window.fetch.prototype.constructor.call(window, url, options);

            if (response.ok) {
                console.log(`[Direct API Call Fix] Request successful: ${response.status}`);
            } else {
                console.error(`[Direct API Call Fix] Request failed: ${response.status}`);

                try {
                    const clonedResponse = response.clone();
                    const responseData = await clonedResponse.json();
                    console.error(`[Direct API Call Fix] Error response:`, responseData);
                } catch (error) {

                }
            }

            window.directApiCallInProgress = false;
            return response;
        } catch (error) {
            console.error(`[Direct API Call Fix] Error:`, error);

            window.directApiCallInProgress = false;
            throw error;
        }
    };

    window.directAddIngredientToRecipe = async function(recipeId, ingredientData) {
        console.log(`[Direct API Call Fix] Adding ingredient to recipe ${recipeId}`);

        const numericFields = [
            'amount', 'package_amount', 'price', 'calories', 'protein', 'fats', 'carbohydrates',
            'fiber', 'starch', 'sugars', 'added_sugars', 'net_carbs', 'monounsaturated',
            'polyunsaturated', 'omega3', 'omega6', 'saturated', 'trans', 'cholesterol',
            'alcohol', 'caffeine', 'water', 'thiamine', 'riboflavin', 'niacin', 'pantothenic_acid',
            'vitamin_b6', 'vitamin_b12', 'folate', 'vitamin_a', 'vitamin_c', 'vitamin_d',
            'vitamin_e', 'vitamin_k', 'calcium', 'copper', 'iron', 'magnesium', 'manganese',
            'phosphorus', 'potassium', 'selenium', 'sodium', 'zinc', 'cystine', 'histidine',
            'isoleucine', 'leucine', 'lysine', 'methionine', 'phenylalanine', 'threonine',
            'tryptophan', 'tyrosine', 'valine'
        ];

        const processedData = { ...ingredientData };

        numericFields.forEach(field => {
            if (processedData[field] !== undefined && processedData[field] !== null) {
                if (typeof processedData[field] === 'string') {
                    processedData[field] = parseFloat(processedData[field]);
                    if (isNaN(processedData[field])) {
                        processedData[field] = 0;
                    }
                }
            }
        });

        const requiredData = {
            name: processedData.name || processedData['add-ingredient-name'],
            amount: processedData.amount || processedData['add-ingredient-amount'],
            package_amount: processedData.package_amount || processedData['add-ingredient-package-amount'],
            price: processedData.price || processedData['add-ingredient-price'],
            calories: processedData.calories || processedData['add-ingredient-calories'] || processedData['ingredient-calories'],
            protein: processedData.protein || processedData['add-ingredient-protein'] || processedData['ingredient-protein'],
            fats: processedData.fats || processedData['add-ingredient-fats'] || processedData['ingredient-fat'],
            carbohydrates: processedData.carbohydrates || processedData['add-ingredient-carbs'] || processedData['ingredient-carbs']
        };

        numericFields.forEach(field => {

            if (['amount', 'package_amount', 'price', 'calories', 'protein', 'fats', 'carbohydrates'].includes(field)) {
                return;
            }

            const value = processedData[field] ||
                          processedData[`add-ingredient-${field}`] ||
                          processedData[`ingredient-${field}`];

            if (value !== undefined && value !== null) {
                requiredData[field] = parseFloat(value);
            }
        });

        console.log('[Direct API Call Fix] Processed data for API:', requiredData);

        try {

            console.log('[Direct API Call Fix] Trying standard endpoint...');
            const response = await window.directApiCall(`/api/recipes/${recipeId}/ingredients`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate'
                },
                body: JSON.stringify(requiredData)
            });

            if (response.ok) {
                return response;
            }

            console.log('[Direct API Call Fix] Standard endpoint failed, trying PUT endpoint...');
            return await window.directApiCall(`/api/recipes/${recipeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate'
                },
                body: JSON.stringify({
                    id: recipeId,
                    ingredients: [requiredData]
                })
            });
        } catch (error) {
            console.error('[Direct API Call Fix] All API attempts failed:', error);
            throw error;
        }
    };

    document.addEventListener('DOMContentLoaded', function() {

        console.log('[Direct API Call Fix] Setting up form submission override');

        const forms = document.querySelectorAll('form#add-ingredient-form');

        forms.forEach(form => {


            form.addEventListener('submit', async function(event) {

                console.log('[Direct API Call Fix] Form submission intercepted');
                event.preventDefault();

                const recipeIdInput = form.querySelector('#add-ingredient-recipe-id');
                if (!recipeIdInput || !recipeIdInput.value) {
                    console.error('[Direct API Call Fix] Recipe ID not found');
                    return;
                }

                const recipeId = recipeIdInput.value;

                const formData = new FormData(form);
                const ingredientData = {};

                for (const [key, value] of formData.entries()) {
                    ingredientData[key] = value;
                }

                const hiddenFields = form.querySelectorAll('input[type="hidden"]');
                hiddenFields.forEach(field => {
                    if (field.name && field.value) {
                        ingredientData[field.name] = field.value;
                    }
                });

                if (form.dataset.completeNutritionData) {
                    try {
                        const nutritionData = JSON.parse(form.dataset.completeNutritionData);
                        console.log('[Direct API Call Fix] Found complete nutrition data:', nutritionData);

                        Object.entries(nutritionData).forEach(([key, value]) => {
                            if (key !== 'success') {
                                ingredientData[key] = value;
                            }
                        });
                    } catch (error) {
                        console.error('[Direct API Call Fix] Error parsing complete nutrition data:', error);
                    }
                }

                if (form.dataset.dbFormatNutritionData) {
                    try {
                        const dbFormatData = JSON.parse(form.dataset.dbFormatNutritionData);
                        console.log('[Direct API Call Fix] Found DB format nutrition data:', dbFormatData);

                        Object.entries(dbFormatData).forEach(([key, value]) => {
                            ingredientData[key] = value;
                        });
                    } catch (error) {
                        console.error('[Direct API Call Fix] Error parsing DB format nutrition data:', error);
                    }
                }

                console.log('[Direct API Call Fix] Collected form data:', ingredientData);

                try {
                    const response = await window.directAddIngredientToRecipe(recipeId, ingredientData);

                    if (response.ok) {
                        console.log('[Direct API Call Fix] Ingredient added successfully');

                        form.style.display = 'none';

                        const recipeCard = document.querySelector(`.recipe-card[data-id="${recipeId}"]`);
                        if (recipeCard) {
                            const detailsDiv = recipeCard.querySelector('.ingredient-details');
                            if (detailsDiv && typeof window.fetchAndDisplayIngredients === 'function') {

                                window.fetchAndDisplayIngredients(recipeId, detailsDiv, null, true);
                            }
                        }
                    } else {
                        console.error('[Direct API Call Fix] Failed to add ingredient:', response.status);
                    }
                } catch (error) {
                    console.error('[Direct API Call Fix] Error adding ingredient:', error);
                }
            });
        });
    });

    console.log('[Direct API Call Fix] Initialized');
})();
