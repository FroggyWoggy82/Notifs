/**
 * Remove Duplicate Form Buttons
 * Removes duplicate Save Changes and Cancel buttons in edit forms
 */

(function() {
    console.log('[Remove Duplicate Form Buttons] Initializing...');

    // Function to remove duplicate form buttons
    function removeDuplicateFormButtons() {
        // Find all edit ingredient forms
        const editForms = document.querySelectorAll('.edit-ingredient-form');

        editForms.forEach(form => {
            // Skip if already processed
            if (form.dataset.duplicateFormButtonsRemoved === 'true') return;

            // Find all form action containers
            const formActions = form.querySelectorAll('.form-actions');

            // If there's more than one, keep only the last one
            if (formActions.length > 1) {
                console.log(`[Remove Duplicate Form Buttons] Found ${formActions.length} form action containers, removing duplicates`);

                // Remove all except the last one
                for (let i = 0; i < formActions.length - 1; i++) {
                    formActions[i].remove(); // Actually remove the element instead of hiding it
                }

                // Make sure the last one is visible
                formActions[formActions.length - 1].style.display = 'flex';
            }

            // Also find any standalone Save Changes and Cancel buttons outside of form-actions
            const saveButtons = form.querySelectorAll('button.save-ingredient-btn, button[type="submit"]');
            const cancelButtons = form.querySelectorAll('button.cancel-edit-btn, button[type="button"]:not(.toggle-detailed-nutrition):not(#show-detailed-nutrition-btn)');

            // If there are multiple save buttons, keep only the one in the last form-actions
            if (saveButtons.length > 1) {
                console.log(`[Remove Duplicate Form Buttons] Found ${saveButtons.length} save buttons, removing duplicates`);

                const lastFormActions = formActions[formActions.length - 1];

                saveButtons.forEach(button => {
                    // If this button is not in the last form-actions, remove it
                    if (!lastFormActions.contains(button)) {
                        button.remove(); // Actually remove the element instead of hiding it
                    }
                });
            }

            // If there are multiple cancel buttons, keep only the one in the last form-actions
            if (cancelButtons.length > 1) {
                console.log(`[Remove Duplicate Form Buttons] Found ${cancelButtons.length} cancel buttons, removing duplicates`);

                const lastFormActions = formActions[formActions.length - 1];

                cancelButtons.forEach(button => {
                    // If this button is not in the last form-actions, remove it
                    if (!lastFormActions.contains(button)) {
                        button.remove(); // Actually remove the element instead of hiding it
                    }
                });
            }

            // One final check - find all form-actions and make sure only one exists
            const finalFormActions = form.querySelectorAll('.form-actions');
            if (finalFormActions.length > 1) {
                console.log(`[Remove Duplicate Form Buttons] Final check found ${finalFormActions.length} form actions, removing all but the last`);
                for (let i = 0; i < finalFormActions.length - 1; i++) {
                    finalFormActions[i].remove();
                }
            }

            // Mark as processed
            form.dataset.duplicateFormButtonsRemoved = 'true';
        });
    }

    // Function to handle edit button clicks
    function handleEditButtonClicks() {
        // Use event delegation to handle edit button clicks
        document.body.addEventListener('click', event => {
            // Check if the click was on an edit button
            if (event.target.classList.contains('edit-ingredient-btn')) {
                console.log('[Remove Duplicate Form Buttons] Edit button clicked');

                // Get the row and container
                const row = event.target.closest('tr');
                if (row) {
                    const container = row.closest('.ingredient-details');
                    if (container) {
                        // Find the edit form
                        const editForm = container.querySelector('.edit-ingredient-form');
                        if (editForm) {
                            // Wait a short time for the form to be displayed
                            setTimeout(() => {
                                // Find all form-actions in this specific form
                                const formActions = editForm.querySelectorAll('.form-actions');
                                if (formActions.length > 1) {
                                    console.log(`[Remove Duplicate Form Buttons] Found ${formActions.length} form actions in clicked form, removing all but the last`);
                                    for (let i = 0; i < formActions.length - 1; i++) {
                                        formActions[i].remove();
                                    }
                                }

                                // Run the full duplicate removal function
                                removeDuplicateFormButtons();
                            }, 100);

                            // Check again after longer delays
                            setTimeout(removeDuplicateFormButtons, 500);
                            setTimeout(removeDuplicateFormButtons, 1000);
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

            // If we found an edit form, remove duplicate buttons
            if (needsProcessing) {
                setTimeout(removeDuplicateFormButtons, 50);
                setTimeout(removeDuplicateFormButtons, 200);
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
        console.log('[Remove Duplicate Form Buttons] Initializing...');

        // Remove duplicate buttons
        setTimeout(removeDuplicateFormButtons, 100);
        setTimeout(removeDuplicateFormButtons, 500);
        setTimeout(removeDuplicateFormButtons, 1000);

        // Set up a periodic check to ensure buttons are removed
        setInterval(removeDuplicateFormButtons, 2000);

        // Handle edit button clicks
        handleEditButtonClicks();

        // Observe DOM changes
        observeDOMChanges();

        console.log('[Remove Duplicate Form Buttons] Initialized');
    }

    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
