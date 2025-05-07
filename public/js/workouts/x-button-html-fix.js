/**
 * X Button HTML Fix
 * This script directly modifies the HTML of the delete button to ensure the X character is displayed correctly
 */

(function() {

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initXButtonFix);
    } else {
        initXButtonFix();
    }

    function initXButtonFix() {

        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {

                        if (node.nodeType === Node.ELEMENT_NODE) {

                            const deleteButtons = node.querySelectorAll('.btn-delete-exercise');

                            if (deleteButtons.length > 0) {
                                deleteButtons.forEach(fixDeleteButton);
                            }

                            if (node.classList && node.classList.contains('btn-delete-exercise')) {
                                fixDeleteButton(node);
                            }
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        document.querySelectorAll('.btn-delete-exercise').forEach(fixDeleteButton);

        document.addEventListener('click', event => {
            if (event.target.classList.contains('btn-exercise-options')) {

                setTimeout(() => {
                    document.querySelectorAll('.btn-delete-exercise').forEach(fixDeleteButton);
                }, 100);
            }
        });
    }

    function fixDeleteButton(button) {




        const useIcon = true; // Set to false to use text instead of icon

        button.innerHTML = '&#10005;'; // HTML entity for "✕" (U+2715 MULTIPLICATION X)
        button.style.fontSize = '0.9rem';
        button.style.fontWeight = 'bold';
        button.style.fontFamily = 'Arial, sans-serif';
        button.style.backgroundColor = 'transparent';
        button.style.border = '1px solid #f44336';
        button.style.borderRadius = '4px';
        button.style.padding = '2px 6px';
        button.style.textTransform = 'uppercase';
        button.style.minWidth = '30px';
        button.style.height = '24px';
        button.style.lineHeight = '1';

        button.style.color = '#f44336';
        button.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        button.style.lineHeight = '1';
        button.style.display = 'flex';
        button.style.justifyContent = 'center';
        button.style.alignItems = 'center';
        button.style.textAlign = 'center';
        button.style.fontWeight = 'bold';

        button.title = 'Remove Exercise';
    }
})();
