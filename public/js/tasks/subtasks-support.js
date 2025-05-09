/**
 * Subtasks Support
 * Adds support for displaying and interacting with subtasks in the Tasks page
 */

// Keep track of expanded parent tasks
const expandedTasks = new Set();

/**
 * Create a subtask element
 * @param {Object} subtask - The subtask data
 * @returns {HTMLElement} The subtask element
 */
function createSubtaskElement(subtask) {
    const div = document.createElement('div');
    div.className = `subtask-item ${subtask.is_complete ? 'complete' : ''}`;
    div.setAttribute('data-task-id', subtask.id);
    div.setAttribute('data-parent-id', subtask.parent_task_id);

    // Create checkbox for completion status
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = subtask.is_complete;
    checkbox.addEventListener('change', handleToggleComplete);

    // Create title element
    const titleSpan = document.createElement('span');
    titleSpan.className = 'subtask-title';
    titleSpan.textContent = subtask.title;

    // Create content container
    const contentDiv = document.createElement('div');
    contentDiv.className = 'subtask-content';
    contentDiv.appendChild(checkbox);
    contentDiv.appendChild(titleSpan);

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
            
            contentDiv.appendChild(groceryInfo);
        } catch (error) {
            console.error('Error parsing grocery data:', error);
        }
    }

    div.appendChild(contentDiv);

    // Add description as tooltip
    if (subtask.description) {
        div.title = subtask.description;
    }

    return div;
}

/**
 * Load and display subtasks for a parent task
 * @param {number} parentId - The parent task ID
 * @param {HTMLElement} parentElement - The parent task element
 */
async function loadSubtasks(parentId, parentElement) {
    try {
        // Check if already expanded
        if (expandedTasks.has(parentId)) {
            // Remove existing subtasks
            const existingSubtasks = document.querySelectorAll(`.subtask-item[data-parent-id="${parentId}"]`);
            existingSubtasks.forEach(el => el.remove());
            expandedTasks.delete(parentId);
            
            // Remove expanded class from parent
            parentElement.classList.remove('expanded');
            return;
        }
        
        // Mark as expanded
        expandedTasks.add(parentId);
        parentElement.classList.add('expanded');
        
        // Show loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'subtask-loading';
        loadingDiv.textContent = 'Loading subtasks...';
        parentElement.after(loadingDiv);
        
        // Fetch subtasks
        const response = await fetch(`/api/tasks/${parentId}/subtasks`);
        
        if (!response.ok) {
            throw new Error(`Failed to load subtasks: ${response.status} ${response.statusText}`);
        }
        
        const subtasks = await response.json();
        
        // Remove loading indicator
        loadingDiv.remove();
        
        if (subtasks.length === 0) {
            // No subtasks found
            const noSubtasksDiv = document.createElement('div');
            noSubtasksDiv.className = 'subtask-item no-subtasks';
            noSubtasksDiv.textContent = 'No subtasks found';
            noSubtasksDiv.setAttribute('data-parent-id', parentId);
            parentElement.after(noSubtasksDiv);
            return;
        }
        
        // Create and append subtask elements
        let lastElement = parentElement;
        
        subtasks.forEach(subtask => {
            const subtaskElement = createSubtaskElement(subtask);
            lastElement.after(subtaskElement);
            lastElement = subtaskElement;
        });
    } catch (error) {
        console.error('Error loading subtasks:', error);
        
        // Show error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'subtask-item subtask-error';
        errorDiv.textContent = 'Error loading subtasks';
        errorDiv.setAttribute('data-parent-id', parentId);
        parentElement.after(errorDiv);
    }
}

/**
 * Check if a task has subtasks
 * @param {Object} task - The task data
 * @returns {boolean} True if the task has subtasks
 */
function hasSubtasks(task) {
    // For grocery list tasks, we can check the title
    return task.title && task.title.startsWith('Grocery List -');
}

/**
 * Enhance the task element to support subtasks
 * @param {HTMLElement} taskElement - The task element
 * @param {Object} task - The task data
 */
function enhanceTaskElement(taskElement, task) {
    if (hasSubtasks(task)) {
        // Add has-subtasks class
        taskElement.classList.add('has-subtasks');
        
        // Add expand button
        const expandBtn = document.createElement('button');
        expandBtn.className = 'expand-subtasks-btn';
        expandBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
        expandBtn.title = 'Show/hide subtasks';
        
        // Add click handler
        expandBtn.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent task click
            loadSubtasks(task.id, taskElement);
        });
        
        // Add button to task element
        const taskContent = taskElement.querySelector('.task-content');
        if (taskContent) {
            taskContent.appendChild(expandBtn);
        } else {
            taskElement.appendChild(expandBtn);
        }
    }
}

// Initialize subtasks support
function initSubtasksSupport() {
    // Override the createTaskElement function to add subtasks support
    const originalCreateTaskElement = window.createTaskElement;
    
    if (originalCreateTaskElement) {
        window.createTaskElement = function(task) {
            const taskElement = originalCreateTaskElement(task);
            enhanceTaskElement(taskElement, task);
            return taskElement;
        };
    }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', initSubtasksSupport);
