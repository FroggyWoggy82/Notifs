/**
 * Fix Delete Button
 * This script fixes the delete button functionality
 */

(function() {
    // Add a direct click event listener to the document
    document.addEventListener('click', function(event) {
        // Check if the clicked element is a delete button
        if (event.target.classList.contains('btn-delete-exercise')) {
            // Prevent default behavior
            event.preventDefault();
            event.stopPropagation();

            // Call the global handleDeleteExercise function
            if (typeof window.handleDeleteExercise === 'function') {
                window.handleDeleteExercise(event);
            }
        }
    });
})();
