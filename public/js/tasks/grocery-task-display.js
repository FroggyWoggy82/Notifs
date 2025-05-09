/**
 * Grocery Task Display
 * Enhances the display of grocery list tasks in the task list
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize grocery task display
    initGroceryTaskDisplay();
});

/**
 * Initialize grocery task display
 */
function initGroceryTaskDisplay() {
    // Override the createTaskElement function to add grocery task support
    const originalCreateTaskElement = window.createTaskElement;
    
    if (originalCreateTaskElement) {
        window.createTaskElement = function(task) {
            const taskElement = originalCreateTaskElement(task);
            
            // Check if this is a grocery list task
            if (task.title && task.title.startsWith('Grocery List -')) {
                enhanceGroceryTaskElement(taskElement, task);
            }
            
            return taskElement;
        };
    }
}

/**
 * Enhance a grocery task element with additional information and styling
 * @param {HTMLElement} taskElement - The task element to enhance
 * @param {Object} task - The task data
 */
function enhanceGroceryTaskElement(taskElement, task) {
    // Add grocery-task class for styling
    taskElement.classList.add('grocery-task');
    
    // Add grocery icon
    const titleElement = taskElement.querySelector('.task-title');
    if (titleElement) {
        const groceryIcon = document.createElement('i');
        groceryIcon.className = 'fas fa-shopping-basket grocery-icon';
        titleElement.insertBefore(groceryIcon, titleElement.firstChild);
    }
    
    // Add grocery summary if available
    if (task.description) {
        const descriptionElement = taskElement.querySelector('.task-description');
        if (descriptionElement) {
            // Extract total cost from description if available
            const costMatch = task.description.match(/Total cost: \$([0-9.]+)/);
            if (costMatch && costMatch[1]) {
                const costElement = document.createElement('div');
                costElement.className = 'grocery-cost';
                costElement.innerHTML = `<i class="fas fa-tag"></i> $${costMatch[1]}`;
                descriptionElement.appendChild(costElement);
            }
        }
    }
}

/**
 * Enhance a grocery subtask element with additional information and styling
 * @param {HTMLElement} subtaskElement - The subtask element to enhance
 * @param {Object} subtask - The subtask data
 */
function enhanceGrocerySubtaskElement(subtaskElement, subtask) {
    // Add grocery-subtask class for styling
    subtaskElement.classList.add('grocery-subtask');
    
    // Add grocery data if available
    if (subtask.grocery_data) {
        try {
            const groceryData = typeof subtask.grocery_data === 'string' 
                ? JSON.parse(subtask.grocery_data) 
                : subtask.grocery_data;
            
            // Create grocery info element
            const groceryInfo = document.createElement('div');
            groceryInfo.className = 'grocery-info';
            
            // Add amount
            if (groceryData.amount) {
                const amountSpan = document.createElement('span');
                amountSpan.className = 'grocery-amount';
                amountSpan.textContent = `${groceryData.amount.toFixed(1)}g`;
                groceryInfo.appendChild(amountSpan);
            }
            
            // Add package count
            if (groceryData.packageCount) {
                const packageSpan = document.createElement('span');
                packageSpan.className = 'grocery-packages';
                packageSpan.textContent = `${groceryData.packageCount} pkg`;
                groceryInfo.appendChild(packageSpan);
            }
            
            // Add price
            if (groceryData.totalPrice) {
                const priceSpan = document.createElement('span');
                priceSpan.className = 'grocery-price';
                priceSpan.textContent = `$${groceryData.totalPrice.toFixed(2)}`;
                groceryInfo.appendChild(priceSpan);
            }
            
            // Add to subtask element
            const contentDiv = subtaskElement.querySelector('.subtask-content');
            if (contentDiv) {
                contentDiv.appendChild(groceryInfo);
            }
        } catch (error) {
            console.error('Error parsing grocery data:', error);
        }
    }
}

// Override the createSubtaskElement function from subtasks-support.js
const originalCreateSubtaskElement = window.createSubtaskElement;
if (originalCreateSubtaskElement) {
    window.createSubtaskElement = function(subtask) {
        const subtaskElement = originalCreateSubtaskElement(subtask);
        
        // Check if this is a grocery subtask
        if (subtask.grocery_data) {
            enhanceGrocerySubtaskElement(subtaskElement, subtask);
        }
        
        return subtaskElement;
    };
}
