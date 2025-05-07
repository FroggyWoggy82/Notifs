
document.addEventListener('DOMContentLoaded', function() {

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

                    formattedDate = "May 6, 2024";
                    console.log("Forcing first weekly point date to May 6, 2024");
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
        const targetWeight = chart.options.targetWeight;

        if (isGoalLine && goalValue !== null) {

            const formattedGoalWeight = parseFloat(goalValue).toFixed(2);

            let weeklyInfo = '';
            if (window.weeklyGoalWeights && window.weeklyGoalWeights.length > 0) {
                const weeklyPoint = window.weeklyGoalWeights.find(w => w.index === pointIndex);
                if (weeklyPoint) {
                    weeklyInfo = `<div style="color: #e74c3c; font-weight: bold;">Week ${weeklyPoint.week} Goal</div>`;
                }
            }


            if (window.weeklyGoalWeights && window.weeklyGoalWeights.length > 0) {
                const firstWeeklyPoint = window.weeklyGoalWeights.find(w => w.index === pointIndex && w.week === 0);
                if (firstWeeklyPoint) {
                    formattedDate = "May 6, 2024";
                    console.log("Forcing first weekly point date to May 6, 2024 in goal line tooltip");
                }
            }

            goalWeightInfo = `
                ${weeklyInfo}
                <div style="color: #e74c3c; font-weight: bold;">Goal Weight: ${formattedGoalWeight} lbs</div>
            `;

            if (window.mostRecentWeight && window.mostRecentWeight.weight !== null) {
                const recentWeight = parseFloat(window.mostRecentWeight.weight);
                const diff = recentWeight - goalValue;
                const sign = diff >= 0 ? '+' : '';
                const diffColor = diff > 0 ? '#e67e22' : '#27ae60'; // Orange for above goal, green for below/at goal

                let formattedDate = window.mostRecentWeight.date;
                try {
                    const date = new Date(window.mostRecentWeight.date);
                    if (!isNaN(date.getTime())) {
                        formattedDate = date.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                        });
                    }
                } catch (e) {
                    console.error('Error formatting date:', e);
                }

                goalWeightInfo += `
                    <div style="margin-top: 5px; padding-top: 5px; border-top: 1px solid rgba(255,255,255,0.2);">
                        <div>Current: ${recentWeight.toFixed(2)} lbs (${formattedDate})</div>
                        <div style="color: ${diffColor}; font-weight: bold;">${sign}${Math.abs(diff).toFixed(2)} lbs ${diff >= 0 ? 'above' : 'below'} goal</div>
                    </div>
                `;

                if (weeklyInfo) {

                    const needToLose = diff > 0 ? Math.abs(diff).toFixed(2) : 0;
                    const alreadyBelow = diff < 0 ? Math.abs(diff).toFixed(2) : 0;

                    if (diff > 0) {
                        goalWeightInfo += `
                            <div style="margin-top: 5px; background-color: rgba(230, 126, 34, 0.2); padding: 5px; border-radius: 4px;">
                                <div style="font-weight: bold;">Need to lose: ${needToLose} lbs</div>
                                <div style="font-size: 12px;">to reach this weekly goal</div>
                            </div>
                        `;
                    } else if (diff < 0) {
                        goalWeightInfo += `
                            <div style="margin-top: 5px; background-color: rgba(39, 174, 96, 0.2); padding: 5px; border-radius: 4px;">
                                <div style="font-weight: bold;">Already ${alreadyBelow} lbs below</div>
                                <div style="font-size: 12px;">this weekly goal!</div>
                            </div>
                        `;
                    } else {
                        goalWeightInfo += `
                            <div style="margin-top: 5px; background-color: rgba(52, 152, 219, 0.2); padding: 5px; border-radius: 4px;">
                                <div style="font-weight: bold;">Exactly on target!</div>
                            </div>
                        `;
                    }
                }
            }

            if (targetWeight !== null && targetWeight !== undefined && !isNaN(targetWeight)) {
                const diff = goalValue - targetWeight;
                const sign = diff >= 0 ? '+' : '';
                targetWeightInfo = `<div>${sign}${diff.toFixed(2)} lbs from target</div>`;
            }
        }

        const actualDataset = chart.data.datasets.find(ds => ds.label.includes('Actual'));
        if (actualDataset && actualDataset.data && actualDataset.data[pointIndex] &&
            actualDataset.data[pointIndex].y !== null && actualDataset.data[pointIndex].y !== undefined) {
            const actualWeight = parseFloat(actualDataset.data[pointIndex].y).toFixed(2);
            actualWeightInfo = `<div>Actual Weight: ${actualWeight} lbs</div>`;

            if (targetWeight !== null && targetWeight !== undefined && !isNaN(targetWeight)) {
                const diff = actualDataset.data[pointIndex].y - targetWeight;
                const sign = diff >= 0 ? '+' : '';
                targetWeightInfo = `<div>${sign}${diff.toFixed(2)} lbs from target</div>`;
            }
        }

        const goalDataset = chart.data.datasets.find(ds => ds.label.includes('Goal'));
        if (goalDataset && goalDataset.data && goalDataset.data[pointIndex] &&
            goalDataset.data[pointIndex].y !== null && goalDataset.data[pointIndex].y !== undefined) {
            const goalWeight = parseFloat(goalDataset.data[pointIndex].y).toFixed(2);
            goalWeightInfo = `<div>Goal Weight: ${goalWeight} lbs</div>`;
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

    window.attachWeightChartTooltipEvents = function(chart) {
        if (!chart || !chart.canvas) return;

        const canvas = chart.canvas;

        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseout', handleMouseOut);

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseout', handleMouseOut);

        function isOverGoalLine(event, chart) {
            if (!chart || !chart.options || !chart.scales || !chart.scales.y) return false;

            const rect = chart.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const goalDataset = chart.data.datasets.find(ds => ds.label.includes('Goal'));
            if (!goalDataset) return false;

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

                let isWeeklyPoint = false;
                let weekNumber = null;

                if (window.weeklyGoalWeights && window.weeklyGoalWeights.length > 0) {
                    const weeklyPoint = window.weeklyGoalWeights.find(w => w.index === closestPointIndex);
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
            }

            return { isOver: false };
        }

        function handleMouseMove(event) {

            const goalLineCheck = isOverGoalLine(event, chart);

            if (goalLineCheck.isOver) {

                isHoveringGoalLine = true;

                showWeightTooltip(event, chart, goalLineCheck.pointIndex, true, goalLineCheck.goalValue);

                if (goalLineCheck.isWeeklyPoint) {

                    chart.setActiveElements([{
                        datasetIndex: 1, // Goal dataset index
                        index: goalLineCheck.pointIndex
                    }]);
                } else {

                    chart.setActiveElements([]);
                }
                chart.update('none');
            } else {

                isHoveringGoalLine = false;

                const points = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);

                if (points.length > 0) {

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
            }
        }

        function handleMouseOut() {
            hideWeightTooltip();
        }
    };
});
