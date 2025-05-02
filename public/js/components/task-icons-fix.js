/**
 * Task Icons Fix
 * Replaces emoji icons with Font Awesome icons for task actions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Function to update task action icons
    function updateTaskActionIcons() {
        // Replace pencil emoji with Font Awesome icon
        document.querySelectorAll('.task-actions .pencil-icon').forEach(icon => {
            if (!icon.querySelector('.fas')) {
                icon.innerHTML = '<i class="fas fa-pencil-alt"></i>';
            }
        });
        
        // Replace X emoji with Font Awesome icon
        document.querySelectorAll('.task-actions .x-icon').forEach(icon => {
            if (!icon.querySelector('.fas')) {
                icon.innerHTML = '<i class="fas fa-times"></i>';
            }
        });
        
        // Also update habit action icons
        document.querySelectorAll('.habit-actions .pencil-icon').forEach(icon => {
            if (!icon.querySelector('.fas')) {
                icon.innerHTML = '<i class="fas fa-pencil-alt"></i>';
            }
        });
        
        document.querySelectorAll('.habit-actions .x-icon').forEach(icon => {
            if (!icon.querySelector('.fas')) {
                icon.innerHTML = '<i class="fas fa-times"></i>';
            }
        });
    }
    
    // Run the function on page load
    updateTaskActionIcons();
    
    // Also run it when tasks are loaded or updated
    document.addEventListener('tasksLoaded', updateTaskActionIcons);
    document.addEventListener('taskUpdated', updateTaskActionIcons);
    document.addEventListener('taskActionButtonsUpdated', updateTaskActionIcons);
    
    // Override the createTaskElement function to use Font Awesome icons
    if (window.createTaskElement) {
        const originalCreateTaskElement = window.createTaskElement;
        
        window.createTaskElement = function(task) {
            const taskElement = originalCreateTaskElement(task);
            
            // Update the edit button to use Font Awesome
            const editBtn = taskElement.querySelector('.edit-task-btn');
            if (editBtn) {
                editBtn.innerHTML = '<i class="pencil-icon"><i class="fas fa-pencil-alt"></i></i>';
            }
            
            // Update the delete button to use Font Awesome
            const deleteBtn = taskElement.querySelector('.delete-btn');
            if (deleteBtn) {
                deleteBtn.innerHTML = '<i class="x-icon"><i class="fas fa-times"></i></i>';
            }
            
            return taskElement;
        };
    }
    
    // Create a MutationObserver to watch for new task elements
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                // Check if any of the added nodes are task items or contain task items
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        // If this is a task item or contains task items
                        if (node.classList && node.classList.contains('task-item') || 
                            node.querySelector && node.querySelector('.task-item')) {
                            updateTaskActionIcons();
                        }
                        
                        // If this is a habit item or contains habit items
                        if (node.classList && node.classList.contains('habit-item') || 
                            node.querySelector && node.querySelector('.habit-item')) {
                            updateTaskActionIcons();
                        }
                    }
                });
            }
        });
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Dispatch a custom event to notify that the task icons have been updated
    document.dispatchEvent(new CustomEvent('taskIconsUpdated'));
});
