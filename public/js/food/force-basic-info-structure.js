/**
 * Force Basic Information Structure
 * Completely replaces the Basic Information section with a properly structured one
 */

(function() {
    console.log('[Force Basic Info Structure] Initializing...');

    // Function to completely replace the Basic Information section
    function forceBasicInfoStructure() {
        // Find all edit ingredient forms
        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {
            // Skip if already fixed
            if (form.dataset.forceBasicInfoFixed === 'true') return;
            
            // Log the current structure for debugging
            console.log('[Force Basic Info Structure] Current form structure:', form.innerHTML);
            
            // Find the form element
            const formElement = form.querySelector('form');
            if (!formElement) return;
            
            // Find the Basic Information section (first div that's not the header)
            const basicInfoSection = formElement.querySelector('div:first-of-type');
            
            if (basicInfoSection) {
                console.log('[Force Basic Info Structure] Found Basic Information section');
                
                // Get the current input values to preserve them
                const nameInput = formElement.querySelector('#edit-ingredient-name');
                const amountInput = formElement.querySelector('#edit-ingredient-amount');
                const packageAmountInput = formElement.querySelector('#edit-ingredient-package-amount');
                const priceInput = formElement.querySelector('#edit-ingredient-price');
                
                const nameValue = nameInput ? nameInput.value : '';
                const amountValue = amountInput ? amountInput.value : '';
                const packageAmountValue = packageAmountInput ? packageAmountInput.value : '';
                const priceValue = priceInput ? priceInput.value : '';
                
                // Create a completely new Basic Information section
                const newBasicInfoSection = document.createElement('div');
                newBasicInfoSection.className = 'nutrition-section basic-information';
                newBasicInfoSection.innerHTML = `
                    <h4>Basic Information</h4>
                    <div class="nutrition-grid">
                        <div class="nutrition-item">
                            <label for="edit-ingredient-name">Name:</label>
                            <input type="text" id="edit-ingredient-name" value="${nameValue}" required>
                        </div>
                        <div class="nutrition-item">
                            <label for="edit-ingredient-amount">Amount (g):</label>
                            <input type="number" id="edit-ingredient-amount" value="${amountValue}" step="0.1" min="0.1" required>
                        </div>
                        <div class="nutrition-item">
                            <label for="edit-ingredient-package-amount">Package Amount (g):</label>
                            <input type="number" id="edit-ingredient-package-amount" value="${packageAmountValue}" step="0.1" min="0">
                        </div>
                        <div class="nutrition-item">
                            <label for="edit-ingredient-price">Package Price:</label>
                            <input type="number" id="edit-ingredient-price" value="${priceValue}" step="0.01" min="0" required>
                        </div>
                    </div>
                `;
                
                // Replace the old section with the new one
                formElement.replaceChild(newBasicInfoSection, basicInfoSection);
                
                // Mark as fixed
                form.dataset.forceBasicInfoFixed = 'true';
                
                console.log('[Force Basic Info Structure] Basic Information section replaced');
            }
        });
    }

    // Function to handle edit button clicks
    function handleEditButtonClicks() {
        // Use event delegation to handle edit button clicks
        document.body.addEventListener('click', event => {
            // Check if the click was on an edit button
            if (event.target.classList.contains('edit-ingredient-btn')) {
                console.log('[Force Basic Info Structure] Edit button clicked');
                
                // Wait a short time for the form to be displayed
                setTimeout(forceBasicInfoStructure, 100);
                
                // Check again after a longer delay to catch any late changes
                setTimeout(forceBasicInfoStructure, 500);
            }
        });
    }

    // Function to observe DOM changes
    function observeDOMChanges() {
        // Create a mutation observer
        const observer = new MutationObserver(mutations => {
            let needsFixing = false;
            
            mutations.forEach(mutation => {
                // Check if new nodes were added
                if (mutation.addedNodes.length) {
                    // Look for edit forms in the added nodes
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            // Check if this node is an edit form or contains one
                            if (node.classList && node.classList.contains('edit-ingredient-form')) {
                                needsFixing = true;
                            } else if (node.querySelector && node.querySelector('.edit-ingredient-form')) {
                                needsFixing = true;
                            }
                        }
                    });
                }
            });
            
            // If we found an edit form, fix the Basic Information section
            if (needsFixing) {
                setTimeout(forceBasicInfoStructure, 50);
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
        console.log('[Force Basic Info Structure] Initializing...');
        
        // Force the Basic Information section structure
        setTimeout(forceBasicInfoStructure, 100);
        
        // Handle edit button clicks
        handleEditButtonClicks();
        
        // Observe DOM changes
        observeDOMChanges();
        
        console.log('[Force Basic Info Structure] Initialized');
    }
    
    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
