/**
 * Mobile Ellipsis Button Fix
 * Ensures the ellipsis (...) button works properly on mobile devices
 */

(function() {
    'use strict';

    // Log function for debugging
    function log(message) {
        console.log(`[Mobile Ellipsis Fix] ${message}`);
    }

    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     ('ontouchstart' in window);

    if (!isMobile) {
        log('Not a mobile device, skipping mobile fixes');
        return;
    }

    log('Mobile device detected, applying ellipsis button fixes');

    // Initialize the fix
    function init() {
        log('Initializing mobile ellipsis button fix...');

        // Add debugging for existing ellipsis buttons
        setTimeout(() => {
            const existingButtons = document.querySelectorAll('.btn-exercise-options');
            log(`Found ${existingButtons.length} existing ellipsis buttons`);
            existingButtons.forEach((btn, index) => {
                log(`Button ${index}: workoutIndex=${btn.dataset.workoutIndex}, classes=${btn.className}`);
            });
        }, 1000);

        // Add touch event handling specifically for mobile
        document.addEventListener('touchstart', function(event) {
            const target = event.target;
            
            if (target.classList.contains('btn-exercise-options')) {
                log('Ellipsis button touch started');
                // Add visual feedback
                target.style.background = 'rgba(255, 255, 255, 0.3)';
            }
        }, { passive: true });

        document.addEventListener('touchend', function(event) {
            const target = event.target;
            
            if (target.classList.contains('btn-exercise-options')) {
                log('Ellipsis button touch ended');
                
                // Remove visual feedback
                setTimeout(() => {
                    target.style.background = 'rgba(255, 255, 255, 0.1)';
                }, 150);
                
                // Prevent default click behavior
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                
                // Handle the menu toggle manually
                handleEllipsisClick(target);
            }
        }, { passive: false });

        // Also handle regular clicks but with mobile-specific logic
        document.addEventListener('click', function(event) {
            const target = event.target;
            
            if (target.classList.contains('btn-exercise-options')) {
                log('Ellipsis button clicked (fallback)');
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                
                // Small delay to ensure touch events have finished
                setTimeout(() => {
                    handleEllipsisClick(target);
                }, 50);
            }
        }, true); // Use capture phase

        // Set up a MutationObserver to handle dynamically added ellipsis buttons
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if the added node contains ellipsis buttons
                            const ellipsisButtons = node.querySelectorAll ?
                                node.querySelectorAll('.btn-exercise-options') : [];

                            if (ellipsisButtons.length > 0) {
                                log(`Found ${ellipsisButtons.length} new ellipsis buttons`);
                                // Apply mobile-specific styles to new buttons
                                ellipsisButtons.forEach(applyMobileButtonStyles);
                            }

                            // Check if the node itself is an ellipsis button
                            if (node.classList && node.classList.contains('btn-exercise-options')) {
                                log('New ellipsis button added to DOM');
                                applyMobileButtonStyles(node);
                            }
                        }
                    });
                }
            });
        });

        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        log('Mobile ellipsis button fix initialized');
    }

    function applyMobileButtonStyles(button) {
        log('Applying mobile styles to ellipsis button');
        button.style.touchAction = 'manipulation';
        button.style.webkitTouchCallout = 'none';
        button.style.webkitUserSelect = 'none';
        button.style.userSelect = 'none';
        button.style.position = 'relative';
        button.style.zIndex = '15';
    }

    function handleEllipsisClick(button) {
        log('Handling ellipsis button click');
        
        // Get the workout index from the button
        let workoutIndex = button.dataset.workoutIndex || button.dataset.index;
        
        // If no workout index on the button, try to get it from the parent exercise item
        if (!workoutIndex) {
            const exerciseItem = button.closest('.exercise-item');
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
        
        // Toggle this menu
        const isCurrentlyShown = menu.classList.contains('show');
        
        if (isCurrentlyShown) {
            menu.classList.remove('show');
            log('Menu closed');
        } else {
            menu.classList.add('show');
            log('Menu opened');
            
            // Ensure proper positioning on mobile
            ensureMobileMenuPositioning(menu);
        }
    }

    function ensureMobileMenuPositioning(menu) {
        log('Ensuring mobile menu positioning');
        
        // Force the menu to be visible and properly positioned
        menu.style.display = 'block';
        menu.style.position = 'absolute';
        menu.style.zIndex = '1000';
        
        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Get menu dimensions
        const rect = menu.getBoundingClientRect();
        
        // Adjust position if menu goes off screen
        if (rect.right > viewportWidth) {
            menu.style.right = '0';
            menu.style.left = 'auto';
        }
        
        if (rect.bottom > viewportHeight) {
            menu.style.top = 'auto';
            menu.style.bottom = '100%';
        }
        
        log('Mobile menu positioning complete');
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
