/**
 * Checkbox No Hover Fix
 * 
 * This script completely disables all hover effects and event listeners
 * to eliminate any possibility of flickering.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Checkbox No Hover Fix] Initializing...');
    
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
            
            // Clone the checkbox to remove all event listeners
            const clone = checkbox.cloneNode(true);
            
            // Preserve the checked state
            clone.checked = wasChecked;
            
            // Add a change event listener to handle checkbox functionality
            clone.addEventListener('change', function(event) {
                // This is the only event listener we want to keep
                // All other event listeners will be removed by the cloning process
            });
            
            // Replace the original checkbox with the clone
            if (checkbox.parentNode) {
                checkbox.parentNode.replaceChild(clone, checkbox);
            }
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
            
            // Clone the checkbox to remove all event listeners
            const clone = checkbox.cloneNode(true);
            
            // Preserve the checked state
            clone.checked = wasChecked;
            
            // Add a change event listener to handle checkbox functionality
            clone.addEventListener('change', function(event) {
                // This is the only event listener we want to keep
                // All other event listeners will be removed by the cloning process
            });
            
            // Replace the original checkbox with the clone
            if (checkbox.parentNode) {
                checkbox.parentNode.replaceChild(clone, checkbox);
            }
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
        });
        
        if (shouldUpdate) {
            setTimeout(fixCheckboxes, 10);
        }
    });
    
    // Start observing the document
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Disable all mouseenter/mouseleave events globally
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
        if (type === 'mouseenter' || type === 'mouseleave' || type === 'mouseover' || type === 'mouseout') {
            // Don't add these event listeners
            return;
        }
        
        // Add all other event listeners normally
        return originalAddEventListener.call(this, type, listener, options);
    };
    
    // Add a global style to disable all transitions and animations
    const style = document.createElement('style');
    style.textContent = `
        * {
            animation-duration: 0s !important;
            transition-duration: 0s !important;
        }
        
        @keyframes checkbox-fill { from, to { opacity: 0 !important; } }
        @keyframes checkbox-pulse { from, to { opacity: 0 !important; } }
    `;
    document.head.appendChild(style);
    
    console.log('[Checkbox No Hover Fix] Initialization complete');
});
