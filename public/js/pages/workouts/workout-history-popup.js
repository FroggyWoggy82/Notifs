// Workout History Popup Module
document.addEventListener('DOMContentLoaded', function() {
    console.log('Workout History Popup module loaded');

    // --- State Variables ---
    let historyPopupChart = null;
    let currentExerciseId = null;
    let currentExerciseName = null;
    let currentHistoryData = [];

    // --- DOM Elements ---
    // Create modal elements if they don't exist
    function createHistoryPopupElements() {
        // Check if the modal already exists
        if (document.getElementById('workout-history-popup')) {
            return;
        }

        // Create the modal structure
        const modal = document.createElement('div');
        modal.id = 'workout-history-popup';
        modal.className = 'history-popup-modal';

        modal.innerHTML = `
            <div class="history-popup-content">
                <span class="history-popup-close">&times;</span>
                <h3 class="history-popup-title">Exercise History</h3>
                <div class="history-chart-container">
                    <canvas id="workout-history-chart"></canvas>
                </div>
                <p id="workout-history-message" class="history-popup-message">Select an exercise to view its history.</p>

                <!-- Prediction Table -->
                <div id="workout-history-prediction-table-container" class="history-prediction-table-container">
                    <h4>Predicted Weights by Rep Count</h4>
                    <p id="workout-history-prediction-info">Based on your best set: <span id="workout-history-best-set-info">-</span></p>
                    <p class="history-prediction-legend">
                        <span class="history-legend-item" style="background-color: rgba(76, 175, 80, 0.2);">Highlighted rows</span> = weights you've already achieved
                    </p>
                    <div style="overflow-x: auto;">
                        <table class="history-prediction-table">
                            <thead>
                                <tr>
                                    <th>Reps</th>
                                    <th>Predicted</th>
                                    <th>Best Achieved</th>
                                    <th>% of 1RM</th>
                                </tr>
                            </thead>
                            <tbody id="workout-history-prediction-table-body">
                                <!-- Table rows will be populated by JavaScript -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Append the modal to the body
        document.body.appendChild(modal);

        // Add event listener to close button
        const closeBtn = modal.querySelector('.history-popup-close');
        closeBtn.addEventListener('click', closeHistoryPopup);

        // Close when clicking outside the modal content
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeHistoryPopup();
            }
        });
    }

    // --- Public Functions ---
    // Function to show the history popup for a specific exercise
    window.showExerciseHistoryPopup = async function(exerciseId, exerciseName) {
        console.log(`Showing history popup for exercise: ${exerciseName} (ID: ${exerciseId})`);

        // Create modal elements if they don't exist
        createHistoryPopupElements();

        // Store the current exercise info
        currentExerciseId = exerciseId;
        currentExerciseName = exerciseName;

        // Update the modal title
        const titleEl = document.querySelector('.history-popup-title');
        if (titleEl) {
            titleEl.textContent = `Exercise History: ${exerciseName}`;
        }

        // Show the modal
        const modal = document.getElementById('workout-history-popup');
        if (modal) {
            modal.style.display = 'block';

            // Force a reflow to ensure the chart renders correctly
            setTimeout(() => {
                if (historyPopupChart) {
                    historyPopupChart.resize();
                }
            }, 50);
        }

        // Fetch and render the history data
        await fetchAndRenderHistoryChart(exerciseId);
    };

    // Function to close the history popup
    function closeHistoryPopup() {
        const modal = document.getElementById('workout-history-popup');
        if (modal) {
            modal.style.display = 'none';
        }

        // Destroy the chart to prevent memory leaks
        if (historyPopupChart) {
            historyPopupChart.destroy();
            historyPopupChart = null;
        }

        // Hide custom tooltip
        const customTooltip = document.getElementById('workout-history-custom-tooltip');
        if (customTooltip) {
            customTooltip.style.opacity = '0';
        }

        // Clean up global data
        window.chartProcessedData = null;
    }

    // --- History Chart Functions ---
    async function fetchAndRenderHistoryChart(exerciseId) {
        // Get the history message element
        const historyMessageEl = document.getElementById('workout-history-message');

        if (!historyMessageEl) {
            console.error("History message element not found!");
            return;
        }

        historyMessageEl.textContent = 'Loading history...';

        if (!exerciseId) {
            historyMessageEl.textContent = 'Please select an exercise to view its history.';
            console.warn("fetchAndRenderHistoryChart - No exercise ID provided.");
            return;
        }

        try {
            const response = await fetch(`/api/workouts/exercises/${exerciseId}/history`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const historyData = await response.json();
            console.log("Raw History Data Received:", JSON.stringify(historyData));

            // Store the raw history data for tooltip access
            currentHistoryData = historyData;

            if (historyData.length === 0) {
                historyMessageEl.textContent = 'No logged history found for this exercise.';
                if (historyPopupChart) {
                    historyPopupChart.destroy();
                    historyPopupChart = null;
                }

                // Hide the prediction table
                const tableContainer = document.getElementById('workout-history-prediction-table-container');
                if (tableContainer) {
                    tableContainer.style.display = 'none';
                }

                return;
            }

            // Process data for chart
            console.log("Processing history data:", historyData);

            const processedData = historyData.map(log => {
                // Parse the comma-separated strings into arrays
                const reps = log.reps_completed ? log.reps_completed.split(',').map(Number) : [];
                const weights = log.weight_used ? log.weight_used.split(',').map(Number) : [];
                const unit = log.weight_unit || 'kg';

                // Calculate total volume (weight * reps) for each set
                let totalVolume = 0;
                let maxOneRepMax = 0;
                let bestSet = { weight: 0, reps: 0 };
                let bestSetVolume = 0;

                for (let i = 0; i < Math.min(reps.length, weights.length); i++) {
                    // Make sure we're working with valid numbers
                    if (isNaN(reps[i]) || isNaN(weights[i])) continue;

                    const setVolume = reps[i] * weights[i];
                    totalVolume += setVolume;

                    // Track the best set (highest volume)
                    if (setVolume > bestSetVolume) {
                        bestSetVolume = setVolume;
                        bestSet = { weight: weights[i], reps: reps[i], unit: unit };
                    }

                    // Calculate 1RM for each set and keep the highest value
                    const setOneRepMax = calculate1RM(weights[i], reps[i]);
                    if (setOneRepMax > maxOneRepMax) {
                        maxOneRepMax = setOneRepMax;
                    }
                }

                return {
                    date: new Date(log.date_performed),
                    volume: totalVolume,
                    oneRepMax: maxOneRepMax,
                    bestSet: bestSet,
                    unit: unit,
                    weights: weights,
                    reps: reps
                };
            });

            // Sort by date
            processedData.sort((a, b) => a.date - b.date);

            // Format dates and extract volumes and 1RM for chart
            const labels = processedData.map(item => item.date.toLocaleDateString());
            const volumes = processedData.map(item => item.volume);
            const oneRepMaxes = processedData.map(item => item.oneRepMax);

            if (labels.length === 0 || volumes.length === 0) {
                console.warn("No valid data points for chart");
                historyMessageEl.textContent = 'No valid data points found for this exercise.';
                return;
            }

            // Get the most recent 1RM value and best set
            const latestOneRepMax = oneRepMaxes[oneRepMaxes.length - 1];
            const unit = processedData[processedData.length - 1].unit;
            const latestBestSet = processedData[processedData.length - 1].bestSet;

            // Create a message with the latest 1RM value
            let message = '';
            if (latestOneRepMax > 0) {
                message = `Estimated 1RM: ${latestOneRepMax} ${unit}`;
            }

            renderHistoryChart(labels, volumes, oneRepMaxes, processedData);

            // Display the 1RM message
            historyMessageEl.textContent = message;

            // Generate and display the prediction table
            if (latestOneRepMax > 0 && latestBestSet) {
                generatePredictionTable(latestOneRepMax, latestBestSet, unit, historyData);
            }

        } catch (error) {
            console.error('Error fetching or processing exercise history:', error);

            // Display error message
            historyMessageEl.textContent = `Error loading history: ${error.message}`;

            if (historyPopupChart) {
                historyPopupChart.destroy();
                historyPopupChart = null;
            }

            // Hide the prediction table
            const tableContainer = document.getElementById('workout-history-prediction-table-container');
            if (tableContainer) {
                tableContainer.style.display = 'none';
            }
        }
    }

    function renderHistoryChart(labels, volumeData, oneRepMaxData, processedData) {
        const chartCanvas = document.getElementById('workout-history-chart');

        if (!chartCanvas) {
            console.error("ERROR: workout-history-chart canvas is null or undefined!");
            return;
        }

        try {
            // Ensure the canvas is visible and has dimensions
            const container = chartCanvas.parentElement;
            if (container) {
                container.style.display = 'block';
            }

            const ctx = chartCanvas.getContext('2d');

            // Destroy existing chart before creating new one
            if (historyPopupChart) {
                historyPopupChart.destroy();
                historyPopupChart = null;
            }

            // Store the processed data in a global variable for tooltip access
            window.chartProcessedData = processedData;
            console.log('Setting global chartProcessedData:', window.chartProcessedData);

            // Add debug info to the DOM
            const debugEl = document.createElement('div');
            debugEl.style.display = 'none';
            debugEl.id = 'chart-debug-info';
            debugEl.textContent = JSON.stringify(processedData.map(d => ({
                date: d.date,
                volume: d.volume,
                weights: d.weights,
                reps: d.reps,
                unit: d.unit
            })));
            document.body.appendChild(debugEl);

            // Create a custom tooltip element
            let customTooltipEl = document.getElementById('workout-history-custom-tooltip');
            if (!customTooltipEl) {
                customTooltipEl = document.createElement('div');
                customTooltipEl.id = 'workout-history-custom-tooltip';

                // Create a style element for the tooltip
                const styleEl = document.createElement('style');
                styleEl.textContent = `
                    #workout-history-custom-tooltip {
                        position: absolute;
                        background: rgba(0, 0, 0, 0.8);
                        color: #fff;
                        padding: 8px 12px;
                        border-radius: 4px;
                        font-size: 14px;
                        pointer-events: none;
                        opacity: 0;
                        transition: opacity 0.2s;
                        z-index: 10000;
                        max-width: 250px;
                        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        transform: translate(-50%, -100%);
                    }

                    /* Arrow pointing down (tooltip above the point) */
                    #workout-history-custom-tooltip::after {
                        content: '';
                        position: absolute;
                        bottom: -10px;
                        left: 50%;
                        transform: translateX(-50%);
                        border-width: 5px;
                        border-style: solid;
                        border-color: rgba(0, 0, 0, 0.8) transparent transparent transparent;
                    }

                    /* When tooltip is below the point, change arrow direction */
                    #workout-history-custom-tooltip.tooltip-below-point::after {
                        bottom: auto;
                        top: -10px;
                        border-color: transparent transparent rgba(0, 0, 0, 0.8) transparent;
                    }
                `;
                document.head.appendChild(styleEl);
                document.body.appendChild(customTooltipEl);
            }

            // Add event listeners to the chart canvas
            chartCanvas.addEventListener('mousemove', function(e) {
                const rect = chartCanvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Only show tooltip if we have a chart and data
                if (historyPopupChart && window.chartProcessedData) {
                    const elements = historyPopupChart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, false);

                    if (elements.length > 0) {
                        const index = elements[0].index;
                        const data = window.chartProcessedData[index];

                        if (data) {
                            // Format the tooltip content
                            let content = `<div style="font-weight:bold;margin-bottom:5px;">${new Date(data.date).toLocaleDateString()}</div>`;
                            content += `<div>Volume: ${data.volume}</div>`;

                            // Add set information
                            if (data.weights && data.reps) {
                                content += '<div style="margin-top:5px;">';
                                for (let i = 0; i < Math.min(data.weights.length, data.reps.length); i++) {
                                    if (!isNaN(data.weights[i]) && !isNaN(data.reps[i])) {
                                        content += `<div>${data.weights[i]} ${data.unit} × ${data.reps[i]}</div>`;
                                    }
                                }
                                content += '</div>';
                            }

                            // Position and show the tooltip near the data point
                            customTooltipEl.innerHTML = content;

                            // Try to get the position of the data point
                            let tooltipX, tooltipY;

                            try {
                                // First try to get the center point of the element (newer Chart.js versions)
                                if (elements[0].element && typeof elements[0].element.getCenterPoint === 'function') {
                                    const position = elements[0].element.getCenterPoint();
                                    const canvasRect = chartCanvas.getBoundingClientRect();
                                    tooltipX = canvasRect.left + position.x;
                                    tooltipY = canvasRect.top + position.y;
                                }
                                // Then try to get the position from the element directly
                                else if (elements[0].element && elements[0].element.x !== undefined && elements[0].element.y !== undefined) {
                                    const canvasRect = chartCanvas.getBoundingClientRect();
                                    tooltipX = canvasRect.left + elements[0].element.x;
                                    tooltipY = canvasRect.top + elements[0].element.y;
                                }
                                // Fallback to mouse position if we can't get the element position
                                else {
                                    tooltipX = e.clientX;
                                    tooltipY = e.clientY;
                                }
                            } catch (error) {
                                console.error('Error getting tooltip position:', error);
                                // Fallback to mouse position
                                tooltipX = e.clientX;
                                tooltipY = e.clientY;
                            }

                            // Add debug info to the tooltip
                            if (window.debugTooltips) {
                                content += `<div style="margin-top:5px;font-size:10px;color:#aaa;">
                                    Debug: Point(${Math.round(tooltipX)},${Math.round(tooltipY)})
                                </div>`;
                                customTooltipEl.innerHTML = content;
                            }

                            // Get the chart container dimensions
                            const chartRect = chartCanvas.getBoundingClientRect();

                            // Position tooltip directly above the point (like in workout analytics)
                            let posX = tooltipX;
                            let posY = tooltipY - 15; // Position above the point with a small gap

                            // Ensure tooltip stays within chart boundaries
                            // For horizontal positioning, we rely on the transform: translate(-50%, -100%)
                            // to center the tooltip above the point

                            // For vertical positioning, make sure it stays within the chart
                            const tooltipHeight = 80; // Approximate tooltip height

                            // Check if tooltip would go above the top of the chart
                            if (posY - tooltipHeight < chartRect.top) {
                                // Not enough space above, position below the point instead
                                posY = tooltipY + 15;

                                // Update the tooltip style to point upward
                                customTooltipEl.style.transform = 'translate(-50%, 0)';

                                // Add a class to change the arrow direction
                                customTooltipEl.classList.add('tooltip-below-point');
                            } else {
                                // Position above the point (default)
                                customTooltipEl.style.transform = 'translate(-50%, -100%)';
                                customTooltipEl.classList.remove('tooltip-below-point');
                            }

                            // Position the tooltip
                            customTooltipEl.style.left = posX + 'px';
                            customTooltipEl.style.top = posY + 'px';

                            // Show the tooltip
                            customTooltipEl.style.opacity = '1';
                        }
                    }
                }
            });

            chartCanvas.addEventListener('mouseout', function() {
                customTooltipEl.style.opacity = '0';
            });

            // Create new chart with volume dataset
            historyPopupChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Volume (Weight * Reps)',
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
                    hover: {
                        mode: 'nearest',
                        intersect: true
                    },
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
                                text: `Volume (${processedData[0]?.unit || 'kg'})`,
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
                            enabled: false, // Disable the built-in tooltip since we're using a custom one
                            external: null // Explicitly set external to null to avoid conflicts
                        }
                    }
                }
            });
        } catch (chartError) {
            console.error("Error creating Chart.js instance:", chartError);

            // Display error message
            const historyMessageEl = document.getElementById('workout-history-message');
            if (historyMessageEl) {
                historyMessageEl.textContent = `Error rendering chart: ${chartError.message}`;
            }
        }
    }

    // --- Prediction Table Functions ---
    function generatePredictionTable(oneRepMax, bestSet, unit, historyData) {
        console.log('Generating prediction table with 1RM:', oneRepMax, 'Best set:', bestSet, 'Unit:', unit);

        // Get the table container and body elements
        const tableContainer = document.getElementById('workout-history-prediction-table-container');
        const tableBody = document.getElementById('workout-history-prediction-table-body');
        const bestSetInfo = document.getElementById('workout-history-best-set-info');

        if (!tableContainer || !tableBody || !bestSetInfo) {
            console.error('Prediction table elements not found');
            return;
        }

        // Show the table container
        tableContainer.style.display = 'block';

        // Update the best set info
        bestSetInfo.textContent = `${bestSet.weight} ${unit} × ${bestSet.reps} reps`;

        // Clear existing table rows
        tableBody.innerHTML = '';

        // Get the percentages for 1-30 reps
        const percentages = {
            1: 100, 2: 97, 3: 94, 4: 92, 5: 89, 6: 86, 7: 83, 8: 81, 9: 78, 10: 75,
            11: 73, 12: 71, 13: 70, 14: 68, 15: 67, 16: 65, 17: 64, 18: 63, 19: 61, 20: 60,
            21: 59, 22: 58, 23: 57, 24: 56, 25: 55, 26: 54, 27: 53, 28: 52, 29: 51, 30: 50
        };

        // Extract all sets from history data for comparison
        const historySets = [];
        if (historyData && historyData.length > 0) {
            historyData.forEach(log => {
                // Parse the comma-separated strings into arrays
                const reps = log.reps_completed ? log.reps_completed.split(',').map(Number) : [];
                const weights = log.weight_used ? log.weight_used.split(',').map(Number) : [];
                const logUnit = log.weight_unit || 'kg';

                // Create set objects for each set in the log
                for (let i = 0; i < Math.min(reps.length, weights.length); i++) {
                    if (isNaN(reps[i]) || isNaN(weights[i])) continue;

                    // Convert weight to the current display unit if needed
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

        // Create a map of actual weights achieved for each rep count
        const actualWeightsByReps = {};

        // Find the best weight for each rep count from history
        historySets.forEach(set => {
            const reps = set.reps;
            const weight = set.weight;

            // If we don't have a weight for this rep count yet, or this weight is higher
            if (!actualWeightsByReps[reps] || weight > actualWeightsByReps[reps]) {
                actualWeightsByReps[reps] = weight;
            }
        });

        // Generate table rows for 1-30 reps
        for (let reps = 1; reps <= 30; reps++) {
            const percentage = percentages[reps];

            // Calculate the predicted weight
            let predictedWeight = oneRepMax * (percentage / 100);
            let roundedPredictedWeight = Math.floor(predictedWeight / 5) * 5; // Round down to nearest 5

            // Check if we have an actual weight for this rep count
            let isActual = false;

            if (actualWeightsByReps[reps]) {
                isActual = true;
            }

            // Create a new table row
            const row = document.createElement('tr');

            // Add 'achieved' class if this is an actual weight from history
            if (isActual) {
                row.classList.add('achieved');
            }

            // Special handling for the row that matches the best set
            const isBestSet = (reps === bestSet.reps &&
                              ((actualWeightsByReps[reps] && Math.abs(actualWeightsByReps[reps] - bestSet.weight) < 0.1) ||
                               Math.abs(roundedPredictedWeight - bestSet.weight) < 0.1));

            // Add checkmark only if this is an actual weight from history
            // AND it's not the same as the best set (to avoid duplicate checkmarks)
            const showCheckmark = isActual && !isBestSet;

            // For the best set row, add a special indicator
            const bestSetIndicator = isBestSet ? ' ✓' : '';

            // Get the best achieved weight for this rep count
            const bestAchievedWeight = actualWeightsByReps[reps] || null;

            row.innerHTML = `
                <td>${reps}${showCheckmark ? ' ✓' : ''}${bestSetIndicator}</td>
                <td>${Math.round(roundedPredictedWeight)} ${unit}</td>
                <td>${bestAchievedWeight ? `${Math.round(bestAchievedWeight)} ${unit}` : '-'}</td>
                <td>${percentage}%</td>
            `;

            // Add the row to the table
            tableBody.appendChild(row);
        }
    }

    // --- Utility Functions ---
    // 1RM Calculation Function
    function calculate1RM(weight, reps) {
        // Based on the repetition percentages table
        const percentages = {
            1: 100, 2: 97, 3: 94, 4: 92, 5: 89, 6: 86, 7: 83, 8: 81, 9: 78, 10: 75,
            11: 73, 12: 71, 13: 70, 14: 68, 15: 67, 16: 65, 17: 64, 18: 63, 19: 61, 20: 60,
            21: 59, 22: 58, 23: 57, 24: 56, 25: 55, 26: 54, 27: 53, 28: 52, 29: 51, 30: 50
        };

        // If reps is beyond our table, default to 50%
        const percentage = percentages[reps] || 50;

        // Calculate 1RM: weight / percentage * 100
        const oneRepMax = Math.round((weight / percentage) * 100);

        return oneRepMax;
    }

    // Weight Conversion Function
    function convertWeight(weight, fromUnit, toUnit) {
        if (fromUnit === toUnit) return weight;

        // Convert kg to lbs
        if (fromUnit === 'kg' && toUnit === 'lbs') {
            return weight * 2.20462;
        }

        // Convert lbs to kg
        if (fromUnit === 'lbs' && toUnit === 'kg') {
            return weight / 2.20462;
        }

        // If units are not recognized, return original weight
        return weight;
    }

    // --- Initialize ---
    // Create the modal elements when the script loads
    createHistoryPopupElements();
});
