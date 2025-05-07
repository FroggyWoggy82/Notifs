/**
 * Remove Duplicate Buttons
 * Ensures there are no duplicate toggle buttons
 */
(function() {
    // Function to remove duplicate buttons
    function removeDuplicateButtons() {
        // Get all toggle buttons
        const toggleButtons = document.querySelectorAll('.toggle-detailed-nutrition, #show-detailed-nutrition-btn');
        
        // Keep track of buttons we've seen in each ingredient item
        const seenButtons = new Map();
        
        toggleButtons.forEach(button => {
            // Skip buttons that are direct children of body (these are duplicates)
            if (button.parentNode === document.body) {
                button.parentNode.removeChild(button);
                return;
            }
            
            // Find the parent ingredient item
            const ingredientItem = button.closest('.ingredient-item');
            
            // If not in an ingredient item, it's a duplicate
            if (!ingredientItem) {
                if (button.parentNode) {
                    button.parentNode.removeChild(button);
                }
                return;
            }
            
            // If we've already seen a button in this ingredient item, it's a duplicate
            if (seenButtons.has(ingredientItem)) {
                if (button.parentNode) {
                    button.parentNode.removeChild(button);
                }
                return;
            }
            
            // Mark this ingredient item as having a button
            seenButtons.set(ingredientItem, button);
        });
    }
    
    // Run when the DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        // Initial cleanup
        setTimeout(removeDuplicateButtons, 100);
        
        // Set up a mutation observer to watch for new buttons
        const observer = new MutationObserver(function(mutations) {
            removeDuplicateButtons();
        });
        
        // Start observing the document body for changes
        observer.observe(document.body, { childList: true, subtree: true });
    });
})();
