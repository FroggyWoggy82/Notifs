
let customGoalWeights = [];
let selectedWeeks = [];
let weeklyIncrementDates = [];
let isEditMode = false;

function initCustomGoalWeights() {
    // Custom goal weights panel has been removed
    // Only initialize the edit button with a disabled message
    const editBtn = document.getElementById('edit-goal-weights-btn');
    if (editBtn) {
        editBtn.addEventListener('click', function() {
            alert('Custom goal weights feature is currently disabled. The UI panel has been removed.');
        });
    }

    // Skip initialization of other buttons since they don't exist anymore
    return;
}

function debugPoints() {
    console.log('Debugging chart points...');

    if (!window.weightGoalChart) {
        console.error('Weight goal chart instance not found');
        alert('Chart not fully initialized. Please try refreshing the page.');
        return;
    }

    const canvas = document.getElementById('weight-goal-chart');
    if (!canvas) {
        console.error('Weight goal chart canvas not found');
        return;
    }

    console.log('Chart instance:', window.weightGoalChart);
    console.log('Chart data:', window.weightGoalChart.data);
    console.log('Chart options:', window.weightGoalChart.options);

    if (window.weightGoalChart.data && window.weightGoalChart.data.datasets) {
        console.log('Datasets:', window.weightGoalChart.data.datasets);

        window.weightGoalChart.data.datasets.forEach((dataset, datasetIndex) => {
            console.log(`Dataset ${datasetIndex} (${dataset.label}):`, dataset);
            console.log(`Dataset ${datasetIndex} data:`, dataset.data);
        });
    }

    if (window.weeklyGoalWeights && window.weeklyGoalWeights.length > 0) {
        console.log('Weekly goal weights:', window.weeklyGoalWeights);

        window.weeklyGoalWeights.forEach((weeklyPoint, index) => {
            console.log(`Weekly goal weight ${index}:`, weeklyPoint);
        });
    }

    if (window.weightGoalChart && window.weightGoalChart.data && window.weightGoalChart.data.datasets.length > 1) {
        const goalDataset = window.weightGoalChart.data.datasets[1];

        goalDataset.pointRadius = function(context) {
            // Check if this is a weekly goal point from the stored weekly goal weights
            if (window.weeklyGoalWeights && window.weeklyGoalWeights.length > 0) {
                const isWeeklyPoint = window.weeklyGoalWeights.some(w => w.index === context.dataIndex);
                if (isWeeklyPoint) {
                    return 8; // Larger radius for weekly points
                }
            }

            // Fallback: Check if this is a weekly point (every 7th point from the start)
            let startIndex = -1;
            const dataset = context.dataset;

            if (dataset && dataset.data) {
                for (let i = 0; i < dataset.data.length; i++) {
                    if (dataset.data[i] && dataset.data[i].y !== null && dataset.data[i].y !== undefined) {
                        startIndex = i;
                        break;
                    }
                }
            }

            // If this is a weekly point, show it
            if (startIndex !== -1 && (context.dataIndex - startIndex) % 7 === 0 && dataset.data[context.dataIndex] && dataset.data[context.dataIndex].y !== null) {
                return 8; // Larger radius for weekly points
            }

            return 2; // Show small dots for all other goal line points
        };

        goalDataset.pointBackgroundColor = function(context) {
            // Color weekly points based on whether they're in the past or future
            if (window.weeklyGoalWeights && window.weeklyGoalWeights.length > 0) {
                const weeklyPoint = window.weeklyGoalWeights.find(w => w.index === context.dataIndex);
                if (weeklyPoint) {
                    const pointDate = new Date(weeklyPoint.date);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    // Past points are teal, future points are red
                    return pointDate < today ? '#1abc9c' : '#e74c3c';
                }
            }

            // Fallback: Check if this is a weekly point (every 7th point from the start)
            let startIndex = -1;
            const dataset = context.dataset;

            if (dataset && dataset.data) {
                for (let i = 0; i < dataset.data.length; i++) {
                    if (dataset.data[i] && dataset.data[i].y !== null && dataset.data[i].y !== undefined) {
                        startIndex = i;
                        break;
                    }
                }
            }

            // If this is a weekly point, color it red (default for goal points)
            if (startIndex !== -1 && (context.dataIndex - startIndex) % 7 === 0 && dataset.data[context.dataIndex] && dataset.data[context.dataIndex].y !== null) {
                return '#e74c3c'; // Red for weekly goal points
            }

            // Show all other goal line points with a semi-transparent red
            if (dataset.data[context.dataIndex] && dataset.data[context.dataIndex].y !== null) {
                return 'rgba(231, 76, 60, 0.3)'; // Semi-transparent red for other goal points
            }

            return 'transparent';
        };

        goalDataset.pointBorderColor = '#ffffff';
        goalDataset.pointBorderWidth = 2;

        goalDataset.pointHoverRadius = 12;

        window.weightGoalChart.update();

        const chartContainer = canvas.parentElement;
        const debugLabels = document.createElement('div');
        debugLabels.id = 'debug-labels';
        debugLabels.style.position = 'absolute';
        debugLabels.style.top = '0';
        debugLabels.style.left = '0';
        debugLabels.style.width = '100%';
        debugLabels.style.height = '100%';
        debugLabels.style.pointerEvents = 'none';
        debugLabels.style.zIndex = '1000';

        const existingLabels = document.getElementById('debug-labels');
        if (existingLabels) {
            existingLabels.remove();
        }

        chartContainer.appendChild(debugLabels);

        if (window.weeklyGoalWeights && window.weeklyGoalWeights.length > 0) {
            window.weeklyGoalWeights.forEach(weeklyPoint => {

                const meta = window.weightGoalChart.getDatasetMeta(1);
                if (meta && meta.data && meta.data[weeklyPoint.index]) {
                    const point = meta.data[weeklyPoint.index];

                    // Get the canvas offset within its parent container
                    const canvas = window.weightGoalChart.canvas;
                    const canvasOffsetX = canvas.offsetLeft || 0;
                    const canvasOffsetY = canvas.offsetTop || 0;

                    const label = document.createElement('div');
                    label.style.position = 'absolute';
                    label.style.left = `${canvasOffsetX + point.x}px`;
                    label.style.top = `${canvasOffsetY + point.y - 20}px`;
                    label.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                    label.style.color = 'white';
                    label.style.padding = '2px 5px';
                    label.style.borderRadius = '3px';
                    label.style.fontSize = '12px';
                    label.style.transform = 'translate(-50%, -100%)';
                    label.textContent = `Week ${weeklyPoint.week}`;

                    debugLabels.appendChild(label);
                }
            });
        }
    }

    alert('Debug information has been logged to the console. Points have been highlighted with labels.');

    setTimeout(() => {

        const debugLabels = document.getElementById('debug-labels');
        if (debugLabels) {
            debugLabels.remove();
        }

        if (window.weightGoalChart && window.weightGoalChart.data && window.weightGoalChart.data.datasets.length > 1) {
            const goalDataset = window.weightGoalChart.data.datasets[1];

            goalDataset.pointRadius = function(context) {
                // Check if this is a weekly goal point from the stored weekly goal weights
                if (window.weeklyGoalWeights && window.weeklyGoalWeights.length > 0) {
                    const isWeeklyPoint = window.weeklyGoalWeights.some(w => w.index === context.dataIndex);
                    if (isWeeklyPoint) {
                        return 8; // Larger radius for weekly points
                    }
                }

                // Fallback: Check if this is a weekly point (every 7th point from the start)
                let startIndex = -1;
                const dataset = context.dataset;

                if (dataset && dataset.data) {
                    for (let i = 0; i < dataset.data.length; i++) {
                        if (dataset.data[i] && dataset.data[i].y !== null && dataset.data[i].y !== undefined) {
                            startIndex = i;
                            break;
                        }
                    }
                }

                // If this is a weekly point, show it
                if (startIndex !== -1 && (context.dataIndex - startIndex) % 7 === 0 && dataset.data[context.dataIndex] && dataset.data[context.dataIndex].y !== null) {
                    return 8; // Larger radius for weekly points
                }

                return 2; // Show small dots for all other goal line points
            };

            goalDataset.pointBackgroundColor = function(context) {

                if (window.weeklyGoalWeights && window.weeklyGoalWeights.length > 0) {
                    const isWeeklyPoint = window.weeklyGoalWeights.some(w => w.index === context.dataIndex);
                    return isWeeklyPoint ? '#e74c3c' : 'transparent'; // Red for weekly points
                }
                return 'transparent';
            };

            goalDataset.pointBorderColor = function(context) {

                if (window.weeklyGoalWeights && window.weeklyGoalWeights.length > 0) {
                    const isWeeklyPoint = window.weeklyGoalWeights.some(w => w.index === context.dataIndex);
                    return isWeeklyPoint ? '#fff' : 'transparent'; // White border for weekly points
                }
                return 'transparent';
            };

            goalDataset.pointBorderWidth = 1;

            goalDataset.pointHoverRadius = 5;

            window.weightGoalChart.update();
        }
    }, 10000);
}

function toggleEditMode() {
    isEditMode = !isEditMode;
    console.log(`Toggle edit mode: ${isEditMode ? 'ON' : 'OFF'}`);

    const customWeightsPanel = document.getElementById('custom-weights-panel');
    const editBtn = document.getElementById('edit-goal-weights-btn');
    const actionBtns = document.getElementById('custom-weights-actions');

    if (isEditMode) {
        customWeightsPanel.classList.add('edit-mode');
        editBtn.textContent = 'Cancel';
        actionBtns.style.display = 'flex';

        if (!window.weightGoalChart) {
            console.log('Chart not initialized, trying to find it...');

            if (window.Chart && window.Chart.instances) {
                const chartInstances = Object.values(window.Chart.instances);
                if (chartInstances.length > 0) {

                    window.weightGoalChart = chartInstances[0];
                    console.log('Found chart instance:', window.weightGoalChart);
                }
            }

            if (!window.weightGoalChart) {
                console.error('Could not find chart instance');
                alert('Chart not initialized. Please try refreshing the page.');
                return;
            }
        }

        alert('Click on the red dots (goal weight points) on the chart to select them for adjustment. You can select multiple points.');

        enablePointSelection();

        document.getElementById('weight-goal-chart').scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    } else {
        customWeightsPanel.classList.remove('edit-mode');
        editBtn.textContent = 'Edit Goal Weights';
        actionBtns.style.display = 'none';

        disablePointSelection();

        selectedWeeks = [];
        updateSelectedWeeksUI();
    }
}

function enablePointSelection() {
    console.log('Enabling point selection...');

    setTimeout(() => {

        if (!window.weightGoalChart) {
            console.error('Weight goal chart instance not found');

            if (window.Chart && window.Chart.instances) {
                const chartInstances = Object.values(window.Chart.instances);
                if (chartInstances.length > 0) {

                    window.weightGoalChart = chartInstances[0];
                    console.log('Found chart instance:', window.weightGoalChart);
                }
            }

            if (!window.weightGoalChart) {
                alert('Chart not fully initialized. Please try refreshing the page.');
                return;
            }
        }

        const canvas = document.getElementById('weight-goal-chart');
        if (!canvas) {
            console.error('Weight goal chart canvas not found');
            return;
        }

        const chartContainer = canvas.parentElement;
        chartContainer.classList.add('goal-edit-mode');

        const instructionsElement = document.getElementById('point-selection-instructions');
        if (instructionsElement) {
            instructionsElement.style.display = 'block';
        }

        canvas.removeEventListener('click', handleCanvasClick);
        canvas.addEventListener('click', handleCanvasClick);
        console.log('Added click handler to canvas');

        const editModeIndicator = document.createElement('div');
        editModeIndicator.id = 'edit-mode-indicator';
        editModeIndicator.className = 'edit-mode-indicator';
        editModeIndicator.textContent = 'Click on red dots to select';

        const existingIndicator = document.getElementById('edit-mode-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        chartContainer.appendChild(editModeIndicator);

        const style = document.createElement('style');
        style.id = 'point-pulse-animation';
        style.textContent = `
            .edit-mode-indicator {
                position: absolute;
                top: 10px;
                right: 10px;
                background-color: rgba(255, 99, 132, 0.8);
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 14px;
                z-index: 1000;
                animation: fadeInOut 2s infinite;
            }

            @keyframes fadeInOut {
                0% { opacity: 0.7; }
                50% { opacity: 1; }
                100% { opacity: 0.7; }
            }


            #weight-goal-chart {
                cursor: pointer !important;
            }
        `;
        document.head.appendChild(style);

        try {

            if (window.weightGoalChart && window.weightGoalChart.data && window.weightGoalChart.data.datasets.length > 1) {
                const goalDataset = window.weightGoalChart.data.datasets[1];

                console.log('Goal dataset before update:', goalDataset);

                const today = new Date();
                const labels = window.weightGoalChart.data.labels;
                const futureIndices = [];

                if (labels) {
                    labels.forEach((label, index) => {
                        const date = new Date(label);
                        if (date >= today) {
                            futureIndices.push(index);
                            console.log(`Found future date at index ${index}: ${label}`);
                        }
                    });
                }

                goalDataset.pointRadius = function(context) {
                    // Check if this is a weekly goal point from the stored weekly goal weights
                    if (window.weeklyGoalWeights && window.weeklyGoalWeights.length > 0) {
                        const isWeeklyPoint = window.weeklyGoalWeights.some(w => w.index === context.dataIndex);
                        if (isWeeklyPoint) {
                            return 8; // Larger radius for weekly points
                        }
                    }

                    // Fallback: Check if this is a weekly point (every 7th point from the start)
                    let startIndex = -1;
                    const dataset = context.dataset;

                    if (dataset && dataset.data) {
                        for (let i = 0; i < dataset.data.length; i++) {
                            if (dataset.data[i] && dataset.data[i].y !== null && dataset.data[i].y !== undefined) {
                                startIndex = i;
                                break;
                            }
                        }
                    }

                    // If this is a weekly point, show it
                    if (startIndex !== -1 && (context.dataIndex - startIndex) % 7 === 0 && dataset.data[context.dataIndex] && dataset.data[context.dataIndex].y !== null) {
                        return 8; // Larger radius for weekly points
                    }

                    return 2; // Show small dots for all other goal line points
                };

                goalDataset.pointBackgroundColor = function(context) {
                    const index = context.dataIndex;

                    if (futureIndices.includes(index)) {
                        return '#ff6384'; // Red for future points
                    }
                    return '#36a2eb'; // Blue for past points
                };

                goalDataset.pointBorderColor = function(context) {
                    const index = context.dataIndex;

                    if (futureIndices.includes(index)) {
                        return '#ffffff'; // White border for future points
                    }
                    return '#ffffff'; // White border for past points
                };

                goalDataset.pointBorderWidth = function(context) {
                    const index = context.dataIndex;

                    if (futureIndices.includes(index)) {
                        return 2; // Thicker border for future points
                    }
                    return 1; // Normal border for past points
                };

                goalDataset.pointHoverRadius = function(context) {
                    const index = context.dataIndex;

                    if (futureIndices.includes(index)) {
                        return 15; // Larger hover radius for future points
                    }
                    return 5; // Normal hover radius for past points
                };

                window.weightGoalChart.update();
                console.log('Chart updated with larger points');

                chartContainer.addEventListener('click', function(event) {
                    console.log('Chart container clicked');
                    handleCanvasClick(event);
                });

                try {

                    const meta = window.weightGoalChart.getDatasetMeta(1);

                    if (meta && meta.data) {

                        if (!window.weeklyGoalWeights) {
                            window.weeklyGoalWeights = [];
                        }

                        futureIndices.forEach((index, weekNumber) => {
                            if (meta.data[index]) {
                                const actualWeekNumber = weekNumber + 1; // Start from week 1, not week 0
                                const existingWeek = window.weeklyGoalWeights.find(w => w.week === actualWeekNumber);
                                if (!existingWeek) {
                                    window.weeklyGoalWeights.push({
                                        week: actualWeekNumber,
                                        index: index,
                                        date: labels[index],
                                        weight: goalDataset.data[index].y
                                    });
                                    console.log(`Added week ${actualWeekNumber} to weekly goal weights: index ${index}, date ${labels[index]}, weight ${goalDataset.data[index].y}`);
                                }
                            }
                        });
                    }

                    goalDataset.pointRadius = function(context) {
                        const index = context.dataIndex;

                        if (futureIndices.includes(index)) {
                            return 15; // Make future points much larger
                        }
                        return 3; // Keep past points small
                    };

                    goalDataset.pointHoverRadius = function(context) {
                        const index = context.dataIndex;

                        if (futureIndices.includes(index)) {
                            return 20; // Larger hover radius for future points
                        }
                        return 5; // Normal hover radius for past points
                    };

                    window.weightGoalChart.update();

                } catch (error) {
                    console.error('Error setting up chart points:', error);
                }
            } else {
                console.error('Goal dataset not found or chart not properly initialized');
            }
        } catch (error) {
            console.error('Error updating chart points:', error);
        }

        alert('Click on the red dots (goal weight points) to select them for adjustment. You can select multiple points.');
    }, 1000);
}

function disablePointSelection() {
    console.log('Disabling point selection...');

    const canvas = document.getElementById('weight-goal-chart');
    if (!canvas) {
        console.error('Weight goal chart canvas not found');
        return;
    }

    const chartContainer = canvas.parentElement;

    chartContainer.classList.remove('goal-edit-mode');

    canvas.removeEventListener('click', handleCanvasClick);

    const editModeIndicator = document.getElementById('edit-mode-indicator');
    if (editModeIndicator) {
        editModeIndicator.remove();
    }

    const helperOverlay = document.getElementById('helper-overlay');
    if (helperOverlay) {
        helperOverlay.remove();
    }

    const weekIndicatorsContainer = document.querySelector('.week-indicators-container');
    if (weekIndicatorsContainer) {
        weekIndicatorsContainer.remove();
    }

    const animationStyle = document.getElementById('point-pulse-animation');
    if (animationStyle) {
        animationStyle.remove();
    }

    if (window.weightGoalChart && window.weightGoalChart.data && window.weightGoalChart.data.datasets.length > 1) {
        const goalDataset = window.weightGoalChart.data.datasets[1];
        const futureIndices = window.weeklyGoalWeights ? window.weeklyGoalWeights.map(w => w.index) : [];

        goalDataset.pointRadius = function(context) {
            // Check if this is a weekly goal point from the stored weekly goal weights
            if (window.weeklyGoalWeights && window.weeklyGoalWeights.length > 0) {
                const isWeeklyPoint = window.weeklyGoalWeights.some(w => w.index === context.dataIndex);
                if (isWeeklyPoint) {
                    return 8; // Larger radius for weekly points
                }
            }

            // Fallback: Check if this is a weekly point (every 7th point from the start)
            let startIndex = -1;
            const dataset = context.dataset;

            if (dataset && dataset.data) {
                for (let i = 0; i < dataset.data.length; i++) {
                    if (dataset.data[i] && dataset.data[i].y !== null && dataset.data[i].y !== undefined) {
                        startIndex = i;
                        break;
                    }
                }
            }

            // If this is a weekly point, show it
            if (startIndex !== -1 && (context.dataIndex - startIndex) % 7 === 0 && dataset.data[context.dataIndex] && dataset.data[context.dataIndex].y !== null) {
                return 8; // Larger radius for weekly points
            }

            return 2; // Show small dots for all other goal line points
        };

        goalDataset.pointBackgroundColor = function(context) {
            const index = context.dataIndex;

            if (futureIndices.includes(index)) {
                return '#ff6384'; // Red for future points
            }
            return '#36a2eb'; // Blue for past points
        };

        goalDataset.pointBorderColor = function(context) {
            return '#ffffff'; // White border for all points
        };

        goalDataset.pointBorderWidth = 1;

        goalDataset.pointHoverRadius = 7;

        window.weightGoalChart.update();
    }

    const instructionsElement = document.getElementById('point-selection-instructions');
    if (instructionsElement) {
        instructionsElement.style.display = 'none';
    }
}

function handleCanvasClick(event) {
    console.log('Canvas clicked');

    if (!window.weightGoalChart) {
        console.error('Weight goal chart instance not found');

        if (window.Chart && window.Chart.instances) {
            const chartInstances = Object.values(window.Chart.instances);
            if (chartInstances.length > 0) {

                window.weightGoalChart = chartInstances[0];
                console.log('Found chart instance:', window.weightGoalChart);
            }
        }

        if (!window.weightGoalChart) {
            alert('Chart not initialized. Please try refreshing the page.');
            return;
        }
    }

    const canvas = event.target;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    console.log(`Canvas clicked at position: (${x}, ${y})`);

    try {

        let clickedElements;

        try {

            clickedElements = window.weightGoalChart.getElementsAtEventForMode(
                event,
                'nearest',
                { intersect: true },
                false
            );
        } catch (error) {
            console.error('Error using getElementsAtEventForMode:', error);

            try {
                clickedElements = window.weightGoalChart.getElementsAtEvent(event);
            } catch (error2) {
                console.error('Error using getElementsAtEvent:', error2);

                try {
                    clickedElements = window.weightGoalChart.getDatasetAtEvent(event);
                } catch (error3) {
                    console.error('Error using getDatasetAtEvent:', error3);
                    clickedElements = [];
                }
            }
        }

        console.log('Clicked elements:', clickedElements);

        if (!clickedElements || clickedElements.length === 0) {
            console.log('No chart elements clicked');

            if (window.weightGoalChart.data && window.weightGoalChart.data.datasets && window.weightGoalChart.data.datasets.length > 1) {
                const goalDataset = window.weightGoalChart.data.datasets[1];

                const chartArea = window.weightGoalChart.chartArea;

                if (x >= chartArea.left && x <= chartArea.right && y >= chartArea.top && y <= chartArea.bottom) {
                    console.log('Click is within chart area');

                    let closestPoint = null;
                    let closestDistance = Infinity;
                    let closestIndex = -1;

                    const meta = window.weightGoalChart.getDatasetMeta(1);

                    if (meta && meta.data) {
                        meta.data.forEach((point, index) => {

                            const dx = point.x - x;
                            const dy = point.y - y;
                            const distance = Math.sqrt(dx * dx + dy * dy);

                            if (distance < closestDistance) {
                                closestDistance = distance;
                                closestPoint = point;
                                closestIndex = index;
                            }
                        });
                    }


                    if (closestPoint && closestDistance < 30) {
                        console.log(`Found closest point at index ${closestIndex}, distance: ${closestDistance}`);

                        clickedElements = [{
                            datasetIndex: 1,
                            index: closestIndex
                        }];
                    }
                }
            }

            if (!clickedElements || clickedElements.length === 0) {
                return;
            }
        }

        const clickedElement = clickedElements[0];
        const datasetIndex = clickedElement.datasetIndex;
        const pointIndex = clickedElement.index;

        console.log(`Clicked element: dataset ${datasetIndex}, index ${pointIndex}`);

        if (datasetIndex !== 1) {
            console.log('This is not a goal weight point');
            return;
        }

        const weeklyPoint = window.weeklyGoalWeights.find(w => w.index === pointIndex);

        if (!weeklyPoint) {
            console.log('This is not a weekly goal point');
            return;
        }

        const weekNumber = weeklyPoint.week;
        console.log(`Found week number ${weekNumber} from weekly goal weights`);

        const isSelected = selectedWeeks.includes(weekNumber);

        if (isSelected) {

            selectedWeeks = selectedWeeks.filter(week => week !== weekNumber);
            console.log(`Removed week ${weekNumber} from selection`);
        } else {

            selectedWeeks.push(weekNumber);
            selectedWeeks.sort((a, b) => a - b);
            console.log(`Added week ${weekNumber} to selection`);
        }

        updateChartSelection();

        updateSelectedWeeksUI();

        const weightInputContainer = document.getElementById('weight-input-container');
        if (weightInputContainer) {
            if (selectedWeeks.length > 0) {
                weightInputContainer.style.display = 'flex';
                weightInputContainer.style.animation = 'fadeIn 0.3s';

                setTimeout(() => {
                    const weightInput = document.getElementById('custom-weight-input');
                    if (weightInput) {
                        weightInput.focus();
                    }
                }, 300);
            } else {
                weightInputContainer.style.display = 'none';
            }
        }

        window.weightGoalChart.update();
    } catch (error) {
        console.error('Error handling canvas click:', error);
        alert('Error handling click. Please try again or refresh the page.');
    }
}

function updateChartSelection() {
    if (!window.weightGoalChart || !window.weightGoalChart.data || window.weightGoalChart.data.datasets.length < 2) {
        return;
    }

    const goalDataset = window.weightGoalChart.data.datasets[1];
    const futureIndices = window.weeklyGoalWeights.map(w => w.index);

    goalDataset.pointBackgroundColor = function(context) {
        const index = context.dataIndex;

        if (futureIndices.includes(index)) {

            const weeklyPoint = window.weeklyGoalWeights.find(w => w.index === index);

            if (weeklyPoint) {

                const isSelected = selectedWeeks.includes(weeklyPoint.week);

                if (isSelected) {
                    return '#4CAF50'; // Green for selected points
                } else {
                    return '#ff6384'; // Red for unselected points
                }
            }
            return '#ff6384'; // Default red for future points
        }

        return '#36a2eb'; // Blue for past points
    };

    goalDataset.pointBorderColor = function(context) {
        const index = context.dataIndex;

        if (futureIndices.includes(index)) {
            return '#ffffff'; // White border for future points
        }

        return '#ffffff'; // White border for past points
    };

    goalDataset.pointBorderWidth = function(context) {
        const index = context.dataIndex;

        if (futureIndices.includes(index)) {

            const weeklyPoint = window.weeklyGoalWeights.find(w => w.index === index);

            if (weeklyPoint) {

                const isSelected = selectedWeeks.includes(weeklyPoint.week);

                if (isSelected) {
                    return 3; // Thicker border for selected points
                }
            }
            return 2; // Normal border for future points
        }

        return 1; // Thin border for past points
    };

    goalDataset.pointRadius = function(context) {
        const index = context.dataIndex;

        // Check if this is a weekly goal point from the stored weekly goal weights
        if (window.weeklyGoalWeights && window.weeklyGoalWeights.length > 0) {
            const weeklyPoint = window.weeklyGoalWeights.find(w => w.index === index);
            if (weeklyPoint) {
                // Check if this week is selected
                const isSelected = selectedWeeks.includes(weeklyPoint.week);
                if (isSelected) {
                    return 18; // Larger radius for selected points
                }
                return 8; // Normal radius for weekly points
            }
        }

        // Fallback: Check if this is a weekly point (every 7th point from the start)
        let startIndex = -1;
        const dataset = context.dataset;

        if (dataset && dataset.data) {
            for (let i = 0; i < dataset.data.length; i++) {
                if (dataset.data[i] && dataset.data[i].y !== null && dataset.data[i].y !== undefined) {
                    startIndex = i;
                    break;
                }
            }
        }

        // If this is a weekly point, show it
        if (startIndex !== -1 && (context.dataIndex - startIndex) % 7 === 0 && dataset.data[context.dataIndex] && dataset.data[context.dataIndex].y !== null) {
            return 8; // Larger radius for weekly points
        }

        return 2; // Show small dots for all other goal line points
    };

    window.weightGoalChart.update();
}

function updateSelectedWeeksUI() {
    console.log('Updating selected weeks UI. Selected weeks:', selectedWeeks);

    let selectedWeeksContainer = document.getElementById('selected-weeks');

    if (!selectedWeeksContainer) {
        const allParagraphs = document.querySelectorAll('p');
        for (const p of allParagraphs) {
            if (p.textContent.includes('No weeks selected') ||
                p.textContent.includes('Selected week') ||
                p.textContent.includes('Selected weeks')) {
                selectedWeeksContainer = p;
                break;
            }
        }
    }

    if (!selectedWeeksContainer) {
        console.error('Could not find selected weeks container, creating a new one');
        selectedWeeksContainer = document.createElement('p');
        selectedWeeksContainer.id = 'selected-weeks';

        const customWeightsPanel = document.getElementById('custom-weights-panel');
        if (customWeightsPanel) {

            const instructionsParagraph = customWeightsPanel.querySelector('#point-selection-instructions');
            if (instructionsParagraph) {
                instructionsParagraph.parentNode.insertBefore(selectedWeeksContainer, instructionsParagraph.nextSibling);
            } else {

                customWeightsPanel.appendChild(selectedWeeksContainer);
            }
        } else {

            document.body.appendChild(selectedWeeksContainer);
        }
    }

    const weightInputContainer = document.getElementById('weight-input-container');

    console.log('Selected weeks container:', selectedWeeksContainer);
    console.log('Weight input container:', weightInputContainer);

    if (selectedWeeks.length > 0) {

        if (selectedWeeks.length === 1) {
            selectedWeeksContainer.innerHTML = `<strong>Selected week:</strong> <span class="selected-weeks-list">${selectedWeeks[0]}</span>`;
        } else {

            const sortedWeeks = [...selectedWeeks].sort((a, b) => a - b);

            const ranges = [];
            let rangeStart = sortedWeeks[0];
            let rangeEnd = rangeStart;

            for (let i = 1; i < sortedWeeks.length; i++) {
                if (sortedWeeks[i] === rangeEnd + 1) {

                    rangeEnd = sortedWeeks[i];
                } else {

                    if (rangeStart === rangeEnd) {
                        ranges.push(`${rangeStart}`);
                    } else {
                        ranges.push(`${rangeStart}-${rangeEnd}`);
                    }
                    rangeStart = sortedWeeks[i];
                    rangeEnd = rangeStart;
                }
            }

            if (rangeStart === rangeEnd) {
                ranges.push(`${rangeStart}`);
            } else {
                ranges.push(`${rangeStart}-${rangeEnd}`);
            }

            selectedWeeksContainer.innerHTML = `<strong>Selected weeks:</strong> <span class="selected-weeks-list">${ranges.join(', ')}</span>`;
        }

        selectedWeeksContainer.style.display = 'block';
        selectedWeeksContainer.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
        selectedWeeksContainer.style.padding = '10px';
        selectedWeeksContainer.style.borderRadius = '4px';
        selectedWeeksContainer.style.border = '1px solid rgba(76, 175, 80, 0.3)';
        selectedWeeksContainer.style.marginTop = '10px';
        selectedWeeksContainer.style.marginBottom = '10px';
        selectedWeeksContainer.style.color = 'white';
        selectedWeeksContainer.style.fontWeight = 'normal';

        if (weightInputContainer) {
            weightInputContainer.style.display = 'flex';
            weightInputContainer.style.animation = 'fadeIn 0.3s';

            setTimeout(() => {
                const weightInput = document.getElementById('custom-weight-input');
                if (weightInput) {
                    weightInput.focus();
                }
            }, 300);
        } else {
            console.error('Weight input container not found');

            createWeightInputContainer();
        }
    } else {

        selectedWeeksContainer.innerHTML = '<em style="color: #aaa;">No weeks selected</em>';
        selectedWeeksContainer.style.backgroundColor = 'transparent';
        selectedWeeksContainer.style.padding = '5px';
        selectedWeeksContainer.style.border = 'none';
        selectedWeeksContainer.style.display = 'block';
        selectedWeeksContainer.style.color = 'white';
        selectedWeeksContainer.style.fontWeight = 'normal';

        if (weightInputContainer) {
            weightInputContainer.style.display = 'none';
        }
    }

    if (!document.getElementById('selected-weeks-animation')) {
        const style = document.createElement('style');
        style.id = 'selected-weeks-animation';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .selected-weeks-list {
                font-weight: bold;
                color: #4CAF50;
            }

            #selected-weeks {
                transition: all 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }
}

function createWeightInputContainer() {
    if (document.getElementById('weight-input-container')) {
        return; // Already exists
    }

    const container = document.createElement('div');
    container.id = 'weight-input-container';
    container.style.display = 'none';
    container.style.flexDirection = 'row';
    container.style.alignItems = 'center';
    container.style.marginTop = '10px';
    container.style.marginBottom = '10px';

    const input = document.createElement('input');
    input.type = 'number';
    input.id = 'custom-weight-input';
    input.placeholder = 'Enter weight (lbs)';
    input.step = '0.1';
    input.min = '0';
    input.style.flex = '1';
    input.style.marginRight = '10px';
    input.style.padding = '8px';
    input.style.borderRadius = '4px';
    input.style.border = '1px solid #ccc';

    const applyButton = document.createElement('button');
    applyButton.id = 'apply-custom-weight';
    applyButton.textContent = 'Apply';
    applyButton.style.padding = '8px 16px';
    applyButton.style.backgroundColor = '#4CAF50';
    applyButton.style.color = 'white';
    applyButton.style.border = 'none';
    applyButton.style.borderRadius = '4px';
    applyButton.style.cursor = 'pointer';
    applyButton.onclick = saveCustomWeights;

    container.appendChild(input);
    container.appendChild(applyButton);

    const customWeightsPanel = document.getElementById('custom-weights-panel');
    if (customWeightsPanel) {

        const selectedWeeksContainer = document.getElementById('selected-weeks');
        if (selectedWeeksContainer) {

            selectedWeeksContainer.parentNode.insertBefore(container, selectedWeeksContainer.nextSibling);
        } else {

            customWeightsPanel.appendChild(container);
        }
    } else {

        document.body.appendChild(container);
    }
}

async function loadCustomGoalWeights() {
    try {

        const userSelector = document.getElementById('user-selector');
        const userId = userSelector ? userSelector.value : 1;

        console.log('Loading custom goal weights for user ID:', userId);

        const response = await fetch(`/api/custom-goal-weights?user_id=${userId}`);
        if (!response.ok) {


            console.error('Failed to load custom goal weights:', response.status);
            return;
        }

        customGoalWeights = await response.json();
        console.log('Loaded custom goal weights:', customGoalWeights);

        updateChartWithCustomWeights();
    } catch (error) {
        console.error('Error loading custom goal weights:', error);

    }
}

function updateChartWithCustomWeights() {


    if (window.weightGoalChart && customGoalWeights.length > 0) {
        const chart = window.weightGoalChart;
        const goalDataset = chart.data.datasets.find(ds => ds.label === 'Goal Weight Path (lbs)');

        if (goalDataset) {
            console.log('Updating chart with custom goal weights:', customGoalWeights);
            console.log('Weekly increment dates:', window.weeklyIncrementDates);
            console.log('Goal dataset data:', goalDataset.data);

            customGoalWeights.forEach(customWeight => {
                const weekNumber = customWeight.week_number;
                const weight = customWeight.weight;

                console.log(`Processing custom weight for week ${weekNumber}: ${weight} lbs`);

                const weeklyPoint = window.weeklyGoalWeights.find(w => w.week === weekNumber);

                if (weeklyPoint) {
                    const dataIndex = weeklyPoint.index;
                    console.log(`Found matching weekly point at index ${dataIndex}`);

                    if (dataIndex !== -1 && dataIndex < goalDataset.data.length) {

                        goalDataset.data[dataIndex].y = weight;
                        console.log(`Updated point at index ${dataIndex} to ${weight} lbs`);

                        if (!goalDataset.data[dataIndex].custom) {
                            goalDataset.data[dataIndex].custom = true;

                            if (!goalDataset.pointBackgroundColor) {
                                goalDataset.pointBackgroundColor = [];
                                for (let i = 0; i < goalDataset.data.length; i++) {
                                    goalDataset.pointBackgroundColor.push(goalDataset.backgroundColor);
                                }
                            }

                            goalDataset.pointBackgroundColor[dataIndex] = '#FFD700'; // Gold color for custom points
                            console.log(`Marked point at index ${dataIndex} as custom`);
                        }
                    }
                } else {
                    console.log(`No matching weekly point found for week ${weekNumber}`);
                }
            });

            chart.update();
            console.log('Chart updated with custom goal weights');
        }
    }
}

async function saveCustomWeights() {
    if (selectedWeeks.length === 0) {
        alert('Please select at least one week to adjust');
        return;
    }

    const weightInput = document.getElementById('custom-weight-input');
    const weight = parseFloat(weightInput.value);

    if (isNaN(weight) || weight <= 0) {
        alert('Please enter a valid positive weight');
        return;
    }

    const userSelector = document.getElementById('user-selector');
    const userId = userSelector ? userSelector.value : 1;

    const customWeightsToSave = [];

    selectedWeeks.forEach(weekNumber => {

        const weeklyPoint = window.weeklyGoalWeights.find(w => w.week === weekNumber);
        let targetDate = null;

        if (weeklyPoint && weeklyPoint.date) {

            const date = new Date(weeklyPoint.date);
            if (!isNaN(date.getTime())) {
                targetDate = date.toISOString().split('T')[0];
            }
        }

        if (!targetDate && weeklyIncrementDates && weeklyIncrementDates[weekNumber]) {
            targetDate = weeklyIncrementDates[weekNumber];
        }

        if (!targetDate) {
            targetDate = new Date().toISOString().split('T')[0];
        }

        customWeightsToSave.push({
            weekNumber,
            targetDate,
            weight
        });
    });

    if (customWeightsToSave.length === 0) {
        alert('No valid weeks selected');
        return;
    }

    try {
        console.log(`Saving custom goal weights for user ID: ${userId}`);
        console.log('Custom weights to save:', customWeightsToSave);

        const response = await fetch('/api/custom-goal-weights/multiple', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customWeights: customWeightsToSave,
                user_id: userId
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to save custom goal weights: ${errorText}`);
        }

        const savedWeights = await response.json();
        console.log('Saved custom goal weights:', savedWeights);

        savedWeights.forEach(savedWeight => {
            const existingIndex = customGoalWeights.findIndex(cw =>
                cw.user_id === savedWeight.user_id && cw.week_number === savedWeight.week_number
            );

            if (existingIndex !== -1) {
                customGoalWeights[existingIndex] = savedWeight;
            } else {
                customGoalWeights.push(savedWeight);
            }
        });

        updateChartWithCustomWeights();

        selectedWeeks = [];
        updateSelectedWeeksUI();

        weightInput.value = '';

        if (typeof loadAndRenderWeightChart === 'function') {
            loadAndRenderWeightChart();
        } else if (window.loadAndRenderWeightChart) {
            window.loadAndRenderWeightChart();
        }

        alert('Custom goal weights saved successfully');
    } catch (error) {
        console.error('Error saving custom goal weights:', error);
        alert('Failed to save custom goal weights: ' + error.message);
    }
}

function cancelCustomWeights() {

    selectedWeeks = [];
    updateSelectedWeeksUI();

    document.getElementById('custom-weight-input').value = '';

    toggleEditMode();
}

async function resetCustomWeights() {
    if (!confirm('Are you sure you want to reset all custom goal weights? This will revert to the calculated linear progression.')) {
        return;
    }

    try {

        const userSelector = document.getElementById('user-selector');
        const userId = userSelector ? userSelector.value : 1;

        console.log(`Resetting custom goal weights for user ID: ${userId}`);

        const response = await fetch(`/api/custom-goal-weights?user_id=${userId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to reset custom goal weights');
        }

        customGoalWeights = [];

        loadAndRenderWeightChart();

        toggleEditMode();

        alert('Custom goal weights reset successfully');
    } catch (error) {
        console.error('Error resetting custom goal weights:', error);
        alert('Failed to reset custom goal weights: ' + error.message);
    }
}

function addWeekNumbersToPoints() {


    if (window.weightGoalChart) {
        const chart = window.weightGoalChart;
        const canvas = chart.canvas;

        setTimeout(() => {

            const goalPoints = canvas.parentElement.querySelectorAll('.goal-weight-point');

            console.log(`Found ${goalPoints.length} goal weight points to add week numbers to`);

            if (window.weeklyGoalWeights && window.weeklyGoalWeights.length > 0) {
                goalPoints.forEach((point, index) => {

                    const weeklyPoint = window.weeklyGoalWeights.find(w => w.index === index);

                    if (weeklyPoint) {
                        point.dataset.weekNumber = weeklyPoint.week;
                        console.log(`Added week number ${weeklyPoint.week} to point at index ${index}`);
                    } else {
                        console.log(`No weekly point found for index ${index}`);
                    }
                });
            } else {
                console.log('No weekly goal weights available');
            }
        }, 500);
    }
}

window.customGoalWeights = {
    init: initCustomGoalWeights,
    load: loadCustomGoalWeights,
    update: updateChartWithCustomWeights,
    addWeekNumbers: addWeekNumbersToPoints
};
