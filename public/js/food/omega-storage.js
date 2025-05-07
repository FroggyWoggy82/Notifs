/**
 * Omega Values Storage Manager
 *
 * This module provides functions for storing and retrieving omega_3 and omega_6 values
 * in localStorage, completely bypassing the server.
 */

const OmegaStorage = (function() {

    const STORAGE_PREFIX = 'omega_values_';

    /**
     * Save omega values for an ingredient to localStorage
     * @param {number} ingredientId - The ID of the ingredient
     * @param {number|null} omega3Value - The omega_3 value to save
     * @param {number|null} omega6Value - The omega_6 value to save
     * @returns {boolean} - Whether the save was successful
     */
    function saveOmegaValues(ingredientId, omega3Value, omega6Value) {
        try {
            if (!window.localStorage) {
                console.error('localStorage not available');
                return false;
            }

            if (omega3Value === undefined && omega6Value === undefined) {
                console.log('No omega values to save');
                return false;
            }

            const storageKey = `${STORAGE_PREFIX}${ingredientId}`;

            let omega3 = null;
            if (omega3Value !== undefined) {
                if (omega3Value === null || omega3Value === '') {
                    omega3 = 0;
                } else {
                    const numValue = Number(omega3Value);
                    omega3 = isNaN(numValue) ? 0 : numValue;
                }
            }

            let omega6 = null;
            if (omega6Value !== undefined) {
                if (omega6Value === null || omega6Value === '') {
                    omega6 = 0;
                } else {
                    const numValue = Number(omega6Value);
                    omega6 = isNaN(numValue) ? 0 : numValue;
                }
            }


            const storageData = {
                omega3: omega3,
                omega6: omega6,
                timestamp: Date.now()
            };

            window.localStorage.setItem(storageKey, JSON.stringify(storageData));
            console.log(`Saved omega values to localStorage for ingredient ${ingredientId}:`, storageData);

            return true;
        } catch (error) {
            console.error('Error saving omega values to localStorage:', error);
            return false;
        }
    }

    /**
     * Load omega values for an ingredient from localStorage
     * @param {number} ingredientId - The ID of the ingredient
     * @returns {Object|null} - The omega values or null if not found
     */
    function loadOmegaValues(ingredientId) {
        try {
            if (!window.localStorage) {
                console.error('localStorage not available');
                return null;
            }

            const storageKey = `${STORAGE_PREFIX}${ingredientId}`;
            const storedData = window.localStorage.getItem(storageKey);

            if (!storedData) {
                return null;
            }

            const parsedData = JSON.parse(storedData);
            console.log(`Loaded omega values from localStorage for ingredient ${ingredientId}:`, parsedData);

            return parsedData;
        } catch (error) {
            console.error('Error loading omega values from localStorage:', error);
            return null;
        }
    }

    /**
     * Apply stored omega values to an ingredient object
     * @param {Object} ingredient - The ingredient object to update
     * @returns {Object} - The updated ingredient object
     */
    function applyOmegaValues(ingredient) {
        if (!ingredient || !ingredient.id) {
            return ingredient;
        }

        const storedValues = loadOmegaValues(ingredient.id);
        if (!storedValues) {
            return ingredient;
        }

        const updatedIngredient = { ...ingredient };

        if (storedValues.omega3 !== null && storedValues.omega3 !== undefined) {
            console.log(`Applying omega3 value from localStorage: ${storedValues.omega3} (was ${ingredient.omega3})`);
            updatedIngredient.omega3 = storedValues.omega3;
        }

        if (storedValues.omega6 !== null && storedValues.omega6 !== undefined) {
            console.log(`Applying omega6 value from localStorage: ${storedValues.omega6} (was ${ingredient.omega6})`);
            updatedIngredient.omega6 = storedValues.omega6;
        }

        return updatedIngredient;
    }

    /**
     * Apply stored omega values to an array of ingredients
     * @param {Array} ingredients - The array of ingredient objects to update
     * @returns {Array} - The updated array of ingredient objects
     */
    function applyOmegaValuesToAll(ingredients) {
        if (!ingredients || !Array.isArray(ingredients)) {
            return ingredients;
        }

        return ingredients.map(ingredient => applyOmegaValues(ingredient));
    }

    /**
     * Clear all stored omega values
     * @returns {boolean} - Whether the clear was successful
     */
    function clearAllOmegaValues() {
        try {
            if (!window.localStorage) {
                console.error('localStorage not available');
                return false;
            }

            const keys = [];
            for (let i = 0; i < window.localStorage.length; i++) {
                const key = window.localStorage.key(i);
                if (key && key.startsWith(STORAGE_PREFIX)) {
                    keys.push(key);
                }
            }

            keys.forEach(key => window.localStorage.removeItem(key));
            console.log(`Cleared ${keys.length} omega values from localStorage`);

            return true;
        } catch (error) {
            console.error('Error clearing omega values from localStorage:', error);
            return false;
        }
    }

    return {
        saveOmegaValues,
        loadOmegaValues,
        applyOmegaValues,
        applyOmegaValuesToAll,
        clearAllOmegaValues
    };
})();

window.OmegaStorage = OmegaStorage;
