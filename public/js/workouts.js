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

    // --- Device Detection ---
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log('[Device Detection] Running on mobile device:', isMobile);

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
    const comparePhotosBtn = document.getElementById('compare-photos-btn');
    const photoComparisonSection = document.getElementById('photo-comparison-section');
    const comparisonPhotoSelect1 = document.getElementById('comparison-photo-select-1');
    const comparisonPhotoSelect2 = document.getElementById('comparison-photo-select-2');
    const comparisonImage1 = document.getElementById('comparison-image-1');
    const comparisonImage2 = document.getElementById('comparison-image-2');

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
        // Ensure at least one set is rendered
        numSets = Math.max(1, numSets);

        // Parse the *entire* previous log data ONCE, if available
        let weightsArray = [];
        let repsArray = [];
        let prevUnit = 'kg';
        if (!isTemplate && exerciseData.lastLog) {
             console.log(`[generateSetRowsHtml] Found lastLog for ${exerciseData.name}:`, exerciseData.lastLog);
            if (exerciseData.lastLog.weight_used) {
                weightsArray = exerciseData.lastLog.weight_used.split(',').map(w => w.trim());
            }
            if (exerciseData.lastLog.reps_completed) {
                repsArray = exerciseData.lastLog.reps_completed.split(',').map(r => r.trim());
            }
            prevUnit = exerciseData.lastLog.weight_unit || 'kg';
             console.log(`[generateSetRowsHtml] Parsed arrays: weights=[${weightsArray}], reps=[${repsArray}]`);
        }

        for (let i = 0; i < numSets; i++) {
            // --- Per-Set Logic ---
            let weightValue = ''; // Pre-fill value for weight input
            let repsValue = '';   // Pre-fill value for reps input
            let previousLogTextHtml = '- kg x -'; // Display text for previous log span
            const currentUnit = exerciseData.weight_unit || 'kg'; // Use exercise's current unit setting

            // Check if previous log data exists for THIS specific set index (i)
            if (!isTemplate && weightsArray.length > i && repsArray.length > i) {
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
            } else if (!isTemplate){
                // If no specific data for this set index, keep inputs empty, show placeholder text
                 console.log(`[generateSetRowsHtml] Set ${i}: No previous data found for this index.`);
            }
            // --- End Per-Set Logic ---

            const isCompleted = !isTemplate && exerciseData.completedSets && exerciseData.completedSets[i];
            const isDisabled = isTemplate;
            const weightInputType = (currentUnit === 'bodyweight' || currentUnit === 'assisted') ? 'hidden' : 'number';
            const weightPlaceholder = (currentUnit === 'bodyweight' || currentUnit === 'assisted') ? '' : 'Wt';
            const repsPlaceholder = 'Reps';

            // Generate the HTML for this specific set row
            setRowsHtml += `
                <div class="set-row" data-set-index="${i}">
                    <span class="set-number">${i + 1}</span>
                    <span class="previous-log">${previousLogTextHtml}</span>
                    <input type="${weightInputType}" class="weight-input" placeholder="${weightPlaceholder}" value="${weightValue}" ${isDisabled ? 'disabled' : ''} step="any" inputmode="decimal">
                    <input type="text" class="reps-input" placeholder="${repsPlaceholder}" value="${repsValue}" ${isDisabled ? 'disabled' : ''} inputmode="numeric" pattern="[0-9]*">
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
                <h4>${escapeHtml(exerciseData.name)}</h4>
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

        // Re-attach input listeners if needed, or rely on delegation
        // Example if needed: setupSetInputListeners(exerciseItemElement);

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
                localStorage.setItem(STORAGE_KEYS.CURRENT_WORKOUT, JSON.stringify(currentWorkout));

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
        addExerciseFab.style.display = (pageToShow === 'active') ? 'block' : 'none';
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

    function startWorkoutFromTemplate(templateId) {
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
            exercises: template.exercises.map(ex => ({
                ...ex,
                lastLog: undefined, // Mark for fetching
                // Initialize sets_completed based on template 'sets' count
                sets_completed: Array(parseInt(ex.sets) || 1).fill(null).map(() => ({ weight: '', reps: '', unit: ex.weight_unit || 'kg', completed: false }))
            }))
        };

        console.log("Current workout initialized from template:", currentWorkout); // Log the object

        // Set workout name display
        const workoutName = currentWorkout.name; // Use the name from the object
        currentWorkoutNameEl.textContent = workoutName;

        // Render the workout and switch page
        renderCurrentWorkout(); // This function expects currentWorkout.exercises
        switchPage('active');
        startTimer();
        // Show FAB
        addExerciseFab.style.display = 'block';

        // Save the new workout state
        saveWorkoutState();
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

            exerciseItem.innerHTML = `
                <div class="exercise-item-header">
                    <h4>${escapeHtml(exercise.name)}</h4>
                    <select class="exercise-unit-select" data-workout-index="${index}">
                        <option value="kg" ${exercise.weight_unit === 'kg' ? 'selected' : ''}>kg</option>
                        <option value="lbs" ${exercise.weight_unit === 'lbs' ? 'selected' : ''}>lbs</option>
                        <option value="bodyweight" ${exercise.weight_unit === 'bodyweight' ? 'selected' : ''}>Bodyweight</option>
                        <option value="assisted" ${exercise.weight_unit === 'assisted' ? 'selected' : ''}>Assisted</option>
                    </select>
                    <!-- Corrected: Hardcode class and add data-index -->
                    <button class="btn-delete-template-exercise" data-index="${index}" title="Remove Exercise">&times;</button>
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

        // Compare Photos Button Listener
        if (comparePhotosBtn) {
            comparePhotosBtn.addEventListener('click', togglePhotoComparison);
        } else {
            console.error('[Initialize] comparePhotosBtn not found!');
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

        // Store the IDs of selected exercises
        const selectedIds = [];
        selectedCheckboxes.forEach(checkbox => {
            const exerciseId = parseInt(checkbox.value, 10);
            if (!isNaN(exerciseId)) {
                selectedIds.push(exerciseId);
                addExerciseToWorkout(exerciseId, targetList); // Pass targetList
            }
        });

        // Clear the checked state for added exercises
        selectedIds.forEach(id => checkedExercises.delete(id));

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

    // --- NEW: File Size Display Function ---
    function displayFileSize(input) {
        const fileSizeInfo = document.getElementById('file-size-info');
        const fileSizeDisplay = document.getElementById('file-size-display');

        if (!fileSizeInfo || !fileSizeDisplay) {
            console.error('[Photo Upload] File size display elements not found');
            return;
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
        statusElement.innerHTML = `
            <div style="color: #03dac6;">Uploading ${files.length} file(s) (${totalSizeMB} MB)...</div>
            <div style="font-size: 0.8em; margin-top: 5px;">
                ${isMobile ?
                    'Using mobile compression. Files will be compressed to under 800KB.' :
                    'Using standard compression. Large files will be reduced in size.'}
            </div>
            <div style="font-size: 0.8em; margin-top: 5px; color: #aaa;">
                This may take a moment for large files...
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
            statusElement.textContent = 'Upload timed out. Please try again with a smaller image.';
            statusElement.style.color = 'red';
            submitButton.disabled = false;
            console.error('[Photo Upload Client] Upload timed out after 30 seconds');
        }, 30000); // 30 second timeout

        let response;
        try {
            response = await fetch(uploadEndpoint, {
                method: 'POST',
                body: formData,
            });

            // Clear the timeout since we got a response
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
            // ... (keep existing detailed error logging in catch block) ...
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
        if (progressPhotos.length > 0 && comparisonPhotoSelect1 && comparisonPhotoSelect2) {
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
                // img.src = photo.file_path; // <<< CHANGE THIS
                img.dataset.src = photo.file_path; // <<< TO THIS
                img.src = ''; // <<< ADD THIS (Set src initially empty)
                img.alt = `Progress photo from ${new Date(photo.date_taken + 'T00:00:00').toLocaleDateString()} (ID: ${photo.photo_id})`;
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
            // Only set src if it's not already set or differs from data-src
            if (currentImageElement.src !== currentImageElement.dataset.src) {
                console.log(`[Photo Display DEBUG] Setting src for index ${currentPhotoIndex} from data-src: ${currentImageElement.dataset.src}`);
                currentImageElement.src = currentImageElement.dataset.src;
            }
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

    // --- NEW: Handler for Exercise Unit Change ---
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

        // Optional: Update any visual display linked to the unit if needed elsewhere
        // (Currently, only affects how data is saved)
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

    return `
        <div class="set-row" data-set-index="${setIndex}">
            <span class="set-number">${setIndex + 1}</span>
            <span class="previous-log">${previousLogTextHtml}</span>
            <input type="${weightInputType}" class="weight-input" placeholder="${weightPlaceholder}" value="${weightValue}" ${isDisabled ? 'disabled' : ''} step="any" inputmode="decimal">
            <input type="text" class="reps-input" placeholder="${repsPlaceholder}" value="${repsValue}" ${isDisabled ? 'disabled' : ''} inputmode="numeric" pattern="[0-9]*">
            ${!isTemplate ? `<button class="set-complete-toggle" data-set-index="${setIndex}" title="Mark Set Complete"></button>` : ''}
        </div>
    `;
}




