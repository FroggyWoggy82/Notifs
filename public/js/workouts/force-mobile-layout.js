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
            // Find all weight inputs
            const weightInputs = document.querySelectorAll('.set-row .weight-input');
            weightInputs.forEach(input => {
                input.style.width = '20px';
                input.style.minWidth = '20px';
                input.style.maxWidth = '20px';
                input.style.padding = '0';
                input.style.textAlign = 'center';
                input.style.fontSize = '0.7rem';
            });

            // Find all reps inputs
            const repsInputs = document.querySelectorAll('.set-row .reps-input');
            repsInputs.forEach(input => {
                input.style.width = '20px';
                input.style.minWidth = '20px';
                input.style.maxWidth = '20px';
                input.style.padding = '0';
                input.style.textAlign = 'center';
                input.style.fontSize = '0.7rem';
            });

            // Find all set rows
            const setRows = document.querySelectorAll('#current-exercise-list .set-row');
            setRows.forEach(row => {
                row.style.display = 'flex';
                row.style.flexDirection = 'row';
                row.style.alignItems = 'center';
                row.style.justifyContent = 'space-between';
                row.style.gap = '2px';
                row.style.flexWrap = 'nowrap';
                row.style.width = '100%';
            });

            // Find all previous logs
            const previousLogs = document.querySelectorAll('.set-row .previous-log');
            previousLogs.forEach(log => {
                log.style.width = '75px';
                log.style.minWidth = '75px';
                log.style.maxWidth = '75px';
                log.style.fontSize = '0.7rem';
                log.style.textAlign = 'center';
                log.style.whiteSpace = 'nowrap';
                log.style.overflow = 'hidden';
                log.style.textOverflow = 'ellipsis';
            });

            // Find all goal targets
            const goalTargets = document.querySelectorAll('.set-row .goal-target');
            goalTargets.forEach(target => {
                target.style.width = '75px';
                target.style.minWidth = '75px';
                target.style.maxWidth = '75px';
                target.style.fontSize = '0.7rem';
                target.style.textAlign = 'center';
                target.style.whiteSpace = 'nowrap';
                target.style.overflow = 'hidden';
                target.style.textOverflow = 'ellipsis';
            });

            // Find all checkboxes/complete toggles
            const completeToggles = document.querySelectorAll('.set-row .set-complete-toggle');
            completeToggles.forEach(toggle => {
                toggle.style.width = '25px';
                toggle.style.minWidth = '25px';
                toggle.style.maxWidth = '25px';
                toggle.style.height = '25px';
                toggle.style.minHeight = '25px';
                toggle.style.alignSelf = 'center';
                toggle.style.marginLeft = 'auto';
                toggle.style.display = 'flex';
                toggle.style.alignItems = 'center';
                toggle.style.justifyContent = 'center';
            });

            // Find all column headers
            const columnHeaders = document.querySelectorAll('.column-headers');
            columnHeaders.forEach(header => {
                header.style.display = 'flex';
                header.style.flexDirection = 'row';
                header.style.alignItems = 'center';
                header.style.justifyContent = 'space-between';
                header.style.width = '100%';
                header.style.padding = '4px 2px';
            });

            // Find the checkmark column header
            const checkmarkHeaders = document.querySelectorAll('.column-headers span:nth-child(6)');
            checkmarkHeaders.forEach(header => {
                header.style.width = '25px';
                header.style.minWidth = '25px';
                header.style.maxWidth = '25px';
                header.style.textAlign = 'center';
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
