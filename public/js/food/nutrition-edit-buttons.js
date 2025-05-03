/**
 * Add Save and Cancel buttons to the detailed nutrition panel
 */
document.addEventListener('DOMContentLoaded', function() {
    // Function to add Save and Cancel buttons to the detailed nutrition panel
    function addNutritionEditButtons() {
        // Find all detailed nutrition panels
        document.querySelectorAll('.detailed-nutrition-panel').forEach(panel => {
            // Check if we've already processed this panel
            if (panel.dataset.nutritionButtonsAdded === 'true') {
                return;
            }

            // Create a container for the buttons
            const buttonsContainer = document.createElement('div');
            buttonsContainer.className = 'nutrition-edit-buttons';

            // Create Save button
            const saveButton = document.createElement('button');
            saveButton.type = 'button';
            saveButton.className = 'save-nutrition';
            saveButton.textContent = 'Save Changes';

            // Create Cancel button
            const cancelButton = document.createElement('button');
            cancelButton.type = 'button';
            cancelButton.className = 'cancel-nutrition';
            cancelButton.textContent = 'Cancel';

            // Add buttons to the container
            buttonsContainer.appendChild(saveButton);
            buttonsContainer.appendChild(cancelButton);

            // Add the container to the panel
            panel.appendChild(buttonsContainer);

            // Store original values when the panel is shown
            const originalValues = {};

            // Function to store original values
            function storeOriginalValues() {
                // Find all input fields in the panel
                panel.querySelectorAll('input').forEach(input => {
                    // Store the original value
                    originalValues[input.id] = input.value;
                });
            }

            // Store original values when the panel is shown
            storeOriginalValues();

            // Add event listeners to the buttons
            saveButton.addEventListener('click', function() {
                // Find the closest form
                const form = panel.closest('form');
                if (form) {
                    // Find the submit button in the form
                    const submitButton = form.querySelector('button[type="submit"]');
                    if (submitButton) {
                        // Click the submit button
                        submitButton.click();
                    } else {
                        // If no submit button found, create a custom event
                        const event = new CustomEvent('nutrition-save', {
                            bubbles: true,
                            detail: { panel: panel }
                        });
                        panel.dispatchEvent(event);
                    }
                }

                // Hide the detailed nutrition panel
                panel.style.display = 'none';

                // Find the toggle button and update its text
                const toggleButton = panel.previousElementSibling?.querySelector('.toggle-detailed-nutrition');
                if (toggleButton) {
                    toggleButton.textContent = 'Show Detailed Nutrition';
                }

                // Show a success message
                const message = document.createElement('div');
                message.className = 'nutrition-save-message';
                message.textContent = 'Nutrition data saved!';
                message.style.color = '#4CAF50';
                message.style.padding = '5px';
                message.style.textAlign = 'center';
                message.style.marginTop = '5px';

                // Add the message to the page
                if (panel.previousElementSibling) {
                    panel.previousElementSibling.appendChild(message);

                    // Remove the message after 3 seconds
                    setTimeout(() => {
                        message.remove();
                    }, 3000);
                }
            });

            cancelButton.addEventListener('click', function() {
                // Reset the values to their original state
                panel.querySelectorAll('input').forEach(input => {
                    if (originalValues[input.id]) {
                        input.value = originalValues[input.id];
                    }
                });

                // Hide the detailed nutrition panel
                panel.style.display = 'none';

                // Find the toggle button and update its text
                const toggleButton = panel.previousElementSibling?.querySelector('.toggle-detailed-nutrition');
                if (toggleButton) {
                    toggleButton.textContent = 'Show Detailed Nutrition';
                }
            });

            // Mark the panel as processed
            panel.dataset.nutritionButtonsAdded = 'true';
        });
    }

    // Run the function initially
    setTimeout(addNutritionEditButtons, 300);

    // Set up a mutation observer to watch for new panels
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(addNutritionEditButtons, 100);
            }
        });
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    // Also handle dynamic panel creation through event delegation
    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('toggle-detailed-nutrition')) {
            // Wait for the panel to be displayed
            setTimeout(addNutritionEditButtons, 200);
        }
    });

    // Run periodically to ensure all panels have buttons
    setInterval(addNutritionEditButtons, 2000);
});
