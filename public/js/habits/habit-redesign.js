/**
 * Habit List Redesign
 *
 * Redesigns the habit list to match the futuristic dark theme with a new layout
 */

(function() {

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHabitRedesign);
    } else {
        initHabitRedesign();
    }

    function initHabitRedesign() {
        console.log('[Habit Redesign] Initializing...');

        const originalDisplayHabits = window.displayHabits;
        if (originalDisplayHabits) {
            window.displayHabits = function(habits) {
                console.log('[Habit Redesign] Rendering habits with new layout');
                renderRedesignedHabits(habits);

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

            const habitElement = document.createElement('div');
            habitElement.classList.add('habit-item');
            habitElement.dataset.habitId = habit.id;
            habitElement.style.width = '100%';
            habitElement.style.boxSizing = 'border-box';
            habitElement.style.margin = '0';

            let completionsToday = habit.completions_today || 0;
            const completionsTarget = habit.completions_per_day || 1;
            let isComplete = completionsToday >= completionsTarget;

            let hasCounter = false;
            let currentCount = 0;
            let totalCount = 0;
            const counterMatch = habit.title.match(/\((\d+)\/(\d+)\)/);

            if (counterMatch) {
                hasCounter = true;
                currentCount = parseInt(counterMatch[1], 10) || 0;
                totalCount = parseInt(counterMatch[2], 10) || 0;

                isComplete = currentCount >= totalCount;

                habitElement.dataset.counter = 'true';

                completionsToday = currentCount;
                completionsTarget = totalCount;
            }

            if (isComplete) {
                habitElement.dataset.completed = 'true';
            }

            let controlHtml = '';

            if (hasCounter) {

                if (isComplete) {

                    controlHtml = `
                        <div class="habit-control-container">
                            <button class="habit-increment-btn completed" title="Completed!" disabled>✓</button>
                        </div>
                    `;
                } else {

                    controlHtml = `
                        <div class="habit-control-container">
                            <button class="habit-increment-btn" title="Click to add +1">+1</button>
                        </div>
                    `;
                }
            } else if (completionsTarget > 1) {

                if (isComplete) {

                    controlHtml = `
                        <div class="habit-control-container">
                            <button class="habit-increment-btn completed" title="Completed for today!" disabled>✓</button>
                        </div>
                    `;
                } else {

                    controlHtml = `
                        <div class="habit-control-container">
                            <button class="habit-increment-btn" title="Click to add +1">+1</button>
                        </div>
                    `;
                }
            } else {

                controlHtml = `
                    <div class="habit-control-container">
                        <input type="checkbox" class="habit-checkbox" title="Mark as done" ${isComplete ? 'checked' : ''}>
                    </div>
                `;
            }

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

            if (isComplete) {
                if (hasCounter) {

                    habitElement.classList.add('counter-complete');
                } else {

                    habitElement.classList.add('complete');
                }
            }

            const checkbox = habitElement.querySelector('.habit-checkbox');
            if (checkbox) {
                checkbox.addEventListener('change', function() {
                    const isChecked = this.checked;
                    console.log(`Checkbox for habit ${habit.id} changed to ${isChecked}`);

                    if (typeof completeHabit === 'function') {
                        completeHabit(habit.id, isChecked);
                    }
                });
            }

            const incrementBtn = habitElement.querySelector('.habit-increment-btn:not(.completed)');
            if (incrementBtn) {
                incrementBtn.addEventListener('click', function() {
                    console.log(`Increment button clicked for habit ${habit.id}`);

                    if (typeof window.handleHabitIncrementClick === 'function') {

                        const mockEvent = {
                            currentTarget: this,
                            preventDefault: () => {},
                            stopPropagation: () => {}
                        };
                        window.handleHabitIncrementClick(mockEvent);
                    }
                });
            }

            const editBtn = habitElement.querySelector('.edit-habit-icon-btn');
            const deleteBtn = habitElement.querySelector('.delete-habit-icon-btn');

            if (editBtn) {
                editBtn.addEventListener('click', function() {
                    console.log(`Edit button clicked for habit ${habit.id}`);

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

                    if (typeof deleteHabit === 'function') {
                        deleteHabit(habit.id);
                    }
                });
            }

            habitListDiv.appendChild(habitElement);
        });
    }
})();
