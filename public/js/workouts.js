document.addEventListener('DOMContentLoaded', function() {
    console.log('Workout Tracker JS loaded');

    // --- State Variables ---
    let availableExercises = []; // Populated from API
    let workoutTemplates = [];   // Populated from API
    let currentWorkout = [];     // Array of exercise objects being performed { exercise_id, name, category, sets, reps, weight, weight_unit, order_position, notes, completedSets: [], lastLog: null }
    let workoutStartTime = null;
    let workoutTimerInterval = null;
    let editingTemplateId = null; // To track which template is being edited
    let currentTemplateExercises = []; // Array for exercises in the template editor
    let exerciseHistoryChart = null; // To hold the Chart.js instance
    let currentHistoryCategoryFilter = 'all'; // State for history category filter
    const historyMessageEl = document.getElementById('history-message');
    const historyEditBtn = document.getElementById('history-edit-btn'); // Renamed button reference
    let currentHistoryExerciseId = null; // Store the currently selected exercise ID
    let currentHistoryExerciseName = null; // Store the name

    // --- NEW: Progress Photo Slider State ---
    let progressPhotosData = []; // Holds the array of { photo_id, date_taken, file_path, ... }
    let currentPhotoIndex = 0;

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
    const addSelectedExercisesBtn = document.getElementById('add-selected-exercises-btn'); // Added reference

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
    // --- End Template Editor Elements ---

    // --- History Section Elements (Updated for Search) ---
    const historyExerciseSearchInput = document.getElementById('history-exercise-search');
    const historySearchResultsEl = document.getElementById('history-search-results');
    const historyCategoryFilterSelect = document.getElementById('history-category-filter-select');
    const historyChartCanvas = document.getElementById('exercise-history-chart');

    // --- History Edit Modal Elements (Renamed) ---
    const historyEditModal = document.getElementById('history-edit-modal'); // Renamed modal ref
    const historyEditAddForm = document.getElementById('history-edit-add-form'); // Renamed form ref
    const historyEditExerciseNameEl = document.getElementById('history-edit-exercise-name'); // Renamed element ref
    const historyEditExerciseIdInput = document.getElementById('history-edit-exercise-id'); // Renamed element ref
    const historyEditDateInput = document.getElementById('history-edit-date'); // Renamed element ref
    const historyEditSetsContainer = document.getElementById('history-edit-sets-container'); // Renamed element ref
    const historyEditAddSetBtn = document.getElementById('history-edit-add-set'); // Renamed element ref
    const historyEditRemoveSetBtn = document.getElementById('history-edit-remove-set'); // Renamed element ref
    const historyEditNotesInput = document.getElementById('history-edit-notes'); // Renamed element ref
    const historyEditLogListEl = document.getElementById('history-edit-log-list'); // New ref for log list
    let historyEditSets = []; // Renamed state variable

    // --- Progress Photos Elements ---
    const photoForm = document.getElementById('progress-photo-form');
    const photoDateInput = document.getElementById('photo-date');
    const photoUploadInput = document.getElementById('photo-upload');
    const uploadStatusEl = document.getElementById('upload-status');
    const photoGalleryEl = document.getElementById('progress-photos-gallery');

    // --- New Button/Modal References for Photo Upload ---
    const addPhotoBtn = document.getElementById('add-photo-btn');
    const photoUploadModal = document.getElementById('photo-upload-modal');
    const photoModalCloseBtn = photoUploadModal ? photoUploadModal.querySelector('.close-button') : null;

    // --- NEW: Slider DOM References ---
    const currentPhotoDisplay = document.getElementById('current-photo-display');
    const currentPhotoDate = document.getElementById('current-photo-date');
    const photoPrevBtn = document.getElementById('photo-prev-btn');
    const photoNextBtn = document.getElementById('photo-next-btn');
    const deletePhotoBtn = document.getElementById('delete-photo-btn'); // NEW: Delete button reference
    const photoReel = document.querySelector('.photo-reel'); // Reel container
    const photoPrevPreview = document.getElementById('photo-prev-preview');
    const photoNextPreview = document.getElementById('photo-next-preview');
    console.log('photoNextBtn element:', photoNextBtn);

    // --- Helper function to generate HTML for set rows ---
    function generateSetRowsHtml(exerciseData, index, isTemplate = false) {
        let setRowsHtml = '';
        const numSets = parseInt(exerciseData.sets) || 1;
        const lastLogData = isTemplate ? null : exerciseData.lastLog;

        // Parse previous log data into arrays (if available)
        let prevRepsArray = [];
        let prevWeightsArray = [];
        let prevUnit = 'kg'; // Default unit
        if (!isTemplate && lastLogData && lastLogData.reps_completed && lastLogData.weight_used) {
            prevRepsArray = lastLogData.reps_completed.split(',');
            prevWeightsArray = lastLogData.weight_used.split(',');
            prevUnit = lastLogData.weight_unit || 'kg';
        }

        // Removed calculation of single previousLogText here

        for (let i = 0; i < numSets; i++) {
             // Determine if this specific set was completed (only for active workouts)
             const isCompleted = !isTemplate && exerciseData.completedSets && exerciseData.completedSets[i];

            // --- Get previous data for THIS specific set index (i) ---
            let previousLogText = '- kg x -'; // Default placeholder for this set
            if (prevRepsArray.length > i && prevWeightsArray.length > i) {
                 const prevRep = prevRepsArray[i]?.trim() || '-';
                 const prevWeight = prevWeightsArray[i]?.trim() || '-';
                 previousLogText = `${prevWeight} ${prevUnit} x ${prevRep}`; // Construct text for this set
            } else if (!isTemplate && lastLogData && lastLogData.message) {
                // Handle overall fetch error/no data message if needed (optional)
                 // previousLogText = 'N/A';
            }
            // --- End getting previous data for set index i ---

            setRowsHtml += `
                <div class="set-row" data-set-index="${i}">
                    <span class="set-number">${i + 1}</span>
                    ${!isTemplate ? `<span class="previous-log" title="Last Session Set ${i + 1}">${previousLogText}</span>` : ''} <!-- Show previous data specific to this set index -->
                    <div class="weight-input-group">
                        <input type="number" class="weight-input" placeholder="Wt" value="${exerciseData.weight != null ? exerciseData.weight : ''}" step="0.5">
                        <select class="unit-select">
                            <option value="kg" ${exerciseData.weight_unit === 'kg' ? 'selected' : ''}>kg</option>
                            <option value="lbs" ${exerciseData.weight_unit === 'lbs' ? 'selected' : ''}>lbs</option>
                            <option value="bodyweight">bw</option>
                        </select>
                    </div>
                    <input type="text" class="reps-input" placeholder="Reps" value="${exerciseData.reps || ''}">
                    ${!isTemplate ? `<button class="set-complete-toggle ${isCompleted ? 'completed' : ''}" data-workout-index="${index}" data-set-index="${i}"></button>` : ''} <!-- Completion toggle only in active workout -->
                </div>
            `;
        }
        return setRowsHtml;
    }

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
            // Create a label element instead of a div
            const label = document.createElement('label');
            label.className = 'modal-list-item checkbox-item'; // Add class for styling

            // Create the checkbox
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = ex.exercise_id; // Store ID in value
            checkbox.id = `ex-select-${ex.exercise_id}`;
            checkbox.name = 'selectedExercises';

            // Create span for the text content
            const textSpan = document.createElement('span');
            textSpan.textContent = `${ex.name} (${ex.category || 'N/A'})`;

            // Append checkbox and text span to the label
            label.appendChild(checkbox);
            label.appendChild(textSpan);
            label.htmlFor = checkbox.id;

            // Remove the old single-click listener
            // item.addEventListener('click', () => addExerciseToWorkout(ex.exercise_id));

            availableExerciseListEl.appendChild(label);
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
        const numSets = parseInt(exerciseData.sets) || 1;
        const lastLogData = exerciseData.lastLog; // Get stored last log data

        // Generate set rows HTML using the helper function
        const setRowsHtml = generateSetRowsHtml(exerciseData, index, false); // Pass false for isTemplate

        // Update the existing exerciseItemElement
        exerciseItemElement.innerHTML = `
            <div class="exercise-item-header">
                <h4>${exerciseData.name}</h4>
                <button class="btn-delete-exercise" title="Remove Exercise" data-workout-index="${index}">&times;</button>
            </div>
            <!-- Removed the label for the notes textarea -->
            <div class="form-group exercise-notes-group">
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


    function addExerciseToWorkout(exerciseId, targetList) { // Added targetList parameter
        // Removed reading targetList from modal dataset here
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

        // --- Added: Disable/Enable inputs based on completion state ---
        const weightInput = setRow.querySelector('.weight-input');
        const repsInput = setRow.querySelector('.reps-input');
        const unitSelect = setRow.querySelector('.unit-select');

        if (weightInput && repsInput && unitSelect) {
            weightInput.disabled = isCompleted;
            repsInput.disabled = isCompleted;
            unitSelect.disabled = isCompleted;
        }

        // Add/Remove actual checkmark character
        if (isCompleted) {
            toggleButton.innerHTML = '&#10003;'; // Checkmark HTML entity
        } else {
            toggleButton.innerHTML = ''; // Clear checkmark
        }
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
        const templateExerciseListEl = document.getElementById('template-exercise-list');
        templateExerciseListEl.innerHTML = '';

        currentTemplateExercises.forEach((exercise, index) => {
            const exerciseItem = document.createElement('div');
            exerciseItem.className = 'exercise-item';
            exerciseItem.draggable = true; // Make the item draggable
            exerciseItem.dataset.index = index; // Store the current index

            // Add drag event listeners
            exerciseItem.addEventListener('dragstart', handleDragStart);
            exerciseItem.addEventListener('dragend', handleDragEnd);
            exerciseItem.addEventListener('dragover', handleDragOver);
            exerciseItem.addEventListener('drop', handleDrop);

            // Call helper function
            const setRowsHtml = generateSetRowsHtml(exercise, index, true); // Pass true for isTemplate

            exerciseItem.innerHTML = `
                <div class="exercise-item-header">
                    <h4>${exercise.name}</h4>
                    <button class="btn-delete-exercise" title="Remove Exercise" data-index="${index}">&times;</button>
                </div>
                <div class="sets-container">
                    ${setRowsHtml}
                </div>
                <div class="exercise-notes-group">
                    <label for="exercise-notes-${index}">Notes:</label>
                    <textarea id="exercise-notes-${index}" class="exercise-notes" rows="2">${exercise.notes || ''}</textarea>
                </div>
            `;

            templateExerciseListEl.appendChild(exerciseItem);
        });
    }

    // --- Drag and Drop Handlers ---
    function handleDragStart(e) {
        this.classList.add('dragging');
        e.dataTransfer.setData('text/plain', this.dataset.index);
    }

    function handleDragEnd(e) {
        this.classList.remove('dragging');
    }

    function handleDragOver(e) {
        e.preventDefault(); // Necessary to allow dropping
        const draggingElement = document.querySelector('.dragging');
        if (draggingElement === this) return;

        const rect = this.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const dropPosition = e.clientY < midY ? 'before' : 'after';

        // Remove drag-over class from all elements
        document.querySelectorAll('.exercise-item').forEach(item => {
            item.classList.remove('drag-over');
        });

        // Add drag-over class to current element
        this.classList.add('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        this.classList.remove('drag-over');

        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
        const toIndex = parseInt(this.dataset.index);
        
        if (fromIndex === toIndex) return;

        // Reorder the exercises array
        const [movedExercise] = currentTemplateExercises.splice(fromIndex, 1);
        currentTemplateExercises.splice(toIndex, 0, movedExercise);

        // Update order_position for all exercises
        currentTemplateExercises.forEach((exercise, index) => {
            exercise.order_position = index;
        });

        // Re-render the list
        renderTemplateExerciseList();
    }

    // --- Template Save Handler ---
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

        // Collect exercise data from the currentTemplateExercises array
        const exercisesToSave = currentTemplateExercises.map((exercise, index) => {
            const simplifiedExercise = {
                exercise_id: exercise.exercise_id,
                order_position: index,
                sets: parseInt(exercise.sets) || 1, // Ensure sets is a number, default to 1
                reps: exercise.reps || '', // Default empty string if not set
                weight: exercise.weight,
                weight_unit: exercise.weight_unit || 'kg', // Default to kg if not set
                notes: exercise.notes || '' // Default empty string if not set
            };
            return simplifiedExercise;
        });

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
        addSelectedExercisesBtn.addEventListener('click', handleAddSelectedExercises); // Added listener

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

        // History Search Listener
        if (historyExerciseSearchInput) { // Check if element exists
             historyExerciseSearchInput.addEventListener('input', handleHistorySearchInput);
             // Add listener to hide results when clicking outside
             document.addEventListener('click', (event) => {
                 if (!historyExerciseSearchInput.contains(event.target) && !historySearchResultsEl.contains(event.target)) {
                     historySearchResultsEl.style.display = 'none';
                 }
             });
            // Add focus listener to show results
             historyExerciseSearchInput.addEventListener('focus', () => {
                  // Show all exercises matching current category filter when focused (if input empty)
                 if (historyExerciseSearchInput.value.trim() === '') {
                     handleHistorySearchInput();
                 }
             });

            // Add listener for new category dropdown
            if (historyCategoryFilterSelect) {
                historyCategoryFilterSelect.addEventListener('change', () => {
                    currentHistoryCategoryFilter = historyCategoryFilterSelect.value;
                    console.log('History category filter changed to:', currentHistoryCategoryFilter);
                    // Clear selected exercise and hide button when filter changes
                    currentHistoryExerciseId = null;
                    currentHistoryExerciseName = null;
                    historyEditBtn.style.display = 'none';
                    historyExerciseSearchInput.value = ''; // Clear search input
                    if (exerciseHistoryChart) { // Clear chart
                         exerciseHistoryChart.destroy();
                         exerciseHistoryChart = null;
                    }
                    historyMessageEl.textContent = 'Select an exercise.';
                    // Re-filter search results based on new category
                    handleHistorySearchInput();
                 });
            }

            // --- NEW: Event delegation listener for results container ---
            historySearchResultsEl.addEventListener('click', handleHistoryResultClick);
            // --- END NEW ---

            // Add listener for the new Add Past Log button
            if (historyEditBtn) {
                historyEditBtn.addEventListener('click', openHistoryEditModal);
            }
        }

        // --- NEW: Progress Photo Form Listener ---
        if (photoForm) {
            photoForm.addEventListener('submit', handlePhotoUpload);
        }
        // --- END NEW ---

        // --- NEW: Add Photo Button Listener ---
        if (addPhotoBtn) {
            addPhotoBtn.addEventListener('click', openPhotoUploadModal);
        }
        // Close modal listener (delegation or direct)
        if (photoModalCloseBtn) {
            photoModalCloseBtn.addEventListener('click', closePhotoUploadModal);
        }
        // Also close on backdrop click
        if (photoUploadModal) {
            photoUploadModal.addEventListener('click', (event) => {
                if (event.target === photoUploadModal) {
                    closePhotoUploadModal();
                }
            });
        }
        // --- END NEW ---

        // Initial page state
        switchPage('landing'); // Start on the landing page

        // --- NEW: Initial Photo Load ---
        fetchAndDisplayPhotos();
        // --- END NEW ---

        if (photoPrevBtn) {
            console.log('Attaching listener to photoPrevBtn'); // DEBUG: Verify listener attachment attempt
            photoPrevBtn.addEventListener('click', showPreviousPhoto);
        }
        if (photoNextBtn) {
            console.log('Attaching listener to photoNextBtn'); // DEBUG: Verify listener attachment attempt
            photoNextBtn.addEventListener('click', showNextPhoto);
        }
        // --- END NEW ---

        // --- NEW: Delete Photo Button Listener ---
        if (deletePhotoBtn) {
            deletePhotoBtn.addEventListener('click', handleDeletePhoto);
        }
        // --- END NEW ---
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

    // --- New Handler for Adding Multiple Selected Exercises ---
    function handleAddSelectedExercises() {
        const targetList = exerciseModal.dataset.targetList || 'active'; // Determine target
        const selectedCheckboxes = availableExerciseListEl.querySelectorAll('input[type="checkbox"]:checked');

        if (selectedCheckboxes.length === 0) {
            alert('Please select at least one exercise to add.');
            return;
        }

        console.log(`Adding ${selectedCheckboxes.length} selected exercises to ${targetList}`);

        selectedCheckboxes.forEach(checkbox => {
            const exerciseId = parseInt(checkbox.value, 10);
            if (!isNaN(exerciseId)) {
                addExerciseToWorkout(exerciseId, targetList); // Pass targetList
            }
        });

        closeExerciseModal(); // Close modal after adding all
    }

    // --- History Chart Functions (Updated for Search) ---
    function handleHistorySearchInput() {
        const searchTerm = historyExerciseSearchInput.value.toLowerCase().trim();
        const category = currentHistoryCategoryFilter; // Use state variable

        if (searchTerm.length < 1 && category === 'all') { // Hide if input is empty and category is 'all'
             historySearchResultsEl.style.display = 'none';
             return;
        }

        const filteredExercises = availableExercises.filter(ex => {
            const nameMatch = ex.name.toLowerCase().includes(searchTerm);
            const categoryMatch = category === 'all' || ex.category === category;
            return nameMatch && categoryMatch;
        });

        renderHistorySearchResults(filteredExercises);
    }

    function renderHistorySearchResults(results) {
        historySearchResultsEl.innerHTML = ''; // Clear previous results

        if (results.length === 0) {
            historySearchResultsEl.style.display = 'none'; // Hide if no results
            return;
        }

        results.forEach(ex => {
            const div = document.createElement('div');
            div.textContent = ex.name;
            div.dataset.exerciseId = ex.exercise_id;
            div.dataset.exerciseName = ex.name; // Store name for setting input later
            historySearchResultsEl.appendChild(div);
        });

        historySearchResultsEl.style.display = 'block'; // Show results list
    }

    function handleHistoryResultClick(event) {
        console.log("handleHistoryResultClick triggered. event.target:", event.target); // Log the actual element clicked

        // Check if the clicked element is a direct child div of the results list
        const clickedResultDiv = event.target.closest('#history-search-results > div');
        console.log("Closest result div found:", clickedResultDiv); // Log the result of closest()

        if (!clickedResultDiv) {
             console.log('Click was not on a result item.');
             return; // Click wasn't on a result div
        }

        // Use the found div (clickedResultDiv) to get data
        const selectedId = clickedResultDiv.dataset.exerciseId;
        const selectedName = clickedResultDiv.dataset.exerciseName;
        console.log(`Attempting to use ID=${selectedId}, Name=${selectedName}`); // Log the data extracted

        if (!selectedId || !selectedName) {
            console.error('Could not get exercise ID or name from clicked result div:', clickedResultDiv);
            // Clear button state if selection fails
            currentHistoryExerciseId = null;
            currentHistoryExerciseName = null;
            historyEditBtn.style.display = 'none';
            return; // Exit if data attributes are missing
        }

        console.log(`Result clicked and processed: ID=${selectedId}, Name=${selectedName}`); // Log successful processing before action

        historyExerciseSearchInput.value = selectedName; // Set input value to selection
        historySearchResultsEl.innerHTML = ''; // Clear results
        historySearchResultsEl.style.display = 'none'; // Hide results list

        fetchAndRenderHistoryChart(selectedId); // Fetch and render chart for the selected ID

        // Store selected exercise and show Edit button
        currentHistoryExerciseId = selectedId;
        currentHistoryExerciseName = selectedName;
        historyEditBtn.style.display = 'inline-block';
    }

    async function fetchAndRenderHistoryChart(exerciseId) { // Renamed function
        historyMessageEl.textContent = ''; // Clear previous messages

        if (!exerciseId) {
            historyMessageEl.textContent = 'Please select an exercise to view its history.';
            return;
        }

        historyMessageEl.textContent = 'Loading history...';

        try {
            const response = await fetch(`/api/workouts/exercises/${exerciseId}/history`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const historyData = await response.json();

            if (historyData.length === 0) {
                historyMessageEl.textContent = 'No logged history found for this exercise.';
                return;
            }

            // Process data for chart
            const labels = historyData.map(log => new Date(log.date_performed).toLocaleDateString());
            const volumes = historyData.map(log => {
                // Calculate volume (Sum of Weight * Reps for each set)
                if (!log.reps_completed || !log.weight_used) return 0;
                
                const repsArray = log.reps_completed.split(',').map(Number);
                const weightsArray = log.weight_used.split(',').map(Number);
                let totalVolume = 0;

                // Use the shorter length to avoid errors if arrays mismatch
                const numSets = Math.min(repsArray.length, weightsArray.length);

                for (let i = 0; i < numSets; i++) {
                    const reps = isNaN(repsArray[i]) ? 0 : repsArray[i];
                    const weight = isNaN(weightsArray[i]) ? 0 : weightsArray[i];
                    // Basic calculation: weight * reps. Ignores bodyweight sets for simplicity.
                    // Ignores unit conversion (kg/lbs) for now.
                    if (log.weight_unit !== 'bodyweight') {
                        totalVolume += weight * reps;
                    }
                }
                return totalVolume;
            });

            historyMessageEl.textContent = ''; // Clear loading message
            // Update chart label
            renderHistoryChart(labels, volumes, 'Volume (Weight * Reps)');

        } catch (error) {
            console.error('Error fetching or processing exercise history:', error);
            historyMessageEl.textContent = `Error loading history: ${error.message}`;
        }
    }

    function renderHistoryChart(labels, data, chartLabel = 'Volume') {
        if (!historyChartCanvas) return;
        const ctx = historyChartCanvas.getContext('2d');

        // Destroy existing chart before creating new one
        if (exerciseHistoryChart) {
            exerciseHistoryChart.destroy();
        }

        exerciseHistoryChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: chartLabel,
                    data: data,
                    borderColor: '#4CAF50', // Green line
                    backgroundColor: 'rgba(76, 175, 80, 0.1)', // Light green fill
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: chartLabel
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                     // Use locale string for better number formatting
                                     label += context.parsed.y.toLocaleString();
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    // --- History Edit Modal Functions (Renamed) ---
    function openHistoryEditModal() { // Renamed function
        if (!currentHistoryExerciseId || !currentHistoryExerciseName) {
            alert('Please select an exercise from the search first.');
            return;
        }

        // Pre-fill modal add section
        historyEditExerciseNameEl.textContent = currentHistoryExerciseName;
        historyEditExerciseIdInput.value = currentHistoryExerciseId;
        historyEditAddForm.reset(); // Clear previous add form entries
        historyEditDateInput.valueAsDate = new Date(); // Default to today

        // Reset and render initial set row for adding
        historyEditSets = [{ reps: '', weight: '', unit: 'kg' }]; // Renamed state var
        renderHistoryEditSets(); // Renamed render function

        // Fetch and display existing logs
        fetchAndRenderExistingLogs(currentHistoryExerciseId);

        historyEditModal.style.display = 'block'; // Use renamed modal ID
    }

    function renderHistoryEditSets() { // Renamed function
        historyEditSetsContainer.innerHTML = ''; // Use renamed container ref
        historyEditSets.forEach((set, index) => { // Use renamed state var
            // Generate HTML similar to generateSetRowsHtml, but simpler
            const setRow = document.createElement('div');
            setRow.className = 'set-row history-edit-set-row'; // Specific class
            setRow.dataset.setIndex = index;
            setRow.innerHTML = `
                <span class="set-number">${index + 1}</span>
                <!-- Weight input group first -->
                <div class="weight-input-group">
                    <input type="number" class="weight-input history-edit-weight" placeholder="Wt" value="${set.weight}" step="0.5">
                    <select class="unit-select history-edit-unit">
                        <option value="kg" ${set.unit === 'kg' ? 'selected' : ''}>kg</option>
                        <option value="lbs" ${set.unit === 'lbs' ? 'selected' : ''}>lbs</option>
                        <option value="bodyweight">bw</option>
                    </select>
                </div>
                <!-- Reps input second -->
                <input type="text" class="reps-input history-edit-reps" placeholder="Reps" value="${set.reps}">
             `; // No previous, no toggle
            historyEditSetsContainer.appendChild(setRow);
        });
        // Disable remove button if only one set left
        historyEditRemoveSetBtn.disabled = historyEditSets.length <= 1; // Use renamed button ref
    }

    function handleHistoryEditAddSet() { // Renamed function
        // --- Save current state from DOM before adding --- 
        const currentSetRows = historyEditSetsContainer.querySelectorAll('.set-row'); // Use renamed ref
        currentSetRows.forEach((row, index) => {
            if (historyEditSets[index]) { // Use renamed state var
                const weightInput = row.querySelector('.history-edit-weight');
                const repsInput = row.querySelector('.history-edit-reps');
                const unitSelect = row.querySelector('.history-edit-unit');
                historyEditSets[index].weight = weightInput ? weightInput.value : '';
                historyEditSets[index].reps = repsInput ? repsInput.value : '';
                historyEditSets[index].unit = unitSelect ? unitSelect.value : 'kg';
            }
        });
        // --- End save state ---

        historyEditSets.push({ reps: '', weight: '', unit: 'kg' }); // Use renamed state var
        renderHistoryEditSets(); // Renamed render function
    }

    function handleHistoryEditRemoveSet() { // Renamed function
        if (historyEditSets.length > 1) { // Use renamed state var
            historyEditSets.pop(); // Use renamed state var
            renderHistoryEditSets(); // Renamed render function
        }
    }

    async function handleHistoryEditAddSubmit(event) { // Renamed function
        event.preventDefault();
        console.log('Submitting new past log...');

        const logData = {
            exercise_id: parseInt(historyEditExerciseIdInput.value, 10),
            date_performed: historyEditDateInput.value,
            notes: historyEditNotesInput.value.trim()
        };

        // Collect data from dynamic set rows
        const setRows = historyEditSetsContainer.querySelectorAll('.set-row');

        let isValid = true;
        setRows.forEach((row, index) => {
            const repsInput = row.querySelector('.history-edit-reps');
            const weightInput = row.querySelector('.history-edit-weight');
            const unitSelect = row.querySelector('.history-edit-unit');

            const reps = repsInput.value.trim();
            const weight = weightInput.value.trim();
            const unit = unitSelect.value;

            // Basic validation per row
            if (reps === '' || weight === '') {
                isValid = false;
            }

            logData.reps_completed = reps || '0';
            logData.weight_used = weight || '0';
            logData.weight_unit = unit;
        });

        if (!isValid) {
            alert('Please fill in both weight and reps for all sets.');
            return;
        }

        console.log('New Past Log Data to Send:', logData);
        const submitButton = historyEditAddForm.querySelector('button[type="submit"]'); // Target correct form
        submitButton.disabled = true;
        submitButton.textContent = 'Saving...';

        try {
            const response = await fetch('/api/workouts/log/manual', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(logData)
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || `HTTP error! Status: ${response.status}`);
            }

            console.log('New past log saved:', result);
            // alert('Past log entry saved successfully!'); // Removed alert
            // Don't close modal, just refresh lists

            // Refresh the existing logs list in the modal
             fetchAndRenderExistingLogs(logData.exercise_id);
             // Refresh the history chart in the background
             fetchAndRenderHistoryChart(logData.exercise_id);
            // Clear the add form
             historyEditAddForm.reset();
             historyEditSets = [{ reps: '', weight: '', unit: 'kg' }];
             renderHistoryEditSets();
             historyEditDateInput.valueAsDate = new Date();

        } catch (error) {
            console.error('Error saving new past log:', error);
            alert(`Failed to save new past log: ${error.message}`);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Save Log Entry';
        }
    }

    // --- NEW: Fetch and render existing logs in the modal ---
    async function fetchAndRenderExistingLogs(exerciseId) {
        if (!exerciseId || !historyEditLogListEl) return;

        historyEditLogListEl.innerHTML = '<p>Loading existing logs...</p>';

        try {
            const response = await fetch(`/api/workouts/exercises/${exerciseId}/history`); // Reuse history route
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const logs = await response.json();

            historyEditLogListEl.innerHTML = ''; // Clear loading message
            if (logs.length === 0) {
                historyEditLogListEl.innerHTML = '<p>No past logs found for this exercise.</p>';
                return;
            }

            // Sort logs newest first for display
            logs.sort((a, b) => new Date(b.date_performed) - new Date(a.date_performed));

            logs.forEach(log => {
                const logItem = document.createElement('div');
                logItem.className = 'log-list-item';

                // Combine reps and weights for display
                 const repsArray = log.reps_completed ? log.reps_completed.split(',') : [];
                 const weightsArray = log.weight_used ? log.weight_used.split(',') : [];
                 const unit = log.weight_unit || 'kg';
                 let summary = repsArray.map((rep, index) => {
                     const weight = weightsArray[index] || '-';
                     return `${weight}${unit} x ${rep}`;
                 }).join(', ');

                logItem.innerHTML = `
                    <div class="log-item-details">
                        <span class="log-item-date">${new Date(log.date_performed).toLocaleDateString()}</span>
                        <span class="log-item-summary">${summary}</span>
                    </div>
                    <button class="btn-delete-log btn-danger btn-tiny" data-log-id="${log.workout_log_id}" title="Delete this log entry">&times;</button>
                `; // Assuming workout_log_id is unique identifier

                 // Add listener for delete button
                 logItem.querySelector('.btn-delete-log').addEventListener('click', handleDeleteExistingLog);

                historyEditLogListEl.appendChild(logItem);
            });

        } catch (error) {
            console.error('Error fetching existing logs:', error);
            historyEditLogListEl.innerHTML = '<p style="color: red;">Error loading logs.</p>';
        }
    }

    // --- NEW: Handle deleting an existing log entry ---
    async function handleDeleteExistingLog(event) {
        const button = event.target;
        const workoutLogId = button.dataset.logId;
        const exerciseId = historyEditExerciseIdInput.value; // Get current exercise ID

        if (!workoutLogId) {
            console.error('Missing log ID on delete button');
            return;
        }

        if (!confirm('Are you sure you want to permanently delete this log entry? This cannot be undone.')) {
            return;
        }

        console.log(`Attempting to delete workout log ID: ${workoutLogId}`);
        button.disabled = true; // Disable button during deletion

        try {
            // Need a backend route to delete a specific workout_log and its associated exercise_logs
            const response = await fetch(`/api/workouts/logs/${workoutLogId}`, { method: 'DELETE' });

            if (!response.ok) {
                 const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
                 throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Log deleted:', result);

            // Refresh the list in the modal
            fetchAndRenderExistingLogs(exerciseId);
            // Refresh the chart in the background
            fetchAndRenderHistoryChart(exerciseId);

        } catch (error) {
            console.error('Error deleting log:', error);
            alert(`Failed to delete log entry: ${error.message}`);
            button.disabled = false; // Re-enable button on error
        }

    }

    // --- NEW: Progress Photo Upload Handler ---
    async function handlePhotoUpload(event) {
        event.preventDefault(); // Prevent default form submission
        // Update references to point inside the modal
        const modalPhotoDateInput = document.getElementById('modal-photo-date');
        const modalPhotoUploadInput = document.getElementById('modal-photo-upload');
        const modalUploadStatusEl = photoUploadModal ? photoUploadModal.querySelector('#upload-status') : null;

        if (!modalUploadStatusEl || !modalPhotoDateInput || !modalPhotoUploadInput || !photoForm) return; // Ensure elements exist

        modalUploadStatusEl.textContent = 'Uploading...';

        const date = modalPhotoDateInput.value;
        const files = modalPhotoUploadInput.files;

        if (!date || files.length === 0) {
            modalUploadStatusEl.textContent = 'Please select a date and at least one photo.';
            modalUploadStatusEl.style.color = 'red';
            return;
        }

        const formData = new FormData();
        formData.append('date', date);
        for (let i = 0; i < files.length; i++) {
            formData.append('photos', files[i]);
        }

        console.log('Uploading photos for date:', date, 'Files:', files.length);
        const submitButton = photoForm.querySelector('button[type="submit"]');
        if(submitButton) submitButton.disabled = true;

        // ** Backend call **
        try {
            const response = await fetch('/api/workouts/progress-photos', {
                method: 'POST',
                body: formData // FormData handles headers automatically
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Upload successful:', result);
            modalUploadStatusEl.textContent = result.message || 'Upload successful!';
            modalUploadStatusEl.style.color = 'green';
            photoForm.reset();
            fetchAndDisplayPhotos(); // Refresh the gallery

            // Close modal after a short delay to show message
            setTimeout(closePhotoUploadModal, 1500);

        } catch (error) {
            console.error('Error uploading photos:', error);
            modalUploadStatusEl.textContent = `Upload failed: ${error.message}`;
            modalUploadStatusEl.style.color = 'red';
        } finally {
             if(submitButton) submitButton.disabled = false;
        }
    }
    // --- END NEW ---

    // --- NEW: Open/Close Photo Upload Modal Functions ---
    function openPhotoUploadModal() {
        if (photoUploadModal) {
            // Reset form and status message on open
            const form = photoUploadModal.querySelector('#progress-photo-form');
            const statusEl = photoUploadModal.querySelector('#upload-status');
            if(form) form.reset();
            if(statusEl) statusEl.textContent = '';

            photoUploadModal.style.display = 'block';
        }
    }

    function closePhotoUploadModal() {
        if (photoUploadModal) {
            photoUploadModal.style.display = 'none';
        }
    }
    // --- END NEW ---

    // --- NEW: Fetch and Display Photos Function (for Slider) ---
    async function fetchAndDisplayPhotos() {
        // Use the slider container elements, not the old galleryEl
        if (!currentPhotoDisplay || !currentPhotoDate || !photoPrevBtn || !photoNextBtn) return;

        currentPhotoDisplay.style.display = 'none'; // Hide image while loading
        currentPhotoDate.textContent = 'Loading photos...';
        photoPrevBtn.disabled = true;
        photoNextBtn.disabled = true;

        try {
            const response = await fetch('/api/workouts/progress-photos');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // Store fetched data in state
            progressPhotosData = await response.json(); // Expecting array like [{photo_id, date_taken, file_path, uploaded_at}]

            console.log('Fetched progress photos:', progressPhotosData); // DEBUG: Log fetched data

            if (progressPhotosData.length === 0) {
                currentPhotoDisplay.style.display = 'none';
                currentPhotoDate.textContent = 'No progress photos uploaded yet.';
                photoPrevBtn.disabled = true;
                photoNextBtn.disabled = true;
                return;
            }

            // Data is ready, display the first photo (most recent)
            currentPhotoIndex = 0;
            displayCurrentPhoto();

        } catch (error) {
            console.error('Error fetching photos:', error);
            currentPhotoDisplay.style.display = 'none';
            currentPhotoDate.textContent = `Error loading photos: ${error.message}`;
            currentPhotoDate.style.color = 'red';
            photoPrevBtn.disabled = true;
            photoNextBtn.disabled = true;
        }
    }
    // --- END NEW ---

    // --- NEW: Display Current Photo in Slider (Instant Update Sources Only) ---
    function displayCurrentPhoto() {
        if (!currentPhotoDisplay || !currentPhotoDate || !photoPrevBtn || !photoNextBtn || !deletePhotoBtn || !photoReel || !photoPrevPreview || !photoNextPreview) return;

        const numPhotos = progressPhotosData.length;
        let currentPhoto, prevPhoto, nextPhoto;

        // --- Handle Empty State --- 
        if (numPhotos === 0) {
            currentPhotoDisplay.style.display = 'none';
            photoPrevPreview.style.display = 'none';
            photoNextPreview.style.display = 'none';
            currentPhotoDate.textContent = 'No photos yet';
            photoPrevBtn.disabled = true;
            photoNextBtn.disabled = true;
            deletePhotoBtn.disabled = true;
            return;
        }

        // --- Ensure index is valid --- 
        if (currentPhotoIndex < 0 || currentPhotoIndex >= numPhotos) {
            console.error('Invalid photo index:', currentPhotoIndex);
            currentPhotoIndex = 0; // Reset to first photo
        }

        // --- Get Photos for Display --- 
        currentPhoto = progressPhotosData[currentPhotoIndex];
        prevPhoto = (currentPhotoIndex > 0) ? progressPhotosData[currentPhotoIndex - 1] : null;
        nextPhoto = (currentPhotoIndex < numPhotos - 1) ? progressPhotosData[currentPhotoIndex + 1] : null;

        // --- Update Image Sources & Visibility --- 
        console.log(`Setting sources: Prev=${prevPhoto?.file_path}, Current=${currentPhoto?.file_path}, Next=${nextPhoto?.file_path}`); // DEBUG
        
        // Current photo always visible (if one exists)
        currentPhotoDisplay.src = currentPhoto.file_path;
        currentPhotoDisplay.alt = `Progress photo from ${new Date(currentPhoto.date_taken + 'T00:00:00').toLocaleDateString()}`;
        currentPhotoDisplay.style.display = 'block'; 
        
        // Previous Preview
        if (prevPhoto) {
            photoPrevPreview.src = prevPhoto.file_path;
            photoPrevPreview.alt = `Preview: ${new Date(prevPhoto.date_taken + 'T00:00:00').toLocaleDateString()}`;
            photoPrevPreview.style.display = 'block'; // Make visible
        } else {
            photoPrevPreview.src = ''; // Clear src just in case
            photoPrevPreview.style.display = 'none'; // Hide element
        }
        
        // Next Preview
        if (nextPhoto) {
            photoNextPreview.src = nextPhoto.file_path;
            photoNextPreview.alt = nextPhoto ? `Preview: ${new Date(nextPhoto.date_taken + 'T00:00:00').toLocaleDateString()}` : '';
            photoNextPreview.style.display = 'block'; // Make visible
        } else {
            photoNextPreview.src = ''; // Clear src just in case
            photoNextPreview.style.display = 'none'; // Hide element
        }

        // --- Update Date Display --- 
        currentPhotoDate.textContent = `Date: ${new Date(currentPhoto.date_taken + 'T00:00:00').toLocaleDateString()}`;
        currentPhotoDate.style.color = '';

        // --- Update Button States --- 
        photoPrevBtn.disabled = !prevPhoto;
        photoNextBtn.disabled = !nextPhoto;
        deletePhotoBtn.disabled = false;

        // --- Reset Reel Position (No Transition) --- 
        // This reset now happens AFTER animation in the event listener
        /* 
        photoReel.style.transition = 'none'; // Disable transition temporarily
        photoReel.style.transform = 'translateX(-100%)'; // Reset to center instantly
        // Force reflow to ensure the reset applies before re-enabling transition
        photoReel.offsetHeight; 
        // Restore transition (removed timeout)
        photoReel.style.transition = 'transform 0.5s ease-in-out'; 
        */

        console.log(`Displayed photo index: ${currentPhotoIndex}, Path: ${currentPhoto.file_path}`);
    }
    // --- END NEW ---

    // --- Slider Navigation Functions (NO ANIMATION) ---
    function showPreviousPhoto() {
        console.log("Previous button clicked (no animation)");
        if (currentPhotoIndex > 0) {
            currentPhotoIndex--;
            displayCurrentPhoto(); // Update sources and display instantly
        }
    }

    function showNextPhoto() {
        console.log("Next button clicked (no animation)");
        if (currentPhotoIndex < progressPhotosData.length - 1) {
            currentPhotoIndex++;
            displayCurrentPhoto(); // Update sources and display instantly
        }
    }
    // --- END Slider Navigation Functions ---

    // --- NEW: Delete Photo Handler ---
    async function handleDeletePhoto() {
        if (!deletePhotoBtn || deletePhotoBtn.disabled) return;
        if (progressPhotosData.length === 0 || currentPhotoIndex < 0 || currentPhotoIndex >= progressPhotosData.length) {
            console.error('No photo selected or invalid index for deletion.');
            return;
        }

        const photoToDelete = progressPhotosData[currentPhotoIndex];
        const photoId = photoToDelete.photo_id;
        const photoDate = new Date(photoToDelete.date_taken + 'T00:00:00').toLocaleDateString();

        if (!confirm(`Are you sure you want to delete the photo from ${photoDate}? This cannot be undone.`)) {
            return;
        }

        console.log(`Attempting to delete photo ID: ${photoId}`);
        deletePhotoBtn.disabled = true; // Disable button during delete
        // Optionally show a status message
        // currentPhotoDate.textContent = 'Deleting...';

        try {
            const response = await fetch(`/api/workouts/progress-photos/${photoId}`, { method: 'DELETE' });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response'}));
                throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Photo deleted:', result);

            // Remove photo from local array
            progressPhotosData.splice(currentPhotoIndex, 1);

            // Adjust index if we deleted the last remaining photo or the last photo in the list
            if (progressPhotosData.length === 0) {
                currentPhotoIndex = 0; // Reset
            } else if (currentPhotoIndex >= progressPhotosData.length) {
                 // If we deleted the last one, move index back
                 currentPhotoIndex = progressPhotosData.length - 1;
            }
            // Else, the index remains the same, showing the *next* photo automatically

            // Refresh the display
            displayCurrentPhoto(); // This will handle the case of 0 photos left

        } catch (error) {
            console.error('Error deleting photo:', error);
            alert(`Failed to delete photo: ${error.message}`);
            // Re-enable button on error, maybe refresh state?
            deletePhotoBtn.disabled = false;
        }
    }
    // --- END NEW ---

    initialize(); // Run initialization
});
