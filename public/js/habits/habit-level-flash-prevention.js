/**
 * Habit Level Flash Prevention
 * This script prevents habit levels from flashing to "Level 1" when checked
 * by using CSS and direct DOM manipulation to prevent visual flashing
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Habit Level Flash Prevention] Initializing direct flash prevention...');

    setupDirectFlashPrevention();
});
function setupDirectFlashPrevention() {
    console.log('[Habit Level Flash Prevention] Setting up direct flash prevention...');

    // Create a global MutationObserver to watch for level changes
    const globalObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
                const target = mutation.target.nodeType === Node.TEXT_NODE ? mutation.target.parentElement : mutation.target;

                if (target && target.classList && target.classList.contains('habit-level')) {
                    const newText = target.textContent;

                    // If the level changed to "Level 1" and it's not supposed to be Level 1
                    if (newText === 'Level 1') {
                        const habitElement = target.closest('.habit-item');
                        if (habitElement) {
                            const habitId = habitElement.dataset.habitId;
                            const preservedLevel = target.getAttribute('data-preserved-level');

                            // Check if this habit should have a higher level
                            if (preservedLevel && parseInt(preservedLevel, 10) > 1) {
                                console.log(`[Habit Level Flash Prevention] Preventing flash for habit ${habitId}: Level 1 -> Level ${preservedLevel}`);
                                target.textContent = `Level ${preservedLevel}`;
                                return;
                            }

                            // If no preserved level, check the title for total completions
                            const titleText = target.title || '';
                            const totalCompletionsMatch = titleText.match(/(\d+) total completions/);
                            if (totalCompletionsMatch) {
                                const totalCompletions = parseInt(totalCompletionsMatch[1], 10);
                                if (totalCompletions > 1) {
                                    console.log(`[Habit Level Flash Prevention] Correcting level based on title: Level 1 -> Level ${totalCompletions}`);
                                    target.textContent = `Level ${totalCompletions}`;
                                    target.setAttribute('data-preserved-level', totalCompletions.toString());
                                }
                            }
                        }
                    }
                }
            }
        });
    });

    // Start observing the entire document for level changes
    globalObserver.observe(document.body, {
        childList: true,
        characterData: true,
        subtree: true
    });

    // Add click event listener to preserve levels before checkbox clicks
    document.addEventListener('click', function(event) {
        if (event.target.type === 'checkbox' && event.target.closest('.habit-item')) {
            const habitElement = event.target.closest('.habit-item');
            const levelElement = habitElement.querySelector('.habit-level');

            if (levelElement) {
                const currentLevelText = levelElement.textContent;
                const currentLevelMatch = currentLevelText.match(/Level (\d+)/);
                const currentLevel = currentLevelMatch ? parseInt(currentLevelMatch[1], 10) : 1;

                // Store the current level and enable flash hiding
                levelElement.setAttribute('data-preserved-level', currentLevel.toString());
                levelElement.setAttribute('data-stable-level', currentLevelText);
                levelElement.setAttribute('data-hiding-flash', 'true');

                console.log(`[Habit Level Flash Prevention] Hiding flash for level ${currentLevel}`);

                // Remove the flash hiding after the API call should be complete
                setTimeout(() => {
                    levelElement.removeAttribute('data-preserved-level');
                    levelElement.removeAttribute('data-stable-level');
                    levelElement.removeAttribute('data-hiding-flash');
                    console.log(`[Habit Level Flash Prevention] Flash hiding removed for habit`);
                }, 3000);
            }
        }
    });

    console.log('[Habit Level Flash Prevention] Direct flash prevention setup complete');
}
// Add CSS to prevent flashing
const style = document.createElement('style');
style.textContent = `
    .habit-level {
        transition: all 0.2s ease !important;
    }

    /* Prevent rapid text changes that cause flashing */
    .habit-level[data-preserved-level] {
        transition: none !important;
    }

    /* Hide Level 1 and Level 0 completely to prevent any visual flash */
    .habit-level:has-text("Level 1"),
    .habit-level:has-text("Level 0") {
        opacity: 0 !important;
        transition: opacity 0s !important;
    }

    /* Alternative approach using content filtering */
    .habit-level {
        position: relative;
    }

    .habit-level::before {
        content: attr(data-stable-level);
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: inherit;
        color: inherit;
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 1;
    }

    .habit-level[data-hiding-flash]::before {
        display: flex;
    }

    .habit-level[data-hiding-flash] {
        color: transparent !important;
    }
`;
document.head.appendChild(style);

// Also set up a periodic check to fix any levels that might have been set to Level 1
setInterval(() => {
    const levelElements = document.querySelectorAll('.habit-level');
    levelElements.forEach(levelEl => {
        if (levelEl.textContent === 'Level 1') {
            const titleText = levelEl.title || '';
            const totalCompletionsMatch = titleText.match(/(\d+) total completions/);
            if (totalCompletionsMatch) {
                const totalCompletions = parseInt(totalCompletionsMatch[1], 10);
                if (totalCompletions > 1) {
                    console.log(`[Habit Level Flash Prevention] Periodic fix: Level 1 -> Level ${totalCompletions}`);
                    levelEl.textContent = `Level ${totalCompletions}`;
                }
            }
        }
    });
}, 1000);
