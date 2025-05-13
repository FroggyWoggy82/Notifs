/**
 * Chart Visibility Fix
 * Ensures the weight chart is properly displayed
 */

(function() {
    function fixChartVisibility() {
        console.log('[Chart Visibility Fix] Applying chart visibility fix...');

        // Get chart elements
        const weightGoalChartCanvas = document.getElementById('weight-goal-chart');
        const weightChartMessage = document.getElementById('weight-chart-message');
        const chartContainer = document.querySelector('.chart-container');

        if (!weightGoalChartCanvas) {
            console.log('[Chart Visibility Fix] Chart canvas not found');
            return;
        }

        if (!chartContainer) {
            console.log('[Chart Visibility Fix] Chart container not found');
            return;
        }

        // Make sure the chart container is visible
        chartContainer.style.position = 'relative';
        chartContainer.style.display = 'block';
        chartContainer.style.height = '450px';
        chartContainer.style.width = '100%';
        chartContainer.style.visibility = 'visible';
        chartContainer.style.backgroundColor = 'rgba(20, 20, 20, 0.8)';
        chartContainer.style.borderRadius = '4px';
        chartContainer.style.padding = '10px';
        chartContainer.style.marginTop = '20px';
        chartContainer.style.marginBottom = '20px';
        chartContainer.style.zIndex = '10'; // Ensure it's above other elements

        // Make sure the chart canvas is visible
        weightGoalChartCanvas.style.display = 'block';
        weightGoalChartCanvas.style.height = '400px';
        weightGoalChartCanvas.style.width = '100%';
        weightGoalChartCanvas.style.backgroundColor = 'rgba(20, 20, 20, 0.8)';
        weightGoalChartCanvas.style.borderRadius = '4px';
        weightGoalChartCanvas.style.zIndex = '5'; // Ensure it's properly stacked

        // Make sure the custom weights panel doesn't overlap the chart
        const customWeightsPanel = document.getElementById('custom-weights-panel');
        if (customWeightsPanel) {
            customWeightsPanel.style.position = 'relative';
            customWeightsPanel.style.zIndex = '15'; // Above the chart
        }

        // Hide message if chart is visible and has data
        if (weightChartMessage) {
            // Check if chart has data by looking at the chart instance
            const hasData = window.weightGoalChart &&
                            window.weightGoalChart.data &&
                            window.weightGoalChart.data.datasets &&
                            window.weightGoalChart.data.datasets.length > 0 &&
                            window.weightGoalChart.data.datasets[0].data &&
                            window.weightGoalChart.data.datasets[0].data.length > 0;

            if (hasData) {
                weightChartMessage.style.display = 'none';
            } else {
                weightChartMessage.style.display = 'block';
                weightChartMessage.style.padding = '10px';
                weightChartMessage.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                weightChartMessage.style.borderRadius = '4px';
                weightChartMessage.style.margin = '10px 0';
                weightChartMessage.textContent = 'Weight data needed to display graph.';
            }
        }

        // Force chart redraw if Chart.js is available
        if (window.Chart && window.weightGoalChart) {
            console.log('[Chart Visibility Fix] Forcing chart redraw');
            window.weightGoalChart.update();

            // Use our new tooltip fix function if available
            if (window.fixWeightChartTooltips && typeof window.fixWeightChartTooltips === 'function') {
                console.log('[Chart Visibility Fix] Using tooltip fix function');

                // Use multiple attempts with increasing delays to ensure tooltips are attached
                const delays = [100, 300, 600, 1000];
                delays.forEach((delay, index) => {
                    setTimeout(() => {
                        if (window.weightGoalChart) {
                            console.log(`[Chart Visibility Fix] Attaching tooltips attempt ${index + 1}`);
                            window.fixWeightChartTooltips(window.weightGoalChart);
                        }
                    }, delay);
                });
            } else {
                console.warn('[Chart Visibility Fix] Tooltip fix function not available');

                // Try to load the tooltip fix script if it's not already loaded
                if (!document.getElementById('tooltip-fix-script')) {
                    console.log('[Chart Visibility Fix] Attempting to load tooltip fix script');
                    const script = document.createElement('script');
                    script.id = 'tooltip-fix-script';
                    script.src = '/js/food/tooltip-fix.js';
                    script.onload = function() {
                        console.log('[Chart Visibility Fix] Tooltip fix script loaded');

                        // Use multiple attempts with increasing delays
                        const delays = [100, 300, 600, 1000];
                        delays.forEach((delay, index) => {
                            setTimeout(() => {
                                if (window.weightGoalChart && window.fixWeightChartTooltips &&
                                    typeof window.fixWeightChartTooltips === 'function') {
                                    console.log(`[Chart Visibility Fix] Attaching tooltips attempt ${index + 1} after script load`);
                                    window.fixWeightChartTooltips(window.weightGoalChart);
                                }
                            }, delay);
                        });
                    };
                    document.head.appendChild(script);
                }
            }
        }

        console.log('[Chart Visibility Fix] Chart visibility fix applied');
    }

    function init() {
        console.log('[Chart Visibility Fix] Initializing...');

        // Apply fix after a delay to ensure the DOM is fully loaded
        setTimeout(fixChartVisibility, 500);

        // Apply fix again after a longer delay to catch any dynamic changes
        setTimeout(fixChartVisibility, 2000);

        // Apply fix when weight goals are saved
        const saveButton = document.querySelector('button[id="save-all-weight-goals-btn"]');
        if (saveButton) {
            console.log('[Chart Visibility Fix] Adding event listener to save button');
            saveButton.addEventListener('click', function() {
                console.log('[Chart Visibility Fix] Save button clicked, applying fix');
                setTimeout(fixChartVisibility, 1000);
            });
        } else {
            // Try to find the save button by text content
            const allButtons = document.querySelectorAll('button');
            for (const button of allButtons) {
                if (button.textContent.trim() === 'Save' &&
                    button.closest('.weight-goal-section')) {
                    console.log('[Chart Visibility Fix] Found save button by text, adding event listener');
                    button.addEventListener('click', function() {
                        console.log('[Chart Visibility Fix] Save button clicked, applying fix');
                        setTimeout(fixChartVisibility, 1000);
                    });
                    break;
                }
            }
        }

        // Apply fix when the window is resized
        window.addEventListener('resize', fixChartVisibility);

        console.log('[Chart Visibility Fix] Initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
