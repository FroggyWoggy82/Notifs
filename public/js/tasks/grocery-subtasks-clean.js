/**
 * Grocery Subtasks Clean Implementation
 * This file provides a clean implementation for grocery list subtasks
 * that doesn't conflict with any existing code
 */

// Create a global variable to track our subtasks containers
window.grocerySubtasksContainers = {};

// Debounce function to limit how often a function can be called
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('[CLEAN] Grocery subtasks clean implementation loaded');

    // Override the global click handler to capture all clicks
    setupGlobalClickHandler();

    // Add our clean implementation
    setTimeout(initializeGrocerySubtasks, 1000);

    // Listen for tasks loaded event
    document.addEventListener('tasksLoaded', debounce(() => {
        setupGlobalClickHandler();
        initializeGrocerySubtasks();
    }, 500));

    document.addEventListener('tasksRendered', debounce(() => {
        setupGlobalClickHandler();
        initializeGrocerySubtasks();
    }, 500));

    // Add a click event listener to the document
    document.addEventListener('click', (event) => {
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
                    console.log(`[CLEAN] Direct click handler caught expand button click for grocery list task ${taskId}`);

                    // Prevent the default action and stop propagation
                    event.preventDefault();
                    event.stopPropagation();

                    // Toggle grocery subtasks
                    toggleGrocerySubtasks(taskId, taskElement);

                    return false;
                }
            }
        }
    });
});

/**
 * Set up a global click handler to capture all clicks
 */
function setupGlobalClickHandler() {
    // Remove any existing handler
    document.removeEventListener('click', globalClickHandler, true);

    // Add our handler
    document.addEventListener('click', globalClickHandler, true);
}

/**
 * Global click handler to intercept clicks on expand buttons
 */
function globalClickHandler(event) {
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
                console.log(`[CLEAN] Global handler caught expand button click for grocery list task ${taskId}`);

                // Prevent the default action and stop propagation
                event.preventDefault();
                event.stopPropagation();

                // Toggle grocery subtasks
                toggleGrocerySubtasks(taskId, taskElement);

                return false;
            }
        }
    }
}

/**
 * Initialize grocery subtasks
 */
function initializeGrocerySubtasks() {
    console.log('[CLEAN] Initializing grocery subtasks');

    // Find all grocery list tasks
    const groceryTasks = Array.from(document.querySelectorAll('.task-item')).filter(task => {
        const title = task.querySelector('.task-title');
        return title && title.textContent.includes('Grocery List');
    });

    console.log(`[CLEAN] Found ${groceryTasks.length} grocery list tasks`);

    // Process each grocery task
    groceryTasks.forEach(task => {
        const taskId = task.getAttribute('data-task-id');
        console.log(`[CLEAN] Processing grocery task ${taskId}`);

        // Add has-subtasks class
        task.classList.add('has-subtasks');

        // Make sure the task has an expand button
        ensureExpandButton(taskId, task);
    });
}

/**
 * Ensure the task has an expand button
 * @param {string} taskId - The task ID
 * @param {HTMLElement} taskElement - The task element
 */
function ensureExpandButton(taskId, taskElement) {
    // Check if the task already has an expand button
    let expandButton = taskElement.querySelector('.expand-subtasks-btn');

    if (!expandButton) {
        console.log(`[CLEAN] Creating expand button for task ${taskId}`);

        // Create expand button container
        const expandButtonContainer = document.createElement('div');
        expandButtonContainer.className = 'expand-button-container';
        expandButtonContainer.style.position = 'absolute';
        expandButtonContainer.style.left = '0';
        expandButtonContainer.style.top = '0';
        expandButtonContainer.style.bottom = '0';
        expandButtonContainer.style.width = '30px';
        expandButtonContainer.style.display = 'flex';
        expandButtonContainer.style.alignItems = 'center';
        expandButtonContainer.style.justifyContent = 'center';
        expandButtonContainer.style.zIndex = '999';

        // Create expand button
        expandButton = document.createElement('button');
        expandButton.className = 'expand-subtasks-btn';
        expandButton.title = 'Show/hide grocery items';
        expandButton.innerHTML = '<i class="fas fa-chevron-down"></i>';
        expandButton.style.position = 'relative';
        expandButton.style.zIndex = '1000';
        expandButton.style.display = 'flex';
        expandButton.style.alignItems = 'center';
        expandButton.style.justifyContent = 'center';
        expandButton.style.width = '24px';
        expandButton.style.height = '24px';
        expandButton.style.background = 'transparent';
        expandButton.style.border = 'none';
        expandButton.style.color = '#ffffff';
        expandButton.style.cursor = 'pointer';

        // Add expand button to container
        expandButtonContainer.appendChild(expandButton);

        // Add container to task
        taskElement.style.position = 'relative';
        taskElement.appendChild(expandButtonContainer);
    } else {
        console.log(`[CLEAN] Found existing expand button for task ${taskId}`);
    }
}

/**
 * Toggle grocery subtasks visibility
 * @param {number} taskId - The task ID
 * @param {HTMLElement} parentElement - The parent task element
 */
function toggleGrocerySubtasks(taskId, parentElement) {
    console.log(`[CLEAN] Toggling grocery subtasks for task ${taskId}`);

    // Remove any existing subtasks containers for this task
    const existingContainers = document.querySelectorAll(`.subtasks-container[data-parent-id="${taskId}"], .clean-subtasks-container[data-parent-id="${taskId}"]`);
    const expandButtonIcon = parentElement.querySelector('.expand-subtasks-btn i');

    // Check if we have any existing containers
    if (existingContainers.length > 0) {
        // Get the first container
        const firstContainer = existingContainers[0];
        const isVisible = window.getComputedStyle(firstContainer).display !== 'none';

        // Remove all containers
        existingContainers.forEach(container => {
            container.remove();
        });

        // If the container was visible, we want to hide it
        if (isVisible) {
            console.log(`[CLEAN] Hiding subtasks for task ${taskId}`);

            // Update the expand button icon
            if (expandButtonIcon) {
                expandButtonIcon.className = 'fas fa-chevron-down';
            }

            // Update our tracking
            window.grocerySubtasksContainers[taskId] = {
                isVisible: false
            };

            return;
        }
    }

    // If we get here, we need to create a new container
    console.log(`[CLEAN] Creating new subtasks container for task ${taskId}`);

    // Create a new subtasks container
    const subtasksContainer = document.createElement('div');
    subtasksContainer.className = 'clean-subtasks-container subtasks-container';
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
    subtasksContainer.style.display = 'block';

    // Insert after the parent element
    parentElement.parentNode.insertBefore(subtasksContainer, parentElement.nextSibling);

    // Generate grocery subtasks
    generateGrocerySubtasksUI(taskId, subtasksContainer);

    // Update the expand button icon
    if (expandButtonIcon) {
        expandButtonIcon.className = 'fas fa-chevron-up';
    }

    // Store the container in our global variable
    window.grocerySubtasksContainers[taskId] = {
        container: subtasksContainer,
        isVisible: true
    };
}

/**
 * Generate grocery subtasks UI
 * @param {number} taskId - The task ID
 * @param {HTMLElement} container - The container element
 */
function generateGrocerySubtasksUI(taskId, container) {
    console.log(`[CLEAN] Generating grocery subtasks UI for task ${taskId}`);

    // Clear the container
    container.innerHTML = '';

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

    // Add a debug message
    const debugMessage = document.createElement('div');
    debugMessage.className = 'grocery-subtasks-debug';
    debugMessage.textContent = `Grocery subtasks for task ${taskId} generated at ${new Date().toLocaleTimeString()}`;
    debugMessage.style.fontSize = '0.8em';
    debugMessage.style.color = '#888';
    debugMessage.style.marginTop = '10px';
    debugMessage.style.padding = '5px';
    container.appendChild(debugMessage);

    // Force the container to be visible
    setTimeout(() => {
        container.style.display = 'block';

        // Add inline styles to each subtask element to ensure they're visible
        container.querySelectorAll('.grocery-subtask-item').forEach(item => {
            item.style.display = 'flex';
            item.style.visibility = 'visible';
            item.style.opacity = '1';
        });
    }, 100);
}
