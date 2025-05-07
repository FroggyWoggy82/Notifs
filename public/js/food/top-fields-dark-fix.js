/**
 * Top Fields Dark Fix
 * Ensures the top fields (Name, Amount, Package Amount, Package Price) match the styling of the rest of the form
 */

document.addEventListener('DOMContentLoaded', function() {

    function applyTopFieldsDarkFix() {

        const editForms = document.querySelectorAll('.edit-ingredient-form');

        editForms.forEach(form => {

            if (form.dataset.topFieldsFixed === 'true') return;

            const formElement = form.querySelector('form');
            if (!formElement) return;

            const formGroupColumn = formElement.querySelector('.form-group-column');
            if (!formGroupColumn) return;

            const wrapper = document.createElement('div');
            wrapper.className = 'nutrition-section basic-info-section';
            wrapper.style.marginBottom = '20px';

            const header = document.createElement('h4');
            header.textContent = 'Basic Information';
            header.style.marginTop = '0';
            header.style.marginBottom = '10px';
            header.style.paddingBottom = '5px';
            header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
            header.style.color = '#e0e0e0';
            header.style.fontWeight = '500';

            const grid = document.createElement('div');
            grid.className = 'nutrition-grid basic-info-grid';
            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(120px, 1fr))';
            grid.style.gap = '10px';

            const generalSection = form.querySelector('.nutrition-section');
            if (generalSection) {
                const computedStyle = window.getComputedStyle(generalSection);
                wrapper.style.backgroundColor = computedStyle.backgroundColor;
                wrapper.style.border = computedStyle.border;
                wrapper.style.borderRadius = computedStyle.borderRadius;
                wrapper.style.padding = computedStyle.padding;
            }

            const formGroups = Array.from(formGroupColumn.querySelectorAll('.form-group'));

            formGroups.forEach((group, index) => {

                const item = document.createElement('div');
                item.className = 'nutrition-item basic-info-item';
                item.style.display = 'flex';
                item.style.flexDirection = 'column';

                const label = group.querySelector('label');
                const input = group.querySelector('input');

                if (label && input) {

                    label.style.fontSize = '0.85em';
                    label.style.marginBottom = '3px';
                    label.style.color = '#aaaaaa';

                    const clonedInput = input.cloneNode(true);

                    clonedInput.style.backgroundColor = 'rgba(20, 20, 20, 0.8)';
                    clonedInput.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    clonedInput.style.color = '#e0e0e0';
                    clonedInput.style.borderRadius = '3px';
                    clonedInput.style.padding = '6px 8px';
                    clonedInput.style.fontSize = '0.9em';
                    clonedInput.style.height = 'auto';

                    if (index === 0) {
                        item.style.gridColumn = 'span 2';
                    }

                    clonedInput.addEventListener('input', function() {
                        input.value = clonedInput.value;
                    });

                    input.addEventListener('input', function() {
                        clonedInput.value = input.value;
                    });

                    const observer = new MutationObserver(function(mutations) {
                        mutations.forEach(function(mutation) {
                            if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
                                clonedInput.value = input.value;
                            }
                        });
                    });

                    observer.observe(input, { attributes: true });

                    item.appendChild(label);
                    item.appendChild(clonedInput);

                    grid.appendChild(item);
                }
            });

            wrapper.appendChild(header);
            wrapper.appendChild(grid);

            formGroupColumn.parentNode.insertBefore(wrapper, formGroupColumn);

            formGroupColumn.remove();

            const extraInputs = formElement.querySelectorAll('.form-group-column:not(.nutrition-grid)');
            extraInputs.forEach(extraInput => {
                extraInput.remove();
            });

            const standaloneInputs = formElement.querySelectorAll('input[type="text"]:not(.nutrition-item input), input[type="number"]:not(.nutrition-item input)');
            standaloneInputs.forEach(input => {

                if (!input.closest('.nutrition-item')) {
                    input.remove();
                }
            });

            form.dataset.topFieldsFixed = 'true';
        });
    }

    setTimeout(applyTopFieldsDarkFix, 100);

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(applyTopFieldsDarkFix, 50);
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-ingredient-btn')) {

            setTimeout(applyTopFieldsDarkFix, 100);

            setTimeout(applyTopFieldsDarkFix, 300);
            setTimeout(applyTopFieldsDarkFix, 500);
        }
    });

    setInterval(applyTopFieldsDarkFix, 1000);
});
