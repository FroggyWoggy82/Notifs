/**
 * Global Cancel Handler
 * Ensures the cancel button works regardless of which script created it
 */

(function() {
    console.log('[Global Cancel Handler] Initializing...');

    // Use event delegation to handle all cancel button clicks
    document.body.addEventListener('click', function(event) {
        // Check if the click was on a cancel button
        if (event.target.classList.contains('cancel-edit-btn') || 
            (event.target.textContent === 'Cancel' && event.target.closest('.edit-ingredient-form'))) {
            
            console.log('[Global Cancel Handler] Cancel button clicked');
            
            // Find the edit form
            const editForm = event.target.closest('.edit-ingredient-form');
            if (editForm) {
                // Hide the form
                editForm.style.display = 'none';
                
                // Also try other methods of hiding
                editForm.classList.remove('show-edit-form');
                editForm.classList.add('hide-edit-form');
                
                console.log('[Global Cancel Handler] Edit form hidden');
            }
            
            // Prevent event propagation to avoid conflicts with other handlers
            event.stopPropagation();
            event.preventDefault();
        }
    }, true); // Use capture phase to ensure this runs before other handlers
    
    console.log('[Global Cancel Handler] Initialized');
})();
