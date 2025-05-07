/**
 * Label Size Fix
 * This script ensures the Weight Unit and Weight Increment labels have the same size
 */

(function() {
    // Function to fix the label sizes
    function fixLabelSizes() {
        // Find all weight unit and increment labels
        const weightUnitLabels = document.querySelectorAll('.weight-unit-label');
        const weightIncrementLabels = document.querySelectorAll('.weight-increment-text');

        // Apply consistent styling to weight unit labels
        weightUnitLabels.forEach(label => {
            label.style.fontSize = '16px';
            label.style.lineHeight = '1.4';
            label.style.fontWeight = 'normal';
            label.style.color = '#ffffff';
            label.style.textAlign = 'left';
            label.style.marginLeft = '0';
            label.style.marginRight = 'auto';
            label.style.marginBottom = '3px';
        });

        // Apply consistent styling to weight increment labels
        weightIncrementLabels.forEach(label => {
            label.style.fontSize = '16px';
            label.style.lineHeight = '1.4';
            label.style.fontWeight = 'normal';
            label.style.color = '#ffffff';
            label.style.textAlign = 'left';
            label.style.marginLeft = '0';
            label.style.marginRight = 'auto';
            label.style.marginBottom = '3px';
        });

        // Find all label containers and style them
        const labelContainers = document.querySelectorAll('.exercise-options-menu-label');
        labelContainers.forEach(container => {
            container.style.display = 'flex';
            container.style.justifyContent = 'space-between';
            container.style.alignItems = 'flex-start';
            container.style.width = '100%';
            container.style.marginBottom = '5px';
        });

        // Find all weight increment containers and style them
        const weightIncrementContainers = document.querySelectorAll('.weight-increment-container');
        weightIncrementContainers.forEach(container => {
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.alignItems = 'flex-start';
            container.style.marginLeft = 'auto';
            container.style.marginRight = '0';
        });

        // Find all exercise options menu rows and style them
        const exerciseOptionsMenuRows = document.querySelectorAll('.exercise-options-menu-row');
        exerciseOptionsMenuRows.forEach(row => {
            row.style.display = 'flex';
            row.style.justifyContent = 'space-between';
            row.style.marginBottom = '8px';
        });
    }

    // Function to observe DOM changes and fix label sizes
    function observeDOMChanges() {
        // Create a mutation observer
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                // Check if new nodes were added
                if (mutation.addedNodes.length) {
                    // Look for options menus in the added nodes
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            // Check if this node is an options menu
                            if (node.classList && node.classList.contains('exercise-options-menu')) {
                                // Fix label sizes in this menu
                                fixLabelSizes();
                            }

                            // Also check child nodes
                            const optionsMenus = node.querySelectorAll('.exercise-options-menu');
                            if (optionsMenus.length) {
                                fixLabelSizes();
                            }
                        }
                    });
                }
            });
        });

        // Start observing the document body
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
                    fixLabelSizes();
                }, 50);
            }

            // Also check if any menu is currently visible and fix it
            const visibleMenus = document.querySelectorAll('.exercise-options-menu.show');
            if (visibleMenus.length) {
                setTimeout(() => {
                    fixLabelSizes();
                }, 50);
            }
        });
    }

    // Initialize when the DOM is ready
    function init() {
        console.log('[Label Size Fix] Initializing...');

        // Fix label sizes for any existing menus
        fixLabelSizes();

        // Set up the options menu toggle handler
        handleOptionsMenuToggle();

        // Observe DOM changes to fix label sizes for new menus
        observeDOMChanges();

        console.log('[Label Size Fix] Initialized');
    }

    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
