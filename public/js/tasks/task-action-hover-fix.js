/**
 * Task Action Hover Fix
 * Enhances the hover functionality for task action buttons on touch devices
 */

document.addEventListener('DOMContentLoaded', function() {

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    function updateTaskActionButtons() {

        const taskItems = document.querySelectorAll('.task-item');

        taskItems.forEach(taskItem => {

            const actionsDiv = taskItem.querySelector('.task-actions');

            if (!actionsDiv) return;

            actionsDiv.style.position = 'absolute';
            actionsDiv.style.right = '10px';
            actionsDiv.style.top = '50%';
            actionsDiv.style.transform = 'translateY(-50%)';

            actionsDiv.style.opacity = '0';
            actionsDiv.style.visibility = 'hidden';

            taskItem.addEventListener('mouseenter', () => {
                actionsDiv.style.opacity = '1';
                actionsDiv.style.visibility = 'visible';
            });

            taskItem.addEventListener('mouseleave', () => {

                if (!taskItem.classList.contains('show-actions')) {
                    actionsDiv.style.opacity = '0';
                    actionsDiv.style.visibility = 'hidden';
                }
            });
        });
    }

    updateTaskActionButtons();

    document.addEventListener('tasksLoaded', updateTaskActionButtons);
    document.addEventListener('taskUpdated', updateTaskActionButtons);

    if (isTouchDevice) {

        document.addEventListener('click', function(event) {

            const taskItem = event.target.closest('.task-item');

            if (taskItem && !event.target.closest('.task-actions') &&
                !event.target.closest('.edit-task-btn') &&
                !event.target.closest('.delete-btn')) {

                const wasActive = taskItem.classList.contains('show-actions');

                document.querySelectorAll('.task-item.show-actions').forEach(item => {
                    item.classList.remove('show-actions');
                    const actions = item.querySelector('.task-actions');
                    if (actions) {
                        actions.style.opacity = '0';
                        actions.style.visibility = 'hidden';
                    }
                });

                if (!wasActive) {
                    taskItem.classList.add('show-actions');
                    const actions = taskItem.querySelector('.task-actions');
                    if (actions) {
                        actions.style.opacity = '1';
                        actions.style.visibility = 'visible';
                    }
                }

            }

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

    document.dispatchEvent(new CustomEvent('taskActionButtonsUpdated'));
});
