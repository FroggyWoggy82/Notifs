/**
 * Fix Form Submission
 * 
 * This script fixes issues with form submission in the food page.
 * It ensures that package amount and micronutrient data are properly included in the form submission.
 */

(function() {

    document.addEventListener('DOMContentLoaded', function() {

        initFormSubmissionFix();
    });

    /**
     * Initialize the form submission fix
     */
    function initFormSubmissionFix() {
        console.log('[Form Submission Fix] Initializing...');

        const createRecipeForm = document.getElementById('create-recipe-form');
        if (!createRecipeForm) {
            console.error('[Form Submission Fix] Create recipe form not found');
            return;
        }

        createRecipeForm.addEventListener('submit', function(event) {

            console.log('[Form Submission Fix] Form submitted');

            const ingredientItems = document.querySelectorAll('.ingredient-item');
            console.log(`[Form Submission Fix] Found ${ingredientItems.length} ingredient items`);

            ingredientItems.forEach((item, index) => {
                console.log(`[Form Submission Fix] Processing ingredient item ${index + 1}`);

                const packageAmountInput = item.querySelector('.ingredient-package-amount');
                if (packageAmountInput) {

                    const packageAmount = packageAmountInput.value.trim();
                    if (packageAmount) {

                        const parsedAmount = parseFloat(packageAmount);
                        if (!isNaN(parsedAmount)) {

                            packageAmountInput.value = parsedAmount;
                            console.log(`[Form Submission Fix] Updated package amount: ${parsedAmount}`);
                        }
                    }
                }

                if (item.dataset.completeNutritionData) {
                    console.log(`[Form Submission Fix] Ingredient item ${index + 1} has complete nutrition data`);
                    
                    try {

                        const nutritionData = JSON.parse(item.dataset.completeNutritionData);

                        let dbFormatData = {};
                        if (item.dataset.dbFormatNutritionData) {
                            dbFormatData = JSON.parse(item.dataset.dbFormatNutritionData);
                        } else if (window.NutritionFieldMapper) {
                            dbFormatData = window.NutritionFieldMapper.toDbFormat(nutritionData);

                            item.dataset.dbFormatNutritionData = JSON.stringify(dbFormatData);
                        }

                        for (const [key, value] of Object.entries(dbFormatData)) {

                            if (value === null || value === undefined) continue;

                            if (['name', 'calories', 'amount', 'protein', 'fats', 'carbohydrates', 'price', 'package_amount'].includes(key)) {
                                continue;
                            }

                            let hiddenField = item.querySelector(`.ingredient-${key}`);
                            if (!hiddenField) {
                                hiddenField = document.createElement('input');
                                hiddenField.type = 'hidden';
                                hiddenField.name = `ingredient-${key}`;
                                hiddenField.className = `ingredient-${key}`;
                                item.appendChild(hiddenField);
                            }

                            hiddenField.value = value;
                            console.log(`[Form Submission Fix] Added micronutrient data: ${key} = ${value}`);
                        }
                    } catch (error) {
                        console.error(`[Form Submission Fix] Error processing micronutrient data:`, error);
                    }
                }
            });
        }, true); // Use capture phase to run before other handlers

        console.log('[Form Submission Fix] Initialized');
    }
})();
