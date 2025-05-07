/**
 * X Button HTML Fix
 * This script directly modifies the HTML of the delete button to ensure the X character is displayed correctly
 */

(function() {
    // Wait for the DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initXButtonFix);
    } else {
        initXButtonFix();
    }

    function initXButtonFix() {
        // Create a MutationObserver to watch for new delete buttons being added to the DOM
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        // Check if the added node is an element
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Look for delete buttons within the added node
                            const deleteButtons = node.querySelectorAll('.btn-delete-exercise');

                            if (deleteButtons.length > 0) {
                                deleteButtons.forEach(fixDeleteButton);
                            }

                            // If the node itself is a delete button
                            if (node.classList && node.classList.contains('btn-delete-exercise')) {
                                fixDeleteButton(node);
                            }
                        }
                    });
                }
            });
        });

        // Start observing the entire document
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Also fix any existing delete buttons
        document.querySelectorAll('.btn-delete-exercise').forEach(fixDeleteButton);

        // Add a click event listener to the document to fix buttons when options menus are opened
        document.addEventListener('click', event => {
            if (event.target.classList.contains('btn-exercise-options')) {
                // Wait for the menu to open
                setTimeout(() => {
                    document.querySelectorAll('.btn-delete-exercise').forEach(fixDeleteButton);
                }, 100);
            }
        });
    }

    function fixDeleteButton(button) {
        // Use a different character that's more likely to display correctly
        // Using "✕" (U+2715 MULTIPLICATION X) instead of "×" (U+00D7 MULTIPLICATION SIGN)
        // Or use a simple text "DEL" as fallback

        // Try different approaches
        const useIcon = true; // Set to false to use text instead of icon

        // Use a simple HTML entity for X
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

        // Apply styles directly
        button.style.color = '#f44336';
        button.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        button.style.lineHeight = '1';
        button.style.display = 'flex';
        button.style.justifyContent = 'center';
        button.style.alignItems = 'center';
        button.style.textAlign = 'center';
        button.style.fontWeight = 'bold';

        // Set the title attribute
        button.title = 'Remove Exercise';
    }
})();
