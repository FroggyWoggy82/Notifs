/**
 * Fix Options Menu Display
 * This script ensures that the exercise options menu is properly displayed when the ellipsis button is clicked.
 */

(function() {
    'use strict';

    // Log function for debugging
    function log(message) {
        console.log(`[Fix Options Menu Display] ${message}`);
    }

    // Initialize the fix
    function init() {
        log('Initializing...');

        // Detect if we're on a mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                         ('ontouchstart' in window);

        // Add event listener for ellipsis button clicks
        document.addEventListener('click', function(event) {
            const target = event.target;

            // Check if the clicked element is an ellipsis button
            if (target.classList.contains('btn-exercise-options')) {
                log('Ellipsis button clicked');

                // Prevent default behavior and stop propagation for mobile
                if (isMobile) {
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                }

                // Get the workout index from the button
                let workoutIndex = target.dataset.workoutIndex || target.dataset.index;

                // If no workout index on the button, try to get it from the parent exercise item
                if (!workoutIndex) {
                    const exerciseItem = target.closest('.exercise-item');
                    if (exerciseItem) {
                        workoutIndex = exerciseItem.dataset.workoutIndex || exerciseItem.dataset.index;
                    }
                }
                
                // Determine if this is a template or regular exercise
                const isTemplate = !target.dataset.workoutIndex;
                const menuId = isTemplate ? `template-options-menu-${workoutIndex}` : `options-menu-${workoutIndex}`;
                
                // Find the menu element
                const menu = document.getElementById(menuId);
                
                if (!menu) {
                    log(`Options menu not found: ${menuId}`);
                    return;
                }
                
                log(`Found options menu: ${menuId}`);
                
                // Close all other open menus
                document.querySelectorAll('.exercise-options-menu.show').forEach(openMenu => {
                    if (openMenu !== menu) {
                        openMenu.classList.remove('show');
                    }
                });
                
                // Toggle this menu with a slight delay to ensure proper rendering
                setTimeout(() => {
                    menu.classList.toggle('show');
                    
                    // If the menu is now shown, ensure it's properly positioned
                    if (menu.classList.contains('show')) {
                        ensureMenuIsVisible(menu);
                        ensureButtonsAreVisible(menu);
                    }
                }, 10);
                
                // Prevent the click from propagating
                event.stopPropagation();
            }
            
            // Close menus when clicking outside
            if (!event.target.closest('.exercise-options-menu') && 
                !event.target.classList.contains('btn-exercise-options')) {
                document.querySelectorAll('.exercise-options-menu.show').forEach(menu => {
                    menu.classList.remove('show');
                });
            }
        });

        // Add touch event handling for mobile devices
        if (isMobile) {
            log('Adding mobile touch event handlers...');

            document.addEventListener('touchend', function(event) {
                const target = event.target;

                // Check if the touched element is an ellipsis button
                if (target.classList.contains('btn-exercise-options')) {
                    log('Ellipsis button touched on mobile');

                    // Prevent the click event from firing
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();

                    // Get the workout index from the button
                    let workoutIndex = target.dataset.workoutIndex || target.dataset.index;

                    // If no workout index on the button, try to get it from the parent exercise item
                    if (!workoutIndex) {
                        const exerciseItem = target.closest('.exercise-item');
                        if (exerciseItem) {
                            workoutIndex = exerciseItem.dataset.workoutIndex || exerciseItem.dataset.index;
                        }
                    }

                    if (!workoutIndex) {
                        log('Could not find workout index for ellipsis button');
                        return;
                    }

                    log(`Found workout index: ${workoutIndex}`);

                    // Find the corresponding options menu
                    const menu = document.getElementById(`options-menu-${workoutIndex}`);
                    if (!menu) {
                        log(`Could not find options menu with ID: options-menu-${workoutIndex}`);
                        return;
                    }

                    log('Found options menu, toggling...');

                    // Close all other menus first
                    document.querySelectorAll('.exercise-options-menu.show').forEach(otherMenu => {
                        if (otherMenu !== menu) {
                            otherMenu.classList.remove('show');
                        }
                    });

                    // Toggle this menu with a slight delay to ensure proper rendering
                    setTimeout(() => {
                        menu.classList.toggle('show');

                        // If the menu is now shown, ensure it's properly positioned
                        if (menu.classList.contains('show')) {
                            ensureMenuIsVisible(menu);
                            ensureButtonsAreVisible(menu);
                        }
                    }, 10);
                }
            }, { passive: false });
        }

        // Ensure the menu is visible within the viewport
        function ensureMenuIsVisible(menu) {
            const rect = menu.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;
            
            // Check if menu is going off the bottom of the viewport
            if (rect.bottom > viewportHeight) {
                menu.style.top = 'auto';
                menu.style.bottom = '100%';
            }
            
            // Check if menu is going off the right of the viewport
            if (rect.right > viewportWidth) {
                menu.style.right = '0';
                menu.style.left = 'auto';
            }
        }
        
        // Ensure all buttons in the menu are visible
        function ensureButtonsAreVisible(menu) {
            // Make sure the replace exercise buttons are visible
            const replaceButtons = menu.querySelectorAll('.btn-replace-exercise, .btn-replace-exercise-global');
            replaceButtons.forEach(button => {
                button.style.display = 'flex';
                button.style.visibility = 'visible';
                button.style.opacity = '1';
            });
            
            // Make sure the button group is visible
            const buttonGroup = menu.querySelector('.button-group-right');
            if (buttonGroup) {
                buttonGroup.style.display = 'flex';
                buttonGroup.style.visibility = 'visible';
                buttonGroup.style.opacity = '1';
            }
        }
        
        log('Initialized');
    }
    
    // Run the initialization when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
