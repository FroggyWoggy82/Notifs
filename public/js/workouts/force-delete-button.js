/**
 * Force Delete Button
 * This script forcefully replaces the delete button with a new one that is guaranteed to be visible
 */

(function() {
    // Wait for the DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initForceDeleteButton);
    } else {
        initForceDeleteButton();
    }

    function initForceDeleteButton() {
        // Create a MutationObserver to watch for changes to the DOM
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        // Check if the added node is an element
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Look for delete buttons within the added node
                            const deleteButtons = node.querySelectorAll('.btn-delete-exercise');
                            if (deleteButtons.length > 0) {
                                deleteButtons.forEach(replaceDeleteButton);
                            }

                            // If the node itself is a delete button
                            if (node.classList && node.classList.contains('btn-delete-exercise')) {
                                replaceDeleteButton(node);
                            }
                        }
                    });
                }
            });
        });

        // Start observing the document body for DOM changes
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Replace any existing delete buttons
        document.querySelectorAll('.btn-delete-exercise').forEach(replaceDeleteButton);

        // Add a click event listener to the document to fix buttons when options menus are opened
        document.addEventListener('click', event => {
            if (event.target.classList.contains('btn-exercise-options')) {
                // Wait for the menu to open
                setTimeout(() => {
                    const visibleMenus = document.querySelectorAll('.exercise-options-menu.show');
                    visibleMenus.forEach(menu => {
                        const deleteButton = menu.querySelector('.btn-delete-exercise');
                        if (deleteButton) {
                            replaceDeleteButton(deleteButton);
                        }
                    });
                }, 100);
            }
        });
    }

    function replaceDeleteButton(button) {
        // Get the workout index from the button
        const workoutIndex = button.dataset.workoutIndex;
        if (!workoutIndex) return;

        // Create a new button element
        const newButton = document.createElement('button');
        newButton.type = 'button';
        newButton.className = 'btn-delete-exercise-force';
        newButton.dataset.workoutIndex = workoutIndex;
        newButton.title = 'Remove Exercise';

        // Clear any existing content and set a single X character
        newButton.innerHTML = '';
        newButton.textContent = '×';

        // Style the button
        newButton.style.display = 'flex';
        newButton.style.alignItems = 'center';
        newButton.style.justifyContent = 'center';
        newButton.style.backgroundColor = '#f44336';
        newButton.style.color = 'white';
        newButton.style.border = 'none';
        newButton.style.borderRadius = '4px';
        newButton.style.width = '28px';
        newButton.style.height = '28px';
        newButton.style.fontSize = '1.5rem';
        newButton.style.fontWeight = 'bold';
        newButton.style.cursor = 'pointer';
        newButton.style.marginLeft = '5px';
        newButton.style.zIndex = '1000';

        // Add click handler
        newButton.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();

            // Call the global handleDeleteExercise function
            if (typeof window.handleDeleteExercise === 'function') {
                window.handleDeleteExercise(event);
            }
        });

        // Replace the old button with the new one
        if (button.parentNode) {
            button.parentNode.replaceChild(newButton, button);
        }
    }
})();
