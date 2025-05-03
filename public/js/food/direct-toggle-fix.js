/**
 * Direct Toggle Fix
 * A direct solution to fix the Show Detailed Nutrition button
 */
(function() {
    // Function to fix all toggle buttons on the page
    function fixToggleButtons() {
        // Get all toggle buttons
        const toggleButtons = document.querySelectorAll('.toggle-detailed-nutrition');
        
        // Process each button
        toggleButtons.forEach(button => {
            // Skip if already processed
            if (button.dataset.processed === 'true') return;
            
            // Mark as processed
            button.dataset.processed = 'true';
            
            // Style the button
            button.style.backgroundColor = '#ffffff';
            button.style.color = '#121212';
            button.style.border = 'none';
            button.style.borderRadius = '3px';
            button.style.padding = '5px 10px';
            button.style.fontSize = '0.8em';
            button.style.cursor = 'pointer';
            button.style.margin = '5px';
            button.style.width = 'auto';
            button.style.minWidth = '150px';
            button.style.height = '28px';
            button.style.display = 'inline-block';
            button.style.textAlign = 'center';
            
            // Remove existing click handlers by cloning
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add click event listener
            newButton.addEventListener('click', function(event) {
                // Prevent default behavior
                event.preventDefault();
                event.stopPropagation();
                
                // Find the parent ingredient item
                const ingredientItem = this.closest('.ingredient-item');
                if (!ingredientItem) return;
                
                // Find the detailed nutrition panel
                const panel = ingredientItem.querySelector('.detailed-nutrition-panel');
                if (!panel) return;
                
                // Toggle the panel visibility
                if (panel.style.display === 'none' || !panel.style.display || panel.style.display === '') {
                    panel.style.display = 'block';
                    this.textContent = 'Hide Detailed Nutrition';
                } else {
                    panel.style.display = 'none';
                    this.textContent = 'Show Detailed Nutrition';
                }
            });
            
            // Set initial state
            newButton.textContent = 'Show Detailed Nutrition';
            const panel = newButton.closest('.ingredient-item')?.querySelector('.detailed-nutrition-panel');
            if (panel) {
                panel.style.display = 'none';
            }
        });
    }
    
    // Function to initialize the fix
    function initToggleFix() {
        // Fix buttons immediately
        fixToggleButtons();
        
        // Set up a mutation observer to watch for new buttons
        const observer = new MutationObserver(function(mutations) {
            fixToggleButtons();
        });
        
        // Start observing the document body for changes
        observer.observe(document.body, { childList: true, subtree: true });
    }
    
    // Run when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initToggleFix);
    } else {
        initToggleFix();
    }
    
    // Also run after a short delay to ensure all dynamic content is loaded
    setTimeout(fixToggleButtons, 500);
    setTimeout(fixToggleButtons, 1000);
    setTimeout(fixToggleButtons, 2000);
})();
