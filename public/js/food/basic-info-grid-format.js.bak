/**
 * Basic Info Grid Format
 * Restructures the Basic Information section to use the same grid format as other sections
 */

(function() {
    // Function to restructure the Basic Information section
    function restructureBasicInfo() {
        // Find all edit ingredient forms
        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {
            // Skip if already processed
            if (form.dataset.basicInfoGridFormatted === 'true') return;
            
            console.log('Restructuring Basic Information section to use grid format');
            
            // Find the Basic Information section
            const basicInfoSection = form.querySelector('.basic-information');
            if (!basicInfoSection) return;
            
            // Apply styling to match other sections
            basicInfoSection.style.backgroundColor = 'rgba(25, 25, 25, 0.7)';
            basicInfoSection.style.borderRadius = '4px';
            basicInfoSection.style.padding = '8px';
            basicInfoSection.style.display = 'flex';
            basicInfoSection.style.flexDirection = 'column';
            
            // Get the header
            const header = basicInfoSection.querySelector('h4');
            
            // Check if we need to create a nutrition grid
            let grid = basicInfoSection.querySelector('.nutrition-grid');
            if (!grid) {
                // Create a nutrition grid
                grid = document.createElement('div');
                grid.className = 'nutrition-grid';
                grid.style.display = 'grid';
                grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(70px, 1fr))';
                grid.style.gap = '3px';
                
                // Find all form groups or direct inputs
                const formGroups = basicInfoSection.querySelectorAll('.form-group');
                const directInputs = basicInfoSection.querySelectorAll('input[type="text"]:not(.form-group input), input[type="number"]:not(.form-group input)');
                
                // Process form groups
                if (formGroups.length > 0) {
                    formGroups.forEach(group => {
                        // Convert to nutrition-item format
                        const item = document.createElement('div');
                        item.className = 'nutrition-item';
                        
                        // Get the label and input
                        const label = group.querySelector('label');
                        const input = group.querySelector('input');
                        
                        if (label && input) {
                            // Clone the elements to preserve attributes and event listeners
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
                            
                            // Style the label
                            clonedLabel.style.fontSize = '0.7em';
                            clonedLabel.style.marginBottom = '1px';
                            clonedLabel.style.color = '#aaa';
                            clonedLabel.style.display = 'block';
                            clonedLabel.style.whiteSpace = 'nowrap';
                            clonedLabel.style.overflow = 'hidden';
                            clonedLabel.style.textOverflow = 'ellipsis';
                            
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
                            item.appendChild(clonedLabel);
                            item.appendChild(clonedInput);
                            
                            // Add to the grid
                            grid.appendChild(item);
                            
                            // Hide the original group
                            group.style.display = 'none';
                        }
                    });
                }
                // Process direct inputs
                else if (directInputs.length > 0) {
                    directInputs.forEach(input => {
                        // Create a nutrition item
                        const item = document.createElement('div');
                        item.className = 'nutrition-item';
                        
                        // Create a label based on the input id
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
                        
                        // Add to the grid
                        grid.appendChild(item);
                        
                        // Hide the original input
                        input.style.display = 'none';
                    });
                }
                
                // Add the grid after the header
                if (header) {
                    basicInfoSection.insertBefore(grid, header.nextSibling);
                } else {
                    basicInfoSection.appendChild(grid);
                }
            }
            
            // Mark as processed
            form.dataset.basicInfoGridFormatted = 'true';
            
            console.log('Basic Information section restructured to use grid format');
        });
    }
    
    // Function to initialize
    function init() {
        console.log('Initializing Basic Info Grid Format');
        
        // Initial restructuring
        restructureBasicInfo();
        
        // Set up a mutation observer to watch for new forms
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    setTimeout(restructureBasicInfo, 50);
                }
            });
        });
        
        // Start observing the document body for changes
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Also handle dynamic form creation through event delegation
        document.body.addEventListener('click', function(event) {
            if (event.target.classList.contains('edit-ingredient-btn')) {
                // Wait for the form to be displayed
                setTimeout(restructureBasicInfo, 100);
                // Try again after a bit longer to ensure it's applied
                setTimeout(restructureBasicInfo, 300);
                setTimeout(restructureBasicInfo, 500);
            }
        });
        
        // Run periodically to ensure the restructuring is applied
        setInterval(restructureBasicInfo, 1000);
        
        console.log('Basic Info Grid Format initialized');
    }
    
    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
