/**
 * Exact Nutrition Match
 * Makes the edit ingredient form match the exact sizing and layout of the detailed nutrition panel
 */

(function() {

    function ensureExactMatch() {

        const editForms = document.querySelectorAll('.edit-ingredient-form');

        editForms.forEach(form => {

            if (form.dataset.exactMatchApplied === 'true') return;

            console.log('Applying exact nutrition match to edit ingredient form');

            form.style.marginTop = '8px';
            form.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            form.style.borderRadius = '4px';
            form.style.padding = '8px';
            form.style.backgroundColor = 'rgba(25, 25, 25, 0.7)';
            form.style.color = '#e0e0e0';

            const basicInfoSection = form.querySelector('.basic-information');
            if (basicInfoSection) {

                basicInfoSection.style.marginBottom = '8px';
                basicInfoSection.style.paddingBottom = '5px';
                basicInfoSection.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
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
                    const inputs = basicInfoSection.querySelectorAll('input[type="text"], input[type="number"]');

                    if (formGroups.length > 0) {
                        formGroups.forEach(group => {

                            group.className = 'nutrition-item';
                            grid.appendChild(group);
                        });
                    }

                    else if (inputs.length > 0) {
                        inputs.forEach(input => {

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

                            input.style.display = 'none';

                            item.appendChild(label);
                            item.appendChild(clonedInput);

                            grid.appendChild(item);
                        });
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

                const items = basicInfoSection.querySelectorAll('.nutrition-item, .form-group');
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
            }

            const formGroupColumn = form.querySelector('.form-group-column');
            if (formGroupColumn && !basicInfoSection) {

                formGroupColumn.style.display = 'grid';
                formGroupColumn.style.gridTemplateColumns = 'repeat(auto-fill, minmax(70px, 1fr))';
                formGroupColumn.style.gap = '3px';
                formGroupColumn.style.marginBottom = '0';

                const formGroups = formGroupColumn.querySelectorAll('.form-group');
                formGroups.forEach(group => {
                    group.style.marginBottom = '2px';
                    group.style.display = 'flex';
                    group.style.flexDirection = 'column';
                    group.style.width = 'auto';

                    const label = group.querySelector('label');
                    if (label) {
                        label.style.fontSize = '0.7em';
                        label.style.marginBottom = '1px';
                        label.style.color = '#aaa';
                        label.style.display = 'block';
                        label.style.whiteSpace = 'nowrap';
                        label.style.overflow = 'hidden';
                        label.style.textOverflow = 'ellipsis';
                    }

                    const input = group.querySelector('input');
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
            }

            const detailedPanel = form.querySelector('.detailed-nutrition-panel');
            if (detailedPanel) {

                detailedPanel.style.marginTop = '8px';
                detailedPanel.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                detailedPanel.style.borderRadius = '4px';
                detailedPanel.style.padding = '8px';
                detailedPanel.style.backgroundColor = 'rgba(25, 25, 25, 0.7)';
                detailedPanel.style.color = '#e0e0e0';

                const sections = detailedPanel.querySelectorAll('.nutrition-section');
                sections.forEach(section => {
                    section.style.marginBottom = '8px';
                    section.style.paddingBottom = '5px';

                    const header = section.querySelector('h4');
                    if (header) {
                        header.style.marginTop = '0';
                        header.style.marginBottom = '5px';
                        header.style.paddingBottom = '2px';
                        header.style.borderBottom = 'none';
                        header.style.color = '#e0e0e0';
                        header.style.fontWeight = '500';
                        header.style.fontSize = '0.85em';
                    }

                    const grid = section.querySelector('.nutrition-grid');
                    if (grid) {
                        grid.style.display = 'grid';
                        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(70px, 1fr))';
                        grid.style.gap = '3px';
                    }

                    const items = section.querySelectorAll('.nutrition-item');
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
                            input.style.width = '35px';
                            input.style.padding = '1px 2px';
                            input.style.height = '14px';
                            input.style.fontSize = '0.6em';
                            input.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                            input.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                            input.style.color = '#e0e0e0';
                            input.style.borderRadius = '3px';
                        }
                    });
                });
            }

            const formActions = form.querySelector('.form-actions');
            if (formActions) {
                formActions.style.display = 'flex';
                formActions.style.justifyContent = 'flex-end';
                formActions.style.gap = '6px';
                formActions.style.marginTop = '6px';

                const buttons = formActions.querySelectorAll('button');
                buttons.forEach(button => {
                    button.style.padding = '3px 6px';
                    button.style.fontSize = '0.75em';
                    button.style.borderRadius = '4px';
                    button.style.border = 'none';
                    button.style.cursor = 'pointer';
                    button.style.height = '24px';

                    if (button.classList.contains('save-changes-btn')) {
                        button.style.backgroundColor = '#ffffff';
                        button.style.color = '#121212';
                    }

                    if (button.classList.contains('cancel-edit-btn')) {
                        button.style.backgroundColor = 'transparent';
                        button.style.color = '#e0e0e0';
                        button.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                    }
                });
            }

            form.dataset.exactMatchApplied = 'true';

            console.log('Exact nutrition match applied to edit ingredient form');
        });

        const detailedPanels = document.querySelectorAll('.detailed-nutrition-panel');
        detailedPanels.forEach(panel => {

            if (panel.dataset.exactMatchApplied === 'true') return;

            panel.style.marginTop = '8px';
            panel.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            panel.style.borderRadius = '4px';
            panel.style.padding = '8px';
            panel.style.backgroundColor = 'rgba(25, 25, 25, 0.7)';
            panel.style.color = '#e0e0e0';

            const sections = panel.querySelectorAll('.nutrition-section');
            sections.forEach(section => {
                section.style.marginBottom = '8px';
                section.style.paddingBottom = '5px';

                const header = section.querySelector('h4');
                if (header) {
                    header.style.marginTop = '0';
                    header.style.marginBottom = '5px';
                    header.style.paddingBottom = '2px';
                    header.style.borderBottom = 'none';
                    header.style.color = '#e0e0e0';
                    header.style.fontWeight = '500';
                    header.style.fontSize = '0.85em';
                }

                const grid = section.querySelector('.nutrition-grid');
                if (grid) {
                    grid.style.display = 'grid';
                    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(70px, 1fr))';
                    grid.style.gap = '3px';
                }

                const items = section.querySelectorAll('.nutrition-item');
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
                        input.style.width = '35px';
                        input.style.padding = '1px 2px';
                        input.style.height = '14px';
                        input.style.fontSize = '0.6em';
                        input.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                        input.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                        input.style.color = '#e0e0e0';
                        input.style.borderRadius = '3px';
                    }
                });
            });

            panel.dataset.exactMatchApplied = 'true';
        });
    }

    function init() {
        console.log('Initializing exact nutrition match');

        ensureExactMatch();

        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    setTimeout(ensureExactMatch, 50);
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        document.body.addEventListener('click', function(event) {
            if (event.target.classList.contains('edit-ingredient-btn')) {

                setTimeout(ensureExactMatch, 100);

                setTimeout(ensureExactMatch, 300);
                setTimeout(ensureExactMatch, 500);
            }
        });

        setInterval(ensureExactMatch, 1000);

        console.log('Exact nutrition match initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
