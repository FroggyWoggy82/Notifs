document.addEventListener('DOMContentLoaded', function() {
    console.log('Workout Tracker JS loaded');

    // --- State Variables ---
    let availableExercises = []; // Populated from API
    let workoutTemplates = [];   // Populated from API
    let currentWorkout = [];     // Array of exercise objects being performed { exercise_id, name, category, sets, reps, weight, weight_unit, order_position, notes, completedSets: [], lastLog: null }
    let workoutStartTime = null;
    let workoutTimerInterval = null;

    // --- DOM Element References ---
    const workoutLandingPage = document.getElementById('workout-landing-page');
    const activeWorkoutPage = document.getElementById('active-workout-page');
    const startEmptyWorkoutBtn = document.getElementById('start-empty-workout-btn');
    const templateListContainer = document.getElementById('workout-template-list');
    const templateSearchInput = document.getElementById('template-search');
    const createTemplateBtn = document.getElementById('create-template-btn');

    const currentWorkoutNameEl = document.getElementById('current-workout-name');
    const workoutTimerEl = document.getElementById('workout-timer');
    const currentExerciseListEl = document.getElementById('current-exercise-list');
    const cancelWorkoutBtn = document.getElementById('cancel-workout-btn');
    const completeWorkoutBtn = document.getElementById('complete-workout-btn');
    const addExerciseFab = document.getElementById('add-exercise-fab');

    const exerciseModal = document.getElementById('exercise-modal');
    const closeExerciseModalBtn = exerciseModal.querySelector('.close-button');
    const exerciseSearchInput = document.getElementById('exercise-search-input');
    const exerciseCategoryFilter = document.getElementById('exercise-category-filter');
    const availableExerciseListEl = document.getElementById('available-exercise-list');

    // --- New Exercise Definition Modal Elements ---
    const defineNewExerciseSection = document.getElementById('define-new-exercise-section');
    const toggleDefineExerciseBtn = document.getElementById('toggle-define-exercise-btn');
    const newExerciseNameInput = document.getElementById('new-exercise-name');
    const newExerciseCategorySelect = document.getElementById('new-exercise-category');
    const saveNewExerciseBtn = document.getElementById('save-new-exercise-btn');
    // --- End New Exercise Definition ---

    // --- Template Editor Elements ---
    const templateEditorPage = document.getElementById('template-editor-page');
    const templateEditorForm = document.getElementById('template-editor-form');
    const templateEditorTitle = document.getElementById('template-editor-title');
    const templateNameInput = document.getElementById('template-name');
    const templateDescriptionInput = document.getElementById('template-description');
    const templateExerciseListEl = document.getElementById('template-exercise-list');
    const templateAddExerciseBtn = document.getElementById('template-add-exercise-btn');
    const templateCancelBtn = document.getElementById('template-cancel-btn');
    const templateSaveBtn = document.getElementById('template-save-btn');
    let currentTemplateExercises = []; // Temporary array for exercises in the editor
    let editingTemplateId = null; // To track if we are editing an existing template
    // --- End Template Editor Elements ---

    // --- API Fetch Functions ---
    async function fetchExercises() {
        console.log('Fetching exercises...');
        try {
            const response = await fetch('/api/workouts/exercises');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            availableExercises = await response.json();
            console.log('Exercises fetched:', availableExercises.length);
            renderAvailableExercises(); // Render initially in modal list
        } catch (error) {
            console.error('Error fetching exercises:', error);
            availableExerciseListEl.innerHTML = '<p style="color: red;">Error loading exercises.</p>';
        }
    }

    async function fetchTemplates() {
        console.log('Fetching templates...');
        try {
            const response = await fetch('/api/workouts/templates');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            workoutTemplates = await response.json();
            console.log('Templates fetched:', workoutTemplates.length);
            renderWorkoutTemplates(); // Render initially on landing page
        } catch (error) {
            console.error('Error fetching templates:', error);
            templateListContainer.innerHTML = '<p style="color: red;">Error loading templates.</p>';
        }
    }

    // --- Rendering Functions ---\

    function renderWorkoutTemplates(filteredTemplates = workoutTemplates) {
        templateListContainer.innerHTML = ''; // Clear previous
        if (filteredTemplates.length === 0) {
            templateListContainer.innerHTML = '<p>No templates found.</p>';
            return;
        }

        filteredTemplates.forEach(template => {
            const card = document.createElement('div');
            card.className = 'workout-template-card';
            card.dataset.templateId = template.workout_id;

            // Generate summary of first few exercises
            let exerciseSummary = 'No exercises defined';
            if (template.exercises && template.exercises.length > 0) {
                exerciseSummary = template.exercises.map(ex => ex.name).slice(0, 3).join(', ');
                if (template.exercises.length > 3) exerciseSummary += ', ...';
            }

            card.innerHTML = `
                <div class="card-corner-actions">
                    <button class="btn-edit-template" data-template-id="${template.workout_id}" title="Edit Template">&#9998;</button>
                    <button class="btn-delete-template" data-template-id="${template.workout_id}" title="Delete Template">&times;</button>
                </div>
                <h3>${template.name}</h3>
                ${template.description ? `<p>${template.description}</p>` : ''}
                <div class="exercise-summary">${exerciseSummary}</div>
                <div class="template-actions">
                   <!-- Add Edit button later if needed -->
                   <button class="btn-start-template btn btn-primary btn-small">Start Workout</button>
                </div>
            `;
            templateListContainer.appendChild(card);

            // Add event listener for starting workout from this template card
            card.querySelector('.btn-start-template').addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card click if needed
                startWorkoutFromTemplate(template.workout_id);
            });
            // Delete button listener handled by delegation
        });
    }

    function renderAvailableExercises(searchTerm = '', category = 'all') {
        availableExerciseListEl.innerHTML = ''; // Clear previous
        searchTerm = searchTerm.toLowerCase();

        const filtered = availableExercises.filter(ex => {
            const nameMatch = ex.name.toLowerCase().includes(searchTerm);
            const categoryMatch = category === 'all' || ex.category === category;
            return nameMatch && categoryMatch;
        });

        if (filtered.length === 0) {
            availableExerciseListEl.innerHTML = '<p>No exercises match your criteria.</p>';
            return;
        }

        filtered.forEach(ex => {
            const item = document.createElement('div');
            item.className = 'modal-list-item';
            item.textContent = ex.name;
            item.dataset.exerciseId = ex.exercise_id; // Store ID for adding

            const categorySpan = document.createElement('span');
            categorySpan.textContent = `(${ex.category || 'N/A'})`; // Show category
            item.appendChild(categorySpan);

            // Event listener to add this exercise to the current workout
            item.addEventListener('click', () => addExerciseToWorkout(ex.exercise_id));

            availableExerciseListEl.appendChild(item);
        });
    }

    function renderCurrentWorkout() {
        currentExerciseListEl.innerHTML = ''; // Clear previous
        if (currentWorkout.length === 0) {
            currentExerciseListEl.innerHTML = '<p>Add exercises using the + button.</p>';
            return;
        }

        currentWorkout.forEach((exercise, index) => {
            const exerciseItem = document.createElement('div');
            exerciseItem.className = 'exercise-item';
            exerciseItem.dataset.workoutIndex = index; // Index in currentWorkout array

            // --- Fetch last log data and store it with the exercise --- 
            // Check if lastLog already fetched (e.g., after add/remove set)
            if (exercise.lastLog === undefined) { // Use undefined check to only fetch once
                exercise.lastLog = null; // Mark as fetching or fetched
                const fetchLastLog = async () => {
                    try {
                        const response = await fetch(`/api/workouts/exercises/${exercise.exercise_id}/lastlog`);
                        if (response.ok) {
                            exercise.lastLog = await response.json();
                            console.log(`Last log for ${exercise.name}:`, exercise.lastLog);
                        } else if (response.status === 404) {
                            console.log(`No last log found for ${exercise.name}`);
                            exercise.lastLog = { message: 'No previous log found.' }; // Indicate no log found
                        } else {
                            console.error(`Error fetching last log status: ${response.status}`);
                            exercise.lastLog = { message: 'Error fetching data.' }; // Indicate error
                        }
                    } catch (error) {
                        console.error(`Error fetching last log for ${exercise.name}:`, error);
                         exercise.lastLog = { message: 'Network error fetching data.' }; // Indicate error
                    } finally {
                        // Re-render this specific exercise item once data (or error state) is determined
                         renderSingleExerciseItem(exerciseItem, exercise, index);
                    }
                };
                fetchLastLog(); // Initiate fetch only if not already fetched/fetching
                 // Initial rendering (will be replaced by renderSingleExerciseItem after fetch)
                 exerciseItem.innerHTML = `
                     <div class="exercise-item-header">
                         <h4>${exercise.name}</h4>
                         <button class="btn-delete-exercise" title="Remove Exercise" data-workout-index="${index}">&times;</button>
                     </div>
                     <div class="sets-container">
                         <p>Loading previous data...</p> <!-- Placeholder -->
                     </div>
                 `;
            } else {
                // If lastLog is already fetched (or fetch failed), render immediately
                 renderSingleExerciseItem(exerciseItem, exercise, index);
            }
            // --- End fetch handling ---

            currentExerciseListEl.appendChild(exerciseItem);
        });
    }

    // --- Reworked function to render a single exercise item (lastLogData now part of exerciseData) ---
    function renderSingleExerciseItem(exerciseItemElement, exerciseData, index) {
        let setRowsHtml = '';
        const numSets = parseInt(exerciseData.sets) || 1;
        const lastLogData = exerciseData.lastLog; // Get stored last log data

        // Prepare previous log display data (simplistic: use first value)
        let prevWeight = '-';
        let prevReps = '-';
        let prevUnit = 'kg';
        if (lastLogData && lastLogData.weight_used && lastLogData.reps_completed) {
            prevWeight = lastLogData.weight_used.split(',')[0].trim() || '-';
            prevReps = lastLogData.reps_completed.split(',')[0].trim() || '-';
            prevUnit = lastLogData.weight_unit || 'kg';
        }
        const previousLogText = `${prevWeight}${prevUnit} x ${prevReps}`;

        for (let i = 0; i < numSets; i++) {
            const defaultReps = exerciseData.reps || '';
            const defaultWeight = exerciseData.weight != null ? exerciseData.weight : '';
            const defaultUnit = exerciseData.weight_unit || 'kg';
            const isSetCompleted = exerciseData.completedSets && exerciseData.completedSets[i];

            // Add the 'previous-log' span
            setRowsHtml += `
                <div class="set-row" data-set-index="${i}">
                    <span class="set-number">${i + 1}</span>
                    <span class="previous-log" title="Previous session">${previousLogText}</span>
                    <div class="weight-input-group">
                       <input type="number" class="weight-input" placeholder="Wt" value="${defaultWeight}" step="0.5">
                       <select class="unit-select">
                          <option value="kg" ${defaultUnit === 'kg' ? 'selected' : ''}>kg</option>
                          <option value="lbs" ${defaultUnit === 'lbs' ? 'selected' : ''}>lbs</option>
                          <option value="bodyweight">bw</option>
                       </select>
                    </div>
                    <input type="text" class="reps-input" placeholder="Reps" value="${defaultReps}">
                    <button class="set-complete-toggle ${isSetCompleted ? 'completed' : ''}" title="Mark Set Complete"></button>
                </div>
            `;
        }

        // Update the existing exerciseItemElement
        exerciseItemElement.innerHTML = `
            <div class="exercise-item-header">
                <h4>${exerciseData.name}</h4>
                <button class="btn-delete-exercise" title="Remove Exercise" data-workout-index="${index}">&times;</button>
            </div>
            <!-- Added Exercise Notes Textarea for Active Workout -->
            <div class="form-group exercise-notes-group">
               <label for="active-exercise-notes-${index}" class="sr-only">Notes for ${exerciseData.name}:</label> <!-- Screen-reader only label? -->
               <textarea id="active-exercise-notes-${index}" class="exercise-notes-textarea active-notes" rows="2" placeholder="Notes for this exercise..."></textarea>
            </div>
            <div class="sets-container">
                ${setRowsHtml}
            </div>
            <!-- Add/Remove Set Buttons -->
            <div class="set-actions-container">
                 <button type="button" class="btn-remove-set btn btn-danger btn-small" data-workout-index="${index}" ${numSets <= 1 ? 'disabled' : ''}>- Remove Set</button>
                 <button type="button" class="btn-add-set btn btn-secondary btn-small" data-workout-index="${index}">+ Add Set</button>
            </div>
        `;

        // Re-attach listeners for the updated content
        exerciseItemElement.querySelectorAll('.set-complete-toggle').forEach(toggle => {
            toggle.addEventListener('click', handleSetToggle);
        });
        exerciseItemElement.querySelector('.btn-delete-exercise').addEventListener('click', handleDeleteExercise);
    }

    // --- Event Handlers ---\

    function handleFilterChange() {
        const searchTerm = exerciseSearchInput.value;
        const category = exerciseCategoryFilter.value;
        renderAvailableExercises(searchTerm, category);
    }

    function openExerciseModal() {
        exerciseModal.style.display = 'block';
        // Reset filters on open might be good UX
        // exerciseSearchInput.value = '';
        // exerciseCategoryFilter.value = 'all';
        // renderAvailableExercises();
    }

    function closeExerciseModal() {
        exerciseModal.style.display = 'none';
    }

    function switchPage(pageToShow) {
        console.log('switchPage called with:', pageToShow); // Log function call and argument
        workoutLandingPage.classList.remove('active');
        activeWorkoutPage.classList.remove('active');
        templateEditorPage.classList.remove('active'); // Hide editor too

        if (pageToShow === 'landing') {
            workoutLandingPage.classList.add('active');
            console.log('Applied active class to:', workoutLandingPage);
        } else if (pageToShow === 'active') {
            activeWorkoutPage.classList.add('active');
            console.log('Applied active class to:', activeWorkoutPage);
        } else if (pageToShow === 'editor') {
            templateEditorPage.classList.add('active');
            console.log('Applied active class to:', templateEditorPage);
        }
        // Ensure FAB visibility matches active page
        addExerciseFab.style.display = (pageToShow === 'active') ? 'block' : 'none';
    }

    function startEmptyWorkout() {
        console.log('Starting empty workout');
        currentWorkout = []; // Reset workout
        currentWorkoutNameEl.textContent = 'New Workout'; // Or prompt user for name
        renderCurrentWorkout();
        switchPage('active');
        startTimer();
    }

    function startWorkoutFromTemplate(templateId) {
        console.log('Starting workout from template:', templateId);
        const template = workoutTemplates.find(t => t.workout_id === templateId);
        if (!template) {
            console.error('Template not found!');
            alert('Could not find the selected template.');
            return;
        }

        currentWorkoutNameEl.textContent = template.name;
        // Deep copy exercises from template to currentWorkout, initializing completedSets
        currentWorkout = template.exercises.map(ex => ({
             ...ex,
             completedSets: Array(ex.sets).fill(false), // Initialize completion array
             lastLog: undefined // Mark lastLog as not yet fetched
        }));

        console.log('Current workout initialized from template:', currentWorkout);

        renderCurrentWorkout();
        switchPage('active');
        startTimer();
    }


    function addExerciseToWorkout(exerciseId) {
        const targetList = exerciseModal.dataset.targetList || 'active'; // Default to active
        const exercise = availableExercises.find(ex => ex.exercise_id === exerciseId);
        if (!exercise) {
            console.error('Exercise not found in available list', exerciseId);
            alert('Error finding selected exercise.');
            return;
        }

        console.log(`Adding exercise: ${exercise.name} to ${targetList} list`);

        const newExerciseData = {
            exercise_id: exercise.exercise_id,
            name: exercise.name,
            category: exercise.category,
            sets: 1, // Default sets changed to 1
            reps: '', // Default reps
            weight: null,
            weight_unit: 'kg',
            order_position: (targetList === 'active' ? currentWorkout.length : currentTemplateExercises.length),
            notes: '',
            // Only add completedSets for active workouts, not templates
            ...(targetList === 'active' && { completedSets: Array(1).fill(false) }), // Default completedSets for 1 set
            lastLog: undefined // Mark lastLog as not yet fetched
        };

        if (targetList === 'active') {
            currentWorkout.push(newExerciseData);
            renderCurrentWorkout(); // Update the active workout list UI
        } else { // targetList === 'editor'
            currentTemplateExercises.push(newExerciseData);
            renderTemplateExerciseList(); // Update the template editor list UI
        }

        closeExerciseModal(); // Close modal after adding
    }

    function handleDeleteExercise(event) {
        const indexToRemove = parseInt(event.target.dataset.workoutIndex, 10);
        if (!isNaN(indexToRemove) && indexToRemove >= 0 && indexToRemove < currentWorkout.length) {
             if (confirm(`Are you sure you want to remove ${currentWorkout[indexToRemove].name} from this workout?`)) {
                 currentWorkout.splice(indexToRemove, 1);
                 // Re-assign order_position if needed (or handle on save)
                 // For simplicity, let's assume order is implicit for logging now
                 renderCurrentWorkout(); // Re-render the list
             }
        } else {
             console.error('Invalid index for exercise deletion:', event.target.dataset.workoutIndex);
        }
    }

    function handleSetToggle(event) {
        const toggleButton = event.target;
        const setRow = toggleButton.closest('.set-row');
        const exerciseItem = toggleButton.closest('.exercise-item');

        if (!setRow || !exerciseItem) {
            console.error('Could not find parent elements for set toggle.');
            return;
        }

        const exerciseIndex = parseInt(exerciseItem.dataset.workoutIndex, 10);
        const setIndex = parseInt(setRow.dataset.setIndex, 10);

        if (isNaN(exerciseIndex) || isNaN(setIndex) || !currentWorkout[exerciseIndex]) {
             console.error('Invalid index for set toggle:', exerciseIndex, setIndex);
             return;
        }

        // Toggle visual state
        toggleButton.classList.toggle('completed');

        // Update internal state
        const isCompleted = toggleButton.classList.contains('completed');
        if (!currentWorkout[exerciseIndex].completedSets) {
             currentWorkout[exerciseIndex].completedSets = Array(currentWorkout[exerciseIndex].sets).fill(false);
        }
        currentWorkout[exerciseIndex].completedSets[setIndex] = isCompleted;

        console.log(`Exercise ${exerciseIndex}, Set ${setIndex} completion: ${isCompleted}`);
    }

    async function handleCompleteWorkout() {
        console.log('Completing workout...');
        stopTimer(); // Stop timer first

        const loggedExercises = [];
        const exerciseItems = currentExerciseListEl.querySelectorAll('.exercise-item');

        exerciseItems.forEach((item, exerciseIndex) => {
            const baseExerciseData = currentWorkout[exerciseIndex]; // Get original data
            const setRows = item.querySelectorAll('.set-row');
            let repsCompletedArray = [];
            let weightUsedArray = [];
            let weightUnit = 'kg'; // Default or get from first set
            let setsCompletedCount = 0;

            setRows.forEach((setRow, setIndex) => {
                const repsInput = setRow.querySelector('.reps-input').value.trim() || '0'; // Default to '0' if empty
                const weightInput = setRow.querySelector('.weight-input').value.trim() || '0'; // Default to '0' if empty
                const unitSelect = setRow.querySelector('.unit-select').value;
                const isCompleted = baseExerciseData.completedSets && baseExerciseData.completedSets[setIndex];

                repsCompletedArray.push(repsInput);
                weightUsedArray.push(weightInput);
                if (setIndex === 0) weightUnit = unitSelect; // Capture unit from first set
                if (isCompleted) setsCompletedCount++;
            });

            // Get notes from the single textarea for the exercise
            const exerciseNotes = item.querySelector('.active-notes')?.value.trim() || null;

            loggedExercises.push({
                exercise_id: baseExerciseData.exercise_id,
                exercise_name: baseExerciseData.name, // Name at time of logging
                sets_completed: setsCompletedCount,
                reps_completed: repsCompletedArray.join(','), // e.g., "10,9,8"
                weight_used: weightUsedArray.join(','), // e.g., "50,50,55"
                weight_unit: weightUnit,
                notes: exerciseNotes // Assign collected notes string
            });
        });

        if (loggedExercises.length === 0) {
            alert('Workout is empty. Add some exercises or cancel.');
            startTimer(); // Resume timer if accidentally stopped
            return;
        }

        // Prompt for workout name if it's the default? Optional.
        let finalWorkoutName = currentWorkoutNameEl.textContent.trim();
        if (finalWorkoutName === 'New Workout') {
            finalWorkoutName = prompt("Enter a name for this workout:", `Workout ${new Date().toLocaleDateString()}`);
            if (!finalWorkoutName || finalWorkoutName.trim() === '') {
                 finalWorkoutName = 'Unnamed Workout'; // Default if cancelled or empty
            }
        }


        const workoutData = {
            workoutName: finalWorkoutName,
            duration: formatDuration(workoutStartTime ? (Date.now() - workoutStartTime) : 0),
            notes: '', // TODO: Add an input field for overall workout notes if desired
            exercises: loggedExercises
        };

        console.log('Sending workout log data:', workoutData);

        // Disable button to prevent double submission
        completeWorkoutBtn.disabled = true;
        completeWorkoutBtn.textContent = 'Saving...';

        try {
            const response = await fetch('/api/workouts/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(workoutData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' })); // Handle non-JSON errors
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Workout logged successfully:', result);
            alert('Workout saved successfully!');
            // Reset state and go back to landing page
            currentWorkout = [];
            workoutStartTime = null;
            switchPage('landing');
            // Optionally fetch history or update landing page view
            fetchTemplates(); // Refresh templates list

        } catch (error) {
            console.error('Error saving workout:', error);
            alert(`Failed to save workout: ${error.message}`);
            // Don't restart timer automatically on failure, user might want to retry saving
        } finally {
             // Re-enable button
             completeWorkoutBtn.disabled = false;
             completeWorkoutBtn.textContent = 'Complete Workout';
        }
    }


    // --- Timer Functions ---\
    function startTimer() {
        if (workoutTimerInterval) clearInterval(workoutTimerInterval); // Clear existing timer safely
        workoutStartTime = Date.now();
        workoutTimerEl.textContent = '00:00:00';
        workoutTimerInterval = setInterval(updateTimer, 1000); // Update every second
        console.log('Timer started');
    }

    function stopTimer() {
        clearInterval(workoutTimerInterval);
        workoutTimerInterval = null; // Clear the interval ID
        console.log('Timer stopped');
    }

    function updateTimer() {
        if (!workoutStartTime) return; // Don't run if timer shouldn't be active
        const elapsedMs = Date.now() - workoutStartTime;
        workoutTimerEl.textContent = formatTime(elapsedMs);
    }

    function formatTime(milliseconds) {
        const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000)); // Ensure non-negative
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        // Use padStart for consistent formatting (00:05:09)
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function formatDuration(milliseconds) {
        // Formats duration to ISO 8601 Interval like string PT1H30M15S (needed for PostgreSQL interval type)
        if (milliseconds <= 0) return null;
        const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
        if (totalSeconds === 0) return null; // Don't log zero duration

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        let durationString = 'PT';
        if (hours > 0) durationString += `${hours}H`;
        if (minutes > 0) durationString += `${minutes}M`;
        // Include seconds if they are non-zero, OR if hours and minutes are BOTH zero (e.g., PT15S)
        if (seconds > 0 || (hours === 0 && minutes === 0)) durationString += `${seconds}S`;

        return durationString;
    }

    // --- Template Editor Specific Functions ---

    function showTemplateEditor(templateToEdit = null) {
        console.log('showTemplateEditor function called. Editing:', templateToEdit ? templateToEdit.workout_id : 'New'); // Log function call
        if (templateToEdit) {
            editingTemplateId = templateToEdit.workout_id;
            templateEditorTitle.textContent = 'Edit Workout Template';
            templateNameInput.value = templateToEdit.name;
            templateDescriptionInput.value = templateToEdit.description || '';
            // Deep copy exercises for editing
            currentTemplateExercises = templateToEdit.exercises.map(ex => ({ ...ex }));
        } else {
            editingTemplateId = null;
            templateEditorTitle.textContent = 'Create New Workout Template';
            templateEditorForm.reset(); // Clear form fields
            currentTemplateExercises = []; // Start with empty list
        }
        renderTemplateExerciseList(); // Render exercises in editor
        switchPage('editor');
    }

    function renderTemplateExerciseList() {
        templateExerciseListEl.innerHTML = ''; // Clear previous
        if (currentTemplateExercises.length === 0) {
            templateExerciseListEl.innerHTML = '<p>Add exercises using the button below.</p>';
            return;
        }

        // Similar to renderCurrentWorkout, but without completion toggles
        // and maybe with reordering handles later
        currentTemplateExercises.forEach((exercise, index) => {
             exercise.order_position = index; // Ensure order is up-to-date
             const exerciseItem = document.createElement('div');
             exerciseItem.className = 'exercise-item'; // Reuse class
             exerciseItem.dataset.templateIndex = index; // Use different dataset attribute

             let setRowsHtml = '';
             const numSets = parseInt(exercise.sets) || 1;
             for (let i = 0; i < numSets; i++) {
                 setRowsHtml += `
                     <div class="set-row" data-set-index="${i}">
                         <span class="set-number">${i + 1}</span>
                         <div class="weight-input-group">
                            <input type="number" class="weight-input" placeholder="Wt" value="${exercise.weight != null ? exercise.weight : ''}" step="0.5">
                            <select class="unit-select">
                               <option value="kg" ${exercise.weight_unit === 'kg' ? 'selected' : ''}>kg</option>
                               <option value="lbs" ${exercise.weight_unit === 'lbs' ? 'selected' : ''}>lbs</option>
                               <option value="bodyweight">bw</option>
                            </select>
                         </div>
                         <input type="text" class="reps-input" placeholder="Reps" value="${exercise.reps || ''}">
                         <!-- No toggle here -->
                     </div>
                 `;
             }

             exerciseItem.innerHTML = `
                 <div class="exercise-item-header">
                     <h4>${exercise.name}</h4>
                     <button type="button" class="btn-delete-template-exercise" title="Remove Exercise" data-template-index="${index}">&times;</button>
                 </div>
                 <div class="form-group exercise-notes-group">
                    <label for="exercise-notes-${index}">Notes:</label>
                    <textarea id="exercise-notes-${index}" class="exercise-notes-textarea" rows="2" placeholder="Exercise specific notes...">${exercise.notes || ''}</textarea>
                 </div>
                 <div class="sets-container">
                     ${setRowsHtml}
                 </div>
             `;

             // Add listener for deleting exercise from template
              exerciseItem.querySelector('.btn-delete-template-exercise').addEventListener('click', handleDeleteTemplateExercise);

             templateExerciseListEl.appendChild(exerciseItem);
         });
    }

    function handleOpenTemplateExerciseModal() {
        // We need to modify how exercises are added - specify the target list
        // For now, modify the listener directly when showing the editor?
        // Or have a state variable? Let's use a state variable.
    }

     function handleDeleteTemplateExercise(event) {
        const indexToRemove = parseInt(event.target.dataset.templateIndex, 10);
         if (!isNaN(indexToRemove) && indexToRemove >= 0 && indexToRemove < currentTemplateExercises.length) {
             currentTemplateExercises.splice(indexToRemove, 1);
             renderTemplateExerciseList(); // Re-render
         }
     }

     function handleChangeTemplateSetCount(event) {
        const indexToChange = parseInt(event.target.dataset.templateIndex, 10);
        const newSetCount = parseInt(event.target.value, 10);
        if (!isNaN(indexToChange) && indexToChange >= 0 && indexToChange < currentTemplateExercises.length && !isNaN(newSetCount) && newSetCount > 0) {
            currentTemplateExercises[indexToChange].sets = newSetCount;
            renderTemplateExerciseList(); // Re-render to show correct number of set rows
        }
     }

    async function handleSaveTemplate(event) {
        event.preventDefault(); // Prevent default form submission
        console.log('Saving template...');

        const templateName = templateNameInput.value.trim();
        const templateDescription = templateDescriptionInput.value.trim();

        if (!templateName) {
            alert('Template name cannot be empty.');
            templateNameInput.focus();
            return;
        }

        // Collect exercise data from the currentTemplateExercises array,
        // ensuring data from inputs is captured correctly.
        const exercisesToSave = currentTemplateExercises.map((exercise, index) => {
            // REMOVED reading values from DOM inputs for template save
            // Only send the essential info: exercise ID and order
             const simplifiedExercise = {
                 exercise_id: exercise.exercise_id,
                 order_position: index,
                 // We CAN optionally include default/placeholder values if desired,
                 // but the backend now handles defaults if these are missing/null.
                 sets: exercise.sets || 1, // Send current sets value or default
                 reps: exercise.reps || '', // Send current reps or default
                 weight: exercise.weight,
                 weight_unit: exercise.weight_unit,
                 notes: exercise.notes
             };
              // REMOVED validation here, backend handles it now
             return simplifiedExercise;
        }); //.filter(ex => ex !== null); -- No longer needed


        const templateData = {
            name: templateName,
            description: templateDescription || null,
            exercises: exercisesToSave
        };

        console.log('Template data to save:', templateData);

        // Determine API endpoint and method (POST for new, PUT for update)
        const apiUrl = editingTemplateId
            ? `/api/workouts/templates/${editingTemplateId}`
            : '/api/workouts/templates';
        const apiMethod = editingTemplateId ? 'PUT' : 'POST';

        templateSaveBtn.disabled = true;
        templateSaveBtn.textContent = 'Saving...';

        try {
            const response = await fetch(apiUrl, {
                method: apiMethod,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(templateData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Template saved successfully:', result);
            // alert(`Template ${editingTemplateId ? 'updated' : 'created'} successfully!`); // REMOVED ALERT

            // Reset state and go back to landing page
            editingTemplateId = null;
            currentTemplateExercises = [];
            switchPage('landing');
            fetchTemplates(); // Refresh template list

        } catch (error) {
            console.error('Error saving template:', error);
            alert(`Failed to save template: ${error.message}`);
        } finally {
            templateSaveBtn.disabled = false;
            templateSaveBtn.textContent = 'Save Template';
        }
    }

    // --- End Template Editor Specific Functions ---

    function handleToggleDefineExercise() {
        const isHidden = defineNewExerciseSection.style.display === 'none';
        defineNewExerciseSection.style.display = isHidden ? 'block' : 'none';
        toggleDefineExerciseBtn.textContent = isHidden ? 'Cancel Define New' : 'Define New Exercise';
        if (isHidden) {
            // Clear inputs when shown
            newExerciseNameInput.value = '';
            newExerciseCategorySelect.value = '';
        }
    }

    async function handleSaveNewExercise() {
        const name = newExerciseNameInput.value.trim();
        const category = newExerciseCategorySelect.value;

        if (!name) {
            alert('Please enter an exercise name.');
            newExerciseNameInput.focus();
            return;
        }
        if (!category) {
            alert('Please select an exercise category.');
            newExerciseCategorySelect.focus();
            return;
        }

        console.log(`Attempting to save new exercise: ${name}, Category: ${category}`);
        saveNewExerciseBtn.disabled = true;
        saveNewExerciseBtn.textContent = 'Saving...';

        try {
            const response = await fetch('/api/workouts/exercises', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, category })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `HTTP error! status: ${response.status}`);
            }

            console.log('New exercise saved:', result);

            // Add to local cache and re-render list
            availableExercises.push(result); // Add the new exercise object returned by API
            availableExercises.sort((a, b) => a.name.localeCompare(b.name)); // Keep sorted
            renderAvailableExercises();

            // Hide the definition section and reset button
            handleToggleDefineExercise(); // Toggle back to hide

        } catch (error) {
            console.error('Error saving new exercise:', error);
            alert(`Failed to save exercise: ${error.message}`);
        } finally {
            saveNewExerciseBtn.disabled = false;
            saveNewExerciseBtn.textContent = 'Save New Exercise';
        }

    }

    // --- Add Set Handler ---
    function handleAddSet(event) {
        const workoutIndex = parseInt(event.target.dataset.workoutIndex, 10);
        if (isNaN(workoutIndex) || !currentWorkout[workoutIndex]) {
            console.error("Invalid workout index for adding set:", workoutIndex);
            return;
        }

        const exercise = currentWorkout[workoutIndex];
        exercise.sets = (parseInt(exercise.sets) || 0) + 1; // Increment set count
         // Also extend the completedSets array if it exists
         if (exercise.completedSets && Array.isArray(exercise.completedSets)) {
            exercise.completedSets.push(false);
         }

        console.log(`Added set to exercise ${workoutIndex} (${exercise.name}). New count: ${exercise.sets}`);

        // Find the specific exercise item element to re-render
        const exerciseItemElement = currentExerciseListEl.querySelector(`.exercise-item[data-workout-index="${workoutIndex}"]`);
        if (exerciseItemElement) {
            // Re-render using the updated exercise object (which includes lastLog)
            renderSingleExerciseItem(exerciseItemElement, exercise, workoutIndex);
        } else {
            console.error("Could not find exercise item element to re-render for index:", workoutIndex);
        }
    }

    // --- Remove Set Handler ---
     function handleRemoveSet(event) {
        const workoutIndex = parseInt(event.target.dataset.workoutIndex, 10);
        if (isNaN(workoutIndex) || !currentWorkout[workoutIndex]) {
            console.error("Invalid workout index for removing set:", workoutIndex);
            return;
        }

        const exercise = currentWorkout[workoutIndex];
        const currentSets = parseInt(exercise.sets) || 0;

        if (currentSets <= 1) {
             console.log("Cannot remove set, only 1 set remaining.");
             // Optionally disable button visually again, though renderSingleExerciseItem should handle it
             return; // Don't remove if only 1 set is left
        }

        exercise.sets = currentSets - 1; // Decrement set count

         // Also shorten the completedSets array if it exists
         if (exercise.completedSets && Array.isArray(exercise.completedSets)) {
             exercise.completedSets.pop(); // Remove the last entry
         }

        console.log(`Removed set from exercise ${workoutIndex} (${exercise.name}). New count: ${exercise.sets}`);

        // Find the specific exercise item element to re-render
        const exerciseItemElement = currentExerciseListEl.querySelector(`.exercise-item[data-workout-index="${workoutIndex}"]`);
        if (exerciseItemElement) {
            // Re-render using the updated exercise object (which includes lastLog)
            renderSingleExerciseItem(exerciseItemElement, exercise, workoutIndex);
        } else {
            console.error("Could not find exercise item element to re-render for index:", workoutIndex);
        }
     }

    // --- Initialization ---\
    function initialize() {
        console.log('Initializing Workout Tracker...');
        fetchExercises(); // Fetch exercises for the modal
        fetchTemplates(); // Fetch templates for the landing page

        // Page switching listeners
        startEmptyWorkoutBtn.addEventListener('click', startEmptyWorkout);

        // Log the button element
        console.log('Create Template Button Element:', createTemplateBtn);
        if (createTemplateBtn) {
            createTemplateBtn.addEventListener('click', () => {
                 console.log('Create Template button clicked!'); // Log click
                 showTemplateEditor();
            });
        } else {
            console.error('Create Template Button not found!');
        }

        // Modal listeners
        addExerciseFab.addEventListener('click', () => {
             // Determine context: Are we in active workout or template editor?
             const targetList = templateEditorPage.classList.contains('active') ? 'editor' : 'active';
             // Modify the modal's behavior or pass context if needed
             console.log(`Opening exercise modal for target: ${targetList}`);
             // We need a way for addExerciseToWorkout to know the target.
             // Let's modify the modal item click listener generation temporarily.

             // Temporarily store target context
             exerciseModal.dataset.targetList = targetList;
             openExerciseModal();
        });
        closeExerciseModalBtn.addEventListener('click', closeExerciseModal);
        exerciseModal.addEventListener('click', (event) => { // Close on backdrop click
            if (event.target === exerciseModal) closeExerciseModal();
        });
        exerciseSearchInput.addEventListener('input', handleFilterChange);
        exerciseCategoryFilter.addEventListener('change', handleFilterChange);

        // Active workout listeners
        cancelWorkoutBtn.addEventListener('click', handleCancelWorkout);
        completeWorkoutBtn.addEventListener('click', handleCompleteWorkout);
        // Add listener for Add Set button using delegation
        currentExerciseListEl.addEventListener('click', (event) => {
            if (event.target.classList.contains('btn-add-set')) {
                handleAddSet(event);
            } else if (event.target.classList.contains('btn-remove-set')) { // Add listener for Remove Set
                handleRemoveSet(event);
            }
        });

        // Template search listener
        templateSearchInput.addEventListener('input', () => {
            const searchTerm = templateSearchInput.value.toLowerCase();
            const filtered = workoutTemplates.filter(t => t.name.toLowerCase().includes(searchTerm));
            renderWorkoutTemplates(filtered);
        });

        // Template Editor
        templateEditorForm.addEventListener('submit', handleSaveTemplate);
        templateCancelBtn.addEventListener('click', () => switchPage('landing'));
        templateAddExerciseBtn.addEventListener('click', () => {
             // Open modal specifically for adding to template
             exerciseModal.dataset.targetList = 'editor';
             openExerciseModal();
        });

        // New Exercise Definition Listeners in Modal
        toggleDefineExerciseBtn.addEventListener('click', handleToggleDefineExercise);
        saveNewExerciseBtn.addEventListener('click', handleSaveNewExercise);

        // Use event delegation for delete buttons on template list
        templateListContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('btn-delete-template')) {
                const templateId = event.target.dataset.templateId;
                handleDeleteTemplate(templateId);
            } else if (event.target.classList.contains('btn-edit-template')) { // Added condition for edit
                 const templateId = event.target.dataset.templateId;
                 const templateToEdit = workoutTemplates.find(t => t.workout_id === parseInt(templateId));
                 if (templateToEdit) {
                    showTemplateEditor(templateToEdit);
                 } else {
                     console.error('Could not find template to edit with ID:', templateId);
                     alert('Error: Could not find template data to edit.');
                 }
            }
        });

        // Initial page state
        switchPage('landing'); // Start on the landing page
    }

    async function handleDeleteTemplate(templateId) {
        if (!templateId) return;

        const template = workoutTemplates.find(t => t.workout_id === parseInt(templateId));
        const templateName = template ? template.name : `Template ID ${templateId}`;

        if (confirm(`Are you sure you want to delete the template "${templateName}"? This cannot be undone.`)) {
            console.log(`Attempting to delete template ID: ${templateId}`);
            try {
                const response = await fetch(`/api/workouts/templates/${templateId}`, {
                    method: 'DELETE'
                });

                console.log(`DELETE Template Response Status: ${response.status}`); // Log status

                // Try to parse JSON only if response indicates success or known error format
                // if (!response.ok) {
                //     const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response'}));
                //     throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                // }
                // const result = await response.json();

                // Refined error handling:
                if (!response.ok) {
                    let errorMsg = `HTTP error! status: ${response.status}`;
                    try {
                        // Attempt to parse potential JSON error body
                        const errorData = await response.json();
                        errorMsg = errorData.error || JSON.stringify(errorData); // Use specific error or stringify
                    } catch (parseError) {
                        // If parsing fails, get text response instead
                        try {
                            const textResponse = await response.text();
                            console.error("Non-JSON error response:", textResponse); // Log the HTML/text
                            errorMsg += " (Non-JSON response received)";
                        } catch (textError) {
                             console.error("Could not read error response text.");
                        }
                    }
                    throw new Error(errorMsg);
                }

                // If response.ok, parse the success JSON
                const result = await response.json();
                console.log('Template deleted successfully:', result);

                // Remove from local cache and re-render
                workoutTemplates = workoutTemplates.filter(t => t.workout_id !== parseInt(templateId));
                renderWorkoutTemplates(); // Re-render the list
                // No alert needed, removal is visual feedback

            } catch (error) {
                console.error('Error deleting template:', error);
                alert(`Failed to delete template: ${error.message}`);
            }
        }
    }

    // --- Cancel Workout Function ---
    function handleCancelWorkout() {
        stopTimer(); // Stop timer immediately
        if (confirm('Are you sure you want to cancel this workout? All progress will be lost.')) {
            console.log('Workout cancelled by user.');
            // Reset state
            currentWorkout = [];
            workoutStartTime = null;
            // Switch back to landing page
            switchPage('landing');
        } else {
            console.log('Workout cancellation aborted.');
            startTimer(); // Resume timer if cancelled the cancellation
        }
    }

    initialize(); // Run initialization
});
