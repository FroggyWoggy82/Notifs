/**
 * Aggressive Basic Info Replacement
 * Uses a more aggressive approach to replace the Basic Information section
 */

(function() {
    // Function to aggressively replace the Basic Information section
    function aggressiveBasicInfoReplacement() {
        // Find all edit forms
        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {
            // Skip if already processed
            if (form.dataset.aggressiveBasicInfoReplaced === 'true') return;
            
            console.log('Aggressively replacing Basic Information section');
            
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
                newBasicInfoSection.style.backgroundColor = 'rgba(25, 25, 25, 0.7)';
                newBasicInfoSection.style.borderRadius = '4px';
                newBasicInfoSection.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                newBasicInfoSection.style.padding = '8px';
                newBasicInfoSection.style.marginBottom = '8px';
                newBasicInfoSection.style.color = '#e0e0e0';
                
                // Create the HTML content
                newBasicInfoSection.innerHTML = `
                    <h4 style="margin-top: 0; margin-bottom: 5px; padding-bottom: 2px; border-bottom: none; color: #e0e0e0; font-weight: 500; font-size: 0.85em;">Basic Information</h4>
                    <div class="nutrition-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 3px;">
                        <div class="nutrition-item" style="margin-bottom: 2px; display: flex; flex-direction: column;">
                            <label for="new-edit-ingredient-name" style="font-size: 0.7em; margin-bottom: 1px; color: #aaa; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Name:</label>
                            <input type="text" id="new-edit-ingredient-name" value="${nameValue}" style="width: 80px; padding: 1px 2px; height: 14px; font-size: 0.6em; background-color: rgba(30, 30, 30, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); color: #e0e0e0; border-radius: 3px;" required>
                        </div>
                        <div class="nutrition-item" style="margin-bottom: 2px; display: flex; flex-direction: column;">
                            <label for="new-edit-ingredient-amount" style="font-size: 0.7em; margin-bottom: 1px; color: #aaa; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Amount (g):</label>
                            <input type="number" id="new-edit-ingredient-amount" value="${amountValue}" step="0.1" min="0.1" style="width: 35px; padding: 1px 2px; height: 14px; font-size: 0.6em; background-color: rgba(30, 30, 30, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); color: #e0e0e0; border-radius: 3px;" required>
                        </div>
                        ${packageAmountInput ? `
                        <div class="nutrition-item" style="margin-bottom: 2px; display: flex; flex-direction: column;">
                            <label for="new-edit-ingredient-package-amount" style="font-size: 0.7em; margin-bottom: 1px; color: #aaa; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Package Amount (g):</label>
                            <input type="number" id="new-edit-ingredient-package-amount" value="${packageAmountValue}" step="0.1" min="0" style="width: 35px; padding: 1px 2px; height: 14px; font-size: 0.6em; background-color: rgba(30, 30, 30, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); color: #e0e0e0; border-radius: 3px;">
                        </div>
                        ` : ''}
                        ${priceInput ? `
                        <div class="nutrition-item" style="margin-bottom: 2px; display: flex; flex-direction: column;">
                            <label for="new-edit-ingredient-price" style="font-size: 0.7em; margin-bottom: 1px; color: #aaa; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Package Price:</label>
                            <input type="number" id="new-edit-ingredient-price" value="${priceValue}" step="0.01" min="0" style="width: 35px; padding: 1px 2px; height: 14px; font-size: 0.6em; background-color: rgba(30, 30, 30, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); color: #e0e0e0; border-radius: 3px;">
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
                
                console.log('Basic Information section aggressively replaced');
            }
            
            // Mark as processed
            form.dataset.aggressiveBasicInfoReplaced = 'true';
        });
    }
    
    // Function to initialize
    function init() {
        console.log('Initializing Aggressive Basic Info Replacement');
        
        // Initial replacement
        aggressiveBasicInfoReplacement();
        
        // Set up a mutation observer to watch for new forms
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    setTimeout(aggressiveBasicInfoReplacement, 50);
                }
            });
        });
        
        // Start observing the document body for changes
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Also handle edit button clicks directly
        document.body.addEventListener('click', function(event) {
            if (event.target.tagName === 'BUTTON' && 
                event.target.textContent === 'Edit' && 
                event.target.closest('tr') && 
                event.target.closest('.ingredient-details')) {
                
                console.log('Edit button clicked, applying aggressive Basic Info replacement');
                
                // Wait for the form to be displayed
                setTimeout(aggressiveBasicInfoReplacement, 100);
                // Try again after a bit longer to ensure it's applied
                setTimeout(aggressiveBasicInfoReplacement, 300);
                setTimeout(aggressiveBasicInfoReplacement, 500);
                setTimeout(aggressiveBasicInfoReplacement, 1000);
            }
        });
        
        // Run periodically to ensure the replacement is applied
        setInterval(aggressiveBasicInfoReplacement, 1000);
        
        console.log('Aggressive Basic Info Replacement initialized');
    }
    
    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
