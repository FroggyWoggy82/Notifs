/**
 * Goal Checkmark Alignment Fix
 * This script ensures the checkmark in the GOAL column is properly aligned with the checkboxes
 * using CSS classes instead of inline styles for better performance.
 */

(function() {
    // Function to add alignment classes to elements
    function alignCheckmarks() {
        console.log('[Goal Checkmark Alignment] Aligning checkmarks with checkboxes...');

        // Add the alignment class to the body to enable CSS rules
        document.body.classList.add('align-checkmarks');

        // Handle completed checkboxes
        const checkboxes = document.querySelectorAll('.set-complete-toggle.completed');
        checkboxes.forEach(checkbox => {
            // Only modify if not already processed
            if (!checkbox.classList.contains('processed-checkmark')) {
                checkbox.classList.add('processed-checkmark');

                // Clear any existing content
                checkbox.innerHTML = '';

                // Add a centered checkmark
                const checkmark = document.createElement('span');
                checkmark.textContent = '✓';
                checkmark.classList.add('centered-checkmark');
                checkbox.appendChild(checkmark);
            }
        });
    }

    // Function to observe DOM changes with debouncing
    function setupObserver() {
        // Debounce function to prevent excessive calls
        function debounce(func, wait) {
            let timeout;
            return function() {
                const context = this;
                const args = arguments;
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(context, args), wait);
            };
        }

        // Create a debounced version of alignCheckmarks
        const debouncedAlign = debounce(alignCheckmarks, 100);

        // Create a MutationObserver with limited scope
        const observer = new MutationObserver(function(mutations) {
            let shouldRealign = false;

            // Check if any relevant mutations occurred
            for (let i = 0; i < mutations.length && !shouldRealign; i++) {
                const mutation = mutations[i];

                // Check for added nodes
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    shouldRealign = true;
                }

                // Check for class changes on relevant elements
                if (mutation.type === 'attributes' &&
                    mutation.attributeName === 'class' &&
                    (mutation.target.classList.contains('set-complete-toggle') ||
                     mutation.target.classList.contains('goal-target'))) {
                    shouldRealign = true;
                }
            }

            // If relevant changes were detected, realign the checkmarks
            if (shouldRealign) {
                debouncedAlign();
            }
        });

        // Start observing the exercise list with optimized options
        const exerciseList = document.getElementById('current-exercise-list');
        if (exerciseList) {
            observer.observe(exerciseList, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class'] // Only observe class changes
            });
            console.log('[Goal Checkmark Alignment] Observer set up for exercise list');
        }

        // Clean up the observer when the page is unloaded
        window.addEventListener('beforeunload', () => {
            observer.disconnect();
        });
    }

    // Initialize on DOM ready
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
})();
