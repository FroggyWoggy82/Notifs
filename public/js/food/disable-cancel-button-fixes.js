/**
 * Disable Cancel Button Fixes
 * Disables all the conflicting scripts that try to modify the cancel button behavior
 * and restores the original simple handler
 */

(function() {

    const DEBUG = false;

    if (DEBUG) console.log('Initializing cancel button fix - disabling conflicting scripts');

    const processedButtons = new Set();

    function applyOriginalCancelHandler() {

        const cancelButtons = document.querySelectorAll('.cancel-edit-btn:not([data-original-handler-applied="true"])');

        if (cancelButtons.length === 0) return; // No new buttons to process

        cancelButtons.forEach(button => {

            if (processedButtons.has(button)) return;

            const newButton = button.cloneNode(true);
            if (button.parentNode) {
                button.parentNode.replaceChild(newButton, button);
            }

            newButton.addEventListener('click', function(event) {

                const editForm = this.closest('.edit-ingredient-form');
                if (editForm) {

                    editForm.style.display = 'none';
                    if (DEBUG) console.log('Edit form hidden by original handler');
                }
            });

            newButton.setAttribute('data-original-handler-applied', 'true');

            processedButtons.add(newButton);
        });
    }

    setTimeout(applyOriginalCancelHandler, 100);

    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-ingredient-btn')) {

            setTimeout(applyOriginalCancelHandler, 200);
        }
    });

    setInterval(applyOriginalCancelHandler, 5000); // Reduced from 1000ms to 5000ms

    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('cancel-edit-btn')) {

            const editForm = event.target.closest('.edit-ingredient-form');
            if (editForm) {

                editForm.style.display = 'none';
                if (DEBUG) console.log('Edit form hidden by global handler');

                event.stopPropagation();
                event.preventDefault();
            }
        }
    }, true); // Use capture phase to ensure this runs before other handlers

    if (DEBUG) console.log('Cancel button fix initialized');
})();
