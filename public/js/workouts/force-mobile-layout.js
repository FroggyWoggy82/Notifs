/**
 * Force Mobile Layout
 * This script applies inline styles directly to workout elements to ensure
 * they have the correct size on mobile devices, overriding any conflicting CSS.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Only run on mobile devices
    if (window.innerWidth <= 599) {
        console.log('Applying forced mobile layout styles');

        // Function to apply styles to elements
        function applyForcedStyles() {
            // Create a grid layout for better alignment
            const setRows = document.querySelectorAll('#current-exercise-list .set-row');
            setRows.forEach(row => {
                // First, clear any existing children styles
                Array.from(row.children).forEach(child => {
                    child.style.position = '';
                    child.style.left = '';
                    child.style.top = '';
                });

                // Apply grid layout
                row.style.display = 'grid';
                row.style.gridTemplateColumns = '25px 65px 30px 30px 65px 25px';
                row.style.alignItems = 'center';
                row.style.width = '100%';
                row.style.gap = '0';
                row.style.justifyContent = 'space-between';
            });

            // Style column headers to match the grid
            const columnHeaders = document.querySelectorAll('.column-headers');
            columnHeaders.forEach(header => {
                header.style.display = 'grid';
                header.style.gridTemplateColumns = '25px 65px 30px 30px 65px 25px';
                header.style.alignItems = 'center';
                header.style.width = '100%';
                header.style.gap = '0';
                header.style.justifyContent = 'space-between';
            });

            // Style set numbers
            const setNumbers = document.querySelectorAll('.set-row .set-number');
            setNumbers.forEach(num => {
                num.style.width = '25px';
                num.style.textAlign = 'center';
                num.style.fontSize = '0.7rem';
                num.style.gridColumn = '1';
            });

            // Style previous logs
            const previousLogs = document.querySelectorAll('.set-row .previous-log');
            previousLogs.forEach(log => {
                log.style.width = '65px';
                log.style.fontSize = '0.7rem';
                log.style.textAlign = 'center';
                log.style.whiteSpace = 'nowrap';
                log.style.overflow = 'visible';
                log.style.textOverflow = 'ellipsis';
                log.style.gridColumn = '2';
                log.style.display = 'flex';
                log.style.alignItems = 'center';
                log.style.justifyContent = 'center';
            });

            // Style weight inputs
            const weightInputs = document.querySelectorAll('.set-row .weight-input');
            weightInputs.forEach(input => {
                input.style.width = '30px';
                input.style.padding = '0';
                input.style.textAlign = 'center';
                input.style.fontSize = '0.7rem';
                input.style.justifySelf = 'center';
                input.style.gridColumn = '3';
            });

            // Style reps inputs
            const repsInputs = document.querySelectorAll('.set-row .reps-input');
            repsInputs.forEach(input => {
                input.style.width = '30px';
                input.style.padding = '0';
                input.style.textAlign = 'center';
                input.style.fontSize = '0.7rem';
                input.style.justifySelf = 'center';
                input.style.gridColumn = '4';
            });

            // Style goal targets
            const goalTargets = document.querySelectorAll('.set-row .goal-target');
            goalTargets.forEach(target => {
                target.style.width = '65px';
                target.style.fontSize = '0.7rem';
                target.style.textAlign = 'center';
                target.style.whiteSpace = 'nowrap';
                target.style.overflow = 'visible';
                target.style.textOverflow = 'ellipsis';
                target.style.gridColumn = '5';
                target.style.display = 'flex';
                target.style.alignItems = 'center';
                target.style.justifyContent = 'center';
            });

            // Style checkboxes/complete toggles
            const completeToggles = document.querySelectorAll('.set-row .set-complete-toggle');
            completeToggles.forEach(toggle => {
                toggle.style.width = '25px';
                toggle.style.height = '25px';
                toggle.style.display = 'flex';
                toggle.style.alignItems = 'center';
                toggle.style.justifyContent = 'center';
                toggle.style.justifySelf = 'center';
                toggle.style.gridColumn = '6';
            });

            // Style column header text
            const headerSpans = document.querySelectorAll('.column-headers span');
            headerSpans.forEach((span, index) => {
                span.style.textAlign = 'center';
                span.style.fontSize = '0.65rem';
                span.style.fontWeight = 'bold';
                span.style.justifySelf = 'center';
                span.style.gridColumn = (index + 1).toString();
                span.style.display = 'flex';
                span.style.alignItems = 'center';
                span.style.justifyContent = 'center';

                // Update column header text to be shorter
                if (index === 1 && span.textContent === 'Previous') {
                    span.textContent = 'Prev';
                } else if (index === 2 && span.textContent === 'Weight') {
                    span.textContent = 'Wt';
                }
            });

            console.log('Forced mobile layout styles applied');
        }

        // Apply styles immediately
        applyForcedStyles();

        // Also apply styles after a short delay to catch dynamically added elements
        setTimeout(applyForcedStyles, 500);

        // Apply styles whenever new exercises are added
        // This uses a MutationObserver to watch for changes to the DOM
        const exerciseList = document.getElementById('current-exercise-list');
        if (exerciseList) {
            const observer = new MutationObserver(function(mutations) {
                applyForcedStyles();
            });

            observer.observe(exerciseList, {
                childList: true,
                subtree: true
            });
        }
    }
});
