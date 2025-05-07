/**
 * Direct Cancel Button Fix
 * A simple, direct fix for the cancel button not working on existing recipes
 * when editing an ingredient.
 */

(function() {
    // Use event delegation to catch all cancel button clicks
    document.addEventListener('click', function(event) {
        // Check if the clicked element is a cancel button
        if (event.target.classList.contains('cancel-edit-btn') || 
            (event.target.textContent === 'Cancel' && event.target.closest('.edit-ingredient-form'))) {
            
            // Prevent default behavior and stop propagation to avoid conflicts
            event.preventDefault();
            event.stopPropagation();
            
            console.log('[Direct Cancel Button Fix] Cancel button clicked');
            
            // Find the closest edit form
            const editForm = event.target.closest('.edit-ingredient-form');
            if (editForm) {
                // Hide the form using multiple approaches to ensure it works
                editForm.style.display = 'none';
                editForm.classList.remove('show-edit-form');
                editForm.classList.add('hide-edit-form');
                
                // Add a data attribute to force it to stay hidden
                editForm.setAttribute('data-force-hidden', 'true');
                
                console.log('[Direct Cancel Button Fix] Edit form hidden');
            }
        }
    }, true); // Use capture phase to ensure this runs before other handlers
    
    console.log('[Direct Cancel Button Fix] Initialized');
})();
