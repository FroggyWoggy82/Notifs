/**
 * Exercise Name Update Fix
 * This script ensures that when an exercise name is edited, it's updated in all templates
 */

(function() {

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initExerciseNameUpdateFix);
    } else {
        initExerciseNameUpdateFix();
    }

    function initExerciseNameUpdateFix() {

        const originalHandleSaveExerciseName = window.handleSaveExerciseName;

        window.handleSaveExerciseName = async function(event) {
            event.preventDefault();

            const editExerciseNameInput = document.getElementById('edit-exercise-name');
            const saveAsNewExerciseCheckbox = document.getElementById('save-as-new-exercise');

            if (!editExerciseNameInput) return;

            const currentEditingExerciseIndex = window.currentEditingExerciseIndex;
            if (currentEditingExerciseIndex < 0) return;

            const newName = editExerciseNameInput.value.trim();
            if (!newName) {
                alert('Please enter a valid exercise name');
                return;
            }

            let currentWorkout, exercise, exerciseId;

            const isTemplateEditor = document.getElementById('template-editor-page').classList.contains('active');
            
            if (isTemplateEditor) {

                exercise = window.currentTemplateExercises[currentEditingExerciseIndex];
            } else {

                exercise = window.currentWorkout.exercises[currentEditingExerciseIndex];
            }
            
            if (!exercise) return;

            exerciseId = exercise.exercise_id;
            const originalName = exercise.name;

            exercise.name = newName;

            if (saveAsNewExerciseCheckbox && saveAsNewExerciseCheckbox.checked) {

                if (typeof originalHandleSaveExerciseName === 'function') {
                    return originalHandleSaveExerciseName.call(this, event);
                }
                return;
            }

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

                    if (templatesUpdated && typeof window.renderWorkoutTemplates === 'function') {
                        window.renderWorkoutTemplates();
                    }
                }

                if (window.availableExercises && Array.isArray(window.availableExercises)) {
                    const exerciseToUpdate = window.availableExercises.find(ex => ex.exercise_id === exerciseId);
                    if (exerciseToUpdate) {
                        exerciseToUpdate.name = newName;
                    }
                }

                console.log(`Updated exercise name from "${originalName}" to "${newName}" for ID ${exerciseId}`);

                if (isTemplateEditor) {
                    if (typeof window.renderTemplateExerciseList === 'function') {
                        window.renderTemplateExerciseList();
                    }
                } else {
                    if (typeof window.renderCurrentWorkout === 'function') {
                        window.renderCurrentWorkout();
                    }
                }

                const exerciseEditModal = document.getElementById('exercise-edit-modal');
                if (exerciseEditModal) {
                    exerciseEditModal.style.display = 'none';
                }

                window.currentEditingExerciseIndex = -1;
                window.currentEditingExerciseId = null;

            } catch (error) {
                console.error('Error updating exercise name:', error);
                alert(`Failed to update exercise name: ${error.message}`);

                exercise.name = originalName;
            }
        };
    }
})();
