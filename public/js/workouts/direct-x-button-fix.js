/**
 * Direct X Button Fix
 * This script directly removes X buttons from the Weight Increment section
 * while preserving necessary buttons
 */

(function() {
    // Disable logging to reduce console spam
    const DEBUG = false;

    function log(message, ...args) {
        if (DEBUG) {
            console.log(message, ...args);
        }
    }

    log('[Direct X Button Fix] Script loaded');

    // Function to directly remove X buttons
    function removeXButtons() {
        log('[Direct X Button Fix] Running removal');

        // Find all visible options menus
        const optionsMenus = document.querySelectorAll('.exercise-options-menu.show');

        optionsMenus.forEach(menu => {
            log('[Direct X Button Fix] Processing menu');

            // Find the Weight Increment section
            const weightIncrementLabels = menu.querySelectorAll('.weight-increment-label, .weight-increment-text, .weight-increment-container');

            weightIncrementLabels.forEach(label => {
                log('[Direct X Button Fix] Processing label');

                // Find all buttons inside the label
                const buttons = label.querySelectorAll('button');

                buttons.forEach(button => {
                    log('[Direct X Button Fix] Removing button inside label');
                    button.style.display = 'none';
                    button.style.visibility = 'hidden';
                    button.style.opacity = '0';
                    button.style.position = 'absolute';
                    button.style.top = '-9999px';
                    button.style.left = '-9999px';
                    button.style.zIndex = '-1';
                    button.style.pointerEvents = 'none';

                    // Also try to remove it from the DOM
                    try {
                        button.remove();
                    } catch (e) {
                        log('[Direct X Button Fix] Could not remove button from DOM');
                    }
                });

                // Replace the label's content with plain text
                try {
                    // Create a new text node
                    const textNode = document.createTextNode('Weight Increment:');

                    // Clear the label's content
                    label.innerHTML = '';

                    // Add the text node
                    label.appendChild(textNode);

                    log('[Direct X Button Fix] Replaced label content with plain text');
                } catch (e) {
                    log('[Direct X Button Fix] Could not replace label content');
                }
            });

            // Make sure the main buttons are visible and properly styled
            const mainDeleteButton = menu.querySelector('.button-group-right .btn-delete-exercise');
            if (mainDeleteButton) {
                mainDeleteButton.style.display = 'flex';
                mainDeleteButton.style.visibility = 'visible';
                mainDeleteButton.style.opacity = '1';
                mainDeleteButton.style.position = 'static';
                mainDeleteButton.style.zIndex = 'auto';
                mainDeleteButton.style.pointerEvents = 'auto';

                // Use a simple HTML entity for X
                mainDeleteButton.innerHTML = '&#10005;'; // HTML entity for "✕" (U+2715 MULTIPLICATION X)
                mainDeleteButton.style.fontSize = '0.9rem';
                mainDeleteButton.style.fontWeight = 'bold';
                mainDeleteButton.style.fontFamily = 'Arial, sans-serif';
                mainDeleteButton.style.color = '#f44336';
                mainDeleteButton.style.backgroundColor = 'transparent';
                mainDeleteButton.style.border = '1px solid #f44336';
                mainDeleteButton.style.borderRadius = '4px';
                mainDeleteButton.style.padding = '2px 6px';
                mainDeleteButton.style.textTransform = 'uppercase';
                mainDeleteButton.style.minWidth = '30px';
                mainDeleteButton.style.height = '24px';
                mainDeleteButton.style.lineHeight = '1';

                log('[Direct X Button Fix] Ensured main delete button is visible');
            }

            const editButton = menu.querySelector('.button-group-right .btn-edit-exercise-name');
            if (editButton) {
                editButton.style.display = 'flex';
                editButton.style.visibility = 'visible';
                editButton.style.opacity = '1';
                editButton.style.position = 'static';
                editButton.style.zIndex = 'auto';
                editButton.style.pointerEvents = 'auto';
                log('[Direct X Button Fix] Ensured edit button is visible');
            }

            const viewButton = menu.querySelector('.btn-view-exercise');
            if (viewButton) {
                viewButton.style.display = 'flex';
                viewButton.style.visibility = 'visible';
                viewButton.style.opacity = '1';
                viewButton.style.position = 'static';
                viewButton.style.zIndex = 'auto';
                viewButton.style.pointerEvents = 'auto';
                log('[Direct X Button Fix] Ensured view button is visible');
            }
        });
    }

    // Function to handle options menu opening
    function setupOptionsMenuListener() {
        log('[Direct X Button Fix] Setting up options menu listener');

        // Listen for clicks on the options button
        document.addEventListener('click', event => {
            const target = event.target;

            // Check if the clicked element is an options button
            if (target.classList.contains('btn-exercise-options')) {
                log('[Direct X Button Fix] Options button clicked');

                // Wait for the menu to open
                setTimeout(() => {
                    removeXButtons();
                }, 50);

                // Run again after a longer delay to catch any late-appearing buttons
                setTimeout(() => {
                    removeXButtons();
                }, 200);
            }
        });

        // Also run periodically to catch any menus that might be opened by other means
        // But at a much lower frequency to reduce console spam
        setInterval(() => {
            const visibleMenus = document.querySelectorAll('.exercise-options-menu.show');
            if (visibleMenus.length > 0) {
                log('[Direct X Button Fix] Found visible menus in interval check');
                removeXButtons();
            }
        }, 2000); // Reduced frequency from 500ms to 2000ms
    }

    // Run when the DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('[Direct X Button Fix] DOM loaded');
            setupOptionsMenuListener();
        });
    } else {
        console.log('[Direct X Button Fix] DOM already loaded');
        setupOptionsMenuListener();
    }
})();
