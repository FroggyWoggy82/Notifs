/**
 * Weight Increment X Remover
 * This script specifically targets and removes the X button in the Weight Increment section
 */

(function() {
    // Run immediately
    removeWeightIncrementXButton();
    
    // Also run after DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', removeWeightIncrementXButton);
    } else {
        removeWeightIncrementXButton();
    }
    
    // Run periodically to catch any dynamically added buttons
    setInterval(removeWeightIncrementXButton, 500);
    
    function removeWeightIncrementXButton() {
        // Find all weight increment containers
        const containers = document.querySelectorAll('.weight-increment-container');
        
        containers.forEach(container => {
            // Find all buttons within the container
            const buttons = container.querySelectorAll('button');
            
            // Remove all buttons
            buttons.forEach(button => {
                button.remove();
            });
            
            // Also check for any elements with X character
            const allElements = container.querySelectorAll('*');
            allElements.forEach(element => {
                if (element.textContent === '×' || element.textContent === 'X') {
                    // If it's not an input, remove it
                    if (element.tagName !== 'INPUT') {
                        element.remove();
                    }
                }
            });
        });
    }
})();
