/**
 * Exercise Name Update Fix
 * This script ensures that when an exercise name is edited, it's updated in all templates
 */

(function() {
    // Wait for the DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initExerciseNameUpdateFix);
    } else {
        initExerciseNameUpdateFix();
    }

    function initExerciseNameUpdateFix() {
        // Store the original handleSaveExerciseName function
        const originalHandleSaveExerciseName = window.handleSaveExerciseName;

        // Override the handleSaveExerciseName function
        window.handleSaveExerciseName = async function(event) {
            event.preventDefault();

            // Get the necessary elements
            const editExerciseNameInput = document.getElementById('edit-exercise-name');
            const saveAsNewExerciseCheckbox = document.getElementById('save-as-new-exercise');

            if (!editExerciseNameInput) return;

            // Get the current editing exercise index and data
            const currentEditingExerciseIndex = window.currentEditingExerciseIndex;
            if (currentEditingExerciseIndex < 0) return;

            // Get the new name from the input
            const newName = editExerciseNameInput.value.trim();
            if (!newName) {
                alert('Please enter a valid exercise name');
                return;
            }

            // Get the current workout and exercise
            let currentWorkout, exercise, exerciseId;
            
            // Check if we're in the template editor
            const isTemplateEditor = document.getElementById('template-editor-page').classList.contains('active');
            
            if (isTemplateEditor) {
                // We're editing a template
                exercise = window.currentTemplateExercises[currentEditingExerciseIndex];
            } else {
                // We're in an active workout
                exercise = window.currentWorkout.exercises[currentEditingExerciseIndex];
            }
            
            if (!exercise) return;
            
            // Store the original exercise ID
            exerciseId = exercise.exercise_id;
            const originalName = exercise.name;

            // Update the exercise name in the current workout/template
            exercise.name = newName;

            // If the user wants to save this as a new exercise, let the original function handle it
            if (saveAsNewExerciseCheckbox && saveAsNewExerciseCheckbox.checked) {
                // Call the original function to handle saving as a new exercise
                if (typeof originalHandleSaveExerciseName === 'function') {
                    return originalHandleSaveExerciseName.call(this, event);
                }
                return;
            }

            // Update the exercise name in the database
            try {
                const response = await fetch(`/api/workouts/exercises/${exerciseId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name: newName })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Update the exercise name in all templates
                if (window.workoutTemplates && Array.isArray(window.workoutTemplates)) {
                    let templatesUpdated = false;
                    
                    window.workoutTemplates.forEach(template => {
                        if (template.exercises && Array.isArray(template.exercises)) {
                            template.exercises.forEach(ex => {
                                if (ex.exercise_id === exerciseId) {
                                    ex.name = newName;
                                    templatesUpdated = true;
                                }
                            });
                        }
                    });
                    
                    // Re-render the templates if any were updated
                    if (templatesUpdated && typeof window.renderWorkoutTemplates === 'function') {
                        window.renderWorkoutTemplates();
                    }
                }

                // Update the exercise name in the available exercises list
                if (window.availableExercises && Array.isArray(window.availableExercises)) {
                    const exerciseToUpdate = window.availableExercises.find(ex => ex.exercise_id === exerciseId);
                    if (exerciseToUpdate) {
                        exerciseToUpdate.name = newName;
                    }
                }

                console.log(`Updated exercise name from "${originalName}" to "${newName}" for ID ${exerciseId}`);

                // Re-render the current workout or template
                if (isTemplateEditor) {
                    if (typeof window.renderTemplateExerciseList === 'function') {
                        window.renderTemplateExerciseList();
                    }
                } else {
                    if (typeof window.renderCurrentWorkout === 'function') {
                        window.renderCurrentWorkout();
                    }
                }

                // Close the modal
                const exerciseEditModal = document.getElementById('exercise-edit-modal');
                if (exerciseEditModal) {
                    exerciseEditModal.style.display = 'none';
                }

                // Reset state variables
                window.currentEditingExerciseIndex = -1;
                window.currentEditingExerciseId = null;

            } catch (error) {
                console.error('Error updating exercise name:', error);
                alert(`Failed to update exercise name: ${error.message}`);
                
                // Revert to the original name
                exercise.name = originalName;
            }
        };
    }
})();
