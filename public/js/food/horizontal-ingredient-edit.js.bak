/**
 * Horizontal Ingredient Edit
 * Restructures the ingredient edit form to use a horizontal layout
 */

document.addEventListener('DOMContentLoaded', function() {
    // Function to restructure the edit form
    function restructureEditForm() {
        // Find all edit ingredient forms on the page
        const editForms = document.querySelectorAll('.edit-ingredient-form');

        editForms.forEach(form => {
            // Skip if already restructured
            if (form.dataset.restructured === 'true') return;

            // Get the form elements
            const header = form.querySelector('h4');
            const formElement = form.querySelector('form');
            const formActions = form.querySelector('.form-actions');

            if (!header || !formElement) return;

            // Create a header container
            const headerContainer = document.createElement('div');
            headerContainer.className = 'edit-ingredient-form-header';

            // Move the header into the container (without cloning to avoid duplicates)
            headerContainer.appendChild(header);

            // Insert the header container at the beginning of the form
            form.insertBefore(headerContainer, form.firstChild);

            // Check if there are duplicate form actions (Save Changes and Cancel buttons)
            const formActionElements = form.querySelectorAll('.form-actions');
            if (formActionElements.length > 1) {
                // Keep only the last one (which is at the bottom)
                for (let i = 0; i < formActionElements.length - 1; i++) {
                    if (formActionElements[i].parentNode) {
                        formActionElements[i].parentNode.removeChild(formActionElements[i]);
                    }
                }
            }

            // Ensure the form-group-column exists and has the right structure
            const formGroupColumn = formElement.querySelector('.form-group-column');
            if (formGroupColumn) {
                // Make sure it has the flex-row class
                formGroupColumn.classList.add('form-group-row');

                // Get all form groups
                const formGroups = formGroupColumn.querySelectorAll('.form-group');

                // Ensure they're all displayed inline
                formGroups.forEach(group => {
                    group.style.display = 'inline-block';
                    group.style.marginRight = '10px';

                    // Make the input fields smaller
                    const input = group.querySelector('input');
                    if (input) {
                        if (input.id === 'edit-ingredient-name') {
                            input.style.width = '140px';
                        } else {
                            input.style.width = '70px';
                        }
                        input.style.height = '24px';
                        input.style.padding = '2px 4px';
                        input.style.fontSize = '0.8em';
                    }
                });
            }

            // Mark as restructured
            form.dataset.restructured = 'true';
        });
    }

    // Initial restructuring
    restructureEditForm();

    // Set up a mutation observer to watch for new forms
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(restructureEditForm, 50);
            }
        });
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    // Also handle dynamic form creation through event delegation
    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-ingredient-btn')) {
            // Wait a short time for the form to be displayed
            setTimeout(restructureEditForm, 100);
        }
    });
});
