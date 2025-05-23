/**
 * Habit Level Transition Fix V2
 * 
 * This script fixes the issue where habit levels temporarily show level 1
 * when transitioning from the current level to the new level after completion.
 * It ensures a smooth transition from current level to new level without showing level 1.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Habit Level Transition Fix V2] Initializing...');
    
    // Function to patch the handleHabitCheckboxClick function
    function patchHandleHabitCheckboxClick() {
        // Check if the script.js file has been loaded
        if (typeof window.handleHabitCheckboxClick !== 'function') {
            console.log('[Habit Level Transition Fix V2] handleHabitCheckboxClick not found yet, waiting...');
            setTimeout(patchHandleHabitCheckboxClick, 100);
            return;
        }
        
        console.log('[Habit Level Transition Fix V2] Found handleHabitCheckboxClick, patching...');
        
        // Store the original function
        const originalHandleHabitCheckboxClick = window.handleHabitCheckboxClick;
        
        // Replace the function with our patched version
        window.handleHabitCheckboxClick = async function(habitId, isChecked) {
            console.log(`[Habit Level Transition Fix V2] Handling habit checkbox click for habit ${habitId}, isChecked=${isChecked}`);
            
            // Get the habit element
            const habitElement = document.querySelector(`.habit-item[data-habit-id="${habitId}"]`);
            if (!habitElement) {
                console.error(`[Habit Level Transition Fix V2] Habit element with ID ${habitId} not found`);
                return originalHandleHabitCheckboxClick(habitId, isChecked);
            }
            
            // Get the level element
            const levelElement = habitElement.querySelector('.habit-level');
            if (!levelElement) {
                console.error(`[Habit Level Transition Fix V2] Level element for habit ${habitId} not found`);
                return originalHandleHabitCheckboxClick(habitId, isChecked);
            }
            
            // If we're checking the habit (completing it)
            if (isChecked) {
                // Store the current level information
                const currentText = levelElement.textContent || '';
                const currentLevelMatch = currentText.match(/Level (\d+)/);
                
                if (currentLevelMatch) {
                    const currentLevel = parseInt(currentLevelMatch[1], 10);
                    console.log(`[Habit Level Transition Fix V2] Current level for habit ${habitId} is ${currentLevel}`);
                    
                    // Calculate the expected new level (current + 1)
                    const expectedNewLevel = currentLevel + 1;
                    
                    // Immediately update the level to the expected new level
                    levelElement.textContent = `Level ${expectedNewLevel}`;
                    levelElement.title = `${expectedNewLevel} total completions`;
                    
                    // Update the level class
                    levelElement.classList.remove('level-1', 'level-3', 'level-5', 'level-10');
                    let newLevelClass = 'level-1';
                    if (expectedNewLevel >= 10) {
                        newLevelClass = 'level-10';
                    } else if (expectedNewLevel >= 5) {
                        newLevelClass = 'level-5';
                    } else if (expectedNewLevel >= 3) {
                        newLevelClass = 'level-3';
                    }
                    levelElement.classList.add(newLevelClass);
                    
                    console.log(`[Habit Level Transition Fix V2] Pre-updated level to ${expectedNewLevel} for habit ${habitId}`);
                    
                    // Now call the original function but modify it to not update the level display
                    const originalSetTextContent = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent').set;
                    
                    // Override the textContent setter for the level element
                    Object.defineProperty(levelElement, 'textContent', {
                        set: function(value) {
                            // If the value is "Level 1", ignore it
                            if (value === 'Level 1') {
                                console.log(`[Habit Level Transition Fix V2] Prevented setting level to "Level 1" for habit ${habitId}`);
                                return;
                            }
                            
                            // If the value contains a level, check if it's the expected level
                            const levelMatch = value.match(/Level (\d+)/);
                            if (levelMatch) {
                                const level = parseInt(levelMatch[1], 10);
                                
                                // If the level is the same as what we already set, ignore it
                                if (level === expectedNewLevel) {
                                    console.log(`[Habit Level Transition Fix V2] Prevented redundant level update to ${level} for habit ${habitId}`);
                                    return;
                                }
                                
                                // If the level is from the server and different from what we expected, use it
                                console.log(`[Habit Level Transition Fix V2] Updating to server-provided level ${level} for habit ${habitId}`);
                            }
                            
                            // For all other values, use the original setter
                            originalSetTextContent.call(this, value);
                        },
                        get: function() {
                            return Object.getOwnPropertyDescriptor(Node.prototype, 'textContent').get.call(this);
                        }
                    });
                    
                    // Set a timeout to restore the original setter after the operation is complete
                    setTimeout(() => {
                        // Restore the original setter
                        Object.defineProperty(levelElement, 'textContent', {
                            set: originalSetTextContent,
                            get: Object.getOwnPropertyDescriptor(Node.prototype, 'textContent').get
                        });
                        console.log(`[Habit Level Transition Fix V2] Restored original textContent setter for habit ${habitId}`);
                        
                        // Make an API call to get the current habit data and update the level
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
                                    
                                    console.log(`[Habit Level Transition Fix V2] Updated to correct level ${habitData.total_completions} from server`);
                                }
                            })
                            .catch(error => {
                                console.error('[Habit Level Transition Fix V2] Error fetching updated habit data:', error);
                            });
                    }, 2000);
                }
            }
            
            // Call the original function
            return originalHandleHabitCheckboxClick(habitId, isChecked);
        };
        
        console.log('[Habit Level Transition Fix V2] Successfully patched handleHabitCheckboxClick');
    }
    
    // Start the patching process
    patchHandleHabitCheckboxClick();
    
    console.log('[Habit Level Transition Fix V2] Initialization complete');
});
