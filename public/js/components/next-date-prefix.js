/**
 * Next Date Prefix
 * Ensures all next occurrence dates have the "Next:" prefix
 */

document.addEventListener('DOMContentLoaded', function() {
    function updateNextDateIndicators() {
        const nextDateIndicators = document.querySelectorAll('.next-occurrence-indicator:not(.overdue)');
        
        nextDateIndicators.forEach(indicator => {
            const textSpan = indicator.querySelector('span');
            if (textSpan && !textSpan.textContent.includes('Next:')) {
                textSpan.textContent = `Next: ${textSpan.textContent}`;
            }
        });
    }

    // Run immediately
    updateNextDateIndicators();
    
    // Run when tasks are loaded or updated
    document.addEventListener('tasksLoaded', updateNextDateIndicators);
    document.addEventListener('taskUpdated', updateNextDateIndicators);
    
    // Set up a MutationObserver to watch for changes to the DOM
    const observer = new MutationObserver(function(mutations) {
        let shouldUpdate = false;
        
        mutations.forEach((mutation) => {
            // Check if nodes were added
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                    // Check if the added node is a task item or contains task items
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if ((node.classList && node.classList.contains('task-item')) ||
                            node.querySelector('.task-item') ||
                            node.classList && node.classList.contains('next-occurrence-indicator') ||
                            node.querySelector('.next-occurrence-indicator')) {
                            shouldUpdate = true;
                        }
                    }
                });
            }
        });
        
        if (shouldUpdate) {
            setTimeout(updateNextDateIndicators, 100);
        }
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Override the createTaskElement function if it exists
    if (window.createTaskElement) {
        const originalCreateTaskElement = window.createTaskElement;
        
        window.createTaskElement = function(task) {
            const taskElement = originalCreateTaskElement(task);
            
            // Find and update any next date indicators in the task element
            const nextDateIndicators = taskElement.querySelectorAll('.next-occurrence-indicator:not(.overdue)');
            
            nextDateIndicators.forEach(indicator => {
                const textSpan = indicator.querySelector('span');
                if (textSpan && !textSpan.textContent.includes('Next:')) {
                    textSpan.textContent = `Next: ${textSpan.textContent}`;
                }
            });
            
            return taskElement;
        };
    }
});
