/**
 * Edit Ingredient Form Match
 * This script ensures the edit ingredient form matches the styling of the Create New Recipe form
 * It applies styling directly to the DOM elements for maximum compatibility
 */

(function() {
    // Function to apply styling to edit forms
    function applyEditFormStyling() {
        // Find the edit ingredient form
        const editForm = document.getElementById('edit-ingredient-form');

        if (!editForm) {
            return; // No edit form found
        }

        // Apply styling to the form container
        editForm.style.backgroundColor = '#1a1a1a';
        editForm.style.color = '#e0e0e0';
        editForm.style.padding = '5px';
        editForm.style.margin = '0';
        editForm.style.border = 'none';
        editForm.style.borderRadius = '0';

        // Find all input fields in the form
        const inputs = editForm.querySelectorAll('input[type="number"], input[type="text"]');

        // Apply styling to each input field
        inputs.forEach(input => {
            // Skip the name field
            if (input.id === 'edit-ingredient-name') {
                input.style.width = '300px';
                input.style.maxWidth = '300px';
                input.style.minWidth = '300px';
                input.style.height = '30px'; // Reduced height
                input.style.padding = '4px 8px'; // Reduced padding
                input.style.margin = '2px 0'; // Reduced margin
                input.style.fontSize = '1em';
                return;
            }

            // Apply styling to match Create New Recipe form
            input.style.width = '180px';
            input.style.maxWidth = '180px';
            input.style.minWidth = '180px';
            input.style.height = '30px'; // Reduced height
            input.style.padding = '4px 8px'; // Reduced padding
            input.style.margin = '2px 0'; // Reduced margin
            input.style.fontSize = '1em';
            input.style.backgroundColor = 'rgba(20, 20, 20, 0.8)';
            input.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            input.style.color = '#e0e0e0';
            input.style.borderRadius = '0';
            input.style.boxShadow = 'none';
            input.style.outline = 'none';
            input.style.boxSizing = 'border-box';
        });

        // Find all section headers in the form
        const headers = editForm.querySelectorAll('.nutrition-section h4');

        // Apply styling to each section header
        headers.forEach(header => {
            header.style.fontSize = '1.1em'; // Slightly reduced font size
            header.style.marginTop = '8px'; // Reduced top margin
            header.style.marginBottom = '5px'; // Reduced bottom margin
            header.style.paddingBottom = '2px'; // Reduced padding
            header.style.borderBottom = 'none';
            header.style.color = '#ffffff';
            header.style.fontWeight = 'normal';
        });

        // Find all nutrition grids in the form
        const grids = editForm.querySelectorAll('.nutrition-grid');

        // Apply styling to each nutrition grid
        grids.forEach(grid => {
            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = 'repeat(6, 1fr)';
            grid.style.gap = '8px'; // Reduced gap
            grid.style.marginBottom = '5px'; // Reduced margin
        });

        // Find all nutrition items in the form
        const items = editForm.querySelectorAll('.nutrition-item');

        // Apply styling to each nutrition item
        items.forEach(item => {
            item.style.marginBottom = '3px'; // Reduced margin
            item.style.padding = '2px'; // Reduced padding
            item.style.display = 'flex';
            item.style.flexDirection = 'column';
            item.style.alignItems = 'flex-start';

            // Find the input inside this item and set its width
            const itemInput = item.querySelector('input');
            if (itemInput) {
                itemInput.style.width = '180px';
                itemInput.style.maxWidth = '180px';
                itemInput.style.minWidth = '180px';
            }
        });

        // Find all labels in the form
        const labels = editForm.querySelectorAll('label');

        // Apply styling to each label
        labels.forEach(label => {
            label.style.fontSize = '0.9em'; // Slightly reduced font size
            label.style.marginBottom = '2px'; // Reduced margin
            label.style.paddingBottom = '0'; // Removed padding
            label.style.color = '#e0e0e0'; // Light gray color to match Create New Recipe form
            label.style.display = 'block';
            label.style.whiteSpace = 'nowrap';
            label.style.overflow = 'hidden';
            label.style.textOverflow = 'ellipsis';
            label.style.lineHeight = '1.2'; // Reduced line height
            label.style.fontWeight = 'normal';
        });

        // Find all nutrition sections in the form
        const sections = editForm.querySelectorAll('.nutrition-section');

        // Apply styling to each nutrition section
        sections.forEach(section => {
            section.style.marginBottom = '2px'; // Further reduced from 5px
            section.style.paddingBottom = '1px'; // Further reduced from 3px
            section.style.marginTop = '2px'; // Further reduced from 5px
        });

        // Find all direct child divs using children property
        const divs = editForm.children;

        // Apply spacing to each div
        for (let i = 0; i < divs.length; i++) {
            if (divs[i].tagName === 'DIV') {
                divs[i].style.marginBottom = '2px'; // Further reduced from 5px
            }
        }

        // Find the Save Changes and Cancel buttons
        const saveButton = editForm.querySelector('button[type="submit"]');
        const cancelButton = editForm.querySelector('button.cancel-btn');

        // Apply styling to the buttons
        if (saveButton) {
            saveButton.style.padding = '6px 12px';
            saveButton.style.fontSize = '0.9em';
            saveButton.style.marginTop = '10px';
            saveButton.style.width = 'auto';
            saveButton.style.minWidth = '100px';
        }

        if (cancelButton) {
            cancelButton.style.padding = '6px 12px';
            cancelButton.style.fontSize = '0.9em';
            cancelButton.style.marginTop = '10px';
            cancelButton.style.width = 'auto';
            cancelButton.style.minWidth = '100px';
        }
    }

    // Apply styling when the DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Initial application
        setTimeout(applyEditFormStyling, 100);

        // Apply styling when an edit button is clicked
        document.addEventListener('click', function(event) {
            if (event.target.matches('button') &&
                (event.target.textContent.trim() === 'Edit' ||
                 event.target.classList.contains('edit-btn') ||
                 event.target.classList.contains('edit-ingredient-btn'))) {
                // Wait for the modal to be created
                setTimeout(applyEditFormStyling, 100);
                setTimeout(applyEditFormStyling, 300);
                setTimeout(applyEditFormStyling, 500);
            }
        });

        // Create a MutationObserver to watch for changes to the DOM
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length > 0) {
                    // Check if any of the added nodes are edit forms or contain edit forms
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // Element node
                            if (node.id === 'edit-ingredient-form' ||
                                (node.querySelector && node.querySelector('#edit-ingredient-form'))) {
                                setTimeout(applyEditFormStyling, 50);
                                setTimeout(applyEditFormStyling, 100);
                            }
                        }
                    });
                }
            });
        });

        // Start observing the document with the configured parameters
        observer.observe(document.body, { childList: true, subtree: true });

        // Apply styling periodically to ensure it sticks
        setInterval(applyEditFormStyling, 1000);
    });
})();
