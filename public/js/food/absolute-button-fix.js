/**
 * Absolute Button Fix
 * A last-resort solution to ensure only one set of buttons is displayed
 */

(function() {
    console.log('[Absolute Button Fix] Initializing...');

    function removeExtraButtons() {

        const visibleForms = document.querySelectorAll('.edit-ingredient-form[style*="display: block"]');
        
        visibleForms.forEach(form => {
            console.log('[Absolute Button Fix] Processing visible form');

            const formActions = form.querySelectorAll('.form-actions');

            if (formActions.length > 1) {
                console.log(`[Absolute Button Fix] Found ${formActions.length} form-actions elements, removing all but the last one`);

                for (let i = 0; i < formActions.length - 1; i++) {
                    formActions[i].remove();
                }
            }

            const standaloneButtons = form.querySelectorAll('button:not(.toggle-detailed-nutrition):not(#show-detailed-nutrition-btn)');

            const lastFormActions = form.querySelector('.form-actions:last-of-type');
            const lastFormActionsButtons = lastFormActions ? lastFormActions.querySelectorAll('button') : [];

            standaloneButtons.forEach(button => {
                let isInLastFormActions = false;

                if (lastFormActions) {
                    for (let i = 0; i < lastFormActionsButtons.length; i++) {
                        if (button === lastFormActionsButtons[i]) {
                            isInLastFormActions = true;
                            break;
                        }
                    }
                }

                if (!isInLastFormActions) {
                    console.log('[Absolute Button Fix] Removing standalone button:', button.textContent);
                    button.remove();
                }
            });

            if (lastFormActions) {
                lastFormActions.style.display = 'flex';

                const saveButton = lastFormActions.querySelector('.save-ingredient-btn');
                const cancelButton = lastFormActions.querySelector('.cancel-edit-btn');
                
                if (saveButton) {

                    const newSaveButton = saveButton.cloneNode(true);
                    saveButton.parentNode.replaceChild(newSaveButton, saveButton);

                    newSaveButton.addEventListener('click', function() {
                        console.log('[Absolute Button Fix] Save button clicked');

                        const formElement = form.querySelector('form');
                        if (formElement) {

                            formElement.dispatchEvent(new Event('submit'));
                        }
                    });
                }
                
                if (cancelButton) {

                    const newCancelButton = cancelButton.cloneNode(true);
                    cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);

                    newCancelButton.addEventListener('click', function() {
                        console.log('[Absolute Button Fix] Cancel button clicked');
                        form.style.display = 'none';
                    });
                }
            }
        });
    }

    function runPeriodically() {
        removeExtraButtons();
    }

    function init() {
        console.log('[Absolute Button Fix] Initializing...');

        removeExtraButtons();

        setInterval(runPeriodically, 500);

        document.body.addEventListener('click', event => {

            if (event.target.classList.contains('edit-ingredient-btn')) {
                console.log('[Absolute Button Fix] Edit button clicked');

                setTimeout(removeExtraButtons, 100);
                setTimeout(removeExtraButtons, 300);
                setTimeout(removeExtraButtons, 500);
            }
        });
        
        console.log('[Absolute Button Fix] Initialized');
    }

    window.addEventListener('load', function() {

        setTimeout(init, 1500);
    });
})();
