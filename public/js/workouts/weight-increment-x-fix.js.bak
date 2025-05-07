/**
 * Weight Increment X Button Fix
 * This script removes any X buttons from the Weight Increment label in the exercise options menu
 */

(function() {
    // Function to remove X buttons from Weight Increment label
    function removeXButtonsFromWeightIncrementLabel() {
        // Find all Weight Increment labels
        const weightIncrementLabels = document.querySelectorAll('.weight-increment-label');

        weightIncrementLabels.forEach(label => {
            // Remove any buttons inside the label
            const buttons = label.querySelectorAll('button');
            buttons.forEach(button => {
                button.remove();
            });

            // Remove any spans that might contain X characters
            const spans = label.querySelectorAll('span');
            spans.forEach(span => {
                span.remove();
            });

            // Remove any divs that might contain X characters
            const divs = label.querySelectorAll('div');
            divs.forEach(div => {
                div.remove();
            });

            // Set the text content directly to ensure it's just the label text
            label.textContent = 'Weight Increment:';

            // Add a class to mark it as fixed
            label.classList.add('x-button-fixed');
        });
    }

    // Function to observe DOM changes and fix any new Weight Increment labels
    function setupObserver() {
        // Create a MutationObserver to watch for DOM changes
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                // Check if any nodes were added
                if (mutation.addedNodes.length) {
                    // Check if any of the added nodes contain Weight Increment labels
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            // Check if this node is a Weight Increment label
                            if (node.classList && node.classList.contains('weight-increment-label')) {
                                // Remove X buttons from this label
                                setTimeout(() => {
                                    if (node.querySelectorAll('button').length > 0) {
                                        node.textContent = 'Weight Increment:';
                                        node.classList.add('x-button-fixed');
                                    }
                                }, 0);
                            }

                            // Check if this node contains Weight Increment labels
                            const labels = node.querySelectorAll('.weight-increment-label');
                            if (labels.length) {
                                // Remove X buttons from these labels
                                setTimeout(() => {
                                    removeXButtonsFromWeightIncrementLabel();
                                }, 0);
                            }
                        }
                    });
                }
            });
        });

        // Start observing the document body for DOM changes
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Function to handle options menu opening
    function handleOptionsMenuToggle() {
        // Listen for clicks on the options button
        document.addEventListener('click', event => {
            const target = event.target;

            // Check if the clicked element is an options button
            if (target.classList.contains('btn-exercise-options')) {
                // Wait for the menu to open
                setTimeout(() => {
                    // Remove X buttons from Weight Increment labels
                    removeXButtonsFromWeightIncrementLabel();
                }, 10);
            }

            // Also check if any menu is currently visible and fix it
            const visibleMenus = document.querySelectorAll('.exercise-options-menu.show');
            if (visibleMenus.length) {
                // Remove X buttons from Weight Increment labels
                setTimeout(() => {
                    removeXButtonsFromWeightIncrementLabel();
                }, 10);
            }
        });
    }

    // Run the fix on page load
    document.addEventListener('DOMContentLoaded', () => {
        // Initial fix for any existing Weight Increment labels
        removeXButtonsFromWeightIncrementLabel();

        // Setup observer for future DOM changes
        setupObserver();

        // Setup handler for options menu toggle
        handleOptionsMenuToggle();
    });

    // Also run the fix now in case the DOM is already loaded
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        // Initial fix for any existing Weight Increment labels
        removeXButtonsFromWeightIncrementLabel();

        // Setup observer for future DOM changes
        setupObserver();

        // Setup handler for options menu toggle
        handleOptionsMenuToggle();
    }
})();
