// Custom tooltip implementation for weight chart
document.addEventListener('DOMContentLoaded', function() {
    // Create tooltip element
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

    // Function to show tooltip
    window.showWeightTooltip = function(event, chart, pointIndex) {
        if (!chart || !chart.data || !chart.data.datasets) return;

        // Get the label (date)
        const label = chart.data.labels[pointIndex];
        if (!label) return;

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
            console.error('Error formatting date:', e);
        }

        // Get data from both datasets if available
        let actualWeightInfo = '';
        let goalWeightInfo = '';
        let targetWeightInfo = '';
        const targetWeight = chart.options.targetWeight;

        // Find actual weight dataset
        const actualDataset = chart.data.datasets.find(ds => ds.label.includes('Actual'));
        if (actualDataset && actualDataset.data && actualDataset.data[pointIndex] &&
            actualDataset.data[pointIndex].y !== null && actualDataset.data[pointIndex].y !== undefined) {
            const actualWeight = parseFloat(actualDataset.data[pointIndex].y).toFixed(2);
            actualWeightInfo = `<div>Actual Weight: ${actualWeight} lbs</div>`;

            // Calculate difference from target if we have actual weight and target weight
            if (targetWeight !== null && targetWeight !== undefined && !isNaN(targetWeight)) {
                const diff = actualDataset.data[pointIndex].y - targetWeight;
                const sign = diff >= 0 ? '+' : '';
                targetWeightInfo = `<div>${sign}${diff.toFixed(2)} lbs from target</div>`;
            }
        }

        // Find goal weight dataset
        const goalDataset = chart.data.datasets.find(ds => ds.label.includes('Goal'));
        if (goalDataset && goalDataset.data && goalDataset.data[pointIndex] &&
            goalDataset.data[pointIndex].y !== null && goalDataset.data[pointIndex].y !== undefined) {
            const goalWeight = parseFloat(goalDataset.data[pointIndex].y).toFixed(2);
            goalWeightInfo = `<div>Goal Weight: ${goalWeight} lbs</div>`;
        }

        // Set tooltip content - combine all information
        tooltip.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">${formattedDate}</div>
            ${actualWeightInfo}
            ${goalWeightInfo}
            ${targetWeightInfo}
        `;

        // Get position for tooltip - use the actual dataset point if available
        const canvas = chart.canvas;
        const rect = canvas.getBoundingClientRect();

        // Find the x position based on the point index
        const xPos = chart.scales.x.getPixelForValue(pointIndex);

        // Find the y position - prefer actual weight if available
        let yPos;
        if (actualDataset && actualDataset.data && actualDataset.data[pointIndex] &&
            actualDataset.data[pointIndex].y !== null && actualDataset.data[pointIndex].y !== undefined) {
            yPos = chart.scales.y.getPixelForValue(actualDataset.data[pointIndex].y);
        } else if (goalDataset && goalDataset.data && goalDataset.data[pointIndex] &&
                   goalDataset.data[pointIndex].y !== null && goalDataset.data[pointIndex].y !== undefined) {
            yPos = chart.scales.y.getPixelForValue(goalDataset.data[pointIndex].y);
        } else {
            // Fallback if no valid point found
            return;
        }

        // Calculate absolute position
        const x = rect.left + window.pageXOffset + xPos;
        const y = rect.top + window.pageYOffset + yPos;

        // Position tooltip directly above the point
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y - 2}px`; // Position very close to the point
        tooltip.style.transform = 'translate(-50%, -100%)';
        tooltip.style.opacity = '1';
        tooltip.style.pointerEvents = 'none'; // Ensure tooltip doesn't interfere with mouse events
    };

    // Function to hide tooltip
    window.hideWeightTooltip = function() {
        tooltip.style.opacity = '0';
    };

    // Function to attach tooltip events to chart
    window.attachWeightChartTooltipEvents = function(chart) {
        if (!chart || !chart.canvas) return;

        const canvas = chart.canvas;

        // Remove any existing event listeners
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseout', handleMouseOut);

        // Add event listeners
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseout', handleMouseOut);

        function handleMouseMove(event) {
            // Use Chart.js built-in hover detection
            const points = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);

            if (points.length > 0) {
                // Get the point index (x-axis value)
                const pointIndex = points[0].index;

                // Show tooltip with combined information from all datasets
                showWeightTooltip(event, chart, pointIndex);

                // Highlight the point by setting the hover state
                chart.setActiveElements([{
                    datasetIndex: points[0].datasetIndex,
                    index: pointIndex
                }]);
                chart.update('none'); // Update without animation
            } else {
                hideWeightTooltip();
            }
        }

        function handleMouseOut() {
            hideWeightTooltip();
        }
    };
});
