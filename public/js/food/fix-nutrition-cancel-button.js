/**
 * Fix for the Cancel button in the nutrition panel not closing the panel
 * This script adds a direct event listener to all Cancel buttons in nutrition panels
 */
(function() {
    // Function to fix the Cancel button in nutrition panels
    function fixNutritionCancelButton() {
        // Find all Cancel buttons in nutrition panels
        document.querySelectorAll('.nutrition-edit-buttons .cancel-nutrition').forEach(button => {
            // Skip if already processed
            if (button.dataset.cancelFixed === 'true') return;

            // Clone the button to remove any existing event listeners
            const newButton = button.cloneNode(true);
            if (button.parentNode) {
                button.parentNode.replaceChild(newButton, button);
            }
            
            // Add a new event listener
            newButton.addEventListener('click', function(event) {
                // Prevent default behavior and stop propagation
                event.preventDefault();
                event.stopPropagation();
                
                console.log('[Fix Nutrition Cancel Button] Cancel button clicked');
                
                // Find the nutrition panel
                const panel = this.closest('.detailed-nutrition-panel');
                if (panel) {
                    // Hide the panel
                    panel.style.display = 'none';
                    
                    // Update the toggle button text
                    const toggleButton = panel.previousElementSibling?.querySelector('.toggle-detailed-nutrition');
                    if (toggleButton) {
                        toggleButton.textContent = 'Show Detailed Nutrition';
                    }
                    
                    console.log('[Fix Nutrition Cancel Button] Panel hidden');
                }
            });
            
            // Mark as processed
            newButton.dataset.cancelFixed = 'true';
        });
    }
    
    // Run the fix on page load
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(fixNutritionCancelButton, 500);
    });
    
    // Run the fix when new elements are added to the DOM
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(fixNutritionCancelButton, 100);
            }
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Run the fix when the toggle button is clicked
    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('toggle-detailed-nutrition') ||
            event.target.classList.contains('show-detailed-nutrition')) {
            setTimeout(fixNutritionCancelButton, 200);
        }
    });
    
    // Also add a direct global event listener for all cancel buttons in nutrition panels
    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('cancel-nutrition')) {
            // Find the nutrition panel
            const panel = event.target.closest('.detailed-nutrition-panel');
            if (panel) {
                // Hide the panel
                panel.style.display = 'none';
                
                // Update the toggle button text
                const toggleButton = panel.previousElementSibling?.querySelector('.toggle-detailed-nutrition');
                if (toggleButton) {
                    toggleButton.textContent = 'Show Detailed Nutrition';
                }
                
                console.log('[Fix Nutrition Cancel Button] Panel hidden (global handler)');
                
                // Prevent other handlers from running
                event.stopPropagation();
                event.preventDefault();
            }
        }
    }, true); // Use capture phase to ensure this runs before other handlers
    
    // Run the fix periodically to catch any missed buttons
    setInterval(fixNutritionCancelButton, 2000);
})();
