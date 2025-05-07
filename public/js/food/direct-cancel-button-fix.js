/**
 * Direct Cancel Button Fix
 * A simple, direct fix for the cancel button not working on existing recipes
 * when editing an ingredient.
 */

(function() {

    document.addEventListener('click', function(event) {

        if (event.target.classList.contains('cancel-edit-btn') || 
            (event.target.textContent === 'Cancel' && event.target.closest('.edit-ingredient-form'))) {

            event.preventDefault();
            event.stopPropagation();
            
            console.log('[Direct Cancel Button Fix] Cancel button clicked');

            const editForm = event.target.closest('.edit-ingredient-form');
            if (editForm) {

                editForm.style.display = 'none';
                editForm.classList.remove('show-edit-form');
                editForm.classList.add('hide-edit-form');

                editForm.setAttribute('data-force-hidden', 'true');
                
                console.log('[Direct Cancel Button Fix] Edit form hidden');
            }
        }
    }, true); // Use capture phase to ensure this runs before other handlers
    
    console.log('[Direct Cancel Button Fix] Initialized');
})();
