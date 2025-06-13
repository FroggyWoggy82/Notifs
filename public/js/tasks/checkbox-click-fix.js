/**
 * Checkbox Click Fix
 *
 * This script fixes the issue where clicking on a task checkbox also opens the task details modal.
 * It ensures that clicking on the checkbox only toggles the completion status without opening the modal.
 * It also ensures that tasks are immediately moved between the active and completed sections when checked/unchecked.
 * It updates the task completion status in the database to persist changes across page refreshes.
 */

console.log('[Checkbox Click Fix] Initializing...');

document.addEventListener('DOMContentLoaded', function() {
    // Use event delegation with capture phase to ensure we catch the event first
    document.addEventListener('click', function(event) {
        // Check if the click is on a checkbox or inside a checkbox container
        const isCheckbox = event.target.type === 'checkbox';
        const isCheckboxContainer = event.target.closest('.task-checkbox-container');

        // If it's a checkbox or checkbox container, prevent the event from bubbling up
        if (isCheckbox || isCheckboxContainer) {
            // Stop both propagation and default behavior
            event.stopPropagation();
            event.stopImmediatePropagation();
            console.log('[Checkbox Click Fix] Checkbox clicked, preventing modal from opening');

            // If it's a checkbox, handle immediate task movement based on checked state
            if (isCheckbox) {
                const taskItem = event.target.closest('.task-item');
                if (taskItem) {
                    const taskId = taskItem.getAttribute('data-task-id');
                    const isComplete = event.target.checked;

                    if (taskId) {
                        // Update the database first
                        updateTaskCompletionInDatabase(taskId, isComplete)
                            .then(() => {
                                // Then update the UI
                                if (isComplete && !taskItem.classList.contains('complete')) {
                                    // Task is being marked as complete
                                    handleImmediateTaskCompletion(taskItem);
                                } else if (!isComplete && taskItem.classList.contains('complete')) {
                                    // Task is being marked as incomplete
                                    handleImmediateTaskUncompletion(taskItem);
                                }
                            })
                            .catch(error => {
                                console.error('[Checkbox Click Fix] Error updating task completion status:', error);
                                // Revert the checkbox state if there was an error
                                event.target.checked = !isComplete;
                                alert('Failed to update task status. Please try again.');
                            });
                    } else {
                        console.error('[Checkbox Click Fix] Task ID not found on task item');
                    }
                }
            }
        }
    }, true); // Use capture phase to ensure this runs before other handlers

    // Function to update task completion status in the database
    async function updateTaskCompletionInDatabase(taskId, isComplete) {
        console.log(`[Checkbox Click Fix] Updating task ${taskId} completion status to ${isComplete} in database`);

        try {
            const response = await fetch(`/api/tasks/${taskId}/toggle-completion`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_complete: isComplete })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const updatedTask = await response.json();
            console.log('[Checkbox Click Fix] Task updated in database:', updatedTask);
            return updatedTask;
        } catch (error) {
            console.error('[Checkbox Click Fix] Error updating task in database:', error);
            throw error;
        }
    }

    // Function to handle immediate task completion UI update
    function handleImmediateTaskCompletion(taskItem) {
        // Get the completed tasks container
        const completedTaskListDiv = document.getElementById('completedTaskList');
        if (!completedTaskListDiv) return;

        console.log('[Checkbox Click Fix] Moving task to completed section immediately');

        // Add complete class to the task item
        taskItem.classList.add('complete');

        // Clone the task item to avoid any event handler issues
        const taskItemClone = taskItem.cloneNode(true);

        // Remove the original task item from its current location
        taskItem.style.opacity = '0';
        taskItem.style.transition = 'opacity 0.3s';

        // After a brief transition, move the task
        setTimeout(() => {
            // Remove the original task from the DOM
            if (taskItem.parentNode) {
                taskItem.parentNode.removeChild(taskItem);
            }

            // Add the cloned task to the completed section
            completedTaskListDiv.appendChild(taskItemClone);

            // Keep the completed section hidden by default
            // completedTaskListDiv.style.display = 'block';

            // Update the completed tasks count in the header
            const completedCount = completedTaskListDiv.querySelectorAll('.task-item').length;
            updateCompletedTaskHeader(completedCount);

            console.log('[Checkbox Click Fix] Task moved to completed section');
        }, 300);
    }

    // Function to handle immediate task uncompletion UI update
    function handleImmediateTaskUncompletion(taskItem) {
        // Get the active tasks container
        const activeTaskListDiv = document.getElementById('taskList');
        if (!activeTaskListDiv) return;

        console.log('[Checkbox Click Fix] Moving task back to active section immediately');

        // Remove complete class from the task item
        taskItem.classList.remove('complete');

        // Clone the task item to avoid any event handler issues
        const taskItemClone = taskItem.cloneNode(true);

        // Remove the original task item from its current location
        taskItem.style.opacity = '0';
        taskItem.style.transition = 'opacity 0.3s';

        // After a brief transition, move the task
        setTimeout(() => {
            // Remove the original task from the DOM
            if (taskItem.parentNode) {
                taskItem.parentNode.removeChild(taskItem);
            }

            // Add the cloned task to the active section
            activeTaskListDiv.appendChild(taskItemClone);

            // Update the completed tasks count in the header
            const completedTaskListDiv = document.getElementById('completedTaskList');
            if (completedTaskListDiv) {
                const completedCount = completedTaskListDiv.querySelectorAll('.task-item').length;
                updateCompletedTaskHeader(completedCount);
            }

            console.log('[Checkbox Click Fix] Task moved back to active section');
        }, 300);
    }

    // Helper function to update the completed tasks header count
    function updateCompletedTaskHeader(count) {
        const completedTasksHeader = document.querySelector('#completedTasksHeader');
        if (completedTasksHeader) {
            completedTasksHeader.textContent = `Completed Tasks (${count}) ▴`;
        }
    }

    // Apply specific handling to all checkboxes
    function applyCheckboxClickFix() {
        // Get all task checkboxes
        const checkboxes = document.querySelectorAll('.task-item input[type="checkbox"]');

        // For each checkbox, ensure it has the correct event handler
        checkboxes.forEach(checkbox => {
            // Remove any existing click event listeners (to avoid duplicates)
            const newCheckbox = checkbox.cloneNode(true);
            checkbox.parentNode.replaceChild(newCheckbox, checkbox);

            // Add click event to stop propagation
            newCheckbox.addEventListener('click', function(event) {
                event.stopPropagation();
                console.log('[Checkbox Click Fix] Checkbox clicked directly, preventing modal from opening');

                // Handle task movement based on checkbox state
                const taskItem = newCheckbox.closest('.task-item');
                if (taskItem) {
                    const taskId = taskItem.getAttribute('data-task-id');
                    const isComplete = newCheckbox.checked;

                    if (taskId) {
                        // Update the database first
                        updateTaskCompletionInDatabase(taskId, isComplete)
                            .then(() => {
                                // Then update the UI
                                if (isComplete && !taskItem.classList.contains('complete')) {
                                    // Task is being marked as complete
                                    handleImmediateTaskCompletion(taskItem);
                                } else if (!isComplete && taskItem.classList.contains('complete')) {
                                    // Task is being marked as incomplete
                                    handleImmediateTaskUncompletion(taskItem);
                                }
                            })
                            .catch(error => {
                                console.error('[Checkbox Click Fix] Error updating task completion status:', error);
                                // Revert the checkbox state if there was an error
                                newCheckbox.checked = !isComplete;
                                alert('Failed to update task status. Please try again.');
                            });
                    } else {
                        console.error('[Checkbox Click Fix] Task ID not found on task item');
                    }
                }
            });

            // Make sure the checkbox container also stops propagation
            const container = newCheckbox.closest('.task-checkbox-container');
            if (container) {
                container.addEventListener('click', function(event) {
                    event.stopPropagation();
                    console.log('[Checkbox Click Fix] Checkbox container clicked, preventing modal from opening');
                });
            }
        });
    }

    // Apply the fix initially
    applyCheckboxClickFix();

    // We'll use a debounced version of the observer to avoid too many calls
    let debounceTimer;

    // Re-apply the fix when tasks are loaded or rendered
    document.addEventListener('tasksLoaded', function() {
        console.log('[Checkbox Click Fix] Tasks loaded, re-applying fix');
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(applyCheckboxClickFix, 300);
    });

    document.addEventListener('tasksRendered', function() {
        console.log('[Checkbox Click Fix] Tasks rendered, re-applying fix');
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(applyCheckboxClickFix, 300);
    });

    // Also apply the fix when the DOM changes (for dynamically added tasks)
    const observer = new MutationObserver(function(mutations) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(applyCheckboxClickFix, 300);
    });

    // Observe the task list for changes
    const taskList = document.getElementById('taskList');
    if (taskList) {
        observer.observe(taskList, { childList: true, subtree: true });
    }

    // Also observe the completed task list
    const completedTaskList = document.getElementById('completedTaskList');
    if (completedTaskList) {
        observer.observe(completedTaskList, { childList: true, subtree: true });
    }

    console.log('[Checkbox Click Fix] Initialized with improved event delegation and immediate task movement');
});
