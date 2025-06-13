/**
 * Warmup Modal JavaScript
 * Handles the warmup set marking functionality
 */

class WarmupModal {
    constructor() {
        this.modal = null;
        this.currentExerciseId = null;
        this.currentSetIndex = null;
        this.currentExerciseName = null;
        this.warmupWeights = new Map(); // Cache for warmup weights
        this.init();
    }

    init() {
        this.createModal();
        this.bindEvents();
        console.log('[WARMUP] WarmupModal initialized');
    }

    createModal() {
        // Create modal HTML
        const modalHTML = `
            <div id="warmup-modal" class="warmup-modal">
                <div class="warmup-modal-content">
                    <div class="warmup-modal-header">
                        <h3 class="warmup-modal-title">Warmup Set</h3>
                        <button class="warmup-modal-close" type="button">&times;</button>
                    </div>
                    <div class="warmup-modal-body">
                        <div class="warmup-modal-info">
                            <div>Exercise: <span class="warmup-modal-exercise-name"></span></div>
                            <div>Set: <span class="warmup-modal-set-info"></span></div>
                        </div>
                    </div>
                    <div class="warmup-modal-actions">
                        <button class="warmup-modal-btn warmup-modal-btn-secondary" id="warmup-cancel-btn">Cancel</button>
                        <button class="warmup-modal-btn warmup-modal-btn-primary" id="warmup-mark-btn">Mark as Warmup</button>
                        <button class="warmup-modal-btn warmup-modal-btn-danger" id="warmup-unmark-btn" style="display: none;">Unmark Warmup</button>
                    </div>
                </div>
            </div>
        `;

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('warmup-modal');
    }

    bindEvents() {
        // Close modal events
        const closeBtn = this.modal.querySelector('.warmup-modal-close');
        const cancelBtn = this.modal.querySelector('#warmup-cancel-btn');
        
        closeBtn.addEventListener('click', () => this.hide());
        cancelBtn.addEventListener('click', () => this.hide());
        
        // Click outside modal to close
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });

        // Action buttons
        const markBtn = this.modal.querySelector('#warmup-mark-btn');
        const unmarkBtn = this.modal.querySelector('#warmup-unmark-btn');
        
        markBtn.addEventListener('click', () => this.markAsWarmup());
        unmarkBtn.addEventListener('click', () => this.unmarkWarmup());

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('show')) {
                this.hide();
            }
        });
    }

    show(exerciseId, setIndex, exerciseName, isCurrentlyWarmup = false) {
        this.currentExerciseId = exerciseId;
        this.currentSetIndex = setIndex;
        this.currentExerciseName = exerciseName;

        // Update modal content
        this.modal.querySelector('.warmup-modal-exercise-name').textContent = exerciseName;
        this.modal.querySelector('.warmup-modal-set-info').textContent = `Set ${setIndex + 1}`;

        // Show/hide appropriate buttons
        const markBtn = this.modal.querySelector('#warmup-mark-btn');
        const unmarkBtn = this.modal.querySelector('#warmup-unmark-btn');
        
        if (isCurrentlyWarmup) {
            markBtn.style.display = 'none';
            unmarkBtn.style.display = 'block';
        } else {
            markBtn.style.display = 'block';
            unmarkBtn.style.display = 'none';
        }

        // Show modal
        this.modal.classList.add('show');
        console.log(`[WARMUP] Showing modal for exercise ${exerciseId}, set ${setIndex + 1}`);
    }

    hide() {
        this.modal.classList.remove('show');
        this.currentExerciseId = null;
        this.currentSetIndex = null;
        this.currentExerciseName = null;
        console.log('[WARMUP] Modal hidden');
    }

    async markAsWarmup() {
        try {
            console.log(`[WARMUP] Marking set ${this.currentSetIndex + 1} as warmup for exercise ${this.currentExerciseId}`);
            
            // Get the current weight from the input field
            const setRow = this.getSetRow();
            const weightInput = setRow?.querySelector('.weight-input');
            const weightValue = weightInput?.value;
            const weightUnit = this.getWeightUnit();

            if (weightValue && !isNaN(parseFloat(weightValue))) {
                // Save warmup weight to database
                await this.saveWarmupWeight(this.currentExerciseId, parseFloat(weightValue), weightUnit);
            }

            // Update workout state first
            this.updateWorkoutState(true);

            // Then mark set as warmup in UI
            this.updateSetDisplay(true);
            
            this.hide();
            
        } catch (error) {
            console.error('[WARMUP] Error marking as warmup:', error);
            alert('Failed to mark as warmup set. Please try again.');
        }
    }

    async unmarkWarmup() {
        try {
            console.log(`[WARMUP] Unmarking set ${this.currentSetIndex + 1} as warmup for exercise ${this.currentExerciseId}`);
            
            // Update workout state first
            this.updateWorkoutState(false);

            // Then update set display
            this.updateSetDisplay(false);
            
            this.hide();
            
        } catch (error) {
            console.error('[WARMUP] Error unmarking warmup:', error);
            alert('Failed to unmark warmup set. Please try again.');
        }
    }

    getSetRow() {
        // Find the set row for the current exercise and set index
        const exerciseItems = document.querySelectorAll('.exercise-item');
        for (const item of exerciseItems) {
            const exerciseData = this.getExerciseDataFromElement(item);
            if (exerciseData && exerciseData.exercise_id == this.currentExerciseId) {
                const setRows = item.querySelectorAll('.set-row');
                return setRows[this.currentSetIndex];
            }
        }
        return null;
    }

    getExerciseDataFromElement(exerciseElement) {
        // Try to get exercise data from the element's data attributes or global state
        const exerciseIndex = Array.from(document.querySelectorAll('.exercise-item')).indexOf(exerciseElement);
        if (exerciseIndex >= 0 && window.currentWorkout) {
            // Handle both array format (old) and object format (new)
            const exercises = Array.isArray(window.currentWorkout) ? window.currentWorkout : (window.currentWorkout.exercises || []);
            if (exercises[exerciseIndex]) {
                return exercises[exerciseIndex];
            }
        }
        return null;
    }

    getExerciseData() {
        // Get exercise data for the current exercise
        const exerciseElement = document.querySelector(`[data-exercise-id="${this.currentExerciseId}"]`);
        if (exerciseElement) {
            return this.getExerciseDataFromElement(exerciseElement);
        }
        return null;
    }

    getWeightUnit() {
        // Get weight unit from exercise preferences or default to 'lbs'
        const setRow = this.getSetRow();
        if (setRow) {
            const weightInput = setRow.querySelector('.weight-input');
            // Try to get unit from data attribute or default to lbs
            return weightInput?.dataset.unit || 'lbs';
        }
        return 'lbs';
    }

    updateSetDisplay(isWarmup) {
        const setRow = this.getSetRow();
        if (setRow) {
            const setNumber = setRow.querySelector('.set-number');
            if (setNumber) {
                if (isWarmup) {
                    // Count warmup sets before this one
                    const exerciseData = this.getExerciseData();
                    const warmupSetsBefore = exerciseData.warmup_sets ?
                        exerciseData.warmup_sets.filter(index => index < this.currentSetIndex).length : 0;
                    setNumber.textContent = `W${warmupSetsBefore + 1}`;
                    setNumber.classList.add('warmup-set');
                } else {
                    // Count working sets before this one
                    const exerciseData = this.getExerciseData();
                    let workingSetsBefore = 0;
                    for (let j = 0; j < this.currentSetIndex; j++) {
                        if (!exerciseData.warmup_sets || !exerciseData.warmup_sets.includes(j)) {
                            workingSetsBefore++;
                        }
                    }
                    setNumber.textContent = workingSetsBefore + 1;
                    setNumber.classList.remove('warmup-set');
                }
            }
        }

        // Refresh all set displays to update numbering
        this.refreshAllSetDisplays();
    }

    refreshAllSetDisplays() {
        const exerciseData = this.getExerciseData();
        const exerciseElement = document.querySelector(`[data-exercise-id="${this.currentExerciseId}"]`);
        if (!exerciseElement) return;

        const setRows = exerciseElement.querySelectorAll('.set-row');
        setRows.forEach((setRow, index) => {
            const setNumber = setRow.querySelector('.set-number');
            if (!setNumber) return;

            const isWarmupSet = exerciseData && exerciseData.warmup_sets && exerciseData.warmup_sets.includes(index);

            if (isWarmupSet) {
                // Count warmup sets before this one
                const warmupSetsBefore = exerciseData.warmup_sets.filter(setIndex => setIndex < index).length;
                setNumber.textContent = `W${warmupSetsBefore + 1}`;
                setNumber.classList.add('warmup-set');
            } else {
                // Count working sets before this one
                let workingSetsBefore = 0;
                for (let j = 0; j < index; j++) {
                    if (!exerciseData || !exerciseData.warmup_sets || !exerciseData.warmup_sets.includes(j)) {
                        workingSetsBefore++;
                    }
                }
                setNumber.textContent = workingSetsBefore + 1;
                setNumber.classList.remove('warmup-set');
            }
        });
    }

    updateWorkoutState(isWarmup) {
        // Update the global workout state to track warmup sets
        if (window.currentWorkout) {
            // Handle both array format (old) and object format (new)
            const exercises = Array.isArray(window.currentWorkout) ? window.currentWorkout : (window.currentWorkout.exercises || []);

            const exerciseIndex = exercises.findIndex(ex => ex.exercise_id == this.currentExerciseId);
            if (exerciseIndex >= 0) {
                const exercise = exercises[exerciseIndex];

                // Initialize warmup_sets array if it doesn't exist
                if (!exercise.warmup_sets) {
                    exercise.warmup_sets = [];
                }

                if (isWarmup) {
                    // Add to warmup sets if not already there
                    if (!exercise.warmup_sets.includes(this.currentSetIndex)) {
                        exercise.warmup_sets.push(this.currentSetIndex);
                    }
                } else {
                    // Remove from warmup sets
                    exercise.warmup_sets = exercise.warmup_sets.filter(index => index !== this.currentSetIndex);
                }

                console.log(`[WARMUP] Updated workout state for exercise ${this.currentExerciseId}:`, exercise.warmup_sets);

                // Save the workout state to localStorage with a small delay to ensure data is updated
                setTimeout(() => {
                    if (typeof window.saveWorkoutData === 'function') {
                        console.log(`[WARMUP] Saving workout data with warmup_sets:`, exercise.warmup_sets);
                        window.saveWorkoutData();
                    } else {
                        console.log(`[WARMUP] saveWorkoutData function not available`);
                    }
                }, 100);
            }
        }
    }

    async saveWarmupWeight(exerciseId, weight, unit) {
        try {
            const response = await fetch('/api/warmup-weights', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    exercise_id: exerciseId,
                    warmup_weight: weight,
                    weight_unit: unit
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('[WARMUP] Warmup weight saved:', result);
            
            // Cache the warmup weight
            this.warmupWeights.set(exerciseId, { weight, unit });
            
            return result;
        } catch (error) {
            console.error('[WARMUP] Error saving warmup weight:', error);
            throw error;
        }
    }

    async loadWarmupWeight(exerciseId) {
        try {
            // Check cache first
            if (this.warmupWeights.has(exerciseId)) {
                return this.warmupWeights.get(exerciseId);
            }

            const response = await fetch(`/api/warmup-weights/${exerciseId}`);
            
            if (response.status === 404) {
                // No warmup weight found
                return null;
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            const warmupData = result.warmup_weight;
            
            // Cache the result
            this.warmupWeights.set(exerciseId, {
                weight: warmupData.warmup_weight,
                unit: warmupData.weight_unit
            });
            
            console.log(`[WARMUP] Loaded warmup weight for exercise ${exerciseId}:`, warmupData);
            return warmupData;
            
        } catch (error) {
            console.error(`[WARMUP] Error loading warmup weight for exercise ${exerciseId}:`, error);
            return null;
        }
    }
}

// Global function to refresh all warmup displays for all exercises
window.refreshAllWarmupDisplays = function() {
    if (!window.currentWorkout) return;

    const exercises = Array.isArray(window.currentWorkout) ? window.currentWorkout : (window.currentWorkout.exercises || []);

    exercises.forEach((exercise, exerciseIndex) => {
        if (!exercise.warmup_sets || exercise.warmup_sets.length === 0) return;

        const exerciseElement = document.querySelector(`[data-exercise-id="${exercise.exercise_id}"]`);
        if (!exerciseElement) return;

        const setRows = exerciseElement.querySelectorAll('.set-row');
        setRows.forEach((setRow, setIndex) => {
            const setNumber = setRow.querySelector('.set-number');
            if (!setNumber) return;

            const isWarmupSet = exercise.warmup_sets.includes(setIndex);

            if (isWarmupSet) {
                // Count warmup sets before this one
                const warmupSetsBefore = exercise.warmup_sets.filter(index => index < setIndex).length;
                setNumber.textContent = `W${warmupSetsBefore + 1}`;
                setNumber.classList.add('warmup-set');
            } else {
                // Count working sets before this one
                let workingSetsBefore = 0;
                for (let j = 0; j < setIndex; j++) {
                    if (!exercise.warmup_sets.includes(j)) {
                        workingSetsBefore++;
                    }
                }
                setNumber.textContent = workingSetsBefore + 1;
                setNumber.classList.remove('warmup-set');
            }
        });
    });
};

// Initialize warmup modal when DOM is loaded
let warmupModal;
document.addEventListener('DOMContentLoaded', function() {
    warmupModal = new WarmupModal();
    window.warmupModal = warmupModal; // Make it globally accessible
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WarmupModal;
}
