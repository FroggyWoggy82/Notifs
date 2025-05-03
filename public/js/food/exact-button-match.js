/**
 * Exact Button Match
 * Makes the Show Detailed Nutrition button exactly match the size of Add Ingredient and Remove buttons
 */
(function() {
    // Function to match button sizes exactly
    function matchButtonSizes() {
        // Get all ingredient forms
        const forms = document.querySelectorAll('.ingredient-form');
        
        forms.forEach(form => {
            // Find the buttons
            const addButton = form.querySelector('button[onclick*="addIngredient"], button:contains("Add Ingredient")');
            const removeButton = form.querySelector('button[onclick*="remove"], button:contains("Remove")');
            const toggleButton = form.querySelector('.toggle-detailed-nutrition');
            
            // If we don't have all buttons, skip
            if (!addButton || !removeButton || !toggleButton) return;
            
            // Get the computed style of the Add Ingredient button
            const addStyle = window.getComputedStyle(addButton);
            
            // Apply the exact same dimensions and styling to the toggle button
            toggleButton.style.width = addStyle.width;
            toggleButton.style.height = addStyle.height;
            toggleButton.style.padding = addStyle.padding;
            toggleButton.style.margin = addStyle.margin;
            toggleButton.style.fontSize = addStyle.fontSize;
            toggleButton.style.lineHeight = addStyle.lineHeight;
            toggleButton.style.fontWeight = addStyle.fontWeight;
            toggleButton.style.borderRadius = addStyle.borderRadius;
            toggleButton.style.boxSizing = addStyle.boxSizing;
            
            // Make sure the toggle button is in the same container as the other buttons
            if (addButton.parentNode && addButton.parentNode !== toggleButton.parentNode) {
                addButton.parentNode.insertBefore(toggleButton, addButton);
            }
            
            // Create a flex container for all buttons if they're not already in one
            if (addButton.parentNode) {
                const container = addButton.parentNode;
                container.style.display = 'flex';
                container.style.justifyContent = 'space-between';
                container.style.width = '100%';
                
                // Make all buttons the same flex size
                [toggleButton, addButton, removeButton].forEach(button => {
                    button.style.flex = '1';
                    button.style.margin = '0 5px';
                });
                
                // First button should have no left margin
                const firstButton = container.firstElementChild;
                if (firstButton) {
                    firstButton.style.marginLeft = '0';
                }
                
                // Last button should have no right margin
                const lastButton = container.lastElementChild;
                if (lastButton) {
                    lastButton.style.marginRight = '0';
                }
            }
        });
    }
    
    // Helper function to find elements by text content
    Element.prototype.contains = function(text) {
        return this.textContent.includes(text);
    };
    
    // Run when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(matchButtonSizes, 500);
        });
    } else {
        setTimeout(matchButtonSizes, 500);
    }
    
    // Also run after delays to ensure all dynamic content is loaded
    setTimeout(matchButtonSizes, 1000);
    setTimeout(matchButtonSizes, 2000);
    setTimeout(matchButtonSizes, 3000);
    
    // Set up a mutation observer to watch for changes
    const observer = new MutationObserver(function(mutations) {
        setTimeout(matchButtonSizes, 100);
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });
})();
