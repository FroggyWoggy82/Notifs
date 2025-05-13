/**
 * Subtask Form Handler
 * Handles the creation and management of subtasks in the task forms
 */

/**
 * Create a subtask for a parent task
 * @param {number} parentTaskId - The ID of the parent task
 * @param {Object} subtaskData - The subtask data (title, description, dueDate)
 * @returns {Promise<Object>} The created subtask
 */
async function createSubtask(parentTaskId, subtaskData) {
    console.log(`Creating subtask for parent task ${parentTaskId}:`, subtaskData);

    try {
        // Ensure we have a valid title
        if (!subtaskData.title || subtaskData.title.trim() === '') {
            throw new Error('Subtask title is required');
        }

        // Create the subtask using relative URL to ensure it works in all environments
        const response = await fetch(`/api/tasks/${parentTaskId}/subtasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: subtaskData.title,
                description: subtaskData.description || '',
                is_complete: subtaskData.is_complete || false
            })
        });

        if (!response.ok) {
            console.error(`Failed to create subtask: ${response.status} ${response.statusText}`);

            // Fallback to the old method of creating subtasks if the new endpoint fails
            console.log('Falling back to creating subtask via /api/tasks endpoint');
            const fallbackResponse = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: subtaskData.title,
                    description: subtaskData.description || '',
                    is_complete: subtaskData.is_complete || false,
                    parent_task_id: parentTaskId,
                    is_subtask: true
                })
            });

            if (!fallbackResponse.ok) {
                throw new Error(`Failed to create subtask (fallback): ${fallbackResponse.status} ${fallbackResponse.statusText}`);
            }

            const newSubtask = await fallbackResponse.json();
            console.log(`Created subtask (fallback):`, newSubtask);

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
        }

        const newSubtask = await response.json();
        console.log(`Created subtask:`, newSubtask);
        return newSubtask;
    } catch (error) {
        console.error(`Error creating subtask for parent task ${parentTaskId}:`, error);
        throw error;
    }
}

// Make createSubtask available globally
window.createSubtask = createSubtask;

document.addEventListener('DOMContentLoaded', function() {
    // Get elements from the Add Task form
    const addTaskForm = document.getElementById('addTaskForm');
    const subtasksList = document.getElementById('subtasksList');
    const addSubtaskBtn = document.getElementById('addSubtaskBtn');

    // Get elements from the Edit Task form
    const editTaskForm = document.getElementById('editTaskForm');
    const editSubtasksList = document.getElementById('editSubtasksList');
    const editAddSubtaskBtn = document.getElementById('editAddSubtaskBtn');

    // Store subtasks for the Add Task form
    let subtasks = [];

    // Store subtasks for the Edit Task form
    let editSubtasks = [];

    // Make editSubtasks available globally
    window.editSubtasks = editSubtasks;

    // Add event listeners
    if (addSubtaskBtn) {
        addSubtaskBtn.addEventListener('click', function() {
            console.log('Add Subtask button clicked in Add Task modal');
            addSubtaskField(subtasksList, subtasks);
        });
    }

    if (editAddSubtaskBtn) {
        editAddSubtaskBtn.addEventListener('click', function() {
            console.log('Add Subtask button clicked in Edit Task modal');
            addSubtaskField(editSubtasksList, editSubtasks);
        });
    }

    // Modify the Add Task form submission to include subtasks
    if (addTaskForm) {
        const originalSubmit = addTaskForm.onsubmit;

        addTaskForm.onsubmit = async function(event) {
            event.preventDefault();

            // Get the form data
            const formData = new FormData(addTaskForm);
            const taskData = {
                title: formData.get('taskTitle'),
                description: formData.get('taskDescription'),
                // Add all required fields
                reminderTime: formData.get('taskReminderTime') || null,
                reminderType: formData.get('taskReminderType') || 'none',
                dueDate: formData.get('taskDueDate') || null,
                duration: formData.get('taskDuration') || 1,
                recurrenceType: formData.get('taskRecurrenceType') || 'none',
                recurrenceInterval: formData.get('taskRecurrenceType') !== 'none' ?
                    parseInt(formData.get('taskRecurrenceInterval'), 10) || 1 : null
            };

            // Set the has_subtasks flag if there are subtasks
            if (subtasks.length > 0) {
                taskData.has_subtasks = true;
            }

            try {
                // Submit the task using relative URL to ensure it works in all environments
                const response = await fetch(`/api/tasks`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(taskData)
                });

                if (!response.ok) {
                    throw new Error(`Failed to create task: ${response.status} ${response.statusText}`);
                }

                const newTask = await response.json();

                // Create subtasks if any
                if (subtasks.length > 0) {
                    console.log(`Creating ${subtasks.length} subtasks for task ${newTask.id}`);

                    // Create all subtasks sequentially to avoid race conditions
                    for (const subtask of subtasks) {
                        console.log(`Creating subtask "${subtask.title}" for task ${newTask.id}`);

                        try {
                            // Use the direct API endpoint instead of the createSubtask function
                            const response = await fetch(`/api/tasks/${newTask.id}/subtasks`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    title: subtask.title,
                                    description: subtask.description || '',
                                    is_complete: subtask.is_complete || false
                                })
                            });

                            if (!response.ok) {
                                throw new Error(`Failed to create subtask: ${response.status} ${response.statusText}`);
                            }

                            const newSubtask = await response.json();
                            console.log(`Created subtask for task ${newTask.id}:`, newSubtask);
                        } catch (error) {
                            console.error(`Failed to create subtask "${subtask.title}" for task ${newTask.id}:`, error);
                        }
                    }
                }

                // Clear subtasks
                subtasks = [];
                renderSubtasks(subtasksList, subtasks);

                // Call the original submit handler if it exists
                if (typeof originalSubmit === 'function') {
                    return originalSubmit.call(this, event);
                }
            } catch (error) {
                console.error('Error creating task with subtasks:', error);
                // Show error message
                const statusDiv = document.getElementById('addTaskStatus');
                if (statusDiv) {
                    statusDiv.textContent = `Error: ${error.message}`;
                    statusDiv.className = 'status error';
                }
            }
        };
    }

    // Function to load subtasks for a task
    async function loadSubtasksForEditTask(taskId) {
        console.log(`Loading subtasks for task ${taskId} in Edit Task modal`);

        try {
            // Clear existing subtasks
            editSubtasks = [];
            window.editSubtasks = editSubtasks;

            let subtasksData = [];

            try {
                // Try to fetch subtasks using the dedicated endpoint
                const response = await fetch(`/api/tasks/${taskId}/subtasks`);

                if (response.ok) {
                    subtasksData = await response.json();
                    console.log(`Fetched ${subtasksData.length} subtasks for task ${taskId} using dedicated endpoint:`, subtasksData);
                } else {
                    console.error(`Failed to fetch subtasks using dedicated endpoint: ${response.status} ${response.statusText}`);
                    throw new Error('Dedicated endpoint failed');
                }
            } catch (endpointError) {
                console.log('Falling back to querying all tasks with parent_task_id filter');

                // Fallback: Query all tasks and filter by parent_task_id
                const response = await fetch(`/api/tasks?parent_task_id=${taskId}`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch subtasks (fallback): ${response.status} ${response.statusText}`);
                }

                const allTasks = await response.json();
                subtasksData = allTasks.filter(task => task.parent_task_id === parseInt(taskId) && task.is_subtask);
                console.log(`Fetched ${subtasksData.length} subtasks for task ${taskId} using fallback method:`, subtasksData);
            }

            // Add each subtask to the editSubtasks array
            for (const subtask of subtasksData) {
                editSubtasks.push({
                    id: subtask.id,
                    title: subtask.title,
                    description: subtask.description || '',
                    is_complete: subtask.is_complete
                });
            }

            // Update the global reference
            window.editSubtasks = editSubtasks;
            console.log(`Updated global editSubtasks array with ${editSubtasks.length} subtasks`);

            // Render the subtasks
            renderSubtasks(editSubtasksList, editSubtasks);
        } catch (error) {
            console.error(`Error loading subtasks for task ${taskId}:`, error);
        }
    }

    // Modify the Edit Task form to load and save subtasks
    if (editTaskForm) {
        const originalSubmit = editTaskForm.onsubmit;

        // Override the openEditTaskModal function to load subtasks
        const originalOpenEditTaskModal = window.openEditTaskModal;
        if (originalOpenEditTaskModal) {
            window.openEditTaskModal = async function(task) {
                console.log("Opening edit task modal with subtasks support for task:", task);

                // Call the original function first
                await originalOpenEditTaskModal(task);

                // Then load the subtasks if the task has them
                if (task.has_subtasks) {
                    console.log(`Task ${task.id} has subtasks, loading them...`);
                    await loadSubtasksForEditTask(task.id);
                } else {
                    // Clear any existing subtasks
                    editSubtasks = [];
                    window.editSubtasks = editSubtasks;
                    console.log(`Task ${task.id} has no subtasks, cleared editSubtasks array`);
                    renderSubtasks(editSubtasksList, editSubtasks);
                }
            };
        }

        editTaskForm.onsubmit = async function(event) {
            event.preventDefault();

            const taskId = document.getElementById('editTaskId').value;
            console.log(`Submitting Edit Task form for task ${taskId} with ${editSubtasks.length} subtasks`);

            // Get the form data
            const formData = new FormData(editTaskForm);
            const taskData = {
                title: formData.get('editTaskTitle'),
                description: formData.get('editTaskDescription'),
                // Add all required fields
                reminderTime: formData.get('editTaskReminderTime') || null,
                reminderType: formData.get('editTaskReminderType') || 'none',
                dueDate: formData.get('editTaskDueDate') || null,
                duration: formData.get('editTaskDuration') || 1,
                recurrenceType: formData.get('editTaskRecurrenceType') || 'none',
                recurrenceInterval: formData.get('editTaskRecurrenceType') !== 'none' ?
                    parseInt(formData.get('editTaskRecurrenceInterval'), 10) || 1 : null
            };

            // Set the has_subtasks flag if there are subtasks
            if (editSubtasks.length > 0) {
                taskData.has_subtasks = true;
                console.log(`Setting has_subtasks flag to true for task ${taskId}`);
            }

            // Ensure title is not null or empty
            if (!taskData.title || taskData.title.trim() === '') {
                const titleInput = document.getElementById('editTaskTitle');
                if (titleInput && titleInput.value) {
                    taskData.title = titleInput.value.trim();
                }
            }

            try {
                // Update the task using relative URL to ensure it works in all environments
                const response = await fetch(`/api/tasks/${taskId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(taskData)
                });

                if (!response.ok) {
                    throw new Error(`Failed to update task: ${response.status} ${response.statusText}`);
                }

                const updatedTask = await response.json();

                // Handle subtasks
                // First, get existing subtasks
                let existingSubtasks = [];

                try {
                    // Try to fetch subtasks using the dedicated endpoint
                    const existingSubtasksResponse = await fetch(`/api/tasks/${taskId}/subtasks`);

                    if (existingSubtasksResponse.ok) {
                        existingSubtasks = await existingSubtasksResponse.json();
                        console.log(`Fetched ${existingSubtasks.length} existing subtasks for task ${taskId} using dedicated endpoint`);
                    } else {
                        console.error(`Failed to fetch existing subtasks using dedicated endpoint: ${existingSubtasksResponse.status} ${existingSubtasksResponse.statusText}`);
                        throw new Error('Dedicated endpoint failed');
                    }
                } catch (endpointError) {
                    console.log('Falling back to querying all tasks with parent_task_id filter for existing subtasks');

                    // Fallback: Query all tasks and filter by parent_task_id
                    const response = await fetch(`/api/tasks?parent_task_id=${taskId}`);

                    if (!response.ok) {
                        throw new Error(`Failed to fetch existing subtasks (fallback): ${response.status} ${response.statusText}`);
                    }

                    const allTasks = await response.json();
                    existingSubtasks = allTasks.filter(task => task.parent_task_id === parseInt(taskId) && task.is_subtask);
                    console.log(`Fetched ${existingSubtasks.length} existing subtasks for task ${taskId} using fallback method`);
                }

                // Create new subtasks and update existing ones
                for (const subtask of editSubtasks) {
                    if (subtask.id) {
                        // Update existing subtask using relative URL
                        console.log(`Updating existing subtask ${subtask.id} "${subtask.title}"`);

                        try {
                            const response = await fetch(`/api/tasks/${subtask.id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    title: subtask.title,
                                    description: subtask.description || '',
                                    is_complete: subtask.is_complete || false
                                })
                            });

                            if (!response.ok) {
                                throw new Error(`Failed to update subtask: ${response.status} ${response.statusText}`);
                            }

                            const updatedSubtask = await response.json();
                            console.log(`Updated existing subtask ${subtask.id}:`, updatedSubtask);
                        } catch (error) {
                            console.error(`Failed to update subtask ${subtask.id}:`, error);
                        }
                    } else {
                        // Create new subtask
                        console.log(`Creating new subtask "${subtask.title}" for task ${taskId}`);

                        try {
                            // Use the direct API endpoint instead of the createSubtask function
                            const response = await fetch(`/api/tasks/${taskId}/subtasks`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    title: subtask.title,
                                    description: subtask.description || '',
                                    is_complete: subtask.is_complete || false
                                })
                            });

                            if (!response.ok) {
                                throw new Error(`Failed to create subtask: ${response.status} ${response.statusText}`);
                            }

                            const newSubtask = await response.json();
                            console.log(`Created new subtask for task ${taskId}:`, newSubtask);

                            // The API endpoint already updates the parent task's has_subtasks flag
                            console.log(`Parent task ${taskId} has_subtasks flag updated by API endpoint`);
                        } catch (error) {
                            console.error(`Failed to create new subtask "${subtask.title}" for task ${taskId}:`, error);
                        }
                    }
                }

                // Delete removed subtasks
                const subtaskIdsToKeep = editSubtasks.filter(s => s.id).map(s => s.id);
                for (const existingSubtask of existingSubtasks) {
                    if (!subtaskIdsToKeep.includes(existingSubtask.id)) {
                        // Delete this subtask using relative URL
                        await fetch(`/api/tasks/${existingSubtask.id}`, {
                            method: 'DELETE'
                        });
                    }
                }

                // Clear subtasks
                editSubtasks = [];
                window.editSubtasks = editSubtasks;
                console.log(`Cleared editSubtasks array after saving changes`);
                renderSubtasks(editSubtasksList, editSubtasks);

                // Call the original submit handler if it exists
                if (typeof originalSubmit === 'function') {
                    return originalSubmit.call(this, event);
                }
            } catch (error) {
                console.error('Error updating task with subtasks:', error);
                // Show error message
                const statusDiv = document.getElementById('editTaskStatus');
                if (statusDiv) {
                    statusDiv.textContent = `Error: ${error.message}`;
                    statusDiv.className = 'status error';
                }
            }
        };
    }

    // Add a function to load subtasks for a task (kept for backward compatibility)
    async function loadSubtasksForTask(taskId) {
        console.log(`loadSubtasksForTask is deprecated. Subtasks are now loaded directly in openEditTaskModal`);
        // This function is now handled directly in the openEditTaskModal function in script.js
        return;
    }

    // Add a direct event listener to the edit task modal
    const editTaskModal = document.getElementById('editTaskModal');
    if (editTaskModal) {
        console.log('Adding event listener to clear subtasks when modal is closed');

        // Clear the subtasks list when the modal is closed
        const closeButton = editTaskModal.querySelector('.close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                const editSubtasksList = document.getElementById('editSubtasksList');
                if (editSubtasksList) {
                    editSubtasksList.innerHTML = '';
                }
            });
        }
    }

    /**
     * Create a subtask element for the modal
     * @param {Object} subtask - The subtask data
     * @returns {HTMLElement} The subtask element
     */
    function createSubtaskElementForModal(subtask) {
        // Check if this subtask element already exists in the DOM
        const existingElement = document.querySelector(`.modal-subtask-item[data-task-id="${subtask.id}"]`);
        if (existingElement) {
            console.log(`Subtask element for subtask ${subtask.id} already exists, skipping creation`);
            return null;
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

    /**
     * Add a new subtask field to the form
     * @param {HTMLElement} container - The container to add the field to
     * @param {Array} subtasksArray - The array to store the subtask data
     */
    function addSubtaskField(container, subtasksArray) {
        console.log(`Adding subtask field to container:`, container);

        // Remove the "No subtasks" message if it exists
        const noSubtasksMessage = container.querySelector('.no-subtasks-message');
        if (noSubtasksMessage) {
            noSubtasksMessage.remove();
        }

        // Create a new subtask object
        const subtask = {
            title: '',
            description: '',
            is_complete: false
        };

        // Add to the array
        subtasksArray.push(subtask);
        console.log(`Added new subtask to array, now has ${subtasksArray.length} subtasks:`, subtasksArray);

        // Render all subtasks
        renderSubtasks(container, subtasksArray);

        // Focus the new input
        const inputs = container.querySelectorAll('input');
        if (inputs.length > 0) {
            inputs[inputs.length - 1].focus();
        }
    }

    /**
     * Render subtasks in the container
     * @param {HTMLElement} container - The container to render the subtasks in
     * @param {Array} subtasksArray - The array of subtask data
     */
    function renderSubtasks(container, subtasksArray) {
        console.log(`Rendering ${subtasksArray.length} subtasks in container:`, container);

        // Clear the container
        container.innerHTML = '';

        if (subtasksArray.length === 0) {
            // Show "No subtasks" message
            const message = document.createElement('p');
            message.className = 'no-subtasks-message';
            message.textContent = 'No subtasks added yet.';
            container.appendChild(message);
            return;
        }

        // Create elements for each subtask
        subtasksArray.forEach((subtask, index) => {
            const subtaskItem = document.createElement('div');
            subtaskItem.className = 'subtask-form-item';

            // Add complete class if the subtask is complete
            if (subtask.is_complete) {
                subtaskItem.classList.add('complete');
            }

            // If the subtask has an ID, store it as a data attribute
            if (subtask.id) {
                subtaskItem.dataset.subtaskId = subtask.id;
            }

            const input = document.createElement('input');
            input.type = 'text';
            input.value = subtask.title || '';
            input.placeholder = 'Subtask title';
            input.addEventListener('input', (event) => {
                subtask.title = event.target.value;
            });

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'subtask-actions';

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-subtask-btn';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.title = 'Remove subtask';
            removeBtn.addEventListener('click', () => {
                subtasksArray.splice(index, 1);
                renderSubtasks(container, subtasksArray);
            });

            actionsDiv.appendChild(removeBtn);
            subtaskItem.appendChild(input);
            subtaskItem.appendChild(actionsDiv);
            container.appendChild(subtaskItem);
        });
    }
});
