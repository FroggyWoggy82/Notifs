/**
 * Nutrition Core
 * 
 * This module provides core functionality for handling nutrition data across the application.
 * It consolidates duplicate code from multiple files into a single, reusable module.
 * 
 * Features:
 * - Field mapping between UI and database formats
 * - Cronometer text parsing
 * - Micronutrient data handling
 * - Form submission handling for nutrition data
 * - Hidden field management
 */

window.NutritionCore = (function() {
    // ===== FIELD MAPPINGS =====
    
    /**
     * Map of JavaScript property names to database column names
     */
    const fieldMappings = {
        // Basic fields
        name: 'name',
        calories: 'calories',
        amount: 'amount',
        protein: 'protein',
        fats: 'fats',
        carbs: 'carbohydrates',
        carbohydrates: 'carbohydrates', // Alias
        price: 'price',
        package_amount: 'package_amount',

        // General
        alcohol: 'alcohol',
        caffeine: 'caffeine',
        water: 'water',

        // Carbohydrates breakdown
        fiber: 'fiber',
        starch: 'starch',
        sugars: 'sugars',
        addedSugars: 'added_sugars',
        added_sugars: 'added_sugars', // Alias
        netCarbs: 'net_carbs',
        net_carbs: 'net_carbs', // Alias

        // Lipids
        fat: 'fats', // Alias for fats
        saturated: 'saturated',
        monounsaturated: 'monounsaturated',
        polyunsaturated: 'polyunsaturated',
        omega3: 'omega3',
        omega_3: 'omega3', // Alias for omega3
        omega6: 'omega6',
        omega_6: 'omega6', // Alias for omega6
        transFat: 'trans',
        trans_fat: 'trans', // Alias for trans
        cholesterol: 'cholesterol',

        // Vitamins
        vitaminA: 'vitamin_a',
        vitamin_a: 'vitamin_a', // Alias
        vitaminB1: 'vitamin_b1',
        thiamine: 'vitamin_b1', // Map thiamine to vitamin_b1
        vitaminB2: 'vitamin_b2',
        riboflavin: 'vitamin_b2', // Map riboflavin to vitamin_b2
        vitaminB3: 'vitamin_b3',
        niacin: 'vitamin_b3', // Map niacin to vitamin_b3
        vitaminB5: 'vitamin_b5',
        pantothenic_acid: 'vitamin_b5', // Map pantothenic_acid to vitamin_b5
        vitaminB6: 'vitamin_b6',
        vitamin_b6: 'vitamin_b6', // Alias
        vitaminB12: 'vitamin_b12',
        vitamin_b12: 'vitamin_b12', // Alias
        vitaminC: 'vitamin_c',
        vitamin_c: 'vitamin_c', // Alias
        vitaminD: 'vitamin_d',
        vitamin_d: 'vitamin_d', // Alias
        vitaminE: 'vitamin_e',
        vitamin_e: 'vitamin_e', // Alias
        vitaminK: 'vitamin_k',
        vitamin_k: 'vitamin_k', // Alias
        folate: 'folate',
        biotin: 'biotin',

        // Minerals
        calcium: 'calcium',
        copper: 'copper',
        iron: 'iron',
        magnesium: 'magnesium',
        manganese: 'manganese',
        phosphorus: 'phosphorus',
        potassium: 'potassium',
        selenium: 'selenium',
        sodium: 'sodium',
        zinc: 'zinc',

        // Amino acids
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
        cystine: 'cystine'
    };

    /**
     * Basic fields that are handled separately from micronutrients
     */
    const basicFields = ['name', 'calories', 'amount', 'protein', 'fats', 'carbohydrates', 'price', 'package_amount'];

    // ===== DATA CONVERSION =====

    /**
     * Convert a JavaScript object with nutrition data to a format suitable for the database
     * @param {Object} data - Nutrition data object
     * @returns {Object} - Object with database column names as keys
     */
    function toDbFormat(data) {
        
        const result = {};

        for (const [key, value] of Object.entries(data)) {
            if (value === null || value === undefined) {
                continue;
            }

            const columnName = fieldMappings[key];
            if (!columnName) {
                continue;
            }

            if (result[columnName] !== undefined) {
                continue;
            }

            let finalValue = value;
            if (typeof finalValue === 'string' && !isNaN(parseFloat(finalValue))) {
                finalValue = parseFloat(finalValue);
            }

            result[columnName] = finalValue;
        }

        return result;
    }

    /**
     * Convert a database object to a JavaScript object with nutrition data
     * @param {Object} dbData - Object with database column names as keys
     * @returns {Object} - Nutrition data object
     */
    function fromDbFormat(dbData) {
        const result = {};
        const reverseMapping = {};
        
        for (const [jsKey, dbKey] of Object.entries(fieldMappings)) {
            if (!reverseMapping[dbKey] || jsKey.length < reverseMapping[dbKey].length) {
                reverseMapping[dbKey] = jsKey;
            }
        }

        for (const [dbKey, value] of Object.entries(dbData)) {
            if (value === null || value === undefined) continue;
            const jsKey = reverseMapping[dbKey];
            if (!jsKey) continue;
            result[jsKey] = value;
        }

        return result;
    }

    // ===== FORM HANDLING =====

    /**
     * Update hidden fields with micronutrient data
     * @param {HTMLElement} ingredientItem - The ingredient item element
     * @param {Object} dbFormatData - The database format data
     */
    function updateHiddenFields(ingredientItem, dbFormatData) {
        for (const [key, value] of Object.entries(dbFormatData)) {
            if (value === null || value === undefined) continue;
            if (basicFields.includes(key)) continue;

            let hiddenField = ingredientItem.querySelector(`.ingredient-${key}`);
            if (!hiddenField) {
                hiddenField = document.createElement('input');
                hiddenField.type = 'hidden';
                hiddenField.name = `ingredient-${key}`;
                hiddenField.className = `ingredient-${key}`;
                ingredientItem.appendChild(hiddenField);
            } else if (!hiddenField.name) {
                hiddenField.name = `ingredient-${key}`;
            }

            hiddenField.value = value;
        }

        // Add a flag to indicate that this ingredient has micronutrient data
        let micronutrientFlagField = ingredientItem.querySelector('.ingredient-has-micronutrients');
        if (!micronutrientFlagField) {
            micronutrientFlagField = document.createElement('input');
            micronutrientFlagField.type = 'hidden';
            micronutrientFlagField.name = 'ingredient-has-micronutrients';
            micronutrientFlagField.className = 'ingredient-has-micronutrients';
            ingredientItem.appendChild(micronutrientFlagField);
        }
        micronutrientFlagField.value = 'true';
    }

    /**
     * Update detailed nutrition fields in the UI
     * @param {HTMLElement} ingredientItem - The ingredient item element
     * @param {Object} nutritionData - The nutrition data
     */
    function updateDetailedNutritionFields(ingredientItem, nutritionData) {
        console.log('[NutritionCore] updateDetailedNutritionFields called with:', nutritionData);

        // Check if we're in an edit form context (inline or popup)
        const isEditForm = ingredientItem.querySelector('#edit-ingredient-form') !== null ||
                          ingredientItem.querySelector('[id*="edit-ingredient"]') !== null ||
                          ingredientItem.closest('.edit-ingredient-form') !== null ||
                          document.querySelector('[id*="edit-popup"]') !== null; // Check for popup edit form

        console.log('[NutritionCore] Is edit form:', isEditForm);

        if (isEditForm) {
            // Handle edit form fields
            updateEditFormFields(ingredientItem, nutritionData);
        } else {
            // Handle regular detailed nutrition panel
            const detailedNutritionPanel = ingredientItem.querySelector('.detailed-nutrition-panel');
            if (!detailedNutritionPanel) {
                console.log('[NutritionCore] No detailed nutrition panel found, trying edit form fallback');
                updateEditFormFields(ingredientItem, nutritionData);
                return;
            }

            for (const [key, value] of Object.entries(nutritionData)) {
                if (value === null || value === undefined) continue;
                if (key === 'success') continue;

                const inputId = `nutrition-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
                const inputField = detailedNutritionPanel.querySelector(`.${inputId}`);
                if (inputField) {
                    inputField.value = value;
                    console.log(`[NutritionCore] Updated ${inputId} with value ${value}`);
                }
            }
        }
    }

    /**
     * Update micronutrient fields in edit forms
     * @param {HTMLElement} ingredientItem - The ingredient item element
     * @param {Object} nutritionData - The nutrition data
     */
    function updateEditFormFields(ingredientItem, nutritionData) {
        console.log('[NutritionCore] updateEditFormFields called');

        // Define field mappings for both inline edit forms and popup edit forms
        const editFieldMappings = {
            // Basic fields
            calories: ['edit-ingredient-calories', 'edit-popup-ingredient-calories'],
            protein: ['edit-ingredient-protein', 'edit-popup-ingredient-protein'],
            fat: ['edit-ingredient-fats', 'edit-popup-ingredient-fats'],
            fats: ['edit-ingredient-fats', 'edit-popup-ingredient-fats'],
            carbs: ['edit-ingredient-carbs', 'edit-popup-ingredient-carbs'],
            carbohydrates: ['edit-ingredient-carbs', 'edit-popup-ingredient-carbs'],

            // Carbohydrates
            fiber: ['edit-ingredient-fiber', 'edit-popup-fiber'],
            sugars: ['edit-ingredient-sugars', 'edit-popup-sugars'],
            starch: ['edit-ingredient-starch', 'edit-popup-starch'],
            addedSugars: ['edit-ingredient-added-sugars', 'edit-popup-added-sugars'],
            netCarbs: ['edit-ingredient-net-carbs', 'edit-popup-net-carbs'],

            // Lipids
            saturated: ['edit-ingredient-saturated', 'edit-popup-saturated'],
            saturatedFat: ['edit-ingredient-saturated', 'edit-popup-saturated'],
            monounsaturated: ['edit-ingredient-monounsaturated', 'edit-popup-monounsaturated'],
            monounsaturatedFat: ['edit-ingredient-monounsaturated', 'edit-popup-monounsaturated'],
            polyunsaturated: ['edit-ingredient-polyunsaturated', 'edit-popup-polyunsaturated'],
            polyunsaturatedFat: ['edit-ingredient-polyunsaturated', 'edit-popup-polyunsaturated'],
            omega3: ['edit-ingredient-omega3', 'edit-popup-omega3'],
            omega6: ['edit-ingredient-omega6', 'edit-popup-omega6'],
            transFat: ['edit-ingredient-trans-fat', 'edit-popup-trans-fat'],
            cholesterol: ['edit-ingredient-cholesterol', 'edit-popup-cholesterol'],

            // Minerals
            calcium: ['edit-ingredient-calcium', 'edit-popup-calcium'],
            iron: ['edit-ingredient-iron', 'edit-popup-iron'],
            magnesium: ['edit-ingredient-magnesium', 'edit-popup-magnesium'],
            phosphorus: ['edit-ingredient-phosphorus', 'edit-popup-phosphorus'],
            potassium: ['edit-ingredient-potassium', 'edit-popup-potassium'],
            sodium: ['edit-ingredient-sodium', 'edit-popup-sodium'],
            zinc: ['edit-ingredient-zinc', 'edit-popup-zinc'],
            copper: ['edit-ingredient-copper', 'edit-popup-copper'],
            manganese: ['edit-ingredient-manganese', 'edit-popup-manganese'],
            selenium: ['edit-ingredient-selenium', 'edit-popup-selenium'],

            // Vitamins
            vitaminA: ['edit-ingredient-vitamin-a', 'edit-popup-vitamin-a'],
            vitaminC: ['edit-ingredient-vitamin-c', 'edit-popup-vitamin-c'],
            vitaminD: ['edit-ingredient-vitamin-d', 'edit-popup-vitamin-d'],
            vitaminE: ['edit-ingredient-vitamin-e', 'edit-popup-vitamin-e'],
            vitaminK: ['edit-ingredient-vitamin-k', 'edit-popup-vitamin-k'],
            thiamine: ['edit-ingredient-thiamine', 'edit-popup-thiamine'],
            riboflavin: ['edit-ingredient-riboflavin', 'edit-popup-riboflavin'],
            niacin: ['edit-ingredient-niacin', 'edit-popup-niacin'],
            pantothenicAcid: ['edit-ingredient-pantothenic-acid', 'edit-popup-pantothenic-acid'],
            vitaminB6: ['edit-ingredient-vitamin-b6', 'edit-popup-vitamin-b6'],
            vitaminB12: ['edit-ingredient-vitamin-b12', 'edit-popup-vitamin-b12'],
            folate: ['edit-ingredient-folate', 'edit-popup-folate'],

            // Amino acids
            histidine: ['edit-ingredient-histidine', 'edit-popup-histidine'],
            isoleucine: ['edit-ingredient-isoleucine', 'edit-popup-isoleucine'],
            leucine: ['edit-ingredient-leucine', 'edit-popup-leucine'],
            lysine: ['edit-ingredient-lysine', 'edit-popup-lysine'],
            methionine: ['edit-ingredient-methionine', 'edit-popup-methionine'],
            phenylalanine: ['edit-ingredient-phenylalanine', 'edit-popup-phenylalanine'],
            threonine: ['edit-ingredient-threonine', 'edit-popup-threonine'],
            tryptophan: ['edit-ingredient-tryptophan', 'edit-popup-tryptophan'],
            tyrosine: ['edit-ingredient-tyrosine', 'edit-popup-tyrosine'],
            valine: ['edit-ingredient-valine', 'edit-popup-valine'],
            cystine: ['edit-ingredient-cystine', 'edit-popup-cystine'],

            // General
            alcohol: ['edit-ingredient-alcohol', 'edit-popup-alcohol'],
            caffeine: ['edit-ingredient-caffeine', 'edit-popup-caffeine'],
            water: ['edit-ingredient-water', 'edit-popup-water']
        };

        let fieldsUpdated = 0;

        for (const [key, value] of Object.entries(nutritionData)) {
            if (value === null || value === undefined) continue;
            if (key === 'success') continue;

            let fieldUpdated = false;

            // Try to find the field using the mapping
            const fieldIds = editFieldMappings[key];
            if (fieldIds) {
                for (const fieldId of fieldIds) {
                    const field = document.getElementById(fieldId);
                    if (field) {
                        field.value = value;
                        field.classList.add('cronometer-updated');
                        fieldsUpdated++;
                        fieldUpdated = true;
                        console.log(`[NutritionCore] Updated edit field ${fieldId} with value ${value}`);
                        break; // Only update the first matching field
                    }
                }
            }

            // If no field was found in mappings, try alternative field names
            if (!fieldUpdated) {
                const alternativeIds = [
                    `edit-ingredient-${key.toLowerCase()}`,
                    `edit-ingredient-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`,
                    `edit-ingredient-${key.replace(/_/g, '-')}`,
                    `edit-popup-${key.toLowerCase()}`,
                    `edit-popup-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`,
                    `edit-popup-${key.replace(/_/g, '-')}`
                ];

                for (const altId of alternativeIds) {
                    const field = document.getElementById(altId);
                    if (field) {
                        field.value = value;
                        field.classList.add('cronometer-updated');
                        fieldsUpdated++;
                        fieldUpdated = true;
                        console.log(`[NutritionCore] Updated edit field ${altId} with value ${value} (alternative)`);
                        break;
                    }
                }
            }

            // Log if no field was found for this key
            if (!fieldUpdated) {
                console.log(`[NutritionCore] No field found for key: ${key} with value: ${value}`);
            }
        }

        console.log(`[NutritionCore] Updated ${fieldsUpdated} edit form fields`);
    }

    /**
     * Update a field if it exists and the value is not null
     * @param {HTMLElement} container - Container element
     * @param {string} selector - CSS selector for the field
     * @param {number|null} value - Value to set
     * @returns {boolean} - Whether the field was updated
     */
    function updateFieldIfExists(container, selector, value) {
        if (value === null || value === undefined) return false;

        const field = container.querySelector(selector);
        if (field) {
            field.value = value;
            field.classList.add('nutrition-core-updated');
            return true;
        }
        return false;
    }

    /**
     * Ensure micronutrient data is saved for an ingredient
     * @param {HTMLElement} ingredientItem - The ingredient item element
     */
    function ensureMicronutrientDataIsSaved(ingredientItem) {
        try {
            if (ingredientItem.dataset.completeNutritionData) {
                const nutritionData = JSON.parse(ingredientItem.dataset.completeNutritionData);
                
                let dbFormatData = {};
                if (ingredientItem.dataset.dbFormatNutritionData) {
                    dbFormatData = JSON.parse(ingredientItem.dataset.dbFormatNutritionData);
                } else {
                    dbFormatData = toDbFormat(nutritionData);
                    ingredientItem.dataset.dbFormatNutritionData = JSON.stringify(dbFormatData);
                }
                
                updateHiddenFields(ingredientItem, dbFormatData);
                updateDetailedNutritionFields(ingredientItem, nutritionData);
            }
        } catch (error) {
            console.error('[NutritionCore] Error ensuring micronutrient data is saved:', error);
        }
    }

    /**
     * Process form submission to ensure nutrition data is included
     * @param {Event} event - The submit event
     */
    function handleFormSubmission(event) {
        const form = event.target;
        const ingredientItems = form.querySelectorAll('.ingredient-item');
        
        ingredientItems.forEach(item => {
            ensureMicronutrientDataIsSaved(item);
            
            // Format package amount
            const packageAmountInput = item.querySelector('.ingredient-package-amount');
            if (packageAmountInput) {
                const packageAmount = packageAmountInput.value.trim();
                if (packageAmount) {
                    const parsedAmount = parseFloat(packageAmount);
                    if (!isNaN(parsedAmount)) {
                        packageAmountInput.value = parsedAmount;
                    }
                }
            }
        });
    }

    // ===== PUBLIC API =====

    return {
        // Field mapping
        toDbFormat,
        fromDbFormat,
        getFieldMappings: () => ({ ...fieldMappings }),

        // Form handling
        updateHiddenFields,
        updateDetailedNutritionFields,
        updateEditFormFields,
        updateFieldIfExists,
        ensureMicronutrientDataIsSaved,
        handleFormSubmission,

        // Constants
        basicFields: [...basicFields]
    };
})();

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    
    
    // Add form submission handlers
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        if (!form.dataset.nutritionCoreInitialized) {
            form.dataset.nutritionCoreInitialized = 'true';
            form.addEventListener('submit', window.NutritionCore.handleFormSubmission, true);
        }
    });
    
    
});
