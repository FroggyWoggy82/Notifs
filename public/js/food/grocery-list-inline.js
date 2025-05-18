/**
 * Grocery List Inline Functionality
 * Allows users to select recipes, adjust calories, and generate a grocery list
 * with package counts based on package amounts
 * Also displays micronutrient percentages of daily targets
 */

document.addEventListener('DOMContentLoaded', function() {

    const recipeSelectionContainer = document.getElementById('grocery-recipe-selection');
    const calorieAdjustmentContainer = document.getElementById('calorie-adjustment-container');
    const generateListBtn = document.getElementById('generate-list-btn');
    const saveAsTaskBtn = document.getElementById('save-as-task-btn');
    const groceryListResults = document.getElementById('grocery-list-results');
    const statusMessage = document.getElementById('grocery-status-message');
    const currentCalorieTarget = document.getElementById('current-calorie-target');

    let allRecipes = [];
    let selectedRecipeIds = [];
    let adjustedRecipes = [];
    let groceryList = null;
    let dailyCalorieTarget = 0;
    let dailyProteinTarget = 0;
    let fullRecipeData = []; // Store full recipe data for micronutrient calculations

    init();

    async function init() {
        try {
            // Load recipes
            await loadRecipes();

            // Get daily calorie target
            await loadDailyCalorieTarget();

            // Add event listeners
            addEventListeners();

            // Update UI
            updateUI();
        } catch (error) {
            console.error('Initialization error:', error);
            showStatus('Failed to initialize the grocery list generator.', 'error');
        }
    }

    async function loadDailyCalorieTarget() {
        try {
            // Extract the calorie target from the UI
            if (currentCalorieTarget) {
                const targetText = currentCalorieTarget.textContent;
                const calorieMatch = targetText.match(/(\d+)/);
                if (calorieMatch && calorieMatch[1]) {
                    dailyCalorieTarget = parseInt(calorieMatch[1]);
                    console.log(`Daily calorie target loaded: ${dailyCalorieTarget}`);
                } else {
                    console.log('No calorie target found in the UI');
                    dailyCalorieTarget = 0;
                }
            } else {
                console.log('Current calorie target element not found');
                dailyCalorieTarget = 0;
            }

            // Extract the protein target from the UI
            const currentProteinTarget = document.getElementById('current-protein-target');
            if (currentProteinTarget) {
                const proteinText = currentProteinTarget.textContent;
                const proteinMatch = proteinText.match(/(\d+)/);
                if (proteinMatch && proteinMatch[1]) {
                    dailyProteinTarget = parseInt(proteinMatch[1]);
                    console.log(`Daily protein target loaded: ${dailyProteinTarget}g`);
                } else {
                    console.log('No protein target found in the UI');
                    // If no protein target is set, calculate default based on calories (15% of calories)
                    if (dailyCalorieTarget > 0) {
                        dailyProteinTarget = Math.round((dailyCalorieTarget * 0.15) / 4);
                        console.log(`Using default protein target: ${dailyProteinTarget}g (calculated from calories)`);
                    } else {
                        dailyProteinTarget = 0;
                    }
                }
            } else {
                console.log('Current protein target element not found');
                dailyProteinTarget = 0;
            }

            // Update the micronutrient targets based on the user's daily targets
            if (typeof updateMicronutrientTargets === 'function' && dailyCalorieTarget > 0) {
                updateMicronutrientTargets(dailyCalorieTarget, dailyProteinTarget);
                console.log(`Updated micronutrient targets with calorie target: ${dailyCalorieTarget} and protein target: ${dailyProteinTarget}g`);
            } else if (typeof updateMicronutrientCalorieTarget === 'function' && dailyCalorieTarget > 0) {
                // Fall back to the old function if the new one isn't available
                updateMicronutrientCalorieTarget(dailyCalorieTarget);
                console.log(`Updated micronutrient targets with calorie target only: ${dailyCalorieTarget}`);
            } else {
                console.warn('Micronutrient target update functions not found');
            }
        } catch (error) {
            console.error('Error loading daily nutrition targets:', error);
            dailyCalorieTarget = 0;
            dailyProteinTarget = 0;
        }
    }

    function calculateTotalCalories() {
        // Calculate the total calories from all adjusted recipes
        return adjustedRecipes.reduce((total, recipe) => total + recipe.adjustedCalories, 0);
    }

    function calculateTotalProtein() {
        // Calculate the total protein from all adjusted recipes
        // We need to estimate protein based on the scale factor and original protein content
        return adjustedRecipes.reduce((total, recipe) => {
            // If we have protein data directly, use it
            if (recipe.total_protein) {
                return total + (recipe.total_protein * recipe.scaleFactor);
            }

            // Otherwise estimate protein as 15% of calories (4 calories per gram of protein)
            // This is a rough estimate if we don't have actual protein data
            const estimatedProtein = (recipe.adjustedCalories * 0.15) / 4;
            return total + estimatedProtein;
        }, 0);
    }

    function autoAdjustToTarget() {
        // Check if we have a valid daily calorie target
        if (!dailyCalorieTarget || dailyCalorieTarget <= 0) {
            showStatus('Please set a daily calorie target first.', 'error');
            return;
        }

        // Check if we have selected recipes
        if (adjustedRecipes.length === 0) {
            showStatus('Please select at least one recipe first.', 'error');
            return;
        }

        // Calculate calories per recipe (equal distribution)
        const caloriesPerRecipe = dailyCalorieTarget / adjustedRecipes.length;

        // Update each recipe's calories
        adjustedRecipes.forEach(recipe => {
            // Calculate new scale factor based on target calories
            const newScaleFactor = caloriesPerRecipe / recipe.originalCalories;

            // Update recipe with new values
            recipe.adjustedCalories = caloriesPerRecipe;
            recipe.scaleFactor = newScaleFactor;

            // Update UI for this recipe
            const adjustmentItem = document.querySelector(`.calorie-adjustment-item[data-id="${recipe.id}"]`);
            if (adjustmentItem) {
                // Update info text
                const infoElement = adjustmentItem.querySelector('.calorie-adjustment-info');
                const percentage = (recipe.scaleFactor * 100).toFixed(0);
                if (infoElement) {
                    infoElement.textContent = `Original: ${recipe.originalCalories.toFixed(1)} calories | Scale Factor: ${recipe.scaleFactor.toFixed(2)}x | ${percentage}% of original`;
                }

                // Update calorie input
                const calorieInput = adjustmentItem.querySelector('.calorie-adjustment-input');
                if (calorieInput) {
                    calorieInput.value = recipe.adjustedCalories.toFixed(1);
                }

                // Update percentage input
                const percentInput = adjustmentItem.querySelector('.percent-adjustment-input');
                if (percentInput) {
                    percentInput.value = percentage;
                }
            }
        });

        // Show success message
        showStatus(`Recipes adjusted to equal portions of daily target (${caloriesPerRecipe.toFixed(1)} calories each).`, 'success');

        // If grocery list is already generated, regenerate it to reflect the new calorie values
        if (groceryList && groceryList.length > 0) {
            generateGroceryList();
        }
    }

    async function loadRecipes() {
        try {
            showStatus('Loading recipes...', 'info');

            const response = await fetch('/api/recipes');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            allRecipes = await response.json();

            recipeSelectionContainer.innerHTML = '';

            if (allRecipes.length === 0) {
                recipeSelectionContainer.innerHTML = '<p class="empty-message">No recipes available</p>';
            } else {
                renderRecipeCheckboxes();
            }

            showStatus('Recipes loaded successfully!', 'success');
            setTimeout(() => clearStatus(), 2000);
        } catch (error) {
            console.error('Error loading recipes:', error);
            recipeSelectionContainer.innerHTML = '<p class="empty-message">Failed to load recipes</p>';
            showStatus('Failed to load recipes. Please try again.', 'error');
        }
    }

    function renderRecipeCheckboxes() {
        recipeSelectionContainer.innerHTML = '';

        allRecipes.forEach(recipe => {
            const checkboxItem = document.createElement('div');
            checkboxItem.className = 'recipe-checkbox-item';

            const checkboxNameContainer = document.createElement('div');
            checkboxNameContainer.className = 'checkbox-name-container';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `recipe-checkbox-${recipe.id}`;
            checkbox.dataset.id = recipe.id;
            checkbox.checked = selectedRecipeIds.includes(recipe.id);

            const nameSpan = document.createElement('span');
            nameSpan.className = 'recipe-name';
            nameSpan.textContent = recipe.name;

            checkboxNameContainer.appendChild(checkbox);
            checkboxNameContainer.appendChild(nameSpan);

            const caloriesSpan = document.createElement('span');
            caloriesSpan.className = 'recipe-calories';
            caloriesSpan.textContent = `${recipe.total_calories.toFixed(1)} calories`;

            checkboxItem.appendChild(checkboxNameContainer);
            checkboxItem.appendChild(caloriesSpan);

            checkbox.addEventListener('change', function() {
                handleRecipeSelection(recipe.id, this.checked);
            });

            recipeSelectionContainer.appendChild(checkboxItem);
        });
    }

    function handleRecipeSelection(recipeId, isSelected) {
        if (isSelected) {

            if (!selectedRecipeIds.includes(recipeId)) {
                selectedRecipeIds.push(recipeId);
            }
        } else {

            selectedRecipeIds = selectedRecipeIds.filter(id => id !== recipeId);
        }

        updateCalorieAdjustment();

        updateGenerateButton();
    }

    function updateCalorieAdjustment() {
        calorieAdjustmentContainer.innerHTML = '';

        if (selectedRecipeIds.length === 0) {
            calorieAdjustmentContainer.innerHTML = '<p class="empty-message">Select recipes to adjust calories</p>';
            return;
        }

        // Add auto-adjust button at the top of the adjustment container
        if (selectedRecipeIds.length > 0) {
            const autoAdjustContainer = document.createElement('div');
            autoAdjustContainer.className = 'auto-adjust-container';

            const autoAdjustButton = document.createElement('button');
            autoAdjustButton.className = 'auto-adjust-btn';
            autoAdjustButton.textContent = 'Auto Adjust to Daily Target';
            autoAdjustButton.addEventListener('click', autoAdjustToTarget);

            autoAdjustContainer.appendChild(autoAdjustButton);
            calorieAdjustmentContainer.appendChild(autoAdjustContainer);
        }

        const selectedRecipes = allRecipes.filter(recipe => selectedRecipeIds.includes(recipe.id));

        if (adjustedRecipes.length === 0) {
            adjustedRecipes = selectedRecipes.map(recipe => ({
                ...recipe,
                originalCalories: recipe.total_calories,
                adjustedCalories: recipe.total_calories,
                scaleFactor: 1
            }));
        } else {
            selectedRecipes.forEach(recipe => {
                if (!adjustedRecipes.some(r => r.id === recipe.id)) {
                    adjustedRecipes.push({
                        ...recipe,
                        originalCalories: recipe.total_calories,
                        adjustedCalories: recipe.total_calories,
                        scaleFactor: 1
                    });
                }
            });

            adjustedRecipes = adjustedRecipes.filter(recipe =>
                selectedRecipeIds.includes(recipe.id)
            );
        }

        adjustedRecipes.forEach(recipe => {
            const adjustmentItem = document.createElement('div');
            adjustmentItem.className = 'calorie-adjustment-item';
            adjustmentItem.dataset.id = recipe.id;

            const header = document.createElement('div');
            header.className = 'calorie-adjustment-header';

            const nameElement = document.createElement('div');
            nameElement.className = 'calorie-adjustment-name';
            nameElement.textContent = recipe.name;

            const controlsElement = document.createElement('div');
            controlsElement.className = 'calorie-adjustment-controls';
            controlsElement.style.display = 'inline-block';
            controlsElement.style.textAlign = 'right';
            controlsElement.style.width = '300px';

            // Create adjustment mode selector
            const adjustmentModeContainer = document.createElement('div');
            adjustmentModeContainer.className = 'adjustment-mode-container';

            const calorieLabel = document.createElement('label');
            calorieLabel.textContent = 'Calories:';
            calorieLabel.className = 'adjustment-label';

            const calorieInput = document.createElement('input');
            calorieInput.type = 'number';
            calorieInput.className = 'calorie-adjustment-input';
            calorieInput.value = recipe.adjustedCalories.toFixed(1);
            calorieInput.min = '1';
            calorieInput.step = '1';

            const percentLabel = document.createElement('label');
            percentLabel.textContent = 'Percent:';
            percentLabel.className = 'adjustment-label';

            const percentInput = document.createElement('input');
            percentInput.type = 'number';
            percentInput.className = 'percent-adjustment-input';
            // Calculate the current percentage based on the scale factor
            const currentPercentage = (recipe.scaleFactor * 100).toFixed(0);
            percentInput.value = currentPercentage;
            percentInput.min = '1';
            percentInput.step = '1';
            percentInput.placeholder = '%';

            const decreaseBtn = document.createElement('button');
            decreaseBtn.className = 'adjustment-btn';
            decreaseBtn.textContent = '-10%';

            const increaseBtn = document.createElement('button');
            increaseBtn.className = 'adjustment-btn';
            increaseBtn.textContent = '+10%';

            const resetBtn = document.createElement('button');
            resetBtn.className = 'adjustment-btn reset-btn';
            resetBtn.textContent = 'Reset';

            // Add event listeners
            calorieInput.addEventListener('change', function() {
                const newCalories = parseFloat(this.value);
                updateRecipeCalories(recipe.id, newCalories);
                // Update percentage input to match
                const newPercentage = (newCalories / recipe.originalCalories * 100).toFixed(0);
                percentInput.value = newPercentage;
            });

            percentInput.addEventListener('change', function() {
                const percentage = parseFloat(this.value);
                const newCalories = recipe.originalCalories * (percentage / 100);
                updateRecipeCalories(recipe.id, newCalories);
                calorieInput.value = newCalories.toFixed(1);
            });

            decreaseBtn.addEventListener('click', function() {
                const newCalories = recipe.adjustedCalories * 0.9;
                updateRecipeCalories(recipe.id, newCalories);
                calorieInput.value = newCalories.toFixed(2);
                percentInput.value = (newCalories / recipe.originalCalories * 100).toFixed(0);
            });

            increaseBtn.addEventListener('click', function() {
                const newCalories = recipe.adjustedCalories * 1.1;
                updateRecipeCalories(recipe.id, newCalories);
                calorieInput.value = newCalories.toFixed(2);
                percentInput.value = (newCalories / recipe.originalCalories * 100).toFixed(0);
            });

            resetBtn.addEventListener('click', function() {
                updateRecipeCalories(recipe.id, recipe.originalCalories);
                calorieInput.value = recipe.originalCalories.toFixed(2);
                percentInput.value = '100';
            });

            const controlsTable = document.createElement('table');
            controlsTable.style.borderCollapse = 'collapse';
            controlsTable.style.width = 'auto';
            controlsTable.style.marginLeft = 'auto'; // Push to right side
            controlsTable.style.border = 'none';
            controlsTable.style.backgroundColor = 'transparent';

            // First row with calorie input
            const calorieRow = document.createElement('tr');

            const calorieLabelCell = document.createElement('td');
            calorieLabelCell.style.padding = '0 2px';
            calorieLabelCell.style.textAlign = 'right';
            calorieLabelCell.appendChild(calorieLabel);

            const calorieInputCell = document.createElement('td');
            calorieInputCell.style.padding = '0 2px';
            calorieInputCell.appendChild(calorieInput);

            const decreaseCell = document.createElement('td');
            decreaseCell.style.padding = '0 2px';
            decreaseCell.appendChild(decreaseBtn);

            const increaseCell = document.createElement('td');
            increaseCell.style.padding = '0 2px';
            increaseCell.appendChild(increaseBtn);

            const resetCell = document.createElement('td');
            resetCell.style.padding = '0 2px';
            resetCell.appendChild(resetBtn);

            calorieRow.appendChild(calorieLabelCell);
            calorieRow.appendChild(calorieInputCell);
            calorieRow.appendChild(decreaseCell);
            calorieRow.appendChild(increaseCell);
            calorieRow.appendChild(resetCell);

            // Second row with percentage input
            const percentRow = document.createElement('tr');

            const percentLabelCell = document.createElement('td');
            percentLabelCell.style.padding = '0 2px';
            percentLabelCell.style.textAlign = 'right';
            percentLabelCell.appendChild(percentLabel);

            const percentInputCell = document.createElement('td');
            percentInputCell.style.padding = '0 2px';
            percentInputCell.appendChild(percentInput);

            // Empty cells to align with buttons above
            percentRow.appendChild(percentLabelCell);
            percentRow.appendChild(percentInputCell);
            percentRow.appendChild(document.createElement('td'));
            percentRow.appendChild(document.createElement('td'));
            percentRow.appendChild(document.createElement('td'));

            controlsTable.appendChild(calorieRow);
            controlsTable.appendChild(percentRow);

            controlsElement.appendChild(controlsTable);

            header.appendChild(nameElement);
            header.appendChild(controlsElement);

            const infoElement = document.createElement('div');
            infoElement.className = 'calorie-adjustment-info';
            const percentage = (recipe.scaleFactor * 100).toFixed(0);
            infoElement.textContent = `Original: ${recipe.originalCalories.toFixed(2)} calories | Scale Factor: ${recipe.scaleFactor.toFixed(2)}x | ${percentage}% of original`;

            adjustmentItem.appendChild(header);
            adjustmentItem.appendChild(infoElement);

            calorieAdjustmentContainer.appendChild(adjustmentItem);
        });
    }

    function updateRecipeCalories(recipeId, newCalories) {
        const recipe = adjustedRecipes.find(r => r.id === recipeId);

        if (recipe) {
            // Ensure newCalories is a valid number
            newCalories = parseFloat(newCalories);
            if (isNaN(newCalories) || newCalories <= 0) {
                newCalories = recipe.originalCalories; // Reset to original if invalid
            }

            recipe.adjustedCalories = newCalories;
            recipe.scaleFactor = newCalories / recipe.originalCalories;

            // Calculate percentage for display
            const percentage = (recipe.scaleFactor * 100).toFixed(0);

            const adjustmentItem = document.querySelector(`.calorie-adjustment-item[data-id="${recipeId}"]`);
            if (adjustmentItem) {
                const infoElement = adjustmentItem.querySelector('.calorie-adjustment-info');
                infoElement.textContent = `Original: ${recipe.originalCalories.toFixed(2)} calories | Scale Factor: ${recipe.scaleFactor.toFixed(2)}x | ${percentage}% of original`;

                // Update input fields if they exist
                const calorieInput = adjustmentItem.querySelector('.calorie-adjustment-input');
                if (calorieInput) {
                    calorieInput.value = recipe.adjustedCalories.toFixed(2);
                }

                const percentInput = adjustmentItem.querySelector('.percent-adjustment-input');
                if (percentInput) {
                    percentInput.value = percentage;
                }
            }

            // If grocery list is already generated, update it to reflect the new calorie values
            if (groceryList && groceryList.length > 0) {
                // Find the calorie summary row if it exists
                const calorieSummaryRow = document.querySelector('.calorie-summary-row');
                if (calorieSummaryRow) {
                    // Calculate total calories
                    const totalCalories = calculateTotalCalories();

                    // Update the calorie summary
                    const calorieSummaryCell = calorieSummaryRow.querySelector('td');
                    if (calorieSummaryCell) {
                        let calorieSummaryContent = '';
                        if (dailyCalorieTarget > 0) {
                            const percentOfTarget = ((totalCalories / dailyCalorieTarget) * 100).toFixed(1);
                            calorieSummaryContent = `
                                <div class="calorie-summary">
                                    <span class="calorie-summary-label">Total Calories:</span>
                                    <span class="calorie-summary-value">${totalCalories.toFixed(2)}</span>
                                    <span class="calorie-summary-separator">|</span>
                                    <span class="calorie-summary-label">Daily Target:</span>
                                    <span class="calorie-summary-value">${dailyCalorieTarget}</span>
                                    <span class="calorie-summary-separator">|</span>
                                    <span class="calorie-summary-label">Percentage of Daily Target:</span>
                                    <span class="calorie-summary-value ${percentOfTarget > 100 ? 'over-target' : ''}">${percentOfTarget}%</span>
                                </div>
                            `;
                        } else {
                            calorieSummaryContent = `
                                <div class="calorie-summary">
                                    <span class="calorie-summary-label">Total Calories:</span>
                                    <span class="calorie-summary-value">${totalCalories.toFixed(2)}</span>
                                    <span class="calorie-summary-note">(Set a daily calorie target to see percentage)</span>
                                </div>
                            `;
                        }
                        calorieSummaryCell.innerHTML = calorieSummaryContent;
                    }
                }
            }
        }
    }

    function generateGroceryList() {
        if (adjustedRecipes.length === 0) {
            showStatus('Please select at least one recipe.', 'error');
            return;
        }

        showStatus('Generating grocery list...', 'info');

        // Make sure the function is available globally
        window.generateGroceryList = generateGroceryList;

        Promise.all(adjustedRecipes.map(recipe =>
            fetch(`/api/recipes/${recipe.id}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
        ))
        .then(fullRecipes => {
            // Store full recipe data for micronutrient calculations
            fullRecipeData = fullRecipes;

            // EMERGENCY FIX: Log the full recipe data to verify micronutrient data
            console.log('Full recipe data for micronutrient calculations:');
            fullRecipes.forEach(recipe => {
                console.log(`Recipe: ${recipe.name}`);
                if (recipe.ingredients && recipe.ingredients.length > 0) {
                    console.log(`  Ingredients: ${recipe.ingredients.length}`);
                    recipe.ingredients.forEach(ingredient => {
                        console.log(`  - ${ingredient.name}`);

                        // Check for calcium specifically
                        if (ingredient.calcium !== undefined && ingredient.calcium !== null) {
                            console.log(`    Calcium: ${ingredient.calcium}`);
                        }

                        // Count non-zero micronutrient fields
                        const micronutrientFields = Object.keys(ingredient).filter(key =>
                            !['id', 'recipe_id', 'name', 'calories', 'amount', 'protein', 'fats', 'carbohydrates', 'price', 'package_amount',
                             'calories_per_gram', 'protein_per_gram', 'fats_per_gram', 'carbohydrates_per_gram', 'price_per_gram',
                             'created_at', 'updated_at'].includes(key) &&
                            ingredient[key] !== null && ingredient[key] !== 0
                        );

                        console.log(`    Has ${micronutrientFields.length} non-zero micronutrient fields`);
                        if (micronutrientFields.length > 0) {
                            console.log(`    Fields: ${micronutrientFields.join(', ')}`);
                        }
                    });
                }
            });

            // Combine ingredients from all recipes
            const combinedIngredients = {};

            fullRecipes.forEach((fullRecipe, index) => {
                // Calculate scale factor - handle both formats
                let scaleFactor = 1;
                if (adjustedRecipes[index].scaleFactor !== undefined) {
                    scaleFactor = adjustedRecipes[index].scaleFactor;
                } else if (adjustedRecipes[index].total_calories !== undefined && fullRecipe.total_calories) {
                    scaleFactor = adjustedRecipes[index].total_calories / fullRecipe.total_calories;
                }
                console.log(`Using scale factor ${scaleFactor} for recipe ${fullRecipe.name}`);

                fullRecipe.ingredients.forEach(ingredient => {
                    const key = ingredient.name.toLowerCase();

                    if (!combinedIngredients[key]) {
                        combinedIngredients[key] = {
                            name: ingredient.name,
                            amount: 0,
                            package_amount: ingredient.package_amount || 0,
                            price: ingredient.price || 0,
                            recipes: []
                        };
                    }

                    const scaledAmount = ingredient.amount * scaleFactor;

                    combinedIngredients[key].amount += scaledAmount;
                    combinedIngredients[key].recipes.push({
                        name: fullRecipe.name,
                        amount: scaledAmount
                    });
                });
            });

            groceryList = Object.values(combinedIngredients).map(ingredient => {
                let packageCount = 0;

                if (ingredient.package_amount && ingredient.package_amount > 0) {
                    packageCount = Math.ceil(ingredient.amount / ingredient.package_amount);
                }

                return {
                    ...ingredient,
                    packageCount
                };
            });

            groceryList.sort((a, b) => a.name.localeCompare(b.name));

            renderGroceryList();

            // Directly enable the Save as Task button if it exists
            const saveAsTaskBtn = document.getElementById('save-as-task-btn');
            if (saveAsTaskBtn) {
                saveAsTaskBtn.disabled = false;
                console.log('Save as Task button enabled directly after grocery list generation');
            }

            // Make the grocery list available globally for other functions
            window.groceryList = groceryList;

            // Update the UI (enable/disable buttons)
            if (typeof window.updateUI === 'function') {
                window.updateUI();
            }

            // Dispatch a custom event for the protein optimization feature
            const groceryListGeneratedEvent = new CustomEvent('groceryListGenerated', {
                detail: {
                    groceryList: groceryList,
                    recipes: fullRecipeData,
                    adjustedRecipesData: adjustedRecipes,
                    calorieTarget: dailyCalorieTarget,
                    proteinTarget: dailyProteinTarget
                }
            });
            document.dispatchEvent(groceryListGeneratedEvent);

            showStatus('Grocery list generated successfully!', 'success');
        })
        .catch(error => {
            console.error('Error generating grocery list:', error);
            showStatus('Failed to generate grocery list. Please try again.', 'error');
        });
    }

    function renderGroceryList() {
        // Make sure the function is available globally
        window.renderGroceryList = renderGroceryList;

        if (!groceryList || groceryList.length === 0) {
            groceryListResults.innerHTML = '<p class="empty-message">No ingredients to display</p>';
            return;
        }

        const table = document.createElement('table');
        table.className = 'grocery-list-table';

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        const headers = ['Ingredient', 'Amount (g)', 'Package Size (g)', 'Packages Needed', 'Package Price', 'Total Cost', 'Used In'];

        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');

        groceryList.forEach(ingredient => {
            const row = document.createElement('tr');

            const nameCell = document.createElement('td');
            nameCell.textContent = ingredient.name;
            row.appendChild(nameCell);

            const amountCell = document.createElement('td');
            amountCell.textContent = ingredient.amount.toFixed(2);
            row.appendChild(amountCell);

            const packageSizeCell = document.createElement('td');
            packageSizeCell.textContent = ingredient.package_amount ? ingredient.package_amount.toFixed(2) : '-';
            row.appendChild(packageSizeCell);

            const packagesCell = document.createElement('td');
            if (ingredient.packageCount > 0) {
                packagesCell.innerHTML = `<span class="package-count">${ingredient.packageCount}</span>`;
            } else {
                packagesCell.textContent = '-';
            }
            row.appendChild(packagesCell);

            const priceCell = document.createElement('td');
            priceCell.textContent = ingredient.price ? `$${ingredient.price.toFixed(2)}` : '-';
            row.appendChild(priceCell);

            const totalCostCell = document.createElement('td');
            if (ingredient.packageCount > 0 && ingredient.price) {
                const totalCost = ingredient.packageCount * ingredient.price;
                totalCostCell.textContent = `$${totalCost.toFixed(2)}`;
            } else {
                totalCostCell.textContent = '-';
            }
            row.appendChild(totalCostCell);

            const usedInCell = document.createElement('td');
            usedInCell.textContent = ingredient.recipes.map(r => r.name).join(', ');
            row.appendChild(usedInCell);

            tbody.appendChild(row);
        });

        table.appendChild(tbody);

        const totalRow = document.createElement('tr');
        totalRow.style.fontWeight = 'bold';

        const totalLabelCell = document.createElement('td');
        totalLabelCell.textContent = 'TOTAL';
        totalRow.appendChild(totalLabelCell);

        totalRow.appendChild(document.createElement('td'));
        totalRow.appendChild(document.createElement('td'));

        const totalPackagesCell = document.createElement('td');
        const totalPackages = groceryList.reduce((sum, ingredient) => sum + (ingredient.packageCount || 0), 0);
        totalPackagesCell.innerHTML = `<span class="package-count">${totalPackages}</span>`;
        totalRow.appendChild(totalPackagesCell);

        totalRow.appendChild(document.createElement('td'));

        const totalCostCell = document.createElement('td');
        const totalCost = groceryList.reduce((sum, ingredient) => {
            return sum + (ingredient.packageCount || 0) * (ingredient.price || 0);
        }, 0);
        totalCostCell.textContent = `$${totalCost.toFixed(2)}`;
        totalRow.appendChild(totalCostCell);

        totalRow.appendChild(document.createElement('td'));

        tbody.appendChild(totalRow);

        // Add calorie summary row
        const calorieSummaryRow = document.createElement('tr');
        calorieSummaryRow.className = 'calorie-summary-row';

        const calorieSummaryCell = document.createElement('td');
        calorieSummaryCell.colSpan = 7; // Span all columns

        // Calculate total calories
        const totalCalories = calculateTotalCalories();

        // Calculate total protein
        const totalProtein = calculateTotalProtein();

        // Create calorie and protein summary content
        let calorieSummaryContent = '';
        if (dailyCalorieTarget > 0) {
            const caloriePercentOfTarget = ((totalCalories / dailyCalorieTarget) * 100).toFixed(1);

            // Protein percentage calculation
            let proteinPercentDisplay = '';
            if (dailyProteinTarget > 0) {
                const proteinPercentOfTarget = ((totalProtein / dailyProteinTarget) * 100).toFixed(1);
                proteinPercentDisplay = `
                    <span class="calorie-summary-separator">|</span>
                    <span class="calorie-summary-label">Total Protein:</span>
                    <span class="calorie-summary-value total-protein">${totalProtein.toFixed(2)}g</span>
                    <span class="calorie-summary-separator">|</span>
                    <span class="calorie-summary-label">Protein Target:</span>
                    <span class="calorie-summary-value protein-target">${dailyProteinTarget}g</span>
                    <span class="calorie-summary-separator">|</span>
                    <span class="calorie-summary-label">Percentage of Protein Target:</span>
                    <span class="calorie-summary-value protein-percentage ${proteinPercentOfTarget > 100 ? 'over-target' : ''}">${proteinPercentOfTarget}%</span>
                `;
            }

            calorieSummaryContent = `
                <div class="calorie-summary">
                    <span class="calorie-summary-label">Total Calories:</span>
                    <span class="calorie-summary-value total-calories">${totalCalories.toFixed(2)}</span>
                    <span class="calorie-summary-separator">|</span>
                    <span class="calorie-summary-label">Calorie Target:</span>
                    <span class="calorie-summary-value calorie-target">${dailyCalorieTarget}</span>
                    <span class="calorie-summary-separator">|</span>
                    <span class="calorie-summary-label">Percentage of Calorie Target:</span>
                    <span class="calorie-summary-value calorie-percentage ${caloriePercentOfTarget > 100 ? 'over-target' : ''}">${caloriePercentOfTarget}%</span>
                    ${proteinPercentDisplay}
                </div>
            `;
        } else {
            calorieSummaryContent = `
                <div class="calorie-summary">
                    <span class="calorie-summary-label">Total Calories:</span>
                    <span class="calorie-summary-value">${totalCalories.toFixed(2)}</span>
                    <span class="calorie-summary-note">(Set a daily calorie target to see percentage)</span>
                </div>
            `;
        }

        calorieSummaryCell.innerHTML = calorieSummaryContent;
        calorieSummaryRow.appendChild(calorieSummaryCell);
        tbody.appendChild(calorieSummaryRow);

        groceryListResults.innerHTML = '';
        groceryListResults.appendChild(table);

        // Create a placeholder for the protein optimization section
        const proteinOptimizationSection = document.createElement('div');
        proteinOptimizationSection.id = 'protein-optimization-section';
        proteinOptimizationSection.className = 'protein-optimization-section';
        proteinOptimizationSection.style.display = 'none'; // Hide initially
        groceryListResults.appendChild(proteinOptimizationSection);

        // Add micronutrient percentage display if we have full recipe data
        if (fullRecipeData && fullRecipeData.length > 0 && typeof MicronutrientPercentage !== 'undefined') {
            try {
                // Ensure micronutrient targets are updated with the current daily targets
                if (typeof updateMicronutrientTargets === 'function' && dailyCalorieTarget > 0) {
                    updateMicronutrientTargets(dailyCalorieTarget, dailyProteinTarget);
                    console.log(`Updated micronutrient targets with calorie target: ${dailyCalorieTarget} and protein target: ${dailyProteinTarget}g before calculating percentages`);
                } else if (typeof updateMicronutrientCalorieTarget === 'function' && dailyCalorieTarget > 0) {
                    // Fall back to the old function if the new one isn't available
                    updateMicronutrientCalorieTarget(dailyCalorieTarget);
                    console.log(`Updated micronutrient targets with calorie target only: ${dailyCalorieTarget} before calculating percentages`);
                }

                // Calculate micronutrient totals and percentages
                const micronutrientTotals = MicronutrientPercentage.calculateTotals(fullRecipeData, adjustedRecipes);
                const micronutrientPercentages = MicronutrientPercentage.calculatePercentages(micronutrientTotals);

                // Create and append the micronutrient percentage display
                const micronutrientHTML = MicronutrientPercentage.createHTML(micronutrientTotals, micronutrientPercentages);
                const micronutrientContainer = document.createElement('div');
                micronutrientContainer.innerHTML = micronutrientHTML;

                groceryListResults.appendChild(micronutrientContainer.firstElementChild);
            } catch (error) {
                console.error('Error displaying micronutrient percentages:', error);
                // Add a message about the error
                const errorMessage = document.createElement('div');
                errorMessage.className = 'micronutrient-error';
                errorMessage.innerHTML = `
                    <p>Unable to display micronutrient data. Please refresh the page and try again.</p>
                    <p>Error: ${error.message}</p>
                `;
                groceryListResults.appendChild(errorMessage);
            }
        }
    }



    function showStatus(message, type) {
        if (statusMessage) {
            statusMessage.textContent = message;
            statusMessage.className = `status ${type}`;
            statusMessage.style.display = 'block';

            // Auto-hide after 3 seconds for success messages
            if (type === 'success') {
                setTimeout(() => {
                    statusMessage.style.display = 'none';
                }, 3000);
            }
        } else {
            // Fallback if statusMessage element doesn't exist
            console.log(`Status (${type}): ${message}`);

            // Create a temporary status message
            const tempStatus = document.createElement('div');
            tempStatus.className = `temp-status ${type}`;
            tempStatus.textContent = message;
            tempStatus.style.position = 'fixed';
            tempStatus.style.bottom = '20px';
            tempStatus.style.right = '20px';
            tempStatus.style.padding = '10px 15px';
            tempStatus.style.borderRadius = '4px';
            tempStatus.style.zIndex = '9999';
            tempStatus.style.color = 'white';

            if (type === 'error') {
                tempStatus.style.backgroundColor = 'rgba(220, 53, 69, 0.9)';
            } else if (type === 'success') {
                tempStatus.style.backgroundColor = 'rgba(40, 167, 69, 0.9)';
            } else {
                tempStatus.style.backgroundColor = 'rgba(0, 123, 255, 0.9)';
            }

            document.body.appendChild(tempStatus);

            // Auto-hide after 3 seconds
            setTimeout(() => {
                document.body.removeChild(tempStatus);
            }, 3000);
        }
    }

    function clearStatus() {
        statusMessage.textContent = '';
        statusMessage.className = 'status';
        statusMessage.style.display = 'none';
    }

    function updateGenerateButton() {
        generateListBtn.disabled = selectedRecipeIds.length === 0;
    }

    function updateUI() {
        updateGenerateButton();
        saveAsTaskBtn.disabled = !groceryList;
    }

    function saveGroceryListAsTask() {
        if (!groceryList || groceryList.length === 0) {
            showStatus('No grocery list to save as task.', 'error');
            return;
        }

        // Create a main task for the grocery list
        const totalCalories = calculateTotalCalories();
        const totalProtein = calculateTotalProtein();
        const caloriePercentage = dailyCalorieTarget > 0 ? ((totalCalories / dailyCalorieTarget) * 100).toFixed(1) + '%' : 'N/A';
        const proteinPercentage = dailyProteinTarget > 0 ? ((totalProtein / dailyProteinTarget) * 100).toFixed(1) + '%' : 'N/A';

        const taskTitle = `Grocery List (${totalCalories.toFixed(0)} cal, ${caloriePercentage} of target)`;
        const taskDescription = `Grocery list for selected recipes. Total calories: ${totalCalories.toFixed(1)} (${caloriePercentage} of daily target). Total protein: ${totalProtein.toFixed(1)}g (${proteinPercentage} of daily target).`;

        // Create subtasks for each ingredient
        const subtasks = groceryList.map(ingredient => {
            const packageInfo = ingredient.packageCount > 0 ?
                `${ingredient.packageCount} package(s) needed` : '';
            const priceInfo = ingredient.price ?
                `$${ingredient.price.toFixed(2)} per package` : '';
            const totalCost = (ingredient.packageCount > 0 && ingredient.price) ?
                `$${(ingredient.packageCount * ingredient.price).toFixed(2)} total` : '';

            return {
                title: ingredient.name,
                description: `Amount: ${ingredient.amount.toFixed(1)}g. ${packageInfo} ${priceInfo} ${totalCost}`.trim(),
                completed: false
            };
        });

        // Create the task with subtasks
        const taskData = {
            title: taskTitle,
            description: taskDescription,
            due_date: new Date().toISOString().split('T')[0], // Today's date
            completed: false,
            subtasks: subtasks
        };

        // Send the task to the server
        fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            showStatus('Grocery list saved as task successfully!', 'success');
            console.log('Task created:', data);
        })
        .catch(error => {
            console.error('Error saving grocery list as task:', error);
            showStatus('Failed to save grocery list as task. Please try again.', 'error');
        });
    }

    function addEventListeners() {
        // Main buttons
        generateListBtn.addEventListener('click', generateGroceryList);
        saveAsTaskBtn.addEventListener('click', saveGroceryListAsTask);

        // Listen for changes to the daily calorie target
        if (currentCalorieTarget) {
            // Create a MutationObserver to watch for changes to the calorie target
            const targetObserver = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'characterData' || mutation.type === 'childList') {
                        // Reload the daily calorie target
                        loadDailyCalorieTarget();

                        // Update the calorie summary if the grocery list is already generated
                        if (groceryList && groceryList.length > 0) {
                            const calorieSummaryRow = document.querySelector('.calorie-summary-row');
                            if (calorieSummaryRow) {
                                const totalCalories = calculateTotalCalories();
                                const calorieSummaryCell = calorieSummaryRow.querySelector('td');

                                if (calorieSummaryCell) {
                                    let calorieSummaryContent = '';
                                    if (dailyCalorieTarget > 0) {
                                        const percentOfTarget = ((totalCalories / dailyCalorieTarget) * 100).toFixed(1);
                                        calorieSummaryContent = `
                                            <div class="calorie-summary">
                                                <span class="calorie-summary-label">Total Calories:</span>
                                                <span class="calorie-summary-value">${totalCalories.toFixed(1)}</span>
                                                <span class="calorie-summary-separator">|</span>
                                                <span class="calorie-summary-label">Daily Target:</span>
                                                <span class="calorie-summary-value">${dailyCalorieTarget}</span>
                                                <span class="calorie-summary-separator">|</span>
                                                <span class="calorie-summary-label">Percentage of Daily Target:</span>
                                                <span class="calorie-summary-value ${percentOfTarget > 100 ? 'over-target' : ''}">${percentOfTarget}%</span>
                                            </div>
                                        `;
                                    } else {
                                        calorieSummaryContent = `
                                            <div class="calorie-summary">
                                                <span class="calorie-summary-label">Total Calories:</span>
                                                <span class="calorie-summary-value">${totalCalories.toFixed(1)}</span>
                                                <span class="calorie-summary-note">(Set a daily calorie target to see percentage)</span>
                                            </div>
                                        `;
                                    }
                                    calorieSummaryCell.innerHTML = calorieSummaryContent;
                                }
                            }
                        }
                    }
                });
            });

            // Configure the observer to watch for changes to the text content
            targetObserver.observe(currentCalorieTarget, {
                characterData: true,
                childList: true,
                subtree: true
            });
        }
    }

    // Make the generateGroceryList function available globally for the protein optimization feature
    window.generateGroceryList = generateGroceryList;
});
