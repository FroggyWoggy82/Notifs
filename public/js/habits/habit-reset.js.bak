/**
 * Habit Reset Functionality
 * This script provides functions to reset habit completions
 */

console.log('Loading habit-reset.js...');

// Function to reset habit completions via API
async function resetHabitCompletions() {
    try {
        console.log('Resetting habit completions via API...');

        // Call the reset API endpoint - use relative URL to work in all environments
        const baseUrl = window.location.origin;
        const apiUrl = `${baseUrl}/api/habit-reset`;
        console.log(`Calling reset API at: ${apiUrl}`);

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Server error: ${errorData.message || response.statusText}`);
        }

        const result = await response.json();
        console.log('Habit reset successful:', result);

        // Update the UI directly without reloading
        updateHabitCountersInUI();

        return result;
    } catch (error) {
        console.error('Error resetting habit completions:', error);
        alert(`Failed to reset habits: ${error.message}`);
        throw error;
    }
}

// Function to force a day change and reset habits (for testing)
async function forceDayChange() {
    console.log('Forcing day change and resetting habits...');

    try {
        // Set the last counter reset date to yesterday using Central Time
        const now = new Date();
        const centralTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
        centralTime.setDate(centralTime.getDate() - 1);

        // Format as YYYY-MM-DD
        const year = centralTime.getFullYear();
        const month = String(centralTime.getMonth() + 1).padStart(2, '0');
        const day = String(centralTime.getDate()).padStart(2, '0');
        const yesterdayString = `${year}-${month}-${day}`;

        localStorage.setItem('lastCounterResetDate', yesterdayString);
        console.log(`Set lastCounterResetDate to ${yesterdayString} (Central Time)`);

        // Call the server-side reset API
        try {
            // Use relative URL to work with any port
            let apiResponse = null;

            try {
                console.log('Calling habit reset API...');
                const response = await fetch('/api/habit-reset', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (response.ok) {
                    apiResponse = await response.json();
                    console.log('API call successful:', apiResponse);
                } else {
                    console.log('API call failed with status:', response.status);
                }
            } catch (err) {
                console.log('API call failed:', err);
            }

            if (apiResponse) {
                console.log('API reset successful, reloading page...');
                window.location.reload();
                return 'Habits reset successfully. Reloading page...';
            } else {
                console.log('API calls failed, falling back to UI reset...');
                // Fall back to UI reset
                resetHabitsInUI();
            }
        } catch (apiError) {
            console.error('API error:', apiError);
            // Fall back to UI reset
            resetHabitsInUI();
        }

        return `Day change forced. Reset date set to ${yesterdayString}. Habits reset.`;
    } catch (error) {
        console.error('Error forcing day change:', error);
        alert(`Failed to reset habits: ${error.message}. Please try again.`);
        return `Error: ${error.message}`;
    }
}

/**
 * Reset all habits in the UI to 0/X and persist the changes
 * This function now calls the server-side API directly
 */
async function resetHabitsInUI() {
    console.log('Resetting habits in UI and persisting changes...');

    try {
        // First, call the server-side API to reset all habits
        console.log('Calling server-side API to reset all habits...');

        try {
            const response = await fetch('/api/habit-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Server-side reset successful:', result);

                // Now update the UI to reflect the changes
                updateUIAfterReset();

                // Force a reload of the page to ensure everything is in sync
                console.log('Reloading page to ensure everything is in sync...');
                setTimeout(() => {
                    window.location.reload();
                }, 500);

                return;
            } else {
                console.error('Server-side reset failed with status:', response.status);
                // Fall back to client-side reset
            }
        } catch (error) {
            console.error('Error calling server-side reset API:', error);
            // Fall back to client-side reset
        }

        // If we get here, the server-side reset failed, so fall back to client-side reset
        console.log('Falling back to client-side reset...');
        clientSideReset();
    } catch (error) {
        console.error('Error in resetHabitsInUI:', error);
        alert('Failed to reset habits. Please try again.');
    }
}

/**
 * Update the UI to reflect the reset habits
 */
function updateUIAfterReset() {
    console.log('Updating UI to reflect reset habits...');

    // Find all habit items in the UI
    const habitItems = document.querySelectorAll('.habit-item');
    if (!habitItems || habitItems.length === 0) {
        console.log('No habit items found in the UI');
        return;
    }

    console.log(`Found ${habitItems.length} habit items to update in UI`);

    // Update each habit item
    habitItems.forEach((habitItem) => {
        try {
            // Find the progress display element
            const progressDisplay = habitItem.querySelector('.habit-progress');
            if (!progressDisplay) return;

            // Find the habit title to check if it's a counter habit
            const titleElement = habitItem.querySelector('.habit-title');
            if (!titleElement) return;

            const habitTitle = titleElement.textContent || '';

            // Check if this is a counter habit (has X/Y format)
            const counterMatch = habitTitle.match(/\((\d+)\/(\d+)\)/);
            if (counterMatch) {
                // This is a counter habit, reset to 0/Y
                const totalCount = parseInt(counterMatch[2], 10);
                const newProgressText = `0/${totalCount}`;
                progressDisplay.textContent = newProgressText;

                // Also update the title if it contains the counter
                if (titleElement && counterMatch.index !== undefined) {
                    const newTitle = habitTitle.substring(0, counterMatch.index) +
                                    `(0/${totalCount})` +
                                    habitTitle.substring(counterMatch.index + counterMatch[0].length);
                    titleElement.textContent = newTitle;
                }
            } else {
                // For non-counter habits, just set progress to 0/1
                progressDisplay.textContent = '0/1';
            }

            // Remove completed class if present
            habitItem.classList.remove('completed');

            // Update data attributes
            habitItem.setAttribute('data-completed', 'false');

            // Update the checkbox if present
            const checkbox = habitItem.querySelector('.habit-checkbox');
            if (checkbox) {
                checkbox.checked = false;
            }
        } catch (error) {
            console.error('Error updating habit item in UI:', error);
            // Continue with other habit items
        }
    });

    console.log('UI updated successfully');
}

/**
 * Fallback function for client-side reset
 */
async function clientSideReset() {
    console.log('Performing client-side reset...');

    // Find all habit items in the UI
    const habitItems = document.querySelectorAll('.habit-item');
    if (!habitItems || habitItems.length === 0) {
        console.log('No habit items found in the UI');
        return;
    }

    console.log(`Found ${habitItems.length} habit items to update`);

    // Keep track of which habits we've updated
    const updatedHabits = [];

    // Update each habit item
    habitItems.forEach((habitItem) => {
        try {
            // Get the habit ID
            const habitId = habitItem.getAttribute('data-habit-id');
            if (!habitId) {
                console.log('Habit item has no ID, skipping');
                return;
            }

            // Find the progress display element
            const progressDisplay = habitItem.querySelector('.habit-progress');
            if (!progressDisplay) return;

            // Find the habit title to check if it's a counter habit
            const titleElement = habitItem.querySelector('.habit-title');
            if (!titleElement) return;

            const habitTitle = titleElement.textContent || '';
            console.log(`Processing habit: ${habitTitle} (ID: ${habitId})`);

            // Check if this is a counter habit (has X/Y format)
            const counterMatch = habitTitle.match(/\((\d+)\/(\d+)\)/);
            if (counterMatch) {
                // This is a counter habit, reset to 0/Y
                const totalCount = parseInt(counterMatch[2], 10);
                const newProgressText = `0/${totalCount}`;
                progressDisplay.textContent = newProgressText;
                console.log(`Reset counter habit: ${habitTitle} -> 0/${totalCount}`);

                // Also update the title if it contains the counter
                if (titleElement && counterMatch.index !== undefined) {
                    const newTitle = habitTitle.substring(0, counterMatch.index) +
                                    `(0/${totalCount})` +
                                    habitTitle.substring(counterMatch.index + counterMatch[0].length);
                    titleElement.textContent = newTitle;

                    // Add to the list of habits to update in the database
                    updatedHabits.push({
                        id: habitId,
                        title: newTitle,
                        isCounter: true,
                        totalCount: totalCount
                    });
                }
            } else {
                // For non-counter habits, just set progress to 0/1
                progressDisplay.textContent = '0/1';
                console.log(`Reset regular habit: ${habitTitle} -> 0/1`);

                // Add to the list of habits to update in the database
                updatedHabits.push({
                    id: habitId,
                    title: habitTitle,
                    isCounter: false
                });
            }

            // Remove completed class if present
            habitItem.classList.remove('completed');

            // Update data attributes
            habitItem.setAttribute('data-completed', 'false');

            // Update the checkbox if present
            const checkbox = habitItem.querySelector('.habit-checkbox');
            if (checkbox) {
                checkbox.checked = false;
            }
        } catch (error) {
            console.error('Error processing habit item:', error);
            // Continue with other habit items
        }
    });

    console.log('Habit counters reset in UI');

    // Now, update the database for each habit
    console.log('Updating database for each habit...');

    // Create a promise for each habit update
    const updatePromises = updatedHabits.map(habit => {
        return new Promise((resolve) => {
            try {
                // For counter habits, we need to update the title
                if (habit.isCounter) {
                    // Update the habit title in the database
                    fetch(`/api/habits/${habit.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            title: habit.title,
                            completions_per_day: habit.totalCount
                        })
                    })
                    .then(response => {
                        if (response.ok) {
                            console.log(`Updated habit ${habit.id} in database`);
                            resolve(true);
                        } else {
                            console.error(`Failed to update habit ${habit.id} in database`);
                            resolve(false);
                        }
                    })
                    .catch(error => {
                        console.error(`Error updating habit ${habit.id} in database:`, error);
                        resolve(false);
                    });
                } else {
                    // For regular habits, we need to use the uncomplete endpoint
                    fetch(`/api/habits/${habit.id}/uncomplete`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(response => {
                        if (response.ok) {
                            console.log(`Removed completion for habit ${habit.id}`);
                            resolve(true);
                        } else {
                            // If there's no completion to remove, that's fine
                            console.log(`No completions to remove for habit ${habit.id}`);
                            resolve(true);
                        }
                    })
                    .catch(error => {
                        console.error(`Error removing completion for habit ${habit.id}:`, error);
                        resolve(false);
                    });
                }
            } catch (error) {
                console.error(`Error processing habit ${habit.id}:`, error);
                resolve(false);
            }
        });
    });

    // Wait for all updates to complete
    Promise.allSettled(updatePromises)
        .then(results => {
            console.log('All database updates completed');
            console.log('Results:', results);

            // Count successful updates
            const successCount = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
            console.log(`Successfully updated ${successCount} out of ${updatedHabits.length} habits`);

            // Force a reload of the page to ensure everything is in sync
            console.log('Reloading page to ensure everything is in sync...');
            setTimeout(() => {
                window.location.reload();
            }, 500);
        })
        .catch(error => {
            console.error('Error updating database:', error);

            // Force a reload of the page anyway
            setTimeout(() => {
                window.location.reload();
            }, 500);
        });
}

// Function removed - code moved to forceDayChange and checkForDayChange

/**
 * Check if the day has changed since the last visit
 * If it has, reset the habit counters
 * Also check if any habits have non-zero values when they should be reset
 */
async function checkForDayChange() {
    console.log('Checking if day has changed since last visit...');

    // Get the last counter reset date from localStorage
    const lastCounterResetDate = localStorage.getItem('lastCounterResetDate');

    // Get today's date in Central Time
    const now = new Date();
    const centralTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
    const year = centralTime.getFullYear();
    const month = String(centralTime.getMonth() + 1).padStart(2, '0');
    const day = String(centralTime.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;

    console.log(`Last reset date: ${lastCounterResetDate}, Today: ${todayString}`);

    // Check if the date has changed
    if (lastCounterResetDate !== todayString) {
        console.log('Day has changed! Resetting habit counters...');

        try {
            // Update localStorage with today's date first to prevent repeated reset attempts
            localStorage.setItem('lastCounterResetDate', todayString);
            console.log(`Updated lastCounterResetDate to ${todayString}`);

            // Call the server-side reset API
            try {
                // Use relative URL to work with any port
                let apiResponse = null;

                try {
                    console.log('Calling habit reset API...');
                    const response = await fetch('/api/habit-reset', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (response.ok) {
                        apiResponse = await response.json();
                        console.log('API call successful:', apiResponse);
                    } else {
                        console.log('API call failed with status:', response.status);
                    }
                } catch (err) {
                    console.log('API call failed:', err);
                }

                if (apiResponse) {
                    console.log('API reset successful, reloading page...');
                    window.location.reload();
                    return;
                } else {
                    console.log('API calls failed, falling back to UI reset...');
                    // Fall back to UI reset
                    resetHabitsInUI();
                }
            } catch (apiError) {
                console.error('API error:', apiError);
                // Fall back to UI reset
                resetHabitsInUI();
            }
        } catch (error) {
            console.error('Error resetting habits on day change:', error);
        }
    } else {
        console.log('Same day as last reset, checking if habits need reset anyway...');

        // Even if the date hasn't changed, check if any habits have non-zero values
        // This handles the case where the server-side cron job didn't run overnight
        const needsReset = checkIfHabitsNeedReset();

        if (needsReset) {
            console.log('Found habits that need to be reset despite date check. Forcing reset...');
            resetHabitsInUI();
        } else {
            console.log('All habits appear to be properly reset. No action needed.');
        }
    }
}

/**
 * Check if any habits have non-zero values when they should be reset
 * This helps detect cases where the server-side cron job didn't run
 * @returns {boolean} True if any habits need to be reset
 */
function checkIfHabitsNeedReset() {
    console.log('Checking if any habits need to be reset...');

    // Find all habit items in the UI
    const habitItems = document.querySelectorAll('.habit-item');
    if (!habitItems || habitItems.length === 0) {
        console.log('No habit items found in the UI');
        return false;
    }

    // Get the current hour in Central Time
    const now = new Date();
    const centralTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
    const currentHour = centralTime.getHours();

    // If it's between midnight and 6 AM, we should check more aggressively
    // This is when users are most likely to first open the app after the reset should have happened
    const isEarlyMorning = currentHour >= 0 && currentHour < 6;
    console.log(`Current hour in Central Time: ${currentHour}, isEarlyMorning: ${isEarlyMorning}`);

    // Check each habit item
    let needsReset = false;

    habitItems.forEach((habitItem) => {
        try {
            // Find the progress display element
            const progressDisplay = habitItem.querySelector('.habit-progress');
            if (!progressDisplay) return;

            // Get the current progress text
            const progressText = progressDisplay.textContent || '';

            // Parse the progress (e.g., "3/5" -> currentValue = 3)
            const progressMatch = progressText.match(/^(\d+)\/(\d+)$/);
            if (progressMatch) {
                const currentValue = parseInt(progressMatch[1], 10);

                // If it's early morning and any habit has a non-zero value, it probably needs reset
                if (isEarlyMorning && currentValue > 0) {
                    console.log(`Found habit with non-zero value in early morning: ${progressText}`);
                    needsReset = true;
                }

                // If it's not early morning, we'll be more conservative
                // Only consider it needs reset if the value is high relative to the target
                if (!isEarlyMorning) {
                    const targetValue = parseInt(progressMatch[2], 10);
                    // If current value is more than 75% of target, it probably needs reset
                    if (targetValue > 1 && currentValue >= Math.ceil(targetValue * 0.75)) {
                        console.log(`Found habit with high value: ${progressText} (${currentValue}/${targetValue})`);
                        needsReset = true;
                    }
                }
            }
        } catch (error) {
            console.error('Error checking habit item:', error);
        }
    });

    return needsReset;
}

/**
 * Reset all habits without changing the date
 * This is useful for testing
 */
async function resetHabitsNow() {
    console.log('Manually resetting habits...');

    try {
        // Call the server-side reset API
        try {
            // Use relative URL to work with any port
            let apiResponse = null;

            try {
                console.log('Calling habit reset API...');
                const response = await fetch('/api/habit-reset', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (response.ok) {
                    apiResponse = await response.json();
                    console.log('API call successful:', apiResponse);
                } else {
                    console.log('API call failed with status:', response.status);
                }
            } catch (err) {
                console.log('API call failed:', err);
            }

            if (apiResponse) {
                console.log('API reset successful, reloading page...');
                window.location.reload();
                return 'Habits reset successfully. Reloading page...';
            } else {
                console.log('API calls failed, falling back to UI reset...');
                // Fall back to UI reset
                resetHabitsInUI();
            }
        } catch (apiError) {
            console.error('API error:', apiError);
            // Fall back to UI reset
            resetHabitsInUI();
        }

        return `Habits reset successfully.`;
    } catch (error) {
        console.error('Error resetting habits:', error);
        alert(`Failed to reset habits: ${error.message}. Please try again.`);
        return `Error: ${error.message}`;
    }
}

// Make functions available globally
window.forceDayChange = forceDayChange;
window.checkForDayChange = checkForDayChange;
window.resetHabitsInUI = resetHabitsInUI;
window.resetHabitsNow = resetHabitsNow;

// Add event listener to check for day change on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if the day has changed since last visit
    checkForDayChange();
});

console.log('Habit reset functionality loaded successfully');
