/**
 * Fix Edit Button
 * Ensures the edit button for ingredients properly shows the edit form
 */

(function() {
    console.log('[Fix Edit Button] Initializing...');

    function fixEditButtonBehavior() {

        document.body.addEventListener('click', function(event) {

            if (event.target.classList.contains('edit-ingredient-btn')) {
                console.log('[Fix Edit Button] Edit button clicked');

                const row = event.target.closest('tr');
                if (row) {
                    const container = row.closest('.ingredient-details');
                    if (container) {

                        const editForm = container.querySelector('.edit-ingredient-form');
                        if (editForm) {

                            setTimeout(function() {
                                console.log('[Fix Edit Button] Forcing edit form to be visible');

                                editForm.className = 'edit-ingredient-form show-edit-form';

                                editForm.removeAttribute('style');

                                editForm.setAttribute('style', 'display: block !important');

                                const formElements = editForm.querySelectorAll('*');
                                formElements.forEach(el => {
                                    if (el.style.display === 'none') {
                                        el.style.display = '';
                                    }
                                });

                                editForm.scrollIntoView({ behavior: 'smooth' });
                                
                                console.log('[Fix Edit Button] Edit form should now be visible:', editForm);
                            }, 50); // Small delay to ensure DOM has updated
                        }
                    }
                }
            }
        }, true); // Use capture phase to ensure this runs before other handlers
    }

    function removeHidingCssRules() {

        const style = document.createElement('style');
        style.textContent = `
            
            .edit-ingredient-form.show-edit-form {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                pointer-events: auto !important;
            }
            
            
            .edit-ingredient-form.show-edit-form * {
                display: inherit !important;
                visibility: visible !important;
                opacity: 1 !important;
                pointer-events: auto !important;
            }
            
            
            .edit-ingredient-form.show-edit-form input,
            .edit-ingredient-form.show-edit-form button,
            .edit-ingredient-form.show-edit-form select,
            .edit-ingredient-form.show-edit-form textarea,
            .edit-ingredient-form.show-edit-form label {
                display: inline-block !important;
            }
            
            .edit-ingredient-form.show-edit-form h4 {
                display: block !important;
            }
        `;
        document.head.appendChild(style);
        console.log('[Fix Edit Button] Added CSS overrides');
    }

    function init() {
        console.log('[Fix Edit Button] Initializing...');

        removeHidingCssRules();

        fixEditButtonBehavior();
        
        console.log('[Fix Edit Button] Initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
