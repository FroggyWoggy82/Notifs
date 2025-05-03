/**
 * Clean Toggle Fix
 * A minimal solution to fix the Show Detailed Nutrition button
 */
(function() {
    // Run once when the DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        // Remove any existing button at the top of the page
        const topButton = document.querySelector('body > button.toggle-detailed-nutrition, body > button#show-detailed-nutrition-btn');
        if (topButton) {
            topButton.parentNode.removeChild(topButton);
        }
        
        // Find the button in the ingredient form
        const toggleButton = document.querySelector('.buttons-row .toggle-detailed-nutrition');
        if (!toggleButton) return;
        
        // Style the button
        toggleButton.style.backgroundColor = '#ffffff';
        toggleButton.style.color = '#121212';
        toggleButton.style.border = 'none';
        toggleButton.style.borderRadius = '3px';
        toggleButton.style.padding = '5px 10px';
        toggleButton.style.fontSize = '0.8em';
        toggleButton.style.cursor = 'pointer';
        
        // Remove any existing click handlers
        const newButton = toggleButton.cloneNode(true);
        toggleButton.parentNode.replaceChild(newButton, toggleButton);
        
        // Add a simple click handler
        newButton.addEventListener('click', function() {
            // Find the detailed nutrition panel
            const panel = this.closest('.ingredient-item').querySelector('.detailed-nutrition-panel');
            if (!panel) return;
            
            // Toggle visibility
            if (panel.style.display === 'none' || !panel.style.display) {
                panel.style.display = 'block';
                this.textContent = 'Hide Detailed Nutrition';
            } else {
                panel.style.display = 'none';
                this.textContent = 'Show Detailed Nutrition';
            }
        });
        
        // Set initial state
        newButton.textContent = 'Show Detailed Nutrition';
        const panel = newButton.closest('.ingredient-item').querySelector('.detailed-nutrition-panel');
        if (panel) {
            panel.style.display = 'none';
        }
    });
})();
