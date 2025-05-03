/**
 * Move Save Changes and Cancel buttons above the Edit Ingredient header
 */
document.addEventListener('DOMContentLoaded', function() {
    // Function to move buttons above header
    function moveButtonsAboveHeader() {
        // Find all edit ingredient forms
        document.querySelectorAll('.edit-ingredient-form').forEach(form => {
            // Check if we've already processed this form
            if (form.dataset.buttonsMovedAboveHeader === 'true') {
                return;
            }

            // Find the form element
            const formElement = form.querySelector('form');
            if (!formElement) return;

            // Find the form actions (buttons container)
            const formActions = formElement.querySelector('.form-actions');
            if (!formActions) return;

            // Find the header (h2 with "Edit Ingredient" text)
            const header = form.querySelector('h2');
            if (!header) return;

            // Create a new container for the buttons at the top
            const topButtonsContainer = document.createElement('div');
            topButtonsContainer.className = 'edit-ingredient-form-top-buttons';

            // Position the container at the top of the form
            if (form.firstChild) {
                form.insertBefore(topButtonsContainer, form.firstChild);
            } else {
                form.appendChild(topButtonsContainer);
            }

            // Clone the buttons
            const saveButton = formActions.querySelector('button[type="submit"], button.save-changes');
            const cancelButton = formActions.querySelector('button.cancel');

            if (saveButton) {
                const clonedSaveButton = saveButton.cloneNode(true);
                topButtonsContainer.appendChild(clonedSaveButton);

                // Add event listener to the cloned save button
                clonedSaveButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    saveButton.click(); // Trigger click on the original button
                });
            }

            if (cancelButton) {
                const clonedCancelButton = cancelButton.cloneNode(true);
                topButtonsContainer.appendChild(clonedCancelButton);

                // Add event listener to the cloned cancel button
                clonedCancelButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    cancelButton.click(); // Trigger click on the original button
                });
            }

            // Don't hide the header, just make sure it's visible
            if (header) {
                header.style.display = 'block';
            }

            // Mark the form as processed
            form.dataset.buttonsMovedAboveHeader = 'true';
        });
    }

    // Run the function initially
    setTimeout(moveButtonsAboveHeader, 300);

    // Set up a mutation observer to watch for new forms
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(moveButtonsAboveHeader, 100);
            }
        });
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    // Also handle dynamic form creation through event delegation
    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-ingredient-btn')) {
            // Wait for the form to be displayed
            setTimeout(moveButtonsAboveHeader, 200);
            // Try again after a bit longer to ensure it's applied
            setTimeout(moveButtonsAboveHeader, 500);
            setTimeout(moveButtonsAboveHeader, 1000);
        }
    });

    // Run periodically to ensure the buttons are moved
    setInterval(moveButtonsAboveHeader, 2000);
});
