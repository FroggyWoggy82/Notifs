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

    // --- Device Detection and Touch Utilities ---
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log('[Device Detection] Running on mobile device:', isMobile);

    // Add touch-device class to body for CSS targeting
    if (isMobile || ('ontouchstart' in window)) {
        document.body.classList.add('touch-device');
    }

    // Utility function to make touch events more responsive
    function addPassiveTouchListener(element, eventType, handler) {
        if (!element) return;
        // Use passive: true to improve scrolling performance
        element.addEventListener(eventType, handler, { passive: true });
    }

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
    let lastInputSaveTime = 0; // Track when inputs were last saved

    // Variables to track the exercise being edited
    let currentEditingExerciseIndex = -1;
    let currentEditingExerciseId = null;

    // --- Local Storage Keys ---
    const STORAGE_KEYS = {
        CURRENT_WORKOUT: 'workout_tracker_current_workout',
        WORKOUT_START_TIME: 'workout_tracker_start_time',
        CURRENT_PAGE: 'workout_tracker_current_page',
        INPUT_VALUES: 'workout_tracker_input_values' // New key for storing input values
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

    // --- Photo Navigation Buttons ---
    const photoPrevBtn = document.getElementById('photo-prev-btn');
    const photoNextBtn = document.getElementById('photo-next-btn');

    // --- Exercise Edit Modal Elements ---
    const exerciseEditModal = document.getElementById('exercise-edit-modal');
    const exerciseEditForm = document.getElementById('exercise-edit-form');
    const editExerciseNameInput = document.getElementById('edit-exercise-name');
    const saveAsNewExerciseCheckbox = document.getElementById('save-as-new-exercise');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const saveEditBtn = document.getElementById('save-edit-btn');
    const exerciseEditModalCloseBtn = exerciseEditModal ? exerciseEditModal.querySelector('.close-button') : null;

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
    const defaultSetsInput = document.getElementById('default-sets');
    const defaultRepsInput = document.getElementById('default-reps');
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
    const deletePhotoBtn = document.getElementById('delete-photo-btn');
    const photoReel = document.querySelector('.photo-reel'); // Reel container
    const paginationDotsContainer = document.querySelector('.pagination-dots'); // Added
    const currentPhotoDateDisplay = document.getElementById('current-photo-date-display'); // NEW: Date display element
    // const photoPrevPreview = document.getElementById('photo-prev-preview'); // Removed
    // const photoNextPreview = document.getElementById('photo-next-preview'); // Removed

    // --- Photo Navigation Buttons (already declared above) ---
    console.log('Navigation buttons:', photoPrevBtn, photoNextBtn);

    // --- NEW: Get containers for delegation ---
    const photoSliderContainer = document.querySelector('.photo-slider-container');
    const photoNavigationContainer = document.querySelector('.photo-navigation-container');

    // --- NEW: Comparison DOM References ---
    const comparePhotosBtn = document.getElementById('compare-photos-btn');
    const photoComparisonSection = document.getElementById('photo-comparison-section');
    const comparisonPhotoSelect1 = document.getElementById('comparison-photo-select-1');
    const comparisonPhotoSelect2 = document.getElementById('comparison-photo-select-2');
    const comparisonImage1 = document.getElementById('comparison-image-1');
    const comparisonImage2 = document.getElementById('comparison-image-2');

    // --- Helper function to generate HTML for set rows ---
    function generateSetRowsHtml(exerciseData, index, isTemplate = false) {
        let setRowsHtml = '';
        // Determine the number of sets based on the exercise's 'sets' property first,
        // then fall back to previously logged sets count or default.
        let numSets = 1; // Default to 1 set

        // First priority: Use the sets property if it exists and is valid
        if (exerciseData.sets && parseInt(exerciseData.sets) > 0) {
            numSets = parseInt(exerciseData.sets);
            console.log(`Using exercise.sets property for ${exerciseData.name}: ${numSets} sets`);
        }
        // Second priority: Use last log data if available
        else if (!isTemplate && exerciseData.lastLog && exerciseData.lastLog.reps_completed) {
            // If we have a last log, use the number of rep entries as the set count for rendering
            numSets = exerciseData.lastLog.reps_completed.split(',').length;
            console.log(`Using lastLog data for ${exerciseData.name}: ${numSets} sets`);
        }
        // Ensure at least one set is rendered
        numSets = Math.max(1, numSets);
        console.log(`Final set count for ${exerciseData.name}: ${numSets} sets`);

        // Parse the *entire* previous log data ONCE, if available
        let weightsArray = [];
        let repsArray = [];
        let prevUnit = 'lbs'; // Default to lbs
        if (!isTemplate && exerciseData.lastLog) {
             console.log(`[generateSetRowsHtml] Found lastLog for ${exerciseData.name}:`, exerciseData.lastLog);
            if (exerciseData.lastLog.weight_used) {
                weightsArray = exerciseData.lastLog.weight_used.split(',').map(w => w.trim());
            }
            if (exerciseData.lastLog.reps_completed) {
                repsArray = exerciseData.lastLog.reps_completed.split(',').map(r => r.trim());
            }
            prevUnit = exerciseData.lastLog.weight_unit || 'lbs'; // Default to lbs
             console.log(`[generateSetRowsHtml] Parsed arrays: weights=[${weightsArray}], reps=[${repsArray}]`);
        }

        for (let i = 0; i < numSets; i++) {
            // --- Per-Set Logic ---
            let weightValue = ''; // Pre-fill value for weight input
            let repsValue = '';   // Pre-fill value for reps input
            let previousLogTextHtml = '- lbs x -'; // Display text for previous log span (default to lbs)
            let goalTextHtml = ''; // Default empty goal
            const currentUnit = exerciseData.weight_unit || 'lbs'; // Use exercise's current unit setting (default to lbs)

            // For template exercises, use the default reps value if available
            if (isTemplate && exerciseData.reps) {
                repsValue = exerciseData.reps;
                console.log(`[generateSetRowsHtml] Template Set ${i}: Using default reps=${repsValue}`);
            }
            // Check if previous log data exists for THIS specific set index (i)
            else if (!isTemplate && weightsArray.length > i && repsArray.length > i) {
                const prevWeight = weightsArray[i];
                const prevReps = repsArray[i];

                // Only populate if values are not empty strings
                if (prevWeight !== '') {
                    weightValue = prevWeight;
                }
                if (prevReps !== '') {
                    repsValue = prevReps;
                }
                // Always update the display text if data exists for this set index
                previousLogTextHtml = `${prevWeight || '-'} ${prevUnit} x ${prevReps || '-'}`;
                 console.log(`[generateSetRowsHtml] Set ${i}: Pre-filling weight=${weightValue}, reps=${repsValue}. Display='${previousLogTextHtml}'`);

                // Calculate goal for next workout if not a template
                if (!isTemplate) {
                    const goal = calculateGoal(exerciseData);
                    if (goal && i < goal.sets.length) {
                        const goalSet = goal.sets[i];
                        goalTextHtml = `${goalSet.weight} ${goal.unit} x ${goalSet.reps}`;
                    }
                }
            } else if (!isTemplate){
                // If no specific data for this set index, keep inputs empty, show placeholder text
                 console.log(`[generateSetRowsHtml] Set ${i}: No previous data found for this index.`);
            }
            // --- End Per-Set Logic ---

            const isCompleted = !isTemplate && exerciseData.completedSets && exerciseData.completedSets[i];
            const isDisabled = isTemplate;
            // Always show weight input for bodyweight to record the user's current body weight
            // Only hide for assisted exercises
            const weightInputType = (currentUnit === 'assisted') ? 'hidden' : 'number';
            // Set appropriate placeholder based on unit type
            const weightPlaceholder = (currentUnit === 'bodyweight') ? 'BW' : (currentUnit === 'assisted') ? '' : 'Wt';
            const repsPlaceholder = 'Reps';

            // Generate the HTML for this specific set row
            setRowsHtml += `
                <div class="set-row" data-set-index="${i}">
                    <span class="set-number">${i + 1}</span>
                    <span class="previous-log">${previousLogTextHtml}</span>
                    <input type="${weightInputType}" class="weight-input" placeholder="${weightPlaceholder}" value="${weightValue}" ${isDisabled ? 'disabled' : ''} step="any" inputmode="decimal">
                    <input type="text" class="reps-input" placeholder="${repsPlaceholder}" value="${repsValue}" ${isDisabled ? 'disabled' : ''} inputmode="numeric" pattern="[0-9]*">
                    <span class="goal-target" title="Goal for next workout">${goalTextHtml}</span>
                    ${!isTemplate ? `<button class="set-complete-toggle ${isCompleted ? 'completed' : ''}" data-workout-index="${index}" data-set-index="${i}" title="Mark Set Complete"></button>` : ''}
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
        // Add detailed logging
        const sourceArrayName = (filteredTemplates === workoutTemplates) ? 'global workoutTemplates' : 'filteredTemplates argument';
        console.log(`[Render Templates] Called. Using ${sourceArrayName}. Rendering ${filteredTemplates.length} templates.`);

        if (!templateListContainer) {
            console.error('[Render Templates] Error: templateListContainer not found!');
            return;
        }

        console.log('[Render Templates] Clearing container...');
        templateListContainer.innerHTML = ''; // Clear previous

        if (filteredTemplates.length === 0) {
            console.log(`[Render Templates] No templates match filter, showing empty message.`);
            // Use a more specific message for empty search results
            const emptyMessage = (sourceArrayName === 'filteredTemplates argument')
                ? 'No templates found matching your search.'
                : 'No templates created yet.';
            templateListContainer.innerHTML = `<p>${emptyMessage}</p>`;
            return;
        }

        console.log(`[Render Templates] Starting loop to append ${filteredTemplates.length} templates.`);
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
        console.log(`[Render Templates] Finished appending templates.`);
    }

    // Store the checked state of exercises and their order
    const checkedExercises = new Set();
    // Track the order in which exercises were checked
    const checkedExercisesOrder = [];

    function renderAvailableExercises(searchTerm = '', category = 'all') {
        // Save checked state before clearing the list, but only for checked items
        // This ensures we don't remove items that are checked but not visible due to filtering
        const currentCheckboxes = availableExerciseListEl.querySelectorAll('input[type="checkbox"]');
        currentCheckboxes.forEach(checkbox => {
            const exerciseId = parseInt(checkbox.value, 10);
            if (checkbox.checked) {
                // Add to checked set
                checkedExercises.add(exerciseId);
                // Add to order array if not already there
                if (!checkedExercisesOrder.includes(exerciseId)) {
                    checkedExercisesOrder.push(exerciseId);
                }
            }
            // We don't remove unchecked items here - they will only be removed when explicitly unchecked
            // This allows items to remain checked even when filtered out by search
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

            // Add change event listener to track check order
            checkbox.addEventListener('change', (e) => {
                const exerciseId = parseInt(e.target.value, 10);
                if (e.target.checked) {
                    // Add to checked set
                    checkedExercises.add(exerciseId);
                    // Add to order array if not already there
                    if (!checkedExercisesOrder.includes(exerciseId)) {
                        checkedExercisesOrder.push(exerciseId);
                    }
                    console.log(`Exercise ${exerciseId} checked. Total checked: ${checkedExercises.size}`);
                } else {
                    // Remove from checked set
                    checkedExercises.delete(exerciseId);
                    // Remove from order array
                    const index = checkedExercisesOrder.indexOf(exerciseId);
                    if (index > -1) {
                        checkedExercisesOrder.splice(index, 1);
                    }
                    console.log(`Exercise ${exerciseId} unchecked. Total checked: ${checkedExercises.size}`);
                }
            });

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

            // Restore input values after rendering if we're on the active page
            if (currentPage === 'active') {
                setTimeout(() => {
                    // Restore using our persistence module if available
                    if (typeof restoreWorkoutData === 'function') {
                        restoreWorkoutData();
                    } else {
                        // Fallback to regular restore
                        restoreInputValues();
                    }
                }, 300);
            }
        }).catch(error => {
            console.error("Error rendering one or more workout items:", error);
            currentExerciseListEl.innerHTML = '<p style="color: red;">Error displaying workout. Please try refreshing.</p>';
        });
    }

    // --- Reworked function to render a single exercise item (lastLogData now part of exerciseData) ---
    async function renderSingleExerciseItem(exerciseItemElement, exerciseData, index, isTemplate = false) {
        console.log(`[Render Single] Rendering exercise '${exerciseData.name}' at index ${index}, isTemplate: ${isTemplate}`);

        // Store whether this is a template exercise to use later
        exerciseItemElement.dataset.isTemplate = isTemplate ? 'true' : 'false';

        // Ensure weight_unit is set if not defined
        if (!exerciseData.weight_unit) {
            // Check if we have a saved preference first
            try {
                const baseUrl = window.location.origin;
                const response = await fetch(`${baseUrl}/api/exercise-preferences/${exerciseData.exercise_id}`, {
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    const preference = await response.json();
                    if (preference && preference.weight_unit) {
                        // Use the saved preference
                        exerciseData.weight_unit = preference.weight_unit;
                        console.log(`[Render Single] Applied saved preference '${preference.weight_unit}' for exercise '${exerciseData.name}'`);
                    } else {
                        // No saved preference, use default
                        exerciseData.weight_unit = 'lbs';
                        console.log(`[Render Single] No saved preference found, using default 'lbs' for exercise '${exerciseData.name}'`);
                    }
                } else {
                    // API error, use default
                    exerciseData.weight_unit = 'lbs';
                    console.log(`[Render Single] Error fetching preference, using default 'lbs' for exercise '${exerciseData.name}'`);
                }
            } catch (error) {
                // Exception, use default
                exerciseData.weight_unit = 'lbs';
                console.log(`[Render Single] Exception fetching preference, using default 'lbs' for exercise '${exerciseData.name}'`);
            }
        }

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

        // Prepare target sets x reps display if this is from a template
        let targetSetsRepsHtml = '';
        if (!isTemplate && exerciseData.template_sets && exerciseData.template_reps) {
            // This is a live workout created from a template with default sets/reps
            targetSetsRepsHtml = `<div class="target-sets-reps">Target Sets×Reps: ${exerciseData.template_sets}×${exerciseData.template_reps}</div>`;
        }

        // For template exercises, add per-exercise sets and reps inputs
        let perExerciseSettingsHtml = '';
        if (isTemplate) {
            // Get the default values from the template settings
            const defaultSetsValue = defaultSetsInput ? defaultSetsInput.value : '3';
            const defaultRepsValue = defaultRepsInput ? defaultRepsInput.value : '';

            // Use the exercise's values if they exist, otherwise use the template defaults
            const exerciseSets = exerciseData.sets || defaultSetsValue;
            const exerciseReps = exerciseData.reps || defaultRepsValue;

            perExerciseSettingsHtml = `
                <div class="exercise-specific-settings">
                    <div class="exercise-setting">
                        <label>Sets:</label>
                        <input type="number" class="exercise-sets-input" value="${exerciseSets}" min="1" data-workout-index="${index}">
                    </div>
                    <div class="exercise-setting">
                        <label>Reps:</label>
                        <input type="text" class="exercise-reps-input" value="${exerciseReps}" placeholder="e.g., 8-12" data-workout-index="${index}">
                    </div>
                </div>
            `;
        }

        // Construct the inner HTML for the exercise item with a more compact layout
        // Use different HTML structure for template editor vs active workout
        if (isTemplate) {
            exerciseItemElement.innerHTML = `
                <div class="exercise-item-header">
                    <h4>${escapeHtml(exerciseData.name)}</h4>
                    <button class="btn-exercise-options" data-workout-index="${index}" title="Exercise Options">...</button>
                    <!-- Options Menu (Hidden by default) -->
                    <div class="exercise-options-menu" id="options-menu-${index}">
                        <!-- Weight Unit Option -->
                        <div class="exercise-options-menu-item weight-unit">
                            <select class="exercise-unit-select" data-workout-index="${index}">
                                <option value="lbs" ${exerciseData.weight_unit === 'lbs' || !exerciseData.weight_unit ? 'selected' : ''}>lbs</option>
                                <option value="kg" ${exerciseData.weight_unit === 'kg' ? 'selected' : ''}>kg</option>
                                <option value="bodyweight" ${exerciseData.weight_unit === 'bodyweight' ? 'selected' : ''}>BW</option>
                                <option value="assisted" ${exerciseData.weight_unit === 'assisted' ? 'selected' : ''}>Assisted</option>
                            </select>
                        </div>
                        <!-- Delete Option -->
                        <div class="exercise-options-menu-item delete">
                            <button class="btn-delete-template-exercise" data-workout-index="${index}" title="Remove Exercise">&times;</button>
                        </div>
                    </div>
                </div>
                ${perExerciseSettingsHtml}
                <div class="exercise-notes-group">
                    <textarea class="exercise-notes-textarea" placeholder="Notes for this exercise...">${escapeHtml(exerciseData.notes || '')}</textarea>
                </div>
                <div class="sets-container"> ${setsHtml} </div>
                <div class="set-actions-container">
                    <button type="button" class="btn btn-danger btn-remove-set">- Remove Set</button>
                    <button type="button" class="btn btn-secondary btn-add-set">+ Add Set</button>
                </div>
        `;
        } else {
            // Regular active workout HTML structure
            exerciseItemElement.innerHTML = `
                <div class="exercise-item-header">
                    <h4>${escapeHtml(exerciseData.name)}</h4>
                    <button class="btn-exercise-options" data-workout-index="${index}" title="Exercise Options">...</button>
                    <!-- Options Menu (Hidden by default) -->
                    <div class="exercise-options-menu" id="options-menu-${index}">
                        <!-- Weight Unit Option -->
                        <div class="exercise-options-menu-item">
                            <label for="weight-unit-${index}">Weight Unit:</label>
                            <select id="weight-unit-${index}" class="weight-unit-select" data-workout-index="${index}">
                                <option value="lbs" ${exerciseData.weight_unit === 'lbs' ? 'selected' : ''}>lbs</option>
                                <option value="kg" ${exerciseData.weight_unit === 'kg' ? 'selected' : ''}>kg</option>
                                <option value="bodyweight" ${exerciseData.weight_unit === 'bodyweight' ? 'selected' : ''}>bodyweight</option>
                                <option value="assisted" ${exerciseData.weight_unit === 'assisted' ? 'selected' : ''}>assisted</option>
                            </select>
                        </div>
                        <!-- Edit Name Option -->
                        <div class="exercise-options-menu-item">
                            <button class="btn-edit-exercise-name" data-workout-index="${index}" title="Edit Exercise Name">✏️ Edit Name</button>
                        </div>
                        <!-- Delete Option -->
                        <div class="exercise-options-menu-item delete">
                            <button class="btn-delete-exercise" data-workout-index="${index}" title="Remove Exercise">&times;</button>
                        </div>
                    </div>
                </div>
                ${targetSetsRepsHtml}
                <div class="exercise-notes-group">
                    <textarea class="exercise-notes-textarea" placeholder="Notes for this exercise...">${escapeHtml(exerciseData.notes || '')}</textarea>
                </div>
                <div class="column-headers">
                    <span>Set</span>
                    <span>Prev</span>
                    <span>Wt</span>
                    <span>Reps</span>
                    <span>Goal</span>
                    <span>✓</span>
                </div>
                <div class="sets-container"> ${setsHtml} </div>
                <div class="set-actions-container">
                    <button type="button" class="btn btn-danger btn-remove-set">- Remove Set</button>
                    <button type="button" class="btn btn-secondary btn-add-set">+ Add Set</button>
                </div>
            `;
        }

        // Initialize state for the remove button
        const removeButton = exerciseItemElement.querySelector('.btn-remove-set');
        const setRowsCount = exerciseItemElement.querySelectorAll('.set-row').length;
        if (removeButton) {
            removeButton.disabled = setRowsCount <= 1;
        }

        // Re-attach input listeners if needed, or rely on delegation
        // Example if needed: setupSetInputListeners(exerciseItemElement);

         console.log(`[Render Single] Finished rendering '${exerciseData.name}'`);
    }

    // --- Event Handlers ---

    // --- Exercise Options Menu Functions ---
    function toggleOptionsMenu(event) {
        const optionsButton = event.target;
        const workoutIndex = optionsButton.dataset.workoutIndex || optionsButton.dataset.index;
        const isTemplate = !optionsButton.dataset.workoutIndex;
        const menuId = isTemplate ? `template-options-menu-${workoutIndex}` : `options-menu-${workoutIndex}`;
        const menu = document.getElementById(menuId);

        if (!menu) {
            console.error(`Options menu not found: ${menuId}`);
            return;
        }

        // Close all other open menus first
        document.querySelectorAll('.exercise-options-menu.show').forEach(openMenu => {
            if (openMenu !== menu) {
                openMenu.classList.remove('show');
            }
        });

        // Toggle this menu
        menu.classList.toggle('show');

        // Prevent the click from propagating to the document
        event.stopPropagation();
    }

    // Close all menus when clicking outside
    document.addEventListener('click', function(event) {
        // If the click is inside an options menu or on an options button, do nothing
        if (event.target.closest('.exercise-options-menu') ||
            event.target.classList.contains('btn-exercise-options')) {
            return;
        }

        // Close all open menus
        document.querySelectorAll('.exercise-options-menu.show').forEach(menu => {
            menu.classList.remove('show');
        });
    });

    // --- Exercise Name Edit Functions ---
    function openExerciseEditModal(index) {
        if (!exerciseEditModal) return;

        currentEditingExerciseIndex = index;
        const exercise = currentWorkout.exercises[index];
        currentEditingExerciseId = exercise.exercise_id;

        // Set the current name in the input field
        if (editExerciseNameInput) {
            editExerciseNameInput.value = exercise.name;
        }

        // Reset the checkbox
        if (saveAsNewExerciseCheckbox) {
            saveAsNewExerciseCheckbox.checked = false;
        }

        // Show the modal
        exerciseEditModal.style.display = 'block';
    }

    function closeExerciseEditModal() {
        if (!exerciseEditModal) return;

        // Reset state variables
        currentEditingExerciseIndex = -1;
        currentEditingExerciseId = null;

        // Hide the modal
        exerciseEditModal.style.display = 'none';
    }

    async function handleSaveExerciseName(event) {
        event.preventDefault();

        if (currentEditingExerciseIndex < 0 || !editExerciseNameInput) return;

        const newName = editExerciseNameInput.value.trim();
        if (!newName) {
            alert('Please enter a valid exercise name');
            return;
        }

        const exercise = currentWorkout.exercises[currentEditingExerciseIndex];
        const originalExerciseId = exercise.exercise_id; // Store the original ID
        const originalName = exercise.name; // Store the original name

        // Update the exercise name in the current workout
        exercise.name = newName;

        // If the user wants to save this as a new exercise for future use
        if (saveAsNewExerciseCheckbox && saveAsNewExerciseCheckbox.checked) {
            try {
                // First check if an exercise with this name already exists
                const existingExercise = availableExercises.find(ex =>
                    ex.name.toLowerCase() === newName.toLowerCase());

                if (existingExercise) {
                    // Exercise with this name already exists, ask user what to do
                    const useExisting = confirm(
                        `An exercise named "${newName}" already exists. \n\n` +
                        `• Click OK to use the existing exercise (ID: ${existingExercise.exercise_id}). \n` +
                        `• Click Cancel to keep your original exercise name.`
                    );

                    if (useExisting) {
                        // Use the existing exercise ID
                        exercise.exercise_id = existingExercise.exercise_id;
                        console.log(`Using existing exercise ID ${existingExercise.exercise_id} for "${newName}"`);
                    } else {
                        // Revert to original name but keep the edit in the current workout
                        exercise.name = originalName;
                        exercise.exercise_id = originalExerciseId;
                        console.log(`Keeping original exercise name "${originalName}" and ID ${originalExerciseId}`);
                    }
                } else {
                    // Create a new exercise in the database
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

                    // Handle 409 Conflict (exercise name already exists)
                    if (response.status === 409) {
                        const errorData = await response.json();
                        console.log('Exercise name conflict:', errorData);

                        // Try to find the existing exercise in the database
                        let existingId = null;
                        try {
                            // Fetch all exercises to get the latest list
                            const refreshResponse = await fetch('/api/workouts/exercises');
                            if (refreshResponse.ok) {
                                const refreshedExercises = await refreshResponse.json();
                                // Update our local list
                                availableExercises = refreshedExercises;
                                // Find the exercise with the same name
                                const existingEx = refreshedExercises.find(ex =>
                                    ex.name.toLowerCase() === newName.toLowerCase());
                                if (existingEx) {
                                    existingId = existingEx.exercise_id;
                                }
                            }
                        } catch (refreshError) {
                            console.error('Error refreshing exercise list:', refreshError);
                        }

                        // Ask user if they want to use the existing exercise
                        const useExisting = confirm(
                            `An exercise named "${newName}" already exists. \n\n` +
                            `• Click OK to use the existing exercise${existingId ? ` (ID: ${existingId})` : ''}. \n` +
                            `• Click Cancel to keep your original exercise name.`
                        );

                        if (useExisting && existingId) {
                            // Use the existing exercise ID
                            exercise.exercise_id = existingId;
                            console.log(`Using existing exercise ID ${existingId} for "${newName}"`);
                        } else {
                            // Revert to original name but keep the edit in the current workout
                            exercise.name = originalName;
                            exercise.exercise_id = originalExerciseId;
                            console.log(`Keeping original exercise name "${originalName}" and ID ${originalExerciseId}`);
                        }
                    } else if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    } else {
                        // Success - new exercise created
                        const newExercise = await response.json();
                        console.log('New exercise created:', newExercise);

                        // Update the exercise ID in the current workout
                        exercise.exercise_id = newExercise.exercise_id;

                        // Add the new exercise to the available exercises list
                        availableExercises.push(newExercise);

                        alert(`Exercise "${newName}" has been saved as a new exercise for future use.`);
                    }
                }
            } catch (error) {
                console.error('Error creating new exercise:', error);
                alert(`Error saving new exercise: ${error.message}`);

                // Revert to original name and ID on error
                exercise.name = originalName;
                exercise.exercise_id = originalExerciseId;
            }
        } else {
            // If not saving as new, keep the original exercise ID
            // This ensures we don't reset the workout history
            exercise.exercise_id = originalExerciseId;
            console.log(`Updated exercise name to "${newName}" while preserving history for ID ${originalExerciseId}`);
        }

        // Re-render the current workout to show the updated name
        renderCurrentWorkout();

        // Close the modal
        closeExerciseEditModal();
    }

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
        // Process visible checkboxes to update the checked state
        const currentCheckboxes = availableExerciseListEl.querySelectorAll('input[type="checkbox"]');

        // First, collect all visible exercise IDs to know what we can safely uncheck
        const visibleExerciseIds = new Set();
        currentCheckboxes.forEach(checkbox => {
            const exerciseId = parseInt(checkbox.value, 10);
            visibleExerciseIds.add(exerciseId);
        });

        // Now process the checkboxes
        currentCheckboxes.forEach(checkbox => {
            const exerciseId = parseInt(checkbox.value, 10);

            if (checkbox.checked) {
                // Add checked exercises to the set
                checkedExercises.add(exerciseId);
                // Add to order array if not already there
                if (!checkedExercisesOrder.includes(exerciseId)) {
                    checkedExercisesOrder.push(exerciseId);
                }
            } else {
                // Only remove from checkedExercises if it's visible and unchecked
                // This ensures that exercises that were checked but are now unchecked are removed
                checkedExercises.delete(exerciseId);

                // Remove from order array
                const index = checkedExercisesOrder.indexOf(exerciseId);
                if (index > -1) {
                    checkedExercisesOrder.splice(index, 1);
                }
            }
        });

        // Log the number of checked exercises for debugging
        console.log(`Closing modal with ${checkedExercises.size} checked exercises`);

        exerciseModal.style.display = 'none';
    }

    // --- Workout State Persistence Functions ---

    // Save current workout state to localStorage
    function saveWorkoutState() {
        try {
            // Only save if we have an active workout
            if (currentWorkout && (Array.isArray(currentWorkout) ? currentWorkout.length > 0 : currentWorkout.exercises?.length > 0)) {
                console.log('Saving workout state to localStorage');

                // Update weight units from UI before saving
                updateWeightUnitsFromUI();

                // Update set counts from UI before saving
                updateSetCountsFromUI();

                localStorage.setItem(STORAGE_KEYS.CURRENT_WORKOUT, JSON.stringify(currentWorkout));

                // Save workout start time if it exists
                if (workoutStartTime) {
                    localStorage.setItem(STORAGE_KEYS.WORKOUT_START_TIME, workoutStartTime.toString());
                }

                // Save current page if we're in active workout mode
                if (currentPage === 'active') {
                    localStorage.setItem(STORAGE_KEYS.CURRENT_PAGE, currentPage);
                }

                // Save input values
                saveInputValues();

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

    // Update weight units in currentWorkout from UI
    function updateWeightUnitsFromUI() {
        if (currentPage !== 'active') return;

        const exerciseItems = document.querySelectorAll('.exercise-item');
        if (!exerciseItems.length) return;

        exerciseItems.forEach(item => {
            const workoutIndex = parseInt(item.dataset.workoutIndex, 10);
            if (isNaN(workoutIndex)) return;

            const exercises = Array.isArray(currentWorkout) ? currentWorkout : currentWorkout.exercises;
            if (!exercises || !exercises[workoutIndex]) return;

            const unitSelect = item.querySelector('.exercise-unit-select');
            if (unitSelect) {
                // Update the weight_unit in the currentWorkout object
                exercises[workoutIndex].weight_unit = unitSelect.value;
            }
        });
    }

    // Update set counts in currentWorkout from UI
    function updateSetCountsFromUI() {
        if (currentPage !== 'active') return;

        const exerciseItems = document.querySelectorAll('.exercise-item');
        if (!exerciseItems.length) return;

        exerciseItems.forEach(item => {
            const workoutIndex = parseInt(item.dataset.workoutIndex, 10);
            if (isNaN(workoutIndex)) return;

            const exercises = Array.isArray(currentWorkout) ? currentWorkout : currentWorkout.exercises;
            if (!exercises || !exercises[workoutIndex]) return;

            // Count the number of set rows in this exercise item
            const setRows = item.querySelectorAll('.set-row');
            const setCount = setRows.length;

            // Update the sets property in the currentWorkout object
            exercises[workoutIndex].sets = setCount;
            console.log(`Updated exercise ${workoutIndex} (${exercises[workoutIndex].name}) sets to ${setCount}`);
        });
    }

    // Save all input values from the active workout
    function saveInputValues() {
        if (currentPage !== 'active') {
            console.log('Not saving input values - not on active page');
            return;
        }

        try {
            console.log('Saving input values to localStorage');
            const inputValues = {};

            // Wait for DOM to be ready
            if (!currentExerciseListEl) {
                console.error('Current exercise list element not found');
                return false;
            }

            // Get all exercise items in the current workout
            const exerciseItems = currentExerciseListEl.querySelectorAll('.exercise-item');
            console.log(`Found ${exerciseItems.length} exercise items to save`);

            // If no exercise items found, try again with a direct approach
            if (exerciseItems.length === 0) {
                console.log('No exercise items found in DOM, using workout data directly');

                // Get the exercise data from the current workout
                const exercises = Array.isArray(currentWorkout) ? currentWorkout : currentWorkout.exercises;
                if (!exercises || exercises.length === 0) {
                    console.error('No exercises found in current workout data');
                    return false;
                }

                // Save input values directly from the workout data
                exercises.forEach((exerciseData, workoutIndex) => {
                    const exerciseId = exerciseData.exercise_id;
                    console.log(`Saving data for exercise ID ${exerciseId} (${exerciseData.name}) from workout data`);

                    // Create a basic structure for this exercise
                    inputValues[exerciseId] = {
                        sets: [],
                        name: exerciseData.name,
                        workoutIndex: workoutIndex
                    };

                    // Try to get existing values from the DOM if available
                    const existingValues = {};
                    try {
                        // Check if we have any existing input values in the DOM
                        const exerciseItems = document.querySelectorAll('.exercise-item');
                        exerciseItems.forEach(item => {
                            const itemWorkoutIndex = parseInt(item.dataset.workoutIndex, 10);
                            if (itemWorkoutIndex === workoutIndex) {
                                // Found the exercise item, get its input values
                                const setRows = item.querySelectorAll('.set-row');
                                setRows.forEach((row, setIndex) => {
                                    const weightInput = row.querySelector('.weight-input');
                                    const repsInput = row.querySelector('.reps-input');
                                    const completeToggle = row.querySelector('.set-complete-toggle');

                                    existingValues[setIndex] = {
                                        weight: weightInput ? weightInput.value : '',
                                        reps: repsInput ? repsInput.value : '',
                                        completed: completeToggle ? completeToggle.classList.contains('completed') : false
                                    };
                                });
                            }
                        });
                    } catch (e) {
                        console.error('Error getting existing values:', e);
                    }

                    // Add sets based on the exercise data
                    const setCount = exerciseData.sets || 3; // Default to 3 sets if not specified
                    for (let i = 0; i < setCount; i++) {
                        // Use existing values if available, otherwise use empty values
                        inputValues[exerciseId].sets.push({
                            weight: existingValues[i] ? existingValues[i].weight : '',
                            reps: existingValues[i] ? existingValues[i].reps : '',
                            completed: existingValues[i] ? existingValues[i].completed : false
                        });
                    }
                });
            } else {
                // Process each exercise item in the DOM
                exerciseItems.forEach((item) => {
                    // Get exercise ID from the workout index and current workout data
                    const workoutIndex = parseInt(item.dataset.workoutIndex, 10);
                    console.log(`Processing exercise at index ${workoutIndex}`);

                    if (isNaN(workoutIndex)) {
                        console.error('Invalid workout index:', item.dataset.workoutIndex);
                        return;
                    }

                    // Get the exercise data from the current workout
                    const exercises = Array.isArray(currentWorkout) ? currentWorkout : currentWorkout.exercises;
                    if (!exercises || !exercises[workoutIndex]) {
                        console.error('Exercise not found at index:', workoutIndex);
                        return;
                    }

                    const exerciseData = exercises[workoutIndex];
                    const exerciseId = exerciseData.exercise_id;

                    console.log(`Saving data for exercise ID ${exerciseId} (${exerciseData.name})`);

                    // Get all set rows for this exercise
                    const setRows = item.querySelectorAll('.set-row');
                    console.log(`Found ${setRows.length} set rows for exercise ${exerciseId}`);

                    inputValues[exerciseId] = {
                        sets: [],
                        name: exerciseData.name,
                        workoutIndex: workoutIndex,
                        set_count: setRows.length // Save the current number of sets
                    };

                    setRows.forEach((row, setIndex) => {
                        const weightInput = row.querySelector('.weight-input');
                        const repsInput = row.querySelector('.reps-input');
                        const completeToggle = row.querySelector('.set-complete-toggle');

                        const weightValue = weightInput ? weightInput.value : '';
                        const repsValue = repsInput ? repsInput.value : '';
                        const isCompleted = completeToggle ? completeToggle.classList.contains('completed') : false;

                        console.log(`Set ${setIndex + 1}: weight=${weightValue}, reps=${repsValue}, completed=${isCompleted}`);

                        inputValues[exerciseId].sets[setIndex] = {
                            weight: weightValue,
                            reps: repsValue,
                            completed: isCompleted
                        };
                    });

                    // Get notes if they exist
                    const notesTextarea = item.querySelector('.exercise-notes-textarea');
                    if (notesTextarea) {
                        inputValues[exerciseId].notes = notesTextarea.value;
                        console.log(`Notes saved for exercise ${exerciseId}: ${notesTextarea.value.substring(0, 20)}${notesTextarea.value.length > 20 ? '...' : ''}`);
                    }
                });
            }

            // Save to localStorage
            const inputValuesJson = JSON.stringify(inputValues);
            localStorage.setItem(STORAGE_KEYS.INPUT_VALUES, inputValuesJson);
            lastInputSaveTime = Date.now();
            console.log('Input values saved at:', new Date(lastInputSaveTime).toLocaleTimeString());
            console.log('Saved data size:', Math.round(inputValuesJson.length / 1024), 'KB');
            console.log('Saved input values:', inputValues);

            return true;
        } catch (error) {
            console.error('Error saving input values:', error);
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

    // Restore input values from localStorage
    function restoreInputValues() {
        try {
            const savedInputValues = localStorage.getItem(STORAGE_KEYS.INPUT_VALUES);
            if (!savedInputValues) {
                console.log('No saved input values found');
                return false;
            }

            console.log('Restoring input values from localStorage');
            const inputValues = JSON.parse(savedInputValues);
            console.log('Parsed saved input values:', Object.keys(inputValues).length, 'exercises');
            console.log('Saved input values data:', inputValues);

            // Wait for DOM to be ready
            if (!currentExerciseListEl) {
                console.error('Current exercise list element not found');
                return false;
            }

            // Get all exercise items in the current workout
            const exerciseItems = currentExerciseListEl.querySelectorAll('.exercise-item');
            console.log(`Found ${exerciseItems.length} exercise items in the DOM`);

            // If no exercise items found in the DOM, wait and try again
            if (exerciseItems.length === 0) {
                console.log('No exercise items found in DOM, will retry in 500ms');
                setTimeout(() => restoreInputValues(), 500);
                return false;
            }

            // Map of exercise IDs to their workout indices
            const exerciseMap = {};

            // First, build a map of exercise IDs from the current workout
            const exercises = Array.isArray(currentWorkout) ? currentWorkout : currentWorkout.exercises;
            if (exercises) {
                exercises.forEach((exercise, index) => {
                    if (exercise && exercise.exercise_id) {
                        exerciseMap[exercise.exercise_id] = index;
                        console.log(`Mapped exercise ID ${exercise.exercise_id} (${exercise.name}) to index ${index}`);
                    }
                });
            }

            // Now restore values using the workout index
            exerciseItems.forEach((item) => {
                const workoutIndex = parseInt(item.dataset.workoutIndex, 10);
                if (isNaN(workoutIndex)) {
                    console.error('Invalid workout index:', item.dataset.workoutIndex);
                    return;
                }

                // Get the exercise data from the current workout
                if (!exercises || !exercises[workoutIndex]) {
                    console.error('Exercise not found at index:', workoutIndex);
                    return;
                }

                const exerciseData = exercises[workoutIndex];
                const exerciseId = exerciseData.exercise_id;

                console.log(`Checking for saved data for exercise ID ${exerciseId} (${exerciseData.name})`);

                if (!inputValues[exerciseId]) {
                    console.log(`No saved data found for exercise ID ${exerciseId}`);
                    return;
                }

                console.log(`Restoring data for exercise ID ${exerciseId} (${exerciseData.name})`);

                // Get all set rows for this exercise
                const setRows = item.querySelectorAll('.set-row');
                console.log(`Found ${setRows.length} set rows for exercise ${exerciseId}`);

                // Check if we need to adjust the number of sets
                const savedSetCount = inputValues[exerciseId].set_count || inputValues[exerciseId].sets.length;
                if (savedSetCount !== setRows.length) {
                    console.log(`Adjusting set count for exercise ${exerciseId} from ${setRows.length} to ${savedSetCount}`);

                    // Get the sets container
                    const setsContainer = item.querySelector('.sets-container');
                    if (!setsContainer) {
                        console.error('Sets container not found');
                        return;
                    }

                    // If we need to add sets
                    if (savedSetCount > setRows.length) {
                        // Generate HTML for the new set rows
                        for (let i = setRows.length; i < savedSetCount; i++) {
                            // Create a new set row
                            const newRow = document.createElement('div');
                            newRow.className = 'set-row';
                            newRow.dataset.setIndex = i;

                            // Create set number span
                            const setNumber = document.createElement('span');
                            setNumber.className = 'set-number';
                            setNumber.textContent = i + 1;
                            newRow.appendChild(setNumber);

                            // Get the current unit from the exercise
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
                    else if (savedSetCount < setRows.length) {
                        // Remove the extra set rows
                        for (let i = savedSetCount; i < setRows.length; i++) {
                            if (setRows[i]) {
                                setRows[i].remove();
                            }
                        }
                    }
                }

                // Check if we have any non-empty values to restore
                let hasNonEmptyValues = false;
                if (inputValues[exerciseId].sets) {
                    for (const set of inputValues[exerciseId].sets) {
                        if (set.weight || set.reps || set.completed) {
                            hasNonEmptyValues = true;
                            break;
                        }
                    }
                }

                if (!hasNonEmptyValues) {
                    console.log(`No non-empty values found for exercise ID ${exerciseId}`);

                    // If there are no saved values, initialize them from the DOM
                    setRows.forEach((row, setIndex) => {
                        const weightInput = row.querySelector('.weight-input');
                        const repsInput = row.querySelector('.reps-input');
                        const completeToggle = row.querySelector('.set-complete-toggle');

                        if (!inputValues[exerciseId].sets[setIndex]) {
                            inputValues[exerciseId].sets[setIndex] = {
                                weight: '',
                                reps: '',
                                completed: false
                            };
                        }

                        if (weightInput && weightInput.value) {
                            inputValues[exerciseId].sets[setIndex].weight = weightInput.value;
                            hasNonEmptyValues = true;
                        }

                        if (repsInput && repsInput.value) {
                            inputValues[exerciseId].sets[setIndex].reps = repsInput.value;
                            hasNonEmptyValues = true;
                        }

                        if (completeToggle && completeToggle.classList.contains('completed')) {
                            inputValues[exerciseId].sets[setIndex].completed = true;
                            hasNonEmptyValues = true;
                        }
                    });

                    // If we found any values in the DOM, save them to localStorage
                    if (hasNonEmptyValues) {
                        localStorage.setItem(STORAGE_KEYS.INPUT_VALUES, JSON.stringify(inputValues));
                        console.log('Initialized input values from DOM:', inputValues);
                    }
                }

                setRows.forEach((row, setIndex) => {
                    if (!inputValues[exerciseId].sets[setIndex]) {
                        console.log(`No saved data for set ${setIndex + 1}`);
                        return;
                    }

                    const savedSet = inputValues[exerciseId].sets[setIndex];
                    const weightInput = row.querySelector('.weight-input');
                    const repsInput = row.querySelector('.reps-input');
                    const completeToggle = row.querySelector('.set-complete-toggle');

                    if (weightInput && savedSet.weight !== undefined) {
                        weightInput.value = savedSet.weight;
                        console.log(`Restored weight for set ${setIndex + 1}: ${savedSet.weight}`);
                    }

                    if (repsInput && savedSet.reps !== undefined) {
                        repsInput.value = savedSet.reps;
                        console.log(`Restored reps for set ${setIndex + 1}: ${savedSet.reps}`);
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

                        console.log(`Restored completed state for set ${setIndex + 1}`);
                    }

                    // Log the actual values that were restored
                    console.log(`Set ${setIndex + 1} restored values: weight=${weightInput?.value || ''}, reps=${repsInput?.value || ''}, completed=${completeToggle?.classList.contains('completed') || false}`);

                    // Force a DOM update by triggering a change event
                    if (weightInput) {
                        const event = new Event('change', { bubbles: true });
                        weightInput.dispatchEvent(event);
                    }

                    if (repsInput) {
                        const event = new Event('change', { bubbles: true });
                        repsInput.dispatchEvent(event);
                    }
                });

                // Restore notes if they exist
                if (inputValues[exerciseId].notes) {
                    const notesTextarea = item.querySelector('.exercise-notes-textarea');
                    if (notesTextarea) {
                        notesTextarea.value = inputValues[exerciseId].notes;
                        console.log(`Restored notes for exercise ${exerciseId}`);
                    }
                }
            });

            console.log('Input values restored successfully');
            return true;
        } catch (error) {
            console.error('Error restoring input values:', error);
            return false;
        }
    }

    // Clear saved workout state
    function clearWorkoutState() {
        try {
            localStorage.removeItem(STORAGE_KEYS.CURRENT_WORKOUT);
            localStorage.removeItem(STORAGE_KEYS.WORKOUT_START_TIME);
            localStorage.removeItem(STORAGE_KEYS.CURRENT_PAGE);
            localStorage.removeItem(STORAGE_KEYS.INPUT_VALUES);
            console.log('Cleared saved workout state');
        } catch (error) {
            console.error('Error clearing workout state:', error);
        }
    }

    function switchPage(pageToShow) {
        console.log('switchPage called with:', pageToShow); // Log function call and argument

        // If we're navigating away from the active page, save the workout data
        if (currentPage === 'active' && pageToShow !== 'active') {
            console.log('Navigating away from active page, saving workout data');

            // First, update the set counts from the UI
            updateSetCountsFromUI();

            // Save the workout state
            saveWorkoutState();

            // Save using our persistence module if available
            if (typeof saveWorkoutData === 'function') {
                saveWorkoutData();
            } else {
                // Fallback to regular save
                saveInputValues();
            }
        }

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

            // Restore input values when switching to active page
            setTimeout(() => {
                // Restore using our persistence module if available
                if (typeof restoreWorkoutData === 'function') {
                    restoreWorkoutData();
                } else {
                    // Fallback to regular restore
                    restoreInputValues();
                }
            }, 300);
        } else if (pageToShow === 'editor') {
            templateEditorPage.classList.add('active');
            console.log('Applied active class to:', templateEditorPage);
        }
        // Ensure FAB visibility matches active page
        if (pageToShow === 'active') {
            addExerciseFab.style.display = 'flex'; // Use flex to properly center the + sign
        } else {
            addExerciseFab.style.display = 'none';
        }
    }

    function startEmptyWorkout() {
        console.log('Starting empty workout');
        // Clear any existing saved workout
        clearWorkoutState();

        // Initialize currentWorkout as an array with exercises property
        currentWorkout = {
            name: 'New Workout',
            exercises: []
        };
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

        // Initialize currentWorkout as an object with name and exercises array
        currentWorkout = {
            name: template.name, // Store template name
            exercises: template.exercises.map(ex => {
                // Get the number of sets from the template, default to 1 if not specified
                const numSets = parseInt(ex.sets) || 1;
                console.log(`Creating ${numSets} sets for exercise ${ex.name} from template`);

                return {
                    ...ex,
                    lastLog: undefined, // Mark for fetching
                    // Store template sets and reps for display
                    template_sets: numSets,
                    template_reps: ex.reps || '',
                    // Initialize sets_completed based on template 'sets' count
                    sets_completed: Array(numSets).fill(null).map(() => ({
                        weight: '',
                        reps: '',
                        unit: ex.weight_unit || 'lbs', // Default to lbs
                        completed: false // Ensure sets are not completed by default
                    }))
                };
            })
        };

        // Fetch and apply exercise unit preferences
        await applyExerciseUnitPreferences(currentWorkout.exercises);

        console.log("Current workout initialized from template:", currentWorkout); // Log the object

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
    }

    // Fetch and apply exercise unit preferences
    async function applyExerciseUnitPreferences(exercises) {
        try {
            // Create an array of promises for fetching preferences
            const preferencePromises = exercises.map(async (exercise) => {
                if (!exercise.exercise_id) return;

                try {
                    // Use window.location.origin to ensure we're using the correct host and port
                    const baseUrl = window.location.origin;
                    const response = await fetch(`${baseUrl}/api/exercise-preferences/${exercise.exercise_id}`, {
                        headers: { 'Accept': 'application/json' }
                    });
                    if (!response.ok) return;

                    const preference = await response.json();
                    if (preference && preference.weight_unit) {
                        // Apply the saved preference to the exercise data
                        exercise.weight_unit = preference.weight_unit;

                        // Also apply to any sets_completed units
                        if (exercise.sets_completed && Array.isArray(exercise.sets_completed)) {
                            exercise.sets_completed.forEach(set => {
                                if (set) set.unit = preference.weight_unit;
                            });
                        }

                        console.log(`Applied saved unit preference for exercise ${exercise.exercise_id}: ${preference.weight_unit}`);
                    } else {
                        // Ensure default is lbs when no preference is found
                        exercise.weight_unit = 'lbs';

                        // Also apply default to any sets_completed units
                        if (exercise.sets_completed && Array.isArray(exercise.sets_completed)) {
                            exercise.sets_completed.forEach(set => {
                                if (set) set.unit = 'lbs';
                            });
                        }

                        console.log(`No preference found for exercise ${exercise.exercise_id}, using default: lbs`);
                    }
                } catch (error) {
                    console.error(`Error fetching preference for exercise ${exercise.exercise_id}:`, error);
                    // Set default to lbs when there's an error
                    exercise.weight_unit = 'lbs';

                    // Also apply default to any sets_completed units
                    if (exercise.sets_completed && Array.isArray(exercise.sets_completed)) {
                        exercise.sets_completed.forEach(set => {
                            if (set) set.unit = 'lbs';
                        });
                    }

                    console.log(`Error fetching preference for exercise ${exercise.exercise_id}, using default: lbs`);
                }
            });

            // Wait for all preference fetches to complete
            await Promise.all(preferencePromises);

            // After rendering, update any unit dropdowns in the DOM
            setTimeout(() => {
                updateUnitDropdownsInDOM(exercises);
            }, 100); // Small delay to ensure DOM is updated
        } catch (error) {
            console.error('Error applying exercise unit preferences:', error);
            // Set default to lbs for all exercises when there's an error
            if (exercises && Array.isArray(exercises)) {
                exercises.forEach(exercise => {
                    if (exercise) {
                        exercise.weight_unit = 'lbs';

                        // Also apply default to any sets_completed units
                        if (exercise.sets_completed && Array.isArray(exercise.sets_completed)) {
                            exercise.sets_completed.forEach(set => {
                                if (set) set.unit = 'lbs';
                            });
                        }
                    }
                });
                console.log('Applied default weight unit (lbs) to all exercises due to error');
            }
        }
    }

    // Helper function to update unit dropdowns in the DOM
    function updateUnitDropdownsInDOM(exercises) {
        exercises.forEach((exercise, index) => {
            if (!exercise.exercise_id) return;

            // Ensure weight_unit is set, default to 'lbs' if not
            if (!exercise.weight_unit) {
                exercise.weight_unit = 'lbs';
                console.log(`No weight unit found for exercise ${exercise.exercise_id}, setting default: lbs`);
            }

            // Find the dropdown for this exercise
            const exerciseItems = document.querySelectorAll('.exercise-item');
            if (exerciseItems.length <= index) return;

            const unitSelect = exerciseItems[index].querySelector('.exercise-unit-select');
            if (unitSelect) {
                if (unitSelect.value !== exercise.weight_unit) {
                    console.log(`Updating DOM dropdown for exercise ${exercise.exercise_id} to ${exercise.weight_unit}`);
                    unitSelect.value = exercise.weight_unit;
                } else {
                    console.log(`DOM dropdown for exercise ${exercise.exercise_id} already set to ${exercise.weight_unit}`);
                }
            }
        });
    }


    async function addExerciseToWorkout(exerciseId, targetList) { // Added targetList parameter
        // Removed reading targetList from modal dataset here
        const exercise = availableExercises.find(ex => ex.exercise_id === exerciseId);
        if (!exercise) {
            console.error('Exercise not found in available list', exerciseId);
            alert('Error finding selected exercise.');
            return;
        }

        console.log(`Adding exercise: ${exercise.name} to ${targetList} list`);

        // Get default sets and reps from the template settings if adding to template
        let defaultSets = 1;
        let defaultReps = '';

        if (targetList === 'editor' && defaultSetsInput && defaultRepsInput) {
            defaultSets = parseInt(defaultSetsInput.value) || 1;
            defaultReps = defaultRepsInput.value || '';
            console.log(`Using default settings: ${defaultSets} sets, reps: ${defaultReps}`);
        }

        const newExerciseData = {
            exercise_id: exercise.exercise_id,
            name: exercise.name,
            category: exercise.category,
            sets: defaultSets, // Use default sets from template settings
            reps: defaultReps, // Use default reps from template settings
            weight: null,
            weight_unit: null, // Will be set after fetching preference
            order_position: (targetList === 'active' ? currentWorkout.length : currentTemplateExercises.length),
            notes: '',
            // Only add completedSets for active workouts, not templates
            ...(targetList === 'active' && {
                completedSets: Array(defaultSets).fill(false), // Default completedSets based on default sets
                // Store template sets and reps for display in active workout
                template_sets: defaultSets,
                template_reps: defaultReps
            }),
            lastLog: undefined // Mark lastLog as not yet fetched
        };

        // Fetch and apply unit preference for this exercise
        try {
            const baseUrl = window.location.origin;
            const response = await fetch(`${baseUrl}/api/exercise-preferences/${exerciseId}`, {
                headers: { 'Accept': 'application/json' }
            });
            if (response.ok) {
                const preference = await response.json();
                if (preference && preference.weight_unit) {
                    // Use the saved preference
                    newExerciseData.weight_unit = preference.weight_unit;
                    console.log(`Applied saved unit preference for new exercise: ${newExerciseData.weight_unit}`);
                } else {
                    // No saved preference, use default
                    newExerciseData.weight_unit = 'lbs';
                    console.log('No saved preference found, using default: lbs');
                }
            } else {
                // API error, use default
                newExerciseData.weight_unit = 'lbs';
                console.log('Error fetching preference, using default: lbs');
            }
        } catch (error) {
            console.error('Error fetching exercise unit preference:', error);
            // API error, use default
            newExerciseData.weight_unit = 'lbs';
            console.log('Exception fetching preference, using default: lbs');
        }

        if (targetList === 'active') {
            // Check if currentWorkout is properly initialized with exercises array
            if (!currentWorkout) {
                currentWorkout = { name: 'New Workout', exercises: [] };
            } else if (!currentWorkout.exercises) {
                // If currentWorkout exists but doesn't have exercises array
                currentWorkout.exercises = [];
            }

            // Now safely push to the exercises array
            currentWorkout.exercises.push(newExerciseData);
            renderCurrentWorkout(); // Update the active workout list UI
        } else { // targetList === 'editor'
            currentTemplateExercises.push(newExerciseData);
            renderTemplateExerciseList(); // Update the template editor list UI
        }
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
            exercisesArray = currentWorkout.exercises;
            listElement = currentExerciseListEl;
        } else if (currentPage === 'template-editor') {
            // Assuming template exercises are stored in a variable like `templateEditorExercises`
            // This needs to be adapted based on how template editor data is stored
            exercisesArray = templateEditorData.exercises; // Example variable name
            listElement = templateExerciseListEl; // Example list element
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

    // --- Handler for Deleting Exercise from Template Editor ---
    function handleDeleteTemplateExercise(deleteButton) { // Changed parameter to expect the button element
        const indexToRemove = parseInt(deleteButton.dataset.index, 10); // Use dataset.index from the button
        if (!isNaN(indexToRemove) && indexToRemove >= 0 && indexToRemove < currentTemplateExercises.length) {
             const exerciseName = currentTemplateExercises[indexToRemove]?.name || 'this exercise';
             if (confirm(`Are you sure you want to remove ${exerciseName} from this template?`)) {
                 console.log(`[handleDeleteTemplateExercise] Attempting to remove index ${indexToRemove}.`);
                 console.log(`[handleDeleteTemplateExercise] Array length BEFORE splice: ${currentTemplateExercises.length}`);

                 // Remove the exercise from the array
                 currentTemplateExercises.splice(indexToRemove, 1); // Modifies the array
                 console.log(`[handleDeleteTemplateExercise] Array length AFTER splice: ${currentTemplateExercises.length}`);

                 // Re-assign order_position for remaining exercises
                 currentTemplateExercises.forEach((ex, idx) => {
                     ex.order_position = idx;
                 });

                 // Re-render the template editor list without switching pages
                 renderTemplateExerciseList();

                 // Stay on the template editor page
                 // No need to call switchPage() - we want to remain on the current page
             }
        } else {
             console.error('Invalid index for template exercise deletion:', deleteButton.dataset.index);
        }
    }

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

        if (!exerciseData.completedSets) {
            const setRowCount = exerciseItem.querySelectorAll('.set-row').length;
            exerciseData.completedSets = Array(setRowCount).fill(false);
            console.log(`[handleSetToggle] Initialized completedSets for exercise ${exerciseIndex}`); // <<< Log 8: Log init
        }
        while (exerciseData.completedSets.length <= setIndex) {
             exerciseData.completedSets.push(false);
        }
        exerciseData.completedSets[setIndex] = isCompleted;

        console.log(`[handleSetToggle] Updated exerciseData.completedSets[${setIndex}] to ${isCompleted}`); // <<< Log 9: Log state update

        // --- Added: Disable/Enable inputs based on completion state ---
        const weightInput = setRow.querySelector('.weight-input');
        const repsInput = setRow.querySelector('.reps-input');

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

        // Save workout state and input values after toggling a set
        saveWorkoutState();

        // Directly save the completed state to localStorage using our direct save function
        saveSetCompletionDirectly(toggleButton);

        // Also call the regular save function as a backup
        saveInputValues();
    }

    async function handleCompleteWorkout() {
        console.log('Completing workout...');

        // Save input values before completing the workout
        console.log('Saving input values before completing workout');

        // Save using our persistence module if available
        if (typeof saveWorkoutData === 'function') {
            saveWorkoutData();
        } else {
            // Fallback to regular save
            saveInputValues();
        }

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
            const weightUnit = unitSelectHeader ? unitSelectHeader.value : 'lbs'; // Default to lbs if not found
            console.log(`Using weight unit for exercise ${baseExerciseData.name}: ${weightUnit}${!unitSelectHeader ? ' (default)' : ''}`);

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

            // Start confetti animation using our enhanced implementation
            if (typeof ConfettiCelebration !== 'undefined') {
                ConfettiCelebration.start();

                // Stop confetti after 3 seconds
                setTimeout(() => {
                    ConfettiCelebration.stop();
                }, 3000);
            } else if (typeof confetti !== 'undefined') {
                // Fallback to the original confetti implementation
                confetti.start();

                // Stop confetti after 3 seconds
                setTimeout(() => {
                    confetti.stop();
                }, 3000);
            }

            console.log('Confetti animation triggered');

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
            }, 1500); // Longer delay to enjoy the confetti

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

        if (currentTemplateExercises.length === 0) {
            templateExerciseListEl.innerHTML = '<p>Add exercises using the button below.</p>';
            return;
        }

        // Add column headers for the template editor
        const columnHeaders = document.createElement('div');
        columnHeaders.className = 'column-headers';
        columnHeaders.innerHTML = `
            <span>Set</span>
            <span>Weight</span>
            <span>Reps</span>
        `;
        templateExerciseListEl.appendChild(columnHeaders);

        // Use Promise.all to handle async rendering of items
        const renderPromises = currentTemplateExercises.map(async (exercise, index) => {
            const exerciseItem = document.createElement('div');
            exerciseItem.className = 'exercise-item';
            exerciseItem.draggable = true; // Make the item draggable
            exerciseItem.dataset.index = index; // Store the current index

            // Add drag event listeners
            exerciseItem.addEventListener('dragstart', handleDragStart);
            exerciseItem.addEventListener('dragend', handleDragEnd);
            exerciseItem.addEventListener('dragover', handleDragOver);
            exerciseItem.addEventListener('drop', handleDrop);

            // Use the same rendering function as the live workout view
            try {
                await renderSingleExerciseItem(exerciseItem, exercise, index, true); // true = isTemplate
                return exerciseItem; // Return the rendered element
            } catch (error) {
                console.error(`Error rendering template exercise item for ${exercise.name}:`, error);
                // Return a placeholder error element
                const errorItem = document.createElement('div');
                errorItem.className = 'exercise-item error';
                errorItem.textContent = `Error loading ${exercise.name}`;
                return errorItem;
            }

        });

        // Wait for all exercise items to be rendered, then append them to the list
        Promise.all(renderPromises).then(exerciseItems => {
            // Append all rendered exercise items to the list
            exerciseItems.forEach(item => {
                templateExerciseListEl.appendChild(item);
            });
        }).catch(error => {
            console.error("Error rendering one or more template exercise items:", error);
            templateExerciseListEl.innerHTML = '<p style="color: red;">Error displaying template exercises. Please try refreshing.</p>';
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

        // Get the updated values from the form inputs
        const exerciseItems = document.querySelectorAll('#template-exercise-list .exercise-item');

        // Update the currentTemplateExercises array with the latest values from the form
        exerciseItems.forEach((item, index) => {
            if (index < currentTemplateExercises.length) {
                // Get the number of sets from the input field
                const setsInput = item.querySelector('.exercise-sets-input');
                if (setsInput) {
                    currentTemplateExercises[index].sets = parseInt(setsInput.value) || 1;
                }

                // Get the default reps from the input field
                const repsInput = item.querySelector('.exercise-reps-input');
                if (repsInput) {
                    currentTemplateExercises[index].reps = repsInput.value || '';
                }

                // Get the notes from the textarea
                const notesTextarea = item.querySelector('.exercise-notes-textarea');
                if (notesTextarea) {
                    currentTemplateExercises[index].notes = notesTextarea.value;
                }

                // Get the weight unit from the select
                const unitSelect = item.querySelector('.exercise-unit-select');
                if (unitSelect) {
                    currentTemplateExercises[index].weight_unit = unitSelect.value;
                }
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
                weight_unit: exercise.weight_unit || 'lbs', // Default to lbs if not set
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

    // --- NEW Helper function to update previous log spans after fetch ---
    function updatePreviousLogSpans(exerciseItemElement, lastLogData, isError = false) {
         const setRows = exerciseItemElement.querySelectorAll('.sets-container .set-row');
         let prevRepsArray = [];
         let prevWeightsArray = [];
         let prevUnit = 'lbs';

         console.log('[DEBUG] updatePreviousLogSpans called with lastLogData:', lastLogData);
         console.log('[DEBUG] Found', setRows.length, 'set rows in exerciseItemElement');

         if (lastLogData && lastLogData.reps_completed && lastLogData.weight_used) {
             prevRepsArray = lastLogData.reps_completed.split(',');
             prevWeightsArray = lastLogData.weight_used.split(',');
             prevUnit = lastLogData.weight_unit || 'lbs';
             console.log('[DEBUG] Parsed arrays from lastLogData:', { prevRepsArray, prevWeightsArray, prevUnit });
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
                         console.log(`[DEBUG] Set ${i+1}: Setting previous log text to: ${previousLogText}`);
                     } else if (!lastLogData) {
                         previousLogText = '- lbs x -'; // No data placeholder
                         console.log(`[DEBUG] Set ${i+1}: No lastLogData, using placeholder text`);
                     } else {
                         console.log(`[DEBUG] Set ${i+1}: lastLogData exists but no data for this set index`);
                         previousLogText = '- lbs x -'; // No data for this set index
                     }
                 } else {
                     console.log(`[DEBUG] Set ${i+1}: Error flag is true, using 'Error' text`);
                 }

                 prevLogSpan.textContent = previousLogText;
                 prevLogSpan.title = `Last Session Set ${i + 1}`; // Update title too
             } else {
                 console.log(`[DEBUG] Set ${i+1}: No previous-log span found in this row`);
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

        // Update the sets property in the exercise data to match the new count
        exerciseData.sets = currentSetCount + 1;
        console.log(`Updated exercise ${exerciseIndex} sets property to ${exerciseData.sets}`);

        // Ensure remove button is enabled if it was disabled
        const removeButton = exerciseItem.querySelector('.btn-remove-set');
        if (removeButton) {
            removeButton.disabled = false;
        }

        console.log(`Added set ${newSetIndex + 1} to exercise ${exerciseIndex}`);

        // Save workout state to persist the updated sets count
        saveWorkoutState();

        // Save input values after adding a set
        if (typeof saveWorkoutData === 'function') {
            saveWorkoutData();
        } else {
            saveInputValues();
        }

        // Vibrate to provide feedback that a set was added
        if (navigator.vibrate) {
            navigator.vibrate(100); // Vibrate for 100ms
        }
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

        // Update the sets property in the exercise data to match the new count
        exercise.sets = currentSetCount - 1;
        console.log(`Updated exercise ${workoutIndex} sets property to ${exercise.sets}`);

         // Also shorten the completedSets array if it exists
         if (exercise.completedSets && Array.isArray(exercise.completedSets)) {
             exercise.completedSets.pop(); // Remove the last entry
         }

        console.log(`Removed set from exercise ${workoutIndex} (${exercise.name}). Remaining sets: ${currentSetCount - 1}`);

        // Disable the remove button again if only one set remains after removal
        if (currentSetCount - 1 <= 1) {
            removeButton.disabled = true;
        }

        // Save workout state to persist the updated sets count
        saveWorkoutState();

        // Save input values after removing a set
        if (typeof saveWorkoutData === 'function') {
            saveWorkoutData();
        } else {
            saveInputValues();
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

                // Restore input values after the page has been rendered
                // Use a longer timeout to ensure DOM is fully rendered
                setTimeout(() => {
                    // Restore using our persistence module if available
                    if (typeof restoreWorkoutData === 'function') {
                        restoreWorkoutData();
                    } else {
                        // Fallback to regular restore
                        restoreInputValues();
                    }
                }, 300);

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



        // Save input values when navigating away from the page
        window.addEventListener('beforeunload', () => {
            if (currentPage === 'active') {
                // Update weight units from UI before saving
                updateWeightUnitsFromUI();

                // Save using our persistence module if available
                if (typeof saveWorkoutData === 'function') {
                    saveWorkoutData();
                } else {
                    // Fallback to regular save
                    saveInputValues();
                }

                // Add a small delay to ensure the save completes
                // This is a bit of a hack, but it works in most browsers
                const start = Date.now();
                while (Date.now() - start < 100) {
                    // Busy wait to ensure the save completes
                }
            }
        });

        // Add event listeners to all navigation links to save weight units before navigation
        document.querySelectorAll('.sidebar-nav-item, .nav-item').forEach(link => {
            link.addEventListener('click', () => {
                if (currentPage === 'active') {
                    // Update weight units from UI before navigating
                    updateWeightUnitsFromUI();
                    saveWorkoutState();
                }
            });
        });

        // Save input values when clicking on navigation links
        document.querySelectorAll('.sidebar-nav-item, .nav-item').forEach(link => {
            link.addEventListener('click', () => {
                if (currentPage === 'active') {
                    // Save using our persistence module if available
                    if (typeof saveWorkoutData === 'function') {
                        saveWorkoutData();
                    } else {
                        // Fallback to regular save
                        saveInputValues();
                    }
                }
            });
        });

        // Add a MutationObserver to detect when exercise items are added to the DOM
        if (currentExerciseListEl) {
            console.log('Setting up MutationObserver for exercise list');
            const observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        console.log('Exercise list changed - checking for input values to restore');
                        // We'll let the workout-persistence module handle this
                        // It has its own MutationObserver with debouncing
                        break;
                    }
                }
            });

            observer.observe(currentExerciseListEl, { childList: true, subtree: true });
        }

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
                } else if (target.classList.contains('set-complete-toggle')) {
                    handleSetToggle(event);
                } else if (target.classList.contains('btn-exercise-options')) {
                    toggleOptionsMenu(event);
                } else if (target.classList.contains('btn-edit-exercise')) {
                    // Get the workout index from the data attribute
                    const index = parseInt(target.dataset.workoutIndex);
                    if (!isNaN(index)) {
                        openExerciseEditModal(index);
                    }
                } else if (target.classList.contains('exercise-unit-select')) {
                    handleExerciseUnitChange(event);
                } else if (target.classList.contains('btn-delete-exercise')) {
                    handleDeleteExercise(event);
                }
            }
        });

        // Add listener for input changes to save values
        currentExerciseListEl?.addEventListener('input', (event) => {
            const target = event.target;
            if (target instanceof HTMLElement) {
                if (target.classList.contains('weight-input') ||
                    target.classList.contains('reps-input') ||
                    target.classList.contains('exercise-notes-textarea')) {

                    console.log(`Input detected in ${target.className} - scheduling save`);

                    // Save the value immediately using our direct save function
                    saveInputValueDirectly(target);

                    // Debounce the save to avoid too many saves
                    clearTimeout(window.inputSaveTimeout);
                    window.inputSaveTimeout = setTimeout(() => {
                        console.log('Debounced save triggered');
                        // Save input values
                        saveInputValues();
                    }, 500); // Save after 500ms of inactivity
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
        // --- Add listener for options menu and deleting exercises from template editor ---
        templateExerciseListEl?.addEventListener('click', (event) => {
            const target = event.target;

            // Check for options button click
            if (target.classList.contains('btn-exercise-options')) {
                toggleOptionsMenu(event);
                return;
            }

            // Check for delete button click using closest
            const deleteButton = target.closest('.btn-delete-template-exercise');
            if (deleteButton) {
                console.log('[Template Editor Delete Listener] Found delete button via closest().');
                handleDeleteTemplateExercise(deleteButton); // Pass the button element directly
            }
        });

        // Add listener for per-exercise sets and reps inputs in template editor
        templateExerciseListEl?.addEventListener('input', (event) => {
            const target = event.target;

            // Check if the input is a sets or reps input
            if (target.classList.contains('exercise-sets-input') || target.classList.contains('exercise-reps-input')) {
                const exerciseItem = target.closest('.exercise-item');
                if (!exerciseItem) return;

                const index = parseInt(exerciseItem.dataset.index, 10);
                if (isNaN(index) || index < 0 || index >= currentTemplateExercises.length) return;

                // Update the exercise data with the new value
                if (target.classList.contains('exercise-sets-input')) {
                    const sets = parseInt(target.value) || 1; // Default to 1 if invalid
                    currentTemplateExercises[index].sets = sets;
                    console.log(`Updated sets for exercise ${index} to ${sets}`);
                } else if (target.classList.contains('exercise-reps-input')) {
                    currentTemplateExercises[index].reps = target.value || '';
                    console.log(`Updated reps for exercise ${index} to ${target.value}`);
                }
            }
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

        // --- OPTIMIZED: Event Handling for Slider with Touch Support ---
        if (photoNavigationContainer) {
            console.log('[Initialize] Setting up optimized photo slider navigation');

            // Direct button click handlers - completely rewritten for maximum reliability
            console.log('[Initialize] Setting up photo navigation buttons with direct approach');

            // Get fresh references to the buttons
            const prevButton = document.getElementById('photo-prev-btn');
            const nextButton = document.getElementById('photo-next-btn');

            if (prevButton) {
                // Remove the button from DOM temporarily to clear all listeners
                const parent = prevButton.parentNode;
                const prevButtonClone = prevButton.cloneNode(true);
                parent.removeChild(prevButton);

                // Add new event handler directly to the clone
                prevButtonClone.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('[Navigation] Previous button clicked');
                    showPreviousPhoto();
                });

                // Set styling
                prevButtonClone.style.cursor = 'pointer';

                // Add the clone back to DOM
                parent.insertBefore(prevButtonClone, parent.firstChild);

                // Update the global reference
                photoPrevBtn = prevButtonClone;

                console.log('[Initialize] Previous button handler attached successfully');
            } else {
                console.error('[Initialize] Previous button not found in DOM!');
            }

            if (nextButton) {
                // Remove the button from DOM temporarily to clear all listeners
                const parent = nextButton.parentNode;
                const nextButtonClone = nextButton.cloneNode(true);
                parent.removeChild(nextButton);

                // Add new event handler directly to the clone
                nextButtonClone.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('[Navigation] Next button clicked');
                    showNextPhoto();
                });

                // Set styling
                nextButtonClone.style.cursor = 'pointer';

                // Add the clone back to DOM
                parent.appendChild(nextButtonClone);

                // Update the global reference
                photoNextBtn = nextButtonClone;

                console.log('[Initialize] Next button handler attached successfully');
            } else {
                console.error('[Initialize] Next button not found in DOM!');
            }

            // Add swipe support for mobile
            if (photoReel) {
                let touchStartX = 0;
                let touchEndX = 0;

                // Handle touch start
                addPassiveTouchListener(photoReel, 'touchstart', (e) => {
                    touchStartX = e.changedTouches[0].screenX;
                });

                // Handle touch end
                addPassiveTouchListener(photoReel, 'touchend', (e) => {
                    touchEndX = e.changedTouches[0].screenX;
                    handleSwipe();
                });

                // Process swipe direction
                function handleSwipe() {
                    // Minimum distance required for swipe - adjust as needed
                    const minSwipeDistance = 50;
                    const swipeDistance = touchEndX - touchStartX;

                    if (Math.abs(swipeDistance) < minSwipeDistance) return;

                    if (swipeDistance > 0) {
                        // Swiped right - show previous photo
                        showPreviousPhoto();
                    } else {
                        // Swiped left - show next photo
                        showNextPhoto();
                    }
                }
            }

            // Prevent wheel-based navigation
            if (photoSliderContainer) {
                photoSliderContainer.addEventListener('wheel', (event) => {
                    // Prevent the default scroll behavior
                    event.preventDefault();
                }, { passive: false });
            }

        } else {
            console.error('[Initialize] photoNavigationContainer not found!');
        }

        // Delete Photo Listener (Keep this direct)
        if (deletePhotoBtn) {
            deletePhotoBtn.addEventListener('click', handleDeletePhoto);
        } else {
             console.error('[Initialize] deletePhotoBtn not found!');
        }

        // Compare Photos Button Listener
        if (comparePhotosBtn) {
            comparePhotosBtn.addEventListener('click', togglePhotoComparison);
        } else {
            console.error('[Initialize] comparePhotosBtn not found!');
        }

        // Exercise Edit Modal Listeners
        if (exerciseEditForm) {
            exerciseEditForm.addEventListener('submit', handleSaveExerciseName);
        }
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', closeExerciseEditModal);
        }
        if (exerciseEditModalCloseBtn) {
            exerciseEditModalCloseBtn.addEventListener('click', closeExerciseEditModal);
        }
        if (exerciseEditModal) {
            exerciseEditModal.addEventListener('click', (event) => {
                if (event.target === exerciseEditModal) {
                    closeExerciseEditModal();
                }
            });
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

        // --- Set up event listeners ---

        // ... other listeners ...

        // --- REMOVE OLD PHOTO BUTTON CLICK LISTENERS ---
        /*
        const photoPrevBtn = document.getElementById('photo-prev-btn');
        const photoNextBtn = document.getElementById('photo-next-btn');
        if (photoPrevBtn) {
             console.log('[Initialize] Setting up previous photo button listener...');
             photoPrevBtn.addEventListener('click', debouncedShowPreviousPhoto);
        }
        if (photoNextBtn) {
             console.log('[Initialize] Setting up next photo button listener...');
             photoNextBtn.addEventListener('click', debouncedShowNextPhoto);
        } else {
             console.error('[Initialize] photoNextBtn not found!');
        }
        */

        // --- REMOVED PHOTO HOVER NAVIGATION ---
        // We've removed the hover-based navigation in favor of explicit button controls
        // --- END PHOTO HOVER NAVIGATION ---


        // ... other listeners ...

        console.log('Initialization complete.');
    } // End of initialize function

    // --- NEW: File Size Display Function ---
    function displayFileSize(input) {
        // Use the shared function from custom-form-elements.js if available
        if (typeof window.displayFileSize === 'function') {
            window.displayFileSize(input);
            return;
        }

        // Fallback implementation if the shared function is not available
        const fileSizeInfo = document.getElementById('file-size-info');
        const fileSizeDisplay = document.getElementById('file-size-display');
        const fileNameDisplay = document.getElementById('file-name-display');

        if (!fileSizeInfo || !fileSizeDisplay) {
            console.error('[Photo Upload] File size display elements not found');
            return;
        }

        // Update file name display if it exists
        if (fileNameDisplay) {
            if (input.files.length === 0) {
                fileNameDisplay.textContent = 'No file chosen';
            } else if (input.files.length === 1) {
                fileNameDisplay.textContent = input.files[0].name;
            } else {
                fileNameDisplay.textContent = `${input.files.length} files selected`;
            }
        }

        if (input.files && input.files.length > 0) {
            fileSizeInfo.style.display = 'block';

            let totalSize = 0;
            let fileDetails = [];

            for (let i = 0; i < input.files.length; i++) {
                const file = input.files[i];
                totalSize += file.size;

                // Format individual file size
                const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
                fileDetails.push(`${file.name}: ${fileSizeMB} MB`);
            }

            // Format total size
            const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

            // Create HTML content
            let html = `<strong>Total: ${totalSizeMB} MB</strong><br>`;
            if (input.files.length > 1) {
                html += '<details><summary>Individual Files</summary><ul>';
                fileDetails.forEach(detail => {
                    html += `<li>${detail}</li>`;
                });
                html += '</ul></details>';
            }

            // Add warning if files are large
            if (totalSizeMB > 5) {
                html += `<div style="color: orange; margin-top: 5px;">Large file(s) detected. Server will compress these images.</div>`;
            }

            fileSizeDisplay.innerHTML = html;

            // Log for debugging
            console.log(`[Photo Upload] Selected ${input.files.length} file(s), total size: ${totalSizeMB} MB`);
        } else {
            fileSizeInfo.style.display = 'none';
            fileSizeDisplay.innerHTML = '';
        }
    }

    // --- NEW: Progress Photo Upload Handler ---
    async function handlePhotoUpload(event) {
        event.preventDefault();
        console.log('[Photo Upload Client] handlePhotoUpload triggered.');

        const form = event.target;
        // --- REVERTED: Use FormData directly from the form ---
        const formData = new FormData(form);
        // --- Removed manual construction and appending ---

        const statusElement = document.getElementById('upload-status');
        const modal = document.getElementById('photo-upload-modal');
        const submitButton = form.querySelector('button[type="submit"]');

        // Add null checks for essential elements
        if (!statusElement || !modal || !submitButton) {
            console.error('[Photo Upload Client] Status element, modal, or submit button not found.');
            // Optionally display an error to the user if elements are missing
            return;
        }

        // --- Validate directly from formData ---
        // Ensure the keys used here ('date', 'photos') match the 'name' attributes in your HTML form inputs
        const dateValue = formData.get('date'); // Now using 'date' to match HTML name attribute
        const files = formData.getAll('photos');

        // Log form data for debugging
        console.log('[Photo Upload Client] Date value:', dateValue);
        console.log('[Photo Upload Client] Files count:', files.length);

        if (!dateValue) {
            statusElement.textContent = 'Please select a date.';
            statusElement.style.color = 'orange';
            console.warn('[Photo Upload Client] Date not found in FormData (using key "date"). Check input name attribute.');
            return; // Need a date
        }
        if (!files || files.length === 0 || !files[0] || files[0].size === 0) { // Check if the first file has size > 0
            statusElement.textContent = 'Please select at least one photo.';
            statusElement.style.color = 'orange';
            console.warn('[Photo Upload Client] No files or empty file selected.');
            return;
        }
        console.log(`[Photo Upload Client] FormData contains date: ${dateValue} and ${files.length} file(s).`);
        // --- End validation ---

        // Show file size information again
        const fileSizeInfo = document.getElementById('file-size-info');
        if (fileSizeInfo) {
            fileSizeInfo.style.display = 'block';
        }

        // Calculate total file size for logging
        let totalSize = 0;
        for (const file of files) {
            totalSize += file.size;
        }
        const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

        // Update status with compression info
        statusElement.style.display = 'block';

        // Add warning for large files
        let warningText = '';
        if (totalSizeMB > 5) {
            warningText = `<div style="font-size: 0.8em; margin-top: 5px; color: #ff9800;">
                <strong>Warning:</strong> Large file detected (${totalSizeMB} MB). Image will be significantly compressed.
            </div>`;
        }

        statusElement.innerHTML = `
            <div style="color: #03dac6;">Uploading ${files.length} file(s)...</div>
            <div style="font-size: 0.8em; margin-top: 5px;">
                ${isMobile ?
                    'Using mobile compression. Files over 800KB will be resized to 400x400px.' :
                    'Using standard compression. Large files will be reduced in size.'}
            </div>
            ${warningText}
            <div style="font-size: 0.8em; margin-top: 5px; color: #aaa;">
                Please wait while processing...
            </div>
        `;
        submitButton.disabled = true;

        // Use the mobile-specific endpoint for mobile devices
        const uploadEndpoint = isMobile ? '/api/mobile/mobile' : '/api/photos/upload';
        console.log(`[Photo Upload Client] Using endpoint: ${uploadEndpoint} for ${isMobile ? 'mobile' : 'desktop'} device`);

        console.log(`[Photo Upload Client] Running on ${isMobile ? 'MOBILE' : 'DESKTOP'} device`);
        console.log(`[Photo Upload Client] About to initiate fetch to ${uploadEndpoint}`);

        // Set a timeout to prevent the upload from getting stuck
        const uploadTimeout = setTimeout(() => {
            statusElement.innerHTML = `
                <div style="color: #f44336;">Upload timed out. Please try again with a smaller image.</div>
                <div style="font-size: 0.8em; margin-top: 5px;">
                    Try using a smaller image or taking a new photo with lower resolution.
                </div>
            `;
            submitButton.disabled = false;
            console.error('[Photo Upload Client] Upload timed out after 30 seconds');
        }, 30000); // 30 second timeout - reduced to provide faster feedback

        let response;
        try {
            // Create an AbortController to handle timeout
            const controller = new AbortController();
            const signal = controller.signal;

            // Set a separate timeout for the fetch operation itself
            const fetchTimeout = setTimeout(() => {
                controller.abort();
                console.error('[Photo Upload Client] Fetch operation aborted due to timeout');
            }, 25000); // 25 second timeout for fetch operation

            console.log('[Photo Upload Client] Starting fetch with timeout control');
            response = await fetch(uploadEndpoint, {
                method: 'POST',
                body: formData,
                signal: signal
            });

            // Clear both timeouts since we got a response
            clearTimeout(fetchTimeout);
            clearTimeout(uploadTimeout);

            // ... (keep existing logging and error handling for the response) ...
            console.log(`[Photo Upload Client] Fetch promise resolved. Status: ${response.status}, StatusText: ${response.statusText}, OK: ${response.ok}`);

            if (!response.ok) {
                let errorData = { error: `HTTP error! Status: ${response.status} ${response.statusText}` };
                try {
                    const text = await response.text();
                    console.log(`[Photo Upload Client] Raw error response text: ${text}`);
                    errorData = JSON.parse(text);
                    console.log('[Photo Upload Client] Parsed JSON error response:', errorData);
                } catch (parseError) {
                    console.error('[Photo Upload Client] Failed to parse error response as JSON:', parseError);
                }
                const error = new Error(errorData.error || `HTTP error ${response.status}`);
                error.status = response.status;
                error.data = errorData;
                throw error;
            }

            const result = await response.json();
            console.log('[Photo Upload Client] Upload successful:', result);
            statusElement.textContent = result.message || 'Upload successful!';
            statusElement.style.color = '#4CAF50'; // Green
            form.reset();
            fetchAndDisplayPhotos();

            setTimeout(() => {
                modal.style.display = 'none';
                statusElement.textContent = '';
            }, 1500);

        } catch (error) {
            // Handle AbortError specifically
            if (error.name === 'AbortError') {
                console.error('[Photo Upload Client] Fetch operation was aborted (timeout)');
                statusElement.innerHTML = `
                    <div style="color: #f44336;">Upload timed out. Please try again with a smaller image or check your connection.</div>
                `;
                submitButton.disabled = false;
            } else {
                // Standard error handling
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
            }

        } finally {
            // Make sure the timeout is cleared
            clearTimeout(uploadTimeout);

            submitButton.disabled = false;
            console.log('[Photo Upload Client] handlePhotoUpload finished (finally block).');

            // Refresh the photo gallery
            fetchAndDisplayPhotos();

            // Close the modal
            if (modal) {
                modal.style.display = 'none';
            }
        }
    }
    // --- END NEW ---

    // --- NEW: Toggle Photo Comparison Section ---
    function togglePhotoComparison() {
        if (photoComparisonSection) {
            const isCurrentlyVisible = photoComparisonSection.style.display !== 'none';

            // Toggle comparison section visibility
            photoComparisonSection.style.display = isCurrentlyVisible ? 'none' : 'block';

            // Toggle carousel visibility (opposite of comparison section)
            const gallerySection = document.querySelector('.gallery-section');
            if (gallerySection) {
                gallerySection.style.display = isCurrentlyVisible ? 'block' : 'none';
            }

            // Update button text based on state
            if (comparePhotosBtn) {
                comparePhotosBtn.textContent = isCurrentlyVisible ? 'Compare' : 'Carousel';
            }

            // If showing the comparison section, make sure the dropdowns are populated
            if (!isCurrentlyVisible) {
                populateComparisonDropdowns();
            }
        }
    }

    // Helper function to populate comparison dropdowns
    function populateComparisonDropdowns() {
        // This function will be called when the comparison section is shown
        // It ensures the dropdowns are populated with the latest photos
        if (progressPhotosData.length > 0 && comparisonPhotoSelect1 && comparisonPhotoSelect2) {
            // First, clear existing options
            comparisonPhotoSelect1.innerHTML = '';
            comparisonPhotoSelect2.innerHTML = '';

            // Then add options for each photo
            progressPhotos.forEach((photo, index) => {
                const date = new Date(photo.date);
                const formattedDate = date.toLocaleDateString();
                const option1 = document.createElement('option');
                const option2 = document.createElement('option');

                option1.value = index;
                option1.textContent = formattedDate;
                option2.value = index;
                option2.textContent = formattedDate;

                comparisonPhotoSelect1.appendChild(option1);
                comparisonPhotoSelect2.appendChild(option2);
            });

            // Set default selections (first and last photos)
            if (progressPhotos.length > 1) {
                comparisonPhotoSelect1.value = 0; // First photo
                comparisonPhotoSelect2.value = progressPhotos.length - 1; // Last photo
            }

            // Trigger the change event to update the comparison images
            updateComparisonImages();
        }
    }

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

    // --- Optimized: Fetch and Display Photos Function (Redesigned for Carousel) ---
    async function fetchAndDisplayPhotos() {
        console.log('[Photo Load] fetchAndDisplayPhotos STARTED.'); // Log start
        // Use the slider container elements, not the old galleryEl
        // Check only for elements that are still used
        if (!photoReel || !paginationDotsContainer || !deletePhotoBtn || !photoPrevBtn || !photoNextBtn || !photoNavigationContainer) {
            console.error("[Photo Load] Missing required slider elements (reel, dots container, delete button, navigation buttons, navigation container).");
            return;
        }

        // Prevent multiple simultaneous calls
        if (window.isLoadingPhotos) {
            console.log('[Photo Load] Already loading photos, skipping duplicate call');
            return;
        }
        window.isLoadingPhotos = true;

        console.log('[Photo Load] Setting loading state...'); // Log before UI update
        photoReel.innerHTML = '<p>Loading photos...</p>'; // Show loading in reel
        paginationDotsContainer.innerHTML = ''; // Clear dots
        // photoPrevBtn.disabled = true; // Commented out previously
        // photoNextBtn.disabled = true; // Commented out previously
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

            // Log the first couple of photo objects for debugging
            if (progressPhotosData.length > 0) {
                console.log('[Photo Load DEBUG] First photo data object:', JSON.stringify(progressPhotosData[0]));
                if (progressPhotosData.length > 1) {
                    console.log('[Photo Load DEBUG] Second photo data object:', JSON.stringify(progressPhotosData[1]));
                }
            }

            // Preload all images in the background before populating the reel
            console.log('[Photo Load] Preloading all images in the background...');
            await new Promise(resolve => {
                PhotoLoader.preloadAllImages(progressPhotosData, () => {
                    console.log('[Photo Load] All images preloaded successfully');
                    resolve();
                });
            });

            console.log('[Photo Load] Clearing loading message from photoReel...');

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
                photoReel.innerHTML = '<p>No progress photos uploaded yet.</p>';
                // photoPrevBtn.disabled = true; // Comment out button reference
                // photoNextBtn.disabled = true; // Comment out button reference
                deletePhotoBtn.disabled = true;
                 // Ensure date display is also cleared
                 if (currentPhotoDateDisplay) currentPhotoDateDisplay.textContent = '';
                window.isLoadingPhotos = false; // <<< Ensure flag is reset here too
                return; // Exit early if no photos
            }

            // --- Populate the Reel and Dots ---
            console.log('[Photo Load] Populating photo reel and pagination dots...'); // Log before loop
            progressPhotosData.forEach((photo, index) => {
                // Add Image to Reel
                const img = document.createElement('img');
                // Store the path in data-src for reference
                img.dataset.src = photo.file_path;
                // Format date with explicit options to avoid browser-specific issues
                const photoDate = new Date(photo.date_taken);
                const formattedDate = photoDate.toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric'
                });
                // Use empty alt text to prevent any text from showing
                img.alt = '';
                // Set aria-hidden to prevent screen readers from announcing anything
                img.setAttribute('aria-hidden', 'true');
                img.dataset.photoId = photo.photo_id; // Store ID for reference
                img.loading = 'lazy'; // Add native lazy loading attribute

                // Set image source from cache if available, otherwise use placeholder
                if (PhotoLoader.imageCache[photo.photo_id]) {
                    img.src = PhotoLoader.imageCache[photo.photo_id];
                    console.log(`[Photo Load] Using cached image for ID: ${photo.photo_id}`);
                } else {
                    // Set placeholder initially but make it invisible
                    img.src = PhotoLoader.placeholderImage;
                    img.style.opacity = '0'; // Hide placeholder

                    // Load the image immediately
                    PhotoLoader.loadImage(
                        photo.file_path,
                        img,
                        photo.photo_id,
                        () => {
                            console.log(`[Photo Load] Successfully loaded image (ID: ${photo.photo_id})`);
                            img.style.opacity = '1'; // Show image once loaded
                        },
                        (error) => console.error(`[Photo Load] Failed to load image: ${error}`)
                    );
                }

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
            photoReel.innerHTML = `<p style="color: red;">Error loading photos: ${error.message}</p>`;
            // photoPrevBtn.disabled = true; // Comment out button reference
            // photoNextBtn.disabled = true; // Comment out button reference
            deletePhotoBtn.disabled = true;
             // Ensure date display is also cleared on error
            if (currentPhotoDateDisplay) currentPhotoDateDisplay.textContent = '';
        } finally {
            console.log('[Photo Load] fetchAndDisplayPhotos FINISHED.'); // Log finish
            // Reset loading flag
            window.isLoadingPhotos = false;
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

        // Hide any placeholder text or elements that might be showing
        const placeholderElements = photoReel.querySelectorAll('p');
        placeholderElements.forEach(el => {
            el.style.display = 'none';
        });

        // Remove any text nodes that might be in the photoReel
        Array.from(photoReel.childNodes).forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                photoReel.removeChild(node);
            }
        });

        // Make sure all images are initially invisible until properly loaded
        const allImages = photoReel.querySelectorAll('img');
        allImages.forEach(img => {
            // Remove any text content that might be in the alt attribute
            img.alt = '';

            // Set aria-hidden to prevent screen readers from announcing anything
            img.setAttribute('aria-hidden', 'true');

            if (img.complete && img.naturalWidth > 0) {
                // Image is already loaded, make it visible
                img.style.opacity = '1';
            } else {
                // Image is not loaded yet, keep it invisible
                img.style.opacity = '0';
            }
        });

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
        const currentPhoto = progressPhotosData[currentPhotoIndex];
        // --- BEGIN ADDED DEBUG LOG ---
        console.log('[Photo Display DEBUG] Photo object being used:', JSON.stringify(currentPhoto));
        // --- END ADDED DEBUG LOG ---
        console.log(`[Photo Display] Attempting to display data:`, currentPhoto); // <<< Log the photo object
        let formattedDate = '';
        if (currentPhoto && currentPhoto.date_taken) {
            // Create a date object directly from the date string
            const photoDate = new Date(currentPhoto.date_taken);
            // Format with explicit options
            formattedDate = photoDate.toLocaleDateString(undefined, {
                year: 'numeric', month: 'long', day: 'numeric'
            });
            console.log(`[Photo Display] Date from DB: ${currentPhoto.date_taken}, Parsed as: ${photoDate.toISOString()}, Formatted as: ${formattedDate}`);
        }
        dateDisplayEl.textContent = formattedDate; // Update the date display

        // --- Log the file path specifically ---
        const filePathToLoad = currentPhoto ? currentPhoto.file_path : '[No Photo Object]';
        console.log(`[Photo Display] Setting image src to: ${filePathToLoad}`); // <<< Log the file path being used

        // --- Use PhotoLoader to load the current image from cache ---
        const imageElements = photoReel.querySelectorAll('img');
        if (imageElements && imageElements[currentPhotoIndex]) {
            const currentImageElement = imageElements[currentPhotoIndex];
            const currentPhoto = progressPhotosData[currentPhotoIndex];

            // Load the current image using PhotoLoader (will use cache if available)
            PhotoLoader.loadImage(
                currentPhoto.file_path,
                currentImageElement,
                currentPhoto.photo_id,
                () => console.log(`[Photo Display] Successfully loaded current image (ID: ${currentPhoto.photo_id})`),
                (error) => console.error(`[Photo Display] Failed to load current image: ${error}`)
            );

            // No need to preload adjacent images - they're already preloaded by PhotoLoader.preloadAllImages
        } else {
            console.warn(`[Photo Display] Could not find image element for index ${currentPhotoIndex}`);
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
        // Enable/disable navigation buttons based on current position
        if (photoPrevBtn) {
            const shouldDisable = (currentPhotoIndex === 0);
            photoPrevBtn.disabled = shouldDisable;
            console.log(`[Photo Display] Previous button disabled: ${shouldDisable}`);
        }
        if (photoNextBtn) {
            const shouldDisable = (currentPhotoIndex >= numPhotos - 1);
            photoNextBtn.disabled = shouldDisable;
            console.log(`[Photo Display] Next button disabled: ${shouldDisable}`);
        }
        if (deletePhotoBtn) { // Keep check for delete button
             deletePhotoBtn.disabled = (numPhotos === 0);
        }

        console.log(`[Photo Display] Reel transform set to: translateX(${offset}%)`);
        const endTime = performance.now(); // End timer
        console.log(`[Photo Display] displayCurrentPhoto execution time: ${(endTime - startTime).toFixed(2)} ms`); // Log duration
    }
    // --- END NEW ---

    // --- Slider Navigation Functions (Updated for Redesign, NO ANIMATION) ---
    // let isAnimating = false; // Flag to prevent clicks during animation - REMOVED
    // const animationDuration = 500; // Must match CSS transition duration - REMOVED

    // Completely rewritten navigation functions for maximum reliability
    // Make these functions globally accessible for the fix script
    window.showPreviousPhoto = function showPreviousPhoto() {
        console.log('[Photo Slider] PREV button clicked, attempting to show previous photo...');

        // Extra debug info
        console.log(`[Photo Slider] Current state: index=${currentPhotoIndex}, total photos=${progressPhotosData ? progressPhotosData.length : 'undefined'}`);

        // Safety check for data
        if (!progressPhotosData || progressPhotosData.length === 0) {
            console.log('[Photo Slider] No photos available');
            return;
        }

        if (currentPhotoIndex <= 0) { // Block only if at first photo
            console.log(`[Photo Slider] Previous blocked: Already at first photo (index 0)`);
            return;
        }

        try {
            // Update the index
            currentPhotoIndex--;
            console.log(`[Photo Slider] Index decremented to: ${currentPhotoIndex}`);

            // Update the display
            displayCurrentPhoto();

            console.log('[Photo Slider] Previous photo navigation successful');
        } catch (error) {
            console.error('[Photo Slider] Error in showPreviousPhoto:', error);
        }
    };

    window.showNextPhoto = function showNextPhoto() {
        console.log('[Photo Slider] NEXT button clicked, attempting to show next photo...');

        // Extra debug info
        console.log(`[Photo Slider] Current state: index=${currentPhotoIndex}, total photos=${progressPhotosData ? progressPhotosData.length : 'undefined'}`);

        // Safety check for data
        if (!progressPhotosData || progressPhotosData.length === 0) {
            console.log('[Photo Slider] No photos available');
            return;
        }

        const numPhotos = progressPhotosData.length;
        if (currentPhotoIndex >= numPhotos - 1) { // Block only if at last photo
            console.log(`[Photo Slider] Next blocked: Already at last photo (index ${currentPhotoIndex}, total ${numPhotos})`);
            return;
        }

        try {
            // Update the index
            currentPhotoIndex++;
            console.log(`[Photo Slider] Index incremented to: ${currentPhotoIndex}`);

            // Update the display
            displayCurrentPhoto();

            console.log('[Photo Slider] Next photo navigation successful');
        } catch (error) {
            console.error('[Photo Slider] Error in showNextPhoto:', error);
        }
    };

    // --- NEW: Go To Specific Photo (for dots) ---
    function goToPhoto(index) {
        console.log(`[Photo Slider] Go to photo index: ${index}`);
        const numPhotos = progressPhotosData.length;
        // Prevent jump if index is same/invalid
        if (index === currentPhotoIndex || index < 0 || index >= numPhotos) {
            console.log(`[Photo Slider] Dot click blocked: index=${index}, currentIndex=${currentPhotoIndex}`);
            return;
        }

        // Temporarily disable buttons to prevent rapid clicking
        if (photoPrevBtn) photoPrevBtn.disabled = true;
        if (photoNextBtn) photoNextBtn.disabled = true;

        currentPhotoIndex = index;
        displayCurrentPhoto(); // Directly update display

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
        const photoDate = new Date(photoToDelete.date_taken);
        const formattedDate = photoDate.toLocaleDateString(undefined, {
            year: 'numeric', month: 'numeric', day: 'numeric'
        });

        if (!confirm(`Are you sure you want to delete the photo from ${formattedDate}? This cannot be undone.`)) {
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
                const photoDate = new Date(photo.date_taken);
                option1.textContent = photoDate.toLocaleDateString(undefined, {
                    year: 'numeric', month: 'numeric', day: 'numeric'
                });

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

        // Set alt text first
        comparisonImage1.alt = photo1 ? `Comparison Photo 1: ${new Date(photo1.date_taken).toLocaleDateString(undefined, {year: 'numeric', month: 'numeric', day: 'numeric'})}` : 'Comparison Photo 1';
        comparisonImage2.alt = photo2 ? `Comparison Photo 2: ${new Date(photo2.date_taken).toLocaleDateString(undefined, {year: 'numeric', month: 'numeric', day: 'numeric'})}` : 'Comparison Photo 2';

        // Set placeholder images initially
        if (!photo1) comparisonImage1.src = '';
        if (!photo2) comparisonImage2.src = '';

        // Load images using PhotoLoader if available
        if (photo1) {
            PhotoLoader.loadImage(
                photo1.file_path,
                comparisonImage1,
                photo1.photo_id,
                () => console.log(`[Comparison] Successfully loaded comparison image 1 (ID: ${photo1.photo_id})`),
                (error) => console.error(`[Comparison] Failed to load comparison image 1: ${error}`)
            );
        }

        if (photo2) {
            PhotoLoader.loadImage(
                photo2.file_path,
                comparisonImage2,
                photo2.photo_id,
                () => console.log(`[Comparison] Successfully loaded comparison image 2 (ID: ${photo2.photo_id})`),
                (error) => console.error(`[Comparison] Failed to load comparison image 2: ${error}`)
            );
        }
    }

    // Set up toggle button for exercise history
    const toggleHistoryBtn = document.getElementById('toggle-history-btn');
    if (toggleHistoryBtn) {
        toggleHistoryBtn.addEventListener('click', toggleExerciseHistory);
    }

    initialize(); // Run initialization

    // --- Handler for Exercise Unit Change ---
    function handleExerciseUnitChange(event) {
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

        // Update the weight_unit in the underlying data
        exercises[exerciseIndex].weight_unit = newUnit;
        console.log(`Updated unit for exercise ${exerciseIndex} to: ${newUnit}`);

        // Save the preference to the server if we have an exercise_id
        const exerciseId = exercises[exerciseIndex].exercise_id;
        if (exerciseId) {
            saveExerciseUnitPreference(exerciseId, newUnit);
        }

        // Save the workout state to ensure the unit change persists
        saveWorkoutState();

        // Also save using the workout-persistence module if available
        if (typeof saveWorkoutData === 'function') {
            saveWorkoutData();
        }
    }

    // Save exercise unit preference to the server
    async function saveExerciseUnitPreference(exerciseId, weightUnit) {
        try {
            console.log(`Saving unit preference for exercise ${exerciseId}: ${weightUnit}`);
            const baseUrl = window.location.origin;
            const response = await fetch(`${baseUrl}/api/exercise-preferences`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ exerciseId, weightUnit })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log(`Successfully saved unit preference:`, result);
            return true;
        } catch (error) {
            console.error('Error saving exercise unit preference:', error);
            // Continue without showing error to user - this is a background operation
            return false;
        }
    }

    // Debounced versions of the navigation functions
    const debouncedShowPreviousPhoto = debounce(showPreviousPhoto, navigationDebounceTime);
    const debouncedShowNextPhoto = debounce(showNextPhoto, navigationDebounceTime);

    // --- Initialize Function ---
    async function initialize() {
        console.log('Initializing Workout Tracker...');
        // Fetch initial data
        console.log('Fetching exercises...');
        await fetchExercises();
        console.log('Fetching templates...');
        await fetchTemplates();

        // Fetch and display progress photos
        await fetchAndDisplayPhotos();

        // Restore any saved workout state
        // restoreWorkoutState(); // Moved restore after page switch setup

        // Restore any saved input values (needs to happen *after* workout state potentially restored)
        // restoreInputValues(); // Moved restore after page switch setup

        // --- Set up event listeners ---

        // Modal close buttons
        if (closeExerciseModalBtn) {
            closeExerciseModalBtn.addEventListener('click', closeExerciseModal);
        }
        if (exerciseEditModalCloseBtn) {
             exerciseEditModalCloseBtn.addEventListener('click', closeExerciseEditModal);
        }

        // Add Exercise modal interactions
        if (exerciseSearchInput) {
            exerciseSearchInput.addEventListener('input', handleFilterChange);
        }
        if (exerciseCategoryFilter) {
            exerciseCategoryFilter.addEventListener('change', handleFilterChange);
        }
        if (addSelectedExercisesBtn) {
            addSelectedExercisesBtn.addEventListener('click', handleAddSelectedExercises);
        }

        // Toggle define new exercise form
        if (toggleDefineExerciseBtn) {
            toggleDefineExerciseBtn.addEventListener('click', handleToggleDefineExercise);
        }
        if (saveNewExerciseBtn) {
            saveNewExerciseBtn.addEventListener('click', handleSaveNewExercise);
        }

        // Template Editor interactions
        if (templateSaveBtn) {
            templateSaveBtn.addEventListener('click', handleSaveTemplate);
        }
        if (templateCancelBtn) {
            templateCancelBtn.addEventListener('click', () => switchPage('landing'));
        }
        if (templateAddExerciseBtn) {
            templateAddExerciseBtn.addEventListener('click', () => openExerciseModal(true)); // Pass true for template mode
        }

        // Delegate template exercise deletion
        if (templateExerciseListEl) {
            templateExerciseListEl.addEventListener('click', function(event) {
                if (event.target.classList.contains('delete-template-exercise-btn')) {
                    handleDeleteTemplateExercise(event.target);
                }
            });
            // Add drag/drop listeners for template editor
            templateExerciseListEl.addEventListener('dragstart', handleDragStart);
            templateExerciseListEl.addEventListener('dragover', handleDragOver);
            templateExerciseListEl.addEventListener('drop', handleDrop);
            templateExerciseListEl.addEventListener('dragend', handleDragEnd);
        }

        // Active workout page interactions
        if (cancelWorkoutBtn) {
            cancelWorkoutBtn.addEventListener('click', handleCancelWorkout);
        }
        if (completeWorkoutBtn) {
            completeWorkoutBtn.addEventListener('click', handleCompleteWorkout);
        }
        if (addExerciseFab) {
            addExerciseFab.addEventListener('click', () => openExerciseModal(false)); // Pass false for workout mode
        }

        // --- REMOVE OLD PHOTO BUTTON LISTENERS ---
        // if (photoPrevBtn) {
        //     console.log('[Initialize] Setting up previous photo button listener...');
        //     photoPrevBtn.removeEventListener('click', debouncedShowPreviousPhoto); // Ensure removal
        // }
        // if (photoNextBtn) {
        //     console.log('[Initialize] Setting up next photo button listener...');
        //     photoNextBtn.removeEventListener('click', debouncedShowNextPhoto); // Ensure removal
        // } else {
        //     console.error('[Initialize] photoNextBtn not found!');
        // }

        // --- REMOVED PHOTO HOVER NAVIGATION ---
        // We've removed the hover-based navigation in favor of explicit button controls
        // --- END PHOTO HOVER NAVIGATION ---

        // Delegate event listeners for dynamic elements within the workout list
        if (currentExerciseListEl) {
            currentExerciseListEl.addEventListener('click', function(event) {
                // Handle set completion toggle
                if (event.target.classList.contains('set-toggle')) {
                    handleSetToggle(event);
                } else if (event.target.closest('.exercise-options-btn')) {
                    toggleOptionsMenu(event.target.closest('.exercise-options-btn'));
                } else if (event.target.classList.contains('delete-exercise-btn')) {
                    handleDeleteExercise(event);
                } else if (event.target.classList.contains('add-set-btn')) {
                    handleAddSet(event);
                 } else if (event.target.classList.contains('remove-set-btn')) {
                    handleRemoveSet(event);
                } else if (event.target.classList.contains('edit-exercise-name-btn')) {
                    // Find the parent exercise item to get the index
                    const exerciseItem = event.target.closest('.exercise-item');
                    if (exerciseItem && exerciseItem.dataset.workoutIndex !== undefined) {
                        openExerciseEditModal(parseInt(exerciseItem.dataset.workoutIndex, 10));
                    }
                }
            });
             // Add input listener for unit changes
            currentExerciseListEl.addEventListener('change', function(event) {
                 if (event.target.classList.contains('unit-select')) {
                     handleExerciseUnitChange(event);
                 }
             });
        }

        // Exercise Edit Modal listeners
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', closeExerciseEditModal);
        }
        if (saveEditBtn) {
             saveEditBtn.addEventListener('click', handleSaveExerciseName);
        }
        // Close modal if user clicks outside of it (optional)
        window.addEventListener('click', (event) => {
            if (event.target === exerciseModal) {
                closeExerciseModal();
            }
             if (event.target === exerciseEditModal) {
                closeExerciseEditModal();
            }
             if (event.target === historyEditModal) { // Added for history edit modal
                hideHistoryEditModal();
             }
            if (event.target === photoUploadModal) {
                 closePhotoUploadModal();
            }
        });

        // Landing page buttons
        if (startEmptyWorkoutBtn) {
            startEmptyWorkoutBtn.addEventListener('click', startEmptyWorkout);
        }
        if (createTemplateBtn) {
            createTemplateBtn.addEventListener('click', () => showTemplateEditor());
        }
        if (templateListContainer) {
            templateListContainer.addEventListener('click', (event) => {
                if (event.target.classList.contains('start-template-btn')) {
                    const templateId = event.target.dataset.templateId;
                    startWorkoutFromTemplate(templateId);
                } else if (event.target.classList.contains('edit-template-btn')) {
                    const templateId = event.target.dataset.templateId;
                    const template = workoutTemplates.find(t => t.workout_id === parseInt(templateId));
                    showTemplateEditor(template);
                } else if (event.target.classList.contains('delete-template-btn')) {
                    const templateId = event.target.dataset.templateId;
                     handleDeleteTemplate(templateId);
                }
            });
        }
        if (templateSearchInput) {
             templateSearchInput.addEventListener('input', (event) => {
                // <<< Add log here >>>
                console.log('[Template Search Listener] Event fired!');

                const searchTerm = event.target.value.toLowerCase();
                console.log(`[Template Search] Input event: searchTerm = '${searchTerm}'`);

                // Filter the global workoutTemplates array
                const filtered = workoutTemplates.filter(t => {
                    return t.name && typeof t.name === 'string' && t.name.toLowerCase().includes(searchTerm);
                });

                console.log(`[Template Search] Filtered templates count: ${filtered.length}`);

                renderWorkoutTemplates(filtered);
            });
        } else {
             console.error('[Initialize Error] templateSearchInput element not found! Cannot add search listener.');
        }

        // --- History Section Listeners ---
        if (historyExerciseSearchInput) {
            // Define handleHistorySearchInput function
            function handleHistorySearchInput() {
                const searchTerm = historyExerciseSearchInput.value.toLowerCase().trim();

                // Show/hide the results container based on search term
                if (historySearchResultsEl) {
                    historySearchResultsEl.style.display = searchTerm ? 'block' : 'none';

                    // Filter exercises based on search term and category
                    const filteredExercises = availableExercises.filter(ex => {
                        const nameMatch = ex.name.toLowerCase().includes(searchTerm);
                        const categoryMatch = currentHistoryCategoryFilter === 'all' ||
                                            ex.category === currentHistoryCategoryFilter;
                        return nameMatch && categoryMatch;
                    });

                    // Render the filtered results
                    renderHistorySearchResults(filteredExercises);
                }
            }

            // Add the event listener with the defined function
            historyExerciseSearchInput.addEventListener('input', debounce(handleHistorySearchInput, 300));
        }

        // Define renderHistorySearchResults function
        function renderHistorySearchResults(exercises) {
            if (!historySearchResultsEl) return;

            historySearchResultsEl.innerHTML = '';

            if (exercises.length === 0) {
                historySearchResultsEl.innerHTML = '<p class="no-results">No exercises found</p>';
                return;
            }

            exercises.forEach(ex => {
                const item = document.createElement('div');
                item.className = 'history-search-item';
                item.dataset.exerciseId = ex.exercise_id;
                item.dataset.exerciseName = ex.name;
                item.textContent = ex.name;
                historySearchResultsEl.appendChild(item);
            });
        }

        // Define handleHistoryResultClick function
        function handleHistoryResultClick(event) {
            const target = event.target;
            if (target.classList.contains('history-search-item')) {
                const exerciseId = parseInt(target.dataset.exerciseId, 10);
                const exerciseName = target.dataset.exerciseName;

                if (!isNaN(exerciseId)) {
                    currentHistoryExerciseId = exerciseId;
                    currentHistoryExerciseName = exerciseName;

                    // Update the search input with the selected exercise name
                    if (historyExerciseSearchInput) {
                        historyExerciseSearchInput.value = exerciseName;
                    }

                    // Hide the results list
                    if (historySearchResultsEl) {
                        historySearchResultsEl.style.display = 'none';
                    }

                    // Fetch and display the history chart for the selected exercise
                    fetchAndRenderHistoryChart(exerciseId);
                }
            }
        }

        if (historySearchResultsEl) {
            historySearchResultsEl.addEventListener('click', handleHistoryResultClick);
        }

        if (historyCategoryFilterSelect) {
            historyCategoryFilterSelect.addEventListener('change', (event) => {
                currentHistoryCategoryFilter = event.target.value;
                // Optionally re-filter search results if needed, or just fetch history if an exercise is selected
                if (currentHistoryExerciseId) {
                    fetchAndRenderHistoryChart(currentHistoryExerciseId); // Re-fetch chart with category filter
                }
            });
        }

        // Define fetchAndRenderHistoryChart function
        async function fetchAndRenderHistoryChart(exerciseId) {
            if (!historyChartCanvas) return;

            try {
                // Show loading message
                const historyMessageEl = document.getElementById('history-message');
                if (historyMessageEl) {
                    historyMessageEl.textContent = 'Loading exercise history...';
                }

                // Fetch exercise history data
                const response = await fetch(`/api/workouts/exercise-history/${exerciseId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const historyData = await response.json();

                // Clear loading message
                if (historyMessageEl) {
                    historyMessageEl.textContent = '';
                }

                // Render the chart with the history data
                renderHistoryChart(historyData);

                // Show the edit button
                const historyEditBtn = document.getElementById('history-edit-btn');
                if (historyEditBtn) {
                    historyEditBtn.style.display = 'inline-block';
                }

            } catch (error) {
                console.error('Error fetching exercise history:', error);
                const historyMessageEl = document.getElementById('history-message');
                if (historyMessageEl) {
                    historyMessageEl.textContent = 'Error loading exercise history.';
                }
            }
        }

        // Define renderHistoryChart function
        function renderHistoryChart(historyData) {
            // Destroy existing chart if it exists
            if (exerciseHistoryChart) {
                exerciseHistoryChart.destroy();
            }

            // If no data, show a message
            if (!historyData || historyData.length === 0) {
                const historyMessageEl = document.getElementById('history-message');
                if (historyMessageEl) {
                    historyMessageEl.textContent = 'No history data available for this exercise.';
                }
                return;
            }

            // Prepare data for the chart
            const dates = historyData.map(entry => new Date(entry.workout_date).toLocaleDateString());
            const weights = historyData.map(entry => {
                const weightValues = entry.weight_used.split(',').map(w => parseFloat(w.trim()));
                // Calculate average weight
                return weightValues.reduce((sum, val) => sum + val, 0) / weightValues.length;
            });

            // Create the chart
            exerciseHistoryChart = new Chart(historyChartCanvas, {
                type: 'line',
                data: {
                    labels: dates,
                    datasets: [{
                        label: 'Average Weight',
                        data: weights,
                        borderColor: '#00e5ff',
                        backgroundColor: 'rgba(0, 229, 255, 0.1)',
                        borderWidth: 2,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: false
                        }
                    }
                }
            });
        }

        // --- History Edit Modal Listeners ---
        if (historyEditModal) {
            historyEditModal.querySelector('.close-button').addEventListener('click', hideHistoryEditModal);
        }
        if (historyEditAddForm) {
            historyEditAddForm.addEventListener('submit', handleSaveManualLog);
        }
        if (historyEditAddSetBtn) {
            historyEditAddSetBtn.addEventListener('click', handleAddManualSetRow);
        }
        if (historyEditRemoveSetBtn) {
            historyEditRemoveSetBtn.addEventListener('click', handleRemoveManualSetRow);
        }

        // Define hideHistoryEditModal function
        function hideHistoryEditModal() {
            if (historyEditModal) {
                historyEditModal.style.display = 'none';
            }
        }

        // Define handleSaveManualLog function
        function handleSaveManualLog(event) {
            event.preventDefault();
            console.log('Save manual log function called');
            // This is a placeholder - the actual implementation would save the log data
            hideHistoryEditModal();
        }

        // Define handleAddManualSetRow function
        function handleAddManualSetRow() {
            console.log('Add manual set row function called');
            // This is a placeholder - the actual implementation would add a new set row
        }

        // Define handleRemoveManualSetRow function
        function handleRemoveManualSetRow() {
            console.log('Remove manual set row function called');
            // This is a placeholder - the actual implementation would remove a set row
        }
        // Delegate listener for deleting existing logs within the modal
        if (historyEditLogListEl) {
            historyEditLogListEl.addEventListener('click', function(event) {
                if (event.target.classList.contains('history-delete-log-btn')) {
                    const logId = event.target.dataset.logId;
                    if (logId) {
                        handleDeleteLogEntry(parseInt(logId, 10));
                    }
                }
            });
        }

        // --- Photo Upload Listeners ---
        if (addPhotoBtn) {
            addPhotoBtn.addEventListener('click', openPhotoUploadModal);
        }
        if (photoModalCloseBtn) {
            photoModalCloseBtn.addEventListener('click', closePhotoUploadModal);
        }
        if (photoForm) {
             photoForm.addEventListener('submit', handlePhotoUpload);
        }
        if (photoUploadInput) {
             photoUploadInput.addEventListener('change', () => displayFileSize(photoUploadInput));
        }
        if (deletePhotoBtn) {
            deletePhotoBtn.addEventListener('click', handleDeletePhoto);
        }
        if (comparePhotosBtn) {
             comparePhotosBtn.addEventListener('click', togglePhotoComparison);
        }
        if (comparisonPhotoSelect1) {
             comparisonPhotoSelect1.addEventListener('change', updateComparisonImages);
        }
        if (comparisonPhotoSelect2) {
             comparisonPhotoSelect2.addEventListener('change', updateComparisonImages);
        }

        // --- Initialize Chart.js Config ---
        // Setup Chart.js configuration
        function setupChartConfig() {
            if (typeof Chart !== 'undefined') {
                console.log('[Chart Config] Setting up Chart.js defaults for workouts');

                // Set global defaults for all charts
                Chart.defaults.color = '#ddd';
                Chart.defaults.borderColor = '#444';
                Chart.defaults.font.family = "'Roboto', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";

                // Set defaults for line charts
                if (Chart.defaults.elements && Chart.defaults.elements.line) {
                    Chart.defaults.elements.line.borderWidth = 2;
                    Chart.defaults.elements.line.tension = 0.2;
                }

                // Set defaults for points
                if (Chart.defaults.elements && Chart.defaults.elements.point) {
                    Chart.defaults.elements.point.radius = 4;
                    Chart.defaults.elements.point.hoverRadius = 6;
                }

                console.log('[Chart Config] Chart.js configuration complete');
            } else {
                console.warn('[Chart Config] Chart.js not loaded, skipping configuration');
            }
        }

        // Call the setup function
        setupChartConfig();

        // --- Initialize Auto-Save ---
        initializeAutoSave();

        // --- Initialize Mobile Layout Adjustments ---
        initializeMobileLayout();

        // Restore page and workout state *after* listeners are set up
        restoreWorkoutState();
        restoreInputValues();

        console.log('Initialization complete.');
    } // End of initialize function

    // --- New Handler for Adding Multiple Selected Exercises (Reconstructed) ---
    async function handleAddSelectedExercises() {
        const targetList = exerciseModal.dataset.targetList || 'active'; // Determine target

        // Log all checked exercises for debugging
        console.log('Current checked exercises:');
        checkedExercises.forEach(id => {
            console.log(`- Exercise ID: ${id}`);
        });

        // Get all selected exercises from the checkedExercises Set
        if (checkedExercises.size === 0) {
            alert('Please select at least one exercise to add.');
            return;
        }

        console.log(`Adding ${checkedExercises.size} checked exercises to ${targetList}`);

        // Use the order array to add exercises in the order they were checked
        const orderedIds = checkedExercisesOrder.filter(id => checkedExercises.has(id));

        // Add any selected exercises that might not be in the order array (fallback)
        Array.from(checkedExercises).forEach(id => {
            if (!orderedIds.includes(id)) {
                orderedIds.push(id);
            }
        });

        console.log(`Ordered IDs for adding (${orderedIds.length}):`, orderedIds);

        // Store the exercises to add before closing the modal
        const exercisesToAdd = [...orderedIds];

        // Close the modal before adding exercises
        closeExerciseModal();

        // Add exercises in the correct order (sequentially to maintain order)
        for (const exerciseId of exercisesToAdd) {
            console.log(`Adding exercise ID: ${exerciseId} to ${targetList}`);
            await addExerciseToWorkout(exerciseId, targetList); // Pass targetList and await completion
        }

        console.log(`Added ${exercisesToAdd.length} exercises to ${targetList}`);

        // Clear the selected exercises after adding them
        checkedExercises.clear();
        checkedExercisesOrder.length = 0;
        console.log('Cleared all checked exercises');

        // Re-render the available exercises list to reflect the cleared selections
        renderAvailableExercises(exerciseSearchInput.value, exerciseCategoryFilter.value);
    }

    // --- Cancel Workout Function (Reconstructed) ---
    function handleCancelWorkout() {
        // Save input values before canceling? Maybe not necessary if clearing state.
        // Optional: Consider saving input values first via saveInputValues() or saveWorkoutData()
        console.log('Cancel workout requested.');

        // Stop timer immediately to prevent further updates while confirming
        stopTimer();

        if (confirm('Are you sure you want to cancel this workout? All current progress for this session will be lost.')) {
            console.log('Workout cancelled by user.');

            // Reset state variables
            currentWorkout = [];
            workoutStartTime = null;

            // Clear saved workout state from localStorage
            clearWorkoutState(); // Assuming this function exists and is accessible

            // Switch back to landing page
            switchPage('landing');
        } else {
            console.log('Workout cancellation aborted.');
            // Resume timer if user cancels the cancellation
            startTimer();
        }
    }

    // Defer listener attachment slightly to ensure DOM is ready
    setTimeout(() => {
        const searchInputEl = document.getElementById('template-search');
        if (searchInputEl) {
            console.log('[Initialize Defer] Found templateSearchInput, adding listener...');
            searchInputEl.addEventListener('input', (event) => {
                console.log('[Template Search Listener] Event fired!');

                const searchTerm = event.target.value.toLowerCase();
                console.log(`[Template Search] Input event: searchTerm = '${searchTerm}'`);

                const filtered = workoutTemplates.filter(t => {
                    return t.name && typeof t.name === 'string' && t.name.toLowerCase().includes(searchTerm);
                });

                console.log(`[Template Search] Filtered templates count: ${filtered.length}`);

                renderWorkoutTemplates(filtered);
            });
        } else {
            console.error('[Initialize Defer Error] templateSearchInput element not found! Cannot add search listener.');
        }
    }, 0); // Delay of 0ms pushes to end of event loop
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

// Helper function to calculate 1RM based on weight and reps
function calculate1RM(weight, reps) {
    // Based on the repetition percentages table
    const percentages = {
        1: 100,
        2: 97,
        3: 94,
        4: 92,
        5: 89,
        6: 86,
        7: 83,
        8: 81,
        9: 78,
        10: 75,
        11: 73,
        12: 71,
        13: 70,
        14: 68,
        15: 67,
        16: 65,
        17: 64,
        18: 63,
        19: 61,
        20: 60,
        21: 59,
        22: 58,
        23: 57,
        24: 56,
        25: 55,
        26: 54,
        27: 53,
        28: 52,
        29: 51,
        30: 50
    };

    // If reps is beyond our table, default to 50%
    const percentage = percentages[reps] || 50;

    // Calculate 1RM: weight / percentage * 100
    const oneRepMax = Math.round((weight / percentage) * 100);

    return oneRepMax;
}

// Helper function to calculate the goal for the next workout
function calculateGoal(exerciseData) {
    if (!exerciseData.lastLog || !exerciseData.lastLog.weight_used || !exerciseData.lastLog.reps_completed) {
        return null; // No previous data to base goal on
    }

    const prevWeights = exerciseData.lastLog.weight_used.split(',').map(w => parseFloat(w.trim()));
    const prevReps = exerciseData.lastLog.reps_completed.split(',').map(r => parseInt(r.trim()));
    const prevUnit = exerciseData.lastLog.weight_unit || 'lbs'; // Default to lbs

    // Filter out any invalid entries
    const validSets = [];
    for (let i = 0; i < Math.min(prevWeights.length, prevReps.length); i++) {
        if (!isNaN(prevWeights[i]) && !isNaN(prevReps[i])) {
            validSets.push({
                weight: prevWeights[i],
                reps: prevReps[i],
                index: i
            });
        }
    }

    if (validSets.length === 0) {
        return null; // No valid sets to base goal on
    }

    // Check if all sets in the last workout reached the target reps (e.g., 10)
    const targetReps = 10; // This could be configurable
    const allSetsReachedTarget = validSets.every(set => set.reps >= targetReps);

    // Create a copy of the previous workout's sets
    const goalSets = JSON.parse(JSON.stringify(validSets));

    if (allSetsReachedTarget) {
        // If all sets reached the target reps, increase weight for the first set
        // and keep the same weight for the remaining sets
        const firstSetWeight = goalSets[0].weight;
        const weightIncrement = 5; // This could be configurable or based on the unit

        goalSets[0].weight = firstSetWeight + weightIncrement;
        goalSets[0].reps = 8; // Start with fewer reps at the higher weight
    } else {
        // Find the first set that didn't reach the target reps
        const incompleteSetIndex = goalSets.findIndex(set => set.reps < targetReps);

        if (incompleteSetIndex >= 0) {
            // Increase the reps for this set by 1
            goalSets[incompleteSetIndex].reps += 1;
        }
    }

    return {
        sets: goalSets,
        unit: prevUnit
    };
}

// Helper function to generate HTML for a single set row
function generateSingleSetRowHtml(setIndex, exerciseData, isTemplate = false) {
    console.log(`[DEBUG] generateSingleSetRowHtml called for set ${setIndex+1} of exercise ${exerciseData.name}`);
    console.log(`[DEBUG] exerciseData.lastLog:`, exerciseData.lastLog);

    // Default values
    let weightValue = '';
    let repsValue = '';
    // Use the exercise's current weight unit, or default to lbs
    const unit = exerciseData.weight_unit || 'lbs'; // Always default to lbs
    console.log(`[DEBUG] Using weight unit: ${unit}`);

    // Check if this is the first set (index 0) and if last log data exists
    if (setIndex === 0 && exerciseData.lastLog) {
        if (exerciseData.lastLog.weight_used) {
            const weights = exerciseData.lastLog.weight_used.split(',');
            if (weights.length > 0 && weights[0].trim() !== '') {
                weightValue = weights[0].trim();
                console.log(`[DEBUG] Set 1: Using weight value from lastLog: ${weightValue}`);
            }
        }
        if (exerciseData.lastLog.reps_completed) {
            const reps = exerciseData.lastLog.reps_completed.split(',');
            if (reps.length > 0 && reps[0].trim() !== '') {
                repsValue = reps[0].trim();
                console.log(`[DEBUG] Set 1: Using reps value from lastLog: ${repsValue}`);
            }
        }
    }

    const isDisabled = isTemplate;
    // Always show weight input for bodyweight to record the user's current body weight
    // Only hide for assisted exercises
    const weightInputType = (unit === 'assisted') ? 'hidden' : 'number';
    // Set appropriate placeholder based on unit type
    const weightPlaceholder = (unit === 'bodyweight') ? 'BW' : (unit === 'assisted') ? '' : 'Wt';
    const repsPlaceholder = 'Reps';

    // For the previous log display, use the current unit
    let previousLogTextHtml = `- ${unit} x -`;
    console.log(`[DEBUG] Default previousLogTextHtml: ${previousLogTextHtml}`);

    // Default empty goal
    let goalTextHtml = '';

    // Only show previous log data if this set index exists in the last log
    if (exerciseData.lastLog && exerciseData.lastLog.weight_used && exerciseData.lastLog.reps_completed) {
        console.log(`[DEBUG] Found lastLog data for ${exerciseData.name}`);
        const prevWeights = exerciseData.lastLog.weight_used.split(',');
        const prevReps = exerciseData.lastLog.reps_completed.split(',');
        const prevUnit = exerciseData.lastLog.weight_unit || 'lbs'; // Default to lbs instead of kg
        console.log(`[DEBUG] prevWeights: ${prevWeights}, prevReps: ${prevReps}, prevUnit: ${prevUnit}`);

        // Only use previous log data if this set index exists in the previous log
        if (setIndex < prevWeights.length && setIndex < prevReps.length) {
            const prevWeight = prevWeights[setIndex].trim() || '-';
            const prevRep = prevReps[setIndex].trim() || '-';
            previousLogTextHtml = `${prevWeight} ${prevUnit} x ${prevRep}`;
            console.log(`[DEBUG] Set ${setIndex+1}: Updated previousLogTextHtml to: ${previousLogTextHtml}`);
        } else {
            console.log(`[DEBUG] Set ${setIndex+1}: No previous log data for this set index (prevWeights.length=${prevWeights.length}, prevReps.length=${prevReps.length})`);
        }

        // Calculate goal for next workout if not a template
        if (!isTemplate) {
            const goal = calculateGoal(exerciseData);
            console.log(`[DEBUG] Goal calculation result:`, goal);
            if (goal && setIndex < goal.sets.length) {
                const goalSet = goal.sets[setIndex];
                goalTextHtml = `${goalSet.weight} ${goal.unit} x ${goalSet.reps}`;
                console.log(`[DEBUG] Set ${setIndex+1}: Set goalTextHtml to: ${goalTextHtml}`);
            } else {
                console.log(`[DEBUG] Set ${setIndex+1}: No goal data for this set index`);
            }
        }
    } else {
        console.log(`[DEBUG] No lastLog data available for ${exerciseData.name}`);
    }

    // Use a single layout that works for both mobile and desktop
    // Our CSS will handle the positioning differently based on screen size
    return `
        <div class="set-row" data-set-index="${setIndex}">
            <span class="set-number">${setIndex + 1}</span>
            <span class="previous-log">${previousLogTextHtml}</span>
            <input type="${weightInputType}" class="weight-input" placeholder="${weightPlaceholder}" value="${weightValue}" ${isDisabled ? 'disabled' : ''} step="any" inputmode="decimal">
            <input type="text" class="reps-input" placeholder="${repsPlaceholder}" value="${repsValue}" ${isDisabled ? 'disabled' : ''} inputmode="numeric" pattern="[0-9]*">
            <span class="goal-target" title="Goal for next workout">${goalTextHtml}</span>
            ${!isTemplate ? `<button class="set-complete-toggle" data-set-index="${setIndex}" title="Mark Set Complete"></button>` : ''}
        </div>
    `;
}

// Toggle Exercise History Section
function toggleExerciseHistory() {
    const historySection = document.getElementById('exercise-history-section');
    const toggleButton = document.getElementById('toggle-history-btn');

    if (historySection.style.display === 'none') {
        historySection.style.display = 'block';
        toggleButton.textContent = 'Hide Exercise History';
    } else {
        historySection.style.display = 'none';
        toggleButton.textContent = 'Show Exercise History';
    }
}
