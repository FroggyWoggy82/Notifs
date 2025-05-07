/**
 * Fix Edit Form Submission
 * Ensures the edit form submission works correctly
 */

(function() {
    console.log('[Fix Edit Form Submission] Initializing...');

    function fixEditFormSubmission() {

        document.body.addEventListener('click', function(event) {

            if (event.target.classList.contains('edit-ingredient-btn')) {
                console.log('[Fix Edit Form Submission] Edit button clicked');

                const row = event.target.closest('tr');
                if (!row) return;

                const container = row.closest('.ingredient-details');
                if (!container) return;

                const editForm = container.querySelector('.edit-ingredient-form');
                if (!editForm) return;

                const formElement = editForm.querySelector('form');
                if (!formElement) return;

                setTimeout(function() {
                    console.log('[Fix Edit Form Submission] Setting up form submission handler');

                    if (!formElement.id || formElement.id !== 'edit-ingredient-form') {
                        formElement.id = 'edit-ingredient-form';
                    }

                    formElement.onsubmit = null;

                    formElement.addEventListener('submit', async function(event) {
                        event.preventDefault();

                        console.log('[Fix Edit Form Submission] Form submitted');

                        try {

                            const statusElement = container.querySelector('.edit-ingredient-status');

                            if (statusElement) {
                                statusElement.textContent = 'Saving changes...';
                                statusElement.className = 'status info';
                            }

                            const ingredientId = document.getElementById('edit-ingredient-id').value;
                            const recipeId = document.getElementById('edit-recipe-id').value;
                            const name = document.getElementById('edit-ingredient-name').value.trim();
                            const amount = parseFloat(document.getElementById('edit-ingredient-amount').value);
                            const price = parseFloat(document.getElementById('edit-ingredient-price').value);

                            if (!name || isNaN(amount) || isNaN(price)) {
                                throw new Error('Please fill all required fields with valid values.');
                            }

                            const ingredientData = {
                                name: name,
                                amount: amount,
                                price: price
                            };

                            const packageAmountInput = document.getElementById('edit-ingredient-package-amount');
                            if (packageAmountInput) {
                                const packageAmount = parseFloat(packageAmountInput.value);
                                if (!isNaN(packageAmount)) {
                                    ingredientData.package_amount = packageAmount;
                                }
                            }

                            const allInputs = formElement.querySelectorAll('input[id^="edit-ingredient-"]');
                            allInputs.forEach(input => {
                                const fieldName = input.id.replace('edit-ingredient-', '');
                                if (fieldName !== 'id' && fieldName !== 'name' && fieldName !== 'amount' && fieldName !== 'price' && fieldName !== 'package-amount') {
                                    const value = parseFloat(input.value);
                                    if (!isNaN(value)) {

                                        const camelCaseField = fieldName.replace(/-([a-z])/g, function(g) { return g[1].toUpperCase(); });
                                        ingredientData[camelCaseField] = value;
                                    }
                                }
                            });

                            console.log('[Fix Edit Form Submission] Sending data:', ingredientData);

                            const response = await fetch(`/api/recipes/${recipeId}/ingredients/${ingredientId}`, {
                                method: 'PATCH',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(ingredientData)
                            });

                            if (!response.ok) {
                                const errorData = await response.json();
                                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                            }

                            const updatedRecipe = await response.json();

                            editForm.style.display = 'none';

                            if (statusElement) {
                                statusElement.textContent = 'Ingredient updated successfully!';
                                statusElement.className = 'status success';
                            }

                            setTimeout(() => {
                                window.location.reload();
                            }, 1000);

                        } catch (error) {
                            console.error('[Fix Edit Form Submission] Error updating ingredient:', error);

                            const statusElement = container.querySelector('.edit-ingredient-status');
                            if (statusElement) {
                                statusElement.textContent = `Error: ${error.message}`;
                                statusElement.className = 'status error';
                            }
                        }
                    });

                    const cancelButton = editForm.querySelector('.cancel-edit-btn');
                    if (cancelButton) {

                        const newCancelButton = cancelButton.cloneNode(true);
                        if (cancelButton.parentNode) {
                            cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);
                        }

                        newCancelButton.addEventListener('click', function(event) {

                            event.preventDefault();
                            event.stopPropagation();

                            console.log('[Fix Edit Form Submission] Cancel button clicked');

                            editForm.style.display = 'none';
                            editForm.classList.remove('show-edit-form');
                            editForm.classList.add('hide-edit-form');

                            editForm.setAttribute('data-force-hidden', 'true');

                            setTimeout(function() {
                                editForm.style.display = 'none';
                            }, 10);
                        });
                    }

                    console.log('[Fix Edit Form Submission] Form submission handler set up');
                }, 300);
            }
        });
    }

    function init() {
        console.log('[Fix Edit Form Submission] Initializing...');

        fixEditFormSubmission();

        console.log('[Fix Edit Form Submission] Initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
