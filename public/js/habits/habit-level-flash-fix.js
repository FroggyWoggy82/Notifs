/**
 * Habit Level Flash Fix
 *
 * This script fixes the issue where habit levels flash to level 1 before showing the true level
 * when a habit is checked. It ensures the level is updated correctly without flashing.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Habit Level Flash Fix] Initializing...');

    // Store the original handleHabitCheckboxClick function if it exists
    const originalHandleHabitCheckboxClick = window.handleHabitCheckboxClick;

    // Override the handleHabitCheckboxClick function
    window.handleHabitCheckboxClick = async function(habitId, isChecked) {
        console.log(`[Habit Level Flash Fix] Intercepted habit checkbox click for habit ${habitId}, isChecked=${isChecked}`);

        // Get the habit element
        const habitElement = document.querySelector(`.habit-item[data-habit-id="${habitId}"]`);
        if (!habitElement) {
            console.error(`[Habit Level Flash Fix] Habit element with ID ${habitId} not found`);
            // Fall back to original function if it exists
            if (originalHandleHabitCheckboxClick) {
                return originalHandleHabitCheckboxClick(habitId, isChecked);
            }
            return;
        }

        // Get the level element
        const levelElement = habitElement.querySelector('.habit-level');
        if (!levelElement) {
            console.error(`[Habit Level Flash Fix] Level element for habit ${habitId} not found`);
            // Fall back to original function if it exists
            if (originalHandleHabitCheckboxClick) {
                return originalHandleHabitCheckboxClick(habitId, isChecked);
            }
            return;
        }

        // Store the current level information before any changes
        const currentText = levelElement.textContent || '';
        const currentTitle = levelElement.title || '';
        const currentClasses = [...levelElement.classList];

        // If checking the habit, we need to preserve the current level
        if (isChecked) {
            // Extract the current level from the text
            const levelMatch = currentText.match(/Level (\d+)/);
            if (levelMatch) {
                const currentLevel = parseInt(levelMatch[1], 10);
                console.log(`[Habit Level Flash Fix] Current level is ${currentLevel}`);

                // Create a patch for the original function to prevent it from changing the level display
                const originalSetLevelText = levelElement.textContent;
                const originalSetLevelTitle = levelElement.title;
                const originalSetLevelClasses = [...levelElement.classList];

                // Call the original function
                if (originalHandleHabitCheckboxClick) {
                    // We'll use a timeout to let the original function run first
                    setTimeout(() => {
                        // Now restore the original level display
                        levelElement.textContent = originalSetLevelText;
                        levelElement.title = originalSetLevelTitle;

                        // Restore the original classes
                        levelElement.classList.remove('level-1', 'level-3', 'level-5', 'level-10');
                        originalSetLevelClasses.forEach(cls => {
                            if (cls.startsWith('level-')) {
                                levelElement.classList.add(cls);
                            }
                        });

                        console.log(`[Habit Level Flash Fix] Preserved level display at ${originalSetLevelText}`);

                        // Now make the API call to get the updated level
                        fetch(`/api/habits/${habitId}?_=${new Date().getTime()}`)
                            .then(response => response.json())
                            .then(habitData => {
                                if (habitData && habitData.total_completions !== undefined) {
                                    // Update the level element with the correct level from the server
                                    levelElement.textContent = `Level ${habitData.total_completions}`;
                                    levelElement.title = `${habitData.total_completions} total completions`;

                                    // Update the level class
                                    levelElement.classList.remove('level-1', 'level-3', 'level-5', 'level-10');
                                    let newLevelClass = 'level-1';
                                    if (habitData.total_completions >= 10) {
                                        newLevelClass = 'level-10';
                                    } else if (habitData.total_completions >= 5) {
                                        newLevelClass = 'level-5';
                                    } else if (habitData.total_completions >= 3) {
                                        newLevelClass = 'level-3';
                                    }
                                    levelElement.classList.add(newLevelClass);

                                    console.log(`[Habit Level Flash Fix] Updated to correct level ${habitData.total_completions} from server`);
                                }
                            })
                            .catch(error => {
                                console.error('[Habit Level Flash Fix] Error fetching updated habit data:', error);
                            });
                    }, 0);

                    return originalHandleHabitCheckboxClick(habitId, isChecked);
                }
            } else {
                console.warn(`[Habit Level Flash Fix] Could not extract current level from text: ${currentText}`);
                // Fall back to original function
                if (originalHandleHabitCheckboxClick) {
                    return originalHandleHabitCheckboxClick(habitId, isChecked);
                }
            }
        } else {
            // For unchecking, just call the original function
            if (originalHandleHabitCheckboxClick) {
                return originalHandleHabitCheckboxClick(habitId, isChecked);
            }
        }
    };

    console.log('[Habit Level Flash Fix] Initialization complete');
});
