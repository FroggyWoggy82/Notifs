/**
 * Ensure Toggle Works
 * Makes sure the toggle button works by directly modifying the HTML structure
 */
(function() {
    // Function to ensure toggle buttons work
    function ensureToggleWorks() {
        // Get all ingredient items
        const ingredientItems = document.querySelectorAll('.ingredient-item');
        
        ingredientItems.forEach(item => {
            // Skip if already processed
            if (item.dataset.toggleProcessed === 'true') return;
            
            // Mark as processed
            item.dataset.toggleProcessed = 'true';
            
            // Find the buttons row
            let buttonsRow = item.querySelector('.buttons-row');
            
            // If buttons row doesn't exist, create it
            if (!buttonsRow) {
                buttonsRow = document.createElement('div');
                buttonsRow.className = 'buttons-row';
                
                // Find a good place to insert it
                const insertAfter = item.querySelector('.cronometer-text-paste-container') || 
                                   item.querySelector('.ingredient-form') ||
                                   item.querySelector('.ingredient-header');
                
                if (insertAfter && insertAfter.parentNode) {
                    insertAfter.parentNode.insertBefore(buttonsRow, insertAfter.nextSibling);
                } else {
                    // If no good place found, insert at the beginning of the item
                    item.insertBefore(buttonsRow, item.firstChild);
                }
            }
            
            // Find the toggle button
            let toggleButton = buttonsRow.querySelector('.toggle-detailed-nutrition');
            
            // If toggle button doesn't exist, create it
            if (!toggleButton) {
                toggleButton = document.createElement('button');
                toggleButton.type = 'button';
                toggleButton.className = 'toggle-detailed-nutrition';
                toggleButton.textContent = 'Show Detailed Nutrition';
                
                // Add it to the buttons row
                buttonsRow.appendChild(toggleButton);
            }
            
            // Find the detailed nutrition panel
            let panel = item.querySelector('.detailed-nutrition-panel');
            
            // If panel doesn't exist, create it
            if (!panel) {
                panel = document.createElement('div');
                panel.className = 'detailed-nutrition-panel';
                panel.style.display = 'none';
                
                // Add it after the buttons row
                if (buttonsRow.nextSibling) {
                    buttonsRow.parentNode.insertBefore(panel, buttonsRow.nextSibling);
                } else {
                    buttonsRow.parentNode.appendChild(panel);
                }
            }
            
            // Make sure the panel is initially hidden
            panel.style.display = 'none';
            
            // Remove existing click handlers by cloning
            const newToggleButton = toggleButton.cloneNode(true);
            toggleButton.parentNode.replaceChild(newToggleButton, toggleButton);
            
            // Add click event listener
            newToggleButton.addEventListener('click', function() {
                if (panel.style.display === 'none' || !panel.style.display || panel.style.display === '') {
                    panel.style.display = 'block';
                    this.textContent = 'Hide Detailed Nutrition';
                } else {
                    panel.style.display = 'none';
                    this.textContent = 'Show Detailed Nutrition';
                }
            });
        });
    }
    
    // Function to initialize
    function init() {
        // Run immediately
        ensureToggleWorks();
        
        // Set up a mutation observer to watch for new ingredient items
        const observer = new MutationObserver(function(mutations) {
            ensureToggleWorks();
        });
        
        // Start observing the document body for changes
        observer.observe(document.body, { childList: true, subtree: true });
    }
    
    // Run when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Also run after a short delay to ensure all dynamic content is loaded
    setTimeout(ensureToggleWorks, 500);
    setTimeout(ensureToggleWorks, 1000);
    setTimeout(ensureToggleWorks, 2000);
})();
