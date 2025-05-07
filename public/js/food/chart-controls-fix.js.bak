/**
 * Chart Controls Fix
 * Moves the Reset Scale button alongside the X and Y axis scale controls
 */

(function() {
    // Function to fix the chart controls
    function fixChartControls() {
        console.log('[Chart Controls Fix] Fixing chart controls...');

        // Get the chart controls and axis controls
        const chartControls = document.querySelector('.chart-controls');
        const axisControls = document.querySelector('.axis-controls');

        if (!chartControls || !axisControls) {
            console.log('[Chart Controls Fix] Chart controls or axis controls not found');
            return;
        }

        // Get the reset scale button
        const resetScaleButton = chartControls.querySelector('#reset-scale-button');
        if (!resetScaleButton) {
            console.log('[Chart Controls Fix] Reset scale button not found');
            return;
        }

        // Move the reset scale button to the axis controls
        axisControls.appendChild(resetScaleButton);

        // Hide the chart controls container
        chartControls.style.display = 'none';

        // Style the axis controls
        axisControls.style.display = 'flex';
        axisControls.style.flexWrap = 'wrap';
        axisControls.style.gap = '20px';
        axisControls.style.marginBottom = '15px';
        axisControls.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
        axisControls.style.padding = '10px';
        axisControls.style.borderRadius = '4px';
        axisControls.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        axisControls.style.alignItems = 'center';
        axisControls.style.justifyContent = 'space-between';

        // Find the existing reset button container
        const resetButtonContainer = axisControls.querySelector('.reset-button-container');
        if (resetButtonContainer) {
            // Move the reset button to the container
            resetButtonContainer.appendChild(resetScaleButton);

            // Style the container
            resetButtonContainer.style.display = 'flex';
            resetButtonContainer.style.alignItems = 'center';
            resetButtonContainer.style.justifyContent = 'flex-end';
            resetButtonContainer.style.marginLeft = 'auto';
            resetButtonContainer.style.paddingRight = '10px';
            resetButtonContainer.style.flex = '0 0 auto';
        } else {
            // If container doesn't exist, create one and insert it between the axis controls
            const newResetButtonContainer = document.createElement('div');
            newResetButtonContainer.className = 'reset-button-container';
            newResetButtonContainer.style.display = 'flex';
            newResetButtonContainer.style.alignItems = 'center';
            newResetButtonContainer.style.justifyContent = 'flex-end';
            newResetButtonContainer.style.marginLeft = 'auto';
            newResetButtonContainer.style.paddingRight = '10px';
            newResetButtonContainer.style.flex = '0 0 auto';

            // Move the reset button to the container
            newResetButtonContainer.appendChild(resetScaleButton);

            // Always append the reset button container at the end
            axisControls.appendChild(newResetButtonContainer);
        }

        // Style the reset button
        resetScaleButton.style.backgroundColor = '#ffffff';
        resetScaleButton.style.color = '#121212';
        resetScaleButton.style.border = 'none';
        resetScaleButton.style.padding = '8px 16px'; // Slightly wider padding
        resetScaleButton.style.borderRadius = '4px';
        resetScaleButton.style.cursor = 'pointer';
        resetScaleButton.style.fontSize = '0.85em';
        resetScaleButton.style.transition = 'all 0.2s ease';
        resetScaleButton.style.whiteSpace = 'nowrap';
        resetScaleButton.style.height = '32px';
        resetScaleButton.style.display = 'flex';
        resetScaleButton.style.alignItems = 'center';
        resetScaleButton.style.justifyContent = 'center';
        resetScaleButton.style.margin = '0'; // No margin
        resetScaleButton.style.boxShadow = '0 2px 5px rgba(255, 255, 255, 0.2)';
        resetScaleButton.style.fontWeight = 'normal';

        // Add hover effect to the reset button
        resetScaleButton.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 8px rgba(255, 255, 255, 0.3)';
        });

        resetScaleButton.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 5px rgba(255, 255, 255, 0.2)';
        });

        // Style the axis controls
        const axisControlElements = axisControls.querySelectorAll('.axis-control');
        axisControlElements.forEach(control => {
            control.style.display = 'flex';
            control.style.alignItems = 'center';
            control.style.gap = '10px';
            control.style.flex = '1';
            control.style.minWidth = '200px';

            // Style the labels
            const label = control.querySelector('label');
            if (label) {
                label.style.fontSize = '0.9em';
                label.style.fontWeight = '500';
                label.style.color = '#ffffff';
                label.style.width = '90px';
            }

            // Style the range inputs
            const rangeInput = control.querySelector('input[type="range"]');
            if (rangeInput) {
                rangeInput.style.flex = '1';
                rangeInput.style.cursor = 'pointer';
                rangeInput.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                rangeInput.style.borderRadius = '4px';
            }

            // Style the scale value
            const scaleValue = control.querySelector('.scale-value');
            if (scaleValue) {
                scaleValue.style.fontSize = '0.9em';
                scaleValue.style.color = '#ffffff';
                scaleValue.style.fontWeight = 'bold';
                scaleValue.style.width = '40px';
                scaleValue.style.textAlign = 'right';
            }
        });

        console.log('[Chart Controls Fix] Chart controls fixed');
    }

    // Initialize when the DOM is ready
    function init() {
        console.log('[Chart Controls Fix] Initializing...');

        // Fix the chart controls
        setTimeout(fixChartControls, 500); // Delay to ensure the DOM is fully loaded

        console.log('[Chart Controls Fix] Initialized');
    }

    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
