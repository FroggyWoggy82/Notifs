/**
 * Subtask Display Fix
 * This script fixes issues with subtask display in the task management system
 *
 * FIXED VERSION: Reduces DOM operations and prevents flickering
 */

(function() {
    console.log('[Subtask Display Fix] Initializing...');

    // Store the original loadSubtasks function
    const originalLoadSubtasks = window.loadSubtasks;

    // Keep track of which tasks have their subtasks expanded
    if (!window.expandedTasks) {
        window.expandedTasks = new Set();
    }

    // Flag to prevent multiple calls to loadSubtasks in quick succession
    let isProcessingSubtasks = false;

    // Track which buttons have already been processed
    const processedButtons = new WeakSet();

    // Debounce function to prevent multiple rapid calls
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    // Override the loadSubtasks function to fix subtask display issues
    window.loadSubtasks = function(parentId, parentElement) {
        // Reduced logging to improve performance

        // Convert parentId to number if it's a string
        parentId = parseInt(parentId);

        // Prevent multiple calls in quick succession
        if (isProcessingSubtasks) {
            return;
        }

        isProcessingSubtasks = true;
        setTimeout(() => { isProcessingSubtasks = false; }, 500); // Reset after 500ms

        // Check if this task is already expanded
        if (window.expandedTasks.has(parentId)) {
            // Get the subtasks container
            const subtasksContainer = document.querySelector(`.subtasks-container[data-parent-id="${parentId}"]`);

            if (subtasksContainer) {
                // Collapse with animation
                subtasksContainer.classList.remove('expanded');

                // Wait for animation to complete before removing
                setTimeout(() => {
                    subtasksContainer.remove();
                    window.expandedTasks.delete(parentId);

                    // Also remove the expanded class from the task item
                    const taskItem = document.querySelector(`.task-item[data-task-id="${parentId}"]`);
                    if (taskItem) {
                        taskItem.classList.remove('expanded');
                    }
                }, 300);
            } else {
                window.expandedTasks.delete(parentId);

                // Also remove the expanded class from the task item
                const taskItem = document.querySelector(`.task-item[data-task-id="${parentId}"]`);
                if (taskItem) {
                    taskItem.classList.remove('expanded');
                }
            }

            return;
        }

        // Mark as expanded
        window.expandedTasks.add(parentId);

        // Add expanded class to the task item
        if (parentElement) {
            parentElement.classList.add('expanded');
        }

        // Check if subtasks container already exists
        let subtasksContainer = document.querySelector(`.subtasks-container[data-parent-id="${parentId}"]`);

        // If it exists, just make sure it's expanded
        if (subtasksContainer) {
            subtasksContainer.classList.add('expanded');
            return;
        }

        // Create a container for all subtasks
        subtasksContainer = document.createElement('div');
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

        // Fetch subtasks
        fetch(`/api/tasks/${parentId}/subtasks`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load subtasks: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(subtasks => {
                // Check if the container still exists (it might have been removed if the user collapsed quickly)
                subtasksContainer = document.querySelector(`.subtasks-container[data-parent-id="${parentId}"]`);
                if (!subtasksContainer) {
                    return;
                }

                // Remove loading indicator
                if (loadingDiv && loadingDiv.parentNode === subtasksContainer) {
                    loadingDiv.remove();
                }

                if (subtasks.length === 0) {
                    // No subtasks found
                    const noSubtasksDiv = document.createElement('div');
                    noSubtasksDiv.className = 'subtask-item no-subtasks';
                    noSubtasksDiv.textContent = 'No subtasks found. Click "Edit" to add subtasks.';
                    subtasksContainer.appendChild(noSubtasksDiv);
                    return;
                }

                // Create and append subtask elements in a batch for better performance
                const fragment = document.createDocumentFragment();
                subtasks.forEach(subtask => {
                    const subtaskElement = createSubtaskElement(subtask);
                    fragment.appendChild(subtaskElement);
                });

                // Append all elements at once
                subtasksContainer.appendChild(fragment);

                // Ensure the container is still expanded
                subtasksContainer.classList.add('expanded');

                // Force a reflow to ensure the animation works
                void subtasksContainer.offsetWidth;
            })
            .catch(error => {
                console.error('[Subtask Display Fix] Error loading subtasks:', error);

                // Check if the container still exists
                subtasksContainer = document.querySelector(`.subtasks-container[data-parent-id="${parentId}"]`);
                if (!subtasksContainer) {
                    console.log(`[Subtask Display Fix] Subtasks container for task ${parentId} no longer exists, aborting`);
                    return;
                }

                // Show error message
                if (loadingDiv && loadingDiv.parentNode === subtasksContainer) {
                    loadingDiv.remove();
                }

                const errorDiv = document.createElement('div');
                errorDiv.className = 'subtask-item subtask-error';
                errorDiv.textContent = 'Error loading subtasks';
                subtasksContainer.innerHTML = '';
                subtasksContainer.appendChild(errorDiv);
            });
    };

    // Create a subtask element
    function createSubtaskElement(subtask) {
        // Reduced logging to improve performance

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

                if (subtask.grocery_data.packageCount) {
                    const packageSpan = document.createElement('span');
                    packageSpan.className = 'grocery-packages';
                    packageSpan.textContent = `${subtask.grocery_data.packageCount} package${subtask.grocery_data.packageCount > 1 ? 's' : ''}`;
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
                console.error('[Subtask Display Fix] Error adding grocery data to subtask element:', error);
            }
        }

        div.appendChild(contentDiv);

        return div;
    }

    // Update subtask status
    function updateSubtaskStatus(taskId, isComplete) {
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
            console.log(`[Subtask Display Fix] Updated subtask ${taskId} status to ${isComplete ? 'complete' : 'incomplete'}`);

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
            console.error('[Subtask Display Fix] Error updating subtask status:', error);
        });
    }

    // Fix expand button click handlers
    function fixExpandButtonClickHandlers() {
        const expandButtons = document.querySelectorAll('.expand-subtasks-btn');
        let newButtonsProcessed = 0;

        expandButtons.forEach(button => {
            // Skip if this button has already been processed
            if (processedButtons.has(button)) return;

            // Mark this button as processed
            processedButtons.add(button);
            newButtonsProcessed++;

            // Add click event listener (no need to clone and replace)
            button.addEventListener('click', function(event) {
                // Stop propagation and prevent default to avoid conflicts
                event.stopPropagation();
                event.preventDefault();

                const taskItem = this.closest('.task-item');
                if (!taskItem) return false;

                const taskId = taskItem.getAttribute('data-task-id');
                if (!taskId) return false;

                // Toggle the rotation of the chevron icon
                const icon = this.querySelector('i');
                if (icon) {
                    if (window.expandedTasks && window.expandedTasks.has(parseInt(taskId))) {
                        icon.style.transform = '';
                    } else {
                        icon.style.transform = 'rotate(180deg)';
                    }
                }

                // Check if this is a grocery list task
                const taskTitle = taskItem.querySelector('.task-title')?.textContent;
                const isGroceryList = taskTitle && (
                    taskTitle.startsWith('Grocery List -') ||
                    taskTitle.startsWith('Grocery List (') ||
                    taskTitle.includes('Grocery List')
                );

                if (isGroceryList && typeof window.toggleGrocerySubtasks === 'function') {
                    // Use toggleGrocerySubtasks for grocery list tasks

                    // Set data attributes to help script.js identify this as an expand button
                    this.setAttribute('data-expand-button', 'true');
                    this.setAttribute('data-grocery-list', 'true');

                    window.toggleGrocerySubtasks(parseInt(taskId), taskItem, event);
                } else {
                    // Use loadSubtasks for regular tasks
                    window.loadSubtasks(taskId, taskItem);
                }

                // Return false to ensure the event doesn't propagate
                return false;
            }, true); // Use capture phase to ensure this runs before other handlers
        });

        // Only log if we actually processed new buttons
        if (newButtonsProcessed > 0) {
            console.log(`[Subtask Display Fix] Fixing ${newButtonsProcessed} expand buttons`);
        }
    }

    // Function to observe DOM changes and fix expand buttons when new tasks are added
    function setupMutationObserver() {
        // Create a debounced version of fixExpandButtonClickHandlers
        const debouncedFix = debounce(fixExpandButtonClickHandlers, 300);

        // Create a mutation observer to watch for new tasks being added
        const observer = new MutationObserver(function(mutations) {
            let hasNewTasks = false;

            // Check if any mutations added task items
            for (let i = 0; i < mutations.length; i++) {
                const mutation = mutations[i];
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Check if any of the added nodes are task items or contain task items
                    for (let j = 0; j < mutation.addedNodes.length; j++) {
                        const node = mutation.addedNodes[j];
                        if (node.nodeType === 1) { // Element node
                            if (node.classList && node.classList.contains('task-item')) {
                                hasNewTasks = true;
                                break;
                            } else if (node.querySelectorAll) {
                                const taskItems = node.querySelectorAll('.task-item');
                                if (taskItems.length > 0) {
                                    hasNewTasks = true;
                                    break;
                                }
                            }
                        }
                    }
                }

                if (hasNewTasks) break;
            }

            if (hasNewTasks) {
                console.log('[Subtask Display Fix] New tasks detected, fixing expand buttons');
                debouncedFix();
            }
        });

        // Start observing the task list container
        const taskListDiv = document.getElementById('taskList');
        const completedTaskListDiv = document.getElementById('completedTaskList');

        if (taskListDiv) {
            observer.observe(taskListDiv, { childList: true, subtree: true });
        }

        if (completedTaskListDiv) {
            observer.observe(completedTaskListDiv, { childList: true, subtree: true });
        }
    }

    // Apply the fix when the DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Subtask Display Fix] DOM content loaded, applying fix');

        // Create a debounced version of fixExpandButtonClickHandlers for events
        const debouncedFix = debounce(fixExpandButtonClickHandlers, 300);

        // Initial fix with a slight delay to ensure DOM is ready
        setTimeout(fixExpandButtonClickHandlers, 100);

        // Setup mutation observer to watch for new tasks
        setupMutationObserver();

        // Listen for tasks rendered event with debouncing
        document.addEventListener('tasksRendered', function() {
            debouncedFix();
        });

        // Listen for tasks loaded event with debouncing
        document.addEventListener('tasksLoaded', function() {
            debouncedFix();
        });
    });

    // Disable the subtask-debug.js script to prevent conflicts
    if (window.subtaskDebugInitialized) {
        console.log('[Subtask Display Fix] Disabling subtask-debug.js to prevent conflicts');
        window.subtaskDebugInitialized = false;
    }

    console.log('[Subtask Display Fix] Initialized');
})();
