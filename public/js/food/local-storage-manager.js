/**
 * Local Storage Manager
 * 
 * This script provides functions for storing and retrieving package amounts
 * in local storage as a fallback when the server is unavailable.
 */

(function() {

    const PACKAGE_AMOUNTS_KEY = 'recipe_ingredient_package_amounts';
    
    /**
     * Save a package amount to local storage
     * @param {number} ingredientId - The ID of the ingredient
     * @param {number} packageAmount - The package amount to save
     */
    function savePackageAmount(ingredientId, packageAmount) {
        try {

            const packageAmounts = getPackageAmounts();

            packageAmounts[ingredientId] = packageAmount;

            localStorage.setItem(PACKAGE_AMOUNTS_KEY, JSON.stringify(packageAmounts));
            
            console.log(`Saved package amount ${packageAmount} for ingredient ${ingredientId} to local storage`);
            return true;
        } catch (error) {
            console.error('Error saving package amount to local storage:', error);
            return false;
        }
    }
    
    /**
     * Get a package amount from local storage
     * @param {number} ingredientId - The ID of the ingredient
     * @returns {number|null} The package amount, or null if not found
     */
    function getPackageAmount(ingredientId) {
        try {

            const packageAmounts = getPackageAmounts();

            return packageAmounts[ingredientId] || null;
        } catch (error) {
            console.error('Error getting package amount from local storage:', error);
            return null;
        }
    }
    
    /**
     * Get all package amounts from local storage
     * @returns {Object} An object mapping ingredient IDs to package amounts
     */
    function getPackageAmounts() {
        try {

            const packageAmountsJson = localStorage.getItem(PACKAGE_AMOUNTS_KEY);

            return packageAmountsJson ? JSON.parse(packageAmountsJson) : {};
        } catch (error) {
            console.error('Error getting package amounts from local storage:', error);
            return {};
        }
    }
    
    /**
     * Clear all package amounts from local storage
     */
    function clearPackageAmounts() {
        try {
            localStorage.removeItem(PACKAGE_AMOUNTS_KEY);
            console.log('Cleared all package amounts from local storage');
            return true;
        } catch (error) {
            console.error('Error clearing package amounts from local storage:', error);
            return false;
        }
    }

    window.localStorageManager = {
        savePackageAmount,
        getPackageAmount,
        getPackageAmounts,
        clearPackageAmounts
    };
})();
