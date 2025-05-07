/**
 * Horizontal Edit Fields
 * Ensures the name, amount, package amount, and package price fields are displayed horizontally
 */

document.addEventListener('DOMContentLoaded', function() {
    // Function to restructure the edit form fields
    function restructureEditFields() {
        // Find all edit ingredient forms
        const editForms = document.querySelectorAll('.edit-ingredient-form');

        editForms.forEach(form => {
            // Skip if already processed
            if (form.dataset.fieldsRestructured === 'true') return;

            // Get the form element
            const formElement = form.querySelector('form');
            if (!formElement) return;

            // Get the form group column
            const formGroupColumn = formElement.querySelector('.form-group-column');
            if (!formGroupColumn) return;

            // Apply direct styles to ensure horizontal layout
            formGroupColumn.setAttribute('style',
                'display: flex !important; ' +
                'flex-direction: row !important; ' +
                'flex-wrap: nowrap !important; ' +
                'gap: 10px !important; ' +
                'align-items: flex-end !important; ' +
                'margin-bottom: 8px !important;'
            );

            // Get all form groups
            const formGroups = formGroupColumn.querySelectorAll('.form-group');

            // Apply inline styles to ensure horizontal layout
            formGroups.forEach(group => {
                group.setAttribute('style',
                    'display: inline-block !important; ' +
                    'vertical-align: top !important; ' +
                    'margin-right: 10px !important; ' +
                    'margin-bottom: 0 !important; ' +
                    'flex: 0 0 auto !important;'
                );

                // Style the label
                const label = group.querySelector('label');
                if (label) {
                    label.setAttribute('style',
                        'display: block !important; ' +
                        'font-size: 0.75em !important; ' +
                        'margin-bottom: 2px !important; ' +
                        'color: #aaa !important;'
                    );
                }

                // Style the input
                const input = group.querySelector('input');
                if (input) {
                    // Make name field wider
                    if (input.id === 'edit-ingredient-name') {
                        input.setAttribute('style',
                            'width: 140px !important; ' +
                            'height: 24px !important; ' +
                            'padding: 2px 4px !important; ' +
                            'font-size: 0.8em !important; ' +
                            'margin-bottom: 0 !important; ' +
                            'display: inline-block !important;'
                        );
                    } else {
                        input.setAttribute('style',
                            'width: 80px !important; ' +
                            'height: 24px !important; ' +
                            'padding: 2px 4px !important; ' +
                            'font-size: 0.8em !important; ' +
                            'margin-bottom: 0 !important; ' +
                            'display: inline-block !important;'
                        );
                    }
                }
            });

            // Make the form more compact
            form.setAttribute('style',
                'padding: 8px !important; ' +
                'max-width: 100% !important;'
            );

            formElement.setAttribute('style',
                'margin: 0 !important; ' +
                'padding: 0 !important; ' +
                'display: flex !important; ' +
                'flex-direction: column !important;'
            );

            // Mark as processed
            form.dataset.fieldsRestructured = 'true';
        });
    }

    // Initial restructuring
    setTimeout(restructureEditFields, 100);

    // Set up a mutation observer to watch for new forms
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(restructureEditFields, 50);
            }
        });
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    // Also handle dynamic form creation through event delegation
    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-ingredient-btn')) {
            // Wait for the form to be displayed
            setTimeout(restructureEditFields, 100);
            // Try again after a bit longer to ensure it's applied
            setTimeout(restructureEditFields, 300);
            setTimeout(restructureEditFields, 500);
        }
    });

    // Run periodically to ensure the styles are applied
    setInterval(restructureEditFields, 1000);
});
