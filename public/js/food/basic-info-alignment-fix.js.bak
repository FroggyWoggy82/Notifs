/**
 * Fix for Basic Information alignment in the Edit Ingredient form
 */
document.addEventListener('DOMContentLoaded', function() {
    // Function to fix Basic Information alignment
    function fixBasicInfoAlignment() {
        // Find all edit ingredient forms
        document.querySelectorAll('.edit-ingredient-form').forEach(form => {
            // Check if we've already processed this form
            if (form.dataset.basicInfoFixed === 'true') {
                return;
            }

            // Find the form element
            const formElement = form.querySelector('form');
            if (!formElement) return;

            // Find the Basic Information section
            const basicInfoSection = formElement.querySelector('.basic-info-section');
            if (!basicInfoSection) {
                // If no Basic Information section found, create one
                const nameLabel = formElement.querySelector('label[for="name"]');
                const nameInput = formElement.querySelector('input#name');
                const amountLabel = formElement.querySelector('label[for="amount"]');
                const amountInput = formElement.querySelector('input#amount');
                const packageAmountLabel = formElement.querySelector('label[for="packageAmount"]');
                const packageAmountInput = formElement.querySelector('input#packageAmount');
                const packagePriceLabel = formElement.querySelector('label[for="packagePrice"]');
                const packagePriceInput = formElement.querySelector('input#packagePrice');

                if (nameInput && amountInput) {
                    // Create a container for the Basic Information section
                    const container = document.createElement('div');
                    container.className = 'basic-info-section';
                    container.style.display = 'grid';
                    container.style.gridTemplateColumns = '1fr 1fr 1fr';
                    container.style.gap = '10px';
                    container.style.marginBottom = '15px';

                    // Create form groups for each input
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

                    // Add form groups to the container
                    container.appendChild(nameGroup);
                    container.appendChild(amountGroup);
                    if (packageAmountInput) container.appendChild(packageAmountGroup);
                    if (packagePriceInput) container.appendChild(packagePriceGroup);

                    // Insert the container at the beginning of the form
                    if (formElement.firstChild) {
                        formElement.insertBefore(container, formElement.firstChild);
                    } else {
                        formElement.appendChild(container);
                    }
                }
            } else {
                // Make sure the Basic Information section is properly styled
                basicInfoSection.style.display = 'grid';
                basicInfoSection.style.gridTemplateColumns = '1fr 1fr 1fr';
                basicInfoSection.style.gap = '10px';
                basicInfoSection.style.marginBottom = '15px';
            }

            // Mark the form as processed
            form.dataset.basicInfoFixed = 'true';
        });
    }

    // Run the function initially
    setTimeout(fixBasicInfoAlignment, 300);

    // Set up a mutation observer to watch for new forms
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(fixBasicInfoAlignment, 100);
            }
        });
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    // Also handle dynamic form creation through event delegation
    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-ingredient-btn')) {
            // Wait for the form to be displayed
            setTimeout(fixBasicInfoAlignment, 200);
            // Try again after a bit longer to ensure it's applied
            setTimeout(fixBasicInfoAlignment, 500);
            setTimeout(fixBasicInfoAlignment, 1000);
        }
    });

    // Run periodically to ensure the Basic Information section is properly aligned
    setInterval(fixBasicInfoAlignment, 2000);
});
