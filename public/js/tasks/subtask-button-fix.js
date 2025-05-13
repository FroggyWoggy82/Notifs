/**
 * Subtask Button Fix
 * Fixes the issue with the "Add Subtask" button not working in the task modals
 */

(function() {
    console.log('[Subtask Button Fix] Initializing...');

    // Function to fix the Add Subtask button in the Add Task modal
    function fixAddSubtaskButton() {
        const addSubtaskBtn = document.getElementById('addSubtaskBtn');
        const subtasksList = document.getElementById('subtasksList');
        
        if (!addSubtaskBtn || !subtasksList) {
            console.log('[Subtask Button Fix] Add Task modal elements not found, will try again later');
            return;
        }

        console.log('[Subtask Button Fix] Found Add Subtask button in Add Task modal, adding event listener');
        
        // Remove any existing event listeners by cloning the button
        const newAddSubtaskBtn = addSubtaskBtn.cloneNode(true);
        addSubtaskBtn.parentNode.replaceChild(newAddSubtaskBtn, addSubtaskBtn);
        
        // Add a new event listener
        newAddSubtaskBtn.addEventListener('click', function() {
            console.log('[Subtask Button Fix] Add Subtask button clicked in Add Task modal');
            addSubtaskField(subtasksList);
        });
    }

    // Function to fix the Edit Add Subtask button in the Edit Task modal
    function fixEditAddSubtaskButton() {
        const editAddSubtaskBtn = document.getElementById('editAddSubtaskBtn');
        const editSubtasksList = document.getElementById('editSubtasksList');
        
        if (!editAddSubtaskBtn || !editSubtasksList) {
            console.log('[Subtask Button Fix] Edit Task modal elements not found, will try again later');
            return;
        }

        console.log('[Subtask Button Fix] Found Add Subtask button in Edit Task modal, adding event listener');
        
        // Remove any existing event listeners by cloning the button
        const newEditAddSubtaskBtn = editAddSubtaskBtn.cloneNode(true);
        editAddSubtaskBtn.parentNode.replaceChild(newEditAddSubtaskBtn, editAddSubtaskBtn);
        
        // Add a new event listener
        newEditAddSubtaskBtn.addEventListener('click', function() {
            console.log('[Subtask Button Fix] Add Subtask button clicked in Edit Task modal');
            addSubtaskField(editSubtasksList);
        });
    }

    // Function to add a subtask field to the specified container
    function addSubtaskField(container) {
        console.log('[Subtask Button Fix] Adding subtask field to container:', container);
        
        // Remove the "No subtasks" message if it exists
        const noSubtasksMessage = container.querySelector('.no-subtasks-message');
        if (noSubtasksMessage) {
            noSubtasksMessage.remove();
        }

        // Create a new subtask item
        const subtaskItem = document.createElement('div');
        subtaskItem.className = 'subtask-form-item';

        // Create the input field
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Subtask title';
        input.addEventListener('input', function(event) {
            // Store the value in the subtask object
            subtaskItem.dataset.title = event.target.value;
        });

        // Create the actions div
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'subtask-actions';

        // Create the remove button
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'remove-subtask-btn';
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.title = 'Remove subtask';
        removeBtn.addEventListener('click', function() {
            subtaskItem.remove();
            
            // If there are no more subtasks, add the "No subtasks" message back
            if (container.querySelectorAll('.subtask-form-item').length === 0) {
                const message = document.createElement('p');
                message.className = 'no-subtasks-message';
                message.textContent = 'No subtasks added yet.';
                container.appendChild(message);
            }
        });

        // Assemble the subtask item
        actionsDiv.appendChild(removeBtn);
        subtaskItem.appendChild(input);
        subtaskItem.appendChild(actionsDiv);
        
        // Add the subtask item to the container
        container.appendChild(subtaskItem);
        
        // Focus the new input
        input.focus();
    }

    // Function to check if the modals are loaded and fix the buttons
    function checkForModals() {
        // Check for Add Task modal
        const addTaskModal = document.getElementById('addTaskModal');
        if (addTaskModal) {
            fixAddSubtaskButton();
        }
        
        // Check for Edit Task modal
        const editTaskModal = document.getElementById('editTaskModal');
        if (editTaskModal) {
            fixEditAddSubtaskButton();
        }
        
        // If either modal is not found, try again later
        if (!addTaskModal || !editTaskModal) {
            console.log('[Subtask Button Fix] One or more modals not found, will try again in 500ms');
            setTimeout(checkForModals, 500);
        }
    }

    // Initialize when the DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('[Subtask Button Fix] DOM content loaded, checking for modals...');
            checkForModals();
        });
    } else {
        console.log('[Subtask Button Fix] DOM already loaded, checking for modals...');
        checkForModals();
    }

    // Also set up mutation observers to watch for the modals being added to the DOM
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                for (let i = 0; i < mutation.addedNodes.length; i++) {
                    const node = mutation.addedNodes[i];
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if this is one of our modals or contains one of our modals
                        if (node.id === 'addTaskModal' || node.id === 'editTaskModal' ||
                            node.querySelector('#addTaskModal') || node.querySelector('#editTaskModal')) {
                            console.log('[Subtask Button Fix] Modal added to DOM, fixing buttons');
                            checkForModals();
                        }
                    }
                }
            }
        });
    });

    // Start observing the document body
    observer.observe(document.body, { childList: true, subtree: true });

    console.log('[Subtask Button Fix] Initialized');
})();
