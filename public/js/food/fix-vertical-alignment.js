/**
 * Fix Vertical Alignment
 * Ensures the Show Detailed Nutrition button is vertically aligned with other buttons
 */
(function() {
    // Function to fix vertical alignment
    function fixVerticalAlignment() {
        // Find all toggle buttons
        const toggleButtons = document.querySelectorAll('.toggle-detailed-nutrition');
        
        toggleButtons.forEach(button => {
            // Skip if already processed
            if (button.dataset.verticalFixed === 'true') return;
            
            // Mark as processed
            button.dataset.verticalFixed = 'true';
            
            // Find the other buttons in the same row
            const parentRow = button.parentNode;
            if (!parentRow) return;
            
            const otherButtons = parentRow.querySelectorAll('button:not(.toggle-detailed-nutrition)');
            if (otherButtons.length === 0) return;
            
            // Get the computed style of another button
            const otherButton = otherButtons[0];
            const otherStyle = window.getComputedStyle(otherButton);
            
            // Apply the exact same height and vertical alignment
            button.style.height = otherStyle.height;
            button.style.lineHeight = otherStyle.lineHeight;
            button.style.paddingTop = otherStyle.paddingTop;
            button.style.paddingBottom = otherStyle.paddingBottom;
            button.style.marginTop = otherStyle.marginTop;
            button.style.marginBottom = otherStyle.marginBottom;
            button.style.verticalAlign = 'middle';
            button.style.display = 'inline-block';
            button.style.boxSizing = 'border-box';
            
            // Make sure the parent row has the correct display and alignment
            parentRow.style.display = 'flex';
            parentRow.style.alignItems = 'center';
            parentRow.style.justifyContent = 'space-between';
            parentRow.style.width = '100%';
            parentRow.style.height = 'auto';
            parentRow.style.margin = '10px 0';
            parentRow.style.padding = '0';
            
            // Make all buttons in the row have the same flex
            const allButtons = parentRow.querySelectorAll('button');
            allButtons.forEach(btn => {
                btn.style.flex = '1';
                btn.style.margin = '0 5px';
                btn.style.verticalAlign = 'middle';
                btn.style.display = 'inline-block';
                btn.style.boxSizing = 'border-box';
            });
            
            // First button should have no left margin
            const firstButton = parentRow.firstElementChild;
            if (firstButton) {
                firstButton.style.marginLeft = '0';
            }
            
            // Last button should have no right margin
            const lastButton = parentRow.lastElementChild;
            if (lastButton) {
                lastButton.style.marginRight = '0';
            }
        });
    }
    
    // Run when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(fixVerticalAlignment, 500);
        });
    } else {
        setTimeout(fixVerticalAlignment, 500);
    }
    
    // Also run after delays to ensure all dynamic content is loaded
    setTimeout(fixVerticalAlignment, 1000);
    setTimeout(fixVerticalAlignment, 2000);
    
    // Set up a mutation observer to watch for changes
    const observer = new MutationObserver(function(mutations) {
        setTimeout(fixVerticalAlignment, 100);
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });
})();
