/**
 * Create X Button
 * This script creates a proper X button using a different approach
 */

(function() {
    // Wait for the DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCreateX);
    } else {
        initCreateX();
    }

    function initCreateX() {
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
                                deleteButtons.forEach(createXButton);
                            }

                            // If the node itself is a delete button
                            if (node.classList && node.classList.contains('btn-delete-exercise')) {
                                createXButton(node);
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
        document.querySelectorAll('.btn-delete-exercise').forEach(createXButton);

        // Add a click event listener to the document to fix buttons when options menus are opened
        document.addEventListener('click', event => {
            if (event.target.classList.contains('btn-exercise-options')) {
                // Wait for the menu to open
                setTimeout(() => {
                    document.querySelectorAll('.btn-delete-exercise').forEach(createXButton);
                }, 100);
            }
        });
    }

    function createXButton(button) {
        // Store the original click handler
        const originalClickHandler = button.onclick;

        // Store the dataset attributes
        const workoutIndex = button.dataset.workoutIndex;

        // Clear any existing content
        button.innerHTML = '';

        // Create a div to hold our X
        const xContainer = document.createElement('div');
        xContainer.style.position = 'relative';
        xContainer.style.width = '16px';
        xContainer.style.height = '16px';

        // Create the first line of the X
        const line1 = document.createElement('div');
        line1.style.position = 'absolute';
        line1.style.width = '16px';
        line1.style.height = '2px';
        line1.style.backgroundColor = '#f44336';
        line1.style.top = '50%';
        line1.style.left = '0';
        line1.style.transform = 'translateY(-50%) rotate(45deg)';
        line1.style.pointerEvents = 'none'; // Ensure clicks pass through to the button

        // Create the second line of the X
        const line2 = document.createElement('div');
        line2.style.position = 'absolute';
        line2.style.width = '16px';
        line2.style.height = '2px';
        line2.style.backgroundColor = '#f44336';
        line2.style.top = '50%';
        line2.style.left = '0';
        line2.style.transform = 'translateY(-50%) rotate(-45deg)';
        line2.style.pointerEvents = 'none'; // Ensure clicks pass through to the button

        // Add the lines to the container
        xContainer.appendChild(line1);
        xContainer.appendChild(line2);
        xContainer.style.pointerEvents = 'none'; // Ensure clicks pass through to the button

        // Add the container to the button
        button.appendChild(xContainer);

        // Style the button
        button.style.display = 'flex';
        button.style.justifyContent = 'center';
        button.style.alignItems = 'center';
        button.style.backgroundColor = 'transparent';
        button.style.border = 'none';
        button.style.cursor = 'pointer';
        button.style.padding = '4px';

        // Restore the dataset attributes
        if (workoutIndex) {
            button.dataset.workoutIndex = workoutIndex;
        }

        // Set the title attribute
        button.title = 'Remove Exercise';

        // Add hover effect
        button.addEventListener('mouseover', function() {
            line1.style.backgroundColor = '#d32f2f';
            line2.style.backgroundColor = '#d32f2f';
        });

        button.addEventListener('mouseout', function() {
            line1.style.backgroundColor = '#f44336';
            line2.style.backgroundColor = '#f44336';
        });

        // Ensure the button has the correct click handler
        button.onclick = function(event) {
            // Call the original click handler if it exists
            if (typeof window.handleDeleteExercise === 'function') {
                window.handleDeleteExercise(event);
            } else if (typeof originalClickHandler === 'function') {
                originalClickHandler(event);
            }
        };
    }
})();
