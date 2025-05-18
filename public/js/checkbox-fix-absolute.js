/**
 * Checkbox Fix - Absolute Solution
 * 
 * This script ensures our CSS fixes are applied consistently by:
 * 1. Removing any inline styles that might be causing flashing
 * 2. Removing any pseudo-elements that might be causing the inner circle
 * 3. Ensuring checkboxes remain functional
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Checkbox Fix - Absolute] Initializing...');
    
    // Function to fix checkboxes
    function fixCheckboxes() {
        // Get all task checkboxes
        const taskCheckboxes = document.querySelectorAll('.task-item input[type="checkbox"]');
        
        // Process each task checkbox
        taskCheckboxes.forEach(checkbox => {
            // Store the original checked state
            const wasChecked = checkbox.checked;
            
            // Remove all inline styles completely
            if (checkbox.hasAttribute('style')) {
                checkbox.removeAttribute('style');
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
            
            // Remove all inline styles completely
            if (checkbox.hasAttribute('style')) {
                checkbox.removeAttribute('style');
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
    
    // Disable any existing animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes checkbox-fill { 0%, 50%, 100% { opacity: 0 !important; } }
        @keyframes checkbox-pulse { 0%, 50%, 100% { opacity: 0 !important; } }
    `;
    document.head.appendChild(style);
    
    console.log('[Checkbox Fix - Absolute] Initialization complete');
});
