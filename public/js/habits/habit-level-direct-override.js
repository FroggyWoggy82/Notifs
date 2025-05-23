/**
 * Habit Level Direct Override
 * 
 * This script directly overrides the handleHabitCheckboxClick function to prevent
 * the level from showing level 1 when transitioning from the current level to the new level.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Habit Level Direct Override] Initializing...');
    
    // Function to patch the handleHabitCheckboxClick function
    function patchHandleHabitCheckboxClick() {
        // Check if the script.js file has been loaded
        if (typeof window.handleHabitCheckboxClick !== 'function') {
            console.log('[Habit Level Direct Override] handleHabitCheckboxClick not found yet, waiting...');
            setTimeout(patchHandleHabitCheckboxClick, 100);
            return;
        }
        
        console.log('[Habit Level Direct Override] Found handleHabitCheckboxClick, patching...');
        
        // Store the original function
        const originalHandleHabitCheckboxClick = window.handleHabitCheckboxClick;
        
        // Replace the function with our patched version
        window.handleHabitCheckboxClick = async function(habitId, isChecked) {
            console.log(`[Habit Level Direct Override] Handling habit checkbox click for habit ${habitId}, isChecked=${isChecked}`);
            
            // Get the habit element
            const habitElement = document.querySelector(`.habit-item[data-habit-id="${habitId}"]`);
            if (!habitElement) {
                console.error(`[Habit Level Direct Override] Habit element with ID ${habitId} not found`);
                return originalHandleHabitCheckboxClick(habitId, isChecked);
            }
            
            // Get the level element
            const levelElement = habitElement.querySelector('.habit-level');
            if (!levelElement) {
                console.error(`[Habit Level Direct Override] Level element for habit ${habitId} not found`);
                return originalHandleHabitCheckboxClick(habitId, isChecked);
            }
            
            // If we're checking the habit (completing it)
            if (isChecked) {
                // Store the current level information
                const currentText = levelElement.textContent || '';
                const currentLevelMatch = currentText.match(/Level (\d+)/);
                
                if (currentLevelMatch) {
                    const currentLevel = parseInt(currentLevelMatch[1], 10);
                    console.log(`[Habit Level Direct Override] Current level for habit ${habitId} is ${currentLevel}`);
                    
                    // Skip the original function and implement our own version
                    try {
                        // Mark the habit as completed in the UI
                        habitElement.dataset.completed = 'true';
                        habitElement.classList.add('complete');
                        
                        // Update the progress display if needed
                        const progressEl = habitElement.querySelector('.habit-progress');
                        if (progressEl) {
                            const progressMatch = progressEl.textContent.match(/(\d+)\/(\d+)/);
                            if (progressMatch) {
                                const target = progressMatch[2]; // Second capture group is the target
                                progressEl.textContent = `${target}/${target}`;
                                progressEl.title = `Current progress: ${target}/${target}`;
                                console.log(`[Habit Level Direct Override] Updated progress display for completed habit: ${target}/${target}`);
                            }
                        }
                        
                        // Calculate the expected new level (current + 1)
                        const expectedNewLevel = currentLevel + 1;
                        
                        // Update the level display to the expected new level
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
                        
                        console.log(`[Habit Level Direct Override] Updated level to ${expectedNewLevel} for habit ${habitId}`);
                        
                        // Make the API call to record the completion
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
                            console.error(`[Habit Level Direct Override] Error response from server: ${response.status} ${response.statusText}`);
                            console.error('[Habit Level Direct Override] Response body:', errorText);
                            throw new Error(`Server returned ${response.status}: ${errorText}`);
                        }
                        
                        // Parse the response
                        const responseText = await response.text();
                        console.log('[Habit Level Direct Override] Raw response:', responseText);
                        
                        let responseData;
                        try {
                            responseData = JSON.parse(responseText);
                            console.log('[Habit Level Direct Override] Parsed habit completion response:', responseData);
                        } catch (parseError) {
                            console.error('[Habit Level Direct Override] Failed to parse response as JSON:', parseError);
                            console.error('[Habit Level Direct Override] Response text was:', responseText);
                            return;
                        }
                        
                        // Update the level element with the correct level from the server
                        if (responseData && responseData.level !== undefined && responseData.total_completions !== undefined) {
                            console.log(`[Habit Level Direct Override] Server response for habit ${habitId}:`, responseData);
                            
                            // Only update if the server's level is different from what we expected
                            if (responseData.total_completions !== expectedNewLevel) {
                                console.log(`[Habit Level Direct Override] Server level (${responseData.total_completions}) differs from expected (${expectedNewLevel}), updating...`);
                                
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
                            }
                        }
                        
                        // Dispatch the habitCompleted event
                        const habitCompletedEvent = new CustomEvent('habitCompleted', {
                            detail: { habitId, result: responseData }
                        });
                        document.dispatchEvent(habitCompletedEvent);
                        console.log('[Habit Level Direct Override] Dispatched habitCompleted event');
                        
                        // Refresh the calendar if needed
                        if (typeof window.refreshCalendar === 'function') {
                            console.log('[Habit Level Direct Override] Refreshing calendar after habit completion');
                            window.refreshCalendar();
                        }
                        
                        // Clear the status
                        const habitListStatusDiv = document.getElementById('habitListStatus');
                        if (habitListStatusDiv) {
                            habitListStatusDiv.textContent = '';
                        }
                        
                        return; // Skip the original function
                    } catch (error) {
                        console.error('[Habit Level Direct Override] Error:', error);
                        
                        // Clear the status
                        const habitListStatusDiv = document.getElementById('habitListStatus');
                        if (habitListStatusDiv) {
                            habitListStatusDiv.textContent = `Error: ${error.message}`;
                            habitListStatusDiv.className = 'status error';
                        }
                        
                        // Fall back to the original function
                        return originalHandleHabitCheckboxClick(habitId, isChecked);
                    }
                }
            }
            
            // For unchecking or if we couldn't get the current level, call the original function
            return originalHandleHabitCheckboxClick(habitId, isChecked);
        };
        
        console.log('[Habit Level Direct Override] Successfully patched handleHabitCheckboxClick');
    }
    
    // Start the patching process
    patchHandleHabitCheckboxClick();
    
    console.log('[Habit Level Direct Override] Initialization complete');
});
