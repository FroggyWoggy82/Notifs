/**
 * Direct approach to grocery list subtasks
 * This file provides a direct implementation for displaying grocery list subtasks
 */

// Wait for the DOM to be loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DIRECT] Grocery subtasks direct implementation loaded');
    
    // Find all grocery list tasks and add expand buttons
    findAndEnhanceGroceryTasks();
    
    // Listen for tasks loaded event
    document.addEventListener('tasksLoaded', findAndEnhanceGroceryTasks);
    document.addEventListener('tasksRendered', findAndEnhanceGroceryTasks);
});

/**
 * Find all grocery list tasks and enhance them with expand buttons
 */
function findAndEnhanceGroceryTasks() {
    console.log('[DIRECT] Finding and enhancing grocery list tasks');
    
    // Find all grocery list tasks
    const groceryTasks = Array.from(document.querySelectorAll('.task-item')).filter(task => {
        const title = task.querySelector('.task-title');
        return title && title.textContent.includes('Grocery List');
    });
    
    console.log(`[DIRECT] Found ${groceryTasks.length} grocery list tasks`);
    
    // Enhance each grocery task
    groceryTasks.forEach(task => {
        enhanceGroceryTask(task);
    });
}

/**
 * Enhance a grocery task with expand button and subtasks functionality
 * @param {HTMLElement} taskElement - The task element
 */
function enhanceGroceryTask(taskElement) {
    const taskId = taskElement.getAttribute('data-task-id');
    console.log(`[DIRECT] Enhancing grocery task ${taskId}`);
    
    // Add has-subtasks class
    taskElement.classList.add('has-subtasks');
    
    // Find or create expand button
    let expandButton = taskElement.querySelector('.expand-subtasks-btn');
    if (!expandButton) {
        console.log(`[DIRECT] Creating expand button for task ${taskId}`);
        
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
        
        // Add click event listener
        expandButton.addEventListener('click', (event) => {
            event.stopPropagation();
            console.log(`[DIRECT] Expand button clicked for task ${taskId}`);
            toggleGrocerySubtasks(taskId, taskElement);
        });
        
        // Add expand button to container
        expandButtonContainer.appendChild(expandButton);
        
        // Add container to task
        taskElement.appendChild(expandButtonContainer);
    }
    
    // Add "Has subtasks" indicator if not present
    let subtasksIndicator = Array.from(taskElement.querySelectorAll('.task-meta')).find(meta => 
        meta.textContent.includes('Has subtasks')
    );
    
    if (!subtasksIndicator) {
        console.log(`[DIRECT] Adding "Has subtasks" indicator for task ${taskId}`);
        
        subtasksIndicator = document.createElement('div');
        subtasksIndicator.className = 'task-meta';
        subtasksIndicator.textContent = 'Has subtasks';
        subtasksIndicator.style.fontSize = '0.8em';
        subtasksIndicator.style.color = '#aaa';
        subtasksIndicator.style.marginTop = '5px';
        
        // Find a good place to insert it
        const taskActions = taskElement.querySelector('.task-actions');
        if (taskActions) {
            taskElement.insertBefore(subtasksIndicator, taskActions);
        } else {
            taskElement.appendChild(subtasksIndicator);
        }
    }
}

/**
 * Toggle grocery subtasks visibility
 * @param {number} taskId - The task ID
 * @param {HTMLElement} taskElement - The task element
 */
function toggleGrocerySubtasks(taskId, taskElement) {
    console.log(`[DIRECT] Toggling grocery subtasks for task ${taskId}`);
    
    // Find or create the subtasks container
    let subtasksContainer = document.querySelector(`.direct-subtasks-container[data-parent-id="${taskId}"]`);
    
    if (!subtasksContainer) {
        console.log(`[DIRECT] Creating subtasks container for task ${taskId}`);
        subtasksContainer = document.createElement('div');
        subtasksContainer.className = 'direct-subtasks-container';
        subtasksContainer.setAttribute('data-parent-id', taskId);
        
        // Style the container
        subtasksContainer.style.width = '100%';
        subtasksContainer.style.marginLeft = '20px';
        subtasksContainer.style.marginTop = '10px';
        subtasksContainer.style.marginBottom = '10px';
        subtasksContainer.style.paddingLeft = '10px';
        subtasksContainer.style.borderLeft = '3px solid #4CAF50';
        subtasksContainer.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
        subtasksContainer.style.borderRadius = '4px';
        subtasksContainer.style.display = 'none';
        
        // Insert after the task element
        taskElement.parentNode.insertBefore(subtasksContainer, taskElement.nextSibling);
        
        // Generate grocery subtasks
        generateGrocerySubtasksUI(taskId, subtasksContainer);
    }
    
    // Toggle visibility
    if (subtasksContainer.style.display === 'none') {
        console.log(`[DIRECT] Showing subtasks for task ${taskId}`);
        subtasksContainer.style.display = 'block';
        
        // Update the expand button icon
        const expandButton = taskElement.querySelector('.expand-subtasks-btn i');
        if (expandButton) {
            expandButton.className = 'fas fa-chevron-up';
        }
    } else {
        console.log(`[DIRECT] Hiding subtasks for task ${taskId}`);
        subtasksContainer.style.display = 'none';
        
        // Update the expand button icon
        const expandButton = taskElement.querySelector('.expand-subtasks-btn i');
        if (expandButton) {
            expandButton.className = 'fas fa-chevron-down';
        }
    }
}

/**
 * Generate grocery subtasks UI
 * @param {number} taskId - The task ID
 * @param {HTMLElement} container - The container element
 */
function generateGrocerySubtasksUI(taskId, container) {
    console.log(`[DIRECT] Generating grocery subtasks UI for task ${taskId}`);
    
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
    container.appendChild(header);
    
    // Create subtasks for each grocery item
    groceryItems.forEach((item, index) => {
        const subtaskElement = document.createElement('div');
        subtaskElement.className = 'grocery-subtask-item';
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
        checkbox.className = 'grocery-subtask-checkbox';
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
        title.className = 'grocery-subtask-title';
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
