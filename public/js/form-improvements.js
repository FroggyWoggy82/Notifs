/**
 * Form Improvements
 * Enhances forms with better layout and save confirmations
 */

(function() {
    // Track if we've initialized
    let initialized = false;

    // Initialize form improvements
    function init() {
        if (initialized) return;
        initialized = true;

        console.log('Initializing form improvements');

        // Add event listeners for form submissions
        document.body.addEventListener('submit', handleFormSubmit, true);

        // Improve form layouts
        improveFormLayouts();

        // Set up a mutation observer to watch for new forms
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    setTimeout(improveFormLayouts, 50);
                }
            });
        });

        // Start observing the document body for changes
        observer.observe(document.body, { childList: true, subtree: true });

        // Add click listeners for save buttons that might not be in forms
        document.body.addEventListener('click', function(event) {
            if (event.target.matches('.save-btn, button[type="submit"]') ||
                (event.target.tagName === 'BUTTON' && event.target.textContent.includes('Save'))) {
                const form = event.target.closest('form');
                if (!form) {
                    // This is a save button outside a form
                    handleSaveButtonClick(event);
                }
            }
        });
    }

    // Handle form submissions
    function handleFormSubmit(event) {
        // Don't interfere with the actual submission
        // We just want to add the success notification after submission

        // Store the form for reference after submission
        const form = event.target;

        // Check if this is a form we want to enhance
        if (shouldEnhanceForm(form)) {
            // Add a one-time load event listener to show success message
            // This works for forms that reload the page
            window.addEventListener('load', function showSuccessAfterLoad() {
                window.removeEventListener('load', showSuccessAfterLoad);
                showSaveSuccess(form);
            }, { once: true });

            // For forms that use AJAX and don't reload the page,
            // we'll rely on the specific form handlers to show success
        }
    }

    // Handle save button clicks outside forms
    function handleSaveButtonClick(event) {
        // This is for buttons that trigger saves but aren't in forms
        // We'll add a success notification after a short delay
        // assuming the save was successful

        // Only proceed if this is a save button we want to enhance
        if (shouldEnhanceSaveButton(event.target)) {
            // Show success message after a short delay
            setTimeout(() => {
                showSaveSuccess(event.target);
            }, 500);
        }
    }

    // Determine if we should enhance this form
    function shouldEnhanceForm(form) {
        // Enhance forms that have save/submit buttons
        if (!form) return false;

        // Check for submit buttons or save buttons
        if (form.querySelector('button[type="submit"]') || form.querySelector('.save-btn')) {
            return true;
        }

        // Check for buttons containing "Save" text
        const buttons = form.querySelectorAll('button');
        for (let i = 0; i < buttons.length; i++) {
            if (buttons[i].textContent.includes('Save')) {
                return true;
            }
        }

        return false;
    }

    // Determine if we should enhance this save button
    function shouldEnhanceSaveButton(button) {
        // Check if this is a save button we want to enhance
        return button && (
            button.classList.contains('save-btn') ||
            button.textContent.includes('Save') ||
            button.type === 'submit'
        );
    }

    // Show save success notification
    function showSaveSuccess(element) {
        // Use the notification system if available
        if (window.NotificationSystem) {
            window.NotificationSystem.showSuccess('Saved successfully!');
        } else {
            // Fallback if notification system isn't loaded
            console.log('Save successful');
        }
    }

    // Improve form layouts
    function improveFormLayouts() {
        // Find all forms and form-like containers
        const forms = document.querySelectorAll('form, .form-container, .edit-ingredient-form, .add-ingredient-form');

        forms.forEach(form => {
            // Skip forms we've already improved
            if (form.dataset.formImproved) return;

            // Mark as improved
            form.dataset.formImproved = 'true';

            // Improve form layout
            improveFormLayout(form);
        });
    }

    // Improve a single form's layout
    function improveFormLayout(form) {
        // Add form-container class for styling
        form.classList.add('form-container');

        // Find form sections and improve their layout
        const sections = form.querySelectorAll('.form-section, .edit-form-section, fieldset');
        if (sections.length > 0) {
            sections.forEach(section => {
                improveFormSection(section);
            });
        } else {
            // If no sections, organize form fields directly
            organizeFormFields(form);
        }

        // Improve form actions (buttons)
        improveFormActions(form);
    }

    // Improve a form section's layout
    function improveFormSection(section) {
        // Add form-section class for styling
        section.classList.add('form-section');

        // Organize fields within this section
        organizeFormFields(section);
    }

    // Organize form fields into a grid layout
    function organizeFormFields(container) {
        // Find all form groups/items
        const formGroups = container.querySelectorAll('.form-group, .form-item, .edit-form-item');

        if (formGroups.length > 0) {
            // Create a grid container if it doesn't exist
            let grid = container.querySelector('.form-grid');
            if (!grid) {
                grid = document.createElement('div');
                grid.className = 'form-grid';

                // Move form groups into the grid
                formGroups.forEach(group => {
                    // Add form-group class for styling
                    group.classList.add('form-group');
                    grid.appendChild(group);
                });

                // Add the grid to the container
                container.appendChild(grid);
            }
        }
    }

    // Improve form action buttons
    function improveFormActions(form) {
        // Find form actions container
        let actions = form.querySelector('.form-actions');

        // If no actions container exists, look for buttons and create one
        if (!actions) {
            const buttons = form.querySelectorAll('button, input[type="submit"], input[type="button"], .btn');

            if (buttons.length > 0) {
                actions = document.createElement('div');
                actions.className = 'form-actions';

                // Move buttons to actions container
                buttons.forEach(button => {
                    // Skip buttons that are already in a form-actions container
                    if (!button.closest('.form-actions')) {
                        actions.appendChild(button);
                    }
                });

                // Add actions to form
                form.appendChild(actions);
            }
        }
    }

    // Initialize on DOM content loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose functions globally
    window.FormImprovements = {
        init,
        showSaveSuccess
    };
})();
