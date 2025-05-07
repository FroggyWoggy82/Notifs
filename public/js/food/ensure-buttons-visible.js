/**
 * Ensure buttons are visible in the Edit Ingredient form
 */
document.addEventListener('DOMContentLoaded', function() {

    function ensureButtonsVisible() {

        document.querySelectorAll('.edit-ingredient-form').forEach(form => {

            const formElement = form.querySelector('form');
            if (!formElement) return;

            const formActions = formElement.querySelector('.form-actions');
            if (!formActions) {

                const newFormActions = document.createElement('div');
                newFormActions.className = 'form-actions';

                const saveButton = document.createElement('button');
                saveButton.type = 'submit';
                saveButton.className = 'save-changes';
                saveButton.textContent = 'Save Changes';

                const cancelButton = document.createElement('button');
                cancelButton.type = 'button';
                cancelButton.className = 'cancel';
                cancelButton.textContent = 'Cancel';

                newFormActions.appendChild(saveButton);
                newFormActions.appendChild(cancelButton);

                formElement.appendChild(newFormActions);
            } else {

                formActions.style.display = 'flex';
            }

            const header = form.querySelector('h2');
            if (header) {
                header.style.display = 'block';
            }
        });
    }

    setTimeout(ensureButtonsVisible, 300);

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(ensureButtonsVisible, 100);
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-ingredient-btn')) {

            setTimeout(ensureButtonsVisible, 200);

            setTimeout(ensureButtonsVisible, 500);
            setTimeout(ensureButtonsVisible, 1000);
        }
    });

    setInterval(ensureButtonsVisible, 2000);
});
