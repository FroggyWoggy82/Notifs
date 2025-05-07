/**
 * Form Group Row Fix
 * Specifically targets and fixes the form-group-row structure that appears when editing an existing ingredient
 */

(function() {
    // Function to fix the form-group-row structure
    function fixFormGroupRow() {
        // Find all edit ingredient forms
        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {
            // Skip if already processed
            if (form.dataset.formGroupRowFixed === 'true') return;
            
            console.log('Fixing form-group-row structure');
            
            // Find the form element
            const formElement = form.querySelector('form');
            if (!formElement) return;
            
            // Find the form-group-row
            const formGroupRow = formElement.querySelector('.form-group-row');
            if (!formGroupRow) return;
            
            // Convert the form-group-row to a nutrition section
            formGroupRow.className = 'nutrition-section basic-information';
            
            // Add a header if it doesn't exist
            if (!formGroupRow.querySelector('h4')) {
                const header = document.createElement('h4');
                header.textContent = 'Basic Information';
                formGroupRow.insertBefore(header, formGroupRow.firstChild);
            }
            
            // Style the section
            formGroupRow.style.marginBottom = '8px';
            formGroupRow.style.paddingBottom = '5px';
            formGroupRow.style.backgroundColor = 'rgba(25, 25, 25, 0.7)';
            formGroupRow.style.borderRadius = '4px';
            formGroupRow.style.padding = '8px';
            formGroupRow.style.display = 'flex';
            formGroupRow.style.flexDirection = 'column';
            
            // Create a nutrition grid
            const grid = document.createElement('div');
            grid.className = 'nutrition-grid';
            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(70px, 1fr))';
            grid.style.gap = '3px';
            
            // Find all form groups
            const formGroups = formGroupRow.querySelectorAll('.form-group');
            
            // Convert form groups to nutrition items
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
                    
                    // Mark the original group as replaced
                    group.className = 'form-group replaced';
                    group.style.display = 'none';
                }
            });
            
            // Add the grid after the header
            const header = formGroupRow.querySelector('h4');
            if (header) {
                formGroupRow.insertBefore(grid, header.nextSibling);
            } else {
                formGroupRow.appendChild(grid);
            }
            
            // Mark as processed
            form.dataset.formGroupRowFixed = 'true';
            
            console.log('Form-group-row structure fixed');
        });
    }
    
    // Function to initialize
    function init() {
        console.log('Initializing Form Group Row Fix');
        
        // Initial fix
        fixFormGroupRow();
        
        // Set up a mutation observer to watch for new forms
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    setTimeout(fixFormGroupRow, 50);
                }
            });
        });
        
        // Start observing the document body for changes
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Also handle edit button clicks directly
        document.body.addEventListener('click', function(event) {
            if (event.target.classList.contains('edit-ingredient-btn') || 
                event.target.classList.contains('edit-btn')) {
                console.log('Edit button clicked, applying form-group-row fix');
                
                // Wait for the form to be displayed
                setTimeout(fixFormGroupRow, 100);
                // Try again after a bit longer to ensure it's applied
                setTimeout(fixFormGroupRow, 300);
                setTimeout(fixFormGroupRow, 500);
            }
        });
        
        // Run periodically to ensure the fix is applied
        setInterval(fixFormGroupRow, 1000);
        
        console.log('Form Group Row Fix initialized');
    }
    
    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
