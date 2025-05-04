/**
 * Ensure Edit Form Display
 * Ensures the edit form is properly displayed when clicking the Edit button
 */

(function() {
    // Function to ensure the edit form is displayed
    function ensureEditFormDisplay() {
        // Use event delegation to handle all Edit button clicks in the ingredient table
        document.body.addEventListener('click', function(event) {
            // Check if the clicked element is an Edit button in the ingredient table
            if (event.target.tagName === 'BUTTON' && 
                event.target.textContent === 'Edit' && 
                event.target.closest('tr') && 
                event.target.closest('.ingredient-details')) {
                
                console.log('Edit button clicked in ingredient table, ensuring edit form display');
                
                // Find the edit form
                const row = event.target.closest('tr');
                if (!row) return;
                
                const container = row.closest('.ingredient-details');
                if (!container) return;
                
                const editForm = container.querySelector('.edit-ingredient-form');
                if (!editForm) return;
                
                // Force the edit form to be visible
                editForm.style.display = 'block';
                
                // Try multiple times to ensure the form is displayed
                setTimeout(function() {
                    editForm.style.display = 'block';
                }, 100);
                
                setTimeout(function() {
                    editForm.style.display = 'block';
                }, 300);
                
                setTimeout(function() {
                    editForm.style.display = 'block';
                }, 500);
                
                console.log('Edit form display ensured');
            }
        });
    }
    
    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensureEditFormDisplay);
    } else {
        ensureEditFormDisplay();
    }
})();
