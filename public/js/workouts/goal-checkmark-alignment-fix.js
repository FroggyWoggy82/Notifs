/**
 * Goal Checkmark Alignment Fix
 * This script ensures the checkmark in the GOAL column is properly aligned with the checkboxes
 */

(function() {
    // Function to align the checkmark with the checkboxes
    function alignCheckmarks() {
        console.log('[Goal Checkmark Alignment] Aligning checkmarks with checkboxes...');

        // Get all checkboxes
        const checkboxes = document.querySelectorAll('.set-complete-toggle');

        // Get all checkmarks in the GOAL column
        const goalCheckmarks = document.querySelectorAll('.column-headers span:last-child');

        // Get all column headers
        const columnHeaders = document.querySelectorAll('.column-headers span');

        // Ensure the checkmarks are properly centered
        checkboxes.forEach(checkbox => {
            checkbox.style.display = 'flex';
            checkbox.style.alignItems = 'center';
            checkbox.style.justifyContent = 'center';
            checkbox.style.margin = '0 auto';
            checkbox.style.position = 'relative';

            // If this is a completed checkbox, ensure the checkmark is centered
            if (checkbox.classList.contains('completed')) {
                // Clear any existing content
                checkbox.innerHTML = '';

                // Add a centered checkmark
                const checkmark = document.createElement('span');
                checkmark.textContent = '✓';
                checkmark.style.position = 'absolute';
                checkmark.style.top = '50%';
                checkmark.style.left = '50%';
                checkmark.style.transform = 'translate(-50%, -50%)';
                checkmark.style.fontSize = '16px';
                checkmark.style.lineHeight = '1';
                checkbox.appendChild(checkmark);
            }
        });

        // Ensure all column headers are properly centered
        columnHeaders.forEach(header => {
            header.style.display = 'flex';
            header.style.alignItems = 'center';
            header.style.justifyContent = 'center';
            header.style.height = '100%';
        });

        // Ensure the goal column checkmarks are properly centered
        goalCheckmarks.forEach(checkmark => {
            checkmark.style.display = 'flex';
            checkmark.style.alignItems = 'center';
            checkmark.style.justifyContent = 'center';
            checkmark.style.height = '25px';
            checkmark.style.verticalAlign = 'middle';
        });

        // Get all goal targets
        const goalTargets = document.querySelectorAll('.goal-target');

        // Ensure the goal targets are properly centered
        goalTargets.forEach(target => {
            target.style.display = 'flex';
            target.style.alignItems = 'center';
            target.style.justifyContent = 'center';
            target.style.height = '25px';
        });
    }

    // Function to observe DOM changes and realign checkmarks when needed
    function setupObserver() {
        // Create a MutationObserver to watch for changes to the DOM
        const observer = new MutationObserver(function(mutations) {
            // Check if any mutations affected the exercise list
            const shouldRealign = mutations.some(mutation => {
                // Check if nodes were added to the exercise list
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    return true;
                }

                // Check if attributes were modified on relevant elements
                if (mutation.type === 'attributes' &&
                    (mutation.target.classList.contains('set-complete-toggle') ||
                     mutation.target.classList.contains('goal-target'))) {
                    return true;
                }

                return false;
            });

            // If relevant changes were detected, realign the checkmarks
            if (shouldRealign) {
                alignCheckmarks();
            }
        });

        // Start observing the exercise list
        const exerciseList = document.getElementById('current-exercise-list');
        if (exerciseList) {
            observer.observe(exerciseList, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class', 'style']
            });
            console.log('[Goal Checkmark Alignment] Observer set up for exercise list');
        }
    }

    // Run when the DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Goal Checkmark Alignment] DOM loaded');
        alignCheckmarks();
        setupObserver();
    });

    // Also run when the window is fully loaded
    window.addEventListener('load', function() {
        console.log('[Goal Checkmark Alignment] Window loaded');
        alignCheckmarks();
    });

    // Run again after a short delay to ensure all elements are rendered
    setTimeout(alignCheckmarks, 500);
    setTimeout(alignCheckmarks, 1000);
    setTimeout(alignCheckmarks, 2000);
})();
