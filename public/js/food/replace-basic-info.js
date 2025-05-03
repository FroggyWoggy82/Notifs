/**
 * Replace Basic Information
 * Completely replaces the Basic Information section with a properly structured one
 */

(function() {
    console.log('[Replace Basic Info] Initializing...');

    // Function to replace the Basic Information section
    function replaceBasicInfo() {
        // Find all edit ingredient forms
        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {
            // Skip if already replaced
            if (form.dataset.basicInfoReplaced === 'true') return;
            
            // Find the form element
            const formElement = form.querySelector('form');
            if (!formElement) return;
            
            // Find the first div in the form (Basic Information section)
            const firstDiv = formElement.querySelector('div:first-of-type');
            if (!firstDiv) return;
            
            // Get the current input values
            const nameInput = formElement.querySelector('#edit-ingredient-name');
            const amountInput = formElement.querySelector('#edit-ingredient-amount');
            const packageAmountInput = formElement.querySelector('#edit-ingredient-package-amount');
            const priceInput = formElement.querySelector('#edit-ingredient-price');
            
            const nameValue = nameInput ? nameInput.value : '';
            const amountValue = amountInput ? amountInput.value : '';
            const packageAmountValue = packageAmountInput ? packageAmountInput.value : '';
            const priceValue = priceInput ? priceInput.value : '';
            
            // Create a new Basic Information section
            const newBasicInfo = document.createElement('div');
            newBasicInfo.className = 'nutrition-section';
            newBasicInfo.style.backgroundColor = '#1e1e1e';
            newBasicInfo.style.borderRadius = '5px';
            newBasicInfo.style.padding = '15px';
            newBasicInfo.style.marginBottom = '15px';
            newBasicInfo.style.color = 'white';
            
            // Add the header
            const header = document.createElement('h4');
            header.textContent = 'Basic Information';
            header.style.color = 'white';
            header.style.marginTop = '0';
            header.style.marginBottom = '10px';
            header.style.fontSize = '1.1em';
            header.style.fontWeight = 'bold';
            newBasicInfo.appendChild(header);
            
            // Create the nutrition grid
            const nutritionGrid = document.createElement('div');
            nutritionGrid.className = 'nutrition-grid';
            nutritionGrid.style.display = 'grid';
            nutritionGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
            nutritionGrid.style.gap = '10px';
            
            // Create the name field
            const nameItem = document.createElement('div');
            nameItem.className = 'nutrition-item';
            nameItem.innerHTML = `
                <label for="edit-ingredient-name" style="color: white; font-size: 0.9em; display: block; margin-bottom: 3px;">Name:</label>
                <input type="text" id="edit-ingredient-name" value="${nameValue}" required style="background-color: #333; color: white; border: 1px solid #444; border-radius: 3px; padding: 5px; width: 100%;">
            `;
            nutritionGrid.appendChild(nameItem);
            
            // Create the amount field
            const amountItem = document.createElement('div');
            amountItem.className = 'nutrition-item';
            amountItem.innerHTML = `
                <label for="edit-ingredient-amount" style="color: white; font-size: 0.9em; display: block; margin-bottom: 3px;">Amount (g):</label>
                <input type="number" id="edit-ingredient-amount" value="${amountValue}" step="0.1" min="0.1" required style="background-color: #333; color: white; border: 1px solid #444; border-radius: 3px; padding: 5px; width: 100%;">
            `;
            nutritionGrid.appendChild(amountItem);
            
            // Create the package amount field
            const packageAmountItem = document.createElement('div');
            packageAmountItem.className = 'nutrition-item';
            packageAmountItem.innerHTML = `
                <label for="edit-ingredient-package-amount" style="color: white; font-size: 0.9em; display: block; margin-bottom: 3px;">Package Amount (g):</label>
                <input type="number" id="edit-ingredient-package-amount" value="${packageAmountValue}" step="0.1" min="0" style="background-color: #333; color: white; border: 1px solid #444; border-radius: 3px; padding: 5px; width: 100%;">
            `;
            nutritionGrid.appendChild(packageAmountItem);
            
            // Create the price field
            const priceItem = document.createElement('div');
            priceItem.className = 'nutrition-item';
            priceItem.innerHTML = `
                <label for="edit-ingredient-price" style="color: white; font-size: 0.9em; display: block; margin-bottom: 3px;">Package Price:</label>
                <input type="number" id="edit-ingredient-price" value="${priceValue}" step="0.01" min="0" required style="background-color: #333; color: white; border: 1px solid #444; border-radius: 3px; padding: 5px; width: 100%;">
            `;
            nutritionGrid.appendChild(priceItem);
            
            // Add the nutrition grid to the new Basic Information section
            newBasicInfo.appendChild(nutritionGrid);
            
            // Replace the first div with the new Basic Information section
            formElement.replaceChild(newBasicInfo, firstDiv);
            
            // Mark as replaced
            form.dataset.basicInfoReplaced = 'true';
            
            console.log('[Replace Basic Info] Basic Information section replaced');
        });
    }

    // Function to handle edit button clicks
    function handleEditButtonClicks() {
        // Use event delegation to handle edit button clicks
        document.body.addEventListener('click', event => {
            // Check if the click was on an edit button
            if (event.target.classList.contains('edit-ingredient-btn')) {
                console.log('[Replace Basic Info] Edit button clicked');
                
                // Wait a short time for the form to be displayed
                setTimeout(replaceBasicInfo, 100);
                
                // Check again after a longer delay to catch any late changes
                setTimeout(replaceBasicInfo, 500);
            }
        });
    }

    // Function to observe DOM changes
    function observeDOMChanges() {
        // Create a mutation observer
        const observer = new MutationObserver(mutations => {
            let needsReplacing = false;
            
            mutations.forEach(mutation => {
                // Check if new nodes were added
                if (mutation.addedNodes.length) {
                    // Look for edit forms in the added nodes
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            // Check if this node is an edit form or contains one
                            if (node.classList && node.classList.contains('edit-ingredient-form')) {
                                needsReplacing = true;
                            } else if (node.querySelector && node.querySelector('.edit-ingredient-form')) {
                                needsReplacing = true;
                            }
                        }
                    });
                }
            });
            
            // If we found an edit form, replace the Basic Information section
            if (needsReplacing) {
                setTimeout(replaceBasicInfo, 50);
            }
        });
        
        // Start observing the document body
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Initialize when the DOM is ready
    function init() {
        console.log('[Replace Basic Info] Initializing...');
        
        // Replace the Basic Information section
        setTimeout(replaceBasicInfo, 100);
        
        // Handle edit button clicks
        handleEditButtonClicks();
        
        // Observe DOM changes
        observeDOMChanges();
        
        console.log('[Replace Basic Info] Initialized');
    }
    
    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
