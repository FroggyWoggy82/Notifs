/**
 * Nutrition Field Mapper
 *
 * This module provides mapping between Cronometer parser field names and database column names,
 * as well as utility functions for handling nutrition data.
 */

window.NutritionFieldMapper = (function() {

    const fieldMappings = {

        name: 'name',
        calories: 'calories',
        amount: 'amount',
        protein: 'protein',
        fats: 'fats',
        carbs: 'carbohydrates',
        carbohydrates: 'carbohydrates', // Alias
        price: 'price',
        package_amount: 'package_amount',

        alcohol: 'alcohol',
        caffeine: 'caffeine',
        water: 'water',

        fiber: 'fiber',
        starch: 'starch',
        sugars: 'sugars',
        addedSugars: 'added_sugars',
        added_sugars: 'added_sugars', // Alias
        netCarbs: 'net_carbs',
        net_carbs: 'net_carbs', // Alias

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
     * Convert a JavaScript object with nutrition data to a format suitable for the database
     * @param {Object} data - Nutrition data object
     * @returns {Object} - Object with database column names as keys
     */
    function toDbFormat(data) {
        console.log('[NutritionFieldMapper] Converting to DB format:', data);
        const result = {};

        for (const [key, value] of Object.entries(data)) {

            if (value === null || value === undefined) {
                console.log(`[NutritionFieldMapper] Skipping null/undefined value for key: ${key}`);
                continue;
            }

            const columnName = fieldMappings[key];

            if (!columnName) {
                console.log(`[NutritionFieldMapper] No mapping found for key: ${key}`);
                continue;
            }

            if (result[columnName] !== undefined) {
                console.log(`[NutritionFieldMapper] Skipping duplicate field: ${key} -> ${columnName}`);
                continue;
            }

            let finalValue = value;
            if (typeof finalValue === 'string' && !isNaN(parseFloat(finalValue))) {
                finalValue = parseFloat(finalValue);
                console.log(`[NutritionFieldMapper] Converted string to number: ${key} = ${value} -> ${finalValue}`);
            }

            result[columnName] = finalValue;
            console.log(`[NutritionFieldMapper] Mapped field: ${key} -> ${columnName} = ${finalValue}`);
        }

        console.log('[NutritionFieldMapper] Final DB format:', result);
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

    /**
     * Get all field mappings
     * @returns {Object} - Field mappings object
     */
    function getFieldMappings() {
        return { ...fieldMappings };
    }

    return {
        toDbFormat,
        fromDbFormat,
        getFieldMappings
    };
})();
