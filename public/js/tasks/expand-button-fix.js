/**
 * Expand Button Fix
 * This script fixes the issue with expand buttons in tasks with subtasks
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('[Expand Button Fix] Initializing...');

    // Function to check if a task has subtasks
    function hasSubtasks(task) {
        return task && (
            task.has_subtasks === true ||
            task.has_subtasks === 'true' ||
            task.is_grocery_list === true ||
            task.is_grocery_list === 'true' ||
            (task.title && (
                task.title.startsWith('Grocery List -') ||
                task.title.startsWith('Grocery List (') ||
                task.title.includes('Grocery List')
            ))
        );
    }

    // Function to enhance task elements with subtasks
    function enhanceTaskElements() {
        // Find all task items
        const taskItems = document.querySelectorAll('.task-item');

        console.log(`[Expand Button Fix] Found ${taskItems.length} task items to enhance`);

        // Enhance each task item
        taskItems.forEach(taskItem => {
            // Get the task ID
            const taskId = taskItem.getAttribute('data-task-id');

            if (!taskId) {
                console.log('[Expand Button Fix] Task item has no data-task-id attribute, skipping');
                return;
            }

            // Check if this task item has subtasks
            if (taskItem.classList.contains('has-subtasks')) {
                console.log(`[Expand Button Fix] Enhancing task ${taskId} with subtasks`);

                // Check if the expand button already exists
                let expandButton = taskItem.querySelector('.expand-subtasks-btn');
                let expandButtonContainer = taskItem.querySelector('.expand-button-container');

                // If the expand button doesn't exist, create it
                if (!expandButton) {
                    // Create expand button
                    expandButton = document.createElement('button');
                    expandButton.className = 'expand-subtasks-btn';
                    expandButton.innerHTML = '<i class="fas fa-chevron-down"></i>';
                    expandButton.title = 'Show/hide subtasks';
                    expandButton.setAttribute('data-task-id', taskId);
                    expandButton.setAttribute('data-expand-button', 'true');

                    // Create a separate container for the expand button
                    expandButtonContainer = document.createElement('div');
                    expandButtonContainer.className = 'expand-button-container';
                    expandButtonContainer.appendChild(expandButton);

                    // Insert the expand button container at the beginning of the task element
                    if (taskItem.firstChild) {
                        taskItem.insertBefore(expandButtonContainer, taskItem.firstChild);
                    } else {
                        taskItem.appendChild(expandButtonContainer);
                    }

                    console.log(`[Expand Button Fix] Added expand button to task ${taskId}`);
                } else {
                    console.log(`[Expand Button Fix] Expand button already exists for task ${taskId}`);
                }

                // Make sure the expand button is visible
                if (expandButton) {
                    expandButton.style.display = 'flex';
                }
                if (expandButtonContainer) {
                    expandButtonContainer.style.display = 'flex';
                }

                // Add a visual indicator to show that this task has subtasks
                let subtaskIndicator = taskItem.querySelector('.subtask-indicator');
                if (!subtaskIndicator) {
                    subtaskIndicator = document.createElement('span');
                    subtaskIndicator.className = 'subtask-indicator';
                    subtaskIndicator.textContent = 'Has subtasks';

                    // Add the indicator to the task content
                    const taskContent = taskItem.querySelector('.task-content');
                    if (taskContent) {
                        const metadataDiv = taskContent.querySelector('.task-metadata') || document.createElement('div');
                        if (!taskContent.contains(metadataDiv)) {
                            metadataDiv.className = 'task-metadata';
                            taskContent.appendChild(metadataDiv);
                        }

                        // Add the indicator to the metadata div
                        if (!metadataDiv.querySelector('.subtask-indicator')) {
                            metadataDiv.appendChild(subtaskIndicator);
                        }
                    }
                }
            }
        });
    }

    // Function to apply the fix to all expand buttons
    function fixExpandButtons() {
        // Find all expand buttons
        const expandButtons = document.querySelectorAll('.expand-subtasks-btn');

        console.log(`[Expand Button Fix] Found ${expandButtons.length} expand buttons`);

        // Add event listeners to each expand button
        expandButtons.forEach(button => {
            // Get the task ID from the button's data attribute
            const taskId = button.getAttribute('data-task-id');
            if (!taskId) return;

            // Get the parent task element
            const taskElement = button.closest('.task-item');
            if (!taskElement) return;

            // Check if this is a grocery list task
            // First check for the data-grocery-list attribute
            const isGroceryListByAttr = button.getAttribute('data-grocery-list') === 'true';

            // If not found by attribute, check the title
            const isGroceryListByTitle = !isGroceryListByAttr && (() => {
                const taskTitle = taskElement.querySelector('.task-title')?.textContent;
                return taskTitle && (
                    taskTitle.startsWith('Grocery List -') ||
                    taskTitle.startsWith('Grocery List (') ||
                    taskTitle.includes('Grocery List')
                );
            })();

            const isGroceryList = isGroceryListByAttr || isGroceryListByTitle;

            // Handle grocery list tasks directly if toggleGrocerySubtasks is available
            if (isGroceryList && typeof window.toggleGrocerySubtasks === 'function') {
                console.log(`[Expand Button Fix] Handling grocery list task ${taskId} directly`);

                // Add a click handler that calls toggleGrocerySubtasks
                button.setAttribute('data-expand-button', 'true');
                button.setAttribute('data-grocery-list', 'true');

                button.addEventListener('click', function(event) {
                    event.stopPropagation();
                    event.preventDefault();

                    console.log(`[Expand Button Fix] Grocery list expand button clicked for task ${taskId}`);
                    window.toggleGrocerySubtasks(parseInt(taskId), taskElement, event);

                    return false;
                });

                console.log(`[Expand Button Fix] Added grocery list click handler to expand button for task ${taskId}`);
                return;
            }

            // Only fix non-grocery list tasks
            // Check if the button already has our data attribute to avoid duplicate handlers
            if (button.getAttribute('data-expand-button-fixed') !== 'true') {
                // Mark the button as fixed
                button.setAttribute('data-expand-button-fixed', 'true');

                // Add click event listener
                button.addEventListener('click', (event) => {
                    event.stopPropagation();
                    event.preventDefault();

                    console.log(`[Expand Button Fix] Expand button clicked for task ${taskId}`);

                    if (typeof window.loadSubtasks === 'function') {
                        console.log(`[Expand Button Fix] Calling loadSubtasks for regular task ${taskId}`);
                        window.loadSubtasks(parseInt(taskId), taskElement);
                    } else {
                        console.error('[Expand Button Fix] loadSubtasks function not found');
                    }

                    // Return false to prevent the event from propagating
                    return false;
                });

                console.log(`[Expand Button Fix] Fixed expand button for task ${taskId}`);
            }
        });

        // Also fix the expand button containers
        const expandButtonContainers = document.querySelectorAll('.expand-button-container');

        console.log(`[Expand Button Fix] Found ${expandButtonContainers.length} expand button containers`);

        // Add event listeners to each expand button container
        expandButtonContainers.forEach(container => {
            // Get the expand button inside the container
            const expandButton = container.querySelector('.expand-subtasks-btn');
            if (!expandButton) return;

            // Get the task ID from the button's data attribute
            const taskId = expandButton.getAttribute('data-task-id');
            if (!taskId) return;

            // Get the parent task element
            const taskElement = container.closest('.task-item');
            if (!taskElement) return;

            // Check if this is a grocery list task
            // First check for the data-grocery-list attribute
            const isGroceryListByAttr = expandButton.getAttribute('data-grocery-list') === 'true' ||
                                       container.getAttribute('data-grocery-list') === 'true';

            // If not found by attribute, check the title
            const isGroceryListByTitle = !isGroceryListByAttr && (() => {
                const taskTitle = taskElement.querySelector('.task-title')?.textContent;
                return taskTitle && (
                    taskTitle.startsWith('Grocery List -') ||
                    taskTitle.startsWith('Grocery List (') ||
                    taskTitle.includes('Grocery List')
                );
            })();

            const isGroceryList = isGroceryListByAttr || isGroceryListByTitle;

            // Handle grocery list tasks directly if toggleGrocerySubtasks is available
            if (isGroceryList && typeof window.toggleGrocerySubtasks === 'function') {
                console.log(`[Expand Button Fix] Handling grocery list task container ${taskId} directly`);

                // Add a click handler that calls toggleGrocerySubtasks
                container.setAttribute('data-expand-button-container', 'true');
                container.setAttribute('data-grocery-list', 'true');

                container.addEventListener('click', function(event) {
                    event.stopPropagation();
                    event.preventDefault();

                    console.log(`[Expand Button Fix] Grocery list expand button container clicked for task ${taskId}`);
                    window.toggleGrocerySubtasks(parseInt(taskId), taskElement, event);

                    return false;
                });

                console.log(`[Expand Button Fix] Added grocery list click handler to expand button container for task ${taskId}`);
                return;
            }

            // Only fix non-grocery list tasks
            // Check if the container already has our data attribute to avoid duplicate handlers
            if (container.getAttribute('data-expand-button-container-fixed') !== 'true') {
                // Mark the container as fixed
                container.setAttribute('data-expand-button-container-fixed', 'true');

                // Add click event listener
                container.addEventListener('click', (event) => {
                    event.stopPropagation();
                    event.preventDefault();

                    console.log(`[Expand Button Fix] Expand button container clicked for task ${taskId}`);

                    if (typeof window.loadSubtasks === 'function') {
                        console.log(`[Expand Button Fix] Calling loadSubtasks for regular task ${taskId}`);
                        window.loadSubtasks(parseInt(taskId), taskElement);
                    } else {
                        console.error('[Expand Button Fix] loadSubtasks function not found');
                    }

                    // Return false to prevent the event from propagating
                    return false;
                });

                console.log(`[Expand Button Fix] Fixed expand button container for task ${taskId}`);
            }
        });
    }

    // Function to fix task item click handlers
    function fixTaskItemClickHandlers() {
        // Find all task items
        const taskItems = document.querySelectorAll('.task-item');

        console.log(`[Expand Button Fix] Found ${taskItems.length} task items to fix click handlers`);

        // Add event listeners to each task item
        taskItems.forEach(taskItem => {
            // Check if this task item has subtasks
            if (taskItem.classList.contains('has-subtasks')) {
                // Get the task ID
                const taskId = taskItem.getAttribute('data-task-id');
                if (!taskId) return;

                // Check if this is a grocery list task
                // First check for the data-grocery-list attribute on the task or expand button
                const expandButton = taskItem.querySelector('.expand-subtasks-btn');
                const expandButtonContainer = taskItem.querySelector('.expand-button-container');

                const isGroceryListByAttr =
                    (expandButton && expandButton.getAttribute('data-grocery-list') === 'true') ||
                    (expandButtonContainer && expandButtonContainer.getAttribute('data-grocery-list') === 'true') ||
                    taskItem.getAttribute('data-grocery-list') === 'true';

                // If not found by attribute, check the title
                const isGroceryListByTitle = !isGroceryListByAttr && (() => {
                    const taskTitle = taskItem.querySelector('.task-title')?.textContent;
                    return taskTitle && (
                        taskTitle.startsWith('Grocery List -') ||
                        taskTitle.startsWith('Grocery List (') ||
                        taskTitle.includes('Grocery List')
                    );
                })();

                const isGroceryList = isGroceryListByAttr || isGroceryListByTitle;

                // Handle grocery list tasks directly if toggleGrocerySubtasks is available
                if (isGroceryList && typeof window.toggleGrocerySubtasks === 'function') {
                    console.log(`[Expand Button Fix] Handling grocery list task ${taskId} directly in task item fix`);

                    // Add a click handler that calls toggleGrocerySubtasks
                    expandButton.setAttribute('data-expand-button', 'true');
                    expandButton.setAttribute('data-grocery-list', 'true');

                    expandButton.addEventListener('click', function(event) {
                        event.stopPropagation();
                        event.preventDefault();

                        console.log(`[Expand Button Fix] Grocery list expand button clicked for task ${taskId} (from task item fix)`);
                        window.toggleGrocerySubtasks(parseInt(taskId), taskItem, event);

                        return false;
                    });

                    console.log(`[Expand Button Fix] Added grocery list click handler to expand button for task ${taskId} (from task item fix)`);
                    return;
                }

                // We already got the expand button above
                if (!expandButton) return;

                // Only fix non-grocery list tasks
                // Check if the button already has our data attribute to avoid duplicate handlers
                if (expandButton.getAttribute('data-task-item-fixed') !== 'true') {
                    // Mark the button as fixed
                    expandButton.setAttribute('data-task-item-fixed', 'true');

                    // Make sure the expand button stops propagation
                    expandButton.addEventListener('click', (event) => {
                        event.stopPropagation();
                        event.preventDefault();

                        console.log(`[Expand Button Fix] Expand button clicked for task ${taskId} (from task item fix)`);

                        if (typeof window.loadSubtasks === 'function') {
                            console.log(`[Expand Button Fix] Calling loadSubtasks for regular task ${taskId}`);
                            window.loadSubtasks(parseInt(taskId), taskItem);
                        } else {
                            console.error('[Expand Button Fix] loadSubtasks function not found');
                        }

                        return false;
                    });

                    console.log(`[Expand Button Fix] Fixed expand button for task ${taskId} (from task item fix)`);
                }
            }
        });
    }

    // Function to apply all fixes
    function applyAllFixes() {
        enhanceTaskElements();
        fixExpandButtons();
        fixTaskItemClickHandlers();
    }

    // Apply the fix when tasks are loaded
    document.addEventListener('tasksLoaded', () => {
        console.log('[Expand Button Fix] Tasks loaded, applying fix');
        setTimeout(applyAllFixes, 500); // Wait for the DOM to be updated
    });

    // Apply the fix when tasks are rendered
    document.addEventListener('tasksRendered', () => {
        console.log('[Expand Button Fix] Tasks rendered, applying fix');
        setTimeout(applyAllFixes, 500); // Wait for the DOM to be updated
    });

    // Apply the fix immediately in case the events have already fired
    setTimeout(applyAllFixes, 1000);

    // Apply the fix only when needed, not periodically
    // This prevents conflicts with other scripts that might be handling the same elements
    // setInterval(applyAllFixes, 5000);

    // Add a global event listener for expand buttons
    document.addEventListener('click', (event) => {
        // Check if the click is on an expand button or inside an expand button container
        const expandButton = event.target.closest('.expand-subtasks-btn');
        const expandButtonContainer = event.target.closest('.expand-button-container');

        if (expandButton || expandButtonContainer) {
            // Get the task ID and element
            const button = expandButton || (expandButtonContainer && expandButtonContainer.querySelector('.expand-subtasks-btn'));
            if (!button) return false;

            const taskId = button.getAttribute('data-task-id');
            if (!taskId) return false;

            const taskElement = button.closest('.task-item');
            if (!taskElement) return false;

            // Check if this is a grocery list task
            // First check for the data-grocery-list attribute
            const isGroceryListByAttr = button.getAttribute('data-grocery-list') === 'true' ||
                                       (expandButtonContainer && expandButtonContainer.getAttribute('data-grocery-list') === 'true');

            // If not found by attribute, check the title
            const isGroceryListByTitle = !isGroceryListByAttr && (() => {
                const taskTitle = taskElement.querySelector('.task-title')?.textContent;
                return taskTitle && (
                    taskTitle.startsWith('Grocery List -') ||
                    taskTitle.startsWith('Grocery List (') ||
                    taskTitle.includes('Grocery List')
                );
            })();

            const isGroceryList = isGroceryListByAttr || isGroceryListByTitle;

            // Handle grocery list tasks directly if toggleGrocerySubtasks is available
            if (isGroceryList && typeof window.toggleGrocerySubtasks === 'function') {
                console.log(`[Expand Button Fix] Global handler: Handling grocery list task ${taskId} directly`);
                event.stopPropagation();
                event.preventDefault();

                // Call the grocery list subtasks function
                window.toggleGrocerySubtasks(parseInt(taskId), taskElement, event);
                return false;
            }

            // Only handle non-grocery list tasks
            event.stopPropagation();
            event.preventDefault();

            console.log(`[Expand Button Fix] Global event listener caught expand button click for task ${taskId}`);

            if (typeof window.loadSubtasks === 'function') {
                console.log(`[Expand Button Fix] Calling loadSubtasks for regular task ${taskId}`);
                window.loadSubtasks(parseInt(taskId), taskElement);
            } else {
                console.error('[Expand Button Fix] loadSubtasks function not found');
            }

            return false;
        }
    }, true); // Use capture phase to ensure this runs before other handlers

    console.log('[Expand Button Fix] Initialized');
});
