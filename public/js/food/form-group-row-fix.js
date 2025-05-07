/**
 * Form Group Row Fix
 * Specifically targets and fixes the form-group-row structure that appears when editing an existing ingredient
 */

(function() {

    function fixFormGroupRow() {

        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {

            if (form.dataset.formGroupRowFixed === 'true') return;
            
            console.log('Fixing form-group-row structure');

            const formElement = form.querySelector('form');
            if (!formElement) return;

            const formGroupRow = formElement.querySelector('.form-group-row');
            if (!formGroupRow) return;

            formGroupRow.className = 'nutrition-section basic-information';

            if (!formGroupRow.querySelector('h4')) {
                const header = document.createElement('h4');
                header.textContent = 'Basic Information';
                formGroupRow.insertBefore(header, formGroupRow.firstChild);
            }

            formGroupRow.style.marginBottom = '8px';
            formGroupRow.style.paddingBottom = '5px';
            formGroupRow.style.backgroundColor = 'rgba(25, 25, 25, 0.7)';
            formGroupRow.style.borderRadius = '4px';
            formGroupRow.style.padding = '8px';
            formGroupRow.style.display = 'flex';
            formGroupRow.style.flexDirection = 'column';

            const grid = document.createElement('div');
            grid.className = 'nutrition-grid';
            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(70px, 1fr))';
            grid.style.gap = '3px';

            const formGroups = formGroupRow.querySelectorAll('.form-group');

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

                    group.className = 'form-group replaced';
                    group.style.display = 'none';
                }
            });

            const header = formGroupRow.querySelector('h4');
            if (header) {
                formGroupRow.insertBefore(grid, header.nextSibling);
            } else {
                formGroupRow.appendChild(grid);
            }

            form.dataset.formGroupRowFixed = 'true';
            
            console.log('Form-group-row structure fixed');
        });
    }

    function init() {
        console.log('Initializing Form Group Row Fix');

        fixFormGroupRow();

        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    setTimeout(fixFormGroupRow, 50);
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        document.body.addEventListener('click', function(event) {
            if (event.target.classList.contains('edit-ingredient-btn') || 
                event.target.classList.contains('edit-btn')) {
                console.log('Edit button clicked, applying form-group-row fix');

                setTimeout(fixFormGroupRow, 100);

                setTimeout(fixFormGroupRow, 300);
                setTimeout(fixFormGroupRow, 500);
            }
        });

        setInterval(fixFormGroupRow, 1000);
        
        console.log('Form Group Row Fix initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
