/**
 * Expand Button Fix
 * This script fixes the issue with expand buttons in tasks with subtasks
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('[Expand Button Fix] Initializing...');

    // Function to apply the fix to all expand buttons
    function fixExpandButtons() {
        // Find all expand buttons
        const expandButtons = document.querySelectorAll('.expand-subtasks-btn');

        console.log(`[Expand Button Fix] Found ${expandButtons.length} expand buttons`);

        // Add event listeners to each expand button
        expandButtons.forEach(button => {
            // Remove existing click event listeners
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);

            // Add new click event listener
            newButton.addEventListener('click', (event) => {
                event.stopPropagation();
                event.preventDefault();

                // Get the task ID from the button's data attribute
                const taskId = newButton.getAttribute('data-task-id');

                // Get the parent task element
                const taskElement = newButton.closest('.task-item');

                console.log(`[Expand Button Fix] Expand button clicked for task ${taskId}`);

                // Call loadSubtasks with the task ID and parent element
                if (typeof window.loadSubtasks === 'function') {
                    window.loadSubtasks(taskId, taskElement);
                } else {
                    console.error('[Expand Button Fix] loadSubtasks function not found');
                }

                // Return false to prevent the event from propagating
                return false;
            });

            console.log(`[Expand Button Fix] Fixed expand button for task ${newButton.getAttribute('data-task-id')}`);
        });

        // Also fix the expand button containers
        const expandButtonContainers = document.querySelectorAll('.expand-button-container');

        console.log(`[Expand Button Fix] Found ${expandButtonContainers.length} expand button containers`);

        // Add event listeners to each expand button container
        expandButtonContainers.forEach(container => {
            // Remove existing click event listeners
            const newContainer = container.cloneNode(true);
            container.parentNode.replaceChild(newContainer, container);

            // Add new click event listener
            newContainer.addEventListener('click', (event) => {
                event.stopPropagation();
                event.preventDefault();

                // Get the expand button inside the container
                const expandButton = newContainer.querySelector('.expand-subtasks-btn');

                if (expandButton) {
                    // Get the task ID from the button's data attribute
                    const taskId = expandButton.getAttribute('data-task-id');

                    // Get the parent task element
                    const taskElement = newContainer.closest('.task-item');

                    console.log(`[Expand Button Fix] Expand button container clicked for task ${taskId}`);

                    // Call loadSubtasks with the task ID and parent element
                    if (typeof window.loadSubtasks === 'function') {
                        window.loadSubtasks(parseInt(taskId), taskElement);
                    } else {
                        console.error('[Expand Button Fix] loadSubtasks function not found');
                    }
                }

                // Return false to prevent the event from propagating
                return false;
            });

            console.log(`[Expand Button Fix] Fixed expand button container`);
        });
    }

    // Apply the fix when tasks are loaded
    document.addEventListener('tasksLoaded', () => {
        console.log('[Expand Button Fix] Tasks loaded, applying fix');
        setTimeout(fixExpandButtons, 500); // Wait for the DOM to be updated
    });

    // Apply the fix when tasks are rendered
    document.addEventListener('tasksRendered', () => {
        console.log('[Expand Button Fix] Tasks rendered, applying fix');
        setTimeout(fixExpandButtons, 500); // Wait for the DOM to be updated
    });

    // Apply the fix immediately in case the events have already fired
    setTimeout(fixExpandButtons, 1000);

    console.log('[Expand Button Fix] Initialized');
});
