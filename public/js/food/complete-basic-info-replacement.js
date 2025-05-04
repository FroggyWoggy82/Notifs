/**
 * Complete Basic Info Replacement
 * Completely replaces the Basic Information section with a properly formatted version
 */

(function() {
    // Function to completely replace the Basic Information section
    function completeBasicInfoReplacement() {
        // Find all edit ingredient forms
        const editForms = document.querySelectorAll('.edit-ingredient-form');

        editForms.forEach(form => {
            // Skip if already processed
            if (form.dataset.completeBasicInfoReplaced === 'true') return;

            console.log('Completely replacing Basic Information section');

            // Find the form element
            const formElement = form.querySelector('form');
            if (!formElement) return;

            // Get the current values from the form
            const nameInput = formElement.querySelector('#edit-ingredient-name');
            const amountInput = formElement.querySelector('#edit-ingredient-amount');
            const packageAmountInput = formElement.querySelector('#edit-ingredient-package-amount');
            const priceInput = formElement.querySelector('#edit-ingredient-price');

            if (!nameInput || !amountInput) return;

            // Get the current values
            const nameValue = nameInput.value || '';
            const amountValue = amountInput.value || '';
            const packageAmountValue = packageAmountInput ? packageAmountInput.value || '' : '';
            const priceValue = priceInput ? priceInput.value || '' : '';

            // Find the existing Basic Information section or the first div in the form
            let basicInfoSection = formElement.querySelector('.basic-information');
            if (!basicInfoSection) {
                // Look for form-group-row or the first div
                basicInfoSection = formElement.querySelector('.form-group-row') || formElement.querySelector('div:first-of-type');
            }

            // If we found a section to replace
            if (basicInfoSection) {
                // Create a completely new Basic Information section
                const newBasicInfoSection = document.createElement('div');
                newBasicInfoSection.className = 'nutrition-section basic-information';
                newBasicInfoSection.style.marginBottom = '8px';
                newBasicInfoSection.style.paddingBottom = '5px';
                newBasicInfoSection.style.backgroundColor = 'rgba(25, 25, 25, 0.7)';
                newBasicInfoSection.style.borderRadius = '4px';
                newBasicInfoSection.style.padding = '8px';
                newBasicInfoSection.style.display = 'flex';
                newBasicInfoSection.style.flexDirection = 'column';

                // Create the HTML content
                newBasicInfoSection.innerHTML = `
                    <h4 style="margin-top: 0; margin-bottom: 6px; padding-bottom: 3px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); color: #e0e0e0; font-weight: 500; font-size: 0.85em;">Basic Information</h4>
                    <div class="nutrition-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 3px;">
                        <div class="nutrition-item" style="margin-bottom: 2px; display: flex; flex-direction: column;">
                            <label for="new-edit-ingredient-name" style="font-size: 0.7em; margin-bottom: 1px; color: #aaa; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Name:</label>
                            <input type="text" id="new-edit-ingredient-name" value="${nameValue}" style="width: 100px; padding: 1px 3px; height: 14px; font-size: 0.75em; background-color: rgba(30, 30, 30, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); color: #e0e0e0; border-radius: 4px;" required>
                        </div>
                        <div class="nutrition-item" style="margin-bottom: 2px; display: flex; flex-direction: column;">
                            <label for="new-edit-ingredient-amount" style="font-size: 0.7em; margin-bottom: 1px; color: #aaa; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Amount (g):</label>
                            <input type="number" id="new-edit-ingredient-amount" value="${amountValue}" step="0.1" min="0.1" style="width: 50px; padding: 1px 3px; height: 14px; font-size: 0.75em; background-color: rgba(30, 30, 30, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); color: #e0e0e0; border-radius: 4px;" required>
                        </div>
                        ${packageAmountInput ? `
                        <div class="nutrition-item" style="margin-bottom: 2px; display: flex; flex-direction: column;">
                            <label for="new-edit-ingredient-package-amount" style="font-size: 0.7em; margin-bottom: 1px; color: #aaa; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Package Amount (g):</label>
                            <input type="number" id="new-edit-ingredient-package-amount" value="${packageAmountValue}" step="0.1" min="0" style="width: 50px; padding: 1px 3px; height: 14px; font-size: 0.75em; background-color: rgba(30, 30, 30, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); color: #e0e0e0; border-radius: 4px;">
                        </div>
                        ` : ''}
                        ${priceInput ? `
                        <div class="nutrition-item" style="margin-bottom: 2px; display: flex; flex-direction: column;">
                            <label for="new-edit-ingredient-price" style="font-size: 0.7em; margin-bottom: 1px; color: #aaa; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Package Price:</label>
                            <input type="number" id="new-edit-ingredient-price" value="${priceValue}" step="0.01" min="0" style="width: 50px; padding: 1px 3px; height: 14px; font-size: 0.75em; background-color: rgba(30, 30, 30, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); color: #e0e0e0; border-radius: 4px;">
                        </div>
                        ` : ''}
                    </div>
                `;

                // Replace the old section with the new one
                basicInfoSection.parentNode.replaceChild(newBasicInfoSection, basicInfoSection);

                // Add event listeners to sync the values
                const newNameInput = newBasicInfoSection.querySelector('#new-edit-ingredient-name');
                const newAmountInput = newBasicInfoSection.querySelector('#new-edit-ingredient-amount');
                const newPackageAmountInput = newBasicInfoSection.querySelector('#new-edit-ingredient-package-amount');
                const newPriceInput = newBasicInfoSection.querySelector('#new-edit-ingredient-price');

                if (newNameInput && nameInput) {
                    newNameInput.addEventListener('input', function() {
                        nameInput.value = this.value;
                        // Trigger change event
                        const event = new Event('change', { bubbles: true });
                        nameInput.dispatchEvent(event);
                    });
                }

                if (newAmountInput && amountInput) {
                    newAmountInput.addEventListener('input', function() {
                        amountInput.value = this.value;
                        // Trigger change event
                        const event = new Event('change', { bubbles: true });
                        amountInput.dispatchEvent(event);
                    });
                }

                if (newPackageAmountInput && packageAmountInput) {
                    newPackageAmountInput.addEventListener('input', function() {
                        packageAmountInput.value = this.value;
                        // Trigger change event
                        const event = new Event('change', { bubbles: true });
                        packageAmountInput.dispatchEvent(event);
                    });
                }

                if (newPriceInput && priceInput) {
                    newPriceInput.addEventListener('input', function() {
                        priceInput.value = this.value;
                        // Trigger change event
                        const event = new Event('change', { bubbles: true });
                        priceInput.dispatchEvent(event);
                    });
                }

                // Hide the original inputs
                if (nameInput) nameInput.style.display = 'none';
                if (amountInput) amountInput.style.display = 'none';
                if (packageAmountInput) packageAmountInput.style.display = 'none';
                if (priceInput) priceInput.style.display = 'none';

                console.log('Basic Information section completely replaced');
            }

            // Mark as processed
            form.dataset.completeBasicInfoReplaced = 'true';
        });
    }

    // Function to initialize
    function init() {
        console.log('Initializing Complete Basic Info Replacement');

        // Initial replacement
        completeBasicInfoReplacement();

        // Set up a mutation observer to watch for new forms
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    setTimeout(completeBasicInfoReplacement, 50);
                }
            });
        });

        // Start observing the document body for changes
        observer.observe(document.body, { childList: true, subtree: true });

        // Also handle edit button clicks directly
        document.body.addEventListener('click', function(event) {
            if (event.target.classList.contains('edit-ingredient-btn') ||
                event.target.classList.contains('edit-btn') ||
                event.target.textContent === 'Edit') {
                console.log('Edit button clicked, applying complete Basic Info replacement');

                // Wait for the form to be displayed
                setTimeout(completeBasicInfoReplacement, 100);
                // Try again after a bit longer to ensure it's applied
                setTimeout(completeBasicInfoReplacement, 300);
                setTimeout(completeBasicInfoReplacement, 500);
                setTimeout(completeBasicInfoReplacement, 1000);
            }
        });

        // Run periodically to ensure the replacement is applied
        setInterval(completeBasicInfoReplacement, 1000);

        console.log('Complete Basic Info Replacement initialized');
    }

    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
