/**
 * Subtasks Support
 * Adds support for displaying and interacting with subtasks in the Tasks page
 */

// Keep track of expanded parent tasks
const expandedTasks = new Set();

// Import handleToggleComplete function from script.js if it's not already defined
if (typeof window.handleToggleComplete !== 'function') {
    window.handleToggleComplete = function(event) {
        const checkbox = event.target;
        const taskItem = checkbox.closest('.task-item, .subtask-item');
        const taskId = taskItem.getAttribute('data-task-id');
        const isComplete = checkbox.checked;
        const isSubtask = taskItem.classList.contains('subtask-item');
        const parentId = isSubtask ? taskItem.getAttribute('data-parent-id') : null;

        console.log(`Subtasks support handling toggle for ${isSubtask ? 'subtask' : 'task'} ${taskId} to complete=${isComplete}`);

        // Update the task/subtask in the database
        fetch(`/api/tasks/${taskId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_complete: isComplete })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to update task: ${response.status}`);
            }
            return response.json();
        })
        .then(updatedTask => {
            console.log(`Successfully updated ${isSubtask ? 'subtask' : 'task'} ${taskId}`, updatedTask);

            // Update UI
            if (isComplete) {
                taskItem.classList.add('complete');
            } else {
                taskItem.classList.remove('complete');
            }

            // If this is a subtask, check if all subtasks are complete to update parent
            if (isSubtask && parentId) {
                setTimeout(() => {
                    checkAllSubtasksComplete(parentId).then(allComplete => {
                        updateParentTaskStatus(parentId, allComplete);
                    });
                }, 100);
            }
        })
        .catch(error => {
            console.error('Error updating task completion status:', error);
            // Revert checkbox state on error
            checkbox.checked = !isComplete;
        });
    };
}

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
        // Handle checkbox change using the global handleToggleComplete function
        if (typeof window.handleToggleComplete === 'function') {
            window.handleToggleComplete(event);
        } else {
            console.error('handleToggleComplete function not found');
            // Fallback implementation
            const isComplete = checkbox.checked;
            fetch(`/api/tasks/${subtask.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_complete: isComplete })
            })
            .then(response => {
                if (!response.ok) throw new Error(`Failed to update subtask: ${response.status}`);
                return response.json();
            })
            .catch(error => {
                console.error('Error updating subtask completion status:', error);
                checkbox.checked = !isComplete; // Revert on error
            });
        }

        // Check if all subtasks are complete to update parent task
        setTimeout(async () => {
            try {
                const allComplete = await checkAllSubtasksComplete(subtask.parent_task_id);
                await updateParentTaskStatus(subtask.parent_task_id, allComplete);
            } catch (error) {
                console.error('Error checking subtasks completion:', error);
            }
        }, 100);
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

        // Ensure parentId is a number
        parentId = parseInt(parentId);

        if (isNaN(parentId)) {
            console.error('Invalid parent ID:', parentId);
            return;
        }

        // Check if this is a grocery list task
        const taskTitle = parentElement.querySelector('.task-title')?.textContent;
        const isGroceryList = taskTitle && (
            taskTitle.startsWith('Grocery List -') ||
            taskTitle.startsWith('Grocery List (') ||
            taskTitle.includes('Grocery List')
        );

        if (isGroceryList) {
            console.log(`Task ${parentId} is a grocery list task, using custom subtask toggling`);
            return toggleGrocerySubtasks(parentId, parentElement);
        }

        // Find the expand button and update its icon
        const expandButton = parentElement.querySelector('.expand-subtasks-btn');

        // If the expand button doesn't exist, create it
        if (!expandButton) {
            console.log(`Expand button not found for task ${parentId}, creating it`);

            // Create expand button
            const newExpandButton = document.createElement('button');
            newExpandButton.className = 'expand-subtasks-btn';
            newExpandButton.innerHTML = '<i class="fas fa-chevron-down"></i>';
            newExpandButton.title = 'Show/hide subtasks';
            newExpandButton.setAttribute('data-task-id', parentId);
            newExpandButton.setAttribute('data-expand-button', 'true');

            // Create a separate container for the expand button
            const expandButtonContainer = document.createElement('div');
            expandButtonContainer.className = 'expand-button-container';
            expandButtonContainer.appendChild(newExpandButton);

            // Insert the expand button container at the beginning of the task element
            if (parentElement.firstChild) {
                parentElement.insertBefore(expandButtonContainer, parentElement.firstChild);
            } else {
                parentElement.appendChild(expandButtonContainer);
            }

            console.log(`Added expand button to task ${parentId}`);

            // Add click event to the expand button
            newExpandButton.addEventListener('click', (event) => {
                console.log(`Expand button clicked for task ${parentId}`);
                event.stopPropagation();
                event.preventDefault();

                // Call loadSubtasks with the task ID and parent element
                loadSubtasks(parentId, parentElement);

                return false;
            });

            // Add a separate click event to the expand button container
            expandButtonContainer.addEventListener('click', (event) => {
                console.log(`Expand button container clicked for task ${parentId}`);
                event.stopPropagation();
                event.preventDefault();

                // Call loadSubtasks with the task ID and parent element
                loadSubtasks(parentId, parentElement);

                return false;
            });
        }

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
            const currentExpandButton = parentElement.querySelector('.expand-subtasks-btn');
            if (currentExpandButton) {
                const icon = currentExpandButton.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-chevron-up');
                    icon.classList.add('fa-chevron-down');
                } else {
                    currentExpandButton.innerHTML = '<i class="fas fa-chevron-down"></i>';
                }
            }

            return;
        }

        console.log(`Expanding subtasks for task ${parentId}`);

        // Mark as expanded
        expandedTasks.add(parentId);
        parentElement.classList.add('expanded');

        // Update the expand button icon
        const currentExpandButton = parentElement.querySelector('.expand-subtasks-btn');
        if (currentExpandButton) {
            const icon = currentExpandButton.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            } else {
                currentExpandButton.innerHTML = '<i class="fas fa-chevron-up"></i>';
            }
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

        // Try to fetch subtasks using the dedicated endpoint
        let subtasks = [];
        let response;

        try {
            // Fetch subtasks using relative URL to ensure it works in all environments
            response = await fetch(`/api/tasks/${parentId}/subtasks`);

            if (response.ok) {
                subtasks = await response.json();
                console.log(`Fetched ${subtasks.length} subtasks for task ${parentId} using dedicated endpoint`, subtasks);
            } else {
                console.error(`Failed to load subtasks using dedicated endpoint: ${response.status} ${response.statusText}`);
                throw new Error('Dedicated endpoint failed');
            }
        } catch (endpointError) {
            console.log('Falling back to querying all tasks with parent_task_id filter');

            // Fallback: Query all tasks and filter by parent_task_id
            response = await fetch(`/api/tasks?parent_task_id=${parentId}`);

            if (!response.ok) {
                throw new Error(`Failed to load subtasks (fallback): ${response.status} ${response.statusText}`);
            }

            const allTasks = await response.json();
            subtasks = allTasks.filter(task => task.parent_task_id === parseInt(parentId) && task.is_subtask);
            console.log(`Fetched ${subtasks.length} subtasks for task ${parentId} using fallback method`, subtasks);
        }

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
    // Check if this is a grocery list task (handle both formats)
    const isGroceryList = task.title && (
        task.title.startsWith('Grocery List -') ||
        task.title.startsWith('Grocery List (') ||
        task.title.includes('Grocery List')
    );

    // Log the task details for debugging
    console.log(`hasSubtasks check for task ${task.id}:`, {
        title: task.title,
        isGroceryList,
        has_subtasks: task.has_subtasks,
        is_grocery_list: task.is_grocery_list
    });

    // Check if this task has the has_subtasks flag or is a grocery list
    return isGroceryList || task.has_subtasks === true;
}

/**
 * Enhance the task element to support subtasks
 * @param {HTMLElement} taskElement - The task element
 * @param {Object} task - The task data
 */
function enhanceTaskElement(taskElement, task) {
    console.log(`Checking if task ${task.id} has subtasks:`, task);
    console.log(`Task ${task.id} has_subtasks flag:`, task.has_subtasks);
    console.log(`Task ${task.id} parent_task_id:`, task.parent_task_id);
    console.log(`Task ${task.id} is_subtask:`, task.is_subtask);

    // Check if this is a grocery list task
    const isGroceryList = task.title && (
        task.title.startsWith('Grocery List -') ||
        task.title.startsWith('Grocery List (') ||
        task.title.includes('Grocery List')
    );

    // If this is a grocery list task and has_subtasks is not set, update it
    if (isGroceryList && task.has_subtasks !== true) {
        console.log(`Updating has_subtasks flag for grocery list task ${task.id}`);

        // Update the task in the database
        fetch(`/api/tasks/${task.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ has_subtasks: true })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to update has_subtasks flag: ${response.status}`);
            }
            return response.json();
        })
        .then(updatedTask => {
            console.log(`Successfully updated has_subtasks flag for task ${task.id}`, updatedTask);
            // Update the task object in memory
            task.has_subtasks = true;
        })
        .catch(error => {
            console.error('Error updating has_subtasks flag:', error);
        });
    }

    console.log(`Task ${task.id} hasSubtasks() result:`, hasSubtasks(task));

    if (hasSubtasks(task)) {
        console.log(`Enhancing task element for task ${task.id} with subtasks`);

        // Add has-subtasks class
        taskElement.classList.add('has-subtasks');

        // Check if the expand button already exists
        let expandButton = taskElement.querySelector('.expand-subtasks-btn');
        let expandButtonContainer = taskElement.querySelector('.expand-button-container');

        // If the expand button doesn't exist, create it
        if (!expandButton) {
            // Create expand button
            expandButton = document.createElement('button');
            expandButton.className = 'expand-subtasks-btn';
            expandButton.innerHTML = '<i class="fas fa-chevron-down"></i>';
            expandButton.title = 'Show/hide subtasks';
            expandButton.setAttribute('data-task-id', task.id);
            expandButton.setAttribute('data-expand-button', 'true'); // Add a data attribute to identify this as an expand button

            // Create a separate container for the expand button
            expandButtonContainer = document.createElement('div');
            expandButtonContainer.className = 'expand-button-container';
            expandButtonContainer.appendChild(expandButton);

            // Insert the expand button container at the beginning of the task element
            if (taskElement.firstChild) {
                taskElement.insertBefore(expandButtonContainer, taskElement.firstChild);
            } else {
                taskElement.appendChild(expandButtonContainer);
            }

            console.log(`Added expand button to task ${task.id}`);
        } else {
            console.log(`Expand button already exists for task ${task.id}`);
        }

        // Add click event to the expand button (even if it already exists, to ensure it works)
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
        if (expandButtonContainer) {
            expandButtonContainer.addEventListener('click', (event) => {
                console.log(`Expand button container clicked for task ${task.id}`);
                event.stopPropagation(); // Prevent event from bubbling to the task item
                event.preventDefault(); // Prevent default button behavior

                // Call loadSubtasks with the task ID and parent element
                loadSubtasks(task.id, taskElement);

                // Return false to prevent the event from propagating
                return false;
            });
        }

        // Add a visual indicator to show that this task has subtasks
        let subtaskIndicator = taskElement.querySelector('.subtask-indicator');
        if (!subtaskIndicator) {
            subtaskIndicator = document.createElement('span');
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
        }

        // Add a tooltip to indicate expandability
        taskElement.title = taskElement.title ?
            `${taskElement.title} (Use the expand button to show/hide subtasks)` :
            'Use the expand button to show/hide subtasks';

        // Make sure the expand button is visible
        if (expandButton) {
            expandButton.style.display = 'flex';
        }
        if (expandButtonContainer) {
            expandButtonContainer.style.display = 'flex';
        }
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

        // Send the request to create the subtask using relative URL
        const response = await fetch(`/api/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Failed to create subtask: ${response.status} ${response.statusText}`);
        }

        const newSubtask = await response.json();

        // Update the parent task's has_subtasks flag
        console.log(`Updating parent task ${parentTaskId} has_subtasks flag`);
        const updateParentResponse = await fetch(`/api/tasks/${parentTaskId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                has_subtasks: true
            })
        });

        if (!updateParentResponse.ok) {
            console.error(`Failed to update parent task has_subtasks flag: ${updateParentResponse.status} ${updateParentResponse.statusText}`);
        } else {
            console.log(`Updated parent task ${parentTaskId} has_subtasks flag successfully`);
        }

        return newSubtask;
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
        // Fetch subtasks using relative URL
        const response = await fetch(`/api/tasks/${parentTaskId}/subtasks`);

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
        console.log(`Updating parent task ${parentTaskId} status, allComplete=${allComplete}`);

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
            console.log(`Setting parent task ${parentTaskId} checkbox to ${allComplete}`);
            checkbox.checked = allComplete;

            if (allComplete) {
                // Add a visual indicator that all subtasks are complete
                parentElement.classList.add('all-subtasks-complete');

                // Update the task in the database directly to ensure it's marked as complete
                try {
                    const response = await fetch(`/api/tasks/${parentTaskId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ is_complete: true })
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to update parent task: ${response.status}`);
                    }

                    const updatedTask = await response.json();
                    console.log(`Successfully updated parent task ${parentTaskId} to complete`, updatedTask);

                    // Update UI to reflect completion
                    parentElement.classList.add('complete');

                    // If the task is in the active list, move it to the completed list
                    const completedTaskList = document.getElementById('completedTaskList');
                    if (completedTaskList && parentElement.parentNode.id === 'taskList') {
                        completedTaskList.appendChild(parentElement);
                    }
                } catch (error) {
                    console.error('Error updating parent task in database:', error);
                    // Revert checkbox state on error
                    checkbox.checked = false;
                    parentElement.classList.remove('all-subtasks-complete');
                }
            } else {
                // Remove the visual indicator
                parentElement.classList.remove('all-subtasks-complete');
                parentElement.classList.remove('complete');

                // Update the task in the database
                try {
                    const response = await fetch(`/api/tasks/${parentTaskId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ is_complete: false })
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to update parent task: ${response.status}`);
                    }

                    const updatedTask = await response.json();
                    console.log(`Successfully updated parent task ${parentTaskId} to incomplete`, updatedTask);

                    // If the task is in the completed list, move it back to the active list
                    const taskList = document.getElementById('taskList');
                    if (taskList && parentElement.parentNode.id === 'completedTaskList') {
                        taskList.appendChild(parentElement);
                    }
                } catch (error) {
                    console.error('Error updating parent task in database:', error);
                    // Revert checkbox state on error
                    checkbox.checked = true;
                    parentElement.classList.add('all-subtasks-complete');
                }
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

    // Ensure handleToggleComplete is available globally
    if (typeof window.handleToggleComplete !== 'function') {
        console.warn('handleToggleComplete function not found in global scope, using local implementation');
    }
}

/**
 * Load and display subtasks for a grocery list task
 * @param {number} parentId - The parent task ID
 * @param {HTMLElement} parentElement - The parent task element
 */
async function loadGroceryListSubtasks(parentId, parentElement) {
    try {
        console.log(`loadGroceryListSubtasks called for task ID ${parentId}`);

        // Find the expand button and update its icon
        const expandButton = parentElement.querySelector('.expand-subtasks-btn');

        // Check if already expanded
        if (expandedTasks.has(parentId)) {
            console.log(`Grocery list task ${parentId} is already expanded, collapsing subtasks`);

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
                const icon = expandButton.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-chevron-up');
                    icon.classList.add('fa-chevron-down');
                } else {
                    expandButton.innerHTML = '<i class="fas fa-chevron-down"></i>';
                }
            }

            return;
        }

        console.log(`Expanding grocery list subtasks for task ${parentId}`);

        // Mark as expanded
        expandedTasks.add(parentId);
        parentElement.classList.add('expanded');

        // Update the expand button icon
        if (expandButton) {
            const icon = expandButton.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            } else {
                expandButton.innerHTML = '<i class="fas fa-chevron-up"></i>';
            }
        }

        // Create a container for all subtasks
        const subtasksContainer = document.createElement('div');
        subtasksContainer.className = 'subtasks-container';
        subtasksContainer.setAttribute('data-parent-id', parentId);
        parentElement.after(subtasksContainer);

        // Show loading indicator inside the container
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'subtask-loading';
        loadingDiv.textContent = 'Loading grocery list items...';
        subtasksContainer.appendChild(loadingDiv);

        // Trigger reflow to ensure animation works
        void subtasksContainer.offsetWidth;

        // Expand the container
        subtasksContainer.classList.add('expanded');

        console.log(`Fetching subtasks for grocery list task ${parentId}`);

        // Fetch subtasks using the dedicated endpoint
        const response = await fetch(`/api/tasks/${parentId}/subtasks`);

        if (!response.ok) {
            throw new Error(`Failed to load grocery list items: ${response.status} ${response.statusText}`);
        }

        const subtasks = await response.json();
        console.log(`Fetched ${subtasks.length} grocery list items for task ${parentId}`, subtasks);

        // Remove loading indicator
        loadingDiv.remove();

        if (subtasks.length === 0) {
            console.log(`No subtasks found for grocery list task ${parentId}, generating from grocery data`);

            // Try to generate subtasks from grocery data if available
            try {
                // Fetch the parent task to get grocery data
                const parentTaskResponse = await fetch(`/api/tasks/${parentId}`);
                if (!parentTaskResponse.ok) {
                    throw new Error(`Failed to fetch parent task: ${parentTaskResponse.status}`);
                }

                const parentTask = await parentTaskResponse.json();
                console.log(`Generating subtasks from grocery data: ${parentTask.grocery_data ? parentTask.grocery_data.length : 0} ingredients`);

                // If no subtasks found in database but parent task has grocery data, create temporary subtasks
                if (parentTask.grocery_data && parentTask.grocery_data.length > 0) {
                    // Create temporary subtasks from grocery data
                    const tempSubtasks = parentTask.grocery_data.map((ingredient, index) => {
                        return {
                            id: `temp-${parentId}-${index}`,
                            title: `${ingredient.name} - ${ingredient.amount}g`,
                            description: `Amount: ${ingredient.amount}g\nPackage Size: ${ingredient.package_amount || 'N/A'}g\nPackages to Buy: ${ingredient.packageCount || 'N/A'}\nPrice: ${ingredient.price ? `$${ingredient.price}` : 'N/A'}`,
                            is_complete: false,
                            parent_task_id: parentId,
                            is_subtask: true,
                            grocery_data: ingredient
                        };
                    });

                    // Create and append temporary subtask elements
                    tempSubtasks.forEach((subtask, index) => {
                        const subtaskElement = createGrocerySubtaskElement(subtask);
                        subtaskElement.style.animationDelay = `${index * 0.05}s`;
                        subtasksContainer.appendChild(subtaskElement);
                    });

                    return;
                }
            } catch (error) {
                console.error('Error generating subtasks from grocery data:', error);
            }

            // If we get here, no subtasks were found or generated
            const noSubtasksDiv = document.createElement('div');
            noSubtasksDiv.className = 'subtask-item no-subtasks';
            noSubtasksDiv.textContent = 'No grocery list items found.';
            subtasksContainer.appendChild(noSubtasksDiv);
            return;
        }

        console.log(`Replacing generated subtasks with ${subtasks.length} subtasks from database`);

        // Create and append subtask elements with staggered animation
        subtasks.forEach((subtask, index) => {
            const subtaskElement = createGrocerySubtaskElement(subtask);

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
        console.error('Error loading grocery list items:', error);

        // Get the subtasks container
        const subtasksContainer = document.querySelector(`.subtasks-container[data-parent-id="${parentId}"]`);

        if (subtasksContainer) {
            // Show error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'subtask-item subtask-error';
            errorDiv.textContent = 'Error loading grocery list items';
            subtasksContainer.innerHTML = '';
            subtasksContainer.appendChild(errorDiv);
        }
    }
}

/**
 * Create a grocery subtask element
 * @param {Object} subtask - The subtask data
 * @returns {HTMLElement} The subtask element
 */
function createGrocerySubtaskElement(subtask) {
    const div = document.createElement('div');
    div.className = `subtask-item grocery-subtask ${subtask.is_complete ? 'complete' : ''}`;
    div.setAttribute('data-task-id', subtask.id);
    div.setAttribute('data-parent-id', subtask.parent_task_id);

    // Create checkbox for completion status
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = subtask.is_complete;
    checkbox.addEventListener('change', (event) => {
        // Handle checkbox change using the global handleToggleComplete function
        if (typeof window.handleToggleComplete === 'function') {
            window.handleToggleComplete(event);
        } else {
            console.error('handleToggleComplete function not found');
            // Fallback implementation
            const isComplete = checkbox.checked;
            fetch(`/api/tasks/${subtask.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_complete: isComplete })
            })
            .then(response => {
                if (!response.ok) throw new Error(`Failed to update grocery item: ${response.status}`);
                return response.json();
            })
            .catch(error => {
                console.error('Error updating grocery item completion status:', error);
                checkbox.checked = !isComplete; // Revert on error
            });
        }

        // Check if all subtasks are complete to update parent task
        setTimeout(async () => {
            try {
                const allComplete = await checkAllSubtasksComplete(subtask.parent_task_id);
                await updateParentTaskStatus(subtask.parent_task_id, allComplete);
            } catch (error) {
                console.error('Error checking grocery items completion:', error);
            }
        }, 100);
    });

    // Create title element
    const titleSpan = document.createElement('span');
    titleSpan.className = 'subtask-title';

    // Format the title based on the subtask data
    // For grocery items, include the amount, packages needed, and price
    let titleText = subtask.title;

    // Extract ingredient details from the title if available
    const ingredientMatch = subtask.title.match(/^(.+?)(?:\s*-\s*(\d+(?:\.\d+)?)\s*g)?(?:\s*-\s*(\d+)\s*packages?)?(?:\s*-\s*\$(\d+(?:\.\d+)?))?$/);

    if (ingredientMatch) {
        const [, ingredientName, amount, packages, price] = ingredientMatch;

        titleText = ingredientName;

        // Create grocery info element
        const groceryInfo = document.createElement('div');
        groceryInfo.className = 'grocery-info';

        // Add amount
        if (amount) {
            const amountSpan = document.createElement('span');
            amountSpan.className = 'grocery-amount';
            amountSpan.textContent = `${amount}g`;
            groceryInfo.appendChild(amountSpan);
        }

        // Add package count
        if (packages) {
            const packageSpan = document.createElement('span');
            packageSpan.className = 'grocery-packages';
            packageSpan.textContent = `${packages} pkg`;
            groceryInfo.appendChild(packageSpan);
        }

        // Add price
        if (price) {
            const priceSpan = document.createElement('span');
            priceSpan.className = 'grocery-price';
            priceSpan.textContent = `$${price}`;
            groceryInfo.appendChild(priceSpan);
        }

        // Set the title to just the ingredient name
        titleSpan.textContent = titleText;

        // Create content container
        const contentDiv = document.createElement('div');
        contentDiv.className = 'subtask-content';
        contentDiv.appendChild(checkbox);
        contentDiv.appendChild(titleSpan);
        contentDiv.appendChild(groceryInfo);

        div.appendChild(contentDiv);
    } else {
        // Simple title without grocery info
        titleSpan.textContent = titleText;

        // Create content container
        const contentDiv = document.createElement('div');
        contentDiv.className = 'subtask-content';
        contentDiv.appendChild(checkbox);
        contentDiv.appendChild(titleSpan);

        div.appendChild(contentDiv);
    }

    // Add description as tooltip
    if (subtask.description) {
        div.title = subtask.description;
    }

    return div;
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

    // Export the functions
    window.loadSubtasks = loadSubtasks;
    window.hasSubtasks = hasSubtasks;
    window.enhanceTaskElement = enhanceTaskElement;
    window.checkAllSubtasksComplete = checkAllSubtasksComplete;
    window.updateParentTaskStatus = updateParentTaskStatus;
    window.loadGroceryListSubtasks = loadGroceryListSubtasks;
});
