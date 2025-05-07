// field-updater.js
// A utility module for directly updating ingredient fields

/**
 * Directly update a field value for an ingredient
 * @param {number} recipeId - The ID of the recipe
 * @param {number} ingredientId - The ID of the ingredient to update
 * @param {string} fieldName - The name of the field to update
 * @param {any} fieldValue - The new value for the field
 * @returns {Promise<Object>} - A promise that resolves to the update result
 */
async function updateField(recipeId, ingredientId, fieldName, fieldValue) {
    console.log(`Updating field ${fieldName} for ingredient ${ingredientId} to ${fieldValue}`);

    try {
        // Use safeFetch if available, otherwise fall back to regular fetch
        const fetchFunction = window.safeFetch || fetch;

        // Create an update object with just the field we want to update
        const updateData = {};
        updateData[fieldName] = fieldValue;

        // Use the existing ingredient update endpoint
        const response = await fetchFunction(`/api/recipes/${recipeId}/ingredients/${ingredientId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error updating ${fieldName}:`, errorText);
            return { success: false, error: errorText };
        }

        const result = await response.json();
        console.log(`${fieldName} update result:`, result);

        // Find the updated ingredient in the result
        const updatedIngredient = result.ingredients.find(ing => ing.id == ingredientId);

        return {
            success: true,
            message: `${fieldName} updated successfully`,
            ingredient: updatedIngredient,
            fieldName: fieldName,
            newValue: fieldValue
        };
    } catch (error) {
        console.error(`Error updating ${fieldName}:`, error);
        return { success: false, error: error.message };
    }
}

// Field name mapping from form IDs to database column names
const fieldMapping = {
    // Basic fields
    'edit-ingredient-name': 'name',
    'edit-ingredient-calories': 'calories',
    'edit-ingredient-amount': 'amount',
    'edit-ingredient-protein': 'protein',
    'edit-ingredient-fats': 'fats',
    'edit-ingredient-carbs': 'carbohydrates',
    'edit-ingredient-price': 'price',
    'edit-ingredient-package-amount': 'package_amount',

    // General section
    'edit-ingredient-alcohol': 'alcohol',
    'edit-ingredient-caffeine': 'caffeine',
    'edit-ingredient-water': 'water',

    // Carbohydrates section
    'edit-ingredient-fiber': 'fiber',
    'edit-ingredient-starch': 'starch',
    'edit-ingredient-sugars': 'sugars',
    'edit-ingredient-added-sugars': 'added_sugars',
    'edit-ingredient-net-carbs': 'net_carbs',

    // Lipids section
    'edit-ingredient-saturated': 'saturated',
    'edit-ingredient-monounsaturated': 'monounsaturated',
    'edit-ingredient-polyunsaturated': 'polyunsaturated',
    // CRITICAL FIX: Map to omega3 and omega6 (without underscores) to match database column names
    'edit-ingredient-omega3': 'omega3',
    'edit-ingredient-omega6': 'omega6',
    'edit-ingredient-trans-fat': 'trans_fat',
    'edit-ingredient-cholesterol': 'cholesterol',

    // Protein section
    'edit-ingredient-cystine': 'cystine',
    'edit-ingredient-histidine': 'histidine',
    'edit-ingredient-isoleucine': 'isoleucine',
    'edit-ingredient-leucine': 'leucine',
    'edit-ingredient-lysine': 'lysine',
    'edit-ingredient-methionine': 'methionine',
    'edit-ingredient-phenylalanine': 'phenylalanine',
    'edit-ingredient-threonine': 'threonine',
    'edit-ingredient-tryptophan': 'tryptophan',
    'edit-ingredient-tyrosine': 'tyrosine',
    'edit-ingredient-valine': 'valine',

    // Vitamins section
    'edit-ingredient-vitamin-b1': 'thiamine',
    'edit-ingredient-vitamin-b2': 'riboflavin',
    'edit-ingredient-vitamin-b3': 'niacin',
    'edit-ingredient-vitamin-b5': 'pantothenic_acid',
    'edit-ingredient-vitamin-b6': 'vitamin_b6',
    'edit-ingredient-vitamin-b12': 'vitamin_b12',
    'edit-ingredient-folate': 'folate',
    'edit-ingredient-vitamin-a': 'vitamin_a',
    'edit-ingredient-vitamin-c': 'vitamin_c',
    'edit-ingredient-vitamin-d': 'vitamin_d',
    'edit-ingredient-vitamin-e': 'vitamin_e',
    'edit-ingredient-vitamin-k': 'vitamin_k',

    // Minerals section
    'edit-ingredient-calcium': 'calcium',
    'edit-ingredient-copper': 'copper',
    'edit-ingredient-iron': 'iron',
    'edit-ingredient-magnesium': 'magnesium',
    'edit-ingredient-manganese': 'manganese',
    'edit-ingredient-phosphorus': 'phosphorus',
    'edit-ingredient-potassium': 'potassium',
    'edit-ingredient-selenium': 'selenium',
    'edit-ingredient-sodium': 'sodium',
    'edit-ingredient-zinc': 'zinc'
};

/**
 * Update all fields for an ingredient
 * @param {number} recipeId - The ID of the recipe
 * @param {number} ingredientId - The ID of the ingredient to update
 * @param {Object} formData - An object containing all the form data
 * @returns {Promise<Object>} - A promise that resolves to the update results
 */
async function updateAllFields(recipeId, ingredientId, formData) {
    console.log('Updating all fields for ingredient', ingredientId);
    console.log('Form data:', formData);

    // Create a single update object with all fields
    const updateData = {};

    // Process each field in the form data
    for (const [formId, value] of Object.entries(formData)) {
        // Skip empty values
        if (value === undefined || value === null || value === '') {
            continue;
        }

        // Skip fields that don't have a mapping
        const fieldName = fieldMapping[formId];
        if (!fieldName) {
            console.warn(`No field mapping found for form ID: ${formId}`);
            continue;
        }

        // Special handling for numeric fields
        // CRITICAL FIX: Use omega3 and omega6 (without underscores) to match database column names
        if (fieldName === 'omega3' || fieldName === 'omega6' ||
            fieldName === 'omega_3' || fieldName === 'omega_6' ||
            fieldName === 'trans_fat' || fieldName === 'package_amount') {

            // Map old field names to new ones
            let actualFieldName = fieldName;
            if (fieldName === 'omega_3') {
                actualFieldName = 'omega3';
                console.log('Mapping omega_3 to omega3 to match database column name');
            } else if (fieldName === 'omega_6') {
                actualFieldName = 'omega6';
                console.log('Mapping omega_6 to omega6 to match database column name');
            }

            // CRITICAL FIX: Ensure omega3 and omega6 are always properly handled
            if ((fieldName === 'omega3' || fieldName === 'omega6' ||
                 fieldName === 'omega_3' || fieldName === 'omega_6') &&
                (value === '' || value === null)) {
                // For empty omega values, set to 0
                updateData[actualFieldName] = 0;
                console.log(`Setting ${actualFieldName} to 0 (empty input)`);
            } else {
                // Convert to number
                const numValue = Number(value);
                if (!isNaN(numValue)) {
                    updateData[actualFieldName] = numValue;
                    console.log(`Converted ${actualFieldName} to number: ${numValue}`);
                } else {
                    // For omega fields, default to 0 if conversion fails
                    if (fieldName === 'omega3' || fieldName === 'omega6' ||
                        fieldName === 'omega_3' || fieldName === 'omega_6') {
                        updateData[actualFieldName] = 0;
                        console.log(`Failed to convert ${actualFieldName}, defaulting to 0`);
                    } else {
                        console.warn(`Failed to convert ${fieldName} value "${value}" to number, using original value`);
                        updateData[actualFieldName] = value;
                    }
                }
            }
        } else {
            // Add the field to the update data
            updateData[fieldName] = value;
        }
    }

    console.log('Sending combined update with data:', updateData);

    try {
        // Use safeFetch if available, otherwise fall back to regular fetch
        const fetchFunction = window.safeFetch || fetch;

        // Use the existing ingredient update endpoint with all fields at once
        const response = await fetchFunction(`/api/recipes/${recipeId}/ingredients/${ingredientId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error updating fields:`, errorText);
            return { success: false, error: errorText };
        }

        const result = await response.json();
        console.log(`Combined update result:`, result);

        // Find the updated ingredient in the result
        const updatedIngredient = result.ingredients.find(ing => ing.id == ingredientId);

        return {
            success: true,
            message: `All fields updated successfully`,
            ingredient: updatedIngredient,
            updatedFields: Object.keys(updateData)
        };
    } catch (error) {
        console.error(`Error updating fields:`, error);
        return { success: false, error: error.message };
    }
}

/**
 * Directly update omega3 and omega6 values for an ingredient using the main update endpoint
 * @param {number} recipeId - The ID of the recipe
 * @param {number} ingredientId - The ID of the ingredient to update
 * @param {number} omega3Value - The new omega3 value
 * @param {number} omega6Value - The new omega6 value
 * @returns {Promise<Object>} - A promise that resolves to the update result
 */
async function updateOmegaValues(recipeId, ingredientId, omega3Value, omega6Value) {
    console.log(`Directly updating omega values for ingredient ${ingredientId}: omega3=${omega3Value}, omega6=${omega6Value}`);

    try {
        // Use safeFetch if available, otherwise fall back to regular fetch
        const fetchFunction = window.safeFetch || fetch;

        // Create an update object with just the omega fields
        const updateData = {};

        // Only include defined values
        if (omega3Value !== undefined) {
            // Convert to number or default to 0
            if (omega3Value === null || omega3Value === '') {
                updateData.omega3 = 0;
            } else {
                const numValue = Number(omega3Value);
                updateData.omega3 = isNaN(numValue) ? 0 : numValue;
            }
        }

        if (omega6Value !== undefined) {
            // Convert to number or default to 0
            if (omega6Value === null || omega6Value === '') {
                updateData.omega6 = 0;
            } else {
                const numValue = Number(omega6Value);
                updateData.omega6 = isNaN(numValue) ? 0 : numValue;
            }
        }

        // Skip if no values to update
        if (Object.keys(updateData).length === 0) {
            console.log('No omega values to update');
            return { success: false, message: 'No omega values to update' };
        }

        console.log('Sending omega update with data:', updateData);

        // Use the main ingredient update endpoint
        const response = await fetchFunction(`/api/recipes/${recipeId}/ingredients/${ingredientId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error updating omega values:`, errorText);
            return { success: false, error: errorText };
        }

        const result = await response.json();
        console.log(`Omega values update result:`, result);

        // Find the updated ingredient in the result
        const updatedIngredient = result.ingredients.find(ing => ing.id == ingredientId);

        // Verify the update
        if (updatedIngredient) {
            console.log('Updated ingredient omega3:', updatedIngredient.omega3);
            console.log('Updated ingredient omega6:', updatedIngredient.omega6);

            // Force the values in the ingredient object
            if (omega3Value !== undefined) {
                updatedIngredient.omega3 = updateData.omega3;
            }

            if (omega6Value !== undefined) {
                updatedIngredient.omega6 = updateData.omega6;
            }
        }

        return {
            success: true,
            message: `Omega values updated successfully`,
            ingredient: updatedIngredient,
            omega3: updateData.omega3,
            omega6: updateData.omega6
        };
    } catch (error) {
        console.error(`Error updating omega values:`, error);
        return { success: false, error: error.message };
    }
}

// Export the functions
window.fieldUpdater = {
    updateField,
    updateAllFields,
    updateOmegaValues,
    fieldMapping
};
