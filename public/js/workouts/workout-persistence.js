/**
 * Workout Persistence
 * This file contains functions to directly save and restore workout data
 * without relying on the main saveInputValues function.
 */

// Storage key for workout data
const WORKOUT_DATA_KEY = 'workout_tracker_data';

// Initialize the workout persistence module
function initWorkoutPersistence() {
    // Add event listeners to save data when inputs change
    addInputChangeListeners();

    // Add event listeners to save data when navigating away
    addNavigationListeners();

    // Restore data when the page loads
    setTimeout(restoreWorkoutData, 500);

    // Add a MutationObserver to detect when exercise items are added to the DOM
    setupMutationObserver();

    // Export functions to window
    window.saveWorkoutData = saveWorkoutData;
    window.restoreWorkoutData = restoreWorkoutData;
    window.clearWorkoutData = clearWorkoutData;
    window.updateCurrentWorkoutFromUI = updateCurrentWorkoutFromUI;
}

// Add event listeners to save data when inputs change
function addInputChangeListeners() {
    // Get the exercise list element
    const exerciseListEl = document.getElementById('current-exercise-list');
    if (!exerciseListEl) {
        console.error('Exercise list element not found');
        return;
    }

    // Add a delegated event listener for input changes
    exerciseListEl.addEventListener('input', (event) => {
        const target = event.target;
        if (target instanceof HTMLElement) {
            if (target.classList.contains('weight-input') ||
                target.classList.contains('reps-input') ||
                target.classList.contains('exercise-notes-textarea')) {

                // Save workout data when input changes
                saveWorkoutData();
            }
        }
    });

    // Add a delegated event listener for set completion
    exerciseListEl.addEventListener('click', (event) => {
        const target = event.target;
        if (target instanceof HTMLElement && target.classList.contains('set-complete-toggle')) {
            // Wait a moment for the toggle to complete
            setTimeout(saveWorkoutData, 50);
        }
    });

    // Add a delegated event listener for weight unit changes
    exerciseListEl.addEventListener('change', (event) => {
        const target = event.target;
        if (target instanceof HTMLElement && target.classList.contains('exercise-unit-select')) {
            // Save workout data when unit changes
            saveWorkoutData();
        }
    });
}

// Add event listeners to save data when navigating away
function addNavigationListeners() {
    // Save data when navigating away from the page
    window.addEventListener('beforeunload', () => {
        saveWorkoutData();
    });

    // Save data when clicking on navigation links
    document.querySelectorAll('.sidebar-nav-item, .nav-item').forEach(link => {
        link.addEventListener('click', () => {
            saveWorkoutData();
        });
    });

    // Save data when the page visibility changes (app is swiped away)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            console.log('Page visibility changed to hidden, saving workout data');
            saveWorkoutData();
        }
    });

    // Save data periodically while the page is visible
    setInterval(() => {
        if (document.visibilityState === 'visible' && !window.isRestoringWorkoutData) {
            console.log('Periodic save of workout data');
            saveWorkoutData();
        }
    }, 30000); // Save every 30 seconds
}

// Set up a MutationObserver to detect when exercise items are added to the DOM
function setupMutationObserver() {
    const exerciseListEl = document.getElementById('current-exercise-list');
    if (!exerciseListEl) {
        console.error('Exercise list element not found');
        return;
    }

    // Use a flag to prevent multiple calls in quick succession
    let isRestoring = false;
    let restoreTimeout = null;

    const observer = new MutationObserver((mutations) => {
        let shouldRestore = false;

        // Only process if we're not already restoring
        if (!isRestoring) {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const node = mutation.addedNodes[i];
                        if (node.nodeType === 1 && node.classList.contains('exercise-item')) {
                            shouldRestore = true;
                            break;
                        }
                    }
                }
            });

            if (shouldRestore) {
                // Set the flag to prevent multiple calls
                isRestoring = true;

                // Clear any existing timeout
                if (restoreTimeout) {
                    clearTimeout(restoreTimeout);
                }

                // Set a new timeout
                restoreTimeout = setTimeout(() => {
                    restoreWorkoutData();

                    // Reset the flag after a delay to allow for any subsequent mutations
                    setTimeout(() => {
                        isRestoring = false;
                    }, 1000);
                }, 500);
            }
        }
    });

    observer.observe(exerciseListEl, { childList: true });
}

// Save workout data to localStorage
function saveWorkoutData() {
    try {
        // Get the current workout from localStorage
        const currentWorkoutJson = localStorage.getItem('workout_tracker_current_workout');
        if (!currentWorkoutJson) {
            console.error('No current workout found in localStorage');
            return false;
        }

        const currentWorkout = JSON.parse(currentWorkoutJson);

        // Get all exercise items
        const exerciseItems = document.querySelectorAll('.exercise-item');
        if (!exerciseItems.length) {
            console.error('No exercise items found in DOM');
            return false;
        }

        // Update the currentWorkout object with weight units from UI
        updateCurrentWorkoutFromUI(currentWorkout);

        // Save the updated currentWorkout back to localStorage
        localStorage.setItem('workout_tracker_current_workout', JSON.stringify(currentWorkout));

        // Initialize workout data object
        const workoutData = {
            exercises: [],
            timestamp: Date.now()
        };

        // Process each exercise item
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

            // Initialize exercise data
            const exerciseInfo = {
                exercise_id: exerciseData.exercise_id,
                name: exerciseData.name,
                sets: [],
                notes: '',
                weight_unit: exerciseData.weight_unit || 'lbs', // Save the weight unit
                set_count: setRows.length // Save the current number of sets
            };

            // Get all set rows
            const setRows = item.querySelectorAll('.set-row');
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

            // Get notes
            const notesTextarea = item.querySelector('.exercise-notes-textarea');
            if (notesTextarea) {
                exerciseInfo.notes = notesTextarea.value;
            }

            // Get weight unit from the dropdown
            const unitSelect = item.querySelector('.exercise-unit-select');
            if (unitSelect) {
                exerciseInfo.weight_unit = unitSelect.value;
            }

            // Add exercise to workout data
            workoutData.exercises.push(exerciseInfo);
        });

        // Save to localStorage
        localStorage.setItem(WORKOUT_DATA_KEY, JSON.stringify(workoutData));
        return true;
    } catch (error) {
        console.error('Error saving workout data:', error);
        return false;
    }
}

// Restore workout data from localStorage
function restoreWorkoutData() {
    try {
        // Get saved workout data
        const workoutDataJson = localStorage.getItem(WORKOUT_DATA_KEY);
        if (!workoutDataJson) {
            console.log('No saved workout data found');
            return false;
        }

        console.log('Restoring workout data from localStorage');
        // Set a flag to indicate we're restoring data
        window.isRestoringWorkoutData = true;

        const workoutData = JSON.parse(workoutDataJson);

        // Get the current workout from localStorage
        const currentWorkoutJson = localStorage.getItem('workout_tracker_current_workout');
        if (!currentWorkoutJson) {
            console.error('No current workout found in localStorage');
            return false;
        }

        const currentWorkout = JSON.parse(currentWorkoutJson);

        // Get all exercise items
        const exerciseItems = document.querySelectorAll('.exercise-item');
        if (!exerciseItems.length) {
            console.error('No exercise items found in DOM');
            return false;
        }

        // Process each exercise item
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

            // Find saved data for this exercise
            const savedExercise = workoutData.exercises.find(e => e.exercise_id === exerciseId);
            if (!savedExercise) {
                return;
            }

            // Check if we need to adjust the number of sets
            const currentSetCount = item.querySelectorAll('.set-row').length;
            const savedSetCount = savedExercise.set_count || savedExercise.sets.length;

            // If the saved set count is different from the current set count, we need to adjust
            if (savedSetCount !== currentSetCount) {
                console.log(`Adjusting set count for exercise ${exerciseId} from ${currentSetCount} to ${savedSetCount}`);

                // Get the sets container
                const setsContainer = item.querySelector('.sets-container');
                if (!setsContainer) {
                    console.error('Sets container not found');
                    return;
                }

                // If we need to add sets
                if (savedSetCount > currentSetCount) {
                    // Generate HTML for the new set rows
                    for (let i = currentSetCount; i < savedSetCount; i++) {
                        // Create a new set row
                        const newRow = document.createElement('div');
                        newRow.className = 'set-row';
                        newRow.dataset.setIndex = i;

                        // Create set number span
                        const setNumber = document.createElement('span');
                        setNumber.className = 'set-number';
                        setNumber.textContent = i + 1;
                        newRow.appendChild(setNumber);

                        // Create previous log span
                        const prevLog = document.createElement('span');
                        prevLog.className = 'previous-log';
                        prevLog.textContent = '- lbs x -';
                        newRow.appendChild(prevLog);



                        // Get the current unit from the exercise, default to lbs
                        const currentUnit = exercises[workoutIndex].weight_unit || 'lbs';

                        // Create weight input (always visible for bodyweight to record user's weight)
                        const weightInput = document.createElement('input');
                        weightInput.type = (currentUnit === 'assisted') ? 'hidden' : 'number';
                        weightInput.className = 'weight-input';
                        weightInput.placeholder = (currentUnit === 'bodyweight') ? 'BW' : (currentUnit === 'assisted') ? '' : 'Wt';
                        weightInput.step = 'any';
                        weightInput.inputMode = 'decimal';
                        newRow.appendChild(weightInput);

                        // Create reps input
                        const repsInput = document.createElement('input');
                        repsInput.type = 'text';
                        repsInput.className = 'reps-input';
                        repsInput.placeholder = 'Reps';
                        repsInput.inputMode = 'numeric';
                        repsInput.pattern = '[0-9]*';
                        newRow.appendChild(repsInput);

                        // Create goal target span
                        const goalTarget = document.createElement('span');
                        goalTarget.className = 'goal-target';
                        goalTarget.title = 'Goal for next workout';
                        goalTarget.textContent = '';
                        newRow.appendChild(goalTarget);



                        // Create complete toggle button
                        const completeToggle = document.createElement('button');
                        completeToggle.className = 'set-complete-toggle';
                        completeToggle.dataset.workoutIndex = workoutIndex;
                        completeToggle.dataset.setIndex = i;
                        completeToggle.title = 'Mark Set Complete';
                        newRow.appendChild(completeToggle);

                        // Add the new row to the sets container
                        setsContainer.appendChild(newRow);
                    }
                }
                // If we need to remove sets
                else if (savedSetCount < currentSetCount) {
                    // Remove the extra set rows
                    const setRows = setsContainer.querySelectorAll('.set-row');
                    for (let i = savedSetCount; i < currentSetCount; i++) {
                        if (setRows[i]) {
                            setRows[i].remove();
                        }
                    }
                }
            }

            // Restore set values
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

                    // Also disable inputs if completed
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

            // Restore notes
            if (savedExercise.notes) {
                const notesTextarea = item.querySelector('.exercise-notes-textarea');
                if (notesTextarea) {
                    notesTextarea.value = savedExercise.notes;
                }
            }

            // Restore weight unit
            if (savedExercise.weight_unit) {
                const unitSelect = item.querySelector('.exercise-unit-select');
                if (unitSelect) {
                    unitSelect.value = savedExercise.weight_unit;

                    // Also update the weight_unit in the currentWorkout data
                    exercises[workoutIndex].weight_unit = savedExercise.weight_unit;
                }
            }
        });

        // Reset the flag after restoration is complete
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

// Update the currentWorkout object with weight units from UI
function updateCurrentWorkoutFromUI(currentWorkout) {
    // Get all exercise items
    const exerciseItems = document.querySelectorAll('.exercise-item');
    if (!exerciseItems.length) return;

    // Determine if currentWorkout is an array or an object with exercises property
    const exercises = Array.isArray(currentWorkout) ? currentWorkout : currentWorkout.exercises;
    if (!exercises) return;

    // Update each exercise with its current weight unit from the UI
    exerciseItems.forEach(item => {
        const workoutIndex = parseInt(item.dataset.workoutIndex, 10);
        if (isNaN(workoutIndex) || !exercises[workoutIndex]) return;

        const unitSelect = item.querySelector('.exercise-unit-select');
        if (unitSelect) {
            // Update the weight_unit in the currentWorkout object
            exercises[workoutIndex].weight_unit = unitSelect.value;

            // Also update any sets_completed units
            if (exercises[workoutIndex].sets_completed && Array.isArray(exercises[workoutIndex].sets_completed)) {
                exercises[workoutIndex].sets_completed.forEach(set => {
                    if (set) set.unit = unitSelect.value;
                });
            }
        }
    });
}

// Initialize the module when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait a moment for the page to fully load
    setTimeout(initWorkoutPersistence, 1000);
});
