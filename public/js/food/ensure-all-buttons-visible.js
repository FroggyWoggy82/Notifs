/**
 * Ensure all buttons are visible in all forms
 */
document.addEventListener('DOMContentLoaded', function() {

    function ensureAllButtonsVisible() {

        document.querySelectorAll('.edit-ingredient-form').forEach(form => {
            const formElement = form.querySelector('form');
            if (!formElement) return;

            let formActions = formElement.querySelector('.form-actions');

            if (!formActions) {
                formActions = document.createElement('div');
                formActions.className = 'form-actions';

                const saveButton = document.createElement('button');
                saveButton.type = 'submit';
                saveButton.className = 'save-changes';
                saveButton.textContent = 'Save Changes';

                const cancelButton = document.createElement('button');
                cancelButton.type = 'button';
                cancelButton.className = 'cancel';
                cancelButton.textContent = 'Cancel';

                formActions.appendChild(saveButton);
                formActions.appendChild(cancelButton);

                formElement.appendChild(formActions);
            }

            formActions.style.display = 'flex';

            const header = form.querySelector('h2');
            if (header) {
                header.style.display = 'block';
            }
        });

        const createRecipeForm = document.getElementById('create-recipe-form');
        if (createRecipeForm) {

            let submitButton = createRecipeForm.querySelector('button[type="submit"]');

            if (!submitButton) {
                submitButton = document.createElement('button');
                submitButton.type = 'submit';
                submitButton.textContent = 'Save Recipe';
                createRecipeForm.appendChild(submitButton);
            }

            submitButton.style.display = 'block';
            submitButton.style.margin = '10px auto';
            submitButton.style.width = '200px';
        }

        document.querySelectorAll('.ingredient-item').forEach(item => {

            const buttonsRow = item.querySelector('.buttons-row');
            if (!buttonsRow) return;

            const buttons = buttonsRow.querySelectorAll('button');
            buttons.forEach(button => {
                button.style.display = 'inline-block';
                button.style.margin = '5px';
            });
        });
    }

    setTimeout(ensureAllButtonsVisible, 300);

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(ensureAllButtonsVisible, 100);
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-ingredient-btn') || 
            event.target.classList.contains('add-ingredient-btn') ||
            event.target.classList.contains('add-ingredient-btn-inline')) {

            setTimeout(ensureAllButtonsVisible, 200);

            setTimeout(ensureAllButtonsVisible, 500);
            setTimeout(ensureAllButtonsVisible, 1000);
        }
    });

    setInterval(ensureAllButtonsVisible, 2000);
});
