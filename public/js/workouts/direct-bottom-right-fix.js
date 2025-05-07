/**
 * Direct Bottom Right Fix
 * This script directly targets the X button in the Weight Increment section and positions it at the bottom right
 */

(function() {

    fixBottomRightPosition();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixBottomRightPosition);
    } else {
        fixBottomRightPosition();
    }

    setInterval(fixBottomRightPosition, 500);

    function fixBottomRightPosition() {

        const containers = document.querySelectorAll('.weight-increment-container');

        containers.forEach(container => {

            const existingButtons = container.querySelectorAll('button');
            existingButtons.forEach(button => button.remove());
        });

        removeExtraXButtons();
    }

    function removeExtraXButtons() {

        const viewExerciseRows = document.querySelectorAll('.view-exercise-row');

        viewExerciseRows.forEach(row => {

            const xButtons = row.querySelectorAll('.btn-delete-exercise, .btn-delete-exercise-moved, .btn-delete-exercise-immediate');

            xButtons.forEach(button => {
                button.remove();
            });
        });
    }

    document.addEventListener('click', event => {
        if (event.target.classList.contains('btn-exercise-options')) {

            setTimeout(fixBottomRightPosition, 100);
            setTimeout(fixBottomRightPosition, 300);
            setTimeout(fixBottomRightPosition, 500);
        }
    });

    setInterval(removeExtraXButtons, 500);
})();
