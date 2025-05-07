/**
 * Ensure buttons are visible in the Edit Ingredient form
 */
document.addEventListener('DOMContentLoaded', function() {
    // Function to ensure buttons are visible
    function ensureButtonsVisible() {
        // Find all edit ingredient forms
        document.querySelectorAll('.edit-ingredient-form').forEach(form => {
            // Find the form element
            const formElement = form.querySelector('form');
            if (!formElement) return;

            // Find the form actions (buttons container)
            const formActions = formElement.querySelector('.form-actions');
            if (!formActions) {
                // If no form actions found, create them
                const newFormActions = document.createElement('div');
                newFormActions.className = 'form-actions';
                
                // Create Save Changes button
                const saveButton = document.createElement('button');
                saveButton.type = 'submit';
                saveButton.className = 'save-changes';
                saveButton.textContent = 'Save Changes';
                
                // Create Cancel button
                const cancelButton = document.createElement('button');
                cancelButton.type = 'button';
                cancelButton.className = 'cancel';
                cancelButton.textContent = 'Cancel';
                
                // Add buttons to form actions
                newFormActions.appendChild(saveButton);
                newFormActions.appendChild(cancelButton);
                
                // Add form actions to form
                formElement.appendChild(newFormActions);
            } else {
                // Make sure form actions are visible
                formActions.style.display = 'flex';
            }
            
            // Make sure the header is visible
            const header = form.querySelector('h2');
            if (header) {
                header.style.display = 'block';
            }
        });
    }

    // Run the function initially
    setTimeout(ensureButtonsVisible, 300);

    // Set up a mutation observer to watch for new forms
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(ensureButtonsVisible, 100);
            }
        });
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    // Also handle dynamic form creation through event delegation
    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-ingredient-btn')) {
            // Wait for the form to be displayed
            setTimeout(ensureButtonsVisible, 200);
            // Try again after a bit longer to ensure it's applied
            setTimeout(ensureButtonsVisible, 500);
            setTimeout(ensureButtonsVisible, 1000);
        }
    });

    // Run periodically to ensure the buttons are visible
    setInterval(ensureButtonsVisible, 2000);
});
