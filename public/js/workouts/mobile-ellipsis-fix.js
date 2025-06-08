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
                     ('ontouchstart' in window) || window.innerWidth <= 768;

    log(`Mobile detection: ${isMobile ? 'Mobile device' : 'Desktop device'}`);

    // Track if we've already handled a touch event to prevent duplicate handling
    let touchHandled = false;

    // Initialize the fix
    function init() {
        log('Initializing mobile ellipsis button fix...');

        // Remove any existing event listeners to prevent conflicts
        removeExistingListeners();

        // Add debugging for existing ellipsis buttons
        setTimeout(() => {
            const existingButtons = document.querySelectorAll('.btn-exercise-options');
            log(`Found ${existingButtons.length} existing ellipsis buttons`);
            existingButtons.forEach((btn, index) => {
                log(`Button ${index}: workoutIndex=${btn.dataset.workoutIndex}, classes=${btn.className}`);
                applyMobileButtonStyles(btn);
            });
        }, 500);

        if (isMobile) {
            // For mobile devices, use touch events with better handling
            document.addEventListener('touchstart', handleTouchStart, { passive: true });
            document.addEventListener('touchend', handleTouchEnd, { passive: false });
        }

        // Universal click handler with higher priority
        document.addEventListener('click', handleClick, { capture: true });

        log('Mobile ellipsis button fix initialized');
    }

    function removeExistingListeners() {
        // This helps prevent conflicts with other event handlers
        log('Removing any existing conflicting event listeners');
    }

    function handleTouchStart(event) {
        const target = event.target;

        if (target.classList.contains('btn-exercise-options')) {
            log('Ellipsis button touch started');
            touchHandled = false;
            // Add visual feedback
            target.style.background = 'rgba(255, 255, 255, 0.3)';
            target.style.transform = 'scale(0.95)';
        }
    }

    function handleTouchEnd(event) {
        const target = event.target;

        if (target.classList.contains('btn-exercise-options')) {
            log('Ellipsis button touch ended');

            // Remove visual feedback
            setTimeout(() => {
                target.style.background = 'rgba(255, 255, 255, 0.1)';
                target.style.transform = 'scale(1)';
            }, 150);

            // Prevent default and stop propagation
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            // Mark as handled and trigger the menu
            touchHandled = true;
            handleEllipsisClick(target);
        }
    }

    function handleClick(event) {
        const target = event.target;

        if (target.classList.contains('btn-exercise-options')) {
            log(`Ellipsis button clicked - Mobile: ${isMobile}, TouchHandled: ${touchHandled}`);

            // Prevent default behavior
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            // If this is a mobile device and we already handled the touch, skip
            if (isMobile && touchHandled) {
                log('Skipping click event - already handled by touch');
                touchHandled = false; // Reset for next interaction
                return;
            }

            // Handle the click
            handleEllipsisClick(target);

            // Reset touch handled flag
            touchHandled = false;
        }
    }

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
    }

    function applyMobileButtonStyles(button) {
        log('Applying mobile styles to ellipsis button');

        // Enhanced mobile styles for better touch interaction
        button.style.touchAction = 'manipulation';
        button.style.webkitTouchCallout = 'none';
        button.style.webkitUserSelect = 'none';
        button.style.userSelect = 'none';
        button.style.position = 'relative';
        button.style.zIndex = '15';

        // Ensure button is large enough for touch
        if (isMobile) {
            button.style.minWidth = '44px';
            button.style.minHeight = '44px';
            button.style.padding = '8px';
            button.style.fontSize = '1.2rem';
            button.style.display = 'flex';
            button.style.alignItems = 'center';
            button.style.justifyContent = 'center';
            button.style.cursor = 'pointer';
        }

        // Add a data attribute to mark as processed
        button.setAttribute('data-mobile-enhanced', 'true');
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
            // Try to call the global toggleOptionsMenu function if it exists
            if (typeof window.toggleOptionsMenu === 'function') {
                log('Calling global toggleOptionsMenu function');
                const fakeEvent = { target: button };
                window.toggleOptionsMenu(fakeEvent);
                return;
            }
            return;
        }

        log(`Found workout index: ${workoutIndex}`);

        // Try both possible menu IDs (template and regular)
        let menu = document.getElementById(`options-menu-${workoutIndex}`);
        if (!menu) {
            menu = document.getElementById(`template-options-menu-${workoutIndex}`);
        }

        if (!menu) {
            log(`Could not find options menu with either ID: options-menu-${workoutIndex} or template-options-menu-${workoutIndex}`);
            // Fallback to global function
            if (typeof window.toggleOptionsMenu === 'function') {
                log('Calling global toggleOptionsMenu function as fallback');
                const fakeEvent = { target: button };
                window.toggleOptionsMenu(fakeEvent);
            }
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
            if (isMobile) {
                ensureMobileMenuPositioning(menu);
            }
        }
    }

    function ensureMobileMenuPositioning(menu) {
        log('Ensuring mobile menu positioning');

        // Force the menu to be visible and properly positioned
        menu.style.display = 'block';
        menu.style.position = 'absolute';
        menu.style.zIndex = '1000';
        menu.style.visibility = 'visible';
        menu.style.opacity = '1';

        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Get menu dimensions after a brief delay to ensure rendering
        setTimeout(() => {
            const rect = menu.getBoundingClientRect();

            // Adjust position if menu goes off screen
            if (rect.right > viewportWidth) {
                menu.style.right = '10px';
                menu.style.left = 'auto';
            }

            if (rect.bottom > viewportHeight) {
                menu.style.top = 'auto';
                menu.style.bottom = '100%';
            }

            // Ensure menu is not too wide for mobile
            if (rect.width > viewportWidth - 20) {
                menu.style.maxWidth = `${viewportWidth - 20}px`;
                menu.style.width = '95vw';
            }

            log('Mobile menu positioning complete');
        }, 10);
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
