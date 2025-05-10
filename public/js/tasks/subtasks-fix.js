/**
 * Subtasks Fix - Prevents duplicate subtasks in the edit task modal
 * This script completely replaces the subtask loading functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Subtasks Fix] Initializing...');

    // Get references to DOM elements
    const editTaskModal = document.getElementById('editTaskModal');
    const editSubtasksList = document.getElementById('editSubtasksList');
    const closeEditTaskModalBtn = document.getElementById('closeEditTaskModalBtn');

    if (!editTaskModal || !editSubtasksList) {
        console.error('[Subtasks Fix] Required DOM elements not found');
        return;
    }

    // Keep track of the current task ID being edited
    let currentTaskId = null;

    // Flag to track if we're currently loading subtasks
    let isLoadingSubtasks = false;

    /**
     * Create a subtask element for the modal with duplicate prevention
     * @param {Object} subtask - The subtask data
     * @returns {HTMLElement} The subtask element or null if a duplicate exists
     */
    function createUniqueSubtaskElement(subtask) {
        // Create the subtask element
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
     * Load subtasks for a task
     * @param {number} taskId - The ID of the task to load subtasks for
     * @returns {Promise<void>}
     */
    async function loadUniqueSubtasks(taskId) {
        // Check if we're already loading subtasks for this task
        if (isLoadingSubtasks && currentTaskId === taskId) {
            console.log(`[Subtasks Fix] Already loading subtasks for task ${taskId}, skipping duplicate load`);
            return;
        }

        // Set the loading flag and current task ID
        isLoadingSubtasks = true;
        currentTaskId = taskId;

        // Clear any existing subtasks first
        editSubtasksList.innerHTML = '<div class="subtask-loading">Loading subtasks...</div>';

        try {
            // Fetch subtasks for this task
            const apiBaseUrl = window.location.origin.includes('3001')
                ? window.location.origin
                : window.location.origin.replace(/:\d+/, ':3001');
            const response = await fetch(`${apiBaseUrl}/api/tasks/${taskId}/subtasks`);

            if (!response.ok) {
                throw new Error(`Failed to load subtasks: ${response.status} ${response.statusText}`);
            }

            const subtasks = await response.json();
            console.log(`[Subtasks Fix] Fetched ${subtasks.length} subtasks for task ${taskId}`, subtasks);

            // Clear the loading indicator
            editSubtasksList.innerHTML = '';

            if (subtasks.length === 0) {
                // No subtasks found
                editSubtasksList.innerHTML = '<p class="no-subtasks-message">No subtasks added yet.</p>';
            } else {
                // Create a document fragment to improve performance
                const fragment = document.createDocumentFragment();

                // Create and append subtask elements
                const addedSubtaskIds = new Set(); // Track which subtasks we've already added

                // First, create a temporary array with unique subtasks
                const uniqueSubtasks = [];
                subtasks.forEach(subtask => {
                    if (!addedSubtaskIds.has(subtask.id)) {
                        addedSubtaskIds.add(subtask.id);
                        uniqueSubtasks.push(subtask);
                    } else {
                        console.log(`[Subtasks Fix] Skipping duplicate subtask ${subtask.id} in data`);
                    }
                });

                // Now create elements for the unique subtasks
                uniqueSubtasks.forEach(subtask => {
                    // Create the subtask element
                    const subtaskElement = createUniqueSubtaskElement(subtask);
                    if (subtaskElement) {
                        fragment.appendChild(subtaskElement);
                    }
                });

                // Append all subtasks at once
                editSubtasksList.appendChild(fragment);
            }
        } catch (error) {
            console.error('[Subtasks Fix] Error loading subtasks:', error);
            editSubtasksList.innerHTML = `<div class="subtask-error">Error loading subtasks: ${error.message}</div>`;
        } finally {
            // Reset the loading flag
            isLoadingSubtasks = false;
        }
    }

    // Completely replace the loadSubtasksForTask function
    window.loadSubtasksForTask = async function(taskId) {
        console.log(`[Subtasks Fix] Loading subtasks for task ${taskId} (replaced function)`);
        await loadUniqueSubtasks(taskId);
    };

    // Completely replace the createSubtaskElementForModal function
    window.createSubtaskElementForModal = function(subtask) {
        console.log(`[Subtasks Fix] Creating subtask element for subtask ${subtask.id} (replaced function)`);
        return createUniqueSubtaskElement(subtask);
    };

    // Completely replace the openEditTaskModal function
    const originalOpenEditTaskModal = window.openEditTaskModal;
    if (originalOpenEditTaskModal) {
        window.openEditTaskModal = async function(task) {
            console.log("[Subtasks Fix] Opening edit task modal for task:", task);

            // Reset the current task ID if it's a different task
            if (currentTaskId !== task.id) {
                currentTaskId = null;

                // Clear any existing subtasks first
                if (editSubtasksList) {
                    editSubtasksList.innerHTML = '';
                }
            }

            // Call the original function
            await originalOpenEditTaskModal(task);

            // Now load the subtasks if the task has them
            if (task.has_subtasks) {
                console.log(`[Subtasks Fix] Task ${task.id} has subtasks, loading them...`);
                await loadUniqueSubtasks(task.id);
            }
        };
    }

    // Add event listeners to clear subtasks when the modal is closed
    if (closeEditTaskModalBtn) {
        closeEditTaskModalBtn.addEventListener('click', function() {
            console.log('[Subtasks Fix] Edit task modal close button clicked, clearing subtasks');
            if (editSubtasksList) {
                editSubtasksList.innerHTML = '';
                currentTaskId = null;
            }
        });
    }

    // Also clear when clicking outside the modal
    editTaskModal.addEventListener('click', function(event) {
        if (event.target === editTaskModal) {
            console.log('[Subtasks Fix] Clicked outside edit task modal, clearing subtasks');
            if (editSubtasksList) {
                editSubtasksList.innerHTML = '';
                currentTaskId = null;
            }
        }
    });

    // Directly modify the DOM to replace the subtasks list with a new one
    // This is a more aggressive approach to prevent duplicates
    const originalSubtasksList = editSubtasksList;
    if (originalSubtasksList) {
        // Create a new subtasks list element
        const newSubtasksList = document.createElement('div');
        newSubtasksList.id = 'editSubtasksList';
        newSubtasksList.className = 'subtasks-list';

        // Replace the original subtasks list with the new one
        if (originalSubtasksList.parentNode) {
            originalSubtasksList.parentNode.replaceChild(newSubtasksList, originalSubtasksList);
            console.log('[Subtasks Fix] Replaced subtasks list element with a new one');
        }
    }

    console.log('[Subtasks Fix] Initialized successfully');
});
