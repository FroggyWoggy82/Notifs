/**
 * Tooltip Fix - Ensures tooltips are properly attached to the weight chart
 * This script runs independently to fix tooltip issues with the weight chart
 */

(function() {
    console.log('[Tooltip Fix] Initializing tooltip fix...');

    // Create a tooltip element if it doesn't exist
    function ensureTooltipElement() {
        if (!document.getElementById('weight-chart-tooltip')) {
            console.log('[Tooltip Fix] Creating tooltip element');
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
        }
    }

    // Show tooltip function
    function showTooltip(event, chart, pointIndex, isGoalLine = false, goalValue = null) {
        const tooltip = document.getElementById('weight-chart-tooltip');
        if (!tooltip) {
            console.warn('[Tooltip Fix] Tooltip element not found');
            return;
        }

        if (!chart || !chart.data || !chart.data.datasets) {
            console.warn('[Tooltip Fix] Invalid chart data');
            return;
        }

        const label = chart.data.labels[pointIndex];
        if (!label) {
            console.warn('[Tooltip Fix] Invalid label for point index:', pointIndex);
            return;
        }

        // Format the date
        let formattedDate = label;
        try {
            const date = new Date(label);
            if (!isNaN(date.getTime())) {
                formattedDate = date.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                });
            }
        } catch (e) {
            console.warn('[Tooltip Fix] Error formatting date:', e);
        }

        // Get datasets
        const actualDataset = chart.data.datasets.find(ds => ds.label && ds.label.includes('Actual'));
        const goalDataset = chart.data.datasets.find(ds => ds.label && ds.label.includes('Goal'));

        // Check if we have actual weight data for this point
        const hasActualWeight = actualDataset &&
                               actualDataset.data &&
                               actualDataset.data[pointIndex] &&
                               actualDataset.data[pointIndex].y !== null &&
                               actualDataset.data[pointIndex].y !== undefined;

        // Check if we have goal weight data for this point
        const hasGoalWeight = goalDataset &&
                             goalDataset.data &&
                             goalDataset.data[pointIndex] &&
                             goalDataset.data[pointIndex].y !== null &&
                             goalDataset.data[pointIndex].y !== undefined;

        // Build tooltip content
        let tooltipContent = `<div style="font-weight: bold; margin-bottom: 5px;">${formattedDate}</div>`;

        // Add actual weight if available
        if (hasActualWeight) {
            const actualWeight = parseFloat(actualDataset.data[pointIndex].y).toFixed(2);
            tooltipContent += `<div style="color: #3498db; font-weight: bold;">Actual Weight: ${actualWeight} lbs</div>`;
        }

        // Add goal weight if available
        if (hasGoalWeight || (isGoalLine && goalValue !== null)) {
            const goalWeight = hasGoalWeight
                ? parseFloat(goalDataset.data[pointIndex].y).toFixed(2)
                : parseFloat(goalValue).toFixed(2);
            tooltipContent += `<div style="color: #e74c3c; font-weight: bold;">Target Weight: ${goalWeight} lbs</div>`;
        }

        // If we have both actual and goal weights, add comparison
        if (hasActualWeight && (hasGoalWeight || (isGoalLine && goalValue !== null))) {
            const actualWeight = parseFloat(actualDataset.data[pointIndex].y);
            const goalWeight = hasGoalWeight
                ? parseFloat(goalDataset.data[pointIndex].y)
                : parseFloat(goalValue);

            const diff = actualWeight - goalWeight;
            const sign = diff >= 0 ? '+' : '';
            const diffColor = diff > 0 ? '#e67e22' : '#27ae60'; // Orange for above goal, green for below/at goal

            tooltipContent += `
                <div style="margin-top: 5px; padding-top: 5px; border-top: 1px solid rgba(255,255,255,0.2);">
                    <div style="color: ${diffColor}; font-weight: bold;">${sign}${Math.abs(diff).toFixed(2)} lbs ${diff >= 0 ? 'above' : 'below'} target</div>
                </div>
            `;
        }

        // Set tooltip content
        tooltip.innerHTML = tooltipContent;

        // Position tooltip
        const canvas = chart.canvas;
        const rect = canvas.getBoundingClientRect();

        const xPos = chart.scales.x.getPixelForValue(pointIndex);

        let yPos;
        if (isGoalLine && goalValue !== null) {
            yPos = chart.scales.y.getPixelForValue(goalValue);
        } else if (hasActualWeight) {
            yPos = chart.scales.y.getPixelForValue(actualDataset.data[pointIndex].y);
        } else if (hasGoalWeight) {
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
    }

    // Hide tooltip function
    function hideTooltip() {
        const tooltip = document.getElementById('weight-chart-tooltip');
        if (tooltip) {
            tooltip.style.opacity = '0';
        }
    }

    // Check if a point is over the goal line
    function isOverGoalLine(event, chart) {
        if (!chart || !chart.scales || !chart.scales.y || !chart.canvas || !chart.data || !chart.data.datasets) {
            return { isOver: false };
        }

        try {
            const rect = chart.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const goalDataset = chart.data.datasets.find(ds => ds.label && ds.label.includes('Goal'));
            if (!goalDataset || !goalDataset.data) return { isOver: false };

            const mouseYValue = chart.scales.y.getValueForPixel(y);

            let closestPointIndex = -1;
            let minDistance = Infinity;

            for (let i = 0; i < goalDataset.data.length; i++) {
                const pointX = chart.scales.x.getPixelForValue(i);
                const distance = Math.abs(x - pointX);

                if (distance < minDistance) {
                    minDistance = distance;
                    closestPointIndex = i;
                }
            }

            if (closestPointIndex >= 0 &&
                goalDataset.data[closestPointIndex] &&
                goalDataset.data[closestPointIndex].y !== null &&
                goalDataset.data[closestPointIndex].y !== undefined) {

                const goalValue = goalDataset.data[closestPointIndex].y;
                const goalYPixel = chart.scales.y.getPixelForValue(goalValue);
                const distanceToLine = Math.abs(y - goalYPixel);

                if (distanceToLine < 10 && minDistance < 30) {
                    return {
                        isOver: true,
                        pointIndex: closestPointIndex,
                        goalValue: goalValue
                    };
                }
            }
        } catch (error) {
            console.warn('[Tooltip Fix] Error in isOverGoalLine:', error);
        }

        return { isOver: false };
    }

    // Handle mouse move event
    function handleMouseMove(event, chart) {
        try {
            if (!chart || !chart.data || !chart.data.datasets || !chart.data.datasets.length) {
                hideTooltip();
                return;
            }

            const goalLineCheck = isOverGoalLine(event, chart);

            if (goalLineCheck && goalLineCheck.isOver) {
                showTooltip(event, chart, goalLineCheck.pointIndex, true, goalLineCheck.goalValue);

                if (typeof chart.setActiveElements === 'function') {
                    chart.setActiveElements([{
                        datasetIndex: 1, // Goal dataset index
                        index: goalLineCheck.pointIndex
                    }]);
                    chart.update('none');
                }
            } else {
                try {
                    const points = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);

                    if (points && points.length > 0) {
                        const pointIndex = points[0].index;

                        showTooltip(event, chart, pointIndex);

                        if (typeof chart.setActiveElements === 'function') {
                            chart.setActiveElements([{
                                datasetIndex: points[0].datasetIndex,
                                index: pointIndex
                            }]);
                            chart.update('none');
                        }
                    } else {
                        hideTooltip();
                    }
                } catch (error) {
                    console.warn('[Tooltip Fix] Error getting chart elements:', error);
                    hideTooltip();
                }
            }
        } catch (error) {
            console.warn('[Tooltip Fix] Error in handleMouseMove:', error);
            hideTooltip();
        }
    }

    // Handle mouse out event
    function handleMouseOut(chart) {
        hideTooltip();
        if (chart && typeof chart.setActiveElements === 'function') {
            chart.setActiveElements([]);
            chart.update('none');
        }
    }

    // Attach tooltip events to chart
    function attachTooltipEvents(chart) {
        if (!chart) {
            console.warn('[Tooltip Fix] Invalid chart');
            return;
        }

        if (!chart.canvas) {
            console.warn('[Tooltip Fix] Chart canvas is null, will retry later');
            // Schedule a retry
            setTimeout(() => {
                if (chart && chart.canvas) {
                    attachTooltipEvents(chart);
                }
            }, 500);
            return;
        }

        // Attaching tooltip events to chart

        const canvas = chart.canvas;

        try {
            // Store event handlers in the canvas element to be able to remove them later
            canvas._tooltipMouseMoveHandler = function(event) { handleMouseMove(event, chart); };
            canvas._tooltipMouseOutHandler = function() { handleMouseOut(chart); };

            // Remove any existing event listeners
            try {
                canvas.removeEventListener('mousemove', canvas._tooltipMouseMoveHandler);
                canvas.removeEventListener('mouseout', canvas._tooltipMouseOutHandler);
            } catch (e) {
                console.warn('[Tooltip Fix] Error removing event listeners:', e);
            }

            // Add event listeners
            canvas.addEventListener('mousemove', canvas._tooltipMouseMoveHandler);
            canvas.addEventListener('mouseout', canvas._tooltipMouseOutHandler);

            // Tooltip events attached successfully
        } catch (error) {
            console.error('[Tooltip Fix] Error attaching tooltip events:', error);
        }
    }

    // Initialize tooltip fix
    function initTooltipFix() {
        ensureTooltipElement();

        // Define global function to attach tooltip events
        window.fixWeightChartTooltips = function(chart) {
            if (chart) {
                attachTooltipEvents(chart);

                // Use the weekly goal points fix if available
                setTimeout(() => {
                    if (window.customGoalWeights && typeof window.customGoalWeights.ensureWeeklyGoalPoints === 'function') {
                        console.log('[Tooltip Fix] Using weekly goal points fix');
                        window.customGoalWeights.ensureWeeklyGoalPoints();
                    } else {
                        // Weekly goal points fix not available
                    }
                }, 200);
            } else if (window.weightGoalChart) {
                attachTooltipEvents(window.weightGoalChart);

                // Use the weekly goal points fix if available
                setTimeout(() => {
                    if (window.customGoalWeights && typeof window.customGoalWeights.ensureWeeklyGoalPoints === 'function') {
                        console.log('[Tooltip Fix] Using weekly goal points fix');
                        window.customGoalWeights.ensureWeeklyGoalPoints();
                    } else {
                        // Weekly goal points fix not available
                    }
                }, 200);
            } else {
                console.warn('[Tooltip Fix] No chart available to attach tooltips');
            }
        };

        // Set up an interval to check for the chart and attach tooltip events
        const tooltipFixInterval = setInterval(function() {
            if (window.weightGoalChart) {
                window.fixWeightChartTooltips(window.weightGoalChart);

                // Dispatch an event to notify other scripts that the chart has been updated
                document.dispatchEvent(new CustomEvent('weightChartUpdated'));
            }
        }, 1000); // Check every second

        // Clean up the interval after 30 seconds
        setTimeout(function() {
            clearInterval(tooltipFixInterval);
        }, 30000);

        console.log('[Tooltip Fix] Tooltip fix initialized');
    }

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
            console.log('[Tooltip Fix] Added weekly goal point styles');
        }
    }

    // Run initialization when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            addWeeklyGoalPointStyles();
            initTooltipFix();
        });
    } else {
        addWeeklyGoalPointStyles();
        initTooltipFix();
    }
})();
