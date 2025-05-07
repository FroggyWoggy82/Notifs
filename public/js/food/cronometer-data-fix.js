/**
 * Cronometer Data Fix
 *
 * This script fixes the issue with Cronometer parser data not being saved to the database.
 * It ensures that all micronutrient data from the Cronometer parser is properly included
 * in the ingredient data sent to the backend.
 */

(function() {

    document.addEventListener('DOMContentLoaded', function() {

        initCronometerDataFix();
    });

    /**
     * Initialize the Cronometer data fix
     */
    function initCronometerDataFix() {
        console.log('[Cronometer Data Fix] Initializing...');

        addEventListenersToCronometerParseButtons();

        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {

                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.ELEMENT_NODE) {

                            const parseButtons = node.querySelectorAll('.cronometer-parse-button');
                            if (parseButtons.length > 0) {

                                parseButtons.forEach(function(button) {
                                    addEventListenerToCronometerParseButton(button);
                                });
                            }
                        }
                    });
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        const createRecipeForm = document.getElementById('create-recipe-form');
        if (createRecipeForm) {

            createRecipeForm.addEventListener('submit', handleFormSubmit, true);
            console.log('[Cronometer Data Fix] Successfully added form submission handler');
        } else {
            console.warn('[Cronometer Data Fix] Create recipe form not found');
        }
    }

    /**
     * Add event listeners to all Cronometer parse buttons
     */
    function addEventListenersToCronometerParseButtons() {

        const parseButtons = document.querySelectorAll('.cronometer-parse-button');

        parseButtons.forEach(function(button) {
            addEventListenerToCronometerParseButton(button);
        });
    }

    /**
     * Add event listener to a Cronometer parse button
     * @param {HTMLElement} button - The parse button
     */
    function addEventListenerToCronometerParseButton(button) {

        if (button.dataset.micronutrientFixAdded) {
            return;
        }

        button.dataset.micronutrientFixAdded = 'true';

        button.addEventListener('click', function() {

            setTimeout(function() {

                const ingredientItem = button.closest('.ingredient-item');
                if (ingredientItem) {

                    ensureMicronutrientDataIsSaved(ingredientItem);
                }
            }, 500);
        });

        console.log('[Cronometer Data Fix] Added event listener to Cronometer parse button:', button);
    }

    /**
     * Handle form submission
     * @param {Event} event - The submit event
     */
    function handleFormSubmit(event) {

        console.log('[Cronometer Data Fix] Form submitted');

        const ingredientItems = document.querySelectorAll('.ingredient-item');

        ingredientItems.forEach(ingredientItem => {
            ensureMicronutrientDataIsSaved(ingredientItem);
        });
    }

    /**
     * Ensure micronutrient data is saved
     * @param {HTMLElement} ingredientItem - The ingredient item element
     */
    function ensureMicronutrientDataIsSaved(ingredientItem) {
        console.log('[Cronometer Data Fix] Ensuring micronutrient data is saved for ingredient:', ingredientItem);

        try {

            if (ingredientItem.dataset.completeNutritionData) {
                console.log('[Cronometer Data Fix] Found complete nutrition data');

                const nutritionData = JSON.parse(ingredientItem.dataset.completeNutritionData);

                let dbFormatData = {};
                if (ingredientItem.dataset.dbFormatNutritionData) {
                    dbFormatData = JSON.parse(ingredientItem.dataset.dbFormatNutritionData);
                } else if (window.NutritionFieldMapper) {
                    dbFormatData = window.NutritionFieldMapper.toDbFormat(nutritionData);

                    ingredientItem.dataset.dbFormatNutritionData = JSON.stringify(dbFormatData);
                }

                console.log('[Cronometer Data Fix] Database format data:', dbFormatData);

                updateHiddenFields(ingredientItem, dbFormatData);

                updateDetailedNutritionFields(ingredientItem, nutritionData);
            } else {
                console.log('[Cronometer Data Fix] No complete nutrition data found');
            }
        } catch (error) {
            console.error('[Cronometer Data Fix] Error ensuring micronutrient data is saved:', error);
        }
    }

    /**
     * Update hidden fields with micronutrient data
     * @param {HTMLElement} ingredientItem - The ingredient item element
     * @param {Object} dbFormatData - The database format data
     */
    function updateHiddenFields(ingredientItem, dbFormatData) {
        console.log('[Cronometer Data Fix] Updating hidden fields');

        for (const [key, value] of Object.entries(dbFormatData)) {

            if (value === null || value === undefined) continue;

            if (['name', 'calories', 'amount', 'protein', 'fats', 'carbohydrates', 'price', 'package_amount'].includes(key)) {
                continue;
            }

            let hiddenField = ingredientItem.querySelector(`.ingredient-${key}`);
            if (!hiddenField) {
                hiddenField = document.createElement('input');
                hiddenField.type = 'hidden';
                hiddenField.name = `ingredient-${key}`; // Add name attribute for form submission
                hiddenField.className = `ingredient-${key}`;
                ingredientItem.appendChild(hiddenField);
            } else if (!hiddenField.name) {

                hiddenField.name = `ingredient-${key}`;
            }

            hiddenField.value = value;

            console.log(`[Cronometer Data Fix] Updated hidden field: ${key} = ${value}`);
        }
    }

    /**
     * Update detailed nutrition fields
     * @param {HTMLElement} ingredientItem - The ingredient item element
     * @param {Object} nutritionData - The nutrition data
     */
    function updateDetailedNutritionFields(ingredientItem, nutritionData) {
        console.log('[Cronometer Data Fix] Updating detailed nutrition fields');

        const detailedNutritionPanel = ingredientItem.querySelector('.detailed-nutrition-panel');
        if (!detailedNutritionPanel) {
            console.log('[Cronometer Data Fix] No detailed nutrition panel found');
            return;
        }

        for (const [key, value] of Object.entries(nutritionData)) {

            if (value === null || value === undefined) continue;

            if (key === 'success') continue;

            const inputId = `nutrition-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;

            const inputField = detailedNutritionPanel.querySelector(`.${inputId}`);
            if (inputField) {

                inputField.value = value;
                console.log(`[Cronometer Data Fix] Updated detailed nutrition field: ${inputId} = ${value}`);
            }
        }
    }
})();
