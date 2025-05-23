/**
 * Habit Level Flash Fix V3
 * 
 * This script fixes the issue where habit levels flash to level 1 before showing the true level
 * when a habit is checked. It directly modifies the handleHabitCheckboxClick function to prevent
 * the level from being updated until the API call is complete.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Habit Level Flash Fix V3] Initializing...');
    
    // Wait for the script.js file to load
    function waitForScriptLoad() {
        if (typeof window.handleHabitCheckboxClick !== 'function') {
            console.log('[Habit Level Flash Fix V3] Waiting for handleHabitCheckboxClick to be defined...');
            setTimeout(waitForScriptLoad, 100);
            return;
        }
        
        console.log('[Habit Level Flash Fix V3] handleHabitCheckboxClick found, patching...');
        
        // Store the original function
        const originalHandleHabitCheckboxClick = window.handleHabitCheckboxClick;
        
        // Override the function
        window.handleHabitCheckboxClick = async function(habitId, isChecked) {
            console.log(`[Habit Level Flash Fix V3] Handling habit checkbox click for habit ${habitId}, isChecked=${isChecked}`);
            
            // Get the habit element
            const habitElement = document.querySelector(`.habit-item[data-habit-id="${habitId}"]`);
            if (!habitElement) {
                console.error(`[Habit Level Flash Fix V3] Habit element with ID ${habitId} not found`);
                return originalHandleHabitCheckboxClick(habitId, isChecked);
            }
            
            // Get the level element
            const levelElement = habitElement.querySelector('.habit-level');
            if (!levelElement) {
                console.error(`[Habit Level Flash Fix V3] Level element for habit ${habitId} not found`);
                return originalHandleHabitCheckboxClick(habitId, isChecked);
            }
            
            // Store the current level information
            const currentText = levelElement.textContent;
            const currentTitle = levelElement.title;
            const currentClasses = [...levelElement.classList];
            
            // If we're checking the habit (completing it)
            if (isChecked) {
                // Create a modified version of the original function
                const modifiedFunction = async function() {
                    try {
                        // First, make the API call to complete the habit
                        const cacheBuster = new Date().getTime();
                        const response = await fetch(`/api/habits/${habitId}/complete?_=${cacheBuster}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Cache-Control': 'no-cache, no-store, must-revalidate',
                                'Pragma': 'no-cache',
                                'Expires': '0'
                            },
                            body: JSON.stringify({ isCounterHabit: false })
                        });
                        
                        if (!response.ok) {
                            const errorText = await response.text();
                            console.error(`[Habit Level Flash Fix V3] Error response from server: ${response.status} ${response.statusText}`);
                            console.error('[Habit Level Flash Fix V3] Response body:', errorText);
                            throw new Error(`Server returned ${response.status}: ${errorText}`);
                        }
                        
                        // Parse the response
                        const responseText = await response.text();
                        console.log('[Habit Level Flash Fix V3] Raw response:', responseText);
                        
                        let responseData;
                        try {
                            responseData = JSON.parse(responseText);
                            console.log('[Habit Level Flash Fix V3] Parsed habit completion response:', responseData);
                        } catch (parseError) {
                            console.error('[Habit Level Flash Fix V3] Failed to parse response as JSON:', parseError);
                            console.error('[Habit Level Flash Fix V3] Response text was:', responseText);
                            return;
                        }
                        
                        // Update the habit element to show it's completed
                        habitElement.dataset.completed = 'true';
                        habitElement.classList.add('complete');
                        
                        // Update the level element with the correct level from the server
                        if (responseData && responseData.level !== undefined && responseData.total_completions !== undefined) {
                            console.log(`[Habit Level Flash Fix V3] Server response for habit ${habitId}:`, responseData);
                            
                            // Update the level element with the correct level
                            levelElement.textContent = `Level ${responseData.total_completions}`;
                            levelElement.title = `${responseData.total_completions} total completions`;
                            
                            // Update the level class
                            levelElement.classList.remove('level-1', 'level-3', 'level-5', 'level-10');
                            let newLevelClass = 'level-1';
                            if (responseData.total_completions >= 10) {
                                newLevelClass = 'level-10';
                            } else if (responseData.total_completions >= 5) {
                                newLevelClass = 'level-5';
                            } else if (responseData.total_completions >= 3) {
                                newLevelClass = 'level-3';
                            }
                            levelElement.classList.add(newLevelClass);
                            
                            console.log(`[Habit Level Flash Fix V3] Updated level to ${responseData.total_completions} (${responseData.level})`);
                        }
                        
                        // Dispatch the habitCompleted event
                        const habitCompletedEvent = new CustomEvent('habitCompleted', {
                            detail: { habitId, result: responseData }
                        });
                        document.dispatchEvent(habitCompletedEvent);
                        console.log('[Habit Level Flash Fix V3] Dispatched habitCompleted event');
                        
                        // Refresh the calendar if needed
                        if (typeof window.refreshCalendar === 'function') {
                            console.log('[Habit Level Flash Fix V3] Refreshing calendar after habit completion');
                            window.refreshCalendar();
                        }
                        
                        // Clear the status
                        const habitListStatusDiv = document.getElementById('habitListStatus');
                        if (habitListStatusDiv) {
                            habitListStatusDiv.textContent = '';
                        }
                    } catch (error) {
                        console.error('[Habit Level Flash Fix V3] Error updating habit completion:', error);
                        
                        // Clear the status
                        const habitListStatusDiv = document.getElementById('habitListStatus');
                        if (habitListStatusDiv) {
                            habitListStatusDiv.textContent = `Error: ${error.message}`;
                            habitListStatusDiv.className = 'status error';
                        }
                    }
                };
                
                // Call our modified function
                modifiedFunction();
                
                // Return to prevent the original function from running
                return;
            } else {
                // For unchecking, just call the original function
                return originalHandleHabitCheckboxClick(habitId, isChecked);
            }
        };
        
        console.log('[Habit Level Flash Fix V3] Successfully patched handleHabitCheckboxClick');
    }
    
    // Start waiting for the script to load
    waitForScriptLoad();
    
    console.log('[Habit Level Flash Fix V3] Initialization complete');
});
