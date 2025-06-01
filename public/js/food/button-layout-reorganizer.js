/**
 * Button Layout Reorganizer
 * Reorganizes buttons to be side-by-side instead of stacked
 */

function reorganizeButtonLayouts() {
    console.log('[Button Layout Reorganizer] Reorganizing button layouts...');
    
    // Process all ingredient items
    const ingredientItems = document.querySelectorAll('.ingredient-item');
    ingredientItems.forEach(item => {
        reorganizeButtonsInItem(item);
    });
}

function reorganizeButtonsInItem(container) {
    // 1. Reorganize Parse Nutrition Data and Add Ingredient buttons
    reorganizeCronometerButtons(container);
    
    // 2. Reorganize Show Detailed Nutrition and Remove buttons
    reorganizeActionButtons(container);
    
    // 3. Ensure radio buttons are side-by-side (already handled by CSS)
    ensureRadioButtonLayout(container);
}

function reorganizeCronometerButtons(container) {
    const cronometerSection = container.querySelector('.cronometer-section');
    const parseButton = container.querySelector('.cronometer-parse-button');
    const addButton = container.querySelector('.add-ingredient-btn-inline');
    
    if (cronometerSection && parseButton) {
        // Check if we already have a button row
        let buttonRow = cronometerSection.querySelector('.cronometer-button-row');
        
        if (!buttonRow) {
            // Create a new button row container
            buttonRow = document.createElement('div');
            buttonRow.className = 'cronometer-button-row';
            
            // Move the parse button to the button row
            if (parseButton.parentNode === cronometerSection) {
                buttonRow.appendChild(parseButton);
            }
            
            // Move the add ingredient button if it exists and is not already in a good position
            if (addButton && !addButton.closest('.cronometer-button-row')) {
                // Clone the add ingredient button for the cronometer section
                const addButtonClone = addButton.cloneNode(true);
                addButtonClone.textContent = 'Add Ingredient';
                
                // Add event listener to the cloned button
                addButtonClone.addEventListener('click', function(event) {
                    event.preventDefault();
                    // Trigger the original button's click
                    addButton.click();
                });
                
                buttonRow.appendChild(addButtonClone);
                
                // Hide the original add button if it's in the action buttons section
                const actionButtonsSection = container.querySelector('.action-buttons-section');
                if (actionButtonsSection && actionButtonsSection.contains(addButton)) {
                    addButton.style.display = 'none';
                }
            }
            
            // Add the button row to the cronometer section
            cronometerSection.appendChild(buttonRow);
        }
    }
}

function reorganizeActionButtons(container) {
    // Look for buttons more broadly
    const removeButton = container.querySelector('.remove-ingredient-btn') ||
                        container.querySelector('button[title*="Remove"]') ||
                        container.querySelector('button:contains("Remove")') ||
                        Array.from(container.querySelectorAll('button')).find(btn =>
                            btn.textContent.includes('Remove') || btn.textContent.includes('🗑'));

    const toggleButton = container.querySelector('.toggle-detailed-nutrition') ||
                        container.querySelector('button[title*="Nutrition"]') ||
                        Array.from(container.querySelectorAll('button')).find(btn =>
                            btn.textContent.includes('Nutrition') || btn.textContent.includes('📋'));

    const ingredientHeader = container.querySelector('.ingredient-header');
    const typeSelector = container.querySelector('.ingredient-type-selector');

    console.log('[Button Reorganizer] Found buttons:', {
        removeButton: !!removeButton,
        toggleButton: !!toggleButton,
        ingredientHeader: !!ingredientHeader,
        typeSelector: !!typeSelector
    });

    // Create a combined action buttons container if it doesn't exist
    let combinedActions = container.querySelector('.combined-header-actions');

    if (!combinedActions && (removeButton || toggleButton)) {
        combinedActions = document.createElement('div');
        combinedActions.className = 'combined-header-actions';
        combinedActions.style.cssText = `
            display: flex !important;
            flex-direction: row !important;
            gap: 6px !important;
            align-items: center !important;
            margin-top: 6px !important;
            margin-bottom: 4px !important;
        `;

        // Move toggle button if it exists
        if (toggleButton && !toggleButton.closest('.combined-header-actions')) {
            const toggleClone = toggleButton.cloneNode(true);
            toggleClone.textContent = '📋 Show Detailed Nutrition';
            toggleClone.style.cssText = `
                flex: 1 !important;
                padding: 4px 8px !important;
                font-size: 0.75rem !important;
                background-color: rgba(30, 30, 30, 0.8) !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                color: #e0e0e0 !important;
                border-radius: 3px !important;
                cursor: pointer !important;
            `;
            toggleClone.addEventListener('click', function(event) {
                event.preventDefault();
                toggleButton.click();
            });
            combinedActions.appendChild(toggleClone);
            toggleButton.style.display = 'none';
        }

        // Move remove button if it exists
        if (removeButton && !removeButton.closest('.combined-header-actions')) {
            const removeClone = removeButton.cloneNode(true);
            removeClone.textContent = '🗑️ Remove';
            removeClone.style.cssText = `
                flex: 1 !important;
                padding: 4px 8px !important;
                font-size: 0.75rem !important;
                background-color: rgba(40, 20, 20, 0.8) !important;
                border: 1px solid rgba(255, 100, 100, 0.2) !important;
                color: #ff6b6b !important;
                border-radius: 3px !important;
                cursor: pointer !important;
            `;
            removeClone.addEventListener('click', function(event) {
                event.preventDefault();
                removeButton.click();
            });
            combinedActions.appendChild(removeClone);
            removeButton.style.display = 'none';
        }

        // Add the combined actions RIGHT AFTER the radio buttons
        let placed = false;

        // Try ingredient header first
        if (ingredientHeader && !placed) {
            ingredientHeader.insertAdjacentElement('afterend', combinedActions);
            placed = true;
            console.log('[Button Reorganizer] Placed after ingredient header');
        }

        // Try type selector
        if (!placed && typeSelector) {
            typeSelector.insertAdjacentElement('afterend', combinedActions);
            placed = true;
            console.log('[Button Reorganizer] Placed after type selector');
        }

        // Try selection row
        if (!placed) {
            const selectionRow = container.querySelector('.selection-row');
            if (selectionRow) {
                selectionRow.insertAdjacentElement('afterend', combinedActions);
                placed = true;
                console.log('[Button Reorganizer] Placed after selection row');
            }
        }

        // Fallback: add at the top of the ingredient item
        if (!placed) {
            const firstChild = container.firstElementChild;
            if (firstChild) {
                firstChild.insertAdjacentElement('afterend', combinedActions);
                console.log('[Button Reorganizer] Placed after first child');
            } else {
                container.appendChild(combinedActions);
                console.log('[Button Reorganizer] Appended to container');
            }
        }
    }
}

function ensureRadioButtonLayout(container) {
    const typeSelector = container.querySelector('.ingredient-type-selector');
    if (typeSelector) {
        // Ensure the CSS is applied
        typeSelector.style.cssText = `
            display: flex !important;
            flex-direction: row !important;
            gap: 8px !important;
            align-items: center !important;
        `;
        
        const options = typeSelector.querySelectorAll('.ingredient-type-option');
        options.forEach(option => {
            option.style.cssText = `
                display: flex !important;
                align-items: center !important;
                gap: 4px !important;
                flex: 1 !important;
            `;
        });
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        reorganizeButtonLayouts();
    }, 500); // Wait for other scripts to load
});

// Reorganize when new ingredients are added
document.addEventListener('ingredientAdded', function(event) {
    setTimeout(() => {
        reorganizeButtonLayouts();
    }, 100);
});

// Watch for dynamically added content
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element node
                    if (node.classList && (node.classList.contains('ingredient-item') || node.querySelector('.ingredient-item'))) {
                        setTimeout(() => {
                            reorganizeButtonsInItem(node);
                        }, 100);
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

// Export functions for use by other scripts
window.reorganizeButtonLayouts = reorganizeButtonLayouts;
window.reorganizeButtonsInItem = reorganizeButtonsInItem;

console.log('[Button Layout Reorganizer] Loaded and ready');
