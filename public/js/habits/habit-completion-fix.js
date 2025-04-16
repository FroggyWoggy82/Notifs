/**
 * Fix for habit completion visual state
 * This script ensures that completed habits stay visually completed
 */

// Wait for the document to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Ensure the script doesn't run if the page doesn't have habits
    if (typeof loadHabits !== 'function') {
        console.log('Habit functionality not found on this page, skipping habit-completion-fix.js');
        return;
    }

    console.log('Habit completion fix script loaded');

    // Function to ensure completed habits are visually marked as completed
    function ensureCompletedHabitsVisualState() {
        console.log('Checking for completed habits to ensure visual state');

        // Find all habit elements
        const habitElements = document.querySelectorAll('.habit-item');

        habitElements.forEach(habitElement => {
            const habitId = habitElement.dataset.habitId;
            if (!habitId) return;

            // Check if this habit has any completions today
            const progressEl = habitElement.querySelector('.habit-progress');
            if (!progressEl) return;

            const progressText = progressEl.textContent || '';
            const progressMatch = progressText.match(/Progress: (\d+)\/(\d+)/);

            if (progressMatch) {
                const completionsToday = parseInt(progressMatch[1], 10) || 0;

                // If there are any completions today, mark as completed
                if (completionsToday > 0) {
                    console.log(`Marking habit ${habitId} as completed (${completionsToday} completions today)`);

                    // Set the data-completed attribute for CSS targeting
                    habitElement.dataset.completed = 'true';
                    habitElement.classList.add('complete');

                    // Also ensure the checkbox is checked
                    const checkbox = habitElement.querySelector('.habit-checkbox');
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                }
            }
        });
    }

    // Override the displayHabits function to ensure completed habits are visually marked
    const originalDisplayHabits = window.displayHabits;
    if (originalDisplayHabits) {
        window.displayHabits = function(...args) {
            const result = originalDisplayHabits.apply(this, args);

            // After displaying habits, ensure completed habits are visually marked
            setTimeout(ensureCompletedHabitsVisualState, 100);
            setTimeout(ensureCompletedHabitsVisualState, 500);
            setTimeout(ensureCompletedHabitsVisualState, 1000);

            return result;
        };

        console.log('Enhanced displayHabits function to ensure completed habits visual state');
    }

    // We don't need to override the handleHabitCheckboxClick function anymore
    // The backend now handles the logic to prevent multiple increments per day

    // Run the check periodically
    setInterval(ensureCompletedHabitsVisualState, 2000);

    // Add event listener for habit increment buttons to ensure they update properly
    document.addEventListener('click', async function(event) {
        // Check if the clicked element is a habit increment button
        if (event.target.classList.contains('habit-increment-btn') && !event.target.classList.contains('completed')) {
            const habitElement = event.target.closest('.habit-item');
            if (!habitElement) return;

            const habitId = habitElement.dataset.habitId;
            if (!habitId) return;

            console.log(`Habit increment button clicked for habit ${habitId}`);

            // Wait for the increment to complete, then reload habits to ensure proper state
            setTimeout(() => {
                console.log(`Reloading habits after increment for habit ${habitId}`);
                if (typeof loadHabits === 'function') {
                    loadHabits();
                }
            }, 500);
        }
    });

    // We don't need to override the handleHabitCheckboxClick function anymore
    // The backend now handles the logic to prevent multiple increments per day
    console.log('Using backend logic to prevent multiple increments per day');

    // Run the check immediately
    setTimeout(ensureCompletedHabitsVisualState, 100);
    setTimeout(ensureCompletedHabitsVisualState, 500);
    setTimeout(ensureCompletedHabitsVisualState, 1000);
});

// Also run outside the DOMContentLoaded event in case it already fired
setTimeout(function() {
    if (typeof loadHabits === 'function') {
        const habitElements = document.querySelectorAll('.habit-item');

        habitElements.forEach(habitElement => {
            const habitId = habitElement.dataset.habitId;
            if (!habitId) return;

            // Check if this habit has any completions today
            const progressEl = habitElement.querySelector('.habit-progress');
            if (!progressEl) return;

            const progressText = progressEl.textContent || '';
            const progressMatch = progressText.match(/Progress: (\d+)\/(\d+)/);

            if (progressMatch) {
                const completionsToday = parseInt(progressMatch[1], 10) || 0;

                // If there are any completions today, mark as completed
                if (completionsToday > 0) {
                    console.log(`Marking habit ${habitId} as completed (${completionsToday} completions today)`);

                    // Set the data-completed attribute for CSS targeting
                    habitElement.dataset.completed = 'true';
                    habitElement.classList.add('complete');

                    // Also ensure the checkbox is checked
                    const checkbox = habitElement.querySelector('.habit-checkbox');
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                }
            }
        });
    }
}, 500);
