
document.addEventListener('DOMContentLoaded', function() {
    // Create a MutationObserver to watch for chart canvas creation
    const chartObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Check if the weight chart canvas has been added to the DOM
                const chartCanvas = document.getElementById('weight-goal-chart');
                if (chartCanvas && window.weightGoalChart && typeof window.attachWeightChartTooltipEvents === 'function') {
                    console.log('[Custom Tooltip] Chart canvas detected, attaching tooltip events');
                    window.attachWeightChartTooltipEvents(window.weightGoalChart);
                }
            }
        });
    });

    // Start observing the document body for chart canvas creation
    chartObserver.observe(document.body, { childList: true, subtree: true });

    const tooltip = document.createElement('div');
    tooltip.id = 'weight-chart-tooltip';
    tooltip.style.position = 'absolute';
    tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    tooltip.style.color = 'white';
    tooltip.style.padding = '10px';
    tooltip.style.borderRadius = '5px';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.opacity = '0';
    tooltip.style.transition = 'opacity 0.2s';
    tooltip.style.zIndex = '10000';
    tooltip.style.fontSize = '14px';
    tooltip.style.fontWeight = 'normal';
    tooltip.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    tooltip.style.minWidth = '150px';
    tooltip.style.textAlign = 'center';
    document.body.appendChild(tooltip);

    let isHoveringGoalLine = false;

    window.showWeightTooltip = function(event, chart, pointIndex, isGoalLine = false, goalValue = null) {
        if (!chart || !chart.data || !chart.data.datasets) return;

        const label = chart.data.labels[pointIndex];
        if (!label) return;

        let formattedDate = label;
        try {

            if (window.weeklyGoalWeights && window.weeklyGoalWeights.length > 0) {
                const weeklyPoint = window.weeklyGoalWeights.find(w => w.index === pointIndex);
                if (weeklyPoint && weeklyPoint.week === 0) {
                    // Use the actual date from the weekly point instead of hardcoding
                    // Try to use the pre-formatted fullDate if available
                    if (weeklyPoint.fullDate) {
                        formattedDate = weeklyPoint.fullDate;
                        console.log(`Using pre-formatted fullDate for week 0: ${formattedDate}`);
                    }
                    // Otherwise try to format the date field
                    else if (weeklyPoint.date) {
                        try {
                            const date = new Date(weeklyPoint.date);
                            if (!isNaN(date.getTime())) {
                                formattedDate = date.toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                });
                                console.log(`Using formatted date for week 0: ${formattedDate}`);
                            }
                        } catch (e) {
                            console.error('Error formatting week 0 date:', e);
                        }
                    }
                }
            }

            const date = new Date(label);
            if (!isNaN(date.getTime())) {
                formattedDate = date.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                });
            }
        } catch (e) {
            console.error('Error formatting date:', e);
        }

        let actualWeightInfo = '';
        let goalWeightInfo = '';
        let targetWeightInfo = '';
        let weeklyInfo = '';
        const targetWeight = chart.options.targetWeight;

        // Get the actual weight for this date
        const actualDataset = chart.data.datasets.find(ds => ds.label.includes('Actual'));
        const hasActualWeight = actualDataset &&
                               actualDataset.data &&
                               actualDataset.data[pointIndex] &&
                               actualDataset.data[pointIndex].y !== null &&
                               actualDataset.data[pointIndex].y !== undefined;

        // Get the goal weight for this date
        const goalDataset = chart.data.datasets.find(ds => ds.label.includes('Goal'));
        const hasGoalWeight = goalDataset &&
                             goalDataset.data &&
                             goalDataset.data[pointIndex] &&
                             goalDataset.data[pointIndex].y !== null &&
                             goalDataset.data[pointIndex].y !== undefined;

        // Check if this is a weekly target point
        let isWeeklyPoint = false;
        let weekNumber = null;
        if (window.weeklyGoalWeights && window.weeklyGoalWeights.length > 0) {
            const weeklyPoint = window.weeklyGoalWeights.find(w => w.index === pointIndex);
            if (weeklyPoint) {
                isWeeklyPoint = true;
                weekNumber = weeklyPoint.week;
                weeklyInfo = `<div style="color: #e74c3c; font-weight: bold;">Week ${weeklyPoint.week} Goal</div>`;

                // Special case for first weekly point
                if (weeklyPoint.week === 0) {
                    // Use the actual date from the weekly point instead of hardcoding
                    // Try to use the pre-formatted fullDate if available
                    if (weeklyPoint.fullDate) {
                        formattedDate = weeklyPoint.fullDate;
                        console.log(`Using pre-formatted fullDate for week 0 in tooltip: ${formattedDate}`);
                    }
                    // Otherwise try to format the date field
                    else if (weeklyPoint.date) {
                        try {
                            const date = new Date(weeklyPoint.date);
                            if (!isNaN(date.getTime())) {
                                formattedDate = date.toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                });
                                console.log(`Using formatted date for week 0 in tooltip: ${formattedDate}`);
                            }
                        } catch (e) {
                            console.error('Error formatting week 0 date in tooltip:', e);
                        }
                    }
                }
            }
        }

        // Add actual weight information if available
        if (hasActualWeight) {
            const actualWeight = parseFloat(actualDataset.data[pointIndex].y).toFixed(2);
            actualWeightInfo = `<div style="color: #3498db; font-weight: bold;">Actual Weight: ${actualWeight} lbs</div>`;

            // Add comparison to target weight if available
            if (targetWeight !== null && targetWeight !== undefined && !isNaN(targetWeight)) {
                const diff = actualDataset.data[pointIndex].y - targetWeight;
                const sign = diff >= 0 ? '+' : '';
                const diffColor = diff > 0 ? '#e67e22' : '#27ae60'; // Orange for above target, green for below/at target
                targetWeightInfo = `<div style="color: ${diffColor};">${sign}${Math.abs(diff).toFixed(2)} lbs ${diff >= 0 ? 'above' : 'below'} target</div>`;
            }
        }

        // Add goal weight information if available
        if (hasGoalWeight || (isGoalLine && goalValue !== null)) {
            // Use either the goal dataset value or the provided goalValue parameter
            const goalWeight = hasGoalWeight
                ? parseFloat(goalDataset.data[pointIndex].y).toFixed(2)
                : parseFloat(goalValue).toFixed(2);

            // Different styling for weekly points vs regular goal points
            if (isWeeklyPoint) {
                // Check if this weekly point is in the past or future
                const pointDate = new Date(label);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isPastPoint = pointDate < today;

                const pointColor = isPastPoint ? '#1abc9c' : '#e74c3c'; // Teal for past, red for future

                goalWeightInfo = `
                    ${weeklyInfo}
                    <div style="color: ${pointColor}; font-weight: bold;">Target Weight: ${goalWeight} lbs</div>
                `;
            } else {
                goalWeightInfo = `<div style="color: #e74c3c;">Target Weight: ${goalWeight} lbs</div>`;
            }

            // Add comparison to target weight if available
            if (targetWeight !== null && targetWeight !== undefined && !isNaN(targetWeight)) {
                const diff = parseFloat(goalWeight) - targetWeight;
                const sign = diff >= 0 ? '+' : '';
                if (!targetWeightInfo) { // Only add if not already added from actual weight
                    targetWeightInfo = `<div>${sign}${diff.toFixed(2)} lbs from final target</div>`;
                }
            }
        }

        // If we have both actual and goal weights, add comparison between them
        if (hasActualWeight && (hasGoalWeight || (isGoalLine && goalValue !== null))) {
            const actualWeight = parseFloat(actualDataset.data[pointIndex].y);
            const goalWeight = hasGoalWeight
                ? parseFloat(goalDataset.data[pointIndex].y)
                : parseFloat(goalValue);

            const diff = actualWeight - goalWeight;
            const sign = diff >= 0 ? '+' : '';
            const diffColor = diff > 0 ? '#e67e22' : '#27ae60'; // Orange for above goal, green for below/at goal

            // Add comparison section
            const comparisonInfo = `
                <div style="margin-top: 5px; padding-top: 5px; border-top: 1px solid rgba(255,255,255,0.2);">
                    <div style="color: ${diffColor}; font-weight: bold;">${sign}${Math.abs(diff).toFixed(2)} lbs ${diff >= 0 ? 'above' : 'below'} target</div>
                </div>
            `;

            // Add the comparison to the tooltip
            goalWeightInfo += comparisonInfo;
        }

        tooltip.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">${formattedDate}</div>
            ${actualWeightInfo}
            ${goalWeightInfo}
            ${targetWeightInfo}
        `;

        const canvas = chart.canvas;
        const rect = canvas.getBoundingClientRect();

        const xPos = chart.scales.x.getPixelForValue(pointIndex);

        let yPos;

        if (isGoalLine && goalValue !== null) {

            yPos = chart.scales.y.getPixelForValue(goalValue);
        } else if (actualDataset && actualDataset.data && actualDataset.data[pointIndex] &&
            actualDataset.data[pointIndex].y !== null && actualDataset.data[pointIndex].y !== undefined) {

            yPos = chart.scales.y.getPixelForValue(actualDataset.data[pointIndex].y);
        } else if (goalDataset && goalDataset.data && goalDataset.data[pointIndex] &&
                   goalDataset.data[pointIndex].y !== null && goalDataset.data[pointIndex].y !== undefined) {

            yPos = chart.scales.y.getPixelForValue(goalDataset.data[pointIndex].y);
        } else {

            return;
        }

        const x = rect.left + window.pageXOffset + xPos;
        const y = rect.top + window.pageYOffset + yPos;

        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y - 2}px`; // Position very close to the point
        tooltip.style.transform = 'translate(-50%, -100%)';
        tooltip.style.opacity = '1';
        tooltip.style.pointerEvents = 'none'; // Ensure tooltip doesn't interfere with mouse events

        if (isGoalLine) {
            tooltip.style.borderLeft = '3px solid #e74c3c'; // Red left border for goal line tooltip
            tooltip.style.maxWidth = '300px'; // Make tooltip wider for goal line
            tooltip.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)'; // Stronger shadow


            let hasWeeklyInfo = false;
            if (window.weeklyGoalWeights && window.weeklyGoalWeights.length > 0) {
                const weeklyPoint = window.weeklyGoalWeights.find(w => w.index === pointIndex);
                hasWeeklyInfo = !!weeklyPoint;
            }

            if (hasWeeklyInfo) {
                tooltip.style.borderLeft = '5px solid #e74c3c'; // Thicker border for weekly points
                tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.85)'; // Darker background
                tooltip.style.fontWeight = '400'; // Slightly bolder text
            }
        } else {
            tooltip.style.borderLeft = 'none'; // Remove border for regular tooltips
            tooltip.style.maxWidth = '200px'; // Default width
            tooltip.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)'; // Default shadow
            tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'; // Default background
            tooltip.style.fontWeight = 'normal'; // Default font weight
        }
    };

    window.hideWeightTooltip = function() {
        tooltip.style.opacity = '0';
    };

    // Define these functions in the global scope so they can be referenced
    let handleMouseMoveFunction;
    let handleMouseOutFunction;

    window.attachWeightChartTooltipEvents = function(chart) {
        if (!chart || !chart.canvas) {
            console.warn('Invalid chart or canvas for tooltip events');
            return;
        }

        const canvas = chart.canvas;

        // Remove any existing event listeners if they exist
        if (handleMouseMoveFunction) {
            canvas.removeEventListener('mousemove', handleMouseMoveFunction);
        }
        if (handleMouseOutFunction) {
            canvas.removeEventListener('mouseout', handleMouseOutFunction);
        }

        // Create new function references for this chart instance
        handleMouseMoveFunction = function(event) { handleMouseMove(event, chart); };
        handleMouseOutFunction = function() { handleMouseOut(chart); };

        // Add the new event listeners
        canvas.addEventListener('mousemove', handleMouseMoveFunction);
        canvas.addEventListener('mouseout', handleMouseOutFunction);

        console.log('Tooltip events attached to chart');

        function isOverGoalLine(event, chart) {
            // Comprehensive check for all required chart properties
            if (!chart || !chart.options || !chart.scales || !chart.scales.y ||
                !chart.canvas || !chart.data || !chart.data.datasets) {
                return false;
            }

            try {
                const rect = chart.canvas.getBoundingClientRect();
                if (!rect) return false;

                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                const goalDataset = chart.data.datasets.find(ds => ds.label && ds.label.includes('Goal'));
                if (!goalDataset || !goalDataset.data) return false;

            try {
                const mouseYValue = chart.scales.y.getValueForPixel(y);

                let closestPointIndex = -1;
                let minDistance = Infinity;

                // Make sure goalDataset.data exists and is an array
                if (!Array.isArray(goalDataset.data)) return false;

                for (let i = 0; i < goalDataset.data.length; i++) {
                    try {
                        const pointX = chart.scales.x.getPixelForValue(i);
                        const distance = Math.abs(x - pointX);

                        if (distance < minDistance) {
                            minDistance = distance;
                            closestPointIndex = i;
                        }
                    } catch (error) {
                        console.warn(`Error processing point at index ${i}:`, error);
                        continue;
                    }
                }

                if (closestPointIndex >= 0 &&
                    goalDataset.data[closestPointIndex] &&
                    goalDataset.data[closestPointIndex].y !== null &&
                    goalDataset.data[closestPointIndex].y !== undefined) {

                    const goalValue = goalDataset.data[closestPointIndex].y;

                    try {
                        const goalYPixel = chart.scales.y.getPixelForValue(goalValue);
                        const distanceToLine = Math.abs(y - goalYPixel);

                        let isWeeklyPoint = false;
                        let weekNumber = null;

                        if (window.weeklyGoalWeights && Array.isArray(window.weeklyGoalWeights) && window.weeklyGoalWeights.length > 0) {
                            const weeklyPoint = window.weeklyGoalWeights.find(w => w && w.index === closestPointIndex);
                            if (weeklyPoint) {
                                isWeeklyPoint = true;
                                weekNumber = weeklyPoint.week;
                            }
                        }

                        if (distanceToLine < 10 && minDistance < 30) {
                            return {
                                isOver: true,
                                pointIndex: closestPointIndex,
                                goalValue: goalValue,
                                isWeeklyPoint: isWeeklyPoint,
                                weekNumber: weekNumber
                            };
                        }
                    } catch (error) {
                        console.warn('Error calculating goal line position:', error);
                        return { isOver: false };
                    }
                }
            } catch (error) {
                console.warn('Error in isOverGoalLine:', error);
            }

            return { isOver: false };
        }

        function handleMouseMove(event, chart) {
            try {
                // Verify chart is valid before proceeding
                if (!chart || !chart.data || !chart.data.datasets || !chart.data.datasets.length) {
                    hideWeightTooltip();
                    return;
                }

                const goalLineCheck = isOverGoalLine(event, chart);

                if (goalLineCheck && goalLineCheck.isOver) {
                    isHoveringGoalLine = true;

                    try {
                        showWeightTooltip(event, chart, goalLineCheck.pointIndex, true, goalLineCheck.goalValue);

                        if (goalLineCheck.isWeeklyPoint) {
                            if (typeof chart.setActiveElements === 'function') {
                                chart.setActiveElements([{
                                    datasetIndex: 1, // Goal dataset index
                                    index: goalLineCheck.pointIndex
                                }]);
                            }
                        } else {
                            if (typeof chart.setActiveElements === 'function') {
                                chart.setActiveElements([]);
                            }
                        }

                        if (typeof chart.update === 'function') {
                            chart.update('none');
                        }
                    } catch (error) {
                        console.warn('Error handling goal line hover:', error);
                        hideWeightTooltip();
                    }
                } else {
                    isHoveringGoalLine = false;

                    // Check if chart is properly initialized with data and elements
                    if (!chart || !chart.data || !chart.data.datasets ||
                        !chart.data.datasets.length || !chart.getActiveElements) {
                        hideWeightTooltip();
                        return;
                    }

                    try {
                        // Safely try to get elements at event mode
                        const points = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);

                        if (points && points.length > 0) {
                            const pointIndex = points[0].index;

                            showWeightTooltip(event, chart, pointIndex);

                            chart.setActiveElements([{
                                datasetIndex: points[0].datasetIndex,
                                index: pointIndex
                            }]);
                            chart.update('none'); // Update without animation
                        } else {
                            hideWeightTooltip();
                        }
                    } catch (error) {
                        console.warn('Error getting chart elements:', error);
                        hideWeightTooltip();
                    }
                }
            } catch (error) {
                console.warn('Error in handleMouseMove:', error);
                hideWeightTooltip();
            }
        }

        function handleMouseOut(chart) {
            hideWeightTooltip();
            if (chart && typeof chart.setActiveElements === 'function') {
                chart.setActiveElements([]);
                if (typeof chart.update === 'function') {
                    chart.update('none');
                }
            }
        }
    };

    // Set up an interval to check for the chart and attach tooltip events
    // This helps ensure tooltips work even if the chart is redrawn or updated
    const tooltipAttachInterval = setInterval(function() {
        if (window.weightGoalChart && typeof window.attachWeightChartTooltipEvents === 'function') {
            window.attachWeightChartTooltipEvents(window.weightGoalChart);
        }
    }, 2000); // Check every 2 seconds

    // Clean up the interval after 30 seconds to avoid unnecessary processing
    setTimeout(function() {
        clearInterval(tooltipAttachInterval);
    }, 30000);
});
