/**
 * Edit Button Basic Info Fix
 * Specifically targets and fixes the Basic Information section when editing an existing ingredient
 */

(function() {

    function fixEditButtonBasicInfo() {

        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {

            if (form.dataset.editButtonBasicInfoFixed === 'true') return;
            
            console.log('Fixing Basic Information section for existing ingredient edit');

            const formElement = form.querySelector('form');
            if (!formElement) return;

            const editIngredientId = formElement.querySelector('#edit-ingredient-id');
            if (!editIngredientId || !editIngredientId.value) return;

            let basicInfoSection = formElement.querySelector('.basic-information');

            if (!basicInfoSection) {
                const firstDiv = formElement.querySelector('div:first-of-type');
                if (firstDiv) {

                    firstDiv.className = 'nutrition-section basic-information';

                    if (!firstDiv.querySelector('h4')) {
                        const header = document.createElement('h4');
                        header.textContent = 'Basic Information';
                        firstDiv.insertBefore(header, firstDiv.firstChild);
                    }
                    
                    basicInfoSection = firstDiv;
                } else {

                    basicInfoSection = document.createElement('div');
                    basicInfoSection.className = 'nutrition-section basic-information';
                    
                    const header = document.createElement('h4');
                    header.textContent = 'Basic Information';
                    basicInfoSection.appendChild(header);

                    formElement.insertBefore(basicInfoSection, formElement.firstChild);
                }
            }

            basicInfoSection.style.marginBottom = '8px';
            basicInfoSection.style.paddingBottom = '5px';
            basicInfoSection.style.backgroundColor = 'rgba(25, 25, 25, 0.7)';
            basicInfoSection.style.borderRadius = '4px';
            basicInfoSection.style.padding = '8px';
            basicInfoSection.style.display = 'flex';
            basicInfoSection.style.flexDirection = 'column';

            const header = basicInfoSection.querySelector('h4');
            if (header) {
                header.style.marginTop = '0';
                header.style.marginBottom = '5px';
                header.style.paddingBottom = '2px';
                header.style.borderBottom = 'none';
                header.style.color = '#e0e0e0';
                header.style.fontWeight = '500';
                header.style.fontSize = '0.85em';
            }

            let grid = basicInfoSection.querySelector('.nutrition-grid');
            if (!grid) {

                grid = document.createElement('div');
                grid.className = 'nutrition-grid';

                const formGroups = basicInfoSection.querySelectorAll('.form-group');

                if (formGroups.length > 0) {
                    formGroups.forEach(group => {

                        const item = document.createElement('div');
                        item.className = 'nutrition-item';

                        const label = group.querySelector('label');
                        const input = group.querySelector('input');
                        
                        if (label && input) {

                            const clonedLabel = label.cloneNode(true);
                            const clonedInput = input.cloneNode(true);

                            clonedInput.value = input.value;

                            clonedInput.addEventListener('input', function() {
                                input.value = this.value;

                                const event = new Event('change', { bubbles: true });
                                input.dispatchEvent(event);
                            });
                            
                            input.addEventListener('input', function() {
                                clonedInput.value = this.value;
                            });

                            item.appendChild(clonedLabel);
                            item.appendChild(clonedInput);

                            grid.appendChild(item);

                            group.style.display = 'none';
                        }
                    });
                } else {

                    const nameInput = formElement.querySelector('#edit-ingredient-name');
                    const amountInput = formElement.querySelector('#edit-ingredient-amount');
                    const packageAmountInput = formElement.querySelector('#edit-ingredient-package-amount');
                    const priceInput = formElement.querySelector('#edit-ingredient-price');

                    if (nameInput) {
                        const item = createNutritionItem('Name:', nameInput);
                        grid.appendChild(item);
                    }
                    
                    if (amountInput) {
                        const item = createNutritionItem('Amount (g):', amountInput);
                        grid.appendChild(item);
                    }
                    
                    if (packageAmountInput) {
                        const item = createNutritionItem('Package Amount (g):', packageAmountInput);
                        grid.appendChild(item);
                    }
                    
                    if (priceInput) {
                        const item = createNutritionItem('Package Price:', priceInput);
                        grid.appendChild(item);
                    }
                }

                if (header) {
                    basicInfoSection.insertBefore(grid, header.nextSibling);
                } else {
                    basicInfoSection.appendChild(grid);
                }
            }

            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(70px, 1fr))';
            grid.style.gap = '3px';

            const items = grid.querySelectorAll('.nutrition-item');
            items.forEach(item => {
                item.style.marginBottom = '2px';

                const label = item.querySelector('label');
                if (label) {
                    label.style.fontSize = '0.7em';
                    label.style.marginBottom = '1px';
                    label.style.color = '#aaa';
                    label.style.display = 'block';
                    label.style.whiteSpace = 'nowrap';
                    label.style.overflow = 'hidden';
                    label.style.textOverflow = 'ellipsis';
                }

                const input = item.querySelector('input');
                if (input) {
                    input.style.width = input.id === 'edit-ingredient-name' ? '80px' : '35px';
                    input.style.padding = '1px 2px';
                    input.style.height = '14px';
                    input.style.fontSize = '0.6em';
                    input.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                    input.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    input.style.color = '#e0e0e0';
                    input.style.borderRadius = '3px';
                }
            });

            form.dataset.editButtonBasicInfoFixed = 'true';
            
            console.log('Basic Information section fixed for existing ingredient edit');
        });
    }

    function createNutritionItem(labelText, input) {
        const item = document.createElement('div');
        item.className = 'nutrition-item';

        const label = document.createElement('label');
        label.textContent = labelText;
        label.setAttribute('for', input.id);

        label.style.fontSize = '0.7em';
        label.style.marginBottom = '1px';
        label.style.color = '#aaa';
        label.style.display = 'block';
        label.style.whiteSpace = 'nowrap';
        label.style.overflow = 'hidden';
        label.style.textOverflow = 'ellipsis';

        const clonedInput = input.cloneNode(true);

        clonedInput.value = input.value;

        clonedInput.addEventListener('input', function() {
            input.value = this.value;

            const event = new Event('change', { bubbles: true });
            input.dispatchEvent(event);
        });
        
        input.addEventListener('input', function() {
            clonedInput.value = this.value;
        });

        clonedInput.style.width = input.id === 'edit-ingredient-name' ? '80px' : '35px';
        clonedInput.style.padding = '1px 2px';
        clonedInput.style.height = '14px';
        clonedInput.style.fontSize = '0.6em';
        clonedInput.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
        clonedInput.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        clonedInput.style.color = '#e0e0e0';
        clonedInput.style.borderRadius = '3px';

        item.appendChild(label);
        item.appendChild(clonedInput);

        input.style.display = 'none';
        
        return item;
    }

    function init() {
        console.log('Initializing Edit Button Basic Info Fix');

        fixEditButtonBasicInfo();

        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    setTimeout(fixEditButtonBasicInfo, 50);
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        document.body.addEventListener('click', function(event) {
            if (event.target.classList.contains('edit-ingredient-btn') || 
                event.target.classList.contains('edit-btn')) {
                console.log('Edit button clicked, applying Basic Info fix');

                setTimeout(fixEditButtonBasicInfo, 100);

                setTimeout(fixEditButtonBasicInfo, 300);
                setTimeout(fixEditButtonBasicInfo, 500);
            }
        });

        setInterval(fixEditButtonBasicInfo, 1000);
        
        console.log('Edit Button Basic Info Fix initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
