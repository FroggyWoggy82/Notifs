/**
 * Horizontal Ingredient Edit
 * Restructures the ingredient edit form to use a horizontal layout
 */

document.addEventListener('DOMContentLoaded', function() {

    function restructureEditForm() {

        const editForms = document.querySelectorAll('.edit-ingredient-form');

        editForms.forEach(form => {

            if (form.dataset.restructured === 'true') return;

            const header = form.querySelector('h4');
            const formElement = form.querySelector('form');
            const formActions = form.querySelector('.form-actions');

            if (!header || !formElement) return;

            const headerContainer = document.createElement('div');
            headerContainer.className = 'edit-ingredient-form-header';

            headerContainer.appendChild(header);

            form.insertBefore(headerContainer, form.firstChild);

            const formActionElements = form.querySelectorAll('.form-actions');
            if (formActionElements.length > 1) {

                for (let i = 0; i < formActionElements.length - 1; i++) {
                    if (formActionElements[i].parentNode) {
                        formActionElements[i].parentNode.removeChild(formActionElements[i]);
                    }
                }
            }

            const formGroupColumn = formElement.querySelector('.form-group-column');
            if (formGroupColumn) {

                formGroupColumn.classList.add('form-group-row');

                const formGroups = formGroupColumn.querySelectorAll('.form-group');

                formGroups.forEach(group => {
                    group.style.display = 'inline-block';
                    group.style.marginRight = '10px';

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

            form.dataset.restructured = 'true';
        });
    }

    restructureEditForm();

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(restructureEditForm, 50);
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-ingredient-btn')) {

            setTimeout(restructureEditForm, 100);
        }
    });
});
