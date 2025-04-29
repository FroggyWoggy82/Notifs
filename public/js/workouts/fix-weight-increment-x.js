/**
 * Fix Weight Increment X
 * This script specifically targets and fixes the Weight Increment X issue
 */

(function() {
    // Wait for the DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFixWeightIncrementX);
    } else {
        initFixWeightIncrementX();
    }

    function initFixWeightIncrementX() {
        // Create a MutationObserver to watch for changes to the DOM
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        // Check if the added node is an element
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Look for weight increment containers
                            const containers = node.querySelectorAll('.weight-increment-container');
                            if (containers.length > 0) {
                                containers.forEach(fixWeightIncrementContainer);
                            }
                            
                            // If the node itself is a weight increment container
                            if (node.classList && node.classList.contains('weight-increment-container')) {
                                fixWeightIncrementContainer(node);
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
        
        // Fix any existing weight increment containers
        document.querySelectorAll('.weight-increment-container').forEach(fixWeightIncrementContainer);
        
        // Add a click event listener to the document to fix containers when options menus are opened
        document.addEventListener('click', event => {
            if (event.target.classList.contains('btn-exercise-options')) {
                // Wait for the menu to open
                setTimeout(() => {
                    const visibleMenus = document.querySelectorAll('.exercise-options-menu.show');
                    visibleMenus.forEach(menu => {
                        const containers = menu.querySelectorAll('.weight-increment-container');
                        containers.forEach(fixWeightIncrementContainer);
                    });
                }, 100);
            }
        });
    }
    
    function fixWeightIncrementContainer(container) {
        // Find all elements that might contain an X character
        const xElements = container.querySelectorAll('button, span, div');
        
        // Remove any elements that might contain an X character
        xElements.forEach(element => {
            if (element.textContent.includes('×') || element.textContent.includes('X')) {
                element.remove();
            }
        });
        
        // Find the label element
        const label = container.querySelector('.weight-increment-label, .weight-increment-text');
        if (label) {
            // Set the text content directly, without any X characters
            label.textContent = 'Weight Increment:';
        }
    }
})();
