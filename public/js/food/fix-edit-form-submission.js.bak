/**
 * Fix Edit Form Submission
 * Ensures the edit form submission works correctly
 */

(function() {
    console.log('[Fix Edit Form Submission] Initializing...');

    // Function to fix the edit form submission
    function fixEditFormSubmission() {
        // Use event delegation to handle edit button clicks
        document.body.addEventListener('click', function(event) {
            // Check if the click was on an edit button
            if (event.target.classList.contains('edit-ingredient-btn')) {
                console.log('[Fix Edit Form Submission] Edit button clicked');

                // Get the row and container
                const row = event.target.closest('tr');
                if (!row) return;

                const container = row.closest('.ingredient-details');
                if (!container) return;

                // Find the edit form
                const editForm = container.querySelector('.edit-ingredient-form');
                if (!editForm) return;

                // Find the form element
                const formElement = editForm.querySelector('form');
                if (!formElement) return;

                // Wait for the form to be fully displayed
                setTimeout(function() {
                    console.log('[Fix Edit Form Submission] Setting up form submission handler');

                    // Make sure the form has the correct ID
                    if (!formElement.id || formElement.id !== 'edit-ingredient-form') {
                        formElement.id = 'edit-ingredient-form';
                    }

                    // Remove any existing submit handlers
                    formElement.onsubmit = null;

                    // Add our submit handler
                    formElement.addEventListener('submit', async function(event) {
                        event.preventDefault();

                        console.log('[Fix Edit Form Submission] Form submitted');

                        try {
                            // Get the status element
                            const statusElement = container.querySelector('.edit-ingredient-status');

                            // Show loading status
                            if (statusElement) {
                                statusElement.textContent = 'Saving changes...';
                                statusElement.className = 'status info';
                            }

                            // Get basic form values
                            const ingredientId = document.getElementById('edit-ingredient-id').value;
                            const recipeId = document.getElementById('edit-recipe-id').value;
                            const name = document.getElementById('edit-ingredient-name').value.trim();
                            const amount = parseFloat(document.getElementById('edit-ingredient-amount').value);
                            const price = parseFloat(document.getElementById('edit-ingredient-price').value);

                            // Validate required fields
                            if (!name || isNaN(amount) || isNaN(price)) {
                                throw new Error('Please fill all required fields with valid values.');
                            }

                            // Create the ingredient data object
                            const ingredientData = {
                                name: name,
                                amount: amount,
                                price: price
                            };

                            // Add package amount if it exists
                            const packageAmountInput = document.getElementById('edit-ingredient-package-amount');
                            if (packageAmountInput) {
                                const packageAmount = parseFloat(packageAmountInput.value);
                                if (!isNaN(packageAmount)) {
                                    ingredientData.package_amount = packageAmount;
                                }
                            }

                            // Get all other input fields and add them to the data object
                            const allInputs = formElement.querySelectorAll('input[id^="edit-ingredient-"]');
                            allInputs.forEach(input => {
                                const fieldName = input.id.replace('edit-ingredient-', '');
                                if (fieldName !== 'id' && fieldName !== 'name' && fieldName !== 'amount' && fieldName !== 'price' && fieldName !== 'package-amount') {
                                    const value = parseFloat(input.value);
                                    if (!isNaN(value)) {
                                        // Convert hyphenated names to camelCase
                                        const camelCaseField = fieldName.replace(/-([a-z])/g, function(g) { return g[1].toUpperCase(); });
                                        ingredientData[camelCaseField] = value;
                                    }
                                }
                            });

                            console.log('[Fix Edit Form Submission] Sending data:', ingredientData);

                            // Call the API to update the ingredient
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

                            // Hide the edit form
                            editForm.style.display = 'none';

                            // Show success message
                            if (statusElement) {
                                statusElement.textContent = 'Ingredient updated successfully!';
                                statusElement.className = 'status success';
                            }

                            // Reload the page to show updated data
                            setTimeout(() => {
                                window.location.reload();
                            }, 1000);

                        } catch (error) {
                            console.error('[Fix Edit Form Submission] Error updating ingredient:', error);

                            // Show error message
                            const statusElement = container.querySelector('.edit-ingredient-status');
                            if (statusElement) {
                                statusElement.textContent = `Error: ${error.message}`;
                                statusElement.className = 'status error';
                            }
                        }
                    });

                    // Add our own cancel button handler
                    const cancelButton = editForm.querySelector('.cancel-edit-btn');
                    if (cancelButton) {
                        // Remove any existing event listeners by cloning the button
                        const newCancelButton = cancelButton.cloneNode(true);
                        if (cancelButton.parentNode) {
                            cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);
                        }

                        // Add a new event listener with event prevention
                        newCancelButton.addEventListener('click', function(event) {
                            // Prevent default behavior and stop propagation
                            event.preventDefault();
                            event.stopPropagation();

                            console.log('[Fix Edit Form Submission] Cancel button clicked');

                            // Use a more aggressive approach to hide the form
                            editForm.style.display = 'none';
                            editForm.classList.remove('show-edit-form');
                            editForm.classList.add('hide-edit-form');

                            // Add a data attribute to force it to stay hidden
                            editForm.setAttribute('data-force-hidden', 'true');

                            // Also use a timeout to ensure it stays hidden
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

    // Initialize when the DOM is ready
    function init() {
        console.log('[Fix Edit Form Submission] Initializing...');

        // Fix the edit form submission
        fixEditFormSubmission();

        console.log('[Fix Edit Form Submission] Initialized');
    }

    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
