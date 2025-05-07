/**
 * Edit Button Basic Info Fix
 * Specifically targets and fixes the Basic Information section when editing an existing ingredient
 */

(function() {
    // Function to fix the Basic Information section when editing an existing ingredient
    function fixEditButtonBasicInfo() {
        // Find all edit ingredient forms
        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {
            // Skip if already processed
            if (form.dataset.editButtonBasicInfoFixed === 'true') return;
            
            console.log('Fixing Basic Information section for existing ingredient edit');
            
            // Find the form element
            const formElement = form.querySelector('form');
            if (!formElement) return;
            
            // Check if this is an edit form for an existing ingredient
            const editIngredientId = formElement.querySelector('#edit-ingredient-id');
            if (!editIngredientId || !editIngredientId.value) return;
            
            // Look for the Basic Information section
            let basicInfoSection = formElement.querySelector('.basic-information');
            
            // If no Basic Information section exists, look for the first div which might contain the basic fields
            if (!basicInfoSection) {
                const firstDiv = formElement.querySelector('div:first-of-type');
                if (firstDiv) {
                    // Convert this div to a proper Basic Information section
                    firstDiv.className = 'nutrition-section basic-information';
                    
                    // Create a header if it doesn't exist
                    if (!firstDiv.querySelector('h4')) {
                        const header = document.createElement('h4');
                        header.textContent = 'Basic Information';
                        firstDiv.insertBefore(header, firstDiv.firstChild);
                    }
                    
                    basicInfoSection = firstDiv;
                } else {
                    // Create a new Basic Information section
                    basicInfoSection = document.createElement('div');
                    basicInfoSection.className = 'nutrition-section basic-information';
                    
                    const header = document.createElement('h4');
                    header.textContent = 'Basic Information';
                    basicInfoSection.appendChild(header);
                    
                    // Insert at the beginning of the form
                    formElement.insertBefore(basicInfoSection, formElement.firstChild);
                }
            }
            
            // Style the Basic Information section
            basicInfoSection.style.marginBottom = '8px';
            basicInfoSection.style.paddingBottom = '5px';
            basicInfoSection.style.backgroundColor = 'rgba(25, 25, 25, 0.7)';
            basicInfoSection.style.borderRadius = '4px';
            basicInfoSection.style.padding = '8px';
            basicInfoSection.style.display = 'flex';
            basicInfoSection.style.flexDirection = 'column';
            
            // Style the header
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
            
            // Check if we need to create a nutrition grid
            let grid = basicInfoSection.querySelector('.nutrition-grid');
            if (!grid) {
                // Create a nutrition grid
                grid = document.createElement('div');
                grid.className = 'nutrition-grid';
                
                // Find all form groups in the Basic Information section
                const formGroups = basicInfoSection.querySelectorAll('.form-group');
                
                // If we have form groups, convert them to nutrition items
                if (formGroups.length > 0) {
                    formGroups.forEach(group => {
                        // Create a nutrition item
                        const item = document.createElement('div');
                        item.className = 'nutrition-item';
                        
                        // Get the label and input
                        const label = group.querySelector('label');
                        const input = group.querySelector('input');
                        
                        if (label && input) {
                            // Clone the elements
                            const clonedLabel = label.cloneNode(true);
                            const clonedInput = input.cloneNode(true);
                            
                            // Copy the value
                            clonedInput.value = input.value;
                            
                            // Add event listeners to sync values
                            clonedInput.addEventListener('input', function() {
                                input.value = this.value;
                                // Trigger change event
                                const event = new Event('change', { bubbles: true });
                                input.dispatchEvent(event);
                            });
                            
                            input.addEventListener('input', function() {
                                clonedInput.value = this.value;
                            });
                            
                            // Add to the item
                            item.appendChild(clonedLabel);
                            item.appendChild(clonedInput);
                            
                            // Add to the grid
                            grid.appendChild(item);
                            
                            // Hide the original group
                            group.style.display = 'none';
                        }
                    });
                } else {
                    // Look for direct inputs
                    const nameInput = formElement.querySelector('#edit-ingredient-name');
                    const amountInput = formElement.querySelector('#edit-ingredient-amount');
                    const packageAmountInput = formElement.querySelector('#edit-ingredient-package-amount');
                    const priceInput = formElement.querySelector('#edit-ingredient-price');
                    
                    // Create nutrition items for each input
                    if (nameInput) {
                        const item = createNutritionItem('Name:', nameInput);
                        grid.appendChild(item);
                    }
                    
                    if (amountInput) {
                        const item = createNutritionItem('Amount (g):', amountInput);
                        grid.appendChild(item);
                    }
                    
                    if (packageAmountInput) {
                        const item = createNutritionItem('Package Amount (g):', packageAmountInput);
                        grid.appendChild(item);
                    }
                    
                    if (priceInput) {
                        const item = createNutritionItem('Package Price:', priceInput);
                        grid.appendChild(item);
                    }
                }
                
                // Add the grid after the header
                if (header) {
                    basicInfoSection.insertBefore(grid, header.nextSibling);
                } else {
                    basicInfoSection.appendChild(grid);
                }
            }
            
            // Style the grid
            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(70px, 1fr))';
            grid.style.gap = '3px';
            
            // Style all nutrition items
            const items = grid.querySelectorAll('.nutrition-item');
            items.forEach(item => {
                item.style.marginBottom = '2px';
                
                // Style the label
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
                
                // Style the input
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
            
            // Mark as processed
            form.dataset.editButtonBasicInfoFixed = 'true';
            
            console.log('Basic Information section fixed for existing ingredient edit');
        });
    }
    
    // Helper function to create a nutrition item
    function createNutritionItem(labelText, input) {
        const item = document.createElement('div');
        item.className = 'nutrition-item';
        
        // Create a label
        const label = document.createElement('label');
        label.textContent = labelText;
        label.setAttribute('for', input.id);
        
        // Style the label
        label.style.fontSize = '0.7em';
        label.style.marginBottom = '1px';
        label.style.color = '#aaa';
        label.style.display = 'block';
        label.style.whiteSpace = 'nowrap';
        label.style.overflow = 'hidden';
        label.style.textOverflow = 'ellipsis';
        
        // Clone the input
        const clonedInput = input.cloneNode(true);
        
        // Copy the value
        clonedInput.value = input.value;
        
        // Add event listeners to sync values
        clonedInput.addEventListener('input', function() {
            input.value = this.value;
            // Trigger change event
            const event = new Event('change', { bubbles: true });
            input.dispatchEvent(event);
        });
        
        input.addEventListener('input', function() {
            clonedInput.value = this.value;
        });
        
        // Style the input
        clonedInput.style.width = input.id === 'edit-ingredient-name' ? '80px' : '35px';
        clonedInput.style.padding = '1px 2px';
        clonedInput.style.height = '14px';
        clonedInput.style.fontSize = '0.6em';
        clonedInput.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
        clonedInput.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        clonedInput.style.color = '#e0e0e0';
        clonedInput.style.borderRadius = '3px';
        
        // Add to the item
        item.appendChild(label);
        item.appendChild(clonedInput);
        
        // Hide the original input
        input.style.display = 'none';
        
        return item;
    }
    
    // Function to initialize
    function init() {
        console.log('Initializing Edit Button Basic Info Fix');
        
        // Initial fix
        fixEditButtonBasicInfo();
        
        // Set up a mutation observer to watch for new forms
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    setTimeout(fixEditButtonBasicInfo, 50);
                }
            });
        });
        
        // Start observing the document body for changes
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Also handle edit button clicks directly
        document.body.addEventListener('click', function(event) {
            if (event.target.classList.contains('edit-ingredient-btn') || 
                event.target.classList.contains('edit-btn')) {
                console.log('Edit button clicked, applying Basic Info fix');
                
                // Wait for the form to be displayed
                setTimeout(fixEditButtonBasicInfo, 100);
                // Try again after a bit longer to ensure it's applied
                setTimeout(fixEditButtonBasicInfo, 300);
                setTimeout(fixEditButtonBasicInfo, 500);
            }
        });
        
        // Run periodically to ensure the fix is applied
        setInterval(fixEditButtonBasicInfo, 1000);
        
        console.log('Edit Button Basic Info Fix initialized');
    }
    
    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
