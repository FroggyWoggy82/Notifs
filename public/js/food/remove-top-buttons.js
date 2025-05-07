/**
 * Remove Top Buttons
 * Removes any duplicate Save Changes and Cancel buttons at the top of the edit form
 */
document.addEventListener('DOMContentLoaded', function() {

    const DEBUG = false;

    const processedForms = new Set();

    function removeTopButtons() {
        if (DEBUG) console.log('Removing top buttons...');

        const topButtonsContainers = document.querySelectorAll('.edit-ingredient-form-top-buttons');

        topButtonsContainers.forEach(container => {
            if (DEBUG) console.log('Removing top buttons container');
            if (container.parentNode) {
                container.parentNode.removeChild(container);
            }
        });

        document.querySelectorAll('.edit-ingredient-form').forEach(form => {

            if (processedForms.has(form)) return;

            if (DEBUG) console.log('Checking form for direct button children');

            const directButtons = Array.from(form.children).filter(child =>
                child.tagName === 'BUTTON' &&
                !child.classList.contains('toggle-detailed-nutrition') &&
                child.id !== 'show-detailed-nutrition-btn'
            );

            if (DEBUG) console.log('Found direct button children:', directButtons.length);

            directButtons.forEach(button => {
                if (DEBUG) console.log('Removing direct button child');
                button.parentNode.removeChild(button);
            });

            const topDivs = Array.from(form.children).filter(child =>
                child.tagName === 'DIV' &&
                child !== form.querySelector('form') &&
                !child.classList.contains('detailed-nutrition-panel')
            );

            if (DEBUG) console.log('Found potential top divs:', topDivs.length);

            topDivs.forEach(div => {
                const buttons = div.querySelectorAll('button');
                if (buttons.length > 0) {
                    if (DEBUG) console.log('Found buttons in top div');

                    div.parentNode.removeChild(div);
                }
            });

            processedForms.add(form);
        });
    }

    setTimeout(removeTopButtons, 300);

    const observer = new MutationObserver(function(mutations) {
        let hasRelevantChanges = false;

        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {

                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && (
                        node.classList?.contains('edit-ingredient-form') ||
                        node.querySelector?.('.edit-ingredient-form')
                    )) {
                        hasRelevantChanges = true;
                    }
                });
            }
        });

        if (hasRelevantChanges) {
            setTimeout(removeTopButtons, 100);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-ingredient-btn')) {

            setTimeout(removeTopButtons, 200);

            setTimeout(removeTopButtons, 500);
        }
    });

    setInterval(removeTopButtons, 10000); // Reduced from 2000ms to 10000ms

    function removeButtonsByText() {

        const allButtons = document.querySelectorAll('button');

        allButtons.forEach(button => {
            const text = button.textContent.trim();
            if ((text === 'Save Changes' || text === 'Cancel') &&
                !button.closest('.form-actions') &&
                button.closest('.edit-ingredient-form')) {

                if (DEBUG) console.log('Found button by text outside form-actions');

                if (button.parentNode) {
                    button.parentNode.removeChild(button);
                }
            }
        });
    }

    setTimeout(removeButtonsByText, 500);
    setInterval(removeButtonsByText, 5000); // Reduced from 1000ms to 5000ms
});
