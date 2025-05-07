/**
 * Task Action Hover Fix
 * Enhances the hover functionality for task action buttons on touch devices
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Function to update task action buttons
    function updateTaskActionButtons() {
        // Get all task items
        const taskItems = document.querySelectorAll('.task-item');

        // For each task item, ensure the action buttons are properly set up
        taskItems.forEach(taskItem => {
            // Get the action buttons container
            const actionsDiv = taskItem.querySelector('.task-actions');

            // If there's no actions div, skip this task item
            if (!actionsDiv) return;

            // Make sure the actions div is properly positioned
            actionsDiv.style.position = 'absolute';
            actionsDiv.style.right = '10px';
            actionsDiv.style.top = '50%';
            actionsDiv.style.transform = 'translateY(-50%)';

            // Hide the actions div by default
            actionsDiv.style.opacity = '0';
            actionsDiv.style.visibility = 'hidden';

            // Add hover event listeners to show/hide the actions div
            taskItem.addEventListener('mouseenter', () => {
                actionsDiv.style.opacity = '1';
                actionsDiv.style.visibility = 'visible';
            });

            taskItem.addEventListener('mouseleave', () => {
                // Only hide if not in show-actions state (for touch devices)
                if (!taskItem.classList.contains('show-actions')) {
                    actionsDiv.style.opacity = '0';
                    actionsDiv.style.visibility = 'hidden';
                }
            });
        });
    }

    // Run the function on page load
    updateTaskActionButtons();

    // Also run it when tasks are loaded or updated
    document.addEventListener('tasksLoaded', updateTaskActionButtons);
    document.addEventListener('taskUpdated', updateTaskActionButtons);

    // For touch devices, add tap functionality
    if (isTouchDevice) {
        // For touch devices, we'll use a tap to show/hide the action buttons
        document.addEventListener('click', function(event) {
            // Find the closest task item to the clicked element
            const taskItem = event.target.closest('.task-item');

            // If we clicked on a task item (but not on an action button)
            if (taskItem && !event.target.closest('.task-actions') &&
                !event.target.closest('.edit-task-btn') &&
                !event.target.closest('.delete-btn')) {

                // Toggle the show-actions class on this task item
                const wasActive = taskItem.classList.contains('show-actions');

                // First, remove the class from all task items
                document.querySelectorAll('.task-item.show-actions').forEach(item => {
                    item.classList.remove('show-actions');
                    const actions = item.querySelector('.task-actions');
                    if (actions) {
                        actions.style.opacity = '0';
                        actions.style.visibility = 'hidden';
                    }
                });

                // Then, if this item wasn't already active, make it active
                if (!wasActive) {
                    taskItem.classList.add('show-actions');
                    const actions = taskItem.querySelector('.task-actions');
                    if (actions) {
                        actions.style.opacity = '1';
                        actions.style.visibility = 'visible';
                    }
                }

                // Don't prevent default here to allow checkbox clicks to work
            }

            // If we clicked outside any task item, hide all action buttons
            if (!taskItem && !event.target.closest('.task-actions')) {
                document.querySelectorAll('.task-item.show-actions').forEach(item => {
                    item.classList.remove('show-actions');
                    const actions = item.querySelector('.task-actions');
                    if (actions) {
                        actions.style.opacity = '0';
                        actions.style.visibility = 'hidden';
                    }
                });
            }
        });
    }

    // Dispatch a custom event to notify that the task action buttons have been updated
    document.dispatchEvent(new CustomEvent('taskActionButtonsUpdated'));
});
