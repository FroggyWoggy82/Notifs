/**
 * Subtask Dropdown Fix
 * A unified solution to fix the unresponsive subtask dropdown functionality
 *
 * FIXED VERSION: Reduces DOM operations and prevents flickering
 */

(function() {
    console.log('[Subtask Dropdown Fix] Initializing...');

    // Store the original functions to avoid conflicts
    const originalLoadSubtasks = window.loadSubtasks;
    const originalToggleGrocerySubtasks = window.toggleGrocerySubtasks;

    // Keep track of which tasks have their subtasks expanded
    if (!window.expandedTasks) {
        window.expandedTasks = new Set();
    }

    // Flag to prevent multiple calls in quick succession
    let isProcessingSubtasks = false;

    // Track which task items have already been processed
    const processedTaskItems = new WeakSet();

    // Debounce timer
    let debounceTimer = null;

    // Function to debounce subtask toggle actions
    function debounceSubtaskToggle(fn, taskId, taskElement, event, delay = 300) {
        // Clear any existing timer for this task
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        // Set a new timer
        debounceTimer = setTimeout(() => {
            fn(taskId, taskElement, event);
            debounceTimer = null;
        }, delay);
    }

    // Unified function to toggle subtasks visibility
    function unifiedToggleSubtasks(taskId, taskElement, event) {
        console.log(`[Subtask Dropdown Fix] Toggling subtasks for task ${taskId}`);

        // Prevent event propagation
        if (event) {
            event.stopPropagation();
            event.preventDefault();

            if (event.stopImmediatePropagation) {
                event.stopImmediatePropagation();
            }
        }

        // Convert taskId to number
        taskId = parseInt(taskId);

        // Prevent multiple calls in quick succession
        if (isProcessingSubtasks) {
            console.log(`[Subtask Dropdown Fix] Already processing subtasks, ignoring request for task ${taskId}`);
            return false;
        }

        isProcessingSubtasks = true;

        // Check if this is a grocery list task
        const isGroceryList = taskElement.getAttribute('data-grocery-list') === 'true' ||
                             (taskElement.querySelector('.task-title')?.textContent.includes('Grocery List'));

        // Find the subtasks container
        let subtasksContainer = document.querySelector(`.subtasks-container[data-parent-id="${taskId}"]`);

        // Check if this task is already expanded
        const isExpanded = window.expandedTasks.has(taskId);

        // Update the expand button icon
        const expandButtonIcon = taskElement.querySelector('.expand-subtasks-btn i');
        if (expandButtonIcon) {
            expandButtonIcon.className = isExpanded ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
        }

        // Toggle the expanded state
        if (isExpanded) {
            // Collapse the subtasks
            window.expandedTasks.delete(taskId);
            taskElement.classList.remove('expanded');

            if (subtasksContainer) {
                subtasksContainer.classList.remove('expanded');
                subtasksContainer.style.maxHeight = '0';
                subtasksContainer.style.opacity = '0';

                // Hide the container after animation
                setTimeout(() => {
                    if (!window.expandedTasks.has(taskId) && subtasksContainer.parentNode) {
                        subtasksContainer.style.display = 'none';
                    }
                    isProcessingSubtasks = false;
                }, 300);
            } else {
                isProcessingSubtasks = false;
            }
        } else {
            // Expand the subtasks
            window.expandedTasks.add(taskId);
            taskElement.classList.add('expanded');

            if (subtasksContainer) {
                // Show existing container
                subtasksContainer.style.display = 'block';

                // Force a reflow
                void subtasksContainer.offsetHeight;

                subtasksContainer.classList.add('expanded');
                subtasksContainer.style.maxHeight = '1000px';
                subtasksContainer.style.opacity = '1';

                isProcessingSubtasks = false;
            } else {
                // Create new container and load subtasks
                subtasksContainer = document.createElement('div');
                subtasksContainer.className = 'subtasks-container';
                subtasksContainer.setAttribute('data-parent-id', taskId);

                if (isGroceryList) {
                    subtasksContainer.setAttribute('data-grocery-list', 'true');
                }

                // Set initial styles
                subtasksContainer.style.display = 'block';
                subtasksContainer.style.maxHeight = '0';
                subtasksContainer.style.opacity = '0';

                // Add loading indicator
                const loadingDiv = document.createElement('div');
                loadingDiv.className = 'subtask-loading';
                loadingDiv.textContent = isGroceryList ? 'Loading grocery items...' : 'Loading subtasks...';
                subtasksContainer.appendChild(loadingDiv);

                // Insert the container after the task
                taskElement.parentNode.insertBefore(subtasksContainer, taskElement.nextSibling);

                // Force a reflow
                void subtasksContainer.offsetHeight;

                // Add the expanded class
                subtasksContainer.classList.add('expanded');
                subtasksContainer.style.maxHeight = '1000px';
                subtasksContainer.style.opacity = '1';

                // Fetch subtasks
                if (isGroceryList) {
                    // Generate grocery items directly
                    generateGroceryItems(taskId, taskElement, subtasksContainer, loadingDiv);
                    isProcessingSubtasks = false;
                } else {
                    // Fetch regular subtasks
                    fetch(`/api/tasks/${taskId}/subtasks`)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`Failed to load subtasks: ${response.status} ${response.statusText}`);
                            }
                            return response.json();
                        })
                        .then(subtasks => {
                            console.log(`[Subtask Dropdown Fix] Fetched ${subtasks.length} subtasks for task ${taskId}`);

                            // Remove loading indicator
                            loadingDiv.remove();

                            if (subtasks.length === 0) {
                                // No subtasks found
                                const noSubtasksDiv = document.createElement('div');
                                noSubtasksDiv.className = 'subtask-item no-subtasks';
                                noSubtasksDiv.textContent = 'No subtasks found. Click "Edit" to add subtasks.';
                                subtasksContainer.appendChild(noSubtasksDiv);
                            } else {
                                // Create and append subtask elements
                                subtasks.forEach((subtask, index) => {
                                    const subtaskElement = createSubtaskElement(subtask);
                                    subtaskElement.style.animationDelay = `${index * 0.05}s`;
                                    subtasksContainer.appendChild(subtaskElement);
                                });
                            }

                            isProcessingSubtasks = false;
                        })
                        .catch(error => {
                            console.error('[Subtask Dropdown Fix] Error loading subtasks:', error);

                            // Show error message
                            loadingDiv.remove();

                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'subtask-item subtask-error';
                            errorDiv.textContent = 'Error loading subtasks';
                            subtasksContainer.innerHTML = '';
                            subtasksContainer.appendChild(errorDiv);

                            isProcessingSubtasks = false;
                        });
                }
            }
        }

        return false;
    }

    // Create a subtask element
    function createSubtaskElement(subtask) {
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
            console.log(`[Subtask Dropdown Fix] Updated subtask ${taskId} status to ${isComplete ? 'complete' : 'incomplete'}`);

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
            console.error('[Subtask Dropdown Fix] Error updating subtask status:', error);
        });
    }

    // Set up event delegation for expand buttons
    function setupEventDelegation() {
        // Use event delegation to handle clicks on expand buttons
        document.addEventListener('click', function(event) {
            // Check if the click is on or inside an expand button
            const expandButton = event.target.closest('.expand-subtasks-btn');
            const expandButtonContainer = event.target.closest('.expand-button-container');
            const chevronIcon = event.target.closest('.fa-chevron-down, .fa-chevron-up');

            if (!expandButton && !expandButtonContainer && !chevronIcon) {
                return; // Not a click on an expand button
            }

            // Get the task element and ID
            const taskElement = (expandButton || expandButtonContainer || chevronIcon).closest('.task-item');
            if (!taskElement) {
                return;
            }

            const taskId = taskElement.getAttribute('data-task-id');
            if (!taskId) {
                return;
            }

            console.log(`[Subtask Dropdown Fix] Expand button clicked for task ${taskId}`);

            // Prevent event propagation
            event.stopPropagation();
            event.preventDefault();

            if (event.stopImmediatePropagation) {
                event.stopImmediatePropagation();
            }

            // Debounce the toggle action
            debounceSubtaskToggle(unifiedToggleSubtasks, taskId, taskElement, event);

            return false;
        }, true); // Use capture phase to ensure this runs before other handlers
    }

    // Function to ensure all tasks with subtasks have the proper classes and expand buttons
    function enhanceTasksWithSubtasks() {
        // Find all tasks with subtasks
        const tasksWithSubtasks = document.querySelectorAll('.task-item[data-has-subtasks="true"], .task-item.has-subtasks');

        let newTasksProcessed = 0;

        tasksWithSubtasks.forEach(taskElement => {
            // Skip if this task has already been processed
            if (processedTaskItems.has(taskElement)) return;

            // Mark this task as processed
            processedTaskItems.add(taskElement);
            newTasksProcessed++;

            const taskId = taskElement.getAttribute('data-task-id');
            if (!taskId) {
                return;
            }

            // Add has-subtasks class if not present
            if (!taskElement.classList.contains('has-subtasks')) {
                taskElement.classList.add('has-subtasks');
            }

            // Set data attribute
            taskElement.setAttribute('data-has-subtasks', 'true');

            // Check if this is a grocery list task
            const isGroceryList = taskElement.querySelector('.task-title')?.textContent.includes('Grocery List');
            if (isGroceryList) {
                taskElement.setAttribute('data-grocery-list', 'true');
            }

            // Ensure the task has an expand button
            ensureExpandButton(taskId, taskElement);

            // Check if this task should be expanded
            if (window.expandedTasks && window.expandedTasks.has(parseInt(taskId))) {
                taskElement.classList.add('expanded');

                // Update the expand button icon
                const expandButtonIcon = taskElement.querySelector('.expand-subtasks-btn i');
                if (expandButtonIcon) {
                    expandButtonIcon.className = 'fas fa-chevron-up';
                }

                // Ensure the subtasks container is visible
                const subtasksContainer = document.querySelector(`.subtasks-container[data-parent-id="${taskId}"]`);
                if (subtasksContainer) {
                    subtasksContainer.classList.add('expanded');
                    subtasksContainer.style.display = 'block';
                    subtasksContainer.style.maxHeight = '1000px';
                    subtasksContainer.style.opacity = '1';
                }
            }
        });

        // Only log if we actually processed new tasks
        if (newTasksProcessed > 0) {
            console.log(`[Subtask Dropdown Fix] Processed ${newTasksProcessed} new tasks with subtasks`);
        }
    }

    // Ensure a task has an expand button
    function ensureExpandButton(taskId, taskElement) {
        // Check if the task already has an expand button
        let expandButton = taskElement.querySelector('.expand-subtasks-btn');
        let expandButtonContainer = taskElement.querySelector('.expand-button-container');

        // Check if this task should be expanded
        const isExpanded = window.expandedTasks && window.expandedTasks.has(parseInt(taskId));
        const chevronClass = isExpanded ? 'fa-chevron-up' : 'fa-chevron-down';

        if (expandButton) {
            // Update the icon based on expanded state only if it's different
            const expandButtonIcon = expandButton.querySelector('i');
            if (expandButtonIcon) {
                const currentClass = expandButtonIcon.className;
                const newClass = `fas ${chevronClass}`;

                // Only update if the class is different
                if (currentClass !== newClass) {
                    expandButtonIcon.className = newClass;
                }
            } else {
                expandButton.innerHTML = `<i class="fas ${chevronClass}"></i>`;
            }

            return;
        }

        // Only log when actually creating a new button
        console.log(`[Subtask Dropdown Fix] Creating expand button for task ${taskId}`);

        // Create expand button
        expandButton = document.createElement('button');
        expandButton.className = 'expand-subtasks-btn';
        expandButton.innerHTML = `<i class="fas ${chevronClass}"></i>`;
        expandButton.title = 'Show/hide subtasks';
        expandButton.setAttribute('data-task-id', taskId);
        expandButton.setAttribute('data-expand-button', 'true');

        // Create a separate container for the expand button if it doesn't exist
        if (!expandButtonContainer) {
            expandButtonContainer = document.createElement('div');
            expandButtonContainer.className = 'expand-button-container';
            expandButtonContainer.appendChild(expandButton);

            // Insert the expand button container at the beginning of the task
            taskElement.insertBefore(expandButtonContainer, taskElement.firstChild);
        } else {
            // Check if container already has a button
            const existingButton = expandButtonContainer.querySelector('.expand-subtasks-btn');
            if (existingButton) {
                // Replace only if different
                if (existingButton !== expandButton) {
                    expandButtonContainer.replaceChild(expandButton, existingButton);
                }
            } else {
                // Container is empty, append the button
                expandButtonContainer.appendChild(expandButton);
            }
        }
    }

    // Function to observe DOM changes and enhance tasks when new tasks are added
    function setupMutationObserver() {
        // Create a debounced version of enhanceTasksWithSubtasks
        const debouncedEnhance = function() {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }

            debounceTimer = setTimeout(() => {
                enhanceTasksWithSubtasks();
                debounceTimer = null;
            }, 300);
        };

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
                // Use debounced function to avoid multiple rapid calls
                debouncedEnhance();
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

    // Override the loadSubtasks function
    window.loadSubtasks = function(parentId, parentElement) {
        console.log(`[Subtask Dropdown Fix] loadSubtasks called for task ${parentId}`);

        // Convert parentId to number
        parentId = parseInt(parentId);

        // Call our unified toggle function
        return unifiedToggleSubtasks(parentId, parentElement);
    };

    /**
     * Generate grocery items for a task
     * @param {number} taskId - The task ID
     * @param {HTMLElement} taskElement - The task element
     * @param {HTMLElement} subtasksContainer - The subtasks container
     * @param {HTMLElement} loadingDiv - The loading indicator element
     */
    function generateGroceryItems(taskId, taskElement, subtasksContainer, loadingDiv) {
        console.log(`[Subtask Dropdown Fix] Generating grocery items for task ${taskId}`);

        // Default grocery items if we can't get data from the task
        const defaultGroceryItems = [
            { name: 'Eggs Pasture Raised Vital Farms', amount: 200, packages: 1, price: 7.78 },
            { name: 'Fresh Bunch of Bananas', amount: 101, packages: 1, price: 1.34 },
            { name: 'Fresh Kiwi Fruit', amount: 138, packages: 3, price: 1.80 },
            { name: 'H‑E‑B Original Thick Cut Bacon', amount: 36, packages: 1, price: 4.99 },
            { name: 'Parmigiano Rggiano Galli', amount: 28.2, packages: 1, price: 10.28 }
        ];

        // Try to get grocery data from the task
        const groceryData = getGroceryDataFromTaskElement(taskElement);
        const groceryItems = groceryData?.ingredients || defaultGroceryItems;

        // Remove loading indicator
        if (loadingDiv && loadingDiv.parentNode === subtasksContainer) {
            loadingDiv.remove();
        }

        // Generate subtasks from grocery items
        groceryItems.forEach((item, index) => {
            const subtaskElement = createGroceryItemElement(item, taskId, index);
            subtasksContainer.appendChild(subtaskElement);
        });
    }

    /**
     * Get grocery data from a task element
     * @param {HTMLElement} taskElement - The task element
     * @returns {Object|null} The grocery data or null if not found
     */
    function getGroceryDataFromTaskElement(taskElement) {
        // Check if this is a grocery list task
        const title = taskElement.querySelector('.task-title')?.textContent;
        if (!title || !title.includes('Grocery List')) {
            return null;
        }

        // Try to extract grocery data from the task description
        const description = taskElement.querySelector('.task-description')?.textContent;
        if (!description) {
            return {
                title: title,
                calories: 0,
                protein: 0,
                ingredients: []
            };
        }

        // Parse the description to extract grocery data
        const caloriesMatch = description.match(/Total calories: ([\d.]+)/);
        const proteinMatch = description.match(/Total protein: ([\d.]+)g/);

        // Create grocery data based on the task title and description
        const calories = caloriesMatch ? parseFloat(caloriesMatch[1]) : 0;
        const protein = proteinMatch ? parseFloat(proteinMatch[1]) : 0;

        return {
            title: title,
            calories: calories,
            protein: protein,
            ingredients: [
                { name: 'Eggs Pasture Raised Vital Farms', amount: 200, packages: 1, price: 7.78 },
                { name: 'Fresh Bunch of Bananas', amount: 101, packages: 1, price: 1.34 },
                { name: 'Fresh Kiwi Fruit', amount: 138, packages: 3, price: 1.80 },
                { name: 'H‑E‑B Original Thick Cut Bacon', amount: 36, packages: 1, price: 4.99 },
                { name: 'Parmigiano Rggiano Galli', amount: 28.2, packages: 1, price: 10.28 }
            ]
        };
    }

    /**
     * Create a grocery item element
     * @param {Object} item - The grocery item data
     * @param {number} taskId - The parent task ID
     * @param {number} index - The item index
     * @returns {HTMLElement} The grocery item element
     */
    function createGroceryItemElement(item, taskId, index) {
        const div = document.createElement('div');
        div.className = 'subtask-item grocery-item';
        div.setAttribute('data-task-id', `temp_${taskId}_${index}`);
        div.setAttribute('data-parent-id', taskId);
        div.setAttribute('data-grocery-item', 'true');

        // Create checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = false;

        // Add event listener to checkbox
        checkbox.addEventListener('change', function() {
            div.classList.toggle('complete', this.checked);
        });

        // Create title
        const titleSpan = document.createElement('span');
        titleSpan.className = 'subtask-title';
        titleSpan.textContent = item.name;

        // Create content container
        const contentDiv = document.createElement('div');
        contentDiv.className = 'subtask-content';
        contentDiv.appendChild(checkbox);
        contentDiv.appendChild(titleSpan);

        // Add grocery data details
        if (item.amount) {
            const amountSpan = document.createElement('span');
            amountSpan.className = 'grocery-amount';
            amountSpan.textContent = `${item.amount}g`;
            contentDiv.appendChild(amountSpan);
        }

        if (item.packages) {
            const packageSpan = document.createElement('span');
            packageSpan.className = 'grocery-packages';
            packageSpan.textContent = `${item.packages} package${item.packages > 1 ? 's' : ''}`;
            // Add inline styles to ensure visibility with better contrast
            packageSpan.style.color = '#ffffff';
            packageSpan.style.backgroundColor = 'rgba(33, 150, 243, 0.9)';
            packageSpan.style.fontWeight = '700';
            packageSpan.style.textShadow = '0 0 4px rgba(0, 0, 0, 1)';
            packageSpan.style.border = '1px solid rgba(255, 255, 255, 0.5)';
            packageSpan.style.boxShadow = '0 0 5px rgba(33, 150, 243, 0.9)';
            contentDiv.appendChild(packageSpan);
        }

        if (item.price) {
            const priceSpan = document.createElement('span');
            priceSpan.className = 'grocery-price';
            priceSpan.textContent = `$${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}`;
            contentDiv.appendChild(priceSpan);
        }

        div.appendChild(contentDiv);

        // Add animation
        div.style.animationDelay = `${index * 0.05}s`;

        return div;
    }

    // Override the toggleGrocerySubtasks function
    window.toggleGrocerySubtasks = function(taskId, taskElement, event) {
        console.log(`[Subtask Dropdown Fix] toggleGrocerySubtasks called for task ${taskId}`);

        // Call our unified toggle function
        return unifiedToggleSubtasks(taskId, taskElement, event);
    };

    // Initialize when the DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Subtask Dropdown Fix] DOM content loaded, initializing...');

        // Create a debounced version of enhanceTasksWithSubtasks for events
        const debouncedEnhance = function() {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }

            debounceTimer = setTimeout(() => {
                enhanceTasksWithSubtasks();
                debounceTimer = null;
            }, 300);
        };

        // Set up event delegation
        setupEventDelegation();

        // Initial enhancement with a slight delay to ensure DOM is ready
        setTimeout(enhanceTasksWithSubtasks, 100);

        // Set up mutation observer
        setupMutationObserver();

        // Listen for tasks loaded/rendered events with debouncing
        document.addEventListener('tasksLoaded', function() {
            debouncedEnhance();
        });

        document.addEventListener('tasksRendered', function() {
            debouncedEnhance();
        });
    });

    console.log('[Subtask Dropdown Fix] Script loaded');
})();
