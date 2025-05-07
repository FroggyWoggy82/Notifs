/**
 * Ensure all buttons are visible in all forms
 */
document.addEventListener('DOMContentLoaded', function() {
    // Function to ensure all buttons are visible
    function ensureAllButtonsVisible() {
        // Fix for Edit Ingredient form
        document.querySelectorAll('.edit-ingredient-form').forEach(form => {
            const formElement = form.querySelector('form');
            if (!formElement) return;

            // Find the form actions (buttons container)
            let formActions = formElement.querySelector('.form-actions');
            
            // If no form actions found, create them
            if (!formActions) {
                formActions = document.createElement('div');
                formActions.className = 'form-actions';
                
                // Create Save Changes button
                const saveButton = document.createElement('button');
                saveButton.type = 'submit';
                saveButton.className = 'save-changes';
                saveButton.textContent = 'Save Changes';
                
                // Create Cancel button
                const cancelButton = document.createElement('button');
                cancelButton.type = 'button';
                cancelButton.className = 'cancel';
                cancelButton.textContent = 'Cancel';
                
                // Add buttons to form actions
                formActions.appendChild(saveButton);
                formActions.appendChild(cancelButton);
                
                // Add form actions to form
                formElement.appendChild(formActions);
            }
            
            // Make sure form actions are visible
            formActions.style.display = 'flex';
            
            // Make sure the header is visible
            const header = form.querySelector('h2');
            if (header) {
                header.style.display = 'block';
            }
        });

        // Fix for Create Recipe form
        const createRecipeForm = document.getElementById('create-recipe-form');
        if (createRecipeForm) {
            // Find the submit button
            let submitButton = createRecipeForm.querySelector('button[type="submit"]');
            
            // If no submit button found, create one
            if (!submitButton) {
                submitButton = document.createElement('button');
                submitButton.type = 'submit';
                submitButton.textContent = 'Save Recipe';
                createRecipeForm.appendChild(submitButton);
            }
            
            // Make sure the button is visible
            submitButton.style.display = 'block';
            submitButton.style.margin = '10px auto';
            submitButton.style.width = '200px';
        }

        // Fix for ingredient items in the recipe form
        document.querySelectorAll('.ingredient-item').forEach(item => {
            // Find the buttons row
            const buttonsRow = item.querySelector('.buttons-row');
            if (!buttonsRow) return;
            
            // Make sure all buttons are visible
            const buttons = buttonsRow.querySelectorAll('button');
            buttons.forEach(button => {
                button.style.display = 'inline-block';
                button.style.margin = '5px';
            });
        });
    }

    // Run the function initially
    setTimeout(ensureAllButtonsVisible, 300);

    // Set up a mutation observer to watch for changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(ensureAllButtonsVisible, 100);
            }
        });
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    // Also handle dynamic form creation through event delegation
    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-ingredient-btn') || 
            event.target.classList.contains('add-ingredient-btn') ||
            event.target.classList.contains('add-ingredient-btn-inline')) {
            // Wait for the form to be displayed
            setTimeout(ensureAllButtonsVisible, 200);
            // Try again after a bit longer to ensure it's applied
            setTimeout(ensureAllButtonsVisible, 500);
            setTimeout(ensureAllButtonsVisible, 1000);
        }
    });

    // Run periodically to ensure all buttons are visible
    setInterval(ensureAllButtonsVisible, 2000);
});
