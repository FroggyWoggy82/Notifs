document.addEventListener('DOMContentLoaded', function() {
    console.log('Workout Tracker JS loaded');

    // --- Debounce Helper ---
    function debounce(func, wait) {
        let timeout = null; // Initialize timeout as null
        // Add a unique identifier for each debounced function instance for clearer logging
        const debounceId = Math.random().toString(36).substring(2, 7);
        // console.log(`[Debounce ${debounceId}] Created for function: ${func.name || 'anonymous'}`); // Less verbose creation log

        return function executedFunction(...args) {
            const functionName = func.name || 'anonymous'; // Get function name for logs
            const context = this;
            console.log(`[Debounce ${debounceId} | ${functionName}] Event triggered. Current timeout: ${timeout !== null}`); // Log event trigger

            const later = () => {
                console.log(`[Debounce ${debounceId} | ${functionName}] -------> EXECUTING <-------`); // Clearer execution log
                timeout = null; // Reset timeout ID *before* executing
                func.apply(context, args); // Use apply to preserve context and arguments
            };

            // Log clearing existing timeout
            if (timeout) {
                console.log(`[Debounce ${debounceId} | ${functionName}] Clearing existing timeout ID: ${timeout}`);
                clearTimeout(timeout);
            }

            // Log setting new timeout
            timeout = setTimeout(later, wait);
            console.log(`[Debounce ${debounceId} | ${functionName}] Setting new timeout ID: ${timeout} for ${wait}ms`);
        };
    }
    const navigationDebounceTime = 100; // Milliseconds to wait

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
    const historyEditAddForm = document.getElementById('history-edit-form'); // Renamed form ref
    const historyEditExerciseNameEl = document.getElementById('history-edit-modal-title-name'); // Renamed element ref
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

    // --- NEW: Slider DOM References (Updated for Redesign) ---
    // const currentPhotoDisplay = document.getElementById('current-photo-display'); // Removed
    // const currentPhotoDate = document.getElementById('current-photo-date'); // Removed
    const photoPrevBtn = document.getElementById('photo-prev-btn');
    const photoNextBtn = document.getElementById('photo-next-btn');
    const deletePhotoBtn = document.getElementById('delete-photo-btn');
    const photoReel = document.querySelector('.photo-reel'); // Reel container
    const paginationDotsContainer = document.querySelector('.pagination-dots'); // Added
    const currentPhotoDateDisplay = document.getElementById('current-photo-date-display'); // NEW: Date display element
    // const photoPrevPreview = document.getElementById('photo-prev-preview'); // Removed
    // const photoNextPreview = document.getElementById('photo-next-preview'); // Removed
    console.log('photoNextBtn element:', photoNextBtn);

    // --- NEW: Get container for delegation ---
    const photoSliderContainer = document.querySelector('.photo-slider-container');

    // --- NEW: Comparison DOM References ---
    const comparisonPhotoSelect1 = document.getElementById('comparison-photo-select-1');
    const comparisonPhotoSelect2 = document.getElementById('comparison-photo-select-2');
    const comparisonImage1 = document.getElementById('comparison-image-1');
    const comparisonImage2 = document.getElementById('comparison-image-2');

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

            // --- Generate vertical exercise list HTML (Show up to 6) ---
            let exerciseListHtml = '<p class="no-exercises">No exercises defined</p>'; // Default message
            if (template.exercises && template.exercises.length > 0) {
                // Take the first 6 exercises
                exerciseListHtml = template.exercises
                    .slice(0, 6) // <<<< Changed from slice(0, 3)
                    .map(ex => `<div class="exercise-list-item">${escapeHtml(ex.name)}</div>`)
                    .join('');

                if (template.exercises.length > 6) { // <<<< Changed from > 3
                    exerciseListHtml += '<div class="exercise-list-item">...</div>'; // Add ellipsis if more exist
                }
            }
            // --- --- --- ---

            card.innerHTML = `
                <div class="card-corner-actions">
                    <button class="btn-edit-template" data-template-id="${template.workout_id}" title="Edit Template">&#9998;</button>
                    <button class="btn-delete-template" data-template-id="${template.workout_id}" title="Delete Template">&times;</button>
                </div>
                <h3>${escapeHtml(template.name)}</h3>
                ${template.description ? `<p class="template-description">${escapeHtml(template.description)}</p>` : ''}
                <div class="exercise-summary-vertical">
                    ${exerciseListHtml}
                </div>
                <div class="template-actions">
                   <button class="btn-start-template btn btn-primary btn-small">Start Workout</button>
                </div>
            `;
            templateListContainer.appendChild(card);

            // Add event listener for starting workout
            card.querySelector('.btn-start-template').addEventListener('click', (e) => {
                e.stopPropagation();
                startWorkoutFromTemplate(template.workout_id);
            });
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
        fetchAndDisplayPhotos(); // Fetch photos for the slider

        // Page switching listeners
        startEmptyWorkoutBtn?.addEventListener('click', startEmptyWorkout);

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
        addExerciseFab?.addEventListener('click', () => {
             // Determine context: Are we in active workout or template editor?
             const targetList = templateEditorPage?.classList.contains('active') ? 'editor' : 'active';
             console.log(`Opening exercise modal for target: ${targetList}`);
             // Temporarily store target context on the modal itself
             if (exerciseModal) exerciseModal.dataset.targetList = targetList;
             openExerciseModal();
        });
        closeExerciseModalBtn?.addEventListener('click', closeExerciseModal);
        exerciseModal?.addEventListener('click', (event) => { // Close on backdrop click
            if (event.target === exerciseModal) closeExerciseModal();
        });
        // Safely cast elements before adding listeners
        const searchInputEl = document.getElementById('exercise-search-input');
        const categoryFilterEl = document.getElementById('exercise-category-filter');
        const addSelectedBtnEl = document.getElementById('add-selected-exercises-btn');
        if (searchInputEl) searchInputEl.addEventListener('input', handleFilterChange);
        if (categoryFilterEl) categoryFilterEl.addEventListener('change', handleFilterChange);
        if (addSelectedBtnEl) addSelectedBtnEl.addEventListener('click', handleAddSelectedExercises);

        // Active workout listeners
        cancelWorkoutBtn?.addEventListener('click', handleCancelWorkout);
        completeWorkoutBtn?.addEventListener('click', handleCompleteWorkout);
        // Add listener for Add/Remove Set buttons using delegation
        currentExerciseListEl?.addEventListener('click', (event) => {
            const target = event.target;
            // Check if target is an HTMLElement and has classList before accessing it
            if (target instanceof HTMLElement) {
                if (target.classList.contains('btn-add-set')) {
                    handleAddSet(event);
                } else if (target.classList.contains('btn-remove-set')) {
                    handleRemoveSet(event);
                }
            }
        });

        // Template search listener
        const templateSearchInputEl = document.getElementById('template-search');
        if (templateSearchInputEl instanceof HTMLInputElement) {
            templateSearchInputEl.addEventListener('input', () => {
                const searchTerm = templateSearchInputEl.value.toLowerCase();
                const filtered = workoutTemplates.filter(t => t.name.toLowerCase().includes(searchTerm));
                renderWorkoutTemplates(filtered);
            });
        }

        // Template Editor
        templateEditorForm?.addEventListener('submit', handleSaveTemplate);
        templateCancelBtn?.addEventListener('click', () => switchPage('landing'));
        templateAddExerciseBtn?.addEventListener('click', () => {
             // Open modal specifically for adding to template
             if(exerciseModal) exerciseModal.dataset.targetList = 'editor';
             openExerciseModal();
        });

        // New Exercise Definition Listeners in Modal
        toggleDefineExerciseBtn?.addEventListener('click', handleToggleDefineExercise);
        saveNewExerciseBtn?.addEventListener('click', handleSaveNewExercise);

        // Use event delegation for delete/edit buttons on template list
        templateListContainer?.addEventListener('click', (event) => {
            const target = event.target;
            if (!(target instanceof HTMLElement)) return; // Ensure target is an element

            if (target.classList.contains('btn-delete-template')) {
                const templateIdStr = target.dataset.templateId;
                if(templateIdStr) {
                    const templateId = parseInt(templateIdStr);
                    if (!isNaN(templateId)) handleDeleteTemplate(templateId);
                }
            } else if (target.classList.contains('btn-edit-template')) {
                 const templateIdStr = target.dataset.templateId;
                 if(templateIdStr){
                     const templateId = parseInt(templateIdStr);
                     if (!isNaN(templateId)) {
                        const templateToEdit = workoutTemplates.find(t => t.workout_id === templateId);
                        if (templateToEdit) {
                            showTemplateEditor(templateToEdit);
                        } else {
                            console.error('Could not find template to edit with ID:', templateId);
                            alert('Error: Could not find template data to edit.');
                        }
                     }
                 }
            }
        });

        // History Search Listener
        const historySearchInputEl = document.getElementById('history-exercise-search');
        const historyResultsEl = document.getElementById('history-search-results');
        const historyCategorySelectEl = document.getElementById('history-category-filter-select');
        const historyEditButtonEl = document.getElementById('history-edit-btn'); // Get button element
        const historyMessageElement = document.getElementById('history-message'); // Get message element

        if (historySearchInputEl instanceof HTMLInputElement && historyResultsEl && historyCategorySelectEl) { // Check if elements exist and are correct type
             historySearchInputEl.addEventListener('input', handleHistorySearchInput);
             // Add listener to hide results when clicking outside
             document.addEventListener('click', (event) => {
                 if (historyResultsEl && // Check results element exists
                     !historySearchInputEl.contains(event.target) && // Check not clicking inside input
                     !historyResultsEl.contains(event.target)) { // Check not clicking inside results
                     historyResultsEl.style.display = 'none';
                 }
             });
            // Add focus listener to show results
             historySearchInputEl.addEventListener('focus', () => {
                 if (historySearchInputEl.value.trim() === '') {
                     handleHistorySearchInput(); // Re-trigger search on focus if empty
                 }
             });

            // Add listener for new category dropdown
            if (historyCategorySelectEl instanceof HTMLSelectElement) {
                historyCategorySelectEl.addEventListener('change', () => {
                    currentHistoryCategoryFilter = historyCategorySelectEl.value;
                    console.log('History category filter changed to:', currentHistoryCategoryFilter);
                    // Clear selected exercise and hide button when filter changes
                    currentHistoryExerciseId = null;
                    currentHistoryExerciseName = null;
                    if (historyEditButtonEl) historyEditButtonEl.style.display = 'none';
                    historySearchInputEl.value = ''; // Clear search input
                    if (exerciseHistoryChart) { // Clear chart
                         exerciseHistoryChart.destroy();
                         exerciseHistoryChart = null;
                    }
                    if(historyMessageElement) historyMessageElement.textContent = 'Select an exercise.';
                    // Re-filter search results based on new category
                    handleHistorySearchInput();
                 });
            }

            // Event delegation listener for results container
            historyResultsEl.addEventListener('click', (event) => {
                 const target = event.target;
                 if (!(target instanceof HTMLElement)) return;
                 const listItem = target.closest('.history-search-item'); // Find closest item

                 if (listItem instanceof HTMLElement && listItem.dataset.exerciseId) { // Check if listItem is element and has dataset
                     const exerciseId = parseInt(listItem.dataset.exerciseId);
                     if (!isNaN(exerciseId)) {
                         currentHistoryExerciseId = exerciseId;
                         currentHistoryExerciseName = listItem.dataset.exerciseName || 'Selected Exercise';
                         console.log(`History Exercise Selected: ID=${currentHistoryExerciseId}, Name=${currentHistoryExerciseName}`);
                         historySearchInputEl.value = currentHistoryExerciseName; // Fill input
                         historyResultsEl.style.display = 'none'; // Hide results
                         // Fetch and display history for the selected exercise
                         fetchAndDisplayHistory(currentHistoryExerciseId);
                         if(historyEditButtonEl) historyEditButtonEl.style.display = 'inline-block'; // Show edit button
                         if(historyMessageElement) historyMessageElement.textContent = ''; // Clear message
                     }
                 }
             });

            // History Edit Modal Trigger
            if(historyEditButtonEl) {
                historyEditButtonEl.addEventListener('click', showHistoryEditModal);
            } else {
                console.error("History Edit Button not found.");
            }
        } else {
            console.log('History search components not found on this page.');
        }

        // History Edit Modal - Save/Cancel/Add/Remove Set
        const historyEditModalEl = document.getElementById('history-edit-modal');
        const historyEditLogListContainer = document.getElementById('history-edit-log-list');
        const historyEditModalCloseBtn = historyEditModalEl?.querySelector('.close-button');
        historyEditModalCloseBtn?.addEventListener('click', hideHistoryEditModal); // Use moved function
        historyEditModalEl?.addEventListener('click', (event) => {
            if (event.target === historyEditModalEl) hideHistoryEditModal(); // Use moved function
        });
        historyEditAddForm?.addEventListener('submit', handleSaveManualLog); // Use moved function
        historyEditAddSetBtn?.addEventListener('click', handleAddManualSetRow); // Use moved function
        historyEditRemoveSetBtn?.addEventListener('click', handleRemoveManualSetRow); // Use moved function
        // Delegate log deletion within the list
        historyEditLogListContainer?.addEventListener('click', (event) => {
            const target = event.target;
            // Updated class name check
            if (target instanceof HTMLElement && target.classList.contains('btn-delete-log-entry')) {
                const logIdStr = target.dataset.logId;
                 if (logIdStr && confirm('Are you sure you want to delete this log entry? This cannot be undone.')) {
                     const logId = parseInt(logIdStr);
                     if (!isNaN(logId)) handleDeleteLogEntry(logId); // Use moved function
                 }
            }
        });


        // --- PROGRESS PHOTOS ---
        const photoUploadModalEl = document.getElementById('photo-upload-modal');
        const photoModalCloseButton = photoUploadModalEl?.querySelector('.close-button');
        const photoFormEl = document.getElementById('progress-photo-form');
        const photoDateInputEl = document.getElementById('photo-date')
        const uploadStatusElement = document.getElementById('upload-status');
        const photoUploadInputElement = document.getElementById('photo-upload');

        // Open Modal Listener
        addPhotoBtn?.addEventListener('click', () => {
            if (photoUploadModalEl) {
                 // Reset form fields when opening
                 if (photoFormEl instanceof HTMLFormElement) photoFormEl.reset();
                 if (photoDateInputEl instanceof HTMLInputElement) {
                     photoDateInputEl.value = new Date().toISOString().split('T')[0]; // Set default date to today
                 }
                 if (uploadStatusElement) uploadStatusElement.textContent = ''
                 if (uploadStatusElement) uploadStatusElement.className = '';
                 if (photoUploadInputElement instanceof HTMLInputElement) {
                     photoUploadInputElement.value = ''; // Clear file selection
                 }
                 photoUploadModalEl.style.display = 'block';
            } else {
                 console.error('Photo upload modal not found!');
            }
        });

        // Close Modal Listener
        photoModalCloseButton?.addEventListener('click', () => {
            if (photoUploadModalEl) photoUploadModalEl.style.display = 'none';
        });
        photoUploadModalEl?.addEventListener('click', (event) => { // Close on backdrop click
            if (event.target === photoUploadModalEl) {
                if (photoUploadModalEl) photoUploadModalEl.style.display = 'none';
            }
        });

        // Form Submission Listener
        if (photoFormEl) photoFormEl.addEventListener('submit', handlePhotoUpload);

        // --- NEW: Event Delegation for Slider Buttons ---
        if (photoSliderContainer) {
            console.log('[Initialize] Attaching DELEGATED listener to photoSliderContainer');
            // Create debounced functions once - REMOVED
            // const debouncedShowPrevious = debounce(showPreviousPhoto, navigationDebounceTime);
            // const debouncedShowNext = debounce(showNextPhoto, navigationDebounceTime);

            photoSliderContainer.addEventListener('click', (event) => {
                // We already have references to photoPrevBtn and photoNextBtn from initialize
                if (!photoPrevBtn || !photoNextBtn) {
                    console.error("[Delegated Click] Button references are missing!");
                    return;
                }

                const clickX = event.clientX;
                const clickY = event.clientY;
                // console.log(`[Delegated Click] Coords: X=${clickX}, Y=${clickY}`); // REMOVED DEBUG LOG

                // Get button boundaries
                const prevBtnRect = photoPrevBtn.getBoundingClientRect();
                const nextBtnRect = photoNextBtn.getBoundingClientRect();

                // Check if click is within Previous Button bounds
                if (
                    clickX >= prevBtnRect.left &&
                    clickX <= prevBtnRect.right &&
                    clickY >= prevBtnRect.top &&
                    clickY <= prevBtnRect.bottom
                ) {
                    // console.log('[Delegated Click] Click coordinates are within Previous Button bounds.'); // REMOVED DEBUG LOG
                    if (!photoPrevBtn.disabled) {
                        // console.log('[Delegated Click] Previous button is enabled. Calling DIRECT function...'); // REMOVED DEBUG LOG
                        showPreviousPhoto();
                    } else {
                        // console.log('[Delegated Click] Previous button is disabled.'); // REMOVED DEBUG LOG
                    }
                    return; // Click handled (or ignored due to disabled state)
                }

                // Check if click is within Next Button bounds
                if (
                    clickX >= nextBtnRect.left &&
                    clickX <= nextBtnRect.right &&
                    clickY >= nextBtnRect.top &&
                    clickY <= nextBtnRect.bottom
                ) {
                    // console.log('[Delegated Click] Click coordinates are within Next Button bounds.'); // REMOVED DEBUG LOG
                    if (!photoNextBtn.disabled) {
                        // console.log('[Delegated Click] Next button is enabled. Calling DIRECT function...'); // REMOVED DEBUG LOG
                        showNextPhoto();
                    } else {
                        // console.log('[Delegated Click] Next button is disabled.'); // REMOVED DEBUG LOG
                    }
                    return; // Click handled (or ignored due to disabled state)
                }

                // If the code reaches here, the click was outside both button bounds
                // console.log('[Delegated Click] Click coordinates were outside known button bounds. Target was:', event.target); // REMOVED DEBUG LOG

            });
        } else {
            console.error('[Initialize] photoSliderContainer not found for delegation!');
        }

        // Delete Photo Listener (Keep this direct)
        if (deletePhotoBtn) {
            deletePhotoBtn.addEventListener('click', handleDeletePhoto);
        } else {
             console.error('[Initialize] deletePhotoBtn not found!');
        }

        // Comparison Select Listeners
        const compSelect1 = document.getElementById('comparison-photo-select-1');
        const compSelect2 = document.getElementById('comparison-photo-select-2');
        if (compSelect1 && compSelect2) {
            compSelect1.addEventListener('change', updateComparisonImages);
            compSelect2.addEventListener('change', updateComparisonImages);
        } else {
             console.warn('[Initialize] Comparison select elements not found.');
        }

        // Set initial state
        switchPage('landing');
        // Render empty lists initially if needed (e.g., if API fetch fails)
        if (!workoutTemplates.length && templateListContainer) renderWorkoutTemplates();
        if (!availableExercises.length && availableExerciseListEl) renderAvailableExercises(); // Check for availableExerciseListEl existence

        // REMOVED setTimeout block
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
        console.log(`[DEBUG] fetchAndRenderHistoryChart called for ID: ${exerciseId}`); // <<< Log function call

        if (!exerciseId) {
            historyMessageEl.textContent = 'Please select an exercise to view its history.';
            console.warn("[DEBUG] fetchAndRenderHistoryChart - No exercise ID provided."); // <<< Log warning
            return;
        }

        historyMessageEl.textContent = 'Loading history...';

        try {
            const response = await fetch(`/api/workouts/exercises/${exerciseId}/history`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const historyData = await response.json();
            console.log("[DEBUG] Raw History Data Received:", JSON.stringify(historyData)); // <<< Log raw data

            if (historyData.length === 0) {
                historyMessageEl.textContent = 'No logged history found for this exercise.';
                 if (exerciseHistoryChart) { // Clear chart if no data
                     exerciseHistoryChart.destroy();
                     exerciseHistoryChart = null;
                 }
                return;
            }

            // Process data for chart
            const labels = historyData.map(log => new Date(log.date_performed).toLocaleDateString());
            const volumes = historyData.map((log, index) => { // <<< Add index for logging
                // Calculate volume (Sum of Weight * Reps for each set)
                if (!log.reps_completed || !log.weight_used) {
                    console.warn(`[DEBUG] Log index ${index} missing reps/weight:`, log); // <<< Log problematic log
                    return 0;
                }

                const repsArray = log.reps_completed.split(',').map(Number);
                const weightsArray = log.weight_used.split(',').map(Number);
                let totalVolume = 0;

                const numSets = Math.min(repsArray.length, weightsArray.length);
                 if (repsArray.length !== weightsArray.length) {
                     console.warn(`[DEBUG] Log index ${index} has mismatched reps (${repsArray.length}) and weights (${weightsArray.length}):`, log); // <<< Log mismatch
                 }

                for (let i = 0; i < numSets; i++) {
                    const reps = repsArray[i];
                    const weight = weightsArray[i];
                    // Check for NaN
                    if (isNaN(reps) || isNaN(weight)) {
                         console.warn(`[DEBUG] Log index ${index}, Set ${i + 1} has NaN reps (${repsArray[i]}) or weight (${weightsArray[i]}):`, log); // <<< Log NaN issues
                         continue; // Skip this set in calculation
                    }

                    if (log.weight_unit !== 'bodyweight') {
                        totalVolume += weight * reps;
                    }
                }
                 console.log(`[DEBUG] Log index ${index} calculated volume: ${totalVolume}`); // <<< Log calculated volume
                return totalVolume;
            });

            historyMessageEl.textContent = ''; // Clear loading message
            console.log("[DEBUG] Data for Chart - Labels:", labels); // <<< Log chart labels
            console.log("[DEBUG] Data for Chart - Volumes:", volumes); // <<< Log chart volumes
            renderHistoryChart(labels, volumes, 'Volume (Weight * Reps)');

        } catch (error) {
            console.error('[DEBUG] Error fetching or processing exercise history:', error); // <<< Log full error
            historyMessageEl.textContent = `Error loading history: ${error.message}`;
             if (exerciseHistoryChart) { // Clear chart on error
                 exerciseHistoryChart.destroy();
                 exerciseHistoryChart = null;
            }
        }
    }

    function renderHistoryChart(labels, data, chartLabel = 'Volume') {
        if (!historyChartCanvas) return;
        const ctx = historyChartCanvas.getContext('2d');
        console.log("[DEBUG] Rendering chart with Labels:", labels, "Data:", data); // <<< Log data before rendering

        // Destroy existing chart before creating new one
        if (exerciseHistoryChart) {
            console.log("[DEBUG] Destroying existing chart instance."); // <<< Log destruction
            exerciseHistoryChart.destroy();
             exerciseHistoryChart = null; // Explicitly nullify
        } else {
             console.log("[DEBUG] No existing chart instance to destroy.");
        }


        try { // <<< Add try-catch around chart creation
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
             console.log("[DEBUG] Chart instance created successfully."); // <<< Log success
        } catch (chartError) {
             console.error("[DEBUG] Error creating Chart.js instance:", chartError); // <<< Log chart creation errors
             historyMessageEl.textContent = `Error rendering chart: ${chartError.message}`;
        }
    }

    // --- History Edit Modal Functions (Renamed & Moved Before Initialize) ---
    function showHistoryEditModal() { // Renamed function & Moved Up
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

    // Moved Up
    function hideHistoryEditModal() {
        if(historyEditModal) historyEditModal.style.display = 'none';
    }


    // Moved Up
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

    // Moved Up
    function handleAddManualSetRow() { // Renamed function
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

    // Moved Up
    function handleRemoveManualSetRow() { // Renamed function
        if (historyEditSets.length > 1) { // Use renamed state var
            historyEditSets.pop(); // Use renamed state var
            renderHistoryEditSets(); // Renamed render function
        }
    }

     // Moved Up - Renamed from handleHistoryEditAddSubmit
    async function handleSaveManualLog(event) {
        // ---> ADD Log at start of handler <---
        console.log("[DEBUG] handleSaveManualLog function STARTED."); // <<< ADDED
        event.preventDefault(); // Keep this line
        console.log('Submitting new past log...'); // <<< Existing log (keep)

        const logData = {
            exercise_id: parseInt(historyEditExerciseIdInput.value, 10),
            date_performed: historyEditDateInput.value,
            notes: historyEditNotesInput.value.trim()
        };

        // Collect data from dynamic set rows
        const setRows = historyEditSetsContainer.querySelectorAll('.set-row');

        let repsCompletedArray = []; // <<< Initialize arrays
        let weightUsedArray = []; // <<< Initialize arrays
        let weightUnit = 'kg'; // <<< Initialize default unit

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
                console.warn(`Set ${index + 1} is missing reps or weight.`); // <<< Log missing data
                isValid = false;
            }

            repsCompletedArray.push(reps || '0'); // <<< Push to array
            weightUsedArray.push(weight || '0'); // <<< Push to array
            if (index === 0) weightUnit = unit; // <<< Capture unit from first set
        });

        // Assign collected arrays to logData AFTER the loop
        logData.reps_completed = repsCompletedArray.join(',');
        logData.weight_used = weightUsedArray.join(',');
        logData.weight_unit = weightUnit;


        if (!isValid) {
            alert('Please fill in both weight and reps for all sets.');
            return;
        }

        console.log('[DEBUG] New Past Log Data to Send:', JSON.stringify(logData)); // <<< MODIFIED: Log data clearly
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
                console.error("[DEBUG] Save Error Response:", result); // <<< Log error response
                throw new Error(result.error || `HTTP error! Status: ${response.status}`);
            }

            console.log('New past log saved:', result);

            // Refresh the existing logs list in the modal
             fetchAndRenderExistingLogs(logData.exercise_id);
             // Refresh the history chart in the background
             console.log(`[DEBUG] Triggering chart refresh for exercise ID: ${logData.exercise_id}`); // <<< Log before chart refresh
             fetchAndRenderHistoryChart(logData.exercise_id);
            // Clear the add form
             historyEditAddForm.reset();
             historyEditSets = [{ reps: '', weight: '', unit: 'kg' }];
             renderHistoryEditSets();
             historyEditDateInput.valueAsDate = new Date();

        } catch (error) {
            console.error('[DEBUG] Error saving new past log:', error); // <<< Log full error
            alert(`Failed to save new past log: ${error.message}`);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Save Log Entry';
        }
    }


    // Moved Up
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
                    <button class="btn-delete-log-entry btn-danger btn-tiny" data-log-id="${log.workout_log_id}" title="Delete this log entry">&times;</button>
                `; // Renamed delete button class

                historyEditLogListEl.appendChild(logItem);
            });

        } catch (error) {
            console.error('Error fetching existing logs:', error);
            historyEditLogListEl.innerHTML = '<p style="color: red;">Error loading logs.</p>';
        }
    }

     // Moved Up - Renamed from handleDeleteExistingLog
    async function handleDeleteLogEntry(logId) {
        // const button = event.target; // No event passed
        // const workoutLogId = button.dataset.logId; // Passed directly
        const exerciseId = historyEditExerciseIdInput.value; // Get current exercise ID

        if (!logId) {
            console.error('handleDeleteLogEntry called without log ID');
            return;
        }

        // Confirmation is handled before calling this function now

        console.log(`Attempting to delete workout log ID: ${logId}`);
        // Disable button? Hard to do without the event target.

        try {
            // Need a backend route to delete a specific workout_log and its associated exercise_logs
            const response = await fetch(`/api/workouts/logs/${logId}`, { method: 'DELETE' });

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
            // button.disabled = false; // Re-enable button on error
        }

    }
    // --- End History Edit Modal Functions ---

    // --- NEW: Progress Photo Upload Handler ---
    async function handlePhotoUpload(event) {
        event.preventDefault();
        console.log('[Photo Upload Client] handlePhotoUpload triggered.'); // Log function start

        const form = event.target;
        const formData = new FormData(form);
        const statusElement = document.getElementById('upload-status');
        const modal = document.getElementById('photo-upload-modal');
        const submitButton = form.querySelector('button[type="submit"]');

        // Ensure files exist
        const files = formData.getAll('photos');
        if (!files || files.length === 0) {
            statusElement.textContent = 'Please select at least one photo.';
            statusElement.style.color = 'orange';
            console.warn('[Photo Upload Client] No files selected.');
            return;
        }
        console.log(`[Photo Upload Client] Found ${files.length} file(s) in form data.`);

        statusElement.textContent = 'Uploading...';
        statusElement.style.color = '#03dac6'; // Teal accent
        submitButton.disabled = true; // Disable button during upload

        console.log('[Photo Upload Client] About to initiate fetch to /api/workouts/progress-photos'); // Log before fetch
        let response;
        try {
            response = await fetch('/api/workouts/progress-photos', {
                method: 'POST',
                body: formData, // FormData handles headers automatically
                // headers: { 'Content-Type': 'multipart/form-data' }, // Don't set Content-Type manually with FormData
            });

            console.log(`[Photo Upload Client] Fetch promise resolved. Status: ${response.status}, StatusText: ${response.statusText}, OK: ${response.ok}`); // Log immediately after fetch resolves

            if (!response.ok) {
                // Attempt to get error details from response body
                let errorData = { error: `HTTP error! Status: ${response.status} ${response.statusText}` }; // Default error
                try {
                    const text = await response.text(); // Read raw text first
                    console.log(`[Photo Upload Client] Raw error response text: ${text}`);
                    errorData = JSON.parse(text); // Try parsing as JSON
                    console.log('[Photo Upload Client] Parsed JSON error response:', errorData);
                } catch (parseError) {
                    console.error('[Photo Upload Client] Failed to parse error response as JSON:', parseError);
                    // Keep the default HTTP error message in errorData
                }
                // Throw an error object to be caught below
                const error = new Error(errorData.error || `HTTP error ${response.status}`);
                error.status = response.status;
                error.data = errorData;
                throw error;
            }

            // If response IS ok
            const result = await response.json();
            console.log('[Photo Upload Client] Upload successful:', result);
            statusElement.textContent = result.message || 'Upload successful!';
            statusElement.style.color = '#4CAF50'; // Green
            form.reset();
            fetchAndDisplayPhotos(); // Refresh the gallery

            // Close modal after a short delay
            setTimeout(() => {
                modal.style.display = 'none';
                statusElement.textContent = ''; // Clear status on close
            }, 1500);

        } catch (error) {
            console.error('[Photo Upload Client] Error during photo upload fetch/processing:', error);
            console.error('[Photo Upload Client] Error Name:', error.name);
            console.error('[Photo Upload Client] Error Message:', error.message);
            if (error.stack) {
                 console.error('[Photo Upload Client] Error Stack:', error.stack);
            }
            if (error.status) {
                console.error('[Photo Upload Client] Error Status:', error.status);
            }
             if (error.data) {
                console.error('[Photo Upload Client] Error Data:', error.data);
             }

            statusElement.textContent = `Error: ${error.message || 'Upload failed. Please try again.'}`;
            statusElement.style.color = '#f44336'; // Red
            // Keep modal open on error

        } finally {
            submitButton.disabled = false; // Re-enable button
            console.log('[Photo Upload Client] handlePhotoUpload finished (finally block).');
        }
    }
    // --- END NEW ---

    // --- NEW: Open/Close Photo Upload Modal Functions ---
    function openPhotoUploadModal() {
        if (photoUploadModal) {
            // Reset form and status message on open
            const form = photoUploadModal.querySelector('#progress-photo-form');
            const statusEl = photoUploadModal.querySelector('#upload-status');
            // Changed IDs for modal inputs
            const modalDateInput = photoUploadModal.querySelector('#modal-photo-date');
            const modalFileInput = photoUploadModal.querySelector('#modal-photo-upload');

            if(form) form.reset();
            if(statusEl) statusEl.textContent = '';
            if (modalDateInput) modalDateInput.value = new Date().toISOString().split('T')[0]; // Default date
            if (modalFileInput) modalFileInput.value = ''; // Clear file selection


            photoUploadModal.style.display = 'block';
        }
    }

    function closePhotoUploadModal() {
        if (photoUploadModal) {
            photoUploadModal.style.display = 'none';
        }
    }
    // --- END NEW ---

    // --- NEW: Fetch and Display Photos Function (Redesigned for Carousel) ---
    async function fetchAndDisplayPhotos() {
        console.log('[Photo Load] fetchAndDisplayPhotos STARTED.'); // Log start
        // Use the slider container elements, not the old galleryEl
        // if (!currentPhotoDisplay || !currentPhotoDate || !photoPrevBtn || !photoNextBtn) return; // Updated condition
        if (!photoReel || !paginationDotsContainer || !photoPrevBtn || !photoNextBtn || !deletePhotoBtn) {
            console.error("[Photo Load] Missing required slider elements (reel, dots container, nav buttons, delete button).");
            return;
        }

        console.log('[Photo Load] Setting loading state...'); // Log before UI update
        // currentPhotoDisplay.style.display = 'none'; // Hide image while loading
        // currentPhotoDate.textContent = 'Loading photos...';
        photoReel.innerHTML = '<p>Loading photos...</p>'; // Show loading in reel
        paginationDotsContainer.innerHTML = ''; // Clear dots
        photoPrevBtn.disabled = true;
        photoNextBtn.disabled = true;
        deletePhotoBtn.disabled = true;

        try {
            console.log('[Photo Load] Fetching photos from API...'); // Log before fetch
            const response = await fetch('/api/workouts/progress-photos');
            console.log(`[Photo Load] API Response Status: ${response.status}`); // Log status
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // Store fetched data in state
            progressPhotosData = await response.json(); // Expecting array like [{photo_id, date_taken, file_path, uploaded_at}]

            console.log(`[Photo Load] Fetched progress photos count: ${progressPhotosData.length}`);

            // --- Populate Comparison Dropdowns --- (Keep this)
            populateComparisonDropdowns();

            console.log('[Photo Load] Clearing loading message from photoReel...'); // Log before clearing
            photoReel.innerHTML = ''; // Clear loading message

            if (progressPhotosData.length === 0) {
                console.log('[Photo Load] No photos found. Displaying empty message.'); // Log empty case
                // currentPhotoDisplay.style.display = 'none';
                // currentPhotoDate.textContent = 'No progress photos uploaded yet.';
                photoReel.innerHTML = '<p>No progress photos uploaded yet.</p>';
                photoPrevBtn.disabled = true;
                photoNextBtn.disabled = true;
                deletePhotoBtn.disabled = true;
                 // Ensure date display is also cleared
                 if (currentPhotoDateDisplay) currentPhotoDateDisplay.textContent = '';
                return; // Exit early if no photos
            }

            // --- Populate the Reel and Dots --- 
            console.log('[Photo Load] Populating photo reel and pagination dots...'); // Log before loop
            progressPhotosData.forEach((photo, index) => {
                // Add Image to Reel
                const img = document.createElement('img');
                img.src = photo.file_path;
                img.alt = `Progress photo from ${new Date(photo.date_taken + 'T00:00:00').toLocaleDateString()} (ID: ${photo.photo_id})`;
                img.dataset.photoId = photo.photo_id; // Store ID if needed
                photoReel.appendChild(img);

                // Add Dot to Pagination
                const dot = document.createElement('span');
                dot.classList.add('dot');
                dot.dataset.index = String(index); // Use String() explicitly
                // === START Add check for listener ===
                if (!dot.dataset.listenerAdded) { // Check if listener already added
                    // Apply debounce to dot clicks
                    const debouncedGoToPhoto = debounce(() => goToPhoto(index), navigationDebounceTime); // Store debounced func
                    dot.addEventListener('click', () => { // Add raw click log
                        console.log(`[Raw Click] Dot ${index} clicked.`);
                        debouncedGoToPhoto(); // Call the debounced function
                    });
                    dot.dataset.listenerAdded = 'true'; // Mark as added
                    console.log(`[Photo Init] Added DEBOUNCED dot listener for index ${index}`);
                } else {
                     console.warn(`[Photo Init] Dot listener ALREADY ADDED for index ${index}`);
                }
                 // === END Add check for listener ===
                paginationDotsContainer.appendChild(dot);
            });

            // Data is ready, display the first photo (most recent)
            currentPhotoIndex = 0;
            console.log('[Photo Load] Calling displayCurrentPhoto() to show first image...'); // Log before display call
            displayCurrentPhoto(); // Initial display

        } catch (error) {
            console.error('[Photo Load] Error fetching or processing photos:', error);
            // currentPhotoDisplay.style.display = 'none';
            // currentPhotoDate.textContent = `Error loading photos: ${error.message}`; // Removed
            // currentPhotoDate.style.color = 'red'; // Removed
            photoReel.innerHTML = `<p style="color: red;">Error loading photos: ${error.message}</p>`;
            photoPrevBtn.disabled = true;
            photoNextBtn.disabled = true;
            deletePhotoBtn.disabled = true;
             // Ensure date display is also cleared on error
            if (currentPhotoDateDisplay) currentPhotoDateDisplay.textContent = '';
        } finally {
            console.log('[Photo Load] fetchAndDisplayPhotos FINISHED.'); // Log finish
        }
    }
    // --- END NEW ---

    // --- NEW: Display Current Photo in Slider (Redesigned for Carousel) ---
    function displayCurrentPhoto() {
        const startTime = performance.now(); // Start timer
        const numPhotos = progressPhotosData.length;
        console.log(`[Photo Display] Displaying photo index: ${currentPhotoIndex} (Total: ${numPhotos})`);

        // NEW: Find the date display element
        const dateDisplayEl = currentPhotoDateDisplay; // Use the reference

        if (numPhotos === 0 || !photoReel || !paginationDotsContainer || !dateDisplayEl) {
            console.warn('[Photo Display] No photos or required elements found (reel, dots, date display).');
            if (dateDisplayEl) dateDisplayEl.textContent = ''; // Clear date if no photos
            return; // Nothing to display
        }

        // Ensure index is valid (looping can be added later if desired)
        if (currentPhotoIndex < 0) currentPhotoIndex = 0;
        if (currentPhotoIndex >= numPhotos) currentPhotoIndex = numPhotos - 1;

        // --- Get Current Photo Data and Format Date ---
        const currentPhoto = progressPhotosData[currentPhotoIndex];
        let formattedDate = '';
        if (currentPhoto && currentPhoto.date_taken) {
            // Assuming date_taken is 'YYYY-MM-DD'. Adding T00:00:00 ensures it's treated as local time.
            formattedDate = new Date(currentPhoto.date_taken + 'T00:00:00').toLocaleDateString(undefined, {
                year: 'numeric', month: 'long', day: 'numeric'
            });
        }
        dateDisplayEl.textContent = formattedDate; // Update the date display

        // --- Update Reel Position --- 
        const offset = currentPhotoIndex * -100; // Calculate percentage offset
        photoReel.style.transform = `translateX(${offset}%)`;

        // --- Update Pagination Dots --- 
        const dots = paginationDotsContainer.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentPhotoIndex);
        });

        // --- Update Button States --- 
        // Buttons are now enabled/disabled directly in the calling functions
        photoPrevBtn.disabled = (currentPhotoIndex === 0);
        photoNextBtn.disabled = (currentPhotoIndex >= numPhotos - 1);
        deletePhotoBtn.disabled = (numPhotos === 0); // Disable delete only if no photos

        console.log(`[Photo Display] Reel transform set to: translateX(${offset}%)`);
        const endTime = performance.now(); // End timer
        console.log(`[Photo Display] displayCurrentPhoto execution time: ${(endTime - startTime).toFixed(2)} ms`); // Log duration
    }
    // --- END NEW ---

    // --- Slider Navigation Functions (Updated for Redesign, NO ANIMATION) ---
    // let isAnimating = false; // Flag to prevent clicks during animation - REMOVED
    // const animationDuration = 500; // Must match CSS transition duration - REMOVED

    function showPreviousPhoto() {
        console.log('[Photo Slider] Attempting Previous...');
        // if (isAnimating || currentPhotoIndex <= 0) { - REMOVED animation check
        if (currentPhotoIndex <= 0) { // Block only if at first photo
            console.log(`[Photo Slider] Previous blocked: At index 0.`); // More specific log
            return;
        }

        // isAnimating = true; - REMOVED
        // photoPrevBtn.disabled = true; // Disable immediately - REMOVED
        // photoNextBtn.disabled = true; - REMOVED

        currentPhotoIndex--;
        console.log(`[Photo Slider] Index decremented to: ${currentPhotoIndex}`); // Log index change
        console.log(`[Photo Slider] Prev Button disabled state BEFORE displayCurrentPhoto: ${photoPrevBtn?.disabled}`); // Log button state
        displayCurrentPhoto(); // Directly update display

        // Re-enable buttons after animation duration - REMOVED setTimeout block
        console.log('[Photo Slider] Previous action complete.');
    }

    function showNextPhoto() {
        console.log('[Photo Slider] Attempting Next...');
        const numPhotos = progressPhotosData.length;
        // if (isAnimating || currentPhotoIndex >= numPhotos - 1) { - REMOVED animation check
        if (currentPhotoIndex >= numPhotos - 1) { // Block only if at last photo
            console.log(`[Photo Slider] Next blocked: At index ${currentPhotoIndex} (Total: ${numPhotos}).`); // More specific log
            return;
        }

        // isAnimating = true; - REMOVED
        // photoPrevBtn.disabled = true; // Disable immediately - REMOVED
        // photoNextBtn.disabled = true; - REMOVED

        currentPhotoIndex++;
        console.log(`[Photo Slider] Index incremented to: ${currentPhotoIndex}`); // Log index change
        console.log(`[Photo Slider] Next Button disabled state BEFORE displayCurrentPhoto: ${photoNextBtn?.disabled}`); // Log button state
        displayCurrentPhoto(); // Directly update display

        // Re-enable buttons after animation duration - REMOVED setTimeout block
        console.log('[Photo Slider] Next action complete.');
    }

    // --- NEW: Go To Specific Photo (for dots) ---
    function goToPhoto(index) {
        console.log(`[Photo Slider] Go to photo index: ${index}`);
        const numPhotos = progressPhotosData.length;
        // Prevent jump if animating or index is same/invalid - REMOVED animation check
        if (/*isAnimating ||*/ index === currentPhotoIndex || index < 0 || index >= numPhotos) {
            console.log(`[Photo Slider] Dot click blocked: index=${index}, currentIndex=${currentPhotoIndex}`);
            return;
        }

        // isAnimating = true; - REMOVED
        // photoPrevBtn.disabled = true; // Disable nav buttons - REMOVED
        // photoNextBtn.disabled = true; - REMOVED

        currentPhotoIndex = index;
        displayCurrentPhoto(); // Directly update display

        // Re-enable buttons after animation - REMOVED setTimeout block
        console.log(`[Photo Slider] Dot action complete.`);
    }
    // --- END NEW ---

    // --- NEW: Delete Photo Handler (Updated for Redesign) ---
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

        console.log(`[Photo Delete] Attempting to delete photo ID: ${photoId}`);
        deletePhotoBtn.disabled = true; // Disable button during delete

        try {
            const response = await fetch(`/api/workouts/progress-photos/${photoId}`, { method: 'DELETE' });

            if (!response.ok) {
                // ... (existing error handling) ...
                throw new Error(errorMsg);
            }

            const result = await response.json();
            console.log('[Photo Delete] Photo deleted successfully via API:', result);

            // --- Refresh the entire slider after deletion --- 
            console.log('[Photo Delete] Calling fetchAndDisplayPhotos() to refresh gallery...');
            await fetchAndDisplayPhotos(); // Wait for the refresh to attempt completion
            console.log('[Photo Delete] fetchAndDisplayPhotos() call finished.');

        } catch (error) {
            console.error('[Photo Delete] Error deleting photo:', error);
            alert(`Failed to delete photo: ${error.message}`);
            // Re-enable button on error, maybe refresh state?
            deletePhotoBtn.disabled = false; 
        } finally {
             // Button state should be handled by fetchAndDisplayPhotos completion or error handling above
             console.log('[Photo Delete] Delete process finished.');
        }
    }
    // --- END NEW ---

    // --- NEW: Populate Comparison Dropdowns Function ---
    function populateComparisonDropdowns() {
        if (!comparisonPhotoSelect1 || !comparisonPhotoSelect2) return;

        // Clear existing options (keep the default placeholder)
        comparisonPhotoSelect1.innerHTML = '<option value="">-- Select Date --</option>';
        comparisonPhotoSelect2.innerHTML = '<option value="">-- Select Date --</option>';

        if (progressPhotosData.length > 0) {
            // Sort photos by date (oldest first for dropdown might be better)
            const sortedPhotos = [...progressPhotosData].sort((a, b) => new Date(a.date_taken) - new Date(b.date_taken));

            sortedPhotos.forEach(photo => {
                const option1 = document.createElement('option');
                option1.value = photo.photo_id; // Use photo_id as value
                option1.textContent = new Date(photo.date_taken + 'T00:00:00').toLocaleDateString();

                const option2 = option1.cloneNode(true); // Clone for the second dropdown

                comparisonPhotoSelect1.appendChild(option1);
                comparisonPhotoSelect2.appendChild(option2);
            });
        }
    }

    // --- NEW: Update Comparison Images Function ---
    function updateComparisonImages() {
        if (!comparisonImage1 || !comparisonImage2 || !comparisonPhotoSelect1 || !comparisonPhotoSelect2) return;

        const selectedId1 = comparisonPhotoSelect1.value;
        const selectedId2 = comparisonPhotoSelect2.value;

        const photo1 = selectedId1 ? progressPhotosData.find(p => p.photo_id == selectedId1) : null;
        const photo2 = selectedId2 ? progressPhotosData.find(p => p.photo_id == selectedId2) : null;

        comparisonImage1.src = photo1 ? photo1.file_path : '';
        comparisonImage1.alt = photo1 ? `Comparison Photo 1: ${new Date(photo1.date_taken + 'T00:00:00').toLocaleDateString()}` : 'Comparison Photo 1';

        comparisonImage2.src = photo2 ? photo2.file_path : '';
        comparisonImage2.alt = photo2 ? `Comparison Photo 2: ${new Date(photo2.date_taken + 'T00:00:00').toLocaleDateString()}` : 'Comparison Photo 2';
    }

    initialize(); // Run initialization
});

// Helper function (if not already present globally)
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

/* Temporary Debug Outlines */ // REMOVE FROM HERE
/*
.photo-slider-container {
    outline: 2px solid red !important;
}
.photo-viewport {
    outline: 2px solid blue !important;
}
.photo-reel {
     outline: 2px solid yellow !important;
     margin-left: 50px !important;
     margin-right: 50px !important;
     width: calc(100% - 100px) !important;
}
.photo-reel img {
    outline: 1px solid orange !important;
}
.slider-nav-btn {
    outline: 3px solid limegreen !important;
    z-index: 5 !important;
}
.pagination-dots {
    outline: 2px solid cyan !important;
}
*/
/* === End Temporary Debug Outlines === */ // REMOVE TO HERE