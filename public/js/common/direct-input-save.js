/**
 * Direct Input Save
 * This file contains functions to directly save and restore input values
 * without relying on the main saveInputValues function.
 */

// Storage key for input values
const INPUT_VALUES_KEY = 'workout_tracker_input_values';

/**
 * Save input values directly to localStorage
 * @param {HTMLElement} inputElement - The input element that changed
 */
function saveInputValueDirectly(inputElement) {
    if (!inputElement) return;
    
    try {
        // Get the exercise item and workout index
        const exerciseItem = inputElement.closest('.exercise-item');
        if (!exerciseItem) return;
        
        const workoutIndex = parseInt(exerciseItem.dataset.workoutIndex, 10);
        if (isNaN(workoutIndex)) return;
        
        // Get the current workout data
        const currentWorkoutJson = localStorage.getItem('workout_tracker_current_workout');
        if (!currentWorkoutJson) return;
        
        const currentWorkout = JSON.parse(currentWorkoutJson);
        const exercises = Array.isArray(currentWorkout) ? currentWorkout : currentWorkout.exercises;
        
        if (!exercises || !exercises[workoutIndex]) return;
        
        const exerciseData = exercises[workoutIndex];
        const exerciseId = exerciseData.exercise_id;
        
        // Get the current saved input values
        let savedInputValues = {};
        const savedInputValuesJson = localStorage.getItem(INPUT_VALUES_KEY);
        if (savedInputValuesJson) {
            savedInputValues = JSON.parse(savedInputValuesJson);
        }
        
        // Initialize the exercise data if it doesn't exist
        if (!savedInputValues[exerciseId]) {
            savedInputValues[exerciseId] = {
                sets: [],
                name: exerciseData.name,
                workoutIndex: workoutIndex
            };
        }
        
        // Handle different input types
        if (inputElement.classList.contains('weight-input') || inputElement.classList.contains('reps-input')) {
            // Get the set index
            const setRow = inputElement.closest('.set-row');
            if (!setRow) return;
            
            const setIndex = parseInt(setRow.dataset.setIndex, 10);
            if (isNaN(setIndex)) return;
            
            // Initialize the set data if it doesn't exist
            if (!savedInputValues[exerciseId].sets[setIndex]) {
                savedInputValues[exerciseId].sets[setIndex] = {
                    weight: '',
                    reps: '',
                    completed: false
                };
            }
            
            // Update the weight or reps value
            if (inputElement.classList.contains('weight-input')) {
                savedInputValues[exerciseId].sets[setIndex].weight = inputElement.value;
                console.log(`[Direct Save] Updated weight for exercise ${exerciseId}, set ${setIndex}: ${inputElement.value}`);
            } else if (inputElement.classList.contains('reps-input')) {
                savedInputValues[exerciseId].sets[setIndex].reps = inputElement.value;
                console.log(`[Direct Save] Updated reps for exercise ${exerciseId}, set ${setIndex}: ${inputElement.value}`);
            }
            
            // Also check if the set is completed
            const completeToggle = setRow.querySelector('.set-complete-toggle');
            if (completeToggle) {
                savedInputValues[exerciseId].sets[setIndex].completed = completeToggle.classList.contains('completed');
            }
        } else if (inputElement.classList.contains('exercise-notes-textarea')) {
            // Update the notes value
            savedInputValues[exerciseId].notes = inputElement.value;
            console.log(`[Direct Save] Updated notes for exercise ${exerciseId}`);
        }
        
        // Save to localStorage
        localStorage.setItem(INPUT_VALUES_KEY, JSON.stringify(savedInputValues));
        console.log('[Direct Save] Saved input values directly:', savedInputValues);
        
        return true;
    } catch (error) {
        console.error('[Direct Save] Error saving input value directly:', error);
        return false;
    }
}

/**
 * Save set completion state directly to localStorage
 * @param {HTMLElement} toggleButton - The toggle button element
 */
function saveSetCompletionDirectly(toggleButton) {
    if (!toggleButton) return;
    
    try {
        // Get the exercise item and workout index
        const exerciseItem = toggleButton.closest('.exercise-item');
        if (!exerciseItem) return;
        
        const workoutIndex = parseInt(exerciseItem.dataset.workoutIndex, 10);
        if (isNaN(workoutIndex)) return;
        
        // Get the current workout data
        const currentWorkoutJson = localStorage.getItem('workout_tracker_current_workout');
        if (!currentWorkoutJson) return;
        
        const currentWorkout = JSON.parse(currentWorkoutJson);
        const exercises = Array.isArray(currentWorkout) ? currentWorkout : currentWorkout.exercises;
        
        if (!exercises || !exercises[workoutIndex]) return;
        
        const exerciseData = exercises[workoutIndex];
        const exerciseId = exerciseData.exercise_id;
        
        // Get the set index
        const setRow = toggleButton.closest('.set-row');
        if (!setRow) return;
        
        const setIndex = parseInt(setRow.dataset.setIndex, 10);
        if (isNaN(setIndex)) return;
        
        // Get the current saved input values
        let savedInputValues = {};
        const savedInputValuesJson = localStorage.getItem(INPUT_VALUES_KEY);
        if (savedInputValuesJson) {
            savedInputValues = JSON.parse(savedInputValuesJson);
        }
        
        // Initialize the exercise data if it doesn't exist
        if (!savedInputValues[exerciseId]) {
            savedInputValues[exerciseId] = {
                sets: [],
                name: exerciseData.name,
                workoutIndex: workoutIndex
            };
        }
        
        // Initialize the set data if it doesn't exist
        if (!savedInputValues[exerciseId].sets[setIndex]) {
            savedInputValues[exerciseId].sets[setIndex] = {
                weight: '',
                reps: '',
                completed: false
            };
        }
        
        // Update the completed state
        const isCompleted = toggleButton.classList.contains('completed');
        savedInputValues[exerciseId].sets[setIndex].completed = isCompleted;
        console.log(`[Direct Save] Updated completion state for exercise ${exerciseId}, set ${setIndex}: ${isCompleted}`);
        
        // Get the weight and reps values
        const weightInput = setRow.querySelector('.weight-input');
        const repsInput = setRow.querySelector('.reps-input');
        
        if (weightInput) {
            savedInputValues[exerciseId].sets[setIndex].weight = weightInput.value;
        }
        
        if (repsInput) {
            savedInputValues[exerciseId].sets[setIndex].reps = repsInput.value;
        }
        
        // Save to localStorage
        localStorage.setItem(INPUT_VALUES_KEY, JSON.stringify(savedInputValues));
        console.log('[Direct Save] Saved set completion directly:', savedInputValues);
        
        return true;
    } catch (error) {
        console.error('[Direct Save] Error saving set completion directly:', error);
        return false;
    }
}

/**
 * Restore input values from localStorage
 * This function is called when the page is loaded
 */
function restoreInputValuesDirectly() {
    try {
        const savedInputValuesJson = localStorage.getItem(INPUT_VALUES_KEY);
        if (!savedInputValuesJson) {
            console.log('[Direct Restore] No saved input values found');
            return false;
        }
        
        console.log('[Direct Restore] Restoring input values from localStorage');
        const inputValues = JSON.parse(savedInputValuesJson);
        console.log('[Direct Restore] Parsed saved input values:', inputValues);
        
        // Get the current workout data
        const currentWorkoutJson = localStorage.getItem('workout_tracker_current_workout');
        if (!currentWorkoutJson) {
            console.log('[Direct Restore] No current workout found');
            return false;
        }
        
        const currentWorkout = JSON.parse(currentWorkoutJson);
        const exercises = Array.isArray(currentWorkout) ? currentWorkout : currentWorkout.exercises;
        
        if (!exercises || !exercises.length) {
            console.log('[Direct Restore] No exercises found in current workout');
            return false;
        }
        
        // Get all exercise items
        const exerciseItems = document.querySelectorAll('.exercise-item');
        if (!exerciseItems.length) {
            console.log('[Direct Restore] No exercise items found in DOM');
            return false;
        }
        
        console.log(`[Direct Restore] Found ${exerciseItems.length} exercise items in DOM`);
        
        // Restore values for each exercise
        exerciseItems.forEach(item => {
            const workoutIndex = parseInt(item.dataset.workoutIndex, 10);
            if (isNaN(workoutIndex)) {
                console.log('[Direct Restore] Invalid workout index:', item.dataset.workoutIndex);
                return;
            }
            
            if (!exercises[workoutIndex]) {
                console.log('[Direct Restore] Exercise not found at index:', workoutIndex);
                return;
            }
            
            const exerciseData = exercises[workoutIndex];
            const exerciseId = exerciseData.exercise_id;
            
            console.log(`[Direct Restore] Checking for saved data for exercise ID ${exerciseId} (${exerciseData.name})`);
            
            if (!inputValues[exerciseId]) {
                console.log(`[Direct Restore] No saved data found for exercise ID ${exerciseId}`);
                return;
            }
            
            // Restore set values
            const setRows = item.querySelectorAll('.set-row');
            console.log(`[Direct Restore] Found ${setRows.length} set rows for exercise ${exerciseId}`);
            
            setRows.forEach((row, setIndex) => {
                if (!inputValues[exerciseId].sets[setIndex]) {
                    console.log(`[Direct Restore] No saved data for set ${setIndex + 1}`);
                    return;
                }
                
                const savedSet = inputValues[exerciseId].sets[setIndex];
                const weightInput = row.querySelector('.weight-input');
                const repsInput = row.querySelector('.reps-input');
                const completeToggle = row.querySelector('.set-complete-toggle');
                
                if (weightInput && savedSet.weight !== undefined) {
                    weightInput.value = savedSet.weight;
                    console.log(`[Direct Restore] Restored weight for set ${setIndex + 1}: ${savedSet.weight}`);
                }
                
                if (repsInput && savedSet.reps !== undefined) {
                    repsInput.value = savedSet.reps;
                    console.log(`[Direct Restore] Restored reps for set ${setIndex + 1}: ${savedSet.reps}`);
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
                    
                    console.log(`[Direct Restore] Restored completed state for set ${setIndex + 1}`);
                }
                
                // Log the actual values that were restored
                console.log(`[Direct Restore] Set ${setIndex + 1} restored values: weight=${weightInput?.value || ''}, reps=${repsInput?.value || ''}, completed=${completeToggle?.classList.contains('completed') || false}`);
            });
            
            // Restore notes if they exist
            if (inputValues[exerciseId].notes) {
                const notesTextarea = item.querySelector('.exercise-notes-textarea');
                if (notesTextarea) {
                    notesTextarea.value = inputValues[exerciseId].notes;
                    console.log(`[Direct Restore] Restored notes for exercise ${exerciseId}`);
                }
            }
        });
        
        console.log('[Direct Restore] Input values restored successfully');
        return true;
    } catch (error) {
        console.error('[Direct Restore] Error restoring input values:', error);
        return false;
    }
}
