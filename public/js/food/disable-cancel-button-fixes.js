/**
 * Disable Cancel Button Fixes
 * Disables all the conflicting scripts that try to modify the cancel button behavior
 * and restores the original simple handler
 */

(function() {
    console.log('Initializing cancel button fix - disabling conflicting scripts');
    
    // The original simple handler that should work
    function applyOriginalCancelHandler() {
        // Find all cancel buttons
        const cancelButtons = document.querySelectorAll('.cancel-edit-btn');
        
        cancelButtons.forEach(button => {
            // Remove all existing event listeners by cloning the button
            const newButton = button.cloneNode(true);
            if (button.parentNode) {
                button.parentNode.replaceChild(newButton, button);
            }
            
            // Add the simple original handler
            newButton.addEventListener('click', function(event) {
                // Find the closest edit form
                const editForm = this.closest('.edit-ingredient-form');
                if (editForm) {
                    // Simply hide the form
                    editForm.style.display = 'none';
                    console.log('Edit form hidden by original handler');
                }
            });
        });
    }
    
    // Apply the original handler immediately
    setTimeout(applyOriginalCancelHandler, 100);
    
    // Also apply it when edit buttons are clicked
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-ingredient-btn')) {
            // Wait for the form to be displayed
            setTimeout(applyOriginalCancelHandler, 200);
        }
    });
    
    // Apply it periodically to catch any dynamically added buttons
    setInterval(applyOriginalCancelHandler, 1000);
    
    // Add a global event handler as a fallback
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('cancel-edit-btn')) {
            // Find the closest edit form
            const editForm = event.target.closest('.edit-ingredient-form');
            if (editForm) {
                // Simply hide the form
                editForm.style.display = 'none';
                console.log('Edit form hidden by global handler');
                
                // Prevent other handlers from running
                event.stopPropagation();
                event.preventDefault();
            }
        }
    }, true); // Use capture phase to ensure this runs before other handlers
    
    console.log('Cancel button fix initialized');
})();
