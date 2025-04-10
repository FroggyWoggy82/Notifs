document.addEventListener('DOMContentLoaded', function() {
    console.log('Exercise History JS loaded');

    // --- Debounce Helper ---
    function debounce(func, wait) {
        let timeout = null;
        const debounceId = Math.random().toString(36).substring(2, 7);

        return function executedFunction(...args) {
            const functionName = func.name || 'anonymous';
            const context = this;
            console.log(`[Debounce ${debounceId} | ${functionName}] Event triggered. Current timeout: ${timeout !== null}`);

            const later = () => {
                console.log(`[Debounce ${debounceId} | ${functionName}] -------> EXECUTING <-------`);
                timeout = null;
                func.apply(context, args);
            };

            if (timeout) {
                console.log(`[Debounce ${debounceId} | ${functionName}] Clearing existing timeout ID: ${timeout}`);
                clearTimeout(timeout);
            }

            timeout = setTimeout(later, wait);
            console.log(`[Debounce ${debounceId} | ${functionName}] Setting new timeout ID: ${timeout} for ${wait}ms`);
        };
    }

    // --- State Variables ---
    let availableExercises = []; // Populated from API
    let exerciseHistoryChart = null; // To hold the Chart.js instance
    let currentHistoryCategoryFilter = 'all'; // State for history category filter
    let currentHistoryExerciseId = null; // Store the currently selected exercise ID
    let currentHistoryExerciseName = null; // Store the name
    let historyEditSets = [{ reps: '', weight: '', unit: 'kg' }]; // For the edit modal

    // --- DOM Elements ---
    // History section elements
    const historyExerciseSearchInput = document.getElementById('history-exercise-search');
    const historySearchResultsEl = document.getElementById('history-search-results');
    const historyCategoryFilterSelect = document.getElementById('history-category-filter-select');
    const historyEditBtn = document.getElementById('history-edit-btn');
    const historyChartCanvas = document.getElementById('exercise-history-chart');

    // Debug DOM elements
    console.log('DOM Elements Check:');
    console.log('- historyExerciseSearchInput:', historyExerciseSearchInput);
    console.log('- historySearchResultsEl:', historySearchResultsEl);
    console.log('- historyCategoryFilterSelect:', historyCategoryFilterSelect);
    console.log('- historyEditBtn:', historyEditBtn);
    console.log('- historyChartCanvas:', historyChartCanvas);

    // History Edit Modal Elements
    const historyEditModal = document.getElementById('history-edit-modal');
    const historyEditForm = document.getElementById('history-edit-form');
    const historyEditExerciseNameEl = document.getElementById('history-edit-modal-title-name');
    const historyEditExerciseIdInput = document.getElementById('history-edit-exercise-id');
    const historyEditDateInput = document.getElementById('history-edit-date');
    const historyEditSetsContainer = document.getElementById('history-edit-sets-container');
    const historyEditAddSetBtn = document.getElementById('history-edit-add-set');
    const historyEditRemoveSetBtn = document.getElementById('history-edit-remove-set');
    const historyEditNotesInput = document.getElementById('history-edit-notes');
    const historyEditLogListEl = document.getElementById('history-edit-log-list');

    // --- Initialize ---
    function initialize() {
        // Load available exercises for search
        loadAvailableExercises();

        // Set up event listeners
        setupEventListeners();
    }

    // --- Event Listeners ---
    function setupEventListeners() {
        // History search input
        if (historyExerciseSearchInput) {
            historyExerciseSearchInput.addEventListener('input', debounce(handleHistorySearchInput, 300));
            historyExerciseSearchInput.addEventListener('focus', () => {
                if (historyExerciseSearchInput.value.trim().length > 0) {
                    handleHistorySearchInput({ target: historyExerciseSearchInput });
                }
            });
            // Close search results when clicking outside
            document.addEventListener('click', (e) => {
                if (!historyExerciseSearchInput.contains(e.target) && !historySearchResultsEl.contains(e.target)) {
                    historySearchResultsEl.style.display = 'none';
                }
            });

            // Direct search input submission on Enter key
            historyExerciseSearchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && historyExerciseSearchInput.value.trim().length > 0) {
                    // Find the first matching exercise
                    const searchTerm = historyExerciseSearchInput.value.trim().toLowerCase();
                    const matchingExercise = availableExercises.find(exercise =>
                        exercise.name.toLowerCase().includes(searchTerm));

                    if (matchingExercise) {
                        // Use the correct property name based on API response
                        const exerciseId = matchingExercise.exercise_id || matchingExercise.id;

                        console.log(`Enter key pressed - selecting exercise: ${matchingExercise.name}, ID: ${exerciseId}`);
                        handleHistorySearchResultClick(exerciseId, matchingExercise.name);
                    }
                }
            });
        }

        // History category filter
        if (historyCategoryFilterSelect) {
            historyCategoryFilterSelect.addEventListener('change', handleHistoryCategoryFilterChange);
        }

        // History edit button
        if (historyEditBtn) {
            historyEditBtn.addEventListener('click', showHistoryEditModal);
        }

        // History Edit Modal - Add/Remove Set buttons
        if (historyEditAddSetBtn) {
            historyEditAddSetBtn.addEventListener('click', () => {
                historyEditSets.push({ reps: '', weight: '', unit: 'kg' });
                renderHistoryEditSets();
            });
        }

        if (historyEditRemoveSetBtn) {
            historyEditRemoveSetBtn.addEventListener('click', () => {
                if (historyEditSets.length > 1) {
                    historyEditSets.pop();
                    renderHistoryEditSets();
                }
            });
        }

        // History Edit Form submission
        if (historyEditForm) {
            historyEditForm.addEventListener('submit', handleHistoryEditFormSubmit);
        }

        // History Edit Modal - Close button and click outside
        const historyEditModalCloseBtn = historyEditModal?.querySelector('.close-button');
        historyEditModalCloseBtn?.addEventListener('click', hideHistoryEditModal);
        historyEditModal?.addEventListener('click', (event) => {
            if (event.target === historyEditModal) hideHistoryEditModal();
        });

        // Event delegation for delete log buttons (added dynamically)
        if (historyEditLogListEl) {
            historyEditLogListEl.addEventListener('click', async (event) => {
                const deleteBtn = event.target.closest('.btn-delete-log-entry');
                if (!deleteBtn) return;

                const logId = deleteBtn.dataset.logId;
                if (!logId) return;

                if (confirm('Are you sure you want to delete this log entry? This cannot be undone.')) {
                    try {
                        const response = await fetch(`/api/workouts/logs/${logId}`, {
                            method: 'DELETE'
                        });

                        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                        // Remove the log item from the DOM
                        const logItem = deleteBtn.closest('.log-item');
                        if (logItem) logItem.remove();

                        // Refresh the chart
                        if (currentHistoryExerciseId) {
                            fetchAndRenderHistoryChart(currentHistoryExerciseId);
                        }

                        // Show success message
                        alert('Log entry deleted successfully.');
                    } catch (error) {
                        console.error('Error deleting log entry:', error);
                        alert(`Failed to delete log entry: ${error.message}`);
                    }
                }
            });
        }
    }

    // --- API Functions ---
    async function loadAvailableExercises() {
        try {
            const response = await fetch('/api/workouts/exercises');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            availableExercises = await response.json();
            console.log(`Loaded ${availableExercises.length} exercises`);

            // Debug: Log the first few exercises to check their structure
            if (availableExercises.length > 0) {
                console.log('Sample exercise data structure:', availableExercises.slice(0, 3));
            }
        } catch (error) {
            console.error('Error loading exercises:', error);
        }
    }

    // --- Event Handlers ---
    function handleHistorySearchInput(event) {
        const searchTerm = event.target.value.trim().toLowerCase();

        if (searchTerm.length < 1) {
            historySearchResultsEl.innerHTML = '';
            historySearchResultsEl.style.display = 'none';
            return;
        }

        // Filter exercises based on search term and category filter
        const filteredExercises = availableExercises.filter(exercise => {
            const matchesSearch = exercise.name.toLowerCase().includes(searchTerm);
            const matchesCategory = currentHistoryCategoryFilter === 'all' || exercise.category === currentHistoryCategoryFilter;
            return matchesSearch && matchesCategory;
        });

        // Render search results
        historySearchResultsEl.innerHTML = '';

        if (filteredExercises.length === 0) {
            historySearchResultsEl.innerHTML = '<div class="search-result-item">No matching exercises found</div>';
        } else {
            filteredExercises.forEach(exercise => {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';
                resultItem.textContent = exercise.name;

                // Use the correct property name based on API response
                const exerciseId = exercise.exercise_id || exercise.id;

                resultItem.dataset.exerciseId = exerciseId;
                resultItem.dataset.exerciseName = exercise.name;

                // Log the exercise data for debugging
                console.log(`Creating search result for: ${exercise.name}, ID: ${exerciseId}`);

                resultItem.addEventListener('click', () => handleHistorySearchResultClick(exerciseId, exercise.name));
                historySearchResultsEl.appendChild(resultItem);
            });
        }

        historySearchResultsEl.style.display = 'block';
    }

    function handleHistoryCategoryFilterChange(event) {
        currentHistoryCategoryFilter = event.target.value;
        console.log(`Category filter changed to: ${currentHistoryCategoryFilter}`);

        // If there's an active search, re-trigger it with the new filter
        if (historyExerciseSearchInput.value.trim().length > 0) {
            handleHistorySearchInput({ target: historyExerciseSearchInput });
        }
    }

    function handleHistorySearchResultClick(selectedId, selectedName) {
        console.log(`Result clicked and processed: ID=${selectedId}, Name=${selectedName}`);

        // Validate the exercise ID
        if (!selectedId || isNaN(parseInt(selectedId))) {
            console.error(`Invalid exercise ID: ${selectedId}`);

            // Try to find the exercise by name as a fallback
            if (selectedName) {
                const matchingExercise = availableExercises.find(ex =>
                    ex.name.toLowerCase() === selectedName.toLowerCase());

                if (matchingExercise && matchingExercise.exercise_id) {
                    console.log(`Found exercise by name: ${matchingExercise.name} with ID: ${matchingExercise.exercise_id}`);
                    selectedId = matchingExercise.exercise_id;
                } else {
                    console.error(`Could not find exercise with name: ${selectedName}`);
                    return;
                }
            } else {
                console.error('No exercise name provided');
                return;
            }
        }

        // Ensure ID is an integer
        const exerciseId = parseInt(selectedId);
        console.log(`Using exercise ID: ${exerciseId}`);

        historyExerciseSearchInput.value = selectedName;
        historySearchResultsEl.innerHTML = '';
        historySearchResultsEl.style.display = 'none';

        fetchAndRenderHistoryChart(exerciseId);

        // Store selected exercise and show Edit button
        currentHistoryExerciseId = exerciseId;
        currentHistoryExerciseName = selectedName;
        historyEditBtn.style.display = 'inline-block';
    }

    async function handleHistoryEditFormSubmit(event) {
        event.preventDefault();

        const submitButton = historyEditForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Saving...';

        // Gather form data
        const exerciseId = parseInt(historyEditExerciseIdInput.value);
        const datePerformed = historyEditDateInput.value;
        const notes = historyEditNotesInput.value;

        // Gather sets data
        const setsData = [];
        const setRows = historyEditSetsContainer.querySelectorAll('.history-edit-set-row');

        setRows.forEach(row => {
            const weightInput = row.querySelector('.history-edit-weight');
            const repsInput = row.querySelector('.history-edit-reps');
            const unitSelect = row.querySelector('.history-edit-unit');

            if (weightInput && repsInput && unitSelect) {
                const weight = parseFloat(weightInput.value);
                const reps = parseInt(repsInput.value);
                const unit = unitSelect.value;

                if (!isNaN(weight) && !isNaN(reps)) {
                    setsData.push({ weight, reps, unit });
                }
            }
        });

        if (setsData.length === 0) {
            alert('Please add at least one valid set with weight and reps.');
            submitButton.disabled = false;
            submitButton.textContent = 'Save New Entry';
            return;
        }

        // Prepare log data
        const logData = {
            exercise_id: exerciseId,
            date_performed: datePerformed,
            notes: notes,
            sets: setsData
        };

        try {
            const response = await fetch('/api/workouts/logs/manual', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(logData)
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const result = await response.json();
            console.log('New past log saved:', result);

            // Refresh the existing logs list in the modal
            fetchAndRenderExistingLogs(logData.exercise_id);

            // Refresh the history chart
            fetchAndRenderHistoryChart(logData.exercise_id);

            // Clear the add form
            historyEditForm.reset();
            historyEditSets = [{ reps: '', weight: '', unit: 'kg' }];
            renderHistoryEditSets();
            historyEditDateInput.valueAsDate = new Date();

        } catch (error) {
            console.error('Error saving new past log:', error);
            alert(`Failed to save new past log: ${error.message}`);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Save New Entry';
        }
    }

    // --- 1RM Calculation Function ---
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

    // --- History Chart Functions ---
    async function fetchAndRenderHistoryChart(exerciseId) {
        // Get the history message element
        const historyMessageEl = document.getElementById('history-message');

        if (!historyMessageEl) {
            console.error("History message element not found!");
            return;
        }

        historyMessageEl.textContent = ''; // Clear previous messages
        console.log(`fetchAndRenderHistoryChart called for ID: ${exerciseId}`);

        if (!exerciseId) {
            historyMessageEl.textContent = 'Please select an exercise to view its history.';
            console.warn("fetchAndRenderHistoryChart - No exercise ID provided.");
            return;
        }

        historyMessageEl.textContent = 'Loading history...';

        try {
            const response = await fetch(`/api/workouts/exercises/${exerciseId}/history`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const historyData = await response.json();
            console.log("Raw History Data Received:", JSON.stringify(historyData));

            if (historyData.length === 0) {
                historyMessageEl.textContent = 'No logged history found for this exercise.';
                if (exerciseHistoryChart) {
                    exerciseHistoryChart.destroy();
                    exerciseHistoryChart = null;
                }
                return;
            }

            // Process data for chart
            console.log("Processing history data:", historyData);

            const processedData = historyData.map(log => {
                console.log("Processing log entry:", log);

                // Parse the comma-separated strings into arrays
                const reps = log.reps_completed ? log.reps_completed.split(',').map(Number) : [];
                const weights = log.weight_used ? log.weight_used.split(',').map(Number) : [];
                const unit = log.weight_unit || 'kg';

                console.log("Parsed values:", { reps, weights, unit });

                // Calculate total volume (weight * reps) for each set
                let totalVolume = 0;
                let maxOneRepMax = 0;
                let bestSet = { weight: 0, reps: 0 };
                let bestSetVolume = 0;

                for (let i = 0; i < Math.min(reps.length, weights.length); i++) {
                    const setVolume = reps[i] * weights[i];
                    totalVolume += setVolume;

                    // Track the best set (highest volume)
                    if (setVolume > bestSetVolume) {
                        bestSetVolume = setVolume;
                        bestSet = { weight: weights[i], reps: reps[i] };
                    }

                    // Calculate 1RM for each set and keep the highest value
                    const setOneRepMax = calculate1RM(weights[i], reps[i]);
                    if (setOneRepMax > maxOneRepMax) {
                        maxOneRepMax = setOneRepMax;
                    }
                }

                console.log("Calculated volume:", totalVolume);
                console.log("Calculated max 1RM:", maxOneRepMax);
                console.log("Best set:", bestSet);

                return {
                    date: new Date(log.date_performed),
                    volume: totalVolume,
                    oneRepMax: maxOneRepMax,
                    bestSet: bestSet,
                    unit: unit
                };
            });

            // Sort by date
            processedData.sort((a, b) => a.date - b.date);
            console.log("Sorted processed data:", processedData);

            // Format dates and extract volumes and 1RM for chart
            const labels = processedData.map(item => item.date.toLocaleDateString());
            const volumes = processedData.map(item => item.volume);
            const oneRepMaxes = processedData.map(item => item.oneRepMax);

            if (labels.length === 0 || volumes.length === 0) {
                console.warn("No valid data points for chart");
                historyMessageEl.textContent = 'No valid data points found for this exercise.';
                return;
            }

            console.log("Data for Chart - Labels:", labels);
            console.log("Data for Chart - Volumes:", volumes);
            console.log("Data for Chart - 1RM:", oneRepMaxes);

            // Render the chart with just the volume data
            renderHistoryChart(labels, volumes, oneRepMaxes, processedData, 'Volume (Weight * Reps)', '1RM (Estimated)');

            // Clear any message
            historyMessageEl.textContent = '';

        } catch (error) {
            console.error('Error fetching or processing exercise history:', error);

            // Display error message
            historyMessageEl.textContent = `Error loading history: ${error.message}`;

            if (exerciseHistoryChart) {
                exerciseHistoryChart.destroy();
                exerciseHistoryChart = null;
            }
        }
    }

    function renderHistoryChart(labels, volumeData, oneRepMaxData, processedData, volumeLabel = 'Volume', oneRepMaxLabel = '1RM') {
        console.log("renderHistoryChart called with:", { labels, volumeData, oneRepMaxData, processedData, volumeLabel, oneRepMaxLabel });

        if (!historyChartCanvas) {
            console.error("ERROR: historyChartCanvas is null or undefined!");
            return;
        }

        // Update the stats section with the latest data
        updateStatsSection(processedData);

        try {
            const ctx = historyChartCanvas.getContext('2d');
            console.log("Canvas context obtained:", ctx);
            console.log("Rendering chart with Labels:", labels, "Volume Data:", volumeData);

            // Destroy existing chart before creating new one
            if (exerciseHistoryChart) {
                console.log("Destroying existing chart instance.");
                exerciseHistoryChart.destroy();
                exerciseHistoryChart = null;
            } else {
                console.log("No existing chart instance to destroy.");
            }

            // Create new chart with only the volume dataset
            exerciseHistoryChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: volumeLabel,
                            data: volumeData,
                            borderColor: '#4CAF50', // Green line
                            backgroundColor: 'rgba(76, 175, 80, 0.1)', // Light green fill
                            borderWidth: 2,
                            pointBackgroundColor: '#4CAF50',
                            pointRadius: 4,
                            tension: 0.1,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#ddd'
                            },
                            title: {
                                display: true,
                                text: volumeLabel,
                                color: '#4CAF50'
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#ddd',
                                maxRotation: 45,
                                minRotation: 45
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: '#ddd'
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: '#555',
                            borderWidth: 1,
                            padding: 10,
                            displayColors: true,
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }

                                    // Different display for volume vs 1RM
                                    if (context.parsed.y !== null) {
                                        if (context.datasetIndex === 0) { // Volume dataset
                                            // Show best set as weight×reps
                                            const dataPoint = processedData[context.dataIndex];
                                            if (dataPoint && dataPoint.bestSet) {
                                                const weight = dataPoint.bestSet.weight;
                                                const reps = dataPoint.bestSet.reps;
                                                const unit = dataPoint.unit;
                                                label = `Best set: ${weight}${unit} × ${reps}`;
                                            } else {
                                                label += context.parsed.y;
                                            }
                                        } else { // 1RM dataset
                                            const dataPoint = processedData[context.dataIndex];
                                            const unit = dataPoint ? dataPoint.unit : '';
                                            label += `${context.parsed.y} ${unit}`;
                                        }
                                    }
                                    return label;
                                }
                            }
                        }
                    }
                }
            });
            console.log("Chart instance created successfully with volume and 1RM data.");
        } catch (chartError) {
            console.error("Error creating Chart.js instance:", chartError);

            // Display error message
            const historyMessageEl = document.getElementById('history-message');
            if (historyMessageEl) {
                historyMessageEl.textContent = `Error rendering chart: ${chartError.message}`;
            }
        }
    }

    // Function to update the stats section with the latest data
    function updateStatsSection(processedData) {
        if (!processedData || processedData.length === 0) {
            console.warn("No data available to update stats section");
            return;
        }

        // Get the most recent data point
        const latestData = processedData[processedData.length - 1];

        // Find the best set (highest 1RM) across all data points
        let bestSet = null;
        let highestOneRepMax = 0;

        processedData.forEach(dataPoint => {
            if (dataPoint.oneRepMax > highestOneRepMax) {
                highestOneRepMax = dataPoint.oneRepMax;
                bestSet = dataPoint.bestSet;
            }
        });

        // Update the 1RM display
        const oneRepMaxEl = document.getElementById('one-rep-max');
        const bestSetInfoEl = document.getElementById('best-set-info');
        const bestSetEl = document.getElementById('best-set');

        if (oneRepMaxEl && bestSetInfoEl && bestSetEl) {
            if (highestOneRepMax > 0 && bestSet) {
                // Format the 1RM value
                oneRepMaxEl.textContent = `${Math.round(highestOneRepMax)} ${latestData.unit}`;

                // Show which set was used to calculate the 1RM
                bestSetInfoEl.textContent = `Based on best set: ${bestSet.weight}${latestData.unit} × ${bestSet.reps}`;

                // Show the best set details
                bestSetEl.textContent = `${bestSet.weight}${latestData.unit} × ${bestSet.reps} reps on ${new Date(bestSet.date).toLocaleDateString()}`;
            } else {
                oneRepMaxEl.textContent = '--';
                bestSetInfoEl.textContent = 'No data available';
                bestSetEl.textContent = '--';
            }
        } else {
            console.error("Could not find stats elements in the DOM");
        }
    }

    // --- History Edit Modal Functions ---
    function showHistoryEditModal() {
        if (!currentHistoryExerciseId || !currentHistoryExerciseName) {
            alert('Please select an exercise from the search first.');
            return;
        }

        // Pre-fill modal add section
        historyEditExerciseNameEl.textContent = currentHistoryExerciseName;
        historyEditExerciseIdInput.value = currentHistoryExerciseId;
        historyEditForm.reset(); // Clear previous add form entries
        historyEditDateInput.valueAsDate = new Date(); // Default to today

        // Reset and render initial set row for adding
        historyEditSets = [{ reps: '', weight: '', unit: 'kg' }];
        renderHistoryEditSets();

        // Fetch and display existing logs
        fetchAndRenderExistingLogs(currentHistoryExerciseId);

        historyEditModal.style.display = 'block';
    }

    function hideHistoryEditModal() {
        if (historyEditModal) historyEditModal.style.display = 'none';
    }

    function renderHistoryEditSets() {
        historyEditSetsContainer.innerHTML = '';
        historyEditSets.forEach((set, index) => {
            const setRow = document.createElement('div');
            setRow.className = 'set-row history-edit-set-row';
            setRow.dataset.setIndex = index;
            setRow.innerHTML = `
                <span class="set-number">${index + 1}</span>
                <!-- Weight input group first -->
                <div class="weight-input-group">
                    <input type="number" class="weight-input history-edit-weight" placeholder="Wt" value="${set.weight}" step="0.5">
                    <select class="unit-select history-edit-unit">
                        <option value="kg" ${set.unit === 'kg' ? 'selected' : ''}>kg</option>
                        <option value="lbs" ${set.unit === 'lbs' ? 'selected' : ''}>lbs</option>
                        <option value="bw" ${set.unit === 'bw' ? 'selected' : ''}>bw</option>
                    </select>
                </div>
                <!-- Reps input group second -->
                <div class="reps-input-group">
                    <input type="number" class="reps-input history-edit-reps" placeholder="Reps" value="${set.reps}">
                </div>
            `;
            historyEditSetsContainer.appendChild(setRow);
        });

        // Update button states
        historyEditRemoveSetBtn.disabled = historyEditSets.length <= 1;
    }

    async function fetchAndRenderExistingLogs(exerciseId) {
        if (!exerciseId || !historyEditLogListEl) return;

        historyEditLogListEl.innerHTML = '<p>Loading existing logs...</p>';

        try {
            const response = await fetch(`/api/workouts/exercises/${exerciseId}/history`);
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
                // Parse the comma-separated strings into arrays
                const reps = log.reps_completed ? log.reps_completed.split(',').map(Number) : [];
                const weights = log.weight_used ? log.weight_used.split(',').map(Number) : [];
                const unit = log.weight_unit || 'kg';

                // Create a summary string
                let summary = '';
                for (let i = 0; i < Math.min(reps.length, weights.length); i++) {
                    if (i > 0) summary += ' | ';
                    summary += `${weights[i]}${unit} × ${reps[i]}`;
                }

                const logItem = document.createElement('div');
                logItem.className = 'log-item';
                logItem.innerHTML = `
                    <div class="log-item-details">
                        <span class="log-item-date">${new Date(log.date_performed).toLocaleDateString()}</span>
                        <span class="log-item-summary">${summary}</span>
                    </div>
                    <button class="btn-delete-log-entry btn-danger btn-tiny" data-log-id="${log.workout_log_id}" title="Delete this log entry">&times;</button>
                `;

                historyEditLogListEl.appendChild(logItem);
            });

        } catch (error) {
            console.error('Error fetching existing logs:', error);
            historyEditLogListEl.innerHTML = '<p style="color: red;">Error loading logs.</p>';
        }
    }

    // Initialize the page
    initialize();
});
