/**
 * Consolidated Recipe Ingredient Fix
 *
 * This script consolidates the functionality of multiple fix scripts:
 * - fix-add-ingredient.js
 * - fix-direct-api-call.js
 * - fix-recipe-ingredient-api.js
 * - fix-ingredient-refresh.js
 *
 * It provides a unified solution for adding ingredients to recipes
 * and refreshing the ingredient list.
 */

(function() {
    console.log('[Recipe Ingredient Fix] Initializing consolidated fix...');

    const originalFetch = window.fetch;

    let apiCallInProgress = false;

    /**
     * Make a direct API call that bypasses any interceptors
     */
    async function directApiCall(url, options) {
        console.log(`[Recipe Ingredient Fix] Making direct API call to: ${url} (${options.method})`);

        try {

            apiCallInProgress = true;

            const response = await originalFetch(url, options);

            if (response.ok) {
                console.log(`[Recipe Ingredient Fix] Request successful: ${response.status}`);
            } else {
                console.error(`[Recipe Ingredient Fix] Request failed: ${response.status}`);

                try {
                    const clonedResponse = response.clone();
                    const responseData = await clonedResponse.json();
                    console.error(`[Recipe Ingredient Fix] Error response:`, responseData);
                } catch (error) {

                }
            }

            apiCallInProgress = false;
            return response;
        } catch (error) {
            console.error(`[Recipe Ingredient Fix] Error:`, error);

            apiCallInProgress = false;
            throw error;
        }
    }

    /**
     * Process ingredient data to ensure all fields are properly formatted
     */
    function processIngredientData(ingredientData) {

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

        ['amount', 'calories', 'protein', 'fats', 'carbohydrates', 'price'].forEach(field => {
            if (requiredData[field] === undefined || requiredData[field] === null) {
                console.warn(`[Recipe Ingredient Fix] Required field ${field} is missing, setting to 0`);
                requiredData[field] = 0;
            } else if (typeof requiredData[field] === 'string') {
                requiredData[field] = parseFloat(requiredData[field]);
                if (isNaN(requiredData[field])) {
                    requiredData[field] = 0;
                }
            }
        });

        if (!requiredData.name) {
            console.warn('[Recipe Ingredient Fix] Name is missing, setting to "Unnamed Ingredient"');
            requiredData.name = 'Unnamed Ingredient';
        }

        if (requiredData.package_amount !== undefined && requiredData.package_amount !== null) {
            if (typeof requiredData.package_amount === 'string') {
                requiredData.package_amount = parseFloat(requiredData.package_amount);
                if (isNaN(requiredData.package_amount)) {
                    delete requiredData.package_amount;
                }
            }
        }

        numericFields.forEach(field => {

            if (['amount', 'package_amount', 'price', 'calories', 'protein', 'fats', 'carbohydrates'].includes(field)) {
                return;
            }

            const value = processedData[field] ||
                          processedData[`add-ingredient-${field}`] ||
                          processedData[`ingredient-${field}`] ||
                          processedData[`add-ingredient-${field.replace('_', '-')}`] || // Handle dash vs underscore
                          processedData[`ingredient-${field.replace('_', '-')}`];

            if (value !== undefined && value !== null) {
                requiredData[field] = parseFloat(value);
                if (isNaN(requiredData[field])) {
                    requiredData[field] = 0;
                }
            }
        });

        if (processedData.trans_fat !== undefined) {
            requiredData.trans = parseFloat(processedData.trans_fat);
            if (isNaN(requiredData.trans)) {
                requiredData.trans = 0;
            }
        } else if (processedData['add-ingredient-trans-fat'] !== undefined) {
            requiredData.trans = parseFloat(processedData['add-ingredient-trans-fat']);
            if (isNaN(requiredData.trans)) {
                requiredData.trans = 0;
            }
        }

        console.log('[Recipe Ingredient Fix] Processed ingredient data:', requiredData);
        return requiredData;
    }

    /**
     * Add an ingredient to a recipe using the correct API endpoint
     */
    async function addIngredientToRecipe(recipeId, ingredientData) {
        console.log(`[Recipe Ingredient Fix] Adding ingredient to recipe ${recipeId}`);

        const processedData = processIngredientData(ingredientData);

        try {

            console.log('[Recipe Ingredient Fix] Using standard endpoint...');

            let response = await directApiCall(`/api/recipes/${recipeId}/ingredients`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate'
                },
                body: JSON.stringify(processedData)
            });

            if (response.ok) {
                console.log('[Recipe Ingredient Fix] Ingredient added successfully');
                return response;
            } else {

                console.error(`[Recipe Ingredient Fix] Standard endpoint failed with status: ${response.status}`);

                try {

                    const errorData = await response.clone().json();
                    console.error('[Recipe Ingredient Fix] Error details:', errorData);

                    if (errorData.error && errorData.error.includes('API endpoint not found')) {
                        console.log('[Recipe Ingredient Fix] Trying alternative endpoint...');

                        response = await directApiCall(`/api/recipe-ingredients/${recipeId}/ingredients`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Cache-Control': 'no-cache, no-store, must-revalidate'
                            },
                            body: JSON.stringify(processedData)
                        });

                        if (response.ok) {
                            console.log('[Recipe Ingredient Fix] Ingredient added successfully using alternative endpoint');
                            return response;
                        } else {
                            console.error(`[Recipe Ingredient Fix] Alternative endpoint also failed with status: ${response.status}`);
                            return response;
                        }
                    }
                } catch (e) {

                    console.error('[Recipe Ingredient Fix] Error parsing error response:', e);
                }

                return response;
            }
        } catch (error) {
            console.error('[Recipe Ingredient Fix] Error adding ingredient:', error);
            throw error;
        }
    }

    /**
     * Fetch and display ingredients for a recipe
     */
    async function fetchAndDisplayIngredients(recipeId, detailsDiv, button, forceRefresh = false) {
        console.log(`[Recipe Ingredient Fix] Fetching ingredients for recipe ${recipeId}`);

        if (!forceRefresh && detailsDiv.innerHTML.trim() !== '') {
            console.log('[Recipe Ingredient Fix] Ingredients already loaded, skipping fetch');
            return;
        }

        try {

            const timestamp = Date.now();
            console.log(`[Recipe Ingredient Fix] Fetching recipe data with timestamp ${timestamp}`);

            const response = await fetch(`/api/recipes/${recipeId}?timestamp=${timestamp}`);

            if (!response.ok) {
                console.error(`[Recipe Ingredient Fix] API response status: ${response.status}`);
                return;
            }

            console.log(`[Recipe Ingredient Fix] API response status: ${response.status}`);

            const responseData = await response.json();
            console.log(`[Recipe Ingredient Fix] Fetched response data:`, responseData);

            // Handle both wrapped and direct response formats
            let recipeData;
            if (responseData.success && responseData.recipe) {
                // New MVC format: {success: true, recipe: {...}, message: "..."}
                recipeData = responseData.recipe;
                console.log(`[Recipe Ingredient Fix] Using wrapped response format`);
            } else if (responseData.ingredients) {
                // Old direct format: {id: 1, name: "...", ingredients: [...]}
                recipeData = responseData;
                console.log(`[Recipe Ingredient Fix] Using direct response format`);
            } else {
                console.error(`[Recipe Ingredient Fix] Invalid response format:`, responseData);
                detailsDiv.innerHTML = '<p>Error loading recipe data.</p>';
                return;
            }

            console.log(`[Recipe Ingredient Fix] Processed recipe data:`, recipeData);

            if (!recipeData.ingredients || !Array.isArray(recipeData.ingredients)) {
                console.log(`[Recipe Ingredient Fix] No ingredients found for recipe ${recipeId}`);
                detailsDiv.innerHTML = '<p>No ingredients found for this recipe.</p>';
                return;
            }

            console.log(`[Recipe Ingredient Fix] Fetched ${recipeData.ingredients.length} ingredients`);

            if (typeof window.renderIngredientDetails === 'function') {
                console.log('[Recipe Ingredient Fix] Calling original renderIngredientDetails function');
                window.renderIngredientDetails(recipeData.ingredients, detailsDiv, timestamp);
            } else {

                console.log('[Recipe Ingredient Fix] Using fallback rendering');
                let html = '<h3>Ingredients</h3>';
                html += '<table class="ingredient-table">';
                html += '<thead><tr><th>Name</th><th>Amount (g)</th><th>Calories</th></tr></thead>';
                html += '<tbody>';

                recipeData.ingredients.forEach(ingredient => {
                    html += `<tr>
                        <td>${ingredient.name}</td>
                        <td>${ingredient.amount}</td>
                        <td>${ingredient.calories}</td>
                    </tr>`;
                });

                html += '</tbody></table>';
                detailsDiv.innerHTML = html;
            }

            detailsDiv.scrollIntoView({ behavior: 'smooth' });
            console.log('[Recipe Ingredient Fix] Scrolled to ingredient details');
        } catch (error) {
            console.error('[Recipe Ingredient Fix] Error fetching ingredients:', error);
            detailsDiv.innerHTML = '<p>Error loading ingredients. Please try again.</p>';
        }
    }

    window.fetch = function(url, options) {

        if (apiCallInProgress) {
            return originalFetch(url, options);
        }

        if (typeof url === 'string') {

            if (url.match(/\/api\/recipes\/\d+\/ingredients$/) && options && options.method === 'POST') {
                console.log('[Recipe Ingredient Fix] Intercepted add ingredient request');

                const recipeId = url.match(/\/api\/recipes\/(\d+)\/ingredients/)[1];

                try {

                    const ingredientData = JSON.parse(options.body);

                    return addIngredientToRecipe(recipeId, ingredientData);
                } catch (error) {
                    console.error('[Recipe Ingredient Fix] Error parsing request body:', error);
                }
            }

            if (url.match(/\/api\/recipe-ingredients\/\d+\/ingredients$/) && options && options.method === 'POST') {
                console.log('[Recipe Ingredient Fix] Intercepted recipe-ingredients endpoint request - redirecting to standard endpoint');

                const recipeId = url.match(/\/api\/recipe-ingredients\/(\d+)\/ingredients/)[1];

                try {

                    const ingredientData = JSON.parse(options.body);

                    return addIngredientToRecipe(recipeId, ingredientData);
                } catch (error) {
                    console.error('[Recipe Ingredient Fix] Error parsing request body:', error);
                }
            }

            if (url.match(/\/api\/.*/) && !apiCallInProgress) {

                return originalFetch(url, options)
                    .then(response => {

                        if (response.status === 404) {
                            return response.clone().json()
                                .then(data => {
                                    if (data.error && data.error.includes('API endpoint not found')) {
                                        console.error(`[Recipe Ingredient Fix] API endpoint not found: ${url}`);
                                        console.error('[Recipe Ingredient Fix] This might be a misconfigured API call');

                                        if (url.includes('/recipes/') || url.includes('/recipe-ingredients/')) {
                                            console.log('[Recipe Ingredient Fix] This appears to be a recipe-related endpoint');
                                            console.log('[Recipe Ingredient Fix] Try using /api/recipes/:recipeId/ingredients instead');
                                        }
                                    }
                                    return response;
                                })
                                .catch(() => {

                                    return response;
                                });
                        }
                        return response;
                    });
            }

            if (url.match(/\/api\/recipes\/\d+\/ingredients\/\d+$/) && options && options.method === 'GET') {
                console.log('[Recipe Ingredient Fix] Intercepted get ingredient request');

                const matches = url.match(/\/api\/recipes\/(\d+)\/ingredients\/(\d+)/);
                const recipeId = matches[1];
                const ingredientId = matches[2];

                const newUrl = `/api/recipes/${recipeId}`;
                console.log(`[Recipe Ingredient Fix] Redirecting to: ${newUrl}`);

                return originalFetch(newUrl, options)
                    .then(response => {
                        if (!response.ok) {
                            console.error(`[Recipe Ingredient Fix] Response status: ${response.status}`);
                            return response;
                        }

                        return response.clone().json()
                            .then(data => {

                                const ingredient = data.ingredients.find(i => i.id == ingredientId);

                                if (!ingredient) {
                                    console.error(`[Recipe Ingredient Fix] Ingredient with ID ${ingredientId} not found`);
                                    return new Response(JSON.stringify({
                                        error: `Ingredient with ID ${ingredientId} not found`
                                    }), {
                                        status: 404,
                                        headers: {
                                            'Content-Type': 'application/json'
                                        }
                                    });
                                }

                                return new Response(JSON.stringify(ingredient), {
                                    status: 200,
                                    headers: {
                                        'Content-Type': 'application/json'
                                    }
                                });
                            })
                            .catch(error => {
                                console.error('[Recipe Ingredient Fix] Error parsing response:', error);
                                return response;
                            });
                    });
            }
        }

        return originalFetch(url, options);
    };

    window.directApiCall = directApiCall;
    window.addIngredientToRecipe = addIngredientToRecipe;
    window.fetchAndDisplayIngredients = fetchAndDisplayIngredients;

    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Recipe Ingredient Fix] Setting up form submission override');

        const forms = document.querySelectorAll('form#add-ingredient-form');

        forms.forEach(form => {
            console.log('[Recipe Ingredient Fix] Found add ingredient form');

            form.addEventListener('submit', async function(event) {
                console.log('[Recipe Ingredient Fix] Form submission intercepted');
                event.preventDefault();

                const recipeIdInput = form.querySelector('#add-ingredient-recipe-id');
                if (!recipeIdInput || !recipeIdInput.value) {
                    console.error('[Recipe Ingredient Fix] Recipe ID not found');
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

                        Object.entries(nutritionData).forEach(([key, value]) => {
                            if (key !== 'success') {
                                ingredientData[key] = value;
                            }
                        });
                    } catch (error) {
                        console.error('[Recipe Ingredient Fix] Error parsing complete nutrition data:', error);
                    }
                }

                if (form.dataset.dbFormatNutritionData) {
                    try {
                        const dbFormatData = JSON.parse(form.dataset.dbFormatNutritionData);

                        Object.entries(dbFormatData).forEach(([key, value]) => {
                            ingredientData[key] = value;
                        });
                    } catch (error) {
                        console.error('[Recipe Ingredient Fix] Error parsing DB format nutrition data:', error);
                    }
                }

                try {
                    console.log('[Recipe Ingredient Fix] Sending ingredient data:', ingredientData);
                    const response = await addIngredientToRecipe(recipeId, ingredientData);

                    if (response.ok) {
                        console.log('[Recipe Ingredient Fix] Ingredient added successfully');

                        form.style.display = 'none';

                        const recipeCard = document.querySelector(`.recipe-card[data-id="${recipeId}"]`);
                        if (recipeCard) {
                            const detailsDiv = recipeCard.querySelector('.ingredient-details');
                            if (detailsDiv) {
                                console.log('[Recipe Ingredient Fix] Refreshing ingredient list');
                                fetchAndDisplayIngredients(recipeId, detailsDiv, null, true);
                            }
                        }
                    } else {
                        console.error('[Recipe Ingredient Fix] Failed to add ingredient:', response.status);

                        try {

                            const errorData = await response.clone().json();
                            console.error('[Recipe Ingredient Fix] Error details:', errorData);

                            alert(`Failed to add ingredient: ${errorData.error || 'Unknown error'}`);
                        } catch (e) {

                            alert('Failed to add ingredient. Please check the console for details.');
                        }
                    }
                } catch (error) {
                    console.error('[Recipe Ingredient Fix] Error adding ingredient:', error);
                    alert(`Error adding ingredient: ${error.message}`);
                }
            });
        });
    });

    console.log('[Recipe Ingredient Fix] Consolidated fix initialized');
})();
