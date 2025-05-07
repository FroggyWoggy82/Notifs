/**
 * Remove Top X Button
 * This script specifically removes the X button in the top right corner of the Weight Increment section
 */

(function() {
    // Run immediately
    removeTopXButton();
    
    // Also run after DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', removeTopXButton);
    } else {
        removeTopXButton();
    }
    
    // Run periodically to catch any dynamically added buttons
    setInterval(removeTopXButton, 100);
    
    function removeTopXButton() {
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
    
    // Add a mutation observer to watch for changes to the DOM
    const observer = new MutationObserver(mutations => {
        removeTopXButton();
    });
    
    // Start observing the document body for DOM changes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Add a click event listener to remove buttons when options menus are opened
    document.addEventListener('click', event => {
        if (event.target.classList.contains('btn-exercise-options')) {
            // Wait for the menu to open
            setTimeout(removeTopXButton, 100);
            setTimeout(removeTopXButton, 300);
            setTimeout(removeTopXButton, 500);
        }
    });
})();
