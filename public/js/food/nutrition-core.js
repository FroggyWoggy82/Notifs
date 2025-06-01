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
        const detailedNutritionPanel = ingredientItem.querySelector('.detailed-nutrition-panel');
        if (!detailedNutritionPanel) return;

        for (const [key, value] of Object.entries(nutritionData)) {
            if (value === null || value === undefined) continue;
            if (key === 'success') continue;

            const inputId = `nutrition-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            const inputField = detailedNutritionPanel.querySelector(`.${inputId}`);
            if (inputField) {
                inputField.value = value;
            }
        }
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
