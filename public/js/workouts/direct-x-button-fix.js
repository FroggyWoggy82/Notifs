/**
 * Direct X Button Fix
 * This script directly removes X buttons from the Weight Increment section
 * while preserving necessary buttons
 */

(function() {

    const DEBUG = false;

    function log(message, ...args) {
        if (DEBUG) {
            console.log(message, ...args);
        }
    }

    log('[Direct X Button Fix] Script loaded');

    function removeXButtons() {
        log('[Direct X Button Fix] Running removal');

        const optionsMenus = document.querySelectorAll('.exercise-options-menu.show');

        optionsMenus.forEach(menu => {
            log('[Direct X Button Fix] Processing menu');

            const weightIncrementLabels = menu.querySelectorAll('.weight-increment-label, .weight-increment-text, .weight-increment-container');

            weightIncrementLabels.forEach(label => {
                log('[Direct X Button Fix] Processing label');

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

                    try {
                        button.remove();
                    } catch (e) {
                        log('[Direct X Button Fix] Could not remove button from DOM');
                    }
                });

                try {

                    const textNode = document.createTextNode('Weight Increment:');

                    label.innerHTML = '';

                    label.appendChild(textNode);

                    log('[Direct X Button Fix] Replaced label content with plain text');
                } catch (e) {
                    log('[Direct X Button Fix] Could not replace label content');
                }
            });

            const mainDeleteButton = menu.querySelector('.button-group-right .btn-delete-exercise');
            if (mainDeleteButton) {
                mainDeleteButton.style.display = 'flex';
                mainDeleteButton.style.visibility = 'visible';
                mainDeleteButton.style.opacity = '1';
                mainDeleteButton.style.position = 'static';
                mainDeleteButton.style.zIndex = 'auto';
                mainDeleteButton.style.pointerEvents = 'auto';

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

    function setupOptionsMenuListener() {
        log('[Direct X Button Fix] Setting up options menu listener');

        document.addEventListener('click', event => {
            const target = event.target;

            if (target.classList.contains('btn-exercise-options')) {
                log('[Direct X Button Fix] Options button clicked');

                setTimeout(() => {
                    removeXButtons();
                }, 50);

                setTimeout(() => {
                    removeXButtons();
                }, 200);
            }
        });


        setInterval(() => {
            const visibleMenus = document.querySelectorAll('.exercise-options-menu.show');
            if (visibleMenus.length > 0) {
                log('[Direct X Button Fix] Found visible menus in interval check');
                removeXButtons();
            }
        }, 2000); // Reduced frequency from 500ms to 2000ms
    }

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
