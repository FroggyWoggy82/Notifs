/**
 * Weekly Goal Points Fix - Ensures weekly goal points are properly displayed on the weight chart
 * This script runs independently to fix issues with weekly goal points
 */

(function() {
    console.log('[Weekly Goal Points Fix] Initializing...');

    // Add CSS for weekly goal points
    function addWeeklyGoalPointStyles() {
        const styleId = 'weekly-goal-point-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .goal-weight-point {
                    r: 6px !important; /* Larger radius */
                    fill: #e74c3c !important; /* Red color */
                    stroke: #ffffff !important; /* White border */
                    stroke-width: 2px !important;
                    cursor: pointer !important;
                }

                /* Add a pulsing animation to make the points more noticeable */
                @keyframes pulse {
                    0% { r: 6px; }
                    50% { r: 8px; }
                    100% { r: 6px; }
                }

                .goal-weight-point:hover {
                    animation: pulse 1s infinite;
                }

                /* Week number labels */
                .week-number-label {
                    position: absolute;
                    background-color: rgba(0, 0, 0, 0.7);
                    color: white;
                    padding: 2px 5px;
                    border-radius: 3px;
                    font-size: 10px;
                    pointer-events: none;
                    z-index: 1000;
                    transform: translate(-50%, -100%);
                    white-space: nowrap;
                }
            `;
            document.head.appendChild(style);
            console.log('[Weekly Goal Points Fix] Added weekly goal point styles');
        }
    }

    // Function to add week number labels to goal points
    function addWeekNumberLabels() {
        try {
            console.log('[Weekly Goal Points Fix] Adding week number labels');

            // Check if we have a chart instance
            if (!window.weightGoalChart) {
                console.warn('[Weekly Goal Points Fix] Weight chart not available');
                return;
            }

            // Remove any existing labels
            document.querySelectorAll('.week-number-label').forEach(label => label.remove());

            // Get weekly goal weights from the chart data
            extractWeeklyGoalWeights();

            // If we still don't have weekly goal weights, exit
            if (!window.weeklyGoalWeights || window.weeklyGoalWeights.length === 0) {
                console.log('[Weekly Goal Points Fix] No weekly goal weights found after extraction attempt');
                return;
            }

            // Get the chart canvas
            const chartCanvas = document.getElementById('weight-goal-chart');
            if (!chartCanvas) {
                console.warn('[Weekly Goal Points Fix] Chart canvas not found');
                return;
            }

            // Get the chart container
            const chartContainer = chartCanvas.parentElement;
            if (!chartContainer) {
                console.warn('[Weekly Goal Points Fix] Chart container not found');
                return;
            }

            // Log all weekly goal weights for debugging
            console.log('[Weekly Goal Points Fix] All weekly goal weights:', JSON.stringify(window.weeklyGoalWeights));

            // Add week number labels for each weekly goal weight
            window.weeklyGoalWeights.forEach(weeklyPoint => {
                try {
                    // Get the point position from the chart
                    const meta = window.weightGoalChart.getDatasetMeta(1);
                    if (!meta || !meta.data) {
                        console.warn(`[Weekly Goal Points Fix] Meta data not available for week ${weeklyPoint.week}`);
                        return;
                    }

                    // Find the point in the dataset
                    if (!meta.data[weeklyPoint.index]) {
                        console.warn(`[Weekly Goal Points Fix] Point not found at index ${weeklyPoint.index} for week ${weeklyPoint.week}`);
                        return;
                    }

                    const point = meta.data[weeklyPoint.index];

                    // Create a week number label
                    const weekLabel = document.createElement('div');
                    weekLabel.className = 'week-number-label';
                    weekLabel.textContent = `Week ${weeklyPoint.week}`;

                    // Style the label
                    weekLabel.style.position = 'absolute';
                    weekLabel.style.top = `${point.y - 20}px`;
                    weekLabel.style.left = `${point.x}px`;
                    weekLabel.style.transform = 'translateX(-50%)';
                    weekLabel.style.color = '#fff';
                    weekLabel.style.fontSize = '10px';
                    weekLabel.style.fontWeight = 'bold';
                    weekLabel.style.textShadow = '1px 1px 2px rgba(0,0,0,0.7)';
                    weekLabel.style.pointerEvents = 'none';
                    weekLabel.style.zIndex = '10';

                    // Add the label to the chart container
                    chartContainer.appendChild(weekLabel);

                    console.log(`[Weekly Goal Points Fix] Added week number label: Week ${weeklyPoint.week} at position (${point.x}, ${point.y})`);
                } catch (e) {
                    console.error(`[Weekly Goal Points Fix] Error adding label for week ${weeklyPoint.week}:`, e);
                }
            });

            console.log('[Weekly Goal Points Fix] Week number labels added');
        } catch (error) {
            console.error('[Weekly Goal Points Fix] Error adding week number labels:', error);
        }
    }

    // Function to extract weekly goal weights from chart data
    function extractWeeklyGoalWeights() {
        try {
            console.log('[Weekly Goal Points Fix] Extracting weekly goal weights');

            // Check if we have a chart instance
            if (!window.weightGoalChart) {
                console.warn('[Weekly Goal Points Fix] Weight chart not available for extraction');
                return;
            }

            // Get the goal dataset
            if (!window.weightGoalChart.data || !window.weightGoalChart.data.datasets || window.weightGoalChart.data.datasets.length < 2) {
                console.warn('[Weekly Goal Points Fix] Goal dataset not available');
                return;
            }

            const goalDataset = window.weightGoalChart.data.datasets[1];
            if (!goalDataset || !goalDataset.data) {
                console.warn('[Weekly Goal Points Fix] Goal dataset data not available');
                return;
            }

            // Get the chart labels
            const labels = window.weightGoalChart.data.labels;
            if (!labels || labels.length === 0) {
                console.warn('[Weekly Goal Points Fix] Chart labels not available');
                return;
            }

            // Keep existing weekly goal weights if they exist
            if (!window.weeklyGoalWeights || window.weeklyGoalWeights.length === 0) {
                window.weeklyGoalWeights = [];
            }

            // Get the weekly increment dates
            const weeklyDates = window.weeklyIncrementDates || [];
            console.log('[Weekly Goal Points Fix] Weekly increment dates:', weeklyDates);

            // Process each point in the dataset
            let weekCounter = 0;

            // First, check if we have weekly increment dates
            if (weeklyDates && weeklyDates.length > 0) {
                console.log('[Weekly Goal Points Fix] Using weekly increment dates for extraction');

                // For each label in the chart, check if it's in the weekly increment dates
                labels.forEach((label, index) => {
                    // Check if this label is in the weekly increment dates
                    const weekIndex = weeklyDates.indexOf(label);

                    if (weekIndex !== -1 && goalDataset.data[index] &&
                        goalDataset.data[index].y !== null && goalDataset.data[index].y !== undefined) {
                        // Check if this week is already in the weeklyGoalWeights array
                        const existingWeek = window.weeklyGoalWeights.find(w => w.week === weekIndex);
                        if (!existingWeek) {
                            window.weeklyGoalWeights.push({
                                index: index,
                                week: weekIndex,
                                weight: goalDataset.data[index].y,
                                date: label
                            });

                            console.log(`[Weekly Goal Points Fix] Added weekly goal weight from dates: ${label}, week ${weekIndex}, index ${index}`);
                        }
                    }
                });
            }

            // Find the start index (where the goal line begins)
            let startIndex = -1;
            for (let i = 0; i < goalDataset.data.length; i++) {
                if (goalDataset.data[i] && goalDataset.data[i].y !== null && goalDataset.data[i].y !== undefined) {
                    startIndex = i;
                    break;
                }
            }

            if (startIndex === -1) {
                console.warn('[Weekly Goal Points Fix] No valid start index found');
                return;
            }

            // Get the start date
            const startDate = new Date(labels[startIndex]);
            if (isNaN(startDate.getTime())) {
                console.warn('[Weekly Goal Points Fix] Invalid start date');
                return;
            }

            // Process each point to find weekly increments from the start date
            for (let i = startIndex; i < goalDataset.data.length; i++) {
                if (goalDataset.data[i] && goalDataset.data[i].y !== null && goalDataset.data[i].y !== undefined) {
                    const currentDate = new Date(labels[i]);
                    if (!isNaN(currentDate.getTime())) {
                        // Calculate days since start
                        const daysSinceStart = Math.round((currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));

                        // Check if this is a weekly increment (every 7 days from start)
                        if (daysSinceStart > 0 && daysSinceStart % 7 === 0) {
                            const weekNum = daysSinceStart / 7;

                            // Check if this week is already in the weeklyGoalWeights array
                            const existingWeek = window.weeklyGoalWeights.find(w => w.week === weekNum);
                            if (!existingWeek) {
                                window.weeklyGoalWeights.push({
                                    index: i,
                                    week: weekNum,
                                    weight: goalDataset.data[i].y,
                                    date: labels[i]
                                });

                                console.log(`[Weekly Goal Points Fix] Added weekly goal weight by day count: ${labels[i]}, week ${weekNum}, index ${i}`);
                            }
                        }
                    }
                }
            }

            // Also check for every 7th point from the start index
            for (let i = startIndex; i < goalDataset.data.length; i++) {
                // Check if this is a weekly point (every 7th point from start)
                const isWeeklyPoint = ((i - startIndex) % 7 === 0);

                if (isWeeklyPoint && goalDataset.data[i] &&
                    goalDataset.data[i].y !== null && goalDataset.data[i].y !== undefined) {
                    const weekNum = Math.floor((i - startIndex) / 7);

                    // Check if this week is already in the weeklyGoalWeights array
                    const existingWeek = window.weeklyGoalWeights.find(w => w.week === weekNum);
                    if (!existingWeek) {
                        window.weeklyGoalWeights.push({
                            index: i,
                            week: weekNum,
                            weight: goalDataset.data[i].y,
                            date: labels[i]
                        });

                        console.log(`[Weekly Goal Points Fix] Added weekly goal weight from 7th point: ${labels[i]}, week ${weekNum}, index ${i}`);
                    }
                }
            }

            // If we still don't have weekly goal weights, try using all points in the goal dataset
            if (window.weeklyGoalWeights.length === 0) {
                console.log('[Weekly Goal Points Fix] Using all goal points for extraction');

                // Process each point in the dataset
                goalDataset.data.forEach((point, index) => {
                    if (point && point.y !== null && point.y !== undefined) {
                        window.weeklyGoalWeights.push({
                            index: index,
                            week: weekCounter,
                            weight: point.y,
                            date: labels[index]
                        });

                        console.log(`[Weekly Goal Points Fix] Added weekly goal weight from all points: ${labels[index]}, week ${weekCounter}, index ${index}`);
                        weekCounter++;
                    }
                });
            }

            // Sort weekly goal weights by week number
            window.weeklyGoalWeights.sort((a, b) => a.week - b.week);

            console.log(`[Weekly Goal Points Fix] Extracted ${window.weeklyGoalWeights.length} weekly goal weights:`, window.weeklyGoalWeights);
        } catch (error) {
            console.error('[Weekly Goal Points Fix] Error extracting weekly goal weights:', error);
        }
    }

    // Function to directly modify chart configuration to ensure weekly goal points are visible
    function modifyChartConfiguration() {
        try {
            // Create a plugin to enhance goal points
            const weeklyGoalPointsPlugin = {
                id: 'weeklyGoalPoints',
                beforeDraw: function(chart) {
                    try {
                        // Extract weekly goal weights before drawing
                        extractWeeklyGoalWeights();
                    } catch (error) {
                        console.error('[Weekly Goal Points Fix] Error in beforeDraw:', error);
                    }
                },
                afterDatasetDraw: function(chart, args) {
                    try {
                        // Only process the goal dataset (index 1)
                        if (args.datasetIndex !== 1) return;

                        // Get the goal dataset
                        const goalDataset = chart.data.datasets[1];
                        if (!goalDataset) return;

                        // Get the dataset meta
                        const dataset = args.meta;
                        if (!dataset || !dataset.data) return;

                        // Make sure we have weekly goal weights
                        if (!window.weeklyGoalWeights || window.weeklyGoalWeights.length === 0) {
                            console.warn('[Weekly Goal Points Fix] No weekly goal weights available for enhancement');
                            return;
                        }

                        // Log the weekly goal weights for debugging
                        console.log(`[Weekly Goal Points Fix] Enhancing ${window.weeklyGoalWeights.length} weekly goal points`);

                        // Enhance each weekly goal point
                        window.weeklyGoalWeights.forEach(weeklyPoint => {
                            try {
                                // Check if the point exists in the dataset
                                if (!dataset.data[weeklyPoint.index]) {
                                    console.warn(`[Weekly Goal Points Fix] Point not found at index ${weeklyPoint.index} for week ${weeklyPoint.week}`);
                                    return;
                                }

                                const point = dataset.data[weeklyPoint.index];
                                const ctx = chart.ctx;
                                const x = point.x;
                                const y = point.y;

                                // Draw a larger point with a distinctive style
                                ctx.save();
                                ctx.beginPath();
                                ctx.arc(x, y, 6, 0, 2 * Math.PI);
                                ctx.fillStyle = '#e74c3c'; // Red color
                                ctx.fill();
                                ctx.strokeStyle = '#ffffff'; // White border
                                ctx.lineWidth = 2;
                                ctx.stroke();

                                // Add a pulsing effect for better visibility
                                ctx.beginPath();
                                ctx.arc(x, y, 8, 0, 2 * Math.PI);
                                ctx.strokeStyle = 'rgba(231, 76, 60, 0.5)'; // Semi-transparent red
                                ctx.lineWidth = 1;
                                ctx.stroke();
                                ctx.restore();

                                // Add a data attribute for week number if the element exists
                                if (point.element) {
                                    point.element.setAttribute('data-week-number', weeklyPoint.week);
                                    point.element.classList.add('goal-weight-point');
                                }

                                console.log(`[Weekly Goal Points Fix] Enhanced weekly goal point for week ${weeklyPoint.week} at index ${weeklyPoint.index}`);
                            } catch (e) {
                                console.error(`[Weekly Goal Points Fix] Error enhancing point for week ${weeklyPoint.week}:`, e);
                            }
                        });

                        // Add week number labels after drawing all points
                        setTimeout(addWeekNumberLabels, 50);

                    } catch (error) {
                        console.error('[Weekly Goal Points Fix] Error in afterDatasetDraw:', error);
                    }
                }
            };

            // Override the default point drawing for the goal dataset
            if (window.weightGoalChart && window.weightGoalChart.data && window.weightGoalChart.data.datasets && window.weightGoalChart.data.datasets.length > 1) {
                try {
                    // Get the goal dataset
                    const goalDataset = window.weightGoalChart.data.datasets[1];

                    // Modify the pointRadius function to show uniform dots for all goal points
                    goalDataset.pointRadius = 4; // Show uniform medium-sized dots for all goal line points

                    // Make sure all points are visible
                    goalDataset.pointStyle = 'circle';

                    // Set uniform point background color for all goal points
                    goalDataset.pointBackgroundColor = 'rgba(231, 76, 60, 0.6)'; // Semi-transparent red for all goal points

                    // Set uniform point border color for all goal points
                    goalDataset.pointBorderColor = 'rgba(255, 255, 255, 0.8)'; // Semi-transparent white border for all goal points

                    goalDataset.pointBorderWidth = 2;

                    console.log('[Weekly Goal Points Fix] Modified goal dataset point styling');
                } catch (e) {
                    console.error('[Weekly Goal Points Fix] Error modifying goal dataset:', e);
                }
            }

            // Register the plugin globally
            if (window.Chart && window.Chart.register) {
                // Check if the plugin is already registered
                let pluginAlreadyRegistered = false;

                try {
                    if (window.Chart.registry &&
                        window.Chart.registry.plugins &&
                        window.Chart.registry.plugins.items &&
                        window.Chart.registry.plugins.items.weeklyGoalPoints) {
                        pluginAlreadyRegistered = true;
                    }
                } catch (e) {
                    // Ignore errors when checking if plugin is registered
                }

                if (!pluginAlreadyRegistered) {
                    try {
                        window.Chart.register(weeklyGoalPointsPlugin);
                        console.log('[Weekly Goal Points Fix] Registered weeklyGoalPoints plugin');
                    } catch (e) {
                        console.error('[Weekly Goal Points Fix] Error registering plugin:', e);
                    }
                }
            } else {
                console.warn('[Weekly Goal Points Fix] Chart.register not available');
            }

            // If we have a chart instance, add the plugin directly to it
            if (window.weightGoalChart) {
                try {
                    // Check if the plugin is already in the chart's plugins
                    let pluginAlreadyAdded = false;

                    if (window.weightGoalChart.options &&
                        window.weightGoalChart.options.plugins &&
                        window.weightGoalChart.options.plugins.weeklyGoalPoints) {
                        pluginAlreadyAdded = true;
                    }

                    if (!pluginAlreadyAdded) {
                        // Ensure the chart has plugins configuration
                        if (!window.weightGoalChart.options) {
                            window.weightGoalChart.options = {};
                        }

                        if (!window.weightGoalChart.options.plugins) {
                            window.weightGoalChart.options.plugins = {};
                        }

                        // Add our plugin
                        window.weightGoalChart.options.plugins.weeklyGoalPoints = true;

                        // Add the plugin to the chart's plugin list
                        if (!window._chartPluginsPatched) {
                            const originalPlugins = window.weightGoalChart.plugins || [];
                            window.weightGoalChart.plugins = [...originalPlugins, weeklyGoalPointsPlugin];
                            window._chartPluginsPatched = true;
                            console.log('[Weekly Goal Points Fix] Added plugin directly to chart');
                        }

                        // Update the chart to apply the plugin
                        try {
                            window.weightGoalChart.update('none'); // Use 'none' mode to prevent animation issues
                            console.log('[Weekly Goal Points Fix] Updated chart with plugin');
                        } catch (updateError) {
                            console.error('[Weekly Goal Points Fix] Error updating chart:', updateError);
                        }
                    }
                } catch (e) {
                    console.error('[Weekly Goal Points Fix] Error adding plugin to chart:', e);
                }
            }

        } catch (error) {
            console.error('[Weekly Goal Points Fix] Error modifying chart configuration:', error);
        }
    }

    // Function to ensure weekly goal points are visible
    function ensureWeeklyGoalPoints() {
        try {
            if (!window.weightGoalChart) {
                console.warn('[Weekly Goal Points Fix] Weight chart not available');
                return;
            }

            const chart = window.weightGoalChart;

            // Initialize weeklyGoalWeights if not already defined
            if (!window.weeklyGoalWeights) {
                window.weeklyGoalWeights = [];
            }

            // Initialize weeklyIncrementDates if not already defined
            if (!window.weeklyIncrementDates) {
                window.weeklyIncrementDates = [];
            }

            // Extract weekly increment dates from the chart data if available
            if (window.weeklyIncrementDates.length === 0 && chart.data && chart.data.labels) {
                try {
                    // Check if we have weekly increment dates in the chart options
                    if (chart.options && chart.options.weeklyIncrementDates) {
                        window.weeklyIncrementDates = chart.options.weeklyIncrementDates;
                        console.log('[Weekly Goal Points Fix] Found weekly increment dates in chart options:', window.weeklyIncrementDates);
                    } else {
                        // Try to extract weekly increment dates from the chart data
                        const allDates = chart.data.labels;

                        // Find the start date (first date in the goal dataset)
                        let startDate = null;
                        if (chart.data.datasets && chart.data.datasets.length > 1) {
                            const goalDataset = chart.data.datasets[1];
                            if (goalDataset && goalDataset.data) {
                                for (let i = 0; i < goalDataset.data.length; i++) {
                                    if (goalDataset.data[i] && goalDataset.data[i].y !== null && goalDataset.data[i].y !== undefined) {
                                        startDate = allDates[i];
                                        break;
                                    }
                                }
                            }
                        }

                        if (startDate) {
                            // Find the start index
                            const startIndex = allDates.indexOf(startDate);
                            if (startIndex !== -1) {
                                // Add weekly dates starting from the start date
                                for (let i = startIndex; i < allDates.length; i += 7) {
                                    window.weeklyIncrementDates.push(allDates[i]);
                                }

                                console.log('[Weekly Goal Points Fix] Extracted weekly increment dates:', window.weeklyIncrementDates);
                            }
                        }
                    }
                } catch (e) {
                    console.error('[Weekly Goal Points Fix] Error extracting weekly increment dates:', e);
                }
            }

            // Extract weekly goal weights
            extractWeeklyGoalWeights();

            // Directly modify the chart configuration to ensure weekly goal points are visible
            modifyChartConfiguration();

            // Force chart update to apply the plugin
            try {
                // Use a safer update mode to prevent animation issues
                chart.update('none');
                console.log('[Weekly Goal Points Fix] Chart updated');
            } catch (e) {
                console.error('[Weekly Goal Points Fix] Error updating chart:', e);

                // Try a different approach if the update fails
                try {
                    // Modify the goal dataset directly
                    if (chart.data && chart.data.datasets && chart.data.datasets.length > 1) {
                        const goalDataset = chart.data.datasets[1];

                        // Make all points visible with uniform styling
                        goalDataset.pointRadius = 4; // Show uniform medium-sized dots for all goal line points
                        goalDataset.pointStyle = 'circle';
                        goalDataset.pointBackgroundColor = 'rgba(231, 76, 60, 0.6)'; // Semi-transparent red for all goal points
                        goalDataset.pointBorderColor = 'rgba(255, 255, 255, 0.8)'; // Semi-transparent white border for all goal points
                        goalDataset.pointBorderWidth = 2;

                        // Try updating again
                        chart.update('none');
                        console.log('[Weekly Goal Points Fix] Chart updated with direct dataset modification');
                    }
                } catch (retryError) {
                    console.error('[Weekly Goal Points Fix] Error in retry update:', retryError);
                }
            }

            // Add week number labels after a short delay to ensure the chart has rendered
            setTimeout(addWeekNumberLabels, 200);

            // Set up a second attempt to add labels after a longer delay
            // This helps in case the first attempt fails due to timing issues
            setTimeout(addWeekNumberLabels, 500);

            // Set up a third attempt for very slow browsers or complex charts
            setTimeout(addWeekNumberLabels, 1000);

        } catch (error) {
            console.error('[Weekly Goal Points Fix] Error ensuring weekly goal points:', error);
        }
    }

    // Helper function to find the goal start index in a dataset
    function findGoalStartIndex(goalDataset) {
        if (!goalDataset || !goalDataset.data) return -1;

        for (let i = 0; i < goalDataset.data.length; i++) {
            if (goalDataset.data[i] && goalDataset.data[i].y !== null && goalDataset.data[i].y !== undefined) {
                return i;
            }
        }

        return -1;
    }

    // Make functions available globally
    window.customGoalWeights = {
        addWeekNumbers: addWeekNumberLabels,
        ensureWeeklyGoalPoints: ensureWeeklyGoalPoints,
        modifyChartConfiguration: modifyChartConfiguration,
        findGoalStartIndex: findGoalStartIndex
    };

    // Add the styles
    addWeeklyGoalPointStyles();

    // Modify Chart.js configuration
    modifyChartConfiguration();

    // Set up an interval to check for the chart and ensure weekly goal points
    const weeklyGoalPointsInterval = setInterval(function() {
        if (window.weightGoalChart) {
            ensureWeeklyGoalPoints();
        }
    }, 500); // Check every half second

    // Clean up the interval after 60 seconds
    setTimeout(function() {
        clearInterval(weeklyGoalPointsInterval);
    }, 60000);

    // Also set up a more aggressive initial check
    for (let i = 0; i < 5; i++) {
        setTimeout(function() {
            if (window.weightGoalChart) {
                ensureWeeklyGoalPoints();
            }
        }, i * 200); // Check every 200ms for the first second
    }

    // Add a listener for chart updates
    document.addEventListener('weightChartUpdated', function() {
        console.log('[Weekly Goal Points Fix] Chart update detected');
        setTimeout(ensureWeeklyGoalPoints, 100);
    });

    // Add a MutationObserver to detect when the chart is updated
    if (!window._chartObserverAdded) {
        try {
            // Create a MutationObserver to watch for changes to the chart canvas
            const chartObserver = new MutationObserver(function(mutations) {
                // Check if we have a chart instance
                if (window.weightGoalChart) {
                    // Trigger our fix
                    setTimeout(() => {
                        if (window.customGoalWeights && window.customGoalWeights.ensureWeeklyGoalPoints) {
                            window.customGoalWeights.ensureWeeklyGoalPoints();
                        }
                    }, 100);
                }
            });

            // Start observing the document for chart canvas changes
            setTimeout(() => {
                const chartCanvas = document.querySelector('#weight-goal-chart');
                if (chartCanvas) {
                    chartObserver.observe(chartCanvas, {
                        attributes: true,
                        childList: true,
                        subtree: true
                    });
                    console.log('[Weekly Goal Points Fix] Added MutationObserver to chart canvas');
                } else {
                    console.warn('[Weekly Goal Points Fix] Chart canvas not found for MutationObserver');
                }
            }, 1000);

            window._chartObserverAdded = true;
        } catch (e) {
            console.error('[Weekly Goal Points Fix] Error adding MutationObserver:', e);
        }
    }

    console.log('[Weekly Goal Points Fix] Initialization complete');
})();
