/**
 * Exact Nutrition Match
 * Makes the edit ingredient form match the exact sizing and layout of the detailed nutrition panel
 */

(function() {
    // Function to ensure the exact layout and sizing
    function ensureExactMatch() {
        // Find all edit ingredient forms
        const editForms = document.querySelectorAll('.edit-ingredient-form');

        editForms.forEach(form => {
            // Skip if already processed
            if (form.dataset.exactMatchApplied === 'true') return;

            console.log('Applying exact nutrition match to edit ingredient form');

            // Apply styling to the form
            form.style.marginTop = '8px';
            form.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            form.style.borderRadius = '4px';
            form.style.padding = '8px';
            form.style.backgroundColor = 'rgba(25, 25, 25, 0.7)';
            form.style.color = '#e0e0e0';

            // Find the Basic Information section
            const basicInfoSection = form.querySelector('.basic-information');
            if (basicInfoSection) {
                // Apply styling to the Basic Information section to match other sections
                basicInfoSection.style.marginBottom = '8px';
                basicInfoSection.style.paddingBottom = '5px';
                basicInfoSection.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
                basicInfoSection.style.backgroundColor = 'rgba(25, 25, 25, 0.7)';
                basicInfoSection.style.borderRadius = '4px';
                basicInfoSection.style.padding = '8px';
                basicInfoSection.style.display = 'flex';
                basicInfoSection.style.flexDirection = 'column';

                // Apply styling to the Basic Information header
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

                // Check if we need to restructure the Basic Information section
                let grid = basicInfoSection.querySelector('.nutrition-grid');
                if (!grid) {
                    // Create a nutrition grid for the Basic Information section
                    grid = document.createElement('div');
                    grid.className = 'nutrition-grid';

                    // Find all form groups or inputs in the Basic Information section
                    const formGroups = basicInfoSection.querySelectorAll('.form-group');
                    const inputs = basicInfoSection.querySelectorAll('input[type="text"], input[type="number"]');

                    // If we have form groups, convert them to nutrition items
                    if (formGroups.length > 0) {
                        formGroups.forEach(group => {
                            // Convert form-group to nutrition-item
                            group.className = 'nutrition-item';
                            grid.appendChild(group);
                        });
                    }
                    // If we have direct inputs, create nutrition items for them
                    else if (inputs.length > 0) {
                        inputs.forEach(input => {
                            // Create a nutrition item
                            const item = document.createElement('div');
                            item.className = 'nutrition-item';

                            // Create a label based on the input id or name
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

                            // Clone the input to preserve its attributes and event listeners
                            const clonedInput = input.cloneNode(true);

                            // Copy the value from the original input
                            clonedInput.value = input.value;

                            // Add event listeners to sync the values
                            clonedInput.addEventListener('input', function() {
                                input.value = this.value;
                                // Trigger change event on the original input
                                const event = new Event('change', { bubbles: true });
                                input.dispatchEvent(event);
                            });

                            input.addEventListener('input', function() {
                                clonedInput.value = this.value;
                            });

                            // Hide the original input
                            input.style.display = 'none';

                            // Add the label and input to the item
                            item.appendChild(label);
                            item.appendChild(clonedInput);

                            // Add the item to the grid
                            grid.appendChild(item);
                        });
                    }

                    // Add the grid after the header
                    if (header) {
                        basicInfoSection.insertBefore(grid, header.nextSibling);
                    } else {
                        basicInfoSection.appendChild(grid);
                    }
                }

                // Apply styling to the Basic Information grid
                grid.style.display = 'grid';
                grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(70px, 1fr))';
                grid.style.gap = '3px';

                // Apply styling to the Basic Information items
                const items = basicInfoSection.querySelectorAll('.nutrition-item, .form-group');
                items.forEach(item => {
                    item.style.marginBottom = '2px';

                    // Apply styling to the label
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

                    // Apply styling to the input
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

            // Find the form group column (alternative to Basic Information section)
            const formGroupColumn = form.querySelector('.form-group-column');
            if (formGroupColumn && !basicInfoSection) {
                // Apply styling to the form group column
                formGroupColumn.style.display = 'grid';
                formGroupColumn.style.gridTemplateColumns = 'repeat(auto-fill, minmax(70px, 1fr))';
                formGroupColumn.style.gap = '3px';
                formGroupColumn.style.marginBottom = '0';

                // Apply styling to the form groups
                const formGroups = formGroupColumn.querySelectorAll('.form-group');
                formGroups.forEach(group => {
                    group.style.marginBottom = '2px';
                    group.style.display = 'flex';
                    group.style.flexDirection = 'column';
                    group.style.width = 'auto';

                    // Apply styling to the label
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

                    // Apply styling to the input
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

            // Find the detailed nutrition panel
            const detailedPanel = form.querySelector('.detailed-nutrition-panel');
            if (detailedPanel) {
                // Apply styling to the detailed nutrition panel
                detailedPanel.style.marginTop = '8px';
                detailedPanel.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                detailedPanel.style.borderRadius = '4px';
                detailedPanel.style.padding = '8px';
                detailedPanel.style.backgroundColor = 'rgba(25, 25, 25, 0.7)';
                detailedPanel.style.color = '#e0e0e0';

                // Apply styling to the nutrition sections
                const sections = detailedPanel.querySelectorAll('.nutrition-section');
                sections.forEach(section => {
                    section.style.marginBottom = '8px';
                    section.style.paddingBottom = '5px';

                    // Apply styling to the section header
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

                    // Apply styling to the nutrition grid
                    const grid = section.querySelector('.nutrition-grid');
                    if (grid) {
                        grid.style.display = 'grid';
                        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(70px, 1fr))';
                        grid.style.gap = '3px';
                    }

                    // Apply styling to the nutrition items
                    const items = section.querySelectorAll('.nutrition-item');
                    items.forEach(item => {
                        item.style.marginBottom = '2px';

                        // Apply styling to the label
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

                        // Apply styling to the input
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

            // Apply styling to the form actions
            const formActions = form.querySelector('.form-actions');
            if (formActions) {
                formActions.style.display = 'flex';
                formActions.style.justifyContent = 'flex-end';
                formActions.style.gap = '6px';
                formActions.style.marginTop = '6px';

                // Apply styling to the buttons
                const buttons = formActions.querySelectorAll('button');
                buttons.forEach(button => {
                    button.style.padding = '3px 6px';
                    button.style.fontSize = '0.75em';
                    button.style.borderRadius = '4px';
                    button.style.border = 'none';
                    button.style.cursor = 'pointer';
                    button.style.height = '24px';

                    // Apply styling to the save button
                    if (button.classList.contains('save-changes-btn')) {
                        button.style.backgroundColor = '#ffffff';
                        button.style.color = '#121212';
                    }

                    // Apply styling to the cancel button
                    if (button.classList.contains('cancel-edit-btn')) {
                        button.style.backgroundColor = 'transparent';
                        button.style.color = '#e0e0e0';
                        button.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                    }
                });
            }

            // Mark the form as processed
            form.dataset.exactMatchApplied = 'true';

            console.log('Exact nutrition match applied to edit ingredient form');
        });

        // Also apply the same styling to all detailed nutrition panels
        const detailedPanels = document.querySelectorAll('.detailed-nutrition-panel');
        detailedPanels.forEach(panel => {
            // Skip if already processed
            if (panel.dataset.exactMatchApplied === 'true') return;

            // Apply styling to the detailed nutrition panel
            panel.style.marginTop = '8px';
            panel.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            panel.style.borderRadius = '4px';
            panel.style.padding = '8px';
            panel.style.backgroundColor = 'rgba(25, 25, 25, 0.7)';
            panel.style.color = '#e0e0e0';

            // Apply styling to the nutrition sections
            const sections = panel.querySelectorAll('.nutrition-section');
            sections.forEach(section => {
                section.style.marginBottom = '8px';
                section.style.paddingBottom = '5px';

                // Apply styling to the section header
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

                // Apply styling to the nutrition grid
                const grid = section.querySelector('.nutrition-grid');
                if (grid) {
                    grid.style.display = 'grid';
                    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(70px, 1fr))';
                    grid.style.gap = '3px';
                }

                // Apply styling to the nutrition items
                const items = section.querySelectorAll('.nutrition-item');
                items.forEach(item => {
                    item.style.marginBottom = '2px';

                    // Apply styling to the label
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

                    // Apply styling to the input
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

            // Mark the panel as processed
            panel.dataset.exactMatchApplied = 'true';
        });
    }

    // Function to initialize
    function init() {
        console.log('Initializing exact nutrition match');

        // Initial styling
        ensureExactMatch();

        // Set up a mutation observer to watch for new forms
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    setTimeout(ensureExactMatch, 50);
                }
            });
        });

        // Start observing the document body for changes
        observer.observe(document.body, { childList: true, subtree: true });

        // Also handle dynamic form creation through event delegation
        document.body.addEventListener('click', function(event) {
            if (event.target.classList.contains('edit-ingredient-btn')) {
                // Wait for the form to be displayed
                setTimeout(ensureExactMatch, 100);
                // Try again after a bit longer to ensure it's applied
                setTimeout(ensureExactMatch, 300);
                setTimeout(ensureExactMatch, 500);
            }
        });

        // Run periodically to ensure the style is applied
        setInterval(ensureExactMatch, 1000);

        console.log('Exact nutrition match initialized');
    }

    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
