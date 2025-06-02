/**
 * Add Save and Cancel buttons to the detailed nutrition panel
 */
document.addEventListener('DOMContentLoaded', function() {

    function addNutritionEditButtons() {

        document.querySelectorAll('.detailed-nutrition-panel').forEach(panel => {

            if (panel.dataset.nutritionButtonsAdded === 'true') {
                return;
            }

            const buttonsContainer = document.createElement('div');
            buttonsContainer.className = 'nutrition-edit-buttons';

            const saveButton = document.createElement('button');
            saveButton.type = 'button';
            saveButton.className = 'save-nutrition';
            saveButton.textContent = 'Save Changes';

            const cancelButton = document.createElement('button');
            cancelButton.type = 'button';
            cancelButton.className = 'cancel-nutrition';
            cancelButton.textContent = 'Cancel';

            buttonsContainer.appendChild(saveButton);
            buttonsContainer.appendChild(cancelButton);

            // Insert buttons at the top of the panel instead of bottom
            panel.insertBefore(buttonsContainer, panel.firstChild);

            const originalValues = {};

            function storeOriginalValues() {

                panel.querySelectorAll('input').forEach(input => {

                    originalValues[input.id] = input.value;
                });
            }

            storeOriginalValues();

            saveButton.addEventListener('click', function() {
                console.log('Save Nutrition button clicked');

                const ingredientItem = panel.closest('.ingredient-item');
                if (!ingredientItem) {
                    console.error('Could not find ingredient item container');
                    return;
                }

                const nutritionData = {};
                panel.querySelectorAll('input').forEach(input => {
                    if (input.value && input.className) {

                        const fieldName = input.className.replace('nutrition-', '');
                        nutritionData[fieldName] = parseFloat(input.value);
                    }
                });

                console.log('Collected nutrition data:', nutritionData);

                if (window.NutritionFieldMapper) {
                    const dbFormatData = window.NutritionFieldMapper.toDbFormat(nutritionData);
                    console.log('DB format nutrition data:', dbFormatData);

                    ingredientItem.dataset.dbFormatNutritionData = JSON.stringify(dbFormatData);
                    console.log('Stored DB format nutrition data in dataset');

                    for (const [key, value] of Object.entries(dbFormatData)) {

                        if (value === null || value === undefined) continue;

                        let hiddenField = ingredientItem.querySelector(`.ingredient-${key}`);
                        if (!hiddenField) {
                            hiddenField = document.createElement('input');
                            hiddenField.type = 'hidden';
                            hiddenField.name = `ingredient-${key}`;
                            hiddenField.className = `ingredient-${key}`;
                            ingredientItem.appendChild(hiddenField);
                        }

                        hiddenField.value = value;
                    }

                    let micronutrientFlagField = ingredientItem.querySelector('.ingredient-has-micronutrients');
                    if (!micronutrientFlagField) {
                        micronutrientFlagField = document.createElement('input');
                        micronutrientFlagField.type = 'hidden';
                        micronutrientFlagField.name = 'ingredient-has-micronutrients';
                        micronutrientFlagField.className = 'ingredient-has-micronutrients';
                        ingredientItem.appendChild(micronutrientFlagField);
                    }
                    micronutrientFlagField.value = 'true';
                } else {
                    console.error('NutritionFieldMapper not available');
                }

                const form = panel.closest('form');
                if (form) {

                    const submitButton = form.querySelector('button[type="submit"]');
                    if (submitButton) {

                        console.log('Form and submit button found, but not submitting yet');
                    } else {

                        const event = new CustomEvent('nutrition-save', {
                            bubbles: true,
                            detail: { panel: panel }
                        });
                        panel.dispatchEvent(event);
                    }
                }

                panel.style.display = 'none';

                const toggleButton = panel.previousElementSibling?.querySelector('.toggle-detailed-nutrition');
                if (toggleButton) {
                    toggleButton.textContent = 'Show Detailed Nutrition';
                }

                const message = document.createElement('div');
                message.className = 'nutrition-save-message';
                message.textContent = 'Nutrition data saved!';
                message.style.color = '#4CAF50';
                message.style.padding = '5px';
                message.style.textAlign = 'center';
                message.style.marginTop = '5px';

                if (panel.previousElementSibling) {
                    panel.previousElementSibling.appendChild(message);

                    setTimeout(() => {
                        message.remove();
                    }, 3000);
                }
            });

            cancelButton.addEventListener('click', function() {

                panel.querySelectorAll('input').forEach(input => {
                    if (originalValues[input.id]) {
                        input.value = originalValues[input.id];
                    }
                });

                panel.style.display = 'none';

                const toggleButton = panel.previousElementSibling?.querySelector('.toggle-detailed-nutrition');
                if (toggleButton) {
                    toggleButton.textContent = 'Show Detailed Nutrition';
                }
            });

            panel.dataset.nutritionButtonsAdded = 'true';
        });
    }

    setTimeout(addNutritionEditButtons, 300);

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(addNutritionEditButtons, 100);
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('toggle-detailed-nutrition')) {

            setTimeout(addNutritionEditButtons, 200);
        }
    });

    setInterval(addNutritionEditButtons, 2000);
});
