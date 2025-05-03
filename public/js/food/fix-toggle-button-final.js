/**
 * Fix Toggle Button Final
 * A direct solution to fix the Show Detailed Nutrition button
 */
document.addEventListener('DOMContentLoaded', function() {
    // Function to fix the toggle button
    function fixToggleButton() {
        // Find the button with class toggle-detailed-nutrition
        const toggleButton = document.querySelector('.toggle-detailed-nutrition');
        
        if (!toggleButton) {
            console.log('Toggle button not found, will try again later');
            return;
        }
        
        console.log('Found toggle button:', toggleButton);
        
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
        
        // Remove any existing click handlers by cloning the button
        const newButton = toggleButton.cloneNode(true);
        if (toggleButton.parentNode) {
            toggleButton.parentNode.replaceChild(newButton, toggleButton);
        }
        
        // Add click event listener
        newButton.addEventListener('click', function() {
            // Find the detailed nutrition panel
            const panel = this.closest('.ingredient-item').querySelector('.detailed-nutrition-panel');
            
            if (panel) {
                // Toggle the panel visibility
                if (panel.style.display === 'none') {
                    panel.style.display = 'block';
                    this.textContent = 'Hide Detailed Nutrition';
                } else {
                    panel.style.display = 'none';
                    this.textContent = 'Show Detailed Nutrition';
                }
            }
        });
        
        console.log('Button fixed');
    }
    
    // Try to fix the button immediately
    setTimeout(fixToggleButton, 100);
    
    // Try again after a short delay
    setTimeout(fixToggleButton, 500);
    
    // And one more time after a longer delay
    setTimeout(fixToggleButton, 1000);
    
    // Set up a mutation observer to watch for new buttons
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                setTimeout(fixToggleButton, 100);
            }
        });
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });
});
