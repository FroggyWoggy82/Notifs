/**
 * Options Menu Structure Fix
 * This script ensures the options menu has the correct structure for proper label alignment
 */

(function() {
    // Function to fix the options menu structure
    function fixOptionsMenuStructure() {
        // Find all exercise options menus
        const optionsMenus = document.querySelectorAll('.exercise-options-menu');
        
        optionsMenus.forEach(menu => {
            // Check if this menu has already been processed
            if (menu.dataset.structureFixed === 'true') {
                return;
            }
            
            // Find the weight unit row
            const weightUnitRow = menu.querySelector('.exercise-options-menu-row.unit-row');
            if (weightUnitRow) {
                // Get the weight unit label and select
                const weightUnitLabel = weightUnitRow.querySelector('.weight-unit-label');
                const weightUnitSelect = weightUnitRow.querySelector('.exercise-unit-select');
                
                // Create a container for the weight unit if it doesn't exist
                let weightUnitContainer = weightUnitRow.querySelector('.weight-unit-container');
                if (!weightUnitContainer) {
                    weightUnitContainer = document.createElement('div');
                    weightUnitContainer.className = 'weight-unit-container';
                    weightUnitContainer.style.display = 'flex';
                    weightUnitContainer.style.flexDirection = 'column';
                    weightUnitContainer.style.alignItems = 'flex-start';
                    
                    // Move the label and select into the container
                    if (weightUnitLabel && weightUnitSelect) {
                        // Get the parent of the label
                        const labelParent = weightUnitLabel.parentNode;
                        
                        // If the label is not already in a proper container, move it
                        if (!labelParent.classList.contains('weight-unit-container')) {
                            weightUnitContainer.appendChild(weightUnitLabel);
                            weightUnitContainer.appendChild(weightUnitSelect);
                            weightUnitRow.appendChild(weightUnitContainer);
                        }
                    }
                }
            }
            
            // Find the weight increment row
            const weightIncrementRow = menu.querySelector('.exercise-options-menu-row:not(.unit-row)');
            if (weightIncrementRow) {
                // Get the weight increment label and input
                const weightIncrementLabel = weightIncrementRow.querySelector('.weight-increment-text');
                const weightIncrementInput = weightIncrementRow.querySelector('.weight-increment-input');
                
                // Create a container for the weight increment if it doesn't exist
                let weightIncrementContainer = weightIncrementRow.querySelector('.weight-increment-container');
                if (!weightIncrementContainer) {
                    weightIncrementContainer = document.createElement('div');
                    weightIncrementContainer.className = 'weight-increment-container';
                    weightIncrementContainer.style.display = 'flex';
                    weightIncrementContainer.style.flexDirection = 'column';
                    weightIncrementContainer.style.alignItems = 'flex-start';
                    
                    // Move the label and input into the container
                    if (weightIncrementLabel && weightIncrementInput) {
                        // Get the parent of the label
                        const labelParent = weightIncrementLabel.parentNode;
                        
                        // If the label is not already in a proper container, move it
                        if (!labelParent.classList.contains('weight-increment-container')) {
                            weightIncrementContainer.appendChild(weightIncrementLabel);
                            weightIncrementContainer.appendChild(weightIncrementInput);
                            weightIncrementRow.appendChild(weightIncrementContainer);
                        }
                    }
                }
            }
            
            // Mark this menu as processed
            menu.dataset.structureFixed = 'true';
        });
    }
    
    // Function to observe DOM changes and fix options menu structure
    function observeDOMChanges() {
        // Create a mutation observer
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                // Check if new nodes were added
                if (mutation.addedNodes.length) {
                    // Look for options menus in the added nodes
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            // Check if this node is an options menu
                            if (node.classList && node.classList.contains('exercise-options-menu')) {
                                // Fix the structure of this menu
                                fixOptionsMenuStructure();
                            }
                            
                            // Also check child nodes
                            const optionsMenus = node.querySelectorAll('.exercise-options-menu');
                            if (optionsMenus.length) {
                                fixOptionsMenuStructure();
                            }
                        }
                    });
                }
            });
        });
        
        // Start observing the document body
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Function to handle options menu opening
    function handleOptionsMenuToggle() {
        // Listen for clicks on the options button
        document.addEventListener('click', event => {
            const target = event.target;
            
            // Check if the clicked element is an options button
            if (target.classList.contains('btn-exercise-options')) {
                // Wait for the menu to open
                setTimeout(() => {
                    fixOptionsMenuStructure();
                }, 50);
            }
            
            // Also check if any menu is currently visible and fix it
            const visibleMenus = document.querySelectorAll('.exercise-options-menu.show');
            if (visibleMenus.length) {
                setTimeout(() => {
                    fixOptionsMenuStructure();
                }, 50);
            }
        });
    }
    
    // Initialize when the DOM is ready
    function init() {
        console.log('[Options Menu Structure Fix] Initializing...');
        
        // Fix options menu structure for any existing menus
        fixOptionsMenuStructure();
        
        // Set up the options menu toggle handler
        handleOptionsMenuToggle();
        
        // Observe DOM changes to fix options menu structure for new menus
        observeDOMChanges();
        
        console.log('[Options Menu Structure Fix] Initialized');
    }
    
    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
