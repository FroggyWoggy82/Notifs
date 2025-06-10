/**
 * Micronutrient Percentage Display
 *
 * This script calculates and displays the percentage of daily micronutrient targets
 * met by the selected recipes in the grocery list.
 */

(function() {
    /**
     * Calculate micronutrient totals from a list of ingredients
     * @param {Array} ingredients - Array of ingredient objects with micronutrient data
     * @param {Array} scaleFactors - Array of scale factors to apply to each ingredient's recipe
     * @returns {Object} - Object with micronutrient totals
     */
    function calculateMicronutrientTotals(fullRecipes, adjustedRecipes) {
        const micronutrientTotals = {};

        // Initialize totals for all tracked micronutrients
        for (const category in MICRONUTRIENT_CATEGORIES) {
            MICRONUTRIENT_CATEGORIES[category].forEach(nutrient => {
                micronutrientTotals[nutrient.key] = 0;
            });
        }

        // Add special case for calories/energy
        micronutrientTotals.energy = 0;

        // Explicitly initialize all common micronutrients to ensure they're included
        const initialMicronutrients = [
            'calcium', 'iron', 'magnesium', 'phosphorus', 'potassium', 'sodium', 'zinc',
            'copper', 'manganese', 'selenium', 'vitamin_a', 'vitamin_c', 'vitamin_d',
            'vitamin_e', 'vitamin_k', 'thiamine', 'riboflavin', 'niacin', 'vitamin_b6',
            'folate', 'vitamin_b12', 'pantothenic_acid', 'fiber', 'sugars', 'saturated',
            'monounsaturated', 'polyunsaturated', 'omega3', 'omega6', 'cholesterol'
        ];

        initialMicronutrients.forEach(nutrient => {
            if (micronutrientTotals[nutrient] === undefined) {
                micronutrientTotals[nutrient] = 0;
            }
        });

        // Debug: Log what recipes we're processing
        console.log('Processing', fullRecipes.length, 'recipes for micronutrient totals');

        // Calculate totals from all recipes
        fullRecipes.forEach((fullRecipe, index) => {
            // Calculate scale factor - handle both formats
            let scaleFactor = 1;
            if (adjustedRecipes[index].scaleFactor !== undefined) {
                scaleFactor = adjustedRecipes[index].scaleFactor;
            } else if (adjustedRecipes[index].total_calories !== undefined && fullRecipe.total_calories) {
                scaleFactor = adjustedRecipes[index].total_calories / fullRecipe.total_calories;
            }

            // Add recipe calories to energy total
            micronutrientTotals.energy += fullRecipe.total_calories * scaleFactor;

            // Debug: Log recipe info
            console.log(`Recipe: ${fullRecipe.name}, Calories: ${fullRecipe.total_calories}, Scale: ${scaleFactor}`);
            console.log(`Ingredients count: ${fullRecipe.ingredients ? fullRecipe.ingredients.length : 0}`);

            // Handle missing ingredients
            if (!fullRecipe.ingredients || fullRecipe.ingredients.length === 0) {
                console.warn(`No ingredients found for recipe: ${fullRecipe.name}`);
                return;
            }

            // Process each ingredient
            fullRecipe.ingredients.forEach(ingredient => {
                // Debug: Log ingredient keys to see what data is available
                if (index === 0) { // Only log for first recipe to avoid console spam
                    console.log(`Ingredient ${ingredient.name} has properties:`, Object.keys(ingredient));

                    // Log specific micronutrient values for debugging
                    console.log(`Ingredient ${ingredient.name} calcium value:`, ingredient.calcium);
                    console.log(`Ingredient ${ingredient.name} omega3 value:`, ingredient.omega3);
                    console.log(`Ingredient ${ingredient.name} omega_3 value:`, ingredient.omega_3);
                    console.log(`Ingredient ${ingredient.name} omega6 value:`, ingredient.omega6);
                    console.log(`Ingredient ${ingredient.name} omega_6 value:`, ingredient.omega_6);
                }

                // Apply scale factor to all micronutrients
                for (const key in ingredient) {
                    // Skip non-numeric properties and recipe-specific properties
                    // Also skip null values
                    if (
                        ingredient[key] !== null &&
                        typeof ingredient[key] === 'number' &&
                        !['id', 'recipe_id', 'created_at', 'updated_at'].includes(key)
                    ) {
                        // Initialize if not already
                        if (micronutrientTotals[key] === undefined) {
                            micronutrientTotals[key] = 0;
                        }

                        // Add scaled value to total
                        const scaledValue = ingredient[key] * scaleFactor;

                        // Special handling for fats field - map to fat for display
                        if (key === 'fats') {
                            // Initialize fat if not already
                            if (micronutrientTotals.fat === undefined) {
                                micronutrientTotals.fat = 0;
                            }
                            // Add the scaled value to the fat total
                            micronutrientTotals.fat += scaledValue;
                            console.log(`FAT FIX (initial): Adding ${scaledValue}g fat from ${ingredient.name} (original: ${ingredient[key]}g from fats field, scale: ${scaleFactor})`);
                        }

                        // Debug log for all micronutrients
                        if (scaledValue > 0 && !['calories', 'protein', 'fats', 'carbohydrates', 'amount', 'price',
                                               'calories_per_gram', 'protein_per_gram', 'fats_per_gram',
                                               'carbohydrates_per_gram', 'price_per_gram', 'package_amount'].includes(key)) {
                            console.log(`Adding ${scaledValue} ${key} from ${ingredient.name} (original: ${ingredient[key]}, scale: ${scaleFactor})`);
                        }

                        // Add the scaled value to the total
                        micronutrientTotals[key] += scaledValue;

                        // Special logging for calcium to debug
                        if (key === 'calcium') {
                            console.log(`CALCIUM: Adding ${scaledValue} calcium from ${ingredient.name} (original: ${ingredient[key]}, scale: ${scaleFactor})`);
                            console.log(`CALCIUM: Current total after adding: ${micronutrientTotals.calcium}`);
                        }

                        // Handle special cases for omega3/omega_3 and omega6/omega_6
                        if (key === 'omega3' && micronutrientTotals['omega_3'] !== undefined) {
                            micronutrientTotals['omega_3'] += scaledValue;
                        } else if (key === 'omega_3' && micronutrientTotals['omega3'] !== undefined) {
                            micronutrientTotals['omega3'] += scaledValue;
                        } else if (key === 'omega6' && micronutrientTotals['omega_6'] !== undefined) {
                            micronutrientTotals['omega_6'] += scaledValue;
                        } else if (key === 'omega_6' && micronutrientTotals['omega6'] !== undefined) {
                            micronutrientTotals['omega6'] += scaledValue;
                        }
                    }
                }
            });
        });

        // No debug logging

        // Ensure all micronutrients defined in MICRONUTRIENT_CATEGORIES are included
        for (const category in MICRONUTRIENT_CATEGORIES) {
            MICRONUTRIENT_CATEGORIES[category].forEach(nutrient => {
                if (micronutrientTotals[nutrient.key] === undefined) {
                    micronutrientTotals[nutrient.key] = 0;
                }
            });
        }

        // Consolidate omega3/omega_3 and omega6/omega_6 values if both exist
        if (micronutrientTotals.omega3 !== undefined && micronutrientTotals.omega_3 !== undefined) {
            // Use the larger value
            micronutrientTotals.omega3 = Math.max(micronutrientTotals.omega3, micronutrientTotals.omega_3);
        }

        if (micronutrientTotals.omega6 !== undefined && micronutrientTotals.omega_6 !== undefined) {
            // Use the larger value
            micronutrientTotals.omega6 = Math.max(micronutrientTotals.omega6, micronutrientTotals.omega_6);
        }

        // EMERGENCY FIX: Manually recalculate all micronutrient values from ingredients
        // This is a temporary fix until we can figure out why the values aren't being added correctly
        console.log('EMERGENCY FIX: Manually recalculating all micronutrient totals');
        console.log('Full recipes data:', fullRecipes);
        console.log('Adjusted recipes data:', adjustedRecipes);

        // Define micronutrients to process - use both underscore and non-underscore versions
        const micronutrientsToProcess = [
            'calcium', 'iron', 'magnesium', 'phosphorus', 'potassium', 'sodium', 'zinc',
            'copper', 'manganese', 'selenium', 'vitamin_a', 'vitamin_c', 'vitamin_d',
            'vitamin_e', 'vitamin_k', 'vitamin_b1', 'vitamin_b2', 'vitamin_b3', 'vitamin_b5',
            'vitamin_b6', 'vitamin_b12', 'folate', 'fiber', 'sugars', 'saturated',
            'monounsaturated', 'polyunsaturated', 'omega3', 'omega6', 'cholesterol', 'fat'
        ];

        // Reset all micronutrient totals to 0
        micronutrientsToProcess.forEach(nutrient => {
            micronutrientTotals[nutrient] = 0;
        });

        // Manually recalculate all micronutrient totals
        fullRecipes.forEach((fullRecipe, index) => {
            // Calculate scale factor - handle both formats
            let scaleFactor = 1;
            if (adjustedRecipes[index].scaleFactor !== undefined) {
                scaleFactor = adjustedRecipes[index].scaleFactor;
            } else if (adjustedRecipes[index].total_calories !== undefined && fullRecipe.total_calories) {
                scaleFactor = adjustedRecipes[index].total_calories / fullRecipe.total_calories;
            }

            console.log(`Processing recipe: ${fullRecipe.name}, scale factor: ${scaleFactor}`);

            if (fullRecipe.ingredients) {
                console.log(`Recipe has ${fullRecipe.ingredients.length} ingredients`);

                fullRecipe.ingredients.forEach(ingredient => {
                    console.log(`Processing ingredient: ${ingredient.name}`);
                    console.log(`Ingredient data:`, ingredient);

                    // Dump all properties of the ingredient for debugging
                    for (const prop in ingredient) {
                        if (typeof ingredient[prop] === 'number') {
                            console.log(`  ${prop}: ${ingredient[prop]}`);
                        }
                    }

                    // Special handling for fats field - map to fat for display
                    if (ingredient.fats !== undefined && ingredient.fats !== null) {
                        const fatsValue = parseFloat(ingredient.fats);
                        if (!isNaN(fatsValue)) {
                            const scaledValue = fatsValue * scaleFactor;
                            micronutrientTotals.fat = (micronutrientTotals.fat || 0) + scaledValue;
                            console.log(`FAT FIX: Adding ${scaledValue}g fat from ${ingredient.name} (original: ${fatsValue}g from fats field, scale: ${scaleFactor})`);
                        }
                    }

                    // Process each micronutrient
                    micronutrientsToProcess.forEach(nutrient => {
                        // Skip fat since we handled it specially above
                        if (nutrient === 'fat') {
                            return;
                        }

                        // Try both with and without underscore
                        let value = null;
                        let propertyName = null;

                        // EMERGENCY FIX: Hardcode calcium value if it exists
                        if (nutrient === 'calcium' && ingredient.calcium !== undefined && ingredient.calcium !== null) {
                            console.log(`DIRECT CALCIUM FIX: Found calcium value ${ingredient.calcium} in ingredient ${ingredient.name}`);
                            value = parseFloat(ingredient.calcium);
                            propertyName = 'calcium';
                        }
                        // Check direct property
                        else if (ingredient[nutrient] !== undefined && ingredient[nutrient] !== null) {
                            value = parseFloat(ingredient[nutrient]);
                            propertyName = nutrient;
                            console.log(`Found ${nutrient} value ${value} in ingredient ${ingredient.name}`);
                        }
                        // Check with underscore if it doesn't have one already
                        else if (!nutrient.includes('_')) {
                            const underscoreVersion = nutrient.replace(/([A-Z])/g, '_$1').toLowerCase();
                            if (ingredient[underscoreVersion] !== undefined && ingredient[underscoreVersion] !== null) {
                                value = parseFloat(ingredient[underscoreVersion]);
                                propertyName = underscoreVersion;
                                console.log(`Found ${underscoreVersion} value ${value} in ingredient ${ingredient.name}`);
                            }
                        }
                        // Check without underscore if it has one
                        else if (nutrient.includes('_')) {
                            const noUnderscoreVersion = nutrient.replace(/_([a-z])/g, (match, p1) => p1.toUpperCase());
                            if (ingredient[noUnderscoreVersion] !== undefined && ingredient[noUnderscoreVersion] !== null) {
                                value = parseFloat(ingredient[noUnderscoreVersion]);
                                propertyName = noUnderscoreVersion;
                                console.log(`Found ${noUnderscoreVersion} value ${value} in ingredient ${ingredient.name}`);
                            }
                        }

                        // Special case for vitamin B variants
                        if (nutrient.startsWith('vitamin_b') && value === null) {
                            // Try b1, b2, etc. format
                            const bNumber = nutrient.replace('vitamin_b', '');
                            const bFormat = 'b' + bNumber;
                            if (ingredient[bFormat] !== undefined && ingredient[bFormat] !== null) {
                                value = parseFloat(ingredient[bFormat]);
                                propertyName = bFormat;
                                console.log(`Found ${bFormat} value ${value} in ingredient ${ingredient.name}`);
                            }
                        }

                        // EMERGENCY FIX: Handle string values
                        if (value !== null && isNaN(value)) {
                            console.log(`Converting string value "${ingredient[propertyName]}" to number for ${propertyName}`);
                            value = parseFloat(ingredient[propertyName]);
                            if (isNaN(value)) {
                                console.log(`Failed to convert ${propertyName} value to number, setting to 0`);
                                value = 0;
                            }
                        }

                        if (value !== null) {
                            const scaledValue = value * scaleFactor;
                            micronutrientTotals[nutrient] += scaledValue;

                            // Log all micronutrients for debugging
                            console.log(`  Adding ${nutrient}: ${scaledValue} from ${ingredient.name} (original: ${value} from ${propertyName}, scale: ${scaleFactor})`);
                        }
                    });
                });
            }
        });

        console.log(`MANUAL CALCIUM: Total calculated: ${micronutrientTotals.calcium}`);

        // EMERGENCY FIX: Calculate amino acid values based on total protein
        // This is a temporary fix until we can properly track amino acid values
        console.log('PROTEIN DEBUG: Checking protein value:', micronutrientTotals.protein);

        // Try to find protein value in different formats
        if (!micronutrientTotals.protein || micronutrientTotals.protein === 0) {
            console.log('PROTEIN DEBUG: Protein value is missing or zero, checking for alternative keys');

            // Check for alternative keys
            const possibleProteinKeys = ['protein', 'proteins', 'total_protein'];
            for (const key of possibleProteinKeys) {
                if (micronutrientTotals[key] && micronutrientTotals[key] > 0) {
                    console.log(`PROTEIN DEBUG: Found protein value in key "${key}": ${micronutrientTotals[key]}`);
                    micronutrientTotals.protein = micronutrientTotals[key];
                    break;
                }
            }

            // If still not found, calculate from recipes
            if (!micronutrientTotals.protein || micronutrientTotals.protein === 0) {
                console.log('PROTEIN DEBUG: Still no protein value, calculating from recipes');
                let totalProtein = 0;

                fullRecipes.forEach((recipe, index) => {
                    const scaleFactor = adjustedRecipes[index].total_calories / recipe.total_calories;

                    if (recipe.ingredients) {
                        recipe.ingredients.forEach(ingredient => {
                            if (ingredient.protein && typeof ingredient.protein === 'number') {
                                const scaledProtein = ingredient.protein * scaleFactor;
                                totalProtein += scaledProtein;
                                console.log(`PROTEIN DEBUG: Adding ${scaledProtein}g protein from ${ingredient.name}`);
                            }
                        });
                    }
                });

                if (totalProtein > 0) {
                    console.log(`PROTEIN DEBUG: Calculated total protein: ${totalProtein}g`);
                    micronutrientTotals.protein = totalProtein;
                }
            }
        }

        if (micronutrientTotals.protein > 0) {
            console.log('EMERGENCY FIX: Calculating amino acid values based on total protein:', micronutrientTotals.protein);

            // Standard amino acid distribution as percentage of total protein
            // These are approximate values based on common dietary patterns
            const aminoAcidDistribution = {
                'histidine': 0.027, // 2.7% of total protein
                'isoleucine': 0.052, // 5.2% of total protein
                'leucine': 0.089, // 8.9% of total protein
                'lysine': 0.078, // 7.8% of total protein
                'methionine': 0.025, // 2.5% of total protein
                'phenylalanine': 0.047, // 4.7% of total protein
                'threonine': 0.053, // 5.3% of total protein
                'tryptophan': 0.012, // 1.2% of total protein
                'valine': 0.065, // 6.5% of total protein
                'cystine': 0.023 // 2.3% of total protein
            };

            // Calculate amino acid values based on total protein
            for (const [aminoAcid, percentage] of Object.entries(aminoAcidDistribution)) {
                const calculatedValue = micronutrientTotals.protein * percentage;

                // Only set the value if it's currently 0 or undefined
                if (!micronutrientTotals[aminoAcid] || micronutrientTotals[aminoAcid] === 0) {
                    micronutrientTotals[aminoAcid] = calculatedValue;
                    console.log(`  Setting ${aminoAcid} to ${calculatedValue.toFixed(1)}g (${percentage * 100}% of ${micronutrientTotals.protein}g protein)`);
                }
            }
        }

        // No debug logging for calcium or amino acids

        // Verify all micronutrient values are properly set
        for (const category in MICRONUTRIENT_CATEGORIES) {
            MICRONUTRIENT_CATEGORIES[category].forEach(nutrient => {
                const key = nutrient.key;
                if (micronutrientTotals[key] === undefined || micronutrientTotals[key] === null || isNaN(micronutrientTotals[key])) {
                    console.log(`WARNING: ${key} has invalid value:`, micronutrientTotals[key]);
                    micronutrientTotals[key] = 0;
                }

                // Special debug for protein category
                if (category === 'protein') {
                    console.log(`PROTEIN CATEGORY DEBUG: ${key} = ${micronutrientTotals[key]}`);
                }
            });
        }

        return micronutrientTotals;
    }

    /**
     * Calculate the percentage of daily target for each micronutrient
     * @param {Object} micronutrientTotals - Object with micronutrient totals
     * @returns {Object} - Object with micronutrient percentages
     */
    function calculateMicronutrientPercentages(micronutrientTotals) {
        const percentages = {};

        // Define amino acids for calculations
        const aminoAcids = ['histidine', 'isoleucine', 'leucine', 'lysine', 'methionine',
                           'phenylalanine', 'threonine', 'tryptophan', 'valine', 'cystine'];

        for (const key in micronutrientTotals) {
            // Make sure the total is a valid number
            const total = micronutrientTotals[key];
            if (total === undefined || total === null || isNaN(total)) {
                console.log(`WARNING: Invalid total for ${key}:`, total);
                percentages[key] = 0;
                continue;
            }

            // Special handling for amino acids
            if (aminoAcids.includes(key) && total === 0 && micronutrientTotals.protein > 0) {
                // Standard amino acid distribution as percentage of total protein
                const aminoAcidDistribution = {
                    'histidine': 0.027, // 2.7% of total protein
                    'isoleucine': 0.052, // 5.2% of total protein
                    'leucine': 0.089, // 8.9% of total protein
                    'lysine': 0.078, // 7.8% of total protein
                    'methionine': 0.025, // 2.5% of total protein
                    'phenylalanine': 0.047, // 4.7% of total protein
                    'threonine': 0.053, // 5.3% of total protein
                    'tryptophan': 0.012, // 1.2% of total protein
                    'valine': 0.065, // 6.5% of total protein
                    'cystine': 0.023 // 2.3% of total protein
                };

                if (aminoAcidDistribution[key]) {
                    const calculatedValue = micronutrientTotals.protein * aminoAcidDistribution[key];
                    micronutrientTotals[key] = calculatedValue;

                }
            }

            // Check if there's a target for this micronutrient
            if (MICRONUTRIENT_TARGETS[key]) {
                percentages[key] = (total / MICRONUTRIENT_TARGETS[key]) * 100;

                // No calcium debug logging
            } else {
                percentages[key] = null; // No target available
            }
        }

        // Ensure all micronutrients have a percentage value
        for (const category in MICRONUTRIENT_CATEGORIES) {
            MICRONUTRIENT_CATEGORIES[category].forEach(nutrient => {
                const key = nutrient.key;
                if (percentages[key] === undefined) {
                    percentages[key] = 0;
                }
            });
        }

        return percentages;
    }

    /**
     * Create HTML for the micronutrient percentage display
     * @param {Object} micronutrientTotals - Object with micronutrient totals
     * @param {Object} micronutrientPercentages - Object with micronutrient percentages
     * @returns {string} - HTML string
     */
    function createMicronutrientPercentageHTML(micronutrientTotals, micronutrientPercentages) {
        // No debug logging

        // Count how many categories have data
        let categoriesWithData = 0;
        const categoriesToShow = ['general', 'carbohydrates', 'protein'];

        // Always count all categories as having data
        categoriesWithData = Object.keys(MICRONUTRIENT_CATEGORIES).length;

        let html = `
            <div class="micronutrient-percentage-container">
                <div class="micronutrient-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin: 0;">Micronutrient Target Coverage</h3>
                    <button class="micronutrient-toggle-btn" onclick="toggleMicronutrientDisplay()"
                            style="background: #333; color: #fff; border: 1px solid #555; padding: 5px 10px; cursor: pointer; border-radius: 3px; font-size: 12px;">
                        Show
                    </button>
                </div>
                <div class="micronutrient-content" id="micronutrient-content" style="display: none;">
        `;

        // No informational or debug messages

        html += `<div class="micronutrient-percentage-grid">`;

        // Show all categories in a specific order
        const allCategories = ['general', 'carbohydrates', 'protein', 'lipids', 'vitamins', 'minerals'];

        for (const category of allCategories) {
            if (!MICRONUTRIENT_CATEGORIES[category]) {
                console.log(`Category ${category} not found in MICRONUTRIENT_CATEGORIES`);
                continue;
            }

            const categoryTable = createCategoryTable(
                category.charAt(0).toUpperCase() + category.slice(1),
                MICRONUTRIENT_CATEGORIES[category],
                micronutrientTotals,
                micronutrientPercentages,
                true // Force display of all categories
            );

            if (categoryTable.trim()) {
                html += categoryTable;
            }
        }

        html += `
                </div>
                </div>
            </div>
        `;

        return html;
    }

    /**
     * Create a table for a category of micronutrients
     * @param {string} title - Category title
     * @param {Array} nutrients - Array of nutrient objects
     * @param {Object} totals - Object with micronutrient totals
     * @param {Object} percentages - Object with micronutrient percentages
     * @param {boolean} forceDisplay - Whether to force display of this category even with minimal data
     * @returns {string} - HTML string
     */
    function createCategoryTable(title, nutrients, totals, percentages, forceDisplay = false) {
        // Track if we have any rows to display
        let hasRows = false;
        let rowsHtml = '';

        // Track which nutrients we've already displayed to avoid duplicates
        const displayedNutrients = new Set();

        // For core categories (protein, carbs, energy), ensure we display at least one row
        // even if data is minimal
        if (forceDisplay) {
            // Find the primary nutrient for this category
            let primaryNutrient = null;

            if (title === 'General') {
                primaryNutrient = nutrients.find(n => n.key === 'calories' || n.key === 'energy');
            } else if (title === 'Carbohydrates') {
                primaryNutrient = nutrients.find(n => n.key === 'carbohydrates' || n.key === 'carbs');
            } else if (title === 'Protein') {
                primaryNutrient = nutrients.find(n => n.key === 'protein');
            }

            // If we found a primary nutrient and it has data, ensure it's displayed
            if (primaryNutrient) {
                const total = totals[primaryNutrient.key];

                // If no data, create a placeholder with 0
                if (total === undefined || total === 0) {
                    // Create a placeholder row for the primary nutrient
                    const percentage = percentages[primaryNutrient.key] || 0;
                    const target = MICRONUTRIENT_TARGETS[primaryNutrient.key];

                    rowsHtml += createNutrientRow(primaryNutrient, 0, percentage, target);
                    hasRows = true;
                    displayedNutrients.add(primaryNutrient.label);
                }
            }
        }

        // Process each nutrient to generate rows
        nutrients.forEach(nutrient => {
            // Skip if we've already displayed this nutrient (for aliases like thiamine/vitamin_b1)
            if (displayedNutrients.has(nutrient.label)) {
                return;
            }

            // Special handling for protein category
            if (title === 'Protein' && nutrient.key !== 'protein') {
                // For amino acids, ensure we have a value if protein is present
                if (totals.protein > 0 && (!totals[nutrient.key] || totals[nutrient.key] === 0)) {
                    // Standard amino acid distribution as percentage of total protein
                    const aminoAcidDistribution = {
                        'histidine': 0.027, // 2.7% of total protein
                        'isoleucine': 0.052, // 5.2% of total protein
                        'leucine': 0.089, // 8.9% of total protein
                        'lysine': 0.078, // 7.8% of total protein
                        'methionine': 0.025, // 2.5% of total protein
                        'phenylalanine': 0.047, // 4.7% of total protein
                        'threonine': 0.053, // 5.3% of total protein
                        'tryptophan': 0.012, // 1.2% of total protein
                        'valine': 0.065, // 6.5% of total protein
                        'cystine': 0.023 // 2.3% of total protein
                    };

                    if (aminoAcidDistribution[nutrient.key]) {
                        totals[nutrient.key] = totals.protein * aminoAcidDistribution[nutrient.key];

                    }
                }
            }

            // Make sure we handle null, undefined, and NaN values properly
            let total = totals[nutrient.key];
            if (total === null || total === undefined || isNaN(total)) {
                total = 0;
            }

            let percentage = percentages[nutrient.key];
            if (percentage === null || percentage === undefined || isNaN(percentage)) {
                percentage = 0;
            }

            const target = MICRONUTRIENT_TARGETS[nutrient.key];

            // Mark this nutrient as displayed
            displayedNutrients.add(nutrient.label);

            // We have at least one row to display
            hasRows = true;

            // Add the nutrient row
            rowsHtml += createNutrientRow(nutrient, total, percentage, target);
        });

        // Always show the table, even if empty
        // We've removed the check for empty rows since we want to show all categories

        // Build the complete table with rows
        let html = `
            <div class="micronutrient-category">
                <h4>${title}</h4>
                <table class="micronutrient-table">
                    <thead>
                        <tr>
                            <th>Nutrient</th>
                            <th>Amount</th>
                            <th>Target</th>
                            <th>%</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>
        `;

        return html;
    }

    /**
     * Create a row for a single nutrient
     * @param {Object} nutrient - Nutrient object with key, label, and unit
     * @param {number} total - Total amount of the nutrient
     * @param {number} percentage - Percentage of daily target
     * @param {number} target - Daily target amount
     * @returns {string} - HTML string for the row
     */
    function createNutrientRow(nutrient, total, percentage, target) {
        // Ensure total and percentage are valid numbers
        if (total === null || total === undefined || isNaN(total)) {
            total = 0;
        }

        // Determine percentage class
        let percentageClass = 'na';
        if (percentage !== null && percentage !== undefined && !isNaN(percentage)) {
            if (percentage < 10) {
                percentageClass = 'low';
            } else if (percentage > 200) {
                percentageClass = 'high';
            } else if (percentage >= 90 && percentage <= 110) {
                percentageClass = 'good';
            }
        } else {
            percentage = 0;
        }

        // Calculate progress bar width and class
        let progressWidth = '0%';
        let progressClass = '';

        if (percentage !== null && percentage !== undefined && !isNaN(percentage)) {
            // Cap at 100% for display purposes to prevent overflow
            // The progress bar should never exceed the cell width
            progressWidth = Math.min(percentage, 100) + '%';

            if (percentage < 10) {
                progressClass = 'low';
            } else if (percentage > 200) {
                progressClass = 'high';
            }
        }

        // No special handling for calcium
        let debugClass = '';

        // Format the total value appropriately
        let formattedTotal = '0.00';
        try {
            formattedTotal = total.toFixed(2);
        } catch (e) {
            console.error(`Error formatting total for ${nutrient.label}:`, e);
        }

        return `
            <tr class="${debugClass}">
                <td>${nutrient.label}</td>
                <td>${formattedTotal} ${nutrient.unit}</td>
                <td>${target ? target + ' ' + nutrient.unit : 'N/A'}</td>
                <td>
                    <span class="micronutrient-percentage ${percentageClass}">
                        ${percentage !== null ? percentage.toFixed(0) + '%' : 'N/A'}
                    </span>
                    <div class="micronutrient-progress">
                        <div class="micronutrient-progress-bar ${progressClass}" style="width: ${progressWidth}"></div>
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * Toggle the micronutrient display visibility
     */
    function toggleMicronutrientDisplay() {
        const content = document.getElementById('micronutrient-content');
        const button = document.querySelector('.micronutrient-toggle-btn');

        if (content && button) {
            if (content.style.display === 'none') {
                content.style.display = 'block';
                button.textContent = 'Hide';
            } else {
                content.style.display = 'none';
                button.textContent = 'Show';
            }
        }
    }

    // Export functions to global scope
    window.MicronutrientPercentage = {
        calculateTotals: calculateMicronutrientTotals,
        calculatePercentages: calculateMicronutrientPercentages,
        createHTML: createMicronutrientPercentageHTML
    };

    // Export toggle function to global scope
    window.toggleMicronutrientDisplay = toggleMicronutrientDisplay;
})();
