/**
 * Extreme Basic Info Fix
 * Directly modifies the DOM structure of the Basic Information section to match the other sections
 */

(function() {
    // Function to fix the Basic Information section
    function fixBasicInfoSection() {
        // Find all edit forms
        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {
            // Skip if already processed
            if (form.dataset.extremeBasicInfoFixed === 'true') return;
            
            console.log('Applying extreme fix to Basic Information section');
            
            // Find the form element
            const formElement = form.querySelector('form');
            if (!formElement) return;
            
            // Find the Basic Information section (first div in the form)
            const basicInfoSection = formElement.querySelector('.basic-information') || formElement.querySelector('div:first-of-type');
            if (!basicInfoSection) return;
            
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
            
            // Add the nutrition-section class to the Basic Information section
            basicInfoSection.classList.add('nutrition-section');
            
            // Clear the Basic Information section
            basicInfoSection.innerHTML = '';
            
            // Create the header
            const header = document.createElement('h4');
            header.textContent = 'Basic Information';
            header.style.marginTop = '0';
            header.style.marginBottom = '5px';
            header.style.paddingBottom = '2px';
            header.style.borderBottom = 'none';
            header.style.color = '#e0e0e0';
            header.style.fontWeight = '500';
            header.style.fontSize = '0.85em';
            basicInfoSection.appendChild(header);
            
            // Create the nutrition grid
            const nutritionGrid = document.createElement('div');
            nutritionGrid.className = 'nutrition-grid';
            nutritionGrid.style.display = 'grid';
            nutritionGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(70px, 1fr))';
            nutritionGrid.style.gap = '3px';
            basicInfoSection.appendChild(nutritionGrid);
            
            // Create the name input
            const nameItem = document.createElement('div');
            nameItem.className = 'nutrition-item';
            nameItem.style.marginBottom = '2px';
            nameItem.style.display = 'flex';
            nameItem.style.flexDirection = 'column';
            
            const nameLabel = document.createElement('label');
            nameLabel.setAttribute('for', 'new-edit-ingredient-name');
            nameLabel.textContent = 'Name:';
            nameLabel.style.fontSize = '0.7em';
            nameLabel.style.marginBottom = '1px';
            nameLabel.style.color = '#aaa';
            nameLabel.style.display = 'block';
            nameLabel.style.whiteSpace = 'nowrap';
            nameLabel.style.overflow = 'hidden';
            nameLabel.style.textOverflow = 'ellipsis';
            
            const newNameInput = document.createElement('input');
            newNameInput.setAttribute('type', 'text');
            newNameInput.setAttribute('id', 'new-edit-ingredient-name');
            newNameInput.setAttribute('value', nameValue);
            newNameInput.setAttribute('required', 'required');
            newNameInput.style.width = '80px';
            newNameInput.style.padding = '1px 2px';
            newNameInput.style.height = '14px';
            newNameInput.style.fontSize = '0.6em';
            newNameInput.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
            newNameInput.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            newNameInput.style.color = '#e0e0e0';
            newNameInput.style.borderRadius = '3px';
            
            nameItem.appendChild(nameLabel);
            nameItem.appendChild(newNameInput);
            nutritionGrid.appendChild(nameItem);
            
            // Create the amount input
            const amountItem = document.createElement('div');
            amountItem.className = 'nutrition-item';
            amountItem.style.marginBottom = '2px';
            amountItem.style.display = 'flex';
            amountItem.style.flexDirection = 'column';
            
            const amountLabel = document.createElement('label');
            amountLabel.setAttribute('for', 'new-edit-ingredient-amount');
            amountLabel.textContent = 'Amount (g):';
            amountLabel.style.fontSize = '0.7em';
            amountLabel.style.marginBottom = '1px';
            amountLabel.style.color = '#aaa';
            amountLabel.style.display = 'block';
            amountLabel.style.whiteSpace = 'nowrap';
            amountLabel.style.overflow = 'hidden';
            amountLabel.style.textOverflow = 'ellipsis';
            
            const newAmountInput = document.createElement('input');
            newAmountInput.setAttribute('type', 'number');
            newAmountInput.setAttribute('id', 'new-edit-ingredient-amount');
            newAmountInput.setAttribute('value', amountValue);
            newAmountInput.setAttribute('step', '0.1');
            newAmountInput.setAttribute('min', '0.1');
            newAmountInput.setAttribute('required', 'required');
            newAmountInput.style.width = '35px';
            newAmountInput.style.padding = '1px 2px';
            newAmountInput.style.height = '14px';
            newAmountInput.style.fontSize = '0.6em';
            newAmountInput.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
            newAmountInput.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            newAmountInput.style.color = '#e0e0e0';
            newAmountInput.style.borderRadius = '3px';
            
            amountItem.appendChild(amountLabel);
            amountItem.appendChild(newAmountInput);
            nutritionGrid.appendChild(amountItem);
            
            // Create the package amount input if it exists
            if (packageAmountInput) {
                const packageAmountItem = document.createElement('div');
                packageAmountItem.className = 'nutrition-item';
                packageAmountItem.style.marginBottom = '2px';
                packageAmountItem.style.display = 'flex';
                packageAmountItem.style.flexDirection = 'column';
                
                const packageAmountLabel = document.createElement('label');
                packageAmountLabel.setAttribute('for', 'new-edit-ingredient-package-amount');
                packageAmountLabel.textContent = 'Package Amount (g):';
                packageAmountLabel.style.fontSize = '0.7em';
                packageAmountLabel.style.marginBottom = '1px';
                packageAmountLabel.style.color = '#aaa';
                packageAmountLabel.style.display = 'block';
                packageAmountLabel.style.whiteSpace = 'nowrap';
                packageAmountLabel.style.overflow = 'hidden';
                packageAmountLabel.style.textOverflow = 'ellipsis';
                
                const newPackageAmountInput = document.createElement('input');
                newPackageAmountInput.setAttribute('type', 'number');
                newPackageAmountInput.setAttribute('id', 'new-edit-ingredient-package-amount');
                newPackageAmountInput.setAttribute('value', packageAmountValue);
                newPackageAmountInput.setAttribute('step', '0.1');
                newPackageAmountInput.setAttribute('min', '0');
                newPackageAmountInput.style.width = '35px';
                newPackageAmountInput.style.padding = '1px 2px';
                newPackageAmountInput.style.height = '14px';
                newPackageAmountInput.style.fontSize = '0.6em';
                newPackageAmountInput.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                newPackageAmountInput.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                newPackageAmountInput.style.color = '#e0e0e0';
                newPackageAmountInput.style.borderRadius = '3px';
                
                packageAmountItem.appendChild(packageAmountLabel);
                packageAmountItem.appendChild(newPackageAmountInput);
                nutritionGrid.appendChild(packageAmountItem);
                
                // Add event listeners to sync the values
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
            
            // Create the price input if it exists
            if (priceInput) {
                const priceItem = document.createElement('div');
                priceItem.className = 'nutrition-item';
                priceItem.style.marginBottom = '2px';
                priceItem.style.display = 'flex';
                priceItem.style.flexDirection = 'column';
                
                const priceLabel = document.createElement('label');
                priceLabel.setAttribute('for', 'new-edit-ingredient-price');
                priceLabel.textContent = 'Package Price:';
                priceLabel.style.fontSize = '0.7em';
                priceLabel.style.marginBottom = '1px';
                priceLabel.style.color = '#aaa';
                priceLabel.style.display = 'block';
                priceLabel.style.whiteSpace = 'nowrap';
                priceLabel.style.overflow = 'hidden';
                priceLabel.style.textOverflow = 'ellipsis';
                
                const newPriceInput = document.createElement('input');
                newPriceInput.setAttribute('type', 'number');
                newPriceInput.setAttribute('id', 'new-edit-ingredient-price');
                newPriceInput.setAttribute('value', priceValue);
                newPriceInput.setAttribute('step', '0.01');
                newPriceInput.setAttribute('min', '0');
                newPriceInput.style.width = '35px';
                newPriceInput.style.padding = '1px 2px';
                newPriceInput.style.height = '14px';
                newPriceInput.style.fontSize = '0.6em';
                newPriceInput.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                newPriceInput.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                newPriceInput.style.color = '#e0e0e0';
                newPriceInput.style.borderRadius = '3px';
                
                priceItem.appendChild(priceLabel);
                priceItem.appendChild(newPriceInput);
                nutritionGrid.appendChild(priceItem);
                
                // Add event listeners to sync the values
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
            
            // Add event listeners to sync the values
            newNameInput.addEventListener('input', function() {
                nameInput.value = this.value;
                // Trigger change event
                const event = new Event('change', { bubbles: true });
                nameInput.dispatchEvent(event);
            });
            
            nameInput.addEventListener('input', function() {
                newNameInput.value = this.value;
            });
            
            newAmountInput.addEventListener('input', function() {
                amountInput.value = this.value;
                // Trigger change event
                const event = new Event('change', { bubbles: true });
                amountInput.dispatchEvent(event);
            });
            
            amountInput.addEventListener('input', function() {
                newAmountInput.value = this.value;
            });
            
            // Hide the original inputs
            nameInput.style.display = 'none';
            amountInput.style.display = 'none';
            if (packageAmountInput) packageAmountInput.style.display = 'none';
            if (priceInput) priceInput.style.display = 'none';
            
            // Apply styling to the Basic Information section
            basicInfoSection.style.backgroundColor = 'rgba(25, 25, 25, 0.7)';
            basicInfoSection.style.borderRadius = '4px';
            basicInfoSection.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            basicInfoSection.style.padding = '8px';
            basicInfoSection.style.marginBottom = '8px';
            basicInfoSection.style.color = '#e0e0e0';
            
            // Mark as processed
            form.dataset.extremeBasicInfoFixed = 'true';
            
            console.log('Extreme fix applied to Basic Information section');
        });
    }
    
    // Function to initialize
    function init() {
        console.log('Initializing Extreme Basic Info Fix');
        
        // Initial fix
        fixBasicInfoSection();
        
        // Set up a mutation observer to watch for new forms
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    setTimeout(fixBasicInfoSection, 50);
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
                
                console.log('Edit button clicked, applying extreme Basic Info fix');
                
                // Wait for the form to be displayed
                setTimeout(fixBasicInfoSection, 100);
                // Try again after a bit longer to ensure it's applied
                setTimeout(fixBasicInfoSection, 300);
                setTimeout(fixBasicInfoSection, 500);
                setTimeout(fixBasicInfoSection, 1000);
            }
        });
        
        // Run periodically to ensure the fix is applied
        setInterval(fixBasicInfoSection, 1000);
        
        console.log('Extreme Basic Info Fix initialized');
    }
    
    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
