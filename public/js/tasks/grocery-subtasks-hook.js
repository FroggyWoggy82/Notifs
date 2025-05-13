/**
 * Grocery Subtasks Hook
 * This file hooks into the existing expand buttons to display grocery list subtasks
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('[HOOK] Grocery subtasks hook loaded');

    // Wait for tasks to be loaded
    setTimeout(initializeGrocerySubtasksHook, 1000);

    // Listen for tasks loaded event
    document.addEventListener('tasksLoaded', initializeGrocerySubtasksHook);
    document.addEventListener('tasksRendered', initializeGrocerySubtasksHook);
});

/**
 * Initialize grocery subtasks hook
 */
function initializeGrocerySubtasksHook() {
    console.log('[HOOK] Initializing grocery subtasks hook');

    // Find all grocery list tasks
    const groceryTasks = Array.from(document.querySelectorAll('.task-item')).filter(task => {
        const title = task.querySelector('.task-title');
        return title && title.textContent.includes('Grocery List');
    });

    console.log(`[HOOK] Found ${groceryTasks.length} grocery list tasks`);

    // Process each grocery task
    groceryTasks.forEach(task => {
        const taskId = task.getAttribute('data-task-id');
        console.log(`[HOOK] Processing grocery task ${taskId}`);

        // Find the existing expand button
        const expandButton = task.querySelector('.expand-subtasks-btn');

        if (expandButton) {
            console.log(`[HOOK] Found expand button for task ${taskId}`);

            // Remove any existing event listeners
            const newExpandButton = expandButton.cloneNode(true);
            expandButton.parentNode.replaceChild(newExpandButton, expandButton);

            // Add new event listener
            newExpandButton.addEventListener('click', (event) => {
                event.stopPropagation();
                event.preventDefault();
                console.log(`[HOOK] Expand button clicked for task ${taskId}`);
                toggleGrocerySubtasks(taskId, task);
                return false;
            });
        } else {
            console.log(`[HOOK] No expand button found for task ${taskId}`);
        }
    });
}

/**
 * Toggle grocery subtasks visibility
 * @param {number} taskId - The task ID
 * @param {HTMLElement} parentElement - The parent task element
 */
function toggleGrocerySubtasks(taskId, parentElement) {
    console.log(`[HOOK] Toggling grocery subtasks for task ${taskId}`);

    // Find or create the subtasks container
    let subtasksContainer = document.querySelector(`.hook-subtasks-container[data-parent-id="${taskId}"]`);

    if (!subtasksContainer) {
        console.log(`[HOOK] Creating subtasks container for task ${taskId}`);
        subtasksContainer = document.createElement('div');
        subtasksContainer.className = 'hook-subtasks-container subtasks-container';
        subtasksContainer.setAttribute('data-parent-id', taskId);

        // Style the container
        subtasksContainer.style.width = 'calc(100% - 20px)';
        subtasksContainer.style.marginLeft = '20px';
        subtasksContainer.style.marginTop = '10px';
        subtasksContainer.style.marginBottom = '10px';
        subtasksContainer.style.paddingLeft = '10px';
        subtasksContainer.style.borderLeft = '3px solid #4CAF50';
        subtasksContainer.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
        subtasksContainer.style.borderRadius = '4px';
        subtasksContainer.style.position = 'relative';
        subtasksContainer.style.zIndex = '1000';

        // Insert after the parent element
        parentElement.parentNode.insertBefore(subtasksContainer, parentElement.nextSibling);

        // Generate grocery subtasks
        generateGrocerySubtasksUI(taskId, subtasksContainer);
    }

    // Toggle visibility
    const isVisible = window.getComputedStyle(subtasksContainer).display !== 'none';

    if (!isVisible) {
        console.log(`[HOOK] Showing subtasks for task ${taskId}`);
        subtasksContainer.style.display = 'block';

        // Update the expand button icon
        const expandButtonIcon = parentElement.querySelector('.expand-subtasks-btn i');
        if (expandButtonIcon) {
            expandButtonIcon.className = 'fas fa-chevron-up';
        }
    } else {
        console.log(`[HOOK] Hiding subtasks for task ${taskId}`);
        subtasksContainer.style.display = 'none';

        // Update the expand button icon
        const expandButtonIcon = parentElement.querySelector('.expand-subtasks-btn i');
        if (expandButtonIcon) {
            expandButtonIcon.className = 'fas fa-chevron-down';
        }
    }
}

/**
 * Generate grocery subtasks UI
 * @param {number} taskId - The task ID
 * @param {HTMLElement} container - The container element
 */
function generateGrocerySubtasksUI(taskId, container) {
    console.log(`[HOOK] Generating grocery subtasks UI for task ${taskId}`);

    // Mock grocery data
    const groceryItems = [
        { name: 'Chicken Breast', amount: 200, packages: 1, price: 5.99 },
        { name: 'Brown Rice', amount: 150, packages: 1, price: 2.49 },
        { name: 'Broccoli', amount: 100, packages: 1, price: 1.99 },
        { name: 'Olive Oil', amount: 15, packages: 1, price: 8.99 },
        { name: 'Spinach', amount: 50, packages: 1, price: 3.49 }
    ];

    // Create a header
    const header = document.createElement('div');
    header.className = 'grocery-subtasks-header';
    header.textContent = 'Grocery Items';
    header.style.fontWeight = 'bold';
    header.style.marginBottom = '10px';
    header.style.color = '#4CAF50';
    header.style.padding = '5px';
    container.appendChild(header);

    // Create subtasks for each grocery item
    groceryItems.forEach((item, index) => {
        const subtaskElement = document.createElement('div');
        subtaskElement.className = 'grocery-subtask-item subtask-item';
        subtaskElement.style.display = 'flex';
        subtaskElement.style.alignItems = 'center';
        subtaskElement.style.marginBottom = '8px';
        subtaskElement.style.padding = '8px';
        subtaskElement.style.backgroundColor = 'rgba(25, 35, 25, 0.8)';
        subtaskElement.style.borderRadius = '4px';
        subtaskElement.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.2)';

        // Create checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'grocery-subtask-checkbox subtask-checkbox';
        checkbox.style.marginRight = '10px';
        checkbox.style.width = '18px';
        checkbox.style.height = '18px';

        // Add event listener to the checkbox
        checkbox.addEventListener('change', (event) => {
            if (event.target.checked) {
                subtaskElement.style.backgroundColor = 'rgba(15, 25, 15, 0.6)';
                subtaskElement.style.textDecoration = 'line-through';
                subtaskElement.style.color = '#aaa';
            } else {
                subtaskElement.style.backgroundColor = 'rgba(25, 35, 25, 0.8)';
                subtaskElement.style.textDecoration = 'none';
                subtaskElement.style.color = '#fff';
            }
        });

        // Create title
        const title = document.createElement('span');
        title.className = 'grocery-subtask-title subtask-title';
        title.textContent = `${item.name} - ${item.amount}g - ${item.packages} package - $${item.price}`;
        title.style.color = '#ffffff';
        title.style.flex = '1';

        // Add elements to the subtask element
        subtaskElement.appendChild(checkbox);
        subtaskElement.appendChild(title);

        // Add the subtask to the container
        container.appendChild(subtaskElement);
    });
}

// Add a global event listener to catch all clicks on expand buttons
document.addEventListener('click', function(event) {
    // Check if the clicked element is an expand button or its child
    const expandButton = event.target.closest('.expand-subtasks-btn');

    if (expandButton) {
        // Find the parent task element
        const taskElement = expandButton.closest('.task-item');

        if (taskElement) {
            const taskId = taskElement.getAttribute('data-task-id');
            const taskTitle = taskElement.querySelector('.task-title');

            // Check if this is a grocery list task
            if (taskTitle && taskTitle.textContent.includes('Grocery List')) {
                console.log(`[HOOK] Global handler caught expand button click for grocery list task ${taskId}`);

                // Prevent the default action
                event.preventDefault();
                event.stopPropagation();

                // Toggle grocery subtasks
                toggleGrocerySubtasks(taskId, taskElement);

                return false;
            }
        }
    }
}, true);
