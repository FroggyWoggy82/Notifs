/**
 * Task Action Hover Fix
 * Enhances the hover functionality for task action buttons on touch devices
 *
 * FIXED VERSION: Prevents duplicate event listeners and reduces DOM operations
 */

document.addEventListener('DOMContentLoaded', function() {
    // Track which task items have already been processed
    const processedTaskItems = new WeakSet();

    // Debounce function to prevent multiple rapid calls
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    function updateTaskActionButtons() {
        const taskItems = document.querySelectorAll('.task-item');
        let newItemsProcessed = 0;

        taskItems.forEach(taskItem => {
            // Skip if this task item has already been processed
            if (processedTaskItems.has(taskItem)) return;

            // Mark this task item as processed
            processedTaskItems.add(taskItem);
            newItemsProcessed++;

            const actionsDiv = taskItem.querySelector('.task-actions');
            if (!actionsDiv) return;

            // Set styles once
            actionsDiv.style.position = 'absolute';
            actionsDiv.style.right = '10px';
            actionsDiv.style.top = '50%';
            actionsDiv.style.transform = 'translateY(-50%)';
            actionsDiv.style.opacity = '0';
            actionsDiv.style.visibility = 'hidden';

            // Use event delegation instead of adding listeners to each task item
            // This is handled by the document-level mouseenter/mouseleave handlers below
        });

        // Only log if we actually processed new items
        if (newItemsProcessed > 0) {
            console.log(`[Task Action Hover Fix] Processed ${newItemsProcessed} new task items`);
        }
    }

    // Use event delegation for mouseenter/mouseleave
    document.addEventListener('mouseover', function(event) {
        const taskItem = event.target.closest('.task-item');
        if (!taskItem) return;

        const actionsDiv = taskItem.querySelector('.task-actions');
        if (!actionsDiv) return;

        // Only update if not already visible
        if (actionsDiv.style.visibility !== 'visible') {
            actionsDiv.style.opacity = '1';
            actionsDiv.style.visibility = 'visible';
        }
    });

    document.addEventListener('mouseout', function(event) {
        // Check if we're leaving a task item and not entering a child of it
        const taskItem = event.target.closest('.task-item');
        if (!taskItem) return;

        // Make sure we're actually leaving the task item
        const relatedTarget = event.relatedTarget;
        if (relatedTarget && taskItem.contains(relatedTarget)) return;

        const actionsDiv = taskItem.querySelector('.task-actions');
        if (!actionsDiv) return;

        // Only hide if not in show-actions state and not already hidden
        if (!taskItem.classList.contains('show-actions') &&
            actionsDiv.style.visibility !== 'hidden') {
            actionsDiv.style.opacity = '0';
            actionsDiv.style.visibility = 'hidden';
        }
    });

    // Initial setup
    updateTaskActionButtons();

    // Use debounced version for event listeners
    const debouncedUpdate = debounce(updateTaskActionButtons, 100);
    document.addEventListener('tasksLoaded', debouncedUpdate);
    document.addEventListener('taskUpdated', debouncedUpdate);
    document.addEventListener('tasksRendered', debouncedUpdate);

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
