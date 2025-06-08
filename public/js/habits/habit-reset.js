/**
 * Habit Reset Functionality
 * This script provides functions to reset habit completions
 *
 * IMPORTANT: This file was modified to fix the issue where habits were resetting at 7 PM
 * instead of at midnight. The auto-reset based on completion percentage has been disabled.
 * Habits will now only reset at midnight via the server-side cron job.
 */

console.log('Loading habit-reset.js...');

async function resetHabitCompletions() {
    try {
        console.log('Resetting habit completions via API...');

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

        updateHabitCountersInUI();

        return result;
    } catch (error) {
        console.error('Error resetting habit completions:', error);
        alert(`Failed to reset habits: ${error.message}`);
        throw error;
    }
}

async function forceDayChange() {
    console.log('Forcing day change and resetting habits...');

    try {

        const now = new Date();
        const centralTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
        centralTime.setDate(centralTime.getDate() - 1);

        const year = centralTime.getFullYear();
        const month = String(centralTime.getMonth() + 1).padStart(2, '0');
        const day = String(centralTime.getDate()).padStart(2, '0');
        const yesterdayString = `${year}-${month}-${day}`;

        localStorage.setItem('lastCounterResetDate', yesterdayString);
        console.log(`Set lastCounterResetDate to ${yesterdayString} (Central Time)`);

        try {

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

                resetHabitsInUI();
            }
        } catch (apiError) {
            console.error('API error:', apiError);

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

        console.log('Calling server-side API to reset all habits...');

        try {
            const response = await fetch('/api/habit-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Server-side reset successful:', result);

                updateUIAfterReset();

                console.log('Reloading page to ensure everything is in sync...');
                setTimeout(() => {
                    window.location.reload();
                }, 500);

                return;
            } else {
                console.error('Server-side reset failed with status:', response.status);

            }
        } catch (error) {
            console.error('Error calling server-side reset API:', error);

        }

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

    const habitItems = document.querySelectorAll('.habit-item');
    if (!habitItems || habitItems.length === 0) {
        console.log('No habit items found in the UI');
        return;
    }

    console.log(`Found ${habitItems.length} habit items to update in UI`);

    habitItems.forEach((habitItem) => {
        try {

            const progressDisplay = habitItem.querySelector('.habit-progress');
            if (!progressDisplay) return;

            const titleElement = habitItem.querySelector('.habit-title');
            if (!titleElement) return;

            const habitTitle = titleElement.textContent || '';

            const counterMatch = habitTitle.match(/\((\d+)\/(\d+)\)/);
            if (counterMatch) {

                const totalCount = parseInt(counterMatch[2], 10);
                const newProgressText = `0/${totalCount}`;
                progressDisplay.textContent = newProgressText;

                if (titleElement && counterMatch.index !== undefined) {
                    const newTitle = habitTitle.substring(0, counterMatch.index) +
                                    `(0/${totalCount})` +
                                    habitTitle.substring(counterMatch.index + counterMatch[0].length);
                    titleElement.textContent = newTitle;
                }
            } else {

                progressDisplay.textContent = '0/1';
            }

            habitItem.classList.remove('completed');

            habitItem.setAttribute('data-completed', 'false');

            const checkbox = habitItem.querySelector('.habit-checkbox');
            if (checkbox) {
                checkbox.checked = false;
            }
        } catch (error) {
            console.error('Error updating habit item in UI:', error);

        }
    });

    console.log('UI updated successfully');
}

/**
 * Fallback function for client-side reset
 */
async function clientSideReset() {
    console.log('Performing client-side reset...');

    const habitItems = document.querySelectorAll('.habit-item');
    if (!habitItems || habitItems.length === 0) {
        console.log('No habit items found in the UI');
        return;
    }

    console.log(`Found ${habitItems.length} habit items to update`);

    const updatedHabits = [];

    habitItems.forEach((habitItem) => {
        try {

            const habitId = habitItem.getAttribute('data-habit-id');
            if (!habitId) {
                console.log('Habit item has no ID, skipping');
                return;
            }

            const progressDisplay = habitItem.querySelector('.habit-progress');
            if (!progressDisplay) return;

            const titleElement = habitItem.querySelector('.habit-title');
            if (!titleElement) return;

            const habitTitle = titleElement.textContent || '';
            console.log(`Processing habit: ${habitTitle} (ID: ${habitId})`);

            const counterMatch = habitTitle.match(/\((\d+)\/(\d+)\)/);
            if (counterMatch) {

                const totalCount = parseInt(counterMatch[2], 10);
                const newProgressText = `0/${totalCount}`;
                progressDisplay.textContent = newProgressText;
                console.log(`Reset counter habit: ${habitTitle} -> 0/${totalCount}`);

                if (titleElement && counterMatch.index !== undefined) {
                    const newTitle = habitTitle.substring(0, counterMatch.index) +
                                    `(0/${totalCount})` +
                                    habitTitle.substring(counterMatch.index + counterMatch[0].length);
                    titleElement.textContent = newTitle;

                    updatedHabits.push({
                        id: habitId,
                        title: newTitle,
                        isCounter: true,
                        totalCount: totalCount
                    });
                }
            } else {

                progressDisplay.textContent = '0/1';
                console.log(`Reset regular habit: ${habitTitle} -> 0/1`);

                updatedHabits.push({
                    id: habitId,
                    title: habitTitle,
                    isCounter: false
                });
            }

            habitItem.classList.remove('completed');

            habitItem.setAttribute('data-completed', 'false');

            const checkbox = habitItem.querySelector('.habit-checkbox');
            if (checkbox) {
                checkbox.checked = false;
            }
        } catch (error) {
            console.error('Error processing habit item:', error);

        }
    });

    console.log('Habit counters reset in UI');

    console.log('Updating database for each habit...');

    const updatePromises = updatedHabits.map(habit => {
        return new Promise((resolve) => {
            try {

                if (habit.isCounter) {

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

    Promise.allSettled(updatePromises)
        .then(results => {
            console.log('All database updates completed');
            console.log('Results:', results);

            const successCount = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
            console.log(`Successfully updated ${successCount} out of ${updatedHabits.length} habits`);

            console.log('Reloading page to ensure everything is in sync...');
            setTimeout(() => {
                window.location.reload();
            }, 500);
        })
        .catch(error => {
            console.error('Error updating database:', error);

            setTimeout(() => {
                window.location.reload();
            }, 500);
        });
}


/**
 * Check if the day has changed since the last visit
 * If it has, reset the habit counters
 * Also check if any habits have non-zero values when they should be reset
 */
async function checkForDayChange() {
    console.log('Checking if day has changed since last visit...');

    const lastCounterResetDate = localStorage.getItem('lastCounterResetDate');

    const now = new Date();
    const centralTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
    const year = centralTime.getFullYear();
    const month = String(centralTime.getMonth() + 1).padStart(2, '0');
    const day = String(centralTime.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;

    console.log(`Last reset date: ${lastCounterResetDate}, Today: ${todayString}`);

    if (lastCounterResetDate !== todayString) {
        console.log('Day has changed! Resetting habit counters...');

        try {

            localStorage.setItem('lastCounterResetDate', todayString);
            console.log(`Updated lastCounterResetDate to ${todayString}`);

            try {

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

                    resetHabitsInUI();
                }
            } catch (apiError) {
                console.error('API error:', apiError);

                resetHabitsInUI();
            }
        } catch (error) {
            console.error('Error resetting habits on day change:', error);
        }
    } else {
        console.log('Same day as last reset - no action needed.');
        console.log('Habits will only be reset at midnight by the server-side cron job.');

        // DISABLED: We no longer check if habits need reset during the same day
        // This was causing habits to be incorrectly reset during the day
        /*
        const needsReset = checkIfHabitsNeedReset();

        if (needsReset) {
            console.log('Found habits that need to be reset despite date check. Forcing reset...');
            resetHabitsInUI();
        } else {
            console.log('All habits appear to be properly reset. No action needed.');
        }
        */
    }
}

/**
 * Check if any habits have non-zero values when they should be reset
 * This helps detect cases where the server-side cron job didn't run
 * @returns {boolean} True if any habits need to be reset
 */
function checkIfHabitsNeedReset() {
    console.log('Checking if any habits need to be reset...');

    // IMPORTANT: We no longer automatically reset habits based on time of day or completion status
    // Habits should only be reset by the server-side cron job at midnight
    // This prevents habits from being incorrectly reset during the day

    console.log('Auto-reset logic disabled - habits will only reset via server cron job at midnight');
    return false;

    // The following code has been disabled to prevent premature habit resets:
    /*
    const habitItems = document.querySelectorAll('.habit-item');
    if (!habitItems || habitItems.length === 0) {
        console.log('No habit items found in the UI');
        return false;
    }

    const now = new Date();
    const centralTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
    const currentHour = centralTime.getHours();

    const isEarlyMorning = currentHour >= 0 && currentHour < 6;
    console.log(`Current hour in Central Time: ${currentHour}, isEarlyMorning: ${isEarlyMorning}`);

    let needsReset = false;

    habitItems.forEach((habitItem) => {
        try {
            const progressDisplay = habitItem.querySelector('.habit-progress');
            if (!progressDisplay) return;

            const progressText = progressDisplay.textContent || '';

            const progressMatch = progressText.match(/^(\d+)\/(\d+)$/);
            if (progressMatch) {
                const currentValue = parseInt(progressMatch[1], 10);

                if (isEarlyMorning && currentValue > 0) {
                    console.log(`Found habit with non-zero value in early morning: ${progressText}`);
                    needsReset = true;
                }

                // We no longer reset habits based on completion percentage during the day
                // This was causing habits to reset at around 7 PM when many habits were completed
                // Now we only reset habits at midnight via the server-side cron job
                if (false) { // Disabled this condition
                    const targetValue = parseInt(progressMatch[2], 10);

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
    */
}

/**
 * Reset all habits without changing the date
 * This is useful for testing
 */
async function resetHabitsNow() {
    console.log('Manually resetting habits...');

    try {

        try {

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

                resetHabitsInUI();
            }
        } catch (apiError) {
            console.error('API error:', apiError);

            resetHabitsInUI();
        }

        return `Habits reset successfully.`;
    } catch (error) {
        console.error('Error resetting habits:', error);
        alert(`Failed to reset habits: ${error.message}. Please try again.`);
        return `Error: ${error.message}`;
    }
}

window.forceDayChange = forceDayChange;
window.checkForDayChange = checkForDayChange;
window.resetHabitsInUI = resetHabitsInUI;
window.resetHabitsNow = resetHabitsNow;

document.addEventListener('DOMContentLoaded', () => {

    checkForDayChange();
});

console.log('Habit reset functionality loaded successfully');
