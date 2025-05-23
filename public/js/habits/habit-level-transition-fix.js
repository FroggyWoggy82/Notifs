/**
 * Habit Level Transition Fix
 * 
 * This script fixes the issue where habit levels temporarily show level 1
 * when transitioning from the current level to the new level after completion.
 * It ensures a smooth transition from current level to new level without showing level 1.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Habit Level Transition Fix] Initializing...');
    
    // Function to patch the handleHabitCheckboxClick function
    function patchHandleHabitCheckboxClick() {
        // Check if the script.js file has been loaded
        if (typeof window.handleHabitCheckboxClick !== 'function') {
            console.log('[Habit Level Transition Fix] handleHabitCheckboxClick not found yet, waiting...');
            setTimeout(patchHandleHabitCheckboxClick, 100);
            return;
        }
        
        console.log('[Habit Level Transition Fix] Found handleHabitCheckboxClick, patching...');
        
        // Store the original function
        const originalHandleHabitCheckboxClick = window.handleHabitCheckboxClick;
        
        // Replace the function with our patched version
        window.handleHabitCheckboxClick = async function(habitId, isChecked) {
            console.log(`[Habit Level Transition Fix] Handling habit checkbox click for habit ${habitId}, isChecked=${isChecked}`);
            
            // Get the habit element
            const habitElement = document.querySelector(`.habit-item[data-habit-id="${habitId}"]`);
            if (!habitElement) {
                console.error(`[Habit Level Transition Fix] Habit element with ID ${habitId} not found`);
                return originalHandleHabitCheckboxClick(habitId, isChecked);
            }
            
            // Get the level element
            const levelElement = habitElement.querySelector('.habit-level');
            if (!levelElement) {
                console.error(`[Habit Level Transition Fix] Level element for habit ${habitId} not found`);
                return originalHandleHabitCheckboxClick(habitId, isChecked);
            }
            
            // If we're checking the habit (completing it)
            if (isChecked) {
                // Store the current level information
                const currentText = levelElement.textContent || '';
                const currentLevelMatch = currentText.match(/Level (\d+)/);
                
                if (currentLevelMatch) {
                    const currentLevel = parseInt(currentLevelMatch[1], 10);
                    console.log(`[Habit Level Transition Fix] Current level for habit ${habitId} is ${currentLevel}`);
                    
                    // Calculate the expected new level (current + 1)
                    const expectedNewLevel = currentLevel + 1;
                    
                    // Create a proxy for the level element to intercept textContent changes
                    const originalSetTextContent = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent').set;
                    
                    // Override the textContent setter
                    Object.defineProperty(levelElement, 'textContent', {
                        set: function(value) {
                            // If the value is "Level 1" and we expect a different level, skip this update
                            if (value === 'Level 1' && expectedNewLevel !== 1) {
                                console.log(`[Habit Level Transition Fix] Prevented setting level to "Level 1" for habit ${habitId}`);
                                return;
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
                        console.log(`[Habit Level Transition Fix] Restored original textContent setter for habit ${habitId}`);
                    }, 2000);
                }
            }
            
            // Call the original function
            return originalHandleHabitCheckboxClick(habitId, isChecked);
        };
        
        console.log('[Habit Level Transition Fix] Successfully patched handleHabitCheckboxClick');
    }
    
    // Start the patching process
    patchHandleHabitCheckboxClick();
    
    console.log('[Habit Level Transition Fix] Initialization complete');
});
