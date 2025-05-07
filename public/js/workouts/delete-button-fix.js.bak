/**
 * Delete Button Fix
 * This script ensures the delete button remains visible and functional after being clicked
 */

(function() {
    // Wait for the DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDeleteButtonFix);
    } else {
        initDeleteButtonFix();
    }

    function initDeleteButtonFix() {
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
                    const visibleMenus = document.querySelectorAll('.exercise-options-menu.show');
                    visibleMenus.forEach(menu => {
                        const deleteButton = menu.querySelector('.btn-delete-exercise');
                        if (deleteButton) {
                            fixDeleteButton(deleteButton);
                        }
                    });
                }, 100);
            }
        });
    }

    function fixDeleteButton(button) {
        // Store the original click handler and dataset attributes
        const originalClickHandler = button.onclick;
        const workoutIndex = button.dataset.workoutIndex;

        // Apply styles directly to ensure visibility
        button.style.display = 'flex';
        button.style.visibility = 'visible';
        button.style.opacity = '1';
        button.style.position = 'static';
        button.style.zIndex = '100';
        button.style.pointerEvents = 'auto';

        // Use a simple X character
        button.textContent = '×';

        // Apply styles directly
        button.style.fontSize = '1.2rem';
        button.style.fontWeight = 'bold';
        button.style.fontFamily = 'Arial, sans-serif';
        button.style.backgroundColor = '#f44336';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.padding = '0 6px';
        button.style.minWidth = '24px';
        button.style.height = '24px';
        button.style.lineHeight = '24px';
        button.style.color = 'white';
        button.style.textAlign = 'center';
        button.style.cursor = 'pointer';

        // Restore the dataset attributes
        if (workoutIndex) {
            button.dataset.workoutIndex = workoutIndex;
        }

        // Set the title attribute
        button.title = 'Remove Exercise';

        // Ensure the button has the correct click handler
        button.onclick = function(event) {
            event.preventDefault();
            event.stopPropagation();

            // Call the global handleDeleteExercise function if it exists
            if (typeof window.handleDeleteExercise === 'function') {
                window.handleDeleteExercise(event);
            } else if (typeof originalClickHandler === 'function') {
                originalClickHandler(event);
            }

            // Keep the button visible after clicking
            setTimeout(() => {
                button.style.display = 'flex';
                button.style.visibility = 'visible';
                button.style.opacity = '1';
            }, 100);
        };
    }
})();
