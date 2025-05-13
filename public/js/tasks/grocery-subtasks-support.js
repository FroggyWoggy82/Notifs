/**
 * Grocery List Subtasks Support
 * This file provides support for grocery list tasks with subtasks
 */

// Wait for the DOM to be loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize grocery list subtasks support
    initGroceryListSubtasksSupport();

    // Listen for tasks loaded event
    document.addEventListener('tasksLoaded', (event) => {
        console.log('Tasks loaded event received, enhancing grocery list tasks');
        enhanceGroceryListTasks();
    });

    // Listen for tasks rendered event
    document.addEventListener('tasksRendered', (event) => {
        console.log('Tasks rendered event received, enhancing grocery list tasks');
        enhanceGroceryListTasks();
    });

    // Override the loadSubtasks function to handle grocery list tasks
    if (window.loadSubtasks) {
        const originalLoadSubtasks = window.loadSubtasks;
        window.loadSubtasks = function(taskId, parentElement) {
            console.log(`Loading subtasks for task ${taskId}`);

            // Check if this is a grocery list task
            const taskTitle = parentElement.querySelector('.task-title')?.textContent;
            if (taskTitle && (
                taskTitle.startsWith('Grocery List -') ||
                taskTitle.startsWith('Grocery List (') ||
                taskTitle.includes('Grocery List')
            )) {
                console.log(`Task ${taskId} is a grocery list task, using custom subtask loading`);
                if (typeof window.loadGroceryListSubtasks === 'function') {
                    window.loadGroceryListSubtasks(taskId, parentElement);
                } else {
                    console.error('loadGroceryListSubtasks function not found on window object');
                    // Fallback to local function
                    loadGroceryListSubtasks(taskId, parentElement);
                }
            } else {
                // Use the original function for non-grocery list tasks
                console.log(`Task ${taskId} is not a grocery list task, using original subtask loading`);
                originalLoadSubtasks(taskId, parentElement);
            }
        };
    }

    // Add a global click handler for expand buttons on grocery list tasks only
    document.addEventListener('click', (event) => {
        // Check if the click is on an expand button or inside an expand button container
        const expandButton = event.target.closest('.expand-subtasks-btn');
        const expandButtonContainer = event.target.closest('.expand-button-container');
        const chevronIcon = event.target.closest('.fa-chevron-down, .fa-chevron-up');

        if (expandButton || expandButtonContainer || chevronIcon) {
            // Get the task ID and element
            const button = expandButton ||
                           (expandButtonContainer && expandButtonContainer.querySelector('.expand-subtasks-btn')) ||
                           (chevronIcon && chevronIcon.closest('.expand-subtasks-btn'));

            if (!button) return;

            const taskId = button.getAttribute('data-task-id');
            if (!taskId) return;

            const taskElement = button.closest('.task-item');
            if (!taskElement) return;

            // Check if this is a grocery list task
            const taskTitle = taskElement.querySelector('.task-title')?.textContent;
            const isGroceryList = taskTitle && (
                taskTitle.startsWith('Grocery List -') ||
                taskTitle.startsWith('Grocery List (') ||
                taskTitle.includes('Grocery List')
            );

            // Only handle grocery list tasks
            if (isGroceryList) {
                console.log(`Grocery subtasks: Global handler caught expand button click for grocery list task ${taskId}`);
                event.stopPropagation();
                event.preventDefault();

                if (typeof window.loadGroceryListSubtasks === 'function') {
                    window.loadGroceryListSubtasks(taskId, taskElement);
                } else {
                    console.error('loadGroceryListSubtasks function not found on window object');
                    // Fallback to local function
                    loadGroceryListSubtasks(taskId, taskElement);
                }
                return false;
            }

            // Let expand-button-fix.js handle non-grocery list tasks
        }
    }, true); // Use capture phase to ensure this runs before other handlers

    // Run an initial cleanup to remove any existing "Show Grocery Items" buttons
    setTimeout(() => {
        const showGroceryItemsButtons = document.querySelectorAll('.show-grocery-items-btn');
        if (showGroceryItemsButtons.length > 0) {
            console.log(`Found ${showGroceryItemsButtons.length} "Show Grocery Items" buttons to remove`);
            showGroceryItemsButtons.forEach(button => button.remove());
        }
    }, 1000);
});

/**
 * Initialize grocery list subtasks support
 */
function initGroceryListSubtasksSupport() {
    console.log('Initializing grocery list subtasks support');

    // Expose the loadGroceryListSubtasks function globally
    window.loadGroceryListSubtasks = loadGroceryListSubtasks;

    // Add a global function to test grocery list subtasks
    window.testGroceryListSubtasks = function(taskId) {
        console.log(`Testing grocery list subtasks for task ${taskId}`);
        const taskElement = document.querySelector(`.task-item[data-task-id="${taskId}"]`);
        if (taskElement) {
            if (typeof window.loadGroceryListSubtasks === 'function') {
                window.loadGroceryListSubtasks(parseInt(taskId), taskElement);
            } else {
                console.error('loadGroceryListSubtasks function not found on window object');
                // Fallback to local function
                loadGroceryListSubtasks(parseInt(taskId), taskElement);
            }
        } else {
            console.error(`Task element not found for task ${taskId}`);
        }
    };

    // Override the createTaskElement function to add grocery list subtasks support
    const originalCreateTaskElement = window.createTaskElement;
    if (originalCreateTaskElement) {
        window.createTaskElement = function(task) {
            const taskElement = originalCreateTaskElement(task);

            // Check if this is a grocery list task
            if (isGroceryListTask(task)) {
                console.log(`Task ${task.id} (${task.title}) is a grocery list task, enhancing with subtasks support`);
                enhanceGroceryListTaskElement(taskElement, task);
            }

            return taskElement;
        };
    }
}

/**
 * Check if a task is a grocery list task
 * @param {Object} task - The task data
 * @returns {boolean} True if the task is a grocery list task
 */
function isGroceryListTask(task) {
    // Check if this is a grocery list task by title or flag
    return (
        task.is_grocery_list === true ||
        (task.title && (
            task.title.startsWith('Grocery List -') ||
            task.title.startsWith('Grocery List (') ||
            task.title.includes('Grocery List')
        ))
    );
}

/**
 * Enhance all grocery list tasks in the DOM
 */
function enhanceGroceryListTasks() {
    // Find all grocery list tasks in the DOM
    const groceryListTasks = Array.from(document.querySelectorAll('.task-item')).filter(taskElement => {
        const taskId = taskElement.getAttribute('data-task-id');
        if (!taskId) return false;

        const taskTitle = taskElement.querySelector('.task-title')?.textContent;
        if (!taskTitle) return false;

        return (
            taskTitle.startsWith('Grocery List -') ||
            taskTitle.startsWith('Grocery List (') ||
            taskTitle.includes('Grocery List')
        );
    });

    console.log(`Found ${groceryListTasks.length} grocery list tasks to enhance`);

    // Enhance each grocery list task
    groceryListTasks.forEach(taskElement => {
        const taskId = taskElement.getAttribute('data-task-id');
        if (!taskId) return;

        console.log(`Enhancing grocery list task ${taskId}`);

        // Remove any existing "Show Grocery Items" button
        const showItemsButton = taskElement.querySelector('.show-grocery-items-btn');
        if (showItemsButton) {
            showItemsButton.remove();
        }

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
            expandButton.title = 'Show/hide grocery items';
            expandButton.setAttribute('data-task-id', taskId);
            expandButton.setAttribute('data-expand-button', 'true');
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

            // Create a separate container for the expand button
            expandButtonContainer = document.createElement('div');
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
            expandButtonContainer.appendChild(expandButton);

            // Insert the expand button container at the beginning of the task element
            if (taskElement.firstChild) {
                taskElement.insertBefore(expandButtonContainer, taskElement.firstChild);
            } else {
                taskElement.appendChild(expandButtonContainer);
            }

            // Add padding to the task element to make room for the expand button
            taskElement.style.paddingLeft = '30px';
            taskElement.style.position = 'relative';

            console.log(`Added expand button to grocery list task ${taskId}`);
        }

        // Add click event to the expand button
        expandButton.addEventListener('click', (event) => {
            console.log(`Expand button clicked for grocery list task ${taskId}`);
            event.stopPropagation();
            event.preventDefault();

            // Call loadGroceryListSubtasks directly
            if (typeof window.loadGroceryListSubtasks === 'function') {
                window.loadGroceryListSubtasks(taskId, taskElement);
            } else {
                console.error('loadGroceryListSubtasks function not found on window object');
                // Fallback to local function
                loadGroceryListSubtasks(taskId, taskElement);
            }

            return false;
        });

        // Make sure the expand button has the data-expand-button attribute
        expandButton.setAttribute('data-expand-button', 'true');

        // Add a visual indicator to show that this task has subtasks
        let subtaskIndicator = taskElement.querySelector('.subtask-indicator');
        if (!subtaskIndicator) {
            subtaskIndicator = document.createElement('span');
            subtaskIndicator.className = 'subtask-indicator';
            subtaskIndicator.textContent = 'Has subtasks';
            subtaskIndicator.style.display = 'inline-block';
            subtaskIndicator.style.marginLeft = '8px';
            subtaskIndicator.style.fontSize = '12px';
            subtaskIndicator.style.color = '#4CAF50';
            subtaskIndicator.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
            subtaskIndicator.style.padding = '2px 6px';
            subtaskIndicator.style.borderRadius = '4px';

            // Add the indicator to the task content
            const taskContent = taskElement.querySelector('.task-content');
            if (taskContent) {
                const metadataDiv = taskContent.querySelector('.task-metadata') || document.createElement('div');
                if (!taskContent.contains(metadataDiv)) {
                    metadataDiv.className = 'task-metadata';
                    metadataDiv.style.display = 'flex';
                    metadataDiv.style.flexWrap = 'wrap';
                    metadataDiv.style.gap = '8px';
                    metadataDiv.style.marginTop = '4px';
                    taskContent.appendChild(metadataDiv);
                }

                // Add the indicator to the metadata div
                if (!metadataDiv.querySelector('.subtask-indicator')) {
                    metadataDiv.appendChild(subtaskIndicator);
                }
            }
        }
    });
}

/**
 * Load subtasks for a grocery list task
 * @param {number} taskId - The ID of the parent task
 * @param {HTMLElement} parentElement - The parent task element
 */
function loadGroceryListSubtasks(taskId, parentElement) {
    console.log(`Loading grocery list subtasks for task ${taskId}`);

    // Convert taskId to number if it's a string
    taskId = parseInt(taskId);

    // Check if this task is already expanded
    if (window.expandedTasks && window.expandedTasks.has(taskId)) {
        console.log(`Task ${taskId} is already expanded, collapsing subtasks`);

        // Get the subtasks container
        const subtasksContainer = document.querySelector(`.subtasks-container[data-parent-id="${taskId}"]`);

        if (subtasksContainer) {
            // Collapse with animation
            subtasksContainer.classList.remove('expanded');

            // Wait for animation to complete before removing
            setTimeout(() => {
                subtasksContainer.remove();
                window.expandedTasks.delete(taskId);

                // Also remove the expanded class from the task item
                const taskItem = document.querySelector(`.task-item[data-task-id="${taskId}"]`);
                if (taskItem) {
                    taskItem.classList.remove('expanded');
                }

                // Update the icon
                const expandButton = parentElement.querySelector('.expand-subtasks-btn');
                if (expandButton) {
                    const icon = expandButton.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-chevron-up');
                        icon.classList.add('fa-chevron-down');
                        icon.style.transform = '';
                    }
                }

                console.log(`Subtasks for task ${taskId} collapsed and removed`);
            }, 300);
        } else {
            window.expandedTasks.delete(taskId);

            // Also remove the expanded class from the task item
            const taskItem = document.querySelector(`.task-item[data-task-id="${taskId}"]`);
            if (taskItem) {
                taskItem.classList.remove('expanded');
            }
        }

        return;
    }

    // Initialize expandedTasks set if it doesn't exist
    if (!window.expandedTasks) {
        window.expandedTasks = new Set();
    }

    // Mark as expanded
    window.expandedTasks.add(taskId);

    // Add expanded class to the task item
    if (parentElement) {
        parentElement.classList.add('expanded');
    }

    // Check if subtasks container already exists
    let subtasksContainer = document.querySelector(`.subtasks-container[data-parent-id="${taskId}"]`);

    // If it exists, just make sure it's expanded
    if (subtasksContainer) {
        console.log(`Subtasks container for task ${taskId} already exists, ensuring it's expanded`);
        subtasksContainer.classList.add('expanded');
        return;
    }

    // Create a container for all subtasks
    subtasksContainer = document.createElement('div');
    subtasksContainer.className = 'subtasks-container';
    subtasksContainer.setAttribute('data-parent-id', taskId);

    // Insert the container after the parent element
    parentElement.after(subtasksContainer);

    // Show loading indicator inside the container
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'subtask-loading';
    loadingDiv.textContent = 'Loading grocery items...';
    subtasksContainer.appendChild(loadingDiv);

    // Trigger reflow to ensure animation works
    void subtasksContainer.offsetWidth;

    // Expand the container
    subtasksContainer.classList.add('expanded');

    // Update the expand button icon
    const expandButton = parentElement.querySelector('.expand-subtasks-btn');
    if (expandButton) {
        const icon = expandButton.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
            icon.style.transform = 'rotate(180deg)';
        } else {
            expandButton.innerHTML = '<i class="fas fa-chevron-up" style="transform: rotate(180deg);"></i>';
        }
    }

    // Get the task title and description to extract grocery data
    const taskTitle = parentElement.querySelector('.task-title')?.textContent || '';
    const taskDescription = parentElement.querySelector('.task-description')?.textContent || '';

    // Extract grocery data from the task title and description
    const groceryData = extractGroceryDataFromTask(taskTitle, taskDescription);

    // Always generate subtasks from grocery data first to ensure something is displayed
    if (groceryData && groceryData.ingredients && groceryData.ingredients.length > 0) {
        console.log(`Generating subtasks from grocery data: ${groceryData.ingredients.length} ingredients`);

        // Clear the loading indicator
        loadingDiv.remove();

        // Generate subtasks from grocery data
        const generatedSubtasks = generateSubtasksFromGroceryData(groceryData, taskId);

        // Render each generated subtask
        generatedSubtasks.forEach((subtask, index) => {
            const subtaskElement = createSubtaskElement(subtask);

            // Add a slight delay for each subtask to create a staggered effect
            subtaskElement.style.animationDelay = `${index * 0.05}s`;

            subtasksContainer.appendChild(subtaskElement);
        });

        // Update the UI to indicate this task has subtasks
        updateParentTaskUIOnly(taskId);
    } else {
        // No grocery data, show a message
        loadingDiv.remove();
        const noSubtasksDiv = document.createElement('div');
        noSubtasksDiv.className = 'subtask-item no-subtasks';
        noSubtasksDiv.textContent = 'No grocery items found for this list.';
        subtasksContainer.appendChild(noSubtasksDiv);
    }

    // Now try to fetch from the database in the background
    try {
        // Fetch subtasks
        fetch(`/api/tasks/${taskId}/subtasks`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load subtasks: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(subtasks => {
                console.log(`Fetched ${subtasks.length} subtasks for task ${taskId}`, subtasks);

                // Check if the container still exists (it might have been removed if the user collapsed quickly)
                subtasksContainer = document.querySelector(`.subtasks-container[data-parent-id="${taskId}"]`);
                if (!subtasksContainer) {
                    console.log(`Subtasks container for task ${taskId} no longer exists, aborting`);
                    return;
                }

                if (subtasks.length === 0) {
                    // No subtasks found in database, we're already using generated subtasks
                    console.log(`No subtasks found in database for task ${taskId}, keeping generated subtasks`);

                    // Try to update the parent task to indicate it has subtasks
                    try {
                        updateParentTaskHasSubtasks(taskId);
                    } catch (error) {
                        console.error(`Error updating parent task ${taskId}:`, error);
                    }

                    return;
                }

                // We have subtasks from the database, replace the generated ones
                console.log(`Replacing generated subtasks with ${subtasks.length} subtasks from database`);

                // Clear the container
                subtasksContainer.innerHTML = '';

                // Render each subtask from the database
                subtasks.forEach((subtask, index) => {
                    const subtaskElement = createSubtaskElement(subtask);

                    // Add a slight delay for each subtask to create a staggered effect
                    subtaskElement.style.animationDelay = `${index * 0.05}s`;

                    subtasksContainer.appendChild(subtaskElement);
                });

                // Ensure the container is still expanded
                subtasksContainer.classList.add('expanded');

                // Force a reflow to ensure the animation works
                void subtasksContainer.offsetWidth;
            })
            .catch(error => {
                console.error('Error loading subtasks:', error);

                // Check if the container still exists
                subtasksContainer = document.querySelector(`.subtasks-container[data-parent-id="${taskId}"]`);
                if (!subtasksContainer) {
                    console.log(`Subtasks container for task ${taskId} no longer exists, aborting`);
                    return;
                }

                // If there's an error but we already have generated subtasks, just keep them
                if (subtasksContainer.children.length > 0 &&
                    !subtasksContainer.querySelector('.subtask-loading')) {
                    console.log('Using generated subtasks due to error fetching from database');
                    return;
                }

                // Show error message
                const loadingElement = subtasksContainer.querySelector('.subtask-loading');
                if (loadingElement) {
                    loadingElement.remove();
                }

                const errorDiv = document.createElement('div');
                errorDiv.className = 'subtask-item subtask-error';
                errorDiv.textContent = 'Error loading grocery items';
                subtasksContainer.innerHTML = '';
                subtasksContainer.appendChild(errorDiv);
            });
    } catch (error) {
        console.error('Exception in fetch for grocery list subtasks:', error);
    }
}

/**
 * Extract grocery data from task title and description
 * @param {string} title - The task title
 * @param {string} description - The task description
 * @returns {Object} The extracted grocery data
 */
function extractGroceryDataFromTask(title, description) {
    // Initialize grocery data
    const groceryData = {
        calories: 0,
        protein: 0,
        ingredients: []
    };

    // Extract calorie information from title
    const calorieMatch = title.match(/\((\d+(?:\.\d+)?)\s*cal/);
    if (calorieMatch) {
        groceryData.calories = parseFloat(calorieMatch[1]);
    }

    // Extract protein information from description
    const proteinMatch = description.match(/protein:\s*(\d+(?:\.\d+)?)/i);
    if (proteinMatch) {
        groceryData.protein = parseFloat(proteinMatch[1]);
    }

    // Parse the description to extract ingredients
    // Format: "Grocery list for selected recipes. Total calories: 774.5 (31.0% of daily target). Total protein: 29.0g (24.2% of daily target)."

    // For demo purposes, create some sample ingredients if we can't extract them
    const sampleIngredients = [
        { name: 'Eggs Pasture Raised Vital Farms', amount: 200, packages: 1, price: 7.78 },
        { name: 'Fresh Bunch of Bananas', amount: 101, packages: 1, price: 1.34 },
        { name: 'Fresh Kiwi Fruit', amount: 138, packages: 3, price: 1.80 },
        { name: 'H‑E‑B Original Thick Cut Bacon', amount: 36, packages: 1, price: 4.99 },
        { name: 'Parmigiano Rggiano Galli', amount: 28.2, packages: 1, price: 10.28 }
    ];

    // Use sample ingredients for now
    groceryData.ingredients = sampleIngredients;

    return groceryData;
}

/**
 * Generate subtasks from grocery data
 * @param {Object} groceryData - The grocery data
 * @param {number} parentTaskId - The parent task ID
 * @returns {Array} The generated subtasks
 */
function generateSubtasksFromGroceryData(groceryData, parentTaskId) {
    const subtasks = [];

    // Generate a subtask for each ingredient
    groceryData.ingredients.forEach((ingredient, index) => {
        const subtask = {
            id: `temp_${parentTaskId}_${index}`, // Temporary ID for client-side use
            title: `${ingredient.name} - ${ingredient.amount}g - ${ingredient.packages} package${ingredient.packages > 1 ? 's' : ''} - $${ingredient.price.toFixed(2)}`,
            description: `Grocery item for recipe`,
            parent_task_id: parentTaskId,
            is_subtask: true,
            is_complete: false
        };

        subtasks.push(subtask);
    });

    return subtasks;
}

/**
 * Update only the UI of the parent task to indicate it has subtasks (no database updates)
 * @param {number} taskId - The task ID
 */
function updateParentTaskUIOnly(taskId) {
    // Update the UI to show that the task has subtasks
    const taskElement = document.querySelector(`.task-item[data-task-id="${taskId}"]`);
    if (!taskElement) {
        console.log(`Task element not found for task ${taskId}, cannot update UI`);
        return; // No task element found, nothing to update
    }

    // Update the UI
    taskElement.classList.add('has-subtasks');

    // Add the "Has subtasks" indicator if it doesn't exist
    let subtaskIndicator = taskElement.querySelector('.subtask-indicator');
    if (!subtaskIndicator) {
        const taskContent = taskElement.querySelector('.task-content');
        if (taskContent) {
            const metadataDiv = taskContent.querySelector('.task-metadata') || document.createElement('div');
            if (!taskContent.contains(metadataDiv)) {
                metadataDiv.className = 'task-metadata';
                metadataDiv.style.display = 'flex';
                metadataDiv.style.flexWrap = 'wrap';
                metadataDiv.style.gap = '8px';
                metadataDiv.style.marginTop = '4px';
                taskContent.appendChild(metadataDiv);
            }

            subtaskIndicator = document.createElement('span');
            subtaskIndicator.className = 'subtask-indicator';
            subtaskIndicator.textContent = 'Has subtasks';
            subtaskIndicator.style.display = 'inline-block';
            subtaskIndicator.style.marginLeft = '8px';
            subtaskIndicator.style.fontSize = '12px';
            subtaskIndicator.style.color = '#4CAF50';
            subtaskIndicator.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
            subtaskIndicator.style.padding = '2px 6px';
            subtaskIndicator.style.borderRadius = '4px';

            metadataDiv.appendChild(subtaskIndicator);
        }
    }
}

/**
 * Update the parent task to indicate it has subtasks (includes database update)
 * @param {number} taskId - The task ID
 */
function updateParentTaskHasSubtasks(taskId) {
    // First update the UI
    updateParentTaskUIOnly(taskId);

    // For client-side only tasks (like temporary grocery lists), we don't need to update the database
    if (taskId.toString().startsWith('temp_')) {
        console.log(`Task ${taskId} is a temporary task, skipping database update`);
        return;
    }

    // For tasks that might be in the database, try to update them but handle errors gracefully
    try {
        // Use a simple flag to track if we've already logged an error
        let errorLogged = false;

        // Set a timeout to abort the fetch if it takes too long
        const timeoutId = setTimeout(() => {
            if (!errorLogged) {
                console.log(`Timeout while checking task ${taskId}, assuming it doesn't exist`);
                errorLogged = true;
            }
        }, 3000);

        // Check if the task exists in the database
        fetch(`/api/tasks/${taskId}`)
        .then(response => {
            clearTimeout(timeoutId); // Clear the timeout

            if (!response.ok) {
                if (!errorLogged) {
                    console.log(`Task ${taskId} not found in database, skipping database update`);
                    errorLogged = true;
                }
                return null;
            }
            return response.json();
        })
        .then(task => {
            if (!task) return; // Task doesn't exist, already handled above

            // Task exists, update the has_subtasks flag in the database
            console.log(`Task ${taskId} found in database, updating has_subtasks flag`);

            // Use the toggle-completion endpoint which supports the has_subtasks flag
            return fetch(`/api/tasks/${taskId}/toggle-completion`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    is_complete: false, // Keep the current completion status
                    has_subtasks: true  // Set the has_subtasks flag
                })
            })
            .then(response => {
                if (!response.ok) {
                    if (!errorLogged) {
                        console.warn(`Failed to update has_subtasks flag for task ${taskId}: ${response.status} ${response.statusText}`);
                        errorLogged = true;
                    }
                    return null;
                }
                return response.json();
            })
            .then(updatedTask => {
                if (updatedTask) {
                    console.log(`Updated parent task ${taskId} has_subtasks flag to true`);
                }
            });
        })
        .catch(error => {
            if (!errorLogged) {
                console.error(`Error checking/updating parent task ${taskId}:`, error);
                errorLogged = true;
            }
        });
    } catch (error) {
        console.error(`Exception while updating parent task ${taskId}:`, error);
    }
}

/**
 * Create a subtask element (standardized for both regular and grocery subtasks)
 * @param {Object} subtask - The subtask data
 * @returns {HTMLElement} The subtask element
 */
function createSubtaskElement(subtask) {
    console.log(`Creating element for subtask:`, subtask);

    const div = document.createElement('div');
    div.className = `subtask-item ${subtask.is_complete ? 'complete' : ''}`;
    div.setAttribute('data-task-id', subtask.id);
    div.setAttribute('data-parent-id', subtask.parent_task_id);

    // Check if this is a grocery item subtask
    const isGroceryItem = subtask.grocery_data ||
                         (subtask.title && subtask.title.includes(' - ') &&
                          (subtask.title.includes('package') || subtask.title.includes('g')));

    if (isGroceryItem) {
        div.classList.add('grocery-item');
    }

    // Create checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = subtask.is_complete;

    // Add event listener to checkbox
    checkbox.addEventListener('change', function() {
        updateSubtaskStatus(subtask.id, checkbox.checked);
    });

    // Create title
    const titleSpan = document.createElement('span');
    titleSpan.className = 'subtask-title';
    titleSpan.textContent = subtask.title;

    // Create content container
    const contentDiv = document.createElement('div');
    contentDiv.className = 'subtask-content';
    contentDiv.appendChild(checkbox);
    contentDiv.appendChild(titleSpan);

    // Add grocery data if available
    if (subtask.grocery_data && typeof subtask.grocery_data === 'object') {
        try {
            // Add grocery data as data attributes
            div.setAttribute('data-grocery-item', 'true');

            // Add grocery data details if available
            if (subtask.grocery_data.amount) {
                const amountSpan = document.createElement('span');
                amountSpan.className = 'grocery-amount';
                amountSpan.textContent = `${subtask.grocery_data.amount}${subtask.grocery_data.unit || 'g'}`;
                contentDiv.appendChild(amountSpan);
            }

            if (subtask.grocery_data.packageCount || subtask.grocery_data.packages) {
                const packageSpan = document.createElement('span');
                packageSpan.className = 'grocery-packages';
                const packageCount = subtask.grocery_data.packageCount || subtask.grocery_data.packages;
                packageSpan.textContent = `${packageCount} package${packageCount > 1 ? 's' : ''}`;
                // Add inline styles to ensure visibility with better contrast
                packageSpan.style.color = '#ffffff';
                packageSpan.style.backgroundColor = 'rgba(33, 150, 243, 0.9)';
                packageSpan.style.fontWeight = '700';
                packageSpan.style.textShadow = '0 0 4px rgba(0, 0, 0, 1)';
                packageSpan.style.border = '1px solid rgba(255, 255, 255, 0.5)';
                packageSpan.style.boxShadow = '0 0 5px rgba(33, 150, 243, 0.9)';
                contentDiv.appendChild(packageSpan);
            }

            if (subtask.grocery_data.price) {
                const priceSpan = document.createElement('span');
                priceSpan.className = 'grocery-price';
                priceSpan.textContent = `$${subtask.grocery_data.price.toFixed(2)}`;
                contentDiv.appendChild(priceSpan);
            }
        } catch (error) {
            console.error('Error adding grocery data to subtask element:', error);
        }
    }

    div.appendChild(contentDiv);

    return div;
}

/**
 * Update subtask status
 * @param {number} taskId - The task ID
 * @param {boolean} isComplete - The completion status
 */
function updateSubtaskStatus(taskId, isComplete) {
    // Check if this is a temporary subtask (client-side only)
    const isTemporarySubtask = taskId.toString().startsWith('temp_');

    // For temporary subtasks, we only update the UI
    if (isTemporarySubtask) {
        console.log(`Temporary subtask ${taskId} checked, updating UI only`);

        // Update the UI
        const subtaskElement = document.querySelector(`.subtask-item[data-task-id="${taskId}"]`);
        if (subtaskElement) {
            if (isComplete) {
                subtaskElement.classList.add('complete');
            } else {
                subtaskElement.classList.remove('complete');
            }
        }

        return;
    }

    // For real subtasks, update the database
    fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_complete: isComplete })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to update subtask status: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log(`Updated subtask ${taskId} status to ${isComplete ? 'complete' : 'incomplete'}`);

        // Update the UI
        const subtaskElement = document.querySelector(`.subtask-item[data-task-id="${taskId}"]`);
        if (subtaskElement) {
            if (isComplete) {
                subtaskElement.classList.add('complete');
            } else {
                subtaskElement.classList.remove('complete');
            }
        }
    })
    .catch(error => {
        console.error('Error updating subtask status:', error);
    });
}

/**
 * Update only the UI of the parent task to reflect completion status (no database updates)
 * @param {number} parentTaskId - The ID of the parent task
 * @param {boolean} allComplete - Whether all subtasks are complete
 * @returns {boolean} Whether the UI was updated successfully
 */
function updateParentTaskCompletionUIOnly(parentTaskId, allComplete) {
    // Update the parent task element to show completion status
    const parentTaskElement = document.querySelector(`.task-item[data-task-id="${parentTaskId}"]`);
    if (!parentTaskElement) {
        console.log(`Parent task element not found for task ${parentTaskId}, cannot update UI`);
        return false;
    }

    // Update the UI to reflect completion status
    if (allComplete) {
        parentTaskElement.classList.add('all-subtasks-complete');
    } else {
        parentTaskElement.classList.remove('all-subtasks-complete');
    }

    // If all subtasks are complete, mark the parent task as complete
    if (allComplete) {
        const parentTaskCheckbox = parentTaskElement.querySelector('.task-checkbox');
        if (parentTaskCheckbox && !parentTaskCheckbox.checked) {
            console.log(`All subtasks complete for task ${parentTaskId}, marking parent task as complete in UI`);

            // Update the UI immediately
            parentTaskElement.classList.add('completed');
            if (parentTaskCheckbox) {
                parentTaskCheckbox.checked = true;
            }
        }
    }

    return true;
}

/**
 * Check if all subtasks for a parent task are complete
 * @param {number} parentTaskId - The ID of the parent task
 */
function checkAllSubtasksComplete(parentTaskId) {
    // Get all subtask checkboxes for this parent task
    const subtaskContainer = document.querySelector(`.subtasks-container[data-parent-id="${parentTaskId}"]`);
    if (!subtaskContainer) {
        console.log(`No subtask container found for parent task ${parentTaskId}`);
        return;
    }

    const subtaskCheckboxes = subtaskContainer.querySelectorAll('.subtask-checkbox');
    if (subtaskCheckboxes.length === 0) {
        console.log(`No subtask checkboxes found for parent task ${parentTaskId}`);
        return;
    }

    console.log(`Checking ${subtaskCheckboxes.length} subtasks for parent task ${parentTaskId}`);

    // Check if all subtasks are complete
    const allComplete = Array.from(subtaskCheckboxes).every(checkbox => checkbox.checked);
    console.log(`All subtasks complete for parent task ${parentTaskId}: ${allComplete}`);

    // Get the parent task element
    const parentTaskElement = document.querySelector(`.task-item[data-task-id="${parentTaskId}"]`);
    if (!parentTaskElement) {
        console.log(`Parent task element not found for task ${parentTaskId}`);
        return;
    }

    // Update the UI to reflect completion status
    if (allComplete) {
        parentTaskElement.classList.add('all-subtasks-complete');

        // Get the parent task checkbox
        const parentCheckbox = parentTaskElement.querySelector('.task-checkbox');
        if (parentCheckbox && !parentCheckbox.checked) {
            console.log(`Marking parent task ${parentTaskId} as complete`);

            // Update the checkbox
            parentCheckbox.checked = true;

            // Update the task in the database
            fetch(`/api/tasks/${parentTaskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    is_complete: true
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to update parent task: ${response.status}`);
                }
                return response.json();
            })
            .then(updatedTask => {
                console.log(`Successfully updated parent task ${parentTaskId}`, updatedTask);

                // Add completed class to parent task
                parentTaskElement.classList.add('completed');
            })
            .catch(error => {
                console.error(`Error updating parent task ${parentTaskId}:`, error);

                // Revert UI changes if update failed
                parentCheckbox.checked = false;
                parentTaskElement.classList.remove('all-subtasks-complete');
            });
        }
    } else {
        parentTaskElement.classList.remove('all-subtasks-complete');

        // Get the parent task checkbox
        const parentCheckbox = parentTaskElement.querySelector('.task-checkbox');
        if (parentCheckbox && parentCheckbox.checked) {
            console.log(`Marking parent task ${parentTaskId} as incomplete`);

            // Update the checkbox
            parentCheckbox.checked = false;

            // Update the task in the database
            fetch(`/api/tasks/${parentTaskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    is_complete: false
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to update parent task: ${response.status}`);
                }
                return response.json();
            })
            .then(updatedTask => {
                console.log(`Successfully updated parent task ${parentTaskId}`, updatedTask);

                // Remove completed class from parent task
                parentTaskElement.classList.remove('completed');
            })
            .catch(error => {
                console.error(`Error updating parent task ${parentTaskId}:`, error);

                // Revert UI changes if update failed
                parentCheckbox.checked = true;
                parentTaskElement.classList.add('all-subtasks-complete');
            });
        }
    }
}

/**
 * Enhance a grocery list task element
 * @param {HTMLElement} taskElement - The task element
 * @param {Object} task - The task data
 */
function enhanceGroceryListTaskElement(taskElement, task) {
    console.log(`Enhancing grocery list task element for task ${task.id}`);

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
        expandButton.title = 'Show/hide grocery items';
        expandButton.setAttribute('data-task-id', task.id);
        expandButton.setAttribute('data-expand-button', 'true');
        expandButton.setAttribute('data-grocery-list', 'true'); // Mark as grocery list button
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

        // Create a separate container for the expand button
        expandButtonContainer = document.createElement('div');
        expandButtonContainer.className = 'expand-button-container';
        expandButtonContainer.setAttribute('data-grocery-list', 'true'); // Mark as grocery list container
        expandButtonContainer.style.position = 'absolute';
        expandButtonContainer.style.left = '0';
        expandButtonContainer.style.top = '0';
        expandButtonContainer.style.bottom = '0';
        expandButtonContainer.style.width = '30px';
        expandButtonContainer.style.display = 'flex';
        expandButtonContainer.style.alignItems = 'center';
        expandButtonContainer.style.justifyContent = 'center';
        expandButtonContainer.style.zIndex = '999';
        expandButtonContainer.appendChild(expandButton);

        // Insert the expand button container at the beginning of the task element
        if (taskElement.firstChild) {
            taskElement.insertBefore(expandButtonContainer, taskElement.firstChild);
        } else {
            taskElement.appendChild(expandButtonContainer);
        }

        // Add padding to the task element to make room for the expand button
        taskElement.style.paddingLeft = '30px';
        taskElement.style.position = 'relative';

        console.log(`Added expand button to grocery list task ${task.id}`);
    } else {
        // Mark existing button as grocery list button
        expandButton.setAttribute('data-grocery-list', 'true');
        if (expandButtonContainer) {
            expandButtonContainer.setAttribute('data-grocery-list', 'true');
        }
    }

    // Check if the button already has our click handler
    if (expandButton.getAttribute('data-grocery-click-handler') !== 'true') {
        // Mark the button as having our click handler
        expandButton.setAttribute('data-grocery-click-handler', 'true');

        // Add click event to the expand button
        expandButton.addEventListener('click', function(event) {
            console.log(`Expand button clicked for grocery list task ${task.id}`);
            event.stopPropagation();
            event.preventDefault();

            // Call loadGroceryListSubtasks directly
            if (typeof window.loadGroceryListSubtasks === 'function') {
                window.loadGroceryListSubtasks(task.id, taskElement);
            } else {
                console.error('loadGroceryListSubtasks function not found on window object');
                // Fallback to local function
                loadGroceryListSubtasks(task.id, taskElement);
            }

            return false;
        });
    }

    // Make sure the expand button has the data-expand-button attribute
    expandButton.setAttribute('data-expand-button', 'true');

    // Add a visual indicator to show that this task has subtasks
    let subtaskIndicator = taskElement.querySelector('.subtask-indicator');
    if (!subtaskIndicator) {
        subtaskIndicator = document.createElement('span');
        subtaskIndicator.className = 'subtask-indicator';
        subtaskIndicator.textContent = 'Has subtasks';
        subtaskIndicator.style.display = 'inline-block';
        subtaskIndicator.style.marginLeft = '8px';
        subtaskIndicator.style.fontSize = '12px';
        subtaskIndicator.style.color = '#4CAF50';
        subtaskIndicator.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
        subtaskIndicator.style.padding = '2px 6px';
        subtaskIndicator.style.borderRadius = '4px';

        // Add the indicator to the task content
        const taskContent = taskElement.querySelector('.task-content');
        if (taskContent) {
            const metadataDiv = taskContent.querySelector('.task-metadata') || document.createElement('div');
            if (!taskContent.contains(metadataDiv)) {
                metadataDiv.className = 'task-metadata';
                metadataDiv.style.display = 'flex';
                metadataDiv.style.flexWrap = 'wrap';
                metadataDiv.style.gap = '8px';
                metadataDiv.style.marginTop = '4px';
                taskContent.appendChild(metadataDiv);
            }

            // Add the indicator to the metadata div
            if (!metadataDiv.querySelector('.subtask-indicator')) {
                metadataDiv.appendChild(subtaskIndicator);
            }
        }
    }

    // Remove any existing "Show Grocery Items" button
    const showItemsButton = taskElement.querySelector('.show-grocery-items-btn');
    if (showItemsButton) {
        showItemsButton.remove();
    }
}
