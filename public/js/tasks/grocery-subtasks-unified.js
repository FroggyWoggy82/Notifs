/**
 * Unified Grocery Subtasks Implementation
 * This file provides a single, consistent implementation for grocery list subtasks
 * that works with the existing subtasks system.
 */

// Global variable to track if we've already added the CSS
let grocerySubtasksCssAdded = false;

// Add CSS to ensure subtasks containers remain visible
function addGrocerySubtasksCss() {
    if (grocerySubtasksCssAdded) return;

    const style = document.createElement('style');
    style.textContent = `
        .subtasks-container[data-grocery-list="true"] {
            display: block;
            overflow: hidden;
            transition: height 0.3s ease-in-out, opacity 0.3s ease-in-out;
            will-change: height, opacity;
        }

        .subtasks-container[data-grocery-list="true"].expanded {
            display: block;
            opacity: 1;
            overflow: visible;
        }

        .subtasks-container[data-grocery-list="true"].collapsing {
            overflow: hidden;
        }

        .task-item[data-grocery-list="true"].expanded .expand-subtasks-btn i {
            transform: rotate(180deg);
            transition: transform 0.3s ease-in-out;
        }

        .task-item[data-grocery-list="true"] .expand-subtasks-btn i {
            transition: transform 0.3s ease-in-out;
        }

        /* Animation for subtask items */
        @keyframes fadeInSlideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .subtasks-container[data-grocery-list="true"] .subtask-item {
            animation: fadeInSlideDown 0.3s ease-in-out forwards;
        }
    `;

    document.head.appendChild(style);
    grocerySubtasksCssAdded = true;
    console.log('[UNIFIED] Added CSS for grocery subtasks');
}

// Function to ensure expanded subtasks remain visible
function ensureExpandedSubtasksVisible() {
    if (!window.expandedTasks) return;

    // For each expanded task, ensure its subtasks container is visible
    window.expandedTasks.forEach(taskId => {
        const subtasksContainer = document.querySelector(`.subtasks-container[data-parent-id="${taskId}"]`);
        if (subtasksContainer) {
            subtasksContainer.classList.add('expanded');
            subtasksContainer.style.display = 'block';
            subtasksContainer.style.height = 'auto';
            subtasksContainer.style.opacity = '1';
            subtasksContainer.style.overflow = 'visible';

            // Also ensure the task has the expanded class
            const taskElement = document.querySelector(`.task-item[data-task-id="${taskId}"]`);
            if (taskElement) {
                taskElement.classList.add('expanded');

                // Update the expand button icon
                const expandButtonIcon = taskElement.querySelector('.expand-subtasks-btn i');
                if (expandButtonIcon) {
                    expandButtonIcon.className = 'fas fa-chevron-up';
                }
            }
        }
    });
}

// Debounce function to prevent multiple rapid calls
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Track which tasks have already been processed
const processedTasks = new WeakSet();

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('[UNIFIED] Grocery subtasks unified implementation loaded');

    // Add CSS to ensure subtasks containers remain visible
    addGrocerySubtasksCss();

    // Create debounced versions of our functions
    const debouncedInitialize = debounce(() => {
        initializeGrocerySubtasks();
        ensureExpandedSubtasksVisible();
    }, 500);

    // Initialize grocery subtasks with a slight delay
    setTimeout(debouncedInitialize, 500);

    // Listen for tasks loaded/rendered events with debouncing
    document.addEventListener('tasksLoaded', debouncedInitialize);
    document.addEventListener('tasksRendered', debouncedInitialize);

    // Also listen for DOM mutations to catch dynamically added tasks
    const observer = new MutationObserver(debounce((mutations) => {
        let shouldInitialize = false;

        // Check if any mutations added task items
        for (let i = 0; i < mutations.length; i++) {
            const mutation = mutations[i];
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Check if any of the added nodes are task items or contain task items
                for (let j = 0; j < mutation.addedNodes.length; j++) {
                    const node = mutation.addedNodes[j];
                    if (node.nodeType === 1) { // Element node
                        if (node.classList && node.classList.contains('task-item')) {
                            shouldInitialize = true;
                            break;
                        } else if (node.querySelectorAll) {
                            const taskItems = node.querySelectorAll('.task-item');
                            if (taskItems.length > 0) {
                                shouldInitialize = true;
                                break;
                            }
                        }
                    }
                }
            }

            if (shouldInitialize) break;
        }

        if (shouldInitialize) {
            debouncedInitialize();
        }
    }, 300));

    // Start observing the task list container
    const taskListDiv = document.getElementById('taskList');
    if (taskListDiv) {
        observer.observe(taskListDiv, { childList: true, subtree: true });
    }

    // Periodically check to ensure expanded subtasks remain visible, but less frequently
    setInterval(ensureExpandedSubtasksVisible, 2000);
});

/**
 * Initialize grocery subtasks
 * This function finds all grocery list tasks and ensures they have the proper classes and attributes
 */
function initializeGrocerySubtasks() {
    // Find all grocery list tasks
    const groceryTasks = Array.from(document.querySelectorAll('.task-item')).filter(task => {
        const title = task.querySelector('.task-title');
        return title && title.textContent.includes('Grocery List');
    });

    let newTasksProcessed = 0;

    // Process each grocery task
    groceryTasks.forEach(task => {
        // Skip if this task has already been processed
        if (processedTasks.has(task)) return;

        // Mark this task as processed
        processedTasks.add(task);
        newTasksProcessed++;

        const taskId = parseInt(task.getAttribute('data-task-id'));

        // Add has-subtasks class
        task.classList.add('has-subtasks');

        // Add data-grocery-list attribute
        task.setAttribute('data-grocery-list', 'true');

        // Make sure the task has an expand button
        ensureExpandButton(taskId, task);

        // Check if this task should be expanded
        if (window.expandedTasks && window.expandedTasks.has(taskId)) {
            // Add the expanded class to the task
            task.classList.add('expanded');

            // Update the expand button icon
            const expandButtonIcon = task.querySelector('.expand-subtasks-btn i');
            if (expandButtonIcon) {
                expandButtonIcon.className = 'fas fa-chevron-up';
            }

            // Check if the subtasks container exists
            let subtasksContainer = document.querySelector(`.subtasks-container[data-parent-id="${taskId}"]`);
            if (!subtasksContainer) {
                loadGrocerySubtasks(taskId, task);
            } else {
                subtasksContainer.classList.add('expanded');
                subtasksContainer.style.display = 'block';
                subtasksContainer.style.height = 'auto';
                subtasksContainer.style.opacity = '1';
                subtasksContainer.style.overflow = 'visible';
            }
        }

        // Add a direct click handler to the task element to prevent the edit modal from opening
        // when clicking on the expand button (only if not already added)
        if (!task._hasGroceryClickHandler) {
            task.addEventListener('click', function(event) {
                // Check if the click is on or inside the expand button or its container
                const expandButton = event.target.closest('.expand-subtasks-btn');
                const expandButtonContainer = event.target.closest('.expand-button-container');
                const chevronIcon = event.target.closest('.fa-chevron-down, .fa-chevron-up');

                if (expandButton || expandButtonContainer || chevronIcon) {
                    event.stopPropagation();
                    event.preventDefault();

                    if (event.stopImmediatePropagation) {
                        event.stopImmediatePropagation();
                    }

                    // Toggle the subtasks
                    toggleGrocerySubtasks(taskId, task, event);

                    return false;
                }
            }, true); // Use capture phase to ensure this runs before other handlers

            task._hasGroceryClickHandler = true;
        }

        // Make sure the expand button has the necessary attributes
        const expandButton = task.querySelector('.expand-subtasks-btn');
        if (expandButton && !expandButton._hasGroceryClickHandler) {
            expandButton.setAttribute('data-grocery-list', 'true');
            expandButton.setAttribute('data-expand-button', 'true');
            expandButton.setAttribute('data-task-id', taskId);

            // Add a direct click handler to the button
            expandButton.addEventListener('click', function(event) {
                event.stopPropagation();
                event.preventDefault();

                if (event.stopImmediatePropagation) {
                    event.stopImmediatePropagation();
                }

                // Toggle the subtasks
                toggleGrocerySubtasks(taskId, task, event);

                return false;
            }, true); // Use capture phase to ensure this runs before other handlers

            expandButton._hasGroceryClickHandler = true;
        }
    });

    // Only log if we actually processed new tasks
    if (newTasksProcessed > 0) {
        console.log(`[UNIFIED] Found ${groceryTasks.length} grocery list tasks, processed ${newTasksProcessed} new ones`);
    }

    // Add a global event listener for grocery list expand buttons
    setupGlobalEventListener();
}

/**
 * Ensure a task has an expand button
 * @param {string|number} taskId - The task ID
 * @param {HTMLElement} taskElement - The task element
 */
function ensureExpandButton(taskId, taskElement) {
    // Convert taskId to number if it's a string
    taskId = parseInt(taskId);

    // Check if the task already has an expand button
    let expandButton = taskElement.querySelector('.expand-subtasks-btn');
    let expandButtonContainer = taskElement.querySelector('.expand-button-container');

    // Check if this task should be expanded
    const isExpanded = window.expandedTasks && window.expandedTasks.has(taskId);
    const chevronClass = isExpanded ? 'fa-chevron-up' : 'fa-chevron-down';

    if (expandButton) {
        // Make sure the expand button has the necessary attributes
        expandButton.setAttribute('data-grocery-list', 'true');
        expandButton.setAttribute('data-expand-button', 'true');
        expandButton.setAttribute('data-task-id', taskId);

        // Make sure the container has the necessary attributes
        if (expandButtonContainer) {
            expandButtonContainer.setAttribute('data-grocery-list', 'true');
            expandButtonContainer.setAttribute('data-expand-button-container', 'true');
        }

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

        // Add a direct click handler to the button if not already added
        if (!expandButton._hasGroceryClickHandler) {
            expandButton.addEventListener('click', function(event) {
                event.stopPropagation();
                event.preventDefault();

                if (event.stopImmediatePropagation) {
                    event.stopImmediatePropagation();
                }

                toggleGrocerySubtasks(taskId, taskElement, event);

                return false;
            }, true); // Use capture phase to ensure this runs before other handlers

            expandButton._hasGroceryClickHandler = true;
        }

        return;
    }

    // Create expand button
    expandButton = document.createElement('button');
    expandButton.className = 'expand-subtasks-btn';
    expandButton.innerHTML = `<i class="fas ${chevronClass}"></i>`;
    expandButton.title = 'Show/hide subtasks';
    expandButton.setAttribute('data-task-id', taskId);
    expandButton.setAttribute('data-expand-button', 'true');
    expandButton.setAttribute('data-grocery-list', 'true');

    // Add a direct click handler to the button
    expandButton.addEventListener('click', function(event) {
        event.stopPropagation();
        event.preventDefault();

        if (event.stopImmediatePropagation) {
            event.stopImmediatePropagation();
        }

        toggleGrocerySubtasks(taskId, taskElement, event);

        return false;
    }, true); // Use capture phase to ensure this runs before other handlers

    expandButton._hasGroceryClickHandler = true;

    // Create a separate container for the expand button if it doesn't exist
    if (!expandButtonContainer) {
        expandButtonContainer = document.createElement('div');
        expandButtonContainer.className = 'expand-button-container';
        expandButtonContainer.setAttribute('data-grocery-list', 'true');
        expandButtonContainer.setAttribute('data-expand-button-container', 'true');
        expandButtonContainer.appendChild(expandButton);

        // Add a click handler to the container as well
        expandButtonContainer.addEventListener('click', function(event) {
            event.stopPropagation();
            event.preventDefault();

            if (event.stopImmediatePropagation) {
                event.stopImmediatePropagation();
            }

            toggleGrocerySubtasks(taskId, taskElement, event);

            return false;
        }, true); // Use capture phase to ensure this runs before other handlers

        expandButtonContainer._hasGroceryClickHandler = true;

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

        // Make sure the container has the necessary attributes
        expandButtonContainer.setAttribute('data-grocery-list', 'true');
        expandButtonContainer.setAttribute('data-expand-button-container', 'true');

        // Add a click handler to the container if not already added
        if (!expandButtonContainer._hasGroceryClickHandler) {
            expandButtonContainer.addEventListener('click', function(event) {
                event.stopPropagation();
                event.preventDefault();

                if (event.stopImmediatePropagation) {
                    event.stopImmediatePropagation();
                }

                toggleGrocerySubtasks(taskId, taskElement, event);

                return false;
            }, true); // Use capture phase to ensure this runs before other handlers

            expandButtonContainer._hasGroceryClickHandler = true;
        }
    }
}

/**
 * Set up a global event listener for grocery list expand buttons
 */
function setupGlobalEventListener() {
    // Remove any existing event listener first
    document.removeEventListener('click', handleGroceryExpandButtonClick, true);

    // Add the event listener in the capture phase to ensure it runs before other handlers
    document.addEventListener('click', handleGroceryExpandButtonClick, true);

    // Also add a specific event listener for the expand button icons
    document.querySelectorAll('.expand-subtasks-btn i').forEach(icon => {
        icon.addEventListener('click', function(event) {
            // Find the parent button
            const button = this.closest('.expand-subtasks-btn');
            if (!button) return;

            // Get the task ID and element
            const taskId = button.getAttribute('data-task-id');
            if (!taskId) return;

            const taskElement = button.closest('.task-item');
            if (!taskElement) return;

            // Check if this is a grocery list task
            const isGroceryList = button.getAttribute('data-grocery-list') === 'true' ||
                                 taskElement.getAttribute('data-grocery-list') === 'true' ||
                                 (taskElement.querySelector('.task-title')?.textContent.includes('Grocery List'));

            if (!isGroceryList) return;

            // Stop event propagation and prevent default
            event.stopPropagation();
            event.preventDefault();

            console.log(`[UNIFIED] Grocery list expand button icon clicked for task ${taskId}`);

            // Toggle the subtasks
            toggleGrocerySubtasks(taskId, taskElement, event);

            return false;
        }, true);
    });
}

/**
 * Handle clicks on grocery list expand buttons
 * @param {Event} event - The click event
 */
function handleGroceryExpandButtonClick(event) {
    // Check if the click is on an expand button, inside an expand button container, or on the chevron icon
    const expandButton = event.target.closest('.expand-subtasks-btn');
    const expandButtonContainer = event.target.closest('.expand-button-container');
    const chevronIcon = event.target.closest('.fa-chevron-down, .fa-chevron-up');

    if (!expandButton && !expandButtonContainer && !chevronIcon) {
        return; // Not a click on an expand button or icon
    }

    // Get the button element
    const button = expandButton ||
                  (expandButtonContainer && expandButtonContainer.querySelector('.expand-subtasks-btn')) ||
                  (chevronIcon && chevronIcon.closest('.expand-subtasks-btn'));

    if (!button) return;

    // Get the task ID and element
    const taskId = button.getAttribute('data-task-id');
    if (!taskId) return;

    const taskElement = button.closest('.task-item');
    if (!taskElement) return;

    // Check if this is a grocery list task
    const isGroceryList = button.getAttribute('data-grocery-list') === 'true' ||
                         taskElement.getAttribute('data-grocery-list') === 'true' ||
                         (taskElement.querySelector('.task-title')?.textContent.includes('Grocery List'));

    if (!isGroceryList) {
        return; // Let other handlers handle non-grocery list tasks
    }

    // Stop event propagation and prevent default
    event.stopPropagation();
    event.preventDefault();

    console.log(`[UNIFIED] Grocery list expand button clicked for task ${taskId}`);

    // Toggle the subtasks
    toggleGrocerySubtasks(taskId, taskElement, event);

    return false;
}

/**
 * Toggle grocery subtasks visibility
 * @param {string|number} taskId - The task ID
 * @param {HTMLElement} taskElement - The task element
 * @param {Event} [event] - The event that triggered the toggle
 */
function toggleGrocerySubtasks(taskId, taskElement, event) {
    // Stop event propagation if event is provided
    if (event) {
        event.stopPropagation();
        event.preventDefault();

        // Prevent any other handlers from running
        if (event.stopImmediatePropagation) {
            event.stopImmediatePropagation();
        }
    }

    // Convert taskId to number if it's a string
    taskId = parseInt(taskId);

    // Verify this is a grocery list task
    const isGroceryList = taskElement.getAttribute('data-grocery-list') === 'true' ||
                         (taskElement.querySelector('.task-title')?.textContent.includes('Grocery List'));

    if (!isGroceryList) {
        if (typeof window.loadSubtasks === 'function') {
            return window.loadSubtasks(taskId, taskElement);
        }
        return false;
    }

    // Ensure the task has the grocery list attribute
    if (!taskElement.hasAttribute('data-grocery-list')) {
        taskElement.setAttribute('data-grocery-list', 'true');
    }

    // Keep track of expanded tasks
    if (!window.expandedTasks) {
        window.expandedTasks = new Set();
    }

    // Find the subtasks container
    let subtasksContainer = document.querySelector(`.subtasks-container[data-parent-id="${taskId}"]`);

    // If the container exists, toggle its visibility
    if (subtasksContainer) {
        const isExpanded = subtasksContainer.classList.contains('expanded');

        if (isExpanded) {
            // Store the current height before any changes
            const startHeight = subtasksContainer.scrollHeight;

            // Add a collapsing class to handle specific styles during collapse
            subtasksContainer.classList.add('collapsing');

            // Set explicit height to current height to start transition from
            subtasksContainer.style.height = startHeight + 'px';
            subtasksContainer.style.opacity = '1';
            subtasksContainer.style.overflow = 'hidden';

            // Force a reflow to ensure the browser registers the starting height
            void subtasksContainer.offsetHeight;

            // Remove from expanded tasks set
            window.expandedTasks.delete(taskId);

            // Update the expand button icon - use transition for smooth rotation
            const expandButtonIcon = taskElement.querySelector('.expand-subtasks-btn i');
            if (expandButtonIcon) {
                expandButtonIcon.className = 'fas fa-chevron-down';
            }

            // Remove the expanded class from the task
            taskElement.classList.remove('expanded');

            // Remove the expanded class to trigger CSS transition
            subtasksContainer.classList.remove('expanded');

            // Start the transition after a tiny delay to ensure smooth animation
            requestAnimationFrame(() => {
                // Start the height transition
                subtasksContainer.style.height = '0';
                subtasksContainer.style.opacity = '0';

                // Wait for animation to complete before cleaning up
                setTimeout(() => {
                    if (subtasksContainer && !window.expandedTasks.has(taskId)) {
                        // Double-check that we still want this container hidden
                        subtasksContainer.style.display = 'none';
                        subtasksContainer.classList.remove('collapsing');
                    }
                }, 350); // Slightly longer than the transition to ensure it completes
            });
        } else {
            // Add to expanded tasks set
            window.expandedTasks.add(taskId);

            // Remove any collapsing class
            subtasksContainer.classList.remove('collapsing');

            // Make sure the container is visible but with zero height
            subtasksContainer.style.display = 'block';
            subtasksContainer.style.height = '0';
            subtasksContainer.style.opacity = '0';
            subtasksContainer.style.overflow = 'hidden';

            // Update the expand button icon
            const expandButtonIcon = taskElement.querySelector('.expand-subtasks-btn i');
            if (expandButtonIcon) {
                expandButtonIcon.className = 'fas fa-chevron-up';
            }

            // Add the expanded class to the task
            taskElement.classList.add('expanded');

            // Force a reflow to ensure the browser registers the starting state
            void subtasksContainer.offsetHeight;

            // Add the expanded class
            subtasksContainer.classList.add('expanded');

            // Get the target height before transitioning
            const targetHeight = subtasksContainer.scrollHeight;

            // Start the transition with requestAnimationFrame for smoother animation
            requestAnimationFrame(() => {
                // Transition to the target height
                subtasksContainer.style.height = targetHeight + 'px';
                subtasksContainer.style.opacity = '1';

                // After the transition completes, set to auto height
                setTimeout(() => {
                    if (window.expandedTasks.has(taskId)) {
                        subtasksContainer.style.height = 'auto';
                        subtasksContainer.style.overflow = 'visible';
                    }
                }, 350); // Slightly longer than the transition to ensure it completes
            });

            // Store a reference to this container in the task element
            taskElement._subtasksContainer = subtasksContainer;
        }
    } else {
        // Add to expanded tasks set
        window.expandedTasks.add(taskId);

        // Create the subtasks container and load the subtasks
        subtasksContainer = loadGrocerySubtasks(taskId, taskElement);

        // Store a reference to this container in the task element
        if (subtasksContainer) {
            taskElement._subtasksContainer = subtasksContainer;
        }
    }

    // Prevent any other click handlers from running
    if (typeof window._lastGroceryToggleTime === 'undefined') {
        window._lastGroceryToggleTime = {};
    }

    // Debounce multiple clicks
    window._lastGroceryToggleTime[taskId] = Date.now();

    // Return false to prevent further handling
    return false;
}

/**
 * Load grocery subtasks
 * @param {string|number} taskId - The task ID
 * @param {HTMLElement} taskElement - The task element
 * @returns {HTMLElement|null} The subtasks container element or null if not created
 */
function loadGrocerySubtasks(taskId, taskElement) {
    // Convert taskId to number if it's a string
    taskId = parseInt(taskId);

    // Verify this is a grocery list task
    const isGroceryList = taskElement.getAttribute('data-grocery-list') === 'true' ||
                         (taskElement.querySelector('.task-title')?.textContent.includes('Grocery List'));

    if (!isGroceryList) {
        if (typeof window.loadSubtasks === 'function') {
            return window.loadSubtasks(taskId, taskElement);
        }
        return null;
    }

    // Ensure the task has the grocery list attribute
    if (!taskElement.hasAttribute('data-grocery-list')) {
        taskElement.setAttribute('data-grocery-list', 'true');
    }

    // Keep track of expanded tasks
    if (!window.expandedTasks) {
        window.expandedTasks = new Set();
    }

    // Add to expanded tasks set
    window.expandedTasks.add(taskId);

    // Check if subtasks container already exists
    let subtasksContainer = document.querySelector(`.subtasks-container[data-parent-id="${taskId}"]`);

    // If it exists, just make sure it's expanded
    if (subtasksContainer) {
        // Make sure it has the grocery list attribute
        if (!subtasksContainer.hasAttribute('data-grocery-list')) {
            subtasksContainer.setAttribute('data-grocery-list', 'true');
        }

        // Add the expanded class
        subtasksContainer.classList.add('expanded');

        // Update the expand button icon
        const expandButtonIcon = taskElement.querySelector('.expand-subtasks-btn i');
        if (expandButtonIcon) {
            expandButtonIcon.className = 'fas fa-chevron-up';
        }

        // Add the expanded class to the task
        taskElement.classList.add('expanded');

        // Force the container to be visible with inline styles
        subtasksContainer.style.display = 'block';
        subtasksContainer.style.height = 'auto';
        subtasksContainer.style.opacity = '1';
        subtasksContainer.style.overflow = 'visible';

        // Store a reference to this container in the task element
        taskElement._subtasksContainer = subtasksContainer;

        return subtasksContainer;
    }

    // Create subtasks container
    subtasksContainer = document.createElement('div');
    subtasksContainer.className = 'subtasks-container'; // Don't add expanded class yet
    subtasksContainer.setAttribute('data-parent-id', taskId);
    subtasksContainer.setAttribute('data-grocery-list', 'true');

    // Set initial styles for animation
    subtasksContainer.style.display = 'block';
    subtasksContainer.style.height = '0';
    subtasksContainer.style.opacity = '0';
    subtasksContainer.style.overflow = 'hidden';
    // Let the CSS handle the transition

    // Add loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'subtask-loading';
    loadingDiv.textContent = 'Loading grocery items...';
    subtasksContainer.appendChild(loadingDiv);

    // Insert the container after the task
    taskElement.parentNode.insertBefore(subtasksContainer, taskElement.nextSibling);

    // Update the expand button icon
    const expandButtonIcon = taskElement.querySelector('.expand-subtasks-btn i');
    if (expandButtonIcon) {
        expandButtonIcon.className = 'fas fa-chevron-up';
    } else {
        // If no expand button icon is found, try to create one
        const expandButton = taskElement.querySelector('.expand-subtasks-btn');
        if (expandButton) {
            expandButton.innerHTML = '<i class="fas fa-chevron-up"></i>';
        }
    }

    // Add the expanded class to the task
    taskElement.classList.add('expanded');

    // Force a reflow to ensure the browser registers the starting state
    void subtasksContainer.offsetHeight;

    // Add the expanded class
    subtasksContainer.classList.add('expanded');

    // Get the target height before transitioning
    const targetHeight = subtasksContainer.scrollHeight;

    // Start the transition with requestAnimationFrame for smoother animation
    requestAnimationFrame(() => {
        // Transition to the target height
        subtasksContainer.style.height = targetHeight + 'px';
        subtasksContainer.style.opacity = '1';

        // After the transition completes, set to auto height
        setTimeout(() => {
            if (window.expandedTasks.has(taskId)) {
                subtasksContainer.style.height = 'auto';
                subtasksContainer.style.overflow = 'visible';
            }
        }, 350); // Slightly longer than the transition to ensure it completes
    });

    // Store a reference to this container in the task element
    taskElement._subtasksContainer = subtasksContainer;

    // Get grocery data from the task
    const groceryData = getGroceryDataFromTask(taskElement);

    // Generate subtasks from grocery data
    if (groceryData && groceryData.ingredients && groceryData.ingredients.length > 0) {
        // Clear the loading indicator
        loadingDiv.remove();

        // Generate subtasks from grocery data
        const generatedSubtasks = generateGrocerySubtasks(groceryData, taskId);

        // Create a document fragment for better performance
        const fragment = document.createDocumentFragment();

        // Render each generated subtask with staggered animation
        generatedSubtasks.forEach((subtask, index) => {
            const subtaskElement = createGrocerySubtaskElement(subtask);

            // Add a slight delay for each subtask to create a staggered effect
            subtaskElement.style.animationDelay = `${index * 0.05}s`;

            fragment.appendChild(subtaskElement);
        });

        // Append all elements at once
        subtasksContainer.appendChild(fragment);
    } else {
        // Try to fetch subtasks from the database
        fetch(`/api/tasks/${taskId}/subtasks`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load subtasks: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(subtasks => {
                // Clear the loading indicator
                loadingDiv.remove();

                if (subtasks.length === 0) {
                    // No subtasks found, show a message
                    const noSubtasksDiv = document.createElement('div');
                    noSubtasksDiv.className = 'subtask-item no-subtasks';
                    noSubtasksDiv.textContent = 'No grocery items found for this list.';
                    subtasksContainer.appendChild(noSubtasksDiv);
                } else {
                    // Create a document fragment for better performance
                    const fragment = document.createDocumentFragment();

                    // Render each subtask with staggered animation
                    subtasks.forEach((subtask, index) => {
                        const subtaskElement = createGrocerySubtaskElement(subtask);

                        // Add a slight delay for each subtask to create a staggered effect
                        subtaskElement.style.animationDelay = `${index * 0.05}s`;

                        fragment.appendChild(subtaskElement);
                    });

                    // Append all elements at once
                    subtasksContainer.appendChild(fragment);
                }

                // Ensure the container is expanded
                subtasksContainer.classList.add('expanded');

                // Make sure it stays visible
                subtasksContainer.style.display = 'block';
                subtasksContainer.style.height = 'auto';
                subtasksContainer.style.opacity = '1';
                subtasksContainer.style.overflow = 'visible';
            })
            .catch(error => {
                // Show an error message
                loadingDiv.textContent = 'Error loading grocery items. Please try again.';
            });
    }

    return subtasksContainer;
}

/**
 * Get grocery data from a task element
 * @param {HTMLElement} taskElement - The task element
 * @returns {Object|null} The grocery data or null if not found
 */
function getGroceryDataFromTask(taskElement) {
    // Check if this is a grocery list task
    const title = taskElement.querySelector('.task-title')?.textContent;
    if (!title || !title.includes('Grocery List')) {
        return null;
    }

    // Try to extract grocery data from the task description
    const description = taskElement.querySelector('.task-description')?.textContent;
    if (!description) {
        // Even without a description, we'll return basic data since we know it's a grocery list
        return {
            title: title,
            calories: 0,
            protein: 0,
            ingredients: getDefaultGroceryItems()
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
        ingredients: getDefaultGroceryItems()
    };
}

/**
 * Get default grocery items for demonstration
 * @returns {Array} Array of default grocery items
 */
function getDefaultGroceryItems() {
    return [
        { name: 'Eggs Pasture Raised Vital Farms', amount: 200, packages: 1, price: 7.78 },
        { name: 'Fresh Bunch of Bananas', amount: 101, packages: 1, price: 1.34 },
        { name: 'Fresh Kiwi Fruit', amount: 138, packages: 3, price: 1.80 },
        { name: 'H‑E‑B Original Thick Cut Bacon', amount: 36, packages: 1, price: 4.99 },
        { name: 'Parmigiano Rggiano Galli', amount: 28.2, packages: 1, price: 10.28 }
    ];
}

/**
 * Generate grocery subtasks
 * @param {Object} groceryData - The grocery data
 * @param {string|number} parentTaskId - The parent task ID
 * @returns {Array} The generated subtasks
 */
function generateGrocerySubtasks(groceryData, parentTaskId) {
    return groceryData.ingredients.map((ingredient, index) => {
        // Create a unique temporary ID for the subtask
        const tempId = `temp_${parentTaskId}_${index}`;

        // Format the title to include amount, packages, and price
        const title = `${ingredient.name} - ${ingredient.amount}g - ${ingredient.packages} package${ingredient.packages > 1 ? 's' : ''} - $${ingredient.price.toFixed(2)}`;

        return {
            id: tempId,
            title: title,
            description: 'Grocery item for recipe',
            parent_task_id: parentTaskId,
            is_subtask: true,
            is_complete: false
        };
    });
}

/**
 * Create a grocery subtask element
 * @param {Object} subtask - The subtask data
 * @returns {HTMLElement} The subtask element
 */
function createGrocerySubtaskElement(subtask) {
    const div = document.createElement('div');
    div.className = `subtask-item ${subtask.is_complete ? 'complete' : ''} grocery-item subtask-fade-in`;
    div.setAttribute('data-task-id', subtask.id);
    div.setAttribute('data-parent-id', subtask.parent_task_id);

    // Create checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = subtask.is_complete;

    // Add event listener to the checkbox
    checkbox.addEventListener('change', function() {
        // Toggle the complete class
        div.classList.toggle('complete', this.checked);

        // Update the subtask completion status in the database
        updateSubtaskCompletionStatus(subtask.id, this.checked);

        // Check if all subtasks are complete to update parent task
        setTimeout(async () => {
            try {
                if (typeof window.checkAllSubtasksComplete === 'function' &&
                    typeof window.updateParentTaskStatus === 'function') {
                    const allComplete = await window.checkAllSubtasksComplete(subtask.parent_task_id);
                    await window.updateParentTaskStatus(subtask.parent_task_id, allComplete);
                }
            } catch (error) {
                console.error('[UNIFIED] Error checking subtasks completion:', error);
            }
        }, 100);
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

    // Add grocery info if available
    if (subtask.grocery_data) {
        try {
            const groceryData = typeof subtask.grocery_data === 'string'
                ? JSON.parse(subtask.grocery_data)
                : subtask.grocery_data;

            // Create grocery info element
            const groceryInfo = document.createElement('div');
            groceryInfo.className = 'grocery-info';

            // Create a document fragment for better performance
            const fragment = document.createDocumentFragment();

            // Add amount with improved styling
            if (groceryData.amount) {
                const amountSpan = document.createElement('span');
                amountSpan.className = 'grocery-amount';
                amountSpan.textContent = `${groceryData.amount.toFixed(1)}g`;
                // Add inline styles to ensure visibility
                amountSpan.style.color = '#ffffff';
                amountSpan.style.backgroundColor = 'rgba(76, 175, 80, 0.8)';
                amountSpan.style.fontWeight = '700';
                amountSpan.style.textShadow = '0 0 3px rgba(0, 0, 0, 0.9)';
                fragment.appendChild(amountSpan);
            }

            // Add package count with improved styling
            if (groceryData.packageCount) {
                const packageSpan = document.createElement('span');
                packageSpan.className = 'grocery-packages';
                packageSpan.textContent = `${groceryData.packageCount} pkg`;
                // Add inline styles to ensure visibility with better contrast
                packageSpan.style.color = '#ffffff';
                packageSpan.style.backgroundColor = 'rgba(33, 150, 243, 0.9)';
                packageSpan.style.fontWeight = '700';
                packageSpan.style.textShadow = '0 0 4px rgba(0, 0, 0, 1)';
                packageSpan.style.border = '1px solid rgba(255, 255, 255, 0.5)';
                packageSpan.style.boxShadow = '0 0 5px rgba(33, 150, 243, 0.9)';
                fragment.appendChild(packageSpan);
            }

            // Add price with improved styling
            if (groceryData.totalPrice) {
                const priceSpan = document.createElement('span');
                priceSpan.className = 'grocery-price';
                priceSpan.textContent = `$${groceryData.totalPrice.toFixed(2)}`;
                // Add inline styles to ensure visibility
                priceSpan.style.color = '#ffffff';
                priceSpan.style.backgroundColor = 'rgba(255, 152, 0, 0.8)';
                priceSpan.style.fontWeight = '700';
                priceSpan.style.textShadow = '0 0 3px rgba(0, 0, 0, 0.9)';
                fragment.appendChild(priceSpan);
            }

            // Append all elements at once
            groceryInfo.appendChild(fragment);

            // Add grocery info to a new row for better visibility
            const infoRow = document.createElement('div');
            infoRow.className = 'grocery-info-row';
            // Add inline styles to ensure visibility
            infoRow.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
            infoRow.style.borderRadius = '4px';
            infoRow.style.padding = '4px 0';
            infoRow.style.marginTop = '8px';
            infoRow.appendChild(groceryInfo);
            contentDiv.appendChild(infoRow);
        } catch (error) {
            console.error('[UNIFIED] Error parsing grocery data:', error);
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
 * Update subtask completion status
 * @param {string|number} subtaskId - The subtask ID
 * @param {boolean} isComplete - Whether the subtask is complete
 */
function updateSubtaskCompletionStatus(subtaskId, isComplete) {
    // Check if this is a temporary ID
    if (subtaskId.toString().startsWith('temp_')) {
        return;
    }

    // Update the subtask in the database
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
            throw new Error(`Failed to update subtask: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .catch(error => {
        console.error(`[UNIFIED] Error updating subtask ${subtaskId}:`, error);
    });
}

// Make functions available globally
window.loadGroceryListSubtasks = loadGrocerySubtasks;
window.toggleGrocerySubtasks = toggleGrocerySubtasks;
window.getGroceryDataFromTask = getGroceryDataFromTask;
window.generateGrocerySubtasks = generateGrocerySubtasks;
window.createGrocerySubtaskElement = createGrocerySubtaskElement;
