// Calendar Heading Fix
// Overrides the inline styles for Tasks and Habits headings in the calendar

document.addEventListener('DOMContentLoaded', function() {
    console.log('Calendar heading fix loaded');
    
    // Function to override heading styles
    function overrideHeadingStyles() {
        // Find the Tasks and Habits headings
        const headings = document.querySelectorAll('#selectedTaskList h4');
        
        // Remove inline styles from all headings
        headings.forEach(heading => {
            // Remove inline styles that set color
            heading.style.removeProperty('color');
            heading.style.removeProperty('margin-top');
            
            // Log the heading text for debugging
            console.log('Found heading:', heading.textContent);
        });
    }
    
    // Create a MutationObserver to watch for changes to the DOM
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // Check if any nodes were added
            if (mutation.addedNodes.length) {
                // Check if any of the added nodes are h4 headings or contain h4 headings
                mutation.addedNodes.forEach(node => {
                    // If the node is an element
                    if (node.nodeType === 1) {
                        // If the node is an h4 heading
                        if (node.tagName === 'H4') {
                            overrideHeadingStyles();
                        }
                        // If the node contains h4 headings
                        else if (node.querySelectorAll) {
                            const headings = node.querySelectorAll('h4');
                            if (headings.length) {
                                overrideHeadingStyles();
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
    overrideHeadingStyles();
});
