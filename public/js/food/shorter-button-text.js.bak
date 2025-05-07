/**
 * Shorter Button Text
 * Uses shorter text for the Show Detailed Nutrition button to ensure it fits
 */
(function() {
    // Function to use shorter button text
    function useShorterButtonText() {
        // Find all toggle buttons
        const toggleButtons = document.querySelectorAll('.toggle-detailed-nutrition');
        
        toggleButtons.forEach(button => {
            // Skip if already processed
            if (button.dataset.shorterText === 'true') return;
            
            // Mark as processed
            button.dataset.shorterText = 'true';
            
            // Use shorter text
            button.textContent = 'Show Nutrition';
            
            // Add click handler to update the text
            button.addEventListener('click', function() {
                const panel = this.closest('.ingredient-item')?.querySelector('.detailed-nutrition-panel');
                if (!panel) return;
                
                if (panel.style.display === 'none' || !panel.style.display || panel.style.display === '') {
                    this.textContent = 'Hide Nutrition';
                } else {
                    this.textContent = 'Show Nutrition';
                }
            });
            
            // Style the button to ensure proper alignment
            button.style.display = 'flex';
            button.style.alignItems = 'center';
            button.style.justifyContent = 'center';
            button.style.height = '38px';
            button.style.lineHeight = '1';
            button.style.padding = '0 15px';
            button.style.margin = '0';
            button.style.whiteSpace = 'nowrap';
            button.style.overflow = 'visible';
            button.style.textOverflow = 'clip';
            button.style.verticalAlign = 'middle';
            button.style.fontSize = '0.9em';
            button.style.fontWeight = 'normal';
            button.style.backgroundColor = '#ffffff';
            button.style.color = '#121212';
            button.style.border = 'none';
            button.style.borderRadius = '3px';
            button.style.cursor = 'pointer';
            button.style.flex = '1';
        });
    }
    
    // Run when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(useShorterButtonText, 500);
        });
    } else {
        setTimeout(useShorterButtonText, 500);
    }
    
    // Also run after delays to ensure all dynamic content is loaded
    setTimeout(useShorterButtonText, 1000);
    setTimeout(useShorterButtonText, 2000);
    
    // Set up a mutation observer to watch for changes
    const observer = new MutationObserver(function(mutations) {
        setTimeout(useShorterButtonText, 100);
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });
})();
