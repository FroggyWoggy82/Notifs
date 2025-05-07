/**
 * Remove Duplicate Fields
 * Removes the duplicate input fields and dark area below the Basic Information section
 */

document.addEventListener('DOMContentLoaded', function() {

    function removeDuplicateFields() {

        const editForms = document.querySelectorAll('.edit-ingredient-form');

        editForms.forEach(form => {

            if (form.dataset.duplicatesRemoved === 'true') return;

            const darkArea = form.querySelector('.basic-info-section + div:not(.nutrition-section)');
            if (darkArea) {
                console.log('Found dark area to remove');
                darkArea.remove();
            }

            const extraFormGroupColumns = form.querySelectorAll('.form-group-column');
            extraFormGroupColumns.forEach(column => {

                if (!column.closest('.nutrition-section') && !column.closest('.basic-info-section')) {
                    console.log('Removing extra form-group-column');
                    column.remove();
                }
            });

            const standaloneInputs = form.querySelectorAll('input[type="text"]:not(.nutrition-item input):not(.basic-info-item input), input[type="number"]:not(.nutrition-item input):not(.basic-info-item input)');
            standaloneInputs.forEach(input => {

                if (!input.closest('.nutrition-item') && !input.closest('.basic-info-item')) {
                    console.log('Removing standalone input:', input.id || input.name);

                    const container = input.closest('.form-group');
                    if (container) {
                        container.remove();
                    } else {
                        input.remove();
                    }
                }
            });

            form.dataset.duplicatesRemoved = 'true';
        });
    }

    setTimeout(removeDuplicateFields, 200);

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(removeDuplicateFields, 100);
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-ingredient-btn')) {

            setTimeout(removeDuplicateFields, 200);

            setTimeout(removeDuplicateFields, 500);
            setTimeout(removeDuplicateFields, 1000);
        }
    });

    setInterval(removeDuplicateFields, 2000);
});
