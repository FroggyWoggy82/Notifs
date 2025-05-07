/**
 * Top Fields Dark Fix
 * Ensures the top fields (Name, Amount, Package Amount, Package Price) match the styling of the rest of the form
 */

document.addEventListener('DOMContentLoaded', function() {
    // Function to apply dark styling to the top fields
    function applyTopFieldsDarkFix() {
        // Find all edit ingredient forms
        const editForms = document.querySelectorAll('.edit-ingredient-form');

        editForms.forEach(form => {
            // Skip if already processed
            if (form.dataset.topFieldsFixed === 'true') return;

            // Get the form element
            const formElement = form.querySelector('form');
            if (!formElement) return;

            // Get the form group column
            const formGroupColumn = formElement.querySelector('.form-group-column');
            if (!formGroupColumn) return;

            // Create a wrapper for the form group column
            const wrapper = document.createElement('div');
            wrapper.className = 'nutrition-section basic-info-section';
            wrapper.style.marginBottom = '20px';

            // Create a header for the section
            const header = document.createElement('h4');
            header.textContent = 'Basic Information';
            header.style.marginTop = '0';
            header.style.marginBottom = '10px';
            header.style.paddingBottom = '5px';
            header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
            header.style.color = '#e0e0e0';
            header.style.fontWeight = '500';

            // Create a grid for the form groups
            const grid = document.createElement('div');
            grid.className = 'nutrition-grid basic-info-grid';
            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(120px, 1fr))';
            grid.style.gap = '10px';

            // Copy the background color from the General section
            const generalSection = form.querySelector('.nutrition-section');
            if (generalSection) {
                const computedStyle = window.getComputedStyle(generalSection);
                wrapper.style.backgroundColor = computedStyle.backgroundColor;
                wrapper.style.border = computedStyle.border;
                wrapper.style.borderRadius = computedStyle.borderRadius;
                wrapper.style.padding = computedStyle.padding;
            }

            // Get all form groups
            const formGroups = Array.from(formGroupColumn.querySelectorAll('.form-group'));

            // Process each form group
            formGroups.forEach((group, index) => {
                // Create a new nutrition item
                const item = document.createElement('div');
                item.className = 'nutrition-item basic-info-item';
                item.style.display = 'flex';
                item.style.flexDirection = 'column';

                // Get the label and input
                const label = group.querySelector('label');
                const input = group.querySelector('input');

                if (label && input) {
                    // Style the label
                    label.style.fontSize = '0.85em';
                    label.style.marginBottom = '3px';
                    label.style.color = '#aaaaaa';

                    // Create a clone of the input to preserve the original for form submission
                    const clonedInput = input.cloneNode(true);

                    // Style the cloned input
                    clonedInput.style.backgroundColor = 'rgba(20, 20, 20, 0.8)';
                    clonedInput.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    clonedInput.style.color = '#e0e0e0';
                    clonedInput.style.borderRadius = '3px';
                    clonedInput.style.padding = '6px 8px';
                    clonedInput.style.fontSize = '0.9em';
                    clonedInput.style.height = 'auto';

                    // Make the name field take up more space
                    if (index === 0) {
                        item.style.gridColumn = 'span 2';
                    }

                    // Sync the values between the original and cloned inputs
                    clonedInput.addEventListener('input', function() {
                        input.value = clonedInput.value;
                    });

                    // Also sync from original to clone (for programmatic changes)
                    input.addEventListener('input', function() {
                        clonedInput.value = input.value;
                    });

                    // Set up a MutationObserver to watch for value changes on the original input
                    const observer = new MutationObserver(function(mutations) {
                        mutations.forEach(function(mutation) {
                            if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
                                clonedInput.value = input.value;
                            }
                        });
                    });

                    // Start observing the original input
                    observer.observe(input, { attributes: true });

                    // Add the label and cloned input to the item
                    item.appendChild(label);
                    item.appendChild(clonedInput);

                    // Add the item to the grid
                    grid.appendChild(item);
                }
            });

            // Add the header and grid to the wrapper
            wrapper.appendChild(header);
            wrapper.appendChild(grid);

            // Replace the form group column with the wrapper
            formGroupColumn.parentNode.insertBefore(wrapper, formGroupColumn);

            // Completely remove the original form group column to avoid duplicate fields
            formGroupColumn.remove();

            // Find and remove any extra dark areas or duplicate input fields
            const extraInputs = formElement.querySelectorAll('.form-group-column:not(.nutrition-grid)');
            extraInputs.forEach(extraInput => {
                extraInput.remove();
            });

            // Remove any standalone input fields that might be duplicates
            const standaloneInputs = formElement.querySelectorAll('input[type="text"]:not(.nutrition-item input), input[type="number"]:not(.nutrition-item input)');
            standaloneInputs.forEach(input => {
                // Only remove if it's not inside a nutrition-item
                if (!input.closest('.nutrition-item')) {
                    input.remove();
                }
            });

            // Mark as processed
            form.dataset.topFieldsFixed = 'true';
        });
    }

    // Run the fix when the page loads
    setTimeout(applyTopFieldsDarkFix, 100);

    // Set up a mutation observer to watch for new forms
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(applyTopFieldsDarkFix, 50);
            }
        });
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    // Also handle dynamic form creation through event delegation
    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-ingredient-btn')) {
            // Wait for the form to be displayed
            setTimeout(applyTopFieldsDarkFix, 100);
            // Try again after a bit longer to ensure it's applied
            setTimeout(applyTopFieldsDarkFix, 300);
            setTimeout(applyTopFieldsDarkFix, 500);
        }
    });

    // Run periodically to ensure the styling is applied
    setInterval(applyTopFieldsDarkFix, 1000);
});
