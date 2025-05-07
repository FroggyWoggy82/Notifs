/**
 * Basic Info Grid Format
 * Restructures the Basic Information section to use the same grid format as other sections
 */

(function() {

    function restructureBasicInfo() {

        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {

            if (form.dataset.basicInfoGridFormatted === 'true') return;
            
            console.log('Restructuring Basic Information section to use grid format');

            const basicInfoSection = form.querySelector('.basic-information');
            if (!basicInfoSection) return;

            basicInfoSection.style.backgroundColor = 'rgba(25, 25, 25, 0.7)';
            basicInfoSection.style.borderRadius = '4px';
            basicInfoSection.style.padding = '8px';
            basicInfoSection.style.display = 'flex';
            basicInfoSection.style.flexDirection = 'column';

            const header = basicInfoSection.querySelector('h4');

            let grid = basicInfoSection.querySelector('.nutrition-grid');
            if (!grid) {

                grid = document.createElement('div');
                grid.className = 'nutrition-grid';
                grid.style.display = 'grid';
                grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(70px, 1fr))';
                grid.style.gap = '3px';

                const formGroups = basicInfoSection.querySelectorAll('.form-group');
                const directInputs = basicInfoSection.querySelectorAll('input[type="text"]:not(.form-group input), input[type="number"]:not(.form-group input)');

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

                            clonedLabel.style.fontSize = '0.7em';
                            clonedLabel.style.marginBottom = '1px';
                            clonedLabel.style.color = '#aaa';
                            clonedLabel.style.display = 'block';
                            clonedLabel.style.whiteSpace = 'nowrap';
                            clonedLabel.style.overflow = 'hidden';
                            clonedLabel.style.textOverflow = 'ellipsis';

                            clonedInput.style.width = input.id === 'edit-ingredient-name' ? '80px' : '35px';
                            clonedInput.style.padding = '1px 2px';
                            clonedInput.style.height = '14px';
                            clonedInput.style.fontSize = '0.6em';
                            clonedInput.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                            clonedInput.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                            clonedInput.style.color = '#e0e0e0';
                            clonedInput.style.borderRadius = '3px';

                            item.appendChild(clonedLabel);
                            item.appendChild(clonedInput);

                            grid.appendChild(item);

                            group.style.display = 'none';
                        }
                    });
                }

                else if (directInputs.length > 0) {
                    directInputs.forEach(input => {

                        const item = document.createElement('div');
                        item.className = 'nutrition-item';

                        const label = document.createElement('label');
                        let labelText = '';
                        if (input.id === 'edit-ingredient-name') {
                            labelText = 'Name:';
                        } else if (input.id === 'edit-ingredient-amount') {
                            labelText = 'Amount (g):';
                        } else if (input.id === 'edit-ingredient-package-amount') {
                            labelText = 'Package Amount (g):';
                        } else if (input.id === 'edit-ingredient-price') {
                            labelText = 'Package Price:';
                        } else {
                            labelText = input.name || input.id || 'Input:';
                        }
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

                        grid.appendChild(item);

                        input.style.display = 'none';
                    });
                }

                if (header) {
                    basicInfoSection.insertBefore(grid, header.nextSibling);
                } else {
                    basicInfoSection.appendChild(grid);
                }
            }

            form.dataset.basicInfoGridFormatted = 'true';
            
            console.log('Basic Information section restructured to use grid format');
        });
    }

    function init() {
        console.log('Initializing Basic Info Grid Format');

        restructureBasicInfo();

        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    setTimeout(restructureBasicInfo, 50);
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        document.body.addEventListener('click', function(event) {
            if (event.target.classList.contains('edit-ingredient-btn')) {

                setTimeout(restructureBasicInfo, 100);

                setTimeout(restructureBasicInfo, 300);
                setTimeout(restructureBasicInfo, 500);
            }
        });

        setInterval(restructureBasicInfo, 1000);
        
        console.log('Basic Info Grid Format initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
