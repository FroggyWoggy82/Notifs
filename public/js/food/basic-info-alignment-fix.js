/**
 * Fix for Basic Information alignment in the Edit Ingredient form
 */
document.addEventListener('DOMContentLoaded', function() {

    function fixBasicInfoAlignment() {

        document.querySelectorAll('.edit-ingredient-form').forEach(form => {

            if (form.dataset.basicInfoFixed === 'true') {
                return;
            }

            const formElement = form.querySelector('form');
            if (!formElement) return;

            const basicInfoSection = formElement.querySelector('.basic-info-section');
            if (!basicInfoSection) {

                const nameLabel = formElement.querySelector('label[for="name"]');
                const nameInput = formElement.querySelector('input#name');
                const amountLabel = formElement.querySelector('label[for="amount"]');
                const amountInput = formElement.querySelector('input#amount');
                const packageAmountLabel = formElement.querySelector('label[for="packageAmount"]');
                const packageAmountInput = formElement.querySelector('input#packageAmount');
                const packagePriceLabel = formElement.querySelector('label[for="packagePrice"]');
                const packagePriceInput = formElement.querySelector('input#packagePrice');

                if (nameInput && amountInput) {

                    const container = document.createElement('div');
                    container.className = 'basic-info-section';
                    container.style.display = 'grid';
                    container.style.gridTemplateColumns = '1fr 1fr 1fr';
                    container.style.gap = '10px';
                    container.style.marginBottom = '15px';

                    const nameGroup = document.createElement('div');
                    nameGroup.className = 'form-group';
                    if (nameLabel) nameGroup.appendChild(nameLabel);
                    nameGroup.appendChild(nameInput);

                    const amountGroup = document.createElement('div');
                    amountGroup.className = 'form-group';
                    if (amountLabel) amountGroup.appendChild(amountLabel);
                    amountGroup.appendChild(amountInput);

                    const packageAmountGroup = document.createElement('div');
                    packageAmountGroup.className = 'form-group';
                    if (packageAmountLabel) packageAmountGroup.appendChild(packageAmountLabel);
                    if (packageAmountInput) packageAmountGroup.appendChild(packageAmountInput);

                    const packagePriceGroup = document.createElement('div');
                    packagePriceGroup.className = 'form-group';
                    if (packagePriceLabel) packagePriceGroup.appendChild(packagePriceLabel);
                    if (packagePriceInput) packagePriceGroup.appendChild(packagePriceInput);

                    container.appendChild(nameGroup);
                    container.appendChild(amountGroup);
                    if (packageAmountInput) container.appendChild(packageAmountGroup);
                    if (packagePriceInput) container.appendChild(packagePriceGroup);

                    if (formElement.firstChild) {
                        formElement.insertBefore(container, formElement.firstChild);
                    } else {
                        formElement.appendChild(container);
                    }
                }
            } else {

                basicInfoSection.style.display = 'grid';
                basicInfoSection.style.gridTemplateColumns = '1fr 1fr 1fr';
                basicInfoSection.style.gap = '10px';
                basicInfoSection.style.marginBottom = '15px';
            }

            form.dataset.basicInfoFixed = 'true';
        });
    }

    setTimeout(fixBasicInfoAlignment, 300);

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(fixBasicInfoAlignment, 100);
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-ingredient-btn')) {

            setTimeout(fixBasicInfoAlignment, 200);

            setTimeout(fixBasicInfoAlignment, 500);
            setTimeout(fixBasicInfoAlignment, 1000);
        }
    });

    setInterval(fixBasicInfoAlignment, 2000);
});
