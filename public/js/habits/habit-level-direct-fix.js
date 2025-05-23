/**
 * Habit Level Direct Fix
 * 
 * This script directly patches the handleHabitCheckboxClick function to prevent
 * the level from flashing to level 1 before showing the true level.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Habit Level Direct Fix] Initializing...');
    
    // Function to patch the handleHabitCheckboxClick function
    function patchHandleHabitCheckboxClick() {
        // Check if the script.js file has been loaded
        if (typeof window.handleHabitCheckboxClick !== 'function') {
            console.log('[Habit Level Direct Fix] handleHabitCheckboxClick not found yet, waiting...');
            setTimeout(patchHandleHabitCheckboxClick, 100);
            return;
        }
        
        console.log('[Habit Level Direct Fix] Found handleHabitCheckboxClick, patching...');
        
        // Store the original function
        const originalHandleHabitCheckboxClick = window.handleHabitCheckboxClick;
        
        // Replace the function with our patched version
        window.handleHabitCheckboxClick = async function(habitId, isChecked) {
            console.log(`[Habit Level Direct Fix] Handling habit checkbox click for habit ${habitId}, isChecked=${isChecked}`);
            
            // Get the habit element
            const habitElement = document.querySelector(`.habit-item[data-habit-id="${habitId}"]`);
            if (!habitElement) {
                console.error(`[Habit Level Direct Fix] Habit element with ID ${habitId} not found`);
                return originalHandleHabitCheckboxClick(habitId, isChecked);
            }
            
            // Get the level element
            const levelElement = habitElement.querySelector('.habit-level');
            if (!levelElement) {
                console.error(`[Habit Level Direct Fix] Level element for habit ${habitId} not found`);
                return originalHandleHabitCheckboxClick(habitId, isChecked);
            }
            
            // If we're checking the habit (completing it)
            if (isChecked) {
                try {
                    // Make an API call to get the current habit data
                    const response = await fetch(`/api/habits/${habitId}?_=${new Date().getTime()}`);
                    
                    if (response.ok) {
                        const habitData = await response.json();
                        console.log(`[Habit Level Direct Fix] Current habit data:`, habitData);
                        
                        // Calculate what the new level will be after completion
                        const newTotalCompletions = (habitData.total_completions || 0) + 1;
                        
                        // Call the original function but modify its behavior
                        const result = await originalHandleHabitCheckboxClick(habitId, isChecked);
                        
                        // Immediately update the level element with the correct level
                        levelElement.textContent = `Level ${newTotalCompletions}`;
                        levelElement.title = `${newTotalCompletions} total completions`;
                        
                        // Update the level class
                        levelElement.classList.remove('level-1', 'level-3', 'level-5', 'level-10');
                        let newLevelClass = 'level-1';
                        if (newTotalCompletions >= 10) {
                            newLevelClass = 'level-10';
                        } else if (newTotalCompletions >= 5) {
                            newLevelClass = 'level-5';
                        } else if (newTotalCompletions >= 3) {
                            newLevelClass = 'level-3';
                        }
                        levelElement.classList.add(newLevelClass);
                        
                        console.log(`[Habit Level Direct Fix] Updated level to ${newTotalCompletions}`);
                        
                        return result;
                    } else {
                        console.error(`[Habit Level Direct Fix] Failed to fetch habit data: ${response.status}`);
                        return originalHandleHabitCheckboxClick(habitId, isChecked);
                    }
                } catch (error) {
                    console.error('[Habit Level Direct Fix] Error:', error);
                    return originalHandleHabitCheckboxClick(habitId, isChecked);
                }
            } else {
                // For unchecking, just call the original function
                return originalHandleHabitCheckboxClick(habitId, isChecked);
            }
        };
        
        console.log('[Habit Level Direct Fix] Successfully patched handleHabitCheckboxClick');
    }
    
    // Start the patching process
    patchHandleHabitCheckboxClick();
});
