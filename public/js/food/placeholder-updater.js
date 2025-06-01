/**
 * Placeholder Updater
 * Updates input placeholders to show proper field names instead of "Optional"
 */

function updateIngredientPlaceholders() {
    console.log('[Placeholder Updater] Updating ingredient form placeholders...');
    
    // Update all ingredient items
    const ingredientItems = document.querySelectorAll('.ingredient-item');
    
    ingredientItems.forEach(item => {
        updatePlaceholdersInItem(item);
    });
    
    // Also update any standalone forms
    updatePlaceholdersInItem(document);
}

function updatePlaceholdersInItem(container) {
    // Update ingredient name field
    const ingredientNameInput = container.querySelector('.ingredient-name, input[placeholder="Enter ingredient name"]');
    if (ingredientNameInput) {
        ingredientNameInput.placeholder = 'Enter ingredient name';
    }
    
    // Update amount field
    const amountInput = container.querySelector('.ingredient-amount, input[type="number"]:not(.ingredient-package-amount):not(.grocery-store-input)');
    if (amountInput && amountInput.placeholder === 'Optional') {
        amountInput.placeholder = 'Amount (g)';
    }
    
    // Update package price field
    const packagePriceInput = container.querySelector('input[placeholder="0.00"], input[value="0.00"]');
    if (packagePriceInput) {
        packagePriceInput.placeholder = 'Package Price';
    }
    
    // Update package amount field
    const packageAmountInput = container.querySelector('.ingredient-package-amount');
    if (packageAmountInput) {
        packageAmountInput.placeholder = 'Package Amount (g)';
    }
    
    // Update grocery store field
    const groceryStoreInput = container.querySelector('.grocery-store-input');
    if (groceryStoreInput) {
        groceryStoreInput.placeholder = 'Grocery Store';
    }
    
    // Update cronometer textarea
    const cronometerTextarea = container.querySelector('.cronometer-text-paste-area');
    if (cronometerTextarea) {
        cronometerTextarea.placeholder = 'Paste Cronometer nutrition data here for automatic parsing...';
    }
    
    // Generic approach: find inputs with "Optional" placeholder and update based on context
    const optionalInputs = container.querySelectorAll('input[placeholder="Optional"]');
    optionalInputs.forEach(input => {
        // Check the input's context to determine what it should be
        const label = input.previousElementSibling;
        const parentGroup = input.closest('.input-group');
        
        if (parentGroup) {
            const groupLabel = parentGroup.querySelector('.input-label');
            if (groupLabel) {
                const labelText = groupLabel.textContent.trim();
                if (labelText.includes('Package Amount')) {
                    input.placeholder = 'Package Amount (g)';
                } else if (labelText.includes('Grocery Store')) {
                    input.placeholder = 'Grocery Store';
                } else if (labelText.includes('Package Price')) {
                    input.placeholder = 'Package Price';
                } else if (labelText.includes('Amount')) {
                    input.placeholder = 'Amount (g)';
                }
            }
        }
        
        // Fallback: check by input class or nearby elements
        if (input.placeholder === 'Optional') {
            if (input.classList.contains('ingredient-package-amount')) {
                input.placeholder = 'Package Amount (g)';
            } else if (input.classList.contains('grocery-store-input')) {
                input.placeholder = 'Grocery Store';
            } else if (input.type === 'number' && input.step === '0.01') {
                input.placeholder = 'Package Price';
            }
        }
    });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    updateIngredientPlaceholders();
});

// Update when new ingredients are added
document.addEventListener('ingredientAdded', function(event) {
    setTimeout(() => {
        updateIngredientPlaceholders();
    }, 100);
});

// Update when forms are dynamically created
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element node
                    if (node.classList && (node.classList.contains('ingredient-item') || node.querySelector('.ingredient-item'))) {
                        setTimeout(() => {
                            updatePlaceholdersInItem(node);
                        }, 50);
                    }
                }
            });
        }
    });
});

// Start observing
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Export for use by other scripts
window.updateIngredientPlaceholders = updateIngredientPlaceholders;
window.updatePlaceholdersInItem = updatePlaceholdersInItem;

console.log('[Placeholder Updater] Loaded and ready');
