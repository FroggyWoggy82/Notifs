/**
 * Force Single Button Set
 * Completely removes all form action buttons and adds a single set
 */

(function() {
    console.log('[Force Single Button Set] Initializing...');

    // Function to force a single set of buttons
    function forceSingleButtonSet() {
        // Find all edit ingredient forms
        const editForms = document.querySelectorAll('.edit-ingredient-form');

        editForms.forEach(form => {
            // Find the form element
            const formElement = form.querySelector('form');
            if (!formElement) return;

            // Skip if already processed and working
            if (form.dataset.workingButtonsAdded === 'true') return;

            // Store the original form submit handler before removing elements
            let originalSubmitHandler = null;
            if (formElement.onsubmit) {
                originalSubmitHandler = formElement.onsubmit;
            } else if (window.handleEditIngredientSubmit) {
                // If the global handler exists, use that
                originalSubmitHandler = window.handleEditIngredientSubmit;
            }

            // Check for event listeners using a clone technique
            const formClone = formElement.cloneNode(true);
            const hasEventListeners = formElement !== formClone;

            // Remove ALL existing form-actions
            const existingFormActions = form.querySelectorAll('.form-actions');
            existingFormActions.forEach(el => {
                console.log('[Force Single Button Set] Removing form-actions element');
                el.remove();
            });

            // Remove any standalone buttons
            const standaloneButtons = form.querySelectorAll('button:not(.toggle-detailed-nutrition):not(#show-detailed-nutrition-btn)');
            standaloneButtons.forEach(button => {
                // Only remove if it's a save or cancel button
                if (button.textContent.includes('Save') || button.textContent.includes('Cancel')) {
                    console.log('[Force Single Button Set] Removing standalone button:', button.textContent);
                    button.remove();
                }
            });

            // Create a single new form-actions element
            const newFormActions = document.createElement('div');
            newFormActions.className = 'form-actions';

            // Create Save Changes button
            const saveButton = document.createElement('button');
            saveButton.type = 'button'; // Use button type instead of submit
            saveButton.className = 'save-ingredient-btn';
            saveButton.textContent = 'Save Changes';

            // Add click handler to submit the form
            saveButton.addEventListener('click', function() {
                console.log('[Force Single Button Set] Save button clicked, submitting form');
                // Create and dispatch a submit event
                const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                formElement.dispatchEvent(submitEvent);
            });

            // Create Cancel button
            const cancelButton = document.createElement('button');
            cancelButton.type = 'button';
            cancelButton.className = 'cancel-edit-btn';
            cancelButton.textContent = 'Cancel';

            // Add event listener to the cancel button
            cancelButton.addEventListener('click', function(event) {
                // Prevent default behavior
                event.preventDefault();
                event.stopPropagation();

                console.log('[Force Single Button Set] Cancel button clicked, hiding form');

                // Hide the edit form
                form.style.display = 'none';

                // Also try other methods of hiding
                form.classList.remove('show-edit-form');
                form.classList.add('hide-edit-form');
            });

            // Add buttons to form actions
            newFormActions.appendChild(saveButton);
            newFormActions.appendChild(cancelButton);

            // Add form actions to the form element
            formElement.appendChild(newFormActions);

            // Make sure the form has the correct ID
            if (!formElement.id || formElement.id !== 'edit-ingredient-form') {
                formElement.id = 'edit-ingredient-form';
            }

            // Re-attach the submit handler
            if (originalSubmitHandler) {
                // Remove any existing submit handlers
                formElement.onsubmit = null;

                // Add the submit handler back
                formElement.addEventListener('submit', function(event) {
                    // Call the original handler
                    originalSubmitHandler.call(this, event);
                });

                console.log('[Force Single Button Set] Re-attached submit handler');
            } else if (window.handleEditIngredientSubmit) {
                // If the global handler exists, use that
                formElement.addEventListener('submit', function(event) {
                    // Call the global handler
                    window.handleEditIngredientSubmit.call(this, event);
                });

                console.log('[Force Single Button Set] Attached global submit handler');
            } else {
                // If we couldn't find any handler, use our fallback
                formElement.addEventListener('submit', async function(event) {
                    event.preventDefault();

                    console.log('[Force Single Button Set] Using fallback submit handler');

                    try {
                        // Get the container and status element
                        const container = form.closest('.ingredient-details');
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
                        const allInputs = form.querySelectorAll('input[id^="edit-ingredient-"]');
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

                        // Call the API to update the ingredient
                        const response = await fetch(`/api/recipes/${recipeId}/ingredients/${ingredientId}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(ingredientData)
                        });

                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }

                        const updatedRecipe = await response.json();

                        // Hide the edit form
                        form.style.display = 'none';

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
                        console.error('Error updating ingredient:', error);

                        // Show error message
                        const container = form.closest('.ingredient-details');
                        const statusElement = container.querySelector('.edit-ingredient-status');
                        if (statusElement) {
                            statusElement.textContent = `Error: ${error.message}`;
                            statusElement.className = 'status error';
                        }
                    }
                });

                console.log('[Force Single Button Set] Attached fallback submit handler');
            }

            // Mark as processed with working buttons
            form.dataset.workingButtonsAdded = 'true';

            console.log('[Force Single Button Set] Added single set of working buttons to form');
        });
    }

    // Function to handle edit button clicks
    function handleEditButtonClicks() {
        // Use event delegation to handle edit button clicks
        document.body.addEventListener('click', event => {
            // Check if the click was on an edit button
            if (event.target.classList.contains('edit-ingredient-btn')) {
                console.log('[Force Single Button Set] Edit button clicked');

                // Get the row and container
                const row = event.target.closest('tr');
                if (row) {
                    const container = row.closest('.ingredient-details');
                    if (container) {
                        // Find the edit form
                        const editForm = container.querySelector('.edit-ingredient-form');
                        if (editForm) {
                            // Wait for the form to be fully displayed and processed by other scripts
                            setTimeout(forceSingleButtonSet, 100);
                            setTimeout(forceSingleButtonSet, 300);
                            setTimeout(forceSingleButtonSet, 500);
                        }
                    }
                }
            }
        });
    }

    // Function to observe DOM changes
    function observeDOMChanges() {
        // Create a mutation observer
        const observer = new MutationObserver(mutations => {
            let needsProcessing = false;

            mutations.forEach(mutation => {
                // Check if new nodes were added
                if (mutation.addedNodes.length) {
                    // Look for edit forms in the added nodes
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            // Check if this node is an edit form or contains one
                            if (node.classList && node.classList.contains('edit-ingredient-form')) {
                                needsProcessing = true;
                            } else if (node.querySelector && node.querySelector('.edit-ingredient-form')) {
                                needsProcessing = true;
                            }
                        }
                    });
                }
            });

            // If we found an edit form, force a single set of buttons
            if (needsProcessing) {
                setTimeout(forceSingleButtonSet, 50);
                setTimeout(forceSingleButtonSet, 200);
            }
        });

        // Start observing the document body
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Initialize when the DOM is ready
    function init() {
        console.log('[Force Single Button Set] Initializing...');

        // Wait a bit longer to ensure all other scripts have run
        setTimeout(() => {
            console.log('[Force Single Button Set] Running initial setup...');

            // Force a single set of buttons
            forceSingleButtonSet();

            // Run again after a delay to catch any late changes
            setTimeout(forceSingleButtonSet, 500);
            setTimeout(forceSingleButtonSet, 1000);

            // Set up a periodic check to ensure buttons are correct
            setInterval(forceSingleButtonSet, 2000);

            // Handle edit button clicks
            handleEditButtonClicks();

            // Observe DOM changes
            observeDOMChanges();

            console.log('[Force Single Button Set] Initial setup complete');
        }, 1000);

        console.log('[Force Single Button Set] Initialized');
    }

    // Initialize when the DOM is ready and all other scripts have loaded
    window.addEventListener('load', function() {
        // Wait longer to ensure all other scripts have run
        setTimeout(init, 2000);
    });
})();
