/**
 * Checkbox Flash Fix - Final Solution
 * 
 * This script ensures our CSS fixes are applied consistently by:
 * 1. Removing any inline styles that might be causing flashing
 * 2. Ensuring checkboxes remain functional
 * 3. Preventing any JavaScript-based hover effects
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Checkbox Flash Fix - Final] Initializing...');
    
    // Function to fix checkboxes
    function fixCheckboxes() {
        // Get all task checkboxes
        const taskCheckboxes = document.querySelectorAll('.task-item input[type="checkbox"]');
        
        // Process each task checkbox
        taskCheckboxes.forEach(checkbox => {
            // Store the original checked state
            const wasChecked = checkbox.checked;
            
            // Remove any inline styles that might be causing flashing
            if (checkbox.hasAttribute('style')) {
                // Only remove problematic styles
                const style = checkbox.style;
                
                // Remove transform styles
                style.removeProperty('transform');
                style.removeProperty('-webkit-transform');
                
                // Remove transition styles
                style.removeProperty('transition');
                style.removeProperty('-webkit-transition');
                
                // Remove animation styles
                style.removeProperty('animation');
                style.removeProperty('-webkit-animation');
                
                // Ensure consistent size
                style.setProperty('width', '24px', 'important');
                style.setProperty('height', '24px', 'important');
                style.setProperty('min-width', '24px', 'important');
                style.setProperty('min-height', '24px', 'important');
                style.setProperty('max-width', '24px', 'important');
                style.setProperty('max-height', '24px', 'important');
                
                // Ensure functionality
                style.setProperty('pointer-events', 'auto', 'important');
                style.setProperty('cursor', 'pointer', 'important');
            }
            
            // Restore the checked state
            checkbox.checked = wasChecked;
        });
        
        // Get all habit checkboxes
        const habitCheckboxes = document.querySelectorAll('.habit-item .habit-checkbox');
        
        // Process each habit checkbox
        habitCheckboxes.forEach(checkbox => {
            // Store the original checked state
            const wasChecked = checkbox.checked;
            
            // Remove any inline styles that might be causing flashing
            if (checkbox.hasAttribute('style')) {
                // Only remove problematic styles
                const style = checkbox.style;
                
                // Remove transform styles
                style.removeProperty('transform');
                style.removeProperty('-webkit-transform');
                
                // Remove transition styles
                style.removeProperty('transition');
                style.removeProperty('-webkit-transition');
                
                // Remove animation styles
                style.removeProperty('animation');
                style.removeProperty('-webkit-animation');
                
                // Ensure consistent size
                style.setProperty('width', '32px', 'important');
                style.setProperty('height', '32px', 'important');
                style.setProperty('min-width', '32px', 'important');
                style.setProperty('min-height', '32px', 'important');
                style.setProperty('max-width', '32px', 'important');
                style.setProperty('max-height', '32px', 'important');
                
                // Ensure functionality
                style.setProperty('pointer-events', 'auto', 'important');
                style.setProperty('cursor', 'pointer', 'important');
            }
            
            // Restore the checked state
            checkbox.checked = wasChecked;
        });
    }
    
    // Run the function immediately
    fixCheckboxes();
    
    // Set up a MutationObserver to watch for changes to the DOM
    const observer = new MutationObserver(function(mutations) {
        let shouldUpdate = false;
        
        mutations.forEach((mutation) => {
            // Check if nodes were added
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                    // Check if the added node is a checkbox or contains checkboxes
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if ((node.tagName === 'INPUT' && node.type === 'checkbox') || 
                            node.classList && node.classList.contains('habit-checkbox') ||
                            node.querySelector('input[type="checkbox"]') ||
                            node.querySelector('.habit-checkbox')) {
                            shouldUpdate = true;
                        }
                    }
                });
            }
            
            // Check if attributes were modified
            if (mutation.type === 'attributes' && 
                (mutation.target.tagName === 'INPUT' && mutation.target.type === 'checkbox' ||
                 mutation.target.classList && mutation.target.classList.contains('habit-checkbox'))) {
                shouldUpdate = true;
            }
        });
        
        if (shouldUpdate) {
            setTimeout(fixCheckboxes, 10);
        }
    });
    
    // Start observing the document
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
    });
    
    // Override any mouseenter/mouseleave event handlers
    document.addEventListener('mouseenter', function(event) {
        if (event.target.tagName === 'INPUT' && event.target.type === 'checkbox' ||
            event.target.classList && event.target.classList.contains('habit-checkbox')) {
            // Prevent default behavior
            event.preventDefault();
            event.stopPropagation();
        }
    }, true);
    
    document.addEventListener('mouseleave', function(event) {
        if (event.target.tagName === 'INPUT' && event.target.type === 'checkbox' ||
            event.target.classList && event.target.classList.contains('habit-checkbox')) {
            // Prevent default behavior
            event.preventDefault();
            event.stopPropagation();
        }
    }, true);
    
    console.log('[Checkbox Flash Fix - Final] Initialization complete');
});
