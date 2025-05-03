/**
 * Fix Form Buttons
 * Ensures only one set of form action buttons is displayed
 */

(function() {
    console.log('[Fix Form Buttons] Initializing...');

    // Function to remove duplicate buttons
    function removeDuplicateButtons() {
        // Find all edit ingredient forms
        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {
            // Find all form action elements in this form
            const formActions = form.querySelectorAll('.form-actions');
            
            // If there's more than one, keep only the last one
            if (formActions.length > 1) {
                console.log(`[Fix Form Buttons] Found ${formActions.length} form action elements in form`);
                
                // Keep only the last one (which is at the bottom)
                for (let i = 0; i < formActions.length - 1; i++) {
                    if (formActions[i] && formActions[i].parentNode) {
                        console.log('[Fix Form Buttons] Removing duplicate form action element');
                        formActions[i].parentNode.removeChild(formActions[i]);
                    }
                }
            }
        });
    }

    // Function to observe DOM changes
    function observeDOMChanges() {
        // Create a mutation observer
        const observer = new MutationObserver(mutations => {
            let needsFixing = false;
            
            mutations.forEach(mutation => {
                // Check if new nodes were added
                if (mutation.addedNodes.length) {
                    // Look for edit forms in the added nodes
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            // Check if this node is an edit form or contains one
                            if (node.classList && node.classList.contains('edit-ingredient-form')) {
                                needsFixing = true;
                            } else if (node.querySelector && node.querySelector('.edit-ingredient-form')) {
                                needsFixing = true;
                            }
                        }
                    });
                }
            });
            
            // If we found an edit form, remove duplicate buttons
            if (needsFixing) {
                setTimeout(removeDuplicateButtons, 50);
            }
        });
        
        // Start observing the document body
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Function to handle edit button clicks
    function handleEditButtonClicks() {
        // Use event delegation to handle edit button clicks
        document.body.addEventListener('click', event => {
            // Check if the click was on an edit button
            if (event.target.classList.contains('edit-ingredient-btn')) {
                console.log('[Fix Form Buttons] Edit button clicked');
                
                // Wait a short time for the form to be displayed
                setTimeout(removeDuplicateButtons, 100);
                
                // Check again after a longer delay to catch any late changes
                setTimeout(removeDuplicateButtons, 500);
            }
        });
    }

    // Initialize when the DOM is ready
    function init() {
        console.log('[Fix Form Buttons] Initializing...');
        
        // Remove duplicate buttons
        setTimeout(removeDuplicateButtons, 100);
        
        // Handle edit button clicks
        handleEditButtonClicks();
        
        // Observe DOM changes
        observeDOMChanges();
        
        console.log('[Fix Form Buttons] Initialized');
    }
    
    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
