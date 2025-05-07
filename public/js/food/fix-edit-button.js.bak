/**
 * Fix Edit Button
 * Ensures the edit button for ingredients properly shows the edit form
 */

(function() {
    console.log('[Fix Edit Button] Initializing...');

    // Function to fix the edit button behavior
    function fixEditButtonBehavior() {
        // Use event delegation to handle edit button clicks
        document.body.addEventListener('click', function(event) {
            // Check if the click was on an edit button
            if (event.target.classList.contains('edit-ingredient-btn')) {
                console.log('[Fix Edit Button] Edit button clicked');
                
                // Get the row and container
                const row = event.target.closest('tr');
                if (row) {
                    const container = row.closest('.ingredient-details');
                    if (container) {
                        // Find the edit form
                        const editForm = container.querySelector('.edit-ingredient-form');
                        if (editForm) {
                            // Force the edit form to be visible
                            setTimeout(function() {
                                console.log('[Fix Edit Button] Forcing edit form to be visible');
                                
                                // Remove any CSS classes that might be hiding it
                                editForm.className = 'edit-ingredient-form show-edit-form';
                                
                                // Remove any inline styles
                                editForm.removeAttribute('style');
                                
                                // Set display to block with !important via style attribute
                                editForm.setAttribute('style', 'display: block !important');
                                
                                // Also make sure all elements inside the form are visible
                                const formElements = editForm.querySelectorAll('*');
                                formElements.forEach(el => {
                                    if (el.style.display === 'none') {
                                        el.style.display = '';
                                    }
                                });
                                
                                // Scroll to the form
                                editForm.scrollIntoView({ behavior: 'smooth' });
                                
                                console.log('[Fix Edit Button] Edit form should now be visible:', editForm);
                            }, 50); // Small delay to ensure DOM has updated
                        }
                    }
                }
            }
        }, true); // Use capture phase to ensure this runs before other handlers
    }

    // Function to remove any CSS rules that might be hiding the edit form
    function removeHidingCssRules() {
        // Create a style element to override any CSS rules that hide the edit form
        const style = document.createElement('style');
        style.textContent = `
            /* Override any CSS rules that hide the edit form when it has the show-edit-form class */
            .edit-ingredient-form.show-edit-form {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                pointer-events: auto !important;
            }
            
            /* Make sure all elements inside the form are visible */
            .edit-ingredient-form.show-edit-form * {
                display: inherit !important;
                visibility: visible !important;
                opacity: 1 !important;
                pointer-events: auto !important;
            }
            
            /* Specific overrides for form elements */
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

    // Initialize when the DOM is ready
    function init() {
        console.log('[Fix Edit Button] Initializing...');
        
        // Remove any CSS rules that might be hiding the edit form
        removeHidingCssRules();
        
        // Fix the edit button behavior
        fixEditButtonBehavior();
        
        console.log('[Fix Edit Button] Initialized');
    }
    
    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
