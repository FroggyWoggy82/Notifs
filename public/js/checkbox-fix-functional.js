/**
 * Checkbox Fix - Functional Solution
 * 
 * This script fixes the checkbox flashing issue while preserving functionality.
 * It removes hover effects but maintains the ability to check/uncheck checkboxes.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Checkbox Fix - Functional] Initializing...');
    
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
            
            // Remove mouseenter and mouseleave event listeners
            // but preserve the change event listener
            const clone = checkbox.cloneNode(true);
            clone.checked = wasChecked;
            
            // Get the original change handler
            const originalChangeHandler = function(event) {
                // Find the task ID from the parent element
                const taskItem = event.target.closest('.task-item');
                if (taskItem && taskItem.dataset.taskId) {
                    const taskId = taskItem.dataset.taskId;
                    console.log(`Checkbox clicked for task ${taskId}`);
                    
                    // Dispatch a custom event that the original handlers can listen for
                    const customEvent = new CustomEvent('taskCheckboxChange', {
                        bubbles: true,
                        detail: {
                            taskId: taskId,
                            checked: event.target.checked
                        }
                    });
                    document.dispatchEvent(customEvent);
                }
            };
            
            // Add the change handler to the clone
            clone.addEventListener('change', originalChangeHandler);
            
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
    
    // Add a global style to disable all transitions and animations
    const style = document.createElement('style');
    style.textContent = `
        input[type="checkbox"], .habit-checkbox {
            animation-duration: 0s !important;
            transition-duration: 0s !important;
        }
        
        @keyframes checkbox-fill { from, to { opacity: 0 !important; } }
        @keyframes checkbox-pulse { from, to { opacity: 0 !important; } }
    `;
    document.head.appendChild(style);
    
    // Listen for the custom event and handle it
    document.addEventListener('taskCheckboxChange', function(event) {
        const taskId = event.detail.taskId;
        const checked = event.detail.checked;
        
        // Call the original handler function
        if (typeof window.handleToggleComplete === 'function') {
            // Create a synthetic event object
            const syntheticEvent = {
                target: {
                    checked: checked,
                    closest: function(selector) {
                        return {
                            dataset: {
                                taskId: taskId
                            }
                        };
                    }
                },
                preventDefault: function() {},
                stopPropagation: function() {}
            };
            
            // Call the original handler
            window.handleToggleComplete(syntheticEvent);
        }
    });
    
    console.log('[Checkbox Fix - Functional] Initialization complete');
});
