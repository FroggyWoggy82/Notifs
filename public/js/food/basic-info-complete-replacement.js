/**
 * Basic Info Complete Replacement
 * Completely replaces the Basic Information section with a new one that has the exact same structure as the other sections
 */

(function() {
    // Function to completely replace the Basic Information section
    function basicInfoCompleteReplacement() {
        // Find all edit forms
        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {
            // Skip if already processed
            if (form.dataset.basicInfoCompleteReplaced === 'true') return;
            
            console.log('Completely replacing Basic Information section');
            
            // Find the Basic Information section
            const basicInfoSection = form.querySelector('.basic-information');
            if (!basicInfoSection) return;
            
            // Get the current values
            const nameInput = form.querySelector('#edit-ingredient-name');
            const amountInput = form.querySelector('#edit-ingredient-amount');
            const packageAmountInput = form.querySelector('#edit-ingredient-package-amount');
            const priceInput = form.querySelector('#edit-ingredient-price');
            
            if (!nameInput || !amountInput) return;
            
            const nameValue = nameInput.value || '';
            const amountValue = amountInput.value || '';
            const packageAmountValue = packageAmountInput ? packageAmountInput.value || '' : '';
            const priceValue = priceInput ? priceInput.value || '' : '';
            
            // Create a new Basic Information section with the exact same structure as the other sections
            const newBasicInfoSection = document.createElement('div');
            newBasicInfoSection.className = 'nutrition-section basic-information';
            
            // Create the HTML content
            newBasicInfoSection.innerHTML = `
                <h4>Basic Information</h4>
                <div class="nutrition-grid">
                    <div class="nutrition-item">
                        <label for="new-edit-ingredient-name">Name:</label>
                        <input type="text" id="new-edit-ingredient-name" value="${nameValue}" required>
                    </div>
                    <div class="nutrition-item">
                        <label for="new-edit-ingredient-amount">Amount (g):</label>
                        <input type="number" id="new-edit-ingredient-amount" value="${amountValue}" step="0.1" min="0.1" required>
                    </div>
                    ${packageAmountInput ? `
                    <div class="nutrition-item">
                        <label for="new-edit-ingredient-package-amount">Package Amount (g):</label>
                        <input type="number" id="new-edit-ingredient-package-amount" value="${packageAmountValue}" step="0.1" min="0">
                    </div>
                    ` : ''}
                    ${priceInput ? `
                    <div class="nutrition-item">
                        <label for="new-edit-ingredient-price">Package Price:</label>
                        <input type="number" id="new-edit-ingredient-price" value="${priceValue}" step="0.01" min="0">
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
            
            // Mark as processed
            form.dataset.basicInfoCompleteReplaced = 'true';
            
            console.log('Basic Information section completely replaced');
        });
    }
    
    // Function to initialize
    function init() {
        console.log('Initializing Basic Info Complete Replacement');
        
        // Initial replacement
        basicInfoCompleteReplacement();
        
        // Set up a mutation observer to watch for new forms
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    setTimeout(basicInfoCompleteReplacement, 50);
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
                
                console.log('Edit button clicked, applying Basic Info complete replacement');
                
                // Wait for the form to be displayed
                setTimeout(basicInfoCompleteReplacement, 100);
                // Try again after a bit longer to ensure it's applied
                setTimeout(basicInfoCompleteReplacement, 300);
                setTimeout(basicInfoCompleteReplacement, 500);
            }
        });
        
        // Run periodically to ensure the replacement is applied
        setInterval(basicInfoCompleteReplacement, 1000);
        
        console.log('Basic Info Complete Replacement initialized');
    }
    
    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
