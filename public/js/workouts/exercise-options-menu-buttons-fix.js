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

            // Find the delete exercise button
            const deleteExerciseButton = menu.querySelector('.btn-delete-exercise') ||
                                       menu.querySelector('button[data-action="delete-exercise"]') ||
                                       menu.querySelector('button.delete-exercise-btn') ||
                                       menu.querySelector('button:has(i.fa-trash)') ||
                                       menu.querySelector('button:has(i.fa-trash-alt)') ||
                                       Array.from(menu.querySelectorAll('button')).find(btn =>
                                           btn.textContent.trim().toLowerCase().includes('delete exercise') ||
                                           (btn.querySelector('i.fa-trash') || btn.querySelector('i.fa-trash-alt')));

            // Make sure the close button is in the buttons row
            if (!buttonsRow.contains(closeButton)) {
                buttonsRow.appendChild(closeButton);
            }

            // Make sure the delete workout button is in the buttons row if it exists
            if (deleteWorkoutButton && !buttonsRow.contains(deleteWorkoutButton)) {
                buttonsRow.appendChild(deleteWorkoutButton);
            }

            // Make sure the delete exercise button is in the buttons row if it exists
            if (deleteExerciseButton && !buttonsRow.contains(deleteExerciseButton)) {
                buttonsRow.appendChild(deleteExerciseButton);
            }

            // Style the close button with consistent height and spacing
            closeButton.style.backgroundColor = '#ffffff';
            closeButton.style.color = '#121212';
            closeButton.style.border = 'none';
            closeButton.style.borderRadius = '4px';
            closeButton.style.width = 'auto';
            closeButton.style.height = '26px';
            closeButton.style.minHeight = '26px';
            closeButton.style.maxHeight = '26px';
            closeButton.style.fontSize = '14px';
            closeButton.style.display = 'inline-flex';
            closeButton.style.alignItems = 'center';
            closeButton.style.justifyContent = 'center';
            closeButton.style.cursor = 'pointer';
            closeButton.style.transition = 'all 0.2s ease';
            closeButton.style.boxShadow = '0 2px 5px rgba(255, 255, 255, 0.2)';
            closeButton.style.position = 'static';
            closeButton.style.margin = '0';
            closeButton.style.padding = '2px 4px';
            closeButton.style.zIndex = '10';
            closeButton.style.opacity = '1';
            closeButton.style.visibility = 'visible';
            closeButton.style.boxSizing = 'border-box';
            closeButton.style.flexShrink = '0';
            closeButton.style.flexGrow = '1';
            closeButton.style.flexBasis = '0';

            // Style the delete workout button if it exists with consistent height and spacing
            if (deleteWorkoutButton) {
                deleteWorkoutButton.style.display = 'inline-flex';
                deleteWorkoutButton.style.position = 'static';
                deleteWorkoutButton.style.zIndex = '10';
                deleteWorkoutButton.style.margin = '0';
                deleteWorkoutButton.style.padding = '2px 4px';
                deleteWorkoutButton.style.backgroundColor = '#ffffff';
                deleteWorkoutButton.style.color = '#121212';
                deleteWorkoutButton.style.height = '26px';
                deleteWorkoutButton.style.minHeight = '26px';
                deleteWorkoutButton.style.maxHeight = '26px';
                deleteWorkoutButton.style.alignItems = 'center';
                deleteWorkoutButton.style.justifyContent = 'center';
                deleteWorkoutButton.style.boxSizing = 'border-box';
                deleteWorkoutButton.style.flexShrink = '0';
                deleteWorkoutButton.style.flexGrow = '1';
                deleteWorkoutButton.style.flexBasis = '0';
            }

            // Style the delete exercise button if it exists with consistent height and spacing
            if (deleteExerciseButton) {
                deleteExerciseButton.style.display = 'inline-flex';
                deleteExerciseButton.style.position = 'static';
                deleteExerciseButton.style.zIndex = '10';
                deleteExerciseButton.style.margin = '0';
                deleteExerciseButton.style.padding = '2px 4px';
                deleteExerciseButton.style.backgroundColor = '#ffffff';
                deleteExerciseButton.style.color = '#121212';
                deleteExerciseButton.style.opacity = '1';
                deleteExerciseButton.style.visibility = 'visible';
                deleteExerciseButton.style.height = '26px';
                deleteExerciseButton.style.minHeight = '26px';
                deleteExerciseButton.style.maxHeight = '26px';
                deleteExerciseButton.style.alignItems = 'center';
                deleteExerciseButton.style.justifyContent = 'center';
                deleteExerciseButton.style.boxSizing = 'border-box';
                deleteExerciseButton.style.flexShrink = '0';
                deleteExerciseButton.style.flexGrow = '1';
                deleteExerciseButton.style.flexBasis = '0';
            }

            // AGGRESSIVE STYLING: Force buttons row to be a single row with even spacing
            buttonsRow.style.display = 'flex';
            buttonsRow.style.flexDirection = 'row';
            buttonsRow.style.flexWrap = 'nowrap';
            buttonsRow.style.justifyContent = 'space-evenly';
            buttonsRow.style.alignItems = 'center';
            buttonsRow.style.gap = '4px';
            buttonsRow.style.padding = '5px';
            buttonsRow.style.width = '100%';
            buttonsRow.style.position = 'relative';
            buttonsRow.style.minHeight = '32px';
            buttonsRow.style.maxHeight = '40px';
            buttonsRow.style.overflow = 'visible';

            // AGGRESSIVE STYLING: Force all buttons to be inline and visible with consistent height and spacing
            const allButtons = buttonsRow.querySelectorAll('*');
            allButtons.forEach(element => {
                if (element.tagName === 'BUTTON' || element.classList.contains('btn-')) {
                    element.style.display = 'inline-flex';
                    element.style.position = 'static';
                    element.style.float = 'none';
                    element.style.opacity = '1';
                    element.style.visibility = 'visible';
                    element.style.zIndex = '10';
                    element.style.margin = '0';

                    // Reduce padding for Add Video and History buttons
                    if (element.classList.contains('btn-view-exercise') ||
                        element.classList.contains('view-history-btn') ||
                        element.textContent.includes('Add Video') ||
                        element.textContent.includes('History')) {
                        element.style.padding = '2px 2px';
                    } else {
                        element.style.padding = '2px 4px';
                    }

                    element.style.flexShrink = '0';
                    element.style.flexGrow = '1';
                    element.style.flexBasis = '0';
                    element.style.height = '26px';
                    element.style.minHeight = '26px';
                    element.style.maxHeight = '26px';
                    element.style.alignItems = 'center';
                    element.style.justifyContent = 'center';
                    element.style.boxSizing = 'border-box';
                    element.style.top = 'auto';
                    element.style.bottom = 'auto';
                    element.style.left = 'auto';
                    element.style.right = 'auto';
                }
            });

            // Find and force any button groups to be inline
            const buttonGroups = menu.querySelectorAll('.button-group-right');
            buttonGroups.forEach(group => {
                group.style.position = 'static';
                group.style.display = 'inline-flex';
                group.style.flexDirection = 'row';
                group.style.gap = '3px';
                group.style.margin = '0';
                group.style.padding = '0';
                group.style.width = 'auto';
                group.style.height = 'auto';
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
