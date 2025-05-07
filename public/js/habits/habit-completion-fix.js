/**
 * Fix for habit completion visual state
 * This script ensures that completed habits stay visually completed
 */

document.addEventListener('DOMContentLoaded', () => {

    if (typeof loadHabits !== 'function') {
        console.log('Habit functionality not found on this page, skipping habit-completion-fix.js');
        return;
    }

    console.log('Habit completion fix script loaded');

    function ensureCompletedHabitsVisualState() {
        console.log('Checking for completed habits to ensure visual state');

        const habitElements = document.querySelectorAll('.habit-item');

        habitElements.forEach(habitElement => {
            const habitId = habitElement.dataset.habitId;
            if (!habitId) return;

            const progressEl = habitElement.querySelector('.habit-progress');
            if (!progressEl) return;

            const progressText = progressEl.textContent || '';
            const progressMatch = progressText.match(/Progress: (\d+)\/(\d+)/);

            if (progressMatch) {
                const completionsToday = parseInt(progressMatch[1], 10) || 0;

                if (completionsToday > 0) {
                    console.log(`Marking habit ${habitId} as completed (${completionsToday} completions today)`);

                    habitElement.dataset.completed = 'true';
                    habitElement.classList.add('complete');

                    const checkbox = habitElement.querySelector('.habit-checkbox');
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                }
            }
        });
    }

    const originalDisplayHabits = window.displayHabits;
    if (originalDisplayHabits) {
        window.displayHabits = function(...args) {
            const result = originalDisplayHabits.apply(this, args);

            setTimeout(ensureCompletedHabitsVisualState, 100);
            setTimeout(ensureCompletedHabitsVisualState, 500);
            setTimeout(ensureCompletedHabitsVisualState, 1000);

            return result;
        };

        console.log('Enhanced displayHabits function to ensure completed habits visual state');
    }



    setInterval(ensureCompletedHabitsVisualState, 2000);

    document.addEventListener('click', async function(event) {

        if (event.target.classList.contains('habit-increment-btn') && !event.target.classList.contains('completed')) {
            const habitElement = event.target.closest('.habit-item');
            if (!habitElement) return;

            const habitId = habitElement.dataset.habitId;
            if (!habitId) return;

            console.log(`Habit increment button clicked for habit ${habitId}`);

            setTimeout(() => {
                console.log(`Reloading habits after increment for habit ${habitId}`);
                if (typeof loadHabits === 'function') {
                    loadHabits();
                }
            }, 500);
        }
    });


    console.log('Using backend logic to prevent multiple increments per day');

    setTimeout(ensureCompletedHabitsVisualState, 100);
    setTimeout(ensureCompletedHabitsVisualState, 500);
    setTimeout(ensureCompletedHabitsVisualState, 1000);
});

setTimeout(function() {
    if (typeof loadHabits === 'function') {
        const habitElements = document.querySelectorAll('.habit-item');

        habitElements.forEach(habitElement => {
            const habitId = habitElement.dataset.habitId;
            if (!habitId) return;

            const progressEl = habitElement.querySelector('.habit-progress');
            if (!progressEl) return;

            const progressText = progressEl.textContent || '';
            const progressMatch = progressText.match(/Progress: (\d+)\/(\d+)/);

            if (progressMatch) {
                const completionsToday = parseInt(progressMatch[1], 10) || 0;

                if (completionsToday > 0) {
                    console.log(`Marking habit ${habitId} as completed (${completionsToday} completions today)`);

                    habitElement.dataset.completed = 'true';
                    habitElement.classList.add('complete');

                    const checkbox = habitElement.querySelector('.habit-checkbox');
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                }
            }
        });
    }
}, 500);
