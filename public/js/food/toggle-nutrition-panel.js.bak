/**
 * Toggle Nutrition Panel
 * Handles showing and hiding the detailed nutrition panel
 */
document.addEventListener('DOMContentLoaded', function() {
    // Function to handle toggling the detailed nutrition panel
    function setupToggleButtons() {
        // Find all toggle buttons
        document.querySelectorAll('.toggle-detailed-nutrition').forEach(button => {
            // Skip if already processed
            if (button.dataset.toggleHandlerAdded === 'true') return;
            
            // Add click event listener
            button.addEventListener('click', function() {
                // Find the detailed nutrition panel
                const panel = this.closest('.nutrition-summary').nextElementSibling;
                if (panel && panel.classList.contains('detailed-nutrition-panel')) {
                    // Toggle the panel display
                    if (panel.style.display === 'none' || panel.style.display === '') {
                        panel.style.display = 'block';
                        this.textContent = 'Hide Detailed Nutrition';
                        
                        // Trigger a custom event to notify that the panel is shown
                        const event = new CustomEvent('nutrition-panel-shown', {
                            bubbles: true,
                            detail: { panel: panel }
                        });
                        panel.dispatchEvent(event);
                        
                        // Scroll to the panel
                        setTimeout(() => {
                            panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 100);
                    } else {
                        panel.style.display = 'none';
                        this.textContent = 'Show Detailed Nutrition';
                    }
                }
            });
            
            // Mark as processed
            button.dataset.toggleHandlerAdded = 'true';
        });
    }

    // Run the function initially
    setTimeout(setupToggleButtons, 300);
    
    // Set up a mutation observer to watch for new toggle buttons
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(setupToggleButtons, 100);
            }
        });
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Also handle dynamic button creation through event delegation
    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-ingredient-btn')) {
            // Wait for the form to be displayed
            setTimeout(setupToggleButtons, 200);
            // Try again after a bit longer to ensure it's applied
            setTimeout(setupToggleButtons, 500);
            setTimeout(setupToggleButtons, 1000);
        }
    });
    
    // Run periodically to ensure all toggle buttons are set up
    setInterval(setupToggleButtons, 2000);
});
