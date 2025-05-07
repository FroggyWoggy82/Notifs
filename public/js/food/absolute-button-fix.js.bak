/**
 * Absolute Button Fix
 * A last-resort solution to ensure only one set of buttons is displayed
 */

(function() {
    console.log('[Absolute Button Fix] Initializing...');

    // Function to remove all but the last set of buttons
    function removeExtraButtons() {
        // Find all visible edit forms
        const visibleForms = document.querySelectorAll('.edit-ingredient-form[style*="display: block"]');
        
        visibleForms.forEach(form => {
            console.log('[Absolute Button Fix] Processing visible form');
            
            // Find all form-actions elements
            const formActions = form.querySelectorAll('.form-actions');
            
            // If there's more than one, remove all but the last one
            if (formActions.length > 1) {
                console.log(`[Absolute Button Fix] Found ${formActions.length} form-actions elements, removing all but the last one`);
                
                // Remove all but the last one
                for (let i = 0; i < formActions.length - 1; i++) {
                    formActions[i].remove();
                }
            }
            
            // Find all standalone buttons
            const standaloneButtons = form.querySelectorAll('button:not(.toggle-detailed-nutrition):not(#show-detailed-nutrition-btn)');
            
            // Find all buttons in the last form-actions
            const lastFormActions = form.querySelector('.form-actions:last-of-type');
            const lastFormActionsButtons = lastFormActions ? lastFormActions.querySelectorAll('button') : [];
            
            // Remove any standalone buttons that are not in the last form-actions
            standaloneButtons.forEach(button => {
                let isInLastFormActions = false;
                
                // Check if this button is in the last form-actions
                if (lastFormActions) {
                    for (let i = 0; i < lastFormActionsButtons.length; i++) {
                        if (button === lastFormActionsButtons[i]) {
                            isInLastFormActions = true;
                            break;
                        }
                    }
                }
                
                // If it's not in the last form-actions, remove it
                if (!isInLastFormActions) {
                    console.log('[Absolute Button Fix] Removing standalone button:', button.textContent);
                    button.remove();
                }
            });
            
            // Make sure the last form-actions is visible
            if (lastFormActions) {
                lastFormActions.style.display = 'flex';
                
                // Make sure the buttons in the last form-actions have event listeners
                const saveButton = lastFormActions.querySelector('.save-ingredient-btn');
                const cancelButton = lastFormActions.querySelector('.cancel-edit-btn');
                
                if (saveButton) {
                    // Remove any existing click handlers
                    const newSaveButton = saveButton.cloneNode(true);
                    saveButton.parentNode.replaceChild(newSaveButton, saveButton);
                    
                    // Add our click handler
                    newSaveButton.addEventListener('click', function() {
                        console.log('[Absolute Button Fix] Save button clicked');
                        
                        // Find the form element
                        const formElement = form.querySelector('form');
                        if (formElement) {
                            // Submit the form
                            formElement.dispatchEvent(new Event('submit'));
                        }
                    });
                }
                
                if (cancelButton) {
                    // Remove any existing click handlers
                    const newCancelButton = cancelButton.cloneNode(true);
                    cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);
                    
                    // Add our click handler
                    newCancelButton.addEventListener('click', function() {
                        console.log('[Absolute Button Fix] Cancel button clicked');
                        form.style.display = 'none';
                    });
                }
            }
        });
    }

    // Function to run periodically
    function runPeriodically() {
        removeExtraButtons();
    }

    // Initialize
    function init() {
        console.log('[Absolute Button Fix] Initializing...');
        
        // Run immediately
        removeExtraButtons();
        
        // Run periodically
        setInterval(runPeriodically, 500);
        
        // Use event delegation to handle edit button clicks
        document.body.addEventListener('click', event => {
            // Check if the click was on an edit button
            if (event.target.classList.contains('edit-ingredient-btn')) {
                console.log('[Absolute Button Fix] Edit button clicked');
                
                // Wait for the form to be displayed
                setTimeout(removeExtraButtons, 100);
                setTimeout(removeExtraButtons, 300);
                setTimeout(removeExtraButtons, 500);
            }
        });
        
        console.log('[Absolute Button Fix] Initialized');
    }
    
    // Initialize when the window is fully loaded
    window.addEventListener('load', function() {
        // Wait a bit to ensure all other scripts have run
        setTimeout(init, 1500);
    });
})();
