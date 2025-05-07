/**
 * Disable Original Edit Handler
 * Disables the original edit button handler in food.js to prevent conflicts
 */

(function() {

    const DEBUG = false;

    if (DEBUG) console.log('Initializing disable-original-edit-handler.js');

    const processedButtons = new Set();

    function disableOriginalEditHandler() {

        const editButtons = document.querySelectorAll('.edit-ingredient-btn:not([data-original-handler-disabled="true"])');

        if (editButtons.length === 0) return; // No new buttons to process

        editButtons.forEach(button => {

            if (processedButtons.has(button)) return;

            if (DEBUG) console.log('Disabling original handler for edit button');

            const newButton = button.cloneNode(true);
            if (button.parentNode) {
                button.parentNode.replaceChild(newButton, button);
            }

            newButton.setAttribute('data-original-handler-disabled', 'true');

            processedButtons.add(newButton);
        });
    }

    setTimeout(disableOriginalEditHandler, 500);

    const observer = new MutationObserver(function(mutations) {
        let hasRelevantChanges = false;

        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {

                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && (
                        node.classList?.contains('edit-ingredient-btn') ||
                        node.querySelector?.('.edit-ingredient-btn')
                    )) {
                        hasRelevantChanges = true;
                    }
                });
            }
        });

        if (hasRelevantChanges) {
            setTimeout(disableOriginalEditHandler, 100);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('view-recipe-btn')) {

            setTimeout(disableOriginalEditHandler, 300);
        }
    });

    setInterval(disableOriginalEditHandler, 10000); // Reduced from 2000ms to 10000ms

    if (DEBUG) console.log('disable-original-edit-handler.js initialized');
})();
