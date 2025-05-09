/**
 * Force Narrow Inputs
 * Forces all inputs in the edit ingredient form to be narrow
 * This is a last resort to ensure the styling matches exactly
 */

(function() {
    // Function to force narrow inputs
    function forceNarrowInputs() {
        // Find all inputs in the edit ingredient form
        const inputs = document.querySelectorAll('.modal-content input, #edit-ingredient-form input');
        
        // Apply styling to each input
        inputs.forEach(input => {
            // Skip the name field
            if (input.id === 'edit-ingredient-name') {
                input.style.width = '140px';
                input.style.maxWidth = '140px';
                input.style.minWidth = '140px';
                return;
            }
            
            // Apply narrow styling to all other inputs
            input.style.width = '45px'; // EXACT width from screenshot
            input.style.maxWidth = '45px';
            input.style.minWidth = '45px';
            input.style.height = '16px';
            input.style.minHeight = '16px';
            input.style.maxHeight = '16px';
            input.style.padding = '0';
            input.style.margin = '0';
            input.style.fontSize = '0.7em';
            input.style.backgroundColor = 'rgba(20, 20, 20, 0.8)';
            input.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            input.style.color = '#e0e0e0';
            input.style.borderRadius = '0';
            input.style.boxShadow = 'none';
            input.style.outline = 'none';
            input.style.boxSizing = 'border-box';
        });
    }
    
    // Apply styling when the DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Initial application
        forceNarrowInputs();
        
        // Apply styling when an edit button is clicked
        document.addEventListener('click', function(event) {
            if (event.target.matches('button') && 
                (event.target.textContent.trim() === 'Edit' || 
                 event.target.classList.contains('edit-btn') || 
                 event.target.classList.contains('edit-ingredient-btn'))) {
                // Wait for the modal to be created
                setTimeout(forceNarrowInputs, 100);
                
                // Apply styling multiple times to ensure it sticks
                setTimeout(forceNarrowInputs, 200);
                setTimeout(forceNarrowInputs, 500);
                setTimeout(forceNarrowInputs, 1000);
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
                                setTimeout(forceNarrowInputs, 50);
                                setTimeout(forceNarrowInputs, 100);
                                setTimeout(forceNarrowInputs, 200);
                            }
                        }
                    });
                }
            });
        });
        
        // Start observing the document with the configured parameters
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Apply styling periodically to ensure it sticks
        setInterval(forceNarrowInputs, 1000);
    });
})();
