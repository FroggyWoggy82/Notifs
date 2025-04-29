/**
 * Remove Bottom X Button
 * This script specifically removes the X button in the bottom of the Weight Increment section
 */

(function() {
    // Run immediately
    removeBottomXButton();
    
    // Also run after DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', removeBottomXButton);
    } else {
        removeBottomXButton();
    }
    
    // Run periodically to catch any dynamically added buttons
    setInterval(removeBottomXButton, 500);
    
    function removeBottomXButton() {
        // Find all elements with the class 'view-exercise-row'
        const viewExerciseRows = document.querySelectorAll('.view-exercise-row');
        
        viewExerciseRows.forEach(row => {
            // Find all X buttons in this row
            const xButtons = row.querySelectorAll('.btn-delete-exercise, .btn-delete-exercise-moved, .btn-delete-exercise-immediate, [class*="btn-delete"], [class*="btn-remove"]');
            
            // Remove all X buttons in this row
            xButtons.forEach(button => {
                button.remove();
            });
        });
    }
    
    // Add a click event listener to remove buttons when options menus are opened
    document.addEventListener('click', event => {
        if (event.target.classList.contains('btn-exercise-options')) {
            // Wait for the menu to open
            setTimeout(removeBottomXButton, 100);
            setTimeout(removeBottomXButton, 300);
            setTimeout(removeBottomXButton, 500);
        }
    });
})();
