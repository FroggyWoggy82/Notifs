/**
 * Direct Basic Info Replacement
 * Directly replaces the Basic Information section with a properly styled one
 */

(function() {
    console.log('[Direct Basic Info Replacement] Initializing...');

    // Function to directly replace the Basic Information section
    function directBasicInfoReplacement() {
        // Find all edit ingredient forms
        const editForms = document.querySelectorAll('.edit-ingredient-form');

        editForms.forEach(form => {
            // Skip if already processed
            if (form.dataset.directBasicInfoReplaced === 'true') return;

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

            // Create a completely new Basic Information section
            const newBasicInfoSection = document.createElement('div');
            newBasicInfoSection.className = 'nutrition-section';
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

            // Apply direct styles to ensure it matches other sections
            newBasicInfoSection.style.backgroundColor = '#1e1e1e';
            newBasicInfoSection.style.borderRadius = '5px';
            newBasicInfoSection.style.padding = '15px';
            newBasicInfoSection.style.marginBottom = '15px';
            newBasicInfoSection.style.color = 'white';

            // Style the header
            const header = newBasicInfoSection.querySelector('h4');
            if (header) {
                header.style.color = 'white';
                header.style.marginTop = '0';
                header.style.marginBottom = '10px';
                header.style.fontSize = '1.1em';
                header.style.fontWeight = 'bold';
            }

            // Style the nutrition grid
            const nutritionGrid = newBasicInfoSection.querySelector('.nutrition-grid');
            if (nutritionGrid) {
                nutritionGrid.style.display = 'grid';
                nutritionGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
                nutritionGrid.style.gap = '10px';
            }

            // Style the nutrition items
            const nutritionItems = newBasicInfoSection.querySelectorAll('.nutrition-item');
            nutritionItems.forEach(item => {
                item.style.marginBottom = '8px';
            });

            // Style the labels
            const labels = newBasicInfoSection.querySelectorAll('label');
            labels.forEach(label => {
                label.style.color = 'white';
                label.style.fontSize = '0.9em';
                label.style.display = 'block';
                label.style.marginBottom = '3px';
            });

            // Style the inputs
            const inputs = newBasicInfoSection.querySelectorAll('input');
            inputs.forEach(input => {
                input.style.backgroundColor = '#333';
                input.style.color = 'white';
                input.style.border = '1px solid #444';
                input.style.borderRadius = '3px';
                input.style.padding = '5px';
                input.style.width = '100%';
            });

            // Replace the first div with the new Basic Information section
            formElement.replaceChild(newBasicInfoSection, firstDiv);

            // Mark as processed
            form.dataset.directBasicInfoReplaced = 'true';

            console.log('[Direct Basic Info Replacement] Basic Information section replaced');
        });
    }

    // Function to handle edit button clicks
    function handleEditButtonClicks() {
        // Use event delegation to handle edit button clicks
        document.body.addEventListener('click', event => {
            // Check if the click was on an edit button
            if (event.target.classList.contains('edit-ingredient-btn')) {
                console.log('[Direct Basic Info Replacement] Edit button clicked');

                // Wait a short time for the form to be displayed
                setTimeout(directBasicInfoReplacement, 100);

                // Check again after a longer delay to catch any late changes
                setTimeout(directBasicInfoReplacement, 500);
                setTimeout(directBasicInfoReplacement, 1000);
            }
        });
    }

    // Function to observe DOM changes
    function observeDOMChanges() {
        // Create a mutation observer
        const observer = new MutationObserver(mutations => {
            let needsReplacement = false;

            mutations.forEach(mutation => {
                // Check if new nodes were added
                if (mutation.addedNodes.length) {
                    // Look for edit forms in the added nodes
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            // Check if this node is an edit form or contains one
                            if (node.classList && node.classList.contains('edit-ingredient-form')) {
                                needsReplacement = true;
                            } else if (node.querySelector && node.querySelector('.edit-ingredient-form')) {
                                needsReplacement = true;
                            }
                        }
                    });
                }
            });

            // If we found an edit form, replace the Basic Information section
            if (needsReplacement) {
                setTimeout(directBasicInfoReplacement, 50);
                setTimeout(directBasicInfoReplacement, 200);
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
        console.log('[Direct Basic Info Replacement] Initializing...');

        // Replace the Basic Information section
        setTimeout(directBasicInfoReplacement, 100);
        setTimeout(directBasicInfoReplacement, 500);
        setTimeout(directBasicInfoReplacement, 1000);

        // Handle edit button clicks
        handleEditButtonClicks();

        // Observe DOM changes
        observeDOMChanges();

        console.log('[Direct Basic Info Replacement] Initialized');
    }

    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
