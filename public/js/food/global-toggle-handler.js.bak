/**
 * Global Toggle Handler
 * Uses event delegation to handle toggle button clicks globally
 */
(function() {
    // Add a global click handler using event delegation
    document.addEventListener('click', function(event) {
        // Check if the clicked element is a toggle button or a child of a toggle button
        let toggleButton = null;
        
        if (event.target.classList.contains('toggle-detailed-nutrition')) {
            toggleButton = event.target;
        } else if (event.target.closest('.toggle-detailed-nutrition')) {
            toggleButton = event.target.closest('.toggle-detailed-nutrition');
        }
        
        // If not a toggle button, do nothing
        if (!toggleButton) return;
        
        // Prevent default behavior
        event.preventDefault();
        event.stopPropagation();
        
        // Find the parent ingredient item
        const ingredientItem = toggleButton.closest('.ingredient-item');
        if (!ingredientItem) return;
        
        // Find the detailed nutrition panel
        const panel = ingredientItem.querySelector('.detailed-nutrition-panel');
        if (!panel) return;
        
        // Toggle the panel visibility
        if (panel.style.display === 'none' || !panel.style.display || panel.style.display === '') {
            panel.style.display = 'block';
            toggleButton.textContent = 'Hide Detailed Nutrition';
        } else {
            panel.style.display = 'none';
            toggleButton.textContent = 'Show Detailed Nutrition';
        }
    }, true); // Use capture phase to ensure this handler runs first
    
    // Initialize all panels to be hidden on page load
    function initPanels() {
        const panels = document.querySelectorAll('.detailed-nutrition-panel');
        panels.forEach(panel => {
            panel.style.display = 'none';
        });
        
        const buttons = document.querySelectorAll('.toggle-detailed-nutrition');
        buttons.forEach(button => {
            button.textContent = 'Show Detailed Nutrition';
        });
    }
    
    // Run when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPanels);
    } else {
        initPanels();
    }
    
    // Also run after a short delay to ensure all dynamic content is loaded
    setTimeout(initPanels, 500);
    setTimeout(initPanels, 1000);
})();
