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
    checkbox.addEventListener('change', (event) => {
        // Handle checkbox change
        handleToggleComplete(event);

        // Check if all subtasks are complete to update parent task
        if (typeof window.checkAllSubtasksComplete === 'function') {
            setTimeout(async () => {
                const allComplete = await window.checkAllSubtasksComplete(subtask.parent_task_id);

                // Update parent task status if needed
                if (typeof window.updateParentTaskStatus === 'function') {
                    await window.updateParentTaskStatus(subtask.parent_task_id, allComplete);
                }
            }, 100);
        }
    });

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
        console.log(`loadSubtasks called for task ID ${parentId}`);

        // Find the expand button and update its icon
        const expandButton = parentElement.querySelector('.expand-subtasks-btn');

        // Check if already expanded
        if (expandedTasks.has(parentId)) {
            console.log(`Task ${parentId} is already expanded, collapsing subtasks`);

            // Get the subtasks container
            const subtasksContainer = document.querySelector(`.subtasks-container[data-parent-id="${parentId}"]`);

            if (subtasksContainer) {
                // Collapse with animation
                subtasksContainer.classList.remove('expanded');

                // Wait for animation to complete before removing
                setTimeout(() => {
                    subtasksContainer.remove();
                }, 300);
            }

            expandedTasks.delete(parentId);

            // Remove expanded class from parent
            parentElement.classList.remove('expanded');

            // Update the expand button icon
            if (expandButton) {
                expandButton.querySelector('i').classList.remove('fa-chevron-up');
                expandButton.querySelector('i').classList.add('fa-chevron-down');
            }

            return;
        }

        console.log(`Expanding subtasks for task ${parentId}`);

        // Mark as expanded
        expandedTasks.add(parentId);
        parentElement.classList.add('expanded');

        // Update the expand button icon
        if (expandButton) {
            expandButton.querySelector('i').classList.remove('fa-chevron-down');
            expandButton.querySelector('i').classList.add('fa-chevron-up');
        }

        // Create a container for all subtasks
        const subtasksContainer = document.createElement('div');
        subtasksContainer.className = 'subtasks-container';
        subtasksContainer.setAttribute('data-parent-id', parentId);
        parentElement.after(subtasksContainer);

        // Show loading indicator inside the container
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'subtask-loading';
        loadingDiv.textContent = 'Loading subtasks...';
        subtasksContainer.appendChild(loadingDiv);

        // Trigger reflow to ensure animation works
        void subtasksContainer.offsetWidth;

        // Expand the container
        subtasksContainer.classList.add('expanded');

        console.log(`Fetching subtasks for task ${parentId}`);

        // Fetch subtasks
        const response = await fetch(`${window.location.origin}/api/tasks/${parentId}/subtasks`);

        if (!response.ok) {
            throw new Error(`Failed to load subtasks: ${response.status} ${response.statusText}`);
        }

        const subtasks = await response.json();
        console.log(`Fetched ${subtasks.length} subtasks for task ${parentId}`, subtasks);

        // Remove loading indicator
        loadingDiv.remove();

        if (subtasks.length === 0) {
            // No subtasks found
            const noSubtasksDiv = document.createElement('div');
            noSubtasksDiv.className = 'subtask-item no-subtasks';
            noSubtasksDiv.textContent = 'No subtasks found. Click "Edit" to add subtasks.';
            subtasksContainer.appendChild(noSubtasksDiv);
            return;
        }

        // Create and append subtask elements with staggered animation
        subtasks.forEach((subtask, index) => {
            const subtaskElement = createSubtaskElement(subtask);

            // Add a slight delay for each subtask to create a staggered effect
            subtaskElement.style.animationDelay = `${index * 0.05}s`;

            subtasksContainer.appendChild(subtaskElement);
        });

        // Check if all subtasks are complete
        const allComplete = subtasks.every(subtask => subtask.is_complete);
        if (allComplete && subtasks.length > 0) {
            parentElement.classList.add('all-subtasks-complete');
        } else {
            parentElement.classList.remove('all-subtasks-complete');
        }
    } catch (error) {
        console.error('Error loading subtasks:', error);

        // Get the subtasks container
        const subtasksContainer = document.querySelector(`.subtasks-container[data-parent-id="${parentId}"]`);

        if (subtasksContainer) {
            // Show error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'subtask-item subtask-error';
            errorDiv.textContent = 'Error loading subtasks';
            subtasksContainer.innerHTML = '';
            subtasksContainer.appendChild(errorDiv);
        }
    }
}

/**
 * Check if a task has subtasks
 * @param {Object} task - The task data
 * @returns {boolean} True if the task has subtasks
 */
function hasSubtasks(task) {
    // Check if this is a grocery list task
    const isGroceryList = task.title && task.title.startsWith('Grocery List -');

    // Check if this task has the has_subtasks flag or is a grocery list
    return isGroceryList || task.has_subtasks === true;
}

/**
 * Enhance the task element to support subtasks
 * @param {HTMLElement} taskElement - The task element
 * @param {Object} task - The task data
 */
function enhanceTaskElement(taskElement, task) {
    if (hasSubtasks(task)) {
        console.log(`Enhancing task element for task ${task.id} with subtasks`);

        // Add has-subtasks class
        taskElement.classList.add('has-subtasks');

        // Create expand button
        const expandButton = document.createElement('button');
        expandButton.className = 'expand-subtasks-btn';
        expandButton.innerHTML = '<i class="fas fa-chevron-down"></i>';
        expandButton.title = 'Show/hide subtasks';
        expandButton.setAttribute('data-task-id', task.id);
        expandButton.setAttribute('data-expand-button', 'true'); // Add a data attribute to identify this as an expand button

        // Create a separate container for the expand button
        const expandButtonContainer = document.createElement('div');
        expandButtonContainer.className = 'expand-button-container';
        expandButtonContainer.appendChild(expandButton);

        // Insert the expand button container at the beginning of the task element
        if (taskElement.firstChild) {
            taskElement.insertBefore(expandButtonContainer, taskElement.firstChild);
        } else {
            taskElement.appendChild(expandButtonContainer);
        }

        console.log(`Added expand button to task ${task.id}`);

        // Add click event to the expand button
        expandButton.addEventListener('click', (event) => {
            console.log(`Expand button clicked for task ${task.id}`);
            event.stopPropagation(); // Prevent event from bubbling to the task item
            event.preventDefault(); // Prevent default button behavior

            // Call loadSubtasks with the task ID and parent element
            loadSubtasks(task.id, taskElement);

            // Return false to prevent the event from propagating
            return false;
        });

        // Add a separate click event to the expand button container
        expandButtonContainer.addEventListener('click', (event) => {
            console.log(`Expand button container clicked for task ${task.id}`);
            event.stopPropagation(); // Prevent event from bubbling to the task item
            event.preventDefault(); // Prevent default button behavior

            // Call loadSubtasks with the task ID and parent element
            loadSubtasks(task.id, taskElement);

            // Return false to prevent the event from propagating
            return false;
        });

        // Add a visual indicator to show that this task has subtasks
        const subtaskIndicator = document.createElement('span');
        subtaskIndicator.className = 'subtask-indicator';
        subtaskIndicator.textContent = 'Has subtasks';

        // Add the indicator to the task content
        const taskContent = taskElement.querySelector('.task-content');
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

        // Add a tooltip to indicate expandability
        taskElement.title = taskElement.title ?
            `${taskElement.title} (Use the expand button to show/hide subtasks)` :
            'Use the expand button to show/hide subtasks';
    }
}

/**
 * Create a new subtask for a parent task
 * @param {number} parentTaskId - The parent task ID
 * @param {Object} subtaskData - The subtask data
 * @returns {Promise<Object>} The created subtask
 */
async function createSubtask(parentTaskId, subtaskData) {
    try {
        // Prepare the subtask data
        const data = {
            ...subtaskData,
            parent_task_id: parentTaskId,
            is_subtask: true
        };

        // Send the request to create the subtask
        const response = await fetch(`${window.location.origin}/api/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Failed to create subtask: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating subtask:', error);
        throw error;
    }
}

/**
 * Show subtask details in a modal
 * @param {Object} subtask - The subtask data
 */
function showSubtaskDetails(subtask) {
    // Use the existing edit task modal to show subtask details
    if (typeof window.showEditTaskModal === 'function') {
        window.showEditTaskModal(subtask);
    } else {
        console.error('Edit task modal function not found');
    }
}

/**
 * Add click handler to subtask items to show details
 * @param {HTMLElement} subtaskElement - The subtask element
 * @param {Object} subtask - The subtask data
 */
function addSubtaskClickHandler(subtaskElement, subtask) {
    subtaskElement.addEventListener('click', (event) => {
        // Don't trigger if clicking on the checkbox
        if (event.target.type === 'checkbox') {
            return;
        }

        // Show subtask details
        showSubtaskDetails(subtask);
    });
}

/**
 * Check if all subtasks of a parent task are complete
 * @param {number} parentTaskId - The parent task ID
 * @returns {Promise<boolean>} True if all subtasks are complete
 */
async function checkAllSubtasksComplete(parentTaskId) {
    try {
        // Fetch subtasks
        const response = await fetch(`${window.location.origin}/api/tasks/${parentTaskId}/subtasks`);

        if (!response.ok) {
            throw new Error(`Failed to fetch subtasks: ${response.status} ${response.statusText}`);
        }

        const subtasks = await response.json();

        // If no subtasks, return false
        if (subtasks.length === 0) {
            return false;
        }

        // Check if all subtasks are complete
        return subtasks.every(subtask => subtask.is_complete);
    } catch (error) {
        console.error('Error checking subtasks completion:', error);
        return false;
    }
}

/**
 * Update parent task completion status based on subtasks
 * @param {number} parentTaskId - The parent task ID
 * @param {boolean} allComplete - Whether all subtasks are complete
 */
async function updateParentTaskStatus(parentTaskId, allComplete) {
    try {
        // Get the parent task element
        const parentElement = document.querySelector(`.task-item[data-task-id="${parentTaskId}"]`);

        if (!parentElement) {
            console.error(`Parent task element not found for ID ${parentTaskId}`);
            return;
        }

        // Get the checkbox
        const checkbox = parentElement.querySelector('.task-checkbox');

        if (!checkbox) {
            console.error(`Checkbox not found for parent task ${parentTaskId}`);
            return;
        }

        // Update the checkbox
        if (checkbox.checked !== allComplete) {
            checkbox.checked = allComplete;

            if (allComplete) {
                // Add a visual indicator that all subtasks are complete
                parentElement.classList.add('all-subtasks-complete');

                // Add a brief animation to show the parent task is being completed
                setTimeout(() => {
                    // Trigger the change event to update the UI and server
                    const changeEvent = new Event('change', { bubbles: true });
                    checkbox.dispatchEvent(changeEvent);
                }, 300); // Short delay for the animation to be visible
            } else {
                // Remove the visual indicator
                parentElement.classList.remove('all-subtasks-complete');

                // Trigger the change event to update the UI and server
                const changeEvent = new Event('change', { bubbles: true });
                checkbox.dispatchEvent(changeEvent);
            }
        }
    } catch (error) {
        console.error('Error updating parent task status:', error);
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

    // Override the createSubtaskElement function to add click handler
    const originalCreateSubtaskElement = window.createSubtaskElement;

    if (originalCreateSubtaskElement) {
        window.createSubtaskElement = function(subtask) {
            const subtaskElement = originalCreateSubtaskElement(subtask);
            addSubtaskClickHandler(subtaskElement, subtask);
            return subtaskElement;
        };
    }

    // We're not overriding openEditTaskModal anymore since it already handles loading subtasks
    // This was causing duplicate subtasks to be loaded

    /**
     * Create a subtask element for the modal
     * @param {Object} subtask - The subtask data
     * @returns {HTMLElement} The subtask element or null if a duplicate exists
     */
    function createSubtaskElementForModal(subtask) {
        // Check if this subtask element already exists in the DOM
        const existingElement = document.getElementById(`subtask-${subtask.id}`);
        if (existingElement) {
            console.log(`Subtask element for subtask ${subtask.id} already exists, skipping creation`);
            return null;
        }

        // Also check if there's an element with the same data-task-id
        const editSubtasksList = document.getElementById('editSubtasksList');
        if (editSubtasksList) {
            const existingByDataId = editSubtasksList.querySelector(`.modal-subtask-item[data-task-id="${subtask.id}"]`);
            if (existingByDataId) {
                console.log(`Subtask element with data-task-id=${subtask.id} already exists, skipping creation`);
                return null;
            }
        }

        const div = document.createElement('div');
        div.className = `modal-subtask-item ${subtask.is_complete ? 'complete' : ''}`;
        div.setAttribute('data-task-id', subtask.id);
        div.setAttribute('data-parent-id', subtask.parent_task_id);
        div.id = `subtask-${subtask.id}`; // Add a unique ID to the element

        // Create checkbox for completion status
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'subtask-checkbox';
        checkbox.checked = subtask.is_complete;
        checkbox.disabled = true; // Read-only in the modal

        // Create title element
        const titleSpan = document.createElement('span');
        titleSpan.className = 'subtask-title';
        titleSpan.textContent = subtask.title;

        // Create content container
        const contentDiv = document.createElement('div');
        contentDiv.className = 'subtask-content';
        contentDiv.appendChild(checkbox);
        contentDiv.appendChild(titleSpan);

        // Add description if available
        if (subtask.description) {
            const descriptionDiv = document.createElement('div');
            descriptionDiv.className = 'subtask-description';
            descriptionDiv.textContent = subtask.description;
            contentDiv.appendChild(descriptionDiv);
        }

        div.appendChild(contentDiv);
        return div;
    }

    // Make functions available globally
    window.createSubtask = createSubtask;
    window.showSubtaskDetails = showSubtaskDetails;
    window.checkAllSubtasksComplete = checkAllSubtasksComplete;
    window.updateParentTaskStatus = updateParentTaskStatus;
    window.loadSubtasks = loadSubtasks;
    window.createSubtaskElementForModal = createSubtaskElementForModal;
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initSubtasksSupport();

    // Add a direct event listener to clear subtasks when the edit modal is closed
    const editTaskModal = document.getElementById('editTaskModal');
    if (editTaskModal) {
        console.log('Adding event listener to clear subtasks when modal is closed');

        // Add a mutation observer to detect when the modal is hidden
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    if (editTaskModal.style.display === 'none') {
                        console.log('Edit task modal is now hidden, clearing subtasks');

                        // Clear the subtasks list when the modal is closed
                        const editSubtasksList = document.getElementById('editSubtasksList');
                        if (editSubtasksList) {
                            editSubtasksList.innerHTML = '';
                        }
                    }
                }
            });
        });

        observer.observe(editTaskModal, { attributes: true });
    }
});
