/**
 * Force Toggle Button
 * Forces the toggle button to be in the correct place and have the correct styling
 */
(function() {
    // Function to force the toggle button
    function forceToggleButton() {
        // Get all ingredient forms
        const ingredientForms = document.querySelectorAll('.ingredient-form');
        
        ingredientForms.forEach(form => {
            // Skip if already processed
            if (form.dataset.buttonForced === 'true') return;
            
            // Mark as processed
            form.dataset.buttonForced = 'true';
            
            // Find the buttons container
            let buttonsContainer = form.querySelector('.buttons-container');
            if (!buttonsContainer) {
                buttonsContainer = document.createElement('div');
                buttonsContainer.className = 'buttons-container';
                form.appendChild(buttonsContainer);
            }
            
            // Find the toggle button
            let toggleButton = buttonsContainer.querySelector('.toggle-detailed-nutrition');
            
            // If toggle button doesn't exist, create it
            if (!toggleButton) {
                toggleButton = document.createElement('button');
                toggleButton.type = 'button';
                toggleButton.className = 'toggle-detailed-nutrition';
                toggleButton.textContent = 'Show Detailed Nutrition';
                
                // Style the button
                toggleButton.style.backgroundColor = '#ffffff';
                toggleButton.style.color = '#121212';
                toggleButton.style.border = 'none';
                toggleButton.style.borderRadius = '3px';
                toggleButton.style.padding = '5px 10px';
                toggleButton.style.fontSize = '0.8em';
                toggleButton.style.cursor = 'pointer';
                toggleButton.style.margin = '5px';
                toggleButton.style.width = 'auto';
                toggleButton.style.minWidth = '150px';
                toggleButton.style.height = '28px';
                toggleButton.style.display = 'inline-block';
                toggleButton.style.textAlign = 'center';
                
                // Add it to the buttons container
                buttonsContainer.appendChild(toggleButton);
            }
            
            // Find the detailed nutrition panel
            const ingredientItem = form.closest('.ingredient-item');
            if (!ingredientItem) return;
            
            let panel = ingredientItem.querySelector('.detailed-nutrition-panel');
            
            // If panel doesn't exist, create it
            if (!panel) {
                panel = document.createElement('div');
                panel.className = 'detailed-nutrition-panel';
                panel.style.display = 'none';
                
                // Add it after the form
                if (form.nextSibling) {
                    form.parentNode.insertBefore(panel, form.nextSibling);
                } else {
                    form.parentNode.appendChild(panel);
                }
            }
            
            // Make sure the panel is initially hidden
            panel.style.display = 'none';
            
            // Add click event listener directly to the button
            toggleButton.onclick = function(event) {
                event.preventDefault();
                event.stopPropagation();
                
                if (panel.style.display === 'none' || !panel.style.display || panel.style.display === '') {
                    panel.style.display = 'block';
                    this.textContent = 'Hide Detailed Nutrition';
                } else {
                    panel.style.display = 'none';
                    this.textContent = 'Show Detailed Nutrition';
                }
                
                return false;
            };
        });
    }
    
    // Function to initialize
    function init() {
        // Run immediately
        forceToggleButton();
        
        // Set up a mutation observer to watch for new ingredient forms
        const observer = new MutationObserver(function(mutations) {
            forceToggleButton();
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
    setTimeout(forceToggleButton, 500);
    setTimeout(forceToggleButton, 1000);
    setTimeout(forceToggleButton, 2000);
})();
