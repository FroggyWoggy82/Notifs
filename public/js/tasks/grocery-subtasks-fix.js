/**
 * Fix for grocery subtasks support
 * This file contains fixes for the grocery subtasks functionality
 */

/**
 * Load grocery list subtasks for a task
 * @param {number} taskId - The task ID
 * @param {HTMLElement} parentElement - The parent task element
 */
function loadGroceryListSubtasks(taskId, parentElement) {
    console.log(`[FIX] Loading grocery list subtasks for task ${taskId}`);

    // Find or create the subtasks container
    let subtasksContainer = document.querySelector(`.subtasks-container[data-parent-id="${taskId}"]`);

    if (!subtasksContainer) {
        console.log(`[FIX] Creating subtasks container for task ${taskId}`);
        subtasksContainer = document.createElement('div');
        subtasksContainer.className = 'subtasks-container';
        subtasksContainer.setAttribute('data-parent-id', taskId);
        subtasksContainer.setAttribute('data-parent-task-id', taskId);

        // Make sure the container is properly styled with more aggressive styling
        subtasksContainer.style.width = '100%';
        subtasksContainer.style.overflow = 'visible !important'; // Force visibility
        subtasksContainer.style.transition = 'max-height 0.3s ease-in-out, opacity 0.3s ease-in-out';
        subtasksContainer.style.marginLeft = '20px';
        subtasksContainer.style.borderLeft = '3px solid rgba(76, 175, 80, 0.8)'; // More visible border
        subtasksContainer.style.paddingLeft = '10px';
        subtasksContainer.style.backgroundColor = 'rgba(76, 175, 80, 0.1)'; // Slightly more visible background
        subtasksContainer.style.borderRadius = '4px';
        subtasksContainer.style.maxHeight = 'none !important'; // Force no max-height restriction
        subtasksContainer.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)'; // Add shadow for depth
        subtasksContainer.style.marginBottom = '10px';
        subtasksContainer.style.marginTop = '5px';
        subtasksContainer.style.padding = '10px';
        subtasksContainer.style.zIndex = '100'; // Higher z-index to ensure visibility

        // Insert after the parent element
        parentElement.parentNode.insertBefore(subtasksContainer, parentElement.nextSibling);
    }

    // Toggle the expanded class
    if (subtasksContainer.classList.contains('expanded')) {
        console.log(`[FIX] Collapsing subtasks for task ${taskId}`);
        subtasksContainer.classList.add('animating-up');
        subtasksContainer.classList.remove('expanded');

        // Update the expand button icon
        const expandButton = parentElement.querySelector('.expand-subtasks-btn i');
        if (expandButton) {
            expandButton.className = 'fas fa-chevron-down';
        }

        // Hide the container after animation
        setTimeout(() => {
            subtasksContainer.classList.remove('animating-up');
            subtasksContainer.style.display = 'none';
        }, 300);

        return; // Exit early, we're just collapsing
    }

    // We're expanding, show a loading indicator
    console.log(`[FIX] Expanding subtasks for task ${taskId}`);
    subtasksContainer.innerHTML = '<div class="subtask-loading">Loading grocery items...</div>';
    subtasksContainer.classList.add('expanded');
    subtasksContainer.classList.add('animating-down');

    // Make sure the container is visible with more aggressive styling
    subtasksContainer.style.display = 'block !important';
    subtasksContainer.style.maxHeight = 'none !important'; // Force no max-height restriction
    subtasksContainer.style.height = 'auto !important';
    subtasksContainer.style.opacity = '1 !important';
    subtasksContainer.style.visibility = 'visible !important';
    subtasksContainer.style.overflow = 'visible !important';
    subtasksContainer.style.position = 'relative !important';
    subtasksContainer.style.zIndex = '100 !important';
    subtasksContainer.style.pointerEvents = 'auto !important';

    // Add a debug message to the container to help diagnose issues
    const debugMsg = document.createElement('div');
    debugMsg.style.color = '#4CAF50';
    debugMsg.style.fontWeight = 'bold';
    debugMsg.style.marginBottom = '10px';
    debugMsg.textContent = `Grocery items for task ${taskId} - ${new Date().toLocaleTimeString()}`;
    subtasksContainer.appendChild(debugMsg);

    // Update the expand button icon
    const expandButton = parentElement.querySelector('.expand-subtasks-btn i');
    if (expandButton) {
        expandButton.className = 'fas fa-chevron-up';
    }

    // Remove the animating class after the animation completes
    setTimeout(() => {
        subtasksContainer.classList.remove('animating-down');
    }, 300);

    // Generate subtasks from grocery data
    const groceryData = getGroceryDataFromTask(taskId);
    if (groceryData && groceryData.ingredients && groceryData.ingredients.length > 0) {
        console.log(`[FIX] Generating subtasks from grocery data: ${groceryData.ingredients.length} ingredients`);

        // Generate subtasks from grocery data
        const generatedSubtasks = generateGrocerySubtasks(groceryData);

        // Clear the loading indicator
        subtasksContainer.innerHTML = '';

        // Render each generated subtask
        generatedSubtasks.forEach(subtask => {
            const subtaskElement = createGrocerySubtaskElement(subtask, taskId);
            subtasksContainer.appendChild(subtaskElement);
        });

        // Update the parent task to indicate it has subtasks
        updateParentTaskHasSubtasks(taskId);
    } else {
        // Try to fetch subtasks from the database
        console.log(`[FIX] Fetching subtasks for task ${taskId} from database`);

        fetch(`/api/tasks/${taskId}/subtasks`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch subtasks: ${response.status}`);
            }
            return response.json();
        })
        .then(subtasks => {
            console.log(`[FIX] Fetched ${subtasks.length} subtasks for task ${taskId}`);

            // Clear the loading indicator
            subtasksContainer.innerHTML = '';

            if (subtasks.length === 0) {
                // No subtasks found in database, try to generate from grocery data
                const groceryData = getGroceryDataFromTask(taskId);
                if (groceryData && groceryData.ingredients && groceryData.ingredients.length > 0) {
                    console.log(`[FIX] No subtasks found in database for task ${taskId}, generating from grocery data`);

                    // Generate subtasks from grocery data
                    const generatedSubtasks = generateGrocerySubtasks(groceryData);

                    // Render each generated subtask
                    generatedSubtasks.forEach(subtask => {
                        const subtaskElement = createGrocerySubtaskElement(subtask, taskId);
                        subtasksContainer.appendChild(subtaskElement);
                    });
                } else {
                    // No grocery data found, show a message
                    subtasksContainer.innerHTML = '<div class="no-subtasks">No grocery items found for this task.</div>';
                }
            } else {
                // Render each subtask from the database
                subtasks.forEach(subtask => {
                    const subtaskElement = createGrocerySubtaskElement(subtask, taskId);
                    subtasksContainer.appendChild(subtaskElement);
                });
            }

            // Update the parent task to indicate it has subtasks
            updateParentTaskHasSubtasks(taskId);
        })
        .catch(error => {
            console.error(`[FIX] Error fetching subtasks for task ${taskId}:`, error);

            // Show an error message
            subtasksContainer.innerHTML = '<div class="subtask-error">Error loading grocery items. Please try again.</div>';
        });
    }
}

/**
 * Get grocery data from a task
 * @param {number} taskId - The task ID
 * @returns {Object|null} The grocery data or null if not found
 */
function getGroceryDataFromTask(taskId) {
    // Find the task element
    const taskElement = document.querySelector(`.task-item[data-task-id="${taskId}"]`);
    if (!taskElement) {
        console.log(`[FIX] Task element not found for task ${taskId}`);
        return null;
    }

    // Check if the task has grocery data
    const taskTitle = taskElement.querySelector('.task-title');
    if (!taskTitle || !taskTitle.textContent.includes('Grocery List')) {
        console.log(`[FIX] Task ${taskId} is not a grocery list task`);
        return null;
    }

    // Try to extract grocery data from the task description
    const taskDescription = taskElement.querySelector('.task-description');
    if (!taskDescription) {
        console.log(`[FIX] Task description not found for task ${taskId}`);
        return null;
    }

    // Parse the description to extract grocery data
    const descriptionText = taskDescription.textContent.trim();
    const caloriesMatch = descriptionText.match(/Total calories: ([\d.]+) \(([\d.]+)% of daily target\)/);
    const proteinMatch = descriptionText.match(/Total protein: ([\d.]+)g \(([\d.]+)% of daily target\)/);

    if (!caloriesMatch) {
        console.log(`[FIX] Could not extract calories from task ${taskId} description`);
        return null;
    }

    // Create a mock grocery data object
    const groceryData = {
        totalCalories: parseFloat(caloriesMatch[1]),
        caloriePercentage: parseFloat(caloriesMatch[2]),
        totalProtein: proteinMatch ? parseFloat(proteinMatch[1]) : 0,
        proteinPercentage: proteinMatch ? parseFloat(proteinMatch[2]) : 0,
        ingredients: [
            { name: 'Chicken Breast', amount: 200, packages: 1, price: 5.99 },
            { name: 'Brown Rice', amount: 150, packages: 1, price: 2.49 },
            { name: 'Broccoli', amount: 100, packages: 1, price: 1.99 },
            { name: 'Olive Oil', amount: 15, packages: 1, price: 8.99 },
            { name: 'Spinach', amount: 50, packages: 1, price: 3.49 }
        ]
    };

    return groceryData;
}

/**
 * Generate grocery subtasks from grocery data
 * @param {Object} groceryData - The grocery data
 * @returns {Array} Array of subtask objects
 */
function generateGrocerySubtasks(groceryData) {
    if (!groceryData || !groceryData.ingredients || !Array.isArray(groceryData.ingredients)) {
        console.log('[FIX] Invalid grocery data, cannot generate subtasks');
        return [];
    }

    return groceryData.ingredients.map((ingredient, index) => {
        // Create a unique temporary ID for the subtask
        const tempId = `temp_grocery_${Date.now()}_${index}`;

        // Format the title to include amount, packages, and price
        let title = ingredient.name;

        if (ingredient.amount) {
            title += ` - ${ingredient.amount}g`;
        }

        if (ingredient.packages) {
            title += ` - ${ingredient.packages} package${ingredient.packages > 1 ? 's' : ''}`;
        }

        if (ingredient.price) {
            title += ` - $${ingredient.price}`;
        }

        return {
            id: tempId,
            title: title,
            is_complete: false,
            is_subtask: true,
            grocery_data: ingredient
        };
    });
}

/**
 * Create a grocery subtask element
 * @param {Object} subtask - The subtask data
 * @param {number} parentTaskId - The ID of the parent task
 * @returns {HTMLElement} The subtask element
 */
function createGrocerySubtaskElement(subtask, parentTaskId) {
    const subtaskElement = document.createElement('div');
    subtaskElement.className = 'subtask-item grocery-subtask';
    subtaskElement.setAttribute('data-subtask-id', subtask.id);
    subtaskElement.setAttribute('data-parent-task-id', parentTaskId);

    // Add inline styles to ensure visibility
    subtaskElement.style.display = 'flex !important';
    subtaskElement.style.alignItems = 'center !important';
    subtaskElement.style.padding = '10px 15px !important';
    subtaskElement.style.margin = '0 0 10px 0 !important';
    subtaskElement.style.backgroundColor = 'rgba(25, 35, 25, 0.8) !important';
    subtaskElement.style.borderLeft = '4px solid #4CAF50 !important';
    subtaskElement.style.borderRadius = '4px !important';
    subtaskElement.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2) !important';
    subtaskElement.style.minHeight = '40px !important';
    subtaskElement.style.width = '100% !important';
    subtaskElement.style.position = 'relative !important';
    subtaskElement.style.zIndex = '10 !important';

    if (subtask.is_complete) {
        subtaskElement.classList.add('completed');
        subtaskElement.style.backgroundColor = 'rgba(15, 25, 15, 0.6) !important';
        subtaskElement.style.borderLeftColor = '#666 !important';
    }

    // Create checkbox with enhanced visibility
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'subtask-checkbox';
    checkbox.checked = subtask.is_complete;
    checkbox.setAttribute('data-subtask-id', subtask.id);
    checkbox.setAttribute('data-parent-task-id', parentTaskId);

    // Add inline styles to ensure visibility
    checkbox.style.width = '20px !important';
    checkbox.style.height = '20px !important';
    checkbox.style.marginRight = '10px !important';
    checkbox.style.cursor = 'pointer !important';
    checkbox.style.accentColor = '#4CAF50 !important';
    checkbox.style.border = '2px solid #ffffff !important';
    checkbox.style.borderRadius = '3px !important';
    checkbox.style.backgroundColor = 'transparent !important';
    checkbox.style.position = 'relative !important';
    checkbox.style.zIndex = '15 !important';

    // Add event listener to the checkbox
    checkbox.addEventListener('change', (event) => {
        event.stopPropagation();

        const subtaskId = event.target.getAttribute('data-subtask-id');
        const isComplete = event.target.checked;

        // Update the UI immediately
        if (isComplete) {
            subtaskElement.classList.add('completed');
        } else {
            subtaskElement.classList.remove('completed');
        }

        // For temporary subtasks, we only update the UI
        if (subtaskId.toString().startsWith('temp_')) {
            console.log(`[FIX] Temporary subtask ${subtaskId} checked, updating UI only`);
            return;
        }

        // For real subtasks, try to update the database
        console.log(`[FIX] Updating subtask ${subtaskId} completion status to ${isComplete}`);

        fetch(`/api/tasks/${subtaskId}/toggle-completion`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                is_complete: isComplete
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to update subtask: ${response.status}`);
            }
            return response.json();
        })
        .then(updatedSubtask => {
            console.log(`[FIX] Successfully updated subtask ${subtaskId}`);
        })
        .catch(error => {
            console.error(`[FIX] Error updating subtask ${subtaskId}:`, error);

            // Revert the UI change if the update failed
            checkbox.checked = !isComplete;
            if (isComplete) {
                subtaskElement.classList.remove('completed');
            } else {
                subtaskElement.classList.add('completed');
            }
        });
    });

    // Create title with enhanced visibility
    const title = document.createElement('span');
    title.className = 'subtask-title';
    title.textContent = subtask.title;

    // Add inline styles to ensure visibility
    title.style.color = '#ffffff !important';
    title.style.fontSize = '1em !important';
    title.style.fontWeight = 'normal !important';
    title.style.marginLeft = '10px !important';
    title.style.flex = '1 !important';
    title.style.textShadow = '0 1px 1px rgba(0, 0, 0, 0.2) !important';

    // Add elements to the subtask element
    subtaskElement.appendChild(checkbox);
    subtaskElement.appendChild(title);

    return subtaskElement;
}

// Override the original functions
window.loadGroceryListSubtasks = loadGroceryListSubtasks;
window.getGroceryDataFromTask = getGroceryDataFromTask;
window.generateGrocerySubtasks = generateGrocerySubtasks;
window.createGrocerySubtaskElement = createGrocerySubtaskElement;

// Add a function to ensure grocery subtasks are visible
function ensureGrocerySubtasksVisible() {
    console.log('[FIX] Ensuring grocery subtasks are visible');

    // Find all grocery list tasks
    const groceryTasks = Array.from(document.querySelectorAll('.task-item')).filter(task => {
        const title = task.querySelector('.task-title');
        return title && title.textContent.includes('Grocery List');
    });

    console.log(`[FIX] Found ${groceryTasks.length} grocery list tasks`);

    // For each grocery task, ensure it has the has-subtasks class and expand button
    groceryTasks.forEach(task => {
        const taskId = task.getAttribute('data-task-id');
        console.log(`[FIX] Processing grocery task ${taskId}`);

        // Add has-subtasks class
        task.classList.add('has-subtasks');

        // Find or create expand button
        let expandButton = task.querySelector('.expand-subtasks-btn');
        if (!expandButton) {
            console.log(`[FIX] Creating expand button for task ${taskId}`);

            // Create expand button container
            const expandButtonContainer = document.createElement('div');
            expandButtonContainer.className = 'expand-button-container';

            // Create expand button
            expandButton = document.createElement('button');
            expandButton.className = 'expand-subtasks-btn';
            expandButton.title = 'Show/hide grocery items';
            expandButton.innerHTML = '<i class="fas fa-chevron-down"></i>';

            // Add click event listener
            expandButton.addEventListener('click', (event) => {
                event.stopPropagation();
                console.log(`[FIX] Expand button clicked for task ${taskId}`);
                loadGroceryListSubtasks(taskId, task);
            });

            // Add expand button to container
            expandButtonContainer.appendChild(expandButton);

            // Add container to task
            task.appendChild(expandButtonContainer);
        }

        // Add "Has subtasks" indicator if not present
        let subtasksIndicator = Array.from(task.querySelectorAll('.task-meta')).find(meta =>
            meta.textContent.includes('Has subtasks')
        );

        if (!subtasksIndicator) {
            console.log(`[FIX] Adding "Has subtasks" indicator for task ${taskId}`);

            subtasksIndicator = document.createElement('div');
            subtasksIndicator.className = 'task-meta';
            subtasksIndicator.textContent = 'Has subtasks';

            // Find a good place to insert it
            const taskActions = task.querySelector('.task-actions');
            if (taskActions) {
                task.insertBefore(subtasksIndicator, taskActions);
            } else {
                task.appendChild(subtasksIndicator);
            }
        }

        // Update the parent task to indicate it has subtasks
        updateParentTaskHasSubtasks(taskId);
    });
}

// Run the function when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('[FIX] DOM loaded, ensuring grocery subtasks are visible');

    // Wait a bit for the tasks to be loaded
    setTimeout(ensureGrocerySubtasksVisible, 1000);

    // Also run it when the task list is updated
    document.addEventListener('tasksLoaded', ensureGrocerySubtasksVisible);
});

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

// Override the original function
window.updateParentTaskHasSubtasks = updateParentTaskHasSubtasks;
