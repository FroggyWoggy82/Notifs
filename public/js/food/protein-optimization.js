/**
 * Protein Optimization Feature
 *
 * This script adds functionality to optimize protein content in the grocery list
 * by identifying high protein-to-calorie ratio ingredients and suggesting quantity
 * increases to meet the daily protein target.
 */

(function() {
    // DOM Elements
    let proteinOptimizationSection;
    let applyChangesBtn;

    // State
    let ingredientOptimizations = [];
    let currentGroceryList = null;
    let fullRecipeData = null;
    let adjustedRecipes = null;
    let dailyCalorieTarget = 0;
    let dailyProteinTarget = 0;
    let currentTotalCalories = 0;
    let currentTotalProtein = 0;

    // Constants
    const PROTEIN_CALORIES_PER_GRAM = 4; // 4 calories per gram of protein
    const MAX_CALORIE_INCREASE_PERCENTAGE = 10; // Maximum 10% increase in total calories
    const MIN_PROTEIN_RATIO_THRESHOLD = 0.1; // Minimum 0.1g protein per calorie (10g per 100 calories)

    /**
     * Initialize the protein optimization feature
     */
    function init() {
        // Add event listeners
        document.addEventListener('groceryListGenerated', handleGroceryListGenerated);
    }

    /**
     * Handle the grocery list generated event
     * @param {CustomEvent} event - The event object containing grocery list data
     */
    function handleGroceryListGenerated(event) {
        console.log('Grocery list generated event received');

        // Get the data from the event
        const { groceryList, recipes, adjustedRecipesData, calorieTarget, proteinTarget } = event.detail;

        // Store the data
        currentGroceryList = groceryList;
        fullRecipeData = recipes;
        adjustedRecipes = adjustedRecipesData;
        dailyCalorieTarget = calorieTarget || 0;
        dailyProteinTarget = proteinTarget || 0;

        console.log(`Current protein: ${currentTotalProtein}g, Target: ${dailyProteinTarget}g`);

        // Calculate current totals
        currentTotalCalories = calculateTotalCalories();
        currentTotalProtein = calculateTotalProtein();

        console.log(`Recalculated protein: ${currentTotalProtein}g, Target: ${dailyProteinTarget}g`);

        // Check if protein optimization is needed and if we have valid targets
        if (dailyProteinTarget > 0 && currentTotalProtein < dailyProteinTarget) {
            console.log('Protein optimization needed - calculating optimizations');

            // Calculate protein optimizations
            calculateProteinOptimizations();

            // Render the protein optimization section
            renderProteinOptimizationSection();

            // Make sure the section is visible
            if (proteinOptimizationSection) {
                proteinOptimizationSection.style.display = 'block';
                console.log('Protein optimization section displayed');
            } else {
                console.error('Protein optimization section element not found');
            }
        } else {
            // Hide the protein optimization section if protein target is already met
            if (proteinOptimizationSection) {
                proteinOptimizationSection.style.display = 'none';

                if (dailyProteinTarget <= 0) {
                    console.log('No protein target set - hiding protein optimization section');
                } else if (currentTotalProtein >= dailyProteinTarget) {
                    console.log('Protein target already met - hiding protein optimization section');
                }
            } else {
                console.error('Protein optimization section element not found');
            }
        }
    }

    /**
     * Calculate the total calories from all adjusted recipes
     * @returns {number} - Total calories
     */
    function calculateTotalCalories() {
        return adjustedRecipes.reduce((total, recipe) => total + recipe.adjustedCalories, 0);
    }

    /**
     * Calculate the total protein from all adjusted recipes
     * @returns {number} - Total protein in grams
     */
    function calculateTotalProtein() {
        return adjustedRecipes.reduce((total, recipe) => {
            // If we have protein data directly, use it
            if (recipe.total_protein) {
                return total + (recipe.total_protein * recipe.scaleFactor);
            }

            // Otherwise estimate protein as 15% of calories (4 calories per gram of protein)
            const estimatedProtein = (recipe.adjustedCalories * 0.15) / 4;
            return total + estimatedProtein;
        }, 0);
    }

    /**
     * Calculate protein optimizations for the grocery list
     */
    function calculateProteinOptimizations() {
        console.log('Calculating protein optimizations');

        // Reset optimizations
        ingredientOptimizations = [];

        // Calculate the protein deficit
        const proteinDeficit = dailyProteinTarget - currentTotalProtein;
        console.log(`Protein deficit: ${proteinDeficit.toFixed(1)}g`);

        // Calculate the maximum allowed calorie increase
        const maxCalorieIncrease = dailyCalorieTarget * (MAX_CALORIE_INCREASE_PERCENTAGE / 100);
        console.log(`Maximum allowed calorie increase: ${maxCalorieIncrease.toFixed(1)} calories (${MAX_CALORIE_INCREASE_PERCENTAGE}% of ${dailyCalorieTarget})`);

        // Get all ingredients with their protein-to-calorie ratios
        const ingredientsWithRatios = [];

        // Process each recipe to get ingredient data
        if (!fullRecipeData || !Array.isArray(fullRecipeData) || fullRecipeData.length === 0) {
            console.error('No recipe data available for protein optimization');
            return;
        }

        fullRecipeData.forEach((recipe, recipeIndex) => {
            if (!recipe || !recipe.ingredients || !Array.isArray(recipe.ingredients)) {
                console.warn(`Recipe at index ${recipeIndex} has no ingredients or is invalid`);
                return;
            }

            // Get the scale factor for this recipe
            const scaleFactor = adjustedRecipes && adjustedRecipes[recipeIndex] && adjustedRecipes[recipeIndex].scaleFactor
                ? adjustedRecipes[recipeIndex].scaleFactor
                : 1;

            console.log(`Processing recipe: ${recipe.name} with scale factor ${scaleFactor}`);

            recipe.ingredients.forEach(ingredient => {
                if (!ingredient || typeof ingredient !== 'object') {
                    console.warn(`Invalid ingredient in recipe ${recipe.name}`);
                    return;
                }

                // Calculate protein-to-calorie ratio
                const calories = ingredient.calories * scaleFactor;
                const protein = ingredient.protein * scaleFactor;

                // Skip ingredients with no protein or calories
                if (protein <= 0 || calories <= 0) {
                    console.log(`Skipping ingredient ${ingredient.name} - no protein (${protein}g) or calories (${calories})`);
                    return;
                }

                const proteinCalorieRatio = protein / calories;
                console.log(`Ingredient ${ingredient.name}: ${protein.toFixed(1)}g protein, ${calories.toFixed(1)} calories, ratio: ${proteinCalorieRatio.toFixed(3)}`);

                // Add all ingredients with protein, regardless of ratio
                // We'll sort by ratio later and use the best ones
                ingredientsWithRatios.push({
                    name: ingredient.name,
                    amount: ingredient.amount * scaleFactor,
                    calories: calories,
                    protein: protein,
                    ratio: proteinCalorieRatio,
                    originalAmount: ingredient.amount,
                    scaleFactor: scaleFactor,
                    recipe: recipe.name
                });
                console.log(`Added ${ingredient.name} to optimization candidates (ratio: ${proteinCalorieRatio.toFixed(3)})`);

                // Log if it's below the threshold but we're still considering it
                if (proteinCalorieRatio < MIN_PROTEIN_RATIO_THRESHOLD) {
                    console.log(`Note: ${ingredient.name} has ratio ${proteinCalorieRatio.toFixed(3)} below ideal threshold ${MIN_PROTEIN_RATIO_THRESHOLD} but will still be considered`);
                }
            });
        });

        console.log(`Found ${ingredientsWithRatios.length} ingredients with good protein-to-calorie ratios`);

        // Sort ingredients by protein-to-calorie ratio (highest first)
        ingredientsWithRatios.sort((a, b) => b.ratio - a.ratio);

        // Log the top 5 ingredients by ratio
        console.log('Top ingredients by protein-to-calorie ratio:');
        ingredientsWithRatios.slice(0, 5).forEach((ingredient, index) => {
            console.log(`${index + 1}. ${ingredient.name}: ${ingredient.ratio.toFixed(3)} (${ingredient.protein.toFixed(1)}g protein / ${ingredient.calories.toFixed(1)} calories)`);
        });

        // Calculate how much to increase each ingredient
        let remainingProteinNeeded = proteinDeficit;
        let totalCalorieIncrease = 0;

        ingredientsWithRatios.forEach(ingredient => {
            // Skip if we've already met the protein target or exceeded calorie limit
            if (remainingProteinNeeded <= 0 || totalCalorieIncrease >= maxCalorieIncrease) {
                console.log(`Skipping ${ingredient.name} - protein target met or calorie limit reached`);
                return;
            }

            // Calculate how much protein we can get from this ingredient
            const proteinPerGram = ingredient.protein / ingredient.amount;
            const caloriesPerGram = ingredient.calories / ingredient.amount;

            // Calculate how much to increase this ingredient
            // Limited by either the remaining protein needed or the maximum calorie increase
            const maxIncreaseByProtein = remainingProteinNeeded / proteinPerGram;
            const maxIncreaseByCalories = (maxCalorieIncrease - totalCalorieIncrease) / caloriesPerGram;

            // Use the smaller of the two limits
            const amountIncrease = Math.min(maxIncreaseByProtein, maxIncreaseByCalories);
            console.log(`${ingredient.name}: Can increase by ${amountIncrease.toFixed(1)}g (limited by ${maxIncreaseByProtein < maxIncreaseByCalories ? 'protein needed' : 'calorie limit'})`);

            // Calculate the resulting protein and calorie increases
            const proteinIncrease = amountIncrease * proteinPerGram;
            const calorieIncrease = amountIncrease * caloriesPerGram;

            // Update the remaining values
            remainingProteinNeeded -= proteinIncrease;
            totalCalorieIncrease += calorieIncrease;

            // Add to optimizations if the increase provides any meaningful protein
            // Lower the threshold to 0.1g to include more ingredients
            if (amountIncrease >= 0.1 && proteinIncrease >= 0.1) {
                ingredientOptimizations.push({
                    name: ingredient.name,
                    currentAmount: ingredient.amount,
                    suggestedIncrease: amountIncrease,
                    newAmount: ingredient.amount + amountIncrease,
                    proteinIncrease: proteinIncrease,
                    calorieIncrease: calorieIncrease,
                    recipe: ingredient.recipe
                });
                console.log(`Added optimization for ${ingredient.name}: +${amountIncrease.toFixed(1)}g, +${proteinIncrease.toFixed(1)}g protein, +${calorieIncrease.toFixed(1)} calories`);
            } else {
                console.log(`Skipping ${ingredient.name} - increase too small (${amountIncrease.toFixed(1)}g, protein: ${proteinIncrease.toFixed(1)}g)`);
            }
        });

        console.log(`Generated ${ingredientOptimizations.length} optimizations`);
        console.log(`Remaining protein needed: ${remainingProteinNeeded.toFixed(1)}g`);
        console.log(`Total calorie increase: ${totalCalorieIncrease.toFixed(1)} calories`);
    }

    /**
     * Render the protein optimization section
     */
    function renderProteinOptimizationSection() {
        console.log('Rendering protein optimization section');

        // Get the existing protein optimization section
        proteinOptimizationSection = document.getElementById('protein-optimization-section');

        if (!proteinOptimizationSection) {
            console.error('Protein optimization section not found in the DOM');
            return;
        }

        // If no optimizations are available, show a message instead of hiding
        if (ingredientOptimizations.length === 0) {
            console.log('No ingredient optimizations available - showing message');

            // Create a simple message explaining why no optimizations are available
            let html = `
                <h3>Protein Optimization</h3>
                <div class="protein-optimization-info">
                    <p>Your current meal plan provides ${currentTotalProtein.toFixed(1)}g of protein (${((currentTotalProtein / dailyProteinTarget) * 100).toFixed(1)}% of your ${dailyProteinTarget}g daily target).</p>
                    <p>We couldn't find any ingredients that could be optimized to increase protein. This could be because:</p>
                    <ul>
                        <li>The selected recipes don't have ingredients with good protein content</li>
                        <li>The calorie limit would be exceeded by increasing any ingredients</li>
                        <li>The protein increase would be too small to be significant</li>
                    </ul>
                    <p>Try selecting different recipes with higher protein ingredients, or manually adjust ingredient amounts.</p>
                </div>
            `;

            // Set the HTML content
            proteinOptimizationSection.innerHTML = html;
            proteinOptimizationSection.style.display = 'block';
            proteinOptimizationSection.style.visibility = 'visible';
            proteinOptimizationSection.style.opacity = '1';

            return;
        }

        // Calculate totals
        const totalProteinIncrease = ingredientOptimizations.reduce((total, opt) => total + opt.proteinIncrease, 0);
        const totalCalorieIncrease = ingredientOptimizations.reduce((total, opt) => total + opt.calorieIncrease, 0);
        const newTotalProtein = currentTotalProtein + totalProteinIncrease;
        const newTotalCalories = currentTotalCalories + totalCalorieIncrease;

        console.log(`Protein increase: ${totalProteinIncrease.toFixed(1)}g, New total: ${newTotalProtein.toFixed(1)}g`);
        console.log(`Calorie increase: ${totalCalorieIncrease.toFixed(1)}, New total: ${newTotalCalories.toFixed(1)}`);

        // Create the HTML content
        let html = `
            <h3>Protein Optimization</h3>
            <div class="protein-optimization-info">
                <p>Your current meal plan provides ${currentTotalProtein.toFixed(1)}g of protein (${((currentTotalProtein / dailyProteinTarget) * 100).toFixed(1)}% of your ${dailyProteinTarget}g daily target).</p>
                <p>We've identified high-protein ingredients that can be increased to help you meet your protein goal.</p>
            </div>
        `;

        // Add the table of suggested changes
        html += `
            <table class="protein-optimization-table">
                <thead>
                    <tr>
                        <th>Ingredient</th>
                        <th>Current Amount (g)</th>
                        <th>Suggested Increase (g)</th>
                        <th>New Amount (g)</th>
                        <th>Added Protein (g)</th>
                        <th>Added Calories</th>
                        <th>Recipe</th>
                    </tr>
                </thead>
                <tbody>
        `;

        // Add rows for each optimization
        ingredientOptimizations.forEach(opt => {
            html += `
                <tr>
                    <td>${opt.name}</td>
                    <td>${opt.currentAmount.toFixed(1)}</td>
                    <td>${opt.suggestedIncrease.toFixed(1)}</td>
                    <td>${opt.newAmount.toFixed(1)}</td>
                    <td>${opt.proteinIncrease.toFixed(1)}</td>
                    <td>${opt.calorieIncrease.toFixed(1)}</td>
                    <td>${opt.recipe}</td>
                </tr>
            `;
        });

        // Add summary row
        html += `
                <tr class="summary-row">
                    <td><strong>Total</strong></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td><strong>${totalProteinIncrease.toFixed(1)}g</strong></td>
                    <td><strong>${totalCalorieIncrease.toFixed(1)}</strong></td>
                    <td></td>
                </tr>
            </tbody>
        </table>
        `;

        // Add summary and button
        html += `
            <div class="protein-optimization-summary">
                <p>With these changes, your total protein would be <strong>${newTotalProtein.toFixed(1)}g</strong> (${((newTotalProtein / dailyProteinTarget) * 100).toFixed(1)}% of your target) and total calories would be <strong>${newTotalCalories.toFixed(1)}</strong> (${((newTotalCalories / dailyCalorieTarget) * 100).toFixed(1)}% of your ${dailyCalorieTarget} calorie target).</p>
                <button id="apply-protein-optimization" class="apply-optimization-btn">Apply Protein Optimization</button>
            </div>
        `;

        // Set the HTML content
        proteinOptimizationSection.innerHTML = html;
        proteinOptimizationSection.style.display = 'block';

        // Make sure the section is visible by adding a specific style
        proteinOptimizationSection.style.visibility = 'visible';
        proteinOptimizationSection.style.opacity = '1';

        // Add event listener to the apply button after a short delay to ensure the DOM is updated
        setTimeout(() => {
            applyChangesBtn = document.getElementById('apply-protein-optimization');
            if (applyChangesBtn) {
                applyChangesBtn.addEventListener('click', applyProteinOptimization);
                console.log('Added event listener to apply button');
            } else {
                console.error('Apply button not found after rendering');
            }
        }, 100);

        // Log that the section was rendered
        console.log('Protein optimization section rendered with', ingredientOptimizations.length, 'optimizations');
    }

    /**
     * Apply the protein optimization changes
     */
    function applyProteinOptimization() {
        console.log('Applying protein optimization...');

        // Disable the button to prevent multiple clicks
        if (applyChangesBtn) {
            applyChangesBtn.disabled = true;
            applyChangesBtn.textContent = 'Applying Changes...';
        }

        // Check if we have optimizations to apply
        if (ingredientOptimizations.length === 0) {
            showStatus('No protein optimizations to apply.', 'error');
            resetApplyButton();
            return;
        }

        try {
            // Create a map of recipe names to their adjusted recipes
            const recipeMap = new Map();
            adjustedRecipes.forEach(recipe => {
                recipeMap.set(recipe.name, recipe);
            });

            // Create a map of ingredient names to their original amounts
            const ingredientMap = new Map();
            fullRecipeData.forEach(recipe => {
                recipe.ingredients.forEach(ingredient => {
                    const key = `${recipe.name}:${ingredient.name}`;
                    ingredientMap.set(key, ingredient);
                });
            });

            // Apply the optimizations
            ingredientOptimizations.forEach(optimization => {
                // Find the recipe this ingredient belongs to
                const recipe = recipeMap.get(optimization.recipe);
                if (!recipe) {
                    console.warn(`Recipe ${optimization.recipe} not found for optimization`);
                    return;
                }

                // Find the ingredient in the recipe
                const ingredientKey = `${optimization.recipe}:${optimization.name}`;
                const ingredient = ingredientMap.get(ingredientKey);
                if (!ingredient) {
                    console.warn(`Ingredient ${optimization.name} not found in recipe ${optimization.recipe}`);
                    return;
                }

                // Calculate the new amount for the ingredient
                const originalAmount = ingredient.amount;
                const newAmount = originalAmount + (optimization.suggestedIncrease / recipe.scaleFactor);

                // Update the ingredient amount in the original data
                ingredient.amount = newAmount;

                // Also update the amount in the grocery list if it exists
                if (window.groceryList && Array.isArray(window.groceryList)) {
                    const groceryItem = window.groceryList.find(item =>
                        item.name.toLowerCase() === optimization.name.toLowerCase());

                    if (groceryItem) {
                        // Calculate the difference to add to the grocery list item
                        const amountDifference = optimization.suggestedIncrease;
                        groceryItem.amount += amountDifference;

                        // Recalculate package count if needed
                        if (groceryItem.package_amount && groceryItem.package_amount > 0) {
                            groceryItem.packageCount = Math.ceil(groceryItem.amount / groceryItem.package_amount);
                        }

                        console.log(`Updated grocery list item ${groceryItem.name} from ${groceryItem.amount - amountDifference}g to ${groceryItem.amount}g`);
                    }
                }

                console.log(`Updated ${optimization.name} in ${optimization.recipe} from ${originalAmount}g to ${newAmount}g`);
            });

            // Recalculate the grocery list with the updated ingredient amounts
            if (typeof window.generateGroceryList === 'function') {
                // Before regenerating the grocery list, update the fullRecipeData with the new ingredient amounts
                // This ensures that the micronutrient calculations will use the updated values
                console.log('Updating fullRecipeData with optimized ingredient amounts');

                // Update the fullRecipeData with the new ingredient amounts
                ingredientOptimizations.forEach(optimization => {
                    // Find the recipe in fullRecipeData
                    const recipeIndex = fullRecipeData.findIndex(recipe => recipe.name === optimization.recipe);
                    if (recipeIndex !== -1) {
                        // Find the ingredient in the recipe
                        const ingredientIndex = fullRecipeData[recipeIndex].ingredients.findIndex(
                            ingredient => ingredient.name === optimization.name
                        );

                        if (ingredientIndex !== -1) {
                            // Update the ingredient amount
                            const originalAmount = fullRecipeData[recipeIndex].ingredients[ingredientIndex].amount;
                            const newAmount = originalAmount + (optimization.suggestedIncrease / adjustedRecipes[recipeIndex].scaleFactor);

                            fullRecipeData[recipeIndex].ingredients[ingredientIndex].amount = newAmount;
                            console.log(`Updated fullRecipeData: ${optimization.name} in ${optimization.recipe} from ${originalAmount}g to ${newAmount}g`);
                        }
                    }
                });

                // Now regenerate the grocery list
                window.generateGroceryList();

                // Try to directly call renderGroceryList if it exists
                if (typeof window.renderGroceryList === 'function') {
                    setTimeout(() => {
                        console.log('Directly calling renderGroceryList to update the UI');
                        window.renderGroceryList();

                        // Force recalculation of micronutrient data
                        if (typeof MicronutrientPercentage !== 'undefined') {
                            try {
                                console.log('Recalculating micronutrient data after protein optimization');

                                // Find the micronutrient container and remove it
                                const micronutrientContainer = document.querySelector('.micronutrient-percentage-container');
                                if (micronutrientContainer) {
                                    micronutrientContainer.remove();
                                    console.log('Removed existing micronutrient container');
                                }

                                // Calculate new micronutrient totals and percentages
                                const micronutrientTotals = MicronutrientPercentage.calculateTotals(fullRecipeData, adjustedRecipes);
                                const micronutrientPercentages = MicronutrientPercentage.calculatePercentages(micronutrientTotals);

                                // Create and append the updated micronutrient percentage display
                                const micronutrientHTML = MicronutrientPercentage.createHTML(micronutrientTotals, micronutrientPercentages);
                                const newMicronutrientContainer = document.createElement('div');
                                newMicronutrientContainer.innerHTML = micronutrientHTML;

                                // Add it to the grocery list results
                                const groceryListResults = document.getElementById('grocery-list-results');
                                if (groceryListResults) {
                                    groceryListResults.appendChild(newMicronutrientContainer.firstElementChild);
                                    console.log('Added updated micronutrient container');
                                }
                            } catch (error) {
                                console.error('Error recalculating micronutrient data:', error);
                            }
                        }
                    }, 500); // Small delay to ensure grocery list data is ready
                }

                // Show success message
                showStatus('Protein optimization applied successfully!', 'success');
            } else {
                // If the generateGroceryList function is not available, try to find it in the global scope
                console.log('Trying to find generateGroceryList function in global scope...');

                // Look for the function in the window object
                for (const key in window) {
                    if (typeof window[key] === 'function' && key.toLowerCase().includes('grocery') && key.toLowerCase().includes('generate')) {
                        console.log(`Found potential function: ${key}`);
                        try {
                            // Update fullRecipeData first
                            ingredientOptimizations.forEach(optimization => {
                                // Find the recipe in fullRecipeData
                                const recipeIndex = fullRecipeData.findIndex(recipe => recipe.name === optimization.recipe);
                                if (recipeIndex !== -1) {
                                    // Find the ingredient in the recipe
                                    const ingredientIndex = fullRecipeData[recipeIndex].ingredients.findIndex(
                                        ingredient => ingredient.name === optimization.name
                                    );

                                    if (ingredientIndex !== -1) {
                                        // Update the ingredient amount
                                        const originalAmount = fullRecipeData[recipeIndex].ingredients[ingredientIndex].amount;
                                        const newAmount = originalAmount + (optimization.suggestedIncrease / adjustedRecipes[recipeIndex].scaleFactor);

                                        fullRecipeData[recipeIndex].ingredients[ingredientIndex].amount = newAmount;
                                    }
                                }
                            });

                            // Call the generate function
                            window[key]();

                            // Try to find and call renderGroceryList
                            for (const renderKey in window) {
                                if (typeof window[renderKey] === 'function' && renderKey.toLowerCase().includes('grocery') && renderKey.toLowerCase().includes('render')) {
                                    console.log(`Found potential render function: ${renderKey}`);
                                    setTimeout(() => {
                                        try {
                                            window[renderKey]();

                                            // Force recalculation of micronutrient data
                                            if (typeof MicronutrientPercentage !== 'undefined') {
                                                try {
                                                    // Find the micronutrient container and remove it
                                                    const micronutrientContainer = document.querySelector('.micronutrient-percentage-container');
                                                    if (micronutrientContainer) {
                                                        micronutrientContainer.remove();
                                                    }

                                                    // Calculate new micronutrient totals and percentages
                                                    const micronutrientTotals = MicronutrientPercentage.calculateTotals(fullRecipeData, adjustedRecipes);
                                                    const micronutrientPercentages = MicronutrientPercentage.calculatePercentages(micronutrientTotals);

                                                    // Create and append the updated micronutrient percentage display
                                                    const micronutrientHTML = MicronutrientPercentage.createHTML(micronutrientTotals, micronutrientPercentages);
                                                    const newMicronutrientContainer = document.createElement('div');
                                                    newMicronutrientContainer.innerHTML = micronutrientHTML;

                                                    // Add it to the grocery list results
                                                    const groceryListResults = document.getElementById('grocery-list-results');
                                                    if (groceryListResults) {
                                                        groceryListResults.appendChild(newMicronutrientContainer.firstElementChild);
                                                    }
                                                } catch (error) {
                                                    console.error('Error recalculating micronutrient data:', error);
                                                }
                                            }
                                        } catch (renderError) {
                                            console.error(`Error calling ${renderKey}:`, renderError);
                                        }
                                    }, 500);
                                    break;
                                }
                            }

                            showStatus('Protein optimization applied successfully!', 'success');
                            return;
                        } catch (e) {
                            console.error(`Error calling ${key}:`, e);
                        }
                    }
                }

                // If we still can't find it, show an error
                console.error('generateGroceryList function not found');
                showStatus('Failed to apply protein optimization. Please try again.', 'error');
                resetApplyButton();
            }
        } catch (error) {
            console.error('Error applying protein optimization:', error);
            showStatus(`Failed to apply protein optimization: ${error.message}`, 'error');
            resetApplyButton();
        }
    }

    /**
     * Reset the apply button to its original state
     */
    function resetApplyButton() {
        if (applyChangesBtn) {
            applyChangesBtn.disabled = false;
            applyChangesBtn.textContent = 'Apply Protein Optimization';
        }
    }

    /**
     * Show a status message
     * @param {string} message - The message to show
     * @param {string} type - The type of message (success, error, info)
     */
    function showStatus(message, type) {
        // Try to use the existing status message element
        const statusMessage = document.getElementById('grocery-status-message');
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
            // Fallback to console
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

    // Initialize when the DOM is loaded
    document.addEventListener('DOMContentLoaded', init);

    // Export functions to global scope for testing
    window.ProteinOptimization = {
        calculateProteinOptimizations,
        applyProteinOptimization
    };
})();
