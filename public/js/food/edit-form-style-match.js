/**
 * Edit Form Style Match
 * Ensures the edit ingredient form styling EXACTLY matches the create new recipe form
 * WITHOUT affecting the create new recipe form itself
 */

(function() {
    // Function to apply styling to edit forms only
    function applyEditFormStyling() {
        // Find all edit forms
        const editForms = document.querySelectorAll('.modal-content form, #edit-ingredient-form');

        if (editForms.length === 0) {
            return; // No edit forms found
        }

        // Apply styling to each edit form
        editForms.forEach(form => {
            // Find all input fields in the form
            const inputs = form.querySelectorAll('input[type="number"], input[type="text"]');

            // Apply styling to each input field
            inputs.forEach(input => {
                input.style.width = '45px'; // EXACT width from screenshot
                input.style.height = '16px';
                input.style.padding = '0';
                input.style.margin = '0';
                input.style.fontSize = '0.7em';
                input.style.backgroundColor = 'rgba(20, 20, 20, 0.8)';
                input.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                input.style.color = '#e0e0e0';
                input.style.borderRadius = '0';
                input.style.boxShadow = 'none';
                input.style.outline = 'none';
            });

            // Special handling for name field
            const nameField = form.querySelector('#edit-ingredient-name');
            if (nameField) {
                nameField.style.width = '140px';
            }

            // Find all section headers in the form
            const headers = form.querySelectorAll('.nutrition-section h4');

            // Apply styling to each section header
            headers.forEach(header => {
                header.style.fontSize = '0.75em';
                header.style.marginTop = '5px';
                header.style.marginBottom = '2px';
                header.style.paddingBottom = '0';
                header.style.borderBottom = 'none';
                header.style.color = '#e0e0e0';
                header.style.fontWeight = 'normal';
            });

            // Find all nutrition grids in the form
            const grids = form.querySelectorAll('.nutrition-grid');

            // Apply styling to each nutrition grid
            grids.forEach(grid => {
                grid.style.display = 'grid';
                grid.style.gridTemplateColumns = 'repeat(6, 1fr)';
                grid.style.gap = '2px';
                grid.style.marginBottom = '0';
            });

            // Find all nutrition items in the form
            const items = form.querySelectorAll('.nutrition-item');

            // Apply styling to each nutrition item
            items.forEach(item => {
                item.style.marginBottom = '0';
                item.style.padding = '0';

                // Find the input inside this item and set its width
                const itemInput = item.querySelector('input');
                if (itemInput) {
                    itemInput.style.width = '45px'; // EXACT width from screenshot
                }
            });

            // Find all labels in the form
            const labels = form.querySelectorAll('.nutrition-item label');

            // Apply styling to each label
            labels.forEach(label => {
                label.style.fontSize = '0.65em';
                label.style.marginBottom = '0';
                label.style.paddingBottom = '0';
                label.style.color = '#aaa';
                label.style.display = 'block';
                label.style.whiteSpace = 'nowrap';
                label.style.overflow = 'hidden';
                label.style.textOverflow = 'ellipsis';
                label.style.lineHeight = '1.2';
            });
        });
    }

    // Apply styling when the DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Initial application
        applyEditFormStyling();

        // Apply styling when an edit button is clicked
        document.addEventListener('click', function(event) {
            if (event.target.matches('button') &&
                (event.target.textContent.trim() === 'Edit' ||
                 event.target.classList.contains('edit-btn') ||
                 event.target.classList.contains('edit-ingredient-btn'))) {
                // Wait for the modal to be created
                setTimeout(applyEditFormStyling, 100);
            }
        });

        // Create a MutationObserver to watch for changes to the DOM
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length > 0) {
                    // Check if any of the added nodes are edit forms or contain edit forms
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // Element node
                            if ((node.classList &&
                                 (node.classList.contains('modal-content') ||
                                  node.id === 'edit-ingredient-form')) ||
                                (node.querySelector &&
                                 (node.querySelector('.modal-content') ||
                                  node.querySelector('#edit-ingredient-form')))) {
                                setTimeout(applyEditFormStyling, 50);
                            }
                        }
                    });
                }
            });
        });

        // Start observing the document with the configured parameters
        observer.observe(document.body, { childList: true, subtree: true });
    });
})();
