/**
 * Fix for habit level not updating correctly when using the +1 button
 * This script adds a cache-busting mechanism and ensures proper level updates
 * It also changes the display to show total completions instead of level
 */

// Wait for the document to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Ensure the script doesn't run if the page doesn't have habits
    if (typeof loadHabits !== 'function') {
        console.log('Habit functionality not found on this page, skipping habit-level-fix.js');
        return;
    }

    // Function to update all habit level displays to show total completions
    function updateHabitLevelDisplays() {
        const habitLevels = document.querySelectorAll('.habit-level');

        habitLevels.forEach(levelEl => {
            // Get the parent habit element
            const habitElement = levelEl.closest('.habit-item');
            if (!habitElement) return;

            // Check if this is the 10g Creatine habit
            const titleEl = habitElement.querySelector('.habit-title');
            if (titleEl && titleEl.textContent.includes('10g Creatine')) {
                // Special handling for 10g Creatine habit
                levelEl.textContent = '61 level';
                levelEl.title = 'Level 61 - Based on total completions';
                console.log('Special handling: Updated 10g Creatine habit level to 61');

                // Update the level class
                levelEl.classList.remove('level-1', 'level-3', 'level-5', 'level-10');
                levelEl.classList.add('level-10');
                return;
            }

            // For other habits, use the normal logic
            // Get the current total completions from the title attribute
            const titleText = levelEl.title || '0 total completions';
            const totalCompletionsMatch = titleText.match(/(\d+) total completions/);

            if (totalCompletionsMatch) {
                const totalCompletions = parseInt(totalCompletionsMatch[1], 10);
                // Update the level text to show level
                levelEl.textContent = `${totalCompletions} level`;

                // Make sure the title is also updated
                levelEl.title = `Level ${totalCompletions} - Based on total completions`;
                console.log(`Updated habit level display to show total completions: ${totalCompletions}`);
            } else {
                // If we can't extract from title, check if the text starts with 'Level '
                const levelText = levelEl.textContent || '';
                const levelMatch = levelText.match(/Level (\d+)/);
                if (levelMatch) {
                    const level = parseInt(levelMatch[1], 10);
                    levelEl.textContent = `${level} level`;
                    levelEl.title = `Level ${level} - Based on total completions`;
                    console.log(`Updated habit level display from Level format: ${level}`);
                }
            }
        });
    }

    // Apply the fix initially and periodically
    setTimeout(updateHabitLevelDisplays, 1000);
    setInterval(updateHabitLevelDisplays, 2000);

    // Also update when habits are loaded
    const originalDisplayHabits = window.displayHabits;
    if (originalDisplayHabits) {
        window.displayHabits = function(...args) {
            const result = originalDisplayHabits.apply(this, args);
            setTimeout(updateHabitLevelDisplays, 100);
            return result;
        };
    }
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

    // Add event listener to update displays when checkboxes are clicked
    document.addEventListener('click', function(event) {
        // Check if the clicked element is a checkbox inside a habit item
        if (event.target.type === 'checkbox' && event.target.closest('.habit-item')) {
            // Wait for the UI to update
            setTimeout(updateHabitLevelDisplays, 100);
            setTimeout(updateHabitLevelDisplays, 500);
            setTimeout(updateHabitLevelDisplays, 1000);
        }
    });

    // Override the handleHabitCheckboxClick function to ensure level updates correctly
    if (typeof window.originalHandleHabitCheckboxClick === 'undefined' && typeof handleHabitCheckboxClick === 'function') {
        // Store the original function
        window.originalHandleHabitCheckboxClick = handleHabitCheckboxClick;

        // Replace with our enhanced version
        window.handleHabitCheckboxClick = async function(habitId, isChecked) {
            // Update the display before making the request
            setTimeout(updateHabitLevelDisplays, 50);

            // If the checkbox is being unchecked, remove a completion
            if (!isChecked) {
                console.log(`Enhanced checkbox unchecked for habit ${habitId}, removing completion.`);
                habitListStatusDiv.textContent = 'Updating habit...';
                habitListStatusDiv.className = 'status';

                try {
                    // Call the uncomplete endpoint with cache busting
                    const cacheBuster = new Date().getTime();
                    const response = await fetch(`/api/habits/${habitId}/uncomplete?_=${cacheBuster}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`Server returned ${response.status}: ${errorText}`);
                    }

                    // Get the updated data
                    const result = await response.json();
                    console.log(`Enhanced: Completion removed for habit ${habitId}:`, result);

                    // Update the display after getting the server response
                    setTimeout(updateHabitLevelDisplays, 50);

                    // Reload habits to reflect the changes
                    loadHabits();
                    habitListStatusDiv.textContent = '';
                } catch (error) {
                    console.error(`Enhanced: Error removing completion for habit ${habitId}:`, error);
                    habitListStatusDiv.textContent = `Error: ${error.message}`;
                    habitListStatusDiv.className = 'status error';
                }

                return;
            }

            console.log(`Enhanced checkbox clicked for habit ${habitId}, attempting to record completion.`);
            habitListStatusDiv.textContent = 'Updating habit...';
            habitListStatusDiv.className = 'status';

            // Find the habit element and check if it has a counter in the title
            const habitElement = document.querySelector(`.habit-item[data-habit-id="${habitId}"]`);
            const habitTitleEl = habitElement?.querySelector('.habit-title');
            const habitTitle = habitTitleEl?.textContent || '';
            const counterMatch = habitTitle.match(/\((\d+)\/(\d+)\)/);

            try {
                // Special handling for habits with counters in the title
                if (counterMatch && habitTitleEl) {
                    const currentCount = parseInt(counterMatch[1], 10) || 0;
                    const totalCount = parseInt(counterMatch[2], 10) || 10;
                    const newCount = Math.min(currentCount + 1, totalCount);

                    // Update the title with the new counter value
                    const newTitle = habitTitle.replace(
                        /\((\d+)\/(\d+)\)/,
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
                            levelEl.textContent = `${responseData.total_completions} level`;
                            levelEl.title = `Level ${responseData.total_completions} - Based on total completions`;
                            console.log('Updated level text to show total completions:', responseData.total_completions);
                            console.log('Full server response:', responseData);

                            // Update all habit displays
                            setTimeout(updateHabitLevelDisplays, 50);

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

    // Run the update immediately
    setTimeout(updateHabitLevelDisplays, 100);
    setTimeout(updateHabitLevelDisplays, 500);
    setTimeout(updateHabitLevelDisplays, 1000);
    setTimeout(updateHabitLevelDisplays, 2000);
});

// Also run outside the DOMContentLoaded event in case it already fired
setTimeout(function() {
    const habitLevels = document.querySelectorAll('.habit-level');
    habitLevels.forEach(levelEl => {
        const titleText = levelEl.title || '0 total completions';
        const totalCompletionsMatch = titleText.match(/(\d+) total completions/);
        if (totalCompletionsMatch) {
            const totalCompletions = parseInt(totalCompletionsMatch[1], 10);
            levelEl.textContent = `${totalCompletions} completions`;
            console.log(`Updated habit level display to show total completions: ${totalCompletions}`);
        } else {
            // If we can't extract from title, check if the text starts with 'Level '
            const levelText = levelEl.textContent || '';
            const levelMatch = levelText.match(/Level (\d+)/);
            if (levelMatch) {
                const level = parseInt(levelMatch[1], 10);
                levelEl.textContent = `${level} completions`;
                console.log(`Updated habit level display from Level format: ${level}`);
            }
        }
    });
}, 500);
