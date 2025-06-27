/**
 * Habit Level Color Fix
 * Prevents level text from flashing black when habit buttons are pressed on mobile
 */

(function() {
    'use strict';

    // Initialize the fix when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHabitLevelColorFix);
    } else {
        initHabitLevelColorFix();
    }

    function initHabitLevelColorFix() {
        console.log('[Habit Level Color Fix] Initializing...');

        // Apply fix to existing habit items
        applyLevelColorFix();

        // Watch for new habit items being added
        observeHabitChanges();

        // Add global event listeners to prevent color changes
        addGlobalEventListeners();

        console.log('[Habit Level Color Fix] Initialized successfully');
    }

    function applyLevelColorFix() {
        const habitItems = document.querySelectorAll('.habit-item');
        
        habitItems.forEach(habitItem => {
            const levelElement = habitItem.querySelector('.habit-level');
            if (levelElement) {
                // Force stable color styling
                stabilizeLevelColors(levelElement);
                
                // Add event listeners to prevent color changes
                addLevelProtection(levelElement, habitItem);
            }
        });
    }

    function stabilizeLevelColors(levelElement) {
        // Remove any existing transition styles
        levelElement.style.transition = 'none';
        levelElement.style.webkitTransition = 'none';
        levelElement.style.mozTransition = 'none';
        levelElement.style.msTransition = 'none';
        levelElement.style.oTransition = 'none';

        // Force white text color
        levelElement.style.color = 'white';
        levelElement.style.setProperty('color', 'white', 'important');

        // Determine and set the correct background color based on level class
        const levelClasses = ['level-beginner', 'level-intermediate', 'level-advanced', 'level-expert', 'level-master'];
        let backgroundColor = '#00796B'; // default

        if (levelElement.classList.contains('level-intermediate')) {
            backgroundColor = '#0277BD';
        } else if (levelElement.classList.contains('level-advanced')) {
            backgroundColor = '#7B1FA2';
        } else if (levelElement.classList.contains('level-expert')) {
            backgroundColor = '#C62828';
        } else if (levelElement.classList.contains('level-master')) {
            backgroundColor = '#F57F17';
        }

        levelElement.style.backgroundColor = backgroundColor;
        levelElement.style.setProperty('background-color', backgroundColor, 'important');
    }

    function addLevelProtection(levelElement, habitItem) {
        // Prevent any color changes on various events
        const events = ['mousedown', 'mouseup', 'touchstart', 'touchend', 'click', 'focus', 'blur', 'hover'];
        
        events.forEach(eventType => {
            levelElement.addEventListener(eventType, function(e) {
                // Immediately restore correct colors
                setTimeout(() => {
                    stabilizeLevelColors(levelElement);
                }, 0);
            }, { passive: true });

            // Also add to parent habit item
            habitItem.addEventListener(eventType, function(e) {
                const level = habitItem.querySelector('.habit-level');
                if (level) {
                    setTimeout(() => {
                        stabilizeLevelColors(level);
                    }, 0);
                }
            }, { passive: true });
        });

        // Use MutationObserver to watch for style changes
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const currentColor = levelElement.style.color;
                    if (currentColor && currentColor !== 'white' && !currentColor.includes('255, 255, 255')) {
                        stabilizeLevelColors(levelElement);
                    }
                }
            });
        });

        observer.observe(levelElement, {
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    }

    function addGlobalEventListeners() {
        // Global click interceptor to prevent unwanted state changes
        document.addEventListener('click', function(e) {
            // Check if click is on or near a habit item
            const habitItem = e.target.closest('.habit-item');
            if (habitItem) {
                // Delay to allow other handlers to run first
                setTimeout(() => {
                    const levelElement = habitItem.querySelector('.habit-level');
                    if (levelElement) {
                        stabilizeLevelColors(levelElement);
                    }
                }, 10);
            }
        }, { passive: true });

        // Global touch event handlers for mobile
        document.addEventListener('touchstart', function(e) {
            const habitItem = e.target.closest('.habit-item');
            if (habitItem) {
                setTimeout(() => {
                    const levelElement = habitItem.querySelector('.habit-level');
                    if (levelElement) {
                        stabilizeLevelColors(levelElement);
                    }
                }, 10);
            }
        }, { passive: true });

        document.addEventListener('touchend', function(e) {
            const habitItem = e.target.closest('.habit-item');
            if (habitItem) {
                setTimeout(() => {
                    const levelElement = habitItem.querySelector('.habit-level');
                    if (levelElement) {
                        stabilizeLevelColors(levelElement);
                    }
                }, 10);
            }
        }, { passive: true });
    }

    function observeHabitChanges() {
        // Watch for new habit items being added to the DOM
        const habitListContainer = document.getElementById('habitList');
        if (!habitListContainer) return;

        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the added node is a habit item or contains habit items
                        const habitItems = node.classList && node.classList.contains('habit-item') 
                            ? [node] 
                            : node.querySelectorAll ? node.querySelectorAll('.habit-item') : [];

                        habitItems.forEach(habitItem => {
                            const levelElement = habitItem.querySelector('.habit-level');
                            if (levelElement) {
                                stabilizeLevelColors(levelElement);
                                addLevelProtection(levelElement, habitItem);
                            }
                        });
                    }
                });
            });
        });

        observer.observe(habitListContainer, {
            childList: true,
            subtree: true
        });
    }

    // Periodic check to ensure colors remain stable
    setInterval(function() {
        const levelElements = document.querySelectorAll('.habit-level');
        levelElements.forEach(levelElement => {
            const currentColor = window.getComputedStyle(levelElement).color;
            // Check if color is not white (allowing for different white representations)
            if (!currentColor.includes('255, 255, 255') && currentColor !== 'white' && currentColor !== 'rgb(255, 255, 255)') {
                stabilizeLevelColors(levelElement);
            }
        });
    }, 1000);

})();
