/**
 * Button Row Layout
 * Ensures the Show Detailed Nutrition button is in the same row as Add Ingredient and Remove
 */
(function() {
    // Function to fix button row layout
    function fixButtonRowLayout() {
        // Get all ingredient forms
        const ingredientForms = document.querySelectorAll('.ingredient-form');
        
        ingredientForms.forEach(form => {
            // Skip if already processed
            if (form.dataset.rowFixed === 'true') return;
            
            // Mark as processed
            form.dataset.rowFixed = 'true';
            
            // Find all buttons in the form
            const addButton = form.querySelector('button:not(.toggle-detailed-nutrition):contains("Add"), button:not(.toggle-detailed-nutrition):contains("add")');
            const removeButton = form.querySelector('button:not(.toggle-detailed-nutrition):contains("Remove"), button:not(.toggle-detailed-nutrition):contains("remove")');
            const toggleButton = form.querySelector('.toggle-detailed-nutrition');
            
            // If we don't have all buttons, skip
            if (!addButton || !removeButton || !toggleButton) return;
            
            // Create a buttons row if it doesn't exist
            let buttonsRow = form.querySelector('.buttons-row');
            if (!buttonsRow) {
                buttonsRow = document.createElement('div');
                buttonsRow.className = 'buttons-row';
                
                // Find a good place to insert it
                const insertAfter = form.querySelector('.cronometer-text-paste-container') || 
                                   form.querySelector('.ingredient-header');
                
                if (insertAfter && insertAfter.parentNode) {
                    insertAfter.parentNode.insertBefore(buttonsRow, insertAfter.nextSibling);
                } else {
                    // If no good place found, append to the form
                    form.appendChild(buttonsRow);
                }
            }
            
            // Move all buttons to the buttons row
            if (toggleButton.parentNode !== buttonsRow) {
                buttonsRow.appendChild(toggleButton);
            }
            
            if (addButton.parentNode !== buttonsRow) {
                buttonsRow.appendChild(addButton);
            }
            
            if (removeButton.parentNode !== buttonsRow) {
                buttonsRow.appendChild(removeButton);
            }
            
            // Style the buttons to match
            [toggleButton, addButton, removeButton].forEach(button => {
                button.style.flex = '1';
                button.style.height = '38px';
                button.style.margin = '5px';
                button.style.padding = '8px 15px';
                button.style.fontSize = '0.9em';
                button.style.borderRadius = '3px';
                button.style.cursor = 'pointer';
                button.style.textAlign = 'center';
                button.style.backgroundColor = '#ffffff';
                button.style.color = '#121212';
                button.style.border = 'none';
            });
        });
    }
    
    // Function to initialize
    function init() {
        // Run immediately
        fixButtonRowLayout();
        
        // Set up a mutation observer to watch for changes
        const observer = new MutationObserver(function(mutations) {
            fixButtonRowLayout();
        });
        
        // Start observing the document body for changes
        observer.observe(document.body, { childList: true, subtree: true });
    }
    
    // Helper function to find elements by text content
    Element.prototype.contains = function(text) {
        return this.textContent.includes(text);
    };
    
    // Run when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Also run after a short delay to ensure all dynamic content is loaded
    setTimeout(fixButtonRowLayout, 500);
    setTimeout(fixButtonRowLayout, 1000);
    setTimeout(fixButtonRowLayout, 2000);
})();
