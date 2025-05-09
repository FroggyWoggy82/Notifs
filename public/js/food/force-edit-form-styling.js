/**
 * Force Edit Form Styling
 * Ensures the edit ingredient form styling matches the create new recipe form exactly
 */

(function() {
    // Function to apply the exact styling to the edit form
    function forceEditFormStyling() {
        // Find all edit ingredient forms
        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        if (editForms.length === 0) {
            return; // No forms found
        }
        
        editForms.forEach(form => {
            // Apply styling to the form
            form.style.backgroundColor = '#1a1a1a';
            form.style.color = '#e0e0e0';
            form.style.padding = '5px';
            form.style.margin = '0';
            form.style.border = 'none';
            form.style.borderRadius = '0';
            
            // Apply styling to section headers
            const headers = form.querySelectorAll('h4');
            headers.forEach(header => {
                header.style.fontSize = '0.75em';
                header.style.margin = '0';
                header.style.marginBottom = '2px';
                header.style.padding = '0';
                header.style.color = '#e0e0e0';
                header.style.fontWeight = 'normal';
                header.style.textTransform = 'none';
                header.style.letterSpacing = 'normal';
                header.style.border = 'none';
            });
            
            // Apply styling to nutrition sections
            const sections = form.querySelectorAll('.nutrition-section');
            sections.forEach(section => {
                section.style.margin = '0';
                section.style.padding = '0';
                section.style.marginTop = '5px';
            });
            
            // Apply styling to nutrition grids
            const grids = form.querySelectorAll('.nutrition-grid');
            grids.forEach(grid => {
                grid.style.display = 'grid';
                grid.style.gridTemplateColumns = 'repeat(6, 1fr)';
                grid.style.gap = '2px';
                grid.style.margin = '0';
                grid.style.padding = '0';
            });
            
            // Apply styling to nutrition items
            const items = form.querySelectorAll('.nutrition-item');
            items.forEach(item => {
                item.style.margin = '0';
                item.style.padding = '0';
            });
            
            // Apply styling to labels
            const labels = form.querySelectorAll('.nutrition-item label');
            labels.forEach(label => {
                label.style.fontSize = '0.65em';
                label.style.margin = '0';
                label.style.padding = '0';
                label.style.color = '#aaa';
                label.style.display = 'block';
                label.style.whiteSpace = 'nowrap';
                label.style.overflow = 'hidden';
                label.style.textOverflow = 'ellipsis';
                label.style.lineHeight = '1.2';
            });
            
            // Apply styling to input fields
            const inputs = form.querySelectorAll('input[type="number"], input[type="text"]');
            inputs.forEach(input => {
                input.style.width = '90px';
                input.style.height = '16px';
                input.style.padding = '0';
                input.style.margin = '0';
                input.style.fontSize = '0.7em';
                input.style.backgroundColor = '#141414';
                input.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                input.style.color = '#e0e0e0';
                input.style.borderRadius = '0';
                input.style.boxShadow = 'none';
                input.style.outline = 'none';
                input.style.boxSizing = 'border-box';
            });
            
            // Special styling for name field
            const nameField = form.querySelector('#edit-ingredient-name');
            if (nameField) {
                nameField.style.width = '140px';
            }
            
            // Apply styling to form actions
            const formActions = form.querySelector('.form-actions');
            if (formActions) {
                formActions.style.display = 'flex';
                formActions.style.justifyContent = 'space-between';
                formActions.style.gap = '10px';
                formActions.style.marginTop = '10px';
                formActions.style.marginBottom = '0';
            }
            
            // Apply styling to buttons
            const buttons = form.querySelectorAll('.form-actions button');
            buttons.forEach(button => {
                button.style.backgroundColor = '#ffffff';
                button.style.color = '#000000';
                button.style.border = 'none';
                button.style.borderRadius = '0';
                button.style.padding = '4px 8px';
                button.style.fontSize = '0.8em';
                button.style.cursor = 'pointer';
            });
        });
    }
    
    // Apply styling when the DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        forceEditFormStyling();
        
        // Also apply styling when an edit button is clicked
        document.addEventListener('click', function(event) {
            if (event.target.matches('button') && event.target.textContent.trim() === 'Edit') {
                // Wait for the form to be created
                setTimeout(forceEditFormStyling, 100);
            }
        });
    });
    
    // Create a MutationObserver to watch for changes to the DOM
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                // Check if any of the added nodes are edit forms or contain edit forms
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        if (node.classList && node.classList.contains('edit-ingredient-form')) {
                            forceEditFormStyling();
                        } else if (node.querySelector && node.querySelector('.edit-ingredient-form')) {
                            forceEditFormStyling();
                        }
                    }
                });
            }
        });
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Apply styling periodically to ensure it's always applied
    setInterval(forceEditFormStyling, 1000);
})();
