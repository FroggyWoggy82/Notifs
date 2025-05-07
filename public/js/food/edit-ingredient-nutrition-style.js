/**
 * Edit Ingredient Nutrition Style
 * Restructures the edit ingredient form to match the detailed nutrition panel style
 */

(function() {

    function restructureEditForm() {

        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {

            if (form.dataset.restructured === 'true') return;
            
            console.log('Restructuring edit ingredient form to match nutrition panel style');

            const header = form.querySelector('h4');
            const formElement = form.querySelector('form');
            
            if (!header || !formElement) return;

            const nameField = form.querySelector('#edit-ingredient-name');
            const amountField = form.querySelector('#edit-ingredient-amount');
            const packageAmountField = form.querySelector('#edit-ingredient-package-amount');
            const priceField = form.querySelector('#edit-ingredient-price');
            
            if (!nameField || !amountField) return;

            const basicInfoSection = document.createElement('div');
            basicInfoSection.className = 'nutrition-section basic-information';

            const basicInfoHeader = document.createElement('h4');
            basicInfoHeader.textContent = 'Basic Information';
            basicInfoSection.appendChild(basicInfoHeader);

            const basicInfoGrid = document.createElement('div');
            basicInfoGrid.className = 'nutrition-grid';
            basicInfoSection.appendChild(basicInfoGrid);

            const nameItem = createNutritionItem('Name:', nameField);
            const amountItem = createNutritionItem('Amount (g):', amountField);

            basicInfoGrid.appendChild(nameItem);
            basicInfoGrid.appendChild(amountItem);

            if (packageAmountField) {
                const packageAmountItem = createNutritionItem('Package Amount (g):', packageAmountField);
                basicInfoGrid.appendChild(packageAmountItem);
            }
            
            if (priceField) {
                const priceItem = createNutritionItem('Package Price:', priceField);
                basicInfoGrid.appendChild(priceItem);
            }

            const formGroupsContainer = form.querySelector('.form-group-column');
            
            if (formGroupsContainer) {

                formGroupsContainer.parentNode.replaceChild(basicInfoSection, formGroupsContainer);
            } else {

                formElement.insertBefore(basicInfoSection, formElement.firstChild);
            }

            form.dataset.restructured = 'true';
            
            console.log('Edit ingredient form restructured to match nutrition panel style');
        });
    }

    function createNutritionItem(labelText, inputField) {
        const item = document.createElement('div');
        item.className = 'nutrition-item';

        const label = document.createElement('label');
        label.textContent = labelText;
        label.setAttribute('for', inputField.id);

        const input = inputField.cloneNode(true);

        input.value = inputField.value;

        input.addEventListener('input', function() {
            inputField.value = this.value;

            const event = new Event('change', { bubbles: true });
            inputField.dispatchEvent(event);
        });
        
        inputField.addEventListener('input', function() {
            input.value = this.value;
        });

        inputField.style.display = 'none';

        item.appendChild(label);
        item.appendChild(input);
        
        return item;
    }

    function init() {
        console.log('Initializing edit ingredient nutrition style');

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

                setTimeout(restructureEditForm, 300);
                setTimeout(restructureEditForm, 500);
            }
        });
        
        console.log('Edit ingredient nutrition style initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
