/**
 * Exact Position Match
 * Makes the Show Detailed Nutrition button match the exact position of other buttons
 */
(function() {
    // Function to match button positions exactly
    function matchButtonPositions() {
        // Find all toggle buttons
        const toggleButtons = document.querySelectorAll('.toggle-detailed-nutrition');
        
        toggleButtons.forEach(button => {
            // Skip if already processed
            if (button.dataset.positionMatched === 'true') return;
            
            // Find the other buttons in the same row
            const parentRow = button.parentNode;
            if (!parentRow) return;
            
            const otherButtons = parentRow.querySelectorAll('button:not(.toggle-detailed-nutrition)');
            if (otherButtons.length === 0) return;
            
            // Get the computed style and position of another button
            const otherButton = otherButtons[0];
            const otherRect = otherButton.getBoundingClientRect();
            const buttonRect = button.getBoundingClientRect();
            
            // Calculate the vertical offset needed to align the buttons
            const verticalOffset = otherRect.top - buttonRect.top;
            
            // Apply the offset to position the button correctly
            if (Math.abs(verticalOffset) > 0) {
                button.style.position = 'relative';
                button.style.top = verticalOffset + 'px';
            }
            
            // Mark as processed
            button.dataset.positionMatched = 'true';
        });
    }
    
    // Run when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // Wait for layout to stabilize
            setTimeout(matchButtonPositions, 500);
        });
    } else {
        // Wait for layout to stabilize
        setTimeout(matchButtonPositions, 500);
    }
    
    // Also run after delays to ensure all dynamic content is loaded
    setTimeout(matchButtonPositions, 1000);
    setTimeout(matchButtonPositions, 2000);
    
    // Set up a mutation observer to watch for changes
    const observer = new MutationObserver(function(mutations) {
        // Wait for layout to stabilize after DOM changes
        setTimeout(matchButtonPositions, 100);
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Also run when window is resized
    window.addEventListener('resize', function() {
        // Reset the position matching
        document.querySelectorAll('.toggle-detailed-nutrition').forEach(button => {
            button.dataset.positionMatched = 'false';
        });
        
        // Wait for layout to stabilize after resize
        setTimeout(matchButtonPositions, 100);
    });
})();
