/**
 * Grocery Subtasks DOM Manipulation
 * This file directly manipulates the DOM to add grocery list subtasks
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DOM] Grocery subtasks DOM manipulation loaded');
    
    // Add a button to the page that will add the grocery list subtasks
    addGrocerySubtasksButton();
});

/**
 * Add a button to the page that will add the grocery list subtasks
 */
function addGrocerySubtasksButton() {
    console.log('[DOM] Adding grocery subtasks button');
    
    // Create the button
    const button = document.createElement('button');
    button.id = 'show-grocery-subtasks-btn';
    button.textContent = 'Show Grocery Subtasks';
    button.style.position = 'fixed';
    button.style.top = '100px';
    button.style.right = '20px';
    button.style.zIndex = '9999';
    button.style.padding = '10px';
    button.style.backgroundColor = '#4CAF50';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    
    // Add click event listener
    button.addEventListener('click', () => {
        console.log('[DOM] Grocery subtasks button clicked');
        addGrocerySubtasks();
    });
    
    // Add the button to the page
    document.body.appendChild(button);
}

/**
 * Add grocery subtasks to the page
 */
function addGrocerySubtasks() {
    console.log('[DOM] Adding grocery subtasks');
    
    // Find all grocery list tasks
    const groceryTasks = Array.from(document.querySelectorAll('.task-item')).filter(task => {
        const title = task.querySelector('.task-title');
        return title && title.textContent.includes('Grocery List');
    });
    
    console.log(`[DOM] Found ${groceryTasks.length} grocery list tasks`);
    
    // Process each grocery task
    groceryTasks.forEach(task => {
        const taskId = task.getAttribute('data-task-id');
        console.log(`[DOM] Processing grocery task ${taskId}`);
        
        // Check if subtasks container already exists
        let subtasksContainer = document.querySelector(`.dom-subtasks-container[data-parent-id="${taskId}"]`);
        
        if (!subtasksContainer) {
            console.log(`[DOM] Creating subtasks container for task ${taskId}`);
            
            // Create subtasks container
            subtasksContainer = document.createElement('div');
            subtasksContainer.className = 'dom-subtasks-container';
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
            
            // Insert after the task element
            task.parentNode.insertBefore(subtasksContainer, task.nextSibling);
            
            // Generate grocery subtasks
            generateGrocerySubtasksUI(taskId, subtasksContainer);
        } else {
            console.log(`[DOM] Subtasks container already exists for task ${taskId}`);
            
            // Toggle visibility
            if (subtasksContainer.style.display === 'none') {
                subtasksContainer.style.display = 'block';
            } else {
                subtasksContainer.style.display = 'none';
            }
        }
    });
}

/**
 * Generate grocery subtasks UI
 * @param {number} taskId - The task ID
 * @param {HTMLElement} container - The container element
 */
function generateGrocerySubtasksUI(taskId, container) {
    console.log(`[DOM] Generating grocery subtasks UI for task ${taskId}`);
    
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
