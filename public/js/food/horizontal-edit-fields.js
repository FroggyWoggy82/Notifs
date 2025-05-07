/**
 * Horizontal Edit Fields
 * Ensures the name, amount, package amount, and package price fields are displayed horizontally
 */

document.addEventListener('DOMContentLoaded', function() {

    function restructureEditFields() {

        const editForms = document.querySelectorAll('.edit-ingredient-form');

        editForms.forEach(form => {

            if (form.dataset.fieldsRestructured === 'true') return;

            const formElement = form.querySelector('form');
            if (!formElement) return;

            const formGroupColumn = formElement.querySelector('.form-group-column');
            if (!formGroupColumn) return;

            formGroupColumn.setAttribute('style',
                'display: flex !important; ' +
                'flex-direction: row !important; ' +
                'flex-wrap: nowrap !important; ' +
                'gap: 10px !important; ' +
                'align-items: flex-end !important; ' +
                'margin-bottom: 8px !important;'
            );

            const formGroups = formGroupColumn.querySelectorAll('.form-group');

            formGroups.forEach(group => {
                group.setAttribute('style',
                    'display: inline-block !important; ' +
                    'vertical-align: top !important; ' +
                    'margin-right: 10px !important; ' +
                    'margin-bottom: 0 !important; ' +
                    'flex: 0 0 auto !important;'
                );

                const label = group.querySelector('label');
                if (label) {
                    label.setAttribute('style',
                        'display: block !important; ' +
                        'font-size: 0.75em !important; ' +
                        'margin-bottom: 2px !important; ' +
                        'color: #aaa !important;'
                    );
                }

                const input = group.querySelector('input');
                if (input) {

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

            form.dataset.fieldsRestructured = 'true';
        });
    }

    setTimeout(restructureEditFields, 100);

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(restructureEditFields, 50);
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-ingredient-btn')) {

            setTimeout(restructureEditFields, 100);

            setTimeout(restructureEditFields, 300);
            setTimeout(restructureEditFields, 500);
        }
    });

    setInterval(restructureEditFields, 1000);
});
