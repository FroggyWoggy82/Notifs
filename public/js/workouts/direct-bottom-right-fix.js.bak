/**
 * Direct Bottom Right Fix
 * This script directly targets the X button in the Weight Increment section and positions it at the bottom right
 */

(function() {
    // Run immediately
    fixBottomRightPosition();

    // Also run after DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixBottomRightPosition);
    } else {
        fixBottomRightPosition();
    }

    // Run periodically to catch any dynamically added buttons
    setInterval(fixBottomRightPosition, 500);

    function fixBottomRightPosition() {
        // Find all weight increment containers
        const containers = document.querySelectorAll('.weight-increment-container');

        containers.forEach(container => {
            // Remove any existing buttons
            const existingButtons = container.querySelectorAll('button');
            existingButtons.forEach(button => button.remove());
        });

        // Find and remove any extra X buttons
        removeExtraXButtons();
    }

    function removeExtraXButtons() {
        // Find all elements with the class 'view-exercise-row'
        const viewExerciseRows = document.querySelectorAll('.view-exercise-row');

        viewExerciseRows.forEach(row => {
            // Find all X buttons in this row
            const xButtons = row.querySelectorAll('.btn-delete-exercise, .btn-delete-exercise-moved, .btn-delete-exercise-immediate');

            // Remove all X buttons in this row
            xButtons.forEach(button => {
                button.remove();
            });
        });
    }

    // Add a click event listener to fix buttons when options menus are opened
    document.addEventListener('click', event => {
        if (event.target.classList.contains('btn-exercise-options')) {
            // Wait for the menu to open
            setTimeout(fixBottomRightPosition, 100);
            setTimeout(fixBottomRightPosition, 300);
            setTimeout(fixBottomRightPosition, 500);
        }
    });

    // Run the extra X button removal periodically
    setInterval(removeExtraXButtons, 500);
})();
