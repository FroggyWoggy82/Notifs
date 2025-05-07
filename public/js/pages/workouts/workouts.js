
window.saveTemplateFromButton = function() {

    if (typeof window.handleSaveTemplate === 'function') {

        const mockEvent = {
            preventDefault: () => {},
            stopPropagation: () => {}
        };
        window.handleSaveTemplate(mockEvent);
    } else {
        console.error('Error: handleSaveTemplate function not found');
    }
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('Workout Tracker JS loaded');

    function debounce(func, wait) {
        let timeout = null; // Initialize timeout as null

        const debounceId = Math.random().toString(36).substring(2, 7);


        return function executedFunction(...args) {
            const functionName = func.name || 'anonymous'; // Get function name for logs
            const context = this;
            console.log(`[Debounce ${debounceId} | ${functionName}] Event triggered. Current timeout: ${timeout !== null}`); // Log event trigger

            const later = () => {
                console.log(`[Debounce ${debounceId} | ${functionName}] -------> EXECUTING <-------`); // Clearer execution log
                timeout = null; // Reset timeout ID *before* executing
                func.apply(context, args); // Use apply to preserve context and arguments
            };

            if (timeout) {
                console.log(`[Debounce ${debounceId} | ${functionName}] Clearing existing timeout ID: ${timeout}`);
                clearTimeout(timeout);
            }

            timeout = setTimeout(later, wait);
            console.log(`[Debounce ${debounceId} | ${functionName}] Setting new timeout ID: ${timeout} for ${wait}ms`);
        };
    }
    const navigationDebounceTime = 100; // Milliseconds to wait

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log('[Device Detection] Running on mobile device:', isMobile);

    if (isMobile || ('ontouchstart' in window)) {
        document.body.classList.add('touch-device');
    }

    function addPassiveTouchListener(element, eventType, handler) {
        if (!element) return;

        element.addEventListener(eventType, handler, { passive: true });
    }

    let availableExercises = []; // Populated from API
    let workoutTemplates = [];   // Populated from API

    window.currentWorkout = []; // Can be an array (empty workout) or object { name, exercises: [...] } (template workout)

    window.workoutStartTime = null;

    let workoutTimerInterval = null;
    let editingTemplateId = null; // To track which template is being edited
    let currentTemplateExercises = []; // Array for exercises in the template editor
    let exerciseHistoryChart = null; // To hold the Chart.js instance
    let currentHistoryCategoryFilter = 'all'; // State for history category filter
    let currentHistoryExerciseId = null; // Store the currently selected exercise ID
    let currentHistoryExerciseName = null; // Store the name
    let currentPage = 'landing'; // <<< ADDED: Declare currentPage in top-level scope
    let lastInputSaveTime = 0; // Track when inputs were last saved
    let lastUsedRepsValues = {}; // Store last used reps values by exercise ID

    let currentEditingExerciseIndex = -1;
    let currentEditingExerciseId = null;

    const STORAGE_KEYS = {
        CURRENT_WORKOUT: 'workout_tracker_current_workout',
        WORKOUT_START_TIME: 'workout_tracker_start_time',
        CURRENT_PAGE: 'workout_tracker_current_page',
        INPUT_VALUES: 'workout_tracker_input_values', // Key for storing input values
        LAST_USED_REPS: 'workout_tracker_last_used_reps', // Key for storing last used reps values
        LAST_USED_AUTHOR: 'workout_tracker_last_used_author', // Key for storing last used author
        LAST_USED_EDITION: 'workout_tracker_last_used_edition' // Key for storing last used edition
    };

    let progressPhotosData = []; // Holds the array of { photo_id, date_taken, file_path, ... }
    let currentPhotoIndex = 0;

    const workoutLandingPage = document.getElementById('workout-landing-page');
    const activeWorkoutPage = document.getElementById('active-workout-page');
    const startEmptyWorkoutBtn = document.getElementById('start-empty-workout-btn');
    const templateListContainer = document.getElementById('workout-template-list');
    const templateSearchInput = document.getElementById('template-search');
    const createTemplateBtn = document.getElementById('create-template-btn');

    const photoPrevBtn = document.getElementById('photo-prev-btn');
    const photoNextBtn = document.getElementById('photo-next-btn');

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

    const defineNewExerciseSection = document.getElementById('define-new-exercise-section');
    const toggleDefineExerciseBtn = document.getElementById('toggle-define-exercise-btn');
    const newExerciseNameInput = document.getElementById('new-exercise-name');
    const newExerciseCategorySelect = document.getElementById('new-exercise-category');
    const saveNewExerciseBtn = document.getElementById('save-new-exercise-btn');


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


    const historyExerciseSearchInput = document.getElementById('history-exercise-search');
    const historySearchResultsEl = document.getElementById('history-search-results');
    const historyCategoryFilterSelect = document.getElementById('history-category-filter-select');
    const historyChartCanvas = document.getElementById('exercise-history-chart');

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

    const photoForm = document.getElementById('progress-photo-form');
    const photoDateInput = document.getElementById('photo-date');
    const photoUploadInput = document.getElementById('photo-upload');
    const uploadStatusEl = document.getElementById('upload-status');
    const photoGalleryEl = document.getElementById('progress-photos-gallery');

    const addPhotoBtn = document.getElementById('add-photo-btn');
    const photoUploadModal = document.getElementById('photo-upload-modal');
    const photoModalCloseBtn = photoUploadModal ? photoUploadModal.querySelector('.close-button') : null;



    const deletePhotoBtn = document.getElementById('delete-photo-btn');
    const photoReel = document.querySelector('.photo-reel'); // Reel container
    const paginationDotsContainer = document.querySelector('.pagination-dots'); // Added
    const currentPhotoDateDisplay = document.getElementById('current-photo-date-display'); // NEW: Date display element



    console.log('Navigation buttons:', photoPrevBtn, photoNextBtn);

    const photoSliderContainer = document.querySelector('.photo-slider-container');
    const photoNavigationContainer = document.querySelector('.photo-navigation-container');

    const comparePhotosBtn = document.getElementById('compare-photos-btn');
    const photoComparisonSection = document.getElementById('photo-comparison-section');
    const comparisonPhotoSelect1 = document.getElementById('comparison-photo-select-1');
    const comparisonPhotoSelect2 = document.getElementById('comparison-photo-select-2');
    const comparisonImage1 = document.getElementById('comparison-image-1');
    const comparisonImage2 = document.getElementById('comparison-image-2');

    function generateSetRowsHtml(exerciseData, index, isTemplate = false) {
        let setRowsHtml = '';


        let numSets = 1; // Default to 1 set

        if (exerciseData.sets && parseInt(exerciseData.sets) > 0) {
            numSets = parseInt(exerciseData.sets);
            console.log(`Using exercise.sets property for ${exerciseData.name}: ${numSets} sets`);
        }

        else if (!isTemplate && exerciseData.lastLog && exerciseData.lastLog.reps_completed) {

            numSets = exerciseData.lastLog.reps_completed.split(',').length;
            console.log(`Using lastLog data for ${exerciseData.name}: ${numSets} sets`);
        }

        numSets = Math.max(1, numSets);
        console.log(`Final set count for ${exerciseData.name}: ${numSets} sets`);

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

            let weightValue = ''; // Pre-fill value for weight input
            let repsValue = '';   // Pre-fill value for reps input
            let previousLogTextHtml = '- lbs x -'; // Display text for previous log span (default to lbs)
            let goalTextHtml = ''; // Default empty goal
            const currentUnit = exerciseData.weight_unit || 'lbs'; // Use exercise's current unit setting (default to lbs)

            if (isTemplate && exerciseData.reps) {
                repsValue = exerciseData.reps;
                console.log(`[generateSetRowsHtml] Template Set ${i}: Using default reps=${repsValue}`);
            }

            else if (!isTemplate && weightsArray.length > i && repsArray.length > i) {
                const prevWeight = weightsArray[i];
                const prevReps = repsArray[i];

                if (prevWeight !== '') {
                    weightValue = prevWeight;
                }
                if (prevReps !== '') {
                    repsValue = prevReps;
                }

                previousLogTextHtml = `${prevWeight || '-'} ${prevUnit} x ${prevReps || '-'}`;
                 console.log(`[generateSetRowsHtml] Set ${i}: Pre-filling weight=${weightValue}, reps=${repsValue}. Display='${previousLogTextHtml}'`);

                if (!isTemplate) {
                    const goal = calculateGoal(exerciseData);
                    if (goal && i < goal.sets.length) {
                        const goalSet = goal.sets[i];
                        goalTextHtml = `${goalSet.weight} ${goal.unit} x ${goalSet.reps}`;
                    }
                }
            } else if (!isTemplate){

                 console.log(`[generateSetRowsHtml] Set ${i}: No previous data found for this index.`);
            }


            const isCompleted = !isTemplate && exerciseData.completedSets && exerciseData.completedSets[i];
            const isDisabled = isTemplate;


            const weightInputType = (currentUnit === 'assisted') ? 'hidden' : 'number';

            const weightPlaceholder = (currentUnit === 'bodyweight') ? 'BW' : (currentUnit === 'assisted') ? '' : 'Wt';
            const repsPlaceholder = 'Reps';

            setRowsHtml += `
                <div class="set-row" data-set-index="${i}">
                    <span class="set-number">${i + 1}</span>
                    <span class="previous-log">${previousLogTextHtml}</span>
                    <input type="${weightInputType}" class="weight-input" placeholder="${weightPlaceholder}" value="${weightValue}" ${isDisabled ? 'disabled' : ''} step="any" inputmode="decimal">
                    <input type="text" class="reps-input" placeholder="${repsPlaceholder}" value="${repsValue}" ${isDisabled ? 'disabled' : ''} inputmode="numeric" pattern="[0-9]*">
                    <span class="goal-target" title="Goal for next workout">${goalTextHtml}</span>
                    ${!isTemplate ? `<button class="set-complete-toggle ${isCompleted ? 'completed' : ''}" data-workout-index="${index}" data-set-index="${i}" title="Mark Set Complete" onclick="window.handleSetToggle(event)"></button>` : ''}
                </div>
            `;
        }
        return setRowsHtml;
    }

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
            console.log('Template IDs:', workoutTemplates.map(t => t.workout_id));
            renderWorkoutTemplates(); // Render initially on landing page
        } catch (error) {
            console.error('Error fetching templates:', error);
            templateListContainer.innerHTML = '<p style="color: red;">Error loading templates.</p>';
        }
    }


    window.renderWorkoutTemplates = function renderWorkoutTemplates(filteredTemplates = workoutTemplates) {

        const sourceArrayName = (filteredTemplates === workoutTemplates) ? 'global workoutTemplates' : 'filteredTemplates argument';

        if (!templateListContainer) {
            return;
        }

        templateListContainer.innerHTML = ''; // Clear previous

        if (filteredTemplates.length === 0) {

            const emptyMessage = (sourceArrayName === 'filteredTemplates argument')
                ? 'No templates found matching your search.'
                : 'No templates created yet.';
            templateListContainer.innerHTML = `<p>${emptyMessage}</p>`;
            return;
        }
        filteredTemplates.forEach(template => {
            const card = document.createElement('div');
            card.className = 'workout-template-card';
            card.dataset.templateId = template.workout_id;

            let exerciseListHtml = '<p class="no-exercises">No exercises defined</p>'; // Default message
            if (template.exercises && template.exercises.length > 0) {

                exerciseListHtml = template.exercises
                    .map(ex => `<div class="exercise-list-item">${escapeHtml(ex.name)}</div>`)
                    .join('');
            }


            const completionCount = template.completion_count || 0;
            const completionBadge = completionCount > 0
                ? `<div class="completion-count-badge" title="Completed ${completionCount} time${completionCount !== 1 ? 's' : ''}">
                     <span>${completionCount}</span>
                   </div>`
                : '';

            let displayName = template.name;
            const nameParts = template.name.split(' - ');

            if (nameParts.length > 1) {
                const baseName = nameParts[0];

                let authorEdition = nameParts.slice(1).join(' - ');

                displayName = `${escapeHtml(baseName)} <span class="template-author-edition">${escapeHtml(authorEdition)}</span>`;
            } else {
                displayName = escapeHtml(template.name);
            }

            card.innerHTML = `
                <div class="card-corner-actions">
                    <button class="btn-edit-template" data-template-id="${template.workout_id}" title="Edit Template">&#9998;</button>
                    <button class="btn-delete-template" data-template-id="${template.workout_id}" title="Delete Template" onclick="window.handleDeleteTemplate(${template.workout_id})">&times;</button>
                </div>
                <h3>${displayName} ${completionBadge}</h3>
                ${template.description ? `<p class="template-description">${escapeHtml(template.description)}</p>` : ''}
                <div class="exercise-summary-vertical">
                    ${exerciseListHtml}
                </div>
                <div class="template-actions">
                   <button class="btn-start-template btn btn-primary btn-small" data-template-id="${template.workout_id}">Start Workout</button>
                </div>
            `;
            templateListContainer.appendChild(card);

            const startButton = card.querySelector('.btn-start-template');
            if (startButton) {
                startButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    startWorkoutFromTemplate(template.workout_id);
                });
            }

            const editButton = card.querySelector('.btn-edit-template');
            if (editButton) {
                editButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log('[Direct Edit Button] Edit button clicked for template:', template.workout_id);
                    showTemplateEditor(template);
                });
            }


        });
    }

    const checkedExercises = new Set();

    const checkedExercisesOrder = [];

    function renderAvailableExercises(searchTerm = '', category = 'all') {


        const currentCheckboxes = availableExerciseListEl.querySelectorAll('input[type="checkbox"]');
        currentCheckboxes.forEach(checkbox => {
            const exerciseId = parseInt(checkbox.value, 10);
            if (checkbox.checked) {

                checkedExercises.add(exerciseId);

                if (!checkedExercisesOrder.includes(exerciseId)) {
                    checkedExercisesOrder.push(exerciseId);
                }
            }


        });

        availableExerciseListEl.innerHTML = ''; // Clear previous
        searchTerm = searchTerm.toLowerCase();

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

            const label = document.createElement('label');
            label.className = 'modal-list-item checkbox-item'; // Add class for styling

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = ex.exercise_id; // Store ID in value
            checkbox.id = `ex-select-${ex.exercise_id}`;
            checkbox.name = 'selectedExercises';

            if (checkedExercises.has(ex.exercise_id)) {
                checkbox.checked = true;
            }

            checkbox.addEventListener('change', (e) => {
                const exerciseId = parseInt(e.target.value, 10);
                if (e.target.checked) {

                    checkedExercises.add(exerciseId);

                    if (!checkedExercisesOrder.includes(exerciseId)) {
                        checkedExercisesOrder.push(exerciseId);
                    }
                    console.log(`Exercise ${exerciseId} checked. Total checked: ${checkedExercises.size}`);
                } else {

                    checkedExercises.delete(exerciseId);

                    const index = checkedExercisesOrder.indexOf(exerciseId);
                    if (index > -1) {
                        checkedExercisesOrder.splice(index, 1);
                    }
                    console.log(`Exercise ${exerciseId} unchecked. Total checked: ${checkedExercises.size}`);
                }
            });

            const textSpan = document.createElement('span');
            textSpan.textContent = `${ex.name} (${ex.category || 'N/A'})`;

            label.appendChild(checkbox);
            label.appendChild(textSpan);
            label.htmlFor = checkbox.id;



            availableExerciseListEl.appendChild(label);
        });
    }

    window.renderCurrentWorkout = function renderCurrentWorkout() {
        currentExerciseListEl.innerHTML = ''; // Clear previous
        const exercisesToRender = Array.isArray(window.currentWorkout) ? window.currentWorkout : window.currentWorkout.exercises;

        if (!exercisesToRender || exercisesToRender.length === 0) {
            currentExerciseListEl.innerHTML = '<p>Add exercises using the + button.</p>';
            return;
        }

        const renderPromises = exercisesToRender.map(async (exercise, index) => {
            const exerciseItem = document.createElement('div');
            exerciseItem.className = 'exercise-item';



            try {
                await renderSingleExerciseItem(exerciseItem, exercise, index);
                return exerciseItem; // Return the rendered element
            } catch (error) {
                console.error(`Error rendering exercise item for ${exercise.name}:`, error);

                const errorItem = document.createElement('div');
                errorItem.className = 'exercise-item error';
                errorItem.textContent = `Error loading ${exercise.name}`;
                return errorItem;
            }
        });

        Promise.all(renderPromises).then(renderedItems => {
            currentExerciseListEl.innerHTML = ''; // Clear again just in case
            renderedItems.forEach(item => {
                if (item) { // Ensure item exists (in case of error)
                    currentExerciseListEl.appendChild(item);
                }
            });
            console.log("[renderCurrentWorkout] Finished appending all rendered items.");

            if (currentPage === 'active') {
                setTimeout(() => {

                    if (typeof restoreWorkoutData === 'function') {
                        restoreWorkoutData();
                    } else {

                        restoreInputValues();
                    }
                }, 300);
            }
        }).catch(error => {
            console.error("Error rendering one or more workout items:", error);
            currentExerciseListEl.innerHTML = '<p style="color: red;">Error displaying workout. Please try refreshing.</p>';
        });
    }

    async function renderSingleExerciseItem(exerciseItemElement, exerciseData, index, isTemplate = false) {

        exerciseItemElement.dataset.isTemplate = isTemplate ? 'true' : 'false';

        if (!exerciseData.weight_unit) {

            try {
                const baseUrl = window.location.origin;
                const response = await fetch(`${baseUrl}/api/exercise-preferences/${exerciseData.exercise_id}`, {
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    const preference = await response.json();
                    if (preference && preference.weight_unit) {

                        exerciseData.weight_unit = preference.weight_unit;
                    } else {

                        exerciseData.weight_unit = 'lbs';
                    }
                } else {

                    exerciseData.weight_unit = 'lbs';
                }
            } catch (error) {

                exerciseData.weight_unit = 'lbs';
            }
        }

        exerciseItemElement.dataset.workoutIndex = index; // <<< Use workoutIndex consistently
        exerciseItemElement.dataset.exerciseId = exerciseData.exercise_id;

        if (!isTemplate && exerciseData.lastLog === undefined) { // Check if fetch needed
            exerciseData.lastLog = null; // Set temporarily to prevent re-fetch while awaiting
            const fetchLastLog = async () => {
                try {
                    const response = await fetch(`/api/workouts/exercises/${exerciseData.exercise_id}/lastlog`);
                    if (response.ok) {
                        const logData = await response.json();
                        return logData; // Return the fetched data
                    } else if (response.status === 404) {
                        return null; // Return null explicitly
                    } else {
                        console.error(`Error fetching last log for ${exerciseData.name}: ${response.statusText}`);
                        return null; // Return null on error
                    }
                } catch (error) {
                    console.error(`Network error fetching last log for ${exerciseData.name}:`, error);
                    return null; // Return null on network error
                }
            };

            exerciseData.lastLog = await fetchLastLog();
        }


        const setsHtml = generateSetRowsHtml(exerciseData, index, isTemplate);

        let targetSetsRepsHtml = '';
        if (!isTemplate && exerciseData.template_sets && exerciseData.template_reps) {

            targetSetsRepsHtml = `<div class="target-sets-reps">Target Sets×Reps: ${exerciseData.template_sets}×${exerciseData.template_reps}</div>`;
        }

        let perExerciseSettingsHtml = '';
        if (isTemplate) {

            const defaultSetsValue = defaultSetsInput ? defaultSetsInput.value : '3';
            const defaultRepsValue = defaultRepsInput ? defaultRepsInput.value : '';

            const exerciseSets = exerciseData.sets || defaultSetsValue;
            const exerciseReps = exerciseData.reps || defaultRepsValue;
            const weightIncrement = exerciseData.weight_increment || 5;

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
                    <div class="exercise-setting">
                        <label>Weight Increment:</label>
                        <input type="number" class="exercise-weight-increment-input" value="${weightIncrement}" min="0.1" step="0.1" data-index="${index}">
                    </div>
                </div>
            `;
        }


        if (isTemplate) {

            exerciseItemElement.innerHTML = `
                <div class="drag-handle" title="Drag to reorder">
                    <span>&#8942;&#8942;</span>
                </div>
                <div class="exercise-item-header">
                    <h4>${escapeHtml(exerciseData.name)}</h4>
                    <div class="exercise-header-actions">
                        <select class="exercise-unit-select" data-index="${index}">
                            <option value="lbs" ${exerciseData.weight_unit === 'lbs' || !exerciseData.weight_unit ? 'selected' : ''}>lbs</option>
                            <option value="kg" ${exerciseData.weight_unit === 'kg' ? 'selected' : ''}>kg</option>
                            <option value="bodyweight" ${exerciseData.weight_unit === 'bodyweight' ? 'selected' : ''}>BW</option>
                            <option value="assisted" ${exerciseData.weight_unit === 'assisted' ? 'selected' : ''}>Assisted</option>
                        </select>
                        <button type="button" class="btn-view-exercise" data-exercise-id="${exerciseData.exercise_id}" title="View Exercise Video">🎬</button>
                        <button type="button" class="delete-template-exercise-btn btn-danger" data-index="${index}" title="Remove Exercise">&times;</button>
                    </div>
                </div>
                ${perExerciseSettingsHtml}
                <div class="exercise-notes-group">
                    <textarea class="exercise-notes-textarea" placeholder="Notes for this exercise...">${escapeHtml(exerciseData.notes || '')}</textarea>
                </div>
                <!-- Sets container and set actions are hidden via CSS but included for consistency -->
                <div class="sets-container" style="display: none;"> ${setsHtml} </div>
                <div class="set-actions-container" style="display: none;">
                    <button type="button" class="btn btn-danger btn-remove-set" data-index="${index}">- Remove Set</button>
                    <button type="button" class="btn btn-secondary btn-add-set" data-index="${index}">+ Add Set</button>
                </div>
                <!-- Overlay for the delete button in the top right corner -->
                <button type="button" class="delete-overlay delete-template-exercise-btn" data-index="${index}" title="Remove Exercise"></button>
        `;
        } else {

            exerciseItemElement.innerHTML = `
                <div class="exercise-item-header">
                    <h4>${escapeHtml(exerciseData.name)}</h4>
                    <button class="btn-exercise-options" data-workout-index="${index}" title="Exercise Options">...</button>
                    <!-- Options Menu (Hidden by default) -->
                    <div class="exercise-options-menu" id="options-menu-${index}">
                        <!-- Weight Unit Label -->
                        <div class="exercise-options-menu-label">
                            <label class="weight-unit-label" data-label="Weight Unit:">Weight Unit:</label>
                            <div class="weight-increment-container">
                                <span class="weight-increment-text">Weight Increment:</span>
                            </div>
                        </div>

                        <!-- Weight Unit and Increment Inputs Row -->
                        <div class="exercise-options-menu-row inputs-row">
                            <select id="weight-unit-${index}" class="weight-unit-select" data-workout-index="${index}">
                                <option value="lbs" ${exerciseData.weight_unit === 'lbs' ? 'selected' : ''}>lbs</option>
                                <option value="kg" ${exerciseData.weight_unit === 'kg' ? 'selected' : ''}>kg</option>
                                <option value="bodyweight" ${exerciseData.weight_unit === 'bodyweight' ? 'selected' : ''}>bodyweight</option>
                                <option value="assisted" ${exerciseData.weight_unit === 'assisted' ? 'selected' : ''}>assisted</option>
                            </select>
                            <input type="number" id="weight-increment-${index}" class="weight-increment-input" data-workout-index="${index}"
                                value="${exerciseData.weight_increment || 5}" min="0.1" step="0.1">
                        </div>

                        <!-- All Buttons in One Row -->
                        <div class="exercise-options-menu-row buttons-row">
                            <button type="button" class="btn-view-exercise ${exerciseData.youtube_url ? 'has-video' : ''}"
                                data-exercise-id="${exerciseData.exercise_id}"
                                data-has-video="${exerciseData.youtube_url ? 'true' : 'false'}"
                                title="${exerciseData.youtube_url ? 'View Exercise Video' : 'No video available - click to add one'}">
                                🎬 ${exerciseData.youtube_url ? 'View Exercise' : 'Add Video'}
                            </button>
                            <button type="button" class="view-history-btn"
                                data-exercise-id="${exerciseData.exercise_id}"
                                data-exercise-name="${escapeHtml(exerciseData.name)}"
                                title="View Exercise History">
                                <span class="icon">📊</span> History
                            </button>
                            <div class="button-group-right">
                                <button type="button" class="btn-edit-exercise-name" data-workout-index="${index}" title="Edit Exercise Name">✏️</button>
                                <button type="button" class="btn-delete-exercise" data-workout-index="${index}" title="Remove Exercise">&times;</button>
                            </div>
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
                    <button type="button" class="btn btn-danger btn-remove-set" data-workout-index="${index}">- Remove Set</button>
                    <button type="button" class="btn btn-secondary btn-add-set" data-workout-index="${index}">+ Add Set</button>
                </div>
            `;

        }

        const removeButton = exerciseItemElement.querySelector('.btn-remove-set');
        const setRowsCount = exerciseItemElement.querySelectorAll('.set-row').length;
        if (removeButton) {
            removeButton.disabled = setRowsCount <= 1;
        }


    }


    function toggleOptionsMenu(event) {
        const optionsButton = event.target;

        let workoutIndex = optionsButton.dataset.workoutIndex || optionsButton.dataset.index;

        if (!workoutIndex) {
            const exerciseItem = optionsButton.closest('.exercise-item');
            if (exerciseItem) {
                workoutIndex = exerciseItem.dataset.workoutIndex || exerciseItem.dataset.index;
            }
        }

        const isTemplate = !optionsButton.dataset.workoutIndex;
        const menuId = isTemplate ? `template-options-menu-${workoutIndex}` : `options-menu-${workoutIndex}`;
        const menu = document.getElementById(menuId);

        if (!menu) {
            console.error(`Options menu not found: ${menuId}`);
            return;
        }

        document.querySelectorAll('.exercise-options-menu.show').forEach(openMenu => {
            if (openMenu !== menu) {
                openMenu.classList.remove('show');
            }
        });

        menu.classList.toggle('show');

        event.stopPropagation();
    }

    async function handleViewExercise(event) {
        console.log('[View Exercise] Function called');

        event.preventDefault();

        event.stopPropagation();

        const isInTemplateEditor = document.getElementById('template-editor-page').classList.contains('active');
        console.log(`[View Exercise] Clicked in template editor: ${isInTemplateEditor}`);

        if (isInTemplateEditor) {
            console.log('[View Exercise] In template editor, ensuring form is not submitted');

            const form = event.target.closest('form');
            if (form) {
                console.log('[View Exercise] Found parent form, preventing default submission');

                const originalOnSubmit = form.onsubmit;
                form.onsubmit = (e) => {
                    console.log('[View Exercise] Intercepted form submission attempt');
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                };

                form.addEventListener('submit', (e) => {
                    console.log('[View Exercise] Intercepted form submission via event listener');
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }, true); // Use capturing phase
            }
        }

        const button = event.target.closest('.btn-view-exercise') || event.target;
        console.log('[View Exercise] Button:', button);

        const exerciseId = button.dataset.exerciseId;
        console.log('[View Exercise] Exercise ID:', exerciseId);

        if (!exerciseId) {
            console.error("[View Exercise] No exercise ID found on view button");
            return;
        }

        const hasVideo = button.dataset.hasVideo === 'true';
        console.log(`[View Exercise] Button indicates video available: ${hasVideo}`);

        console.log(`[View Exercise] Fetching YouTube URL for exercise ID: ${exerciseId}`);

        try {

            const isActiveWorkout = document.getElementById('active-workout-page').classList.contains('active');
            console.log(`[View Exercise] Is active workout: ${isActiveWorkout}`);

            let exercise;

            if (isActiveWorkout && currentWorkout && currentWorkout.exercises) {

                const workoutExercise = currentWorkout.exercises.find(ex => ex.exercise_id == exerciseId);

                if (workoutExercise && workoutExercise.youtube_url) {
                    console.log('[View Exercise] Found YouTube URL in active workout:', workoutExercise.youtube_url);
                    exercise = {
                        exercise_id: workoutExercise.exercise_id,
                        name: workoutExercise.name,
                        youtube_url: workoutExercise.youtube_url
                    };
                } else {
                    console.log('[View Exercise] No YouTube URL found in active workout, fetching from API');

                    const response = await fetch(`/api/workouts/exercises/${exerciseId}`);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch exercise: ${response.status}`);
                    }
                    exercise = await response.json();
                }
            } else {

                const response = await fetch(`/api/workouts/exercises/${exerciseId}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch exercise: ${response.status}`);
                }
                exercise = await response.json();
            }

            console.log('[View Exercise] Exercise data:', exercise);

            if (!exercise.youtube_url) {
                console.log('[View Exercise] No YouTube URL found, showing modal to set one');

                showYouTubeUrlModal(exerciseId, exercise.name);

                button.classList.remove('has-video');
                button.dataset.hasVideo = 'false';
                button.textContent = '🎬 Add Video';
                button.title = 'No video available - click to add one';
            } else {
                console.log('[View Exercise] Opening existing YouTube URL:', exercise.youtube_url);

                const isActiveWorkout = document.getElementById('active-workout-page').classList.contains('active');
                const isTemplateEditor = document.getElementById('template-editor-page').classList.contains('active');

                console.log(`[View Exercise] Page context: Active Workout = ${isActiveWorkout}, Template Editor = ${isTemplateEditor}`);

                button.classList.add('has-video');
                button.dataset.hasVideo = 'true';
                button.textContent = '🎬 View Exercise';
                button.title = 'View Exercise Video';

                if (isActiveWorkout || isTemplateEditor) {

                    console.log('[View Exercise] Showing video in embedded player');
                    showVideoPlayerModal(exercise.youtube_url, exercise.name);
                } else {

                    console.log('[View Exercise] Opening video in new tab');
                    window.open(exercise.youtube_url, '_blank');
                }
            }
        } catch (error) {
            console.error("[View Exercise] Error fetching exercise details:", error);
            alert("Failed to fetch exercise details. Please try again.");
        }

        return false;
    }

    function showYouTubeUrlModal(exerciseId, exerciseName) {
        console.log(`[YouTube Modal] Opening for exercise ID: ${exerciseId}, name: ${exerciseName}`);

        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        let modal = document.getElementById('youtube-url-modal');

        if (!modal) {
            console.log('[YouTube Modal] Creating new modal element');
            modal = document.createElement('div');
            modal.id = 'youtube-url-modal';
            modal.className = 'modal';

            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h3>Set YouTube URL for <span id="youtube-exercise-name"></span></h3>
                    <p>Enter a YouTube URL to link to this exercise:</p>
                    <input type="text" id="youtube-url-input" placeholder="https://www.youtube.com/watch?v=...">
                    <div class="modal-buttons">
                        <button type="button" id="save-youtube-url" class="btn btn-primary">Save</button>
                        <button type="button" id="cancel-youtube-url" class="btn">Cancel</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            console.log('[YouTube Modal] Modal element added to document body');

            modal.querySelector('.close-modal').addEventListener('click', (e) => {
                console.log('[YouTube Modal] Close button clicked');
                e.preventDefault();
                e.stopPropagation();
                modal.style.display = 'none';
            });

            modal.querySelector('#cancel-youtube-url').addEventListener('click', (e) => {
                console.log('[YouTube Modal] Cancel button clicked');
                e.preventDefault();
                e.stopPropagation();
                modal.style.display = 'none';
            });

            modal.querySelector('.modal-content').addEventListener('click', (e) => {
                e.stopPropagation();
            });

            modal.querySelector('#save-youtube-url').addEventListener('click', async (e) => {
                console.log('[YouTube Modal] Save button clicked');
                e.preventDefault();
                e.stopPropagation();

                const youtubeUrl = document.getElementById('youtube-url-input').value.trim();
                const currentExerciseId = modal.dataset.exerciseId;

                console.log(`[YouTube Modal] Saving URL: ${youtubeUrl} for exercise ID: ${currentExerciseId}`);

                if (!youtubeUrl) {
                    alert("Please enter a valid YouTube URL");
                    return;
                }

                try {
                    const response = await fetch(`/api/workouts/exercises/${currentExerciseId}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ youtube_url: youtubeUrl })
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to update exercise: ${response.status}`);
                    }

                    const updatedExercise = await response.json();
                    console.log("[YouTube Modal] Exercise updated with YouTube URL:", updatedExercise);

                    const isActiveWorkout = document.getElementById('active-workout-page').classList.contains('active');

                    const exerciseButtons = document.querySelectorAll(`.btn-view-exercise[data-exercise-id="${currentExerciseId}"]`);
                    exerciseButtons.forEach(button => {
                        console.log("[YouTube Modal] Updating button appearance for exercise:", currentExerciseId);
                        button.classList.add('has-video');
                        button.dataset.hasVideo = 'true';
                        button.textContent = '🎬 View Exercise';
                        button.title = 'View Exercise Video';
                    });

                    if (isActiveWorkout && currentWorkout && currentWorkout.exercises) {
                        const workoutExercise = currentWorkout.exercises.find(ex => ex.exercise_id == currentExerciseId);
                        if (workoutExercise) {
                            console.log("[YouTube Modal] Updating exercise data in current workout");
                            workoutExercise.youtube_url = youtubeUrl;

                            saveWorkoutState();
                        }
                    }

                    if (isActiveWorkout) {

                        showVideoPlayerModal(updatedExercise.youtube_url, updatedExercise.name);
                    } else {

                        window.open(updatedExercise.youtube_url, '_blank');
                    }

                    modal.style.display = 'none';
                } catch (error) {
                    console.error("[YouTube Modal] Error updating exercise:", error);
                    alert("Failed to update exercise. Please try again.");
                }
            });

            modal.addEventListener('click', (e) => {

                if (e.target === modal) {
                    console.log('[YouTube Modal] Modal background clicked, closing');
                    e.preventDefault();
                    e.stopPropagation();
                    modal.style.display = 'none';
                }
            });
        }

        modal.dataset.exerciseId = exerciseId;
        document.getElementById('youtube-exercise-name').textContent = exerciseName;
        document.getElementById('youtube-url-input').value = '';

        modal.style.zIndex = '10000';

        modal.style.display = 'block';
        console.log('[YouTube Modal] Modal displayed');

        setTimeout(() => {
            const input = document.getElementById('youtube-url-input');
            if (input) {
                input.focus();
                console.log('[YouTube Modal] Input field focused');
            }
        }, 100);
    }

    function showVideoPlayerModal(youtubeUrl, exerciseName) {
        console.log(`[Video Player] Opening for exercise: ${exerciseName}, URL: ${youtubeUrl}`);

        let modal = document.getElementById('video-player-modal');

        if (!modal) {
            console.log('[Video Player] Creating new modal element');
            modal = document.createElement('div');
            modal.id = 'video-player-modal';
            modal.className = 'modal video-modal';

            modal.innerHTML = `
                <div class="modal-content video-modal-content">
                    <div class="modal-header">
                        <h3 id="video-exercise-name"></h3>
                        <span class="close-modal">&times;</span>
                    </div>
                    <div class="video-container">
                        <iframe id="youtube-iframe" width="100%" height="315" frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen></iframe>
                        <div id="video-fallback" style="display:none; text-align:center; padding:20px;">
                            <p>Unable to embed this video. YouTube's security settings may be preventing it from displaying.</p>
                            <button id="open-in-new-tab" class="btn btn-primary">Open in New Tab</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            console.log('[Video Player] Modal element added to document body');

            modal.querySelector('.close-modal').addEventListener('click', (e) => {
                console.log('[Video Player] Close button clicked');
                e.preventDefault();
                e.stopPropagation();

                const iframe = document.getElementById('youtube-iframe');
                if (iframe) {
                    iframe.src = '';
                }

                modal.style.display = 'none';
            });

            const openInNewTabBtn = modal.querySelector('#open-in-new-tab');
            if (openInNewTabBtn) {
                openInNewTabBtn.addEventListener('click', (e) => {
                    console.log('[Video Player] Open in new tab button clicked');
                    e.preventDefault();
                    e.stopPropagation();

                    const originalUrl = modal.dataset.originalUrl;
                    if (originalUrl) {
                        window.open(originalUrl, '_blank');
                    }

                    modal.style.display = 'none';
                });
            }

            modal.querySelector('.modal-content').addEventListener('click', (e) => {
                e.stopPropagation();
            });

            modal.addEventListener('click', (e) => {

                if (e.target === modal) {
                    console.log('[Video Player] Modal background clicked, closing');
                    e.preventDefault();
                    e.stopPropagation();

                    const iframe = document.getElementById('youtube-iframe');
                    if (iframe) {
                        iframe.src = '';
                    }

                    modal.style.display = 'none';
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.style.display === 'block') {
                    console.log('[Video Player] Escape key pressed, closing modal');

                    const iframe = document.getElementById('youtube-iframe');
                    if (iframe) {
                        iframe.src = '';
                    }

                    modal.style.display = 'none';
                }
            });
        }

        document.getElementById('video-exercise-name').textContent = exerciseName;

        modal.dataset.originalUrl = youtubeUrl;

        const embedUrl = convertToEmbedUrl(youtubeUrl);

        if (embedUrl === null) {
            console.log('[Video Player] Could not create embed URL, opening in new tab instead');
            window.open(youtubeUrl, '_blank');
            return; // Exit early, don't show the modal
        }

        const iframe = document.getElementById('youtube-iframe');
        const fallbackDiv = document.getElementById('video-fallback');

        if (iframe) {

            iframe.style.display = 'block';
            if (fallbackDiv) fallbackDiv.style.display = 'none';

            console.log('[Video Player] Setting iframe src to:', embedUrl);

            iframe.onload = function() {
                console.log('[Video Player] Iframe loaded successfully');
            };

            iframe.onerror = function() {
                console.error('[Video Player] Error loading iframe');
                showVideoFallback(youtubeUrl);
            };

            iframe.src = embedUrl;

            setTimeout(function() {

                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    if (!iframeDoc || iframeDoc.body.innerHTML === '') {
                        console.log('[Video Player] Iframe appears to be empty, showing fallback');
                        showVideoFallback(youtubeUrl);
                    }
                } catch (e) {


                    console.log('[Video Player] Cannot access iframe content, showing fallback');
                    showVideoFallback(youtubeUrl);
                }
            }, 2000); // Check after 2 seconds
        }

        function showVideoFallback(originalUrl) {
            if (iframe) iframe.style.display = 'none';
            if (fallbackDiv) fallbackDiv.style.display = 'block';
        }

        modal.style.zIndex = '10000';

        modal.style.display = 'block';
        console.log('[Video Player] Modal displayed');
    }

    function convertToEmbedUrl(url) {
        console.log('[Video Player] Converting URL to embed format:', url);

        let videoId = '';

        try {

            const urlObj = new URL(url);

            if (urlObj.hostname.includes('youtube.com') && urlObj.pathname === '/watch') {
                videoId = urlObj.searchParams.get('v');
                console.log('[Video Player] Extracted video ID from youtube.com/watch:', videoId);
            }

            else if (urlObj.hostname === 'youtu.be') {
                videoId = urlObj.pathname.substring(1); // Remove leading slash
                console.log('[Video Player] Extracted video ID from youtu.be:', videoId);
            }

            else if (urlObj.hostname.includes('youtube.com') && urlObj.pathname.startsWith('/shorts/')) {
                videoId = urlObj.pathname.split('/shorts/')[1];
                console.log('[Video Player] Extracted video ID from youtube shorts:', videoId);
            }

            else if (urlObj.hostname.includes('youtube.com') && urlObj.pathname.startsWith('/embed/')) {
                videoId = urlObj.pathname.split('/embed/')[1];
                console.log('[Video Player] Extracted video ID from youtube embed:', videoId);
            }

            if (!videoId) {

                const standardMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/|youtube\.com\/user\/[^\/]+\/[^\/]+\/|youtube\.com\/[^\/]+\/[^\/]+\/|youtube\.com\/verify_age\?next_url=\/watch%3Fv%3D)([^&\?\/]+)/);

                if (standardMatch && standardMatch[1]) {
                    videoId = standardMatch[1];
                    console.log('[Video Player] Extracted video ID using regex fallback:', videoId);
                }
            }
        } catch (error) {
            console.error('[Video Player] Error parsing URL:', error);

            try {
                const lastResortMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/|youtube\.com\/user\/[^\/]+\/[^\/]+\/|youtube\.com\/[^\/]+\/[^\/]+\/|youtube\.com\/verify_age\?next_url=\/watch%3Fv%3D)([^&\?\/]+)/);

                if (lastResortMatch && lastResortMatch[1]) {
                    videoId = lastResortMatch[1];
                    console.log('[Video Player] Extracted video ID using last resort regex:', videoId);
                }
            } catch (regexError) {
                console.error('[Video Player] Regex extraction also failed:', regexError);
            }
        }

        if (!videoId) {
            console.log('[Video Player] Could not extract video ID, will open in new tab');

            return null;
        }




        return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    }

    document.addEventListener('click', function(event) {

        if (event.target.closest('.exercise-options-menu') ||
            event.target.classList.contains('btn-exercise-options')) {
            return;
        }

        document.querySelectorAll('.exercise-options-menu.show').forEach(menu => {
            menu.classList.remove('show');
        });
    });


    window.openExerciseEditModal = function(index) {
        if (!exerciseEditModal) return;

        currentEditingExerciseIndex = index;
        const exercise = currentWorkout.exercises[index];
        currentEditingExerciseId = exercise.exercise_id;

        if (editExerciseNameInput) {
            editExerciseNameInput.value = exercise.name;
        }

        if (saveAsNewExerciseCheckbox) {
            saveAsNewExerciseCheckbox.checked = false;
        }

        exerciseEditModal.style.display = 'block';
    }

    function closeExerciseEditModal() {
        if (!exerciseEditModal) return;

        currentEditingExerciseIndex = -1;
        currentEditingExerciseId = null;

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

        exercise.name = newName;

        if (saveAsNewExerciseCheckbox && saveAsNewExerciseCheckbox.checked) {
            try {

                const existingExercise = availableExercises.find(ex =>
                    ex.name.toLowerCase() === newName.toLowerCase());

                if (existingExercise) {

                    const useExisting = confirm(
                        `An exercise named "${newName}" already exists. \n\n` +
                        `• Click OK to use the existing exercise (ID: ${existingExercise.exercise_id}). \n` +
                        `• Click Cancel to keep your original exercise name.`
                    );

                    if (useExisting) {

                        exercise.exercise_id = existingExercise.exercise_id;
                        console.log(`Using existing exercise ID ${existingExercise.exercise_id} for "${newName}"`);
                    } else {

                        exercise.name = originalName;
                        exercise.exercise_id = originalExerciseId;
                        console.log(`Keeping original exercise name "${originalName}" and ID ${originalExerciseId}`);
                    }
                } else {

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

                    if (response.status === 409) {
                        const errorData = await response.json();
                        console.log('Exercise name conflict:', errorData);

                        let existingId = null;
                        try {

                            const refreshResponse = await fetch('/api/workouts/exercises');
                            if (refreshResponse.ok) {
                                const refreshedExercises = await refreshResponse.json();

                                availableExercises = refreshedExercises;

                                const existingEx = refreshedExercises.find(ex =>
                                    ex.name.toLowerCase() === newName.toLowerCase());
                                if (existingEx) {
                                    existingId = existingEx.exercise_id;
                                }
                            }
                        } catch (refreshError) {
                            console.error('Error refreshing exercise list:', refreshError);
                        }

                        const useExisting = confirm(
                            `An exercise named "${newName}" already exists. \n\n` +
                            `• Click OK to use the existing exercise${existingId ? ` (ID: ${existingId})` : ''}. \n` +
                            `• Click Cancel to keep your original exercise name.`
                        );

                        if (useExisting && existingId) {

                            exercise.exercise_id = existingId;
                            console.log(`Using existing exercise ID ${existingId} for "${newName}"`);
                        } else {

                            exercise.name = originalName;
                            exercise.exercise_id = originalExerciseId;
                            console.log(`Keeping original exercise name "${originalName}" and ID ${originalExerciseId}`);
                        }
                    } else if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    } else {

                        const newExercise = await response.json();
                        console.log('New exercise created:', newExercise);

                        exercise.exercise_id = newExercise.exercise_id;

                        availableExercises.push(newExercise);

                        alert(`Exercise "${newName}" has been saved as a new exercise for future use.`);
                    }
                }
            } catch (error) {
                console.error('Error creating new exercise:', error);
                alert(`Error saving new exercise: ${error.message}`);

                exercise.name = originalName;
                exercise.exercise_id = originalExerciseId;
            }
        } else {

            exercise.exercise_id = originalExerciseId;
            console.log(`Updated exercise name to "${newName}" while preserving history for ID ${originalExerciseId}`);

            try {
                const response = await fetch(`/api/workouts/exercises/${originalExerciseId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name: newName })
                });

                if (response.ok) {
                    const updatedExercise = await response.json();
                    console.log('Exercise name updated in database:', updatedExercise);

                    const exerciseIndex = availableExercises.findIndex(ex => ex.exercise_id === originalExerciseId);
                    if (exerciseIndex !== -1) {
                        availableExercises[exerciseIndex].name = newName;
                    }

                    const successMessage = document.createElement('div');
                    successMessage.className = 'alert alert-success';
                    successMessage.style.position = 'fixed';
                    successMessage.style.top = '20px';
                    successMessage.style.left = '50%';
                    successMessage.style.transform = 'translateX(-50%)';
                    successMessage.style.padding = '10px 20px';
                    successMessage.style.backgroundColor = '#4CAF50';
                    successMessage.style.color = 'white';
                    successMessage.style.borderRadius = '5px';
                    successMessage.style.zIndex = '9999';
                    successMessage.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
                    successMessage.textContent = `Exercise name updated to "${newName}"`;

                    document.body.appendChild(successMessage);

                    setTimeout(() => {
                        successMessage.style.opacity = '0';
                        successMessage.style.transition = 'opacity 0.5s ease';
                        setTimeout(() => {
                            document.body.removeChild(successMessage);
                        }, 500);
                    }, 3000);
                } else if (response.status === 409) {

                    const errorData = await response.json();
                    console.error('Name conflict when updating exercise:', errorData);
                    alert(`Could not update exercise name in database: ${errorData.error}`);
                } else {
                    const errorData = await response.json();
                    console.error('Error updating exercise name in database:', errorData);
                    alert(`Error updating exercise name: ${errorData.error || 'Unknown error'}`);
                }
            } catch (error) {
                console.error('Network error updating exercise name:', error);
            }
        }

        renderCurrentWorkout();

        closeExerciseEditModal();
    }

    function handleFilterChange() {
        const searchTerm = exerciseSearchInput.value;
        const category = exerciseCategoryFilter.value;
        renderAvailableExercises(searchTerm, category);
    }

    function openExerciseModal() {
        console.log('[openExerciseModal] Function called');

        if (!exerciseModal) {
            console.error('[openExerciseModal] Exercise modal not found!');
            alert('Error: Exercise modal not found. Please refresh the page and try again.');
            return;
        }

        console.log('[openExerciseModal] Target list:', exerciseModal.dataset.targetList);

        exerciseModal.style.display = 'block';
        console.log('[openExerciseModal] Modal displayed');

        if (exerciseSearchInput) {
            exerciseSearchInput.value = '';
            console.log('[openExerciseModal] Search input cleared');
        }

        if (exerciseCategoryFilter) {
            exerciseCategoryFilter.value = 'all';
            console.log('[openExerciseModal] Category filter reset to "all"');
        }

        renderAvailableExercises();
        console.log('[openExerciseModal] Available exercises rendered');

        setTimeout(() => {
            if (exerciseSearchInput) {
                exerciseSearchInput.focus();
                console.log('[openExerciseModal] Search input focused');
            }
        }, 100);
    }

    function closeExerciseModal() {

        const currentCheckboxes = availableExerciseListEl.querySelectorAll('input[type="checkbox"]');

        const visibleExerciseIds = new Set();
        currentCheckboxes.forEach(checkbox => {
            const exerciseId = parseInt(checkbox.value, 10);
            visibleExerciseIds.add(exerciseId);
        });

        currentCheckboxes.forEach(checkbox => {
            const exerciseId = parseInt(checkbox.value, 10);

            if (checkbox.checked) {

                checkedExercises.add(exerciseId);

                if (!checkedExercisesOrder.includes(exerciseId)) {
                    checkedExercisesOrder.push(exerciseId);
                }
            } else {


                checkedExercises.delete(exerciseId);

                const index = checkedExercisesOrder.indexOf(exerciseId);
                if (index > -1) {
                    checkedExercisesOrder.splice(index, 1);
                }
            }
        });

        console.log(`Closing modal with ${checkedExercises.size} checked exercises`);

        exerciseModal.style.display = 'none';
    }


    function saveWorkoutState() {
        try {

            if (window.currentWorkout && (Array.isArray(window.currentWorkout) ? window.currentWorkout.length > 0 : window.currentWorkout.exercises?.length > 0)) {
                console.log('Saving workout state to localStorage');

                updateWeightUnitsFromUI();

                updateSetCountsFromUI();

                localStorage.setItem(STORAGE_KEYS.CURRENT_WORKOUT, JSON.stringify(window.currentWorkout));

                if (window.workoutStartTime) {
                    localStorage.setItem(STORAGE_KEYS.WORKOUT_START_TIME, window.workoutStartTime.toString());
                }

                if (currentPage === 'active') {
                    localStorage.setItem(STORAGE_KEYS.CURRENT_PAGE, currentPage);
                }

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

                exercises[workoutIndex].weight_unit = unitSelect.value;
            }
        });
    }

    function updateSetCountsFromUI() {
        if (currentPage !== 'active') return;

        const exerciseItems = document.querySelectorAll('.exercise-item');
        if (!exerciseItems.length) return;

        exerciseItems.forEach(item => {
            const workoutIndex = parseInt(item.dataset.workoutIndex, 10);
            if (isNaN(workoutIndex)) return;

            const exercises = Array.isArray(currentWorkout) ? currentWorkout : currentWorkout.exercises;
            if (!exercises || !exercises[workoutIndex]) return;

            const setRows = item.querySelectorAll('.set-row');
            const setCount = setRows.length;

            exercises[workoutIndex].sets = setCount;
            console.log(`Updated exercise ${workoutIndex} (${exercises[workoutIndex].name}) sets to ${setCount}`);
        });
    }

    function saveInputValues() {
        if (currentPage !== 'active') {
            console.log('Not saving input values - not on active page');
            return;
        }

        try {
            console.log('Saving input values to localStorage');
            const inputValues = {};

            if (!currentExerciseListEl) {
                console.error('Current exercise list element not found');
                return false;
            }

            const exerciseItems = currentExerciseListEl.querySelectorAll('.exercise-item');
            console.log(`Found ${exerciseItems.length} exercise items to save`);

            if (exerciseItems.length === 0) {
                console.log('No exercise items found in DOM, using workout data directly');

                const exercises = Array.isArray(currentWorkout) ? currentWorkout : currentWorkout.exercises;
                if (!exercises || exercises.length === 0) {
                    console.error('No exercises found in current workout data');
                    return false;
                }

                exercises.forEach((exerciseData, workoutIndex) => {
                    const exerciseId = exerciseData.exercise_id;
                    console.log(`Saving data for exercise ID ${exerciseId} (${exerciseData.name}) from workout data`);

                    inputValues[exerciseId] = {
                        sets: [],
                        name: exerciseData.name,
                        workoutIndex: workoutIndex
                    };

                    const existingValues = {};
                    try {

                        const exerciseItems = document.querySelectorAll('.exercise-item');
                        exerciseItems.forEach(item => {
                            const itemWorkoutIndex = parseInt(item.dataset.workoutIndex, 10);
                            if (itemWorkoutIndex === workoutIndex) {

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

                    const setCount = exerciseData.sets || 3; // Default to 3 sets if not specified
                    for (let i = 0; i < setCount; i++) {

                        inputValues[exerciseId].sets.push({
                            weight: existingValues[i] ? existingValues[i].weight : '',
                            reps: existingValues[i] ? existingValues[i].reps : '',
                            completed: existingValues[i] ? existingValues[i].completed : false
                        });
                    }
                });
            } else {

                exerciseItems.forEach((item) => {

                    const workoutIndex = parseInt(item.dataset.workoutIndex, 10);
                    console.log(`Processing exercise at index ${workoutIndex}`);

                    if (isNaN(workoutIndex)) {
                        console.error('Invalid workout index:', item.dataset.workoutIndex);
                        return;
                    }

                    const exercises = Array.isArray(currentWorkout) ? currentWorkout : currentWorkout.exercises;
                    if (!exercises || !exercises[workoutIndex]) {
                        console.error('Exercise not found at index:', workoutIndex);
                        return;
                    }

                    const exerciseData = exercises[workoutIndex];
                    const exerciseId = exerciseData.exercise_id;

                    console.log(`Saving data for exercise ID ${exerciseId} (${exerciseData.name})`);

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

                    const notesTextarea = item.querySelector('.exercise-notes-textarea');
                    if (notesTextarea) {
                        inputValues[exerciseId].notes = notesTextarea.value;
                        console.log(`Notes saved for exercise ${exerciseId}: ${notesTextarea.value.substring(0, 20)}${notesTextarea.value.length > 20 ? '...' : ''}`);
                    }
                });
            }

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

    function loadWorkoutState() {
        try {

            const savedWorkout = localStorage.getItem(STORAGE_KEYS.CURRENT_WORKOUT);
            if (savedWorkout) {
                console.log('Found saved workout in localStorage');
                window.currentWorkout = JSON.parse(savedWorkout);

                const savedStartTime = localStorage.getItem(STORAGE_KEYS.WORKOUT_START_TIME);
                if (savedStartTime) {
                    window.workoutStartTime = parseInt(savedStartTime);
                }

                const savedPage = localStorage.getItem(STORAGE_KEYS.CURRENT_PAGE);
                if (savedPage === 'active') {

                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Error loading workout state:', error);
            return false;
        }
    }

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

            if (!currentExerciseListEl) {
                console.error('Current exercise list element not found');
                return false;
            }

            const exerciseItems = currentExerciseListEl.querySelectorAll('.exercise-item');
            console.log(`Found ${exerciseItems.length} exercise items in the DOM`);

            if (exerciseItems.length === 0) {
                console.log('No exercise items found in DOM, will retry in 500ms');
                setTimeout(() => restoreInputValues(), 500);
                return false;
            }

            const exerciseMap = {};

            const exercises = Array.isArray(currentWorkout) ? currentWorkout : currentWorkout.exercises;
            if (exercises) {
                exercises.forEach((exercise, index) => {
                    if (exercise && exercise.exercise_id) {
                        exerciseMap[exercise.exercise_id] = index;
                        console.log(`Mapped exercise ID ${exercise.exercise_id} (${exercise.name}) to index ${index}`);
                    }
                });
            }

            exerciseItems.forEach((item) => {
                const workoutIndex = parseInt(item.dataset.workoutIndex, 10);
                if (isNaN(workoutIndex)) {
                    console.error('Invalid workout index:', item.dataset.workoutIndex);
                    return;
                }

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

                const setRows = item.querySelectorAll('.set-row');
                console.log(`Found ${setRows.length} set rows for exercise ${exerciseId}`);

                const savedSetCount = inputValues[exerciseId].set_count || inputValues[exerciseId].sets.length;
                if (savedSetCount !== setRows.length) {
                    console.log(`Adjusting set count for exercise ${exerciseId} from ${setRows.length} to ${savedSetCount}`);

                    const setsContainer = item.querySelector('.sets-container');
                    if (!setsContainer) {
                        console.error('Sets container not found');
                        return;
                    }

                    if (savedSetCount > setRows.length) {

                        for (let i = setRows.length; i < savedSetCount; i++) {

                            const newRow = document.createElement('div');
                            newRow.className = 'set-row';
                            newRow.dataset.setIndex = i;

                            const setNumber = document.createElement('span');
                            setNumber.className = 'set-number';
                            setNumber.textContent = i + 1;
                            newRow.appendChild(setNumber);

                            const currentUnit = exercises[workoutIndex].weight_unit || 'lbs';

                            const weightInput = document.createElement('input');
                            weightInput.type = (currentUnit === 'assisted') ? 'hidden' : 'number';
                            weightInput.className = 'weight-input';
                            weightInput.placeholder = (currentUnit === 'bodyweight') ? 'BW' : (currentUnit === 'assisted') ? '' : 'Wt';
                            weightInput.step = 'any';
                            weightInput.inputMode = 'decimal';
                            newRow.appendChild(weightInput);

                            const repsInput = document.createElement('input');
                            repsInput.type = 'text';
                            repsInput.className = 'reps-input';
                            repsInput.placeholder = 'Reps';
                            repsInput.inputMode = 'numeric';
                            repsInput.pattern = '[0-9]*';
                            newRow.appendChild(repsInput);

                            const completeToggle = document.createElement('button');
                            completeToggle.className = 'set-complete-toggle';
                            completeToggle.dataset.workoutIndex = workoutIndex;
                            completeToggle.dataset.setIndex = i;
                            completeToggle.title = 'Mark Set Complete';
                            newRow.appendChild(completeToggle);

                            setsContainer.appendChild(newRow);
                        }
                    }

                    else if (savedSetCount < setRows.length) {

                        for (let i = savedSetCount; i < setRows.length; i++) {
                            if (setRows[i]) {
                                setRows[i].remove();
                            }
                        }
                    }
                }

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

                    console.log(`Set ${setIndex + 1} restored values: weight=${weightInput?.value || ''}, reps=${repsInput?.value || ''}, completed=${completeToggle?.classList.contains('completed') || false}`);

                    if (weightInput) {
                        const event = new Event('change', { bubbles: true });
                        weightInput.dispatchEvent(event);
                    }

                    if (repsInput) {
                        const event = new Event('change', { bubbles: true });
                        repsInput.dispatchEvent(event);
                    }
                });

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

    window.switchPage = function switchPage(pageToShow) {
        console.log('switchPage called with:', pageToShow); // Log function call and argument

        if (currentPage === 'active' && pageToShow !== 'active') {
            console.log('Navigating away from active page, saving workout data');

            updateSetCountsFromUI();

            saveWorkoutState();

            if (typeof saveWorkoutData === 'function') {
                saveWorkoutData();
            } else {

                saveInputValues();
            }
        }

        console.log('[switchPage] DOM Elements:');
        console.log('- workoutLandingPage:', workoutLandingPage);
        console.log('- activeWorkoutPage:', activeWorkoutPage);
        console.log('- templateEditorPage:', templateEditorPage);

        if (!workoutLandingPage) {
            console.error('[switchPage] workoutLandingPage not found!');
        }
        if (!activeWorkoutPage) {
            console.error('[switchPage] activeWorkoutPage not found!');
        }
        if (!templateEditorPage) {
            console.error('[switchPage] templateEditorPage not found!');
        }

        currentPage = pageToShow; // <<< Ensure this modifies the top-level variable (no 'let')

        if (workoutLandingPage) workoutLandingPage.classList.remove('active');
        if (activeWorkoutPage) activeWorkoutPage.classList.remove('active');
        if (templateEditorPage) templateEditorPage.classList.remove('active');

        if (pageToShow === 'landing') {
            if (workoutLandingPage) {
                workoutLandingPage.classList.add('active');
                console.log('Applied active class to landing page');
            } else {
                console.error('[switchPage] Cannot activate landing page - element not found');
            }
        } else if (pageToShow === 'active') {
            if (activeWorkoutPage) {
                activeWorkoutPage.classList.add('active');
                console.log('Applied active class to active workout page');

                saveWorkoutState();

                setTimeout(() => {

                    if (typeof restoreWorkoutData === 'function') {
                        restoreWorkoutData();
                    } else {

                        restoreInputValues();
                    }
                }, 300);
            } else {
                console.error('[switchPage] Cannot activate active workout page - element not found');
            }
        } else if (pageToShow === 'editor') {
            if (templateEditorPage) {
                templateEditorPage.classList.add('active');
                console.log('Applied active class to template editor page');

                console.log('[switchPage] Template Editor Buttons:');
                console.log('- templateSaveBtn:', templateSaveBtn);
                console.log('- templateCancelBtn:', templateCancelBtn);
                console.log('- templateAddExerciseBtn:', templateAddExerciseBtn);

                if (!editingTemplateId) {
                    console.log('[switchPage] Resetting template editor form for new template');
                    if (templateEditorForm) templateEditorForm.reset();
                }
            } else {
                console.error('[switchPage] Cannot activate template editor page - element not found');
            }
        } else {
            console.error('[switchPage] Unknown page:', pageToShow);
        }

        if (pageToShow === 'active') {
            if (addExerciseFab) {
                addExerciseFab.style.display = 'flex'; // Use flex to properly center the + sign
            } else {
                console.error('[switchPage] Cannot show FAB - element not found');
            }
        } else {
            if (addExerciseFab) {
                addExerciseFab.style.display = 'none';
            }
        }

        console.log('[switchPage] Completed. Current page:', currentPage);
    }

    function startEmptyWorkout() {
        console.log('Starting empty workout');

        clearWorkoutState();

        window.currentWorkout = {
            name: 'New Workout',
            exercises: []
        };
        currentWorkoutNameEl.textContent = 'New Workout'; // Or prompt user for name
        window.renderCurrentWorkout();
        window.switchPage('active');
        startTimer();

        saveWorkoutState();
    }

    async function startWorkoutFromTemplate(templateId) {

        clearWorkoutState();

        const template = workoutTemplates.find(t => t.workout_id === templateId);
        if (!template) {
            console.error("Template not found:", templateId);
            return;
        }
        console.log(`Starting workout from template: ${templateId}`);

        const exerciseIds = template.exercises.map(ex => ex.exercise_id);
        let latestExerciseData = {};

        try {

            const response = await fetch('/api/workouts/exercises');
            if (response.ok) {
                const allExercises = await response.json();

                latestExerciseData = allExercises.reduce((map, ex) => {
                    map[ex.exercise_id] = ex;
                    return map;
                }, {});
            }
        } catch (error) {
            console.error('Error fetching latest exercise data:', error);
        }

        window.currentWorkout = {
            name: template.name, // Store template name
            templateId: template.workout_id, // Store the template ID to track completion
            exercises: template.exercises.map(ex => {

                const numSets = parseInt(ex.sets) || 1;

                const latestExercise = latestExerciseData[ex.exercise_id];
                const exerciseName = latestExercise ? latestExercise.name : ex.name;
                const youtubeUrl = latestExercise ? latestExercise.youtube_url : null;

                console.log(`Creating ${numSets} sets for exercise ${exerciseName} from template`);
                console.log(`Exercise ${exerciseName} (ID: ${ex.exercise_id}) YouTube URL: ${youtubeUrl}`);

                return {
                    ...ex,
                    name: exerciseName, // Use the latest name from the database
                    youtube_url: youtubeUrl, // Include the YouTube URL
                    lastLog: undefined, // Mark for fetching

                    template_sets: numSets,
                    template_reps: ex.reps || '',

                    sets_completed: Array(numSets).fill(null).map(() => ({
                        weight: '',
                        reps: '',
                        unit: ex.weight_unit || 'lbs', // Default to lbs
                        completed: false // Ensure sets are not completed by default
                    })),

                    sets: numSets
                };
            })
        };

        await applyExerciseUnitPreferences(currentWorkout.exercises);

        console.log("Current workout initialized from template:", currentWorkout); // Log the object

        const workoutName = currentWorkout.name; // Use the name from the object
        currentWorkoutNameEl.textContent = workoutName;

        window.renderCurrentWorkout(); // This function expects currentWorkout.exercises
        window.switchPage('active');
        startTimer();

        addExerciseFab.style.display = 'flex';

        saveWorkoutState();
    }

    async function applyExerciseUnitPreferences(exercises) {
        try {

            const preferencePromises = exercises.map(async (exercise) => {
                if (!exercise.exercise_id) return;

                try {

                    const baseUrl = window.location.origin;
                    const response = await fetch(`${baseUrl}/api/exercise-preferences/${exercise.exercise_id}`, {
                        headers: { 'Accept': 'application/json' }
                    });
                    if (!response.ok) return;

                    const preference = await response.json();
                    if (preference && preference.weight_unit) {

                        exercise.weight_unit = preference.weight_unit;

                        if (exercise.sets_completed && Array.isArray(exercise.sets_completed)) {
                            exercise.sets_completed.forEach(set => {
                                if (set) set.unit = preference.weight_unit;
                            });
                        }

                        console.log(`Applied saved unit preference for exercise ${exercise.exercise_id}: ${preference.weight_unit}`);
                    } else {

                        exercise.weight_unit = 'lbs';

                        if (exercise.sets_completed && Array.isArray(exercise.sets_completed)) {
                            exercise.sets_completed.forEach(set => {
                                if (set) set.unit = 'lbs';
                            });
                        }

                        console.log(`No preference found for exercise ${exercise.exercise_id}, using default: lbs`);
                    }
                } catch (error) {
                    console.error(`Error fetching preference for exercise ${exercise.exercise_id}:`, error);

                    exercise.weight_unit = 'lbs';

                    if (exercise.sets_completed && Array.isArray(exercise.sets_completed)) {
                        exercise.sets_completed.forEach(set => {
                            if (set) set.unit = 'lbs';
                        });
                    }

                    console.log(`Error fetching preference for exercise ${exercise.exercise_id}, using default: lbs`);
                }
            });

            await Promise.all(preferencePromises);

            setTimeout(() => {
                updateUnitDropdownsInDOM(exercises);
            }, 100); // Small delay to ensure DOM is updated
        } catch (error) {
            console.error('Error applying exercise unit preferences:', error);

            if (exercises && Array.isArray(exercises)) {
                exercises.forEach(exercise => {
                    if (exercise) {
                        exercise.weight_unit = 'lbs';

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

    function updateUnitDropdownsInDOM(exercises) {
        exercises.forEach((exercise, index) => {
            if (!exercise.exercise_id) return;

            if (!exercise.weight_unit) {
                exercise.weight_unit = 'lbs';
                console.log(`No weight unit found for exercise ${exercise.exercise_id}, setting default: lbs`);
            }

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


        let exercise;
        try {
            const response = await fetch(`/api/workouts/exercises/${exerciseId}`);
            if (response.ok) {
                exercise = await response.json();

                const exerciseIndex = availableExercises.findIndex(ex => ex.exercise_id === exerciseId);
                if (exerciseIndex !== -1) {
                    availableExercises[exerciseIndex] = {
                        ...availableExercises[exerciseIndex],
                        ...exercise
                    };
                }
            } else {

                exercise = availableExercises.find(ex => ex.exercise_id === exerciseId);
            }
        } catch (error) {
            console.error('Error fetching latest exercise data:', error);

            exercise = availableExercises.find(ex => ex.exercise_id === exerciseId);
        }

        if (!exercise) {
            console.error('Exercise not found in available list', exerciseId);
            alert('Error finding selected exercise.');
            return;
        }

        let defaultSets = 1;
        let defaultReps = '';

        if (targetList === 'editor') {

            if (lastUsedRepsValues[exerciseId]) {
                defaultReps = lastUsedRepsValues[exerciseId];
                console.log(`Using last used reps value for exercise ${exerciseId}: ${defaultReps}`);
            }

            else if (defaultSetsInput && defaultRepsInput) {
                defaultSets = parseInt(defaultSetsInput.value) || 1;
                defaultReps = defaultRepsInput.value || '';
                console.log(`Using template default settings: ${defaultSets} sets, reps: ${defaultReps}`);
            }
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

            ...(targetList === 'active' && {
                completedSets: Array(defaultSets).fill(false), // Default completedSets based on default sets

                template_sets: defaultSets,
                template_reps: defaultReps
            }),
            lastLog: undefined // Mark lastLog as not yet fetched
        };

        try {
            const baseUrl = window.location.origin;
            const response = await fetch(`${baseUrl}/api/exercise-preferences/${exerciseId}`, {
                headers: { 'Accept': 'application/json' }
            });
            if (response.ok) {
                const preference = await response.json();

                if (preference && preference.weight_unit) {

                    newExerciseData.weight_unit = preference.weight_unit;
                    console.log(`Applied saved unit preference for new exercise: ${newExerciseData.weight_unit}`);
                } else {

                    newExerciseData.weight_unit = 'lbs';
                    console.log('No saved weight unit preference found, using default: lbs');
                }

                if (preference && preference.default_reps && targetList === 'editor') {

                    newExerciseData.reps = preference.default_reps;
                    console.log(`Applied saved default reps for new exercise: ${newExerciseData.reps}`);
                }
            } else {

                newExerciseData.weight_unit = 'lbs';
                console.log('Error fetching preference, using default: lbs');
            }
        } catch (error) {
            console.error('Error fetching exercise preferences:', error);

            newExerciseData.weight_unit = 'lbs';
            console.log('Exception fetching preference, using default: lbs');
        }

        if (targetList === 'active') {

            if (!currentWorkout) {
                currentWorkout = { name: 'New Workout', exercises: [] };
            } else if (!currentWorkout.exercises) {

                currentWorkout.exercises = [];
            }

            currentWorkout.exercises.push(newExerciseData);
            renderCurrentWorkout(); // Update the active workout list UI
        } else { // targetList === 'editor'
            currentTemplateExercises.push(newExerciseData);
            renderTemplateExerciseList(); // Update the template editor list UI
        }
    }

    window.handleDeleteExercise = function(event) {
        console.log('[handleDeleteExercise] Function called');

        const button = event.target; // Get the button that was clicked
        const exerciseItem = button.closest('.exercise-item'); // Find the parent exercise item

        if (!exerciseItem) {
            console.error('Could not find parent exercise item for delete button.');
            return;
        }

        console.log('[handleDeleteExercise] Exercise item found:', exerciseItem);

        const indexToRemove = parseInt(exerciseItem.dataset.workoutIndex, 10); // Get index from parent item
        console.log('[handleDeleteExercise] Index to remove:', indexToRemove);

        let exercisesArray;
        let listElement;
        let isTemplateEditor = false;

        if (document.getElementById('template-editor-page').classList.contains('active')) {
            console.log('[handleDeleteExercise] Context: Template Editor');
            exercisesArray = currentTemplateExercises;
            listElement = templateExerciseListEl;
            isTemplateEditor = true;
        } else if (document.getElementById('active-workout-page').classList.contains('active')) {
            console.log('[handleDeleteExercise] Context: Active Workout');
            exercisesArray = currentWorkout.exercises;
            listElement = currentExerciseListEl;
        } else {
            console.error("[handleDeleteExercise] Could not determine context - no active page found");
            return;
        }

        console.log('[handleDeleteExercise] Exercises array:', exercisesArray);

        if (isNaN(indexToRemove) || indexToRemove < 0 || !exercisesArray || indexToRemove >= exercisesArray.length) {
            console.error(`Invalid index for exercise deletion. Index: ${indexToRemove}, Array length: ${exercisesArray ? exercisesArray.length : 'undefined'}`);
            return; // Stop execution if index is invalid
        }

        const exerciseNameToConfirm = exercisesArray[indexToRemove]?.name || 'this exercise';
        if (!confirm(`Are you sure you want to remove ${exerciseNameToConfirm} from the workout?`)) {
            return; // Stop if user cancels
        }


        const removedExercise = exercisesArray.splice(indexToRemove, 1)[0];
        console.log('[handleDeleteExercise] Exercise removed:', removedExercise);


        if (isTemplateEditor) {
            console.log('[handleDeleteExercise] Re-rendering template exercise list');
            renderTemplateExerciseList();
        } else {
            console.log('[handleDeleteExercise] Re-rendering current workout');
            renderCurrentWorkout();
        }

    };

    function handleDeleteTemplateExercise(deleteButton) { // Changed parameter to expect the button element
        console.log('[handleDeleteTemplateExercise] Function called with button:', deleteButton);

        let indexToRemove = parseInt(deleteButton.dataset.index, 10);

        if (isNaN(indexToRemove)) {
            const exerciseItem = deleteButton.closest('.exercise-item');
            if (exerciseItem) {
                indexToRemove = parseInt(exerciseItem.dataset.index, 10);
                console.log('[handleDeleteTemplateExercise] Got index from parent exercise item:', indexToRemove);
            }
        }

        if (isNaN(indexToRemove)) {
            indexToRemove = parseInt(deleteButton.dataset.workoutIndex, 10);
            console.log('[handleDeleteTemplateExercise] Got index from workoutIndex attribute:', indexToRemove);
        }

        console.log('[handleDeleteTemplateExercise] Index to remove:', indexToRemove);
        console.log('[handleDeleteTemplateExercise] Current template exercises:', currentTemplateExercises);

        if (!isNaN(indexToRemove) && indexToRemove >= 0 && indexToRemove < currentTemplateExercises.length) {

            const exerciseNameToConfirm = currentTemplateExercises[indexToRemove]?.name || 'this exercise';

            if (!confirm(`Are you sure you want to remove ${exerciseNameToConfirm} from the template?`)) {
                return; // Stop if user cancels
            }

            const removedExercise = currentTemplateExercises.splice(indexToRemove, 1)[0]; // Modifies the array
            console.log('[handleDeleteTemplateExercise] Exercise removed:', removedExercise);

            currentTemplateExercises.forEach((ex, idx) => {
                ex.order_position = idx;
            });

            console.log('[handleDeleteTemplateExercise] Re-rendering template exercise list');
            renderTemplateExerciseList();


        } else {
            console.error(`Invalid index for template exercise deletion: ${indexToRemove}`);
        }
    }

    window.handleSetToggle = function(event) {
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

        let exerciseIndex = parseInt(toggleButton.dataset.workoutIndex, 10);
        if (isNaN(exerciseIndex)) {
            exerciseIndex = parseInt(exerciseItem.dataset.workoutIndex, 10);
        }

        let setIndex = parseInt(toggleButton.dataset.setIndex, 10);
        if (isNaN(setIndex)) {
            setIndex = parseInt(setRow.dataset.setIndex, 10);
        }

        console.log(`[handleSetToggle] exerciseIndex: ${exerciseIndex}, setIndex: ${setIndex}`); // <<< Log 5: Log indices

        const exercises = Array.isArray(currentWorkout) ? currentWorkout : currentWorkout.exercises;
        if (isNaN(exerciseIndex) || isNaN(setIndex) || !exercises || !exercises[exerciseIndex]) {
            console.error('Invalid index or exercise data for set toggle:', { exerciseIndex, setIndex, exerciseExists: !!(exercises && exercises[exerciseIndex]) });
            return;
        }


        toggleButton.classList.toggle('completed');
        console.log(`[handleSetToggle] Toggled 'completed' class. Button classes: ${toggleButton.className}`); // <<< Log 6: Log class toggle

        const isCompleted = toggleButton.classList.contains('completed');
        console.log(`[handleSetToggle] isCompleted state: ${isCompleted}`); // <<< Log 7: Log determined state




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

        const weightInput = setRow.querySelector('.weight-input');
        const repsInput = setRow.querySelector('.reps-input');

        if (weightInput && repsInput) {
            weightInput.disabled = isCompleted;
            repsInput.disabled = isCompleted;
            console.log(`[handleSetToggle] Inputs disabled state set to: ${isCompleted}`); // <<< Log 10: Log disable state

            if (isCompleted) {
                weightInput.classList.add('completed');
                repsInput.classList.add('completed');
            } else {
                weightInput.classList.remove('completed');
                repsInput.classList.remove('completed');
            }
        }

        if (isCompleted) {
            toggleButton.innerHTML = '&#10003;'; // Checkmark HTML entity
            console.log("[handleSetToggle] Set innerHTML to checkmark."); // <<< Log 11a: Log checkmark add
        } else {
            toggleButton.innerHTML = ''; // Clear checkmark
            console.log("[handleSetToggle] Cleared innerHTML."); // <<< Log 11b: Log checkmark clear
        }

        saveWorkoutState();

        saveSetCompletionDirectly(toggleButton);

        saveInputValues();
    }

    window.handleCompleteWorkout = async function(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        console.log('Completing workout...');

        console.log('Saving input values before completing workout');

        if (typeof saveWorkoutData === 'function') {
            saveWorkoutData();
        } else {

            saveInputValues();
        }

        stopTimer(); // Stop timer first

        const loggedExercises = [];
        const exerciseItems = currentExerciseListEl.querySelectorAll('.exercise-item');

        const exercisesArray = Array.isArray(currentWorkout) ? currentWorkout : currentWorkout.exercises;
        console.log(`Completing workout with ${exercisesArray.length} exercises`);

        exerciseItems.forEach((item, exerciseIndex) => {

            const baseExerciseData = exercisesArray[exerciseIndex];
            if (!baseExerciseData) {
                console.error(`No exercise data found at index ${exerciseIndex}`);
                return; // Skip this iteration if no data found
            }

            const setRows = item.querySelectorAll('.set-row');
            let repsCompletedArray = [];
            let weightUsedArray = [];
            let setsCompletedCount = 0;

            const unitSelectHeader = item.querySelector('.exercise-unit-select');
            const weightUnit = unitSelectHeader ? unitSelectHeader.value : 'lbs'; // Default to lbs if not found
            console.log(`Using weight unit for exercise ${baseExerciseData.name}: ${weightUnit}${!unitSelectHeader ? ' (default)' : ''}`);

            setRows.forEach((setRow, setIndex) => {
                const repsInput = setRow.querySelector('.reps-input').value.trim() || '0'; // Default to '0' if empty
                const weightInput = setRow.querySelector('.weight-input').value.trim() || '0'; // Default to '0' if empty


                const isCompleted = baseExerciseData.completedSets &&
                                   Array.isArray(baseExerciseData.completedSets) &&
                                   baseExerciseData.completedSets[setIndex];

                repsCompletedArray.push(repsInput);
                weightUsedArray.push(weightInput);

                if (isCompleted) setsCompletedCount++;
            });

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
            exercises: loggedExercises,
            templateId: currentWorkout.templateId || null // Include the template ID if this workout was started from a template
        };

        console.log('Sending workout log data:', workoutData);

        const completeWorkoutBtn = document.getElementById('complete-workout-btn');
        if (completeWorkoutBtn) {
            completeWorkoutBtn.disabled = true;
            completeWorkoutBtn.textContent = 'Saving...';
        } else {
            console.error('Complete workout button not found in the DOM');
        }

        try {
            console.log('Sending workout data to server:', JSON.stringify(workoutData));
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

            const completeBtn = document.getElementById('complete-workout-btn');
            if (completeBtn) {
                completeBtn.textContent = '✓ Complete';
                completeBtn.classList.add('success');
            }

            if (typeof ConfettiCelebration !== 'undefined') {
                ConfettiCelebration.start();

                setTimeout(() => {
                    ConfettiCelebration.stop();
                }, 3000);
            } else if (typeof confetti !== 'undefined') {

                confetti.start();

                setTimeout(() => {
                    confetti.stop();
                }, 3000);
            }

            console.log('Confetti animation triggered');

            setTimeout(() => {

                currentWorkout = [];
                workoutStartTime = null;

                clearWorkoutState();

                switchPage('landing');

                fetchTemplates();
            }, 1500); // Longer delay to enjoy the confetti

        } catch (error) {
            console.error('Error saving workout:', error);
            alert(`Failed to save workout: ${error.message}`);

        } finally {

             const completeBtn = document.getElementById('complete-workout-btn');
             if (completeBtn) {
                 completeBtn.disabled = false;
                 completeBtn.textContent = 'Complete Workout';
             }
        }
    }

    function startTimer() {
        if (workoutTimerInterval) clearInterval(workoutTimerInterval); // Clear existing timer safely
        window.workoutStartTime = Date.now();
        workoutTimerEl.textContent = '00:00:00';
        workoutTimerInterval = setInterval(window.updateTimer, 1000); // Update every second
        console.log('Timer started');
    }

    function stopTimer() {
        clearInterval(workoutTimerInterval);
        workoutTimerInterval = null; // Clear the interval ID
        console.log('Timer stopped');
    }

    window.updateTimer = function updateTimer() {
        if (!window.workoutStartTime) return; // Don't run if timer shouldn't be active
        const elapsedMs = Date.now() - window.workoutStartTime;
        workoutTimerEl.textContent = formatTime(elapsedMs);
    }

    function formatTime(milliseconds) {
        const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000)); // Ensure non-negative
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function formatDuration(milliseconds) {

        if (milliseconds <= 0) return null;
        const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
        if (totalSeconds === 0) return null; // Don't log zero duration

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        let durationString = 'PT';
        if (hours > 0) durationString += `${hours}H`;
        if (minutes > 0) durationString += `${minutes}M`;

        if (seconds > 0 || (hours === 0 && minutes === 0)) durationString += `${seconds}S`;

        return durationString;
    }


    let lastUsedAuthor = '';
    let lastUsedEdition = '';

    /**
     * Load saved author and edition values from localStorage
     * This function can be called multiple times to refresh the values
     */
    function loadSavedAuthorEditionValues() {
        try {
            const savedAuthor = localStorage.getItem(STORAGE_KEYS.LAST_USED_AUTHOR);
            if (savedAuthor) {
                lastUsedAuthor = savedAuthor;
                console.log('[Template Editor] Loaded saved author from localStorage:', lastUsedAuthor);
            }

            const savedEdition = localStorage.getItem(STORAGE_KEYS.LAST_USED_EDITION);
            if (savedEdition) {
                lastUsedEdition = savedEdition;
                console.log('[Template Editor] Loaded saved edition from localStorage:', lastUsedEdition);
            }

            return { lastUsedAuthor, lastUsedEdition };
        } catch (error) {
            console.error('[Template Editor] Error loading saved author/edition values:', error);
            return { lastUsedAuthor: '', lastUsedEdition: '' };
        }
    }

    loadSavedAuthorEditionValues();

    function showTemplateEditor(templateToEdit = null) {
        console.log('[Template Editor] Opening template editor', templateToEdit ? 'for editing' : 'for new template');

        currentTemplateExercises = [];

        loadSavedAuthorEditionValues();
        console.log('[Template Editor] Current author/edition values:', { lastUsedAuthor, lastUsedEdition });

        if (!templateEditorTitle || !templateNameInput || !templateDescriptionInput || !templateEditorForm) {
            alert('Error: Could not initialize template editor. Please refresh the page and try again.');
            return;
        }

        const templateAuthorInput = document.getElementById('template-author');
        const templateEditionInput = document.getElementById('template-edition');
        const reuseToggle = document.getElementById('reuse-author-edition-toggle');

        if (templateToEdit) {

            editingTemplateId = templateToEdit.workout_id;
            templateEditorTitle.textContent = 'Edit Workout Template';

            let baseName = templateToEdit.name;
            let author = '';
            let edition = '';

            const nameParts = templateToEdit.name.split(' - ');
            if (nameParts.length > 1) {
                baseName = nameParts[0];

                if (nameParts.length >= 2) {
                    author = nameParts[1].trim(); // Trim to handle extra spaces
                }

                if (nameParts.length >= 3) {
                    edition = nameParts[2].trim(); // Trim to handle extra spaces
                }
            }

            templateNameInput.value = baseName;
            if (templateAuthorInput) templateAuthorInput.value = author;
            if (templateEditionInput) templateEditionInput.value = edition;
            templateDescriptionInput.value = templateToEdit.description || '';

            if (author) lastUsedAuthor = author;
            if (edition) lastUsedEdition = edition;

            currentTemplateExercises = templateToEdit.exercises.map(ex => ({ ...ex }));
        } else {

            editingTemplateId = null;
            templateEditorTitle.textContent = 'Create New Workout Template';
            templateEditorForm.reset(); // Clear form fields


            if (defaultSetsInput) defaultSetsInput.value = '3'; // Default to 3 sets
            if (defaultRepsInput) defaultRepsInput.value = '8-12'; // Default to 8-12 reps

            if (reuseToggle) {
                console.log('[Template Editor] Setting reuse toggle to checked by default');
                reuseToggle.checked = true;
            }

            if (templateAuthorInput && templateEditionInput) {
                console.log('[Template Editor] Applying last used author and edition values:', { lastUsedAuthor, lastUsedEdition });
                templateAuthorInput.value = lastUsedAuthor || '';
                templateEditionInput.value = lastUsedEdition || '';
            }
        }

        if (reuseToggle) {
            console.log('[Template Editor] Setting up reuse toggle event listener');

            const handleReuseToggleChange = function(event) {
                console.log('[Template Editor] Reuse toggle changed:', event.target.checked);
                const templateAuthorInput = document.getElementById('template-author');
                const templateEditionInput = document.getElementById('template-edition');

                if (event.target.checked) {

                    console.log('[Template Editor] Toggle ON - applying stored values:', { lastUsedAuthor, lastUsedEdition });
                    if (templateAuthorInput) templateAuthorInput.value = lastUsedAuthor || '';
                    if (templateEditionInput) templateEditionInput.value = lastUsedEdition || '';
                } else {

                    console.log('[Template Editor] Toggle OFF - clearing fields');
                    if (templateAuthorInput) templateAuthorInput.value = '';
                    if (templateEditionInput) templateEditionInput.value = '';
                }
            };

            window.handleReuseToggleChange = handleReuseToggleChange;

            reuseToggle.removeEventListener('change', handleReuseToggleChange);

            reuseToggle.addEventListener('change', handleReuseToggleChange);


            console.log('[Template Editor] Triggering initial change event on reuse toggle');

            const changeEvent = new Event('change');
            reuseToggle.dispatchEvent(changeEvent);
        }

        renderTemplateExerciseList();

        switchPage('editor');

        if (templateAddExerciseBtn && !templateAddExerciseBtn._hasClickListener) {
            templateAddExerciseBtn.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                if (exerciseModal) {
                    exerciseModal.dataset.targetList = 'editor';
                    openExerciseModal();
                }
            });
            templateAddExerciseBtn._hasClickListener = true;
        }

        if (templateCancelBtn && !templateCancelBtn._hasClickListener) {
            templateCancelBtn.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                switchPage('landing');
            });
            templateCancelBtn._hasClickListener = true;
        }
    }

    function renderTemplateExerciseList() {
        console.log('[Template Editor] Rendering template exercise list');
        const templateExerciseListEl = document.getElementById('template-exercise-list');
        templateExerciseListEl.innerHTML = '';

        if (!currentTemplateExercises || currentTemplateExercises.length === 0) {
            templateExerciseListEl.innerHTML = '<p>Add exercises using the button below.</p>';
            return;
        }

        console.log('[Template Editor] Current template exercises:', currentTemplateExercises);

        const attachViewExerciseListeners = () => {
            console.log('[Template Editor] Attaching event listeners to View Exercise buttons');
            const viewButtons = templateExerciseListEl.querySelectorAll('.btn-view-exercise');
            viewButtons.forEach(button => {
                console.log('[Template Editor] Found View Exercise button:', button);

                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);

                newButton.addEventListener('click', (event) => {
                    console.log('[Template Editor] View Exercise button clicked directly');
                    event.preventDefault();
                    event.stopPropagation();
                    handleViewExercise(event);
                });
            });
        };

        function handleRepsInputChange(event) {
            const repsInput = event.target;
            const exerciseItem = repsInput.closest('.exercise-item');
            if (!exerciseItem) return;

            const exerciseIndex = parseInt(exerciseItem.dataset.index, 10);
            if (isNaN(exerciseIndex) || exerciseIndex < 0 || exerciseIndex >= currentTemplateExercises.length) return;

            const exercise = currentTemplateExercises[exerciseIndex];
            if (!exercise || !exercise.exercise_id) return;

            const newRepsValue = repsInput.value || '';
            const oldRepsValue = exercise.reps || '';

            exercise.reps = newRepsValue;

            lastUsedRepsValues[exercise.exercise_id] = newRepsValue;
            console.log(`Saved reps value for exercise ${exercise.exercise_id}: ${newRepsValue} (for future templates)`);

            try {
                localStorage.setItem(STORAGE_KEYS.LAST_USED_REPS, JSON.stringify(lastUsedRepsValues));
                console.log('Saved rep values to localStorage');
            } catch (error) {
                console.error('Error saving rep values to localStorage:', error);
            }

            if (newRepsValue !== oldRepsValue) {

                const unitSelect = exerciseItem.querySelector('.exercise-unit-select');
                const weightUnit = unitSelect ? unitSelect.value : 'lbs';
                const weightIncrement = 5; // Default value

                saveExerciseUnitPreference(
                    exercise.exercise_id,
                    weightUnit,
                    weightIncrement,
                    newRepsValue
                );
            }
        }


        const renderPromises = currentTemplateExercises.map(async (exercise, index) => {
            const exerciseItem = document.createElement('div');
            exerciseItem.className = 'exercise-item';
            exerciseItem.draggable = true; // Make the item draggable
            exerciseItem.dataset.index = index; // Store the current index

            if (exercise.exercise_id) {
                exerciseItem.dataset.exerciseId = exercise.exercise_id;
            }

            exerciseItem.dataset.exerciseName = exercise.name;

            try {
                await renderSingleExerciseItem(exerciseItem, exercise, index, true); // true = isTemplate
                return exerciseItem; // Return the rendered element
            } catch (error) {
                console.error(`Error rendering template exercise item for ${exercise.name}:`, error);

                const errorItem = document.createElement('div');
                errorItem.className = 'exercise-item error';
                errorItem.textContent = `Error loading ${exercise.name}`;
                return errorItem;
            }
        });

        Promise.all(renderPromises).then(exerciseItems => {

            exerciseItems.forEach(item => {
                templateExerciseListEl.appendChild(item);

                const repsInput = item.querySelector('.exercise-reps-input');
                if (repsInput) {
                    repsInput.addEventListener('change', handleRepsInputChange);
                }
            });

            templateExerciseListEl.addEventListener('change', (event) => {
                if (event.target.classList.contains('exercise-reps-input')) {
                    handleRepsInputChange(event);
                }
            });

            console.log('[Template Editor] Adding event listeners to View Exercise buttons');
            const viewButtons = templateExerciseListEl.querySelectorAll('.btn-view-exercise');
            viewButtons.forEach(button => {
                console.log('[Template Editor] Found View Exercise button:', button);

                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);

                newButton.addEventListener('click', (event) => {
                    console.log('[Template Editor] View Exercise button clicked directly');
                    event.preventDefault();
                    event.stopPropagation();
                    handleViewExercise(event);
                });
            });

            templateExerciseListEl.addEventListener('click', (event) => {
                if (event.target.classList.contains('btn-view-exercise')) {
                    console.log('[Template Editor] View Exercise button clicked via delegation');
                    event.preventDefault();
                    event.stopPropagation();
                    handleViewExercise(event);
                }
            });
        }).catch(error => {
            console.error("Error rendering one or more template exercise items:", error);
            templateExerciseListEl.innerHTML = '<p style="color: red;">Error displaying template exercises. Please try refreshing.</p>';
        });
    }

    function makeTemplateExerciseListSortable() {
        console.log('[Template Editor] Setting up drag and drop functionality');
        const templateExerciseListEl = document.getElementById('template-exercise-list');

        if (!templateExerciseListEl) {
            console.error('[Template Editor] Cannot set up drag and drop: template-exercise-list element not found');
            return;
        }

        templateExerciseListEl.classList.add('template-editor-list');

        const newList = templateExerciseListEl.cloneNode(false);
        while (templateExerciseListEl.firstChild) {
            newList.appendChild(templateExerciseListEl.firstChild);
        }
        templateExerciseListEl.parentNode.replaceChild(newList, templateExerciseListEl);

        newList.addEventListener('dragstart', function(event) {
            console.log('[Template Editor] Drag start event detected');

            if (event.target.classList.contains('drag-handle') || event.target.closest('.exercise-item')) {
                handleDragStart(event);
            }
        });

        newList.addEventListener('dragover', function(event) {

            event.preventDefault();

            const targetItem = event.target.closest('.exercise-item');
            if (targetItem) {
                handleDragOver(event);
            }
        });

        newList.addEventListener('drop', function(event) {
            console.log('[Template Editor] Drop event detected');

            if (event.target.closest('.exercise-item')) {
                handleDrop(event);
            }
        });

        newList.addEventListener('dragend', function(event) {
            console.log('[Template Editor] Drag end event detected');

            handleDragEnd(event);
        });

        newList.addEventListener('dragenter', function(event) {

            newList.classList.add('dragging-in-progress');
        });

        newList.addEventListener('dragleave', function(event) {

            if (event.target === newList) {
                newList.classList.remove('dragging-in-progress');
            }
        });

        console.log('[Template Editor] Drag and drop functionality set up successfully');
    }

    let draggedItem = null;
    let draggedItemIndex = -1;
    let dropIndicator = null;

    function handleDragStart(e) {
        console.log('[Drag Start] Event target:', e.target);

        if (e.target.classList.contains('drag-handle')) {

            console.log('[Drag Start] Drag started from drag handle');
            draggedItem = e.target.closest('.exercise-item');
        } else if (e.target.closest('.exercise-item')) {

            console.log('[Drag Start] Drag started from exercise item');
            draggedItem = e.target.closest('.exercise-item');
        } else {

            console.log('[Drag Start] Invalid drag source, canceling');
            e.preventDefault();
            return false;
        }

        if (!draggedItem) {
            console.error('[Drag Start] Could not find parent exercise item');
            e.preventDefault();
            return false;
        }

        draggedItemIndex = parseInt(draggedItem.dataset.index);

        e.dataTransfer.setData('text/plain', draggedItemIndex);


        e.dataTransfer.setDragImage(draggedItem, 20, 20);

        setTimeout(() => {
            draggedItem.classList.add('dragging');
        }, 0);

        console.log(`[Drag Start] Exercise at index ${draggedItemIndex}`);

        return true;
    }

    function handleDragEnd(e) {

        if (draggedItem) {
            draggedItem.classList.remove('dragging');
        }

        document.querySelectorAll('.exercise-item').forEach(item => {
            item.classList.remove('drop-before', 'drop-after');
        });

        draggedItem = null;
        draggedItemIndex = -1;

        console.log('[Drag End] Drag operation completed');
    }

    function handleDragOver(e) {

        e.preventDefault();

        const targetItem = e.target.closest('.exercise-item');
        if (!targetItem || !draggedItem || targetItem === draggedItem) {
            return;
        }

        const rect = targetItem.getBoundingClientRect();
        const mouseY = e.clientY;
        const threshold = rect.top + (rect.height * 0.5);
        const dropPosition = mouseY < threshold ? 'before' : 'after';

        document.querySelectorAll('.exercise-item').forEach(item => {
            item.classList.remove('drop-before', 'drop-after');
        });

        targetItem.classList.add(`drop-${dropPosition}`);

        targetItem.dataset.dropPosition = dropPosition;

        console.log(`[Drag Over] Target: ${targetItem.dataset.index}, Position: ${dropPosition}`);
    }

    function handleDrop(e) {

        e.preventDefault();

        const targetItem = e.target.closest('.exercise-item');
        if (!targetItem || !draggedItem || targetItem === draggedItem) {
            return;
        }

        const fromIndex = draggedItemIndex;
        const toIndex = parseInt(targetItem.dataset.index);

        const dropPosition = targetItem.dataset.dropPosition || 'after';

        let insertIndex = toIndex;
        if (dropPosition === 'after') {
            insertIndex = toIndex + 1;
        }

        if (fromIndex < insertIndex) {
            insertIndex--;
        }

        console.log(`[Drop] Moving exercise from index ${fromIndex} to ${insertIndex} (${dropPosition} item at index ${toIndex})`);

        targetItem.classList.remove('drop-before', 'drop-after');

        const [movedExercise] = currentTemplateExercises.splice(fromIndex, 1);
        currentTemplateExercises.splice(insertIndex, 0, movedExercise);

        currentTemplateExercises.forEach((exercise, index) => {
            exercise.order_position = index;
        });

        renderTemplateExerciseList();
    }


    window.handleSaveTemplate = async function handleSaveTemplate(event) {

        if (event) {
            event.preventDefault?.(); // Use optional chaining to prevent errors
            event.stopPropagation?.(); // Use optional chaining to prevent errors
        }

        const templateNameInputEl = document.getElementById('template-name');
        if (!templateNameInputEl) {
            alert('Error: Could not find template name input. Please refresh the page and try again.');
            return;
        }

        const templateAuthorInputEl = document.getElementById('template-author');
        if (!templateAuthorInputEl) {
            alert('Error: Could not find template author input. Please refresh the page and try again.');
            return;
        }

        const templateEditionInputEl = document.getElementById('template-edition');
        if (!templateEditionInputEl) {
            alert('Error: Could not find template edition input. Please refresh the page and try again.');
            return;
        }

        const templateDescriptionInputEl = document.getElementById('template-description');
        if (!templateDescriptionInputEl) {
            alert('Error: Could not find template description input. Please refresh the page and try again.');
            return;
        }

        const templateSaveBtnEl = document.getElementById('template-save-btn');

        const baseName = templateNameInputEl.value.trim();
        const author = templateAuthorInputEl.value.trim();
        const edition = templateEditionInputEl.value.trim();
        const templateDescription = templateDescriptionInputEl.value.trim();

        let templateName = baseName;
        if (author) {
            templateName += ` -     ${author}`;  // Added even more space after the dash
        }
        if (edition) {
            templateName += ` -     ${edition}`;  // Added even more space after the dash
        }

        if (!baseName) {
            alert('Template name cannot be empty.');
            templateNameInputEl.focus();
            return;
        }

        if (templateName.length > 100) {
            alert('The combined template name (with author and edition) is too long. Please use shorter values.');
            templateNameInputEl.focus();
            return;
        }

        const exerciseItems = document.querySelectorAll('#template-exercise-list .exercise-item');

        exerciseItems.forEach((item, index) => {
            if (index < currentTemplateExercises.length) {

                const setsInput = item.querySelector('.exercise-sets-input');
                if (setsInput) {
                    currentTemplateExercises[index].sets = parseInt(setsInput.value) || 1;
                }

                const repsInput = item.querySelector('.exercise-reps-input');
                if (repsInput) {
                    const newRepsValue = repsInput.value || '';
                    const oldRepsValue = currentTemplateExercises[index].reps || '';

                    currentTemplateExercises[index].reps = newRepsValue;

                    if (currentTemplateExercises[index].exercise_id) {

                        lastUsedRepsValues[currentTemplateExercises[index].exercise_id] = newRepsValue;
                        console.log(`Saved reps value for exercise ${currentTemplateExercises[index].exercise_id}: ${newRepsValue} (for future templates)`);

                        try {
                            localStorage.setItem(STORAGE_KEYS.LAST_USED_REPS, JSON.stringify(lastUsedRepsValues));
                            console.log('Saved rep values to localStorage');
                        } catch (error) {
                            console.error('Error saving rep values to localStorage:', error);
                        }

                        if (newRepsValue !== oldRepsValue) {

                            const unitSelect = item.querySelector('.exercise-unit-select');
                            const weightUnit = unitSelect ? unitSelect.value : 'lbs';
                            const weightIncrement = 5; // Default value

                            saveExerciseUnitPreference(
                                currentTemplateExercises[index].exercise_id,
                                weightUnit,
                                weightIncrement,
                                newRepsValue
                            );
                        }
                    }
                }

                const notesTextarea = item.querySelector('.exercise-notes-textarea');
                if (notesTextarea) {
                    currentTemplateExercises[index].notes = notesTextarea.value;
                }

                const unitSelect = item.querySelector('.exercise-unit-select');
                if (unitSelect) {
                    currentTemplateExercises[index].weight_unit = unitSelect.value;
                }
            }
        });

        const exercisesToSave = currentTemplateExercises.map((exercise, index) => {
            const simplifiedExercise = {
                exercise_id: exercise.exercise_id,
                order_position: index,
                sets: parseInt(exercise.sets) || 1, // Ensure sets is a number, default to 1
                reps: exercise.reps || '', // Default empty string if not set
                weight: exercise.weight,
                weight_unit: exercise.weight_unit || 'lbs', // Default to lbs if not set
                weight_increment: parseFloat(exercise.weight_increment) || 5, // Default to 5 if not set
                notes: exercise.notes || '' // Default empty string if not set
            };
            return simplifiedExercise;
        });

        const templateData = {
            name: templateName,
            description: templateDescription || null,
            exercises: exercisesToSave
        };

        const apiUrl = editingTemplateId
            ? `/api/workouts/templates/${editingTemplateId}`
            : '/api/workouts/templates';
        const apiMethod = editingTemplateId ? 'PUT' : 'POST';

        if (templateSaveBtnEl) {
            templateSaveBtnEl.disabled = true;
            templateSaveBtnEl.textContent = 'Saving...';
        }

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

            if (author) {
                lastUsedAuthor = author;
                localStorage.setItem(STORAGE_KEYS.LAST_USED_AUTHOR, author);
                console.log('Saved author to localStorage:', author);
            }
            if (edition) {
                lastUsedEdition = edition;
                localStorage.setItem(STORAGE_KEYS.LAST_USED_EDITION, edition);
                console.log('Saved edition to localStorage:', edition);
            }

            editingTemplateId = null;
            currentTemplateExercises = [];

            switchPage('landing');
            fetchTemplates(); // Refresh template list

        } catch (error) {
            alert(`Failed to save template: ${error.message}`);
        } finally {

            if (templateSaveBtnEl) {
                templateSaveBtnEl.disabled = false;
                templateSaveBtnEl.textContent = 'Save Template';
            }
        }
    }

    function handleToggleDefineExercise() {
        const isHidden = defineNewExerciseSection.style.display === 'none';
        defineNewExerciseSection.style.display = isHidden ? 'block' : 'none';
        toggleDefineExerciseBtn.textContent = isHidden ? 'Cancel Define New' : 'Define New Exercise';
        if (isHidden) {

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

            availableExercises.unshift(result); // Add the new exercise object at the beginning of the array

            const newExerciseId = result.exercise_id;
            checkedExercises.add(newExerciseId);
            if (!checkedExercisesOrder.includes(newExerciseId)) {
                checkedExercisesOrder.push(newExerciseId);
            }

            renderAvailableExercises();

            handleToggleDefineExercise(); // Toggle back to hide

        } catch (error) {
            alert(`Failed to save exercise: ${error.message}`);
        } finally {
            saveNewExerciseBtn.disabled = false;
            saveNewExerciseBtn.textContent = 'Save New Exercise';
        }

    }

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


    function handleAddSet(event) {
        console.log("[DEBUG] handleAddSet called", event.target);
        const addButton = event.target; // The button that was clicked
        const exerciseItem = addButton.closest('.exercise-item'); // Find the parent exercise item

        if (!exerciseItem) {
            console.error("handleAddSet: Could not find parent .exercise-item for the Add Set button.");
            return;
        }

        const isTemplateEditor = exerciseItem.dataset.isTemplate === 'true' ||
                                templateEditorPage?.classList.contains('active');

        console.log("[DEBUG] Is template editor mode:", isTemplateEditor);

        let exerciseIndex;
        if (isTemplateEditor) {
            exerciseIndex = parseInt(addButton.dataset.index, 10);
            if (isNaN(exerciseIndex)) {
                exerciseIndex = parseInt(exerciseItem.dataset.index, 10);
            }
        } else {
            exerciseIndex = parseInt(addButton.dataset.workoutIndex, 10);
            if (isNaN(exerciseIndex)) {
                exerciseIndex = parseInt(exerciseItem.dataset.workoutIndex, 10);
            }
        }

        console.log("[DEBUG] handleAddSet exerciseIndex:", exerciseIndex);

        const exercises = isTemplateEditor ? currentTemplateExercises :
                         (Array.isArray(currentWorkout) ? currentWorkout : currentWorkout.exercises);

        if (isNaN(exerciseIndex) || !exercises || exerciseIndex < 0 || exerciseIndex >= exercises.length) {
            console.error("handleAddSet: Invalid exercise index or data.", {
                index: exerciseIndex,
                dataExists: !!exercises,
                isTemplateEditor: isTemplateEditor
            });
            return; // Stop execution if index is bad
        }


        const setsContainer = exerciseItem.querySelector('.sets-container');
        if (!setsContainer) {
            console.error("Could not find sets container for exercise index:", exerciseIndex);
            return;
        }

        const exerciseData = exercises[exerciseIndex]; // Now we know index is valid

        const currentSetCount = setsContainer.querySelectorAll('.set-row').length;
        const newSetIndex = currentSetCount; // Index for the *new* row is the current count (0-based)


        const newSetRowHtml = generateSingleSetRowHtml(newSetIndex, exerciseData, isTemplateEditor);

        setsContainer.insertAdjacentHTML('beforeend', newSetRowHtml);

        if (isTemplateEditor) {

            exerciseData.sets = currentSetCount + 1;
            console.log(`Updated template exercise ${exerciseIndex} sets property to ${exerciseData.sets}`);

            const setsInput = exerciseItem.querySelector('.exercise-sets-input');
            if (setsInput) {
                setsInput.value = exerciseData.sets;
            }
        } else {

            if (!exerciseData.completedSets) {

                exerciseData.completedSets = Array(currentSetCount + 1).fill(false);
            } else if (exerciseData.completedSets.length <= newSetIndex) {

                exerciseData.completedSets.push(false);
            }

            exerciseData.sets = currentSetCount + 1;
            console.log(`Updated active workout exercise ${exerciseIndex} sets property to ${exerciseData.sets}`);

            saveWorkoutState();

            if (typeof saveWorkoutData === 'function') {
                saveWorkoutData();
            } else {
                saveInputValues();
            }
        }

        const removeButton = exerciseItem.querySelector('.btn-remove-set');
        if (removeButton) {
            removeButton.disabled = false;
        }

        console.log(`Added set ${newSetIndex + 1} to exercise ${exerciseIndex} (${isTemplateEditor ? 'template' : 'active workout'})`);

        if (navigator.vibrate) {
            navigator.vibrate(100); // Vibrate for 100ms
        }
    }

     function handleRemoveSet(event) {
        console.log("[DEBUG] handleRemoveSet called", event.target);
        const removeButton = event.target;
        const exerciseItem = removeButton.closest('.exercise-item'); // <<< Find parent item

        if (!exerciseItem) {
            console.error("Could not find parent exercise item for remove set button.");
            return;
        }

        const isTemplateEditor = exerciseItem.dataset.isTemplate === 'true' ||
                                templateEditorPage?.classList.contains('active');

        console.log("[DEBUG] Is template editor mode:", isTemplateEditor);

        let exerciseIndex;
        if (isTemplateEditor) {
            exerciseIndex = parseInt(removeButton.dataset.index, 10);
            if (isNaN(exerciseIndex)) {
                exerciseIndex = parseInt(exerciseItem.dataset.index, 10);
            }
        } else {
            exerciseIndex = parseInt(removeButton.dataset.workoutIndex, 10);
            if (isNaN(exerciseIndex)) {
                exerciseIndex = parseInt(exerciseItem.dataset.workoutIndex, 10);
            }
        }

        console.log("[DEBUG] handleRemoveSet exerciseIndex:", exerciseIndex);

        const exercises = isTemplateEditor ? currentTemplateExercises :
                         (Array.isArray(currentWorkout) ? currentWorkout : currentWorkout.exercises);

        if (isNaN(exerciseIndex) || !exercises || exerciseIndex < 0 || exerciseIndex >= exercises.length) {
            console.error("Invalid exercise index for removing set:", {
                index: exerciseIndex,
                dataExists: !!exercises,
                isTemplateEditor: isTemplateEditor
            });
            return;
        }

        const exercise = exercises[exerciseIndex]; // Use validated index and correct array

        const setsContainer = exerciseItem.querySelector('.sets-container');
        const setRows = setsContainer ? setsContainer.querySelectorAll('.set-row') : [];
        const currentSetCount = setRows.length;

        if (currentSetCount <= 1) {
             console.log("Cannot remove set, only 1 set remaining.");

             removeButton.disabled = true;
             return; // Don't remove if only 1 set is left
        }

        if (setRows.length > 0) {
            setRows[setRows.length - 1].remove();
        }

        exercise.sets = currentSetCount - 1;
        console.log(`Updated exercise ${exerciseIndex} sets property to ${exercise.sets}`);

        if (isTemplateEditor) {

            const setsInput = exerciseItem.querySelector('.exercise-sets-input');
            if (setsInput) {
                setsInput.value = exercise.sets;
            }
        } else {

            if (exercise.completedSets && Array.isArray(exercise.completedSets)) {
                exercise.completedSets.pop(); // Remove the last entry
            }

            saveWorkoutState();

            if (typeof saveWorkoutData === 'function') {
                saveWorkoutData();
            } else {
                saveInputValues();
            }
        }

        console.log(`Removed set from exercise ${exerciseIndex} (${exercise.name}). Remaining sets: ${currentSetCount - 1} (${isTemplateEditor ? 'template' : 'active workout'})`);

        if (currentSetCount - 1 <= 1) {
            removeButton.disabled = true;
        }


     }

    function initialize() {
        console.log('Initializing Workout Tracker...');


        try {
            const savedRepsValues = localStorage.getItem(STORAGE_KEYS.LAST_USED_REPS);
            if (savedRepsValues) {
                lastUsedRepsValues = JSON.parse(savedRepsValues);
                console.log('Loaded saved rep values from localStorage:', Object.keys(lastUsedRepsValues).length, 'exercises');
            }

            const savedAuthor = localStorage.getItem(STORAGE_KEYS.LAST_USED_AUTHOR);
            if (savedAuthor) {
                lastUsedAuthor = savedAuthor;
                console.log('Loaded saved author from localStorage:', lastUsedAuthor);
            }

            const savedEdition = localStorage.getItem(STORAGE_KEYS.LAST_USED_EDITION);
            if (savedEdition) {
                lastUsedEdition = savedEdition;
                console.log('Loaded saved edition from localStorage:', lastUsedEdition);
            }
        } catch (error) {
            console.error('Error loading saved values from localStorage:', error);
        }

        if (loadWorkoutState()) {
            console.log('Restoring saved workout state');

            if (currentWorkout) {
                const workoutName = Array.isArray(currentWorkout) ? 'New Workout' : currentWorkout.name;
                if (currentWorkoutNameEl) currentWorkoutNameEl.textContent = workoutName;

                renderCurrentWorkout();

                switchPage('active');


                setTimeout(() => {

                    if (typeof restoreWorkoutData === 'function') {
                        restoreWorkoutData();
                    } else {

                        restoreInputValues();
                    }
                }, 300);

                if (workoutStartTime) {

                    updateTimer();

                    workoutTimerInterval = setInterval(updateTimer, 1000);
                }
            }
        }

        fetchExercises(); // Fetch exercises for the modal
        fetchTemplates(); // Fetch templates for the landing page
        fetchAndDisplayPhotos(); // Fetch photos for the slider

        window.addEventListener('beforeunload', () => {
            if (currentPage === 'active') {

                updateWeightUnitsFromUI();

                if (typeof saveWorkoutData === 'function') {
                    saveWorkoutData();
                } else {

                    saveInputValues();
                }


                const start = Date.now();
                while (Date.now() - start < 100) {

                }
            }
        });

        document.querySelectorAll('.sidebar-nav-item, .nav-item').forEach(link => {
            link.addEventListener('click', () => {
                if (currentPage === 'active') {

                    updateWeightUnitsFromUI();
                    saveWorkoutState();
                }
            });
        });

        document.querySelectorAll('.sidebar-nav-item, .nav-item').forEach(link => {
            link.addEventListener('click', () => {
                if (currentPage === 'active') {

                    if (typeof saveWorkoutData === 'function') {
                        saveWorkoutData();
                    } else {

                        saveInputValues();
                    }
                }
            });
        });

        if (currentExerciseListEl) {
            console.log('Setting up MutationObserver for exercise list');
            const observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        console.log('Exercise list changed - checking for input values to restore');


                        break;
                    }
                }
            });

            observer.observe(currentExerciseListEl, { childList: true, subtree: true });
        }

        startEmptyWorkoutBtn?.addEventListener('click', startEmptyWorkout);

        console.log('Create Template Button Element:', createTemplateBtn);
        if (createTemplateBtn) {

            const newCreateTemplateBtn = createTemplateBtn.cloneNode(true);
            if (createTemplateBtn.parentNode) {
                createTemplateBtn.parentNode.replaceChild(newCreateTemplateBtn, createTemplateBtn);
            }

            newCreateTemplateBtn.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                console.log('[Create Template] Button clicked!');
                showTemplateEditor();
            });

            createTemplateBtn = newCreateTemplateBtn;
            console.log('[Initialize] Added click listener to Create Template button');
        } else {
            console.error('[Initialize] Create Template Button not found!');

            const retryCreateTemplateBtn = document.getElementById('create-template-btn');
            if (retryCreateTemplateBtn) {
                console.log('[Initialize] Found Create Template button on retry');
                retryCreateTemplateBtn.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    console.log('[Create Template] Button clicked (retry)!');
                    showTemplateEditor();
                });
            }
        }

        addExerciseFab?.addEventListener('click', () => {

             const targetList = templateEditorPage?.classList.contains('active') ? 'editor' : 'active';
             console.log(`Opening exercise modal for target: ${targetList}`);

             if (exerciseModal) exerciseModal.dataset.targetList = targetList;
             openExerciseModal();
        });
        closeExerciseModalBtn?.addEventListener('click', closeExerciseModal);
        exerciseModal?.addEventListener('click', (event) => { // Close on backdrop click
            if (event.target === exerciseModal) closeExerciseModal();
        });

        const searchInputEl = document.getElementById('exercise-search-input');
        const categoryFilterEl = document.getElementById('exercise-category-filter');
        const addSelectedBtnEl = document.getElementById('add-selected-exercises-btn');
        if (searchInputEl) searchInputEl.addEventListener('input', handleFilterChange);
        if (categoryFilterEl) categoryFilterEl.addEventListener('change', handleFilterChange);
        if (addSelectedBtnEl) addSelectedBtnEl.addEventListener('click', handleAddSelectedExercises);

        cancelWorkoutBtn?.addEventListener('click', handleCancelWorkout);
        completeWorkoutBtn?.addEventListener('click', handleCompleteWorkout);
        console.log('Added event listener to completeWorkoutBtn:', completeWorkoutBtn);

        currentExerciseListEl?.addEventListener('click', (event) => {
            console.log("[DEBUG] Second currentExerciseListEl click event", event.target);
            console.log("[DEBUG] Second target classList:", event.target.classList);

            if (event.target.classList.contains('set-complete-toggle')) {
                console.log("[DEBUG] Set complete toggle button clicked directly from delegation");
                handleSetToggle(event);
            }

            const target = event.target;

            if (target instanceof HTMLElement) {
                if (target.classList.contains('btn-add-set')) {
                    console.log("[DEBUG] Detected btn-add-set click");
                    handleAddSet(event);
                } else if (target.classList.contains('btn-remove-set')) {
                    console.log("[DEBUG] Detected btn-remove-set click");
                    handleRemoveSet(event);
                } else if (target.classList.contains('set-complete-toggle')) {
                    console.log("[DEBUG] Detected set-complete-toggle click");
                    handleSetToggle(event);
                } else if (target.classList.contains('btn-exercise-options')) {
                    console.log("[DEBUG] Detected btn-exercise-options click");
                    toggleOptionsMenu(event);
                } else if (target.classList.contains('btn-edit-exercise')) {
                    console.log("[DEBUG] Detected btn-edit-exercise click");

                    const index = parseInt(target.dataset.workoutIndex);
                    if (!isNaN(index)) {
                        openExerciseEditModal(index);
                    }
                } else if (target.classList.contains('btn-view-exercise')) {
                    console.log("[DEBUG] Detected btn-view-exercise click");
                    handleViewExercise(event);
                } else if (target.classList.contains('exercise-unit-select')) {
                    console.log("[DEBUG] Detected exercise-unit-select click");
                    handleExerciseUnitChange(event);
                } else if (target.classList.contains('btn-delete-exercise')) {
                    console.log("[DEBUG] Detected btn-delete-exercise click");
                    handleDeleteExercise(event);
                }
            }
        });

        currentExerciseListEl?.addEventListener('input', (event) => {
            const target = event.target;
            if (target instanceof HTMLElement) {
                if (target.classList.contains('weight-input') ||
                    target.classList.contains('reps-input') ||
                    target.classList.contains('exercise-notes-textarea')) {

                    console.log(`Input detected in ${target.className} - scheduling save`);

                    saveInputValueDirectly(target);

                    clearTimeout(window.inputSaveTimeout);
                    window.inputSaveTimeout = setTimeout(() => {
                        console.log('Debounced save triggered');

                        saveInputValues();
                    }, 500); // Save after 500ms of inactivity
                }
            }
        });

        const templateSearchInputEl = document.getElementById('template-search');
        if (templateSearchInputEl instanceof HTMLInputElement) {
            templateSearchInputEl.addEventListener('input', () => {
                const searchTerm = templateSearchInputEl.value.toLowerCase();
                const filtered = workoutTemplates.filter(t => t.name.toLowerCase().includes(searchTerm));
                renderWorkoutTemplates(filtered);
            });
        }

        if (templateSaveBtn) {
            console.log('[Initialize] Found templateSaveBtn, using inline onclick handler');

        } else {
            console.error('[Initialize] templateSaveBtn not found!');
        }

        if (templateCancelBtn) {
            console.log('[Initialize] Found templateCancelBtn, adding click listener');
            templateCancelBtn.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                console.log('[Template Editor] Cancel button clicked');
                switchPage('landing');
            });
        } else {
            console.error('[Initialize] templateCancelBtn not found!');
        }

        if (templateAddExerciseBtn) {
            console.log('[Initialize] Found templateAddExerciseBtn, adding click listener');
            templateAddExerciseBtn.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                console.log('[Template Editor] Add Exercise button clicked');

                if(exerciseModal) {
                    exerciseModal.dataset.targetList = 'editor';
                    openExerciseModal();
                } else {
                    console.error('[Template Editor] Exercise modal not found!');
                }
            });
        } else {
            console.error('[Initialize] templateAddExerciseBtn not found!');
        }

        templateExerciseListEl?.addEventListener('click', (event) => {
            const target = event.target;

            if (target.classList.contains('btn-exercise-options')) {
                toggleOptionsMenu(event);
                return;
            }

            if (target.classList.contains('btn-view-exercise')) {
                console.log('[Template Editor] View Exercise button clicked');

                event.preventDefault();

                handleViewExercise(event);
                return;
            }

            const deleteButton = target.closest('.btn-delete-template-exercise');
            if (deleteButton) {
                console.log('[Template Editor Delete Listener] Found delete button via closest().');
                handleDeleteTemplateExercise(deleteButton); // Pass the button element directly
            }
        });

        templateExerciseListEl?.addEventListener('input', (event) => {
            const target = event.target;

            if (target.classList.contains('exercise-sets-input') ||
                target.classList.contains('exercise-reps-input') ||
                target.classList.contains('exercise-weight-increment-input')) {

                const exerciseItem = target.closest('.exercise-item');
                if (!exerciseItem) return;

                const index = parseInt(exerciseItem.dataset.index, 10);
                if (isNaN(index) || index < 0 || index >= currentTemplateExercises.length) return;

                if (target.classList.contains('exercise-sets-input')) {
                    const sets = parseInt(target.value) || 1; // Default to 1 if invalid
                    currentTemplateExercises[index].sets = sets;
                    console.log(`Updated sets for exercise ${index} to ${sets}`);

                    const setsContainer = exerciseItem.querySelector('.sets-container');
                    if (setsContainer) {

                        const setsHtml = generateSetRowsHtml(currentTemplateExercises[index], index, true);
                        setsContainer.innerHTML = setsHtml;
                    }
                } else if (target.classList.contains('exercise-reps-input')) {
                    currentTemplateExercises[index].reps = target.value || '';
                    console.log(`Updated reps for exercise ${index} to ${target.value}`);
                } else if (target.classList.contains('exercise-weight-increment-input')) {
                    const weightIncrement = parseFloat(target.value) || 5; // Default to 5 if invalid
                    currentTemplateExercises[index].weight_increment = weightIncrement;

                    const goalTargets = document.querySelectorAll('.goal-target');
                    if (goalTargets.length > 0) {
                        console.log(`Updating goal targets with new weight increment: ${weightIncrement}`);

                        if (currentWorkout && !Array.isArray(currentWorkout)) {
                            const exercises = currentWorkout.exercises || [];
                            for (let i = 0; i < exercises.length; i++) {
                                if (exercises[i].exercise_id === currentTemplateExercises[index].exercise_id) {
                                    exercises[i].weight_increment = weightIncrement;
                                }
                            }
                        }
                    }
                    console.log(`Updated weight increment for exercise ${index} to ${weightIncrement}`);

                    const exerciseId = currentTemplateExercises[index].exercise_id;
                    const weightUnit = currentTemplateExercises[index].weight_unit || 'lbs';
                    if (exerciseId) {
                        saveExerciseUnitPreference(exerciseId, weightUnit, weightIncrement);
                    }
                }
            }
        });

        toggleDefineExerciseBtn?.addEventListener('click', handleToggleDefineExercise);
        saveNewExerciseBtn?.addEventListener('click', handleSaveNewExercise);

        templateListContainer?.addEventListener('click', (event) => {
            const target = event.target;
            console.log('[Template List Click]', target);
            if (!(target instanceof HTMLElement)) return; // Ensure target is an element

            console.log('[Template List Click] Element:', target.tagName, 'Classes:', target.className);

            if (target.classList.contains('btn-delete-template')) {
                console.log('[Template List Click] Delete template button clicked');
                const templateIdStr = target.dataset.templateId;
                if(templateIdStr) {
                    const templateId = parseInt(templateIdStr);
                    if (!isNaN(templateId)) handleDeleteTemplate(templateId);
                }
            } else if (target.classList.contains('btn-edit-template')) {
                console.log('[Template List Click] Edit template button clicked');
                const templateIdStr = target.dataset.templateId;
                if(templateIdStr){
                    console.log('[Template List Click] Template ID:', templateIdStr);
                    const templateId = parseInt(templateIdStr);
                    if (!isNaN(templateId)) {
                        console.log('[Template List Click] Looking for template with ID:', templateId);

                        const numericTemplateId = Number(templateId);

                        if (!workoutTemplates || workoutTemplates.length === 0) {
                            console.log('[Template List Click] workoutTemplates is empty, fetching templates first');

                            fetchTemplates().then(() => {
                                const templateToEdit = workoutTemplates.find(t => Number(t.workout_id) === numericTemplateId);
                                if (templateToEdit) {
                                    console.log('[Template List Click] Found template to edit after fetching:', templateToEdit.name);
                                    showTemplateEditor(templateToEdit);
                                } else {
                                    console.error('Could not find template to edit with ID after fetching:', templateId);
                                    console.log('Available template IDs after fetching:', workoutTemplates.map(t => t.workout_id));
                                    alert('Error: Could not find template data to edit.');
                                }
                            });
                        } else {

                            const templateToEdit = workoutTemplates.find(t => Number(t.workout_id) === numericTemplateId);
                            if (templateToEdit) {
                                console.log('[Template List Click] Found template to edit:', templateToEdit.name);
                                showTemplateEditor(templateToEdit);
                            } else {
                                console.error('Could not find template to edit with ID:', templateId);
                                console.log('Available template IDs:', workoutTemplates.map(t => t.workout_id));

                                console.log('[Template List Click] Trying to fetch templates again');
                                fetchTemplates().then(() => {
                                    const templateToEdit = workoutTemplates.find(t => Number(t.workout_id) === numericTemplateId);
                                    if (templateToEdit) {
                                        console.log('[Template List Click] Found template to edit after re-fetching:', templateToEdit.name);
                                        showTemplateEditor(templateToEdit);
                                    } else {
                                        console.error('Could not find template to edit with ID after re-fetching:', templateId);
                                        console.log('Available template IDs after re-fetching:', workoutTemplates.map(t => t.workout_id));
                                        alert('Error: Could not find template data to edit.');
                                    }
                                });
                            }
                        }
                    }
                }
            } else if (target.classList.contains('btn-start-template')) {
                console.log('[Template List Click] Start template button clicked');
                const templateId = target.dataset.templateId;
                if (templateId) {
                    startWorkoutFromTemplate(parseInt(templateId));
                }
            }
        });

        const historySearchInputEl = document.getElementById('history-exercise-search');
        const historyResultsEl = document.getElementById('history-search-results');
        const historyCategorySelectEl = document.getElementById('history-category-filter-select');
        const historyEditButtonEl = document.getElementById('history-edit-btn'); // Get button element
        const historyMessageElement = document.getElementById('history-message'); // Get message element

        if (historySearchInputEl instanceof HTMLInputElement && historyResultsEl && historyCategorySelectEl) { // Check if elements exist and are correct type
             historySearchInputEl.addEventListener('input', handleHistorySearchInput);

             document.addEventListener('click', (event) => {
                 if (historyResultsEl && // Check results element exists
                     !historySearchInputEl.contains(event.target) && // Check not clicking inside input
                     !historyResultsEl.contains(event.target)) { // Check not clicking inside results
                     historyResultsEl.style.display = 'none';
                 }
             });

             historySearchInputEl.addEventListener('focus', () => {
                 if (historySearchInputEl.value.trim() === '') {
                     handleHistorySearchInput(); // Re-trigger search on focus if empty
                 }
             });

            if (historyCategorySelectEl instanceof HTMLSelectElement) {
                historyCategorySelectEl.addEventListener('change', () => {
                    currentHistoryCategoryFilter = historyCategorySelectEl.value;
                    console.log('History category filter changed to:', currentHistoryCategoryFilter);

                    currentHistoryExerciseId = null;
                    currentHistoryExerciseName = null;
                    if (historyEditButtonEl) historyEditButtonEl.style.display = 'none';
                    historySearchInputEl.value = ''; // Clear search input
                    if (exerciseHistoryChart) { // Clear chart
                         exerciseHistoryChart.destroy();
                         exerciseHistoryChart = null;
                    }
                    if(historyMessageElement) historyMessageElement.textContent = 'Select an exercise.';

                    handleHistorySearchInput();
                 });
            }

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

                         fetchAndRenderHistoryChart(currentHistoryExerciseId);
                         if(historyEditButtonEl) historyEditButtonEl.style.display = 'inline-block'; // Show edit button
                         if(historyMessageElement) historyMessageElement.textContent = ''; // Clear message
                     }
                 }
             });

            if(historyEditButtonEl) {
                historyEditButtonEl.addEventListener('click', showHistoryEditModal);
            } else {
                console.error("History Edit Button not found.");
            }
        } else {
            console.log('History search components not found on this page.');
        }

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

        historyEditLogListContainer?.addEventListener('click', (event) => {
            const target = event.target;

            if (target instanceof HTMLElement && target.classList.contains('btn-delete-log-entry')) {
                const logIdStr = target.dataset.logId;
                 if (logIdStr && confirm('Are you sure you want to delete this log entry? This cannot be undone.')) {
                     const logId = parseInt(logIdStr);
                     if (!isNaN(logId)) handleDeleteLogEntry(logId); // Use moved function
                 }
            }
        });

        const photoUploadModalEl = document.getElementById('photo-upload-modal');
        const photoModalCloseButton = photoUploadModalEl?.querySelector('.close-button');
        const photoFormEl = document.getElementById('progress-photo-form');
        const photoDateInputEl = document.getElementById('modal-photo-date') // Corrected ID
        const uploadStatusElement = document.getElementById('upload-status');
        const photoUploadInputElement = document.getElementById('modal-photo-upload'); // Corrected ID

        addPhotoBtn?.addEventListener('click', () => {
            if (photoUploadModalEl) {

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

                  const form = photoUploadModalEl.querySelector('#progress-photo-form');
                  if (form) {
                      const submitButton = form.querySelector('button[type="submit"]');
                      if (submitButton) {
                          console.log('[Modal Open] Explicitly re-enabling upload button.');
                          submitButton.disabled = false;
                      }
                  }


            } else {
                 console.error('Photo upload modal not found!');
            }
        });

        photoModalCloseButton?.addEventListener('click', () => {
            if (photoUploadModalEl) photoUploadModalEl.style.display = 'none';
        });
        photoUploadModalEl?.addEventListener('click', (event) => { // Close on backdrop click
            if (event.target === photoUploadModalEl) {
                if (photoUploadModalEl) photoUploadModalEl.style.display = 'none';
            }
        });

        if (photoFormEl) photoFormEl.addEventListener('submit', handlePhotoUpload);

        if (photoNavigationContainer) {
            console.log('[Initialize] Setting up optimized photo slider navigation');

            console.log('[Initialize] Setting up photo navigation buttons with direct approach');

            const prevButton = document.getElementById('photo-prev-btn');
            const nextButton = document.getElementById('photo-next-btn');

            if (prevButton) {

                const parent = prevButton.parentNode;
                const prevButtonClone = prevButton.cloneNode(true);
                parent.removeChild(prevButton);

                prevButtonClone.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('[Navigation] Previous button clicked');
                    showPreviousPhoto();
                });

                prevButtonClone.style.cursor = 'pointer';

                parent.insertBefore(prevButtonClone, parent.firstChild);

                photoPrevBtn = prevButtonClone;

                console.log('[Initialize] Previous button handler attached successfully');
            } else {
                console.error('[Initialize] Previous button not found in DOM!');
            }

            if (nextButton) {

                const parent = nextButton.parentNode;
                const nextButtonClone = nextButton.cloneNode(true);
                parent.removeChild(nextButton);

                nextButtonClone.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('[Navigation] Next button clicked');
                    showNextPhoto();
                });

                nextButtonClone.style.cursor = 'pointer';

                parent.appendChild(nextButtonClone);

                photoNextBtn = nextButtonClone;

                console.log('[Initialize] Next button handler attached successfully');
            } else {
                console.error('[Initialize] Next button not found in DOM!');
            }

            if (photoReel) {
                let touchStartX = 0;
                let touchEndX = 0;

                addPassiveTouchListener(photoReel, 'touchstart', (e) => {
                    touchStartX = e.changedTouches[0].screenX;
                });

                addPassiveTouchListener(photoReel, 'touchend', (e) => {
                    touchEndX = e.changedTouches[0].screenX;
                    handleSwipe();
                });

                function handleSwipe() {

                    const minSwipeDistance = 50;
                    const swipeDistance = touchEndX - touchStartX;

                    if (Math.abs(swipeDistance) < minSwipeDistance) return;

                    if (swipeDistance > 0) {

                        showPreviousPhoto();
                    } else {

                        showNextPhoto();
                    }
                }
            }

            if (photoSliderContainer) {
                photoSliderContainer.addEventListener('wheel', (event) => {

                    event.preventDefault();
                }, { passive: false });
            }

        } else {
            console.error('[Initialize] photoNavigationContainer not found!');
        }

        if (deletePhotoBtn) {
            deletePhotoBtn.addEventListener('click', handleDeletePhoto);
        } else {
             console.error('[Initialize] deletePhotoBtn not found!');
        }

        if (comparePhotosBtn) {
            comparePhotosBtn.addEventListener('click', togglePhotoComparison);
        } else {
            console.error('[Initialize] comparePhotosBtn not found!');
        }

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

        const compSelect1 = document.getElementById('comparison-photo-select-1');
        const compSelect2 = document.getElementById('comparison-photo-select-2');
        if (compSelect1 && compSelect2) {
            compSelect1.addEventListener('change', updateComparisonImages);
            compSelect2.addEventListener('change', updateComparisonImages);
        } else {
             console.warn('[Initialize] Comparison select elements not found.');
        }

        switchPage(currentPage); // Use the existing top-level value

        if (!workoutTemplates.length && templateListContainer) renderWorkoutTemplates();
        if (!availableExercises.length && availableExerciseListEl) renderAvailableExercises(); // Check for availableExerciseListEl existence








        console.log('Initialization complete.');
    } // End of initialize function

    function displayFileSize(input) {

        if (typeof window.displayFileSize === 'function') {
            window.displayFileSize(input);
            return;
        }

        const fileSizeInfo = document.getElementById('file-size-info');
        const fileSizeDisplay = document.getElementById('file-size-display');
        const fileNameDisplay = document.getElementById('file-name-display');

        if (!fileSizeInfo || !fileSizeDisplay) {
            console.error('[Photo Upload] File size display elements not found');
            return;
        }

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

                const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
                fileDetails.push(`${file.name}: ${fileSizeMB} MB`);
            }

            const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

            let html = `<strong>Total: ${totalSizeMB} MB</strong><br>`;
            if (input.files.length > 1) {
                html += '<details><summary>Individual Files</summary><ul>';
                fileDetails.forEach(detail => {
                    html += `<li>${detail}</li>`;
                });
                html += '</ul></details>';
            }

            if (totalSizeMB > 5) {
                html += `<div style="color: orange; margin-top: 5px;">Large file(s) detected. Server will compress these images.</div>`;
            }

            fileSizeDisplay.innerHTML = html;

            console.log(`[Photo Upload] Selected ${input.files.length} file(s), total size: ${totalSizeMB} MB`);
        } else {
            fileSizeInfo.style.display = 'none';
            fileSizeDisplay.innerHTML = '';
        }
    }

    async function handlePhotoUpload(event) {
        event.preventDefault();
        console.log('[Photo Upload Client] handlePhotoUpload triggered.');

        const form = event.target;

        const formData = new FormData(form);


        const statusElement = document.getElementById('upload-status');
        const modal = document.getElementById('photo-upload-modal');
        const submitButton = form.querySelector('button[type="submit"]');

        if (!statusElement || !modal || !submitButton) {
            console.error('[Photo Upload Client] Status element, modal, or submit button not found.');

            return;
        }


        const dateValue = formData.get('date'); // Now using 'date' to match HTML name attribute
        const files = formData.getAll('photos');

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


        const fileSizeInfo = document.getElementById('file-size-info');
        if (fileSizeInfo) {
            fileSizeInfo.style.display = 'block';
        }

        let totalSize = 0;
        for (const file of files) {
            totalSize += file.size;
        }
        const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

        statusElement.style.display = 'block';

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

        const uploadEndpoint = isMobile ? '/api/mobile/mobile' : '/api/photos/upload';
        console.log(`[Photo Upload Client] Using endpoint: ${uploadEndpoint} for ${isMobile ? 'mobile' : 'desktop'} device`);

        console.log(`[Photo Upload Client] Running on ${isMobile ? 'MOBILE' : 'DESKTOP'} device`);
        console.log(`[Photo Upload Client] About to initiate fetch to ${uploadEndpoint}`);

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

            const controller = new AbortController();
            const signal = controller.signal;

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

            clearTimeout(fetchTimeout);
            clearTimeout(uploadTimeout);

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

            if (error.name === 'AbortError') {
                console.error('[Photo Upload Client] Fetch operation was aborted (timeout)');
                statusElement.innerHTML = `
                    <div style="color: #f44336;">Upload timed out. Please try again with a smaller image or check your connection.</div>
                `;
                submitButton.disabled = false;
            } else {

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

            clearTimeout(uploadTimeout);

            submitButton.disabled = false;
            console.log('[Photo Upload Client] handlePhotoUpload finished (finally block).');

            fetchAndDisplayPhotos();

            if (modal) {
                modal.style.display = 'none';
            }
        }
    }


    function togglePhotoComparison() {
        if (photoComparisonSection) {
            const isCurrentlyVisible = photoComparisonSection.style.display !== 'none';

            photoComparisonSection.style.display = isCurrentlyVisible ? 'none' : 'block';

            const gallerySection = document.querySelector('.gallery-section');
            if (gallerySection) {
                gallerySection.style.display = isCurrentlyVisible ? 'block' : 'none';
            }

            if (comparePhotosBtn) {
                comparePhotosBtn.textContent = isCurrentlyVisible ? 'Compare' : 'Carousel';
            }

            if (!isCurrentlyVisible) {
                populateComparisonDropdowns();
            }
        }
    }

    function populateComparisonDropdowns() {


        if (progressPhotosData.length > 0 && comparisonPhotoSelect1 && comparisonPhotoSelect2) {

            comparisonPhotoSelect1.innerHTML = '';
            comparisonPhotoSelect2.innerHTML = '';

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

            if (progressPhotos.length > 1) {
                comparisonPhotoSelect1.value = 0; // First photo
                comparisonPhotoSelect2.value = progressPhotos.length - 1; // Last photo
            }

            updateComparisonImages();
        }
    }

    function openPhotoUploadModal() {
        if (photoUploadModal) {

            const form = photoUploadModal.querySelector('#progress-photo-form');
            const statusEl = photoUploadModal.querySelector('#upload-status');

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


    async function fetchAndDisplayPhotos() {
        console.log('[Photo Load] fetchAndDisplayPhotos STARTED.'); // Log start


        if (!photoReel || !paginationDotsContainer || !deletePhotoBtn || !photoPrevBtn || !photoNextBtn || !photoNavigationContainer) {
            console.error("[Photo Load] Missing required slider elements (reel, dots container, delete button, navigation buttons, navigation container).");
            return;
        }

        if (window.isLoadingPhotos) {
            console.log('[Photo Load] Already loading photos, skipping duplicate call');
            return;
        }
        window.isLoadingPhotos = true;

        console.log('[Photo Load] Setting loading state...'); // Log before UI update
        photoReel.innerHTML = '<p>Loading photos...</p>'; // Show loading in reel
        paginationDotsContainer.innerHTML = ''; // Clear dots


        deletePhotoBtn.disabled = true;

        try {
            console.log('[Photo Load] Fetching photos from API...'); // Log before fetch
            const response = await fetch('/api/workouts/progress-photos');
            console.log(`[Photo Load] API Response Status: ${response.status}`); // Log status
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            progressPhotosData = await response.json(); // Expecting array like [{photo_id, date_taken, file_path, uploaded_at}]

            console.log(`[Photo Load] Fetched progress photos count: ${progressPhotosData.length}`);

            if (progressPhotosData.length > 0) {
                console.log('[Photo Load DEBUG] First photo data object:', JSON.stringify(progressPhotosData[0]));
                if (progressPhotosData.length > 1) {
                    console.log('[Photo Load DEBUG] Second photo data object:', JSON.stringify(progressPhotosData[1]));
                }
            }

            console.log('[Photo Load] Preloading all images in the background...');
            await new Promise(resolve => {
                PhotoLoader.preloadAllImages(progressPhotosData, () => {
                    console.log('[Photo Load] All images preloaded successfully');
                    resolve();
                });
            });

            console.log('[Photo Load] Clearing loading message from photoReel...');

            populateComparisonDropdowns();

            console.log('[Photo Load] Clearing loading message from photoReel...'); // Log before clearing
            photoReel.innerHTML = ''; // Clear loading message

            if (progressPhotosData.length > 0) {
                console.log('[Photo Load DEBUG] First photo data object:', JSON.stringify(progressPhotosData[0]));
                if (progressPhotosData.length > 1) {
                    console.log('[Photo Load DEBUG] Second photo data object:', JSON.stringify(progressPhotosData[1]));
                }
            }



            if (progressPhotosData.length === 0) {
                console.log('[Photo Load] No photos found. Displaying empty message.'); // Log empty case
                photoReel.innerHTML = '<p>No progress photos uploaded yet.</p>';


                deletePhotoBtn.disabled = true;

                 if (currentPhotoDateDisplay) currentPhotoDateDisplay.textContent = '';
                window.isLoadingPhotos = false; // <<< Ensure flag is reset here too
                return; // Exit early if no photos
            }

            console.log('[Photo Load] Populating photo reel and pagination dots...'); // Log before loop
            progressPhotosData.forEach((photo, index) => {

                const img = document.createElement('img');

                img.dataset.src = photo.file_path;

                const photoDate = new Date(photo.date_taken);
                const formattedDate = photoDate.toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric'
                });

                img.alt = '';

                img.setAttribute('aria-hidden', 'true');
                img.dataset.photoId = photo.photo_id; // Store ID for reference
                img.loading = 'lazy'; // Add native lazy loading attribute

                if (PhotoLoader.imageCache[photo.photo_id]) {
                    img.src = PhotoLoader.imageCache[photo.photo_id];
                    console.log(`[Photo Load] Using cached image for ID: ${photo.photo_id}`);
                } else {

                    img.src = PhotoLoader.placeholderImage;
                    img.style.opacity = '0'; // Hide placeholder

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

                const dot = document.createElement('span');
                dot.classList.add('dot');
                dot.dataset.index = String(index); // Use String() explicitly

                if (!dot.dataset.listenerAdded) { // Check if listener already added

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

                paginationDotsContainer.appendChild(dot);
            });

            currentPhotoIndex = 0;
            console.log('[Photo Load] Calling displayCurrentPhoto() to show first image...'); // Log before display call
            displayCurrentPhoto(); // Initial display

        } catch (error) {
            console.error('[Photo Load] Error fetching or processing photos:', error);
            photoReel.innerHTML = `<p style="color: red;">Error loading photos: ${error.message}</p>`;


            deletePhotoBtn.disabled = true;

            if (currentPhotoDateDisplay) currentPhotoDateDisplay.textContent = '';
        } finally {
            console.log('[Photo Load] fetchAndDisplayPhotos FINISHED.'); // Log finish

            window.isLoadingPhotos = false;
        }
    }


    function displayCurrentPhoto() {
        const startTime = performance.now(); // Start timer
        const numPhotos = progressPhotosData.length;
        console.log(`[Photo Display] Displaying photo index: ${currentPhotoIndex} (Total: ${numPhotos})`);

        const dateDisplayEl = currentPhotoDateDisplay; // Use the reference

        if (numPhotos === 0 || !photoReel || !paginationDotsContainer || !dateDisplayEl) {
            console.warn('[Photo Display] No photos or required elements found (reel, dots, date display).');
            if (dateDisplayEl) dateDisplayEl.textContent = ''; // Clear date if no photos
            return; // Nothing to display
        }

        const placeholderElements = photoReel.querySelectorAll('p');
        placeholderElements.forEach(el => {
            el.style.display = 'none';
        });

        Array.from(photoReel.childNodes).forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                photoReel.removeChild(node);
            }
        });

        const allImages = photoReel.querySelectorAll('img');
        allImages.forEach(img => {

            img.alt = '';

            img.setAttribute('aria-hidden', 'true');

            if (img.complete && img.naturalWidth > 0) {

                img.style.opacity = '1';
            } else {

                img.style.opacity = '0';
            }
        });

        console.log(`[Photo Display DEBUG] Current index before bounds check: ${currentPhotoIndex}`);


        if (currentPhotoIndex < 0) currentPhotoIndex = 0;
        if (currentPhotoIndex >= numPhotos) currentPhotoIndex = numPhotos - 1;

        console.log(`[Photo Display DEBUG] Current index AFTER bounds check: ${currentPhotoIndex}`);


        const currentPhoto = progressPhotosData[currentPhotoIndex];

        console.log('[Photo Display DEBUG] Photo object being used:', JSON.stringify(currentPhoto));

        console.log(`[Photo Display] Attempting to display data:`, currentPhoto); // <<< Log the photo object
        let formattedDate = '';
        if (currentPhoto && currentPhoto.date_taken) {

            const photoDate = new Date(currentPhoto.date_taken);

            formattedDate = photoDate.toLocaleDateString(undefined, {
                year: 'numeric', month: 'long', day: 'numeric'
            });
            console.log(`[Photo Display] Date from DB: ${currentPhoto.date_taken}, Parsed as: ${photoDate.toISOString()}, Formatted as: ${formattedDate}`);
        }
        dateDisplayEl.textContent = formattedDate; // Update the date display

        const filePathToLoad = currentPhoto ? currentPhoto.file_path : '[No Photo Object]';
        console.log(`[Photo Display] Setting image src to: ${filePathToLoad}`); // <<< Log the file path being used

        const imageElements = photoReel.querySelectorAll('img');
        if (imageElements && imageElements[currentPhotoIndex]) {
            const currentImageElement = imageElements[currentPhotoIndex];
            const currentPhoto = progressPhotosData[currentPhotoIndex];

            PhotoLoader.loadImage(
                currentPhoto.file_path,
                currentImageElement,
                currentPhoto.photo_id,
                () => console.log(`[Photo Display] Successfully loaded current image (ID: ${currentPhoto.photo_id})`),
                (error) => console.error(`[Photo Display] Failed to load current image: ${error}`)
            );

        } else {
            console.warn(`[Photo Display] Could not find image element for index ${currentPhotoIndex}`);
        }


        const offset = currentPhotoIndex * -100; // Calculate percentage offset

        console.log(`[Photo Display DEBUG] Calculated reel offset: ${offset}% for index ${currentPhotoIndex}`);

        photoReel.style.transform = `translateX(${offset}%)`;

        const dots = paginationDotsContainer.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentPhotoIndex);
        });


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






    window.showPreviousPhoto = function showPreviousPhoto() {
        console.log('[Photo Slider] PREV button clicked, attempting to show previous photo...');

        console.log(`[Photo Slider] Current state: index=${currentPhotoIndex}, total photos=${progressPhotosData ? progressPhotosData.length : 'undefined'}`);

        if (!progressPhotosData || progressPhotosData.length === 0) {
            console.log('[Photo Slider] No photos available');
            return;
        }

        if (currentPhotoIndex <= 0) { // Block only if at first photo
            console.log(`[Photo Slider] Previous blocked: Already at first photo (index 0)`);
            return;
        }

        try {

            currentPhotoIndex--;
            console.log(`[Photo Slider] Index decremented to: ${currentPhotoIndex}`);

            displayCurrentPhoto();

            console.log('[Photo Slider] Previous photo navigation successful');
        } catch (error) {
            console.error('[Photo Slider] Error in showPreviousPhoto:', error);
        }
    };

    window.showNextPhoto = function showNextPhoto() {
        console.log('[Photo Slider] NEXT button clicked, attempting to show next photo...');

        console.log(`[Photo Slider] Current state: index=${currentPhotoIndex}, total photos=${progressPhotosData ? progressPhotosData.length : 'undefined'}`);

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

            currentPhotoIndex++;
            console.log(`[Photo Slider] Index incremented to: ${currentPhotoIndex}`);

            displayCurrentPhoto();

            console.log('[Photo Slider] Next photo navigation successful');
        } catch (error) {
            console.error('[Photo Slider] Error in showNextPhoto:', error);
        }
    };

    function goToPhoto(index) {
        console.log(`[Photo Slider] Go to photo index: ${index}`);
        const numPhotos = progressPhotosData.length;

        if (index === currentPhotoIndex || index < 0 || index >= numPhotos) {
            console.log(`[Photo Slider] Dot click blocked: index=${index}, currentIndex=${currentPhotoIndex}`);
            return;
        }

        if (photoPrevBtn) photoPrevBtn.disabled = true;
        if (photoNextBtn) photoNextBtn.disabled = true;

        currentPhotoIndex = index;
        displayCurrentPhoto(); // Directly update display

        console.log(`[Photo Slider] Dot action complete.`);
    }


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

                    errorMsg += " (Could not parse error response as JSON)";
                }
                throw new Error(errorMsg);
            }

            const result = await response.json();
            console.log('[Photo Delete] Photo deleted successfully via API:', result);

            console.log('[Photo Delete] Calling fetchAndDisplayPhotos() to refresh gallery...');
            await fetchAndDisplayPhotos(); // Wait for the refresh to attempt completion
            console.log('[Photo Delete] fetchAndDisplayPhotos() call finished.');

        } catch (error) {
            console.error('[Photo Delete] Error deleting photo:', error);
            alert(`Failed to delete photo: ${error.message}`);

            deletePhotoBtn.disabled = false;
        } finally {

             console.log('[Photo Delete] Delete process finished.');
        }
    }


    function populateComparisonDropdowns() {
        if (!comparisonPhotoSelect1 || !comparisonPhotoSelect2) return;

        comparisonPhotoSelect1.innerHTML = '<option value="">-- Select Date --</option>';
        comparisonPhotoSelect2.innerHTML = '<option value="">-- Select Date --</option>';

        if (progressPhotosData.length > 0) {

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

    function updateComparisonImages() {
        if (!comparisonImage1 || !comparisonImage2 || !comparisonPhotoSelect1 || !comparisonPhotoSelect2) return;

        const selectedId1 = comparisonPhotoSelect1.value;
        const selectedId2 = comparisonPhotoSelect2.value;

        const photo1 = selectedId1 ? progressPhotosData.find(p => p.photo_id == selectedId1) : null;
        const photo2 = selectedId2 ? progressPhotosData.find(p => p.photo_id == selectedId2) : null;

        comparisonImage1.alt = photo1 ? `Comparison Photo 1: ${new Date(photo1.date_taken).toLocaleDateString(undefined, {year: 'numeric', month: 'numeric', day: 'numeric'})}` : 'Comparison Photo 1';
        comparisonImage2.alt = photo2 ? `Comparison Photo 2: ${new Date(photo2.date_taken).toLocaleDateString(undefined, {year: 'numeric', month: 'numeric', day: 'numeric'})}` : 'Comparison Photo 2';

        if (!photo1) comparisonImage1.src = '';
        if (!photo2) comparisonImage2.src = '';

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

    const toggleHistoryBtn = document.getElementById('toggle-history-btn');
    if (toggleHistoryBtn) {
        toggleHistoryBtn.addEventListener('click', toggleExerciseHistory);
    }

    initialize(); // Run initialization

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

        exercises[exerciseIndex].weight_unit = newUnit;
        console.log(`Updated unit for exercise ${exerciseIndex} to: ${newUnit}`);

        const weightIncrementInput = exerciseItem.querySelector('.weight-increment-input');
        const weightIncrement = weightIncrementInput ? parseFloat(weightIncrementInput.value) : 5;

        const exerciseId = exercises[exerciseIndex].exercise_id;
        if (exerciseId) {
            saveExerciseUnitPreference(exerciseId, newUnit, weightIncrement);
        }

        saveWorkoutState();

        if (typeof saveWorkoutData === 'function') {
            saveWorkoutData();
        }
    }

    function handleWeightIncrementChange(event) {
        const inputElement = event.target;
        const exerciseItem = inputElement.closest('.exercise-item');
        if (!exerciseItem) {
            console.error("Could not find parent exercise item for weight increment input.");
            return;
        }

        const exerciseIndex = parseInt(exerciseItem.dataset.workoutIndex, 10);
        const newIncrement = parseFloat(inputElement.value);

        if (isNaN(newIncrement) || newIncrement <= 0) {
            console.error("Invalid weight increment value:", inputElement.value);
            inputElement.value = 5; // Reset to default
            return;
        }

        const exercises = Array.isArray(currentWorkout) ? currentWorkout : currentWorkout.exercises;
        if (isNaN(exerciseIndex) || !exercises || !exercises[exerciseIndex]) {
            console.error("Invalid exercise index for weight increment change:", exerciseIndex);
            return;
        }

        exercises[exerciseIndex].weight_increment = newIncrement;
        console.log(`Updated weight increment for exercise ${exerciseIndex} to: ${newIncrement}`);

        const unitSelect = exerciseItem.querySelector('.weight-unit-select');
        const weightUnit = unitSelect ? unitSelect.value : exercises[exerciseIndex].weight_unit || 'lbs';

        const exerciseId = exercises[exerciseIndex].exercise_id;
        if (exerciseId) {
            saveExerciseUnitPreference(exerciseId, weightUnit, newIncrement);
        }

        saveWorkoutState();

        if (typeof saveWorkoutData === 'function') {
            saveWorkoutData();
        }
    }

    async function saveExerciseUnitPreference(exerciseId, weightUnit, weightIncrement, defaultReps = null) {
        try {

            const parsedIncrement = parseFloat(weightIncrement) || 5;

            const baseUrl = window.location.origin;
            const response = await fetch(`${baseUrl}/api/exercise-preferences`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    exerciseId,
                    weightUnit,
                    weightIncrement: parsedIncrement,
                    defaultReps
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return true;
        } catch (error) {

            return false;
        }
    }

    const debouncedShowPreviousPhoto = debounce(showPreviousPhoto, navigationDebounceTime);
    const debouncedShowNextPhoto = debounce(showNextPhoto, navigationDebounceTime);

    async function initialize() {
        console.log('Initializing Workout Tracker...');

        const completeWorkoutBtn = document.getElementById('complete-workout-btn');
        if (completeWorkoutBtn) {
            console.log('Adding direct event listener to Complete Workout button');
            completeWorkoutBtn.addEventListener('click', function(event) {
                console.log('Complete Workout button clicked directly from initialize');
                window.handleCompleteWorkout(event);
            });
        } else {
            console.log('Complete Workout button not found in initialize');
        }

        console.log('Fetching exercises...');
        await fetchExercises();
        console.log('Fetching templates...');
        await fetchTemplates();

        await fetchAndDisplayPhotos();






        if (closeExerciseModalBtn) {
            closeExerciseModalBtn.addEventListener('click', closeExerciseModal);
        }
        if (exerciseEditModalCloseBtn) {
             exerciseEditModalCloseBtn.addEventListener('click', closeExerciseEditModal);
        }

        if (exerciseSearchInput) {
            exerciseSearchInput.addEventListener('input', handleFilterChange);
        }
        if (exerciseCategoryFilter) {
            exerciseCategoryFilter.addEventListener('change', handleFilterChange);
        }
        if (addSelectedExercisesBtn) {
            addSelectedExercisesBtn.addEventListener('click', handleAddSelectedExercises);
        }

        if (toggleDefineExerciseBtn) {
            toggleDefineExerciseBtn.addEventListener('click', handleToggleDefineExercise);
        }
        if (saveNewExerciseBtn) {
            saveNewExerciseBtn.addEventListener('click', handleSaveNewExercise);
        }


        if (templateExerciseListEl) {

            templateExerciseListEl.addEventListener('click', function(event) {
                if (event.target.classList.contains('delete-template-exercise-btn')) {
                    handleDeleteTemplateExercise(event.target);
                }
            });


            templateExerciseListEl.addEventListener('dragstart', function(event) {

                if (event.target.closest('.exercise-item')) {
                    handleDragStart(event);
                }
            });

            templateExerciseListEl.addEventListener('dragover', function(event) {

                if (event.target.closest('.exercise-item')) {
                    handleDragOver(event);
                }
            });

            templateExerciseListEl.addEventListener('drop', function(event) {

                if (event.target.closest('.exercise-item')) {
                    handleDrop(event);
                }
            });

            templateExerciseListEl.addEventListener('dragend', function(event) {

                if (event.target.closest('.exercise-item')) {
                    handleDragEnd(event);
                }
            });

            templateExerciseListEl.addEventListener('dragenter', function(event) {

                templateExerciseListEl.classList.add('dragging-in-progress');
            });

            templateExerciseListEl.addEventListener('dragleave', function(event) {

                if (event.target === templateExerciseListEl) {
                    templateExerciseListEl.classList.remove('dragging-in-progress');
                }
            });
        }

        if (cancelWorkoutBtn) {
            cancelWorkoutBtn.addEventListener('click', handleCancelWorkout);
        }

        if (addExerciseFab) {
            addExerciseFab.addEventListener('click', () => openExerciseModal(false)); // Pass false for workout mode
        }















        if (currentExerciseListEl) {
            currentExerciseListEl.addEventListener('click', function(event) {
                console.log("[DEBUG] Second currentExerciseListEl click event", event.target);
                console.log("[DEBUG] Second target classList:", event.target.classList);

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
                } else if (event.target.classList.contains('view-history-btn') ||
                         event.target.closest('.view-history-btn')) {
                    const button = event.target.classList.contains('view-history-btn') ?
                                  event.target : event.target.closest('.view-history-btn');
                    const exerciseId = button.dataset.exerciseId;
                    const exerciseName = button.dataset.exerciseName;

                    if (typeof window.showExerciseHistoryPopup === 'function') {
                        window.showExerciseHistoryPopup(exerciseId, exerciseName);
                    } else {
                        console.error('showExerciseHistoryPopup function not found');
                    }
                } else if (event.target.classList.contains('edit-exercise-name-btn')) {

                    const exerciseItem = event.target.closest('.exercise-item');
                    if (exerciseItem && exerciseItem.dataset.workoutIndex !== undefined) {
                        openExerciseEditModal(parseInt(exerciseItem.dataset.workoutIndex, 10));
                    }
                } else if (event.target.classList.contains('btn-add-set')) {
                    console.log("[DEBUG] Detected btn-add-set click in second listener");
                    handleAddSet(event);
                } else if (event.target.classList.contains('btn-remove-set')) {
                    console.log("[DEBUG] Detected btn-remove-set click in second listener");
                    handleRemoveSet(event);
                } else if (event.target.classList.contains('btn-exercise-options')) {
                    console.log("[DEBUG] Detected btn-exercise-options click in second listener");
                    toggleOptionsMenu(event);
                } else if (event.target.classList.contains('btn-view-exercise') || event.target.closest('.btn-view-exercise')) {
                    console.log("[DEBUG] Detected btn-view-exercise click in second listener");
                    handleViewExercise(event);
                }
            });

            currentExerciseListEl.addEventListener('change', function(event) {
                 if (event.target.classList.contains('unit-select')) {
                     handleExerciseUnitChange(event);
                 } else if (event.target.classList.contains('weight-increment-input')) {
                     handleWeightIncrementChange(event);
                 }
             });
        }

        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', closeExerciseEditModal);
        }
        if (saveEditBtn) {
             saveEditBtn.addEventListener('click', handleSaveExerciseName);
        }

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

        if (startEmptyWorkoutBtn) {
            startEmptyWorkoutBtn.addEventListener('click', startEmptyWorkout);
        }
        if (createTemplateBtn) {
            createTemplateBtn.addEventListener('click', () => showTemplateEditor());
        }



        if (templateSearchInput) {
             templateSearchInput.addEventListener('input', (event) => {

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
             console.error('[Initialize Error] templateSearchInput element not found! Cannot add search listener.');
        }

        if (historyExerciseSearchInput) {

            function handleHistorySearchInput() {
                const searchTerm = historyExerciseSearchInput.value.toLowerCase().trim();

                if (historySearchResultsEl) {
                    historySearchResultsEl.style.display = searchTerm ? 'block' : 'none';

                    const filteredExercises = availableExercises.filter(ex => {
                        const nameMatch = ex.name.toLowerCase().includes(searchTerm);
                        const categoryMatch = currentHistoryCategoryFilter === 'all' ||
                                            ex.category === currentHistoryCategoryFilter;
                        return nameMatch && categoryMatch;
                    });

                    renderHistorySearchResults(filteredExercises);
                }
            }

            historyExerciseSearchInput.addEventListener('input', debounce(handleHistorySearchInput, 300));
        }

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

        function handleHistoryResultClick(event) {
            const target = event.target;
            if (target.classList.contains('history-search-item')) {
                const exerciseId = parseInt(target.dataset.exerciseId, 10);
                const exerciseName = target.dataset.exerciseName;

                if (!isNaN(exerciseId)) {
                    currentHistoryExerciseId = exerciseId;
                    currentHistoryExerciseName = exerciseName;

                    if (historyExerciseSearchInput) {
                        historyExerciseSearchInput.value = exerciseName;
                    }

                    if (historySearchResultsEl) {
                        historySearchResultsEl.style.display = 'none';
                    }

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

                if (currentHistoryExerciseId) {
                    fetchAndRenderHistoryChart(currentHistoryExerciseId); // Re-fetch chart with category filter
                }
            });
        }

        async function fetchAndRenderHistoryChart(exerciseId) {
            if (!historyChartCanvas) return;

            try {

                const historyMessageEl = document.getElementById('history-message');
                if (historyMessageEl) {
                    historyMessageEl.textContent = 'Loading exercise history...';
                }

                const response = await fetch(`/api/workouts/exercise-history/${exerciseId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const historyData = await response.json();

                if (historyMessageEl) {
                    historyMessageEl.textContent = '';
                }

                renderHistoryChart(historyData);

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

        function renderHistoryChart(historyData) {

            if (exerciseHistoryChart) {
                exerciseHistoryChart.destroy();
            }

            if (!historyData || historyData.length === 0) {
                const historyMessageEl = document.getElementById('history-message');
                if (historyMessageEl) {
                    historyMessageEl.textContent = 'No history data available for this exercise.';
                }
                return;
            }

            const dates = historyData.map(entry => new Date(entry.workout_date).toLocaleDateString());
            const weights = historyData.map(entry => {
                const weightValues = entry.weight_used.split(',').map(w => parseFloat(w.trim()));

                return weightValues.reduce((sum, val) => sum + val, 0) / weightValues.length;
            });

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

        function hideHistoryEditModal() {
            if (historyEditModal) {
                historyEditModal.style.display = 'none';
            }
        }

        function handleSaveManualLog(event) {
            event.preventDefault();
            console.log('Save manual log function called');

            hideHistoryEditModal();
        }

        function handleAddManualSetRow() {
            console.log('Add manual set row function called');

        }

        function handleRemoveManualSetRow() {
            console.log('Remove manual set row function called');

        }

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


        function setupChartConfig() {
            if (typeof Chart !== 'undefined') {
                console.log('[Chart Config] Setting up Chart.js defaults for workouts');

                Chart.defaults.color = '#ddd';
                Chart.defaults.borderColor = '#444';
                Chart.defaults.font.family = "'Roboto', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";

                if (Chart.defaults.elements && Chart.defaults.elements.line) {
                    Chart.defaults.elements.line.borderWidth = 2;
                    Chart.defaults.elements.line.tension = 0.2;
                }

                if (Chart.defaults.elements && Chart.defaults.elements.point) {
                    Chart.defaults.elements.point.radius = 4;
                    Chart.defaults.elements.point.hoverRadius = 6;
                }

                console.log('[Chart Config] Chart.js configuration complete');
            } else {
                console.warn('[Chart Config] Chart.js not loaded, skipping configuration');
            }
        }

        setupChartConfig();

        initializeAutoSave();

        initializeMobileLayout();

        restoreWorkoutState();
        restoreInputValues();

        console.log('Initialization complete.');
    } // End of initialize function

    async function handleAddSelectedExercises() {
        const targetList = exerciseModal.dataset.targetList || 'active'; // Determine target

        console.log('Current checked exercises:');
        checkedExercises.forEach(id => {
            console.log(`- Exercise ID: ${id}`);
        });

        if (checkedExercises.size === 0) {
            alert('Please select at least one exercise to add.');
            return;
        }

        console.log(`Adding ${checkedExercises.size} checked exercises to ${targetList}`);

        const orderedIds = checkedExercisesOrder.filter(id => checkedExercises.has(id));

        Array.from(checkedExercises).forEach(id => {
            if (!orderedIds.includes(id)) {
                orderedIds.push(id);
            }
        });

        const exercisesToAdd = [...orderedIds];

        closeExerciseModal();

        for (const exerciseId of exercisesToAdd) {
            await addExerciseToWorkout(exerciseId, targetList); // Pass targetList and await completion
        }

        checkedExercises.clear();
        checkedExercisesOrder.length = 0;
        console.log('Cleared all checked exercises');

        renderAvailableExercises(exerciseSearchInput.value, exerciseCategoryFilter.value);
    }

    function handleCancelWorkout() {


        console.log('Cancel workout requested.');

        stopTimer();

        if (confirm('Are you sure you want to cancel this workout? All current progress for this session will be lost.')) {
            console.log('Workout cancelled by user.');

            currentWorkout = [];
            workoutStartTime = null;

            clearWorkoutState(); // Assuming this function exists and is accessible

            switchPage('landing');
        } else {
            console.log('Workout cancellation aborted.');

            startTimer();
        }
    }


    window.handleDeleteTemplate = async function handleDeleteTemplate(templateId) {
        console.log(`[handleDeleteTemplate] Called with templateId: ${templateId}`);

        const templateToDelete = workoutTemplates.find(t => t.workout_id === templateId);
        if (!templateToDelete) {
            console.error(`[handleDeleteTemplate] Template with ID ${templateId} not found`);
            return;
        }

        if (!confirm(`Are you sure you want to delete the template "${templateToDelete.name}"? This cannot be undone.`)) {
            console.log(`[handleDeleteTemplate] User cancelled deletion of template: ${templateToDelete.name}`);
            return;
        }

        try {

            const response = await fetch(`/api/workouts/templates/${templateId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Failed to delete template: ${response.status} ${response.statusText}`);
            }

            console.log(`[handleDeleteTemplate] Successfully deleted template: ${templateToDelete.name}`);

            const index = workoutTemplates.findIndex(t => t.workout_id === templateId);
            if (index !== -1) {
                workoutTemplates.splice(index, 1);
            }

            renderWorkoutTemplates();

        } catch (error) {
            console.error(`[handleDeleteTemplate] Error deleting template:`, error);
            alert(`Error deleting template: ${error.message}`);
        }
    }

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

function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function calculate1RM(weight, reps) {

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

    const percentage = percentages[reps] || 50;

    const oneRepMax = Math.round((weight / percentage) * 100);

    return oneRepMax;
}

function calculateGoal(exerciseData) {
    if (!exerciseData.lastLog || !exerciseData.lastLog.weight_used || !exerciseData.lastLog.reps_completed) {
        return null; // No previous data to base goal on
    }

    const prevWeights = exerciseData.lastLog.weight_used.split(',').map(w => parseFloat(w.trim()));
    const prevReps = exerciseData.lastLog.reps_completed.split(',').map(r => parseInt(r.trim()));
    const prevUnit = exerciseData.lastLog.weight_unit || 'lbs'; // Default to lbs

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

    const targetReps = 10; // This could be configurable
    const allSetsReachedTarget = validSets.every(set => set.reps >= targetReps);

    const goalSets = JSON.parse(JSON.stringify(validSets));


    let weightIncrement = parseFloat(exerciseData.weight_increment) || 5; // Default to 5 if not specified

    console.log(`[calculateGoal] Using weight increment from exercise data: ${weightIncrement} ${prevUnit}`);


    if (validSets.length > 1 && !exerciseData.weight_increment) {


        for (let i = 1; i < validSets.length; i++) {
            if (validSets[i].weight !== validSets[0].weight) {
                const calculatedIncrement = Math.abs(validSets[i].weight - validSets[0].weight);
                if (calculatedIncrement > 0) {
                    weightIncrement = calculatedIncrement;
                    console.log(`[calculateGoal] Detected weight increment of ${weightIncrement} ${prevUnit} between sets`);
                    break;
                }
            }
        }
    }

    console.log(`[calculateGoal] Using weight increment: ${weightIncrement} ${prevUnit}`);

    if (allSetsReachedTarget) {


        const firstSetWeight = goalSets[0].weight;

        goalSets[0].weight = firstSetWeight + weightIncrement;
        goalSets[0].reps = 8; // Start with fewer reps at the higher weight
    } else {

        const incompleteSetIndex = goalSets.findIndex(set => set.reps < targetReps);

        if (incompleteSetIndex >= 0) {

            goalSets[incompleteSetIndex].reps += 1;
        }
    }

    return {
        sets: goalSets,
        unit: prevUnit,
        weight_increment: weightIncrement // Include the weight increment in the result
    };
}

function generateSingleSetRowHtml(setIndex, exerciseData, isTemplate = false) {
    console.log(`[DEBUG] generateSingleSetRowHtml called for set ${setIndex+1} of exercise ${exerciseData.name}, isTemplate=${isTemplate}`);
    console.log(`[DEBUG] exerciseData.lastLog:`, exerciseData.lastLog);

    let weightValue = '';
    let repsValue = '';

    if (isTemplate && exerciseData.reps) {
        repsValue = exerciseData.reps;
        console.log(`[DEBUG] Template Set ${setIndex+1}: Using default reps=${repsValue}`);
    }

    const unit = exerciseData.weight_unit || 'lbs'; // Always default to lbs
    console.log(`[DEBUG] Using weight unit: ${unit}`);

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


    const weightInputType = (unit === 'assisted') ? 'hidden' : 'number';

    const weightPlaceholder = (unit === 'bodyweight') ? 'BW' : (unit === 'assisted') ? '' : 'Wt';
    const repsPlaceholder = 'Reps';

    let previousLogTextHtml = `- ${unit} x -`;
    console.log(`[DEBUG] Default previousLogTextHtml: ${previousLogTextHtml}`);

    let goalTextHtml = '';

    if (exerciseData.lastLog && exerciseData.lastLog.weight_used && exerciseData.lastLog.reps_completed) {
        console.log(`[DEBUG] Found lastLog data for ${exerciseData.name}`);
        const prevWeights = exerciseData.lastLog.weight_used.split(',');
        const prevReps = exerciseData.lastLog.reps_completed.split(',');
        const prevUnit = exerciseData.lastLog.weight_unit || 'lbs'; // Default to lbs instead of kg
        console.log(`[DEBUG] prevWeights: ${prevWeights}, prevReps: ${prevReps}, prevUnit: ${prevUnit}`);

        if (setIndex < prevWeights.length && setIndex < prevReps.length) {
            const prevWeight = prevWeights[setIndex].trim() || '-';
            const prevRep = prevReps[setIndex].trim() || '-';
            previousLogTextHtml = `${prevWeight} ${prevUnit} x ${prevRep}`;
            console.log(`[DEBUG] Set ${setIndex+1}: Updated previousLogTextHtml to: ${previousLogTextHtml}`);
        } else {
            console.log(`[DEBUG] Set ${setIndex+1}: No previous log data for this set index (prevWeights.length=${prevWeights.length}, prevReps.length=${prevReps.length})`);
        }

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


    return `
        <div class="set-row" data-set-index="${setIndex}">
            <span class="set-number">${setIndex + 1}</span>
            <span class="previous-log">${previousLogTextHtml}</span>
            <input type="${weightInputType}" class="weight-input" placeholder="${weightPlaceholder}" value="${weightValue}" ${isDisabled ? 'disabled' : ''} step="any" inputmode="decimal">
            <input type="text" class="reps-input" placeholder="${repsPlaceholder}" value="${repsValue}" ${isDisabled ? 'disabled' : ''} inputmode="numeric" pattern="[0-9]*">
            <span class="goal-target" title="Goal for next workout">${goalTextHtml}</span>
            ${!isTemplate ? `<button class="set-complete-toggle" data-set-index="${setIndex}" title="Mark Set Complete" onclick="window.handleSetToggle(event)"></button>` : ''}
        </div>
    `;
}

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
