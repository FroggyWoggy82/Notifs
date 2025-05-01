/**
 * Special fix for Progress Photo task
 * Removes the Weekly indicator and green dot from the Progress Photo task
 */

document.addEventListener('DOMContentLoaded', function() {
    // Function to find and fix Progress Photo task
    function fixProgressPhotoTask() {
        // Find all task titles
        const taskTitles = document.querySelectorAll('.task-title');
        
        taskTitles.forEach(title => {
            if (title.textContent === 'Progress Photo') {
                console.log('Found Progress Photo task, applying fix');
                
                // Add a special class to the task item
                const taskItem = title.closest('.task-item');
                if (taskItem) {
                    taskItem.classList.add('progress-photo-task');
                }
                
                // Add a special class to the title
                title.classList.add('progress-photo-title');
                
                // Remove recurring classes from the title container
                const titleContainer = title.closest('.task-title-container');
                if (titleContainer) {
                    titleContainer.classList.remove('recurring', 'weekly', 'daily', 'monthly', 'yearly');
                }
                
                // Remove recurring class from the title
                title.classList.remove('recurring');
                
                // Remove data-recurrence-text attribute
                title.removeAttribute('data-recurrence-text');
            }
        });
    }
    
    // Run the function on page load
    fixProgressPhotoTask();
    
    // Also run it when tasks are loaded or updated
    document.addEventListener('tasksLoaded', fixProgressPhotoTask);
    document.addEventListener('taskUpdated', fixProgressPhotoTask);
    
    // Create a MutationObserver to watch for new task elements
    const observer = new MutationObserver(function(mutations) {
        let shouldUpdate = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                // Check if any of the added nodes are task items or contain task items
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        // If this is a task item or contains task items
                        if (node.classList && node.classList.contains('task-item') || 
                            node.querySelector && node.querySelector('.task-item')) {
                            shouldUpdate = true;
                        }
                    }
                });
            }
        });
        
        if (shouldUpdate) {
            fixProgressPhotoTask();
        }
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });
});
