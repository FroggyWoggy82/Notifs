/**
 * Exercise Options Menu Buttons Fix
 * Rearranges the buttons in the exercise options menu to place the X button next to the other buttons
 */

(function() {
    // Function to fix the exercise options menu buttons
    function fixExerciseOptionsMenuButtons() {
        // Find all exercise options menus
        const optionsMenus = document.querySelectorAll('.exercise-options-menu');

        optionsMenus.forEach(menu => {
            // Find the buttons row
            const buttonsRow = menu.querySelector('.exercise-options-menu-row.buttons-row');
            if (!buttonsRow) return;

            // Find the close button
            const closeButton = menu.querySelector('.close-button');
            if (!closeButton) return;

            // Find the delete workout button
            const deleteWorkoutButton = menu.querySelector('.btn-delete-workout') ||
                                       menu.querySelector('button[data-action="delete-workout"]') ||
                                       menu.querySelector('button.delete-workout-btn') ||
                                       Array.from(menu.querySelectorAll('button')).find(btn =>
                                           btn.textContent.trim().toLowerCase().includes('delete workout'));

            // Make sure the close button is in the buttons row
            if (!buttonsRow.contains(closeButton)) {
                buttonsRow.appendChild(closeButton);
            }

            // Make sure the delete workout button is in the buttons row if it exists
            if (deleteWorkoutButton && !buttonsRow.contains(deleteWorkoutButton)) {
                buttonsRow.appendChild(deleteWorkoutButton);
            }

            // Style the close button
            closeButton.style.backgroundColor = '#ffffff';
            closeButton.style.color = '#121212';
            closeButton.style.border = 'none';
            closeButton.style.borderRadius = '4px';
            closeButton.style.width = '24px';
            closeButton.style.height = '24px';
            closeButton.style.fontSize = '14px';
            closeButton.style.display = 'inline-flex';
            closeButton.style.alignItems = 'center';
            closeButton.style.justifyContent = 'center';
            closeButton.style.cursor = 'pointer';
            closeButton.style.transition = 'all 0.2s ease';
            closeButton.style.boxShadow = '0 2px 5px rgba(255, 255, 255, 0.2)';
            closeButton.style.position = 'static';
            closeButton.style.margin = '2px';
            closeButton.style.padding = '0';
            closeButton.style.zIndex = '10';
            closeButton.style.opacity = '1';
            closeButton.style.visibility = 'visible';

            // Style the delete workout button if it exists
            if (deleteWorkoutButton) {
                deleteWorkoutButton.style.display = 'inline-flex';
                deleteWorkoutButton.style.position = 'relative';
                deleteWorkoutButton.style.zIndex = '10';
                deleteWorkoutButton.style.margin = '2px';
                deleteWorkoutButton.style.backgroundColor = '#ffffff';
                deleteWorkoutButton.style.color = '#121212';
            }

            // Style the buttons row
            buttonsRow.style.display = 'flex';
            buttonsRow.style.flexDirection = 'row';
            buttonsRow.style.flexWrap = 'wrap';
            buttonsRow.style.justifyContent = 'center';
            buttonsRow.style.alignItems = 'center';
            buttonsRow.style.gap = '5px';
            buttonsRow.style.padding = '5px';
            buttonsRow.style.width = '100%';
            buttonsRow.style.position = 'relative';

            // Style all buttons in the buttons row
            const buttons = buttonsRow.querySelectorAll('button');
            buttons.forEach(button => {
                button.style.margin = '2px';
                button.style.flexShrink = '0';
                button.style.zIndex = '5';
            });
        });
    }

    // Function to observe DOM changes and fix buttons when the menu appears
    function observeDOMChanges() {
        // Create a MutationObserver to watch for changes to the DOM
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                // Check if any nodes were added
                if (mutation.addedNodes.length) {
                    // Check if any of the added nodes are exercise options menus
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1 && (
                            node.classList && node.classList.contains('exercise-options-menu') ||
                            node.querySelector && node.querySelector('.exercise-options-menu')
                        )) {
                            // Fix the buttons
                            setTimeout(fixExerciseOptionsMenuButtons, 0);
                        }
                    });
                }
            });
        });

        // Start observing the document body for changes
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Run on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            observeDOMChanges();
        });
    } else {
        observeDOMChanges();
    }
})();
