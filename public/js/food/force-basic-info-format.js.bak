/**
 * Force Basic Info Format
 * Forces the Basic Information section to have the correct format in all cases
 */

(function() {
    // Function to force the Basic Information section format
    function forceBasicInfoFormat() {
        // Find all edit ingredient forms
        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {
            // Skip if already processed
            if (form.dataset.forceBasicInfoFormatted === 'true') return;
            
            console.log('Forcing Basic Information section format');
            
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
                <h4 style="margin-top: 0; margin-bottom: 5px; padding-bottom: 2px; border-bottom: none; color: #e0e0e0; font-weight: 500; font-size: 0.85em;">Basic Information</h4>
                <div class="nutrition-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 3px;">
                    <div class="nutrition-item" style="margin-bottom: 2px;">
                        <label for="new-edit-ingredient-name" style="font-size: 0.7em; margin-bottom: 1px; color: #aaa; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Name:</label>
                        <input type="text" id="new-edit-ingredient-name" value="${nameValue}" style="width: 80px; padding: 1px 2px; height: 14px; font-size: 0.6em; background-color: rgba(30, 30, 30, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); color: #e0e0e0; border-radius: 3px;" required>
                    </div>
                    <div class="nutrition-item" style="margin-bottom: 2px;">
                        <label for="new-edit-ingredient-amount" style="font-size: 0.7em; margin-bottom: 1px; color: #aaa; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Amount (g):</label>
                        <input type="number" id="new-edit-ingredient-amount" value="${amountValue}" step="0.1" min="0.1" style="width: 35px; padding: 1px 2px; height: 14px; font-size: 0.6em; background-color: rgba(30, 30, 30, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); color: #e0e0e0; border-radius: 3px;" required>
                    </div>
                    ${packageAmountInput ? `
                    <div class="nutrition-item" style="margin-bottom: 2px;">
                        <label for="new-edit-ingredient-package-amount" style="font-size: 0.7em; margin-bottom: 1px; color: #aaa; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Package Amount (g):</label>
                        <input type="number" id="new-edit-ingredient-package-amount" value="${packageAmountValue}" step="0.1" min="0" style="width: 35px; padding: 1px 2px; height: 14px; font-size: 0.6em; background-color: rgba(30, 30, 30, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); color: #e0e0e0; border-radius: 3px;">
                    </div>
                    ` : ''}
                    ${priceInput ? `
                    <div class="nutrition-item" style="margin-bottom: 2px;">
                        <label for="new-edit-ingredient-price" style="font-size: 0.7em; margin-bottom: 1px; color: #aaa; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Package Price:</label>
                        <input type="number" id="new-edit-ingredient-price" value="${priceValue}" step="0.01" min="0" style="width: 35px; padding: 1px 2px; height: 14px; font-size: 0.6em; background-color: rgba(30, 30, 30, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); color: #e0e0e0; border-radius: 3px;">
                    </div>
                    ` : ''}
                </div>
            `;
            
            // Find the existing Basic Information section or the first div in the form
            let basicInfoSection = formElement.querySelector('.basic-information');
            if (!basicInfoSection) {
                // Look for form-group-row or the first div
                basicInfoSection = formElement.querySelector('.form-group-row') || formElement.querySelector('div:first-of-type');
            }
            
            // If we found a section to replace
            if (basicInfoSection) {
                // Replace the old section with the new one
                basicInfoSection.parentNode.replaceChild(newBasicInfoSection, basicInfoSection);
            } else {
                // Insert at the beginning of the form
                formElement.insertBefore(newBasicInfoSection, formElement.firstChild);
            }
            
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
                
                nameInput.addEventListener('input', function() {
                    newNameInput.value = this.value;
                });
            }
            
            if (newAmountInput && amountInput) {
                newAmountInput.addEventListener('input', function() {
                    amountInput.value = this.value;
                    // Trigger change event
                    const event = new Event('change', { bubbles: true });
                    amountInput.dispatchEvent(event);
                });
                
                amountInput.addEventListener('input', function() {
                    newAmountInput.value = this.value;
                });
            }
            
            if (newPackageAmountInput && packageAmountInput) {
                newPackageAmountInput.addEventListener('input', function() {
                    packageAmountInput.value = this.value;
                    // Trigger change event
                    const event = new Event('change', { bubbles: true });
                    packageAmountInput.dispatchEvent(event);
                });
                
                packageAmountInput.addEventListener('input', function() {
                    newPackageAmountInput.value = this.value;
                });
            }
            
            if (newPriceInput && priceInput) {
                newPriceInput.addEventListener('input', function() {
                    priceInput.value = this.value;
                    // Trigger change event
                    const event = new Event('change', { bubbles: true });
                    priceInput.dispatchEvent(event);
                });
                
                priceInput.addEventListener('input', function() {
                    newPriceInput.value = this.value;
                });
            }
            
            // Hide the original inputs
            if (nameInput) nameInput.style.display = 'none';
            if (amountInput) amountInput.style.display = 'none';
            if (packageAmountInput) packageAmountInput.style.display = 'none';
            if (priceInput) priceInput.style.display = 'none';
            
            // Mark as processed
            form.dataset.forceBasicInfoFormatted = 'true';
            
            console.log('Basic Information section format forced');
        });
    }
    
    // Function to initialize
    function init() {
        console.log('Initializing Force Basic Info Format');
        
        // Initial formatting
        forceBasicInfoFormat();
        
        // Set up a mutation observer to watch for new forms
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    setTimeout(forceBasicInfoFormat, 50);
                }
            });
        });
        
        // Start observing the document body for changes
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Also handle edit button clicks directly
        document.body.addEventListener('click', function(event) {
            if (event.target.classList.contains('edit-ingredient-btn') || 
                event.target.classList.contains('edit-btn') ||
                (event.target.tagName === 'BUTTON' && event.target.textContent === 'Edit')) {
                console.log('Edit button clicked, forcing Basic Info format');
                
                // Wait for the form to be displayed
                setTimeout(forceBasicInfoFormat, 100);
                // Try again after a bit longer to ensure it's applied
                setTimeout(forceBasicInfoFormat, 300);
                setTimeout(forceBasicInfoFormat, 500);
                setTimeout(forceBasicInfoFormat, 1000);
            }
        });
        
        // Run periodically to ensure the format is applied
        setInterval(forceBasicInfoFormat, 1000);
        
        console.log('Force Basic Info Format initialized');
    }
    
    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
