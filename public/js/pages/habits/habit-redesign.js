/**
 * Habit List Redesign
 *
 * Redesigns the habit list to match the futuristic dark theme with a new layout
 */

(function() {
    // Wait for the DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHabitRedesign);
    } else {
        initHabitRedesign();
    }

    function initHabitRedesign() {
        console.log('[Habit Redesign] Initializing...');

        // Override the displayHabits function to use our new layout
        const originalDisplayHabits = window.displayHabits;
        if (originalDisplayHabits) {
            window.displayHabits = function(habits) {
                console.log('[Habit Redesign] Rendering habits with new layout');
                renderRedesignedHabits(habits);

                // Call any other habit-related functions that might need to run
                setTimeout(() => {
                    if (typeof ensureCompletedHabitsVisualState === 'function') {
                        ensureCompletedHabitsVisualState();
                    }
                }, 100);
            };

            console.log('[Habit Redesign] Successfully overrode displayHabits function');
        } else {
            console.error('[Habit Redesign] Could not find displayHabits function to override');
        }
    }

    // Function to render habits with the new layout
    function renderRedesignedHabits(habits) {
        const habitListDiv = document.getElementById('habitList');
        if (!habitListDiv) {
            console.error('[Habit Redesign] Could not find habit list container');
            return;
        }

        habitListDiv.innerHTML = ''; // Clear previous list/placeholder
        habitListDiv.style.width = '100%';
        habitListDiv.style.margin = '0';
        habitListDiv.style.padding = '0';

        if (!habits || habits.length === 0) {
            habitListDiv.innerHTML = '<p>No habits added yet.</p>';
            return;
        }

        habits.forEach(habit => {
            // Create the habit element
            const habitElement = document.createElement('div');
            habitElement.classList.add('habit-item');
            habitElement.dataset.habitId = habit.id;
            habitElement.style.width = '100%';
            habitElement.style.boxSizing = 'border-box';
            habitElement.style.margin = '0';

            // Determine completion status
            let completionsToday = habit.completions_today || 0;
            const completionsTarget = habit.completions_per_day || 1;
            let isComplete = completionsToday >= completionsTarget;

            // Check if habit title contains a counter pattern like (1/10)
            let hasCounter = false;
            let currentCount = 0;
            let totalCount = 0;
            const counterMatch = habit.title.match(/\((\d+)\/(\d+)\)/);

            if (counterMatch) {
                hasCounter = true;
                currentCount = parseInt(counterMatch[1], 10) || 0;
                totalCount = parseInt(counterMatch[2], 10) || 0;

                // For counter habits, completion is based on the counter values
                isComplete = currentCount >= totalCount;

                // Set data attribute for CSS targeting
                habitElement.dataset.counter = 'true';

                // Update completions for display
                completionsToday = currentCount;
                completionsTarget = totalCount;
            }

            // Set completed attribute for CSS targeting
            if (isComplete) {
                habitElement.dataset.completed = 'true';
            }

            // Prepare the checkbox or +1 button HTML
            let controlHtml = '';

            if (hasCounter) {
                // For counter habits, show a +1 button
                if (isComplete) {
                    // When counter reached target, show a completed button
                    controlHtml = `
                        <div class="habit-control-container">
                            <button class="habit-increment-btn completed" title="Completed!" disabled>✓</button>
                        </div>
                    `;
                } else {
                    // When counter not yet complete, show a +1 button
                    controlHtml = `
                        <div class="habit-control-container">
                            <button class="habit-increment-btn" title="Click to add +1">+1</button>
                        </div>
                    `;
                }
            } else if (completionsTarget > 1) {
                // For habits with multiple completions per day, show a +1 button
                if (isComplete) {
                    // When completions reached target, show a completed button
                    controlHtml = `
                        <div class="habit-control-container">
                            <button class="habit-increment-btn completed" title="Completed for today!" disabled>✓</button>
                        </div>
                    `;
                } else {
                    // When not yet complete, show a +1 button
                    controlHtml = `
                        <div class="habit-control-container">
                            <button class="habit-increment-btn" title="Click to add +1">+1</button>
                        </div>
                    `;
                }
            } else {
                // For regular habits with single completion target, show a checkbox
                controlHtml = `
                    <div class="habit-control-container">
                        <input type="checkbox" class="habit-checkbox" title="Mark as done" ${isComplete ? 'checked' : ''}>
                    </div>
                `;
            }

            // Calculate level class based on total completions
            let totalCompletionsCount = habit.total_completions || 0;
            let levelClass = 'level-beginner';

            if (totalCompletionsCount >= 100) {
                levelClass = 'level-master';
            } else if (totalCompletionsCount >= 50) {
                levelClass = 'level-expert';
            } else if (totalCompletionsCount >= 25) {
                levelClass = 'level-advanced';
            } else if (totalCompletionsCount >= 10) {
                levelClass = 'level-intermediate';
            }

            // Build the habit item HTML
            habitElement.innerHTML = `
                ${controlHtml}
                <div class="habit-content">
                    <span class="habit-title">${habit.title}</span>
                    <span class="habit-frequency">Frequency: ${habit.frequency}</span>
                </div>
                <div class="habit-indicators-row">
                    <div class="habit-progress-container" title="Completions today">
                        ${completionsToday}/${completionsTarget}
                    </div>
                    <div class="habit-level ${levelClass}" title="${totalCompletionsCount} total completions">
                        Level ${totalCompletionsCount}
                    </div>
                </div>
                <div class="habit-actions">
                    <button class="icon-btn edit-habit-icon-btn" title="Edit habit"><i class="pencil-icon"><i class="fas fa-pencil-alt"></i></i></button>
                    <button class="icon-btn delete-habit-icon-btn" title="Delete habit"><i class="x-icon"><i class="fas fa-times"></i></i></button>
                </div>
            `;

            // Apply styling if complete
            if (isComplete) {
                if (hasCounter) {
                    // For counter habits that are complete, use counter-complete class
                    habitElement.classList.add('counter-complete');
                } else {
                    // For regular habits that are complete, use complete class
                    habitElement.classList.add('complete');
                }
            }

            // Add event listeners
            const checkbox = habitElement.querySelector('.habit-checkbox');
            if (checkbox) {
                checkbox.addEventListener('change', function() {
                    const isChecked = this.checked;
                    console.log(`Checkbox for habit ${habit.id} changed to ${isChecked}`);

                    // Call the original habit completion function
                    if (typeof completeHabit === 'function') {
                        completeHabit(habit.id, isChecked);
                    }
                });
            }

            // Add event listener for +1 button
            const incrementBtn = habitElement.querySelector('.habit-increment-btn:not(.completed)');
            if (incrementBtn) {
                incrementBtn.addEventListener('click', function() {
                    console.log(`Increment button clicked for habit ${habit.id}`);

                    // Call the original habit increment function
                    if (typeof window.handleHabitIncrementClick === 'function') {
                        // Create a mock event object with currentTarget
                        const mockEvent = {
                            currentTarget: this,
                            preventDefault: () => {},
                            stopPropagation: () => {}
                        };
                        window.handleHabitIncrementClick(mockEvent);
                    }
                });
            }

            // Add event listeners for edit and delete buttons
            const editBtn = habitElement.querySelector('.edit-habit-icon-btn');
            const deleteBtn = habitElement.querySelector('.delete-habit-icon-btn');

            if (editBtn) {
                editBtn.addEventListener('click', function() {
                    console.log(`Edit button clicked for habit ${habit.id}`);

                    // Call the original edit habit function
                    if (typeof openEditHabitModal === 'function') {
                        openEditHabitModal(habit);
                    } else if (typeof window.showEditHabitModal === 'function') {
                        window.showEditHabitModal(habit);
                    }
                });
            }

            if (deleteBtn) {
                deleteBtn.addEventListener('click', function() {
                    console.log(`Delete button clicked for habit ${habit.id}`);

                    // Call the original delete habit function
                    if (typeof deleteHabit === 'function') {
                        deleteHabit(habit.id);
                    }
                });
            }

            // Add the habit element to the list
            habitListDiv.appendChild(habitElement);
        });
    }
})();
