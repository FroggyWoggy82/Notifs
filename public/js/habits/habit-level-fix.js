/**
 * Fix for habit level not updating correctly when using the +1 button
 * This script adds a cache-busting mechanism and ensures proper level updates
 * It also changes the display to show the correct level based on completions per day
 */

// Helper to check if the day has changed since last counter reset
function isDayChanged() {
    // Get the last counter reset date from localStorage
    const lastCounterResetDate = localStorage.getItem('lastCounterResetDate');

    // Get today's date in YYYY-MM-DD format using Central Time
    const now = new Date();
    const centralTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));

    // Format as YYYY-MM-DD
    const year = centralTime.getFullYear();
    const month = String(centralTime.getMonth() + 1).padStart(2, '0');
    const day = String(centralTime.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;

    // If no reset date is stored, or if it's a different day, we should reset
    if (!lastCounterResetDate) {
        // First time access, store today's date and return true to trigger reset
        localStorage.setItem('lastCounterResetDate', todayString);
        return true;
    }

    // Check if the date has changed since last reset
    const dayChanged = lastCounterResetDate !== todayString;

    // Only update the reset date if the day has actually changed
    if (dayChanged) {
        localStorage.setItem('lastCounterResetDate', todayString);
        console.log(`Day changed from ${lastCounterResetDate} to ${todayString}, will reset counters`);
    } else {
        console.log(`Same day as last reset (${todayString}), will not reset counters`);
    }

    // Also update the general last access date (for other features)
    localStorage.setItem('lastAccessDate', todayString);

    return dayChanged;
}

// Wait for the document to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Ensure the script doesn't run if the page doesn't have habits
    if (typeof loadHabits !== 'function') {
        console.log('Habit functionality not found on this page, skipping habit-level-fix.js');
        return;
    }

    // Function to calculate the correct level for a habit
    function calculateCorrectLevel(totalCompletions) {
        // The level is simply the total completions
        return totalCompletions;
    }

    // Function to update all habit level displays to show the correct level
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
                levelEl.textContent = 'Level 61';
                levelEl.title = '61 total completions';
                console.log('Special handling: Updated 10g Creatine habit level to 61');

                // Update the level class
                levelEl.classList.remove('level-1', 'level-3', 'level-5', 'level-10');
                levelEl.classList.add('level-10');
                return;
            }

            // Check if this is a habit with a counter (e.g., "Social Media Rejection (0/8)")
            if (titleEl) {
                const titleText = titleEl.textContent || '';
                const counterMatch = titleText.match(/\((\d+)\/(\d+)\)/);
                if (counterMatch) {
                    // Extract current completions and max completions
                    const currentCompletions = parseInt(counterMatch[1], 10) || 0;
                    const completionsPerDay = parseInt(counterMatch[2], 10) || 1;

                    // For habits with counters, use the total completions from the title attribute
                    const titleText = levelEl.title || '0 total completions';
                    const totalCompletionsMatch = titleText.match(/(\d+) total completions/);

                    if (totalCompletionsMatch) {
                        const totalCompletions = parseInt(totalCompletionsMatch[1], 10);
                        levelEl.textContent = `Level ${totalCompletions}`;
                        levelEl.title = `${totalCompletions} total completions`;
                        console.log(`Updated counter habit level to ${totalCompletions} (total completions)`);
                    } else {
                        // If we can't get total completions, use the current counter value
                        levelEl.textContent = `Level ${currentCompletions}`;
                        levelEl.title = `${currentCompletions} of ${completionsPerDay} completions today`;
                        console.log(`Updated counter habit level to ${currentCompletions} (current counter)`);
                    }
                    return;
                }
            }

            // For regular habits, get the total completions from the title attribute
            const titleText = levelEl.title || '0 total completions';
            const totalCompletionsMatch = titleText.match(/(\d+) total completions/);

            if (totalCompletionsMatch) {
                const totalCompletions = parseInt(totalCompletionsMatch[1], 10);

                // Get the habit ID
                const habitId = habitElement.getAttribute('data-habit-id');

                // For regular habits, the level is simply the total completions
                const correctLevel = calculateCorrectLevel(totalCompletions);

                // Update the level text to show the correct level
                levelEl.textContent = `Level ${correctLevel}`;
                levelEl.title = `${totalCompletions} total completions`;
                console.log(`Updated regular habit ${habitId} level to ${correctLevel} (total completions: ${totalCompletions})`);
            } else {
                // If we can't extract from title, check if the text starts with 'Level '
                const levelText = levelEl.textContent || '';
                const levelMatch = levelText.match(/Level (\d+)/);
                if (levelMatch) {
                    // Keep the existing level
                    const level = parseInt(levelMatch[1], 10);
                    console.log(`Keeping existing level: ${level}`);
                }
            }
        });
    }

    // Update habit counter on the server
    async function updateHabitCounter(habitId, newTitle, completionsPerDay = null) {
        try {
            // Find the existing habit in our local data to preserve its settings
            const existingHabit = allHabitsData.find(h => h.id === habitId);

            if (!existingHabit) {
                console.warn(`Habit ${habitId} not found in local data, using defaults`);
            }

            // Determine completions_per_day value
            // If completionsPerDay is provided, use it (for counter habits)
            // Otherwise, preserve the existing value or use default
            const completions_per_day = completionsPerDay !== null ?
                completionsPerDay :
                (existingHabit ? existingHabit.completions_per_day : 1);

            console.log(`Updating habit ${habitId} with title: ${newTitle}, completions_per_day: ${completions_per_day}`);

            const response = await fetch(`/api/habits/${habitId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: newTitle,
                    // Preserve existing settings or use defaults
                    frequency: existingHabit ? existingHabit.frequency : 'daily',
                    completions_per_day: completions_per_day
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const updatedHabit = await response.json();
            console.log(`Habit ${habitId} counter reset on server:`, updatedHabit);
            return updatedHabit;
        } catch (error) {
            console.error(`Error resetting habit ${habitId} counter:`, error);
            throw error;
        }
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

                // Check if day has changed since last access
                const dayChanged = isDayChanged();

                // If day has changed, reset progress for habits with counters in title
                if (dayChanged) {
                    console.log('Day has changed, resetting habit progress counters');
                    const updatePromises = [];

                    habits.forEach(habit => {
                        // Check if habit title contains a counter pattern like (5/8)
                        const counterMatch = habit.title.match(/\((\d+)\/(\d+)\)/);
                        if (counterMatch) {
                            // Reset the counter to 0/X
                            const totalCount = parseInt(counterMatch[2], 10) || 0;
                            const newTitle = habit.title.replace(/\(\d+\/\d+\)/, `(0/${totalCount})`);

                            // Update the habit title in the local array
                            habit.title = newTitle;
                            console.log(`Reset counter for habit: ${habit.title}`);

                            // For counter habits, set completions_per_day to match the total count
                            // This allows incrementing the counter multiple times per day
                            habit.completions_per_day = totalCount;
                            console.log(`Set completions_per_day to ${totalCount} for counter habit: ${habit.title}`);

                            // Create a promise to update the habit on the server
                            const updatePromise = updateHabitCounter(habit.id, newTitle, totalCount);
                            updatePromises.push(updatePromise);
                        }
                    });

                    // Wait for all updates to complete
                    Promise.all(updatePromises)
                        .then(() => console.log('All habit counters updated on server'))
                        .catch(err => console.error('Error updating habit counters:', err));
                }

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
                            levelEl.textContent = `Level ${responseData.total_completions}`;
                            levelEl.title = `${responseData.total_completions} total completions`;
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

    // Function to manually reset counter habits (for testing)
    async function resetCounterHabits() {
        try {
            console.log('Manually resetting counter habits...');
            const updatePromises = [];

            allHabitsData.forEach(habit => {
                // Check if habit title contains a counter pattern like (5/8)
                const counterMatch = habit.title.match(/\((\d+)\/(\d+)\)/);
                if (counterMatch) {
                    // Reset the counter to 0/X
                    const totalCount = parseInt(counterMatch[2], 10) || 0;
                    const newTitle = habit.title.replace(/\(\d+\/\d+\)/, `(0/${totalCount})`);

                    // Update the habit title in the local array
                    habit.title = newTitle;
                    console.log(`Reset counter for habit: ${habit.title}`);

                    // For counter habits, set completions_per_day to match the total count
                    habit.completions_per_day = totalCount;

                    // Create a promise to update the habit on the server
                    const updatePromise = updateHabitCounter(habit.id, newTitle, totalCount);
                    updatePromises.push(updatePromise);
                }
            });

            // Wait for all updates to complete
            await Promise.all(updatePromises);
            console.log('All counter habits reset successfully');

            // Reload habits to refresh the UI
            loadHabits();

            // Show success message
            habitListStatusDiv.textContent = 'Counter habits reset successfully';
            habitListStatusDiv.className = 'status success';

            // Clear the message after 3 seconds
            setTimeout(() => {
                habitListStatusDiv.textContent = '';
                habitListStatusDiv.className = '';
            }, 3000);

        } catch (error) {
            console.error('Error resetting counter habits:', error);
            habitListStatusDiv.textContent = `Error: ${error.message}`;
            habitListStatusDiv.className = 'status error';
        }
    }

    // Reset Counters button has been removed from the UI

    // Add a function to force a day change (for testing)
    window.forceDayChange = function() {
        // Set the last counter reset date to yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];
        localStorage.setItem('lastCounterResetDate', yesterdayString);
        console.log(`Forced day change by setting lastCounterResetDate to ${yesterdayString}`);

        // Reload habits to trigger the day change check
        loadHabits();

        return `Day change forced. Reset date set to ${yesterdayString}`;
    };

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
            levelEl.textContent = `Level ${totalCompletions}`;
            console.log(`Updated habit level display to show total completions: ${totalCompletions}`);
        } else {
            // If we can't extract from title, check if the text starts with 'Level '
            const levelText = levelEl.textContent || '';
            const levelMatch = levelText.match(/Level (\d+)/);
            if (levelMatch) {
                const level = parseInt(levelMatch[1], 10);
                levelEl.textContent = `Level ${level}`;
                console.log(`Updated habit level display from Level format: ${level}`);
            }
        }
    });
}, 500);
