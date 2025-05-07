/**
 * Edit Ingredient Nutrition Style
 * Restructures the edit ingredient form to match the detailed nutrition panel style
 */

(function() {
    // Function to restructure the edit ingredient form
    function restructureEditForm() {
        // Find all edit ingredient forms
        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {
            // Skip if already restructured
            if (form.dataset.restructured === 'true') return;
            
            console.log('Restructuring edit ingredient form to match nutrition panel style');
            
            // Get the form elements
            const header = form.querySelector('h4');
            const formElement = form.querySelector('form');
            
            if (!header || !formElement) return;
            
            // Get the basic information fields
            const nameField = form.querySelector('#edit-ingredient-name');
            const amountField = form.querySelector('#edit-ingredient-amount');
            const packageAmountField = form.querySelector('#edit-ingredient-package-amount');
            const priceField = form.querySelector('#edit-ingredient-price');
            
            if (!nameField || !amountField) return;
            
            // Create a Basic Information section
            const basicInfoSection = document.createElement('div');
            basicInfoSection.className = 'nutrition-section basic-information';
            
            // Create a header for the Basic Information section
            const basicInfoHeader = document.createElement('h4');
            basicInfoHeader.textContent = 'Basic Information';
            basicInfoSection.appendChild(basicInfoHeader);
            
            // Create a grid for the Basic Information fields
            const basicInfoGrid = document.createElement('div');
            basicInfoGrid.className = 'nutrition-grid';
            basicInfoSection.appendChild(basicInfoGrid);
            
            // Create nutrition items for each basic field
            const nameItem = createNutritionItem('Name:', nameField);
            const amountItem = createNutritionItem('Amount (g):', amountField);
            
            // Add the items to the grid
            basicInfoGrid.appendChild(nameItem);
            basicInfoGrid.appendChild(amountItem);
            
            // Add package amount and price fields if they exist
            if (packageAmountField) {
                const packageAmountItem = createNutritionItem('Package Amount (g):', packageAmountField);
                basicInfoGrid.appendChild(packageAmountItem);
            }
            
            if (priceField) {
                const priceItem = createNutritionItem('Package Price:', priceField);
                basicInfoGrid.appendChild(priceItem);
            }
            
            // Find the form groups container
            const formGroupsContainer = form.querySelector('.form-group-column');
            
            if (formGroupsContainer) {
                // Replace the form groups container with the Basic Information section
                formGroupsContainer.parentNode.replaceChild(basicInfoSection, formGroupsContainer);
            } else {
                // Insert the Basic Information section at the beginning of the form
                formElement.insertBefore(basicInfoSection, formElement.firstChild);
            }
            
            // Mark the form as restructured
            form.dataset.restructured = 'true';
            
            console.log('Edit ingredient form restructured to match nutrition panel style');
        });
    }
    
    // Helper function to create a nutrition item
    function createNutritionItem(labelText, inputField) {
        const item = document.createElement('div');
        item.className = 'nutrition-item';
        
        // Create a label
        const label = document.createElement('label');
        label.textContent = labelText;
        label.setAttribute('for', inputField.id);
        
        // Clone the input field to preserve its attributes and event listeners
        const input = inputField.cloneNode(true);
        
        // Copy the value from the original input
        input.value = inputField.value;
        
        // Add event listeners to sync the values
        input.addEventListener('input', function() {
            inputField.value = this.value;
            // Trigger change event on the original input
            const event = new Event('change', { bubbles: true });
            inputField.dispatchEvent(event);
        });
        
        inputField.addEventListener('input', function() {
            input.value = this.value;
        });
        
        // Hide the original input
        inputField.style.display = 'none';
        
        // Add the label and input to the item
        item.appendChild(label);
        item.appendChild(input);
        
        return item;
    }
    
    // Function to initialize the restructuring
    function init() {
        console.log('Initializing edit ingredient nutrition style');
        
        // Initial restructuring
        restructureEditForm();
        
        // Set up a mutation observer to watch for new forms
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    setTimeout(restructureEditForm, 50);
                }
            });
        });
        
        // Start observing the document body for changes
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Also handle dynamic form creation through event delegation
        document.body.addEventListener('click', function(event) {
            if (event.target.classList.contains('edit-ingredient-btn')) {
                // Wait for the form to be displayed
                setTimeout(restructureEditForm, 100);
                // Try again after a bit longer to ensure it's applied
                setTimeout(restructureEditForm, 300);
                setTimeout(restructureEditForm, 500);
            }
        });
        
        console.log('Edit ingredient nutrition style initialized');
    }
    
    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
