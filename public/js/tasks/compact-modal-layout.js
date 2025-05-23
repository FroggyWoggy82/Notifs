/**
 * Compact Modal Layout
 * Ensures the Add Subtask button is positioned correctly
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log("Compact modal layout script loaded");

    // Flag to prevent infinite loops
    let isProcessing = false;

    // Function to ensure the Add Subtask button is positioned correctly
    function fixSubtasksHeader() {
        // Prevent recursive calls
        if (isProcessing) return;
        isProcessing = true;

        try {
            // Fix for Add Task modal
            const addTaskSubtasksHeader = document.querySelector('#addTaskModal .subtasks-header');
            if (addTaskSubtasksHeader) {
                const button = document.getElementById('addSubtaskBtn');
                if (button) {
                    // Only modify if not already fixed
                    if (!addTaskSubtasksHeader.dataset.fixed) {
                        // Create a new label
                        const labelSpan = document.createElement('span');
                        labelSpan.className = 'form-label';
                        labelSpan.textContent = 'Subtasks:';

                        // Clear and rebuild
                        addTaskSubtasksHeader.innerHTML = '';
                        addTaskSubtasksHeader.appendChild(labelSpan);
                        addTaskSubtasksHeader.appendChild(document.createTextNode(' '));
                        addTaskSubtasksHeader.appendChild(button);

                        // Mark as fixed
                        addTaskSubtasksHeader.dataset.fixed = 'true';
                    }
                }
            }

            // Fix for Edit Task modal
            const editTaskSubtasksHeader = document.querySelector('#editTaskModal .subtasks-header');
            if (editTaskSubtasksHeader) {
                const button = document.getElementById('editAddSubtaskBtn');
                if (button) {
                    // Only modify if not already fixed
                    if (!editTaskSubtasksHeader.dataset.fixed) {
                        // Create a new label
                        const labelSpan = document.createElement('span');
                        labelSpan.className = 'form-label';
                        labelSpan.textContent = 'Subtasks:';

                        // Clear and rebuild
                        editTaskSubtasksHeader.innerHTML = '';
                        editTaskSubtasksHeader.appendChild(labelSpan);
                        editTaskSubtasksHeader.appendChild(document.createTextNode(' '));
                        editTaskSubtasksHeader.appendChild(button);

                        // Mark as fixed
                        editTaskSubtasksHeader.dataset.fixed = 'true';
                    }
                }
            }
        } catch (error) {
            console.error('Error in fixSubtasksHeader:', error);
        } finally {
            isProcessing = false;
        }
    }

    // Run when the add task modal is opened
    const addTaskFab = document.getElementById('addTaskFab');
    if (addTaskFab) {
        addTaskFab.addEventListener('click', function() {
            // Use setTimeout to ensure the modal is fully rendered
            setTimeout(fixSubtasksHeader, 300);
        });
    }

    // Run when the edit task modal is opened
    document.addEventListener('click', function(event) {
        if (event.target.closest('.edit-task-btn')) {
            // Use setTimeout to ensure the modal is fully rendered
            setTimeout(fixSubtasksHeader, 300);
        }
    });

    // Run once on page load with a delay
    setTimeout(fixSubtasksHeader, 500);

    // Use a safer approach than MutationObserver
    // Check periodically but not too frequently
    const checkInterval = setInterval(function() {
        const addTaskModal = document.getElementById('addTaskModal');
        const editTaskModal = document.getElementById('editTaskModal');

        if ((addTaskModal && window.getComputedStyle(addTaskModal).display !== 'none') ||
            (editTaskModal && window.getComputedStyle(editTaskModal).display !== 'none')) {
            fixSubtasksHeader();
        }
    }, 1000); // Check once per second

    // Clean up interval when page unloads
    window.addEventListener('beforeunload', function() {
        clearInterval(checkInterval);
    });
});
