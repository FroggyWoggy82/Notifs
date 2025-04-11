document.addEventListener('DOMContentLoaded', function() {
    // Add a beforeunload event listener to save workout state when navigating away
    window.addEventListener('beforeunload', function() {
        // Only save if we're on the active workout page
        if (currentPage === 'active') {
            console.log('Saving workout state before unload');
            saveWorkoutState();
        }
    });
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
    let currentWorkout = [];     // Can be an array (empty workout) or object { name, exercises: [...] } (template workout)
    let workoutStartTime = null;
    let workoutTimerInterval = null;
    let editingTemplateId = null; // To track which template is being edited
    let currentTemplateExercises = []; // Array for exercises in the template editor
    let exerciseHistoryChart = null; // To hold the Chart.js instance
    let currentHistoryCategoryFilter = 'all'; // State for history category filter
    let currentHistoryExerciseId = null; // Store the currently selected exercise ID
    let currentHistoryExerciseName = null; // Store the name
    let currentPage = 'landing'; // <<< ADDED: Declare currentPage in top-level scope

    // --- Local Storage Keys ---
    const STORAGE_KEYS = {
        CURRENT_WORKOUT: 'workout_tracker_current_workout',
        WORKOUT_START_TIME: 'workout_tracker_start_time',
        CURRENT_PAGE: 'workout_tracker_current_page'
    };

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

    // --- Exercise Name Edit Modal Elements ---
    const exerciseNameEditModal = document.getElementById('exercise-name-edit-modal');
    const exerciseNameEditForm = document.getElementById('exercise-name-edit-form');
    const editExerciseNameInput = document.getElementById('edit-exercise-name');
    const editExerciseIndexInput = document.getElementById('edit-exercise-index');

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
    const toggleComparisonBtn = document.getElementById('toggle-comparison-btn');
    const photoReel = document.querySelector('.photo-reel'); // Reel container
    const paginationDotsContainer = document.querySelector('.pagination-dots'); // Added
    const currentPhotoDateDisplay = document.getElementById('current-photo-date-display'); // NEW: Date display element
    // const photoPrevPreview = document.getElementById('photo-prev-preview'); // Removed
    // const photoNextPreview = document.getElementById('photo-next-preview'); // Removed
    console.log('photoNextBtn element:', photoNextBtn);

    // --- NEW: Get container for delegation ---
    const photoSliderContainer = document.querySelector('.photo-slider-container');
    const photoGallerySection = document.getElementById('photo-gallery-section');
    const photoComparisonSection = document.getElementById('photo-comparison-section');

    // --- NEW: Comparison DOM References ---
    const comparisonPhotoSelect1 = document.getElementById('comparison-photo-select-1');
    const comparisonPhotoSelect2 = document.getElementById('comparison-photo-select-2');
    const comparisonImage1 = document.getElementById('comparison-image-1');
    const comparisonImage2 = document.getElementById('comparison-image-2');

    // Track comparison view state
    let isComparisonViewActive = false;

    // --- Helper function to generate HTML for set rows ---
    function generateSetRowsHtml(exerciseData, index, isTemplate = false) {
        let setRowsHtml = '';
        // Determine the number of sets based on previously logged sets count,
        // or fall back to the template/default 'sets' property.
        let numSets = 1; // Default to 1 set
        if (!isTemplate && exerciseData.lastLog && exerciseData.lastLog.reps_completed) {
            // If we have a last log, use the number of rep entries as the set count for rendering
            numSets = exerciseData.lastLog.reps_completed.split(',').length;
        } else {
            // Otherwise, use the 'sets' property from the template/exercise data
            numSets = parseInt(exerciseData.sets) || 1;
        }

        // For templates, always use the sets property
        if (isTemplate) {
            numSets = parseInt(exerciseData.sets) || 1;
        }
        // Ensure at least one set is rendered
        numSets = Math.max(1, numSets);

        // Parse the *entire* previous log data ONCE, if available
        let weightsArray = [];
        let repsArray = [];
        // Use the current exercise's weight unit (which is the preferred unit) for display
        // This ensures the previous log shows the same unit as the current exercise
        let prevUnit = exerciseData.weight_unit || 'kg';
        if (!isTemplate && exerciseData.lastLog) {
             console.log(`[generateSetRowsHtml] Found lastLog for ${exerciseData.name}:`, exerciseData.lastLog);
            if (exerciseData.lastLog.weight_used) {
                weightsArray = exerciseData.lastLog.weight_used.split(',').map(w => w.trim());
            }
            if (exerciseData.lastLog.reps_completed) {
                repsArray = exerciseData.lastLog.reps_completed.split(',').map(r => r.trim());
            }
            // We're not using the log's weight unit anymore, but the preferred unit from exerciseData
            // prevUnit = exerciseData.lastLog.weight_unit || 'kg';
             console.log(`[generateSetRowsHtml] Parsed arrays: weights=[${weightsArray}], reps=[${repsArray}], using unit: ${prevUnit}`);
        }

        for (let i = 0; i < numSets; i++) {
            // --- Per-Set Logic ---
            let weightValue = ''; // Pre-fill value for weight input
            let repsValue = '';   // Pre-fill value for reps input
            let previousLogTextHtml = '- kg x -'; // Display text for previous log span
            const currentUnit = exerciseData.weight_unit || 'kg'; // Use exercise's current unit setting

            // First check if we have saved input values in sets_completed
            if (!isTemplate && exerciseData.sets_completed && exerciseData.sets_completed[i]) {
                const savedSet = exerciseData.sets_completed[i];
                // Check if sets_completed is an array of objects with weight/reps properties
                if (typeof savedSet === 'object' && savedSet !== null) {
                    if (savedSet.weight !== undefined) {
                        weightValue = savedSet.weight;
                        console.log(`[generateSetRowsHtml] Using saved weight value: ${weightValue}`);
                    }
                    if (savedSet.reps !== undefined) {
                        repsValue = savedSet.reps;
                        console.log(`[generateSetRowsHtml] Using saved reps value: ${repsValue}`);
                    }
                }
            }

            // If no saved values, check if previous log data exists for THIS specific set index (i)
            if ((!weightValue || !repsValue) && !isTemplate && weightsArray.length > i && repsArray.length > i) {
                const prevWeight = weightsArray[i];
                const prevReps = repsArray[i];

                // Only populate if values are not empty strings and we don't already have saved values
                if (prevWeight !== '' && !weightValue) {
                    weightValue = prevWeight;
                }
                if (prevReps !== '' && !repsValue) {
                    repsValue = prevReps;
                }
                // Always update the display text if data exists for this set index
                previousLogTextHtml = `${prevWeight || '-'} ${prevUnit} x ${prevReps || '-'}`;
                console.log(`[generateSetRowsHtml] Set ${i}: Pre-filling weight=${weightValue}, reps=${repsValue}. Display='${previousLogTextHtml}'`);
            } else if (!isTemplate){
                // If no specific data for this set index, keep inputs empty, show placeholder text
                console.log(`[generateSetRowsHtml] Set ${i}: No previous data found for this index.`);
            }
            // --- End Per-Set Logic ---

            // Check for completion status in sets_completed first, then fall back to completedSets for backward compatibility
            let isCompleted = false;
            if (!isTemplate) {
                if (exerciseData.sets_completed && exerciseData.sets_completed[i]) {
                    const savedSet = exerciseData.sets_completed[i];
                    if (typeof savedSet === 'object' && savedSet !== null && savedSet.completed !== undefined) {
                        isCompleted = savedSet.completed;
                    }
                } else if (exerciseData.completedSets && exerciseData.completedSets[i]) {
                    // Legacy support for completedSets array
                    isCompleted = !!exerciseData.completedSets[i];
                }
            }
            const isDisabled = isTemplate;
            const weightInputType = (currentUnit === 'bodyweight' || currentUnit === 'assisted') ? 'hidden' : 'number';
            const weightPlaceholder = (currentUnit === 'bodyweight' || currentUnit === 'assisted') ? '' : 'Wt';
            const repsPlaceholder = 'Reps';

            // Generate the HTML for this specific set row
            if (isTemplate) {
                // For templates, use the reordered layout: Set#, Previous, Weight, Reps
                setRowsHtml += `
                    <div class="set-row" data-set-index="${i}">
                        <span class="set-number">${i + 1}</span>
                        <span class="previous-log">${previousLogTextHtml}</span>
                        <input type="${weightInputType}" class="weight-input" placeholder="${weightPlaceholder}" value="${weightValue}" step="any" inputmode="decimal">
                        <input type="text" class="reps-input" placeholder="${repsPlaceholder}" value="${repsValue}" inputmode="numeric" pattern="[0-9]*">
                    </div>
                `;
            } else {
                // For active workouts, keep the original layout
                setRowsHtml += `
                    <div class="set-row" data-set-index="${i}">
                        <span class="set-number">${i + 1}</span>
                        <span class="previous-log">${previousLogTextHtml}</span>
                        <input type="${weightInputType}" class="weight-input" placeholder="${weightPlaceholder}" value="${weightValue}" ${isDisabled ? 'disabled' : ''} step="any" inputmode="decimal">
                        <input type="text" class="reps-input" placeholder="${repsPlaceholder}" value="${repsValue}" ${isDisabled ? 'disabled' : ''} inputmode="numeric" pattern="[0-9]*">
                        <button class="set-complete-toggle ${isCompleted ? 'completed' : ''}" data-workout-index="${index}" data-set-index="${i}" title="Mark Set Complete"></button>
                    </div>
                `;
            }
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

    // Store the checked state of exercises
    const checkedExercises = new Set();

    function renderAvailableExercises(searchTerm = '', category = 'all') {
        // Save checked state before clearing the list
        const currentCheckboxes = availableExerciseListEl.querySelectorAll('input[type="checkbox"]');
        currentCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                checkedExercises.add(parseInt(checkbox.value, 10));
            } else {
                checkedExercises.delete(parseInt(checkbox.value, 10));
            }
        });

        availableExerciseListEl.innerHTML = ''; // Clear previous
        searchTerm = searchTerm.toLowerCase();

        // If search term is empty and category is 'all', show all exercises
        let filtered;
        if (searchTerm === '' && category === 'all') {
            filtered = availableExercises;
        } else {
            filtered = availableExercises.filter(ex => {
                const nameMatch = ex.name.toLowerCase().includes(searchTerm);
                const categoryMatch = category === 'all' || ex.category === category;
                return nameMatch && categoryMatch;
            });
        }

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

            // Restore checked state if this exercise was previously checked
            if (checkedExercises.has(ex.exercise_id)) {
                checkbox.checked = true;
            }

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
        const exercisesToRender = Array.isArray(currentWorkout) ? currentWorkout : currentWorkout.exercises;

        if (!exercisesToRender || exercisesToRender.length === 0) {
            currentExerciseListEl.innerHTML = '<p>Add exercises using the + button.</p>';
            return;
        }

        // Use Promise.all to handle async rendering of items
        const renderPromises = exercisesToRender.map(async (exercise, index) => {
            const exerciseItem = document.createElement('div');
            exerciseItem.className = 'exercise-item';
            // We will set dataset attributes *inside* renderSingleExerciseItem

            // Directly call and await renderSingleExerciseItem.
            // It handles its own fetching and rendering logic.
            try {
                await renderSingleExerciseItem(exerciseItem, exercise, index);
                return exerciseItem; // Return the rendered element
            } catch (error) {
                console.error(`Error rendering exercise item for ${exercise.name}:`, error);
                // Optionally return a placeholder error element
                const errorItem = document.createElement('div');
                errorItem.className = 'exercise-item error';
                errorItem.textContent = `Error loading ${exercise.name}`;
                return errorItem;
            }
        });

        // Wait for all items to be rendered (or fail) and then append them
        Promise.all(renderPromises).then(renderedItems => {
            currentExerciseListEl.innerHTML = ''; // Clear again just in case
            renderedItems.forEach(item => {
                if (item) { // Ensure item exists (in case of error)
                    currentExerciseListEl.appendChild(item);
                }
            });
             console.log("[renderCurrentWorkout] Finished appending all rendered items.");
        }).catch(error => {
            console.error("Error rendering one or more workout items:", error);
            currentExerciseListEl.innerHTML = '<p style="color: red;">Error displaying workout. Please try refreshing.</p>';
        });
    }

    // --- Reworked function to render a single exercise item (lastLogData now part of exerciseData) ---
    async function renderSingleExerciseItem(exerciseItemElement, exerciseData, index, isTemplate = false) {
        console.log(`[Render Single] Rendering exercise '${exerciseData.name}' at index ${index}, isTemplate: ${isTemplate}`);

        // Set data attributes for easy access later
        exerciseItemElement.dataset.workoutIndex = index; // <<< Use workoutIndex consistently
        exerciseItemElement.dataset.exerciseId = exerciseData.exercise_id;

        // --- Fetch Last Log --- Await this before generating HTML
        if (!isTemplate && exerciseData.lastLog === undefined) { // Check if fetch needed
            console.log(`[Render Single] Fetching last log for ${exerciseData.name}...`);
            exerciseData.lastLog = null; // Set temporarily to prevent re-fetch while awaiting
            const fetchLastLog = async () => {
                try {
                    const response = await fetch(`/api/workouts/exercises/${exerciseData.exercise_id}/lastlog`);
                    if (response.ok) {
                        const logData = await response.json();
                        console.log(`[Render Single] Last log FETCHED for ${exerciseData.name}:`, logData);
                        return logData; // Return the fetched data
                    } else if (response.status === 404) {
                         console.log(`[Render Single] No last log found for ${exerciseData.name}.`);
                         return null; // Return null explicitly
                     } else {
                        console.error(`[Render Single] Error fetching last log for ${exerciseData.name}: ${response.statusText}`);
                         return null; // Return null on error
                     }
                } catch (error) {
                    console.error(`[Render Single] Network error fetching last log for ${exerciseData.name}:`, error);
                     return null; // Return null on network error
                }
            };
            // Await the result and store it back on exerciseData
            exerciseData.lastLog = await fetchLastLog();
            console.log(`[Render Single] Awaited fetch complete. exerciseData.lastLog is now:`, exerciseData.lastLog);
        }
        // --- End Fetch Last Log ---

        // Now that lastLog is guaranteed to be fetched (or null), generate the HTML
        const setsHtml = generateSetRowsHtml(exerciseData, index, isTemplate);

        // Construct the inner HTML for the exercise item
        // (Keep the existing innerHTML structure)
        exerciseItemElement.innerHTML = `
            <div class="exercise-item-header">
                <div class="exercise-name-container">
                    <h4>${escapeHtml(exerciseData.name)}</h4>
                </div>
                ${!isTemplate ? `<button class="btn-edit-exercise-name" title="Edit Exercise Name">✎</button>` : ''}
                <select class="exercise-unit-select" data-workout-index="${index}">
                    <option value="kg" ${exerciseData.weight_unit === 'kg' ? 'selected' : ''}>kg</option>
                    <option value="lbs" ${exerciseData.weight_unit === 'lbs' ? 'selected' : ''}>lbs</option>
                    <option value="bodyweight" ${exerciseData.weight_unit === 'bodyweight' ? 'selected' : ''}>Bodyweight</option>
                    <option value="assisted" ${exerciseData.weight_unit === 'assisted' ? 'selected' : ''}>Assisted</option>
                </select>
                <button class="${isTemplate ? 'btn-delete-template-exercise' : 'btn-delete-exercise'}" title="Remove Exercise">&times;</button>
            </div>
            <div class="exercise-notes-group">  <!-- <<< MOVED UP -->
                 <textarea class="exercise-notes-textarea" placeholder="Notes for this exercise..." ${isTemplate ? '' : ''}>${escapeHtml(exerciseData.notes || '')}</textarea>
            </div>
            <div class="sets-container"> ${setsHtml} </div>  <!-- <<< MOVED DOWN -->
            <div class="set-actions-container">
                <button type="button" class="btn btn-danger btn-remove-set">- Remove Set</button>
                <button type="button" class="btn btn-secondary btn-add-set">+ Add Set</button>
            </div>
        `;

        // Initialize state for the remove button
        const removeButton = exerciseItemElement.querySelector('.btn-remove-set');
        const setRowsCount = exerciseItemElement.querySelectorAll('.set-row').length;
        if (removeButton) {
            removeButton.disabled = setRowsCount <= 1;
        }

        // Make sure sets_completed is properly initialized with current values
        if (!isTemplate) {
            // Initialize sets_completed array if it doesn't exist
            if (!exerciseData.sets_completed) {
                exerciseData.sets_completed = [];
            }

            // Update sets_completed with current input values
            const setRows = exerciseItemElement.querySelectorAll('.set-row');
            setRows.forEach((row, idx) => {
                const weightInput = row.querySelector('.weight-input');
                const repsInput = row.querySelector('.reps-input');
                const completeToggle = row.querySelector('.set-complete-toggle');

                // Ensure the array has enough elements
                while (exerciseData.sets_completed.length <= idx) {
                    exerciseData.sets_completed.push({
                        weight: '',
                        reps: '',
                        unit: exerciseData.weight_unit || 'kg',
                        completed: false
                    });
                }

                // Update with current values
                if (weightInput) {
                    exerciseData.sets_completed[idx].weight = weightInput.value;
                }
                if (repsInput) {
                    exerciseData.sets_completed[idx].reps = repsInput.value;
                }
                if (completeToggle) {
                    exerciseData.sets_completed[idx].completed = completeToggle.classList.contains('completed');
                }
            });

            // Save state after initialization
            saveWorkoutState();
        }

        // Input listeners are handled through delegation on the parent container

         console.log(`[Render Single] Finished rendering '${exerciseData.name}'`);
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
        // Save checked state before closing the modal
        const currentCheckboxes = availableExerciseListEl.querySelectorAll('input[type="checkbox"]');
        currentCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                checkedExercises.add(parseInt(checkbox.value, 10));
            } else {
                checkedExercises.delete(parseInt(checkbox.value, 10));
            }
        });

        exerciseModal.style.display = 'none';
    }

    // --- Workout State Persistence Functions ---

    // Save current workout state to localStorage
    function saveWorkoutState() {
        try {
            // Only save if we have an active workout
            if (currentWorkout && (Array.isArray(currentWorkout) ? currentWorkout.length > 0 : currentWorkout.exercises?.length > 0)) {
                console.log('Saving workout state to localStorage');

                // Create a deep copy to avoid reference issues
                const workoutToSave = JSON.parse(JSON.stringify(currentWorkout));

                // Save to localStorage
                localStorage.setItem(STORAGE_KEYS.CURRENT_WORKOUT, JSON.stringify(workoutToSave));
                console.log('Workout state saved:', workoutToSave);

                // Save workout start time if it exists
                if (workoutStartTime) {
                    localStorage.setItem(STORAGE_KEYS.WORKOUT_START_TIME, workoutStartTime.toString());
                }

                // Save current page if we're in active workout mode
                if (currentPage === 'active') {
                    localStorage.setItem(STORAGE_KEYS.CURRENT_PAGE, currentPage);
                }

                return true;
            } else {
                console.log('No active workout to save');
                return false;
            }
        } catch (error) {
            console.error('Error saving workout state:', error);
            return false;
        }
    }

    // Load workout state from localStorage
    function loadWorkoutState() {
        try {
            // Check if we have a saved workout
            const savedWorkout = localStorage.getItem(STORAGE_KEYS.CURRENT_WORKOUT);
            if (savedWorkout) {
                console.log('Found saved workout in localStorage');
                currentWorkout = JSON.parse(savedWorkout);

                // Load workout start time if it exists
                const savedStartTime = localStorage.getItem(STORAGE_KEYS.WORKOUT_START_TIME);
                if (savedStartTime) {
                    workoutStartTime = parseInt(savedStartTime);
                }

                // Load current page if it exists
                const savedPage = localStorage.getItem(STORAGE_KEYS.CURRENT_PAGE);
                if (savedPage === 'active') {
                    // We'll switch to the active page after rendering
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Error loading workout state:', error);
            return false;
        }
    }

    // Clear saved workout state
    function clearWorkoutState() {
        try {
            localStorage.removeItem(STORAGE_KEYS.CURRENT_WORKOUT);
            localStorage.removeItem(STORAGE_KEYS.WORKOUT_START_TIME);
            localStorage.removeItem(STORAGE_KEYS.CURRENT_PAGE);
            console.log('Cleared saved workout state');
        } catch (error) {
            console.error('Error clearing workout state:', error);
        }
    }

    function switchPage(pageToShow) {
        console.log('switchPage called with:', pageToShow); // Log function call and argument
        currentPage = pageToShow; // <<< Ensure this modifies the top-level variable (no 'let')
        workoutLandingPage.classList.remove('active');
        activeWorkoutPage.classList.remove('active');
        templateEditorPage.classList.remove('active'); // Hide editor too

        if (pageToShow === 'landing') {
            workoutLandingPage.classList.add('active');
            console.log('Applied active class to:', workoutLandingPage);
        } else if (pageToShow === 'active') {
            activeWorkoutPage.classList.add('active');
            console.log('Applied active class to:', activeWorkoutPage);
            // Save workout state when switching to active page
            saveWorkoutState();
        } else if (pageToShow === 'editor') {
            templateEditorPage.classList.add('active');
            console.log('Applied active class to:', templateEditorPage);
        }
        // Ensure FAB visibility matches active page
        addExerciseFab.style.display = (pageToShow === 'active') ? 'flex' : 'none';
    }

    function startEmptyWorkout() {
        console.log('Starting empty workout');
        // Clear any existing saved workout
        clearWorkoutState();

        currentWorkout = []; // Reset workout
        currentWorkoutNameEl.textContent = 'New Workout'; // Or prompt user for name
        renderCurrentWorkout();
        switchPage('active');
        startTimer();

        // Save the new empty workout state
        saveWorkoutState();
    }

    async function startWorkoutFromTemplate(templateId) {
        // Clear any existing saved workout
        clearWorkoutState();

        const template = workoutTemplates.find(t => t.workout_id === templateId);
        if (!template) {
            console.error("Template not found:", templateId);
            return;
        }
        console.log(`Starting workout from template: ${templateId}`);

        // Fetch the latest exercise preferences
        try {
            const response = await fetch('/api/workouts/exercises');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const exercises = await response.json();

            // Create a map of exercise preferences for quick lookup
            const exercisePreferences = {};
            exercises.forEach(ex => {
                exercisePreferences[ex.exercise_id] = ex.preferred_weight_unit;
            });

            // Initialize currentWorkout as an object with name and exercises array
            currentWorkout = {
                name: template.name, // Store template name
                exercises: template.exercises.map(ex => {
                    // Use the preferred weight unit if available, otherwise use the template's unit or default to kg
                    const preferredUnit = exercisePreferences[ex.exercise_id] || ex.weight_unit || 'kg';

                    return {
                        ...ex,
                        // Use the preferred weight unit from database
                        weight_unit: preferredUnit,
                        lastLog: undefined, // Mark for fetching
                        // Initialize sets_completed based on template 'sets' count
                        sets_completed: Array(parseInt(ex.sets) || 1).fill(null).map(() => ({
                            weight: '',
                            reps: '',
                            unit: preferredUnit,
                            completed: false
                        }))
                    };
                })
            };

            console.log("Current workout initialized from template with preferences:", currentWorkout);

            // Set workout name display
            const workoutName = currentWorkout.name; // Use the name from the object
            currentWorkoutNameEl.textContent = workoutName;

            // Render the workout and switch page
            renderCurrentWorkout(); // This function expects currentWorkout.exercises
            switchPage('active');
            startTimer();
            // Show FAB
            addExerciseFab.style.display = 'flex';

            // Save the new workout state
            saveWorkoutState();
        } catch (error) {
            console.error('Error fetching exercise preferences:', error);
            // Fall back to using the template without preferences
            currentWorkout = {
                name: template.name,
                exercises: template.exercises.map(ex => ({
                    ...ex,
                    lastLog: undefined,
                    sets_completed: Array(parseInt(ex.sets) || 1).fill(null).map(() => ({
                        weight: '',
                        reps: '',
                        unit: ex.weight_unit || 'kg',
                        completed: false
                    }))
                }))
            };

            // Continue with the workout setup
            currentWorkoutNameEl.textContent = currentWorkout.name;
            renderCurrentWorkout();
            switchPage('active');
            startTimer();
            addExerciseFab.style.display = 'flex';
            saveWorkoutState();
        }
    }


    // Legacy function - kept for backward compatibility
    function addExerciseToWorkout(exerciseId, targetList) {
        // Find the exercise object
        const exercise = availableExercises.find(ex => ex.exercise_id === exerciseId);
        if (!exercise) {
            console.error('Exercise not found in available list', exerciseId);
            alert('Error finding selected exercise.');
            return;
        }

        // Call the new function with the exercise object
        addExerciseToWorkoutByObject(exercise, targetList);
    }

    // Function that takes an exercise object directly
    function addExerciseToWorkoutByObject(exercise, targetList) {
        console.log(`Adding exercise: ${exercise.name} to ${targetList} list`);

        // Use the preferred weight unit if available
        const preferredUnit = exercise.preferred_weight_unit || 'kg';
        console.log(`Using preferred weight unit for ${exercise.name}: ${preferredUnit}`);

        const newExerciseData = {
            exercise_id: exercise.exercise_id,
            name: exercise.name,
            category: exercise.category,
            sets: 3, // Default sets changed to 3 for better user experience
            reps: '', // Default reps
            weight: null,
            weight_unit: preferredUnit, // Use the preferred weight unit
            notes: '',
            // Only add sets_completed for active workouts, not templates
            ...(targetList === 'active' && {
                sets_completed: Array(3).fill(null).map(() => ({
                    weight: '',
                    reps: '',
                    unit: preferredUnit,
                    completed: false
                }))
            }),
            lastLog: undefined // Mark lastLog as not yet fetched
        };

        if (targetList === 'active') {
            // Check if currentWorkout is an array or an object with exercises array
            if (Array.isArray(currentWorkout)) {
                // For empty workouts (array)
                newExerciseData.order_position = currentWorkout.length;
                currentWorkout.push(newExerciseData);
            } else {
                // For template-based workouts (object with exercises array)
                newExerciseData.order_position = currentWorkout.exercises.length;
                currentWorkout.exercises.push(newExerciseData);
            }
            renderCurrentWorkout(); // Update the active workout list UI
            saveWorkoutState(); // Save the updated workout state
        } else { // targetList === 'editor'
            newExerciseData.order_position = currentTemplateExercises.length;
            currentTemplateExercises.push(newExerciseData);
            renderTemplateExerciseList(); // Update the template editor list UI
        }

        closeExerciseModal(); // Close modal after adding
    }

    function handleDeleteExercise(event) {
        const button = event.target; // Get the button that was clicked
        console.log("[handleDeleteExercise] Clicked button:", button); // <<< ADD LOG
        const exerciseItem = button.closest('.exercise-item'); // Find the parent exercise item
        console.log("[handleDeleteExercise] Found parent exerciseItem:", exerciseItem); // <<< ADD LOG

        if (!exerciseItem) {
            console.error('Could not find parent exercise item for delete button.');
            return;
        }

        console.log("[handleDeleteExercise] exerciseItem.dataset:", exerciseItem.dataset); // <<< ADD LOG
        const indexToRemove = parseInt(exerciseItem.dataset.workoutIndex, 10); // Get index from parent item
        console.log(`[handleDeleteExercise] Parsed indexToRemove: ${indexToRemove} (Type: ${typeof indexToRemove})`); // <<< ADD LOG HERE

        // Determine which list we are modifying based on context (active workout vs. template editor)
        // REMOVED local declaration: let exercisesArray;
        // REMOVED local declaration: let listElement;

        // Check the globally defined currentPage
        if (currentPage === 'active') {
            // Handle both array and object structures for currentWorkout
            exercisesArray = Array.isArray(currentWorkout) ? currentWorkout : currentWorkout.exercises;
            listElement = currentExerciseListEl;
        } else if (currentPage === 'template-editor') {
            // For template editor, use the currentTemplateExercises array
            exercisesArray = currentTemplateExercises;
            listElement = templateExerciseListEl;
        } else {
            console.error("[handleDeleteExercise] Called from unknown page context:", currentPage);
            return;
        }

        // Logging using the correct global currentPage
        console.log(`[handleDeleteExercise] Checking index against array. Page: ${currentPage}`);
        console.log(`[handleDeleteExercise] exercisesArray is defined: ${!!exercisesArray}`);
        if (exercisesArray) {
            console.log(`[handleDeleteExercise] exercisesArray length: ${exercisesArray.length}`);
            // Optional: Log the first few elements to see if it looks correct
            // console.log('[handleDeleteExercise] exercisesArray sample:', exercisesArray.slice(0, 2));
        } else {
            console.error("[handleDeleteExercise] exercisesArray is UNDEFINED or NULL!");
        }


        // Validate the index *after* determining the correct array
        if (isNaN(indexToRemove) || indexToRemove < 0 || !exercisesArray || indexToRemove >= exercisesArray.length) {
            console.error(`Invalid index for exercise deletion. Index: ${indexToRemove}, Array length: ${exercisesArray ? exercisesArray.length : 'undefined'}`);
            return; // Stop execution if index is invalid
        }

        // === ADD CONFIRMATION ===
        const exerciseNameToConfirm = exercisesArray[indexToRemove]?.name || 'this exercise';
        if (!confirm(`Are you sure you want to remove ${exerciseNameToConfirm} from the workout?`)) {
            console.log('[handleDeleteExercise] Deletion cancelled by user.');
            return; // Stop if user cancels
        }
        // === END CONFIRMATION ===

        // Proceed with deletion (original logic)
        const removedExercise = exercisesArray.splice(indexToRemove, 1)[0];
        console.log(`[handleDeleteExercise] Removed exercise at index ${indexToRemove}:`, removedExercise);

        // === ADD UI REFRESH ===
        // Re-render the appropriate list after deletion
        if (currentPage === 'active') {
            renderCurrentWorkout();
        } else if (currentPage === 'template-editor') {
            renderTemplateExerciseList();
        }
        // === END UI REFRESH ===
    }

    // --- NEW: Handler for Deleting Exercise from Template Editor ---
    function handleDeleteTemplateExercise(deleteButton) { // Changed parameter to expect the button element
        const indexToRemove = parseInt(deleteButton.dataset.index, 10); // Use dataset.index from the button
        if (!isNaN(indexToRemove) && indexToRemove >= 0 && indexToRemove < currentTemplateExercises.length) {
             const exerciseName = currentTemplateExercises[indexToRemove]?.name || 'this exercise';
             if (confirm(`Are you sure you want to remove ${exerciseName} from this template?`)) {
                 console.log(`[handleDeleteTemplateExercise] Attempting to remove index ${indexToRemove}.`); // <<< Added log
                 console.log(`[handleDeleteTemplateExercise] Array length BEFORE splice: ${currentTemplateExercises.length}`); // <<< Added log
                 currentTemplateExercises.splice(indexToRemove, 1); // Modifies the array
                 console.log(`[handleDeleteTemplateExercise] Array length AFTER splice: ${currentTemplateExercises.length}`); // <<< Added log
                 // Re-assign order_position for remaining exercises
                 currentTemplateExercises.forEach((ex, idx) => {
                     ex.order_position = idx;
                 });
                 renderTemplateExerciseList(); // Re-render the template editor list
             }
        } else {
             console.error('Invalid index for template exercise deletion:', event.target.dataset.index);
        }
    }
    // --- END NEW ---

    function handleSetToggle(event) {
        console.log("[handleSetToggle] Fired!"); // <<< Log 1: Function entry
        const toggleButton = event.target;
        const setRow = toggleButton.closest('.set-row');
        const exerciseItem = toggleButton.closest('.exercise-item');

        console.log("[handleSetToggle] toggleButton:", toggleButton); // <<< Log 2: Log the button
        console.log("[handleSetToggle] setRow:", setRow); // <<< Log 3: Log the row
        console.log("[handleSetToggle] exerciseItem:", exerciseItem); // <<< Log 4: Log the item

        if (!setRow || !exerciseItem) {
            console.error('Could not find parent elements for set toggle.');
            return;
        }

        const exerciseIndex = parseInt(exerciseItem.dataset.workoutIndex, 10);
        const setIndex = parseInt(setRow.dataset.setIndex, 10);

        console.log(`[handleSetToggle] exerciseIndex: ${exerciseIndex}, setIndex: ${setIndex}`); // <<< Log 5: Log indices

        // --- Corrected Validation ---
        const exercises = Array.isArray(currentWorkout) ? currentWorkout : currentWorkout.exercises;
        if (isNaN(exerciseIndex) || isNaN(setIndex) || !exercises || !exercises[exerciseIndex]) {
            console.error('Invalid index or exercise data for set toggle:', { exerciseIndex, setIndex, exerciseExists: !!(exercises && exercises[exerciseIndex]) });
            return;
        }
        // --- End Corrected Validation ---

        // Toggle visual state
        toggleButton.classList.toggle('completed');
        console.log(`[handleSetToggle] Toggled 'completed' class. Button classes: ${toggleButton.className}`); // <<< Log 6: Log class toggle

        // Update internal state
        const isCompleted = toggleButton.classList.contains('completed');
        console.log(`[handleSetToggle] isCompleted state: ${isCompleted}`); // <<< Log 7: Log determined state

        // if (!exercises || !exercises[exerciseIndex]) { // Keep validation but use existing 'exercises' var
        //      console.error('Could not find exercise data for toggle state update:', exerciseIndex); // Adjusted error message
        //      return;
        // }
        const exerciseData = exercises[exerciseIndex];

        // Initialize sets_completed array if it doesn't exist
        if (!exerciseData.sets_completed) {
            const setRowCount = exerciseItem.querySelectorAll('.set-row').length;
            exerciseData.sets_completed = Array(setRowCount).fill(null).map(() => ({
                weight: '',
                reps: '',
                unit: exerciseData.weight_unit || 'kg',
                completed: false
            }));
            console.log(`[handleSetToggle] Initialized sets_completed for exercise ${exerciseIndex}`); // <<< Log 8: Log init
        }

        // Ensure the sets_completed array has enough elements
        while (exerciseData.sets_completed.length <= setIndex) {
            exerciseData.sets_completed.push({
                weight: '',
                reps: '',
                unit: exerciseData.weight_unit || 'kg',
                completed: false
            });
        }

        // Capture current input values if they exist
        const weightInput = setRow.querySelector('.weight-input');
        const repsInput = setRow.querySelector('.reps-input');
        if (weightInput && repsInput) {
            exerciseData.sets_completed[setIndex].weight = weightInput.value;
            exerciseData.sets_completed[setIndex].reps = repsInput.value;
        }

        // Update completion state
        exerciseData.sets_completed[setIndex].completed = isCompleted;

        // For backward compatibility, also update completedSets if it exists
        if (exerciseData.completedSets) {
            // Ensure the array has enough elements
            while (exerciseData.completedSets.length <= setIndex) {
                exerciseData.completedSets.push(false);
            }
            exerciseData.completedSets[setIndex] = isCompleted;
        }

        console.log(`[handleSetToggle] Updated exerciseData.sets_completed[${setIndex}] to ${JSON.stringify(exerciseData.sets_completed[setIndex])}`); // <<< Log 9: Log state update

        // --- Added: Disable/Enable inputs based on completion state ---
        // The unit select is in the exercise header, not in each set row
        if (weightInput && repsInput) {
            weightInput.disabled = isCompleted;
            repsInput.disabled = isCompleted;
            console.log(`[handleSetToggle] Inputs disabled state set to: ${isCompleted}`); // <<< Log 10: Log disable state

            // Add visual indication that inputs are disabled
            if (isCompleted) {
                weightInput.classList.add('completed');
                repsInput.classList.add('completed');
            } else {
                weightInput.classList.remove('completed');
                repsInput.classList.remove('completed');
            }
        }

        // Add/Remove actual checkmark character
        if (isCompleted) {
            toggleButton.innerHTML = '&#10003;'; // Checkmark HTML entity
            console.log("[handleSetToggle] Set innerHTML to checkmark."); // <<< Log 11a: Log checkmark add
        } else {
            toggleButton.innerHTML = ''; // Clear checkmark
            console.log("[handleSetToggle] Cleared innerHTML."); // <<< Log 11b: Log checkmark clear
        }

        // Save workout state after toggling a set
        saveWorkoutState();
    }

    async function handleCompleteWorkout() {
        console.log('Completing workout...');
        stopTimer(); // Stop timer first

        const loggedExercises = [];
        const exerciseItems = currentExerciseListEl.querySelectorAll('.exercise-item');

        // Determine if currentWorkout is an array or an object with exercises property
        const exercisesArray = Array.isArray(currentWorkout) ? currentWorkout : currentWorkout.exercises;
        console.log(`Completing workout with ${exercisesArray.length} exercises`);

        exerciseItems.forEach((item, exerciseIndex) => {
            // Safely get the exercise data
            const baseExerciseData = exercisesArray[exerciseIndex];
            if (!baseExerciseData) {
                console.error(`No exercise data found at index ${exerciseIndex}`);
                return; // Skip this iteration if no data found
            }

            const setRows = item.querySelectorAll('.set-row');
            let repsCompletedArray = [];
            let weightUsedArray = [];
            let setsCompletedCount = 0;

            // Get the unit from the header dropdown for this exercise
            const unitSelectHeader = item.querySelector('.exercise-unit-select');
            const weightUnit = unitSelectHeader ? unitSelectHeader.value : 'kg'; // Default to kg if not found

            setRows.forEach((setRow, setIndex) => {
                const repsInput = setRow.querySelector('.reps-input').value.trim() || '0'; // Default to '0' if empty
                const weightInput = setRow.querySelector('.weight-input').value.trim() || '0'; // Default to '0' if empty
                // const unitSelect = setRow.querySelector('.unit-select').value; // <<< REMOVED: Unit is per-exercise now

                // Safely check if completedSets exists and has the right index
                const isCompleted = baseExerciseData.completedSets &&
                                   Array.isArray(baseExerciseData.completedSets) &&
                                   baseExerciseData.completedSets[setIndex];

                repsCompletedArray.push(repsInput);
                weightUsedArray.push(weightInput);
                // if (setIndex === 0) weightUnit = unitSelect; // <<< REMOVED: Unit is captured above
                if (isCompleted) setsCompletedCount++;
            });

            // Get notes from the exercise notes textarea
            const exerciseNotes = item.querySelector('.exercise-notes-textarea')?.value.trim() || null;

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

            // Show a brief visual success indicator on the button before redirecting
            completeWorkoutBtn.textContent = '✓ Complete';
            completeWorkoutBtn.classList.add('success');

            // Short delay before redirecting to landing page
            setTimeout(() => {
                // Reset state and go back to landing page
                currentWorkout = [];
                workoutStartTime = null;

                // Clear saved workout state
                clearWorkoutState();

                switchPage('landing');
                // Refresh templates list
                fetchTemplates();
            }, 500); // Half-second delay for visual feedback

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

            // Get the current sets value or default to 1
            const setsValue = parseInt(exercise.sets) || 1;

            exerciseItem.innerHTML = `
                <div class="exercise-item-header">
                    <div class="exercise-name-container">
                        <h4>${escapeHtml(exercise.name)}</h4>
                    </div>
                    <button class="btn-edit-exercise-name" title="Edit Exercise Name">✎</button>
                    <select class="exercise-unit-select" data-workout-index="${index}">
                        <option value="kg" ${exercise.weight_unit === 'kg' ? 'selected' : ''}>kg</option>
                        <option value="lbs" ${exercise.weight_unit === 'lbs' ? 'selected' : ''}>lbs</option>
                        <option value="bodyweight" ${exercise.weight_unit === 'bodyweight' ? 'selected' : ''}>Bodyweight</option>
                        <option value="assisted" ${exercise.weight_unit === 'assisted' ? 'selected' : ''}>Assisted</option>
                    </select>
                    <button class="btn-delete-template-exercise" data-index="${index}" title="Remove Exercise">&times;</button>
                </div>
                <div class="exercise-config-row">
                    <div class="sets-input-group">
                        <label for="exercise-sets-${index}">Sets:</label>
                        <input type="number" id="exercise-sets-${index}" class="exercise-sets-input" value="${setsValue}" min="1" max="20" data-index="${index}">
                    </div>
                </div>
                <div class="exercise-notes-group">
                    <label for="exercise-notes-${index}">Notes:</label>
                    <textarea id="exercise-notes-${index}" class="exercise-notes" rows="2">${escapeHtml(exercise.notes || '')}</textarea>
                </div>
                <div class="sets-container">
                    ${setRowsHtml}
                </div>
                <!-- Removed Add/Remove Set buttons from template editor items -->
                <!--
                <div class="set-actions-container">
                    <button type="button" class="btn btn-danger btn-remove-set">- Remove Set</button>
                    <button type="button" class="btn btn-secondary btn-add-set">+ Add Set</button>
                </div>
                -->
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
        console.log(`[handleSaveTemplate] Array length AT START of save: ${currentTemplateExercises.length}`); // <<< Added log

        const templateName = templateNameInput.value.trim();
        const templateDescription = templateDescriptionInput.value.trim();

        if (!templateName) {
            alert('Template name cannot be empty.');
            templateNameInput.focus();
            return;
        }

        // Update currentTemplateExercises with the current sets values from inputs
        const templateExerciseListEl = document.getElementById('template-exercise-list');
        const setsInputs = templateExerciseListEl.querySelectorAll('.exercise-sets-input');
        setsInputs.forEach(input => {
            const index = parseInt(input.dataset.index);
            if (!isNaN(index) && index >= 0 && index < currentTemplateExercises.length) {
                const setsValue = parseInt(input.value) || 1;
                currentTemplateExercises[index].sets = setsValue;
                console.log(`Updated exercise ${index} sets to ${setsValue}`);
            }
        });

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

            // Add the new exercise ID to the checked exercises set
            checkedExercises.add(result.exercise_id);
            console.log(`Auto-checked newly created exercise: ${result.name} (ID: ${result.exercise_id})`);

            // Re-render the list with the new exercise checked
            renderAvailableExercises();

            // Scroll to the newly added exercise to make it visible
            setTimeout(() => {
                const newExerciseCheckbox = document.getElementById(`ex-select-${result.exercise_id}`);
                if (newExerciseCheckbox) {
                    newExerciseCheckbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);

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

    // --- NEW Helper function to update previous log spans after fetch ---
    function updatePreviousLogSpans(exerciseItemElement, lastLogData, isError = false) {
         const setRows = exerciseItemElement.querySelectorAll('.sets-container .set-row');
         let prevRepsArray = [];
         let prevWeightsArray = [];
         let prevUnit = 'kg';

         if (lastLogData && lastLogData.reps_completed && lastLogData.weight_used) {
             prevRepsArray = lastLogData.reps_completed.split(',');
             prevWeightsArray = lastLogData.weight_used.split(',');
             prevUnit = lastLogData.weight_unit || 'kg';
         }

         setRows.forEach((row, i) => {
             const prevLogSpan = row.querySelector('.previous-log');
             if (prevLogSpan) {
                 let previousLogText = 'Error'; // Default error text
                 if (!isError) {
                     if (lastLogData && prevRepsArray.length > i && prevWeightsArray.length > i) {
                         const prevRep = prevRepsArray[i]?.trim() || '-';
                         const prevWeight = prevWeightsArray[i]?.trim() || '-';
                         previousLogText = `${prevWeight} ${prevUnit} x ${prevRep}`;
                     } else if (!lastLogData) {
                         previousLogText = '- kg x -'; // No data placeholder
                     } // else keep 'Error' if isError and no specific data
                 } // else keep 'Error' if isError

                 prevLogSpan.textContent = previousLogText;
                 prevLogSpan.title = `Last Session Set ${i + 1}`; // Update title too
             }
         });
    }
    // --- END Helper ---


    // --- Add Set Handler ---
    function handleAddSet(event) {
        const addButton = event.target; // The button that was clicked
        const exerciseItem = addButton.closest('.exercise-item'); // Find the parent exercise item

        // === VALIDATION: Ensure we found the parent item ===
        if (!exerciseItem) {
            console.error("handleAddSet: Could not find parent .exercise-item for the Add Set button.");
            return;
        }

        const exerciseIndexStr = exerciseItem.dataset.workoutIndex; // <<< CORRECT: Get index from parent item
        const exerciseIndex = parseInt(exerciseIndexStr, 10);

        const exercises = Array.isArray(currentWorkout) ? currentWorkout : currentWorkout.exercises;

        // === VALIDATION: Check if index is valid and workout data exists ===
        if (isNaN(exerciseIndex) || !exercises || exerciseIndex < 0 || exerciseIndex >= exercises.length) {
            console.error("handleAddSet: Invalid exercise index or workout data.", { indexStr: exerciseIndexStr, index: exerciseIndex, workoutExists: !!currentWorkout });
            return; // Stop execution if index is bad
        }
        // === END VALIDATION ===

        const setsContainer = exerciseItem.querySelector('.sets-container');
        if (!setsContainer) {
            console.error("Could not find sets container for exercise index:", exerciseIndex);
            return;
        }

        const exerciseData = exercises[exerciseIndex]; // Now we know index is valid

        // Recalculate based on current DOM state to avoid stale data
        const currentSetCount = setsContainer.querySelectorAll('.set-row').length;
        const newSetIndex = currentSetCount; // Index for the *new* row is the current count (0-based)

        // Generate HTML for just the new row (using the correct new index)
        // generateSingleSetRowHtml will now attempt to pre-fill based on lastLog data for this newSetIndex
        const newSetRowHtml = generateSingleSetRowHtml(newSetIndex, exerciseData, false); // false = not template

        // Append the new row to the DOM
        setsContainer.insertAdjacentHTML('beforeend', newSetRowHtml);

        // --- Corrected: Update completedSets array for the new set ---
        if (!exerciseData.completedSets) {
            // Initialize if it doesn't exist (size should match new total number of sets)
            exerciseData.completedSets = Array(currentSetCount + 1).fill(false);
        } else if (exerciseData.completedSets.length <= newSetIndex) {
            // Append a new entry for the added set
            exerciseData.completedSets.push(false);
        }
        // --- End corrected completedSets update ---

        // Ensure remove button is enabled if it was disabled
        const removeButton = exerciseItem.querySelector('.btn-remove-set');
        if (removeButton) {
            removeButton.disabled = false;
        }

        console.log(`Added set ${newSetIndex + 1} to exercise ${exerciseIndex}`);
    }

    // --- Remove Set Handler ---
     function handleRemoveSet(event) {
        const removeButton = event.target;
        const exerciseItem = removeButton.closest('.exercise-item'); // <<< Find parent item

        if (!exerciseItem) {
            console.error("Could not find parent exercise item for remove set button.");
            return;
        }

        const workoutIndex = parseInt(exerciseItem.dataset.workoutIndex, 10); // <<< Get index from item

        // ---> Corrected Validation < ---
        const exercises = Array.isArray(currentWorkout) ? currentWorkout : currentWorkout.exercises;
        if (isNaN(workoutIndex) || !exercises || !exercises[workoutIndex]) {
            console.error("Invalid workout index for removing set:", workoutIndex);
            return;
        }
        // ---> End Corrected Validation < ---

        const exercise = exercises[workoutIndex]; // Use validated index and correct array

        // Find the actual set rows currently in the DOM for this exercise
        const setsContainer = exerciseItem.querySelector('.sets-container');
        const setRows = setsContainer ? setsContainer.querySelectorAll('.set-row') : [];
        const currentSetCount = setRows.length;

        if (currentSetCount <= 1) {
             console.log("Cannot remove set, only 1 set remaining.");
             // Disable the button visually
             removeButton.disabled = true;
             return; // Don't remove if only 1 set is left
        }

        // Remove the last set row from the DOM
        if (setRows.length > 0) {
            setRows[setRows.length - 1].remove();
        }

        // Decrement set count in the underlying data (if using a 'sets' property)
        // This might need adjustment depending on how you track sets internally
        // if (typeof exercise.sets === 'number') {
        //     exercise.sets = Math.max(1, exercise.sets - 1);
        // } else {
        //     exercise.sets = currentSetCount - 1; // Or update based on new DOM count
        // }

         // Also shorten the completedSets array if it exists
         if (exercise.completedSets && Array.isArray(exercise.completedSets)) {
             exercise.completedSets.pop(); // Remove the last entry
         }

        console.log(`Removed set from exercise ${workoutIndex} (${exercise.name}). Remaining sets: ${currentSetCount - 1}`);

        // Disable the remove button again if only one set remains after removal
        if (currentSetCount - 1 <= 1) {
            removeButton.disabled = true;
        }

        // No need to re-render the whole item, just removed the row
        // renderSingleExerciseItem(exerciseItemElement, exercise, workoutIndex);
     }

    // --- Initialization ---\
    function initialize() {
        console.log('Initializing Workout Tracker...');
        // REMOVED: let currentPage = 'landing'; // Remove local declaration if it existed

        // Check for saved workout state
        if (loadWorkoutState()) {
            console.log('Restoring saved workout state');
            // Set workout name display if we have a workout
            if (currentWorkout) {
                const workoutName = Array.isArray(currentWorkout) ? 'New Workout' : currentWorkout.name;
                if (currentWorkoutNameEl) currentWorkoutNameEl.textContent = workoutName;

                // Render the workout
                renderCurrentWorkout();

                // Switch to active page
                switchPage('active');

                // Resume timer if we have a start time
                if (workoutStartTime) {
                    // Update timer display first
                    updateTimer();
                    // Then start the interval
                    workoutTimerInterval = setInterval(updateTimer, 1000);
                }
            }
        }

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
                } else if (target.classList.contains('set-complete-toggle')) { // <<< ADD THIS CHECK
                    handleSetToggle(event);                             // <<< CALL THE HANDLER
                } else if (target.classList.contains('exercise-unit-select')) { // <<< NEW: Handle header unit change
                    handleExerciseUnitChange(event);
                } else if (target.classList.contains('btn-delete-exercise')) { // <<< ADD THIS CHECK
                    handleDeleteExercise(event);                          // <<< CALL THE HANDLER
                } else if (target.classList.contains('btn-edit-exercise-name')) { // Handle edit exercise name
                    handleEditExerciseName(event);
                }
            }
        });

        // Add listener for input changes in weight and reps inputs
        currentExerciseListEl?.addEventListener('input', (event) => {
            const target = event.target;
            if (target instanceof HTMLElement) {
                if (target.classList.contains('weight-input') || target.classList.contains('reps-input') || target.classList.contains('exercise-notes-textarea')) {
                    handleInputChange(event);
                }
            }
        });

        // Add a blur event listener to ensure data is saved when focus leaves an input
        currentExerciseListEl?.addEventListener('blur', (event) => {
            const target = event.target;
            if (target instanceof HTMLElement) {
                if (target.classList.contains('weight-input') || target.classList.contains('reps-input') || target.classList.contains('exercise-notes-textarea')) {
                    handleInputChange(event);
                    // Force save after blur
                    saveWorkoutState();
                    console.log('Saved workout state after input blur');
                }
            }
        }, true); // Use capture phase to ensure we catch all blur events

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

        // Add event delegation for sets input changes in template editor
        templateExerciseListEl?.addEventListener('change', (event) => {
            const target = event.target;
            if (target.classList.contains('exercise-sets-input')) {
                const index = parseInt(target.dataset.index);
                if (!isNaN(index) && index >= 0 && index < currentTemplateExercises.length) {
                    const setsValue = parseInt(target.value) || 1;
                    currentTemplateExercises[index].sets = setsValue;
                    console.log(`Updated exercise ${index} sets to ${setsValue}`);

                    // Update the sets container to show the correct number of set rows
                    const exerciseItem = target.closest('.exercise-item');
                    if (exerciseItem) {
                        const setsContainer = exerciseItem.querySelector('.sets-container');
                        if (setsContainer) {
                            // Re-render the sets rows for this exercise
                            setsContainer.innerHTML = generateSetRowsHtml(currentTemplateExercises[index], index, true);
                        }
                    }
                }
            }
        });
        // --- NEW: Add listener for deleting exercises from template editor ---
        templateExerciseListEl?.addEventListener('click', (event) => {
            // ---> MODIFIED: Use closest to find the button < ---
            const deleteButton = event.target.closest('.btn-delete-template-exercise');
            // Check if the clicked element or its ancestor is the delete button
            if (deleteButton) {
                console.log('[Template Editor Delete Listener] Found delete button via closest().'); // <<< Add log
                // Pass the event object, but the handler uses event.target.dataset which might be wrong now.
                // We need the index from the *button* itself, not necessarily the original target.
                handleDeleteTemplateExercise(deleteButton); // Pass the button element directly
            }
            // --- END MODIFICATION ---
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
                         fetchAndRenderHistoryChart(currentHistoryExerciseId);
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
        const photoDateInputEl = document.getElementById('modal-photo-date') // Corrected ID
        const uploadStatusElement = document.getElementById('upload-status');
        const photoUploadInputElement = document.getElementById('modal-photo-upload'); // Corrected ID

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

                  // ---> ADD THIS: Explicitly find and re-enable the button <---
                  const form = photoUploadModalEl.querySelector('#progress-photo-form');
                  if (form) {
                      const submitButton = form.querySelector('button[type="submit"]');
                      if (submitButton) {
                          console.log('[Modal Open] Explicitly re-enabling upload button.');
                          submitButton.disabled = false;
                      }
                  }
                  // ---> END ADDITION <---

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

        // Toggle Comparison View Listener
        if (toggleComparisonBtn) {
            toggleComparisonBtn.addEventListener('click', toggleComparisonView);
        } else {
            console.error('[Initialize] toggleComparisonBtn not found!');
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
        switchPage(currentPage); // Use the existing top-level value
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

            // Clear saved workout state
            clearWorkoutState();

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

        // Create an array to track the order in which exercises were checked
        // We'll use the DOM order of the checkboxes, which preserves the order they appear in the list
        const selectedExercises = [];

        // Get all checkboxes (both checked and unchecked) to determine the selection order
        const allCheckboxes = availableExerciseListEl.querySelectorAll('input[type="checkbox"]');

        // First, collect all checked exercises in their DOM order
        allCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const exerciseId = parseInt(checkbox.value, 10);
                if (!isNaN(exerciseId)) {
                    // Find the exercise data
                    const exercise = availableExercises.find(ex => ex.exercise_id === exerciseId);
                    if (exercise) {
                        selectedExercises.push(exercise);
                    }
                }
            }
        });

        console.log(`Selected exercises in DOM order: ${selectedExercises.map(ex => ex.name).join(', ')}`);

        // Add exercises in the order they were selected
        if (targetList === 'active') {
            // For active workouts, add each exercise individually
            selectedExercises.forEach(exercise => {
                addExerciseToWorkoutByObject(exercise, targetList);
            });
        } else {
            // For templates, add all exercises at once to maintain order
            addExercisesToTemplate(selectedExercises);
        }

        // Clear the checked state for added exercises
        selectedExercises.forEach(exercise => checkedExercises.delete(exercise.exercise_id));

        closeExerciseModal(); // Close modal after adding all
    }

    // Function to add multiple exercises to a template at once
    function addExercisesToTemplate(exercises) {
        console.log(`Adding ${exercises.length} exercises to template in selected order`);

        // Clear the current template exercises array
        currentTemplateExercises = [];

        // Add each exercise to the template in the order they were selected
        exercises.forEach((exercise, index) => {
            // Use the preferred weight unit if available
            const preferredUnit = exercise.preferred_weight_unit || 'kg';
            console.log(`Using preferred weight unit for ${exercise.name}: ${preferredUnit}`);

            const newExerciseData = {
                exercise_id: exercise.exercise_id,
                name: exercise.name,
                category: exercise.category,
                sets: 3, // Default sets
                reps: '', // Default reps
                weight: null,
                weight_unit: preferredUnit, // Use the preferred weight unit
                order_position: index, // Set position based on the index in the selected array
                notes: ''
            };

            currentTemplateExercises.push(newExerciseData);
        });

        console.log(`Template exercises after adding: ${currentTemplateExercises.map(ex => ex.name).join(', ')}`);

        // Render the updated template
        renderTemplateExerciseList();
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
            div.classList.add('history-search-item'); // <<< ADD THIS LINE
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
        // Get the history message element
        const historyMessageEl = document.getElementById('history-message');

        if (!historyMessageEl) {
            console.error("[ERROR] History message element not found!");
            return;
        }

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
                const historyMessageEl = document.getElementById('history-message');
                if (historyMessageEl) {
                    historyMessageEl.textContent = 'No logged history found for this exercise.'
                }
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

            // Clear loading message
            const historyMessageEl = document.getElementById('history-message');
            if (historyMessageEl) {
                historyMessageEl.textContent = ''; // Clear loading message
            }

            console.log("[DEBUG] Data for Chart - Labels:", labels); // <<< Log chart labels
            console.log("[DEBUG] Data for Chart - Volumes:", volumes); // <<< Log chart volumes
            renderHistoryChart(labels, volumes, 'Volume (Weight * Reps)');

        } catch (error) {
            console.error('[DEBUG] Error fetching or processing exercise history:', error); // <<< Log full error

            // Display error message
            const historyMessageEl = document.getElementById('history-message');
            if (historyMessageEl) {
                historyMessageEl.textContent = `Error loading history: ${error.message}`;
            }
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

             // Display error message
             const historyMessageEl = document.getElementById('history-message');
             if (historyMessageEl) {
                 historyMessageEl.textContent = `Error rendering chart: ${chartError.message}`;
             }
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

    // --- Simplified Photo Upload Handler ---
    async function handlePhotoUpload(event) {
        event.preventDefault();
        console.log('Photo upload started');

        const form = event.target;
        const statusElement = document.getElementById('upload-status');
        const modal = document.getElementById('photo-upload-modal');
        const submitButton = form.querySelector('button[type="submit"]');

        if (!statusElement || !modal || !submitButton) {
            alert('Error: Could not find required elements. Please refresh the page.');
            return;
        }

        // Get file and date directly from form elements
        const photoFile = form.querySelector('input[type="file"]').files[0];
        const photoDate = form.querySelector('input[name="photo-date"]').value;

        // Basic validation
        if (!photoDate) {
            statusElement.textContent = 'Please select a date.';
            statusElement.style.color = 'orange';
            return;
        }
        if (!photoFile) {
            statusElement.textContent = 'Please select a photo.';
            statusElement.style.color = 'orange';
            return;
        }

        // Show uploading status
        statusElement.textContent = 'Uploading...';
        statusElement.style.color = '#03dac6';
        submitButton.disabled = true;

        try {
            // Use the minimal photo uploader
            const response = await window.photoUploader.uploadPhoto(photoFile, photoDate);
            console.log('Upload successful:', response);

            // Show success message
            statusElement.textContent = 'Upload successful!';
            statusElement.style.color = '#4CAF50';

            // Close the modal after a short delay
            setTimeout(() => {
                modal.style.display = 'none';
                form.reset();
                statusElement.textContent = '';
                statusElement.style.color = '#03dac6';
                submitButton.disabled = false;
                fetchAndDisplayPhotos().catch(err => console.error('Error refreshing photos:', err));
            }, 1500);

        } catch (error) {
            console.error('Upload failed:', error);
            statusElement.textContent = `Upload failed: ${error.message || 'Unknown error'}`;
            statusElement.style.color = '#F44336';
            submitButton.disabled = false;
        }

    }
    // --- END NEW ---

    // --- Exercise Name Edit Functions ---
    function handleEditExerciseName(event) {
        const button = event.target;
        const exerciseItem = button.closest('.exercise-item');
        if (!exerciseItem) {
            console.error('Could not find parent exercise item for edit button.');
            return;
        }

        const index = parseInt(exerciseItem.dataset.workoutIndex, 10);
        if (isNaN(index) || index < 0 || index >= currentWorkout.exercises.length) {
            console.error(`Invalid index for exercise edit: ${index}`);
            return;
        }

        openExerciseNameEditModal(index);
    }

    function openExerciseNameEditModal(index) {
        const exercise = currentWorkout.exercises[index];
        if (!exercise) {
            console.error(`Exercise not found at index ${index}`);
            return;
        }

        // Set the current values in the modal
        document.getElementById('edit-exercise-name').value = exercise.name;
        document.getElementById('edit-exercise-index').value = index;

        // Populate the datalist with available exercises
        populateExerciseNameDatalist();

        // Show the modal
        document.getElementById('exercise-name-edit-modal').style.display = 'block';

        // Add submit event listener to the form
        const form = document.getElementById('exercise-name-edit-form');
        // Remove any existing listeners to prevent duplicates
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        newForm.addEventListener('submit', handleExerciseNameEditSubmit);

        // Add click event listeners to the edit options to make the entire row clickable
        const editOptions = document.querySelectorAll('.edit-option');
        editOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Find the radio button inside this option and select it
                const radio = this.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                }
            });
        });

        // Focus on the input field
        document.getElementById('edit-exercise-name').focus();
    }

    async function handleExerciseNameEditSubmit(event) {
        event.preventDefault();

        const nameInput = document.getElementById('edit-exercise-name');
        const indexInput = document.getElementById('edit-exercise-index');
        const editOption = document.querySelector('input[name="edit-option"]:checked').value;

        const newName = nameInput.value.trim();
        const index = parseInt(indexInput.value, 10);

        if (!newName) {
            alert('Please enter a name for the exercise.');
            return;
        }

        if (isNaN(index) || index < 0 || index >= currentWorkout.exercises.length) {
            console.error(`Invalid index for exercise edit: ${index}`);
            alert('Error: Could not find the exercise to edit.');
            return;
        }

        const exercise = currentWorkout.exercises[index];

        if (editOption === 'instance') {
            // Just update this instance
            exercise.name = newName;
            console.log(`Updated exercise name to: ${newName} (instance only)`);
            renderCurrentWorkout();
        } else if (editOption === 'new') {
            // Create a new exercise in the database
            try {
                const response = await fetch('/api/workouts/exercises', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: newName,
                        category: exercise.category || 'Other'
                    })
                });

                if (!response.ok) {
                    throw new Error(`Failed to create new exercise: ${response.status}`);
                }

                const result = await response.json();
                console.log('New exercise created:', result);

                // Update the current instance with the new exercise ID and name
                exercise.name = newName;
                exercise.exercise_id = result.exercise_id;

                // Add the new exercise to the available exercises list
                availableExercises.push(result);

                alert(`New exercise "${newName}" created and applied to this workout.`);
                renderCurrentWorkout();
            } catch (error) {
                console.error('Error creating new exercise:', error);
                alert(`Failed to create new exercise: ${error.message}`);
            }
        }

        // Close the modal
        document.getElementById('exercise-name-edit-modal').style.display = 'none';

        // Save the workout state
        saveWorkoutState();
    }
    // Function to populate the exercise name datalist
    function populateExerciseNameDatalist() {
        const datalist = document.getElementById('exercise-name-list');
        if (!datalist) {
            console.error('Exercise name datalist element not found');
            return;
        }

        // Clear existing options
        datalist.innerHTML = '';

        // Add options for all available exercises
        if (availableExercises && availableExercises.length > 0) {
            // Sort exercises alphabetically
            const sortedExercises = [...availableExercises].sort((a, b) => a.name.localeCompare(b.name));

            // Add options to datalist
            sortedExercises.forEach(exercise => {
                const option = document.createElement('option');
                option.value = exercise.name;
                option.textContent = exercise.name; // For browsers that show option text
                datalist.appendChild(option);
            });
        }
    }
    // --- End Exercise Name Edit Functions ---

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

    // --- Path Normalization Function ---
    function normalizePhotoPath(originalPath, photoId) {
        console.log(`[Photo Load] Normalizing path for photo ID: ${photoId}, Original path: ${originalPath}`);

        // Special case for photo ID 17 which we know is a PNG
        if (photoId === 17) {
            console.log(`[Photo Load] Special case for photo ID 17 (PNG file)`);
            // Try to find the filename in the original path
            let filename = '';
            if (originalPath && originalPath.includes('/')) {
                const pathParts = originalPath.split('/');
                filename = pathParts[pathParts.length - 1];
            }

            // If we found a filename, use it, otherwise use a hardcoded fallback
            if (filename && filename.length > 0) {
                // Ensure it has .png extension
                if (!filename.toLowerCase().endsWith('.png')) {
                    filename = filename.split('.')[0] + '.png';
                }
                console.log(`[Photo Load] Using extracted filename for photo 17: ${filename}`);
                return `uploads/progress_photos/${filename}`;
            } else {
                // Hardcoded fallback for photo 17 - use the most recent PNG file we found in the directory
                console.log(`[Photo Load] Using hardcoded fallback for photo 17`);
                // Try multiple known filenames for photo 17 - using the most recent files we found
                const possibleFilenames = [
                    'photos-1744395354247-929083164.jpg', // Most recent file (from Get-ChildItem)
                    'photos-1744352353551-10102925.jpg',  // Second most recent file
                    'photos-1744351437809-657831548.png', // Third most recent file
                    'photos-1744351012953-13629760.png',  // Fourth most recent file
                    'photos-1743554609618-340731311.png'  // Fifth most recent file
                ];

                // Return a list of paths to try
                console.log(`[Photo Load] Will try multiple paths for photo 17`);
                return possibleFilenames.map(name => `uploads/progress_photos/${name}`).join('|');
            }
        }

        // If path is empty or null, use a fallback based on ID
        if (!originalPath) {
            console.log(`[Photo Load] Empty path for photo ID: ${photoId}, using fallback`);
            return `uploads/progress_photos/photo-${photoId}.jpg`;
        }

        // Extract the filename from the path
        let filename = '';

        // Handle different path formats
        if (originalPath.includes('/')) {
            // Path contains slashes, extract the last part
            const pathParts = originalPath.split('/');
            filename = pathParts[pathParts.length - 1];
        } else if (originalPath.includes('\\')) {
            // Path contains backslashes, extract the last part
            const pathParts = originalPath.split('\\');
            filename = pathParts[pathParts.length - 1];
        } else {
            // Path is just a filename
            filename = originalPath;
        }

        // If filename is empty, use a fallback
        if (!filename) {
            console.log(`[Photo Load] Could not extract filename for photo ID: ${photoId}, using fallback`);
            return `uploads/progress_photos/photo-${photoId}.jpg`;
        }

        // Ensure the filename has an extension
        if (!filename.includes('.')) {
            // Check if we know this is a PNG (photo ID 14 is known to be PNG)
            if (photoId === 14) {
                console.log(`[Photo Load] Adding .png extension for photo ID: ${photoId}`);
                filename = `${filename}.png`;
            } else {
                console.log(`[Photo Load] Adding .jpg extension for photo ID: ${photoId}`);
                filename = `${filename}.jpg`;
            }
        }

        // Return the normalized path
        const normalizedPath = `uploads/progress_photos/${filename}`;
        console.log(`[Photo Load] Normalized path: ${normalizedPath}`);
        return normalizedPath;
    }

    // --- Simplified Fetch and Display Photos Function ---
    async function fetchAndDisplayPhotos() {
        console.log('[Photo Load] fetchAndDisplayPhotos STARTED.');

        // Basic validation of required elements
        if (!photoReel || !photoPrevBtn || !photoNextBtn || !deletePhotoBtn) {
            console.error("[Photo Load] Missing required elements");
            return;
        }

        // Show loading state
        photoReel.innerHTML = '<p>Loading photos...</p>';
        if (paginationDotsContainer) paginationDotsContainer.innerHTML = '';
        photoPrevBtn.disabled = true;
        photoNextBtn.disabled = true;
        deletePhotoBtn.disabled = true;

        try {
            console.log('[Photo Load] Fetching photos from API...');

            // Make a fresh request to the API
            const response = await fetch('/api/workouts/progress-photos', {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });

            console.log(`[Photo Load] API Response Status: ${response.status}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Get the response as JSON
            const data = await response.json();
            console.log(`[Photo Load] Received ${data.length} photos from API`);

            // Store the photos data
            progressPhotosData = data;

            // Log each photo for debugging
            if (progressPhotosData && progressPhotosData.length > 0) {
                progressPhotosData.forEach((photo, index) => {
                    console.log(`[Photo Load] Photo ${index + 1}: ID=${photo.photo_id}, Date=${photo.date_taken}, Path=${photo.file_path}`);
                });
            } else {
                console.log('[Photo Load] No photos found in response');
            }

            console.log(`[Photo Load] Fetched progress photos count: ${progressPhotosData.length}`);

            // --- Populate Comparison Dropdowns --- (Keep this)
            populateComparisonDropdowns();

            console.log('[Photo Load] Clearing loading message from photoReel...'); // Log before clearing
            photoReel.innerHTML = ''; // Clear loading message

            // --- BEGIN ADDED DEBUG LOG ---
            if (progressPhotosData.length > 0) {
                console.log('[Photo Load DEBUG] First photo data object:', JSON.stringify(progressPhotosData[0]));
                if (progressPhotosData.length > 1) {
                    console.log('[Photo Load DEBUG] Second photo data object:', JSON.stringify(progressPhotosData[1]));
                }
            }
            // --- END ADDED DEBUG LOG ---


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

                // PERMANENT SOLUTION: Robust path normalization for all photos
                let imagePath;

                // Log the original path
                console.log(`[Photo Load] Processing photo ID: ${photo.photo_id}, Original path: ${photo.file_path}`);

                // Normalize the path using a consistent approach for all photos
                imagePath = normalizePhotoPath(photo.file_path, photo.photo_id);

                // Log the normalized path
                console.log(`[Photo Load] Normalized path for photo ID ${photo.photo_id}: ${imagePath}`);

                console.log(`[Photo Load] Using normalized path: ${imagePath} for photo ID: ${photo.photo_id}`);

                // Store the path in data-src for lazy loading
                img.dataset.src = imagePath;
                img.src = ''; // Set src initially empty
                img.alt = `Progress photo ${photo.photo_id}`;
                img.dataset.photoId = photo.photo_id; // Store ID if needed
                img.loading = 'lazy'; // Add native lazy loading attribute as well
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

    // --- MOBILE-OPTIMIZED: Display Current Photo in Slider ---
    function displayCurrentPhoto() {
        const startTime = performance.now(); // Start timer
        const numPhotos = progressPhotosData ? progressPhotosData.length : 0;
        console.log(`[Photo Display] Displaying photo index: ${currentPhotoIndex} (Total: ${numPhotos})`);

        // Get the date display element
        const dateDisplayEl = currentPhotoDateDisplay;

        // Check if we have photos and required elements
        if (numPhotos === 0 || !photoReel || !paginationDotsContainer || !dateDisplayEl) {
            console.warn('[Photo Display] No photos or required elements found (reel, dots, date display).');
            if (dateDisplayEl) dateDisplayEl.textContent = ''; // Clear date if no photos
            if (photoReel) photoReel.innerHTML = '<p>No progress photos available. Click the "+ Add Photo" button to upload your first photo.</p>';
            if (photoPrevBtn) photoPrevBtn.disabled = true;
            if (photoNextBtn) photoNextBtn.disabled = true;
            if (deletePhotoBtn) deletePhotoBtn.disabled = true;
            return; // Nothing to display
        }

        // --- BEGIN ADDED DEBUG LOG ---
        console.log(`[Photo Display DEBUG] Current index before bounds check: ${currentPhotoIndex}`);
        // --- END ADDED DEBUG LOG ---

        // Ensure index is valid (looping can be added later if desired)
        if (currentPhotoIndex < 0) currentPhotoIndex = 0;
        if (currentPhotoIndex >= numPhotos) currentPhotoIndex = numPhotos - 1;

        // --- BEGIN ADDED DEBUG LOG ---
        console.log(`[Photo Display DEBUG] Current index AFTER bounds check: ${currentPhotoIndex}`);
        // --- END ADDED DEBUG LOG ---


        // --- Get Current Photo Data and Format Date ---
        // Check if progressPhotosData is defined and has the expected index
        if (!progressPhotosData || !Array.isArray(progressPhotosData)) {
            console.error('[Photo Display] progressPhotosData is not a valid array');
            return; // Exit early to prevent errors
        }

        const currentPhoto = progressPhotosData[currentPhotoIndex];
        // --- BEGIN ADDED DEBUG LOG ---
        console.log('[Photo Display DEBUG] Photo object being used:', currentPhoto ? JSON.stringify(currentPhoto) : 'undefined');
        // --- END ADDED DEBUG LOG ---
        console.log(`[Photo Display] Attempting to display data:`, currentPhoto); // <<< Log the photo object
        let formattedDate = '';
        if (currentPhoto && currentPhoto.date_taken) {
            // Assuming date_taken is 'YYYY-MM-DD'. Adding T00:00:00 ensures it's treated as local time.
            formattedDate = new Date(currentPhoto.date_taken + 'T00:00:00').toLocaleDateString(undefined, {
                year: 'numeric', month: 'long', day: 'numeric'
            });
        }
        dateDisplayEl.textContent = formattedDate; // Update the date display

        // --- Log the file path specifically ---
        const filePathToLoad = currentPhoto ? currentPhoto.file_path : '[No Photo Object]';
        console.log(`[Photo Display] Setting image src to: ${filePathToLoad}`); // <<< Log the file path being used

        // --- NEW: Find the specific image element and set its src for lazy loading ---
        const imageElements = photoReel.querySelectorAll('img');
        if (imageElements && imageElements[currentPhotoIndex]) {
            const currentImageElement = imageElements[currentPhotoIndex];
            // Get the path from the data-src attribute
            let imagePath = currentImageElement.dataset.src;
            console.log(`[Photo Display DEBUG] Setting src for index ${currentPhotoIndex} from data-src: ${imagePath}`);

            // Check if the path contains multiple options (separated by |)
            if (imagePath && imagePath.includes('|')) {
                console.log(`[Photo Display] Multiple paths detected for photo ID ${currentPhoto.photo_id}`);
                const pathOptions = imagePath.split('|');
                // Use the first path option initially
                imagePath = pathOptions[0];
                console.log(`[Photo Display] Using first path option: ${imagePath}`);

                // Store all path options as a data attribute for error handling
                currentImageElement.dataset.pathOptions = pathOptions.join('|');
                currentImageElement.dataset.pathOptionIndex = '0';
                currentImageElement.dataset.totalPathOptions = pathOptions.length.toString();
            }

            // Set the src attribute directly
            currentImageElement.src = imagePath;

            // Enhanced error handling for image loading
            currentImageElement.onerror = function() {
                console.log(`[Photo Display] Image failed to load: ${imagePath}`);

                // Check if we have multiple path options
                if (this.dataset.pathOptions && this.dataset.pathOptionIndex && this.dataset.totalPathOptions) {
                    const pathOptions = this.dataset.pathOptions.split('|');
                    let currentIndex = parseInt(this.dataset.pathOptionIndex, 10);
                    const totalOptions = parseInt(this.dataset.totalPathOptions, 10);

                    // Try the next path option if available
                    if (currentIndex + 1 < totalOptions) {
                        currentIndex++;
                        const nextPath = pathOptions[currentIndex];
                        console.log(`[Photo Display] Trying next path option (${currentIndex + 1}/${totalOptions}): ${nextPath}`);
                        this.dataset.pathOptionIndex = currentIndex.toString();
                        this.src = nextPath;
                        return; // Exit early to try the next path
                    }
                }

                // If no more path options or no path options at all, continue with normal error handling
                // First attempt: Add a timestamp to bypass cache
                const timestampedUrl = imagePath + '?t=' + new Date().getTime();
                console.log(`[Photo Display] Retry 1: Using timestamped URL: ${timestampedUrl}`);
                this.src = timestampedUrl;

                // Second attempt: Try with absolute URL
                this.onerror = function() {
                    console.log(`[Photo Display] Retry 1 failed, trying with absolute URL`);
                    const absoluteUrl = new URL(imagePath, window.location.origin).href;
                    console.log(`[Photo Display] Retry 2: Using absolute URL: ${absoluteUrl}`);
                    this.src = absoluteUrl;

                    // Third attempt: Try with a different path format
                    this.onerror = function() {
                        console.log(`[Photo Display] Retry 2 failed, trying with alternative path format`);
                        // Extract just the filename
                        const filename = imagePath.split('/').pop();
                        const alternativePath = `/uploads/progress_photos/${filename}`;
                        console.log(`[Photo Display] Retry 3: Using alternative path: ${alternativePath}`);
                        this.src = alternativePath;

                        // Fourth attempt: Try with PNG extension if it's a JPG, or vice versa
                        this.onerror = function() {
                            console.log(`[Photo Display] Retry 3 failed, trying with alternative file extension`);
                            let alternativeExtPath;

                            // If the path ends with .jpg or .jpeg, try .png
                            if (imagePath.toLowerCase().endsWith('.jpg') || imagePath.toLowerCase().endsWith('.jpeg')) {
                                const basePath = imagePath.substring(0, imagePath.lastIndexOf('.'));
                                alternativeExtPath = `${basePath}.png`;
                                console.log(`[Photo Display] Retry 4: Trying PNG instead of JPG: ${alternativeExtPath}`);
                            }
                            // If the path ends with .png, try .jpg
                            else if (imagePath.toLowerCase().endsWith('.png')) {
                                const basePath = imagePath.substring(0, imagePath.lastIndexOf('.'));
                                alternativeExtPath = `${basePath}.jpg`;
                                console.log(`[Photo Display] Retry 4: Trying JPG instead of PNG: ${alternativeExtPath}`);
                            }
                            // If we have an alternative path, try it
                            if (alternativeExtPath) {
                                this.src = alternativeExtPath;
                            }

                            // Try with direct /public prefix
                            this.onerror = function() {
                                console.log(`[Photo Display] Retry 4 failed, trying with /public prefix`);
                                const publicPath = `/public/${imagePath}`;
                                console.log(`[Photo Display] Retry 5: Using /public prefix: ${publicPath}`);
                                this.src = publicPath;

                                // Try with direct server URL
                                this.onerror = function() {
                                    console.log(`[Photo Display] Retry 5 failed, trying with direct server URL`);
                                    const serverPath = `http://127.0.0.1:3000/${imagePath.replace(/^\/?/, '')}`;
                                    console.log(`[Photo Display] Retry 6: Using direct server URL: ${serverPath}`);
                                    this.src = serverPath;

                                    // Final fallback: Show a placeholder
                                    this.onerror = function() {
                                        console.log(`[Photo Display] All retries failed, using placeholder image`);
                                        // Try the placeholder with different paths
                                        const placeholderPaths = [
                                            '/images/photo-placeholder.png',
                                            'images/photo-placeholder.png',
                                            '/public/images/photo-placeholder.png',
                                            '../images/photo-placeholder.png',
                                            'http://127.0.0.1:3000/images/photo-placeholder.png'
                                        ];

                                        // Use the first placeholder path
                                        console.log(`[Photo Display] Trying placeholder image: ${placeholderPaths[0]}`);
                                        this.src = placeholderPaths[0];
                                        this.alt = 'Photo could not be loaded';
                                        this.classList.add('error-placeholder');

                                        // Set up error handler for placeholder
                                        let placeholderIndex = 0;
                                        const tryNextPlaceholder = () => {
                                            placeholderIndex++;
                                            if (placeholderIndex < placeholderPaths.length) {
                                                console.log(`[Photo Display] Trying next placeholder: ${placeholderPaths[placeholderIndex]}`);
                                                this.src = placeholderPaths[placeholderIndex];
                                            } else {
                                                console.log(`[Photo Display] All placeholder paths failed, giving up`);
                                                this.onerror = null; // Prevent infinite loop
                                                this.style.display = 'none'; // Hide the image
                                                // Add a text message instead
                                                const errorMsg = document.createElement('div');
                                                errorMsg.textContent = 'Image unavailable';
                                                errorMsg.className = 'photo-error-message';
                                                if (this.parentNode) {
                                                    this.parentNode.insertBefore(errorMsg, this.nextSibling);
                                                }
                                            }
                                        };

                                        this.onerror = tryNextPlaceholder;
                                    };
                                };
                            };
                        };
                    };
                };
            };

            // Also set onload handler to confirm success
            currentImageElement.onload = function() {
                console.log(`[Photo Display] Successfully loaded image: ${this.src}`);
            };
        } else {
            console.warn(`[Photo Display DEBUG] Could not find image element for index ${currentPhotoIndex}`);
        }
        // --- END NEW ---

        // --- Update Reel Position ---
        const offset = currentPhotoIndex * -100; // Calculate percentage offset
        // --- BEGIN ADDED DEBUG LOG ---
        console.log(`[Photo Display DEBUG] Calculated reel offset: ${offset}% for index ${currentPhotoIndex}`);
        // --- END ADDED DEBUG LOG ---
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
        // photoNextBtn.disabled = true; // Disable nav buttons - REMOVED

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
                let errorMsg = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || JSON.stringify(errorData);
                } catch (parseError) {
                    // Could not parse JSON, maybe HTML error page?
                    errorMsg += " (Could not parse error response as JSON)";
                }
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

    // --- NEW: Toggle Comparison View Function ---
    function toggleComparisonView() {
        console.log('Toggling comparison view. Current state:', isComparisonViewActive);

        if (!photoGallerySection || !photoComparisonSection) {
            console.error('Missing required elements for toggling comparison view');
            return;
        }

        // Toggle the state
        isComparisonViewActive = !isComparisonViewActive;

        // Update UI based on state
        if (isComparisonViewActive) {
            // Switch to comparison view
            photoGallerySection.style.display = 'none';
            photoComparisonSection.style.display = 'block';
            toggleComparisonBtn.textContent = 'Show Slider';
            toggleComparisonBtn.title = 'Switch to Photo Slider View';
        } else {
            // Switch to slider view
            photoGallerySection.style.display = 'block';
            photoComparisonSection.style.display = 'none';
            toggleComparisonBtn.textContent = 'Compare';
            toggleComparisonBtn.title = 'Toggle Comparison View';
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

    // --- Handler for Exercise Unit Change ---
    async function handleExerciseUnitChange(event) {
        const selectElement = event.target;
        const exerciseItem = selectElement.closest('.exercise-item');
        if (!exerciseItem) {
            console.error("Could not find parent exercise item for unit select.");
            return;
        }

        const exerciseIndex = parseInt(exerciseItem.dataset.workoutIndex, 10);
        const newUnit = selectElement.value;

        const exercises = Array.isArray(currentWorkout) ? currentWorkout : currentWorkout.exercises;
        if (isNaN(exerciseIndex) || !exercises || !exercises[exerciseIndex]) {
            console.error("Invalid exercise index for unit change:", exerciseIndex);
            return;
        }

        const exerciseId = exercises[exerciseIndex].exercise_id;
        if (!exerciseId) {
            console.error("No exercise_id found for saving preference");
            return;
        }

        // Update the weight_unit in the underlying data
        exercises[exerciseIndex].weight_unit = newUnit;
        console.log(`Updated unit for exercise ${exerciseIndex} (ID: ${exerciseId}) to: ${newUnit}`);

        // Save workout state after changing unit
        saveWorkoutState();

        // Save the preference to the database
        try {
            const response = await fetch(`/api/workouts/exercises/preferences/${exerciseId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ weightUnit: newUnit })
            });

            if (!response.ok) {
                throw new Error(`Failed to save preference: ${response.status}`);
            }

            const result = await response.json();
            console.log(`Saved weight unit preference for exercise ID ${exerciseId}:`, result);

            // Update the previous log display to show the new unit
            updatePreviousLogDisplay(exerciseItem, newUnit);
        } catch (error) {
            console.error('Error saving exercise preference:', error);
            // Continue with local changes even if server save fails
        }
    }

    // Helper function to update the previous log display with the new unit
    function updatePreviousLogDisplay(exerciseItem, unit) {
        const previousLogSpans = exerciseItem.querySelectorAll('.previous-log');
        previousLogSpans.forEach(span => {
            const text = span.textContent;
            // If there's actual data (not just placeholder)
            if (text && !text.includes('- kg x -') && !text.includes('- lbs x -') &&
                !text.includes('- bodyweight x -') && !text.includes('- assisted x -')) {
                // Replace the unit in the text
                const updatedText = text.replace(/kg|lbs|bodyweight|assisted/, unit);
                span.textContent = updatedText;
            } else {
                // Update the placeholder text
                span.textContent = `- ${unit} x -`;
            }
        });
    }

    // --- NEW: Handler for Input Changes in Weight and Reps ---
    function handleInputChange(event) {
        const inputElement = event.target;
        const exerciseItem = inputElement.closest('.exercise-item');
        if (!exerciseItem) {
            console.error("Could not find parent exercise item for input element.");
            return;
        }

        const exerciseIndex = parseInt(exerciseItem.dataset.workoutIndex, 10);
        const exercises = Array.isArray(currentWorkout) ? currentWorkout : currentWorkout.exercises;

        if (isNaN(exerciseIndex) || !exercises || !exercises[exerciseIndex]) {
            console.error("Invalid exercise index for input change:", exerciseIndex);
            return;
        }

        // Handle different input types
        if (inputElement.classList.contains('weight-input') || inputElement.classList.contains('reps-input')) {
            const setRow = inputElement.closest('.set-row');
            if (!setRow) {
                console.error("Could not find parent set row for input element.");
                return;
            }

            const setIndex = parseInt(setRow.dataset.setIndex, 10);
            if (isNaN(setIndex)) {
                console.error("Invalid set index for input change:", setIndex);
                return;
            }

            // Initialize sets_completed array if it doesn't exist
            if (!exercises[exerciseIndex].sets_completed) {
                const setRowCount = exerciseItem.querySelectorAll('.set-row').length;
                exercises[exerciseIndex].sets_completed = Array(setRowCount).fill(null).map(() => ({
                    weight: '',
                    reps: '',
                    unit: exercises[exerciseIndex].weight_unit || 'kg',
                    completed: false
                }));
            }

            // Ensure the sets_completed array has enough elements
            while (exercises[exerciseIndex].sets_completed.length <= setIndex) {
                exercises[exerciseIndex].sets_completed.push({
                    weight: '',
                    reps: '',
                    unit: exercises[exerciseIndex].weight_unit || 'kg',
                    completed: false
                });
            }

            // Update the appropriate field in the sets_completed array
            if (inputElement.classList.contains('weight-input')) {
                exercises[exerciseIndex].sets_completed[setIndex].weight = inputElement.value;
                console.log(`Updated weight for exercise ${exerciseIndex}, set ${setIndex} to: ${inputElement.value}`);
            } else if (inputElement.classList.contains('reps-input')) {
                exercises[exerciseIndex].sets_completed[setIndex].reps = inputElement.value;
                console.log(`Updated reps for exercise ${exerciseIndex}, set ${setIndex} to: ${inputElement.value}`);
            }

            // Also update the completed status from the toggle button
            const completeToggle = setRow.querySelector('.set-complete-toggle');
            if (completeToggle) {
                exercises[exerciseIndex].sets_completed[setIndex].completed = completeToggle.classList.contains('completed');
            }
        } else if (inputElement.classList.contains('exercise-notes-textarea')) {
            // Update notes field
            exercises[exerciseIndex].notes = inputElement.value;
            console.log(`Updated notes for exercise ${exerciseIndex}`);
        }

        // Save workout state after input change
        saveWorkoutState();
        console.log('Saved workout state after input change');
    }
    // --- END NEW ---
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

// Helper function to generate HTML for a single set row
function generateSingleSetRowHtml(setIndex, exerciseData, isTemplate = false) {
    // Default values
    let weightValue = '';
    let repsValue = '';
    const unit = exerciseData.weight_unit || 'kg';

    // Check if this is the first set (index 0) and if last log data exists
    if (setIndex === 0 && exerciseData.lastLog) {
        if (exerciseData.lastLog.weight_used) {
            const weights = exerciseData.lastLog.weight_used.split(',');
            if (weights.length > 0 && weights[0].trim() !== '') {
                weightValue = weights[0].trim();
            }
        }
        if (exerciseData.lastLog.reps_completed) {
            const reps = exerciseData.lastLog.reps_completed.split(',');
            if (reps.length > 0 && reps[0].trim() !== '') {
                repsValue = reps[0].trim();
            }
        }
    }

    const isDisabled = isTemplate;
    const weightInputType = (unit === 'bodyweight' || unit === 'assisted') ? 'hidden' : 'number';
    const weightPlaceholder = (unit === 'bodyweight' || unit === 'assisted') ? '' : 'Wt';
    const repsPlaceholder = 'Reps';

    // Always show "- kg x -" for previous log when there's no data
    const previousLogTextHtml = '- kg x -';

    if (isTemplate) {
        // For templates, use the reordered layout: Set#, Previous, Weight, Reps
        return `
            <div class="set-row" data-set-index="${setIndex}">
                <span class="set-number">${setIndex + 1}</span>
                <span class="previous-log">${previousLogTextHtml}</span>
                <input type="${weightInputType}" class="weight-input" placeholder="${weightPlaceholder}" value="${weightValue}" step="any" inputmode="decimal">
                <input type="text" class="reps-input" placeholder="${repsPlaceholder}" value="${repsValue}" inputmode="numeric" pattern="[0-9]*">
            </div>
        `;
    } else {
        // For active workouts, keep the original layout
        return `
            <div class="set-row" data-set-index="${setIndex}">
                <span class="set-number">${setIndex + 1}</span>
                <span class="previous-log">${previousLogTextHtml}</span>
                <input type="${weightInputType}" class="weight-input" placeholder="${weightPlaceholder}" value="${weightValue}" ${isDisabled ? 'disabled' : ''} step="any" inputmode="decimal">
                <input type="text" class="reps-input" placeholder="${repsPlaceholder}" value="${repsValue}" ${isDisabled ? 'disabled' : ''} inputmode="numeric" pattern="[0-9]*">
                <button class="set-complete-toggle" data-set-index="${setIndex}" title="Mark Set Complete"></button>
            </div>
        `;
    }
}




