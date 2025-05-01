// Calendar Badge Style Fix
// Overrides the inline styles for badges in the calendar selected date view

document.addEventListener('DOMContentLoaded', function() {
    console.log('Calendar badge style fix loaded');
    
    // Function to override badge styles
    function overrideBadgeStyles() {
        // Find all badge spans in the selected task list
        const badgeSpans = document.querySelectorAll('#selectedTaskList span[style*="background-color"]');
        
        // Override badge styles
        badgeSpans.forEach(badge => {
            // Remove inline styles that set background and color
            badge.style.removeProperty('background-color');
            badge.style.removeProperty('color');
            badge.style.removeProperty('box-shadow');
            
            // Apply new styles
            badge.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            badge.style.color = 'white';
            badge.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        });
    }
    
    // Create a MutationObserver to watch for changes to the DOM
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // Check if any nodes were added
            if (mutation.addedNodes.length) {
                // Check if any of the added nodes are spans or contain spans
                mutation.addedNodes.forEach(node => {
                    // If the node is an element
                    if (node.nodeType === 1) {
                        // If the node is a span with background-color style
                        if (node.tagName === 'SPAN' && node.style && node.style.backgroundColor) {
                            overrideBadgeStyles();
                        }
                        // If the node contains spans
                        else if (node.querySelectorAll) {
                            const spans = node.querySelectorAll('span[style*="background-color"]');
                            if (spans.length) {
                                overrideBadgeStyles();
                            }
                        }
                    }
                });
            }
        });
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Also run once on page load
    overrideBadgeStyles();
});
