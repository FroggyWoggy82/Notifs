/**
 * Fix Form Buttons
 * Ensures only one set of form action buttons is displayed
 */

(function() {
    console.log('[Fix Form Buttons] Initializing...');

    function removeDuplicateButtons() {

        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {

            const formActions = form.querySelectorAll('.form-actions');

            if (formActions.length > 1) {
                console.log(`[Fix Form Buttons] Found ${formActions.length} form action elements in form`);

                for (let i = 0; i < formActions.length - 1; i++) {
                    if (formActions[i] && formActions[i].parentNode) {
                        console.log('[Fix Form Buttons] Removing duplicate form action element');
                        formActions[i].parentNode.removeChild(formActions[i]);
                    }
                }
            }
        });
    }

    function observeDOMChanges() {

        const observer = new MutationObserver(mutations => {
            let needsFixing = false;
            
            mutations.forEach(mutation => {

                if (mutation.addedNodes.length) {

                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node

                            if (node.classList && node.classList.contains('edit-ingredient-form')) {
                                needsFixing = true;
                            } else if (node.querySelector && node.querySelector('.edit-ingredient-form')) {
                                needsFixing = true;
                            }
                        }
                    });
                }
            });

            if (needsFixing) {
                setTimeout(removeDuplicateButtons, 50);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function handleEditButtonClicks() {

        document.body.addEventListener('click', event => {

            if (event.target.classList.contains('edit-ingredient-btn')) {
                console.log('[Fix Form Buttons] Edit button clicked');

                setTimeout(removeDuplicateButtons, 100);

                setTimeout(removeDuplicateButtons, 500);
            }
        });
    }

    function init() {
        console.log('[Fix Form Buttons] Initializing...');

        setTimeout(removeDuplicateButtons, 100);

        handleEditButtonClicks();

        observeDOMChanges();
        
        console.log('[Fix Form Buttons] Initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
