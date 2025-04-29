/**
 * X Button SVG Fix
 * This script replaces the X character with an SVG icon as a last resort
 */

(function() {
    // Wait for the DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSvgFix);
    } else {
        initSvgFix();
    }

    function initSvgFix() {
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
                                deleteButtons.forEach(replaceSvg);
                            }

                            // If the node itself is a delete button
                            if (node.classList && node.classList.contains('btn-delete-exercise')) {
                                replaceSvg(node);
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
        document.querySelectorAll('.btn-delete-exercise').forEach(replaceSvg);

        // Add a click event listener to the document to fix buttons when options menus are opened
        document.addEventListener('click', event => {
            if (event.target.classList.contains('btn-exercise-options')) {
                // Wait for the menu to open
                setTimeout(() => {
                    document.querySelectorAll('.btn-delete-exercise').forEach(replaceSvg);
                }, 100);
            }
        });
    }

    function replaceSvg(button) {
        // Store the original click handler and dataset attributes
        const originalClickHandler = button.onclick;
        const workoutIndex = button.dataset.workoutIndex;

        // Use a simple HTML entity for X
        button.innerHTML = '&#10005;'; // HTML entity for "✕" (U+2715 MULTIPLICATION X)

        // Apply styles directly
        button.style.fontSize = '0.9rem';
        button.style.fontWeight = 'bold';
        button.style.fontFamily = 'Arial, sans-serif';
        button.style.color = '#f44336';
        button.style.backgroundColor = 'transparent';
        button.style.border = '1px solid #f44336';
        button.style.borderRadius = '4px';
        button.style.padding = '2px 6px';
        button.style.display = 'flex';
        button.style.justifyContent = 'center';
        button.style.alignItems = 'center';
        button.style.cursor = 'pointer';
        button.style.textTransform = 'uppercase';
        button.style.minWidth = '30px';
        button.style.height = '24px';
        button.style.lineHeight = '1';

        // Restore the dataset attributes
        if (workoutIndex) {
            button.dataset.workoutIndex = workoutIndex;
        }

        // Set the title attribute
        button.title = 'Remove Exercise';

        // Add hover effect
        button.addEventListener('mouseover', function() {
            button.style.backgroundColor = '#f44336';
            button.style.color = 'white';
        });

        button.addEventListener('mouseout', function() {
            button.style.backgroundColor = 'transparent';
            button.style.color = '#f44336';
        });

        // Ensure the button has the correct click handler
        button.onclick = function(event) {
            // Call the global handleDeleteExercise function if it exists
            if (typeof window.handleDeleteExercise === 'function') {
                window.handleDeleteExercise(event);
            } else if (typeof originalClickHandler === 'function') {
                originalClickHandler(event);
            }
        };
    }
})();
