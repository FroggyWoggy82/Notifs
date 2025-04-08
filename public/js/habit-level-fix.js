/**
 * Fix for habit level not updating correctly when using the +1 button
 * This script adds a cache-busting mechanism and ensures proper level updates
 */

document.addEventListener('DOMContentLoaded', () => {
    // Override the original loadHabits function to add cache busting
    if (typeof window.originalLoadHabits === 'undefined' && typeof loadHabits === 'function') {
        // Store the original function
        window.originalLoadHabits = loadHabits;
        
        // Replace with our enhanced version
        window.loadHabits = async function() {
            habitListStatusDiv.textContent = 'Loading habits...';
            habitListStatusDiv.className = 'status';
            try {
                // Add cache-busting query parameter to prevent browser caching
                const cacheBuster = new Date().getTime();
                const response = await fetch(`/api/habits?_=${cacheBuster}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const habits = await response.json();
                allHabitsData = habits; // Store habits locally
                displayHabits(habits);
                habitListStatusDiv.textContent = '';
            } catch (error) {
                console.error('Error loading habits:', error);
                habitListStatusDiv.textContent = 'Error loading habits.';
                habitListStatusDiv.className = 'status error';
                habitListDiv.innerHTML = ''; // Clear placeholder on error
            }
        };
        
        console.log('Enhanced loadHabits function with cache busting');
    }
    
    // Override the handleHabitCheckboxClick function to ensure level updates correctly
    if (typeof window.originalHandleHabitCheckboxClick === 'undefined' && typeof handleHabitCheckboxClick === 'function') {
        // Store the original function
        window.originalHandleHabitCheckboxClick = handleHabitCheckboxClick;
        
        // Replace with our enhanced version
        window.handleHabitCheckboxClick = async function(habitId, isChecked) {
            console.log(`Enhanced checkbox clicked for habit ${habitId}, attempting to record completion.`);
            habitListStatusDiv.textContent = 'Updating habit...';
            habitListStatusDiv.className = 'status';
            
            // Find the habit element and check if it has a counter in the title
            const habitElement = document.querySelector(`.habit-item[data-habit-id="${habitId}"]`);
            const habitTitleEl = habitElement?.querySelector('.habit-title');
            const habitTitle = habitTitleEl?.textContent || '';
            const counterMatch = habitTitle.match(/\\((\\d+)\\/(\\d+)\\)/);
            
            try {
                // Special handling for habits with counters in the title
                if (counterMatch && habitTitleEl) {
                    const currentCount = parseInt(counterMatch[1], 10) || 0;
                    const totalCount = parseInt(counterMatch[2], 10) || 10;
                    const newCount = Math.min(currentCount + 1, totalCount);
                    
                    // Update the title with the new counter value
                    const newTitle = habitTitle.replace(
                        /\\(\\d+\\/\\d+\\)/,
                        `(${newCount}/${totalCount})`
                    );
                    
                    habitTitleEl.textContent = newTitle;
                    
                    // Update the server with the new title
                    const updateResponse = await fetch(`/api/habits/${habitId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            title: newTitle,
                            frequency: 'daily', // Assuming daily frequency for counter habits
                            completions_per_day: totalCount
                        })
                    });
                    
                    if (!updateResponse.ok) {
                        throw new Error(`HTTP error updating title! status: ${updateResponse.status}`);
                    }
                    
                    // Also record a completion to increment the total_completions counter
                    console.log(`Sending counter habit completion request for habit ${habitId}`);
                    
                    // Add cache-busting parameter to prevent caching
                    const cacheBuster = new Date().getTime();
                    const completionResponse = await fetch(`/api/habits/${habitId}/complete?_=${cacheBuster}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ isCounterHabit: true })
                    });
                    
                    if (!completionResponse.ok) {
                        throw new Error(`HTTP error recording completion! status: ${completionResponse.status}`);
                    }
                    
                    // Update the progress indicator
                    const progressEl = habitElement.querySelector('.habit-progress');
                    if (progressEl) {
                        progressEl.textContent = `Progress: ${newCount}/${totalCount}`;
                        progressEl.title = `Current progress: ${newCount}/${totalCount}`;
                        
                        // Update progress class
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
                    
                    // Get the response data which includes the updated total_completions and level
                    let responseData;
                    try {
                        responseData = await completionResponse.json();
                        console.log('Parsed habit completion response:', responseData);
                    } catch (parseError) {
                        console.error('Failed to parse response as JSON:', parseError);
                        // If we can't parse the response, reload the habits list
                        loadHabits();
                        return;
                    }
                    
                    // Update the level indicator with the new level from the server
                    if (responseData && responseData.level !== undefined && responseData.total_completions !== undefined) {
                        console.log(`Updating level to ${responseData.level} (${responseData.total_completions} completions)`);
                        
                        // Find the level element
                        const levelEl = habitElement.querySelector('.habit-level');
                        console.log('Level element found:', levelEl);
                        
                        if (levelEl) {
                            // Update the level text and tooltip
                            levelEl.textContent = `Level ${responseData.level}`;
                            levelEl.title = `${responseData.total_completions} total completions`;
                            console.log('Updated level text to:', levelEl.textContent);
                            
                            // Update the level class based on the new level
                            levelEl.classList.remove('level-1', 'level-3', 'level-5', 'level-10');
                            let newLevelClass = 'level-1';
                            if (responseData.level >= 10) {
                                newLevelClass = 'level-10';
                            } else if (responseData.level >= 5) {
                                newLevelClass = 'level-5';
                            } else if (responseData.level >= 3) {
                                newLevelClass = 'level-3';
                            }
                            levelEl.classList.add(newLevelClass);
                            console.log('Updated level class to:', newLevelClass);
                            
                            // Clear status
                            habitListStatusDiv.textContent = '';
                        } else {
                            console.warn('Could not find level element for habit:', habitId);
                            // If we can't find the level element, reload the full list
                            loadHabits();
                        }
                    } else {
                        console.warn('Response data missing level or total_completions:', responseData);
                        // If we didn't get level info, reload the full list
                        loadHabits();
                    }
                    
                    // Check if the counter has reached its maximum value
                    if (newCount >= totalCount) {
                        // Add the counter-complete class to highlight the habit
                        habitElement.classList.add('counter-complete');
                        
                        // Replace the +1 button with a completed button
                        const incrementBtn = habitElement.querySelector('.habit-increment-btn');
                        if (incrementBtn) {
                            incrementBtn.textContent = '✓'; // Checkmark
                            incrementBtn.classList.add('completed');
                            incrementBtn.disabled = true;
                            incrementBtn.title = 'Completed!';
                        }
                        
                        // Force a reload of habits to ensure everything is up to date
                        setTimeout(() => {
                            loadHabits();
                        }, 500);
                    }
                } else {
                    // For regular habits, use the original function
                    await window.originalHandleHabitCheckboxClick(habitId, isChecked);
                }
            } catch (error) {
                console.error('Error in enhanced habit checkbox handler:', error);
                habitListStatusDiv.textContent = `Error: ${error.message}`;
                habitListStatusDiv.className = 'status error';
                
                // Force a reload of habits to ensure everything is up to date
                setTimeout(() => {
                    loadHabits();
                }, 1000);
            }
        };
        
        console.log('Enhanced handleHabitCheckboxClick function for better level updates');
    }
    
    // Add a periodic refresh to ensure habit levels stay up to date
    setInterval(() => {
        // Only reload if the page is visible to the user
        if (document.visibilityState === 'visible' && 
            document.querySelector('.habit-list') !== null) {
            console.log('Performing periodic habit refresh');
            loadHabits();
        }
    }, 60000); // Refresh every minute
    
    console.log('Habit level fix script loaded successfully');
});
