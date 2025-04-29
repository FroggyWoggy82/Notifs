/**
 * Edit Button Fix
 * This script ensures the edit button works correctly by attaching the proper event handler
 */

(function() {
    // Wait for the DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEditButtonFix);
    } else {
        initEditButtonFix();
    }

    function initEditButtonFix() {
        // Create a MutationObserver to watch for new edit buttons being added to the DOM
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        // Check if the added node is an element
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Look for edit buttons within the added node
                            const editButtons = node.querySelectorAll('.btn-edit-exercise-name');

                            if (editButtons.length > 0) {
                                editButtons.forEach(fixEditButton);
                            }

                            // If the node itself is an edit button
                            if (node.classList && node.classList.contains('btn-edit-exercise-name')) {
                                fixEditButton(node);
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

        // Also fix any existing edit buttons
        document.querySelectorAll('.btn-edit-exercise-name').forEach(fixEditButton);

        // Add a click event listener to the document to fix buttons when options menus are opened
        document.addEventListener('click', event => {
            if (event.target.classList.contains('btn-exercise-options')) {
                // Wait for the menu to open
                setTimeout(() => {
                    const visibleMenus = document.querySelectorAll('.exercise-options-menu.show');
                    visibleMenus.forEach(menu => {
                        const editButton = menu.querySelector('.btn-edit-exercise-name');
                        if (editButton) {
                            fixEditButton(editButton);
                        }
                    });
                }, 100);
            }
        });
    }

    function fixEditButton(button) {
        // Store the original click handler
        const originalClickHandler = button.onclick;
        const workoutIndex = button.dataset.workoutIndex;

        // Apply styles directly to ensure visibility
        button.style.display = 'flex';
        button.style.visibility = 'visible';
        button.style.opacity = '1';
        button.style.position = 'static';
        button.style.zIndex = '100';
        button.style.pointerEvents = 'auto';

        // Set the title attribute
        button.title = 'Edit Exercise Name';

        // Ensure the button has the correct click handler
        button.onclick = function(event) {
            event.preventDefault();
            event.stopPropagation();

            // Call the global openExerciseEditModal function if it exists
            if (typeof window.openExerciseEditModal === 'function') {
                window.openExerciseEditModal(parseInt(workoutIndex, 10));
            } else if (typeof originalClickHandler === 'function') {
                originalClickHandler(event);
            }

            // Close the options menu
            const menu = button.closest('.exercise-options-menu');
            if (menu) {
                menu.classList.remove('show');
            }
        };
    }
})();
