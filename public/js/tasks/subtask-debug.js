/**
 * Subtask Debug Script
 * This script helps debug issues with subtask expansion and display
 */

(function() {
    console.log('Subtask Debug Script loaded');

    // Set a flag to indicate this script is initialized
    window.subtaskDebugInitialized = true;

    // Check if subtask-display-fix.js is already loaded
    // If so, don't override its functionality
    if (window.expandedTasks) {
        console.log('[DEBUG] subtask-display-fix.js already loaded, not overriding functionality');
        return;
    }

    // Store the original loadSubtasks function
    const originalLoadSubtasks = window.loadSubtasks;

    // Override the loadSubtasks function to add debugging
    if (originalLoadSubtasks) {
        window.loadSubtasks = function(parentId, parentElement) {
            console.log(`[DEBUG] loadSubtasks called for task ${parentId}`);
            console.log(`[DEBUG] Parent element:`, parentElement);

            // Check if this task is already expanded
            const isExpanded = window.expandedTasks && window.expandedTasks.has(parentId);
            console.log(`[DEBUG] Task ${parentId} is already expanded: ${isExpanded}`);

            // Call the original function
            const result = originalLoadSubtasks(parentId, parentElement);

            // After a short delay, check the DOM for the subtasks container
            setTimeout(() => {
                const subtasksContainer = document.querySelector(`.subtasks-container[data-parent-id="${parentId}"]`);
                console.log(`[DEBUG] Subtasks container for task ${parentId}:`, subtasksContainer);

                if (subtasksContainer) {
                    // Check if the container has the expanded class
                    const hasExpandedClass = subtasksContainer.classList.contains('expanded');
                    console.log(`[DEBUG] Subtasks container has expanded class: ${hasExpandedClass}`);

                    // Check the computed style
                    const computedStyle = window.getComputedStyle(subtasksContainer);
                    console.log(`[DEBUG] Subtasks container computed style:`, {
                        maxHeight: computedStyle.maxHeight,
                        opacity: computedStyle.opacity,
                        display: computedStyle.display,
                        visibility: computedStyle.visibility,
                        overflow: computedStyle.overflow
                    });

                    // Check the position in the DOM
                    console.log(`[DEBUG] Subtasks container previous sibling:`, subtasksContainer.previousElementSibling);
                    console.log(`[DEBUG] Subtasks container next sibling:`, subtasksContainer.nextElementSibling);
                    console.log(`[DEBUG] Subtasks container parent:`, subtasksContainer.parentElement);

                    // Check the content of the container
                    console.log(`[DEBUG] Subtasks container children count:`, subtasksContainer.children.length);
                    console.log(`[DEBUG] Subtasks container HTML:`, subtasksContainer.innerHTML);

                    // Force the container to be visible for debugging
                    if (!hasExpandedClass && !isExpanded) {
                        console.log(`[DEBUG] Forcing subtasks container to be visible`);
                        subtasksContainer.classList.add('expanded');
                        subtasksContainer.style.maxHeight = '1000px';
                        subtasksContainer.style.opacity = '1';
                    }
                } else {
                    console.log(`[DEBUG] No subtasks container found for task ${parentId}`);
                }
            }, 500);

            return result;
        };
    }

    // Add a global click handler to detect clicks on task items
    document.addEventListener('click', (event) => {
        // Check if the click is on a task item
        const taskItem = event.target.closest('.task-item');
        if (taskItem) {
            const taskId = taskItem.getAttribute('data-task-id');
            console.log(`[DEBUG] Clicked on task item ${taskId}`);

            // Check if this task has subtasks
            const hasSubtasks = taskItem.classList.contains('has-subtasks');
            console.log(`[DEBUG] Task ${taskId} has subtasks: ${hasSubtasks}`);

            // If this is task 430, add special debugging
            if (taskId === '430') {
                console.log(`[DEBUG] Special debugging for task 430`);

                // Check for existing subtasks container
                const existingContainer = document.querySelector(`.subtasks-container[data-parent-id="430"]`);
                console.log(`[DEBUG] Existing subtasks container for task 430:`, existingContainer);

                // After a short delay, check again
                setTimeout(() => {
                    const subtasksContainer = document.querySelector(`.subtasks-container[data-parent-id="430"]`);
                    console.log(`[DEBUG] Subtasks container for task 430 after delay:`, subtasksContainer);

                    if (subtasksContainer) {
                        // Force the container to be visible
                        subtasksContainer.classList.add('expanded');
                        subtasksContainer.style.maxHeight = '1000px';
                        subtasksContainer.style.opacity = '1';
                        console.log(`[DEBUG] Forced subtasks container for task 430 to be visible`);
                    }
                }, 1000);
            }
        }
    });

    // Fix for subtask container positioning
    function fixSubtaskContainerPositioning() {
        // Override the loadSubtasks function to fix positioning
        const originalLoadSubtasks = window.loadSubtasks;

        if (originalLoadSubtasks) {
            window.loadSubtasks = function(parentId, parentElement) {
                console.log(`[FIX] loadSubtasks called for task ${parentId}`);

                // Check if already expanded
                if (window.expandedTasks && window.expandedTasks.has(parentId)) {
                    console.log(`[FIX] Task ${parentId} is already expanded, collapsing subtasks`);

                    // Get the subtasks container
                    const subtasksContainer = document.querySelector(`.subtasks-container[data-parent-id="${parentId}"]`);

                    if (subtasksContainer) {
                        // Collapse with animation
                        subtasksContainer.classList.remove('expanded');

                        // Wait for animation to complete before removing
                        setTimeout(() => {
                            subtasksContainer.remove();
                            window.expandedTasks.delete(parentId);
                        }, 300);
                    } else {
                        window.expandedTasks.delete(parentId);
                    }

                    return;
                }

                // Mark as expanded
                if (!window.expandedTasks) {
                    window.expandedTasks = new Set();
                }
                window.expandedTasks.add(parentId);

                // Create a container for all subtasks
                const subtasksContainer = document.createElement('div');
                subtasksContainer.className = 'subtasks-container';
                subtasksContainer.setAttribute('data-parent-id', parentId);

                // Insert the container after the parent element
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

                console.log(`[FIX] Fetching subtasks for task ${parentId}`);

                // Fetch subtasks
                fetch(`/api/tasks/${parentId}/subtasks`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Failed to load subtasks: ${response.status} ${response.statusText}`);
                        }
                        return response.json();
                    })
                    .then(subtasks => {
                        console.log(`[FIX] Fetched ${subtasks.length} subtasks for task ${parentId}`, subtasks);

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

                        // Create and append subtask elements
                        subtasks.forEach((subtask, index) => {
                            const subtaskElement = window.createSubtaskElement ?
                                window.createSubtaskElement(subtask) :
                                createDefaultSubtaskElement(subtask);

                            subtasksContainer.appendChild(subtaskElement);
                        });
                    })
                    .catch(error => {
                        console.error('[FIX] Error loading subtasks:', error);

                        // Show error message
                        loadingDiv.remove();
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'subtask-item subtask-error';
                        errorDiv.textContent = 'Error loading subtasks';
                        subtasksContainer.innerHTML = '';
                        subtasksContainer.appendChild(errorDiv);
                    });
            };
        }
    }

    // Default subtask element creation function
    function createDefaultSubtaskElement(subtask) {
        const div = document.createElement('div');
        div.className = `subtask-item ${subtask.is_complete ? 'complete' : ''}`;
        div.setAttribute('data-task-id', subtask.id);
        div.setAttribute('data-parent-id', subtask.parent_task_id);

        // Create checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = subtask.is_complete;

        // Create title
        const titleSpan = document.createElement('span');
        titleSpan.className = 'subtask-title';
        titleSpan.textContent = subtask.title;

        // Create content container
        const contentDiv = document.createElement('div');
        contentDiv.className = 'subtask-content';
        contentDiv.appendChild(checkbox);
        contentDiv.appendChild(titleSpan);

        div.appendChild(contentDiv);

        return div;
    }

    // Apply the fix
    fixSubtaskContainerPositioning();
})();
