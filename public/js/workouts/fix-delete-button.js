/**
 * Fix Delete Button
 * This script fixes the delete button functionality
 */

(function() {

    document.addEventListener('click', function(event) {

        if (event.target.classList.contains('btn-delete-exercise')) {

            event.preventDefault();
            event.stopPropagation();

            if (typeof window.handleDeleteExercise === 'function') {
                window.handleDeleteExercise(event);
            }
        }
    });
})();
