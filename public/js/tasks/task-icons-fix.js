/**
 * Task Icons Fix
 * Replaces emoji icons with Font Awesome icons for task actions
 */

document.addEventListener('DOMContentLoaded', function() {

    function updateTaskActionIcons() {

        document.querySelectorAll('.task-actions .pencil-icon').forEach(icon => {
            if (!icon.querySelector('.fas')) {
                icon.innerHTML = '<i class="fas fa-pencil-alt"></i>';
            }
        });

        document.querySelectorAll('.task-actions .x-icon').forEach(icon => {
            if (!icon.querySelector('.fas')) {
                icon.innerHTML = '<i class="fas fa-times"></i>';
            }
        });

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

    updateTaskActionIcons();

    document.addEventListener('tasksLoaded', updateTaskActionIcons);
    document.addEventListener('taskUpdated', updateTaskActionIcons);
    document.addEventListener('taskActionButtonsUpdated', updateTaskActionIcons);

    if (window.createTaskElement) {
        const originalCreateTaskElement = window.createTaskElement;
        
        window.createTaskElement = function(task) {
            const taskElement = originalCreateTaskElement(task);

            const editBtn = taskElement.querySelector('.edit-task-btn');
            if (editBtn) {
                editBtn.innerHTML = '<i class="pencil-icon"><i class="fas fa-pencil-alt"></i></i>';
            }

            const deleteBtn = taskElement.querySelector('.delete-btn');
            if (deleteBtn) {
                deleteBtn.innerHTML = '<i class="x-icon"><i class="fas fa-times"></i></i>';
            }
            
            return taskElement;
        };
    }

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {

                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node

                        if (node.classList && node.classList.contains('task-item') || 
                            node.querySelector && node.querySelector('.task-item')) {
                            updateTaskActionIcons();
                        }

                        if (node.classList && node.classList.contains('habit-item') || 
                            node.querySelector && node.querySelector('.habit-item')) {
                            updateTaskActionIcons();
                        }
                    }
                });
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.dispatchEvent(new CustomEvent('taskIconsUpdated'));
});
