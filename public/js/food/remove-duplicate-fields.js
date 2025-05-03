/**
 * Remove Duplicate Fields
 * Removes the duplicate input fields and dark area below the Basic Information section
 */

document.addEventListener('DOMContentLoaded', function() {
    // Function to remove duplicate fields
    function removeDuplicateFields() {
        // Find all edit ingredient forms
        const editForms = document.querySelectorAll('.edit-ingredient-form');

        editForms.forEach(form => {
            // Skip if already processed
            if (form.dataset.duplicatesRemoved === 'true') return;

            // Find the dark area below the Basic Information section
            const darkArea = form.querySelector('.basic-info-section + div:not(.nutrition-section)');
            if (darkArea) {
                console.log('Found dark area to remove');
                darkArea.remove();
            }

            // Find any extra form-group-column elements
            const extraFormGroupColumns = form.querySelectorAll('.form-group-column');
            extraFormGroupColumns.forEach(column => {
                // Check if it's not inside a nutrition-section or basic-info-section
                if (!column.closest('.nutrition-section') && !column.closest('.basic-info-section')) {
                    console.log('Removing extra form-group-column');
                    column.remove();
                }
            });

            // Find any standalone input fields that are not in a nutrition-item
            const standaloneInputs = form.querySelectorAll('input[type="text"]:not(.nutrition-item input):not(.basic-info-item input), input[type="number"]:not(.nutrition-item input):not(.basic-info-item input)');
            standaloneInputs.forEach(input => {
                // Check if it's not inside a nutrition-item or basic-info-item
                if (!input.closest('.nutrition-item') && !input.closest('.basic-info-item')) {
                    console.log('Removing standalone input:', input.id || input.name);

                    // If it's in a container, remove the container
                    const container = input.closest('.form-group');
                    if (container) {
                        container.remove();
                    } else {
                        input.remove();
                    }
                }
            });

            // Mark as processed
            form.dataset.duplicatesRemoved = 'true';
        });
    }

    // Run the fix when the page loads
    setTimeout(removeDuplicateFields, 200);

    // Set up a mutation observer to watch for new forms
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(removeDuplicateFields, 100);
            }
        });
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    // Also handle dynamic form creation through event delegation
    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-ingredient-btn')) {
            // Wait for the form to be displayed
            setTimeout(removeDuplicateFields, 200);
            // Try again after a bit longer to ensure it's applied
            setTimeout(removeDuplicateFields, 500);
            setTimeout(removeDuplicateFields, 1000);
        }
    });

    // Run periodically to ensure all duplicates are removed
    setInterval(removeDuplicateFields, 2000);
});
