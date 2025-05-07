/**
 * Fix Missing Fields
 * Ensures all fields in the edit ingredient form are displayed properly
 */

document.addEventListener('DOMContentLoaded', function() {

    const packageAmountStyles = document.querySelectorAll('link[href*="package-amount-field.css"]');
    packageAmountStyles.forEach(styleLink => {

        const overrideStyle = document.createElement('style');
        overrideStyle.textContent = `
            
            .form-group-column {
                display: flex !important;
                flex-direction: row !important;
                flex-wrap: nowrap !important;
                gap: 10px !important;
                align-items: flex-end !important;
                margin-bottom: 10px !important;
                width: auto !important;
            }

            
            .form-group-column .form-group {
                width: auto !important;
                margin-bottom: 0 !important;
                display: inline-block !important;
            }

            
            .form-group-column .form-group input {
                width: 80px !important;
                padding: 2px 4px !important;
                height: 24px !important;
            }

            
            #edit-ingredient-name {
                width: 140px !important;
            }
        `;
        document.head.appendChild(overrideStyle);
    });

    function fixMissingFields() {

        const editForms = document.querySelectorAll('.edit-ingredient-form');

        editForms.forEach(form => {

            if (form.dataset.fieldsFixed === 'true') return;

            const formElement = form.querySelector('form');
            if (!formElement) return;

            const formGroupColumn = formElement.querySelector('.form-group-column');
            if (!formGroupColumn) {


                return;
            }


            console.log('Recreating form group column for consistency');

            const newFormGroupColumn = document.createElement('div');
            newFormGroupColumn.className = 'form-group-column';
            newFormGroupColumn.style.display = 'flex';
            newFormGroupColumn.style.flexDirection = 'row';
            newFormGroupColumn.style.flexWrap = 'nowrap';
            newFormGroupColumn.style.gap = '10px';
            newFormGroupColumn.style.alignItems = 'flex-end';
            newFormGroupColumn.style.marginBottom = '10px';

            const nameGroup = document.createElement('div');
            nameGroup.className = 'form-group';
            nameGroup.innerHTML = `
                <label for="edit-ingredient-name">Name:</label>
                <input type="text" id="edit-ingredient-name" required style="width: 140px; height: 24px; padding: 2px 4px; font-size: 0.8em; margin-bottom: 0;">
            `;

            const amountGroup = document.createElement('div');
            amountGroup.className = 'form-group';
            amountGroup.innerHTML = `
                <label for="edit-ingredient-amount">Amount (g):</label>
                <input type="number" id="edit-ingredient-amount" step="0.1" min="0.1" required style="width: 70px; height: 24px; padding: 2px 4px; font-size: 0.8em; margin-bottom: 0;">
            `;

            const packageAmountGroup = document.createElement('div');
            packageAmountGroup.className = 'form-group';
            packageAmountGroup.innerHTML = `
                <label for="edit-ingredient-package-amount">Package Amount (g):</label>
                <input type="number" id="edit-ingredient-package-amount" step="0.1" min="0" style="width: 70px; height: 24px; padding: 2px 4px; font-size: 0.8em; margin-bottom: 0;">
            `;

            const priceGroup = document.createElement('div');
            priceGroup.className = 'form-group';
            priceGroup.innerHTML = `
                <label for="edit-ingredient-price">Package Price:</label>
                <input type="number" id="edit-ingredient-price" step="0.01" min="0" required style="width: 70px; height: 24px; padding: 2px 4px; font-size: 0.8em; margin-bottom: 0;">
            `;

            newFormGroupColumn.appendChild(nameGroup);
            newFormGroupColumn.appendChild(amountGroup);
            newFormGroupColumn.appendChild(packageAmountGroup);
            newFormGroupColumn.appendChild(priceGroup);

            if (formGroupColumn.parentNode) {
                formGroupColumn.parentNode.replaceChild(newFormGroupColumn, formGroupColumn);
            }

            const nameField = formGroupColumn.querySelector('#edit-ingredient-name');
            const amountField = formGroupColumn.querySelector('#edit-ingredient-amount');
            const packageAmountField = formGroupColumn.querySelector('#edit-ingredient-package-amount');
            const priceField = formGroupColumn.querySelector('#edit-ingredient-price');

            if (nameField) newFormGroupColumn.querySelector('#edit-ingredient-name').value = nameField.value;
            if (amountField) newFormGroupColumn.querySelector('#edit-ingredient-amount').value = amountField.value;
            if (packageAmountField) newFormGroupColumn.querySelector('#edit-ingredient-package-amount').value = packageAmountField.value;
            if (priceField) newFormGroupColumn.querySelector('#edit-ingredient-price').value = priceField.value;

            form.dataset.fieldsFixed = 'true';
        });
    }

    setTimeout(fixMissingFields, 100);

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(fixMissingFields, 50);
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-ingredient-btn')) {

            setTimeout(fixMissingFields, 100);

            setTimeout(fixMissingFields, 300);
            setTimeout(fixMissingFields, 500);
        }
    });

    setInterval(() => {

        const editForms = document.querySelectorAll('.edit-ingredient-form');
        if (editForms.length > 0) {
            fixMissingFields();
        }
    }, 1000);
});
