/**
 * Mobile Exercise Buttons Visibility Fix
 * Ensures Replace Exercise, Replace Globally, and Delete Exercise buttons are visible on mobile
 */

(function() {
    'use strict';

    let isInitialized = false;

    function log(message) {
        console.log('[Mobile Exercise Buttons Fix]', message);
    }

    // Force visibility of exercise option buttons
    function forceButtonVisibility() {
        const exerciseMenus = document.querySelectorAll('.exercise-options-menu');
        
        exerciseMenus.forEach(menu => {
            // Find all the buttons that should be visible
            const addVideoButton = menu.querySelector('.btn-view-exercise');
            const historyButton = menu.querySelector('.view-history-btn');
            const targetButton = menu.querySelector('.btn-edit-target-sets-reps');
            const editButton = menu.querySelector('.btn-edit-exercise-name');
            const replaceButton = menu.querySelector('.btn-replace-exercise');
            const replaceGlobalButton = menu.querySelector('.btn-replace-exercise-global');
            const deleteButton = menu.querySelector('.btn-delete-exercise');
            const buttonGroup = menu.querySelector('.button-group-right');

            // Force visibility for button group
            if (buttonGroup) {
                buttonGroup.style.display = 'flex';
                buttonGroup.style.visibility = 'visible';
                buttonGroup.style.opacity = '1';
                buttonGroup.style.position = 'static';
                buttonGroup.style.zIndex = '10';
            }

            // Force visibility for individual buttons
            [addVideoButton, historyButton, targetButton, editButton, replaceButton, replaceGlobalButton, deleteButton].forEach(button => {
                if (button) {
                    button.style.display = 'inline-flex';
                    button.style.visibility = 'visible';
                    button.style.opacity = '1';
                    button.style.position = 'static';
                    button.style.zIndex = '15';
                    
                    // Ensure proper mobile styling
                    if (window.innerWidth <= 768) {
                        button.style.minWidth = '36px';
                        button.style.minHeight = '36px';
                        button.style.padding = '6px 8px';
                        button.style.margin = '2px';
                        button.style.fontSize = '0.8rem';
                        button.style.borderRadius = '6px';
                        button.style.border = '1px solid #ddd';
                        button.style.cursor = 'pointer';
                        button.style.touchAction = 'manipulation';
                    }
                }
            });
        });
    }

    // Handle menu opening events
    function handleMenuOpen() {
        document.addEventListener('click', function(event) {
            if (event.target.classList.contains('btn-exercise-options')) {
                // Wait for menu to open, then force button visibility
                setTimeout(() => {
                    forceButtonVisibility();
                    log('Forced button visibility after menu open');
                }, 100);
            }
        });
    }

    // Observe DOM changes to catch dynamically added menus
    function observeMenuChanges() {
        const observer = new MutationObserver(function(mutations) {
            let shouldUpdate = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.classList && node.classList.contains('exercise-options-menu')) {
                                shouldUpdate = true;
                            } else if (node.querySelector && node.querySelector('.exercise-options-menu')) {
                                shouldUpdate = true;
                            }
                        }
                    });
                }
                
                if (mutation.type === 'attributes' && 
                    mutation.target.classList && 
                    mutation.target.classList.contains('exercise-options-menu') &&
                    mutation.attributeName === 'class') {
                    shouldUpdate = true;
                }
            });
            
            if (shouldUpdate) {
                setTimeout(forceButtonVisibility, 50);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style']
        });
    }

    // Check for missing buttons and recreate them if necessary
    function ensureButtonsExist() {
        const exerciseMenus = document.querySelectorAll('.exercise-options-menu');
        
        exerciseMenus.forEach(menu => {
            const buttonsRow = menu.querySelector('.exercise-options-menu-row.buttons-row');
            if (!buttonsRow) return;

            let buttonGroup = menu.querySelector('.button-group-right');
            
            // Create button group if it doesn't exist
            if (!buttonGroup) {
                buttonGroup = document.createElement('div');
                buttonGroup.className = 'button-group-right';
                buttonsRow.appendChild(buttonGroup);
                log('Created missing button group');
            }

            // Get workout index from the menu ID or parent
            const menuId = menu.id;
            const workoutIndex = menuId ? menuId.replace('options-menu-', '') : '0';

            // Check for missing buttons and create them
            const buttonConfigs = [
                {
                    className: 'btn-edit-exercise-name',
                    title: 'Edit Exercise Name',
                    text: '✏️',
                    attributes: { 'data-workout-index': workoutIndex }
                },
                {
                    className: 'btn-replace-exercise',
                    title: 'Replace Exercise',
                    text: '🔄',
                    attributes: { 
                        'data-workout-index': workoutIndex,
                        'data-exercise-id': menu.dataset.exerciseId || ''
                    }
                },
                {
                    className: 'btn-replace-exercise-global',
                    title: 'Replace Exercise Globally',
                    text: '🌐',
                    attributes: { 
                        'data-workout-index': workoutIndex,
                        'data-exercise-id': menu.dataset.exerciseId || ''
                    }
                },
                {
                    className: 'btn-delete-exercise',
                    title: 'Remove Exercise',
                    text: '×',
                    attributes: { 'data-workout-index': workoutIndex }
                }
            ];

            buttonConfigs.forEach(config => {
                let button = buttonGroup.querySelector(`.${config.className}`);
                
                if (!button) {
                    button = document.createElement('button');
                    button.type = 'button';
                    button.className = config.className;
                    button.title = config.title;
                    button.textContent = config.text;
                    
                    // Set attributes
                    Object.keys(config.attributes).forEach(attr => {
                        button.setAttribute(attr, config.attributes[attr]);
                    });
                    
                    buttonGroup.appendChild(button);
                    log(`Created missing ${config.className} button`);
                }
            });
        });
    }

    // Handle window resize to reapply mobile styles
    function handleResize() {
        if (window.innerWidth <= 768) {
            setTimeout(forceButtonVisibility, 100);
        }
    }

    // Initialize the fix
    function init() {
        if (isInitialized) return;
        
        log('Initializing mobile exercise buttons visibility fix...');
        
        // Initial setup
        setTimeout(() => {
            ensureButtonsExist();
            forceButtonVisibility();
        }, 500);

        // Set up event handlers
        handleMenuOpen();
        observeMenuChanges();
        
        // Handle window resize
        window.addEventListener('resize', handleResize);
        
        // Periodic check to ensure buttons remain visible
        setInterval(() => {
            if (window.innerWidth <= 768) {
                forceButtonVisibility();
            }
        }, 5000);
        
        isInitialized = true;
        log('Mobile exercise buttons visibility fix initialized');
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Also initialize when the page becomes visible (for mobile app scenarios)
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden && window.innerWidth <= 768) {
            setTimeout(forceButtonVisibility, 200);
        }
    });

    // Export for manual testing
    window.MobileExerciseButtonsFix = {
        forceButtonVisibility,
        ensureButtonsExist,
        init
    };

})();
