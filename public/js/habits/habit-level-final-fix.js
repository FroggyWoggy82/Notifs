/**
 * Habit Level Final Fix
 *
 * This script fixes the issue where habit levels temporarily show level 1
 * when transitioning from the current level to the new level after completion.
 * It ensures a smooth transition from current level to new level without showing level 1.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Habit Level Final Fix] Initializing...');

    // Function to completely replace the handleHabitCheckboxClick function
    function replaceHandleHabitCheckboxClick() {
        console.log('[Habit Level Final Fix] Replacing handleHabitCheckboxClick function...');

        // Define our completely new implementation
        window.handleHabitCheckboxClick = async function(habitId, isChecked) {
            console.log(`[Habit Level Final Fix] Handling habit checkbox click for habit ${habitId}, isChecked=${isChecked}`);

            // Get the habit element
            const habitElement = document.querySelector(`.habit-item[data-habit-id="${habitId}"]`);
            if (!habitElement) {
                console.error(`[Habit Level Final Fix] Habit element with ID ${habitId} not found`);
                return;
            }

            // Get the level element
            const levelElement = habitElement.querySelector('.habit-level');
            if (!levelElement) {
                console.error(`[Habit Level Final Fix] Level element for habit ${habitId} not found`);
                return;
            }

            // Get the habit list status div
            const habitListStatusDiv = document.getElementById('habitListStatus') || document.createElement('div');

            // If we're unchecking the habit
            if (!isChecked) {
                console.log(`[Habit Level Final Fix] Unchecking habit ${habitId}`);
                habitListStatusDiv.textContent = 'Updating habit...';
                habitListStatusDiv.className = 'status';

                // Remove the completed state
                habitElement.dataset.completed = 'false';
                habitElement.classList.remove('complete');

                // Dispatch the habitUncompleted event
                const habitUncompletedEvent = new CustomEvent('habitUncompleted', {
                    detail: { habitId }
                });
                document.dispatchEvent(habitUncompletedEvent);
                console.log('[Habit Level Final Fix] Dispatched habitUncompleted event');

                // Refresh the calendar if needed
                if (typeof window.refreshCalendar === 'function') {
                    console.log('[Habit Level Final Fix] Refreshing calendar after habit uncompletion');
                    window.refreshCalendar();
                }

                // Update the progress display
                const progressEl = habitElement.querySelector('.habit-progress');
                if (progressEl) {
                    const progressMatch = progressEl.textContent.match(/(\d+)\/(\d+)/);
                    if (progressMatch) {
                        const target = progressMatch[2]; // Second capture group is the target
                        progressEl.textContent = `0/${target}`;
                        progressEl.title = `Current progress: 0/${target}`;
                        console.log(`[Habit Level Final Fix] Reset progress display for uncompleted habit: 0/${target}`);
                    }
                }

                try {
                    // Make the API call to uncomplete the habit
                    const cacheBuster = new Date().getTime();
                    const response = await fetch(`/api/habits/${habitId}/uncomplete?_=${cacheBuster}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Cache-Control': 'no-cache, no-store, must-revalidate',
                            'Pragma': 'no-cache',
                            'Expires': '0'
                        }
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`Server returned ${response.status}: ${errorText}`);
                    }

                    const result = await response.json();
                    console.log(`[Habit Level Final Fix] Completion removed for habit ${habitId}:`, result);

                    // Update the level display with the correct level from the server
                    if (result.total_completions !== undefined && result.level !== undefined) {
                        console.log(`[Habit Level Final Fix] Server response for habit ${habitId}:`, result);

                        // Update the level element with the correct level
                        levelElement.textContent = `Level ${result.level}`;
                        levelElement.title = `${result.total_completions} total completions`;

                        // Update the level class
                        levelElement.classList.remove('level-1', 'level-3', 'level-5', 'level-10');
                        let newLevelClass = 'level-1';
                        if (result.level >= 10) {
                            newLevelClass = 'level-10';
                        } else if (result.level >= 5) {
                            newLevelClass = 'level-5';
                        } else if (result.level >= 3) {
                            newLevelClass = 'level-3';
                        }
                        levelElement.classList.add(newLevelClass);

                        console.log(`[Habit Level Final Fix] Updated level to ${result.level} (${result.total_completions} completions)`);
                    }

                    habitListStatusDiv.textContent = '';
                } catch (error) {
                    console.error(`[Habit Level Final Fix] Error removing completion for habit ${habitId}:`, error);

                    const isNoCompletionsError = error.message && (
                        error.message.includes('No completions found') ||
                        error.message.includes('No completions to remove')
                    );

                    if (isNoCompletionsError) {
                        console.log('[Habit Level Final Fix] No completions found to remove. Reloading habits to sync with server.');

                        const checkbox = habitElement.querySelector('.habit-checkbox');
                        if (checkbox) {
                            checkbox.checked = true;
                        }

                        habitListStatusDiv.textContent = 'This habit has not been completed today.';
                        habitListStatusDiv.className = 'status info';
                    } else {
                        habitListStatusDiv.textContent = `Error: ${error.message}`;
                        habitListStatusDiv.className = 'status error';
                    }

                    if (typeof loadHabits === 'function') {
                        loadHabits();
                    }
                }

                return;
            }

            // If we're checking the habit (completing it)
            console.log(`[Habit Level Final Fix] Checking habit ${habitId}`);
            habitListStatusDiv.textContent = 'Updating habit...';
            habitListStatusDiv.className = 'status';

            // Store the current level information
            const currentText = levelElement.textContent || '';
            const currentLevelMatch = currentText.match(/Level (\d+)/);

            if (currentLevelMatch) {
                const currentLevel = parseInt(currentLevelMatch[1], 10);
                console.log(`[Habit Level Final Fix] Current level for habit ${habitId} is ${currentLevel}`);

                // Calculate the expected new level (current + 1)
                const expectedNewLevel = currentLevel + 1;

                // Update the level display to the expected new level BEFORE making the API call
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

                console.log(`[Habit Level Final Fix] Pre-updated level to ${expectedNewLevel} for habit ${habitId}`);
            }

            // Check if this is a counter habit
            const habitTitleEl = habitElement?.querySelector('.habit-title');
            const habitTitle = habitTitleEl?.textContent || '';
            const counterMatch = habitTitle.match(/\((\d+)\/(\d+)\)/);

            try {
                // If this is a counter habit
                if (counterMatch && habitTitleEl) {
                    const currentCount = parseInt(counterMatch[1], 10) || 0;
                    const totalCount = parseInt(counterMatch[2], 10) || 10;
                    const newCount = Math.min(currentCount + 1, totalCount);

                    // Update the title with the new count
                    const newTitle = habitTitle.replace(
                        /\(\d+\/\d+\)/,
                        `(${newCount}/${totalCount})`
                    );

                    // Update the habit title on the server
                    const updateResponse = await fetch(`/api/habits/${habitId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            title: newTitle.trim(),
                            frequency: habitElement.querySelector('.habit-frequency').textContent.replace('Frequency: ', '')
                        })
                    });

                    if (!updateResponse.ok) {
                        throw new Error(`Failed to update habit counter. Status: ${updateResponse.status}`);
                    }

                    // Update the title in the UI
                    habitTitleEl.textContent = newTitle;

                    // Make the API call to record the completion
                    console.log(`[Habit Level Final Fix] Sending counter habit completion request for habit ${habitId}`);
                    const completionResponse = await fetch(`/api/habits/${habitId}/complete`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ isCounterHabit: true })
                    });

                    if (!completionResponse.ok) {
                        const errorText = await completionResponse.text();
                        console.error(`[Habit Level Final Fix] Error response from server: ${completionResponse.status} ${completionResponse.statusText}`);
                        console.error('[Habit Level Final Fix] Response body:', errorText);
                        throw new Error(`Server returned ${completionResponse.status}: ${errorText}`);
                    }

                    // Parse the response
                    const responseText = await completionResponse.text();
                    console.log('[Habit Level Final Fix] Raw counter habit response:', responseText);

                    let completionData;
                    try {
                        completionData = JSON.parse(responseText);
                        console.log('[Habit Level Final Fix] Parsed counter habit completion response:', completionData);
                    } catch (parseError) {
                        console.error('[Habit Level Final Fix] Failed to parse counter response as JSON:', parseError);
                        console.error('[Habit Level Final Fix] Counter response text was:', responseText);
                        return;
                    }

                    // Update the level element with the correct level from the server
                    if (completionData && completionData.level !== undefined && completionData.total_completions !== undefined) {
                        console.log(`[Habit Level Final Fix] Updating counter habit level to ${completionData.level} (${completionData.total_completions} completions)`);

                        // Only update if the server's level is different from what we expected
                        if (currentLevelMatch) {
                            const currentLevel = parseInt(currentLevelMatch[1], 10);
                            const expectedNewLevel = currentLevel + 1;

                            if (completionData.total_completions !== expectedNewLevel) {
                                console.log(`[Habit Level Final Fix] Server level (${completionData.total_completions}) differs from expected (${expectedNewLevel}), updating...`);

                                levelElement.textContent = `Level ${completionData.total_completions}`;
                                levelElement.title = `${completionData.total_completions} total completions`;

                                // Update the level class
                                levelElement.classList.remove('level-1', 'level-3', 'level-5', 'level-10');
                                let newLevelClass = 'level-1';
                                if (completionData.total_completions >= 10) {
                                    newLevelClass = 'level-10';
                                } else if (completionData.total_completions >= 5) {
                                    newLevelClass = 'level-5';
                                } else if (completionData.total_completions >= 3) {
                                    newLevelClass = 'level-3';
                                }
                                levelElement.classList.add(newLevelClass);
                            }
                        }
                    }

                    // Update the progress display
                    const progressEl = habitElement.querySelector('.habit-progress');
                    if (progressEl) {
                        progressEl.textContent = `Progress: ${newCount}/${totalCount}`;
                        progressEl.title = `Current progress: ${newCount}/${totalCount}`;

                        progressEl.classList.remove('level-1', 'level-3', 'level-5', 'level-10');
                        let newLevelClass = 'level-1';
                        if (newCount >= 10) {
                            newLevelClass = 'level-10';
                        } else if (newCount >= 5) {
                            newLevelClass = 'level-5';
                        } else if (newCount >= 3) {
                            newLevelClass = 'level-3';
                        }
                        progressEl.classList.add(newLevelClass);
                    }

                    // If the counter is complete, update the UI
                    if (newCount >= totalCount) {
                        habitElement.classList.add('counter-complete');

                        const incrementBtn = habitElement.querySelector('.habit-increment-btn');
                        if (incrementBtn) {
                            incrementBtn.textContent = '✓'; // Checkmark
                            incrementBtn.classList.add('completed');
                            incrementBtn.disabled = true;
                            incrementBtn.title = 'Completed!';
                        }
                    }

                    console.log(`[Habit Level Final Fix] Updated habit counter from ${currentCount} to ${newCount}`);
                    habitListStatusDiv.textContent = '';
                    return;
                }

                // For regular habits
                console.log(`[Habit Level Final Fix] Sending regular habit completion request for habit ${habitId}`);

                // Mark the habit as completed in the UI
                habitElement.dataset.completed = 'true';
                habitElement.classList.add('complete');

                // Update the progress display
                const progressEl = habitElement.querySelector('.habit-progress');
                if (progressEl) {
                    const progressMatch = progressEl.textContent.match(/(\d+)\/(\d+)/);
                    if (progressMatch) {
                        const target = progressMatch[2]; // Second capture group is the target
                        progressEl.textContent = `${target}/${target}`;
                        progressEl.title = `Current progress: ${target}/${target}`;
                        console.log(`[Habit Level Final Fix] Updated progress display for completed habit: ${target}/${target}`);
                    }
                }

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
                    console.error(`[Habit Level Final Fix] Error response from server: ${response.status} ${response.statusText}`);
                    console.error('[Habit Level Final Fix] Response body:', errorText);
                    throw new Error(`Server returned ${response.status}: ${errorText}`);
                }

                // Parse the response
                const responseText = await response.text();
                console.log('[Habit Level Final Fix] Raw response:', responseText);

                let responseData;
                try {
                    responseData = JSON.parse(responseText);
                    console.log('[Habit Level Final Fix] Parsed habit completion response:', responseData);
                } catch (parseError) {
                    console.error('[Habit Level Final Fix] Failed to parse response as JSON:', parseError);
                    console.error('[Habit Level Final Fix] Response text was:', responseText);

                    if (typeof loadHabits === 'function') {
                        loadHabits();
                    }
                    return;
                }

                // Update the level element with the correct level from the server
                if (responseData && responseData.level !== undefined && responseData.total_completions !== undefined) {
                    console.log(`[Habit Level Final Fix] Server response for habit ${habitId}:`, responseData);

                    // Only update if the server's level is different from what we expected
                    if (currentLevelMatch) {
                        const currentLevel = parseInt(currentLevelMatch[1], 10);
                        const expectedNewLevel = currentLevel + 1;

                        if (responseData.total_completions !== expectedNewLevel) {
                            console.log(`[Habit Level Final Fix] Server level (${responseData.total_completions}) differs from expected (${expectedNewLevel}), updating...`);

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
                }

                // Dispatch the habitCompleted event
                const habitCompletedEvent = new CustomEvent('habitCompleted', {
                    detail: { habitId, result: responseData }
                });
                document.dispatchEvent(habitCompletedEvent);
                console.log('[Habit Level Final Fix] Dispatched habitCompleted event');

                // Refresh the calendar if needed
                if (typeof window.refreshCalendar === 'function') {
                    console.log('[Habit Level Final Fix] Refreshing calendar after habit completion');
                    window.refreshCalendar();
                }

                habitListStatusDiv.textContent = '';
            } catch (error) {
                console.error('[Habit Level Final Fix] Error updating habit completion:', error);
                habitListStatusDiv.textContent = `Error: ${error.message}`;
                habitListStatusDiv.className = 'status error';

                if (typeof loadHabits === 'function') {
                    setTimeout(() => {
                        loadHabits();
                    }, 1000);
                }
            }
        };

        console.log('[Habit Level Final Fix] Successfully replaced handleHabitCheckboxClick function');
    }

    // Replace the function immediately
    replaceHandleHabitCheckboxClick();

    // Store a reference to our implementation
    const ourImplementation = window.handleHabitCheckboxClick;

    // Also set up a timer to check periodically and replace the function if needed
    const checkInterval = setInterval(function() {
        if (window.handleHabitCheckboxClick !== ourImplementation) {
            console.log('[Habit Level Final Fix] handleHabitCheckboxClick was overridden, replacing it again...');
            replaceHandleHabitCheckboxClick();
        }
    }, 1000);

    // Also set up a MutationObserver to watch for changes to the habit list
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Check if any of the added nodes are habit items or contain habit items
                for (let i = 0; i < mutation.addedNodes.length; i++) {
                    const node = mutation.addedNodes[i];
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.classList && node.classList.contains('habit-item')) {
                            // This is a habit item, set up the checkbox event listener
                            const checkbox = node.querySelector('.habit-checkbox');
                            if (checkbox) {
                                checkbox.addEventListener('change', function() {
                                    const habitId = node.dataset.habitId;
                                    const isChecked = this.checked;
                                    console.log(`[Habit Level Final Fix] Checkbox for habit ${habitId} changed to ${isChecked}`);
                                    // Check if the function exists before calling it
                                    if (typeof window.handleHabitCheckboxClick === 'function') {
                                        window.handleHabitCheckboxClick(habitId, isChecked);
                                    } else {
                                        console.error('[Habit Level Final Fix] handleHabitCheckboxClick function not found');
                                    }
                                });
                            }
                        } else {
                            // Check if this node contains habit items
                            const habitItems = node.querySelectorAll('.habit-item');
                            habitItems.forEach(function(habitItem) {
                                const checkbox = habitItem.querySelector('.habit-checkbox');
                                if (checkbox) {
                                    checkbox.addEventListener('change', function() {
                                        const habitId = habitItem.dataset.habitId;
                                        const isChecked = this.checked;
                                        console.log(`[Habit Level Final Fix] Checkbox for habit ${habitId} changed to ${isChecked}`);
                                        // Check if the function exists before calling it
                                        if (typeof window.handleHabitCheckboxClick === 'function') {
                                            window.handleHabitCheckboxClick(habitId, isChecked);
                                        } else {
                                            console.error('[Habit Level Final Fix] handleHabitCheckboxClick function not found');
                                        }
                                    });
                                }
                            });
                        }
                    }
                }
            }
        });
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    console.log('[Habit Level Final Fix] Initialization complete');
});
