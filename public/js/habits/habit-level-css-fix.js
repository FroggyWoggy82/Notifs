/**
 * Habit Level CSS Fix
 *
 * This script adds a CSS rule to prevent the habit level from flashing
 * by adding a transition delay to the text content.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Habit Level CSS Fix] Initializing...');

    // Create a style element
    const style = document.createElement('style');

    // Add CSS rules to prevent the level from flashing
    style.textContent = `
        /* Prevent the level from changing to Level 1 temporarily */
        .habit-level {
            transition: none !important;
        }

        /* Add a small delay before showing any changes to the level text */
        .habit-level.changing {
            visibility: hidden;
        }

        /* Make sure the level is visible after a short delay */
        .habit-level {
            animation: ensureLevelVisible 0.5s forwards;
        }

        @keyframes ensureLevelVisible {
            0% {
                /* No change */
            }
            100% {
                visibility: visible;
            }
        }
    `;

    // Function to monitor changes to habit level elements
    function monitorHabitLevels() {
        // Find all habit level elements
        const habitLevelElements = document.querySelectorAll('.habit-level');

        habitLevelElements.forEach(function(levelElement) {
            // Skip if we've already monitored this element
            if (levelElement.dataset.monitored === 'true') {
                return;
            }

            try {
                // Mark as monitored
                levelElement.dataset.monitored = 'true';

                // Get the current level
                const currentText = levelElement.textContent || '';
                const levelMatch = currentText.match(/Level (\d+)/);
                if (!levelMatch) {
                    return;
                }

                const currentLevel = parseInt(levelMatch[1], 10);

                // Instead of redefining the property, we'll use a more compatible approach
                // We'll add a MutationObserver to watch for changes to the text content
                const textObserver = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        if (mutation.type === 'characterData' || mutation.type === 'childList') {
                            const newText = levelElement.textContent;

                            // If the new text is "Level 1" and the current level is higher, change it back
                            if (newText === 'Level 1' && currentLevel > 1) {
                                console.log(`[Habit Level CSS Fix] Detected change to "Level 1" for a level ${currentLevel} habit, fixing...`);

                                // Add the changing class
                                levelElement.classList.add('changing');

                                // Set a timeout to update the text to the expected new level
                                setTimeout(() => {
                                    // Update to the expected new level (current + 1)
                                    const expectedNewLevel = currentLevel + 1;
                                    levelElement.textContent = `Level ${expectedNewLevel}`;

                                    // Remove the changing class after a short delay
                                    setTimeout(() => {
                                        levelElement.classList.remove('changing');
                                    }, 100);

                                    console.log(`[Habit Level CSS Fix] Updated level to ${expectedNewLevel}`);
                                }, 0);
                            }
                        }
                    });
                });

                // Start observing the level element for changes
                textObserver.observe(levelElement, {
                    characterData: true,
                    childList: true,
                    subtree: true
                });

                // Store the observer in the element's data so we can disconnect it later if needed
                levelElement.dataset.observerId = Date.now().toString();
                window[`observer_${levelElement.dataset.observerId}`] = textObserver;

                console.log(`[Habit Level CSS Fix] Monitoring level element for level ${currentLevel}`);
            } catch (error) {
                console.error('[Habit Level CSS Fix] Error monitoring level element:', error);
            }
        });
    }

    // Monitor habit levels immediately
    monitorHabitLevels();

    // Also monitor habit levels periodically
    setInterval(monitorHabitLevels, 1000);

    // And monitor habit levels when the DOM changes
    const observer = new MutationObserver(function(mutations) {
        monitorHabitLevels();
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    // Add the style element to the head
    document.head.appendChild(style);

    console.log('[Habit Level CSS Fix] Added CSS rules to prevent level flashing');
});
