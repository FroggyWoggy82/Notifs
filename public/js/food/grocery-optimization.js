/**
 * Grocery List Optimization Feature
 *
 * This script adds functionality to optimize the grocery list to meet fat and protein goals
 * while filling remaining calories with carbs, using the best ratios of available ingredients.
 */

(function() {
    // DOM Elements
    let groceryOptimizationSection;
    let applyChangesBtn;

    // State
    let ingredientOptimizations = [];
    let currentGroceryList = null;
    let fullRecipeData = null;
    let adjustedRecipes = null;
    let dailyCalorieTarget = 0;
    let dailyProteinTarget = 0;
    let dailyFatTarget = 0;
    let currentTotalCalories = 0;
    let currentTotalProtein = 0;
    let currentTotalFat = 0;
    let currentTotalCarbs = 0;
    let optimizationApplied = false; // Flag to track if optimization has been applied

    // Constants
    const PROTEIN_CALORIES_PER_GRAM = 4; // 4 calories per gram of protein
    const FAT_CALORIES_PER_GRAM = 9; // 9 calories per gram of fat
    const CARB_CALORIES_PER_GRAM = 4; // 4 calories per gram of carbs
    const MAX_CALORIE_INCREASE_PERCENTAGE = 10; // Maximum 10% increase in total calories
    const MIN_MACRO_RATIO_THRESHOLD = 0.05; // Minimum ratio threshold for macronutrients

    /**
     * Initialize the grocery list optimization feature
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

        // Reset optimization applied flag when new grocery list is generated
        optimizationApplied = false;

        // Get the data from the event
        const { groceryList, recipes, adjustedRecipesData, calorieTarget, proteinTarget, fatTarget } = event.detail;

        // Store the data
        currentGroceryList = groceryList;
        fullRecipeData = recipes;
        adjustedRecipes = adjustedRecipesData;
        dailyCalorieTarget = calorieTarget || 0;
        dailyProteinTarget = proteinTarget || 0;
        dailyFatTarget = fatTarget || 0;

        console.log(`Current targets - Protein: ${dailyProteinTarget}g, Fat: ${dailyFatTarget}g, Calories: ${dailyCalorieTarget}`);

        // Calculate current totals
        currentTotalCalories = calculateTotalCalories();
        currentTotalProtein = calculateTotalProtein();
        currentTotalFat = calculateTotalFat();
        currentTotalCarbs = calculateTotalCarbs();

        console.log(`Current totals - Protein: ${currentTotalProtein.toFixed(1)}g, Fat: ${currentTotalFat.toFixed(1)}g, Carbs: ${currentTotalCarbs.toFixed(1)}g, Calories: ${currentTotalCalories.toFixed(1)}`);

        // Check if optimization is needed - focus on fats and carbs
        const proteinDeficit = Math.max(0, dailyProteinTarget - currentTotalProtein);
        const fatDeficit = Math.max(0, dailyFatTarget - currentTotalFat);
        const remainingCalories = Math.max(0, dailyCalorieTarget - currentTotalCalories);

        // Calculate current fat surplus (if any) to ensure we don't exceed fat target
        const fatSurplus = Math.max(0, currentTotalFat - dailyFatTarget);

        if ((remainingCalories > 50 || fatDeficit > 0 || proteinDeficit > 0) && (dailyCalorieTarget > 0) && !optimizationApplied) {
            console.log('Grocery list optimization needed - Priority: Calories > Fats > Proteins');
            console.log(`Remaining calories: ${remainingCalories.toFixed(1)} (PRIMARY FOCUS)`);
            console.log(`Fat: ${currentTotalFat.toFixed(1)}g / ${dailyFatTarget.toFixed(1)}g (deficit: ${fatDeficit.toFixed(1)}g, surplus: ${fatSurplus.toFixed(1)}g)`);
            console.log(`Protein: ${currentTotalProtein.toFixed(1)}g / ${dailyProteinTarget.toFixed(1)}g (deficit: ${proteinDeficit.toFixed(1)}g)`);

            // Calculate grocery list optimizations
            calculateGroceryOptimizations();

            // Render the optimization section
            renderGroceryOptimizationSection();

            // Make sure the section is visible
            if (groceryOptimizationSection) {
                groceryOptimizationSection.style.display = 'block';
                console.log('Grocery optimization section displayed');
            } else {
                console.error('Grocery optimization section element not found');
            }
        } else {
            // Hide the optimization section if targets are met or optimization was already applied
            if (groceryOptimizationSection) {
                groceryOptimizationSection.style.display = 'none';
                if (optimizationApplied) {
                    console.log('Optimization already applied - hiding optimization section');
                } else {
                    console.log('All targets met or no targets set - hiding optimization section');
                }
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
     * Calculate the total fat from all adjusted recipes
     * @returns {number} - Total fat in grams
     */
    function calculateTotalFat() {
        return adjustedRecipes.reduce((total, recipe) => {
            // If we have fat data directly, use it
            if (recipe.total_fats) {
                return total + (recipe.total_fats * recipe.scaleFactor);
            }

            // Otherwise estimate fat as 30% of calories (9 calories per gram of fat)
            const estimatedFat = (recipe.adjustedCalories * 0.30) / 9;
            return total + estimatedFat;
        }, 0);
    }

    /**
     * Calculate the total carbs from all adjusted recipes
     * @returns {number} - Total carbs in grams
     */
    function calculateTotalCarbs() {
        return adjustedRecipes.reduce((total, recipe) => {
            // If we have carb data directly, use it
            if (recipe.total_carbohydrates) {
                return total + (recipe.total_carbohydrates * recipe.scaleFactor);
            }

            // Otherwise estimate carbs as 55% of calories (4 calories per gram of carbs)
            const estimatedCarbs = (recipe.adjustedCalories * 0.55) / 4;
            return total + estimatedCarbs;
        }, 0);
    }

    /**
     * Calculate grocery list optimizations for protein, fat, and carbs
     */
    function calculateGroceryOptimizations() {
        console.log('Calculating grocery list optimizations');

        // Reset optimizations
        ingredientOptimizations = [];

        // Calculate deficits and constraints - focus on fats and carbs
        const proteinDeficit = Math.max(0, dailyProteinTarget - currentTotalProtein);
        const fatDeficit = Math.max(0, dailyFatTarget - currentTotalFat);
        const remainingCalories = Math.max(0, dailyCalorieTarget - currentTotalCalories);

        // Calculate fat constraints - don't exceed fat target
        const fatSurplus = Math.max(0, currentTotalFat - dailyFatTarget);
        const maxFatIncrease = fatDeficit; // Only increase fat up to the target, no more

        console.log(`CALORIE-PRIORITY OPTIMIZATION:`);
        console.log(`  🎯 PRIMARY: Remaining calories: ${remainingCalories.toFixed(1)}`);
        console.log(`  🥑 SECONDARY: Fat: ${currentTotalFat.toFixed(1)}g / ${dailyFatTarget.toFixed(1)}g (deficit: ${fatDeficit.toFixed(1)}g, max increase: ${maxFatIncrease.toFixed(1)}g)`);
        console.log(`  🥩 TERTIARY: Protein: ${currentTotalProtein.toFixed(1)}g / ${dailyProteinTarget.toFixed(1)}g (deficit: ${proteinDeficit.toFixed(1)}g)`);

        // Calculate the maximum allowed calorie increase
        const maxCalorieIncrease = Math.min(
            dailyCalorieTarget * (MAX_CALORIE_INCREASE_PERCENTAGE / 100),
            remainingCalories
        );
        console.log(`Maximum allowed calorie increase: ${maxCalorieIncrease.toFixed(1)} calories`);

        // Get all ingredients with their macro ratios
        const ingredientsWithRatios = [];

        // Process each recipe to get ingredient data
        if (!fullRecipeData || !Array.isArray(fullRecipeData) || fullRecipeData.length === 0) {
            console.error('No recipe data available for grocery optimization');
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

                // Calculate macronutrient values
                const calories = ingredient.calories * scaleFactor;
                const protein = ingredient.protein * scaleFactor;
                const fat = ingredient.fats * scaleFactor;
                const carbs = ingredient.carbohydrates * scaleFactor;

                // Skip ingredients with no calories
                if (calories <= 0) {
                    console.log(`Skipping ingredient ${ingredient.name} - no calories (${calories})`);
                    return;
                }

                // Calculate ratios for each macronutrient
                const proteinCalorieRatio = protein / calories;
                const fatCalorieRatio = fat / calories;
                const carbCalorieRatio = carbs / calories;

                // NEW OPTIMIZATION STRATEGY: Priority order - Calories > Fats > Proteins
                // Priority: 1) Fill remaining calories, 2) Include fats (but don't exceed target), 3) Proteins last
                let optimizationType = 'carbs'; // Default to carbs for filling calories
                let primaryRatio = carbCalorieRatio;

                // Always prioritize filling remaining calories first
                if (remainingCalories > 50) {
                    // If we have remaining calories to fill, choose the best macro strategy
                    if (fatDeficit > 0 && fatCalorieRatio > carbCalorieRatio) {
                        // Use fat-rich ingredients if we need fat and they're efficient
                        optimizationType = 'fat';
                        primaryRatio = fatCalorieRatio;
                    } else {
                        // Otherwise use carbs to fill calories
                        optimizationType = 'carbs';
                        primaryRatio = carbCalorieRatio;
                    }
                } else if (fatDeficit > 0) {
                    // If calories are mostly filled but we still need fat
                    optimizationType = 'fat';
                    primaryRatio = fatCalorieRatio;
                } else if (proteinDeficit > 0) {
                    // Lowest priority: protein (only if calories and fats are handled)
                    optimizationType = 'protein';
                    primaryRatio = proteinCalorieRatio;
                }

                console.log(`Ingredient ${ingredient.name}: P:${protein.toFixed(1)}g, F:${fat.toFixed(1)}g, C:${carbs.toFixed(1)}g, Cal:${calories.toFixed(1)}, Type:${optimizationType}, Ratio:${primaryRatio.toFixed(3)}`);

                // Add ingredient with all macro data
                ingredientsWithRatios.push({
                    name: ingredient.name,
                    amount: ingredient.amount * scaleFactor,
                    calories: calories,
                    protein: protein,
                    fat: fat,
                    carbs: carbs,
                    proteinRatio: proteinCalorieRatio,
                    fatRatio: fatCalorieRatio,
                    carbRatio: carbCalorieRatio,
                    optimizationType: optimizationType,
                    primaryRatio: primaryRatio,
                    originalAmount: ingredient.amount,
                    scaleFactor: scaleFactor,
                    recipe: recipe.name
                });
            });
        });

        console.log(`Found ${ingredientsWithRatios.length} ingredients for optimization`);

        // Sort ingredients by their primary optimization ratio (highest first)
        ingredientsWithRatios.sort((a, b) => b.primaryRatio - a.primaryRatio);

        // Log the top 5 ingredients by optimization type
        console.log('Top ingredients by optimization priority:');
        ingredientsWithRatios.slice(0, 5).forEach((ingredient, index) => {
            console.log(`${index + 1}. ${ingredient.name}: ${ingredient.optimizationType} ratio ${ingredient.primaryRatio.toFixed(3)} (P:${ingredient.protein.toFixed(1)}g, F:${ingredient.fat.toFixed(1)}g, C:${ingredient.carbs.toFixed(1)}g / ${ingredient.calories.toFixed(1)} cal)`);
        });

        // Calculate how much to increase each ingredient - CALORIE PRIORITY FOCUS
        let remainingProteinNeeded = proteinDeficit;
        let remainingFatNeeded = fatDeficit; // Only increase fat up to target
        let remainingCaloriesAvailable = maxCalorieIncrease;
        let totalCalorieIncrease = 0;
        let totalFatIncrease = 0; // Track fat increases to ensure we don't exceed target

        console.log(`Starting optimization - Priority: Fill ${remainingCaloriesAvailable.toFixed(1)} calories, then ${maxFatIncrease.toFixed(1)}g fat, then ${remainingProteinNeeded.toFixed(1)}g protein`);

        ingredientsWithRatios.forEach(ingredient => {
            // Skip if we've exceeded calorie limit
            if (totalCalorieIncrease >= maxCalorieIncrease || remainingCaloriesAvailable <= 50) {
                console.log(`Skipping ${ingredient.name} - calorie limit reached`);
                return;
            }

            // Calculate macronutrient amounts per gram
            const proteinPerGram = ingredient.protein / ingredient.amount;
            const fatPerGram = ingredient.fat / ingredient.amount;
            const carbPerGram = ingredient.carbs / ingredient.amount;
            const caloriesPerGram = ingredient.calories / ingredient.amount;

            // Determine how much to increase based on optimization type - PRIORITY ORDER
            let amountIncrease = 0;
            let limitingFactor = '';

            if (ingredient.optimizationType === 'carbs' && remainingCaloriesAvailable > 50) {
                // PRIORITY 1: Fill remaining calories with carb-rich ingredients
                amountIncrease = (maxCalorieIncrease - totalCalorieIncrease) / caloriesPerGram;
                limitingFactor = 'remaining calories (priority 1)';

                console.log(`${ingredient.name} (CALORIES): Can increase by ${amountIncrease.toFixed(1)}g (${(amountIncrease * carbPerGram).toFixed(1)}g carbs, limited by ${limitingFactor})`);
            } else if (ingredient.optimizationType === 'fat' && remainingFatNeeded > 0) {
                // PRIORITY 2: Increase fat-rich ingredients, but don't exceed fat target
                const maxIncreaseByFat = remainingFatNeeded / fatPerGram;
                const maxIncreaseByCalories = (maxCalorieIncrease - totalCalorieIncrease) / caloriesPerGram;

                amountIncrease = Math.min(maxIncreaseByFat, maxIncreaseByCalories);
                limitingFactor = maxIncreaseByFat < maxIncreaseByCalories ? 'fat target limit (priority 2)' : 'calorie limit';

                console.log(`${ingredient.name} (FAT): Can increase by ${amountIncrease.toFixed(1)}g (${(amountIncrease * fatPerGram).toFixed(1)}g fat, limited by ${limitingFactor})`);
            } else if (ingredient.optimizationType === 'protein' && remainingProteinNeeded > 0) {
                // PRIORITY 3: Protein (lowest priority)
                const maxIncreaseByProtein = remainingProteinNeeded / proteinPerGram;
                const maxIncreaseByCalories = (maxCalorieIncrease - totalCalorieIncrease) / caloriesPerGram;

                amountIncrease = Math.min(maxIncreaseByProtein, maxIncreaseByCalories);
                limitingFactor = maxIncreaseByProtein < maxIncreaseByCalories ? 'protein needed (priority 3)' : 'calorie limit';

                console.log(`${ingredient.name} (PROTEIN): Can increase by ${amountIncrease.toFixed(1)}g (${(amountIncrease * proteinPerGram).toFixed(1)}g protein, limited by ${limitingFactor})`);
            }

            if (amountIncrease <= 0.1) {
                console.log(`Skipping ${ingredient.name} - increase too small (${amountIncrease.toFixed(1)}g)`);
                return;
            }

            // Calculate the resulting macro and calorie increases
            const proteinIncrease = amountIncrease * proteinPerGram;
            const fatIncrease = amountIncrease * fatPerGram;
            const carbIncrease = amountIncrease * carbPerGram;
            const calorieIncrease = amountIncrease * caloriesPerGram;

            // SAFETY CHECK: Ensure we don't exceed fat target
            if (ingredient.optimizationType === 'fat' && (totalFatIncrease + fatIncrease) > maxFatIncrease) {
                console.log(`⚠️  ${ingredient.name}: Would exceed fat target, skipping`);
                return;
            }

            console.log(`✓ ${ingredient.name}: +${amountIncrease.toFixed(1)}g → +${calorieIncrease.toFixed(1)} cal, +${fatIncrease.toFixed(1)}g fat, +${carbIncrease.toFixed(1)}g carbs, +${proteinIncrease.toFixed(1)}g protein`);

            // Update the remaining values
            remainingProteinNeeded = Math.max(0, remainingProteinNeeded - proteinIncrease);
            remainingFatNeeded = Math.max(0, remainingFatNeeded - fatIncrease);
            remainingCaloriesAvailable = Math.max(0, remainingCaloriesAvailable - calorieIncrease);
            totalCalorieIncrease += calorieIncrease;
            totalFatIncrease += fatIncrease;

            // Add to optimizations
            ingredientOptimizations.push({
                name: ingredient.name,
                currentAmount: ingredient.amount,
                suggestedIncrease: amountIncrease,
                newAmount: ingredient.amount + amountIncrease,
                proteinIncrease: proteinIncrease,
                fatIncrease: fatIncrease,
                carbIncrease: carbIncrease,
                calorieIncrease: calorieIncrease,
                optimizationType: ingredient.optimizationType,
                recipe: ingredient.recipe
            });
        });

        console.log(`🎯 CALORIE-PRIORITY OPTIMIZATION SUMMARY:`);
        ingredientOptimizations.forEach(opt => {
            console.log(`  ${opt.name}: ${opt.currentAmount.toFixed(1)}g → ${opt.newAmount.toFixed(1)}g (+${opt.suggestedIncrease.toFixed(1)}g) [${opt.optimizationType.toUpperCase()}]`);
            console.log(`    +${opt.calorieIncrease.toFixed(1)} cal, +${opt.fatIncrease.toFixed(1)}g fat, +${opt.carbIncrease.toFixed(1)}g carbs, +${opt.proteinIncrease.toFixed(1)}g protein`);
        });
        console.log(`🎯 PRIMARY - Calories: ${totalCalorieIncrease.toFixed(1)} added (${remainingCaloriesAvailable.toFixed(1)} remaining)`);
        console.log(`🥑 SECONDARY - Fat: ${totalFatIncrease.toFixed(1)}g added, ${remainingFatNeeded.toFixed(1)}g still needed (final: ${(currentTotalFat + totalFatIncrease).toFixed(1)}g / ${dailyFatTarget.toFixed(1)}g)`);
        console.log(`🥩 TERTIARY - Protein: ${remainingProteinNeeded.toFixed(1)}g still needed`);
    }

    // Initialize when the DOM is loaded
    document.addEventListener('DOMContentLoaded', init);

    /**
     * Render the grocery list optimization section
     */
    function renderGroceryOptimizationSection() {
        console.log('Rendering grocery list optimization section');

        // Get or create the grocery optimization section
        groceryOptimizationSection = document.getElementById('grocery-optimization-section');

        if (!groceryOptimizationSection) {
            // Create the section if it doesn't exist
            groceryOptimizationSection = document.createElement('div');
            groceryOptimizationSection.id = 'grocery-optimization-section';
            groceryOptimizationSection.className = 'grocery-optimization-section';

            // Find the grocery list results container and add the section after it
            const groceryListResults = document.getElementById('grocery-list-results');
            if (groceryListResults && groceryListResults.parentNode) {
                groceryListResults.parentNode.insertBefore(groceryOptimizationSection, groceryListResults.nextSibling);
                console.log('Created and inserted grocery optimization section');
            } else {
                console.error('Could not find grocery list results container');
                return;
            }
        }

        // If no optimizations are available, show a message instead of hiding
        if (ingredientOptimizations.length === 0) {
            console.log('No ingredient optimizations available - showing message');

            // Calculate current percentages
            const proteinPercent = dailyProteinTarget > 0 ? ((currentTotalProtein / dailyProteinTarget) * 100).toFixed(1) : 'N/A';
            const fatPercent = dailyFatTarget > 0 ? ((currentTotalFat / dailyFatTarget) * 100).toFixed(1) : 'N/A';
            const caloriePercent = dailyCalorieTarget > 0 ? ((currentTotalCalories / dailyCalorieTarget) * 100).toFixed(1) : 'N/A';

            // Create a simple message explaining why no optimizations are available
            let html = `
                <h3>Calorie & Macro Optimizer</h3>
                <div class="status-comparison">
                    <div class="status-box">
                        <h4>Current Status</h4>
                        <div class="macro-item">
                            <span>Calories:</span>
                            <span class="macro-value">${currentTotalCalories.toFixed(1)} (${caloriePercent}%)</span>
                        </div>
                        <div class="macro-item">
                            <span>Fat:</span>
                            <span class="macro-value">${currentTotalFat.toFixed(1)}g (${fatPercent}%)</span>
                        </div>
                        <div class="macro-item">
                            <span>Protein:</span>
                            <span class="macro-value">${currentTotalProtein.toFixed(1)}g (${proteinPercent}%)</span>
                        </div>
                        <div class="macro-item">
                            <span>Carbs:</span>
                            <span class="macro-value">${currentTotalCarbs.toFixed(1)}g</span>
                        </div>
                    </div>
                </div>
                <div class="grocery-optimization-info">
                    <p><strong>Priority Order:</strong> No optimizations available. This could be because:</p>
                    <ul>
                        <li>Your calorie target is already met (primary focus)</li>
                        <li>Your fat target is already met (won't exceed fat goal)</li>
                        <li>The selected recipes don't have suitable ingredients</li>
                    </ul>
                    <p><strong>Strategy:</strong> 1) Fill remaining calories, 2) Include fats (without exceeding target), 3) Proteins last.</p>
                </div>
            `;

            // Set the HTML content
            groceryOptimizationSection.innerHTML = html;
            groceryOptimizationSection.style.display = 'block';
            groceryOptimizationSection.style.visibility = 'visible';
            groceryOptimizationSection.style.opacity = '1';

            return;
        }

        // Calculate totals
        const totalProteinIncrease = ingredientOptimizations.reduce((total, opt) => total + opt.proteinIncrease, 0);
        const totalFatIncrease = ingredientOptimizations.reduce((total, opt) => total + opt.fatIncrease, 0);
        const totalCarbIncrease = ingredientOptimizations.reduce((total, opt) => total + opt.carbIncrease, 0);
        const totalCalorieIncrease = ingredientOptimizations.reduce((total, opt) => total + opt.calorieIncrease, 0);

        const newTotalProtein = currentTotalProtein + totalProteinIncrease;
        const newTotalFat = currentTotalFat + totalFatIncrease;
        const newTotalCarbs = currentTotalCarbs + totalCarbIncrease;
        const newTotalCalories = currentTotalCalories + totalCalorieIncrease;

        console.log(`Increases - Protein: ${totalProteinIncrease.toFixed(1)}g, Fat: ${totalFatIncrease.toFixed(1)}g, Carbs: ${totalCarbIncrease.toFixed(1)}g, Calories: ${totalCalorieIncrease.toFixed(1)}`);
        console.log(`New totals - Protein: ${newTotalProtein.toFixed(1)}g, Fat: ${newTotalFat.toFixed(1)}g, Carbs: ${newTotalCarbs.toFixed(1)}g, Calories: ${newTotalCalories.toFixed(1)}`);

        // Create the HTML content with new combined layout - CALORIE PRIORITY FOCUS
        let html = `
            <h3>Calorie & Macro Optimizer</h3>
            <div class="status-comparison">
                <div class="status-box">
                    <h4>Current Status</h4>
                    <div class="macro-item">
                        <span>Calories:</span>
                        <span class="macro-value">${currentTotalCalories.toFixed(1)} (${dailyCalorieTarget > 0 ? ((currentTotalCalories / dailyCalorieTarget) * 100).toFixed(1) + '%' : 'no target'})</span>
                    </div>
                    <div class="macro-item">
                        <span>Fat:</span>
                        <span class="macro-value">${currentTotalFat.toFixed(1)}g (${dailyFatTarget > 0 ? ((currentTotalFat / dailyFatTarget) * 100).toFixed(1) + '%' : 'no target'})</span>
                    </div>
                    <div class="macro-item">
                        <span>Protein:</span>
                        <span class="macro-value">${currentTotalProtein.toFixed(1)}g (${dailyProteinTarget > 0 ? ((currentTotalProtein / dailyProteinTarget) * 100).toFixed(1) + '%' : 'no target'})</span>
                    </div>
                    <div class="macro-item">
                        <span>Carbs:</span>
                        <span class="macro-value">${currentTotalCarbs.toFixed(1)}g</span>
                    </div>
                </div>
                <div class="status-arrow">→</div>
                <div class="status-box">
                    <h4>After Optimization</h4>
                    <div class="macro-item">
                        <span>Calories:</span>
                        <span class="macro-value">${newTotalCalories.toFixed(1)} (${dailyCalorieTarget > 0 ? ((newTotalCalories / dailyCalorieTarget) * 100).toFixed(1) + '%' : 'no target'})</span>
                    </div>
                    <div class="macro-item">
                        <span>Fat:</span>
                        <span class="macro-value">${newTotalFat.toFixed(1)}g (${dailyFatTarget > 0 ? ((newTotalFat / dailyFatTarget) * 100).toFixed(1) + '%' : 'no target'})</span>
                    </div>
                    <div class="macro-item">
                        <span>Protein:</span>
                        <span class="macro-value">${newTotalProtein.toFixed(1)}g (${dailyProteinTarget > 0 ? ((newTotalProtein / dailyProteinTarget) * 100).toFixed(1) + '%' : 'no target'})</span>
                    </div>
                    <div class="macro-item">
                        <span>Carbs:</span>
                        <span class="macro-value">${newTotalCarbs.toFixed(1)}g</span>
                    </div>
                </div>
            </div>
        `;

        // Add the simplified table of suggested changes
        html += `
            <table class="grocery-optimization-table">
                <thead>
                    <tr>
                        <th>Ingredient</th>
                        <th>Amount Change</th>
                        <th>+Protein (g)</th>
                        <th>+Fat (g)</th>
                        <th>+Carbs (g)</th>
                        <th>+Calories</th>
                        <th>Recipe</th>
                    </tr>
                </thead>
                <tbody>
        `;

        // Add rows for each optimization
        ingredientOptimizations.forEach(opt => {
            const truncatedRecipe = opt.recipe.length > 15 ? opt.recipe.substring(0, 15) + '...' : opt.recipe;
            html += `
                <tr>
                    <td title="${opt.name}">${opt.name}</td>
                    <td>${opt.currentAmount.toFixed(1)}g → ${opt.newAmount.toFixed(1)}g</td>
                    <td>${opt.proteinIncrease.toFixed(1)}</td>
                    <td>${opt.fatIncrease.toFixed(1)}</td>
                    <td>${opt.carbIncrease.toFixed(1)}</td>
                    <td>${opt.calorieIncrease.toFixed(1)}</td>
                    <td title="${opt.recipe}">${truncatedRecipe}</td>
                </tr>
            `;
        });

        // Add summary row
        html += `
                <tr class="summary-row">
                    <td><strong>Total</strong></td>
                    <td></td>
                    <td><strong>${totalProteinIncrease.toFixed(1)}</strong></td>
                    <td><strong>${totalFatIncrease.toFixed(1)}</strong></td>
                    <td><strong>${totalCarbIncrease.toFixed(1)}</strong></td>
                    <td><strong>${totalCalorieIncrease.toFixed(1)}</strong></td>
                    <td></td>
                </tr>
            </tbody>
        </table>
        `;

        // Add apply button with updated text
        html += `
            <div class="grocery-optimization-summary">
                <p><strong>Priority Strategy:</strong> 1) Fill remaining calories, 2) Include fats (without exceeding target), 3) Proteins last.</p>
                <button id="apply-grocery-optimization" class="apply-optimization-btn">Apply Calorie & Macro Optimization</button>
            </div>
        `;

        // Set the HTML content
        groceryOptimizationSection.innerHTML = html;
        groceryOptimizationSection.style.display = 'block';

        // Make sure the section is visible by adding a specific style
        groceryOptimizationSection.style.visibility = 'visible';
        groceryOptimizationSection.style.opacity = '1';

        // Add event listener to the apply button after a short delay to ensure the DOM is updated
        setTimeout(() => {
            applyChangesBtn = document.getElementById('apply-grocery-optimization');
            if (applyChangesBtn) {
                applyChangesBtn.addEventListener('click', function(event) {
                    console.log('🔥 OPTIMIZATION BUTTON CLICKED! 🔥');
                    event.preventDefault();
                    applyGroceryOptimization();
                });
                console.log('✓ Added event listener to apply button');
            } else {
                console.error('✗ Apply button not found after rendering');
            }
        }, 100);

        // Log that the section was rendered
        console.log('Grocery optimization section rendered with', ingredientOptimizations.length, 'optimizations');
    }

    /**
     * Apply the grocery list optimization changes
     */
    function applyGroceryOptimization() {
        console.log('=== APPLYING GROCERY LIST OPTIMIZATION ===');
        console.log('Current grocery list items:', window.groceryList ? window.groceryList.map(item => item.name) : 'No grocery list');
        console.log('Optimizations to apply:', ingredientOptimizations.map(opt => `${opt.name} (+${opt.suggestedIncrease}g)`));

        // Disable the button to prevent multiple clicks
        if (applyChangesBtn) {
            applyChangesBtn.disabled = true;
            applyChangesBtn.textContent = 'Applying Changes...';
        }

        // Check if we have optimizations to apply
        if (ingredientOptimizations.length === 0) {
            showStatus('No grocery list optimizations to apply.', 'error');
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

            // Apply the optimizations by updating scale factors only
            // We don't modify the original ingredient amounts, only the scale factors
            console.log('Applying optimizations by updating scale factors...');

            // Recalculate the grocery list with the updated ingredient amounts
            if (typeof window.generateGroceryList === 'function') {
                // Before regenerating the grocery list, update the fullRecipeData with the new ingredient amounts
                // This ensures that the micronutrient calculations will use the updated values
                console.log('Updating fullRecipeData with optimized ingredient amounts');

                // Update the adjustedRecipes scale factors to reflect the optimization
                // This is the correct approach since grocery list generation uses scaleFactor * originalAmount
                ingredientOptimizations.forEach(optimization => {
                    // Find the recipe in adjustedRecipes
                    const adjustedRecipeIndex = adjustedRecipes.findIndex(recipe => recipe.name === optimization.recipe);
                    if (adjustedRecipeIndex !== -1) {
                        // Find the recipe in fullRecipeData to get the original ingredient amount
                        const fullRecipeIndex = fullRecipeData.findIndex(recipe => recipe.name === optimization.recipe);
                        if (fullRecipeIndex !== -1) {
                            // Find the ingredient in the recipe
                            const ingredientIndex = fullRecipeData[fullRecipeIndex].ingredients.findIndex(
                                ingredient => ingredient.name === optimization.name
                            );

                            if (ingredientIndex !== -1) {
                                // Get the original ingredient amount (base amount before any scaling)
                                const originalIngredientAmount = fullRecipeData[fullRecipeIndex].ingredients[ingredientIndex].amount;

                                // Calculate what the current scaled amount is
                                const currentScaledAmount = originalIngredientAmount * adjustedRecipes[adjustedRecipeIndex].scaleFactor;

                                // Calculate what the new scaled amount should be
                                const newScaledAmount = currentScaledAmount + optimization.suggestedIncrease;

                                // Calculate the new scale factor needed to achieve this amount
                                const newScaleFactor = newScaledAmount / originalIngredientAmount;

                                // Update the scale factor and adjusted calories
                                const oldScaleFactor = adjustedRecipes[adjustedRecipeIndex].scaleFactor;
                                adjustedRecipes[adjustedRecipeIndex].scaleFactor = newScaleFactor;
                                adjustedRecipes[adjustedRecipeIndex].adjustedCalories = adjustedRecipes[adjustedRecipeIndex].originalCalories * newScaleFactor;

                                console.log(`🔧 SCALE FACTOR UPDATE: ${optimization.name}`);
                                console.log(`   ${currentScaledAmount.toFixed(1)}g → ${newScaledAmount.toFixed(1)}g (scale: ${oldScaleFactor.toFixed(3)} → ${newScaleFactor.toFixed(3)})`);
                                console.log(`   Expected final amount in grocery list: ${(originalIngredientAmount * newScaleFactor).toFixed(1)}g`);
                            } else {
                                console.log(`✗ Could not find ingredient ${optimization.name} in recipe ${optimization.recipe}`);
                            }
                        } else {
                            console.log(`✗ Could not find recipe ${optimization.recipe} in fullRecipeData`);
                        }
                    } else {
                        console.log(`✗ Could not find recipe ${optimization.recipe} in adjustedRecipes`);
                    }
                });

                // Set flag to indicate optimization has been applied
                optimizationApplied = true;
                console.log('✓ Optimization applied flag set to true');

                // Hide the optimization section since we're applying the changes
                if (groceryOptimizationSection) {
                    groceryOptimizationSection.style.display = 'none';
                    console.log('✓ Hidden optimization section after applying changes');
                } else {
                    console.log('✗ Could not find optimization section to hide');
                }

                // Add a listener for when the grocery list is regenerated
                const handleRegeneratedList = () => {
                    console.log('🎉 GROCERY LIST REGENERATED AFTER OPTIMIZATION');
                    if (window.groceryList && window.groceryList.length > 0) {
                        const beefItem = window.groceryList.find(item => item.name.includes('Ground Beef'));
                        if (beefItem) {
                            console.log(`🥩 Ground Beef final amount: ${beefItem.amount.toFixed(1)}g`);
                        }
                    }

                    // Force re-render the grocery list display to ensure updated amounts are shown
                    setTimeout(() => {
                        if (typeof window.renderGroceryList === 'function') {
                            console.log('✓ Calling renderGroceryList to update display');
                            window.renderGroceryList();
                        } else {
                            console.log('✗ renderGroceryList function not found');
                        }

                        // Also try to trigger any other UI updates
                        if (typeof window.updateUI === 'function') {
                            console.log('✓ Calling updateUI to refresh interface');
                            window.updateUI();
                        }

                        // Double-check that the grocery list display has been updated
                        const groceryTable = document.querySelector('.grocery-list-table');
                        if (groceryTable) {
                            console.log('✓ Grocery list table found in DOM');
                            const firstIngredientRow = groceryTable.querySelector('tbody tr:first-child td:nth-child(2)');
                            if (firstIngredientRow) {
                                console.log('✓ First ingredient amount in table:', firstIngredientRow.textContent);
                            }
                        } else {
                            console.log('✗ Grocery list table not found in DOM');
                        }
                    }, 100); // Small delay to ensure DOM updates are complete

                    // Remove this listener since it's only needed once
                    document.removeEventListener('groceryListGenerated', handleRegeneratedList);

                    // Reset the apply button
                    resetApplyButton();

                    // Show success message
                    showStatus('Grocery list optimization applied successfully!', 'success');
                };

                // Add the listener before calling generateGroceryList
                document.addEventListener('groceryListGenerated', handleRegeneratedList);

                // Now regenerate the grocery list - this will trigger the event above
                console.log('Calling generateGroceryList to regenerate with optimized amounts');
                console.log('Current window.groceryList before regeneration:', window.groceryList ? window.groceryList.map(item => `${item.name}: ${item.amount}g`) : 'No grocery list');
                console.log('Current adjustedRecipes before regeneration:', adjustedRecipes.map(r => `${r.name}: scale ${r.scaleFactor}`));

                // Ensure the global adjustedRecipes is updated
                if (typeof window.adjustedRecipes !== 'undefined') {
                    window.adjustedRecipes = adjustedRecipes;
                    console.log('✓ Updated global window.adjustedRecipes');
                }

                window.generateGroceryList();
            } else {
                // If the generateGroceryList function is not available, try to find it in the global scope
                console.log('Trying to find generateGroceryList function in global scope...');

                // Look for the function in the window object
                for (const key in window) {
                    if (typeof window[key] === 'function' && key.toLowerCase().includes('grocery') && key.toLowerCase().includes('generate')) {
                        console.log(`Found potential function: ${key}`);
                        try {
                            // Apply optimizations by updating scale factors (same logic as main path)
                            ingredientOptimizations.forEach(optimization => {
                                // Find the recipe in adjustedRecipes
                                const adjustedRecipeIndex = adjustedRecipes.findIndex(recipe => recipe.name === optimization.recipe);
                                if (adjustedRecipeIndex !== -1) {
                                    // Find the recipe in fullRecipeData to get the original ingredient amount
                                    const fullRecipeIndex = fullRecipeData.findIndex(recipe => recipe.name === optimization.recipe);
                                    if (fullRecipeIndex !== -1) {
                                        // Find the ingredient in the recipe
                                        const ingredientIndex = fullRecipeData[fullRecipeIndex].ingredients.findIndex(
                                            ingredient => ingredient.name === optimization.name
                                        );

                                        if (ingredientIndex !== -1) {
                                            // Get the original ingredient amount (base amount before any scaling)
                                            const originalIngredientAmount = fullRecipeData[fullRecipeIndex].ingredients[ingredientIndex].amount;

                                            // Calculate what the current scaled amount is
                                            const currentScaledAmount = originalIngredientAmount * adjustedRecipes[adjustedRecipeIndex].scaleFactor;

                                            // Calculate what the new scaled amount should be
                                            const newScaledAmount = currentScaledAmount + optimization.suggestedIncrease;

                                            // Calculate the new scale factor needed to achieve this amount
                                            const newScaleFactor = newScaledAmount / originalIngredientAmount;

                                            // Update the scale factor and adjusted calories
                                            const oldScaleFactor = adjustedRecipes[adjustedRecipeIndex].scaleFactor;
                                            adjustedRecipes[adjustedRecipeIndex].scaleFactor = newScaleFactor;
                                            adjustedRecipes[adjustedRecipeIndex].adjustedCalories = adjustedRecipes[adjustedRecipeIndex].originalCalories * newScaleFactor;

                                            console.log(`🔧 FALLBACK SCALE FACTOR UPDATE: ${optimization.name}`);
                                            console.log(`   ${currentScaledAmount.toFixed(1)}g → ${newScaledAmount.toFixed(1)}g (scale: ${oldScaleFactor.toFixed(3)} → ${newScaleFactor.toFixed(3)})`);
                                        }
                                    }
                                }
                            });

                            // Set flag to indicate optimization has been applied
                            optimizationApplied = true;

                            // Ensure the global adjustedRecipes is updated
                            if (typeof window.adjustedRecipes !== 'undefined') {
                                window.adjustedRecipes = adjustedRecipes;
                                console.log('✓ Updated global window.adjustedRecipes (fallback)');
                            }

                            // Hide the optimization section since we're applying the changes
                            if (groceryOptimizationSection) {
                                groceryOptimizationSection.style.display = 'none';
                            }

                            // Add a listener for when the grocery list is regenerated
                            const handleRegeneratedList = () => {
                                console.log('Grocery list regenerated after optimization (fallback method)');

                                // Remove this listener since it's only needed once
                                document.removeEventListener('groceryListGenerated', handleRegeneratedList);

                                // Reset the apply button
                                resetApplyButton();

                                // Show success message
                                showStatus('Grocery list optimization applied successfully!', 'success');
                            };

                            // Add the listener before calling the function
                            document.addEventListener('groceryListGenerated', handleRegeneratedList);

                            // Call the generate function
                            window[key]();
                            return;
                        } catch (e) {
                            console.error(`Error calling ${key}:`, e);
                        }
                    }
                }

                // If we still can't find it, show an error
                console.error('generateGroceryList function not found');
                showStatus('Failed to apply grocery list optimization. Please try again.', 'error');
                resetApplyButton();
            }
        } catch (error) {
            console.error('Error applying grocery list optimization:', error);
            showStatus(`Failed to apply grocery list optimization: ${error.message}`, 'error');
            resetApplyButton();
        }
    }

    /**
     * Reset the apply button to its original state
     */
    function resetApplyButton() {
        if (applyChangesBtn) {
            applyChangesBtn.disabled = false;
            applyChangesBtn.textContent = 'Apply Calorie & Macro Optimization';
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

    // Export functions to global scope for testing
    window.GroceryOptimization = {
        calculateGroceryOptimizations,
        renderGroceryOptimizationSection,
        applyGroceryOptimization
    };
})();
