/**
 * Ensure Edit Form Display
 * Ensures the edit form is properly displayed when clicking the Edit button
 */

(function() {

    function ensureEditFormDisplay() {

        document.body.addEventListener('click', function(event) {

            if (event.target.tagName === 'BUTTON' && 
                event.target.textContent === 'Edit' && 
                event.target.closest('tr') && 
                event.target.closest('.ingredient-details')) {
                
                console.log('Edit button clicked in ingredient table, ensuring edit form display');

                const row = event.target.closest('tr');
                if (!row) return;
                
                const container = row.closest('.ingredient-details');
                if (!container) return;
                
                const editForm = container.querySelector('.edit-ingredient-form');
                if (!editForm) return;

                editForm.style.display = 'block';

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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensureEditFormDisplay);
    } else {
        ensureEditFormDisplay();
    }
})();
