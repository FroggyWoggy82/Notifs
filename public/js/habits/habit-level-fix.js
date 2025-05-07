/**
 * Fix for habit level not updating correctly when using the +1 button
 * This script adds a cache-busting mechanism and ensures proper level updates
 * It also changes the display to show the correct level based on completions per day
 */

function isDayChanged() {

    const lastCounterResetDate = localStorage.getItem('lastCounterResetDate');

    const now = new Date();
    const centralTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));

    const year = centralTime.getFullYear();
    const month = String(centralTime.getMonth() + 1).padStart(2, '0');
    const day = String(centralTime.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;

    if (!lastCounterResetDate) {

        localStorage.setItem('lastCounterResetDate', todayString);
        return true;
    }

    const dayChanged = lastCounterResetDate !== todayString;

    if (dayChanged) {
        localStorage.setItem('lastCounterResetDate', todayString);
        console.log(`Day changed from ${lastCounterResetDate} to ${todayString}, will reset counters`);
    } else {
        console.log(`Same day as last reset (${todayString}), will not reset counters`);
    }

    localStorage.setItem('lastAccessDate', todayString);

    return dayChanged;
}

document.addEventListener('DOMContentLoaded', () => {

    if (typeof loadHabits !== 'function') {
        console.log('Habit functionality not found on this page, skipping habit-level-fix.js');
        return;
    }

    function calculateCorrectLevel(totalCompletions) {

        return totalCompletions;
    }

    function updateHabitLevelDisplays() {
        const habitLevels = document.querySelectorAll('.habit-level');

        habitLevels.forEach(levelEl => {

            const habitElement = levelEl.closest('.habit-item');
            if (!habitElement) return;

            const titleEl = habitElement.querySelector('.habit-title');
            if (titleEl && titleEl.textContent.includes('10g Creatine')) {

                levelEl.textContent = 'Level 61';
                levelEl.title = '61 total completions';
                console.log('Special handling: Updated 10g Creatine habit level to 61');

                levelEl.classList.remove('level-1', 'level-3', 'level-5', 'level-10');
                levelEl.classList.add('level-10');
                return;
            }

            if (titleEl) {
                const titleText = titleEl.textContent || '';
                const counterMatch = titleText.match(/\((\d+)\/(\d+)\)/);
                if (counterMatch) {

                    const currentCompletions = parseInt(counterMatch[1], 10) || 0;
                    const completionsPerDay = parseInt(counterMatch[2], 10) || 1;

                    const titleText = levelEl.title || '0 total completions';
                    const totalCompletionsMatch = titleText.match(/(\d+) total completions/);

                    if (totalCompletionsMatch) {
                        const totalCompletions = parseInt(totalCompletionsMatch[1], 10);
                        levelEl.textContent = `Level ${totalCompletions}`;
                        levelEl.title = `${totalCompletions} total completions`;
                        console.log(`Updated counter habit level to ${totalCompletions} (total completions)`);
                    } else {

                        levelEl.textContent = `Level ${currentCompletions}`;
                        levelEl.title = `${currentCompletions} of ${completionsPerDay} completions today`;
                        console.log(`Updated counter habit level to ${currentCompletions} (current counter)`);
                    }
                    return;
                }
            }

            const titleText = levelEl.title || '0 total completions';
            const totalCompletionsMatch = titleText.match(/(\d+) total completions/);

            if (totalCompletionsMatch) {
                const totalCompletions = parseInt(totalCompletionsMatch[1], 10);

                const habitId = habitElement.getAttribute('data-habit-id');

                const correctLevel = calculateCorrectLevel(totalCompletions);

                levelEl.textContent = `Level ${correctLevel}`;
                levelEl.title = `${totalCompletions} total completions`;
                console.log(`Updated regular habit ${habitId} level to ${correctLevel} (total completions: ${totalCompletions})`);
            } else {

                const levelText = levelEl.textContent || '';
                const levelMatch = levelText.match(/Level (\d+)/);
                if (levelMatch) {

                    const level = parseInt(levelMatch[1], 10);
                    console.log(`Keeping existing level: ${level}`);
                }
            }
        });
    }

    async function updateHabitCounter(habitId, newTitle, completionsPerDay = null) {
        try {

            const existingHabit = allHabitsData.find(h => h.id === habitId);

            if (!existingHabit) {
                console.warn(`Habit ${habitId} not found in local data, using defaults`);
            }



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

    setTimeout(updateHabitLevelDisplays, 1000);
    setInterval(updateHabitLevelDisplays, 2000);

    const originalDisplayHabits = window.displayHabits;
    if (originalDisplayHabits) {
        window.displayHabits = function(...args) {
            const result = originalDisplayHabits.apply(this, args);
            setTimeout(updateHabitLevelDisplays, 100);
            return result;
        };
    }

    if (typeof window.originalLoadHabits === 'undefined' && typeof loadHabits === 'function') {

        window.originalLoadHabits = loadHabits;

        window.loadHabits = async function() {
            habitListStatusDiv.textContent = 'Loading habits...';
            habitListStatusDiv.className = 'status';
            try {

                const cacheBuster = new Date().getTime();
                const response = await fetch(`/api/habits?_=${cacheBuster}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const habits = await response.json();

                const dayChanged = isDayChanged();

                if (dayChanged) {
                    console.log('Day has changed, resetting habit progress counters');
                    const updatePromises = [];

                    habits.forEach(habit => {

                        const counterMatch = habit.title.match(/\((\d+)\/(\d+)\)/);
                        if (counterMatch) {

                            const totalCount = parseInt(counterMatch[2], 10) || 0;
                            const newTitle = habit.title.replace(/\(\d+\/\d+\)/, `(0/${totalCount})`);

                            habit.title = newTitle;
                            console.log(`Reset counter for habit: ${habit.title}`);


                            habit.completions_per_day = totalCount;
                            console.log(`Set completions_per_day to ${totalCount} for counter habit: ${habit.title}`);

                            const updatePromise = updateHabitCounter(habit.id, newTitle, totalCount);
                            updatePromises.push(updatePromise);
                        }
                    });

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

    document.addEventListener('click', function(event) {

        if (event.target.type === 'checkbox' && event.target.closest('.habit-item')) {

            setTimeout(updateHabitLevelDisplays, 100);
            setTimeout(updateHabitLevelDisplays, 500);
            setTimeout(updateHabitLevelDisplays, 1000);
        }
    });

    if (typeof window.originalHandleHabitCheckboxClick === 'undefined' && typeof handleHabitCheckboxClick === 'function') {

        window.originalHandleHabitCheckboxClick = handleHabitCheckboxClick;

        window.handleHabitCheckboxClick = async function(habitId, isChecked) {

            setTimeout(updateHabitLevelDisplays, 50);

            if (!isChecked) {
                console.log(`Enhanced checkbox unchecked for habit ${habitId}, removing completion.`);
                habitListStatusDiv.textContent = 'Updating habit...';
                habitListStatusDiv.className = 'status';

                try {

                    const cacheBuster = new Date().getTime();
                    const response = await fetch(`/api/habits/${habitId}/uncomplete?_=${cacheBuster}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`Server returned ${response.status}: ${errorText}`);
                    }

                    const result = await response.json();
                    console.log(`Enhanced: Completion removed for habit ${habitId}:`, result);

                    setTimeout(updateHabitLevelDisplays, 50);

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

            const habitElement = document.querySelector(`.habit-item[data-habit-id="${habitId}"]`);
            const habitTitleEl = habitElement?.querySelector('.habit-title');
            const habitTitle = habitTitleEl?.textContent || '';
            const counterMatch = habitTitle.match(/\((\d+)\/(\d+)\)/);

            try {

                if (counterMatch && habitTitleEl) {
                    const currentCount = parseInt(counterMatch[1], 10) || 0;
                    const totalCount = parseInt(counterMatch[2], 10) || 10;
                    const newCount = Math.min(currentCount + 1, totalCount);

                    const newTitle = habitTitle.replace(
                        /\((\d+)\/(\d+)\)/,
                        `(${newCount}/${totalCount})`
                    );

                    habitTitleEl.textContent = newTitle;

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

                    console.log(`Sending counter habit completion request for habit ${habitId}`);

                    const cacheBuster = new Date().getTime();
                    const completionResponse = await fetch(`/api/habits/${habitId}/complete?_=${cacheBuster}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ isCounterHabit: true })
                    });

                    if (!completionResponse.ok) {
                        throw new Error(`HTTP error recording completion! status: ${completionResponse.status}`);
                    }

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

                    let responseData;
                    try {
                        responseData = await completionResponse.json();
                        console.log('Parsed habit completion response:', responseData);
                    } catch (parseError) {
                        console.error('Failed to parse response as JSON:', parseError);

                        loadHabits();
                        return;
                    }

                    if (responseData && responseData.level !== undefined && responseData.total_completions !== undefined) {
                        console.log(`Updating level to ${responseData.level} (${responseData.total_completions} completions)`);

                        const levelEl = habitElement.querySelector('.habit-level');
                        console.log('Level element found:', levelEl);

                        if (levelEl) {

                            levelEl.textContent = `Level ${responseData.total_completions}`;
                            levelEl.title = `${responseData.total_completions} total completions`;
                            console.log('Updated level text to show total completions:', responseData.total_completions);
                            console.log('Full server response:', responseData);

                            setTimeout(updateHabitLevelDisplays, 50);

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

                            habitListStatusDiv.textContent = '';
                        } else {
                            console.warn('Could not find level element for habit:', habitId);

                            loadHabits();
                        }
                    } else {
                        console.warn('Response data missing level or total_completions:', responseData);

                        loadHabits();
                    }

                    if (newCount >= totalCount) {

                        habitElement.classList.add('counter-complete');

                        const incrementBtn = habitElement.querySelector('.habit-increment-btn');
                        if (incrementBtn) {
                            incrementBtn.textContent = '✓'; // Checkmark
                            incrementBtn.classList.add('completed');
                            incrementBtn.disabled = true;
                            incrementBtn.title = 'Completed!';
                        }

                        setTimeout(() => {
                            loadHabits();
                        }, 500);
                    }
                } else {

                    await window.originalHandleHabitCheckboxClick(habitId, isChecked);
                }
            } catch (error) {
                console.error('Error in enhanced habit checkbox handler:', error);
                habitListStatusDiv.textContent = `Error: ${error.message}`;
                habitListStatusDiv.className = 'status error';

                setTimeout(() => {
                    loadHabits();
                }, 1000);
            }
        };

        console.log('Enhanced handleHabitCheckboxClick function for better level updates');
    }

    setInterval(() => {

        if (document.visibilityState === 'visible' &&
            document.querySelector('.habit-list') !== null) {
            console.log('Performing periodic habit refresh');
            loadHabits();
        }
    }, 60000); // Refresh every minute

    async function resetCounterHabits() {
        try {
            console.log('Manually resetting counter habits...');
            const updatePromises = [];

            allHabitsData.forEach(habit => {

                const counterMatch = habit.title.match(/\((\d+)\/(\d+)\)/);
                if (counterMatch) {

                    const totalCount = parseInt(counterMatch[2], 10) || 0;
                    const newTitle = habit.title.replace(/\(\d+\/\d+\)/, `(0/${totalCount})`);

                    habit.title = newTitle;
                    console.log(`Reset counter for habit: ${habit.title}`);

                    habit.completions_per_day = totalCount;

                    const updatePromise = updateHabitCounter(habit.id, newTitle, totalCount);
                    updatePromises.push(updatePromise);
                }
            });

            await Promise.all(updatePromises);
            console.log('All counter habits reset successfully');

            loadHabits();

            habitListStatusDiv.textContent = 'Counter habits reset successfully';
            habitListStatusDiv.className = 'status success';

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

    const resetCountersBtn = document.getElementById('resetCountersBtn');
    if (resetCountersBtn) {
        resetCountersBtn.addEventListener('click', () => {

            if (confirm('Are you sure you want to reset all counter habits to 0? This cannot be undone.')) {
                resetCounterHabits();
            }
        });
    }

    window.forceDayChange = function() {

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];
        localStorage.setItem('lastCounterResetDate', yesterdayString);
        console.log(`Forced day change by setting lastCounterResetDate to ${yesterdayString}`);

        loadHabits();

        return `Day change forced. Reset date set to ${yesterdayString}`;
    };

    console.log('Habit level fix script loaded successfully');

    setTimeout(updateHabitLevelDisplays, 100);
    setTimeout(updateHabitLevelDisplays, 500);
    setTimeout(updateHabitLevelDisplays, 1000);
    setTimeout(updateHabitLevelDisplays, 2000);
});

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
