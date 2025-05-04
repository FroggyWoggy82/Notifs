/**
 * Absolute Basic Info Fix
 * The most aggressive approach to fixing the Basic Information section
 */

(function() {
    // Function to fix the Basic Information section
    function fixBasicInfoSection() {
        // Find all edit forms
        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {
            // Skip if already processed
            if (form.dataset.absoluteBasicInfoFixed === 'true') return;
            
            console.log('Applying absolute fix to Basic Information section');
            
            // Find the form element
            const formElement = form.querySelector('form');
            if (!formElement) return;
            
            // Find all divs in the form
            const divs = formElement.querySelectorAll('div');
            
            // Find the Basic Information section
            let basicInfoSection = null;
            
            // Try to find the Basic Information section by various means
            for (const div of divs) {
                // Check if it has a header with "Basic Information"
                const header = div.querySelector('h4');
                if (header && header.textContent.includes('Basic Information')) {
                    basicInfoSection = div;
                    break;
                }
                
                // Check if it has labels for name or amount
                const labels = div.querySelectorAll('label');
                for (const label of labels) {
                    if (label.textContent.includes('Name') || label.textContent.includes('Amount')) {
                        basicInfoSection = div;
                        break;
                    }
                }
                
                if (basicInfoSection) break;
                
                // Check if it has inputs with IDs containing "ingredient-name" or "ingredient-amount"
                const inputs = div.querySelectorAll('input');
                for (const input of inputs) {
                    if (input.id && (input.id.includes('ingredient-name') || input.id.includes('ingredient-amount'))) {
                        basicInfoSection = div;
                        break;
                    }
                }
                
                if (basicInfoSection) break;
            }
            
            // If we still haven't found it, use the first div
            if (!basicInfoSection && divs.length > 0) {
                basicInfoSection = divs[0];
            }
            
            // If we still don't have a Basic Information section, create one
            if (!basicInfoSection) {
                basicInfoSection = document.createElement('div');
                basicInfoSection.className = 'basic-information';
                formElement.insertBefore(basicInfoSection, formElement.firstChild);
            }
            
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
            
            // Add the basic-information class
            basicInfoSection.classList.add('basic-information');
            
            // Clear the Basic Information section
            basicInfoSection.innerHTML = '';
            
            // Create the header
            const header = document.createElement('h4');
            header.textContent = 'Basic Information';
            basicInfoSection.appendChild(header);
            
            // Create the form groups
            const nameFormGroup = document.createElement('div');
            nameFormGroup.className = 'form-group';
            
            const nameLabel = document.createElement('label');
            nameLabel.setAttribute('for', 'edit-ingredient-name');
            nameLabel.textContent = 'Name:';
            
            const newNameInput = document.createElement('input');
            newNameInput.setAttribute('type', 'text');
            newNameInput.setAttribute('id', 'edit-ingredient-name');
            newNameInput.setAttribute('value', nameValue);
            newNameInput.setAttribute('required', 'required');
            
            nameFormGroup.appendChild(nameLabel);
            nameFormGroup.appendChild(newNameInput);
            basicInfoSection.appendChild(nameFormGroup);
            
            const amountFormGroup = document.createElement('div');
            amountFormGroup.className = 'form-group';
            
            const amountLabel = document.createElement('label');
            amountLabel.setAttribute('for', 'edit-ingredient-amount');
            amountLabel.textContent = 'Amount (g):';
            
            const newAmountInput = document.createElement('input');
            newAmountInput.setAttribute('type', 'number');
            newAmountInput.setAttribute('id', 'edit-ingredient-amount');
            newAmountInput.setAttribute('value', amountValue);
            newAmountInput.setAttribute('step', '0.1');
            newAmountInput.setAttribute('min', '0.1');
            newAmountInput.setAttribute('required', 'required');
            
            amountFormGroup.appendChild(amountLabel);
            amountFormGroup.appendChild(newAmountInput);
            basicInfoSection.appendChild(amountFormGroup);
            
            // Create the package amount form group if it exists
            if (packageAmountInput) {
                const packageAmountFormGroup = document.createElement('div');
                packageAmountFormGroup.className = 'form-group';
                
                const packageAmountLabel = document.createElement('label');
                packageAmountLabel.setAttribute('for', 'edit-ingredient-package-amount');
                packageAmountLabel.textContent = 'Package Amount (g):';
                
                const newPackageAmountInput = document.createElement('input');
                newPackageAmountInput.setAttribute('type', 'number');
                newPackageAmountInput.setAttribute('id', 'edit-ingredient-package-amount');
                newPackageAmountInput.setAttribute('value', packageAmountValue);
                newPackageAmountInput.setAttribute('step', '0.1');
                newPackageAmountInput.setAttribute('min', '0');
                
                packageAmountFormGroup.appendChild(packageAmountLabel);
                packageAmountFormGroup.appendChild(newPackageAmountInput);
                basicInfoSection.appendChild(packageAmountFormGroup);
            }
            
            // Create the price form group if it exists
            if (priceInput) {
                const priceFormGroup = document.createElement('div');
                priceFormGroup.className = 'form-group';
                
                const priceLabel = document.createElement('label');
                priceLabel.setAttribute('for', 'edit-ingredient-price');
                priceLabel.textContent = 'Package Price:';
                
                const newPriceInput = document.createElement('input');
                newPriceInput.setAttribute('type', 'number');
                newPriceInput.setAttribute('id', 'edit-ingredient-price');
                newPriceInput.setAttribute('value', priceValue);
                newPriceInput.setAttribute('step', '0.01');
                newPriceInput.setAttribute('min', '0');
                
                priceFormGroup.appendChild(priceLabel);
                priceFormGroup.appendChild(newPriceInput);
                basicInfoSection.appendChild(priceFormGroup);
            }
            
            // Style the Basic Information section
            basicInfoSection.style.backgroundColor = 'rgba(25, 25, 25, 0.7)';
            basicInfoSection.style.borderRadius = '4px';
            basicInfoSection.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            basicInfoSection.style.padding = '8px';
            basicInfoSection.style.marginBottom = '8px';
            basicInfoSection.style.color = '#e0e0e0';
            basicInfoSection.style.display = 'block';
            basicInfoSection.style.visibility = 'visible';
            basicInfoSection.style.opacity = '1';
            
            // Style the header
            header.style.marginTop = '0';
            header.style.marginBottom = '5px';
            header.style.paddingBottom = '2px';
            header.style.borderBottom = 'none';
            header.style.color = '#e0e0e0';
            header.style.fontWeight = '500';
            header.style.fontSize = '0.85em';
            
            // Style the form groups
            const formGroups = basicInfoSection.querySelectorAll('.form-group');
            formGroups.forEach(formGroup => {
                formGroup.style.marginBottom = '5px';
                formGroup.style.display = 'inline-block';
                formGroup.style.marginRight = '10px';
            });
            
            // Style the labels
            const labels = basicInfoSection.querySelectorAll('label');
            labels.forEach(label => {
                label.style.fontSize = '0.7em';
                label.style.marginBottom = '1px';
                label.style.color = '#aaa';
                label.style.display = 'block';
                label.style.whiteSpace = 'nowrap';
                label.style.overflow = 'hidden';
                label.style.textOverflow = 'ellipsis';
            });
            
            // Style the inputs
            const inputs = basicInfoSection.querySelectorAll('input');
            inputs.forEach(input => {
                input.style.padding = '1px 2px';
                input.style.height = '14px';
                input.style.fontSize = '0.6em';
                input.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                input.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                input.style.color = '#e0e0e0';
                input.style.borderRadius = '3px';
            });
            
            // Mark as processed
            form.dataset.absoluteBasicInfoFixed = 'true';
            
            console.log('Absolute fix applied to Basic Information section');
        });
    }
    
    // Function to initialize
    function init() {
        console.log('Initializing Absolute Basic Info Fix');
        
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
                
                console.log('Edit button clicked, applying absolute Basic Info fix');
                
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
        
        console.log('Absolute Basic Info Fix initialized');
    }
    
    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
