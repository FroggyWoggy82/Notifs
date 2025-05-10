/**
 * Subtask Form Handler
 * Handles the creation and management of subtasks in the task forms
 */

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

    // Add event listeners
    if (addSubtaskBtn) {
        addSubtaskBtn.addEventListener('click', () => addSubtaskField(subtasksList, subtasks));
    }

    if (editAddSubtaskBtn) {
        editAddSubtaskBtn.addEventListener('click', () => addSubtaskField(editSubtasksList, editSubtasks));
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
                // Add other task fields as needed
            };

            // Set the has_subtasks flag if there are subtasks
            if (subtasks.length > 0) {
                taskData.has_subtasks = true;
            }

            try {
                // Make sure we're using the correct port (3001)
                const apiBaseUrl = window.location.origin.includes('3001')
                    ? window.location.origin
                    : window.location.origin.replace(/:\d+/, ':3001');

                // Submit the task
                const response = await fetch(`${apiBaseUrl}/api/tasks`, {
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
                    for (const subtask of subtasks) {
                        await createSubtask(newTask.id, {
                            title: subtask.title,
                            description: '',
                            dueDate: newTask.due_date
                        });
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

    // Modify the Edit Task form to load and save subtasks
    if (editTaskForm) {
        const originalSubmit = editTaskForm.onsubmit;

        editTaskForm.onsubmit = async function(event) {
            event.preventDefault();

            const taskId = document.getElementById('editTaskId').value;

            // Get the form data
            const formData = new FormData(editTaskForm);
            const taskData = {
                title: formData.get('editTaskTitle'),
                description: formData.get('editTaskDescription'),
                // Add other task fields as needed
            };

            // Set the has_subtasks flag if there are subtasks
            if (editSubtasks.length > 0) {
                taskData.has_subtasks = true;
            }

            // Ensure title is not null or empty
            if (!taskData.title || taskData.title.trim() === '') {
                const titleInput = document.getElementById('editTaskTitle');
                if (titleInput && titleInput.value) {
                    taskData.title = titleInput.value.trim();
                }
            }

            try {
                // Make sure we're using the correct port (3001)
                const apiBaseUrl = window.location.origin.includes('3001')
                    ? window.location.origin
                    : window.location.origin.replace(/:\d+/, ':3001');

                // Update the task
                const response = await fetch(`${apiBaseUrl}/api/tasks/${taskId}`, {
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
                const existingSubtasksResponse = await fetch(`${apiBaseUrl}/api/tasks/${taskId}/subtasks`);
                if (!existingSubtasksResponse.ok) {
                    throw new Error(`Failed to fetch subtasks: ${existingSubtasksResponse.status} ${existingSubtasksResponse.statusText}`);
                }

                const existingSubtasks = await existingSubtasksResponse.json();

                // Create new subtasks and update existing ones
                for (const subtask of editSubtasks) {
                    if (subtask.id) {
                        // Update existing subtask
                        await fetch(`${apiBaseUrl}/api/tasks/${subtask.id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                title: subtask.title,
                                description: subtask.description || ''
                            })
                        });
                    } else {
                        // Create new subtask
                        await createSubtask(taskId, {
                            title: subtask.title,
                            description: '',
                            dueDate: updatedTask.due_date
                        });
                    }
                }

                // Delete removed subtasks
                const subtaskIdsToKeep = editSubtasks.filter(s => s.id).map(s => s.id);
                for (const existingSubtask of existingSubtasks) {
                    if (!subtaskIdsToKeep.includes(existingSubtask.id)) {
                        // Delete this subtask
                        await fetch(`${apiBaseUrl}/api/tasks/${existingSubtask.id}`, {
                            method: 'DELETE'
                        });
                    }
                }

                // Clear subtasks
                editSubtasks = [];
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
        // Remove the "No subtasks" message if it exists
        const noSubtasksMessage = container.querySelector('.no-subtasks-message');
        if (noSubtasksMessage) {
            noSubtasksMessage.remove();
        }

        // Create a new subtask object
        const subtask = {
            title: '',
            description: ''
        };

        // Add to the array
        subtasksArray.push(subtask);

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

            const input = document.createElement('input');
            input.type = 'text';
            input.value = subtask.title;
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
