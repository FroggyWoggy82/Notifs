/**
 * Remove Bottom X Button
 * This script specifically removes the X button in the bottom of the Weight Increment section
 */

(function() {

    removeBottomXButton();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', removeBottomXButton);
    } else {
        removeBottomXButton();
    }

    setInterval(removeBottomXButton, 500);
    
    function removeBottomXButton() {

        const viewExerciseRows = document.querySelectorAll('.view-exercise-row');
        
        viewExerciseRows.forEach(row => {

            const xButtons = row.querySelectorAll('.btn-delete-exercise, .btn-delete-exercise-moved, .btn-delete-exercise-immediate, [class*="btn-delete"], [class*="btn-remove"]');

            xButtons.forEach(button => {
                button.remove();
            });
        });
    }

    document.addEventListener('click', event => {
        if (event.target.classList.contains('btn-exercise-options')) {

            setTimeout(removeBottomXButton, 100);
            setTimeout(removeBottomXButton, 300);
            setTimeout(removeBottomXButton, 500);
        }
    });
})();
