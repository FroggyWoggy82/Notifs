document.addEventListener('DOMContentLoaded', function() {
    console.log('Exercise History JS loaded');

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

    let availableExercises = []; // Populated from API
    let exerciseHistoryChart = null; // To hold the Chart.js instance
    let currentHistoryCategoryFilter = 'all'; // State for history category filter
    let currentHistoryExerciseId = null; // Store the currently selected exercise ID
    let currentHistoryExerciseName = null; // Store the name
    let historyEditSets = [{ reps: '', weight: '', unit: 'lbs' }]; // For the edit modal
    let currentHistoryData = []; // Store the raw history data for tooltip access


    const historyExerciseSearchInput = document.getElementById('history-exercise-search');
    const historySearchResultsEl = document.getElementById('history-search-results');
    const historyCategoryFilterSelect = document.getElementById('history-category-filter-select');
    const historyEditBtn = document.getElementById('history-edit-btn');
    const historyChartCanvas = document.getElementById('exercise-history-chart');

    console.log('DOM Elements Check:');
    console.log('- historyExerciseSearchInput:', historyExerciseSearchInput);
    console.log('- historySearchResultsEl:', historySearchResultsEl);
    console.log('- historyCategoryFilterSelect:', historyCategoryFilterSelect);
    console.log('- historyEditBtn:', historyEditBtn);
    console.log('- historyChartCanvas:', historyChartCanvas);

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

    function initialize() {

        loadAvailableExercises();

        setupEventListeners();
    }

    function setupEventListeners() {

        if (historyExerciseSearchInput) {
            historyExerciseSearchInput.addEventListener('input', debounce(handleHistorySearchInput, 300));
            historyExerciseSearchInput.addEventListener('focus', () => {
                if (historyExerciseSearchInput.value.trim().length > 0) {
                    handleHistorySearchInput({ target: historyExerciseSearchInput });
                }
            });

            document.addEventListener('click', (e) => {
                if (!historyExerciseSearchInput.contains(e.target) && !historySearchResultsEl.contains(e.target)) {
                    historySearchResultsEl.style.display = 'none';
                }
            });

            historyExerciseSearchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && historyExerciseSearchInput.value.trim().length > 0) {

                    const searchTerm = historyExerciseSearchInput.value.trim().toLowerCase();
                    const matchingExercise = availableExercises.find(exercise =>
                        exercise.name.toLowerCase().includes(searchTerm));

                    if (matchingExercise) {

                        const exerciseId = matchingExercise.exercise_id || matchingExercise.id;

                        console.log(`Enter key pressed - selecting exercise: ${matchingExercise.name}, ID: ${exerciseId}`);
                        handleHistorySearchResultClick(exerciseId, matchingExercise.name);
                    }
                }
            });
        }

        if (historyCategoryFilterSelect) {
            historyCategoryFilterSelect.addEventListener('change', handleHistoryCategoryFilterChange);
        }

        if (historyEditBtn) {
            historyEditBtn.addEventListener('click', showHistoryEditModal);
        }

        if (historyEditAddSetBtn) {
            historyEditAddSetBtn.addEventListener('click', () => {
                historyEditSets.push({ reps: '', weight: '', unit: 'lbs' });
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

        if (historyEditForm) {
            historyEditForm.addEventListener('submit', handleHistoryEditFormSubmit);
        }

        const historyEditModalCloseBtn = historyEditModal?.querySelector('.close-button');
        historyEditModalCloseBtn?.addEventListener('click', hideHistoryEditModal);
        historyEditModal?.addEventListener('click', (event) => {
            if (event.target === historyEditModal) hideHistoryEditModal();
        });

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

                        const logItem = deleteBtn.closest('.log-item');
                        if (logItem) logItem.remove();

                        if (currentHistoryExerciseId) {
                            fetchAndRenderHistoryChart(currentHistoryExerciseId);
                        }

                        alert('Log entry deleted successfully.');
                    } catch (error) {
                        console.error('Error deleting log entry:', error);
                        alert(`Failed to delete log entry: ${error.message}`);
                    }
                }
            });
        }
    }

    async function loadAvailableExercises() {
        try {

            if (historySearchResultsEl && historySearchResultsEl.style.display === 'block') {
                historySearchResultsEl.innerHTML = '<div class="search-result-item">Loading exercises...</div>';
            }

            const response = await fetch('/api/workouts/exercises');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();

            if (!data || !Array.isArray(data)) {
                throw new Error('Invalid exercise data received from server');
            }

            availableExercises = data;
            console.log(`Loaded ${availableExercises.length} exercises`);

            if (availableExercises.length > 0) {
                console.log('Sample exercise data structure:', availableExercises.slice(0, 3));
            }

            return availableExercises;
        } catch (error) {
            console.error('Error loading exercises:', error);

            if (historySearchResultsEl && historySearchResultsEl.style.display === 'block') {
                historySearchResultsEl.innerHTML = '<div class="search-result-item">Error loading exercises. Please refresh the page.</div>';
            }

            return [];
        }
    }

    function handleHistorySearchInput(event) {
        try {
            if (!event || !event.target) {
                console.error('Invalid event object in handleHistorySearchInput');
                return;
            }

            const searchTerm = event.target.value.trim().toLowerCase();

            if (searchTerm.length < 1) {
                historySearchResultsEl.innerHTML = '';
                historySearchResultsEl.style.display = 'none';
                return;
            }

            if (!availableExercises || !Array.isArray(availableExercises) || availableExercises.length === 0) {
                console.warn('No exercises available for search. Attempting to reload...');

                loadAvailableExercises().then(() => {

                    if (availableExercises && availableExercises.length > 0) {
                        handleHistorySearchInput(event);
                    } else {
                        historySearchResultsEl.innerHTML = '<div class="search-result-item">Error loading exercises. Please refresh the page.</div>';
                        historySearchResultsEl.style.display = 'block';
                    }
                });
                return;
            }

            const filteredExercises = availableExercises.filter(exercise => {
                if (!exercise || !exercise.name) return false;
                const matchesSearch = exercise.name.toLowerCase().includes(searchTerm);
                const matchesCategory = currentHistoryCategoryFilter === 'all' || exercise.category === currentHistoryCategoryFilter;
                return matchesSearch && matchesCategory;
            });

            historySearchResultsEl.innerHTML = '';

            if (filteredExercises.length === 0) {
                historySearchResultsEl.innerHTML = '<div class="search-result-item">No matching exercises found</div>';
            } else {
                filteredExercises.forEach(exercise => {
                    const resultItem = document.createElement('div');
                    resultItem.className = 'search-result-item';
                    resultItem.textContent = exercise.name;

                    const exerciseId = exercise.exercise_id || exercise.id;

                    resultItem.dataset.exerciseId = exerciseId;
                    resultItem.dataset.exerciseName = exercise.name;

                    console.log(`Creating search result for: ${exercise.name}, ID: ${exerciseId}`);

                    resultItem.addEventListener('click', () => handleHistorySearchResultClick(exerciseId, exercise.name));
                    historySearchResultsEl.appendChild(resultItem);
                });
            }

            historySearchResultsEl.style.display = 'block';
        } catch (error) {
            console.error('Error in handleHistorySearchInput:', error);
            historySearchResultsEl.innerHTML = '<div class="search-result-item">An error occurred. Please try again.</div>';
            historySearchResultsEl.style.display = 'block';
        }
    }

    function handleHistoryCategoryFilterChange(event) {
        currentHistoryCategoryFilter = event.target.value;
        console.log(`Category filter changed to: ${currentHistoryCategoryFilter}`);

        if (historyExerciseSearchInput.value.trim().length > 0) {
            handleHistorySearchInput({ target: historyExerciseSearchInput });
        }
    }

    function handleHistorySearchResultClick(selectedId, selectedName) {
        console.log(`Result clicked and processed: ID=${selectedId}, Name=${selectedName}`);

        if (!selectedId || isNaN(parseInt(selectedId))) {
            console.error(`Invalid exercise ID: ${selectedId}`);

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

        const exerciseId = parseInt(selectedId);
        console.log(`Using exercise ID: ${exerciseId}`);

        historyExerciseSearchInput.value = selectedName;
        historySearchResultsEl.innerHTML = '';
        historySearchResultsEl.style.display = 'none';

        const tableContainer = document.getElementById('prediction-table-container');
        if (tableContainer) {
            tableContainer.style.display = 'none';
        }

        fetchAndRenderHistoryChart(exerciseId);

        currentHistoryExerciseId = exerciseId;
        currentHistoryExerciseName = selectedName;
        historyEditBtn.style.display = 'inline-block';
    }

    async function handleHistoryEditFormSubmit(event) {
        event.preventDefault();

        const submitButton = historyEditForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Saving...';

        const exerciseId = parseInt(historyEditExerciseIdInput.value);
        const datePerformed = historyEditDateInput.value;
        const notes = historyEditNotesInput.value;

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

            fetchAndRenderExistingLogs(logData.exercise_id);

            fetchAndRenderHistoryChart(logData.exercise_id);

            historyEditForm.reset();
            historyEditSets = [{ reps: '', weight: '', unit: 'lbs' }];
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

    function convertWeight(weight, fromUnit, toUnit) {
        if (fromUnit === toUnit) return weight;

        if (fromUnit === 'kg' && toUnit === 'lbs') {
            return weight * 2.20462;
        }

        if (fromUnit === 'lbs' && toUnit === 'kg') {
            return weight / 2.20462;
        }

        return weight;
    }

    function calculate1RM(weight, reps, unit) {

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

    function generatePredictionTable(oneRepMax, bestSet, unit, historyData) {
        console.log('Generating prediction table with 1RM:', oneRepMax, 'Best set:', bestSet, 'Unit:', unit);

        const tableContainer = document.getElementById('prediction-table-container');
        const tableBody = document.getElementById('prediction-table-body');
        const bestSetInfo = document.getElementById('best-set-info');

        if (!tableContainer || !tableBody || !bestSetInfo) {
            console.error('Prediction table elements not found');
            return;
        }

        tableContainer.style.display = 'block';

        bestSetInfo.textContent = `${bestSet.weight} ${unit} × ${bestSet.reps} reps`;

        tableBody.innerHTML = '';

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

        const historySets = [];
        if (historyData && historyData.length > 0) {
            historyData.forEach(log => {

                const reps = log.reps_completed ? log.reps_completed.split(',').map(Number) : [];
                const weights = log.weight_used ? log.weight_used.split(',').map(Number) : [];
                const logUnit = log.weight_unit || 'kg';

                for (let i = 0; i < Math.min(reps.length, weights.length); i++) {
                    if (isNaN(reps[i]) || isNaN(weights[i])) continue;

                    let convertedWeight = weights[i];
                    if (logUnit !== unit) {
                        convertedWeight = convertWeight(weights[i], logUnit, unit);
                    }

                    historySets.push({
                        reps: reps[i],
                        weight: convertedWeight,
                        originalWeight: weights[i],
                        originalUnit: logUnit
                    });
                }
            });
        }

        console.log('History sets for comparison (converted to display unit):', historySets);

        const actualWeightsByReps = {};
        const actualSetsByReps = {}; // Store the full set info for each rep count

        historySets.forEach(set => {
            const reps = set.reps;
            const weight = set.weight;

            if (!actualWeightsByReps[reps] || weight > actualWeightsByReps[reps]) {
                actualWeightsByReps[reps] = weight;
                actualSetsByReps[reps] = set; // Store the full set info
            }
        });

        console.log('Actual weights by rep count (converted to display unit):', actualWeightsByReps);

        for (let reps = 1; reps <= 30; reps++) {
            const percentage = percentages[reps];

            let predictedWeight = oneRepMax * (percentage / 100);
            let roundedPredictedWeight = Math.floor(predictedWeight / 5) * 5; // Round down to nearest 5

            let isActual = false;
            let actualSet = null;

            if (actualWeightsByReps[reps]) {
                isActual = true;
                actualSet = actualSetsByReps[reps];
            }

            const row = document.createElement('tr');

            if (isActual) {
                row.classList.add('achieved');
            }

            const isBestSet = (reps === bestSet.reps &&
                               ((actualWeightsByReps[reps] && Math.abs(actualWeightsByReps[reps] - bestSet.weight) < 0.1) ||
                                Math.abs(roundedPredictedWeight - bestSet.weight) < 0.1));


            const showCheckmark = isActual && !isBestSet;

            const bestSetIndicator = isBestSet ? ' ✓' : '';

            const bestAchievedWeight = actualWeightsByReps[reps] || null;

            row.innerHTML = `
                <td>${reps}${showCheckmark ? ' ✓' : ''}${bestSetIndicator}</td>
                <td>${Math.round(roundedPredictedWeight)} ${unit}</td>
                <td>${bestAchievedWeight ? `${Math.round(bestAchievedWeight)} ${unit}` : '-'}</td>
                <td>${percentage}%</td>
            `;

            tableBody.appendChild(row);
        }
    }

    async function fetchAndRenderHistoryChart(exerciseId) {

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

            currentHistoryData = historyData;

            if (historyData.length === 0) {
                historyMessageEl.textContent = 'No logged history found for this exercise.';
                if (exerciseHistoryChart) {
                    exerciseHistoryChart.destroy();
                    exerciseHistoryChart = null;
                }

                const tableContainer = document.getElementById('prediction-table-container');
                if (tableContainer) {
                    tableContainer.style.display = 'none';
                }

                return;
            }

            console.log("Processing history data:", historyData);

            const processedData = historyData.map(log => {
                console.log("Processing log entry:", log);

                const reps = log.reps_completed ? log.reps_completed.split(',').map(Number) : [];
                const weights = log.weight_used ? log.weight_used.split(',').map(Number) : [];
                const unit = log.weight_unit || 'kg';

                console.log("Parsed values:", { reps, weights, unit });

                let totalVolume = 0;
                let maxOneRepMax = 0;
                let bestSet = { weight: 0, reps: 0 };
                let bestSetVolume = 0;

                for (let i = 0; i < Math.min(reps.length, weights.length); i++) {

                    if (isNaN(reps[i]) || isNaN(weights[i])) continue;

                    const setVolume = reps[i] * weights[i];
                    totalVolume += setVolume;

                    if (setVolume > bestSetVolume) {
                        bestSetVolume = setVolume;
                        bestSet = { weight: weights[i], reps: reps[i], unit: unit };
                    }


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

            processedData.sort((a, b) => a.date - b.date);
            console.log("Sorted processed data:", processedData);

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

            const latestOneRepMax = oneRepMaxes[oneRepMaxes.length - 1];
            const unit = processedData[processedData.length - 1].unit;
            const latestBestSet = processedData[processedData.length - 1].bestSet;

            let message = '';
            if (latestOneRepMax > 0) {
                message = `Estimated 1RM: ${latestOneRepMax} ${unit}`;
            }

            renderHistoryChart(labels, volumes, oneRepMaxes, processedData, 'Volume (Weight * Reps)', '1RM (Estimated)');

            historyMessageEl.textContent = message;

            if (latestOneRepMax > 0 && latestBestSet) {
                generatePredictionTable(latestOneRepMax, latestBestSet, unit, historyData);
            }

        } catch (error) {
            console.error('Error fetching or processing exercise history:', error);

            historyMessageEl.textContent = `Error loading history: ${error.message}`;

            if (exerciseHistoryChart) {
                exerciseHistoryChart.destroy();
                exerciseHistoryChart = null;
            }

            const tableContainer = document.getElementById('prediction-table-container');
            if (tableContainer) {
                tableContainer.style.display = 'none';
            }
        }
    }


    function renderHistoryChart(labels, volumeData, oneRepMaxData, processedData, volumeLabel = 'Volume', oneRepMaxLabel = '1RM') {
        console.log("renderHistoryChart called with:", { labels, volumeData, oneRepMaxData, processedData, volumeLabel, oneRepMaxLabel });

        if (!historyChartCanvas) {
            console.error("ERROR: historyChartCanvas is null or undefined!");
            return;
        }

        try {
            const ctx = historyChartCanvas.getContext('2d');
            console.log("Canvas context obtained:", ctx);
            console.log("Rendering chart with Labels:", labels, "Volume Data:", volumeData, "1RM Data:", oneRepMaxData);

            if (exerciseHistoryChart) {
                console.log("Destroying existing chart instance.");
                exerciseHistoryChart.destroy();
                exerciseHistoryChart = null;
            } else {
                console.log("No existing chart instance to destroy.");
            }

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
                            fill: true,
                            yAxisID: 'y'
                        }

                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#ddd'
                            },
                            title: {
                                display: true,
                                text: `${volumeLabel} (${processedData[0]?.unit || 'kg'})`,
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
                            footerColor: '#fff',
                            borderColor: '#555',
                            borderWidth: 1,
                            padding: 10,
                            displayColors: false, // Hide color boxes
                            bodySpacing: 6, // Add more space between lines
                            footerSpacing: 0, // No extra space before footer
                            footerMarginTop: 6, // Small margin above footer
                            bodyFont: {
                                family: 'monospace' // Use monospace font for better alignment
                            },
                            footerFont: {
                                family: 'monospace', // Use monospace font for better alignment
                                weight: 'normal' // Don't make footer bold
                            },
                            callbacks: {
                                title: function(tooltipItems) {

                                    if (tooltipItems.length > 0) {
                                        const dataIndex = tooltipItems[0].dataIndex;
                                        const dataPoint = processedData[dataIndex];
                                        if (dataPoint && dataPoint.date) {
                                            return new Date(dataPoint.date).toLocaleDateString();
                                        }
                                    }
                                    return '';
                                },
                                label: function(context) {
                                    try {

                                        return '';
                                    } catch (error) {
                                        console.error('Error in tooltip callback:', error);
                                        return '';
                                    }
                                },
                                footer: function(tooltipItems) {
                                    try {
                                        if (tooltipItems.length === 0) return '';

                                        const dataIndex = tooltipItems[0].dataIndex;
                                        const dataPoint = processedData[dataIndex];

                                        if (!dataPoint) return '';

                                        const logDate = new Date(dataPoint.date).toLocaleDateString();

                                        let matchingLog = null;
                                        if (currentHistoryData && Array.isArray(currentHistoryData)) {
                                            matchingLog = currentHistoryData.find(log => {
                                                if (!log.date_performed) return false;
                                                return new Date(log.date_performed).toLocaleDateString() === logDate;
                                            });
                                        }

                                        if (!matchingLog) return 'No set data available';

                                        const reps = matchingLog.reps_completed ? matchingLog.reps_completed.split(',').map(Number) : [];
                                        const weights = matchingLog.weight_used ? matchingLog.weight_used.split(',').map(Number) : [];
                                        const unit = matchingLog.weight_unit || 'kg';

                                        if (reps.length === 0 || weights.length === 0) return 'No set data available';

                                        let allTimeBestSet = { weight: 0, reps: 0, volume: 0 };

                                        if (currentHistoryData && Array.isArray(currentHistoryData)) {
                                            currentHistoryData.forEach(log => {
                                            const logReps = log.reps_completed ? log.reps_completed.split(',').map(Number) : [];
                                            const logWeights = log.weight_used ? log.weight_used.split(',').map(Number) : [];

                                            for (let i = 0; i < Math.min(logReps.length, logWeights.length); i++) {
                                                if (isNaN(logReps[i]) || isNaN(logWeights[i])) continue;

                                                const setVolume = logReps[i] * logWeights[i];
                                                if (setVolume > allTimeBestSet.volume) {
                                                    allTimeBestSet = {
                                                        weight: logWeights[i],
                                                        reps: logReps[i],
                                                        volume: setVolume
                                                    };
                                                }
                                            }
                                        });
                                        }

                                        const setStrings = [];

                                        for (let i = 0; i < Math.min(reps.length, weights.length); i++) {
                                            if (isNaN(reps[i]) || isNaN(weights[i])) continue;

                                            const isAllTimeBestSet = (weights[i] === allTimeBestSet.weight && reps[i] === allTimeBestSet.reps);
                                            if (isAllTimeBestSet && allTimeBestSet.volume > 0) {
                                                setStrings.push(`${weights[i]}${unit}×${reps[i]} ⭐`);
                                            } else {
                                                setStrings.push(`${weights[i]}${unit}×${reps[i]}`);
                                            }
                                        }

                                        return setStrings.join('\n');
                                    } catch (error) {
                                        console.error('Error in tooltip footer callback:', error);
                                        return 'Error displaying sets';
                                    }
                                }
                            }
                        }
                    }
                }
            });
            console.log("Chart instance created successfully with volume and 1RM data.");
        } catch (chartError) {
            console.error("Error creating Chart.js instance:", chartError);

            const historyMessageEl = document.getElementById('history-message');
            if (historyMessageEl) {
                historyMessageEl.textContent = `Error rendering chart: ${chartError.message}`;
            }
        }
    }

    function showHistoryEditModal() {
        if (!currentHistoryExerciseId || !currentHistoryExerciseName) {
            alert('Please select an exercise from the search first.');
            return;
        }

        historyEditExerciseNameEl.textContent = currentHistoryExerciseName;
        historyEditExerciseIdInput.value = currentHistoryExerciseId;
        historyEditForm.reset(); // Clear previous add form entries
        historyEditDateInput.valueAsDate = new Date(); // Default to today

        historyEditSets = [{ reps: '', weight: '', unit: 'kg' }];
        renderHistoryEditSets();

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
                        <option value="lbs" ${set.unit === 'lbs' || !set.unit ? 'selected' : ''}>lbs</option>
                        <option value="kg" ${set.unit === 'kg' ? 'selected' : ''}>kg</option>
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

            logs.sort((a, b) => new Date(b.date_performed) - new Date(a.date_performed));

            logs.forEach(log => {

                const reps = log.reps_completed ? log.reps_completed.split(',').map(Number) : [];
                const weights = log.weight_used ? log.weight_used.split(',').map(Number) : [];
                const unit = log.weight_unit || 'kg';

                let summary = '';
                for (let i = 0; i < Math.min(reps.length, weights.length); i++) {
                    if (i > 0) summary += ' ';
                    summary += `<span class="weight-reps-pair">
                        <span class="weight-value">${weights[i]}${unit}</span>
                        <span class="multiply-symbol">×</span>
                        <span class="reps-value">${reps[i]}</span>
                    </span>`;
                }

                const logItem = document.createElement('div');
                logItem.className = 'log-item';
                logItem.innerHTML = `
                    <div class="log-item-details">
                        <span class="log-item-date">${new Date(log.date_performed).toLocaleDateString()}</span>
                        <div class="log-item-summary">${summary}</div>
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

    initialize();
});
