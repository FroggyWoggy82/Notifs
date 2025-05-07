/**
 * Chart Controls Fix
 * Moves the Reset Scale button alongside the X and Y axis scale controls
 */

(function() {

    function fixChartControls() {
        console.log('[Chart Controls Fix] Fixing chart controls...');

        const chartControls = document.querySelector('.chart-controls');
        const axisControls = document.querySelector('.axis-controls');

        if (!chartControls || !axisControls) {
            console.log('[Chart Controls Fix] Chart controls or axis controls not found');
            return;
        }

        const resetScaleButton = chartControls.querySelector('#reset-scale-button');
        if (!resetScaleButton) {
            console.log('[Chart Controls Fix] Reset scale button not found');
            return;
        }

        axisControls.appendChild(resetScaleButton);

        chartControls.style.display = 'none';

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

        const resetButtonContainer = axisControls.querySelector('.reset-button-container');
        if (resetButtonContainer) {

            resetButtonContainer.appendChild(resetScaleButton);

            resetButtonContainer.style.display = 'flex';
            resetButtonContainer.style.alignItems = 'center';
            resetButtonContainer.style.justifyContent = 'flex-end';
            resetButtonContainer.style.marginLeft = 'auto';
            resetButtonContainer.style.paddingRight = '10px';
            resetButtonContainer.style.flex = '0 0 auto';
        } else {

            const newResetButtonContainer = document.createElement('div');
            newResetButtonContainer.className = 'reset-button-container';
            newResetButtonContainer.style.display = 'flex';
            newResetButtonContainer.style.alignItems = 'center';
            newResetButtonContainer.style.justifyContent = 'flex-end';
            newResetButtonContainer.style.marginLeft = 'auto';
            newResetButtonContainer.style.paddingRight = '10px';
            newResetButtonContainer.style.flex = '0 0 auto';

            newResetButtonContainer.appendChild(resetScaleButton);

            axisControls.appendChild(newResetButtonContainer);
        }

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

        resetScaleButton.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 8px rgba(255, 255, 255, 0.3)';
        });

        resetScaleButton.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 5px rgba(255, 255, 255, 0.2)';
        });

        const axisControlElements = axisControls.querySelectorAll('.axis-control');
        axisControlElements.forEach(control => {
            control.style.display = 'flex';
            control.style.alignItems = 'center';
            control.style.gap = '10px';
            control.style.flex = '1';
            control.style.minWidth = '200px';

            const label = control.querySelector('label');
            if (label) {
                label.style.fontSize = '0.9em';
                label.style.fontWeight = '500';
                label.style.color = '#ffffff';
                label.style.width = '90px';
            }

            const rangeInput = control.querySelector('input[type="range"]');
            if (rangeInput) {
                rangeInput.style.flex = '1';
                rangeInput.style.cursor = 'pointer';
                rangeInput.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                rangeInput.style.borderRadius = '4px';
            }

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

    function init() {
        console.log('[Chart Controls Fix] Initializing...');

        setTimeout(fixChartControls, 500); // Delay to ensure the DOM is fully loaded

        console.log('[Chart Controls Fix] Initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
