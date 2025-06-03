/**
 * Add Save and Cancel buttons to the detailed nutrition panel
 * UPDATED VERSION WITH DATABASE SAVING - v2.0
 */
console.log('[Nutrition Edit Buttons] UPDATED VERSION v2.0 LOADED');

// Execute immediately if DOM is already loaded, otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNutritionEditButtons);
} else {
    initNutritionEditButtons();
}

function initNutritionEditButtons() {

    function addNutritionEditButtons() {

        document.querySelectorAll('.detailed-nutrition-panel').forEach(panel => {

            if (panel.dataset.nutritionButtonsAdded === 'true') {
                return;
            }

            const buttonsContainer = document.createElement('div');
            buttonsContainer.className = 'nutrition-edit-buttons';

            const saveButton = document.createElement('button');
            saveButton.type = 'button';
            saveButton.className = 'save-nutrition';
            saveButton.textContent = 'Save Changes';

            const cancelButton = document.createElement('button');
            cancelButton.type = 'button';
            cancelButton.className = 'cancel-nutrition';
            cancelButton.textContent = 'Cancel';

            buttonsContainer.appendChild(saveButton);
            buttonsContainer.appendChild(cancelButton);

            // Insert buttons at the top of the panel instead of bottom
            panel.insertBefore(buttonsContainer, panel.firstChild);

            const originalValues = {};

            function storeOriginalValues() {

                panel.querySelectorAll('input').forEach(input => {

                    originalValues[input.id] = input.value;
                });
            }

            storeOriginalValues();

            saveButton.addEventListener('click', function() {
                console.log('[Nutrition Save] Save Nutrition button clicked');

                const ingredientItem = panel.closest('.ingredient-item');
                if (!ingredientItem) {
                    console.error('[Nutrition Save] Could not find ingredient item container');
                    return;
                }

                // Collect comprehensive nutrition data using the same method as the working save function
                const nutritionData = {};

                // Helper function to safely get value from an element
                const getElementValue = (id) => {
                    const element = document.getElementById(id);
                    return element ? (parseFloat(element.value) || 0) : 0;
                };

                // Collect basic nutrition data
                nutritionData.calories = getElementValue('edit-nutrition-calories');
                nutritionData.protein = getElementValue('edit-nutrition-protein');
                nutritionData.fats = getElementValue('edit-nutrition-fat');
                nutritionData.carbohydrates = getElementValue('edit-nutrition-carbs');

                // Collect ALL comprehensive nutrition data
                // Carbohydrates
                nutritionData.fiber = getElementValue('edit-nutrition-fiber');
                nutritionData.sugars = getElementValue('edit-nutrition-sugars');
                nutritionData.starch = getElementValue('edit-nutrition-starch');
                nutritionData.added_sugars = getElementValue('edit-nutrition-added-sugars');
                nutritionData.net_carbs = getElementValue('edit-nutrition-net-carbs');

                // B Vitamins (using actual database column names)
                nutritionData.vitamin_b1 = getElementValue('edit-nutrition-b1');
                nutritionData.vitamin_b2 = getElementValue('edit-nutrition-b2');
                nutritionData.vitamin_b3 = getElementValue('edit-nutrition-b3');
                nutritionData.vitamin_b5 = getElementValue('edit-nutrition-b5');
                nutritionData.vitamin_b6 = getElementValue('edit-nutrition-b6');
                nutritionData.vitamin_b12 = getElementValue('edit-nutrition-b12');
                nutritionData.folate = getElementValue('edit-nutrition-folate');

                // Other Vitamins
                nutritionData.vitamin_a = getElementValue('edit-nutrition-vitamin-a');
                nutritionData.vitamin_c = getElementValue('edit-nutrition-vitamin-c');
                nutritionData.vitamin_d = getElementValue('edit-nutrition-vitamin-d');
                nutritionData.vitamin_e = getElementValue('edit-nutrition-vitamin-e');
                nutritionData.vitamin_k = getElementValue('edit-nutrition-vitamin-k');

                // Minerals
                nutritionData.calcium = getElementValue('edit-nutrition-calcium');
                nutritionData.copper = getElementValue('edit-nutrition-copper');
                nutritionData.iron = getElementValue('edit-nutrition-iron');
                nutritionData.magnesium = getElementValue('edit-nutrition-magnesium');
                nutritionData.manganese = getElementValue('edit-nutrition-manganese');
                nutritionData.phosphorus = getElementValue('edit-nutrition-phosphorus');
                nutritionData.potassium = getElementValue('edit-nutrition-potassium');
                nutritionData.selenium = getElementValue('edit-nutrition-selenium');
                nutritionData.sodium = getElementValue('edit-nutrition-sodium');
                nutritionData.zinc = getElementValue('edit-nutrition-zinc');

                // Lipids
                nutritionData.monounsaturated = getElementValue('edit-nutrition-monounsaturated');
                nutritionData.polyunsaturated = getElementValue('edit-nutrition-polyunsaturated');
                nutritionData.omega3 = getElementValue('edit-nutrition-omega3');
                nutritionData.omega6 = getElementValue('edit-nutrition-omega6');
                nutritionData.saturated = getElementValue('edit-nutrition-saturated');
                nutritionData.trans = getElementValue('edit-nutrition-trans');
                nutritionData.cholesterol = getElementValue('edit-nutrition-cholesterol');

                // Amino Acids (all exist in database schema)
                nutritionData.cystine = getElementValue('edit-nutrition-cystine');
                nutritionData.histidine = getElementValue('edit-nutrition-histidine');
                nutritionData.isoleucine = getElementValue('edit-nutrition-isoleucine');
                nutritionData.leucine = getElementValue('edit-nutrition-leucine');
                nutritionData.lysine = getElementValue('edit-nutrition-lysine');
                nutritionData.methionine = getElementValue('edit-nutrition-methionine');
                nutritionData.phenylalanine = getElementValue('edit-nutrition-phenylalanine');
                nutritionData.threonine = getElementValue('edit-nutrition-threonine');
                nutritionData.tryptophan = getElementValue('edit-nutrition-tryptophan');
                nutritionData.tyrosine = getElementValue('edit-nutrition-tyrosine');
                nutritionData.valine = getElementValue('edit-nutrition-valine');

                // Other
                nutritionData.alcohol = getElementValue('edit-nutrition-alcohol');
                nutritionData.caffeine = getElementValue('edit-nutrition-caffeine');
                nutritionData.water = getElementValue('edit-nutrition-water');

                // Collect basic ingredient data
                nutritionData.name = document.getElementById('edit-popup-ingredient-name')?.value || '';
                nutritionData.amount = parseFloat(document.getElementById('edit-popup-ingredient-amount')?.value) || 0;
                nutritionData.package_amount = parseFloat(document.getElementById('edit-popup-package-amount')?.value) || 0;
                nutritionData.price = parseFloat(document.getElementById('edit-popup-price')?.value) || 0;
                nutritionData.grocery_store = document.getElementById('edit-popup-grocery-store')?.value || '';

                console.log('[Nutrition Save] Collected nutrition data:', nutritionData);

                if (window.NutritionFieldMapper) {
                    const dbFormatData = window.NutritionFieldMapper.toDbFormat(nutritionData);
                    console.log('DB format nutrition data:', dbFormatData);

                    ingredientItem.dataset.dbFormatNutritionData = JSON.stringify(dbFormatData);
                    console.log('Stored DB format nutrition data in dataset');

                    for (const [key, value] of Object.entries(dbFormatData)) {

                        if (value === null || value === undefined) continue;

                        let hiddenField = ingredientItem.querySelector(`.ingredient-${key}`);
                        if (!hiddenField) {
                            hiddenField = document.createElement('input');
                            hiddenField.type = 'hidden';
                            hiddenField.name = `ingredient-${key}`;
                            hiddenField.className = `ingredient-${key}`;
                            ingredientItem.appendChild(hiddenField);
                        }

                        hiddenField.value = value;
                    }

                    let micronutrientFlagField = ingredientItem.querySelector('.ingredient-has-micronutrients');
                    if (!micronutrientFlagField) {
                        micronutrientFlagField = document.createElement('input');
                        micronutrientFlagField.type = 'hidden';
                        micronutrientFlagField.name = 'ingredient-has-micronutrients';
                        micronutrientFlagField.className = 'ingredient-has-micronutrients';
                        ingredientItem.appendChild(micronutrientFlagField);
                    }
                    micronutrientFlagField.value = 'true';
                } else {
                    console.error('NutritionFieldMapper not available');
                }

                // Save to database using the same method as the working save function
                const recipeSelector = document.getElementById('recipe-selector');
                const recipeId = recipeSelector ? recipeSelector.value : null;

                if (!recipeId) {
                    console.error('[Nutrition Save] No recipe ID found, cannot save to database');
                    showSaveMessage(panel, 'Error: No recipe selected', '#ff4444');
                    return;
                }

                // Try to get ingredient ID from the ingredient item or find it via API
                let ingredientId = null;

                // Check if ingredient ID is stored in the DOM
                const ingredientIdElement = document.querySelector('[data-ingredient-id]');
                if (ingredientIdElement) {
                    ingredientId = ingredientIdElement.dataset.ingredientId;
                }

                // If no ingredient ID found, try to get it from the recipe API
                if (!ingredientId) {
                    console.log('[Nutrition Save] No ingredient ID found in DOM, fetching from API...');

                    // Try to determine ingredient index from the panel position or edit button
                    let ingredientIndex = -1;

                    // First try to get index from the edit button that was clicked
                    const editButtons = document.querySelectorAll('.edit-ingredient-btn');
                    editButtons.forEach((btn, index) => {
                        if (btn.dataset.index !== undefined) {
                            // Check if this button corresponds to our panel
                            const allPanels = document.querySelectorAll('.detailed-nutrition-panel');
                            if (allPanels[parseInt(btn.dataset.index)] === panel) {
                                ingredientIndex = parseInt(btn.dataset.index);
                            }
                        }
                    });

                    // Fallback: determine from panel position
                    if (ingredientIndex === -1) {
                        const allPanels = document.querySelectorAll('.detailed-nutrition-panel');
                        for (let i = 0; i < allPanels.length; i++) {
                            if (allPanels[i] === panel) {
                                ingredientIndex = i;
                                break;
                            }
                        }
                    }

                    if (ingredientIndex >= 0) {
                        console.log('[Nutrition Save] Using ingredient index:', ingredientIndex);

                        // Fetch recipe data to get ingredient ID
                        fetch(`/api/recipes/${recipeId}`)
                            .then(response => response.json())
                            .then(data => {
                                if (data.success && data.recipe && data.recipe.ingredients && data.recipe.ingredients[ingredientIndex]) {
                                    const ingredientFromAPI = data.recipe.ingredients[ingredientIndex];
                                    ingredientId = ingredientFromAPI.id;
                                    console.log('[Nutrition Save] Got ingredient ID from API:', ingredientId);

                                    // Now save the data
                                    saveNutritionToDatabase(recipeId, ingredientId, nutritionData, panel);
                                } else {
                                    console.error('[Nutrition Save] Could not get ingredient data from API');
                                    showSaveMessage(panel, 'Error: Ingredient not found', '#ff4444');
                                }
                            })
                            .catch(error => {
                                console.error('[Nutrition Save] Error fetching recipe data:', error);
                                showSaveMessage(panel, 'Error: API error', '#ff4444');
                            });
                        return; // Exit here, saveNutritionToDatabase will be called from the API response
                    }
                }

                if (ingredientId) {
                    saveNutritionToDatabase(recipeId, ingredientId, nutritionData, panel);
                } else {
                    console.error('[Nutrition Save] Could not determine ingredient ID');
                    showSaveMessage(panel, 'Error: Ingredient ID not found', '#ff4444');
                }

                // Note: panel hiding and success message are handled in saveNutritionToDatabase
            });

            cancelButton.addEventListener('click', function() {

                panel.querySelectorAll('input').forEach(input => {
                    if (originalValues[input.id]) {
                        input.value = originalValues[input.id];
                    }
                });

                panel.style.display = 'none';

                const toggleButton = panel.previousElementSibling?.querySelector('.toggle-detailed-nutrition');
                if (toggleButton) {
                    toggleButton.textContent = 'Show Detailed Nutrition';
                }
            });

            panel.dataset.nutritionButtonsAdded = 'true';
        });
    }

    setTimeout(addNutritionEditButtons, 300);

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(addNutritionEditButtons, 100);
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('toggle-detailed-nutrition')) {

            setTimeout(addNutritionEditButtons, 200);
        }
    });

    setInterval(addNutritionEditButtons, 2000);

    // Helper function to save nutrition data to database
    function saveNutritionToDatabase(recipeId, ingredientId, nutritionData, panel) {
        console.log('[Nutrition Save] Saving to database:', { recipeId, ingredientId, nutritionData });

        // Make API call to update ingredient in database using the correct endpoint
        fetch(`/api/recipes/${recipeId}/ingredients/${ingredientId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(nutritionData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('[Nutrition Save] Database update successful:', data);
            showSaveMessage(panel, 'Nutrition data saved successfully!', '#4CAF50');

            // Hide the panel
            panel.style.display = 'none';

            // Update toggle button text
            const toggleButton = panel.previousElementSibling?.querySelector('.toggle-detailed-nutrition');
            if (toggleButton) {
                toggleButton.textContent = 'Show Nutrition';
            }
        })
        .catch(error => {
            console.error('[Nutrition Save] Error saving to database:', error);
            showSaveMessage(panel, 'Error saving nutrition data', '#ff4444');
        });
    }

    // Helper function to show save messages
    function showSaveMessage(panel, messageText, color) {
        const message = document.createElement('div');
        message.className = 'nutrition-save-message';
        message.textContent = messageText;
        message.style.color = color;
        message.style.padding = '5px';
        message.style.textAlign = 'center';
        message.style.marginTop = '5px';
        message.style.fontWeight = 'bold';

        if (panel.previousElementSibling) {
            panel.previousElementSibling.appendChild(message);

            setTimeout(() => {
                message.remove();
            }, 3000);
        }
    }
}
