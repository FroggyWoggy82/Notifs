/**
 * Workout Persistence
 * This file contains functions to directly save and restore workout data
 * without relying on the main saveInputValues function.
 */

const WORKOUT_DATA_KEY = 'workout_tracker_data';

function initWorkoutPersistence() {

    addInputChangeListeners();

    addNavigationListeners();

    setTimeout(restoreWorkoutData, 500);

    setupMutationObserver();

    window.saveWorkoutData = saveWorkoutData;
    window.restoreWorkoutData = restoreWorkoutData;
    window.updateCurrentWorkoutFromUI = updateCurrentWorkoutFromUI;
}

function addInputChangeListeners() {

    const exerciseListEl = document.getElementById('current-exercise-list');
    if (!exerciseListEl) {
        console.error('Exercise list element not found');
        return;
    }

    exerciseListEl.addEventListener('input', (event) => {
        const target = event.target;
        if (target instanceof HTMLElement) {
            if (target.classList.contains('weight-input') ||
                target.classList.contains('reps-input') ||
                target.classList.contains('exercise-notes-textarea')) {

                saveWorkoutData();
            }
        }
    });

    exerciseListEl.addEventListener('click', (event) => {
        const target = event.target;
        if (target instanceof HTMLElement && target.classList.contains('set-complete-toggle')) {

            setTimeout(saveWorkoutData, 50);
        }
    });

    exerciseListEl.addEventListener('change', (event) => {
        const target = event.target;
        if (target instanceof HTMLElement && target.classList.contains('exercise-unit-select')) {

            saveWorkoutData();
        }
    });
}

function addNavigationListeners() {

    window.addEventListener('beforeunload', () => {
        saveWorkoutData();
    });

    document.querySelectorAll('.sidebar-nav-item, .nav-item').forEach(link => {
        link.addEventListener('click', () => {
            saveWorkoutData();
        });
    });

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            console.log('Page visibility changed to hidden, saving workout data');
            saveWorkoutData();
        }
    });

    setInterval(() => {
        if (document.visibilityState === 'visible' && !window.isRestoringWorkoutData) {
            console.log('Periodic save of workout data');
            saveWorkoutData();
        }
    }, 30000); // Save every 30 seconds
}

function setupMutationObserver() {
    const exerciseListEl = document.getElementById('current-exercise-list');
    if (!exerciseListEl) {
        console.error('Exercise list element not found');
        return;
    }

    // Use a flag to prevent multiple calls in quick succession
    let isRestoring = false;
    let restoreTimeout = null;

    // Use a more efficient debounce function
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    // Create a debounced version of restoreWorkoutData
    const debouncedRestore = debounce(() => {
        if (!isRestoring) {
            isRestoring = true;
            restoreWorkoutData();
            setTimeout(() => {
                isRestoring = false;
            }, 1000);
        }
    }, 500);

    // Create a more efficient observer with limited scope
    const observer = new MutationObserver((mutations) => {
        let shouldRestore = false;

        // Only process if we're not already restoring
        if (!isRestoring) {
            // Check if any exercise items were added
            for (let i = 0; i < mutations.length; i++) {
                const mutation = mutations[i];
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    for (let j = 0; j < mutation.addedNodes.length; j++) {
                        const node = mutation.addedNodes[j];
                        if (node.nodeType === 1 && node.classList.contains('exercise-item')) {
                            shouldRestore = true;
                            break;
                        }
                    }
                    if (shouldRestore) break;
                }
            }

            // If we need to restore, use the debounced function
            if (shouldRestore) {
                debouncedRestore();
            }
        }
    });

    // Observe only childList changes to reduce overhead
    observer.observe(exerciseListEl, {
        childList: true,
        subtree: false
    });

    // Clean up the observer when the page is unloaded
    window.addEventListener('beforeunload', () => {
        observer.disconnect();
    });
}

function saveWorkoutData() {
    try {
        // Use the current workout from memory, not localStorage
        if (!window.currentWorkout) {
            console.error('No current workout found in memory');
            return false;
        }

        const currentWorkout = window.currentWorkout;

        const exerciseItems = document.querySelectorAll('.exercise-item');
        if (!exerciseItems.length) {
            console.error('No exercise items found in DOM');
            return false;
        }

        updateCurrentWorkoutFromUI(currentWorkout);

        localStorage.setItem('workout_tracker_current_workout', JSON.stringify(currentWorkout));

        if (typeof window.saveGoalCheckboxesState === 'function') {
            window.saveGoalCheckboxesState();
        }

        if (typeof window.saveGoalTextState === 'function') {
            window.saveGoalTextState();
        }

        const workoutData = {
            exercises: [],
            timestamp: Date.now()
        };

        exerciseItems.forEach(item => {
            const workoutIndex = parseInt(item.dataset.workoutIndex, 10);
            if (isNaN(workoutIndex)) {
                console.error('Invalid workout index:', item.dataset.workoutIndex);
                return;
            }

            const exercises = Array.isArray(currentWorkout) ? currentWorkout : currentWorkout.exercises;
            if (!exercises || !exercises[workoutIndex]) {
                console.error('Exercise not found at index:', workoutIndex);
                return;
            }

            const exerciseData = exercises[workoutIndex];

            const setRows = item.querySelectorAll('.set-row');

            const exerciseInfo = {
                exercise_id: exerciseData.exercise_id,
                name: exerciseData.name,
                sets: [],
                notes: '',
                weight_unit: exerciseData.weight_unit || 'lbs', // Save the weight unit
                set_count: setRows.length // Save the current number of sets
            };
            setRows.forEach((row) => {
                const weightInput = row.querySelector('.weight-input');
                const repsInput = row.querySelector('.reps-input');
                const completeToggle = row.querySelector('.set-complete-toggle');

                exerciseInfo.sets.push({
                    weight: weightInput ? weightInput.value : '',
                    reps: repsInput ? repsInput.value : '',
                    completed: completeToggle ? completeToggle.classList.contains('completed') : false
                });
            });

            const notesTextarea = item.querySelector('.exercise-notes-textarea');
            if (notesTextarea) {
                exerciseInfo.notes = notesTextarea.value;
            }

            const unitSelect = item.querySelector('.exercise-unit-select');
            if (unitSelect) {
                exerciseInfo.weight_unit = unitSelect.value;
            }

            workoutData.exercises.push(exerciseInfo);
        });

        localStorage.setItem(WORKOUT_DATA_KEY, JSON.stringify(workoutData));
        return true;
    } catch (error) {
        console.error('Error saving workout data:', error);
        return false;
    }
}

function restoreWorkoutData() {
    try {

        const workoutDataJson = localStorage.getItem(WORKOUT_DATA_KEY);
        if (!workoutDataJson) {
            console.log('No saved workout data found');
            return false;
        }

        console.log('Restoring workout data from localStorage');

        window.isRestoringWorkoutData = true;

        if (typeof window.restoreGoalCheckboxesState === 'function') {
            setTimeout(() => {
                window.restoreGoalCheckboxesState();
            }, 300);
        }

        if (typeof window.restoreGoalTextState === 'function') {
            setTimeout(() => {
                window.restoreGoalTextState();
            }, 300);
        }

        // Refresh warmup displays after restoration
        if (typeof window.refreshAllWarmupDisplays === 'function') {
            setTimeout(() => {
                window.refreshAllWarmupDisplays();
            }, 500);
        }

        const workoutData = JSON.parse(workoutDataJson);

        const currentWorkoutJson = localStorage.getItem('workout_tracker_current_workout');
        if (!currentWorkoutJson) {
            console.error('No current workout found in localStorage');
            return false;
        }

        const currentWorkout = JSON.parse(currentWorkoutJson);

        const exerciseItems = document.querySelectorAll('.exercise-item');
        if (!exerciseItems.length) {
            console.error('No exercise items found in DOM');
            return false;
        }

        exerciseItems.forEach(item => {
            const workoutIndex = parseInt(item.dataset.workoutIndex, 10);
            if (isNaN(workoutIndex)) {
                console.error('Invalid workout index:', item.dataset.workoutIndex);
                return;
            }

            const exercises = Array.isArray(currentWorkout) ? currentWorkout : currentWorkout.exercises;
            if (!exercises || !exercises[workoutIndex]) {
                console.error('Exercise not found at index:', workoutIndex);
                return;
            }

            const exerciseData = exercises[workoutIndex];
            const exerciseId = exerciseData.exercise_id;

            const savedExercise = workoutData.exercises.find(e => e.exercise_id === exerciseId);
            if (!savedExercise) {
                return;
            }

            const currentSetCount = item.querySelectorAll('.set-row').length;
            const savedSetCount = savedExercise.set_count || savedExercise.sets.length;

            if (savedSetCount !== currentSetCount) {
                console.log(`Adjusting set count for exercise ${exerciseId} from ${currentSetCount} to ${savedSetCount}`);

                const setsContainer = item.querySelector('.sets-container');
                if (!setsContainer) {
                    console.error('Sets container not found');
                    return;
                }

                if (savedSetCount > currentSetCount) {

                    for (let i = currentSetCount; i < savedSetCount; i++) {

                        const newRow = document.createElement('div');
                        newRow.className = 'set-row';
                        newRow.dataset.setIndex = i;

                        const setNumber = document.createElement('span');
                        setNumber.className = 'set-number';
                        setNumber.textContent = i + 1;
                        newRow.appendChild(setNumber);

                        const currentUnit = exercises[workoutIndex].weight_unit || 'lbs';

                        const prevLog = document.createElement('span');
                        prevLog.className = 'previous-log';
                        prevLog.innerHTML = '<strong>Prev:</strong> - lbs x -';
                        newRow.appendChild(prevLog);

                        const goalTarget = document.createElement('span');
                        goalTarget.className = 'goal-target';
                        goalTarget.title = 'Goal for next workout';
                        goalTarget.innerHTML = '<strong>Goal:</strong> ';
                        newRow.appendChild(goalTarget);

                        const weightInput = document.createElement('input');
                        weightInput.type = (currentUnit === 'assisted') ? 'hidden' : 'number';
                        weightInput.className = 'weight-input';
                        weightInput.placeholder = (currentUnit === 'bodyweight') ? 'BW' : (currentUnit === 'assisted') ? '' : 'Wt';
                        weightInput.step = 'any';
                        weightInput.inputMode = 'decimal';
                        newRow.appendChild(weightInput);

                        const repsInput = document.createElement('input');
                        repsInput.type = 'text';
                        repsInput.className = 'reps-input';
                        repsInput.placeholder = 'Reps';
                        repsInput.inputMode = 'numeric';
                        repsInput.pattern = '[0-9]*';
                        newRow.appendChild(repsInput);

                        const completeToggle = document.createElement('button');
                        completeToggle.className = 'set-complete-toggle';
                        completeToggle.dataset.workoutIndex = workoutIndex;
                        completeToggle.dataset.setIndex = i;
                        completeToggle.title = 'Mark Set Complete';

                        completeToggle.addEventListener('click', function(event) {
                            console.log("[DEBUG] Set complete toggle clicked directly from workout-persistence");
                            if (typeof window.handleSetToggle === 'function') {
                                window.handleSetToggle(event);
                            }
                        });
                        newRow.appendChild(completeToggle);

                        setsContainer.appendChild(newRow);
                    }
                }

                else if (savedSetCount < currentSetCount) {

                    const setRows = setsContainer.querySelectorAll('.set-row');
                    for (let i = savedSetCount; i < currentSetCount; i++) {
                        if (setRows[i]) {
                            setRows[i].remove();
                        }
                    }
                }
            }

            const setRows = item.querySelectorAll('.set-row');
            setRows.forEach((row, setIndex) => {
                if (!savedExercise.sets[setIndex]) {
                    return;
                }

                const savedSet = savedExercise.sets[setIndex];
                const weightInput = row.querySelector('.weight-input');
                const repsInput = row.querySelector('.reps-input');
                const completeToggle = row.querySelector('.set-complete-toggle');

                if (weightInput && savedSet.weight !== undefined) {
                    weightInput.value = savedSet.weight;
                }

                if (repsInput && savedSet.reps !== undefined) {
                    repsInput.value = savedSet.reps;
                }

                if (completeToggle && savedSet.completed) {
                    completeToggle.classList.add('completed');
                    completeToggle.innerHTML = '&#10003;'; // Add checkmark

                    if (weightInput) {
                        weightInput.disabled = true;
                        weightInput.classList.add('completed');
                    }
                    if (repsInput) {
                        repsInput.disabled = true;
                        repsInput.classList.add('completed');
                    }
                }
            });

            if (savedExercise.notes) {
                const notesTextarea = item.querySelector('.exercise-notes-textarea');
                if (notesTextarea) {
                    notesTextarea.value = savedExercise.notes;
                }
            }

            if (savedExercise.weight_unit) {
                const unitSelect = item.querySelector('.exercise-unit-select');
                if (unitSelect) {
                    unitSelect.value = savedExercise.weight_unit;

                    exercises[workoutIndex].weight_unit = savedExercise.weight_unit;
                }
            }
        });

        setTimeout(() => {
            window.isRestoringWorkoutData = false;
            console.log('Workout data restoration complete');
        }, 500);

        return true;
    } catch (error) {
        console.error('Error restoring workout data:', error);
        window.isRestoringWorkoutData = false;
        return false;
    }
}

function updateCurrentWorkoutFromUI(currentWorkout) {

    const exerciseItems = document.querySelectorAll('.exercise-item');
    if (!exerciseItems.length) return;

    const exercises = Array.isArray(currentWorkout) ? currentWorkout : currentWorkout.exercises;
    if (!exercises) return;

    exerciseItems.forEach(item => {
        const workoutIndex = parseInt(item.dataset.workoutIndex, 10);
        if (isNaN(workoutIndex) || !exercises[workoutIndex]) return;

        const unitSelect = item.querySelector('.exercise-unit-select');
        if (unitSelect) {

            exercises[workoutIndex].weight_unit = unitSelect.value;

            if (exercises[workoutIndex].sets_completed && Array.isArray(exercises[workoutIndex].sets_completed)) {
                exercises[workoutIndex].sets_completed.forEach(set => {
                    if (set) set.unit = unitSelect.value;
                });
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {

    setTimeout(initWorkoutPersistence, 1000);
});
